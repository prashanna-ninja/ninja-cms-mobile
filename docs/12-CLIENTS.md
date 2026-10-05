# 12 — Clients (Client Records)

Started 2026-10-05 against the live CMS (`../cms`). Step 1 = **access-gated tab + list + filters** (read-only).
Step 2 (2026-10-07) = **client detail with all 7 sections** (§6). Next: the edit-heavy parts (§6 "Not yet"), Add client, row actions.

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

## 6. Client detail (`clients/[id].tsx`), built 2026-10-07

Web: `/portal/[adviceId]/client-records/[clientId]` (`ClientRecordDetail.tsx`). Mobile layout: **Go back** → **header
card** (org-colour band, avatar in the org colour, name, type/source badges, "adviser · org", round email/call buttons,
"Client since …") → **sticky section pills** (same order, labels, icons and accent tints as the web) → the section.
`?tab=` selects a section. Pull to refresh reloads everything for the client.

| Section | Endpoints ({base} = …/client-records/{clientId}) | Mobile |
|---|---|---|
| **Overview** | `GET {base}` · `PATCH {base} {source}` · `GET/PUT/DELETE {base}/partner` (+ `?q=` search) · `GET/PUT {base}/tags` · `GET {base}/workflows` | Contact (tap to email / call / maps), Details (org, adviser*, legal name, **Source: editable** via sheet, ABN, DOB), **Partner** (open, remove link, search + link), **Tags** (remove, add with suggestions, max 20), **Workflows** (read-only: stage, checklist, comment count) |
| **Revenue** | `GET {base}/revenue?page&pageSize=20&sortBy=-datePaid` | FY total / upfront / ongoing + mapped transactions with "Show more". **Pill hidden on 403** (`revenueVisibilityEnabled` etc.) |
| **Fact Find** | `GET {base}/fact-find` | 15 collapsible sections, **read-only**; labels/options from the **ported web config** `src/lib/fact-find/config.ts` (verbatim copy) + `sections.ts`; respects `dependsOn` |
| **Files** | `GET/POST {base}/files` · `PATCH/DELETE {base}/files/{id}` · `POST/DELETE /api/upload` | **Upload** (expo-document-picker → presign → S3 PUT → register; PDF/Word/Excel/images ≤ 10 MB), open (public S3 URL, in-app browser), rename, delete |
| **File Notes** | `GET/POST {base}/notes` · `DELETE {base}/notes/{id}` | write (≤ 5000, plain text), list, delete |
| **Ongoing client** | `GET {base}/annual-consent` | consent status (overdue / due today / due in N days), history, review cycle — **read-only** |
| **Activity Log** | `GET {base}/activity?limit=100` | timeline; icon chosen from the summary text (web logic) |

\* The client GET returns no adviser or org names. The org name comes from the active org, and the adviser name is shown
only when it's the signed-in user. (Backend option: include `adviser {name}` in the GET.)

**Not yet on mobile (next pass):** fact-find editing + Generate PDF (PDF needs cookie-auth download →
expo-file-system/expo-sharing), recording consent / setting the review (needs a date picker), adding to a
workflow, archive / delete client, full client edit, Add client.

**Files:** `src/api/client-detail.api.ts` (all hooks + mutations, upload flow), `src/types/client-detail.types.ts`,
`src/components/client-detail/*` (`ui`, `section-tabs`, one file per section), `src/lib/format.ts` (money, file
size, date-time, calendar date, initials), `src/lib/fact-find/*`.

## 5. Status

✅ 2026-10-05. Verified with mocked CMS responses: tab visible with access / **hidden on 403**; list, type-filter sheet
→ `type=smsf` request, clear, open client (`/clients/c1`); tsc ✅ lint ✅. No native changes.
⚠️ Not yet against real client records on a device.

**Next:** client profile (`/[clientId]`, notes, activity…), then Add client (`POST`, the web `AddClientRecordForm`),
then archive/restore/delete (advisers only).
