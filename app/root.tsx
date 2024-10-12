// app/root.tsx

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Link } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUser } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return json({ user });
};

export default function App() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <header>
          {user ? (
            <span>Welcome, {user.name}</span>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </header>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}