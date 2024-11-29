import { LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/utils/auth.server";
import { getFileFromGridFS, getFileInfo } from "~/utils/gridfs.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Ensure user is authenticated
  await requireUser(request);

  try {
    const fileId = params.fileId;
    if (!fileId) {
      throw new Response("File ID is required", { status: 400 });
    }

    // Get file info from GridFS
    const fileInfo = await getFileInfo(fileId);
    if (!fileInfo) {
      throw new Response("File not found", { status: 404 });
    }

    // Get file from GridFS
    const fileBuffer = await getFileFromGridFS(fileId);

    // Create response with appropriate headers
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": fileInfo.contentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${fileInfo.filename}"`,
      },
    });
  } catch (error) {
    console.error("Error retrieving file:", error);
    throw new Response("File not found", { status: 404 });
  }
}
