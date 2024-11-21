import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Navbar } from "./components/ui/navbar";
import { getUserFromSession } from "./utils/auth.server";
import "./tailwind.css";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserFromSession(request)
  return { user }
}

export default function App() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <main>
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
