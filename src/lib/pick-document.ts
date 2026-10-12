import * as DocumentPicker from "expo-document-picker";

import { UPLOAD_MIME_TYPES, type PickedFile } from "@/api/client-detail.api";
import { holdAppIconSwitch } from "@/lib/app-icon";

// One picker at a time: a second getDocumentAsync while one is open rejects
// ("Different document picking in progress"), so extra taps are ignored.
let picking = false;

/**
 * Pick one uploadable document (PDF / Word / Excel / image). Null when cancelled or a picker is
 * already open. Held: the picker backgrounds the app, which must not trigger the Android icon switch.
 */
export async function pickDocument(): Promise<PickedFile | null> {
  if (picking) return null;
  picking = true;
  let res: DocumentPicker.DocumentPickerResult;
  try {
    res = await holdAppIconSwitch(() =>
      DocumentPicker.getDocumentAsync({ type: UPLOAD_MIME_TYPES, copyToCacheDirectory: true, multiple: false }),
    );
  } finally {
    picking = false;
  }
  const a = res.canceled ? undefined : res.assets?.[0];
  if (!a) return null;
  return { uri: a.uri, name: a.name, mimeType: a.mimeType ?? "application/octet-stream", size: a.size ?? 0 };
}
