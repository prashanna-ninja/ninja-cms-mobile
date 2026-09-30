import { useMutation } from "@tanstack/react-query";

import { API_BASE_URL } from "@/constants/env";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/providers/session-provider";
import type { ForgotPasswordValues, SignInValues } from "@/types/auth.types";

/** A better-auth error turned into something the sign-in screen can show. */
export class AuthError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Turn a thrown/returned failure into copy a human can act on. Real-world
 * cases, in the order they actually happen:
 *  - no network / wrong EXPO_PUBLIC_API_BASE_URL → fetch rejects with a TypeError
 *  - 401 INVALID_EMAIL_OR_PASSWORD
 *  - 403 banned (admin plugin) or origin not trusted (CMS missing `ninjacms://`)
 *  - 429 better-auth rate limit on /sign-in
 */
export function describeAuthError(err: unknown): string {
  if (err instanceof AuthError) {
    const { status, code, message } = err;
    if (code === "INVALID_EMAIL_OR_PASSWORD" || status === 401) {
      return "That email and password don't match. Check them and try again.";
    }
    if (code === "BANNED_USER" || /banned/i.test(message)) {
      return "This account has been suspended. Please contact your administrator.";
    }
    if (status === 429 || /too many/i.test(message)) {
      return "Too many attempts. Wait a moment, then try again.";
    }
    if (/origin/i.test(message) || code === "INVALID_ORIGIN") {
      return "Sign-in isn't configured for this app yet. Please contact your administrator.";
    }
    return message || "Something went wrong. Please try again.";
  }

  const message = err instanceof Error ? err.message : String(err ?? "");
  if (/network request failed|fetch failed|failed to fetch/i.test(message)) {
    return "Can't reach Ninja CMS. Check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

/** POST /api/auth/sign-in/email → cookie stored in SecureStore → session refetched. */
export function useSignIn() {
  const { refetch } = useSession();

  return useMutation({
    mutationFn: async ({ email, password }: SignInValues) => {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) throw new AuthError(error.message ?? "", error.status, error.code);
    },
    // Flipping the session makes Stack.Protected move to (app) — no manual navigation.
    onSuccess: () => refetch(),
  });
}

/**
 * POST /api/auth/request-password-reset. The CMS emails a branded link that
 * opens the WEB reset page (see docs/06-AUTH.md) — the reset finishes in the browser.
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async ({ email }: ForgotPasswordValues) => {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${API_BASE_URL}/reset-password`,
      });
      if (error) throw new AuthError(error.message ?? "", error.status, error.code);
    },
  });
}
