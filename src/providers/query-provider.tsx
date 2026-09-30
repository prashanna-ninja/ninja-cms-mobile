import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";

import { queryClient } from "@/lib/query-client";

function onAppStateChange(status: AppStateStatus) {
  // On web the browser's own focus events already drive this.
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

/** Makes TanStack Query available to the whole app. Wraps the root layout. */
export function QueryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
