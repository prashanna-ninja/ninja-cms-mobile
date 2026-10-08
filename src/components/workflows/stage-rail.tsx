import * as React from "react";
import { Pressable, ScrollView, Text, View, type LayoutChangeEvent } from "react-native";

import { C, F } from "@/components/client-detail/ui";
import { Plus } from "@/lib/icons";
import { splitStageName } from "@/lib/workflows";
import { useOrgTheme } from "@/providers/org-theme-provider";

export type RailStage = { id: string; name: string; count: number; overdue: number };

/**
 * The board's stages as a horizontal "pipeline rail": numbered nodes joined by a line, the
 * stage name and its client count under each. The active stage is filled in the org colour,
 * and the rail keeps it in view as you swipe between stages. A red dot marks overdue work.
 */
export function StageRail({
  stages,
  active,
  onSelect,
  onAddStage,
}: {
  stages: RailStage[];
  active: number;
  onSelect: (index: number) => void;
  /** Owners only: a dashed "+" node after the last stage (web: "Add a stage" column). */
  onAddStage?: () => void;
}) {
  const { theme } = useOrgTheme();
  const scroll = React.useRef<ScrollView>(null);
  const offsets = React.useRef<number[]>([]);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const x = offsets.current[active];
    if (x !== undefined && width) scroll.current?.scrollTo({ x: Math.max(0, x - width / 2 + 52), animated: true });
  }, [active, width]);

  return (
    <ScrollView
      ref={scroll}
      horizontal
      // Without flexGrow 0 a horizontal ScrollView stretches to fill the column (big gap under the rail).
      style={{ flexGrow: 0 }}
      showsHorizontalScrollIndicator={false}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 10 }}
    >
      {stages.map((s, i) => {
        const on = i === active;
        const done = i < active;
        const { title } = splitStageName(s.name);
        return (
          <View
            key={s.id}
            onLayout={(e: LayoutChangeEvent) => {
              offsets.current[i] = e.nativeEvent.layout.x;
            }}
            style={{ width: 104, alignItems: "center" }}
          >
            {/* connector to the next node */}
            {i < stages.length - 1 ? (
              <View style={{ position: "absolute", top: 15, left: 52 + 16, width: 104 - 32, height: 2, borderRadius: 1, backgroundColor: done ? theme.base : theme.line }} />
            ) : null}
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${s.name}, ${s.count} ${s.count === 1 ? "client" : "clients"}`}
              onPress={() => onSelect(i)}
              hitSlop={6}
              style={{ alignItems: "center", gap: 6, width: 100 }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: on ? theme.base : done ? theme.soft : "#FFFFFF",
                  borderWidth: on ? 0 : 1.5,
                  borderColor: done ? theme.base : "#D6E0F2",
                  transform: [{ scale: on ? 1.08 : 1 }],
                }}
              >
                <Text style={{ fontFamily: F.bold, fontSize: 13, color: on ? theme.onBase : done ? theme.text : C.muted }}>{i + 1}</Text>
                {s.overdue > 0 ? (
                  <View style={{ position: "absolute", top: -1, right: -1, width: 10, height: 10, borderRadius: 5, backgroundColor: C.danger, borderWidth: 2, borderColor: "#F0F4FB" }} />
                ) : null}
              </View>
              <Text numberOfLines={2} style={{ textAlign: "center", fontFamily: on ? F.semibold : F.medium, fontSize: 12, lineHeight: 15, color: on ? C.ink : "#5B6B8C" }}>
                {title}
              </Text>
              <View style={{ backgroundColor: on ? theme.soft : "#E8EEF7", borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 }}>
                <Text style={{ fontFamily: F.bold, fontSize: 10.5, color: on ? theme.text : C.muted }}>{s.count}</Text>
              </View>
            </Pressable>
          </View>
        );
      })}
      {onAddStage ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Add a stage" onPress={onAddStage} hitSlop={6} style={{ width: 84, alignItems: "center", gap: 6 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed", borderColor: theme.base, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
            <Plus size={16} color={theme.text} strokeWidth={2.4} />
          </View>
          <Text style={{ fontFamily: F.medium, fontSize: 12, color: theme.text }}>Add stage</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}
