import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma.server";
import T from "~/utils/translate";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  if (user.role !== "ADMIN") {
    throw new Response("Unauthorized", { status: 403 });
  }
  console.log(request.url);
  if (request.url.endsWith("/admin")) {
    return redirect("/admin/dashboard");
  }

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
  });

  return json({ customers });
}

export default function Admin() {
  const { customers } = useLoaderData<typeof loader>();

  return (
    <div className="py-10">
      <Outlet />
    </div>
  );
}
