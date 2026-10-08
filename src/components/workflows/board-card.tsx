import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { C, F, text } from "@/components/client-detail/ui";
import { ClientBadges } from "@/components/workflows/badges";
import { formatCalendarDate, nameInitials } from "@/lib/format";
import { CalendarClock, CircleAlert, MessageSquare, UserCheck } from "@/lib/icons";
import { cardIsOverdue, isOverdue } from "@/lib/workflows";
import { useOrgTheme } from "@/providers/org-theme-provider";
import type { BoardCard as Card } from "@/types/workflow.types";

/**
 * A client on a board — the web WorkflowBoard card for a phone: org-colour initials, name,
 * type/source/tags, assignee, due date (red when overdue), "checklist item overdue",
 * and the stage checklist as a thin progress bar + comment count.
 * Overdue cards get a red edge (web: red ring).
 */
export function BoardCardView({ card, onPress }: { card: Card; onPress: () => void }) {
  const { theme } = useOrgTheme();
  const [pressed, setPressed] = React.useState(false);
  const overdue = cardIsOverdue(card);
  const dueOver = isOverdue(card.dueOn);
  const progress = card.totalCount > 0 ? card.doneCount / card.totalCount : 0;
  const prior = card.priorStageChecklists.filter((s) => s.doneCount < s.totalCount).length;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${card.client.name}${overdue ? ", overdue" : ""}`}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        backgroundColor: pressed ? "#F7F9FC" : "#FFFFFF",
        borderRadius: 16,
        borderWidth: overdue ? 1.5 : 1,
        borderColor: overdue ? "#F2B8B8" : "#E4EAF3",
        borderLeftWidth: 4,
        borderLeftColor: overdue ? C.danger : theme.base,
        padding: 14,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.base, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: theme.onBase }}>{nameInitials(card.client.name)}</Text>
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text numberOfLines={1} style={{ fontFamily: F.semibold, fontSize: 15.5, color: C.ink }}>
            {card.client.name}
          </Text>
          <ClientBadges type={card.client.type} source={card.client.source} tags={card.client.tags} />
        </View>
      </View>

      {card.assignedTo || card.dueOn || card.checklistOverdue ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, paddingLeft: 48 }}>
          {card.assignedTo ? (
            <Meta icon={UserCheck} label={card.assignedTo.name} />
          ) : null}
          {card.dueOn ? <Meta icon={CalendarClock} label={`Due ${formatCalendarDate(card.dueOn)}`} danger={dueOver} /> : null}
          {card.checklistOverdue && !dueOver ? <Meta icon={CircleAlert} label="Checklist item overdue" danger /> : null}
        </View>
      ) : null}

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 48 }}>
        {card.totalCount > 0 ? (
          <>
            <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: "#E8EEF7", overflow: "hidden" }}>
              <View style={{ width: `${Math.round(progress * 100)}%`, height: "100%", borderRadius: 3, backgroundColor: progress === 1 ? "#059669" : theme.base }} />
            </View>
            <Text style={[text.meta, { color: progress === 1 ? "#059669" : C.muted }]}>{`${card.doneCount}/${card.totalCount}`}</Text>
          </>
        ) : (
          <Text style={[text.meta, { flex: 1 }]}>No checklist on this stage</Text>
        )}
        {card.commentCount > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <MessageSquare size={12} color={C.faint} strokeWidth={2} />
            <Text style={text.meta}>{card.commentCount}</Text>
          </View>
        ) : null}
      </View>
      {prior > 0 ? <Text style={[text.meta, { paddingLeft: 48, marginTop: -4 }]}>{`${prior} earlier ${prior === 1 ? "stage" : "stages"} not finished`}</Text> : null}
    </Pressable>
  );
}

function Meta({ icon: Icon, label, danger }: { icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>; label: string; danger?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <Icon size={13} color={danger ? C.danger : "#8A97B5"} strokeWidth={2} />
      <Text style={{ fontFamily: danger ? F.semibold : F.regular, fontSize: 12.5, color: danger ? C.danger : "#5B6B8C" }}>{label}</Text>
    </View>
  );
}
