import { QueryClient, onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";

/** App-wide TanStack Query client. Screens use hooks from src/api; this holds the cache. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000, // 30s — same as the CMS web (components/Providers.tsx)
      // "Window focus" on native = app returning to the foreground (wired to AppState
      // in QueryProvider via focusManager), so stale screens refresh when reopened.
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Pause queries while offline and refetch when the connection comes back.
onlineManager.setEventListener((setOnline) => {
  const subscription = Network.addNetworkStateListener((state) => {
    setOnline(state.isConnected !== false);
  });
  return () => subscription.remove();
});
