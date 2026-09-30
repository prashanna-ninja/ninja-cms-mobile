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
