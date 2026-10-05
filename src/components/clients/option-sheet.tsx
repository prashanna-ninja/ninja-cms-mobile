import * as React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Check } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";

const FONT = {
  regular: "BricolageGrotesque_400Regular",
  medium: "BricolageGrotesque_500Medium",
  bold: "BricolageGrotesque_700Bold",
};

export type SheetOption = { value: string; label: string; color?: string | null };

/**
 * A bottom sheet with a single-choice list — the phone version of the web's
 * filter dropdowns (All tags / All types / All sources). The selected row is
 * org-tinted with a check. Built on RN Modal: no native dependency, works in Expo Go.
 */
export function OptionSheet({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: SheetOption[];
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useOrgTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable accessibilityLabel="Close" onPress={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(13,27,62,0.35)" }} />
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 10,
            paddingBottom: insets.bottom + 12,
            maxHeight: "70%",
          }}
        >
          <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#DCE3EE", marginBottom: 12 }} />
          <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: "#0D1B3E", paddingHorizontal: 20, marginBottom: 8 }}>{title}</Text>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 12 }}>
            {options.map((opt) => {
              const selected = opt.value === value;
              return (
                <Pressable
                  key={opt.value || "__all"}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: selected ? theme.soft : "transparent",
                  }}
                >
                  {opt.color !== undefined ? (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: opt.color ?? "#64748B" }} />
                  ) : null}
                  <Text style={{ flex: 1, fontFamily: selected ? FONT.medium : FONT.regular, fontSize: 16, color: selected ? theme.text : "#0D1B3E" }}>
                    {opt.label}
                  </Text>
                  {selected ? <Check size={18} color={theme.text} strokeWidth={2.4} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
