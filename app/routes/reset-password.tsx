import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLocation, Outlet } from "@remix-run/react";
import { prisma } from "~/utils/prisma.server";
import { sendPasswordResetEmail } from "~/utils/email.server";
import T from "~/utils/translate";
import crypto from "node:crypto";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");

  if (!email || typeof email !== "string") {
    return json({ error: T("errors.email-required") }, { status: 400 });
  }

  if (!email.includes("@")) {
    return json({ error: T("errors.invalid-email") }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether a user exists
      return json({
        success: true,
        message: T("reset-password.email-sent"),
        details: T("reset-password.email-sent-message"),
      });
    }

    // Generate a random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    try {
      // Delete any existing token first
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          token,
          expiresAt,
          userId: user.id,
        },
      });

      // Generate reset link
      const resetLink = `${process.env.APP_URL}/reset-password/${token}`;

      // Send email
      const emailResult = await sendPasswordResetEmail(email, resetLink);
      if (!emailResult.success) {
        console.error("Email error:", emailResult.error);
        return json(
          { error: `Failed to send reset email: ${emailResult.error}` },
          { status: 500 }
        );
      }

      return json({
        success: true,
      });
    } catch (error) {
      console.error("Error in password reset:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      return json(
        { error: `An error occurred: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in password reset:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return json(
      { error: `An error occurred: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export default function ResetPassword() {
  const actionData = useActionData<typeof action>();
  const location = useLocation();
  const isIndex = location.pathname === "/reset-password";

  // If we're at the index route, show the request form
  if (isIndex) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {T("reset-password.title")}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {T("reset-password.subtitle")}
            </p>
          </div>

          {actionData?.success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    {T("reset-password.email-sent")}
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{T("reset-password.email-sent-message")}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Form method="post" className="mt-8 space-y-6">
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email" className="sr-only">
                    {T("login.email-address")}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder={T("login.email-address")}
                  />
                </div>
              </div>

              {actionData?.error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {actionData.error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#CFB933] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {T("reset-password.submit")}
                </button>
              </div>
            </Form>
          )}
        </div>
      </div>
    );
  }

  // Otherwise, render the nested route
  return <Outlet />;
}
