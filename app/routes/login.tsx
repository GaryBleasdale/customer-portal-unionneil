import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useActionData, useLocation } from "@remix-run/react";
import {
  createUserSession,
  getUserFromSession,
  verifyPassword,
} from "~/utils/auth.server";
import { prisma } from "~/utils/prisma.server";
import { Link } from "@remix-run/react";
import T from "~/utils/translate";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserFromSession(request);
  if (user) {
    return redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  }
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toString() },
  });

  if (!user) {
    return json({ error: "Invalid email or password" }, { status: 400 });
  }

  const isValidPassword = await verifyPassword(
    password.toString(),
    user.password
  );

  if (!isValidPassword) {
    return json({ error: "Invalid email or password" }, { status: 400 });
  }

  return createUserSession(user.id, user.role);
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {T("login.sign-in-to-your-account")}
          </h2>
        </div>

        {new URLSearchParams(location.search).get("passwordReset") ===
          "success" && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  {T("login.password-reset-success")}
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{T("login.password-reset-message")}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {actionData?.error && (
          <div className="text-red-600 text-sm">{actionData.error}</div>
        )}

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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={T("login.email-address")}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {T("login.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={T("login.password")}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/reset-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {T("login.forgot-password")}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {T("login.sign-in")}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
