import { google } from "googleapis";
import { Readable } from "stream";
const drive = google.drive("v3");

export default async function convertGoogleSheetToPDF(
  sourceFolderId: string,
  destinationFolderId: string,
  CLIENT_ID: string,
  CLIENT_SECRET: string,
  REFRESH_TOKEN: string,
) {
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  async function listFiles(auth) {
    const res = await drive.files.list({
      auth,
      q: `'${sourceFolderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet'`,
      fields: "files(id, name)",
    });
    return res.data.files;
  }

  async function downloadAsPDF(auth, fileId): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      drive.files.export(
        {
          auth,
          fileId,
          mimeType: "application/pdf",
        },
        { responseType: "stream" },
        (err, res) => {
          if (err) {
            console.error("Error exporting file:", err);
            reject(err);
            return;
          }

          const chunks: Buffer[] = [];
          res.data
            .on("data", (chunk) => chunks.push(Buffer.from(chunk)))
            .on("end", () => {
              console.log("Done downloading file.");
              resolve(Buffer.concat(chunks));
            })
            .on("error", (err) => {
              console.error("Error downloading file:", err);
              reject(err);
            });
        }
      );
    });
  }

  async function uploadFile(auth, fileName: string, fileBuffer: Buffer, folderId: string) {
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    // Create a readable stream from the buffer
    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null);

    const media = {
      mimeType: "application/pdf",
      body: readable
    };

    const res = await drive.files.create({
      auth,
      resource: fileMetadata,
      media: media,
      fields: "id",
    });
    console.log(`File uploaded successfully. File ID: ${res.data.id}`);
    return res.data.id;
  }

  async function processSheets() {
    const files = await listFiles(oAuth2Client);
    for (const file of files) {
      console.log(`Processing ${file.name}...`);
      const startMemory = process.memoryUsage();
      const pdfBuffer = await downloadAsPDF(oAuth2Client, file.id);
      console.log(`Downloaded ${file.name}.pdf - Size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Memory usage after download: ${JSON.stringify({
        heapUsed: `${((process.memoryUsage().heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB`,
        rss: `${((process.memoryUsage().rss - startMemory.rss) / 1024 / 1024).toFixed(2)}MB`
      })}`);
      
      console.log(`Uploading ${file.name}.pdf to destination folder...`);
      await uploadFile(
        oAuth2Client,
        `${file.name}.pdf`,
        pdfBuffer,
        destinationFolderId
      );
    }
  }

  await processSheets();
}
