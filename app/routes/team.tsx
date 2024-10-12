// app/routes/team.tsx

import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireUserId, getUser } from "~/utils/session.server";
import { teamSchema } from "~/utils/validationSchemas";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { handleApiError } from "~/utils/apiErrorHandler";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const user = await getUser(request);
  const teams = await db.team.findMany();
  return json({ teams, user });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUser(request);

  if (user?.role !== "ADMIN") {
    return json({ error: "Not authorized" }, { status: 403 });
  }

  const formData = Object.fromEntries(await request.formData());
  
  try {
    const validatedData = teamSchema.parse(formData);

    const newTeam = await db.team.create({
      data: validatedData,
    });

    return json({ newTeam });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ errors: error.errors }, { status: 400 });
    }
    return handleApiError(error);
  }
};

export default function Team() {
  const { teams, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <div>
      <h1>Teams</h1>
      <p>Welcome, {user?.name} ({user?.role})</p>
      {user?.role === "ADMIN" && (
        <Form method="post">
          <div>
            <label htmlFor="name">Team Name:</label>
            <input type="text" id="name" name="name" required />
            {actionData?.errors?.find((e) => e.path[0] === "name") && (
              <p className="error">{actionData.errors.find((e) => e.path[0] === "name")?.message}</p>
            )}
          </div>
          <button type="submit" disabled={navigation.state === "submitting"}>
            {navigation.state === "submitting" ? "Saving..." : "Add Team"}
          </button>
        </Form>
      )}
      {actionData?.error && <p className="error">{actionData.error}</p>}
      <h2>Current Teams</h2>
      <ul>
        {teams.map((team: { id: string; name: string }) => (
          <li key={team.id}>{team.name}</li>
        ))}
      </ul>
    </div>
  );
}

export { ErrorBoundary };