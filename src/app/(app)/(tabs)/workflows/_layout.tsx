import { Stack } from "expo-router";

/**
 * Workflows tab stack: the list (`index`), a board (`[workflowId]`) and a client on
 * a board (`[workflowId]/[placementId]`). Same background as the app so pushes never
 * flash white. docs/13-WORKFLOWS.md.
 */
export default function WorkflowsLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F0F4FB" } }} />;
}
