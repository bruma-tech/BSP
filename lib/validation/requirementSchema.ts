import { z } from "zod";

export const requirementSchema = z.object({
  title: z.string().trim().min(1, "Requirement title is required"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),

  type: z.string().min(1, "Requirement type is required"),

  priority: z.enum(["low", "medium", "high"]),

  dueDate: z.string().refine((date) => {
    if (!date) return false;
  
    const selected = new Date(date);
    const today = new Date();
  
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
  
    return selected >= today;
  }, {
    message: "Due date cannot be in the past",
  }),
  

  assignedSponsors: z
    .array(z.string())
    .min(1, "Select at least one sponsor"),

  documentSpecs: z.string(),

  approvalWorkflow: z.string().min(1, "Approval workflow is required"),

  notifyOnSubmission: z.boolean(),

  allowResubmission: z.boolean(),
});

export type RequirementFormData = z.infer<typeof requirementSchema>;
