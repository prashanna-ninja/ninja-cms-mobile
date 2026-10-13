# 15 — Privacy policy (publish copy)

Written 2026-10-13 for the App Store / Google Play submission, in the same shape as the Ninja CRM policy
(which passed review). Facts were checked against this repo and `ref/cms` (HEAD `a3876ca`).

**How to use this file**

1. Fill in every `[TO CONFIRM: …]`. Do not publish with one left in.
2. Publish §"Policy text" as a **public page** (no sign-in) on the CMS, for example
   `https://login.cobaltlicenseesolutions.com.au/privacy`. The CMS change is the prompt in
   [16-APP-STORE-REVIEW.md](16-APP-STORE-REVIEW.md) §6.
3. Put that URL in App Store Connect (*App Information → Privacy Policy URL*) and in Google Play
   (*App content → Privacy policy*). Google Play also needs the **delete-account URL** (`…/privacy#delete-account`
   or a separate `/account-deletion` page).
4. The app must also link to it (Guideline 5.1.1(i)): Settings → *Privacy policy*. See 16 §5.

⚠️ **Keep this in step with the App Privacy labels (16 §3), the review notes (16 §1) and the app.** Apple and
Google cross-check them. If the app gains a feature that collects something new (camera, push, location, SMS,
analytics), update all three before that build is submitted.

⚠️ **Don't promise what we can't hold every time.** For example, don't add "deleted within 24 hours". The 30 days
below is the Privacy Act's usual "reasonable period". Change it only if the team agrees.

---

## Policy text

> # Ninja CMS Privacy Policy
>
> **Effective date:** [TO CONFIRM: date published]
>
> This policy explains how **Advice Ninja Pty Ltd** (ABN [TO CONFIRM]) ("**we**", "**us**") handles
> personal information in **Ninja CMS**: the adviser portal at
> login.cobaltlicenseesolutions.com.au and the Ninja CMS mobile app for iOS and Android (together, the
> "**Service**").
>
> We comply with the *Privacy Act 1988* (Cth), including the Australian Privacy Principles (APPs).
>
> ## 1. Who uses Ninja CMS
>
> Ninja CMS is business software. It is licensed to Australian financial services licensees and the advice
> practices that work with them (each an "**Organisation**"). Each Organisation creates the logins for its own
> advisers and staff. There is no public sign-up. The Service is not intended for people under 18.
>
> ## 2. Our role, and the Organisation's role
>
> - **Your account.** We are responsible for the information we hold to run your login.
> - **Information entered by Organisations.** Organisations use the Service to keep records about their own
>   clients. The Organisation decides what is recorded and why, and is responsible for it under its own privacy
>   policy. We store and process those records on the Organisation's behalf, only to provide the Service.
>
> **If you are a client of an adviser** and want to access, correct or delete information about you, please
> contact that adviser or their Organisation first. We will help them respond.
>
> ## 3. What we collect
>
> **a. Account information.** Your name, email address, role, the Organisations you belong to, and your
> password. Your password is stored by the Service as a one-way hash; the mobile app never stores it. When you
> sign in, the app keeps a session token in your device's secure storage (iOS Keychain / Android Keystore) so
> you stay signed in. Signing out removes it.
>
> **b. Records you create or view for your Organisation.** Depending on what your role allows, this can include:
> - client details: names, email addresses, phone numbers, postal addresses, dates of birth, and partner and
>   dependant details;
> - fact-find details: employment, income, expenses, assets and liabilities, superannuation, estate planning,
>   existing insurance and associated entities, and **Tax File Numbers** where the Organisation records them;
> - documents and files uploaded to a client record;
> - notes, workflow cards, consent and review records, and the activity history of a record;
> - revenue and commission records and how they are matched to clients.
>
> **c. Files you choose to upload.** The mobile app only reads a file you pick yourself with your device's
> document picker. It does not access your photo library, camera, contacts, location or microphone.
>
> **d. Technical information.** Our servers record standard request logs (IP address, time, the page or API
> called, and the app or browser version) for security and troubleshooting.
>
> **What we don't collect.** The mobile app contains **no analytics, advertising, crash-reporting or
> tracking software**, does not use an advertising identifier, and does not track you across other apps or
> websites.
>
> ## 4. How we use it
>
> We use personal information only to:
> - provide the Service: sign you in, show your Organisation's records, branding and content, and save
>   your changes;
> - send Service emails, such as account invitations and password resets;
> - keep the Service secure, prevent misuse and fix problems;
> - respond to support, access, correction and deletion requests;
> - meet our legal obligations.
>
> We do **not** sell personal information, use it for advertising, or share it with data brokers.
> [TO CONFIRM: "We do not use Organisation data to train artificial-intelligence models." Keep it only if true.]
>
> ## 5. Tax File Numbers
>
> Where an Organisation records a Tax File Number, it is handled in line with the *Privacy (Tax File Number)
> Rule 2015*. It is collected only for a lawful tax, superannuation or financial purpose of that Organisation,
> it is visible only to users whose role allows it, and it is never used to identify a person for any other
> purpose.
>
> ## 6. Who we share it with
>
> We share personal information only with the service providers that run the Service for us. Each one may use
> it only to provide its service to us.
>
> | Provider | What it does for us |
> |---|---|
> | Vercel Inc. | Hosts the Ninja CMS web application and API |
> | [TO CONFIRM: database provider, e.g. Neon Inc.] | Managed PostgreSQL database (account and Organisation records) |
> | Cloudflare, Inc. (R2) | Stores uploaded documents and images |
> | Amazon Web Services (S3) | Stores some older files while they are moved to Cloudflare [TO CONFIRM: remove once the move is finished] |
> | Resend, Inc. | Sends Service emails (invitations, password resets, notifications) |
> | Entrust and Crazytel | Identity verification and its SMS, **only** when an Organisation sends a client a verification request from the web portal. The mobile app does not use them. [TO CONFIRM: still in use] |
>
> We may also disclose information if the law requires it, or to protect the safety and security of the
> Service and its users.
>
> **Overseas.** Some of these providers are based in, or may process data in, the United States and other
> countries. [TO CONFIRM: storage regions, e.g. "Our database and file storage are located in Australia (Sydney)".]
> We take reasonable steps (APP 8) to make sure they handle it in line with the APPs.
>
> ## 7. Security
>
> All traffic between the app or browser and the Service is encrypted (HTTPS). Access to records is limited by
> each user's role and by Organisation: a user sees only the Organisations they belong to. Passwords are hashed
> and session tokens are kept in secure device storage. No system is completely secure. If a data breach is
> likely to cause serious harm, we will notify the affected Organisations, individuals and the OAIC as the
> *Notifiable Data Breaches* scheme requires.
>
> ## 8. How long we keep it
>
> - **Account information:** while your account is active. After a deletion request it is deleted as described
>   in §9, unless the law requires us to keep part of it.
> - **Organisation records:** for as long as the Organisation uses the Service, or as the Organisation instructs
>   us. Many Organisations must keep advice records for several years under financial services law; that
>   decision belongs to the Organisation.
> - **Backups and logs** are deleted on a rolling schedule. [TO CONFIRM: for example, within 30 days]
>
> ## 9. Deleting your account {#delete-account}
>
> You can ask us to delete your Ninja CMS account and the personal information linked to it at any time.
>
> **In the mobile app:** open **Settings → Delete account** and confirm. The app opens a pre-filled email to
> our team with your account details. Send it to submit the request.
>
> **Without the app:** email **[TO CONFIRM: privacy / support inbox]** from the email address on your account,
> with the subject "Account deletion request".
>
> **What happens next**
> 1. We confirm the request comes from the account holder. We may reply to the account's email address to check.
> 2. We delete your login and the personal information linked to it: your name, email address, password,
>    sessions, Organisation memberships and preferences. We aim to finish within **30 days** and email you when
>    it is done.
> 3. Client records, documents and notes that you created **for your Organisation** are that Organisation's
>    business records, not your personal account data. They stay with the Organisation, which may be legally
>    required to keep them. They are no longer linked to an active login.
>    [TO CONFIRM: whether your name stays on historical activity entries ("added by …"). If it does, say so here.]
> 4. Some information may be kept for longer only where the law requires it, for example for tax or
>    record-keeping. It is deleted when that period ends.
>
> Signing out or uninstalling the app removes the session and cached files from your device, but **does not**
> delete your account.
>
> If your Organisation closes your login, it can ask us to delete it in the same way.
>
> ## 10. Access and correction
>
> You can ask for a copy of the personal information we hold about you, or ask us to correct it. Contact us
> using the details below. We respond within a reasonable period, usually 30 days. Most account details can
> also be updated in the web portal under **Settings**.
>
> ## 11. Complaints
>
> If you have a privacy concern, contact us first and we will respond within 30 days. If you are not satisfied,
> you can contact the Office of the Australian Information Commissioner (OAIC): **www.oaic.gov.au**,
> 1300 363 992.
>
> ## 12. Changes to this policy
>
> We may update this policy. The current version and its effective date are always on this page. If a change is
> significant, we will tell users in the Service or by email.
>
> ## 13. Contact us
>
> Advice Ninja Pty Ltd
> Email: **[TO CONFIRM: privacy / support inbox]**
> Address: [TO CONFIRM: business postal address]

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
| §9 `{#delete-account}` anchor | Gives Google Play's "delete account URL" a target without needing a second page. |
