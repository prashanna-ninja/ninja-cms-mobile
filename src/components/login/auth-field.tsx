import * as React from "react";
import { Animated, Pressable, Text, TextInput, View, type TextInputProps } from "react-native";

import { AUTH, AUTH_FONT } from "@/components/login/auth-palette";
import { useRevealFocusedField } from "@/components/login/auth-screen";
import { Eye, EyeOff } from "@/lib/icons";

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

type AuthFieldProps = Omit<TextInputProps, "style" | "secureTextEntry"> & {
  label: string;
  icon: IconComponent;
  error?: string;
  /** Password mode: masked, with a show/hide toggle. */
  secure?: boolean;
  ref?: React.Ref<TextInput>;
};

/**
 * Boxed input (Ninja PRM design): icon on the left, a small label stacked above
 * the value inside the box. The border animates to brand blue on focus and turns
 * red on error.
 */
export function AuthField({ label, icon: Icon, error, secure = false, onFocus, onBlur, ref, ...props }: AuthFieldProps) {
  const [focused, setFocused] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  const revealFocusedField = useRevealFocusedField();
  // useState, not useRef().current — reading refs during render breaks React Compiler rules.
  const [focusAnim] = React.useState(() => new Animated.Value(0));

  React.useEffect(() => {
    const animation = Animated.timing(focusAnim, {
      toValue: focused ? 1 : 0,
      duration: 160,
      // Border colour can't run on the native driver.
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [focused, focusAnim]);

  const borderColor = error
    ? AUTH.danger
    : focusAnim.interpolate({ inputRange: [0, 1], outputRange: [AUTH.line, AUTH.brand] });

  const iconColor = error ? AUTH.danger : focused ? AUTH.brand : AUTH.muted;

  return (
    <View style={{ gap: 8 }}>
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderWidth: 1.5,
          borderColor,
          borderRadius: 14,
          backgroundColor: error ? AUTH.dangerSoft : AUTH.fieldBg,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Icon size={20} color={iconColor} strokeWidth={1.9} />

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: AUTH_FONT.medium,
              fontSize: 12,
              lineHeight: 16,
              color: error ? AUTH.danger : AUTH.muted,
            }}
          >
            {label}
          </Text>
          <TextInput
            ref={ref}
            secureTextEntry={secure && !revealed}
            placeholderTextColor={AUTH.lineStrong}
            selectionColor={AUTH.brand}
            onFocus={(e) => {
              setFocused(true);
              // Keyboard already up (e.g. "Next" from email → password)? Scroll
              // this field into view — see AuthScreen.
              revealFocusedField();
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={{
              fontFamily: AUTH_FONT.regular,
              fontSize: 16,
              // ⚠️ lineHeight + a little vertical padding stops iOS clipping descenders
              // (CRM bug: "text cut off in the sign-in field").
              lineHeight: 21,
              color: AUTH.ink,
              // RN adds invisible vertical padding on Android; zero it for a tight pair.
              paddingVertical: 2,
              paddingHorizontal: 0,
            }}
            {...props}
          />
        </View>

        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
            onPress={() => setRevealed((v) => !v)}
            hitSlop={12}
            style={{ padding: 2 }}
          >
            {revealed ? (
              <EyeOff size={20} color={AUTH.muted} strokeWidth={1.9} />
            ) : (
              <Eye size={20} color={AUTH.muted} strokeWidth={1.9} />
            )}
          </Pressable>
        ) : null}
      </Animated.View>

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={{ fontFamily: AUTH_FONT.regular, fontSize: 13, lineHeight: 18, color: AUTH.danger }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
