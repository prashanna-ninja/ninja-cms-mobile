import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { FlatList, Pressable, RefreshControl, Text, TextInput, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";

import { useWorkflowBoard } from "@/api/workflows.api";
import { AppHeader } from "@/components/app-header";
import { C, ErrorNote, F, Loading, PillButton, errorMessage, text } from "@/components/client-detail/ui";
import { AddClientSheet } from "@/components/workflows/add-client-sheet";
import { AddStageSheet } from "@/components/workflows/add-stage-sheet";
import { RoleBadge } from "@/components/workflows/badges";
import { BoardCardView } from "@/components/workflows/board-card";
import { StageRail } from "@/components/workflows/stage-rail";
import { ApiError } from "@/lib/api-client";
import { ArrowLeft, ListChecks, Search, UserPlus, X } from "@/lib/icons";
import { qk } from "@/lib/query-keys";
import { cardIsOverdue, cardMatches, splitStageName } from "@/lib/workflows";
import { useOrgTheme } from "@/providers/org-theme-provider";
import type { BoardStage } from "@/types/workflow.types";

/**
 * A workflow board — the web's Kanban (/portal/[adviceId]/workflows/[workflowId]) for a phone.
 * Instead of squeezed side-scrolling columns: a sticky **stage rail** (every stage, with counts)
 * over full-width **stage pages** you swipe between. Each page lists that stage's client cards
 * with "Add client". Tap a card → the client on this workflow ([placementId]).
 * Moving clients between stages is done from the client screen (no drag on mobile).
 * docs/13-WORKFLOWS.md.
 */
export default function WorkflowBoardScreen() {
  const { workflowId, name, stage: stageParam } = useLocalSearchParams<{ workflowId: string; name?: string; stage?: string }>();
  const { org, theme } = useOrgTheme();
  const queryClient = useQueryClient();
  const board = useWorkflowBoard(org?.id, workflowId);
  const [query, setQuery] = React.useState("");
  // null = not moved yet → the stage from ?stage= (or the first).
  const [active, setActive] = React.useState<number | null>(null);
  const [pageWidth, setPageWidth] = React.useState(0);
  const [adding, setAdding] = React.useState<BoardStage | null>(null);
  const [addingStage, setAddingStage] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const pager = React.useRef<FlatList<BoardStage>>(null);

  const stages = React.useMemo(
    () => (board.data?.stages ?? []).map((s) => ({ ...s, clients: s.clients.filter((c) => cardMatches(c, query)) })),
    [board.data, query],
  );
  const totalClients = (board.data?.stages ?? []).reduce((n, s) => n + s.clients.length, 0);
  const initialIndex = Math.max(0, stageParam ? stages.findIndex((s) => s.id === stageParam) : 0);
  const current = Math.min(active ?? initialIndex, Math.max(0, stages.length - 1));

  const goTo = (i: number) => {
    setActive(i);
    pager.current?.scrollToOffset({ offset: i * pageWidth, animated: true });
  };
  const onPageScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth) setActive(Math.round(e.nativeEvent.contentOffset.x / pageWidth));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: qk.workflowBoard(org?.id ?? "", workflowId) });
    } finally {
      setRefreshing(false);
    }
  };

  const openCard = (placementId: string) =>
    router.push({ pathname: "/workflows/[workflowId]/[placementId]", params: { workflowId, placementId } });

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/workflows"));

  return (
    <View className="bg-background flex-1">
      <AppHeader />

      {/* Title + search */}
      <View style={{ paddingHorizontal: 20, paddingTop: 14, gap: 10 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="All workflows" onPress={goBack} hitSlop={10} style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
          <ArrowLeft size={17} color={C.ink} strokeWidth={2.2} />
          <Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.ink }}>All workflows</Text>
        </Pressable>
        <View style={{ gap: 2 }}>
          <Text numberOfLines={2} style={{ fontFamily: F.bold, fontSize: 22, color: C.ink, lineHeight: 27 }}>
            {board.data?.name ?? name ?? "Workflow"}
          </Text>
          {board.data ? (
            <Text style={text.meta}>
              {`${totalClients} ${totalClients === 1 ? "client" : "clients"} · ${board.data.stages.length} stages`}
              {!board.data.canManageStructure ? ` · ${board.data.owner.name}'s board` : ""}
            </Text>
          ) : null}
        </View>
        {board.data ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 12, paddingHorizontal: 12, height: 44 }}>
            <Search size={16} color="#8A97B5" strokeWidth={2} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Find a client"
              placeholderTextColor="#A3AFC6"
              selectionColor={theme.base}
              autoCorrect={false}
              style={{ flex: 1, fontFamily: F.regular, fontSize: 15, color: C.ink }}
            />
            {query ? (
              <Pressable accessibilityLabel="Clear search" onPress={() => setQuery("")} hitSlop={8}>
                <X size={16} color="#8A97B5" strokeWidth={2.2} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {board.isPending ? (
        <Loading />
      ) : board.isError ? (
        <View style={{ padding: 20 }}>
          <ErrorNote
            message={board.error instanceof ApiError && board.error.status === 404 ? "This workflow couldn't be found." : errorMessage(board.error)}
            onRetry={() => void board.refetch()}
          />
        </View>
      ) : (
        <>
          <StageRail
            stages={stages.map((s) => ({ id: s.id, name: s.name, count: s.clients.length, overdue: s.clients.filter(cardIsOverdue).length }))}
            active={current}
            onSelect={goTo}
            // Owners only (collaborators get 404 from the stages routes).
            onAddStage={board.data.canManageStructure ? () => setAddingStage(true) : undefined}
          />
          <View style={{ flex: 1 }} onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}>
            {pageWidth ? (
              <FlatList
                ref={pager}
                data={stages}
                keyExtractor={(s) => s.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onPageScrollEnd}
                getItemLayout={(_, i) => ({ length: pageWidth, offset: pageWidth * i, index: i })}
                initialScrollIndex={initialIndex < stages.length ? initialIndex : 0}
                renderItem={({ item, index }) => (
                  <StagePage
                    stage={item}
                    index={index}
                    count={stages.length}
                    width={pageWidth}
                    searching={!!query.trim()}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    onAdd={() => setAdding(board.data.stages[index])}
                    onOpen={openCard}
                  />
                )}
              />
            ) : null}
          </View>
        </>
      )}

      {addingStage && org ? (
        <AddStageSheet adviceId={org.id} workflowId={workflowId} onClose={() => setAddingStage(false)} onAdded={() => setAddingStage(false)} />
      ) : null}

      {adding && org ? (
        <AddClientSheet
          adviceId={org.id}
          workflowId={workflowId}
          stage={adding}
          onClose={() => setAdding(null)}
          onAdded={(placementId) => {
            setAdding(null);
            openCard(placementId);
          }}
        />
      ) : null}
    </View>
  );
}

function StagePage({
  stage,
  index,
  count,
  width,
  searching,
  refreshing,
  onRefresh,
  onAdd,
  onOpen,
}: {
  stage: BoardStage;
  index: number;
  count: number;
  width: number;
  searching: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onAdd: () => void;
  onOpen: (placementId: string) => void;
}) {
  const { theme } = useOrgTheme();
  const { title, role } = splitStageName(stage.name);
  const todos = stage.checklist.length;

  return (
    <FlatList
      style={{ width }}
      data={stage.clients}
      keyExtractor={(c) => c.id}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 36, gap: 10 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.base} colors={[theme.base]} />}
      ListHeaderComponent={
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 2 }}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[text.label, { letterSpacing: 0.6 }]}>{`STAGE ${index + 1} OF ${count}`}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 7 }}>
              <Text style={{ fontFamily: F.bold, fontSize: 18, color: C.ink }}>{title}</Text>
              {role ? <RoleBadge role={role} tint={theme.text} bg={theme.soft} /> : null}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <ListChecks size={13} color={C.faint} strokeWidth={2} />
              <Text style={text.meta}>
                {`${stage.clients.length} ${stage.clients.length === 1 ? "client" : "clients"}${todos ? ` · ${todos} to-do${todos === 1 ? "" : "s"}` : ""}`}
              </Text>
            </View>
          </View>
          <PillButton label="Add client" icon={UserPlus} filled color={theme.base} onPress={onAdd} />
        </View>
      }
      ListEmptyComponent={
        <View style={{ alignItems: "center", gap: 8, paddingVertical: 36, paddingHorizontal: 20, borderWidth: 1.5, borderStyle: "dashed", borderColor: "#D6E0F2", borderRadius: 18, backgroundColor: "#FFFFFF" }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.soft, alignItems: "center", justifyContent: "center" }}>
            <UserPlus size={20} color={theme.text} strokeWidth={2} />
          </View>
          <Text style={{ fontFamily: F.semibold, fontSize: 15, color: C.ink }}>{searching ? "No matches in this stage" : "No clients here"}</Text>
          <Text style={[text.meta, { textAlign: "center" }]}>
            {searching ? "Try another stage, or clear the search." : "Add one, or move a client here from their card."}
          </Text>
        </View>
      }
      renderItem={({ item }) => <BoardCardView card={item} onPress={() => onOpen(item.id)} />}
    />
  );
}
