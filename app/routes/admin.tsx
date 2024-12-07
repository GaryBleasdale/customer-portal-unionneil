import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma.server";
import Sidebar from "../components/ui/Sidebar";
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 grid">
        <div className="px-4 py-6 sm:px-0 grid grid-cols-[repeat(2,1fr)]">
          <Sidebar />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
