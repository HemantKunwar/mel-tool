import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireUserId, getUser } from "~/utils/session.server";
import { workshopSchema } from "~/utils/validationSchemas";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { handleApiError } from "~/utils/apiErrorHandler";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const user = await getUser(request);
  const workshops = await db.workshop.findMany({ include: { Project: true } });
  const projects = await db.project.findMany();
  return json({ workshops, projects, user });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUser(request);

  if (user?.role !== "ADMIN") {
    return json({ error: "Not authorized" }, { status: 403 });
  }

  const formData = Object.fromEntries(await request.formData());
  
  try {
    const validatedData = workshopSchema.parse({
      ...formData,
      projectId: parseInt(formData.projectId as string),
      numParticipants: parseInt(formData.numParticipants as string),
      disability: formData.disability === "true",
    });

    const newWorkshop = await db.workshop.create({
      data: validatedData,
    });

    return json({ newWorkshop });
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      return json({ errors: (error as any).errors }, { status: 400 });
    }
    return handleApiError(error);
  }
};

export default function Workshop() {
  const { workshops, projects, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <div>
      <h1>Workshops</h1>
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
          <label htmlFor="purpose">Purpose:</label>
          <input type="text" id="purpose" name="purpose" required />
        </div>
        <div>
          <label htmlFor="date">Date:</label>
          <input type="date" id="date" name="date" required />
        </div>
        <div>
          <label htmlFor="location">Location:</label>
          <input type="text" id="location" name="location" required />
        </div>
        <div>
          <label htmlFor="numParticipants">Number of Participants:</label>
          <input type="number" id="numParticipants" name="numParticipants" required />
        </div>
        <div>
          <label htmlFor="sex">Disaggregated by Sex:</label>
          <select id="sex" name="sex" required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
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
            <option value="GROUP_18_29">18-29</option>
            <option value="GROUP_30_44">30-44</option>
            <option value="GROUP_45_54">45-54</option>
            <option value="GROUP_55_64">55-64</option>
            <option value="GROUP_65_PLUS">65+</option>
          </select>
        </div>
        <div>
          <label htmlFor="preEvaluation">Pre-Evaluation Understanding:</label>
          <textarea id="preEvaluation" name="preEvaluation" required></textarea>
        </div>
        <div>
          <label htmlFor="localPartner">Local Implementing Partner:</label>
          <input type="text" id="localPartner" name="localPartner" required />
        </div>
        <div>
          <label htmlFor="partnershipSuccess">Success of Partnership:</label>
          <input type="text" id="partnershipSuccess" name="partnershipSuccess" required />
        </div>
        <div>
          <label htmlFor="postEvaluation">Post-Workshop Delivery Understanding:</label>
          <textarea id="postEvaluation" name="postEvaluation" required></textarea>
        </div>
        <div>
          <label htmlFor="challenges">Capacity Challenges:</label>
          <textarea id="challenges" name="challenges" required></textarea>
        </div>
        <div>
          <label htmlFor="strengths">Strengths:</label>
          <textarea id="strengths" name="strengths" required></textarea>
        </div>
        <div>
          <label htmlFor="outcomes">Outcomes:</label>
          <textarea id="outcomes" name="outcomes" required></textarea>
        </div>
        <div>
          <label htmlFor="recommendations">Recommendations:</label>
          <textarea id="recommendations" name="recommendations" required></textarea>
        </div>
        <div>
          <label htmlFor="addressChallenges">How do you intend to address the challenges?</label>
          <textarea id="addressChallenges" name="addressChallenges" required></textarea>
        </div>
        <button type="submit" disabled={navigation.state === "submitting"}>
          {navigation.state === "submitting" ? "Saving..." : "Add Workshop"}
        </button>
      </Form>
      {actionData?.error && <p className="error">{actionData.error}</p>}
      <h2>Current Workshops</h2>
      <ul>
        {workshops.map((workshop: { id: number; Project: { projectName: string }; numParticipants: number }) => (
          <li key={workshop.id}>
            Workshop for {workshop.Project.projectName} - Participants: {workshop.numParticipants}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { ErrorBoundary };
