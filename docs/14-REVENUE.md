# 14 — Revenue (My Revenue + Map Clients)

The web's `/portal/[adviceId]/my-revenue` (and `/my-revenue/map-client`): the signed-in user's **own** revenue as
imported from licensee statements, plus mapping each revenue account to one of their clients. Built 2026-10-09.

## 1. Web reference

- `app/portal/[adviceId]/my-revenue/page.tsx` → `app/(protected)/my-revenue/_component/MyRevenueClient.tsx`: 4 stat
  cards (`manage-revenue/_component/RevenueStatsCards.tsx`, `personalScope`), date range / licensee / product filters,
  the transactions table (`RevenueTransactionColumn.tsx`), "Map clients" button.
- `my-revenue/map-client/page.tsx` → `MyMapClientHub.tsx`: Total / Mapped / Unmapped cards, All/Mapped/Unmapped tabs,
  accounts table, "click a row, scroll down" panel with a client picker + Map / Save / Unmap.
- Queries: `lib/queries/revenue-transactions.ts`. Client fetchers: `lib/services/my-revenue.ts`.
- Mapping: `lib/clients/revenue-mapping.ts`. Access: `lib/revenue-visibility.ts` (`resolveMyRevenueAccess`).

## 2. Who can see it (access)

`resolveMyRevenueAccess`: **superadmin / admin / orgadmin** → yes (their own id); **adviser** → only with
`revenueVisibilityEnabled` (on the acting adviser); **everyone else (staff, …)** → **403**.
The web nav shows "My Revenue" only for adviser-like users with the flag; admins can still open the URL.

Mobile: `useRevenueAccess()` asks the server (the unfiltered `GET /api/my-revenue/stats`, which the screen then reuses);
403 → the Revenue tab is hidden (`href: null`), same as Clients and Workflows. The data is **not org-scoped**: switching
organisation shows the same revenue (as on the web). Keys carry no adviceId; sign-out clears the cache.

## 3. API (all under `/api/my-revenue`, scoped by the server to the caller)

| Use | Endpoint |
|---|---|
| Totals | `GET /stats?search&entity&datePaidFrom&datePaidTo` → `{transactionCount, grossAmount, netAmount, accountCount, …}` |
| Transactions | `GET /transactions?…&sortBy&page&pageSize` (≤ 100) → `{data, total, page, pageSize, totalPages, counts}` |
| Accounts | `GET /account-groups?search&mapped=all\|mapped\|unmapped&page&pageSize` → `{data, total, …, counts}` (counts ignore the filters) |
| Your clients | `GET /clients?search&pageSize` (≤ 50) → `{data: [{id, name, type, …}]}` |
| Map / unmap | `POST /bulk-assign-client {accountNumber, accountName, clientId \| null}` → `{count}` |

- `search` matches **account name / number only** (`accountOnlySearch`). `entity` ∈ Cobalt, Beryllium, AIAFSL, CLS.
  Dates are `YYYY-MM-DD` (gte / lte on `datePaid`). `sortBy`: `datePaid`, `-datePaid` (default), `netAmount`,
  `-netAmount`, `grossAmount`, …
- Accounts are grouped by **account name** (else the number when there's no name); mapping one moves every transaction
  of that account and remembers it for future imports (`RevenueClientAlias`). It also writes a client activity entry.
- ⚠️ **Map only touches unmapped transactions.** Changing an already-mapped account straight to another client answers
  **404 "No unmapped transactions found"**. The web's "Save" has this bug. Mobile does **unmap, then map**
  (`useMapRevenueAccount` with `remap: true`).
- The web's **product filter** isn't on mobile: its options are server-rendered (`getRevenueProductProviders`) and
  there's no API for them. Add one to the CMS if it's wanted.

## 4. Mobile implementation

```
src/app/(app)/(tabs)/revenue/
  _layout.tsx                    Stack
  index.tsx                      My Revenue
  map-client.tsx                 Map Clients (?mapped=unmapped opens that tab)
src/api/revenue.api.ts           stats (+ access probe), transactions, accounts, clients, map mutation
src/components/revenue/          revenue-hero, transaction-row (+ Badge, ClientMark), date-range-sheet, map-account-sheet
src/components/flash-note.tsx    short confirmation toast (shared)
src/lib/revenue.ts               licensees + badge colours, sort options, date presets (Brisbane, FY from 1 July), month grouping
src/types/revenue.types.ts
```

**My Revenue**, from web to mobile:
- 4 stat cards → **one org-coloured statement card** (`RevenueHero`): Gross as the headline (cents set smaller), the date
  range beside the label, and Net · Txns · Clients as frosted tiles. Faint corner rings add texture. All colours come
  from `useOrgTheme()` (works for pale org colours too: `onBase` switches to ink).
- An amber **"N accounts not mapped"** nudge (from `account-groups` counts) → Map Clients on the Unmapped tab.
- Search (account) + chips → bottom sheets: **date paid** (All dates / This week / This month / This financial year /
  custom from–to with the pure-JS `DateField`), **licensee**, **sort** (newest / oldest / highest / lowest net).
- Transactions as a **ledger grouped by month** (date-sorted views; amount sorts are one flat list). Each row has a day
  stub, the account, product · subproduct, licensee + fee badges, net (gross under it), and the client or "Unmapped".
  The adviser column is dropped, since every row is your own revenue. Pages of 25 load as you scroll.
- **Tap a transaction** → map its account right there (`MapAccountSheet`).
- No per-month totals: a month can span two loaded pages, so a sum would be wrong.

**Map Clients:**
- Count cards → one **progress card** ("ACCOUNTS MAPPED 9 / 13", %, green bar on an amber track).
- Search (account or client name), All / Mapped / Unmapped segmented switch with counts.
- Account cards with a green (mapped) / amber (unmapped) left edge → `MapAccountSheet`: account summary (transactions,
  gross, net, current client), a searchable list of your clients, then **Map** / **Save** (change) / **Unmap** (confirm).
  A `FlashNote` confirms ("Mapped 3 transactions to …").
- After mapping: all `my-revenue` queries **and** the client pages' Revenue + Activity sections are refreshed.

The client record's own **Revenue section** (docs/12 §6) stays as it is: it's per client, FY summary + mapped transactions.

## 5. Not on mobile (web only)

Product filter (no API), table column sorting beyond the four sort options, page-size choice.
