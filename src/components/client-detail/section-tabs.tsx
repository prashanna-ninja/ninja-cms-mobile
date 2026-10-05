import * as React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { F } from "@/components/client-detail/ui";
import { Activity, CalendarClock, DollarSign, FileText, Folder, LayoutGrid, StickyNote } from "@/lib/icons";

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export type SectionKey = "overview" | "revenue" | "fact-find" | "files" | "notes" | "annual-consent" | "activity";

/**
 * The web's section pills (components/clients/ClientOverviewQuickLinks.tsx):
 * same order, labels, lucide icons and accent tints (Tailwind -50 bg / -600 fg).
 */
export const SECTIONS: { key: SectionKey; label: string; icon: IconComponent; bg: string; fg: string }[] = [
  { key: "overview", label: "Overview", icon: LayoutGrid, bg: "#F5F5F5", fg: "#525252" },
  { key: "revenue", label: "Revenue", icon: DollarSign, bg: "#ECFDF5", fg: "#059669" },
  { key: "fact-find", label: "Fact Find", icon: FileText, bg: "#EFF6FF", fg: "#2563EB" },
  { key: "files", label: "Files", icon: Folder, bg: "#FFFBEB", fg: "#D97706" },
  { key: "notes", label: "File Notes", icon: StickyNote, bg: "#F5F3FF", fg: "#7C3AED" },
  { key: "annual-consent", label: "Ongoing client", icon: CalendarClock, bg: "#F0FDFA", fg: "#0F766E" },
  { key: "activity", label: "Activity Log", icon: Activity, bg: "#F1F5F9", fg: "#475569" },
];

/** Horizontally scrolling pills; the active one gets a darker border + soft fill. */
export function SectionTabs({
  sections,
  value,
  onChange,
}: {
  sections: typeof SECTIONS;
  value: SectionKey;
  onChange: (key: SectionKey) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
      {sections.map((s) => {
        const active = s.key === value;
        const Icon = s.icon;
        return (
          <Pressable
            key={s.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(s.key)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingLeft: 6,
              paddingRight: 13,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: active ? "#94A3B8" : "#E2E8F0",
              backgroundColor: active ? "#FFFFFF" : "#FFFFFFB3",
              shadowColor: "#0D1B3E",
              shadowOpacity: active ? 0.08 : 0,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
              elevation: active ? 1 : 0,
            }}
          >
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: s.bg, alignItems: "center", justifyContent: "center" }}>
              <Icon size={13} color={s.fg} strokeWidth={1.9} />
            </View>
            <Text style={{ fontFamily: active ? F.semibold : F.medium, fontSize: 13.5, color: active ? "#0D1B3E" : "#3B4A68" }}>
              {s.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
