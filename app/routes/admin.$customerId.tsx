import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useLocation, Outlet } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const customer = await prisma.user.findUnique({
    where: { id: params.customerId },
  });

  if (!customer) {
    throw new Response("Customer not found", { status: 404 });
  }

  return json({ customer });
}

export default function CustomerDetails() {
  const { customer } = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <div className="container mx-auto px-4 py-8">
      {location.pathname.includes("createContract") ? (
        <Outlet />
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-8">Key Documents</h1>
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <h2 className="text-xl font-semibold mb-4">Contract</h2>
            {customer.contractUrl ? (
              <div>
                <a
                  href={`https://${customer.contractUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View Contract
                </a>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                  Create Addendum
                </button>
              </div>
            ) : (
              <a
                href={`${location.pathname}/createContract`} // Replace this with your fallback URL
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Create Contract
              </a>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-8">Customer Details</h1>

          {/* Patient Information */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Full Name
                </label>
                <p className="mt-1">{customer.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="mt-1">{customer.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  CPF
                </label>
                <p className="mt-1">{customer.cpf || "Not provided"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Nationality
                </label>
                <p className="mt-1">{customer.nationality || "Not provided"}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">
                  Address
                </label>
                <p className="mt-1">{customer.address || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Legal Representative Information */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <h2 className="text-xl font-semibold mb-4">
              Legal Representative Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Full Name
                </label>
                <p className="mt-1">
                  {customer.legalRepName || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  CPF
                </label>
                <p className="mt-1">{customer.legalRepCpf || "Not provided"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Nationality
                </label>
                <p className="mt-1">
                  {customer.legalRepNationality || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Relationship to Patient
                </label>
                <p className="mt-1">
                  {customer.legalRepRelationship || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="mt-1">
                  {customer.legalRepEmail || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Information */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <h2 className="text-xl font-semibold mb-4">Invoice Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Name for Invoice
                </label>
                <p className="mt-1">
                  {customer.invoiceName || "Same as legal representative"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  CPF/CNPJ
                </label>
                <p className="mt-1">
                  {customer.invoiceCpfCnpj || "Same as legal representative"}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">
                  Address
                </label>
                <p className="mt-1">
                  {customer.invoiceAddress || "Same as legal representative"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="mt-1">
                  {customer.invoiceEmail || "Same as legal representative"}
                </p>
              </div>
            </div>
          </div>

          {/* Billing Emails */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <h2 className="text-xl font-semibold mb-4">
              Monthly Invoice Recipients
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Email Addresses
              </label>
              {customer.billingEmails && customer.billingEmails.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {customer.billingEmails.map((email, index) => (
                    <li key={index} className="text-gray-700">
                      {email}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-gray-700">
                  No billing emails specified
                </p>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Member Since
                </label>
                <p className="mt-1">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Last Login
                </label>
                <p className="mt-1">
                  {customer.lastLoginAt
                    ? new Date(customer.lastLoginAt).toLocaleString()
                    : "Never logged in"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
