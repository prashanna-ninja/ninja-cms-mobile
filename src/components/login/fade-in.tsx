import * as React from "react";
import { Animated, Easing, type ViewProps } from "react-native";

/**
 * A small entrance animation: fade + rise.
 *
 * React Native's built-in Animated (not Reanimated) on purpose — no worklets, so
 * it can't break a build. `useNativeDriver` keeps it off the JS thread.
 * Stagger a group with an increasing `delay` (60–70ms reads well).
 */
export function FadeIn({
  delay = 0,
  distance = 10,
  duration = 420,
  style,
  children,
  ...props
}: ViewProps & { delay?: number; distance?: number; duration?: number }) {
  // useState (not useRef().current) so the React Compiler can see it is stable — reading
  // a ref during render breaks its rules (eslint react-hooks/refs).
  const [progress] = React.useState(() => new Animated.Value(0));

  React.useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, delay, duration]);

  return (
    <Animated.View
      style={[
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
          ],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
