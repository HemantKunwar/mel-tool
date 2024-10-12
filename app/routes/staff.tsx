// app/routes/staff.tsx

import { Role } from "@prisma/client";
import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { handleApiError } from "~/utils/apiErrorHandler";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const staff = await db.staff.findMany();
  return json({ staff });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await db.staff.findUnique({ where: { id: userId } });

  if (!user || user.role !== "ADMIN") {
    return json({ error: "Not authorized" }, { status: 403 });
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const role = formData.get("role");

  if (typeof name !== "string" || typeof email !== "string" || typeof role !== "string") {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  const newStaff = await db.staff.create({
    data: { name, email, role: role as Role, password: "password" },
  }).catch((error: any) => {
    return handleApiError(error);
  });

  return json({ newStaff });
};

export default function Staff() {
  const { staff } = useLoaderData<{ staff: Array<{ id: string; name: string; email: string; role: Role }> }>();
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();

  return (
    <div>
      <h1>Staff Management</h1>
      <Form method="post">
        <div>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <select id="role" name="role" required>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={navigation.state === "submitting"}>
          {navigation.state === "submitting" ? "Adding..." : "Add Staff"}
        </button>
      </Form>
      {actionData?.error && <p>{actionData.error}</p>}
      <h2>Current Staff</h2>
      <ul>
        {staff.map((s: any) => (
          <li key={s.id}>
            {s.name} - {s.email} ({s.role})
          </li>
        ))}
      </ul>
    </div>
  );
}