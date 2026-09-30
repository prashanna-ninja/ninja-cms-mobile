import * as React from "react";
import { View } from "react-native";

import { cn } from "@/lib/utils";

/** Shared gutters + max width (the `.content-wrapper` class in src/global.css). */
export function Container({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn("content-wrapper", className)} {...props} />;
}
