import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

/**
 * App-wide page shell: safe-area insets + themed background.
 * Compose with <Container> inside when you want the shared gutters.
 */
export function Screen({
  className,
  edges = ["top"],
  ...props
}: React.ComponentProps<typeof SafeAreaView>) {
  return <SafeAreaView edges={edges} className={cn("bg-background flex-1", className)} {...props} />;
}
