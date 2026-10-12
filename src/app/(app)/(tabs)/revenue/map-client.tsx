import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";

import { useRevenueAccounts } from "@/api/revenue.api";
import { AppHeader } from "@/components/app-header";
import { FormScreenHeader } from "@/components/clients/form-screen-header";
import { FlashNote } from "@/components/flash-note";
import { MapAccountSheet, type MappableAccount } from "@/components/revenue/map-account-sheet";
import { ClientMark } from "@/components/revenue/transaction-row";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ApiError } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import { ChevronRight, Inbox, Info, Search, X } from "@/lib/icons";
import { accountLabel } from "@/lib/revenue";
import { useOrgTheme } from "@/providers/org-theme-provider";
import type { MappedFilter, RevenueAccountGroup } from "@/types/revenue.types";

const F = { regular: "BricolageGrotesque_400Regular", medium: "BricolageGrotesque_500Medium", semibold: "BricolageGrotesque_600SemiBold", bold: "BricolageGrotesque_700Bold" };
const GREEN = "#16A34A";
const AMBER = "#D97706";

/**
 * Map Clients — web /portal/[adviceId]/my-revenue/map-client on a phone.
 * Each revenue account (grouped by account name, else number) maps to one of your
 * clients; every transaction of the account moves together.
 *
 * Web → mobile: 3 count cards → one progress card; All/Mapped/Unmapped tabs → segmented
 * switch; table + "click a row, scroll down" panel → account cards that open MapAccountSheet.
 * `?mapped=unmapped` opens on that tab (the nudge on My Revenue). docs/14-REVENUE.md.
 */
export default function MapClientsScreen() {
  const { theme } = useOrgTheme();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ mapped?: string }>();
  const [mapped, setMapped] = React.useState<MappedFilter>(params.mapped === "unmapped" || params.mapped === "mapped" ? params.mapped : "all");
  const [searchInput, setSearchInput] = React.useState("");
  const search = useDebouncedValue(searchInput.trim(), 300);
  const [mapping, setMapping] = React.useState<MappableAccount | null>(null);
  const [flash, setFlash] = React.useState<string | null>(null);
  const hideFlash = React.useCallback(() => setFlash(null), []);
  const [refreshing, setRefreshing] = React.useState(false);

  const q = useRevenueAccounts(mapped, search);
  const pages = q.data?.pages;
  const rows = React.useMemo(() => pages?.flatMap((p) => p.data) ?? [], [pages]);
  const total = pages?.[0]?.total ?? 0;
  const counts = pages?.[0]?.counts;
  const share = counts && counts.all ? counts.mapped / counts.all : 0;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["my-revenue"] });
    } finally {
      setRefreshing(false);
    }
  };

  const header = (
    <View style={{ gap: 14, paddingBottom: 10 }}>
      {/* Title scrolls with the list, like the other tabs (cancel the list's padding — the header brings its own) */}
      <View style={{ marginHorizontal: -20, marginTop: -16, marginBottom: 2 }}>
        <FormScreenHeader
          title="Map Clients"
          subtitle="Map your revenue accounts to your own clients."
          onBack={() => (router.canGoBack() ? router.back() : router.replace("/revenue"))}
        />
      </View>

      {/* Progress — the web's Total / Mapped / Unmapped cards as one gauge */}
      <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#D6E0F2", padding: 16, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontFamily: F.semibold, fontSize: 11.5, letterSpacing: 1.2, color: "#7089B8" }}>ACCOUNTS MAPPED</Text>
            <Text style={{ color: "#0D1B3E" }}>
              <Text style={{ fontFamily: F.bold, fontSize: 30 }}>{counts ? counts.mapped : "—"}</Text>
              <Text style={{ fontFamily: F.semibold, fontSize: 17, color: "#9AA6BF" }}>{counts ? ` / ${counts.all}` : ""}</Text>
            </Text>
          </View>
          <Text style={{ fontFamily: F.bold, fontSize: 20, color: share === 1 ? GREEN : theme.text }}>{counts ? `${Math.round(share * 100)}%` : ""}</Text>
        </View>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: "#FDF0D5", overflow: "hidden", flexDirection: "row" }}>
          <View style={{ width: `${share * 100}%`, backgroundColor: GREEN, borderRadius: 4 }} />
        </View>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <Legend color={GREEN} label="Mapped" value={counts?.mapped} />
          <Legend color={AMBER} label="Unmapped" value={counts?.unmapped} hollow />
        </View>
      </View>

      {/* Search */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 14, paddingHorizontal: 12, height: 46 }}>
        <Search size={17} color="#8A97B5" strokeWidth={2} />
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Search by account or client name"
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

      {/* All / Mapped / Unmapped */}
      <View style={{ flexDirection: "row", backgroundColor: "#E6ECF5", borderRadius: 12, padding: 3 }}>
        {(
          [
            ["all", "All", counts?.all],
            ["mapped", "Mapped", counts?.mapped],
            ["unmapped", "Unmapped", counts?.unmapped],
          ] as const
        ).map(([key, label, n]) => {
          const on = mapped === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setMapped(key)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: on ? "#FFFFFF" : "transparent",
                shadowColor: "#0D1B3E",
                shadowOpacity: on ? 0.08 : 0,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 1 },
                elevation: on ? 1 : 0,
              }}
            >
              <Text style={{ fontFamily: on ? F.semibold : F.medium, fontSize: 13.5, color: on ? "#0D1B3E" : "#6B7A99" }}>{label}</Text>
              {n !== undefined ? (
                <View style={{ minWidth: 20, alignItems: "center", borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1, backgroundColor: on ? theme.soft : "#D5DDEA" }}>
                  <Text style={{ fontFamily: F.bold, fontSize: 11, color: on ? theme.text : "#5B6B8C" }}>{n}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginLeft: 2 }}>
        <Info size={14} color={theme.text} strokeWidth={2.2} />
        <Text style={{ flex: 1, fontFamily: F.medium, fontSize: 12.5, color: theme.text }}>Tap an account to map it or change its client.</Text>
        {pages ? <Text style={{ fontFamily: F.regular, fontSize: 12.5, color: "#7089B8" }}>{`${rows.length} of ${total}`}</Text> : null}
      </View>
    </View>
  );

  const errorText = q.error instanceof ApiError ? q.error.message : "Couldn't load your accounts.";

  return (
    <View className="bg-background flex-1">
      <AppHeader />
      <FlatList<RevenueAccountGroup>
        data={rows}
        keyExtractor={(a) => a.key}
        renderItem={({ item }) => (
          <AccountCard
            account={item}
            onPress={() => setMapping(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={header}
        contentContainerStyle={{ padding: 20, paddingTop: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (q.hasNextPage && !q.isFetchingNextPage) void q.fetchNextPage();
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.base} colors={[theme.base]} />}
        ListEmptyComponent={
          q.isPending ? (
            <View style={{ gap: 10 }}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={{ height: 84, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E4EAF3", opacity: 0.7 }} />
              ))}
            </View>
          ) : q.isError ? (
            <Empty title="Couldn't load accounts" message={errorText} action={{ label: "Try again", onPress: () => void q.refetch() }} tint={theme.text} />
          ) : search ? (
            <Empty title="No matching accounts" message="Try a different account or client name." tint={theme.text} />
          ) : mapped === "unmapped" ? (
            <Empty title="All accounts are mapped" message="Every revenue account is linked to a client. Nice." tint={theme.text} />
          ) : mapped === "mapped" ? (
            <Empty title="Nothing mapped yet" message="Map an account to a client and it shows here." tint={theme.text} />
          ) : (
            <Empty title="No revenue accounts yet" message="Accounts appear once your licensee's revenue has been imported." tint={theme.text} />
          )
        }
        ListFooterComponent={q.isFetchingNextPage ? <ActivityIndicator color={theme.base} style={{ paddingVertical: 16 }} /> : null}
      />
      {mapping ? <MapAccountSheet account={mapping} onClose={() => setMapping(null)} onDone={setFlash} /> : null}
      <FlashNote message={flash} onHide={hideFlash} />
    </View>
  );
}

/** One account — name/number, txns · gross, net, and its client (or Unmapped). Amber edge = needs mapping. */
function AccountCard({ account, onPress }: { account: RevenueAccountGroup; onPress: () => void }) {
  const [pressed, setPressed] = React.useState(false);
  const n = account.transactionCount;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${accountLabel(account)}, ${formatMoney(account.netAmount)} net. ${account.client ? `Mapped to ${account.client.name}` : "Unmapped"}`}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: pressed ? "#F7F9FD" : "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#D6E0F2",
        borderLeftWidth: 4,
        borderLeftColor: account.client ? GREEN : AMBER,
        paddingVertical: 13,
        paddingLeft: 13,
        paddingRight: 10,
      }}
    >
      <View style={{ flex: 1, gap: 5 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.semibold, fontSize: 15, color: "#0D1B3E" }} numberOfLines={1}>
              {accountLabel(account)}
            </Text>
            <Text style={{ fontFamily: F.regular, fontSize: 12, color: "#9AA6BF", fontVariant: ["tabular-nums"] }}>
              {[account.productProvider, account.accountNumber ? `Acc ${account.accountNumber}` : null].filter(Boolean).join(" · ") ||
                "No provider or account number"}
            </Text>
            <Text style={{ fontFamily: F.regular, fontSize: 12, color: "#9AA6BF", fontVariant: ["tabular-nums"] }}>
              {`${n} transaction${n === 1 ? "" : "s"} · gross ${formatMoney(account.grossAmount)}`}
            </Text>
          </View>
          <Text style={{ fontFamily: F.bold, fontSize: 15, color: "#0D1B3E", fontVariant: ["tabular-nums"] }}>{formatMoney(account.netAmount)}</Text>
        </View>
        <ClientMark client={account.client} />
      </View>
      <ChevronRight size={17} color="#B5C0D4" strokeWidth={2.2} />
    </Pressable>
  );
}

function Legend({ color, label, value, hollow }: { color: string; label: string; value?: number; hollow?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: hollow ? "transparent" : color, borderWidth: hollow ? 1.5 : 0, borderColor: color }} />
      <Text style={{ fontFamily: F.medium, fontSize: 12.5, color: "#5B6B8C" }}>
        {label} <Text style={{ fontFamily: F.bold, color: "#0D1B3E" }}>{value ?? "—"}</Text>
      </Text>
    </View>
  );
}

function Empty({ title, message, action, tint }: { title: string; message: string; action?: { label: string; onPress: () => void }; tint: string }) {
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
