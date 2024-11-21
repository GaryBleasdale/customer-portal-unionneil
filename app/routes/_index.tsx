import type { MetaFunction } from "@remix-run/node";
import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getUserFromSession } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserFromSession(request);

  if (user) {
    return redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return redirect("/login");
}

export default function Index() {
  return null;
}
