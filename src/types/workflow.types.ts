import type { ClientSource, ClientType } from "@/types/client.types";

/**
 * Workflow (pipeline board) types — mirror the CMS responses
 * (lib/workflows/queries.ts, lib/services/workflows.ts). docs/13-WORKFLOWS.md.
 * Due dates are "YYYY-MM-DD" (Brisbane calendar dates) unless noted.
 */

export type Person = { id: string; name: string };

/** GET /api/portal/{adviceId}/workflows → `workflows[]` / `sharedWorkflows[]`. */
export type WorkflowSummary = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  stageCount: number;
  /** For shared boards: only the cards you can see. */
  clientCount: number;
  stages: { id: string; name: string }[];
  /** Set on boards shared with you (you're a collaborator). */
  sharedBy: Person | null;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowsResponse = {
  workflows: WorkflowSummary[];
  sharedWorkflows: WorkflowSummary[];
};

export type PriorStageChecklist = {
  stageId: string;
  stageName: string;
  sortOrder: number;
  doneCount: number;
  totalCount: number;
  items: { itemId: string; title: string; done: boolean; doneAt: string | null; dueOn: string | null; assignedTo: Person | null }[];
};

export type Tag = { id: string; name: string; color: string | null };

/** A client card on the board (a "placement"). */
export type BoardCard = {
  id: string;
  stageId: string;
  sortOrder: number;
  createdAt: string;
  dueOn: string | null;
  /** Any undone stage item (any stage) or personal item is overdue. */
  checklistOverdue: boolean;
  canOpen: boolean;
  doneCount: number;
  totalCount: number;
  personalDoneCount: number;
  personalTotalCount: number;
  commentCount: number;
  priorStageChecklists: PriorStageChecklist[];
  assignedTo: Person | null;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    type: ClientType;
    source: ClientSource;
    adviserName: string;
    tags: Tag[];
  };
};

export type BoardStage = {
  id: string;
  name: string;
  sortOrder: number;
  checklist: { id: string; title: string; sortOrder: number; dueInDays: number | null }[];
  clients: BoardCard[];
};

export type Assignee = Person & { role: "adviser" | "staff" };

/** GET …/workflows/{workflowId}. */
export type WorkflowBoard = {
  id: string;
  name: string;
  description: string | null;
  canManageStructure: boolean;
  owner: Person;
  collaborators: Person[];
  assignees: Assignee[];
  stages: BoardStage[];
};

export type ChecklistRow = { itemId: string; title: string; done: boolean; dueOn: string | null; assignedTo: Person | null };
export type PersonalRow = { id: string; title: string; done: boolean; sortOrder: number; dueOn: string | null; assignedTo: Person | null };
export type WorkflowComment = { id: string; body: string; createdAt: string; author: Person };

/** GET …/workflows/{workflowId}/clients/{placementId}. */
export type PlacementDetail = {
  id: string;
  stageId: string;
  dueOn: string | null;
  createdAt: string;
  stage: { id: string; name: string };
  client: {
    id: string;
    type: ClientType;
    source: ClientSource;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    createdAt: string;
  };
  assignedTo: Person | null;
  assignees: Assignee[];
  clientTags: Tag[];
  stageChecklist: ChecklistRow[];
  priorStageChecklists: PriorStageChecklist[];
  personalChecklist: PersonalRow[];
  /** Newest first. */
  comments: WorkflowComment[];
  /** Staff can't change checklist due dates. */
  canEditDueDates?: boolean;
};

/** GET …/workflows/available-clients — your own clients not yet on the workflow (max 50). */
export type AvailableClient = { id: string; name: string; email: string | null; phone: string | null; type: ClientType; source: ClientSource };

/** A workflow template you can start a board from (GET …/workflows/templates, …/templates/search). */
export type WorkflowTemplateSummary = {
  id: string;
  name: string;
  description: string | null;
  isShared: boolean;
  isOwn: boolean;
  /** Made by the licensee (not an adviser); shown as "System" / "Licensee shared". */
  isLicenseeTemplate: boolean;
  stageCount: number;
  createdByName: string;
  /** Licensee templates only: the organisations it's shared with. */
  organisationIds?: string[];
};
