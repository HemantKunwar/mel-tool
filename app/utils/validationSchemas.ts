import { z } from "zod";

// Updated strategic objective schema
export const strategicObjectiveSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
    outcome: z.string().min(1, "Outcome is required"),
    kpi: z.string().min(1, "KPI is required"),
    targetValue: z.number().positive("Target value must be a positive number"),
    actualValue: z.number().nonnegative("Actual value must be non-negative"),
    status: z.enum(["ON_TRACK", "AT_RISK", "DELAYED", "COMPLETED"]),
    teamId: z.number().int().positive("Team ID must be a positive integer"),
    lastUpdated: z.string().refine((date) => {
      const parsedDate = Date.parse(date);
      return !isNaN(parsedDate) && parsedDate <= Date.now();
    }, {
      message: "Invalid date format or future date",
    }),
  })
  .refine((data) => data.actualValue <= data.targetValue, {
    message: "Actual value cannot exceed target value",
    path: ["actualValue"], // The error will appear on the actualValue field
  });


// Updated project schema with similar enhancements


export const teamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100, "Team name must be 100 characters or less"),
});

export const workshopSchema = z.object({
  projectId: z.number().int().positive("Project ID must be a positive integer"),
  numParticipants: z.number().int().nonnegative("Number of participants must be non-negative"),
  disaggregatedSex: z.enum(["MALE", "FEMALE", "OTHER"]),
  disability: z.boolean(),
  ageGroup: z.enum(["GROUP_18_29", "GROUP_30_44", "GROUP_45_54", "GROUP_55_64", "GROUP_65_PLUS"]),
  preEvaluation: z.string().min(1, "Pre-evaluation is required"),
  postEvaluation: z.string().min(1, "Post-evaluation is required"),
  localPartner: z.string().min(1, "Local partner is required"),
  localPartnerResponsibility: z.string().min(1, "Local partner responsibility is required"),
  successOfPartnership: z.string().min(1, "Success of partnership is required"),
  challenges: z.string().min(1, "Challenges are required"),
  strengths: z.string().min(1, "Strengths are required"),
  outcomes: z.string().min(1, "Outcomes are required"),
  recommendations: z.string().min(1, "Recommendations are required"),
});

export const livelihoodSchema = z.object({
  projectId: z.number().int().positive("Project ID must be a positive integer"),
  participantName: z.string().min(1, "Participant name is required"),
  location: z.string().min(1, "Location is required"),
  disaggregatedSex: z.enum(["MALE", "FEMALE", "OTHER"]),
  disability: z.boolean(),
  ageGroup: z.enum(["GROUP_18_29", "GROUP_30_44", "GROUP_45_54", "GROUP_55_64", "GROUP_65_PLUS"]),
  grantAmountReceived: z.number().positive("Grant amount must be positive"),
  grantPurpose: z.string().min(1, "Grant purpose is required"),
  progress1: z.string().min(1, "Progress 1 is required"),
  progress2: z.string().min(1, "Progress 2 is required"),
  outcome: z.string().min(1, "Outcome is required"),
  subsequentGrantAmount: z.number().nonnegative("Subsequent grant amount must be non-negative"),
});

export type TeamInput = z.infer<typeof teamSchema>;
export type WorkshopInput = z.infer<typeof workshopSchema>;
export type LivelihoodInput = z.infer<typeof livelihoodSchema>;

export type StrategicObjectiveInput = z.infer<typeof strategicObjectiveSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
