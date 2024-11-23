import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { Form, useActionData, Outlet } from "@remix-run/react";
import { prisma } from "~/utils/prisma.server";
import { hashPassword } from "~/utils/auth.server";
import T from "~/utils/translate";
import { sendNewCustomerAlert } from "~/utils/email.server";

type ActionError = {
  email?: string;
  password?: string;
  general?: string;
  fields?: { [key: string]: string };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Cadastro | Portal Union Neil" },
    { name: "description", content: "Cadastro de Clientes da Union Neil" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const errors: ActionError = {};

  // Basic user information
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  // Patient information
  const cpf = formData.get("cpf") as string;
  const address = formData.get("address") as string;
  const nationality = formData.get("nationality") as string;

  // Legal representative information
  const legalRepName = formData.get("legalRepName") as string;
  const legalRepCpf = formData.get("legalRepCpf") as string;
  const legalRepNationality = formData.get("legalRepNationality") as string;
  const legalRepRelationship = formData.get("legalRepRelationship") as string;
  const legalRepEmail = formData.get("legalRepEmail") as string;

  // Invoice information
  const invoiceName = formData.get("invoiceName") as string;
  const invoiceCpfCnpj = formData.get("invoiceCpfCnpj") as string;
  const invoiceAddress = formData.get("invoiceAddress") as string;
  const invoiceEmail = formData.get("invoiceEmail") as string;

  // Billing emails (comma-separated)
  const billingEmailsStr = formData.get("billingEmails") as string;
  const billingEmails = billingEmailsStr
    ? billingEmailsStr
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean)
    : [];

  // Validate required fields
  if (!email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid email format";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    errors.email = "A user with this email already exists";
  }

  // If there are any errors, return them
  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  const hashedPassword = await hashPassword(password);

  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || undefined,
        role: "CUSTOMER",
        // Patient information
        cpf: cpf || undefined,
        address: address || undefined,
        nationality: nationality || undefined,
        // Legal representative information
        legalRepName: legalRepName || undefined,
        legalRepCpf: legalRepCpf || undefined,
        legalRepNationality: legalRepNationality || undefined,
        legalRepRelationship: legalRepRelationship || undefined,
        legalRepEmail: legalRepEmail || undefined,
        // Invoice information
        invoiceName: invoiceName || undefined,
        invoiceCpfCnpj: invoiceCpfCnpj || undefined,
        invoiceAddress: invoiceAddress || undefined,
        invoiceEmail: invoiceEmail || undefined,
        // Billing information
        billingEmails,
      },
    });
    sendNewCustomerAlert(name, email);
    return redirect("/login");
  } catch (error) {
    console.error("Registration error:", error);
    return json(
      {
        errors: { general: "Failed to create user account. Please try again." },
      },
      { status: 500 }
    );
  }
}

export default function Cadastro() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {T("cadastro.create-account")}
          </h2>
        </div>

        {actionData?.errors?.general && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {T(`errors.${actionData.errors.general}`)}
                </h3>
              </div>
            </div>
          </div>
        )}

        <Form method="post" className="mt-8 space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">
              {T("cadastro.patient-info")}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.full-name")}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.email-address")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    actionData?.errors?.email
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                />
                {actionData?.errors?.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {T(`errors.${actionData.errors.email}`)}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.password")}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    actionData?.errors?.password
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                />
                {actionData?.errors?.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {T(`errors.${actionData.errors.password}`)}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="cpf"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.cpf")}
                </label>
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.complete-address")}
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="nationality"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.nationality")}
                </label>
                <input
                  id="nationality"
                  name="nationality"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Legal Representative Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">
              {T("cadastro.legal-rep-info")}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="legalRepName"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.legal-rep-name")}
                </label>
                <input
                  id="legalRepName"
                  name="legalRepName"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="legalRepCpf"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.legal-rep-cpf")}
                </label>
                <input
                  id="legalRepCpf"
                  name="legalRepCpf"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="legalRepNationality"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.legal-rep-nationality")}
                </label>
                <input
                  id="legalRepNationality"
                  name="legalRepNationality"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="legalRepRelationship"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.legal-rep-relationship")}
                </label>
                <input
                  id="legalRepRelationship"
                  name="legalRepRelationship"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="legalRepEmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.legal-rep-email")}
                </label>
                <input
                  id="legalRepEmail"
                  name="legalRepEmail"
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Invoice Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">
              {T("cadastro.invoice-info")}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="invoiceName"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.invoice-name")}
                </label>
                <input
                  id="invoiceName"
                  name="invoiceName"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="invoiceCpfCnpj"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.invoice-cpf-cnpj")}
                </label>
                <input
                  id="invoiceCpfCnpj"
                  name="invoiceCpfCnpj"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="invoiceAddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.invoice-address")}
                </label>
                <textarea
                  id="invoiceAddress"
                  name="invoiceAddress"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="invoiceEmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.invoice-email")}
                </label>
                <input
                  id="invoiceEmail"
                  name="invoiceEmail"
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="billingEmails"
                  className="block text-sm font-medium text-gray-700"
                >
                  {T("cadastro.billing-emails")}
                </label>
                <input
                  id="billingEmails"
                  name="billingEmails"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#CFB933] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {T("cadastro.submit")}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
