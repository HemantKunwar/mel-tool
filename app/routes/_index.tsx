// app/routes/index.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getUser } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return [{ title: "M&E Tool" }];
};

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const user = await getUser(request);
    return json({ user });
  } catch (error) {
    console.error("Error in index loader:", error);
    return json({ user: null });
  }
};

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to the M&E Tool</h1>
      {user ? (
        <>
          <p>Hello, {user.name} ({user.role})</p>
          <ul>
            <li><Link to="/strategy">Strategy-Level Tracking</Link></li>
            <li><Link to="/project">Project-Level Tracking</Link></li>
            <li><Link to="/livelihood">Livelihoods</Link></li>
            <li><Link to="/workshop">Workshops</Link></li>
            {user.role === "ADMIN" && (
              <>
                <li><Link to="/staff">Staff Management</Link></li>
                <li><Link to="/team">Team Management</Link></li>
              </>
            )}
          </ul>
          <form action="/logout" method="post">
            <button type="submit">Logout</button>
          </form>
        </>
      ) : (
        <p>
          Please <Link to="/login">log in</Link> to access the application.
        </p>
      )}
    </div>
  );
}