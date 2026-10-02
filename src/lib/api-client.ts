import { API_BASE_URL } from "@/constants/env";
import { authClient } from "@/lib/auth-client";

/** Thrown for any non-2xx response, carrying the HTTP status. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Called on any 401 so the session provider can drop the user back to sign-in.
 * Registered by providers/session-provider.tsx (it owns the session state, so a
 * bare `authClient.signOut()` here would leave the UI thinking it's signed in).
 */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

/**
 * The single place all app → CMS requests go through.
 * Base URL, JSON headers, auth and error handling live here once.
 *
 * ⚠️ Two non-obvious requirements, learned on Ninja CRM/PRM mobile — keep both:
 *
 * 1. We send the `Cookie` header OURSELVES. The Better Auth Expo client only
 *    attaches the session cookie to its own `authClient.*` calls; a plain
 *    `fetch` gets nothing and every CMS route 401s.
 *
 * 2. `credentials: "omit"` is REQUIRED. On iOS, NSURLSession keeps its own
 *    cookie jar and appends its copy ON TOP of our header, producing a
 *    duplicated cookie the server can't parse → 500s that look like "logged
 *    out". `omit` forces ONLY our explicit header.
 */
/** The stored session cookie, or "" — never throws (SecureStore has no web implementation). */
function readCookie(): string {
  try {
    return authClient.getCookie() || "";
  } catch {
    return "";
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookie = readCookie();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "omit",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    // 401 = session invalid/expired → back to sign-in.
    // 403 = "not allowed" (role / org membership), NOT "not signed in" — keep the session.
    if (res.status === 401) onUnauthorized?.();

    let message = res.statusText || `Request failed (${res.status})`;
    try {
      // CMS routes reply `{ message }`; accept `{ error }` too.
      const body = (await res.json()) as { error?: string; message?: string };
      message = body?.message || body?.error || message;
    } catch {
      // Response wasn't JSON — keep the status text.
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;

  // Some endpoints reply 200 with an empty body; res.json() would throw on it.
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}
