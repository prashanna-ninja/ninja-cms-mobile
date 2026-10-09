# Prompts — how we work together

## How we work together

- We build **one page/feature at a time**, in the order you give. For each: study the web version in
  `ref/cms`, check the CRM mobile for an existing pattern, build, typecheck + lint, commit.
- **Small commits**, one logical step each (`feat:`, `fix:`, `chore:`, `docs:`).
- Every meaningful change gets an entry in [IMPLEMENTATION-LOG.md](IMPLEMENTATION-LOG.md); new
  features get a numbered doc (`07-…`). [../HANDOVER.md](../HANDOVER.md) is kept current.

## Giving me screenshots or page text

Paste a screenshot of the web page (or its URL path, e.g. `/portal/[adviceId]/notices`) and say what
must be on mobile vs. what can be dropped. I'll find the page + its API route in `ref/cms`.

## Reusable prompt templates

```
Build the <X> screen from the web page <path in ref/cms>.
Keep: <…>. Drop: <…>. It should live under <tab / stack>.
```

```
Wire up <METHOD /api/...> as a TanStack hook in src/api/<domain>.api.ts
and use it on <screen>. Invalidate <keys> on success.
```

```
Add a React Native Reusables component: <button|card|input|…>.
```

```
Debug: <what you did> → <what happened> (paste logs / screenshot).
```

## Keyword hints for exploring the ref

| Topic | Where to look in `ref/cms` |
|---|---|
| Auth config | `lib/auth.ts`, `lib/auth-client.ts`, `lib/trusted-origins.ts` |
| Roles / redirects | `lib/auth-guard.ts`, `lib/auth-roles.ts`, `lib/roles.ts`, `lib/staff.ts` |
| Form validation | `lib/validations/*` |
| API routes | `app/api/**/route.ts` |
| Data queries | `lib/queries/*`, `lib/services/*` |
| Portal UI | `app/portal/**` |
| Back office UI | `app/(protected)/**`, `lib/nav-config.ts` |
| DB models | `prisma/schema/*.prisma` |
| Mobile patterns | `ref/ninja-crm-mobile/src/{lib,api,app,components/ui}` |

## Changing session (new chat)

**Trigger:** the user says they want to change session / start a new chat / "give me a handover prompt".
Do **all three** steps without being asked again. The user set this up on 2026-10-09.

### 1. Docs
- [ ] `docs/IMPLEMENTATION-LOG.md`: an entry (newest first) for every change not yet logged.
- [ ] `HANDOVER.md`: status line + date, §1 *What works*, §7 *Gotchas* (new traps), §8 *Loose ends* (next step,
      device-test checklist, rebuild note), §9 *Where things live* (new folders).
- [ ] Feature docs (`docs/NN-*.md`) match the code; `docs/README.md` lists any new doc.
- [ ] Native changes → a row in the docs/02 §6 rebuild log.

### 2. Tighten loose ends
- [ ] `npx tsc --noEmit` and `npx expo lint`: clean.
- [ ] `npx expo-doctor`: all checks pass (patch drift → `npx expo install --fix`, then note that the dev client needs a rebuild).
- [ ] `git status`: clean. Delete stray/generated files (and add an ignore rule), commit everything (small commits).
- [ ] Fix stale claims in the docs (things marked "next" that are done, wrong "latest native module", etc.).
- [ ] Carry over standing reminders (e.g. ⏰ `SUPPORT_EMAIL` before store submission, HANDOVER §8).

### 3. Hand-off prompt
Give the user a short, ready-to-paste prompt for the new chat. Template:

```
We're continuing Ninja CMS Mobile (Expo SDK 57 adviser-portal app) in
C:\Users\DELL\Projects_Advice_Ninja\ninja_cms_mobile.

First read AGENTS.md, HANDOVER.md (status, gotchas §7, loose ends §8) and docs/README.md.
The CMS (API source of truth) is in ref/cms (read-only, git-ignored); conventions come from ref/ninja-crm-mobile.

Where we are: <one or two lines: what was finished last session>.
Next: <the next feature, e.g. "the Revenue tab — web /portal/[adviceId]/revenue, gate it like Clients">.
Still to verify on a device: <HANDOVER §8 checklist, short>.

Same rules as before: build page by page with small commits; keep IMPLEMENTATION-LOG, HANDOVER and the feature
docs current; tell me up front about any new native module (+ the rebuild command); org colour/logo from the
active org, never hard-coded; ask me if anything is unclear.
```
