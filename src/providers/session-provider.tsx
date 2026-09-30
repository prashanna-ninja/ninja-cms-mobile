import * as React from "react";

import { setUnauthorizedHandler } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query-client";
import type { SessionUser } from "@/types/auth.types";

type SessionData = { user: SessionUser } | null;

type SessionState = {
  data: SessionData;
  isPending: boolean;
  error: unknown;
  /** Re-read the session from the server (after sign-in). */
  refetch: () => Promise<void>;
  /** Sign out and clear local session state + cached data. */
  signOut: () => Promise<void>;
};

const SessionContext = React.createContext<SessionState | null>(null);

/**
 * The app's session, held in plain React state.
 *
 * ⚠️ DO NOT replace this with better-auth's `useSession()` (from `better-auth/react`).
 * Its store backs `useSyncExternalStore` with a snapshot its own `subscribe`
 * mutates, which React 19 reports as tearing ("There was an error during
 * concurrent rendering…") and re-renders the whole root. Found and fixed in
 * Ninja PRM mobile; same pattern here.
 *
 * Trade-off: the session doesn't update itself reactively — we own every
 * transition: sign-in calls `refetch()`, sign-out and 401s go through `signOut()`.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<SessionData>(null);
  const [isPending, setIsPending] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);

  // Stops a late response from a superseded request overwriting a newer one.
  const requestIdRef = React.useRef(0);

  // State is only ever set inside the promise callbacks (never synchronously in
  // the effect body) — keeps the React Compiler lint rules happy.
  const load = React.useCallback(() => {
    const requestId = ++requestIdRef.current;
    const isCurrent = () => requestId === requestIdRef.current;

    return authClient
      .getSession()
      .then((result) => {
        if (!isCurrent()) return;
        setData((result?.data as SessionData) ?? null);
        setError(result?.error ?? null);
      })
      .catch((err: unknown) => {
        if (!isCurrent()) return;
        // Network failure = "we don't know". Keep them out of the app, keep the error.
        setData(null);
        setError(err);
      })
      .finally(() => {
        if (isCurrent()) setIsPending(false);
      });
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const signOut = React.useCallback(async () => {
    // Optimistic: the guard should move immediately; a failed server sign-out
    // still means the session is gone as far as this device cares.
    requestIdRef.current++;
    setData(null);
    setError(null);
    try {
      await authClient.signOut();
    } catch {
      // Already cleared locally.
    } finally {
      // Drop every cached query so the next person on this device never sees
      // the previous user's data.
      queryClient.clear();
    }
  }, []);

  // apiFetch reports 401s here.
  React.useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = React.useMemo<SessionState>(
    () => ({ data, isPending, error, refetch: load, signOut }),
    [data, isPending, error, load, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** The app-wide session. Must be used under <SessionProvider>. */
export function useSession(): SessionState {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider>");
  return ctx;
}
