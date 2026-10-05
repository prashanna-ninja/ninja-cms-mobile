import { Stack } from "expo-router";

/**
 * Clients tab stack: the list (`index`) and a client (`[id]`). Same background
 * as the app so pushes never flash white.
 */
export default function ClientsLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F0F4FB" } }} />;
}
