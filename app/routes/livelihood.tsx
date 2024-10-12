import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireUserId, getUser } from "~/utils/session.server";
import { livelihoodSchema } from "~/utils/validationSchemas";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { handleApiError } from "~/utils/apiErrorHandler";

import { z } from "zod";
export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const user = await getUser(request);
  const livelihoods = await db.livelihood.findMany({ include: { Project: true } });
  const projects = await db.project.findMany();
  return json({ livelihoods, projects, user });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUser(request);

  if (user?.role !== "ADMIN") {
    return json({ error: "Not authorized" }, { status: 403 });
  }

  const formData = Object.fromEntries(await request.formData());
  
  try {
    const validatedData = livelihoodSchema.parse({
      ...formData,
      projectId: parseInt(formData.projectId as string),
      grantAmountReceived: parseFloat(formData.grantAmountReceived as string),
      subsequentGrantAmount: parseFloat(formData.subsequentGrantAmount as string),
      disability: formData.disability === "true",
    });

    const newLivelihood = await db.livelihood.create({
      data: validatedData,
    });

    return json({ newLivelihood });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ errors: error.errors }, { status: 400 });
    }
    return handleApiError(error);
  }
};

export default function Livelihood() {
  const { livelihoods, projects, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <div>
      <h1>Livelihoods</h1>
      <p>Welcome, {user?.name} ({user?.role})</p>
      <Form method="post">
        <div>
          <label htmlFor="projectId">Project:</label>
          <select id="projectId" name="projectId" required>
            {projects.map((project: { id: number; projectName: string }) => (
              <option key={project.id} value={project.id}>{project.projectName}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="participantName">Participant Name:</label>
          <input type="text" id="participantName" name="participantName" required />
        </div>
        <div>
          <label htmlFor="location">Location:</label>
          <input type="text" id="location" name="location" required />
        </div>
        <div>
          <label htmlFor="sex">Disaggregated by Sex:</label>
          <select id="disaggregatedSex" name="disaggregatedSex" required>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="disability">Disability:</label>
          <select id="disability" name="disability" required>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <label htmlFor="ageGroup">Age Group:</label>
          <select id="ageGroup" name="ageGroup" required>
            <option value="18-29">18-29</option>
            <option value="30-44">30-44</option>
            <option value="45-54">45-54</option>
            <option value="55-64">55-64</option>
            <option value="65+">65+</option>
          </select>
        </div>
        <div>
          <label htmlFor="grantAmountReceived">Grant Amount Received:</label>
          <input type="number" id="grantAmountReceived" name="grantAmountReceived" step="0.01" required />
        </div>
        <div>
          <label htmlFor="purpose">Purpose of the Grant:</label>
          <textarea id="purpose" name="purpose" required></textarea>
        </div>
        <div>
          <label htmlFor="progress1">Progress 1:</label>
          <textarea id="progress1" name="progress1" required></textarea>
        </div>
        <div>
          <label htmlFor="progress2">Progress 2:</label>
          <textarea id="progress2" name="progress2" required></textarea>
        </div>
        <div>
          <label htmlFor="outcome">Outcome:</label>
          <textarea id="outcome" name="outcome" required></textarea>
        </div>
        <div>
          <label htmlFor="subsequentGrantAmount">Subsequent Grant Amount:</label>
          <input type="number" id="subsequentGrantAmount" name="subsequentGrantAmount" step="0.01" />
        </div>
        <button type="submit" disabled={navigation.state === "submitting"}>
          {navigation.state === "submitting" ? "Saving..." : "Add Livelihood"}
        </button>
      </Form>
      {actionData?.error && <p className="error">{actionData.error}</p>}
      <h2>Current Livelihoods</h2>
      <ul>
        {livelihoods.map((livelihood: { id: number; participantName: string; Project: { projectName: string } }) => (
          <li key={livelihood.id}>
            {livelihood.participantName} - Project: {livelihood.Project.projectName}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { ErrorBoundary };
