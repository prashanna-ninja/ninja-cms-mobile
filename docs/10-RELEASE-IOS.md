# 10 — iOS release: TestFlight (internal testing, no review)

Set up 2026-10-02. **Goal: get builds onto TestFlight for internal testers. No App Store review yet.**
Internal testing (App Store Connect users on your team, up to 100) needs **no Beta App Review**; builds are
available minutes after processing. External testers (public link / email) would need a one-time Beta App
Review, which we're not doing yet.

## 1. What's configured in the repo

| File | What |
|---|---|
| `eas.json` | Profiles: `development` (dev client, **iOS simulator**), `preview` (internal), `production` (store / TestFlight). `appVersionSource: "remote"` + `autoIncrement` → EAS owns the **build number** (1, 2, 3…); the marketing **version** is `app.json` `version` (`1.0.0`). |
| `eas.json` `build.production.env` | `APP_ENV=production`, `EXPO_PUBLIC_API_BASE_URL=https://login.cobaltlicenseesolutions.com.au` (the same for `preview`). |
| `.easignore` | What EAS uploads. Mirrors `.gitignore` **and excludes every `.env`** (local `.env` = LAN dev URL), plus `/ref` and the icon source art. |
| `app.config.ts` `assertReleaseEnv()` | **Fails** a `production`/`preview` build if `EXPO_PUBLIC_API_BASE_URL` isn't `https://…`, so a store build can never ship a dev URL. |
| `app.json` | Name **Ninja CMS**, bundle ID **`com.adviceninja.ninjacms`**, version `1.0.0`, iPhone only (`supportsTablet: false`), light UI, `ITSAppUsesNonExemptEncryption: false` (TestFlight won't ask the export-compliance question), **no Face ID permission string** (`expo-secure-store` `faceIDPermission: false`; we don't use biometrics). |
| `package.json` | `npm run build:ios` · `npm run submit:ios` · `npm run release:ios` (build + auto-submit) |

**Verified 2026-10-02 (from Windows):**

| Check | Result |
|---|---|
| Production CMS accepts the app (`POST /api/auth/sign-in/email`, `expo-origin: ninjacms://`, fake user) | `401 INVALID_EMAIL_OR_PASSWORD` ✅ (not `403 INVALID_ORIGIN`, so the expo plugin is deployed) |
| Auth URL has no redirect (a redirect would drop the cookie) | `get-session` 200, no redirect ✅ |
| Guard: production + `http://192.168…` | build config **fails** with a clear message ✅ |
| Production iOS JS bundle | contains `login.cobaltlicenseesolutions.com.au`, **0** LAN/dev URLs ✅ |
| `expo-doctor` | 20/20 ✅ |
| Resolved iOS config | bundle ID, `ITSAppUsesNonExemptEncryption: false`, no `NSFaceIDUsageDescription` ✅ |

⚠️ Not done from here (needs your Expo/Apple logins, or a Mac): `eas init`, the first cloud build, the submit.

## 2. One-time setup (on any machine with the repo; the Mac is fine)

```bash
npm install
npx eas-cli@latest login            # your Expo account (the CRM app's account works)
npx eas-cli@latest init             # creates the EAS project → writes extra.eas.projectId + owner
```

`eas init` may say it can't write to a dynamic config (we have `app.config.ts`). If so, it prints the
`projectId`: add it to **`app.json`** by hand and commit:

```json
"owner": "<your-expo-account-or-org>",
"extra": { "eas": { "projectId": "<printed-id>" } }
```

Check in **App Store Connect**: the app record exists with bundle ID **`com.adviceninja.ninjacms`** exactly
(you registered it). Note its **Apple ID** (the number under *App Information → Apple ID*). You can put it in
`eas.json` → `submit.production.ios.ascAppId` so submits never ask:

```json
"submit": { "production": { "ios": { "ascAppId": "1234567890" } } }
```

## 3. Build + upload to TestFlight

```bash
npm run release:ios     # = eas build -p ios --profile production --auto-submit
```

On the first run EAS asks (interactive, once):
1. **Log in to your Apple Developer account** → let EAS **generate the Distribution Certificate and the
   App Store provisioning profile** (say yes; EAS stores them for next time).
2. Push notifications key → **No** (we don't use push yet).
3. For the submit: an **App Store Connect API key** → let EAS create one (recommended), or sign in with Apple ID.

EAS builds in the cloud (~15–25 min), then uploads to App Store Connect. Apple processes the build
(~5–30 min; you get an email). Then:

- **App Store Connect → your app → TestFlight → Internal Testing** → create a group (e.g. "Advice Ninja"),
  add testers (they must be users on your App Store Connect team), and enable the build. **No review.**
- Testers install **TestFlight** from the App Store → accept the invite → install Ninja CMS.

Separate steps if you prefer: `npm run build:ios`, then `npm run submit:ios` (submits the latest build).

## 4. Every next TestFlight build

`npm run release:ios`. The build number increments automatically (remote). Bump `app.json` `version`
(e.g. `1.0.1`) only for a release you want to label differently. TestFlight is fine with the same version.

## 5. Checklist before each push

- ⬜ `npx tsc --noEmit`, `npm run lint`, `npx expo-doctor` clean
- ⬜ Signed in on a dev build against **production** at least once (real account), and picked an org
- ⬜ The production CMS still has `expo()` + `ninjacms://` (see §1 curl check)
- ⬜ Native config changed (icons, plugins, app.json)? → nothing extra for EAS (it prebuilds fresh), but run
  `npx expo prebuild --clean` before your next **local** `expo run:ios`

## 6. Known for later (not needed for internal TestFlight)

- **External TestFlight / App Store review:** needs a demo/reviewer account in the review notes, a privacy
  policy URL, and App Privacy answers (the CRM's `APP-STORE-REVIEW-NOTES.md` is the template). Plus
  **account deletion** (Apple guideline 5.1.1(v)) or the documented exemption the CRM used.
- Push notifications, OTA updates (`expo-updates`), Android Play internal testing.
- The default (signed-out) icon is the Ninja CMS blue one; org icons switch after sign-in (iOS shows its
  one-line "icon changed" alert — expected).
