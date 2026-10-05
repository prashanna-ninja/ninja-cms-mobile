import * as React from "react";
import { ActivityIndicator, Pressable, Text, View, type TextStyle } from "react-native";

import { Inbox } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

/** Shared look for the client detail sections (web: rounded-2xl white cards, border #D6E0F2). */
export const C = {
  ink: "#0D1B3E",
  body: "#1F2A44",
  muted: "#7089B8",
  faint: "#9AA6BF",
  border: "#D6E0F2",
  hairline: "#EEF2F8",
  danger: "#DC2626",
} as const;

export const F = {
  regular: "BricolageGrotesque_400Regular",
  medium: "BricolageGrotesque_500Medium",
  semibold: "BricolageGrotesque_600SemiBold",
  bold: "BricolageGrotesque_700Bold",
} as const;

export const text = {
  title: { fontFamily: F.bold, fontSize: 16, color: C.ink } satisfies TextStyle,
  label: { fontFamily: F.medium, fontSize: 12, color: C.muted } satisfies TextStyle,
  value: { fontFamily: F.medium, fontSize: 15, color: C.ink } satisfies TextStyle,
  body: { fontFamily: F.regular, fontSize: 14.5, lineHeight: 21, color: C.body } satisfies TextStyle,
  meta: { fontFamily: F.regular, fontSize: 12.5, color: C.faint } satisfies TextStyle,
};

/** A section card: optional header (tinted icon tile + title + right slot), then content. */
export function Card({
  icon: Icon,
  iconBg = "#F3F5F9",
  iconFg = "#4B5A78",
  title,
  right,
  children,
  padded = true,
}: {
  icon?: IconComponent;
  iconBg?: string;
  iconFg?: string;
  title?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <View style={{ backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: C.border, overflow: "hidden" }}>
      {title ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 14, paddingBottom: padded ? 4 : 12 }}>
          {Icon ? (
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: iconBg, alignItems: "center", justifyContent: "center" }}>
              <Icon size={16} color={iconFg} strokeWidth={2} />
            </View>
          ) : null}
          <Text style={[text.title, { flex: 1 }]}>{title}</Text>
          {right}
        </View>
      ) : null}
      <View style={padded ? { paddingHorizontal: 16, paddingBottom: 14, paddingTop: title ? 4 : 14 } : undefined}>{children}</View>
    </View>
  );
}

/** Label above value with a small icon tile (web InfoRow). Hidden when there's no value. */
export function InfoRow({
  icon: Icon,
  label,
  value,
  onPress,
  last,
  children,
}: {
  icon: IconComponent;
  label: string;
  value?: string | null;
  onPress?: () => void;
  last?: boolean;
  children?: React.ReactNode;
}) {
  const { theme } = useOrgTheme();
  if (!value && !children) return null;
  const content = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderBottomWidth: last ? 0 : 1, borderBottomColor: C.hairline }}>
      <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: "#F5F7FB", alignItems: "center", justifyContent: "center" }}>
        <Icon size={15} color="#6B7A99" strokeWidth={2} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={text.label}>{label}</Text>
        {children ?? <Text style={[text.value, onPress ? { color: theme.text } : null]}>{value}</Text>}
      </View>
    </View>
  );
  return onPress ? (
    <Pressable accessibilityRole="link" accessibilityLabel={`${label}: ${value}`} onPress={onPress}>
      {content}
    </Pressable>
  ) : (
    content
  );
}

/** Dashed empty state used by every section (web PortalEmptyState-style). */
export function Empty({
  icon: Icon = Inbox,
  title,
  message,
}: {
  icon?: IconComponent;
  title: string;
  message?: string;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        gap: 6,
        paddingVertical: 28,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#DCE3EE",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Icon size={22} color="#9AAACB" strokeWidth={1.8} />
      <Text style={{ fontFamily: F.semibold, fontSize: 15, color: C.ink, textAlign: "center" }}>{title}</Text>
      {message ? <Text style={{ fontFamily: F.regular, fontSize: 13.5, color: "#6B7A99", textAlign: "center" }}>{message}</Text> : null}
    </View>
  );
}

/** A displayable message from any thrown value. */
export const errorMessage = (err: unknown, fallback = "Something went wrong.") =>
  err instanceof Error && err.message ? err.message : fallback;

export function Loading() {
  return <ActivityIndicator style={{ paddingVertical: 28 }} color="#8A97B5" />;
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={{ backgroundColor: "#FEF2F2", borderRadius: 14, padding: 14, gap: 6 }}>
      <Text style={{ fontFamily: F.regular, fontSize: 14, color: C.danger }}>{message}</Text>
      {onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} hitSlop={8}>
          <Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.danger }}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** A small bordered pill button (Open, Rename, Delete…). Hand-tracked pressed state (NativeWind). */
export function PillButton({
  label,
  icon: Icon,
  onPress,
  tone = "neutral",
  disabled,
  filled,
  color,
}: {
  label: string;
  icon?: IconComponent;
  onPress: () => void;
  tone?: "neutral" | "danger";
  disabled?: boolean;
  /** Filled with `color` (primary action). */
  filled?: boolean;
  color?: string;
}) {
  const [pressed, setPressed] = React.useState(false);
  const fg = filled ? "#FFFFFF" : tone === "danger" ? C.danger : color ?? "#3B4A68";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: filled ? 0 : 1,
        borderColor: tone === "danger" ? "#F5D0D0" : "#DCE3EE",
        backgroundColor: filled ? (color ?? "#1A4DB3") : pressed ? "#F5F7FB" : "#FFFFFF",
        opacity: disabled ? 0.5 : pressed && filled ? 0.85 : 1,
      }}
    >
      {Icon ? <Icon size={14} color={fg} strokeWidth={2.2} /> : null}
      <Text style={{ fontFamily: F.semibold, fontSize: 13, color: fg }}>{label}</Text>
    </Pressable>
  );
}
