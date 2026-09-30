import { Stack } from "expo-router";

/** Signed-OUT stack. Reachable only when there is no session (see app/_layout.tsx). */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />;
}
