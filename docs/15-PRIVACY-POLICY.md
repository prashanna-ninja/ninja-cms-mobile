# 15 — Privacy policy (publish copy)

Written 2026-10-13 for the App Store / Google Play submission, in the same shape as the Ninja CRM policy
(which passed review). Facts were checked against this repo and `ref/cms` (HEAD `a3876ca`).

**The policy text now lives in [site/PRIVACY-POLICY.md](site/PRIVACY-POLICY.md)** (2026-10-19). It is published at
**https://ninjacms.com.au/privacy** by the Ninja CMS website (brief: [site/README.md](site/README.md)), with
**support@ninjacms.com.au** as the contact. Edit the policy there only, so there's one copy.

- Privacy Policy URL (App Store + Play): `https://ninjacms.com.au/privacy`
- Account-deletion URL (Play): `https://ninjacms.com.au/privacy#delete-account` (or `/account-deletion`, which redirects there)

⚠️ **Keep it in step with the App Privacy labels (16 §3), the review notes (16 §1) and the app.** Apple and
Google cross-check them. If the app gains a feature that collects something new (camera, push, location, SMS,
analytics), update all three before that build is submitted.

⚠️ **Don't promise what we can't hold every time.** For example, don't add "deleted within 24 hours". The 30 days
is the Privacy Act's usual "reasonable period".

---

## Why each part is there (for us, not for publishing)

| Section | Why |
|---|---|
| §2 roles + "contact your adviser" | Same justification as the CRM's deletion answer: the Organisation owns the client records. It also keeps the request-based deletion (§9) consistent with the review notes. |
| §3c document picker only | True: the app has no camera, photos, contacts, location or push. It also lets the App Privacy labels avoid "Photos" and "Contacts". |
| §3 "no analytics…" | True today (package.json has no analytics, crash or ads SDKs). It backs "Used for Tracking = No". |
| §5 TFN | The fact find has a TFN field (`config.ts`). TFNs have their own legal rule in Australia, and a reviewer reading the fact find may ask about it. |
| §6 providers | Taken from `ref/cms` package.json + .env.example: Vercel (vercel.json), Prisma + Postgres (host not in the repo), R2 + legacy S3 (`FILE_STORAGE`, `@aws-sdk/client-s3`), Resend, Entrust + Crazytel (ID verification, web only). |
| §9 deletion | Mirrors the app's real flow (`settings.tsx`: confirm → `mailto:` to `SUPPORT_EMAIL`). It says plainly that the user must send the email. The CRM lesson: never imply deletion completes in the app. |
| §9 `#delete-account` anchor | Gives Google Play's "delete account URL" a target without needing a second page. |
| §3e website | The site has no cookies, analytics or forms. The site brief forbids them so this stays true. |
