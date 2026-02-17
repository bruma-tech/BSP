import { z } from "zod";

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(3, "Comment must be at least 3 characters"),

  isRevisionRequest: z.boolean(),
});

export type CommentFormData = z.infer<typeof commentSchema>;