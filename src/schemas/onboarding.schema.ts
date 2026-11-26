import { z } from "zod";

export const onboardingFieldSchema = z.enum([
  "fullName",
  "cityOrDistrict",
  "locality",
  "primaryTrade",
  "yearsOfExperience",
  "skills",
]);

export const extractedOnboardingSchema = z.object({
  fullName: z.string().trim().min(2).max(120).nullable(),
  cityOrDistrict: z.string().trim().min(2).max(120).nullable(),
  locality: z.string().trim().min(2).max(120).nullable(),
  primaryTrade: z.string().trim().min(2).max(120).nullable(),
  yearsOfExperience: z.number().int().min(0).max(100).nullable(),
  skills: z.array(z.string().trim().min(2).max(120)).max(50),
  uncertainFields: z.array(onboardingFieldSchema).max(6),
});

export const confirmedOnboardingSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  cityOrDistrict: z.string().trim().min(2).max(120),
  locality: z.string().trim().min(2).max(120),
  primaryTrade: z.enum(["Electrician", "Plumber", "Mason", "Welder"]),
  yearsOfExperience: z.number().int().min(0).max(100),
  skills: z.array(z.string().trim().min(2).max(120)).min(1).max(50),
});

export type ConfirmedOnboardingInput = z.infer<typeof confirmedOnboardingSchema>;
