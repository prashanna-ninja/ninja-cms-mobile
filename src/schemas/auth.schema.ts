import { z } from "zod";

/**
 * Sign-in / forgot-password form shapes — mirror the CMS web's
 * lib/validations/LoginFormSchema.ts and ForgotPasswordSchema.tsx.
 * Types are inferred in src/types/auth.types.ts — never declared twice.
 *
 * A plain regex instead of Zod 4's deprecated `.email()` (same as Ninja CRM mobile).
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const email = z
  .string()
  .trim()
  .min(1, "Enter your email address")
  .refine((value) => EMAIL_REGEX.test(value), "That doesn't look like an email address")
  // better-auth lowercases on the server anyway; doing it here keeps copy honest.
  .transform((value) => value.toLowerCase());

export const signInSchema = z.object({
  email,
  // Web rule: required, no length check at sign-in (length is enforced when it's set).
  password: z.string().min(1, "Enter your password"),
});

export const forgotPasswordSchema = z.object({ email });
