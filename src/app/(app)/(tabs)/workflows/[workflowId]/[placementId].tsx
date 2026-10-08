import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { Alert, LayoutAnimation, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import {
  usePersonalChecklist,
  usePlacement,
  usePlacementComments,
  useRemovePlacement,
  useUpdatePlacement,
  useUpdateStageItem,
  useWorkflowBoard,
} from "@/api/workflows.api";
import { AppHeader } from "@/components/app-header";
import { C, Card, ErrorNote, F, Loading, PillButton, errorMessage, text } from "@/components/client-detail/ui";
import { OptionSheet } from "@/components/clients/option-sheet";
import { DateField } from "@/components/forms/date-field";
import { ClientBadges, RoleBadge } from "@/components/workflows/badges";
import { useKeyboard } from "@/hooks/use-keyboard";
import { ApiError } from "@/lib/api-client";
import { formatCalendarDate, formatDateTime, nameInitials } from "@/lib/format";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ListChecks,
  MessageSquare,
  Plus,
  SquareKanban,
  Trash,
  UserCheck,
} from "@/lib/icons";
import { isOverdue, splitStageName } from "@/lib/workflows";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";
import type { Person, PlacementDetail } from "@/types/workflow.types";

const alertError = (title: string) => (err: unknown) => Alert.alert(title, errorMessage(err));

/**
 * One client on a workflow — the web ClientPlacementDialog as a screen:
 * header → **stage** (where they are, "Move to next stage", change stage) → assigned to + due date →
 * this stage's checklist → earlier stages → client to-dos → comments → remove from workflow.
 * Tags, files, partner and details live on the client's full record ("Full record").
 * docs/13-WORKFLOWS.md.
 */
export default function PlacementScreen() {
  const { workflowId, placementId } = useLocalSearchParams<{ workflowId: string; placementId: string }>();
  const { org, theme } = useOrgTheme();
  const keyboard = useKeyboard();
  const adviceId = org?.id;
  const q = usePlacement(adviceId, workflowId, placementId);
  const board = useWorkflowBoard(adviceId, workflowId);
  const [refreshing, setRefreshing] = React.useState(false);

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace({ pathname: "/workflows/[workflowId]", params: { workflowId } });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([q.refetch(), board.refetch()]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View className="bg-background flex-1">
      <AppHeader />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 + keyboard.overlap }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.base} colors={[theme.base]} />}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Back to ${board.data?.name ?? "the board"}`}
          onPress={goBack}
          hitSlop={10}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}
        >
          <ArrowLeft size={17} color={C.ink} strokeWidth={2.2} />
          <Text numberOfLines={1} style={{ fontFamily: F.semibold, fontSize: 14, color: C.ink, maxWidth: 280 }}>
            {board.data?.name ?? "Back to board"}
          </Text>
        </Pressable>

        {q.isPending ? (
          <Loading />
        ) : q.isError ? (
          <ErrorNote
            message={q.error instanceof ApiError && q.error.status === 404 ? "This client isn't on this workflow any more." : errorMessage(q.error)}
            onRetry={() => void q.refetch()}
          />
        ) : adviceId ? (
          <PlacementBody adviceId={adviceId} workflowId={workflowId} placementId={placementId} p={q.data} stages={board.data?.stages ?? []} onRemoved={goBack} />
        ) : null}
      </ScrollView>
    </View>
  );
}

function PlacementBody({
  adviceId,
  workflowId,
  placementId,
  p,
  stages,
  onRemoved,
}: {
  adviceId: string;
  workflowId: string;
  placementId: string;
  p: PlacementDetail;
  stages: { id: string; name: string }[];
  onRemoved: () => void;
}) {
  const { theme } = useOrgTheme();
  const update = useUpdatePlacement(adviceId, workflowId, placementId);
  const remove = useRemovePlacement(adviceId, workflowId, placementId);
  const [stageSheet, setStageSheet] = React.useState(false);
  const [assignSheet, setAssignSheet] = React.useState(false);

  const index = stages.findIndex((s) => s.id === p.stageId);
  const next = index >= 0 && index < stages.length - 1 ? stages[index + 1] : null;
  const { title: stageTitle, role } = splitStageName(p.stage.name);

  const moveTo = (stageId: string) => {
    if (stageId === p.stageId) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    update.mutate({ stageId }, { onError: alertError("Couldn't move client") });
  };

  const confirmRemove = () =>
    Alert.alert("Remove from workflow?", `${p.client.name} comes off this board. Their client record, files and notes stay.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => remove.mutate(undefined, { onSuccess: onRemoved, onError: alertError("Couldn't remove client") }) },
    ]);

  return (
    <>
      {/* Header */}
      <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 16, gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <View style={{ width: 52, height: 52, borderRadius: 15, backgroundColor: theme.base, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: F.bold, fontSize: 18, color: theme.onBase }}>{nameInitials(p.client.name)}</Text>
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 20, color: C.ink, lineHeight: 25 }}>{p.client.name}</Text>
            <ClientBadges type={p.client.type} source={p.client.source} tags={p.clientTags} maxTags={3} />
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <Text style={[text.meta, { flex: 1 }]}>{`Added ${formatDateTime(p.createdAt)}`}</Text>
          <PillButton
            label="Full record"
            icon={ExternalLink}
            color={theme.text}
            onPress={() => router.push({ pathname: "/clients/[id]", params: { id: p.client.id, name: p.client.name } })}
          />
        </View>
      </View>

      {/* Stage — where the client is, and moving them on */}
      <View style={{ borderRadius: 20, overflow: "hidden", backgroundColor: theme.base }}>
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <SquareKanban size={15} color={theme.onBase} strokeWidth={2} />
            <Text style={{ fontFamily: F.semibold, fontSize: 12, letterSpacing: 0.6, color: theme.onBase, opacity: 0.85 }}>
              {index >= 0 ? `STAGE ${index + 1} OF ${stages.length}` : "CURRENT STAGE"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 22, color: theme.onBase }}>{stageTitle}</Text>
            {role ? <RoleBadge role={role} tint={theme.base} bg={theme.onBase} /> : null}
          </View>
          {stages.length ? (
            <View style={{ flexDirection: "row", gap: 4 }}>
              {stages.map((s, i) => (
                <View key={s.id} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: theme.onBase, opacity: i <= index ? 0.95 : 0.25 }} />
              ))}
            </View>
          ) : null}
        </View>
        <View style={{ flexDirection: "row", gap: 8, padding: 12, backgroundColor: "rgba(0,0,0,0.12)" }}>
          {next ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Move to ${next.name}`}
              disabled={update.isPending}
              onPress={() => moveTo(next.id)}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: 12, paddingVertical: 11, paddingHorizontal: 12, opacity: update.isPending ? 0.6 : 1 }}
            >
              <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: F.semibold, fontSize: 14, color: theme.text }}>
                {update.isPending ? "Moving…" : `Move to ${splitStageName(next.name).title}`}
              </Text>
              <ArrowRight size={16} color={theme.text} strokeWidth={2.4} />
            </Pressable>
          ) : (
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 6 }}>
              <Check size={16} color={theme.onBase} strokeWidth={2.6} />
              <Text style={{ fontFamily: F.semibold, fontSize: 14, color: theme.onBase }}>Final stage</Text>
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => setStageSheet(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.55)" }}
          >
            <Text style={{ fontFamily: F.semibold, fontSize: 14, color: theme.onBase }}>Change</Text>
            <ChevronDown size={15} color={theme.onBase} strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>

      {/* Assigned to + due date */}
      <Card>
        <View style={{ gap: 14 }}>
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: F.medium, fontSize: 13, color: "#3B4A68" }}>Assigned to</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setAssignSheet(true)}
              style={{ flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 12, paddingHorizontal: 12, height: 46 }}
            >
              <UserCheck size={16} color="#8A97B5" strokeWidth={2} />
              <Text style={{ flex: 1, fontFamily: F.regular, fontSize: 15, color: p.assignedTo ? C.ink : "#A3AFC6" }}>{p.assignedTo?.name ?? "Unassigned"}</Text>
              <ChevronDown size={16} color="#6B7A99" strokeWidth={2.2} />
            </Pressable>
          </View>
          <DateField
            label="Due date"
            value={p.dueOn ?? ""}
            placeholder="No due date"
            error={isOverdue(p.dueOn) ? "Overdue" : undefined}
            onChange={(v) => update.mutate({ dueOn: v || null }, { onError: alertError("Couldn't set due date") })}
          />
        </View>
      </Card>

      <StageChecklist adviceId={adviceId} workflowId={workflowId} placementId={placementId} p={p} />
      {p.priorStageChecklists.length ? <EarlierStages adviceId={adviceId} workflowId={workflowId} placementId={placementId} p={p} /> : null}
      <ClientTodos adviceId={adviceId} workflowId={workflowId} placementId={placementId} p={p} />
      <Comments adviceId={adviceId} workflowId={workflowId} placementId={placementId} p={p} />

      <View style={{ alignItems: "center", paddingTop: 6 }}>
        <PillButton label={remove.isPending ? "Removing…" : "Remove from workflow"} icon={Trash} tone="danger" disabled={remove.isPending} onPress={confirmRemove} />
      </View>

      <OptionSheet
        visible={stageSheet}
        title="Move to stage"
        value={p.stageId}
        options={stages.map((s, i) => ({ value: s.id, label: `${i + 1}. ${s.name}` }))}
        onSelect={moveTo}
        onClose={() => setStageSheet(false)}
      />
      <OptionSheet
        visible={assignSheet}
        title="Assign to"
        value={p.assignedTo?.id ?? ""}
        options={[{ value: "", label: "Unassigned" }, ...p.assignees.map((a) => ({ value: a.id, label: a.role === "staff" ? `${a.name} (staff)` : a.name }))]}
        onSelect={(v) => update.mutate({ assignedToUserId: v || null }, { onError: alertError("Couldn't assign") })}
        onClose={() => setAssignSheet(false)}
      />
    </>
  );
}

type SectionProps = { adviceId: string; workflowId: string; placementId: string; p: PlacementDetail };

/** A round tick + title + "assignee · due" line. */
function TickRow({ title, done, meta, metaDanger, onToggle, right }: { title: string; done: boolean; meta?: string; metaDanger?: boolean; onToggle: () => void; right?: React.ReactNode }) {
  const { theme } = useOrgTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 9 }}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={title}
        onPress={onToggle}
        hitSlop={8}
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          marginTop: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: done ? theme.base : "#FFFFFF",
          borderWidth: done ? 0 : 1.6,
          borderColor: "#C5D0E3",
        }}
      >
        {done ? <Check size={14} color={theme.onBase} strokeWidth={3} /> : null}
      </Pressable>
      <Pressable onPress={onToggle} style={{ flex: 1, gap: 2 }}>
        <Text style={[text.body, { color: done ? C.faint : C.ink, textDecorationLine: done ? "line-through" : "none" }]}>{title}</Text>
        {meta ? <Text style={[text.meta, metaDanger && !done ? { color: C.danger, fontFamily: F.semibold } : null]}>{meta}</Text> : null}
      </Pressable>
      {right}
    </View>
  );
}

const rowMeta = (assignedTo: Person | null, dueOn: string | null) =>
  [assignedTo?.name, dueOn ? `Due ${formatCalendarDate(dueOn)}` : null].filter(Boolean).join(" · ") || undefined;

function Progress({ done, total }: { done: number; total: number }) {
  const { theme } = useOrgTheme();
  const complete = total > 0 && done === total;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: "#E8EEF7", overflow: "hidden" }}>
        <View style={{ width: `${total ? Math.round((done / total) * 100) : 0}%`, height: "100%", borderRadius: 3, backgroundColor: complete ? "#059669" : theme.base }} />
      </View>
      <Text style={[text.meta, { color: complete ? "#059669" : C.muted, fontFamily: F.semibold }]}>{`${done}/${total}`}</Text>
    </View>
  );
}

function StageChecklist({ adviceId, workflowId, placementId, p }: SectionProps) {
  const { theme } = useOrgTheme();
  const toggle = useUpdateStageItem(adviceId, workflowId, placementId);
  const done = p.stageChecklist.filter((r) => r.done).length;
  return (
    <Card icon={ListChecks} iconBg={theme.soft} iconFg={theme.text} title="Stage checklist">
      {p.stageChecklist.length === 0 ? (
        <Text style={text.meta}>No checklist on this stage.</Text>
      ) : (
        <View style={{ gap: 4 }}>
          <Progress done={done} total={p.stageChecklist.length} />
          <View style={{ marginTop: 4 }}>
            {p.stageChecklist.map((r) => (
              <TickRow
                key={r.itemId}
                title={r.title}
                done={r.done}
                meta={rowMeta(r.assignedTo, r.dueOn)}
                metaDanger={isOverdue(r.dueOn)}
                onToggle={() => toggle.mutate({ itemId: r.itemId, done: !r.done }, { onError: alertError("Couldn't update checklist") })}
              />
            ))}
          </View>
        </View>
      )}
    </Card>
  );
}

function EarlierStages({ adviceId, workflowId, placementId, p }: SectionProps) {
  const toggle = useUpdateStageItem(adviceId, workflowId, placementId);
  const [open, setOpen] = React.useState<string | null>(null);
  return (
    <Card title="Earlier stages">
      <View style={{ gap: 8 }}>
        {p.priorStageChecklists.map((s) => {
          const isOpen = open === s.stageId;
          return (
            <View key={s.stageId} style={{ borderWidth: 1, borderColor: C.hairline, borderRadius: 12, overflow: "hidden" }}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setOpen(isOpen ? null : s.stageId);
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 11 }}
              >
                <Text numberOfLines={1} style={[text.value, { flex: 1, fontSize: 14.5 }]}>
                  {s.stageName}
                </Text>
                <Text style={[text.meta, { color: s.doneCount === s.totalCount ? "#059669" : C.muted, fontFamily: F.semibold }]}>{`${s.doneCount}/${s.totalCount} done`}</Text>
                {isOpen ? <ChevronUp size={16} color="#8A97B5" strokeWidth={2.2} /> : <ChevronDown size={16} color="#8A97B5" strokeWidth={2.2} />}
              </Pressable>
              {isOpen ? (
                <View style={{ paddingHorizontal: 12, paddingBottom: 6, borderTopWidth: 1, borderTopColor: C.hairline }}>
                  {s.items.map((r) => (
                    <TickRow
                      key={r.itemId}
                      title={r.title}
                      done={r.done}
                      meta={rowMeta(r.assignedTo, r.dueOn)}
                      metaDanger={isOverdue(r.dueOn)}
                      onToggle={() => toggle.mutate({ itemId: r.itemId, done: !r.done }, { onError: alertError("Couldn't update checklist") })}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function ClientTodos({ adviceId, workflowId, placementId, p }: SectionProps) {
  const { theme } = useOrgTheme();
  const { add, update, remove } = usePersonalChecklist(adviceId, workflowId, placementId);
  const [draft, setDraft] = React.useState("");
  const done = p.personalChecklist.filter((r) => r.done).length;
  const full = p.personalChecklist.length >= 40;

  const submit = () => {
    const title = draft.trim();
    if (!title || full) return;
    add.mutate(title, { onSuccess: () => setDraft(""), onError: alertError("Couldn't add to-do") });
  };

  return (
    <Card icon={Check} iconBg="#ECFDF5" iconFg="#059669" title="Client to-dos">
      <View style={{ gap: 6 }}>
        {p.personalChecklist.length ? <Progress done={done} total={p.personalChecklist.length} /> : <Text style={text.meta}>To-dos just for this client.</Text>}
        <View>
          {p.personalChecklist.map((r) => (
            <TickRow
              key={r.id}
              title={r.title}
              done={r.done}
              meta={rowMeta(r.assignedTo, r.dueOn ? r.dueOn.slice(0, 10) : null)}
              metaDanger={isOverdue(r.dueOn)}
              onToggle={() => update.mutate({ id: r.id, done: !r.done }, { onError: alertError("Couldn't update to-do") })}
              right={
                <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${r.title}`} hitSlop={10} onPress={() => remove.mutate(r.id, { onError: alertError("Couldn't delete to-do") })} style={{ paddingTop: 3 }}>
                  <Trash size={15} color="#B4BFD3" strokeWidth={2} />
                </Pressable>
              }
            />
          ))}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submit}
            returnKeyType="done"
            maxLength={300}
            editable={!full}
            placeholder={full ? "40 to-dos is the limit" : "Add a to-do"}
            placeholderTextColor="#A3AFC6"
            selectionColor={theme.base}
            style={{ flex: 1, borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 12, paddingHorizontal: 12, height: 44, fontFamily: F.regular, fontSize: 15, color: C.ink }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add to-do"
            disabled={!draft.trim() || add.isPending || full}
            onPress={submit}
            style={{ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: theme.base, opacity: !draft.trim() || add.isPending || full ? 0.45 : 1 }}
          >
            <Plus size={20} color={theme.onBase} strokeWidth={2.6} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

function Comments({ adviceId, workflowId, placementId, p }: SectionProps) {
  const { theme } = useOrgTheme();
  const { data: session } = useSession();
  const { add, remove } = usePlacementComments(adviceId, workflowId, placementId);
  const [draft, setDraft] = React.useState("");

  const post = () => {
    const body = draft.trim();
    if (!body) return;
    add.mutate(body, { onSuccess: () => setDraft(""), onError: alertError("Couldn't post comment") });
  };
  const confirmDelete = (id: string) =>
    Alert.alert("Delete comment?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove.mutate(id, { onError: alertError("Couldn't delete comment") }) },
    ]);

  return (
    <Card icon={MessageSquare} iconBg="#EFF4FF" iconFg="#2563EB" title={`Comments${p.comments.length ? ` (${p.comments.length})` : ""}`}>
      <View style={{ gap: 10 }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={4000}
          placeholder="Write a comment for the team"
          placeholderTextColor="#A3AFC6"
          selectionColor={theme.base}
          textAlignVertical="top"
          style={{ minHeight: 80, borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 12, padding: 12, fontFamily: F.regular, fontSize: 15, color: C.ink }}
        />
        <View style={{ alignItems: "flex-end" }}>
          <PillButton label={add.isPending ? "Posting…" : "Post comment"} filled color={theme.base} disabled={!draft.trim() || add.isPending} onPress={post} />
        </View>
        {p.comments.map((c) => (
          <View key={c.id} style={{ backgroundColor: "#F6F8FC", borderRadius: 14, padding: 12, gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: theme.soft, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: F.bold, fontSize: 10.5, color: theme.text }}>{nameInitials(c.author.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.semibold, fontSize: 13.5, color: C.ink }}>{c.author.name}</Text>
                <Text style={text.meta}>{formatDateTime(c.createdAt)}</Text>
              </View>
              {c.author.id === session?.user.id ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Delete comment" hitSlop={10} onPress={() => confirmDelete(c.id)}>
                  <Trash size={15} color="#B4BFD3" strokeWidth={2} />
                </Pressable>
              ) : null}
            </View>
            <Text style={[text.body, { color: C.ink }]}>{c.body}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
