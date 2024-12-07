import { Readable } from "node:stream";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { google } = require("googleapis");

export default async function sendPDFsToGoogleDrive(
  pdfs: { buffer: Buffer; filename: string }[],
  folderId: string,
  CLIENT_ID: string,
  CLIENT_SECRET: string,
  REFRESH_TOKEN: string,
) {
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  const drive = google.drive({ version: "v3", auth: oAuth2Client });

  async function uploadBuffer(buffer: Buffer, fileName: string) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
      };

      const media = {
        mimeType: "application/pdf",
        body: Readable.from(buffer),
      };

      const res = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id",
      });
      console.log(`File uploaded successfully. File ID: ${res.data.id}`);
      return res.data.id;
    } catch (error) {
      console.error(`Error uploading file ${fileName}:`, error);
      throw error;
    }
  }

  const uploadResults = [];
  for (const { buffer, filename } of pdfs) {
    try {
      const fileId = await uploadBuffer(buffer, filename);
      uploadResults.push({ filename, fileId, success: true });
    } catch (error) {
      uploadResults.push({ filename, error, success: false });
    }
  }

  return uploadResults;
}
