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

**Version alignment decision:** the mobile app pins `better-auth` + `@better-auth/expo` to the **1.6.x**
line (latest 1.6.33) to match the server's minor, until the CMS upgrades to 1.7.

## 4. Open questions

1. Can we make the backend change above (or is the CMS team deploying it)? Until it is deployed, we
   test against a local CMS with the change applied.
2. Dev base URL — LAN IP or tunnel? (must be listed in `TRUSTED_ORIGINS`).
3. Is there an App Store reviewer account needed (CRM had a bypass)? With password auth a normal
   test account is enough.

## 5. Backend checklist

- ⬜ `@better-auth/expo` installed in CMS, `expo()` added to plugins
- ⬜ `ninjacms://` (+ dev `exp://…`) in trusted origins
- ⬜ Deployed / running locally for testing

## 6. Status

⬜ Not started — this is the next step after the foundation commit.
