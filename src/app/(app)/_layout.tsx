import { Stack } from "expo-router";

/**
 * Signed-IN area. Reachable only with a session (see app/_layout.tsx).
 * A plain Stack for now — becomes tabs when the dashboard step lands.
 */
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
