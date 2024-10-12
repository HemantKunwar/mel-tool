import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireUserId, getUser } from "~/utils/session.server";
import { DatePicker } from "~/components/DatePicker";
import { StatusDropdown } from "~/components/StatusDropdown";
import { z } from "zod";
import { strategicObjectiveSchema, StrategicObjectiveInput } from "~/utils/validationSchemas";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { handleApiError } from "~/utils/apiErrorHandler";
import { useEffect, useRef } from "react";

// Enhance the schema with additional validations
const enhancedStrategicObjectiveSchema = z.object({
  name: z.string().min(1, "Strategic objective name is required"),
  teamId: z.string().min(1, "Team is required"),
  outcome: z.string().min(1, "Outcome is required"),
  kpi: z.string().min(1, "KPI is required"),
  targetValue: z.number().positive("Target value must be a positive number"),
  actualValue: z.number().min(0, "Actual value cannot be negative"),
  status: z.string().min(1, "Status is required"),
  responsibleTeam: z.string().min(1, "Responsible team is required"),
  lastUpdated: z.string().refine(
    (date) => {
      const parsedDate = Date.parse(date);
      return !isNaN(parsedDate) && parsedDate <= Date.now();
    },
    { message: "Last updated date cannot be in the future" }
  ),
}).superRefine((data, ctx) => {
  if (data.actualValue > data.targetValue) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Actual value cannot be greater than target value",
      path: ["actualValue"], // this will attach the error to the 'actualValue' field
    });
  }
});


export const loader: LoaderFunction = async ({ request }) => {
  try {
    await requireUserId(request);
    const user = await getUser(request);
    const strategicObjectives = await db.strategicObjective.findMany({
      include: { responsibleTeam: true },
    });
    const teams = await db.team.findMany();
    return json({ strategicObjectives, teams, user });
  } catch (error) {
    return handleApiError(error);
  }
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUser(request);

  if (user?.role !== "ADMIN") {
    return json({ error: "Not authorized" }, { status: 403 });
  }

  const formData = await request.formData();
  const formDataObject: Record<string, any> = {};
  formData.forEach((value, key) => {
    formDataObject[key] = value;
  });

  try {
    // Validate formDataObject using the enhanced schema
    const validatedData = enhancedStrategicObjectiveSchema.parse(formDataObject);

    // Convert teamId to a number
    const teamId = validatedData.teamId ? parseInt(validatedData.teamId) : null;

    // Convert lastUpdated to a Date
    const lastUpdated = new Date(validatedData.lastUpdated);

    // Create new strategic objective in the database
    const newStrategicObjective = await db.strategicObjective.create({
      data: {
        ...validatedData,
        teamId,  // Ensure it's a number or null
        lastUpdated,  // Ensure it's a Date object
        progressPercentage: (validatedData.actualValue / validatedData.targetValue) * 100,
      },
    });

    return json({ newStrategicObjective });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ errors: error.errors }, { status: 400 });
    }
    return json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};


export default function Strategy() {
  const { strategicObjectives, teams, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  // Client-side date validation for lastUpdated
  useEffect(() => {
    const lastUpdatedInput = document.getElementById("lastUpdated") as HTMLInputElement;
    lastUpdatedInput?.setAttribute("max", new Date().toISOString().split("T")[0]);
  }, []);

  return (
    <div>
      <h1>Strategic Objectives</h1>
      <p>Welcome, {user?.name} ({user?.role})</p>

      {user?.role === "ADMIN" && (
        <Form method="post">
          <div>
            <label htmlFor="objective">Strategic Objective Name:</label>
            <input type="text" id="name" name="name" required />
            <select id="teamId" name="teamId" required>
              {teams.map((team: any) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            {actionData?.errors?.find((e: any) => e.path[0] === "name") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "name")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="outcome">Outcome:</label>
            <input type="text" id="outcome" name="outcome" required />
            {actionData?.errors?.find((e: any) => e.path[0] === "outcome") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "outcome")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="kpi">Key Performance Indicator:</label>
            <input type="text" id="kpi" name="kpi" required />
            {actionData?.errors?.find((e: any) => e.path[0] === "kpi") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "kpi")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="targetValue">Target Value:</label>
            <input type="number" id="targetValue" name="targetValue" min="1" required />
            {actionData?.errors?.find((e: any) => e.path[0] === "targetValue") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "targetValue")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="actualValue">Actual Value:</label>
            <input type="number" id="actualValue" name="actualValue" min="0" max="targetValue" required />
            {actionData?.errors?.find((e: any) => e.path[0] === "actualValue") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "actualValue")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="status">Status:</label>
            <StatusDropdown name="status" id="status" />
            {actionData?.errors?.find((e: any) => e.path[0] === "status") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "status")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="responsibleTeam">Responsible Team:</label>
            <select id="responsibleTeam" name="responsibleTeam" required>
              {teams.map((team: any) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
            {actionData?.errors?.find((e: any) => e.path[0] === "responsibleTeam") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "responsibleTeam")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastUpdated">Last Updated:</label>
            <DatePicker name="lastUpdated" id="lastUpdated" />
            {actionData?.errors?.find((e: any) => e.path[0] === "lastUpdated") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "lastUpdated")?.message}</p>
            )}
          </div>
          <button type="submit" disabled={navigation.state === "submitting"}>
            {navigation.state === "submitting" ? "Saving..." : "Save Strategic Objective"}
          </button>
        </Form>
      )}

      {actionData?.error && <p className="error">{actionData.error}</p>}

      <h2>Current Strategic Objectives</h2>
      <ul>
        {strategicObjectives.map((so: any) => (
          <li key={so.id}>
            <h3>{so.name}</h3>
            <p>Outcome: {so.outcome}</p>
            <p>KPI: {so.kpi}</p>
            <p>Progress: {(so.actualValue / so.targetValue * 100).toFixed(2)}%</p>
            <p>Status: {so.status}</p>
            <p>Responsible Team: {so.responsibleTeam.name}</p>
            <p>Last Updated: {new Date(so.lastUpdated).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { ErrorBoundary };
