import * as WebBrowser from "expo-web-browser";
import { Alert, Linking } from "react-native";

import { holdAppIconSwitch } from "@/lib/app-icon";
import { isStoredFileUrl, openStoredFile } from "@/lib/stored-file";

/**
 * Open a link from CMS content (notice/article links, documents, buttons, videos, forms).
 *
 * - http(s) → in-app browser (SFSafariViewController / Chrome Custom Tab): the user
 *   stays in the app, PDFs and videos just work, one tap to close.
 * - mailto: / tel: / anything else → the OS (mail app, dialler…).
 * - CMS storage (`/api/files/…` database copies, old S3 links) → `openStoredFile`: the database copy
 *   needs our cookie, so it's downloaded and shown in the share sheet (lib/stored-file.ts).
 *
 * Optionally tinted with the org colour (`toolbarColor` / `controlsColor`).
 */
export async function openUrl(url: string | undefined | null, tint?: string) {
  const href = url?.trim();
  if (!href) return;
  // Held: the browser backgrounds the app, which must not trigger the Android icon switch.
  const browse = async (uri: string) => {
    await holdAppIconSwitch(() =>
      WebBrowser.openBrowserAsync(uri, {
        controlsColor: tint,
        toolbarColor: tint,
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      }),
    );
  };
  if (/^https?:\/\//i.test(href) && isStoredFileUrl(href)) {
    try {
      await openStoredFile(href, browse);
    } catch (err) {
      Alert.alert("Couldn't open file", err instanceof Error ? err.message : href);
    }
    return;
  }
  try {
    if (/^https?:\/\//i.test(href)) return await browse(href);
    await Linking.openURL(href);
  } catch {
    Alert.alert("Couldn't open link", href);
  }
}
