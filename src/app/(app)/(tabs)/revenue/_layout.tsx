import { Stack } from "expo-router";

/**
 * Revenue tab stack: My Revenue (`index`) and Map Clients (`map-client`).
 * Same background as the app so pushes never flash white.
 */
export default function RevenueLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F0F4FB" } }} />;
}
