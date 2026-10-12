import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { useClientDetail, useClientFactFind, useSaveFactFindSection } from "@/api/client-detail.api";
import { AppHeader } from "@/components/app-header";
import { C, ErrorNote, F, Loading, PillButton, errorMessage, text } from "@/components/client-detail/ui";
import { FormScreenHeader } from "@/components/clients/form-screen-header";
import { FactFindField, type FieldValue } from "@/components/fact-find/fact-find-field";
import { useKeyboard } from "@/hooks/use-keyboard";
import type { FactFindFieldDef } from "@/lib/fact-find/config";
import { FACT_FIND_SECTIONS, listFields, type FactFindSectionDef } from "@/lib/fact-find/sections";
import { cleanForSave, isObj, newRowId, visibleFields, type Obj } from "@/lib/fact-find/values";
import { Plus, Trash } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";

/**
 * Edit one fact-find section — `clients/fact-find?id=&section=`. The web edits every section inline;
 * on a phone each section gets its own screen: the client's fields (stored under `client1`; the CMS dropped
 * client 2 on 2026-10-06), or cards with Add / Remove for lists. Save PATCHes the whole section
 * (`{section, value}`), exactly like the web. docs/12-CLIENTS.md §6.
 */
export default function FactFindEditScreen() {
  const { id, section } = useLocalSearchParams<{ id: string; section: string }>();
  const { org } = useOrgTheme();
  const def = FACT_FIND_SECTIONS.find((s) => s.key === section);
  const client = useClientDetail(org?.id, id);
  const factFind = useClientFactFind(org?.id, id);

  if (!def) {
    return (
      <View className="bg-background flex-1">
        <AppHeader />
        <FormScreenHeader title="Fact find" />
        <View style={{ padding: 20 }}>
          <ErrorNote message="This fact-find section doesn't exist." />
        </View>
      </View>
    );
  }

  if (factFind.isPending || factFind.isError || !org) {
    return (
      <View className="bg-background flex-1">
        <AppHeader />
        <FormScreenHeader title={def.label} subtitle={client.data?.name} />
        <View style={{ padding: 20 }}>
          {factFind.isError ? <ErrorNote message={errorMessage(factFind.error)} onRetry={() => void factFind.refetch()} /> : <Loading />}
        </View>
      </View>
    );
  }

  const stored = factFind.data[def.key];
  return (
    <SectionEditor
      key={def.key}
      def={def}
      adviceId={org.id}
      clientId={id}
      clientName={client.data?.name}
      factFind={factFind.data}
      initial={isObj(stored) ? stored : {}}
    />
  );
}

function SectionEditor({
  def,
  adviceId,
  clientId,
  clientName,
  factFind,
  initial,
}: {
  def: FactFindSectionDef;
  adviceId: string;
  clientId: string;
  clientName?: string;
  factFind: Obj;
  initial: Obj;
}) {
  const { theme } = useOrgTheme();
  const keyboard = useKeyboard();
  const save = useSaveFactFindSection(adviceId, clientId);
  const [draft, setDraft] = React.useState<Obj>(() => JSON.parse(JSON.stringify(initial)) as Obj);

  const savedJson = React.useMemo(() => JSON.stringify(cleanForSave(initial)), [initial]);
  const dirty = JSON.stringify(cleanForSave(draft)) !== savedJson;

  const ctx = { clientName: clientName ?? "", factFind };
  const setPersonField = (name: string, v: FieldValue) =>
    setDraft((d) => ({ ...d, client1: { ...(isObj(d.client1) ? d.client1 : {}), [name]: v } }));
  const listOf = (d: Obj, key: string) => (Array.isArray(d[key]) ? (d[key] as unknown[]).filter(isObj) : []);
  const setRow = (listKey: string, index: number, name: string, v: FieldValue) =>
    setDraft((d) => ({ ...d, [listKey]: listOf(d, listKey).map((row, i) => (i === index ? { ...row, [name]: v } : row)) }));
  const addRow = (listKey: string) => setDraft((d) => ({ ...d, [listKey]: [...listOf(d, listKey), { id: newRowId() }] }));
  const removeRow = (listKey: string, index: number) => setDraft((d) => ({ ...d, [listKey]: listOf(d, listKey).filter((_, i) => i !== index) }));

  const leave = () => (router.canGoBack() ? router.back() : router.replace({ pathname: "/clients/[id]", params: { id: clientId, tab: "fact-find" } }));
  const cancel = () => {
    if (!dirty) return leave();
    Alert.alert("Discard changes?", `Your changes to ${def.label} haven't been saved.`, [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: leave },
    ]);
  };
  const submit = () => save.mutate({ section: def.key, value: cleanForSave(draft) }, { onSuccess: leave });

  const personObj = isObj(draft.client1) ? draft.client1 : {};

  return (
    <View className="bg-background flex-1">
      <AppHeader />
      <FormScreenHeader
        title={def.label}
        subtitle={clientName ? `Fact find · ${clientName}` : "Fact find"}
        onBack={cancel}
        right={<PillButton label={save.isPending ? "Saving…" : "Save"} filled color={theme.base} disabled={!dirty || save.isPending} onPress={submit} />}
      />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 + keyboard.overlap }}>
        {save.isError ? (
          <View style={{ backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12 }}>
            <Text style={{ fontFamily: F.regular, fontSize: 14, color: C.danger }}>{errorMessage(save.error)}</Text>
          </View>
        ) : null}

        {def.person ? <Fields fields={def.person} obj={personObj} onChange={setPersonField} /> : null}

        {(def.lists ?? []).map((list) => {
          const rows = listOf(draft, list.key);
          return (
            <View key={list.key} style={{ gap: 12 }}>
              {def.lists!.length > 1 ? <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>{list.label}</Text> : null}
              {rows.length === 0 ? <Text style={text.meta}>{`No ${list.label.toLowerCase()} added yet.`}</Text> : null}
              {rows.map((row, i) => (
                <View key={typeof row.id === "string" ? row.id : i} style={{ backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, gap: 14 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.muted }}>{`${list.itemLabel} ${i + 1}`}</Text>
                    <PillButton label="Remove" icon={Trash} tone="danger" onPress={() => removeRow(list.key, i)} />
                  </View>
                  <Fields fields={listFields(list.fields, ctx)} obj={row} onChange={(name, v) => setRow(list.key, i, name, v)} />
                </View>
              ))}
              <Pressable
                accessibilityRole="button"
                onPress={() => addRow(list.key)}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderStyle: "dashed", borderColor: theme.line, borderRadius: 14, paddingVertical: 13, backgroundColor: "#FFFFFF" }}
              >
                <Plus size={16} color={theme.text} strokeWidth={2.4} />
                <Text style={{ fontFamily: F.semibold, fontSize: 14, color: theme.text }}>{`Add ${list.itemLabel.toLowerCase()}`}</Text>
              </Pressable>
            </View>
          );
        })}

      </ScrollView>
    </View>
  );
}

function Fields({ fields, obj, onChange }: { fields: FactFindFieldDef[]; obj: Obj; onChange: (name: string, v: FieldValue) => void }) {
  return (
    <View style={{ gap: 14 }}>
      {visibleFields(fields, obj).map((f) => (
        <View key={f.name} style={{ gap: 14 }}>
          {f.groupHeading ? <Text style={[text.label, { letterSpacing: 0.8, marginTop: 4, color: C.ink }]}>{f.groupHeading.toUpperCase()}</Text> : null}
          <FactFindField def={f} value={obj[f.name]} onChange={(v) => onChange(f.name, v)} />
        </View>
      ))}
    </View>
  );
}
