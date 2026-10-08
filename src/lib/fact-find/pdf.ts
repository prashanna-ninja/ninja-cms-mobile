import { requireOptionalNativeModule } from "expo";
import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";

import { API_BASE_URL } from "@/constants/env";
import { readCookie } from "@/lib/api-client";
import { holdAppIconSwitch } from "@/lib/app-icon";

/** The CMS file name: "Fact Find - {client}.pdf" (lib/clients/generate-fact-find-pdf.ts). */
const pdfName = (clientName: string) => `Fact Find - ${clientName.replace(/[\\/:*?"<>|]+/g, " ").trim() || "Client"}.pdf`;

/** Raised when this install has no expo-sharing (a dev build made before 2026-10-06). */
export class SharingUnavailableError extends Error {
  constructor() {
    super("This build of the app can't share files yet. Install the latest build to download PDFs.");
  }
}

/**
 * Generate PDF — `GET {base}/fact-find/pdf` (the server renders it), saved to the cache and handed
 * to the share sheet (Save to Files, Mail, AirDrop, Drive…). The cookie goes in the header because
 * the download runs natively, outside `apiFetch` (same rule: our header only).
 *
 * expo-file-system ships inside `expo`; expo-sharing is the native module added for this, so it's
 * loaded lazily and probed first — a stale dev build gets a friendly error instead of a red screen.
 */
export async function shareFactFindPdf(adviceId: string, clientId: string, clientName: string): Promise<void> {
  const url = `${API_BASE_URL}/api/portal/${adviceId}/client-records/${clientId}/fact-find/pdf`;
  const cookie = readCookie();

  if (Platform.OS === "web") return downloadOnWeb(url, pdfName(clientName));

  if (!requireOptionalNativeModule("ExpoSharing")) throw new SharingUnavailableError();
  const Sharing = await import("expo-sharing");

  const dir = new Directory(Paths.cache, "fact-find");
  dir.create({ intermediates: true, idempotent: true });
  let file: File;
  try {
    file = await File.downloadFileAsync(url, new File(dir, pdfName(clientName)), {
      headers: cookie ? { Cookie: cookie } : {},
      idempotent: true,
    });
  } catch (err) {
    // Non-2xx → "UnableToDownload … <status>"; the JSON message isn't available here.
    const status = err instanceof Error ? err.message.match(/\b(4\d\d|5\d\d)\b/)?.[1] : undefined;
    throw new Error(
      status === "401"
        ? "Your session has expired. Sign in again and retry."
        : status === "403" || status === "404"
          ? "You don't have access to this client's fact find."
          : "The PDF couldn't be generated. Please try again.",
    );
  }
  await holdAppIconSwitch(() => Sharing.shareAsync(file.uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: pdfName(clientName) }));
}

/** react-native-web (mock testing): same as the web portal — fetch the blob and click a download link. */
async function downloadOnWeb(url: string, fileName: string) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message || "Failed to generate PDF.");
  }
  const blobUrl = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
