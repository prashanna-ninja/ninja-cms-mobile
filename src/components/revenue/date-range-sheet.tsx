import * as React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PillButton } from "@/components/client-detail/ui";
import { DateField, todayYmd } from "@/components/forms/date-field";
import { formatCalendarDate } from "@/lib/format";
import { Check } from "@/lib/icons";
import { DATE_PRESETS, matchPreset, presetStart } from "@/lib/revenue";
import { useOrgTheme } from "@/providers/org-theme-provider";

const F = { regular: "BricolageGrotesque_400Regular", medium: "BricolageGrotesque_500Medium", semibold: "BricolageGrotesque_600SemiBold", bold: "BricolageGrotesque_700Bold" };

/** Chip / hero label for a range: "All dates", "This month", or "1 Jul 2026 – 9 Oct 2026". */
export function rangeLabel(from: string, to: string): string {
  if (!from) return "All dates";
  const preset = matchPreset(from, to);
  if (preset) return DATE_PRESETS.find((p) => p.key === preset)!.label;
  const end = to || from;
  return end === from ? formatCalendarDate(from) : `${formatCalendarDate(from)} – ${formatCalendarDate(end)}`;
}

/**
 * Date paid filter — web RevenueDateRangeFilter as a bottom sheet:
 * presets (This week / This month / This financial year → today), a custom
 * from–to range, or All dates. Mount only while open.
 */
export function DateRangeSheet({
  from,
  to,
  onApply,
  onClose,
}: {
  from: string;
  to: string;
  onApply: (range: { from: string; to: string }) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useOrgTheme();
  const active = matchPreset(from, to);
  const [draftFrom, setDraftFrom] = React.useState(active ? "" : from);
  const [draftTo, setDraftTo] = React.useState(active ? "" : to);
  const reversed = !!draftFrom && !!draftTo && draftTo < draftFrom;

  const apply = (range: { from: string; to: string }) => {
    onApply(range);
    onClose();
  };

  const rows: { key: string; label: string; hint?: string; selected: boolean; onPress: () => void }[] = [
    { key: "all", label: "All dates", selected: !from, onPress: () => apply({ from: "", to: "" }) },
    ...DATE_PRESETS.map((p) => {
      const start = presetStart(p.key);
      return {
        key: p.key,
        label: p.label,
        hint: `${formatCalendarDate(start)} – today`,
        selected: active === p.key,
        onPress: () => apply({ from: start, to: todayYmd() }),
      };
    }),
  ];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable accessibilityLabel="Close" onPress={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(13,27,62,0.35)" }} />
        <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingBottom: insets.bottom + 16 }}>
          <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#DCE3EE", marginBottom: 12 }} />
          <Text style={{ fontFamily: F.bold, fontSize: 18, color: "#0D1B3E", paddingHorizontal: 20, marginBottom: 6 }}>Date paid</Text>

          <View style={{ paddingHorizontal: 12 }}>
            {rows.map((r) => (
              <Pressable
                key={r.key}
                accessibilityRole="button"
                accessibilityState={{ selected: r.selected }}
                onPress={r.onPress}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, backgroundColor: r.selected ? theme.soft : "transparent" }}
              >
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={{ fontFamily: r.selected ? F.medium : F.regular, fontSize: 16, color: r.selected ? theme.text : "#0D1B3E" }}>{r.label}</Text>
                  {r.hint ? <Text style={{ fontFamily: F.regular, fontSize: 12, color: "#8A97B5" }}>{r.hint}</Text> : null}
                </View>
                {r.selected ? <Check size={18} color={theme.text} strokeWidth={2.4} /> : null}
              </Pressable>
            ))}
          </View>

          <View style={{ marginTop: 8, marginHorizontal: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#EEF2F8", gap: 10 }}>
            <Text style={{ fontFamily: F.semibold, fontSize: 12, letterSpacing: 1, color: "#7089B8" }}>CUSTOM RANGE</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <DateField label="From" value={draftFrom} onChange={setDraftFrom} placeholder="Start" minYear={2015} maxYear={new Date().getFullYear()} />
              </View>
              <View style={{ flex: 1 }}>
                <DateField label="To" value={draftTo} onChange={setDraftTo} placeholder="Same day"minYear={2015} maxYear={new Date().getFullYear()} />
              </View>
            </View>
            {reversed ? <Text style={{ fontFamily: F.regular, fontSize: 12.5, color: "#DC2626" }}>“To” is before “From”.</Text> : null}
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <PillButton
                label="Apply range"
                filled
                color={theme.base}
                disabled={!draftFrom || reversed}
                onPress={() => apply({ from: draftFrom, to: draftTo || draftFrom })}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
