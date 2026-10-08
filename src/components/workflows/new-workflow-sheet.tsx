import * as React from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCreateWorkflow, useLicenseeTemplates, useTemplateSearch } from "@/api/workflows.api";
import { C, F, PillButton, errorMessage, text } from "@/components/client-detail/ui";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useKeyboard } from "@/hooks/use-keyboard";
import { Building, Check, Pencil, Plus, Search } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";
import type { WorkflowTemplateSummary } from "@/types/workflow.types";

type Pick = { kind: "blank" } | { kind: "template"; template: WorkflowTemplateSummary };

/**
 * "New workflow" — web CreateWorkflowDialog as a bottom sheet:
 *  - Start fresh: To do · In progress · Complete (preset "blank");
 *  - Licensee shared templates for this organisation;
 *  - Copy a shared template: search adviser templates (≥ 2 characters);
 *  - Workflow name (prefilled from the template) → POST …/workflows → opens the new board.
 * Editing stages / checklists beyond "Add a stage" stays on the web. Mount only while open.
 */
export function NewWorkflowSheet({ adviceId, onClose, onCreated }: { adviceId: string; onClose: () => void; onCreated: (id: string, name: string) => void }) {
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboard();
  const { theme } = useOrgTheme();
  const [pick, setPick] = React.useState<Pick>({ kind: "blank" });
  const [name, setName] = React.useState("New workflow");
  const [query, setQuery] = React.useState("");
  const q = useDebouncedValue(query.trim(), 300);

  const licensee = useLicenseeTemplates(adviceId, true);
  const search = useTemplateSearch(adviceId, q);
  // Licensee templates are already listed above; the search copies adviser (and your own) templates.
  const results = (search.data ?? []).filter((t) => !t.isLicenseeTemplate);
  const create = useCreateWorkflow(adviceId);

  const choose = (p: Pick) => {
    setPick(p);
    setName(p.kind === "template" ? p.template.name : "New workflow");
  };
  const selectedId = pick.kind === "template" ? pick.template.id : null;

  const submit = () =>
    create.mutate(
      { name: name.trim() || undefined, ...(pick.kind === "template" ? { templateId: pick.template.id } : { preset: "blank" as const }) },
      { onSuccess: (r) => onCreated(r.workflow.id, name.trim() || "New workflow") },
    );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable accessibilityLabel="Close" onPress={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(13,27,62,0.35)" }} />
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom + 14, keyboard.overlap + 12),
            maxHeight: "90%",
          }}
        >
          <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#DCE3EE", marginBottom: 12 }} />
          <View style={{ paddingHorizontal: 20, gap: 2, marginBottom: 12 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 18, color: C.ink }}>New workflow</Text>
            <Text style={text.meta}>Start fresh, use a licensee shared template, or copy another shared template.</Text>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 6 }}>
            <Option
              icon={Pencil}
              title="Start fresh"
              body="A board with To do, In progress, and Complete. Add stages as you go."
              selected={pick.kind === "blank"}
              onPress={() => choose({ kind: "blank" })}
            />

            <View style={{ gap: 2, marginTop: 4 }}>
              <Text style={[text.label, { letterSpacing: 0.6, color: theme.text }]}>LICENSEE SHARED TEMPLATES</Text>
              <Text style={text.meta}>Prepared by the licensee and shared with this organisation.</Text>
            </View>
            {licensee.isPending ? (
              <ActivityIndicator color={theme.base} style={{ paddingVertical: 10 }} />
            ) : licensee.isError ? (
              <Text style={[text.meta, { color: C.danger }]}>Couldn&apos;t load licensee templates.</Text>
            ) : licensee.data.length === 0 ? (
              <Text style={text.meta}>No licensee shared templates for this organisation.</Text>
            ) : (
              licensee.data.map((t) => (
                <TemplateOption key={t.id} t={t} badge="Licensee shared" selected={selectedId === t.id} onPress={() => choose({ kind: "template", template: t })} />
              ))
            )}

            <View style={{ height: 1, backgroundColor: C.hairline, marginVertical: 4 }} />

            <Text style={{ fontFamily: F.semibold, fontSize: 15, color: C.ink }}>Copy a shared template</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 12, paddingHorizontal: 12, height: 46 }}>
              <Search size={16} color="#8A97B5" strokeWidth={2} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search adviser templates…"
                placeholderTextColor="#A3AFC6"
                selectionColor={theme.base}
                autoCorrect={false}
                style={{ flex: 1, fontFamily: F.regular, fontSize: 15, color: C.ink }}
              />
            </View>
            {q.length < 2 ? (
              <Text style={text.meta}>Type at least 2 characters to search by name or adviser.</Text>
            ) : search.isPending ? (
              <ActivityIndicator color={theme.base} style={{ paddingVertical: 10 }} />
            ) : search.isError ? (
              <Text style={[text.meta, { color: C.danger }]}>{errorMessage(search.error)}</Text>
            ) : results.length === 0 ? (
              <Text style={text.meta}>No shared templates match.</Text>
            ) : (
              results.map((t) => (
                <TemplateOption key={t.id} t={t} badge={t.isOwn ? "Yours" : t.createdByName} selected={selectedId === t.id} onPress={() => choose({ kind: "template", template: t })} />
              ))
            )}

            <View style={{ gap: 6, marginTop: 4 }}>
              <Text style={{ fontFamily: F.medium, fontSize: 13, color: "#3B4A68" }}>Workflow name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                maxLength={80}
                placeholder="e.g. Annual review"
                placeholderTextColor="#A3AFC6"
                selectionColor={theme.base}
                style={{ borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 12, paddingHorizontal: 12, height: 46, fontFamily: F.regular, fontSize: 15, color: C.ink }}
              />
            </View>

            {create.isError ? (
              <View style={{ backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12 }}>
                <Text style={{ fontFamily: F.regular, fontSize: 14, color: C.danger }}>{errorMessage(create.error)}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, paddingHorizontal: 20, paddingTop: 12 }}>
            <PillButton label="Cancel" onPress={onClose} />
            <PillButton label={create.isPending ? "Creating…" : "Create workflow"} icon={Plus} filled color={theme.base} disabled={create.isPending || !name.trim()} onPress={submit} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Option({
  icon: Icon,
  title,
  body,
  badge,
  meta,
  selected,
  onPress,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  body?: string | null;
  badge?: string;
  meta?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useOrgTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        flexDirection: "row",
        gap: 12,
        borderWidth: 1.5,
        borderColor: selected ? theme.base : C.border,
        backgroundColor: selected ? theme.soft : "#FFFFFF",
        borderRadius: 16,
        padding: 14,
      }}
    >
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: selected ? "#FFFFFF" : "#F3F5F9", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color={selected ? theme.text : "#4B5A78"} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <Text style={{ fontFamily: F.semibold, fontSize: 15, color: C.ink }}>{title}</Text>
          {badge ? (
            <View style={{ borderWidth: 1, borderColor: theme.line, backgroundColor: "#FFFFFF", borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 }}>
              <Text style={{ fontFamily: F.medium, fontSize: 11, color: theme.text }}>{badge}</Text>
            </View>
          ) : null}
        </View>
        {meta ? <Text style={[text.meta, { color: theme.text }]}>{meta}</Text> : null}
        {body ? (
          <Text numberOfLines={3} style={[text.body, { fontSize: 13.5, color: "#5B6B8C" }]}>
            {body}
          </Text>
        ) : null}
      </View>
      {selected ? <Check size={18} color={theme.text} strokeWidth={2.4} /> : null}
    </Pressable>
  );
}

function TemplateOption({ t, badge, selected, onPress }: { t: WorkflowTemplateSummary; badge: string; selected: boolean; onPress: () => void }) {
  return (
    <Option
      icon={Building}
      title={t.name}
      badge={badge}
      meta={`${t.stageCount} ${t.stageCount === 1 ? "stage" : "stages"}`}
      body={t.description}
      selected={selected}
      onPress={onPress}
    />
  );
}
