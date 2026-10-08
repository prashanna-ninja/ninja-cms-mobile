import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/api-client";
import { qk } from "@/lib/query-keys";
import type { AvailableClient, PlacementDetail, WorkflowBoard, WorkflowsResponse, WorkflowTemplateSummary } from "@/types/workflow.types";

/**
 * Workflows (pipeline boards): the web's /portal/[adviceId]/workflows.
 * All routes live under /api/portal/{adviceId}/workflows and use the workflow access check:
 * Client Records + `workflowsEnabled` on the adviser (and the staff user) → else 403.
 * docs/13-WORKFLOWS.md.
 */
const root = (adviceId: string) => `/api/portal/${encodeURIComponent(adviceId)}/workflows`;
const board = (adviceId: string, workflowId: string) => `${root(adviceId)}/${encodeURIComponent(workflowId)}`;
const placementUrl = (adviceId: string, workflowId: string, placementId: string) =>
  `${board(adviceId, workflowId)}/clients/${encodeURIComponent(placementId)}`;

const json = (body: unknown) => ({ body: JSON.stringify(body) });
const noRetryOn4xx = (count: number, err: unknown) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 1;

/** Your boards + boards shared with you. */
export function useWorkflows(adviceId: string | undefined) {
  return useQuery({
    queryKey: qk.workflows(adviceId ?? ""),
    queryFn: () => apiFetch<WorkflowsResponse>(root(adviceId!)),
    enabled: !!adviceId,
    retry: noRetryOn4xx,
  });
}

/**
 * Whether the Workflows tab shows: true / false (403) / undefined (still checking).
 * Same request as the list, so opening the tab is instant.
 */
export function useWorkflowsAccess(adviceId: string | undefined): boolean | undefined {
  const q = useWorkflows(adviceId);
  if (q.isError) return !(q.error instanceof ApiError && q.error.status === 403);
  return q.data ? true : undefined;
}

export function useWorkflowBoard(adviceId: string | undefined, workflowId: string) {
  return useQuery({
    queryKey: qk.workflowBoard(adviceId ?? "", workflowId),
    queryFn: () => apiFetch<WorkflowBoard>(board(adviceId!, workflowId)),
    enabled: !!adviceId && !!workflowId,
    retry: noRetryOn4xx,
  });
}

export function usePlacement(adviceId: string | undefined, workflowId: string, placementId: string) {
  return useQuery({
    queryKey: qk.placement(workflowId, placementId),
    queryFn: () => apiFetch<PlacementDetail>(placementUrl(adviceId!, workflowId, placementId)),
    enabled: !!adviceId && !!workflowId && !!placementId,
    retry: noRetryOn4xx,
  });
}

/** Your own clients not on this board yet (server caps at 50; `search` narrows on the server). */
export function useAvailableClients(adviceId: string | undefined, workflowId: string, search: string, enabled: boolean) {
  return useQuery({
    queryKey: [...qk.availableClients(workflowId), search],
    queryFn: () =>
      apiFetch<{ clients: AvailableClient[] }>(
        `${root(adviceId!)}/available-clients?workflowId=${encodeURIComponent(workflowId)}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
      ).then((r) => r.clients),
    enabled: enabled && !!adviceId && !!workflowId,
  });
}

/** After any change on a board: the board, the list counts, client pages showing memberships. */
function useRefreshWorkflow(adviceId: string | undefined, workflowId: string) {
  const queryClient = useQueryClient();
  return (placementId?: string) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: qk.workflowBoard(adviceId ?? "", workflowId) }),
      queryClient.invalidateQueries({ queryKey: qk.workflows(adviceId ?? "") }),
      placementId ? queryClient.invalidateQueries({ queryKey: qk.placement(workflowId, placementId) }) : null,
      // Client pages list workflow memberships + activity.
      queryClient.invalidateQueries({ queryKey: ["client"] }),
    ]);
}

export type AddWorkflowClientBody =
  | { stageId: string; clientId: string }
  | { stageId: string; client: { name: string; phone: string; email?: string } };

/** POST …/{workflowId}/clients — an existing client, or a new one created on the spot (individual, manual). */
export function useAddWorkflowClient(adviceId: string | undefined, workflowId: string) {
  const refresh = useRefreshWorkflow(adviceId, workflowId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddWorkflowClientBody) =>
      apiFetch<{ placement: { id: string } }>(`${board(adviceId!, workflowId)}/clients`, { method: "POST", ...json(body) }),
    onSuccess: () =>
      Promise.all([
        refresh(),
        queryClient.invalidateQueries({ queryKey: qk.availableClients(workflowId) }),
        queryClient.invalidateQueries({ queryKey: ["client-records"] }),
      ]),
  });
}

/** PATCH placement — move stage (`stageId`), assign (`assignedToUserId`), card due date (`dueOn`). */
export function useUpdatePlacement(adviceId: string | undefined, workflowId: string, placementId: string) {
  const refresh = useRefreshWorkflow(adviceId, workflowId);
  return useMutation({
    mutationFn: (body: { stageId?: string; assignedToUserId?: string | null; dueOn?: string | null }) =>
      apiFetch(placementUrl(adviceId!, workflowId, placementId), { method: "PATCH", ...json(body) }),
    onSuccess: () => refresh(placementId),
  });
}

/** DELETE placement — remove the client from this board (the client record stays). */
export function useRemovePlacement(adviceId: string | undefined, workflowId: string, placementId: string) {
  const refresh = useRefreshWorkflow(adviceId, workflowId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(placementUrl(adviceId!, workflowId, placementId), { method: "DELETE" }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: qk.placement(workflowId, placementId) });
      return Promise.all([refresh(), queryClient.invalidateQueries({ queryKey: qk.availableClients(workflowId) })]);
    },
  });
}

/**
 * PATCH …/checklist — a stage checklist item (this stage or an earlier one): done / assignee / due date.
 * Optimistic for `done` (ticking should feel instant), rolled back on error.
 */
export function useUpdateStageItem(adviceId: string | undefined, workflowId: string, placementId: string) {
  const refresh = useRefreshWorkflow(adviceId, workflowId);
  const queryClient = useQueryClient();
  const key = qk.placement(workflowId, placementId);
  return useMutation({
    mutationFn: (body: { itemId: string; done?: boolean; assignedToUserId?: string | null; dueOn?: string | null }) =>
      apiFetch(`${placementUrl(adviceId!, workflowId, placementId)}/checklist`, { method: "PATCH", ...json(body) }),
    onMutate: async (body) => {
      if (body.done === undefined) return undefined;
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<PlacementDetail>(key);
      if (prev) {
        const flip = <T extends { itemId: string; done: boolean }>(rows: T[]) =>
          rows.map((r) => (r.itemId === body.itemId ? { ...r, done: body.done! } : r));
        queryClient.setQueryData<PlacementDetail>(key, {
          ...prev,
          stageChecklist: flip(prev.stageChecklist),
          priorStageChecklists: prev.priorStageChecklists.map((s) => ({ ...s, items: flip(s.items) })),
        });
      }
      return { prev };
    },
    onError: (_e, _b, ctx) => ctx?.prev && queryClient.setQueryData(key, ctx.prev),
    onSettled: () => refresh(placementId),
  });
}

/** Personal (client) to-dos: add, tick / rename / assign / date, delete. */
export function usePersonalChecklist(adviceId: string | undefined, workflowId: string, placementId: string) {
  const refresh = useRefreshWorkflow(adviceId, workflowId);
  const queryClient = useQueryClient();
  const key = qk.placement(workflowId, placementId);
  const url = `${placementUrl(adviceId!, workflowId, placementId)}/personal-checklist`;

  const add = useMutation({
    mutationFn: (title: string) => apiFetch(url, { method: "POST", ...json({ title }) }),
    onSuccess: () => refresh(placementId),
  });
  const update = useMutation({
    mutationFn: ({ id, ...body }: { id: string; done?: boolean; title?: string; assignedToUserId?: string | null; dueOn?: string | null }) =>
      apiFetch(`${url}/${encodeURIComponent(id)}`, { method: "PATCH", ...json(body) }),
    onMutate: async (vars) => {
      if (vars.done === undefined) return undefined;
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<PlacementDetail>(key);
      if (prev) {
        queryClient.setQueryData<PlacementDetail>(key, {
          ...prev,
          personalChecklist: prev.personalChecklist.map((r) => (r.id === vars.id ? { ...r, done: vars.done! } : r)),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && queryClient.setQueryData(key, ctx.prev),
    onSettled: () => refresh(placementId),
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`${url}/${encodeURIComponent(id)}`, { method: "DELETE" }),
    onSuccess: () => refresh(placementId),
  });
  return { add, update, remove };
}

/** Comments on a client's card: add (≤ 4000 chars) / delete your own. */
export function usePlacementComments(adviceId: string | undefined, workflowId: string, placementId: string) {
  const refresh = useRefreshWorkflow(adviceId, workflowId);
  const url = `${placementUrl(adviceId!, workflowId, placementId)}/comments`;
  const add = useMutation({
    mutationFn: (body: string) => apiFetch(url, { method: "POST", ...json({ body }) }),
    onSuccess: () => refresh(placementId),
  });
  const remove = useMutation({
    mutationFn: (commentId: string) => apiFetch(`${url}/${encodeURIComponent(commentId)}`, { method: "DELETE" }),
    onSuccess: () => refresh(placementId),
  });
  return { add, remove };
}

/** Licensee templates shared with this organisation (web CreateWorkflowDialog filters by organisationIds). */
export function useLicenseeTemplates(adviceId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: qk.workflowTemplates(adviceId ?? ""),
    queryFn: () =>
      apiFetch<{ templates: WorkflowTemplateSummary[] }>(`${root(adviceId!)}/templates`).then((r) =>
        r.templates.filter((t) => !t.organisationIds || t.organisationIds.includes(adviceId!)),
      ),
    enabled: enabled && !!adviceId,
  });
}

/** Shared templates by name or adviser (server needs ≥ 2 characters; returns ≤ 20). */
export function useTemplateSearch(adviceId: string | undefined, q: string) {
  return useQuery({
    queryKey: qk.workflowTemplateSearch(adviceId ?? "", q),
    queryFn: () =>
      apiFetch<{ templates: WorkflowTemplateSummary[] }>(`${root(adviceId!)}/templates/search?q=${encodeURIComponent(q)}`).then((r) => r.templates),
    enabled: !!adviceId && q.length >= 2,
  });
}

/** POST …/workflows — a blank board (To do · In progress · Complete) or a copy of a template. */
export function useCreateWorkflow(adviceId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name?: string; templateId?: string; preset?: "blank" }) =>
      apiFetch<{ workflow: { id: string } }>(root(adviceId!), { method: "POST", ...json(body) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.workflows(adviceId ?? "") }),
  });
}

/** POST …/{workflowId}/stages {name} — owner only (collaborators get 404); max 40 stages. */
export function useAddStage(adviceId: string | undefined, workflowId: string) {
  const refresh = useRefreshWorkflow(adviceId, workflowId);
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<{ stage: { id: string; name: string } }>(`${board(adviceId!, workflowId)}/stages`, { method: "POST", ...json({ name }) }),
    onSuccess: () => refresh(),
  });
}
