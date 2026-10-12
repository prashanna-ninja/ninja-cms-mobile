import { requireOptionalNativeModule } from "expo";
import { Directory, File, Paths } from "expo-file-system";
import * as React from "react";
import { Platform } from "react-native";

import { API_BASE_URL } from "@/constants/env";
import { readCookie } from "@/lib/api-client";
import { holdAppIconSwitch } from "@/lib/app-icon";

/**
 * Files stored by the CMS (uploads, logos, notice images/attachments, client files).
 *
 * Since 2026-10-08 the CMS stores new files on **Cloudflare R2** (public custom domain), falling back to
 * its **database** when R2 can't take a file; those copies are served by `GET /api/files/<key>`, which
 * needs the session cookie. Old rows still point at the **S3** bucket (amazonaws.com), which may be
 * offline; the web then tries the database copy of the same key (CMS lib/storage/file-url.ts,
 * components/media/FallbackImage.tsx). This module does the same for the app.
 */

const STORAGE_PREFIXES = ["uploads/", "invoices/", "verification-reports/"];
const FILES_PATH = "/api/files/";

function decodeKey(path: string): string | null {
  const key = path
    .split("/")
    .filter(Boolean)
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        return part;
      }
    })
    .join("/");
  if (!STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) return null;
  if (key.includes("..") || key.includes("\\")) return null;
  return key;
}

function parse(raw: string): URL | null {
  try {
    return new URL(raw, "http://localhost");
  } catch {
    return null;
  }
}

/** `/api/files/<key>` on OUR API host (the URL the CMS stored may name another host, e.g. in dev). */
function databaseUrl(key: string): string {
  return `${API_BASE_URL}${FILES_PATH}${key.split("/").map(encodeURIComponent).join("/")}`;
}

/** The database copy of `key`, sent with our session cookie. */
function databaseSource(key: string): StoredSource {
  const cookie = readCookie();
  return { uri: databaseUrl(key), headers: cookie ? { Cookie: cookie } : undefined, key };
}

/** `key` is set only on a database copy (it needs the cookie). */
export type StoredSource = { uri: string; headers?: Record<string, string>; key?: string };

/**
 * The places a stored file can be loaded from, in order:
 * - `/api/files/<key>` → our API host, with the cookie (the only source);
 * - an S3 (amazonaws.com) URL → itself, then the database copy of the same key;
 * - anything else (R2, external links) → itself.
 */
export function storedSources(raw: string | null | undefined): StoredSource[] {
  const value = raw?.trim();
  if (!value) return [];
  const url = parse(value);
  if (!url) return [{ uri: value }];

  const filesAt = url.pathname.indexOf(FILES_PATH);
  if (filesAt !== -1) {
    const key = decodeKey(url.pathname.slice(filesAt + FILES_PATH.length));
    return key ? [databaseSource(key)] : [{ uri: value }];
  }
  if (url.hostname.endsWith(".amazonaws.com")) {
    const key = decodeKey(url.pathname);
    return key ? [{ uri: value }, databaseSource(key)] : [{ uri: value }];
  }
  return [{ uri: value }];
}

/** True for URLs that point at CMS storage (so `openUrl` downloads instead of opening a browser). */
export function isStoredFileUrl(raw: string): boolean {
  const url = parse(raw.trim());
  if (!url) return false;
  return url.pathname.includes(FILES_PATH) || url.hostname.endsWith(".amazonaws.com");
}

/**
 * expo-image source for a stored image, moving to the next source on error (the web's FallbackImage).
 * `failed` → show the placeholder / initials.
 */
export function useStoredImage(src: string | null | undefined) {
  const sources = storedSources(src);
  const [state, setState] = React.useState({ src, attempt: 0 });
  const attempt = state.src === src ? state.attempt : 0;
  const current = sources[attempt];
  return {
    source: current ? { uri: current.uri, headers: current.headers } : undefined,
    failed: !current,
    onError: () => setState({ src, attempt: attempt + 1 }),
  };
}

/** Raised when this install has no expo-sharing (a dev build made before 2026-10-06). */
class SharingUnavailableError extends Error {
  constructor() {
    super("This build of the app can't open stored files yet. Install the latest build.");
  }
}

async function reachable(uri: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(uri, { method: "HEAD", credentials: "omit", signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Open a stored file. Public copies (S3 still up) open in the in-app browser via `openPublic`; a
 * database copy needs our cookie, which the browser doesn't have, so it is downloaded to the cache
 * and handed to the share sheet (Quick Look / Files / Drive…), like the fact-find PDF.
 * Throws a user-facing Error when no copy can be opened.
 */
export async function openStoredFile(raw: string, openPublic: (uri: string) => Promise<void>): Promise<void> {
  const sources = storedSources(raw);
  for (const source of sources) {
    if (!source.key) {
      // The only source (not S3) → just open it; S3 → only when the bucket answers.
      if (sources.length === 1 || (await reachable(source.uri))) return openPublic(source.uri);
      continue;
    }
    if (Platform.OS === "web") return openPublic(source.uri);
    return downloadAndShare(source, source.key);
  }
  throw new Error("This file isn't available right now. Please try again later.");
}

async function downloadAndShare(source: StoredSource, key: string): Promise<void> {
  if (!requireOptionalNativeModule("ExpoSharing")) throw new SharingUnavailableError();
  const Sharing = await import("expo-sharing");

  // Keys are already safe ([a-zA-Z0-9._/-], CMS lib/storage/keys.ts): "uploads/documents/123-a.pdf" → "123-a.pdf".
  const name = key.split("/").pop() || "file";
  const dir = new Directory(Paths.cache, "files");
  dir.create({ intermediates: true, idempotent: true });
  let file: File;
  try {
    file = await File.downloadFileAsync(source.uri, new File(dir, name), { headers: source.headers ?? {}, idempotent: true });
  } catch (err) {
    const status = err instanceof Error ? err.message.match(/\b(4\d\d|5\d\d)\b/)?.[1] : undefined;
    throw new Error(
      status === "401"
        ? "Your session has expired. Sign in again and retry."
        : "This file isn't available right now. Please try again later.",
    );
  }
  await holdAppIconSwitch(() => Sharing.shareAsync(file.uri, { dialogTitle: name }));
}
