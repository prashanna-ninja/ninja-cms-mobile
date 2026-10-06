import * as React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAddToWorkflow } from "@/api/client-detail.api";
import { C, F, PillButton, errorMessage, text } from "@/components/client-detail/ui";
import { Check, GitBranch } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";
import type { WorkflowSummary } from "@/types/client-detail.types";

/**
 * "Add to a workflow" — web ClientWorkflowsCard dialog as a bottom sheet: pick a workflow
 * (the ones this client isn't on yet), pick its starting stage, Add. Mount it only while
 * open, so the picks start fresh every time.
 */
export function AddWorkflowSheet({
  adviceId,
  clientId,
  workflows,
  onClose,
}: {
  adviceId: string;
  clientId: string;
  workflows: WorkflowSummary[];
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useOrgTheme();
  const add = useAddToWorkflow(adviceId, clientId);
  const [workflowId, setWorkflowId] = React.useState<string | null>(null);
  const [stageId, setStageId] = React.useState<string | null>(null);
  const selected = workflows.find((w) => w.id === workflowId) ?? null;

  const pickWorkflow = (w: WorkflowSummary) => {
    setWorkflowId(w.id);
    setStageId(w.stages[0]?.id ?? null); // web: the first stage is the usual start
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable accessibilityLabel="Close" onPress={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(13,27,62,0.35)" }} />
        <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingBottom: insets.bottom + 14, maxHeight: "82%" }}>
          <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#DCE3EE", marginBottom: 12 }} />
          <View style={{ paddingHorizontal: 20, marginBottom: 10, gap: 2 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 18, color: C.ink }}>Add to a workflow</Text>
            <Text style={text.meta}>Choose a workflow, then the stage the client starts in.</Text>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 6 }} keyboardShouldPersistTaps="handled">
            {workflows.length === 0 ? (
              <View style={{ backgroundColor: "#F6F8FC", borderRadius: 14, padding: 14 }}>
                <Text style={text.body}>This client is already on every workflow, or you have not created one yet.</Text>
              </View>
            ) : (
              <>
                <View style={{ gap: 8 }}>
                  <Text style={text.label}>Workflow</Text>
                  {workflows.map((w) => {
                    const active = w.id === workflowId;
                    return (
                      <Pressable
                        key={w.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        onPress={() => pickWorkflow(w)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          borderWidth: 1.5,
                          borderColor: active ? theme.base : C.border,
                          backgroundColor: active ? theme.soft : "#FFFFFF",
                          borderRadius: 14,
                          padding: 12,
                        }}
                      >
                        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: active ? "#FFFFFF" : theme.soft, alignItems: "center", justifyContent: "center" }}>
                          <GitBranch size={16} color={theme.text} strokeWidth={2} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={text.value}>{w.name}</Text>
                          <Text style={text.meta} numberOfLines={2}>
                            {w.description || `${w.stageCount} stage${w.stageCount === 1 ? "" : "s"} · ${w.clientCount} client${w.clientCount === 1 ? "" : "s"}`}
                          </Text>
                        </View>
                        {active ? <Check size={18} color={theme.text} strokeWidth={2.4} /> : null}
                      </Pressable>
                    );
                  })}
                </View>

                {selected ? (
                  <View style={{ gap: 8 }}>
                    <Text style={text.label}>Starting stage</Text>
                    {selected.stages.length === 0 ? (
                      <Text style={text.meta}>This workflow has no stages yet. Add one on the web first.</Text>
                    ) : (
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {selected.stages.map((s, i) => {
                          const active = s.id === stageId;
                          return (
                            <Pressable
                              key={s.id}
                              accessibilityRole="button"
                              accessibilityState={{ selected: active }}
                              onPress={() => setStageId(s.id)}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 999,
                                borderWidth: 1.5,
                                borderColor: active ? theme.base : C.border,
                                backgroundColor: active ? theme.soft : "#FFFFFF",
                              }}
                            >
                              <Text style={{ fontFamily: F.semibold, fontSize: 12, color: active ? theme.text : C.faint }}>{i + 1}</Text>
                              <Text style={{ fontFamily: active ? F.semibold : F.medium, fontSize: 14, color: active ? theme.text : C.ink }}>{s.name}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  </View>
                ) : null}
              </>
            )}

            {add.isError ? (
              <View style={{ backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12 }}>
                <Text style={{ fontFamily: F.regular, fontSize: 14, color: C.danger }}>{errorMessage(add.error)}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, paddingHorizontal: 20, paddingTop: 12 }}>
            <PillButton label="Cancel" onPress={onClose} />
            {workflows.length ? (
              <PillButton
                label={add.isPending ? "Adding…" : "Add to workflow"}
                filled
                color={theme.base}
                disabled={!workflowId || !stageId || add.isPending}
                onPress={() => workflowId && stageId && add.mutate({ workflowId, stageId }, { onSuccess: onClose })}
              />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}
