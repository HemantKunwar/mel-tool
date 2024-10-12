// app/routes/login.tsx

import { json, redirect, ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { createUserSession, getUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/");
  }
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  const redirectTo = form.get("redirectTo") || "/";
  console.log("Login attempt:", { email, password });

  if (typeof email !== "string" || typeof password !== "string" || typeof redirectTo !== "string") {
    return json({ error: "Invalid form submission" }, { status: 400 });
  }

  try {
    console.log("Attempting to find user with email:", email);
    const user = await db.staff.findUnique({ where: { email } });
    
    if (!user) {
      console.log("User not found");
      return json({ error: "Invalid email or password" }, { status: 400 });
    }

    console.log("User found:", user);
    // In a real application, you would check the password here
    // For this example, we're just checking if the email exists

    return createUserSession(user.id, redirectTo);
  } catch (error) {
    console.error("Error during login:", error);
    return json({ error: "An error occurred during login" }, { status: 500 });
  }
};


export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();

  return (
    <div>
      <h1>Login</h1>
      <Form method="post">
        <input
          type="hidden"
          name="redirectTo"
          value={searchParams.get("redirectTo") ?? undefined}
        />
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit">Log in</button>
      </Form>
      {actionData?.error && <p>{actionData.error}</p>}
    </div>
  );
}