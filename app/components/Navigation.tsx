// app/components/Navigation.tsx

import { Form, Link } from "@remix-run/react";

export function Navigation({ user }: { user: { name: string; role: string } | null }) {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/strategy">Strategic Objectives</Link></li>
        <li><Link to="/project">Projects</Link></li>
        {user?.role === "ADMIN" && <li><Link to="/staff">Staff Management</Link></li>}
      </ul>
      {user ? (
        <Form action="/logout" method="post">
          <button type="submit">Logout {user.name}</button>
        </Form>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}