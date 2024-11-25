import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";
import { google } from "googleapis";
import { z } from "zod";
import T from "~/utils/translate";

// Input validation schema
const ContractSchema = z.object({
  patientName: z.string().min(2, "Patient name is required"),
  patientCPF: z.string().regex(/^\d{11}$/, "Invalid CPF format"),
  legalRepName: z.string().optional(),
  legalRepCPF: z
    .string()
    .regex(/^\d{11}$/, "Invalid CPF format")
    .optional(),
  address: z.string().min(5, "Address is required"),
  services: z.string().min(10, "Service description is required"),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  signature: z.string().min(3, "Signature details are required"),
});

// Loader to check admin authentication
export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return json({
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  });
}

// Action to create Google Docs contract
export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);

  try {
    // Validate input
    const validatedData = ContractSchema.parse(rawData);

    // Authenticate with Google
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set refresh token from environment
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    // Verify authorization by checking token
    const credentials = await oauth2Client.getAccessToken();

    // If we get here, we're authorized
    console.log("Google API Authorization successful", {
      accessToken: credentials.token ? "Token exists" : "No token",
      credentials: Object.keys(credentials),
    });
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const fileListResponse = await drive.files.list({
      pageSize: 1,
      fields: "files(id, name)",
    });

    console.log("Drive API Access Test:", {
      filesFound: fileListResponse.data.files?.length || 0,
    });

    // (2) Actual creation operations begins here

    const docs = google.docs({ version: "v1", auth: oauth2Client });

    // Replace template with actual document ID
    const templateDocId = "1_IhMy15Eanyi4lNXyvSNAwD5TUV_s-rd";

    // Copy the template
    const copyResponse = await drive.files.copy({
      fileId: templateDocId,
      supportsAllDrives: true,
      requestBody: {
        name: `Contract for ${
          validatedData.patientName
        } - ${new Date().toLocaleDateString()}`,
        mimeType: "application/vnd.google-apps.document",
      },
    });

    const newDocId = copyResponse.data.id;
    console.log("New document created with ID:", newDocId);
    // Replace placeholders in the document
    await docs.documents.batchUpdate({
      documentId: newDocId,
      requestBody: {
        requests: [
          {
            replaceAllText: {
              containsText: { text: "{{PATIENT_NAME}}" },
              replaceText: validatedData.patientName,
            },
          },
          {
            replaceAllText: {
              containsText: { text: "{{PATIENT_CPF}}" },
              replaceText: validatedData.patientCPF,
            },
          },
          {
            replaceAllText: {
              containsText: { text: "{{LEGAL_REP_NAME}}" },
              replaceText: validatedData.legalRepName || "",
            },
          },
          {
            replaceAllText: {
              containsText: { text: "{{LEGAL_REP_CPF}}" },
              replaceText: validatedData.legalRepCPF || "",
            },
          },
          {
            replaceAllText: {
              containsText: { text: "{{ADDRESS}}" },
              replaceText: validatedData.address,
            },
          },
          {
            replaceAllText: {
              containsText: { text: "{{SERVICES}}" },
              replaceText: validatedData.services,
            },
          },
          {
            replaceAllText: {
              containsText: { text: "{{START_DATE}}" },
              replaceText: validatedData.startDate,
            },
          },
          {
            replaceAllText: {
              containsText: { text: "{{PRICE}}" },
              replaceText: validatedData.price,
            },
          },
          {
            replaceAllText: {
              containsText: { text: "{{SIGNATURE}}" },
              replaceText: validatedData.signature,
            },
          },
        ],
      },
    });

    return json({
      success: true,
      documentUrl: `https://docs.google.com/document/d/${newDocId}/edit`,
    });
  } catch (error) {
    console.error("Contract creation error:", error);

    if (error instanceof z.ZodError) {
      return json(
        {
          success: false,
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    return json(
      {
        success: false,
        error: "Failed to create contract",
      },
      { status: 500 }
    );
  }
}

export default function AdminContractRoute() {
  const { googleClientId, googleRedirectUri } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{T("admin.contract.title")}</h1>

      {actionData?.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          Contract created successfully!
          <a
            href={actionData.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 underline"
          >
            Open Document
          </a>
        </div>
      )}

      {actionData?.errors && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {Object.entries(actionData.errors).map(([field, messages]) => (
            <p key={field}>{messages?.join(", ")}</p>
          ))}
        </div>
      )}

      <Form method="post" className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="patientName"
              className="block text-sm font-medium text-gray-700"
            >
              {T("admin.contract.patient_name")}
            </label>
            <input
              type="text"
              name="patientName"
              id="patientName"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="patientCPF"
              className="block text-sm font-medium text-gray-700"
            >
              {T("admin.contract.patient_cpf")}
            </label>
            <input
              type="text"
              name="patientCPF"
              id="patientCPF"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="legalRepName"
              className="block text-sm font-medium text-gray-700"
            >
              {T("admin.contract.legal_rep_name")}
            </label>
            <input
              type="text"
              name="legalRepName"
              id="legalRepName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="legalRepCPF"
              className="block text-sm font-medium text-gray-700"
            >
              {T("admin.contract.legal_rep_cpf")}
            </label>
            <input
              type="text"
              name="legalRepCPF"
              id="legalRepCPF"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            {T("admin.contract.address")}
          </label>
          <input
            type="text"
            name="address"
            id="address"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="services"
            className="block text-sm font-medium text-gray-700"
          >
            {T("admin.contract.services")}
          </label>
          <textarea
            name="services"
            id="services"
            rows={4}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              {T("admin.contract.start_date")}
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              {T("admin.contract.price")}
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">R$</span>
              </div>
              <input
                type="number"
                name="price"
                id="price"
                step="0.01"
                required
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="signature"
            className="block text-sm font-medium text-gray-700"
          >
            {T("admin.contract.signature")}
          </label>
          <input
            type="text"
            name="signature"
            id="signature"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {T("admin.contract.create_contract")}
          </button>
        </div>
      </Form>
    </div>
  );
}
