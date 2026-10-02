# 09 — Notices (portal home)

Built 2026-10-02 against the live CMS (`../cms`). The first real section of the portal home. It sits under
the org banner on `(app)/index.tsx`; the full dashboard comes later.

## 1. What the web does

`app/portal/[adviceId]/page.tsx` → `getPortalNotices(adviceId)` (Prisma, server-side) → `NoticesSection`
→ `NoticesClient` (filter + sort) → `NoticeCard` (expand) → `BlockContentView` / `RichTextView`.

- **NEW** = created < 7 days ago. Dates are `DD/MM/YYYY` in **Australia/Brisbane**.
- Filters: All Notices / This Week (≤ 7 days) / This Month (≤ 30 days) / Older (> 30 days); sort Newest ⇄ Oldest
  (both collapse every card).
- The collapsed card shows "N images" / "N attachments" counted from the content. A card with no content
  can't expand.
- Rich text replaces `@name` → org name and `@email` → the entity's from-email.

## 2. Endpoints (no backend change needed)

| Method + path | What | Notes |
|---|---|---|
| `GET /api/notices?adviceId=…&pageSize=100&sortBy=-createdAt` | `{ data: [{ id, title, createdAt, advices }], total, … }` | `lib/queries/notice.ts` `getNotices`. Non-`admin` → must be an `AdviceMember` of `adviceId`, else **403**. Max pageSize 100. No content. |
| `GET /api/notices/[id]` | `{ id, title, content, createdAt, adviceIds }` | Same membership check. `content` = grid-builder rows JSON. |

⚠️ The check is `role !== admin`, so a **superadmin** who isn't a member of the org gets 403 on that org's
notices (the web portal page reads Prisma directly and doesn't hit this). The section shows "Couldn't load
notices". Backend fix if needed: treat superadmin like admin in `getNotices` and the detail route.

## 3. Mobile implementation

| File | Job |
|---|---|
| `src/api/notices.api.ts` | `useNotices(adviceId)` (list) + `useNoticeDetails(ids)` (`useQueries`, one per notice, 5 min stale) |
| `src/components/notices/notices-section.tsx` | header (bell, count, sort), filter chips, loading/error/empty states, expand state |
| `src/components/notices/notice-card.tsx` | the card (port of web `NoticeCard`) |
| `src/components/content/block-content.tsx` | **reusable** grid-builder renderer: `ContentRows`, `BlockContentView`, `countMedia` |
| `src/components/content/rich-text.tsx` | **reusable** native Tiptap-HTML renderer (`htmlparser2` → RN views) |
| `src/schemas/grid-builder.schema.ts` | zod port of the CMS `types/grid-builder.ts` + `parseRows` |
| `src/lib/date.ts` | `formatDate` (Brisbane `DD/MM/YYYY`), `WEEK_MS`, `MONTH_MS` |
| `src/lib/open-url.ts` | links/documents/buttons/videos/forms → in-app browser (`expo-web-browser`), `mailto:`/`tel:` → OS |

**Decisions**
- **Prefetch every notice's detail.** The list has no content, but the card shows media counts and expanding
  should be instant. Notices are few, and the cost is one small request each, cached for 5 min.
- **Native rich text, not a WebView.** It's lighter in a list, sizes to content, uses the app font, and
  works in Expo Go. Supported: p, h1–h6, b/strong, i/em, u, s, a, br, ul/ol (nested), blockquote, code/pre,
  hr, table (sideways scroll), img. Unknown tags render their text.
- **Video = a link card** (opens YouTube/Vimeo in the in-app browser); an inline player would need a WebView.
  **Documents** open in the in-app browser (PDFs render there).
- Filter dropdown → **chips**, 2-col grid → 1 column; sort moved next to the title.
- "Now" for NEW/filters = the list's fetch time (`dataUpdatedAt`), not `Date.now()` in render (React Compiler purity).
- Pull-to-refresh on the home screen refetches orgs + notices + notice content.
- `@email` isn't substituted yet (needs the org's `entity` → from-email mapping, `lib/entity-config.ts`).

## 4. Status

✅ Built 2026-10-02. Verified on a web render with mocked CMS responses (5 notices: bold, link, list, `@name`,
image + caption, video, document, empty): collapsed list with NEW, dates and counts; expand/collapse;
"This Week" filter; org theming (green). tsc ✅, lint ✅, Android + iOS bundles ✅.
⚠️ Not yet against real CMS notices on a device.

**Next:** the rest of the portal home (quick links, events, …) → a proper dashboard.
