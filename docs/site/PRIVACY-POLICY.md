# Privacy policy (`/privacy`): publish word for word

**Build agent:** render everything below the line as the `/privacy` page.
- Use `h1` for the title and `h2` for the numbered sections.
- Give the "9. Deleting your account" heading `id="delete-account"`.
- Show the effective date under the title.
- Every `[TO CONFIRM …]` must be replaced with a value from the user before publishing. Ask, and never invent one.

**Owner's notes (not for publishing):**
- This file is the source of truth for the policy text. `docs/15-PRIVACY-POLICY.md` explains why each part is
  there.
- Keep it in step with the App Privacy labels and review notes in `docs/16-APP-STORE-REVIEW.md`.
- The `[TO CONFIRM]` items left: ABN, postal address, effective date, database provider, storage regions, backup
  period, the AI-training sentence, and the activity-history names.

---

# Ninja CMS Privacy Policy

**Effective date:** [TO CONFIRM: date published]

This policy explains how **Advice Ninja Pty Ltd** (ABN [TO CONFIRM]) ("**we**", "**us**") handles personal
information in **Ninja CMS**:
- the Ninja CMS adviser portal (the web application),
- the Ninja CMS mobile app for iOS and Android, and
- this website, ninjacms.com.au.

Together these are the "**Service**". We comply with the *Privacy Act 1988* (Cth), including the Australian
Privacy Principles (APPs).

## 1. Who uses Ninja CMS

Ninja CMS is business software. It is licensed to Australian financial services licensees and the advice
practices that work with them (each an "**Organisation**"). Each Organisation creates the logins for its own
advisers and staff. There is no public sign-up. The Service is not intended for people under 18.

## 2. Our role, and the Organisation's role

- **Your account.** We are responsible for the information we hold to run your login.
- **Information entered by Organisations.** Organisations use the Service to keep records about their own
  clients. The Organisation decides what is recorded and why, and is responsible for it under its own privacy
  policy. We store and process those records on the Organisation's behalf, only to provide the Service.

**If you are a client of an adviser** and want to access, correct or delete information about you, please contact
that adviser or their Organisation first. We will help them respond.

## 3. What we collect

**a. Account information.** Your name, email address, role, the Organisations you belong to, and your password.
Your password is stored by the Service as a one-way hash; the mobile app never stores it. When you sign in, the
app keeps a session token in your device's secure storage (iOS Keychain / Android Keystore) so you stay signed in.
Signing out removes it.

**b. Records you create or view for your Organisation.** Depending on what your role allows, this can include:
- client details: names, email addresses, phone numbers, postal addresses, dates of birth, and partner and
  dependant details;
- fact-find details: employment, income, expenses, assets and liabilities, superannuation, estate planning,
  existing insurance and associated entities, and **Tax File Numbers** where the Organisation records them;
- documents and files uploaded to a client record;
- notes, workflow cards, consent and review records, and the activity history of a record;
- revenue and commission records and how they are matched to clients.

**c. Files you choose to upload.** The mobile app only reads a file you pick yourself with your device's document
picker. It does not access your photo library, camera, contacts, location or microphone.

**d. Technical information.** Our servers record standard request logs (IP address, time, the page or API called,
and the app or browser version) for security and troubleshooting.

**e. This website.** ninjacms.com.au does not use cookies, analytics or tracking, and has no forms. If you email
us, we use your message only to reply to you.

**What we don't collect.** The mobile app contains **no analytics, advertising, crash-reporting or tracking
software**, does not use an advertising identifier, and does not track you across other apps or websites.

## 4. How we use it

We use personal information only to:
- provide the Service: sign you in, show your Organisation's records, branding and content, and save your
  changes;
- send Service emails, such as account invitations and password resets;
- keep the Service secure, prevent misuse and fix problems;
- respond to support, access, correction and deletion requests;
- meet our legal obligations.

We do **not** sell personal information, use it for advertising, or share it with data brokers.
[TO CONFIRM: "We do not use Organisation data to train artificial-intelligence models." Keep this sentence only
if it is true; otherwise delete it.]

## 5. Tax File Numbers

Where an Organisation records a Tax File Number, it is handled in line with the *Privacy (Tax File Number) Rule
2015*. It is collected only for a lawful tax, superannuation or financial purpose of that Organisation, it is
visible only to users whose role allows it, and it is never used to identify a person for any other purpose.

## 6. Who we share it with

We share personal information only with the service providers that run the Service for us. Each one may use it
only to provide its service to us.

| Provider | What it does for us |
|---|---|
| Vercel Inc. | Hosts the Ninja CMS web application, API and this website |
| [TO CONFIRM: database provider, e.g. Neon Inc.] | Managed PostgreSQL database (account and Organisation records) |
| Cloudflare, Inc. (R2) | Stores uploaded documents and images |
| Amazon Web Services (S3) | Stores some older files while they are moved to Cloudflare [TO CONFIRM: remove this row once the move is finished] |
| Resend, Inc. | Sends Service emails (invitations, password resets, notifications) |
| Entrust and Crazytel | Identity verification and its SMS, **only** when an Organisation sends a client a verification request from the web portal. The mobile app does not use them. |

We may also disclose information if the law requires it, or to protect the safety and security of the Service and
its users.

**Overseas.** Some of these providers are based in, or may process data in, the United States and other
countries. [TO CONFIRM: storage regions, e.g. "Our database and file storage are located in Australia (Sydney)."]
We take reasonable steps (APP 8) to make sure they handle it in line with the APPs.

## 7. Security

All traffic between the app or browser and the Service is encrypted (HTTPS). Access to records is limited by each
user's role and by Organisation: a user sees only the Organisations they belong to. Passwords are hashed and
session tokens are kept in secure device storage. No system is completely secure. If a data breach is likely to
cause serious harm, we will notify the affected Organisations, individuals and the OAIC as the *Notifiable Data
Breaches* scheme requires.

## 8. How long we keep it

- **Account information:** while your account is active. After a deletion request it is deleted as described in
  section 9, unless the law requires us to keep part of it.
- **Organisation records:** for as long as the Organisation uses the Service, or as the Organisation instructs us.
  Many Organisations must keep advice records for several years under financial services law; that decision
  belongs to the Organisation.
- **Backups and logs** are deleted on a rolling schedule, within [TO CONFIRM: e.g. 30] days.

## 9. Deleting your account

You can ask us to delete your Ninja CMS account and the personal information linked to it at any time.

**In the mobile app:** open **Settings → Delete account** and confirm. The app opens a pre-filled email to our
team with your account details. Send it to submit the request.

**Without the app:** email **support@ninjacms.com.au** from the email address on your account, with the subject
"Account deletion request".

**What happens next**

1. We confirm the request comes from the account holder. We may reply to the account's email address to check.
2. We delete your login and the personal information linked to it: your name, email address, password, sessions,
   Organisation memberships and preferences. We aim to finish within **30 days** and email you when it is done.
3. Client records, documents and notes that you created **for your Organisation** are that Organisation's business
   records, not your personal account data. They stay with the Organisation, which may be legally required to keep
   them. They are no longer linked to an active login.
   [TO CONFIRM: if your name stays on historical activity entries (for example "added by …"), say so here.]
4. Some information may be kept for longer only where the law requires it, for example for tax or record-keeping.
   It is deleted when that period ends.

Signing out or uninstalling the app removes the session and cached files from your device, but **does not**
delete your account.

If your Organisation closes your login, it can ask us to delete it in the same way.

## 10. Access and correction

You can ask for a copy of the personal information we hold about you, or ask us to correct it. Email
**support@ninjacms.com.au**. We respond within a reasonable period, usually 30 days. Most account details can also
be updated in the adviser portal under **Settings**.

## 11. Complaints

If you have a privacy concern, email **support@ninjacms.com.au** and we will respond within 30 days. If you are
not satisfied, you can contact the Office of the Australian Information Commissioner (OAIC): **www.oaic.gov.au**,
1300 363 992.

## 12. Changes to this policy

We may update this policy. The current version and its effective date are always on this page. If a change is
significant, we will tell users in the Service or by email.

## 13. Contact us

Advice Ninja Pty Ltd
Email: **support@ninjacms.com.au**
Address: [TO CONFIRM: business postal address]
