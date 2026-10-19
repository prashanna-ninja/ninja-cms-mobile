# 16 — App Store + Google Play submission pack

Updated 2026-10-19. It follows the Ninja CRM submission, which passed review
(`ref/ninja-crm-mobile/docs/APP-STORE-REVIEW-NOTES.md`, `apple-review-reply.txt`).

What's different from the CRM:
- **Email + password sign-in**, so there's no reviewer bypass, just a demo account.
- **Larger privacy labels**, because the fact find holds financial details and TFNs.
- **The website is live:** ninjacms.com.au (landing page, support, privacy).

The privacy policy text is in [site/PRIVACY-POLICY.md](site/PRIVACY-POLICY.md). Why each part is there:
[15-PRIVACY-POLICY.md](15-PRIVACY-POLICY.md).

> ⚠️ **Three things must always agree:** the policy, the privacy labels (§4) and the review notes (§3). Apple and
> Google cross-check them. Change all three together, and never word the notes as if deletion completes in the app.

---

## 0. Fixed facts

| Field | Value |
|---|---|
| App name | **Ninja CMS** |
| Bundle ID / package | `com.adviceninja.ninjacms` (iOS + Android) |
| Version | `1.0.0` (`app.json`; EAS sets the build number) |
| Platforms | iPhone only (`supportsTablet: false`), Android phones |
| Seller / copyright | **© 2026 Advice Ninja Pty Ltd**. This must match the developer account's legal entity exactly. |
| Primary / secondary category | **Business** / **Productivity** |
| Marketing URL | `https://ninjacms.com.au` |
| Support URL | `https://ninjacms.com.au/support` |
| Privacy Policy URL | `https://ninjacms.com.au/privacy` |
| Account-deletion URL (Play) | `https://ninjacms.com.au/privacy#delete-account` |
| Support email | `support@ninjacms.com.au` (also the in-app delete-account address, `SUPPORT_EMAIL`) |
| API the app talks to | `https://login.cobaltlicenseesolutions.com.au` (the Ninja CMS backend) |
| In-app links | Settings → **Help & support** and **Privacy policy** (in-app browser), **Delete account** |

---

## 1. Store listing copy

**Subtitle** (iOS, 30 characters max):
```
Your adviser portal, on the go
```

**Short description** (Google Play, 80 max):
```
Your licensee's notices, client records, workflows and revenue, on your phone.
```

**Promotional text** (iOS, 170 max; it can be changed without a review):
```
Notices, client records, fact finds, workflows and revenue from your adviser portal, in your pocket. Your organisation's colours and logo as soon as you sign in.
```

**Keywords** (iOS, 100 max, comma-separated with no spaces; don't repeat words already in the name or subtitle):
```
financial,planner,advisor,practice,licensee,AFSL,clients,fact find,workflow,revenue,paraplanner
```

**Description** (iOS + Play full description):
```
Ninja CMS puts your adviser portal on your phone.

Made for Australian financial services licensees and the advisers and staff who work with them, Ninja CMS brings the portal you use at your desk with you: between client meetings, on the road, or at home.

NOTICES
Read your licensee's announcements and updates, with images, links and documents.

CLIENTS
Search your client records and find everything in one place: contact details, the fact find, files, workflows, revenue, annual consent and ongoing reviews, and the full activity history. Add a client, update their details, fill in the fact find section by section, and upload documents from your phone.

WORKFLOWS
See the boards your practice runs on, such as onboarding and annual reviews, and move clients from stage to stage.

REVENUE
Check your revenue month by month, and match revenue accounts to the right clients.

YOUR ORGANISATION
The app takes on your organisation's colours and logo as soon as you sign in. If you belong to more than one organisation, switch between them in Settings.

PRIVATE BY DESIGN
No ads, no analytics, no tracking. The app only reads files you choose to upload, and your sign-in is kept in your device's secure storage.

Ninja CMS is for organisations that use the Ninja CMS adviser portal. Accounts are provided by your organisation; there is no public sign-up.

Support: support@ninjacms.com.au
```

**What's New** (1.0.0):
```
The first release of Ninja CMS for iPhone.
```
On Play, use "…for Android".

⚠️ **Never name a licensee or practice** (Cobalt, Beryllium, AIAFSL, CLS, …) in the listing, screenshots or notes.
It makes the app look like one company's internal tool (risk R1).

---

## 2. Screenshots

- **iOS:** 6.9″ iPhone, 1320×2868 (or 1290×2796). 3 to 10 shots. No iPad, because the app is iPhone only.
- **Play:** at least 2 phone screenshots (16:9 or 9:16, at least 1080px), an app icon 512×512, and a feature
  graphic 1024×500 (the navy gradient with the white wordmark, from `docs/site/assets`).
- **Demo organisation only, with fictitious names.** No real clients and no real TFNs. Real client data in
  screenshots is what forced the CRM to ship 1.0.1.
- Suggested order: Dashboard (notices) → Clients list → Client record (Overview) → Fact find → Workflow board →
  Revenue → Settings.
- The first three must be real app screens with data, not sign-in or splash.

---

## 3. App Review Information (App Store Connect → version → App Review)

- **Sign-in required:** Yes
- **User name:** `[the demo reviewer email]` · **Password:** `[its password]`. Create both on the CMS (§8).
- **Contact:** your first and last name, phone and email. Apple calls this person if something blocks review.
- **Attachment (recommended, as the CRM did):** a 1–2 minute screen recording on a real iPhone of sign-in →
  choose an organisation → each tab → Settings → Delete account (stop at the email screen, don't send it).

**Notes** (paste as is, with the email filled in):

```
1. SIGNING IN
Sign-in is email and password. Use the demo account in the Sign-In Information fields. After signing in, choose "[Demo organisation name]" if a list of organisations appears. The account belongs to a demo organisation with fictitious clients, workflows, notices and revenue, so every screen has data. It does not expire. No setup or sample files are needed.

2. WHAT THE APP IS AND WHO USES IT
Ninja CMS is the mobile app for the Ninja CMS adviser portal, a commercial SaaS platform used by Australian financial services licensees and the independent advice practices that work with them. It is not an internal app for a single company. Each organisation provisions logins for its own advisers and staff, which is why there is no public sign-up, the same way any team product issues seats to its customers' staff. After sign-in the app shows the organisation's own colours and logo.

3. MAIN FEATURES (five tabs)
- Dashboard: the organisation's notices and announcements.
- Clients: searchable client records. Tap a client for Overview, Fact find, Files, Workflows, Revenue, Ongoing client and Activity. "+" adds a client.
- Workflows: the practice's boards. Open one and swipe between stages; move a client to another stage.
- Revenue: the adviser's revenue by month, and Map clients (matching revenue accounts to clients).
- Settings: account, switch organisation, help and support, privacy policy, sign out, delete account.

4. EXTERNAL SERVICES
The app talks only to our own API (the Ninja CMS backend at login.cobaltlicenseesolutions.com.au, operated by Advice Ninja Pty Ltd) and embeds no third-party SDKs: no analytics, crash reporting, advertising or tracking.
- Vercel: hosts the API.
- Neon: managed PostgreSQL database.
- Cloudflare R2 and Amazon S3: storage for uploaded documents and images.
- Resend: account emails (invitations, password resets).
- Better Auth: open-source sign-in library inside our API; no data leaves us.
- Expo (EAS): build tooling only, not used at runtime.
No payment processors, AI services or data providers.

5. PERMISSIONS
The app requests no device permissions: no camera, photos, contacts, location, microphone, notifications or tracking. Files are uploaded only through the system document picker, which gives the app the single file the user chooses.

6. REGIONAL DIFFERENCES
The app works the same in every region, in English (Australian), with Australian dollars, phone formats and dd/mm/yyyy dates.

7. REGULATED INDUSTRY AND PROTECTED MATERIAL
No. Ninja CMS is business software sold to financial services organisations. No financial advice is given, no product offered, no transaction executed and no money held or moved. Every user is staff of a subscribing organisation; there are no consumer users. Regulated activity happens outside the app, under our customers' own licences.
Protected third-party material: none. Fonts are SIL OFL, icons lucide (ISC), other libraries MIT or Apache-2.0. All other content is our own interface or content entered by our customers, who own it.

8. ACCOUNT DELETION
Available at Settings > Delete account. Tapping it shows a confirmation, then opens a pre-filled email to our support team (support@ninjacms.com.au). Sending it submits a deletion request for the signed-in account and its personal data. We action it and confirm by email. The same steps are in our privacy policy: https://ninjacms.com.au/privacy#delete-account
It is a request rather than an immediate in-app action for a specific reason. Users cannot create their own accounts: every login is provisioned by the user's organisation. The client records, fact finds, documents and notes in the app belong to that organisation, which holds them as its business records and may be legally required to keep them. A staff member deleting their own login cannot decide on their own what happens to those records. Processing the request lets us delete that person's account data while the organisation's records stay with the organisation that owns them.
```

⚠️ **Section 8 must stay exactly this honest.** The user must send the email, and there's no time promise. This
is the wording that got the CRM approved.

---

## 4. App Privacy (App Store Connect → App Privacy)

- **Data collection:** Yes.
- For **every** type below, choose: purpose **App Functionality** · **Linked to the user's identity: Yes** ·
  **Used for tracking: No**.

| Category | Type to tick | What it is in the app |
|---|---|---|
| Contact Info | **Name** | The user's account, client records |
| Contact Info | **Email Address** | The user's account, client records |
| Contact Info | **Phone Number** | Client records |
| Contact Info | **Physical Address** | Client records |
| Financial Info | **Other Financial Info** | Fact find (income, expenses, assets, liabilities, super), revenue and commissions |
| User Content | **Other User Content** | Notes, fact-find answers, uploaded documents, workflow cards |
| Identifiers | **User ID** | Account ID |
| Other Data | **Other Data Types** | Date of birth, TFN, employment, dependants, estate planning |

**Do not tick:**
- **Contacts:** that means the phone's address book, which the app never reads.
- **Photos or Videos:** the document picker only gives the app the file the user picks.
- **Sensitive Info:** Apple means health, race, religion, biometrics and similar. The fact find has none.
- **Health, Location, Browsing History, Search History, Usage Data, Diagnostics, Purchases, Payment Info, Credit
  Info:** none of these are collected.
- **Tracking:** No, everywhere. The app has no analytics, crash or ads SDKs. Keep it that way, or this changes.

---

## 5. Permissions: what the app asks for

**iOS: none.** The build has no `NS…UsageDescription` strings, because the app doesn't use the camera, photos,
contacts, location, microphone, Face ID, Bluetooth, local network, push or tracking (ATT). Notes:
- **The document picker** (Files → Upload) needs no permission. The system shows the picker and hands over one
  file. The app has no iCloud entitlement.
- **The share sheet** (opening a stored file, fact-find PDF) is a system sheet, so no permission is needed.
- **Keychain** (session via expo-secure-store) needs no permission. Face ID is off (`faceIDPermission: false`).
- **Alternate app icon** (per-org icon): no permission. iOS shows its own "You have changed the icon" alert, which
  is expected.
- **Encryption export:** `ITSAppUsesNonExemptEncryption: false`, so App Store Connect won't ask.
- **Privacy manifest:** Expo SDK 57 builds `PrivacyInfo.xcprivacy` from the packages. If Apple emails an
  **ITMS-91053** warning ("missing API declaration") after upload, add the named reasons under
  `ios.privacyManifests` in `app.json` and rebuild.

**Android: only `INTERNET`** (plus `VIBRATE`, which React Native adds; it's a normal permission with no prompt).
Since 2026-10-19, `app.json` → `android.blockedPermissions` removes `SYSTEM_ALERT_WINDOW`,
`READ_EXTERNAL_STORAGE` and `WRITE_EXTERNAL_STORAGE`, which the template and libraries add but the app doesn't
need. Check this in the release manifest after the first EAS build. No runtime permission prompts, and no
sensitive-permission declarations in Play Console.

---

## 6. Other App Store Connect questions

| Question | Answer |
|---|---|
| Age rating questionnaire | **None / No** to every content question. Unrestricted web access: **No** (links open specific pages in an in-app browser). User-generated content shared publicly: **No** (records are private to the organisation). Messaging or chat: **No**. Gambling, contests, loot boxes: **No**. The expected result is **4+**. The policy's "not for under 18" is about who gets accounts, not the content rating. |
| Content rights: "contains, shows or accesses third-party content?" | **Yes**, with the rights. It shows content that customer organisations publish to their own users (notices, logos), under our customer agreements. |
| "Highly regulated industry?" | **No**, documentation blank. Don't answer Yes: Apple would then ask Advice Ninja for an AFSL, which belongs to the customers. |
| Sign in with Apple required? | **No.** Guideline 4.8 applies only to apps with third-party or social sign-in. Ours is our own email and password. |
| In-app purchases / subscriptions | None. The service is licensed to organisations outside the app, which is which Guideline 3.1.3(c) (enterprise services) and 3.1.3(f) (free companion to a paid web tool) allow. There is no purchase or call to buy in the app. |
| Distribution | Public App Store. **Manually release this version.** |
| Pricing | Free, all countries (or Australia only; see R1). |

---

## 7. Google Play Console (App content)

| Section | Answer |
|---|---|
| Privacy policy | `https://ninjacms.com.au/privacy` |
| **App access** | "All or some functionality is restricted" → add the demo credentials: username, password, and "Choose [Demo organisation] after signing in". |
| Ads | **No ads** |
| Content rating (IARC) | Category **Utility, productivity, communication or other**. All content questions **No**, user interaction / sharing **No** → **Everyone / PEGI 3**. |
| Target audience | **18 and over** only. The app is not designed for children. |
| News app | No |
| Government app | No |
| **Financial features** | "My app doesn't provide any financial features." It's record-keeping: no loans, payments, trading, banking or crypto. |
| Health apps | No |
| Data safety → collects or shares | **Collects: Yes. Shares: No** (service providers that process on our behalf don't count as sharing). |
| Data safety → encrypted in transit | Yes |
| Data safety → deletion | "Users can request that data be deleted": Yes. URL: `https://ninjacms.com.au/privacy#delete-account` |
| Data safety → account creation | "My app does not allow users to create an account" (accounts are provisioned). Play still requires the deletion URL above. |
| Data types (all *Collected, not shared, required, App functionality + Account management*) | **Personal info:** name, email address, phone number, address, other info (date of birth, TFN) · **Financial info:** other financial info · **Files and docs** · **App activity:** other user-generated content (notes) · **Device or other IDs:** No |
| Testing track | Play requires **closed testing with 12+ testers for 14 days** before production on new personal developer accounts. Check whether this applies to our account (organisation accounts are usually exempt). |

---

## 8. Pre-submit checklist

**App (repo)**
- [x] Settings → Help & support + Privacy policy (in-app browser), Delete account → `support@ninjacms.com.au` (2026-10-19)
- [x] Android release manifest trimmed to `INTERNET` (`blockedPermissions`, 2026-10-19). ⚠️ Rebuild the dev client:
      `npx expo prebuild --clean && npx expo run:android`.
- [x] Sign-in copy is generic, with no customer names. The splash and default icon are Ninja CMS blue.
- [ ] tsc, lint and `npx expo-doctor` clean; `app.json` version committed **before** `eas build` (an uncommitted bump
      ships the old version: the CRM's ITMS-90062).
- [ ] Tested on a **fresh install of the exact production build** (TestFlight), signed in as the reviewer.
- [ ] Tag it: `git tag v1.0.0 <sha> && git push origin v1.0.0`.

**CMS backend + demo data** (must be true when the reviewer opens the app)
- [ ] The reviewer user exists, has a password set, isn't banned, and has the **adviser** role, so Clients, Workflows
      and Revenue show. They hide on 403, and an empty tab invites a 2.1 rejection.
- [ ] A **demo organisation** with a neutral name (for example "Demo Advice Practice"), its own colour and logo, and:
      at least 2 notices; about 10 fictitious clients (one with a full fact find, files, a workflow card,
      consent set up and a review); 1–2 workflow boards with cards in several stages; revenue rows over several
      months, some mapped. **No real TFNs**: leave the field empty or use an obviously fake value.
- [ ] Optional: a second demo org, so the organisation picker and Settings → Switch are visible.
- [ ] Unauthenticated API calls return 401, not 500. Production has `expo()` + `ninjacms://` trusted (docs/10 §1).
- [ ] Nobody changes or deletes the demo data during review.

**App Store Connect**
- [ ] App Information: name, subtitle, categories, Privacy Policy URL, content rights, age rating.
- [ ] Version: screenshots (§2), promotional text, description, keywords, support and marketing URLs, copyright,
      What's New.
- [ ] App Privacy (§4) published.
- [ ] App Review: sign-in details, contact, notes (§3), screen recording.
- [ ] Build selected, export compliance auto-answered, **Manually release**.

**Google Play** (when Android goes in)
- [ ] App content sections (§7) all green; store listing (§1, §2); internal → closed testing → production.

**After approval**
- [ ] Update the website hero from "Coming soon" to the real store badges and links (docs/site).
- [ ] Keep the reviewer account working for future updates; Apple reviews every version.

---

## 9. Risks (decide, don't discover)

| # | Risk | What to do |
|---|---|---|
| R1 | **Looks single-company (3.2 / 4.2 → "Custom App")**, because the API is on `cobaltlicenseesolutions.com.au`. | The listing, notes and site name no customer. If Apple still asks, answer like the CRM did (licensed to several independent organisations). If they insist, **Unlisted** distribution is an acceptable fallback. A neutral API host (`api.ninjacms.com.au`) would remove the tell. |
| R2 | **Deletion is by email** (5.1.1(v) says apps "should not require… send an email"). | The CRM passed with this exact justification. If rejected: a signed-in `DELETE /api/me/account` on the CMS → the app calls it, then signs out. Update §3 section 8 and the policy §9 together. |
| R3 | **TFNs** | Policy §5 covers them. Never show one in screenshots. |
| R4 | **Empty or hidden tabs** for the reviewer | Demo org + adviser role (§8). |
| R5 | **Drift** between the policy, labels and notes | One owner. Change all three together. |
