import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as React from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { useWorkflows } from "@/api/workflows.api";
import { AppHeader } from "@/components/app-header";
import { C, Empty, ErrorNote, F, Loading, errorMessage, text } from "@/components/client-detail/ui";
import { ArrowRight, Share2, SquareKanban } from "@/lib/icons";
import { qk } from "@/lib/query-keys";
import { splitStageName } from "@/lib/workflows";
import { useOrgTheme } from "@/providers/org-theme-provider";
import type { WorkflowSummary } from "@/types/workflow.types";

/**
 * Workflows — the web's /portal/[adviceId]/workflows: your boards, then boards other advisers
 * share with you. Each card shows its stages as a small "rail" (the board's shape at a glance).
 * Creating / editing boards and templates stays on the web for now. docs/13-WORKFLOWS.md.
 */
export default function WorkflowsScreen() {
  const { org, theme } = useOrgTheme();
  const queryClient = useQueryClient();
  const q = useWorkflows(org?.id);
  const [refreshing, setRefreshing] = React.useState(false);

  const own = q.data?.workflows ?? [];
  const shared = q.data?.sharedWorkflows ?? [];
  const totalClients = [...own, ...shared].reduce((n, w) => n + w.clientCount, 0);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: qk.workflows(org?.id ?? "") });
    } finally {
      setRefreshing(false);
    }
  };

  const open = (w: WorkflowSummary) => router.push({ pathname: "/workflows/[workflowId]", params: { workflowId: w.id, name: w.name } });

  return (
    <View className="bg-background flex-1">
      <AppHeader />
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 36 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.base} colors={[theme.base]} />}
      >
        {/* Title — web: icon tile + "Workflows" + "N · M clients" pill + subtitle */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.soft, alignItems: "center", justifyContent: "center" }}>
            <SquareKanban size={19} color={theme.text} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontFamily: F.bold, fontSize: 22, color: C.ink }}>Workflows</Text>
              {q.data ? (
                <View style={{ backgroundColor: theme.soft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontFamily: F.bold, fontSize: 11.5, color: theme.text }}>
                    {`${own.length + shared.length} · ${totalClients} ${totalClients === 1 ? "client" : "clients"}`}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={{ fontFamily: F.regular, fontSize: 13, color: C.muted }}>Stages, checklists, and the clients on each one.</Text>
          </View>
        </View>

        {q.isPending ? (
          <Loading />
        ) : q.isError ? (
          <ErrorNote message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
        ) : own.length + shared.length === 0 ? (
          <Empty icon={SquareKanban} title="No workflows yet" message="Create your first workflow in the web portal, then follow your clients through it here." />
        ) : (
          <>
            {own.length ? <Section title="Yours" items={own} onOpen={open} /> : null}
            {shared.length ? <Section title="Shared with you" items={shared} onOpen={open} /> : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Section({ title, items, onOpen }: { title: string; items: WorkflowSummary[]; onOpen: (w: WorkflowSummary) => void }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={[text.label, { fontSize: 12.5, color: C.ink, letterSpacing: 0.6 }]}>{title.toUpperCase()}</Text>
      {items.map((w) => (
        <WorkflowCard key={w.id} workflow={w} onPress={() => onOpen(w)} />
      ))}
    </View>
  );
}

function WorkflowCard({ workflow: w, onPress }: { workflow: WorkflowSummary; onPress: () => void }) {
  const { theme } = useOrgTheme();
  const [pressed, setPressed] = React.useState(false);
  const names = w.stages.map((s) => splitStageName(s.name).title);
  const shown = names.slice(0, 3);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${w.name}, ${w.clientCount} clients, ${w.stageCount} stages`}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{ backgroundColor: pressed ? "#F7F9FC" : "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 16, gap: 12 }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 17, color: C.ink, lineHeight: 22 }}>{w.name}</Text>
          <Text style={text.meta}>{`${w.clientCount} ${w.clientCount === 1 ? "client" : "clients"} · ${w.stageCount} ${w.stageCount === 1 ? "stage" : "stages"}`}</Text>
        </View>
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: theme.soft, alignItems: "center", justifyContent: "center" }}>
          <ArrowRight size={16} color={theme.text} strokeWidth={2.2} />
        </View>
      </View>

      {/* Stage rail: one node per stage, joined by a line — the board's shape at a glance. */}
      {w.stages.length ? (
        <View style={{ height: 10, justifyContent: "center" }}>
          <View style={{ position: "absolute", left: 4, right: 4, height: 2, borderRadius: 1, backgroundColor: theme.line }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {w.stages.map((s, i) => (
              <View
                key={s.id}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: i === 0 ? theme.base : "#FFFFFF",
                  borderWidth: 2,
                  borderColor: theme.base,
                  opacity: i === 0 ? 1 : 0.55 + (0.45 * i) / Math.max(1, w.stages.length - 1),
                }}
              />
            ))}
          </View>
        </View>
      ) : null}

      {names.length ? (
        <Text numberOfLines={2} style={[text.body, { fontSize: 13.5, color: "#5B6B8C" }]}>
          {shown.join("  ›  ")}
          {names.length > shown.length ? <Text style={{ color: C.faint }}>{`  +${names.length - shown.length}`}</Text> : null}
        </Text>
      ) : null}

      {w.sharedBy ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Share2 size={13} color={C.faint} strokeWidth={2} />
          <Text style={text.meta}>{`Shared by ${w.sharedBy.name}`}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
