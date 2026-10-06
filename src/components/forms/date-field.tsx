import * as React from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatCalendarDate } from "@/lib/format";
import { ArrowLeft, Calendar, ChevronDown, ChevronRight, X } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";

const F = { regular: "BricolageGrotesque_400Regular", medium: "BricolageGrotesque_500Medium", semibold: "BricolageGrotesque_600SemiBold", bold: "BricolageGrotesque_700Bold" };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["M", "T", "W", "T", "F", "S", "S"];

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
function parse(value: string | null | undefined): { y: number; m: number; d: number } | null {
  const r = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "");
  return r ? { y: Number(r[1]), m: Number(r[2]) - 1, d: Number(r[3]) } : null;
}
/** Today as a calendar date in Brisbane (the product's timezone), "YYYY-MM-DD". */
export function todayYmd(): string {
  try {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Brisbane", year: "numeric", month: "2-digit", day: "2-digit" })
        .formatToParts(new Date())
        .map((x) => [x.type, x.value]),
    );
    return `${p.year}-${p.month}-${p.day}`;
  } catch {
    const d = new Date();
    return ymd(d.getFullYear(), d.getMonth(), d.getDate());
  }
}

/**
 * A date input that opens a calendar sheet — pure JS (no native date picker
 * module, works in Expo Go). Value is a calendar date string "YYYY-MM-DD" (what the
 * CMS stores for DOB, consent and review dates), or "" when empty.
 */
export function DateField({
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  error,
  clearable = true,
  minYear = 1900,
  maxYear = new Date().getFullYear() + 10,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  clearable?: boolean;
  minYear?: number;
  maxYear?: number;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={{ fontFamily: F.medium, fontSize: 13, color: "#3B4A68" }}>{label}</Text> : null}
      {/* Field + clear are siblings (a button inside a button is invalid on web / for screen readers). */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: error ? "#DC2626" : "#DCE3EE",
          borderRadius: 12,
          height: 46,
          backgroundColor: "#FFFFFF",
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label ?? "Date"}: ${value ? formatCalendarDate(value) : "not set"}. Change`}
          onPress={() => setOpen(true)}
          style={{ flex: 1, alignSelf: "stretch", flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 12, paddingRight: value && clearable ? 4 : 12 }}
        >
          <Calendar size={16} color="#8A97B5" strokeWidth={2} />
          <Text style={{ flex: 1, fontFamily: F.regular, fontSize: 15, color: value ? "#0D1B3E" : "#A3AFC6" }}>
            {value ? formatCalendarDate(value) : placeholder}
          </Text>
        </Pressable>
        {value && clearable ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear date" hitSlop={10} onPress={() => onChange("")} style={{ paddingHorizontal: 12, alignSelf: "stretch", justifyContent: "center" }}>
            <X size={16} color="#8A97B5" strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={{ fontFamily: F.regular, fontSize: 12.5, color: "#DC2626" }}>{error}</Text> : null}
      {open ? (
        <CalendarSheet
          title={label ?? "Pick a date"}
          value={value}
          minYear={minYear}
          maxYear={maxYear}
          onSelect={(v) => {
            onChange(v);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </View>
  );
}

function CalendarSheet({
  title,
  value,
  minYear,
  maxYear,
  onSelect,
  onClose,
}: {
  title: string;
  value: string;
  minYear: number;
  maxYear: number;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useOrgTheme();
  const today = parse(todayYmd())!;
  const selected = parse(value);
  const [cursor, setCursor] = React.useState(() => ({ y: selected?.y ?? today.y, m: selected?.m ?? today.m }));
  const [pickYear, setPickYear] = React.useState(false);

  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const firstDow = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7; // Monday-first
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const step = (delta: number) =>
    setCursor((c) => {
      const m = c.m + delta;
      const y = c.y + Math.floor(m / 12);
      return { y: Math.min(maxYear, Math.max(minYear, y)), m: ((m % 12) + 12) % 12 };
    });

  const years = React.useMemo(() => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i), [minYear, maxYear]);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable accessibilityLabel="Close" onPress={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(13,27,62,0.35)" }} />
        <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingBottom: insets.bottom + 16, paddingHorizontal: 18 }}>
          <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#DCE3EE", marginBottom: 12 }} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 18, color: "#0D1B3E" }}>{title}</Text>
            <Pressable accessibilityRole="button" onPress={() => onSelect(todayYmd())} hitSlop={8}>
              <Text style={{ fontFamily: F.semibold, fontSize: 14, color: theme.text }}>Today</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => step(-1)} hitSlop={10} style={{ padding: 6 }}>
              <ArrowLeft size={18} color="#3B4A68" strokeWidth={2.2} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose year"
              onPress={() => setPickYear((v) => !v)}
              style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#F3F6FB" }}
            >
              <Text style={{ fontFamily: F.semibold, fontSize: 15, color: "#0D1B3E" }}>{`${MONTHS[cursor.m]} ${cursor.y}`}</Text>
              <ChevronDown size={15} color="#3B4A68" strokeWidth={2.4} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => step(1)} hitSlop={10} style={{ padding: 6 }}>
              <ChevronRight size={18} color="#3B4A68" strokeWidth={2.2} />
            </Pressable>
          </View>

          {pickYear ? (
            <FlatList
              data={years}
              keyExtractor={(y) => String(y)}
              numColumns={4}
              style={{ height: 300 }}
              renderItem={({ item }) => {
                const active = item === cursor.y;
                return (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setCursor((c) => ({ ...c, y: item }));
                      setPickYear(false);
                    }}
                    style={{ flex: 1, alignItems: "center", paddingVertical: 12, margin: 3, borderRadius: 12, backgroundColor: active ? theme.base : "#F7F9FC" }}
                  >
                    <Text style={{ fontFamily: active ? F.semibold : F.regular, fontSize: 15, color: active ? theme.onBase : "#0D1B3E" }}>{item}</Text>
                  </Pressable>
                );
              }}
            />
          ) : (
            <View>
              <View style={{ flexDirection: "row" }}>
                {DOW.map((d, i) => (
                  <Text key={i} style={{ flex: 1, textAlign: "center", fontFamily: F.medium, fontSize: 12, color: "#8A97B5", paddingVertical: 6 }}>{d}</Text>
                ))}
              </View>
              {Array.from({ length: cells.length / 7 }, (_, row) => (
                <View key={row} style={{ flexDirection: "row" }}>
                  {cells.slice(row * 7, row * 7 + 7).map((day, i) => {
                    if (!day) return <View key={i} style={{ flex: 1, height: 44 }} />;
                    const isSel = selected && selected.y === cursor.y && selected.m === cursor.m && selected.d === day;
                    const isToday = today.y === cursor.y && today.m === cursor.m && today.d === day;
                    return (
                      <Pressable
                        key={i}
                        accessibilityRole="button"
                        accessibilityLabel={formatCalendarDate(ymd(cursor.y, cursor.m, day))}
                        accessibilityState={{ selected: !!isSel }}
                        onPress={() => onSelect(ymd(cursor.y, cursor.m, day))}
                        style={{ flex: 1, height: 44, alignItems: "center", justifyContent: "center" }}
                      >
                        <View
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 19,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: isSel ? theme.base : "transparent",
                            borderWidth: isToday && !isSel ? 1.5 : 0,
                            borderColor: theme.base,
                          }}
                        >
                          <Text style={{ fontFamily: isSel ? F.semibold : F.regular, fontSize: 15, color: isSel ? theme.onBase : "#0D1B3E" }}>{day}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
