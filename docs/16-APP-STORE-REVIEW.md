# 16 — App Store / Google Play review (submission copy)

Written 2026-10-13. It follows the Ninja CRM app, which passed review (`ref/ninja-crm-mobile/docs/APP-STORE-REVIEW-NOTES.md`
and `apple-review-reply.txt`). What's different here:
- Ninja CMS signs in with **email + password**, so there's **no reviewer bypass**. Apple gets a normal demo account.
- The fact find holds **financial details and TFNs**, so the App Privacy labels are larger.
- The API is on a licensee-branded domain (`login.cobaltlicenseesolutions.com.au`). See risk R1 in §7.

The privacy policy text is in [15-PRIVACY-POLICY.md](15-PRIVACY-POLICY.md).

---

## 1. App Review notes — paste into *App Review Information → Notes*

> **What this app is**
>
> Ninja CMS is the mobile companion to the Ninja CMS adviser portal, a commercial SaaS platform used by
> several Australian financial services licensees and the independent advice practices that work with them.
> It is not an internal app for a single company. Each organisation provisions logins for its own advisers and
> staff, which is why there is no public sign-up.
>
> Advisers use it to read their licensee's notices, look up and update client records and fact finds, move
> clients through workflow boards, and check their revenue, all from their phone.
>
> **Signing in for review**
>
> Sign-in is email and password. Please use this demo account:
>
> Email: **[TO CONFIRM: reviewer email]**
> Password: (in the Password field of this form)
>
> The account belongs to a demo organisation with sample (fictitious) clients, workflows, notices and revenue, so
> every screen has data. It does not expire.
>
> **Account deletion**
>
> Account deletion is in the app at **Settings → Delete account**. Tapping it shows a confirmation, then opens a
> pre-filled email to our support team. Sending it submits a deletion request for the signed-in account and its
> personal data. Our team actions the request and confirms the deletion by email.
>
> It is a request rather than an immediate in-app deletion for a specific reason. Users cannot create their own
> accounts: every login is provisioned by the user's organisation. The client records, fact finds, documents and
> notes in the app belong to that organisation, which holds them as its business records and may be legally
> required to keep them. A user deleting their own login can't decide on their own what happens to those
> records. Processing the request lets us delete the person's account data while the organisation's records are
> handled correctly.
>
> **Data**
>
> The app collects the user's name and email for sign-in and shows the organisation's client records. It has no
> analytics, advertising or tracking SDKs. See our privacy policy.

⚠️ **Describe the email step exactly as above.** The CRM lesson: never word it as if deletion completes in the
app. Don't add a time promise (for example "within 24 hours").

---

## 2. Follow-up questions (Q3–Q7) — paste if Apple asks

### Q3 — Functions, audience, problem, value

> Ninja CMS is the mobile app for the Ninja CMS adviser portal, used by Australian financial services licensees
> and their advice practices. Each organisation provisions logins for its own people; there is no public sign-up.
>
> **Who uses it:** financial advisers and their support staff (paraplanners, client-services and practice
> staff).
>
> **What it does (five tabs):**
> • **Dashboard:** the licensee's notices and announcements, in the organisation's branding.
> • **Clients:** a searchable list of the organisation's client records. Open one for Overview, Fact find,
>   Files, Workflows, Revenue, Ongoing client (annual consent and review) and Activity. Users can add and edit
>   clients, fill in the fact find, upload documents and add a client to a workflow.
> • **Workflows:** the practice's boards (for example onboarding or annual review). Move a client card between
>   stages.
> • **Revenue:** the adviser's own revenue statement by month, and matching revenue accounts to clients.
> • **Settings:** account details, switch organisation, sign out and delete account.
>
> **The problem it solves:** advisers run their practice from the web portal, which is a desktop tool. Between
> client meetings they can't check a client's details, see where a client is in a workflow, or catch up on
> licensee notices.
>
> **The value:** the same records and boards on the phone, so details are checked and updated when they're
> needed rather than later at a desk.

### Q4 — Setup, access, credentials

> No setup and no sample files are needed. Sign in with the demo account in the notes.
> • If the account belongs to more than one organisation, pick one on the next screen. You can switch later in
>   Settings.
> • **Dashboard** opens first. **Clients**: tap a client, then use the section tabs. **+** adds a client.
>   **Workflows**: open a board and swipe between stages. **Revenue**: My Revenue and Map clients.
>   **Settings**: account, sign out, delete account.

### Q5 — External services

> The app talks only to our own API at **https://login.cobaltlicenseesolutions.com.au** (the Ninja CMS
> backend, operated by Advice Ninja Pty Ltd). It contains **no third-party SDKs**: no analytics, crash reporting,
> advertising or tracking.
>
> | Service | Provider | Used for |
> |---|---|---|
> | Ninja CMS API | Advice Ninja Pty Ltd, hosted on Vercel | All app data |
> | Vercel | Vercel Inc. | Hosting the API |
> | [TO CONFIRM: database] | [provider] | Managed PostgreSQL |
> | Cloudflare R2 | Cloudflare, Inc. | Storing uploaded documents and images |
> | Better Auth | Open-source library inside our API | Sign-in and sessions; no data leaves us |
> | Resend | Resend, Inc. | Account emails (invitations, password reset) |
> | Expo (EAS) | Expo | Build tooling only; not in the shipped app |
>
> No payment processors, no AI services, no third-party data providers. All client information is entered by
> our customers.

⚠️ This table must match §6 of the privacy policy. If S3 is still in use, or Entrust / Crazytel are named there,
make sure the two don't contradict each other. The policy can name more providers than this table, because the
policy covers web-only features too.

### Q6 — Regional differences

> The app works the same in every region: no geo-gated features, no region-specific content and no
> localisation. It is in English (Australian), with Australian dollars, phone formats and dd/mm/yyyy dates.

### Q7 — Regulated industry / third-party material

**Answer NO and leave the documentation blank** (same reasoning as the CRM). Guideline 5.1.1(ix) covers apps
that *themselves* provide financial services. Ninja CMS is business software for licensees. No advice is given
in the app, no product is offered, no transaction is made and no money is held. Answering YES would make Apple
ask Advice Ninja for an AFSL and a letter of authorisation. Those licences belong to the customers.

> No. Ninja CMS is business software sold to financial services organisations. In the app no financial advice is
> given, no financial product is offered, no transaction is executed and no money is held or moved. Every user is
> a staff member of a subscribing organisation; there are no consumer users. The regulated activity happens
> outside the app, under our customers' own licences.
>
> Protected third-party material: none. Fonts are SIL Open Font License (Bricolage Grotesque), icons are
> lucide (ISC), and other libraries are MIT or Apache-2.0. All other content is our own interface or content
> entered by our customers, who own it. Organisation logos are shown with permission from those organisations.

---

## 3. App Privacy labels (App Store Connect → App Privacy)

"Data collected" means it leaves the device and is kept, which is true of everything shown in the app. For
**every** type below choose: purpose **App Functionality** · **Linked to the user** · **Not used for tracking**.

| Apple category | Type | Why |
|---|---|---|
| Contact Info | **Name**, **Email Address** | The user's account + client records |
| Contact Info | **Phone Number**, **Physical Address** | Client records |
| Financial Info | **Other Financial Info** | Fact find (income, assets, liabilities, super), revenue/commissions |
| User Content | **Other User Content** | Notes, fact-find answers, uploaded documents |
| Identifiers | **User ID** | Account id |
| Other Data | **Other Data Types** | Date of birth, TFN, employment, dependants, estate planning |

Do **not** declare:
- **Contacts**: that means the device address book, which the app never reads.
- **Photos or Videos**: the app uses the document picker only, and only for files the user picks.
- **Sensitive Info**: Apple means race, health, religion, biometrics and similar. The fact find has none of
  these. Re-check if health or insurance-underwriting fields are ever added.
- **Usage Data / Diagnostics / Location / Purchases**: none are collected.
- **Tracking:** No.

## 4. Google Play — Data safety + deletion

Same data as §3, with *Collected · Not shared · Required · Purpose: App functionality / Account management*.
Also declare:
- **Encrypted in transit:** Yes.
- **Users can request deletion:** Yes. The delete-account URL is the policy's `#delete-account` section (or a
  `/account-deletion` page). **Play requires a URL that works without the app.**
- Play maps the categories a bit differently: Personal info (name, email, address, phone, other info), Financial
  info (other), Files and docs.

---

## 5. Pre-submit checklist

**Repo (the app):**
- [ ] **Settings → Privacy policy row** that opens the published URL in the in-app browser (5.1.1(i): the policy
      must also be reachable *inside* the app). Add `PRIVACY_POLICY_URL` next to `SUPPORT_EMAIL` in
      `src/constants/env.ts`. Not built yet, because the page has to be live first.
- [x] **`SUPPORT_EMAIL`** = `support@ninjacms.com.au` (2026-10-19), the same address as the policy.
- [ ] Delete-account alert text still matches the policy and §1.
- [ ] No single customer's name on sign-in / splash (checked 2026-10-13: the copy is generic ✅). Org logos
      appear only after sign-in.
- [ ] `ITSAppUsesNonExemptEncryption: false` ✅, `supportsTablet: false` ✅, no Face ID string ✅.
- [ ] tsc, lint, expo-doctor clean; `app.json` version committed; tag the release (`git tag v1.0.0`).

**CMS backend (must be true when the reviewer opens the app):**
- [ ] ninjacms.com.au live with `/`, `/support`, `/privacy`, `/privacy#delete-account` (§6), with no `[TO CONFIRM]` left.
- [ ] Demo organisation + reviewer user (adviser role) with **fictitious** clients, a fact find, files, a workflow
      board, notices and revenue rows, so no tab is empty or hidden (a 2.1 risk). Clients and Revenue hide on
      403, so the role must allow them.
- [ ] The reviewer user has a password set, is not banned, and has a role that lands on the portal.
- [ ] Unauthenticated API calls return 401, not 500.

**App Store Connect:**
- [ ] Privacy Policy URL · App Privacy (§3) · age rating · Notes (§1) + demo account in the Sign-in fields.
- [ ] Screenshots from the **demo org only**. No real client data (the CRM had to ship 1.0.1 because of this).
- [ ] Marketing and Support URLs work and describe this product.
- [ ] Copyright = the developer account's legal entity, exactly.
- [ ] *Manually release this version.*

---

## 6. Website: ninjacms.com.au (replaces the CMS /privacy page idea, 2026-10-19)

The policy, support and marketing pages are a separate small Next.js site at **https://ninjacms.com.au**. It is
built by an agent from the brief in [site/](site/README.md) (prompt, design, page copy, policy text, assets).

| App Store / Play field | URL |
|---|---|
| Marketing URL | `https://ninjacms.com.au` |
| Support URL | `https://ninjacms.com.au/support` |
| Privacy Policy URL | `https://ninjacms.com.au/privacy` |
| Play account-deletion URL | `https://ninjacms.com.au/privacy#delete-account` |

Later and optional (the better fix for R2): a signed-in `DELETE /api/me/account` on the CMS, so the app can switch
from email to real deletion.

---

## 7. Risks (decide, don't discover)

| # | Risk | What to do |
|---|---|---|
| R1 | **Looks single-company (3.2 / 4.2 → "use a Custom App").** The API domain is `cobaltlicenseesolutions.com.au` and the notes name licensee groups that may be related companies. | Make the notes say "several licensees and independent practices" only if that's true. If all the organisations are one corporate group, Apple may push for **Unlisted** or **Custom App** distribution, which is a valid outcome. Decide before submitting. A neutral API domain (for example `cms.adviceninja.com.au`) would help. |
| R2 | **Deletion is a request by email** (5.1.1(v) says apps shouldn't require an email). | Accepted for the CRM, and the CRM passed with this exact justification. If rejected: ship CMS §6 step 6 and switch the app to it. Update §1 to match. |
| R3 | **TFNs in the fact find.** | Covered by policy §5. Keep TFN visible only to roles the CMS allows; never put one in screenshots. |
| R4 | **Empty tabs for the reviewer** (Clients / Revenue hide on 403). | Seeded demo org with the right role (§5). |
| R5 | **Policy vs labels vs notes drift.** | One owner. Change all three together. |
