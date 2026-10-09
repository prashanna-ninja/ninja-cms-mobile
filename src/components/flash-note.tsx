import * as React from "react";
import { Animated, Text, View } from "react-native";

import { CircleCheck } from "@/lib/icons";

/**
 * A short confirmation that floats above the tab bar and fades out (web: sonner toast).
 * Render it last inside a screen; pass `message` (null hides) and clear it in `onHide`.
 */
export function FlashNote({ message, onHide, duration = 2800 }: { message: string | null; onHide: () => void; duration?: number }) {
  const [opacity] = React.useState(() => new Animated.Value(0));

  React.useEffect(() => {
    if (!message) return;
    opacity.setValue(0);
    const anim = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(duration),
      Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]);
    anim.start(({ finished }) => finished && onHide());
    return () => anim.stop();
  }, [message, duration, opacity, onHide]);

  if (!message) return null;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 20, right: 20, bottom: 16, alignItems: "center" }}>
      <Animated.View
        style={{
          opacity,
          transform: [{ translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: "#0D1B3E",
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 11,
          shadowColor: "#0D1B3E",
          shadowOpacity: 0.2,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <CircleCheck size={16} color="#4ADE80" strokeWidth={2.4} />
        <Text style={{ fontFamily: "BricolageGrotesque_500Medium", fontSize: 14, color: "#FFFFFF", flexShrink: 1 }}>{message}</Text>
      </Animated.View>
    </View>
  );
}
