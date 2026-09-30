import * as React from "react";
import { ActivityIndicator, Pressable, Text, View, type PressableProps } from "react-native";

import { AUTH, AUTH_FONT } from "@/components/login/auth-palette";

type AuthButtonProps = Omit<PressableProps, "style" | "children"> & {
  label: string;
  /** "primary" = the one brand fill. "quiet" = a text action. */
  variant?: "primary" | "quiet";
  loading?: boolean;
  icon?: React.ReactNode;
};

/**
 * ⚠️ Do NOT give the Pressable a FUNCTION style (`style={({pressed}) => …}`).
 * NativeWind 4 wraps RN components for `className`, and that wrapper drops the
 * function form — the button renders with no background: an invisible-but-
 * tappable box (real device bug in Ninja PRM). Track `pressed` ourselves and
 * pass a plain style OBJECT.
 */
export function AuthButton({
  label,
  variant = "primary",
  loading = false,
  icon,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: AuthButtonProps) {
  const [pressed, setPressed] = React.useState(false);
  const isPrimary = variant === "primary";
  const isDisabled = disabled || loading;

  const background = isPrimary ? (pressed && !isDisabled ? AUTH.brandPressed : AUTH.brand) : "transparent";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={{
        height: isPrimary ? 56 : 46,
        borderRadius: 999,
        backgroundColor: background,
        // Dim rather than grey out: reads as "not yet", not "broken".
        opacity: isDisabled ? 0.55 : !isPrimary && pressed ? 0.6 : 1,
      }}
      {...props}
    >
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 }}>
        {loading ? <ActivityIndicator size="small" color={isPrimary ? AUTH.white : AUTH.muted} /> : icon}
        <Text
          style={{
            fontFamily: AUTH_FONT.semibold,
            fontSize: isPrimary ? 17 : 14,
            color: isPrimary ? AUTH.white : AUTH.inkSoft,
            letterSpacing: isPrimary ? 0.1 : 0,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
