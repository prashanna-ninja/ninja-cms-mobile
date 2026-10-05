# 12 — Clients (Client Records)

Started 2026-10-05 against the live CMS (`../cms`). Step 1 = **access-gated tab + list + filters** (read-only).
Next: the full client profile, then Add client, then row actions.

## 1. Web reference

`/portal/[adviceId]/client-records` → `ClientRecordsPage.tsx` + `ClientRecordColumns.tsx`:
- Header: icon tile, **Client Records**, "N clients" pill, "Client profiles, fact finds, and notes.", **+ Add client**.
- Controls: search (name/email/phone) + Search button · All tags · All types · All sources · Active/Archived.
- Table: Client · Type (coloured badge) · Source (grey badge) · Tags (coloured chips) · Email · Phone · Added
  (`D MMM YYYY, h:mm A`, Brisbane) · View / ⋯ (archive, restore, delete; not for staff).

## 2. Who can see it (access)

Server rules (`lib/clients/access.ts` `getPortalClientRecordsAccess`):
- **adviser / onboarding:** the (acting) adviser must be an org member and have **`clientRecordsEnabled`**.
- **staff:** a managing adviser for this org must exist; **both** the adviser and the staff member need
  `clientRecordsEnabled`. Staff can't manage (no add/archive/delete).
- **admin / orgadmin:** preview the org's first adviser (that adviser needs the flag).
- otherwise **403** with a message (e.g. "Client Records is not enabled for this adviser.").

**Mobile gate:** `useClientRecordsAccess(orgId)` makes **the same request the tab will make** (page 1, no filters):
200 → show the tab; **403 → `href: null`** (hidden); other errors → show it (the screen then shows the error).
We don't re-implement the rules, so the tab appears exactly when the web shows the section. The response seeds
the list cache, so opening the tab doesn't refetch. Cached 5 min; re-checked on org switch (key includes the org).

## 3. API

| Method + path | What |
|---|---|
| `GET /api/portal/[adviceId]/client-records?search=&tag=&type=&source=&archived=1&page=` | `{ clients[], tags[], total, page, pageSize: 50 }`. Newest first (archived: by archivedAt). `tags` = all the adviser's tags (feeds the tag filter). Each client: `id, type, source, name, email, phone, createdAt, archivedAt, tags[{id,name,color}]`. |
| `POST` same path | create (Add client, later) |
| `/[clientId]`, `/activity`, `/notes`, `/files`, `/fact-find`, `/tags`, `/workflows` | detail (later) |

Enums: type `individual | company | trust | smsf`; source `manual | id_verification | client_forms |
document_upload` ("Manual", "ID Verification", "Client Forms", "Request documents").

## 4. Mobile implementation

| File | Job |
|---|---|
| `src/api/clients.api.ts` | `getClientRecords`, `useClientRecords` (**`useInfiniteQuery`**, next page while `page*pageSize < total`, no retry on 403), `useClientRecordsAccess` |
| `src/app/(app)/(tabs)/clients/_layout.tsx` | Stack inside the tab |
| `src/app/(app)/(tabs)/clients/index.tsx` | the list screen |
| `src/app/(app)/(tabs)/clients/[id].tsx` | client placeholder (basics from the list cache; "full profile coming next") |
| `src/components/clients/client-card.tsx` | one client (web row → card) |
| `src/components/clients/option-sheet.tsx` | bottom-sheet single-choice picker (RN Modal, no native dep) |
| `src/lib/clients.ts` | labels + web badge colours; `src/types/client.types.ts` |
| `src/hooks/use-debounced-value.ts`, `src/lib/date.ts` `formatShortDate` | search debounce; "3 Oct 2026" (Brisbane, "Sep" not "Sept") |

Web → mobile:
- Search + button → **search as you type** (350ms debounce) + a clear (×).
- Active/Archived select → **segmented switch**.
- Tag/type/source dropdowns → **chips that open a bottom sheet**; a set chip is org-tinted; **Clear** resets them.
- Table → **cards** (monogram, name, type + source badges, email, phone, tags, "Added …"); 50/page, more on scroll;
  pull to refresh; skeletons, empty states (none / no matches / no archived), error + retry.
- **Add client** and **row actions** are not in this step (user decision 2026-10-05: list first, read-only).

## 5. Status

✅ 2026-10-05. Verified with mocked CMS responses: tab visible with access / **hidden on 403**; list, type-filter sheet
→ `type=smsf` request, clear, open client (`/clients/c1`); tsc ✅ lint ✅. No native changes.
⚠️ Not yet against real client records on a device.

**Next:** client profile (`/[clientId]`, notes, activity…), then Add client (`POST`, the web `AddClientRecordForm`),
then archive/restore/delete (advisers only).
