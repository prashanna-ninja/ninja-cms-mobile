# 06 — Auth (email + password with better-auth)

Researched 2026-09-30 against `ref/cms` (`lib/auth.ts`, `lib/auth-client.ts`, `lib/trusted-origins.ts`,
`app/login`, `app/_components/LoginForm.tsx`, `lib/validations/*`) and the working CRM mobile auth
(`ref/ninja-crm-mobile/src/lib/{auth-client,api-client,session-cookie}.ts`).

## 1. How the web signs in today

1. `/login` → `LoginForm` (email + password, zod `loginFormSchema`: email required and valid, password min 1).
2. `signIn.email({ email, password })` → `POST /api/auth/sign-in/email` → better-auth sets the
   `better-auth.session_token` cookie.
3. `router.push("/")` → `app/page.tsx` redirects by role (see [05-ROLES-AND-ACCESS.md](05-ROLES-AND-ACCESS.md)).
4. `?authError=` shows a banner; a "Change password" link goes to `/forget-password`.
5. No sign-up, no social login, no 2FA, no magic link. New users come from an **invite email** →
   `/setup-password` → `/reset-password?setup=1` on the web.

## 2. The mobile design

```
Sign-in screen ──authClient.signIn.email()──► POST /api/auth/sign-in/email
        │                                        │ Set-Cookie: better-auth.session_token
        ▼                                        ▼
 expoClient plugin stores cookie in SecureStore ("ninjacms_cookie")
        │
        ├─► authClient.useSession()  → Stack.Protected guard flips to (app)
        └─► apiFetch() adds  Cookie: authClient.getCookie()  to every /api/** call
```

- **Client:** `createAuthClient` from `better-auth/react` with plugins
  `expoClient({ scheme: "ninjacms", storagePrefix: "ninjacms", storage: SecureStore })` and
  `adminClient()` (so `user.role` is typed).
- **Guard:** root `_layout.tsx` renders `Stack.Protected guard={isSignedIn}` for `(app)` and
  `guard={!isSignedIn}` for `(auth)` — exactly the CRM pattern.
- **API calls:** `apiFetch` sends the cookie manually with `credentials: "omit"` (CRM gotcha: iOS
  otherwise sends a duplicate cookie → 500) and signs out on 401.
- **Forgot password:** `authClient.requestPasswordReset({ email, redirectTo: "<web>/reset-password" })`
  → show a generic "if that email exists, we've sent a link" message (never reveal whether it exists).
  The reset itself finishes in the browser. Deep-linking the reset into the app is a later option.
- **Form:** email + password, `loginFormSchema` ported (with the CRM's regex instead of Zod 4's
  deprecated `.email()`), show/hide password toggle, `autoComplete="email" / "password"` so iOS/Android
  password managers work.

## 3. ⚠️ What the backend needs (small, one-time)

The CMS has **no** `@better-auth/expo` server plugin. Native requests carry no browser `Origin`
header, so better-auth's origin/CSRF check can reject them. The expo plugin fixes that (the client
sends an `expo-origin` header the server plugin maps to `Origin`).

```ts
// ref/cms/lib/auth.ts  (CMS repo, not this one)
import { expo } from "@better-auth/expo";

export const auth = betterAuth({
  // …
  trustedOrigins: [...collectTrustedOrigins(), "ninjacms://"],   // or via TRUSTED_ORIGINS env
  plugins: [expo(), admin({ /* unchanged */ })],
});
```

- `pnpm add @better-auth/expo@<same version as better-auth>` in the CMS (it is on **1.6.11**).
- For dev in Expo Go add `exp://` origins too (e.g. `exp://192.168.x.x:8081`) via `TRUSTED_ORIGINS`.
- Nothing else changes for the web.

**Version alignment decision:** the mobile app pins `better-auth`, `@better-auth/expo` **and**
`@better-auth/core` to exactly **1.6.11** (`--save-exact`), the same as the CMS. Without pinning core,
npm resolved `@better-auth/expo`'s `@better-auth/core` peer to 1.7.6 (drift). Bump all of them together
with the CMS.

## 4. Open questions

1. ~~Backend change~~ — done in the CMS (`1271309`, PR #110).
2. Dev base URL — **LAN IP** (`http://192.168.1.77:3000` on this PC; the CMS listens on `0.0.0.0:3000`).
3. App Store reviewer: a normal test account is enough with password auth (no bypass needed).
4. In-app **password reset / invite setup** (deep link `ninjacms://reset-password?token=…`) — later, if
   wanted. Today both finish on the web.

## 5. Backend checklist

- ✅ `@better-auth/expo@1.6.11` installed in CMS, `expo()` first in plugins (CMS `lib/auth.ts`)
- ✅ `ninjacms://` in `DEFAULT_TRUSTED_ORIGINS`; `exp://`, `exp://**`, `exp://192.168.*.*:*/**` in dev only
  (CMS `lib/trusted-origins.ts`)
- ✅ Verified 2026-09-30 against the local CMS (no `Origin` header, like the app):

| Request | Result |
|---|---|
| `POST /api/auth/sign-in/email` + `expo-origin: ninjacms://`, bad password | `401 INVALID_EMAIL_OR_PASSWORD` ✅ (origin accepted) |
| same via LAN IP `192.168.1.77:3000` | `401 INVALID_EMAIL_OR_PASSWORD` ✅ |
| same + `expo-origin: exp://192.168.1.77:8081` (Expo Go) | `401 INVALID_EMAIL_OR_PASSWORD` ✅ |
| `Origin: https://evil.example` + a cookie | `403 INVALID_ORIGIN` ✅ (still protected) |

- ⬜ Deployed to production (`login.cobaltlicenseesolutions.com.au`) — confirm before a store build.

## 6. Status + client-side notes (implemented — read before touching auth)

✅ **Built 2026-09-30.** Sign-in + forgot-password screens, session guard, `apiFetch`. Verified with a web
render (layout, validation, error states). ⚠️ **A real sign-in with a real account on a device is still
to do.**

| File | Job |
|---|---|
| `src/lib/auth-client.ts` | `createAuthClient` from **`better-auth/client`** + `expoClient({ scheme/storagePrefix: "ninjacms", storage: SecureStore })` |
| `src/providers/session-provider.tsx` | Session in React state (`getSession` → `useSession()`); `refetch`, `signOut` (+ `queryClient.clear()`); registers the 401 handler |
| `src/lib/api-client.ts` | `apiFetch`: manual `Cookie`, `credentials: "omit"`, `{ message }`/`{ error }` bodies, 401 → `signOut` via `setUnauthorizedHandler` |
| `src/api/auth.api.ts` | `useSignIn`, `useRequestPasswordReset` (TanStack mutations), `describeAuthError` |
| `src/app/_layout.tsx` | Boot hold (navy, = splash) until session + fonts; `Stack.Protected` `(app)` / `(auth)` |
| `src/app/(auth)/sign-in.tsx`, `forgot-password.tsx` | Thin routes → `components/login/*` |
| `src/app/(app)/index.tsx` | Temporary signed-in screen (name, email, role, sign out) |

**Rules (each one is a bug someone already hit on CRM/PRM):**
1. **Never use `better-auth/react` / `authClient.useSession()`** — its store tears under React 19. Use
   `useSession()` from `@/providers/session-provider`.
2. After a successful `signIn.email`, call the provider's `refetch()` — the provider isn't reactive.
3. `apiFetch` keeps `credentials: "omit"` + the manual `Cookie` header (iOS duplicate-cookie 500s).
4. 401 signs out; **403 does not** (role / org membership, not auth).
5. Error copy: `INVALID_EMAIL_OR_PASSWORD`/401 → "don't match", banned → "suspended", 429 → "too many
   attempts", `INVALID_ORIGIN` → "not configured for this app", fetch TypeError → "can't reach".
6. Forgot password never reveals whether the account exists.
