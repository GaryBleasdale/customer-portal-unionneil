import {
  json,
  type ActionFunctionArgs,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma.server";
import { uploadFileToGridFS } from "~/utils/gridfs.server";
import { getBaseUrl } from "~/utils/url.server";
import T from "~/utils/translate";

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);
  if (user.role !== "ADMIN") {
    throw new Response("Unauthorized", { status: 403 });
  }

  try {
    const formData = await unstable_parseMultipartFormData(
      request,
      async ({ data, filename, contentType }) => {
        if (!filename) throw new Error("No file uploaded");
        // Convert stream to buffer
        const chunks = [];
        for await (const chunk of data) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Upload to GridFS
        const fileId = await uploadFileToGridFS(buffer, filename);

        return fileId;
      }
    );

    const fileId = formData.get("contract") as string;
    if (!fileId) {
      return json({ error: "No file uploaded" }, { status: 400 });
    }

    // Create the file URL - use the configured base URL
    const fileUrl = `${getBaseUrl(request.url)}/api/contracts/${fileId}`;

    // Update the customer's contractUrl in the database
    await prisma.user.update({
      where: { id: params.customerId },
      data: { contractUrl: fileUrl },
    });

    return json({
      success: true,
      fileUrl: fileUrl,
    });
  } catch (error) {
    console.error("Error uploading contract:", error);
    return json({ error: "Failed to upload contract" }, { status: 500 });
  }
}

export default function UploadContract() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h2 className="text-2xl font-bold mb-4">
          {T("admin.contract.upload_title")}
        </h2>
        <Form method="post" encType="multipart/form-data">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {T("admin.contract.select_file")}
              </label>
              <input
                type="file"
                name="contract"
                accept=".pdf,.doc,.docx"
                className="mt-1 block w-full"
                required
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {T("admin.contract.upload_button")}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {T("admin.contract.cancel")}
              </button>
            </div>
          </div>
          {actionData?.error && (
            <div className="mt-4 text-red-600">{actionData.error}</div>
          )}
          {actionData?.success && (
            <div className="mt-4 space-y-2">
              <div className="text-green-600">
                {T("admin.contract.upload_success")}
              </div>
              <div>
                <a
                  href={actionData.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {T("admin.contract.view_uploaded_contract")}
                </a>
              </div>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
