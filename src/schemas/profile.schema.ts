import { z } from "zod";

export const preferredLanguageSchema = z.enum(["ENGLISH", "HINDI", "KANNADA", "EN", "हिन्दी", "ಕನ್ನಡ"]);

export const workerProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(120),
  locality: z.string().trim().min(2).max(120),
  preferredLanguage: preferredLanguageSchema,
  profilePhotoUrl: z.string().url().optional().nullable(),
  tradeId: z.string().uuid().optional(),
  tradeName: z.string().trim().min(2).max(120).optional(),
  specificWork: z.string().trim().min(2).max(500),
  yearsExperience: z.union([z.number().int().min(0).max(100), z.string().trim().min(1).max(30)]),
  introduction: z.string().trim().max(2_000).default(""),
  introductionAudioUrl: z.string().url().optional().nullable(),
  skillIds: z.array(z.string().uuid()).max(50).optional(),
  skillNames: z.array(z.string().trim().min(1).max(120)).max(50).optional(),
  profileCompleted: z.boolean().optional().default(false),
}).refine((value) => value.tradeId || value.tradeName, { message: "tradeId or tradeName is required", path: ["tradeId"] });

export type WorkerProfileInput = z.infer<typeof workerProfileSchema>;
