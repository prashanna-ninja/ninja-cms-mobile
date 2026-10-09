import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as React from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, SectionList, Text, TextInput, View } from "react-native";

import { useRevenueAccounts, useRevenueStats, useRevenueTransactions } from "@/api/revenue.api";
import { AppHeader } from "@/components/app-header";
import { OptionSheet } from "@/components/clients/option-sheet";
import { FlashNote } from "@/components/flash-note";
import { DateRangeSheet, rangeLabel } from "@/components/revenue/date-range-sheet";
import { MapAccountSheet, type MappableAccount } from "@/components/revenue/map-account-sheet";
import { RevenueHero } from "@/components/revenue/revenue-hero";
import { TransactionRow } from "@/components/revenue/transaction-row";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ApiError } from "@/lib/api-client";
import { ArrowUpDown, Calendar, ChartLine, ChevronDown, ChevronRight, Inbox, Link2, Search, X } from "@/lib/icons";
import { REVENUE_ENTITIES, SORT_OPTIONS, paidParts } from "@/lib/revenue";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { DEFAULT_REVENUE_FILTERS, type RevenueEntity, type RevenueFilters, type RevenueTransaction } from "@/types/revenue.types";

const F = { regular: "BricolageGrotesque_400Regular", medium: "BricolageGrotesque_500Medium", semibold: "BricolageGrotesque_600SemiBold", bold: "BricolageGrotesque_700Bold" };

type Section = { key: string; title: string; data: RevenueTransaction[] };

/**
 * My Revenue — web /portal/[adviceId]/my-revenue on a phone. The user's own revenue
 * (not org-scoped); the tab only shows when the server allows it (403 → hidden).
 *
 * Web → mobile:
 *   4 stat cards              → one org-coloured statement card (RevenueHero)
 *   Search / date / licensee  → search-as-you-type + chips → bottom sheets (+ a sort chip)
 *   Transactions table        → a ledger grouped by month, 25 per page as you scroll
 *   "Map clients" button      → header pill + an "N accounts unmapped" nudge → map-client
 * Tapping a transaction maps its account straight away (MapAccountSheet).
 * The web's product filter isn't here: its options are server-rendered (no API). docs/14-REVENUE.md.
 */
export default function MyRevenueScreen() {
  const { theme } = useOrgTheme();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = React.useState("");
  const search = useDebouncedValue(searchInput.trim(), 350);
  const [rest, setRest] = React.useState<Omit<RevenueFilters, "search">>({
    entity: DEFAULT_REVENUE_FILTERS.entity,
    datePaidFrom: DEFAULT_REVENUE_FILTERS.datePaidFrom,
    datePaidTo: DEFAULT_REVENUE_FILTERS.datePaidTo,
    sortBy: DEFAULT_REVENUE_FILTERS.sortBy,
  });
  const filters = React.useMemo(() => ({ ...rest, search }), [rest, search]);
  const filtered = !!(search || rest.entity || rest.datePaidFrom);

  const [sheet, setSheet] = React.useState<"date" | "entity" | "sort" | null>(null);
  const [mapping, setMapping] = React.useState<MappableAccount | null>(null);
  const [flash, setFlash] = React.useState<string | null>(null);
  const hideFlash = React.useCallback(() => setFlash(null), []);
  const [refreshing, setRefreshing] = React.useState(false);

  const stats = useRevenueStats(filters);
  const txs = useRevenueTransactions(filters);
  const accounts = useRevenueAccounts("all", "");
  const unmapped = accounts.data?.pages[0]?.counts.unmapped ?? 0;

  const pages = txs.data?.pages;
  const total = pages?.[0]?.total ?? 0;
  // Month sections only follow date order; for amount sorts it's one flat list.
  const byDate = rest.sortBy === "" || rest.sortBy === "datePaid";
  const sections = React.useMemo<Section[]>(() => {
    const rows = pages?.flatMap((p) => p.data) ?? [];
    if (!byDate) return rows.length ? [{ key: "all", title: "", data: rows }] : [];
    const out: Section[] = [];
    for (const tx of rows) {
      const { key, label } = paidParts(tx.datePaid);
      let s = out[out.length - 1];
      if (!s || s.key !== key) out.push((s = { key, title: label, data: [] }));
      s.data.push(tx);
    }
    return out;
  }, [pages, byDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["my-revenue"] });
    } finally {
      setRefreshing(false);
    }
  };

  const chips: { key: "date" | "entity" | "sort"; label: string; set: boolean; icon?: typeof Calendar }[] = [
    { key: "date", label: rangeLabel(rest.datePaidFrom, rest.datePaidTo), set: !!rest.datePaidFrom, icon: Calendar },
    { key: "entity", label: rest.entity || "All licensees", set: !!rest.entity },
    { key: "sort", label: SORT_OPTIONS.find((o) => o.value === rest.sortBy)!.label, set: !!rest.sortBy, icon: ArrowUpDown },
  ];

  const header = (
    <View style={{ gap: 16, paddingBottom: 4 }}>
      {/* Title */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.soft, alignItems: "center", justifyContent: "center" }}>
          <ChartLine size={19} color={theme.text} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 22, color: "#0D1B3E" }}>My Revenue</Text>
          <Text style={{ fontFamily: F.regular, fontSize: 13, color: "#7089B8" }}>Your revenue, as reported by your licensees.</Text>
        </View>
        <MapClientsPill onPress={() => router.push("/revenue/map-client")} />
      </View>

      <RevenueHero stats={stats.data} rangeLabel={rangeLabel(rest.datePaidFrom, rest.datePaidTo)} dim={stats.isPlaceholderData} />

      {/* Nudge: accounts waiting for a client */}
      {unmapped > 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: "/revenue/map-client", params: { mapped: "unmapped" } })}
          style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FDE68A", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}
        >
          <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center" }}>
            <Link2 size={16} color="#B45309" strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.semibold, fontSize: 14.5, color: "#78350F" }}>{`${unmapped} account${unmapped === 1 ? "" : "s"} not mapped to a client`}</Text>
            <Text style={{ fontFamily: F.regular, fontSize: 12.5, color: "#92400E" }}>Map them so revenue shows on each client’s record.</Text>
          </View>
          <ChevronRight size={18} color="#B45309" strokeWidth={2.2} />
        </Pressable>
      ) : null}

      {/* Search — account name / number only (web accountOnlySearch) */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 14, paddingHorizontal: 12, height: 46 }}>
        <Search size={17} color="#8A97B5" strokeWidth={2} />
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Search by account name or number"
          placeholderTextColor="#A3AFC6"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          selectionColor={theme.base}
          style={{ flex: 1, fontFamily: F.regular, fontSize: 15, color: "#0D1B3E", paddingVertical: 0 }}
        />
        {searchInput ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setSearchInput("")} hitSlop={10}>
            <X size={17} color="#8A97B5" strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginHorizontal: -20 }}>
        <View style={{ width: 12 }} />
        {chips.map(({ key, label, set, icon: Icon }) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            onPress={() => setSheet(key)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: set ? theme.base : "#DCE3EE",
              backgroundColor: set ? theme.soft : "#FFFFFF",
            }}
          >
            {Icon ? <Icon size={14} color={set ? theme.text : "#6B7A99"} strokeWidth={2.2} /> : null}
            <Text style={{ fontFamily: F.medium, fontSize: 13, color: set ? theme.text : "#0D1B3E" }}>{label}</Text>
            <ChevronDown size={14} color={set ? theme.text : "#6B7A99"} strokeWidth={2.4} />
          </Pressable>
        ))}
        {filtered ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setSearchInput("");
              setRest((r) => ({ ...r, entity: "", datePaidFrom: "", datePaidTo: "" }));
            }}
            style={{ paddingHorizontal: 10, paddingVertical: 8, justifyContent: "center" }}
          >
            <Text style={{ fontFamily: F.semibold, fontSize: 13, color: theme.text }}>Clear</Text>
          </Pressable>
        ) : null}
        <View style={{ width: 12 }} />
      </ScrollView>

      {pages ? (
        <Text style={{ fontFamily: F.semibold, fontSize: 12, letterSpacing: 1, color: "#7089B8", marginLeft: 4, marginTop: 2 }}>
          {`${total} TRANSACTION${total === 1 ? "" : "S"}`}
        </Text>
      ) : null}
    </View>
  );

  const errorText = txs.error instanceof ApiError ? txs.error.message : "Couldn't load your revenue.";

  return (
    <View className="bg-background flex-1">
      <AppHeader />
      <SectionList<RevenueTransaction, Section>
        sections={sections}
        keyExtractor={(t) => t.id}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) =>
          section.title ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 4, paddingTop: 18, paddingBottom: 8 }}>
              <Text style={{ fontFamily: F.bold, fontSize: 15, color: "#0D1B3E" }}>{section.title}</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: "#DCE3EE" }} />
            </View>
          ) : (
            <View style={{ height: 12 }} />
          )
        }
        renderItem={({ item, index, section }) => {
          const first = index === 0;
          const last = index === section.data.length - 1;
          return (
            <View
              style={{
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderTopWidth: first ? 1 : 0,
                borderBottomWidth: last ? 1 : 0,
                borderColor: "#D6E0F2",
                borderTopLeftRadius: first ? 18 : 0,
                borderTopRightRadius: first ? 18 : 0,
                borderBottomLeftRadius: last ? 18 : 0,
                borderBottomRightRadius: last ? 18 : 0,
                overflow: "hidden",
              }}
            >
              <TransactionRow
                tx={item}
                first={first}
                onPress={() => setMapping({ accountName: item.accountName, accountNumber: item.accountNumber, client: item.client })}
              />
            </View>
          );
        }}
        ListHeaderComponent={header}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (txs.hasNextPage && !txs.isFetchingNextPage) void txs.fetchNextPage();
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.base} colors={[theme.base]} />}
        ListEmptyComponent={
          <View style={{ marginTop: 12 }}>
            {txs.isPending ? (
              <View style={{ gap: 10 }}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={{ height: 96, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E4EAF3", opacity: 0.7 }} />
                ))}
              </View>
            ) : txs.isError ? (
              <EmptyState title="Couldn't load your revenue" message={errorText} action={{ label: "Try again", onPress: () => void txs.refetch() }} tint={theme.text} />
            ) : filtered ? (
              <EmptyState title="No matching transactions" message="Try a different search, date range or licensee." tint={theme.text} />
            ) : (
              <EmptyState title="No revenue yet" message="Transactions from your licensee's revenue imports will show here." tint={theme.text} />
            )}
          </View>
        }
        ListFooterComponent={
          txs.isFetchingNextPage ? (
            <ActivityIndicator color={theme.base} style={{ paddingVertical: 16 }} />
          ) : total > 25 && !txs.hasNextPage ? (
            <Text style={{ textAlign: "center", fontFamily: F.regular, fontSize: 12.5, color: "#9AA6BF", paddingTop: 16 }}>{`All ${total} transactions shown`}</Text>
          ) : null
        }
      />

      {sheet === "date" ? (
        <DateRangeSheet
          from={rest.datePaidFrom}
          to={rest.datePaidTo}
          onApply={({ from, to }) => setRest((r) => ({ ...r, datePaidFrom: from, datePaidTo: to }))}
          onClose={() => setSheet(null)}
        />
      ) : null}
      {sheet === "entity" ? (
        <OptionSheet
          visible
          title="Licensee"
          options={[{ value: "", label: "All licensees" }, ...REVENUE_ENTITIES.map((e) => ({ value: e, label: e }))]}
          value={rest.entity}
          onSelect={(v) => setRest((r) => ({ ...r, entity: v as RevenueEntity | "" }))}
          onClose={() => setSheet(null)}
        />
      ) : null}
      {sheet === "sort" ? (
        <OptionSheet
          visible
          title="Sort by"
          options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          value={rest.sortBy}
          onSelect={(v) => setRest((r) => ({ ...r, sortBy: v as RevenueFilters["sortBy"] }))}
          onClose={() => setSheet(null)}
        />
      ) : null}
      {mapping ? <MapAccountSheet account={mapping} onClose={() => setMapping(null)} onDone={setFlash} /> : null}
      <FlashNote message={flash} onHide={hideFlash} />
    </View>
  );
}

/** "Map clients" — the web header button, as an org-coloured pill. Hand-tracked pressed state (NativeWind). */
function MapClientsPill({ onPress }: { onPress: () => void }) {
  const { theme } = useOrgTheme();
  const [pressed, setPressed] = React.useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Map clients"
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      hitSlop={6}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        height: 38,
        paddingHorizontal: 13,
        borderRadius: 12,
        backgroundColor: pressed ? theme.pressed : theme.base,
      }}
    >
      <Link2 size={15} color={theme.onBase} strokeWidth={2.4} />
      <Text style={{ fontFamily: F.semibold, fontSize: 13.5, color: theme.onBase }}>Map</Text>
    </Pressable>
  );
}

function EmptyState({ title, message, action, tint }: { title: string; message: string; action?: { label: string; onPress: () => void }; tint: string }) {
  return (
    <View style={{ alignItems: "center", gap: 8, paddingVertical: 36, paddingHorizontal: 24, borderRadius: 18, borderWidth: 1.5, borderStyle: "dashed", borderColor: "#DCE3EE", backgroundColor: "#FFFFFF" }}>
      <Inbox size={24} color="#9AAACB" strokeWidth={1.8} />
      <Text style={{ fontFamily: F.semibold, fontSize: 15, color: "#0D1B3E" }}>{title}</Text>
      <Text style={{ fontFamily: F.regular, fontSize: 13.5, color: "#6B7A99", textAlign: "center" }}>{message}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={action.onPress} hitSlop={8} style={{ marginTop: 4 }}>
          <Text style={{ fontFamily: F.semibold, fontSize: 14, color: tint }}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
