import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { google } = require("googleapis");
const drive = google.drive("v3");

export default async function convertGoogleSheetToPDF(
  sourceFolderId,
  destinationFolderId,
  CLIENT_ID,
  CLIENT_SECRET,
  REFRESH_TOKEN,
) {
  // ES module workaround for __dirname
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  async function listFiles(auth, folderId) {
    const res = await drive.files.list({
      auth,
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet'`,
      fields: "files(id, name)",
    });
    return res.data.files;
  }

  async function downloadAsPDF(auth, fileId, outputPath) {
    return new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(outputPath);
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
          res.data
            .on("end", () => {
              console.log("Done downloading file.");
              dest.close(); // Close the stream to ensure the file is fully written
              resolve();
            })
            .on("error", (err) => {
              console.error("Error downloading file:", err);
              reject(err);
            })
            .pipe(dest);
        },
      );
    });
  }

  async function uploadFile(auth, fileName, filePath, folderId) {
    const fileMetadata = {
      name: fileName,
      parents: [folderId], // Specify the destination folder ID
    };
    const media = {
      mimeType: "application/pdf",
      body: fs.createReadStream(filePath),
    };
    const res = await drive.files.create({
      auth,
      resource: fileMetadata,
      media: media,
      fields: "id",
    });
    console.log(`File uploaded successfully. File ID: ${res.data.id}`);
  }

  async function downloadAndUploadSheetsAsPDFs() {
    const files = await listFiles(oAuth2Client, sourceFolderId);
    for (const file of files) {
      const outputPath = path.join(__dirname, `${file.name}.pdf`);
      console.log(`Downloading ${file.name} as PDF...`);
      await downloadAsPDF(oAuth2Client, file.id, outputPath);
      console.log(`Uploading ${file.name}.pdf to destination folder...`);
      await uploadFile(
        oAuth2Client,
        `${file.name}.pdf`,
        outputPath,
        destinationFolderId,
      );
      fs.unlinkSync(outputPath);
    }
  }

  downloadAndUploadSheetsAsPDFs().catch(console.error);
}
