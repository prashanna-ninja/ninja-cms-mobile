import * as React from "react";
import { LayoutAnimation, Pressable, ScrollView, Text, View } from "react-native";

import { useNoticeDetails, useNotices } from "@/api/notices.api";
import { NoticeCard } from "@/components/notices/notice-card";
import { MONTH_MS, WEEK_MS } from "@/lib/date";
import { ArrowUpDown, Bell, Inbox } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";
import type { NoticeListItem } from "@/types/notice.types";

const FONT = {
  regular: "BricolageGrotesque_400Regular",
  medium: "BricolageGrotesque_500Medium",
  semibold: "BricolageGrotesque_600SemiBold",
  bold: "BricolageGrotesque_700Bold",
};

type Filter = "all" | "week" | "month" | "older";
type SortOrder = "newest" | "oldest";

// Same filters, labels and empty copy as the web (NoticesClient.tsx).
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All Notices" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "older", label: "Older" },
];

const EMPTY_MESSAGES: Record<Filter, string> = {
  all: "No notices available yet.",
  week: "No notices this week.",
  month: "No notices this month.",
  older: "No older notices.",
};

function applyFilter(notices: NoticeListItem[], filter: Filter, now: number) {
  const age = (n: NoticeListItem) => now - new Date(n.createdAt).getTime();
  switch (filter) {
    case "week":
      return notices.filter((n) => age(n) <= WEEK_MS);
    case "month":
      return notices.filter((n) => age(n) <= MONTH_MS);
    case "older":
      return notices.filter((n) => age(n) > MONTH_MS);
    default:
      return notices;
  }
}

/**
 * The portal home's Notices section — a port of the web
 * (CMS app/portal/[adviceId]/_components/NoticesSection.tsx + NoticesClient.tsx),
 * all in the active org's colours.
 *
 * Mobile changes: the filter dropdown becomes a row of chips (one tap, no menu),
 * and the 2-column grid becomes a single column.
 */
export function NoticesSection() {
  const { org, theme } = useOrgTheme();
  const noticesQuery = useNotices(org?.id);
  const notices = React.useMemo(() => noticesQuery.data ?? [], [noticesQuery.data]);
  const details = useNoticeDetails(notices.map((n) => n.id));
  const detailById = React.useMemo(() => new Map(notices.map((n, i) => [n.id, details[i]])), [notices, details]);

  const [filter, setFilter] = React.useState<Filter>("all");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("newest");
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set());
  // "Now" = when the list was fetched (not Date.now() during render — keeps render
  // pure for the React Compiler, and NEW / filters stay stable while scrolling).
  const now = noticesQuery.dataUpdatedAt;

  const visible = React.useMemo(() => {
    const filtered = applyFilter(notices, filter, now);
    return sortOrder === "oldest" ? [...filtered].reverse() : filtered;
  }, [notices, filter, sortOrder, now]);

  const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const toggle = (id: string) => {
    animate();
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const changeFilter = (f: Filter) => {
    animate();
    setFilter(f);
    setExpanded(new Set());
  };

  const toggleSort = () => {
    animate();
    setSortOrder((s) => (s === "newest" ? "oldest" : "newest"));
    setExpanded(new Set());
  };

  const variables = React.useMemo(() => ({ name: org?.name }), [org?.name]);

  return (
    <View style={{ gap: 14 }}>
      {/* Header: bell tile + "Notices" + count … sort toggle */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: theme.soft, alignItems: "center", justifyContent: "center" }}>
          <Bell size={17} color={theme.text} strokeWidth={2} />
        </View>
        <Text style={{ fontFamily: FONT.bold, fontSize: 22, color: "#0D1B3E" }}>Notices</Text>
        {notices.length > 0 ? (
          <View style={{ backgroundColor: theme.soft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: theme.text }}>{notices.length}</Text>
          </View>
        ) : null}
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sort: ${sortOrder === "newest" ? "newest first" : "oldest first"}`}
          onPress={toggleSort}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingHorizontal: 11,
            paddingVertical: 7,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "#DCE3EE",
            backgroundColor: "#FFFFFF",
          }}
        >
          <ArrowUpDown size={12} color="#0D1B3E" strokeWidth={2.5} />
          <Text style={{ fontFamily: FONT.medium, fontSize: 13, color: "#0D1B3E" }}>{sortOrder === "newest" ? "Newest" : "Oldest"}</Text>
        </Pressable>
      </View>

      {/* Filter chips (web: a dropdown) — full width, scrolls sideways on small phones */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable
                key={f.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => changeFilter(f.key)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? theme.base : "#DCE3EE",
                  backgroundColor: active ? theme.base : "#FFFFFF",
                }}
              >
                <Text style={{ fontFamily: FONT.medium, fontSize: 13, color: active ? theme.onBase : "#0D1B3E" }}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {noticesQuery.isPending ? (
        <View style={{ gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ height: 66, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: theme.line, opacity: 0.7 }} />
          ))}
        </View>
      ) : noticesQuery.isError ? (
        <EmptyCard
          message="Couldn't load notices."
          action={{ label: "Try again", onPress: () => void noticesQuery.refetch() }}
          tint={theme.text}
        />
      ) : visible.length === 0 ? (
        <EmptyCard message={EMPTY_MESSAGES[filter]} tint={theme.text} />
      ) : (
        <View style={{ gap: 12 }}>
          {visible.map((notice, idx) => {
            const d = detailById.get(notice.id);
            return (
              <NoticeCard
                key={notice.id}
                index={idx}
                notice={notice}
                detail={d?.data}
                detailPending={!!d?.isPending}
                detailError={!!d?.isError}
                isNew={now - new Date(notice.createdAt).getTime() < WEEK_MS}
                expanded={expanded.has(notice.id)}
                onToggle={() => toggle(notice.id)}
                onRetry={() => void d?.refetch()}
                theme={theme}
                variables={variables}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

function EmptyCard({ message, action, tint }: { message: string; action?: { label: string; onPress: () => void }; tint: string }) {
  return (
    <View
      style={{
        alignItems: "center",
        gap: 8,
        paddingVertical: 28,
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#DCE3EE",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Inbox size={22} color="#9AAACB" strokeWidth={1.8} />
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "#6B7A99" }}>{message}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={action.onPress} hitSlop={8}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: tint }}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
