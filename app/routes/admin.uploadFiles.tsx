import { useState } from "react";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { ActionFunction, json } from "@remix-run/node";
import renameBoletos from "../utils/renameBoletos";
import sendPDFsToGoogleDrive from "../utils/sendPDFsToGoogleDrive";
import convertGoogleSheetToPDF from "../utils/convertGoogleSheetToPDF";

if (!process.env.GOOGLE_CLIENT_ID)
  throw new Error("GOOGLE_CLIENT_ID must be set");
if (!process.env.GOOGLE_CLIENT_SECRET)
  throw new Error("GOOGLE_CLIENT_SECRET must be set");
if (!process.env.GOOGLE_REFRESH_TOKEN)
  throw new Error("GOOGLE_REFRESH_TOKEN must be set");

const googleCredentials = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const files = formData.getAll("pdfFiles") as File[];
  const destinationFolderId = formData.get("destinationFolderId") as string;
  const sourceFolderId = formData.get("sourceFolderId") as string;

  if (files.length === 0) {
    return json({ error: "No files were uploaded." }, { status: 400 });
  }

  try {
    // Convert uploaded files to buffer format
    const pdfBuffers = await Promise.all(
      files.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        originalName: file.name,
      }))
    );

    // Process Google Sheet first
    await convertGoogleSheetToPDF(
      sourceFolderId,
      destinationFolderId,
      googleCredentials.clientId,
      googleCredentials.clientSecret,
      googleCredentials.refreshToken
    );

    // Process and rename PDFs in memory
    const processedPDFs = await renameBoletos(pdfBuffers);

    // Upload renamed PDFs to Google Drive
    const uploadResults = await sendPDFsToGoogleDrive(
      processedPDFs,
      destinationFolderId,
      googleCredentials.clientId,
      googleCredentials.clientSecret,
      googleCredentials.refreshToken
    );

    const successCount = uploadResults.filter((r) => r.success).length;
    const failureCount = uploadResults.filter((r) => !r.success).length;

    return json({
      success: true,
      message: `Successfully processed ${successCount} files${
        failureCount > 0 ? `, ${failureCount} files failed` : ""
      }`,
      results: uploadResults,
    });
  } catch (error) {
    console.error("Error processing files:", error);
    return json(
      {
        error: "An error occurred while processing the files.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

export default function UploadFiles() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [destinationFolderId, setDestinationFolderId] = useState("");
  const [sourceFolderId, setSourceFolderId] = useState("");
  const actionData = useActionData();
  const navigation = useNavigation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">
        Prepare Google Drive Folder for sending of boletos
      </h1>
      <Form method="post" encType="multipart/form-data">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <label htmlFor="boletoInitialPDFFiles">
            Add boletos with unreadable names here
          </label>
          <input
            id="boletoInitialPDFfiles"
            type="file"
            name="pdfFiles"
            accept=".pdf"
            multiple
            onChange={handleFileChange}
            className="mb-4"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="destinationFolderId" className="block mb-2">
            ID of Destination Folder for boletos and pdf faturas:
          </label>
          <input
            id="destinationFolderId"
            type="text"
            name="destinationFolderId"
            value={destinationFolderId}
            onChange={(e) => setDestinationFolderId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="sourceFolderId" className="block mb-2">
            ID of Source Folder for sheet-formatted faturas:
          </label>
          <input
            id="sourceFolderId"
            type="text"
            name="sourceFolderId"
            value={sourceFolderId}
            onChange={(e) => setSourceFolderId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button type="submit" disabled={navigation.state === "submitting"}>
          {navigation.state === "submitting" ? "Uploading..." : "Upload"}
        </button>
      </Form>
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg mb-2">Selected Files:</h2>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
      {actionData?.error && (
        <p className="text-red-500 mt-4">{actionData.error}</p>
      )}
      {actionData?.success && (
        <p className="text-green-500 mt-4">Files uploaded successfully!</p>
      )}
    </div>
  );
}
