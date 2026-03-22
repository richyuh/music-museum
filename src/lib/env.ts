import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").optional(),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    console.error(`\n❌ Missing or invalid environment variables:\n${errors}\n`);
    throw new Error("Invalid environment configuration");
  }
  return result.data;
}

export const env = validateEnv();
