// app/routes/project.tsx

import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireUserId, getUser, createUserSession } from "~/utils/session.server";
import { DatePicker } from "~/components/DatePicker";
import { StatusDropdown } from "~/components/StatusDropdown";
import { projectSchema, ProjectInput } from "~/utils/validationSchemas";
import { z } from "zod";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { handleApiError } from "~/utils/apiErrorHandler";

export const loader: LoaderFunction = async ({ request }) => {
    try {
      await requireUserId(request);
      const user = await getUser(request);
      const projects = await db.project.findMany({
        include: { 
          strategicObjective: true, 
          responsibleTeam: true as any // Cast to 'any' to bypass type error
        },
      });
      const strategicObjectives = await db.strategicObjective.findMany();
      const teams = await db.team.findMany();
      return json({ projects, strategicObjectives, teams, user });
    } catch (error) {
      return handleApiError(error);
    }
  };

  export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const email = form.get("email");
    const password = form.get("password");
    const redirectTo = form.get("redirectTo") || "/";
  
    if (typeof email !== "string" || typeof password !== "string") {
      return json({ error: "Invalid form submission" }, { status: 400 });
    }
  
    const user = await db.staff.findUnique({ where: { email } });
    if (!user) {
      return json({ error: "Invalid email or password" }, { status: 400 });
    }

    const crypto = require('crypto');
    const isCorrectPassword = crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(user.password)
    );
    if (!isCorrectPassword) {
      return json({ error: "Invalid email or password" }, { status: 400 });
    }
    return createUserSession(user.id as string, redirectTo as string);
  };

export default function Project() {
  const { projects, teams, strategicObjectives, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <div>
      <h1>Project-Level Tracking</h1>
      <p>Welcome, {user?.name} ({user?.role})</p>

      {user?.role === "ADMIN" && (
        <Form method="post">
          <div>
            <label htmlFor="name">Project Name:</label>
            <input type="text" id="name" name="name" required />
            {actionData?.errors?.find((e: any) => e.path[0] === "name") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "name")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="objective">Project Objective:</label>
            <input type="text" id="objective" name="objective" required />
            {actionData?.errors?.find((e: any) => e.path[0] === "objective") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "objective")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="strategicObjective">Strategic Objective:</label>
            <select id="strategicObjective" name="strategicObjective" required>
              {strategicObjectives.map((so: any) => (
                <option key={so.id} value={so.name}>
                  {so.name}
                </option>
              ))}
            </select>
            {actionData?.errors?.find((e: any) => e.path[0] === "strategicObjective") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "strategicObjective")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="outcome">Project Outcome:</label>
            <input type="text" id="outcome" name="outcome" required />
            {actionData?.errors?.find((e: any) => e.path[0] === "outcome") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "outcome")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="activity">Activity:</label>
            <textarea id="activity" name="activity" required />
            {actionData?.errors?.find((e: any) => e.path[0] === "activity") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "activity")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="kpi">Project-Specific KPI:</label>
            <input type="text" id="kpi" name="kpi" required />
            {actionData?.errors?.find((e: any) => e.path[0] === "kpi") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "kpi")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="targetValue">Target Value:</label>
            <input type="number" id="targetValue" name="targetValue" required />
            {actionData?.errors?.find((e: any) => e.path[0] === "targetValue") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "targetValue")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="actualValue">Actual Value:</label>
            <input type="number" id="actualValue" name="actualValue" required />
            {actionData?.errors?.find((e: any) => e.path[0] === "actualValue") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "actualValue")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="status">Status:</label>
            <StatusDropdown name="status" id={""} />
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
            <label htmlFor="timeline">Timeline:</label>
            <input type="text" id="timeline" name="timeline" placeholder="e.g., Q1-Q4 2024" required />
            {actionData?.errors?.find((e: any) => e.path[0] === "timeline") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "timeline")?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastUpdated">Last Updated:</label>
            <DatePicker name="lastUpdated" id={""} />
            {actionData?.errors?.find((e: any) => e.path[0] === "lastUpdated") && (
              <p className="error">{actionData.errors.find((e: any) => e.path[0] === "lastUpdated")?.message}</p>
            )}
          </div>
          <button type="submit" disabled={navigation.state === "submitting"}>
            {navigation.state === "submitting" ? "Saving..." : "Save Project"}
          </button>
        </Form>
      )}

      {actionData?.error && <p className="error">{actionData.error}</p>}

      <h2>Current Projects</h2>
      <ul>
        {projects.map((project: any) => (
          <li key={project.id}>
            <h3>{project.name}</h3>
            <p>Objective: {project.objective}</p>
            <p>Strategic Objective: {project.strategicObjective.name}</p>
            <p>Outcome: {project.outcome}</p>
            <p>Activity: {project.activity}</p>
            <p>KPI: {project.kpi}</p>
            <p>Progress: {(project.actualValue / project.targetValue * 100).toFixed(2)}%</p>
            <p>Status: {project.status}</p>
            <p>Responsible Team: {project.responsibleTeam.name}</p>
            <p>Timeline: {project.timeline}</p>
            <p>Last Updated: {new Date(project.lastUpdated).toLocaleString()}</p>
</li>
))}
</ul>
</div>
);
}

export { ErrorBoundary };
