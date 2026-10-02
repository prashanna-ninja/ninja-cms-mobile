# 08 — App Icons (per-org home-screen icon)

Built 2026-10-02.

> **What:** the phone's **home-screen icon** follows the organisation. It's the white CMS NINJA
> wordmark on the org's colour, with Ninja CMS blue by default. After sign-in it switches to the active
> org's icon, and on sign-out it goes back to the default.

## 1. The icons (generated in code)

![preview](../assets/app-icons/preview.png)

| Name | Org | Colour |
|---|---|---|
| *(default)* | Ninja CMS (signed out / no org / no match) | `#1A4DB3` (login-page blue) |
| `Independent` | An Independent AFSL | `#71AF43` |
| `Beryllium` | Beryllium Advisers | `#8F2A2A` |
| `Cobalt` | Cobalt Advisers | `#00499A` |
| `DominicJames` | Dominic James | `#2D3240` |
| `ApprovalEdge` | The Approval Edge | `#000000` |
| `WhatIf` | What If Advice + Accounting | `#FF8900` |

The colours were sampled from the web org picker (the card background is `Advice.colorTheme`).

**One source of truth:** `src/constants/app-icons.json`. It's read by:

| Reader | Does |
|---|---|
| `scripts/generate-app-icons.mjs` | renders the PNGs with sharp → `assets/app-icons/` |
| `app.config.ts` | registers the alternates with `expo-alternate-app-icons` (on top of `app.json`) |
| `src/lib/app-icon.ts` | picks the icon for the active org at runtime |

**Generated files** (`node scripts/generate-app-icons.mjs`, committed):

| File | Use |
|---|---|
| `<Name>.png` (1024², opaque) | iOS icon. `Default.png` is the main app icon (`app.json` `icon`). |
| `adaptive-foreground.png` (1024², transparent) | Android adaptive foreground, shared by every icon. Only `backgroundColor` changes. |
| `monochrome.png` | Android 13+ themed icon |
| `favicon.png` | web |
| `preview.png` | contact sheet for review (above) |

Sizing: the wordmark is 62% wide on iOS (rounded-square mask) and 52% on the Android foreground, so it
stays inside the 66% adaptive-icon safe zone under any launcher mask.

This also **replaced the Expo template art**: the app icon, adaptive icon, favicon, and the splash (now the
CMS NINJA wordmark on navy `#0B2D6F`, 180dp).

## 2. Which icon an org gets

Native apps can't paint a new icon at runtime; every alternate is baked in at build time. So
`appIconForColor(org.colorTheme)` picks the **nearest preset by RGB distance**:
- within **48** → that preset (absorbs small CMS tweaks, e.g. `#6DAE43` → Independent, entity
  `#6B1424` → Beryllium)
- closer to the default blue than to any alternate, too far from all of them, or no/invalid colour → **default**

Checked 2026-10-02: Cobalt's entity navy `#0B2D6F` → default; CLS grey `#8A8585` → default; pale colours →
default. ⚠️ The AIAFSL navy `#1E3A5F` → `DominicJames` (nearest dark preset, distance 35). Add an AIAFSL preset
if it needs its own icon.

**A new org that needs its own icon:** add `{ name, label, color }` to `app-icons.json` → run the generator →
**rebuild the app** (dev client / store build). Without a rebuild, the org gets the nearest existing icon.

## 3. When it switches (`src/hooks/use-org-app-icon.ts`, mounted in the root layout)

| State | Icon |
|---|---|
| signed out, booting, no org chosen yet | default |
| signed in + active org | that org's icon |
| switch org | the new org's icon |

- **iOS:** switches immediately. iOS shows its own one-line alert ("You have changed the icon for Ninja
  CMS"). That's the OS and can't be suppressed.
- **Android:** switches **when the app next goes to the background**. The library disables the launcher alias
  the app is running under (`MainActivity` → `MainActivityBeryllium`). Doing that in the foreground can
  close the app on some launchers, and the library needs the activity to still exist (`currentActivity!!`),
  which it does at the background transition. Some launchers take a few seconds to redraw.
- It never switches during cold start before the stored session has loaded, so the icon doesn't flicker.
- Every call is wrapped in try/catch. The icon is cosmetic and must never break the app.

## 4. ⚠️ Needs a development build

`expo-alternate-app-icons` is a **native** module. **It is not in Expo Go.** In Expo Go and on web,
`canChangeAppIcon()` is false and everything is a no-op; the app works normally with the default icon.
To see the icons switch:

**Test on a Mac in the iOS Simulator** (alternate icons work there — Apple's `setAlternateIconName`):

```bash
# one-time: Xcode (from the App Store) + its command-line tools, CocoaPods (`brew install cocoapods`)
npm install
npm run ios:dev          # = npx expo run:ios → prebuilds ios/, pod install, builds, installs on the Simulator, starts Metro
```

Then: sign in → pick an org → press **Cmd+Shift+H** (Home) and the icon has changed (iOS also showed its
"You have changed the icon…" alert). Sign out → back to blue. Next time just run `npx expo start` and open
the installed **Ninja CMS** app (not Expo Go) — rebuild with `npm run ios:dev` only when native config
changes (e.g. `app-icons.json`).

⚠️ `npx expo start` → `i` / Expo Go **can't** switch icons. With `expo-dev-client` installed, `expo start`
targets the dev build by default; press **`s`** in the Metro terminal to switch to Expo Go for quick UI work.

**Diagnose from the Metro log** (dev only): every change prints
`[app-icon] org=Beryllium Advisers colour=#8F2A2A → icon=Beryllium` — and `NOT APPLIED: no native module`
when running in Expo Go. `icon=Default` for a real org means its colour isn't close to any preset (§2).

Android: `npm run android:dev` (needs Android Studio / SDK), or EAS (no local SDK):
`npx eas-cli@latest build -p android --profile development` once eas.json exists.

Verified 2026-10-02 with `npx expo prebuild` (then deleted the generated `android/`): 6 `activity-alias`
entries (`.MainActivityIndependent` … `.MainActivityWhatIf`) + adaptive/monochrome mipmaps for each.
(iOS prebuild doesn't run on Windows. The iOS config is generated by the same plugin at EAS build time.)
⚠️ **Not yet seen switching on a device.**

## 5. Gotchas

- ⚠️ **Stale native project (hit 2026-10-02 on the Mac):** `npx expo run:ios` only generates `ios/` if it
  doesn't exist. An `ios/` from before the icon work keeps the **Expo template icon** and has **no
  `expo-alternate-app-icons` pod**, so the dev build logs `NOT APPLIED: native module unavailable (…)` even
  though it isn't Expo Go. Fix: `npx expo prebuild --clean --platform ios` → `npx expo run:ios`
  (Android: `--platform android`). Do this after **any** change to `app.json` / `app.config.ts` /
  `app-icons.json` / native packages. `ios/` and `android/` are git-ignored (CNG), so `--clean` is safe.
- The simulator caches home-screen icons; if the old icon lingers after a clean build, delete the app
  from the simulator (long-press → Remove App) and run again.

- `npx expo prebuild` rewrites the `android`/`ios` scripts in `package.json` to `expo run:*`. It was
  reverted. Check `git diff package.json` after any prebuild.
- The library generates a TypeScript union of icon names only at prebuild, so `setAppIcon` casts the
  name. Names always come from `app-icons.json`.
- Changing the shared wordmark (`assets/images/ninja-cms-logo.png`) → re-run the generator.
