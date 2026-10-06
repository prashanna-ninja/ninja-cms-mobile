/**
 * Client record DETAIL — shapes of the CMS routes under
 * /api/portal/[adviceId]/client-records/[clientId]/** (see docs/12-CLIENTS.md §6).
 */
import type { ClientSource, ClientTag, ClientType } from "@/types/client.types";

/** GET {base} → { client } (raw row; no adviser/advice names). */
export type ClientDetail = {
  id: string;
  type: ClientType | string;
  source: ClientSource | string;
  adviserUserId: string;
  adviceId: string;
  name: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  /** "YYYY-MM-DDT00:00:00.000Z" */
  dateOfBirth: string | null;
  abn: string | null;
  addressLine1: string | null;
  addressTown: string | null;
  addressPostcode: string | null;
  state: string | null;
  archivedAt: string | null;
  partnerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PartnerSummary = { id: string; name: string; email: string | null };

export type ClientTagsResponse = {
  tags: ClientTag[];
  availableTags: (ClientTag & { usageCount: number })[];
};

export type WorkflowMembership = {
  placementId: string;
  workflowId: string;
  workflowName: string;
  stageId: string;
  stageName: string;
  doneCount: number;
  totalCount: number;
  stageChecklist: { itemId: string; title: string; done: boolean; dueOn: string | null; assignedTo: { id: string; name: string } | null }[];
  personalChecklist: { id: string; title: string; done: boolean; dueOn: string | null; assignedTo: { id: string; name: string } | null }[];
  comments: { id: string; body: string; createdAt: string; authorName: string }[];
};

/** A workflow the user can add the client to (CMS listWorkflows; only the fields we use). */
export type WorkflowSummary = {
  id: string;
  name: string;
  description: string | null;
  stageCount: number;
  clientCount: number;
  stages: { id: string; name: string }[];
};

export type ClientWorkflowsResponse = {
  memberships: WorkflowMembership[];
  /** Empty when workflows are off for this user. */
  workflows: WorkflowSummary[];
  workflowsEnabled: boolean;
};

export type RevenueTx = {
  id: string;
  entity: string;
  productProvider: string | null;
  subproductName: string | null;
  feeType: "upfront" | "ongoing" | null;
  feeTypeName: string | null;
  datePaid: string;
  netAmount: string;
  accountName: string | null;
};

export type ClientRevenueResponse = {
  summary: {
    financialYearStart: string;
    upfrontNet: string;
    upfrontCount: number;
    ongoingNet: string;
    ongoingCount: number;
    totalNet: string;
  };
  transactions: { data: RevenueTx[]; total: number; page: number; pageSize: number; totalPages: number };
};

/** Fact find JSON — sections keyed by name; values are plain objects (rendered generically). */
export type ClientFactFind = Record<string, unknown>;

export type ClientFile = {
  id: string;
  fileName: string;
  fileUrl: string;
  bucketKey: string;
  contentType: string;
  fileSizeBytes: number;
  createdAt: string;
  uploadedBy: { id: string; name: string } | null;
};

export type ClientNote = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string } | null;
};

export type AnnualConsentResponse = {
  entries: { id: string; consentedOn: string; note: string | null; createdAt: string; recordedBy: { id: string; name: string } | null }[];
  schedule: { consentedOn: string; dueOn: string; daysUntil: number } | null;
  review: {
    interval: "six_months" | "twelve_months";
    nextReviewOn: string;
    leadDays: number;
    updatedAt: string;
    updatedBy: { id: string; name: string } | null;
  } | null;
};

export type ClientActivity = {
  id: string;
  action: string;
  summary: string;
  createdAt: string;
  actor: { id: string; name: string } | null;
};
