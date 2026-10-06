import * as React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { C, F, text } from "@/components/client-detail/ui";
import { OptionSheet } from "@/components/clients/option-sheet";
import { DateField } from "@/components/forms/date-field";
import type { FactFindFieldDef } from "@/lib/fact-find/config";
import { raw, sanitizeMoney } from "@/lib/fact-find/values";
import { ChevronDown } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";

const inputStyle = {
  borderWidth: 1,
  borderColor: "#DCE3EE",
  borderRadius: 12,
  paddingHorizontal: 12,
  minHeight: 46,
  fontFamily: F.regular,
  fontSize: 15,
  color: C.ink,
  backgroundColor: "#FFFFFF",
} as const;

/**
 * One fact-find input, driven by the ported web field definition (web FactFindField):
 * text · textarea · money ($, digits + one dot) · date (calendar sheet) · yes/no (chips, tap again to clear) ·
 * select (bottom sheet with "Not specified"). Values are strings, "" = not set.
 */
export function FactFindField({ def, value, onChange }: { def: FactFindFieldDef; value: unknown; onChange: (v: string) => void }) {
  const { theme } = useOrgTheme();
  const [sheet, setSheet] = React.useState(false);
  const v = raw(value);

  let control: React.ReactNode;
  switch (def.type) {
    case "textarea":
      control = (
        <TextInput
          value={v}
          onChangeText={onChange}
          placeholder={def.placeholder}
          placeholderTextColor="#A3AFC6"
          selectionColor={theme.base}
          multiline
          textAlignVertical="top"
          style={[inputStyle, { paddingTop: 12, paddingBottom: 12, minHeight: 92 }]}
        />
      );
      break;
    case "money":
      control = (
        <View style={{ justifyContent: "center" }}>
          <Text style={{ position: "absolute", left: 12, fontFamily: F.medium, fontSize: 15, color: C.faint }}>$</Text>
          <TextInput
            value={v}
            onChangeText={(t) => onChange(sanitizeMoney(t))}
            placeholder={def.placeholder ?? "0"}
            placeholderTextColor="#A3AFC6"
            selectionColor={theme.base}
            keyboardType="decimal-pad"
            style={[inputStyle, { paddingLeft: 26 }]}
          />
        </View>
      );
      break;
    case "date":
      return <DateField label={def.label} value={v.slice(0, 10)} onChange={onChange} placeholder="Not specified" />;
    case "yesno":
      control = (
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["yes", "no"] as const).map((opt) => {
            const active = v === opt;
            return (
              <Pressable
                key={opt}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => onChange(active ? "" : opt)}
                style={{
                  minWidth: 76,
                  alignItems: "center",
                  paddingVertical: 10,
                  borderRadius: 999,
                  borderWidth: 1.5,
                  borderColor: active ? theme.base : "#DCE3EE",
                  backgroundColor: active ? theme.soft : "#FFFFFF",
                }}
              >
                <Text style={{ fontFamily: active ? F.semibold : F.medium, fontSize: 14, color: active ? theme.text : "#3B4A68" }}>{opt === "yes" ? "Yes" : "No"}</Text>
              </Pressable>
            );
          })}
        </View>
      );
      break;
    case "select": {
      const options = def.options ?? [];
      const label = options.find((o) => o.value === v)?.label ?? (v || "");
      control = (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${def.label}: ${label || "Not specified"}`}
            onPress={() => setSheet(true)}
            style={[inputStyle, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
          >
            <Text style={{ fontFamily: F.regular, fontSize: 15, color: label ? C.ink : "#A3AFC6" }}>{label || "Not specified"}</Text>
            <ChevronDown size={16} color="#6B7A99" strokeWidth={2.2} />
          </Pressable>
          <OptionSheet
            visible={sheet}
            title={def.label}
            value={v}
            options={[{ value: "", label: "Not specified" }, ...options]}
            onSelect={onChange}
            onClose={() => setSheet(false)}
          />
        </>
      );
      break;
    }
    default:
      control = (
        <TextInput
          value={v}
          onChangeText={onChange}
          placeholder={def.placeholder}
          placeholderTextColor="#A3AFC6"
          selectionColor={theme.base}
          autoCapitalize={def.name.toLowerCase().includes("email") ? "none" : "sentences"}
          keyboardType={def.name.toLowerCase().includes("email") ? "email-address" : def.name === "mobile" ? "phone-pad" : "default"}
          style={inputStyle}
        />
      );
  }

  return (
    <View style={{ gap: 6 }}>
      <Text style={[text.label, { fontSize: 13, color: "#3B4A68" }]}>{def.label}</Text>
      {control}
    </View>
  );
}
