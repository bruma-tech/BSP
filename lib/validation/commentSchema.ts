import { z } from "zod";

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(5, "Comment must be at least 5 characters")
    .max(500, "Comment cannot exceed 500 characters"),

  isRevisionRequest: z.boolean(),
});

export type CommentFormData = z.infer<typeof commentSchema>;
