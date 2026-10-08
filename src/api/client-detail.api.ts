import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/api-client";
import { qk } from "@/lib/query-keys";
import type {
  AnnualConsentResponse,
  ClientActivity,
  ClientDetail,
  ClientFactFind,
  ClientFile,
  ClientNote,
  ClientRevenueResponse,
  ClientTagsResponse,
  ClientWorkflowsResponse,
  PartnerSummary,
} from "@/types/client-detail.types";

/**
 * Client record detail — every section of the web's client page
 * (/portal/[adviceId]/client-records/[clientId]). All routes are under
 * {base} = /api/portal/{adviceId}/client-records/{clientId} and run the same
 * access check as the list (403 with a message). docs/12-CLIENTS.md §6.
 */
const base = (adviceId: string, clientId: string) =>
  `/api/portal/${encodeURIComponent(adviceId)}/client-records/${encodeURIComponent(clientId)}`;

const json = (body: unknown) => ({ body: JSON.stringify(body) });

const noRetryOn403 = (count: number, err: unknown) => !(err instanceof ApiError && (err.status === 403 || err.status === 404)) && count < 1;

/* ------------------------------ reads ------------------------------ */

export function useClientDetail(adviceId: string | undefined, clientId: string) {
  return useQuery({
    queryKey: qk.client(adviceId ?? "", clientId),
    queryFn: () => apiFetch<{ client: ClientDetail }>(base(adviceId!, clientId)).then((r) => r.client),
    enabled: !!adviceId && !!clientId,
    retry: noRetryOn403,
  });
}

export function useClientPartner(adviceId: string | undefined, clientId: string) {
  return useQuery({
    queryKey: qk.clientSection(clientId, "partner"),
    queryFn: () => apiFetch<{ partner: PartnerSummary | null }>(`${base(adviceId!, clientId)}/partner`).then((r) => r.partner),
    enabled: !!adviceId,
  });
}

export function usePartnerSearch(adviceId: string | undefined, clientId: string, q: string) {
  return useQuery({
    queryKey: qk.clientSection(clientId, "partner-search", q),
    queryFn: () =>
      apiFetch<{ clients: PartnerSummary[] }>(`${base(adviceId!, clientId)}/partner?q=${encodeURIComponent(q)}`).then((r) => r.clients),
    enabled: !!adviceId && q.trim().length >= 2,
  });
}

export function useClientTags(adviceId: string | undefined, clientId: string) {
  return useQuery({
    queryKey: qk.clientSection(clientId, "tags"),
    queryFn: () => apiFetch<ClientTagsResponse>(`${base(adviceId!, clientId)}/tags`),
    enabled: !!adviceId,
  });
}

export function useClientWorkflows(adviceId: string | undefined, clientId: string) {
  return useQuery({
    queryKey: qk.clientSection(clientId, "workflows"),
    queryFn: () => apiFetch<ClientWorkflowsResponse>(`${base(adviceId!, clientId)}/workflows`),
    enabled: !!adviceId,
  });
}

/** Revenue — 10 per page like the web; 403 = the user can't see revenue (tab hidden). */
export function useClientRevenue(adviceId: string | undefined, clientId: string) {
  return useInfiniteQuery({
    queryKey: qk.clientSection(clientId, "revenue"),
    queryFn: ({ pageParam }) =>
      apiFetch<ClientRevenueResponse>(`${base(adviceId!, clientId)}/revenue?page=${pageParam}&pageSize=20&sortBy=-datePaid`),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.transactions.page < last.transactions.totalPages ? last.transactions.page + 1 : undefined,
    enabled: !!adviceId,
    retry: noRetryOn403,
  });
}

/** Can this user see the Revenue section? Same trick as the Clients tab: ask, 403 = no. */
export function useClientRevenueAccess(adviceId: string | undefined, clientId: string): boolean | undefined {
  const revenue = useClientRevenue(adviceId, clientId);
  if (revenue.error instanceof ApiError && revenue.error.status === 403) return false;
  if (revenue.isError) return true;
  return revenue.data ? true : undefined;
}

export function useClientFactFind(adviceId: string | undefined, clientId: string) {
  return useQuery({
    queryKey: qk.clientSection(clientId, "fact-find"),
    queryFn: () => apiFetch<{ data: ClientFactFind }>(`${base(adviceId!, clientId)}/fact-find`).then((r) => r.data ?? {}),
    enabled: !!adviceId,
  });
}

export function useClientFiles(adviceId: string | undefined, clientId: string) {
  return useQuery({
    queryKey: qk.clientSection(clientId, "files"),
    queryFn: () => apiFetch<{ files: ClientFile[] }>(`${base(adviceId!, clientId)}/files`).then((r) => r.files),
    enabled: !!adviceId,
  });
}

export function useClientNotes(adviceId: string | undefined, clientId: string) {
  return useQuery({
    queryKey: qk.clientSection(clientId, "notes"),
    queryFn: () => apiFetch<{ notes: ClientNote[] }>(`${base(adviceId!, clientId)}/notes`).then((r) => r.notes),
    enabled: !!adviceId,
  });
}

export function useClientConsent(adviceId: string | undefined, clientId: string) {
  return useQuery({
    queryKey: qk.clientSection(clientId, "annual-consent"),
    queryFn: () => apiFetch<AnnualConsentResponse>(`${base(adviceId!, clientId)}/annual-consent`),
    enabled: !!adviceId,
  });
}

export function useClientActivity(adviceId: string | undefined, clientId: string) {
  return useQuery({
    queryKey: qk.clientSection(clientId, "activity"),
    queryFn: () => apiFetch<{ activity: ClientActivity[] }>(`${base(adviceId!, clientId)}/activity?limit=100`).then((r) => r.activity),
    enabled: !!adviceId,
  });
}

/* ---------------------------- mutations ---------------------------- */

/** After any change: the section itself, the activity log, and the list (badges/tags). */
function useInvalidate(clientId: string, adviceId?: string) {
  const queryClient = useQueryClient();
  return (...sections: string[]) =>
    Promise.all([
      ...sections.map((s) => queryClient.invalidateQueries({ queryKey: qk.clientSection(clientId, s) })),
      queryClient.invalidateQueries({ queryKey: qk.clientSection(clientId, "activity") }),
      queryClient.invalidateQueries({ queryKey: qk.client(adviceId ?? "", clientId) }),
      queryClient.invalidateQueries({ queryKey: ["client-records"] }),
    ]);
}

export function useUpdateClientSource(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: (source: string) =>
      apiFetch<{ client: ClientDetail }>(base(adviceId!, clientId), { method: "PATCH", ...json({ source }) }),
    onSuccess: () => invalidate(),
  });
}

export function useSetClientTags(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: (tagNames: string[]) =>
      apiFetch(`${base(adviceId!, clientId)}/tags`, { method: "PUT", ...json({ tagNames }) }),
    onSuccess: () => invalidate("tags"),
  });
}

export function useLinkPartner(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: (partnerClientId: string) =>
      apiFetch(`${base(adviceId!, clientId)}/partner`, { method: "PUT", ...json({ partnerClientId }) }),
    onSuccess: () => invalidate("partner", "partner-search"),
  });
}

/** POST {base}/workflows {workflowId, stageId} — web ClientWorkflowsCard "Add to workflow". */
export function useAddToWorkflow(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { workflowId: string; stageId: string }) =>
      apiFetch(`${base(adviceId!, clientId)}/workflows`, { method: "POST", ...json(body) }),
    // Also the Workflows tab: board cards + list counts.
    onSuccess: () =>
      Promise.all([
        invalidate("workflows"),
        queryClient.invalidateQueries({ queryKey: ["workflows"] }),
        queryClient.invalidateQueries({ queryKey: ["workflow"] }),
      ]),
  });
}

export function useUnlinkPartner(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: () => apiFetch(`${base(adviceId!, clientId)}/partner`, { method: "DELETE" }),
    onSuccess: () => invalidate("partner"),
  });
}

export function useAddNote(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: (body: string) => apiFetch(`${base(adviceId!, clientId)}/notes`, { method: "POST", ...json({ body }) }),
    onSuccess: () => invalidate("notes"),
  });
}

export function useDeleteNote(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: (noteId: string) =>
      apiFetch(`${base(adviceId!, clientId)}/notes/${encodeURIComponent(noteId)}`, { method: "DELETE" }),
    onSuccess: () => invalidate("notes"),
  });
}

export function useRenameFile(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: ({ fileId, fileName }: { fileId: string; fileName: string }) =>
      apiFetch(`${base(adviceId!, clientId)}/files/${encodeURIComponent(fileId)}`, { method: "PATCH", ...json({ fileName }) }),
    onSuccess: () => invalidate("files"),
  });
}

export function useDeleteFile(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: (fileId: string) =>
      apiFetch(`${base(adviceId!, clientId)}/files/${encodeURIComponent(fileId)}`, { method: "DELETE" }),
    onSuccess: () => invalidate("files"),
  });
}

/** MIME types + 10 MB limit accepted by POST /api/upload (CMS app/api/upload/route.ts). */
export const UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export type PickedFile = { uri: string; name: string; mimeType: string; size: number };

/**
 * Upload a file to the client — the web's 3 steps (ClientFilesTab.tsx):
 *  1. POST /api/upload {key, contentType, contentLength} → presigned S3 PUT (5 min)
 *  2. PUT the bytes to S3
 *  3. POST {base}/files {fileName, fileUrl, bucketKey, contentType, fileSizeBytes}
 * If step 3 fails, the uploaded object is removed (DELETE /api/upload).
 */
export function useUploadFile(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: async (file: PickedFile) => {
      if (!UPLOAD_MIME_TYPES.includes(file.mimeType)) {
        throw new Error("That file type isn't supported. Use a PDF, Word, Excel or image file.");
      }
      if (file.size > UPLOAD_MAX_BYTES) throw new Error("Files must be 10 MB or smaller.");

      const key = `uploads/documents/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const presign = await apiFetch<{ uploadUrl: string; publicUrl: string; key: string }>("/api/upload", {
        method: "POST",
        ...json({ key, contentType: file.mimeType, contentLength: file.size }),
      });

      const bytes = await (await fetch(file.uri)).blob();
      const put = await fetch(presign.uploadUrl, { method: "PUT", headers: { "Content-Type": file.mimeType }, body: bytes });
      if (!put.ok) throw new Error(`Upload failed (${put.status}). Please try again.`);

      try {
        return await apiFetch<{ file: ClientFile }>(`${base(adviceId!, clientId)}/files`, {
          method: "POST",
          ...json({
            fileName: file.name.slice(0, 255),
            fileUrl: presign.publicUrl,
            bucketKey: presign.key,
            contentType: file.mimeType,
            fileSizeBytes: file.size,
          }),
        });
      } catch (err) {
        await apiFetch("/api/upload", { method: "DELETE", ...json({ key: presign.key }) }).catch(() => {});
        throw err;
      }
    },
    onSuccess: () => invalidate("files"),
  });
}

/* ------------------------- ongoing client ------------------------- */

/** POST {base}/annual-consent — upserts the latest entry (web: "Save date"). */
export function useSaveConsent(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: (body: { consentedOn: string; note?: string }) =>
      apiFetch(`${base(adviceId!, clientId)}/annual-consent`, { method: "POST", ...json(body) }),
    onSuccess: () => invalidate("annual-consent"),
  });
}

export function useDeleteConsent(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: (consentId: string) =>
      apiFetch(`${base(adviceId!, clientId)}/annual-consent/${encodeURIComponent(consentId)}`, { method: "DELETE" }),
    onSuccess: () => invalidate("annual-consent"),
  });
}

/** PUT {base}/ongoing-review {interval, nextReviewOn, leadDays}. */
export function useSaveReview(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: (body: { interval: "six_months" | "twelve_months"; nextReviewOn: string; leadDays: 30 | 60 | 90 }) =>
      apiFetch(`${base(adviceId!, clientId)}/ongoing-review`, { method: "PUT", ...json(body) }),
    onSuccess: () => invalidate("annual-consent"),
  });
}

/* --------------------- create / edit / archive / delete --------------------- */

/** Body for POST (create) and PATCH (full edit) — CMS lib/validations/ClientSchema.ts clientCoreShape. */
export type ClientFormBody = {
  type: string;
  source: string;
  name: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  /** "YYYY-MM-DD" or "" */
  dateOfBirth: string;
  abn: string;
  addressLine1: string;
  addressTown: string;
  addressPostcode: string;
  state: string;
};

/** POST /api/portal/{adviceId}/client-records → 201 { client }. Staff can't (web canManageClients). */
export function useCreateClient(adviceId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ClientFormBody) =>
      apiFetch<{ client: ClientDetail }>(`/api/portal/${encodeURIComponent(adviceId!)}/client-records`, { method: "POST", ...json(body) }).then(
        (r) => r.client,
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["client-records"] }),
  });
}

/** PATCH {base} with the full form → { client }. */
export function useUpdateClient(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: (body: ClientFormBody) => apiFetch<{ client: ClientDetail }>(base(adviceId!, clientId), { method: "PATCH", ...json(body) }),
    onSuccess: () => invalidate(),
  });
}

/** PATCH {base} {archived} — staff get 403 ("Only the adviser can archive clients."). */
export function useArchiveClient(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: (archived: boolean) => apiFetch(base(adviceId!, clientId), { method: "PATCH", ...json({ archived }) }),
    onSuccess: () => invalidate(),
  });
}

/** DELETE {base} — permanent; staff get 403. */
export function useDeleteClient(adviceId: string | undefined, clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(base(adviceId!, clientId), { method: "DELETE" }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: qk.client(adviceId ?? "", clientId) });
      return queryClient.invalidateQueries({ queryKey: ["client-records"] });
    },
  });
}

/** PATCH {base}/fact-find {section, value} — replaces one section (web useSaveFactFindSection). */
export function useSaveFactFindSection(adviceId: string | undefined, clientId: string) {
  const invalidate = useInvalidate(clientId, adviceId);
  return useMutation({
    mutationFn: (body: { section: string; value: unknown }) =>
      apiFetch(`${base(adviceId!, clientId)}/fact-find`, { method: "PATCH", ...json(body) }),
    onSuccess: () => invalidate("fact-find"),
  });
}
