import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PRAMAAN_DEV_PHONE: z.string().min(3).optional(),
});

export function getServerEnv() {
  return envSchema.parse(process.env);
}
