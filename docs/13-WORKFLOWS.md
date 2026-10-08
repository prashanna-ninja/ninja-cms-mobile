# 13 — Workflows (pipeline boards)

The web's `/portal/[adviceId]/workflows`: Kanban boards of **stages**, with **client cards** on each stage, stage
checklists, per-client to-dos and comments. Built 2026-10-08.

## 1. Web reference

- `app/portal/[adviceId]/workflows/_components/WorkflowsHome.tsx`: the list ("Yours" + shared, drag to reorder, template
  library, new workflow).
- `[workflowId]/_components/WorkflowBoard.tsx`: the board (columns, drag cards, search, tags filter, Summary).
- `AddClientDialog.tsx`: "Add to {stage}" (Existing client | Create new).
- `ClientPlacementDialog.tsx`: one client on a board (tags, earlier stages, stage checklist, client checklist, comments,
  log, files, partner, details, assigned to, due date, stage buttons, remove).
- Types: `lib/services/workflows.ts`. Queries: `lib/workflows/queries.ts`. Access: `lib/workflows/access.ts`.

## 2. Who can see it (access)

`requireWorkflowApiAccess` = Client Records access (adviser / onboarding / staff + org membership + `clientRecordsEnabled`)
**and** `workflowsEnabled` on the adviser (and on the staff user, for staff). Otherwise **403** with a message.

Mobile: `useWorkflowsAccess(adviceId)` reuses the list request (`GET …/workflows`); 403 → the tab is hidden
(`href: null`), same as Clients.

**Staff** can do everything on a board except change **checklist item due dates** (403; `canEditDueDates: false`).
**Collaborators** (boards shared with you) see only their own clients' cards. Owner-only routes answer **404**, not 403.

## 3. API (all under `/api/portal/{adviceId}/workflows`)

| Use | Endpoint |
|---|---|
| List | `GET` → `{ workflows, sharedWorkflows, templates, checklistTemplates }` |
| Board | `GET /{workflowId}` → stages[] with `checklist[]` and `clients[]` (cards), `assignees[]`, `canManageStructure` |
| Clients you can add | `GET /available-clients?workflowId=&search=` → your own clients not on the board (≤ 50) |
| Add client | `POST /{workflowId}/clients` `{stageId, clientId}` or `{stageId, client:{name, phone, email?}}` → 201 `{placement:{id}}`; 409 if already on it |
| Client on board | `GET /{workflowId}/clients/{placementId}` → PlacementDetail |
| Move / assign / due | `PATCH /{workflowId}/clients/{placementId}` `{stageId?, assignedToUserId?, dueOn?}` |
| Remove | `DELETE /{workflowId}/clients/{placementId}` |
| Stage checklist item | `PATCH …/{placementId}/checklist` `{itemId, done?, assignedToUserId?, dueOn?}` |
| Client to-dos | `POST …/personal-checklist {title}` · `PATCH/DELETE …/personal-checklist/{itemId}` |
| Comments | `POST …/comments {body ≤ 4000}` · `DELETE …/comments/{commentId}` (own only) |
| New workflow | `POST` `{name?, preset:"blank"}` or `{name?, templateId}` → 201 `{workflow:{id}}` |
| Licensee templates | `GET /templates` → `{templates}` (keep those whose `organisationIds` include this org, like the web) |
| Search templates | `GET /templates/search?q=` (≥ 2 chars, ≤ 20; mixed licensee / adviser / own) |
| Add a stage | `POST /{workflowId}/stages {name ≤ 80}` (owner only, max 40) |

Not on mobile yet (web only): rename/delete workflows, rename/reorder/delete stages + stage checklists, making templates, sharing,
collaborators, form ingest keys, drag reordering, shared checklist templates, the Summary tables.

## 4. Mobile implementation

```
src/app/(app)/(tabs)/workflows/
  _layout.tsx                    Stack
  index.tsx                      list: "Yours" + "Shared with you"
  [workflowId].tsx               board: stage rail + swipeable stage pages
  [workflowId]/[placementId].tsx a client on the board
src/api/workflows.api.ts         hooks (list/access, board, placement, available clients, mutations)
src/components/workflows/        stage-rail, board-card, add-client-sheet, badges
src/lib/workflows.ts             splitStageName ("Research (Admin)" → title + role), overdue helpers, search
src/types/workflow.types.ts
```

**Board → phone.** The web's side-scrolling columns don't work on a phone, so:
- a sticky **stage rail**: numbered nodes joined by a line, short stage name, client count, a red dot when a stage has
  overdue work. The active stage is filled with the org colour and stages before it are tinted. It auto-scrolls to keep
  the active stage in view.
- below it, **full-width stage pages** in a horizontal paged FlatList: swipe, or tap the rail. Each page has
  "STAGE n OF m", the stage name with its role as a badge (`(Admin)` → ADMIN), client and to-do counts, **Add client**,
  then the cards.
- **cards**: org-colour initials, name, type/source/first 2 tags, assignee, due date (red if overdue), "Checklist item
  overdue", the stage checklist as a progress bar, the comment count, and "n earlier stages not finished". An overdue
  card gets a red left edge (the web's red ring).
- **Find a client** filters every stage, and the rail counts follow the filter.
- No drag on mobile. Moving is done on the client screen, which is quicker one-handed.

**Client on a board** (`[placementId]`): a header (Full record → `/clients/[id]`), then an org-colour **stage card**
(STAGE n OF m, a segmented progress bar, **Move to {next stage} →**, and **Change** → a stage sheet). Below that:
Assigned to (sheet; staff marked "(staff)"), Due date (`DateField`), the stage checklist (tap to tick, optimistic),
earlier stages (collapsible, tickable), client to-dos (add / tick / delete, max 40), comments (post, delete your own),
and **Remove from workflow** (confirm). Tags, files, partner and details stay on the full client record.

**New workflow** (list → New workflow, `new-workflow-sheet.tsx`): Start fresh (To do · In progress · Complete), the
licensee shared templates for this org, or **Copy a shared template** (search adviser templates; licensee results are
hidden there because they're already listed above). Picking a template fills in the name. Create opens the new board.

**Add a stage**: owners (`canManageStructure`) get a dashed **+ Add stage** node at the end of the stage rail
(`add-stage-sheet.tsx`).

**Add client** sheet: Existing client (server search, radio pick) | Create new (name + phone required, email optional).
After adding, the app opens the new card.

Refreshing: every mutation invalidates the board, the list counts, that placement, and `["client"]` (client pages
show workflow memberships). Adding from a client page (Overview → Workflows → Add) invalidates the boards too.

## 5. Status

✅ 2026-10-08. Verified with mocked CMS responses on web: tab → list (own + shared) → board (rail, stage switch,
overdue dot, cards) → Add client sheet → POST `{stageId, clientId}` → opens the card → tick (`PATCH …/checklist
{itemId, done}`) → Move to next stage (`PATCH {stageId}`). tsc ✅ lint ✅. No native changes.
⚠️ Not yet against real boards on a device. Swiping between stage pages needs checking on a phone (the web test used rail taps).

**Next:** per-item assignee / due date editing on checklist rows, applying shared checklist templates, the Summary
(overdue per person).

2026-10-08 (later): New workflow (fresh / licensee template / copy shared template) and Add a stage. Verified with
mocks: POST `{"name":"Test","templateId":"tp1"}` → opens the board; another org's licensee template is hidden; POST
stages `{"name":"Waiting on documents"}`.
