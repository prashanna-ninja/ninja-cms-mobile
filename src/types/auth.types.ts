import type { z } from "zod";

import type { forgotPasswordSchema, signInSchema } from "@/schemas/auth.schema";

export type SignInInput = z.input<typeof signInSchema>;
export type SignInValues = z.output<typeof signInSchema>;
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
export type ForgotPasswordValues = z.output<typeof forgotPasswordSchema>;

/** CMS roles (prisma enum `Role`). See docs/05-ROLES-AND-ACCESS.md. */
export type Role =
  | "superadmin"
  | "admin"
  | "orgadmin"
  | "adviser"
  | "onboarding"
  | "staff"
  | "editor"
  | "user";

/** What `GET /api/auth/get-session` gives us about the user (admin plugin adds role/banned). */
export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: Role | null;
  banned?: boolean | null;
};
