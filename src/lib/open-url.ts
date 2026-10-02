import * as WebBrowser from "expo-web-browser";
import { Alert, Linking } from "react-native";

/**
 * Open a link from CMS content (notice/article links, documents, buttons, videos, forms).
 *
 * - http(s) → in-app browser (SFSafariViewController / Chrome Custom Tab): the user
 *   stays in the app, PDFs and videos just work, one tap to close.
 * - mailto: / tel: / anything else → the OS (mail app, dialler…).
 *
 * Optionally tinted with the org colour (`toolbarColor` / `controlsColor`).
 */
export async function openUrl(url: string | undefined | null, tint?: string) {
  const href = url?.trim();
  if (!href) return;
  try {
    if (/^https?:\/\//i.test(href)) {
      await WebBrowser.openBrowserAsync(href, {
        controlsColor: tint,
        toolbarColor: tint,
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      });
      return;
    }
    await Linking.openURL(href);
  } catch {
    Alert.alert("Couldn't open link", href);
  }
}
