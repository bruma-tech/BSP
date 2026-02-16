import { z } from "zod";

export const sponsorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Sponsor name is required"),

  contactEmail: z
    .string()
    .trim()
    .email("Invalid email address"),

  contactPhone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),

  address: z
    .string()
    .trim()
    .min(5, "Address is required"),

  status: z.enum(["active", "pending"]),
});

export type SponsorData = z.infer<typeof sponsorSchema>;
