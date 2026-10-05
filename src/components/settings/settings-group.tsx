import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { ChevronRight, ExternalLink } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

const FONT = {
  regular: "BricolageGrotesque_400Regular",
  medium: "BricolageGrotesque_500Medium",
  semibold: "BricolageGrotesque_600SemiBold",
};

/** A titled, rounded group of rows with hairline separators (inset grouped list). */
export function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.2, color: "#7C8AA8", marginLeft: 4 }}>
        {title.toUpperCase()}
      </Text>
      <View style={{ backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E4EAF3", overflow: "hidden" }}>
        {rows.map((row, i) => (
          <View key={i}>
            {i > 0 ? <View style={{ height: 1, backgroundColor: "#EEF2F8", marginLeft: 62 }} /> : null}
            {row}
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * One row: org-tinted icon tile, label (+ optional caption), and on the right a
 * value, a chevron (navigates) or an external-link glyph (opens the web).
 * Rows with `onPress` dim while pressed (hand-tracked — NativeWind drops
 * function styles on Pressable).
 */
export function SettingsRow({
  icon: Icon,
  label,
  caption,
  value,
  onPress,
  trailing = onPress ? "chevron" : "none",
  leading,
}: {
  icon?: IconComponent;
  label: string;
  caption?: string;
  value?: string;
  onPress?: () => void;
  trailing?: "chevron" | "external" | "none";
  /** Replaces the icon tile (e.g. an org colour swatch). */
  leading?: React.ReactNode;
}) {
  const { theme } = useOrgTheme();
  const [pressed, setPressed] = React.useState(false);

  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 14,
        paddingVertical: 13,
        backgroundColor: pressed ? "#F5F8FC" : "#FFFFFF",
      }}
    >
      {leading ?? (
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: theme.soft, alignItems: "center", justifyContent: "center" }}>
          {Icon ? <Icon size={17} color={theme.text} strokeWidth={2} /> : null}
        </View>
      )}
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={{ fontFamily: FONT.medium, fontSize: 15, color: "#0D1B3E" }}>{label}</Text>
        {caption ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: "#7C8AA8" }}>{caption}</Text> : null}
      </View>
      {value ? (
        <Text numberOfLines={1} style={{ maxWidth: "55%", fontFamily: FONT.regular, fontSize: 14, color: "#5B6B8C" }}>
          {value}
        </Text>
      ) : null}
      {trailing === "chevron" ? <ChevronRight size={18} color="#A3AFC6" strokeWidth={2.2} /> : null}
      {trailing === "external" ? <ExternalLink size={16} color="#A3AFC6" strokeWidth={2.2} /> : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={caption ? `${label}, ${caption}` : label}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      {content}
    </Pressable>
  );
}
