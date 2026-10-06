import { router } from "expo-router";
import * as React from "react";
import { Alert, LayoutAnimation, Pressable, Text, View } from "react-native";

import { useClientFactFind } from "@/api/client-detail.api";
import { C, ErrorNote, F, Loading, PillButton, text } from "@/components/client-detail/ui";
import type { FactFindFieldDef } from "@/lib/fact-find/config";
import { FACT_FIND_SECTIONS, type FactFindSectionDef } from "@/lib/fact-find/sections";
import { SharingUnavailableError, shareFactFindPdf } from "@/lib/fact-find/pdf";
import { isFieldVisible, isObj, str, type Obj } from "@/lib/fact-find/values";
import { formatCalendarDate, formatMoney } from "@/lib/format";
import { ChevronDown, ChevronUp, Download, FileText, Pencil } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";


/** A field's display value from its definition (select → label, yes/no, money, date). Empty → null. */
function display(def: FactFindFieldDef, raw: unknown): string | null {
  const v = str(raw);
  if (!v) return null;
  switch (def.type) {
    case "select":
      return def.options?.find((o) => o.value === v)?.label ?? v;
    case "yesno":
      return v === "yes" ? "Yes" : v === "no" ? "No" : v;
    case "money":
      return formatMoney(v);
    case "date":
      return formatCalendarDate(v);
    default:
      return v;
  }
}

/** Label/value rows for every filled field of `obj`. Fields sharing a name (e.g. state select/text) show once. */
function rows(fields: FactFindFieldDef[], obj: Obj) {
  const seen = new Set<string>();
  const out: { label: string; value: string; heading?: string }[] = [];
  for (const def of fields) {
    if (seen.has(def.name) || !isFieldVisible(def, obj)) continue;
    const value = display(def, obj[def.name]);
    if (value === null) continue;
    seen.add(def.name);
    out.push({ label: def.label, value, heading: def.groupHeading });
  }
  return out;
}

function Rows({ items }: { items: { label: string; value: string; heading?: string }[] }) {
  return (
    <View style={{ gap: 10 }}>
      {items.map((r, i) => (
        <View key={`${r.label}-${i}`} style={{ gap: 2 }}>
          {r.heading ? <Text style={[text.label, { letterSpacing: 0.8, marginTop: 6, color: C.ink }]}>{r.heading.toUpperCase()}</Text> : null}
          <Text style={text.label}>{r.label}</Text>
          <Text style={[text.body, { color: C.ink }]}>{r.value}</Text>
        </View>
      ))}
    </View>
  );
}

/** How much of a section is filled, for the collapsed header ("3 fields", "2 dependants"). */
function summarise(def: FactFindSectionDef, value: unknown): string {
  if (!isObj(value)) return "Not filled in";
  let count = 0;
  for (const person of ["client1", "client2"]) if (def.person && isObj(value[person])) count += rows(def.person, value[person] as Obj).length;
  if (def.root) count += rows(def.root, value).length;
  let items = 0;
  for (const list of def.lists ?? []) if (Array.isArray(value[list.key])) items += (value[list.key] as unknown[]).length;
  if (!count && !items) return "Not filled in";
  return [items ? `${items} item${items === 1 ? "" : "s"}` : null, count ? `${count} field${count === 1 ? "" : "s"}` : null].filter(Boolean).join(" · ");
}

function SectionBody({ def, value }: { def: FactFindSectionDef; value: Obj }) {
  const blocks: React.ReactNode[] = [];

  if (def.person) {
    for (const [key, label] of [["client1", "Client 1"], ["client2", "Client 2"]] as const) {
      const p = value[key];
      const r = isObj(p) ? rows(def.person, p) : [];
      if (!r.length) continue;
      blocks.push(
        <View key={key} style={{ gap: 8, borderWidth: 1, borderColor: C.hairline, borderRadius: 12, padding: 12 }}>
          <Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.ink }}>{label}</Text>
          <Rows items={r} />
        </View>,
      );
    }
  }

  for (const list of def.lists ?? []) {
    const items = Array.isArray(value[list.key]) ? (value[list.key] as unknown[]).filter(isObj) : [];
    blocks.push(
      <View key={list.key} style={{ gap: 8 }}>
        {def.lists!.length > 1 ? <Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.ink }}>{list.label}</Text> : null}
        {items.length === 0 ? (
          <Text style={text.meta}>{`No ${list.label.toLowerCase()} added yet.`}</Text>
        ) : (
          items.map((item, i) => (
            <View key={str(item.id) || i} style={{ gap: 8, borderWidth: 1, borderColor: C.hairline, borderRadius: 12, padding: 12 }}>
              <Text style={{ fontFamily: F.semibold, fontSize: 13, color: C.muted }}>{`${list.itemLabel} ${i + 1}`}</Text>
              <Rows items={rows(list.fields, item)} />
            </View>
          ))
        )}
      </View>,
    );
  }

  if (def.root) {
    const r = rows(def.root, value);
    if (r.length) blocks.push(<Rows key="root" items={r} />);
  }

  return blocks.length ? <View style={{ gap: 12 }}>{blocks}</View> : <Text style={text.meta}>Nothing recorded in this section yet.</Text>;
}

/**
 * Fact Find — the 15 web sections as collapsible cards (labels/options from the ported
 * web config, lib/fact-find). "Edit" opens the section editor (clients/fact-find.tsx).
 */
export function FactFindSection({ adviceId, clientId, clientName }: { adviceId: string; clientId: string; clientName: string }) {
  const { theme } = useOrgTheme();
  const q = useClientFactFind(adviceId, clientId);
  const [open, setOpen] = React.useState<Set<string>>(() => new Set());
  const [pdfPending, setPdfPending] = React.useState(false);

  const generatePdf = () => {
    setPdfPending(true);
    shareFactFindPdf(adviceId, clientId, clientName)
      .catch((err: unknown) =>
        Alert.alert(err instanceof SharingUnavailableError ? "Update the app" : "Couldn't generate PDF", err instanceof Error ? err.message : "Please try again."),
      )
      .finally(() => setPdfPending(false));
  };

  if (q.isPending) return <Loading />;
  if (q.isError) return <ErrorNote message={q.error.message} onRetry={() => void q.refetch()} />;
  const data = q.data;

  const toggle = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#EFF4FF", alignItems: "center", justifyContent: "center" }}>
          <FileText size={17} color="#2563EB" strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={text.value}>Fact find PDF</Text>
          <Text style={text.meta}>All sections, ready to save or send.</Text>
        </View>
        <PillButton label={pdfPending ? "Generating…" : "Generate PDF"} icon={Download} color={theme.text} disabled={pdfPending} onPress={generatePdf} />
      </View>

      {FACT_FIND_SECTIONS.map((def) => {
        const value = data[def.key];
        const isOpen = open.has(def.key);
        const summary = summarise(def, value);
        const empty = summary === "Not filled in";
        return (
          <View key={def.key} style={{ backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: "hidden" }}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              onPress={() => toggle(def.key)}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: empty ? "#CBD5E1" : theme.base }} />
              <View style={{ flex: 1 }}>
                <Text style={text.value}>{def.label}</Text>
                <Text style={text.meta}>{summary}</Text>
              </View>
              {isOpen ? <ChevronUp size={18} color="#8A97B5" strokeWidth={2.2} /> : <ChevronDown size={18} color="#8A97B5" strokeWidth={2.2} />}
            </Pressable>
            {isOpen ? (
              <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
                <View style={{ height: 1, backgroundColor: C.hairline, marginBottom: 12 }} />
                <SectionBody def={def} value={isObj(value) ? value : {}} />
                <View style={{ alignItems: "flex-end", marginTop: 12 }}>
                  <PillButton
                    label={empty ? "Fill in" : "Edit"}
                    icon={Pencil}
                    color={theme.text}
                    onPress={() => router.push({ pathname: "/clients/fact-find", params: { id: clientId, section: def.key } })}
                  />
                </View>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
