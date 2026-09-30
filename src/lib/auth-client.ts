import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/client";
import * as SecureStore from "expo-secure-store";

import { API_BASE_URL, APP_SCHEME } from "@/constants/env";

/**
 * Better Auth client for the app.
 *
 * ⚠️ These must agree or sign-in silently breaks:
 *   1. `baseURL` = the CMS's BETTER_AUTH_URL (no redirects — a redirected auth
 *      call loses its cookie; use the exact host, e.g. with/without `www`).
 *   2. `scheme` = app.json `scheme` = the CMS trusted origin `ninjacms://`
 *      (lib/trusted-origins.ts in the CMS). The client sends it as the
 *      `expo-origin` header, which the server's `expo()` plugin maps to Origin.
 *   3. `storagePrefix` sets the SecureStore key (`ninjacms_cookie`).
 *
 * Versions are pinned EXACTLY to the CMS server (better-auth, @better-auth/expo,
 * @better-auth/core = 1.6.11). Client/server drift shows up as cookie-format
 * bugs that are miserable to diagnose — bump all of them together with the CMS.
 *
 * ⚠️ Imported from `better-auth/client`, NOT `better-auth/react`: the React
 * entry's `useSession` store tears under React 19 concurrent rendering (found
 * in Ninja PRM mobile). We read the session through
 * providers/session-provider.tsx instead.
 */
export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: APP_SCHEME,
      storagePrefix: APP_SCHEME,
      storage: SecureStore,
    }),
  ],
});
