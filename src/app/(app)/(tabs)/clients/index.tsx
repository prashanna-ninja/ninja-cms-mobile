import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as React from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { useClientRecords } from "@/api/clients.api";
import { AppHeader } from "@/components/app-header";
import { ClientCard } from "@/components/clients/client-card";
import { OptionSheet, type SheetOption } from "@/components/clients/option-sheet";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { CLIENT_SOURCES, CLIENT_TYPES, clientSourceLabel, clientTypeLabel } from "@/lib/clients";
import { ApiError } from "@/lib/api-client";
import { ChevronDown, Contact, Inbox, Plus, Search, X } from "@/lib/icons";
import { mix } from "@/lib/org-theme";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";
import {
  DEFAULT_CLIENT_FILTERS,
  type ClientFilters,
  type ClientRecord,
  type ClientSource,
  type ClientType,
} from "@/types/client.types";

const FONT = {
  regular: "BricolageGrotesque_400Regular",
  medium: "BricolageGrotesque_500Medium",
  semibold: "BricolageGrotesque_600SemiBold",
  bold: "BricolageGrotesque_700Bold",
};

type SheetKind = "type" | "tag" | "source" | null;

/**
 * Client Records — the web's /portal/[adviceId]/client-records list on a phone.
 *
 * Web controls → mobile:
 *   Search box + button      → search-as-you-type (350ms debounce), clear button
 *   Active / Archived select → a two-way segmented switch
 *   All tags/types/sources   → chips that open a bottom sheet (OptionSheet)
 *   Table rows               → ClientCard; pages of 50 load as you scroll
 * Read-only for now (no add / archive / delete — next steps). docs/12-CLIENTS.md.
 */
export default function ClientRecordsScreen() {
  const { org, theme } = useOrgTheme();
  const { data: session } = useSession();
  // Staff can open and edit clients but not add them (web hides "Add client" too).
  const canAdd = session?.user.role !== "staff";
  const addBg = mix(theme.text, "#000000", 0.18);
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = React.useState("");
  const search = useDebouncedValue(searchInput.trim(), 350);
  const [filters, setFilters] = React.useState<Omit<ClientFilters, "search">>({
    tag: DEFAULT_CLIENT_FILTERS.tag,
    type: DEFAULT_CLIENT_FILTERS.type,
    source: DEFAULT_CLIENT_FILTERS.source,
    archived: DEFAULT_CLIENT_FILTERS.archived,
  });
  const allFilters = React.useMemo(() => ({ ...filters, search }), [filters, search]);
  const [sheet, setSheet] = React.useState<SheetKind>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const query = useClientRecords(org?.id, allFilters);
  const pages = query.data?.pages;
  const clients = React.useMemo(() => pages?.flatMap((p) => p.clients) ?? [], [pages]);
  const total = pages?.[0]?.total ?? 0;
  // The adviser's full tag list rides along on every page.
  const tags = pages?.[0]?.tags ?? [];
  const filtered = !!(search || filters.tag || filters.type || filters.source);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["client-records", org?.id ?? ""] });
    } finally {
      setRefreshing(false);
    }
  };

  const sheetConfig: Record<Exclude<SheetKind, null>, { title: string; value: string; options: SheetOption[] }> = {
    type: {
      title: "Client type",
      value: filters.type,
      options: [{ value: "", label: "All types" }, ...CLIENT_TYPES.map((t) => ({ value: t, label: clientTypeLabel(t) }))],
    },
    tag: {
      title: "Tag",
      value: filters.tag,
      options: [{ value: "", label: "All tags" }, ...tags.map((t) => ({ value: t.id, label: t.name, color: t.color }))],
    },
    source: {
      title: "Source",
      value: filters.source,
      options: [{ value: "", label: "All sources" }, ...CLIENT_SOURCES.map((s) => ({ value: s, label: clientSourceLabel(s) }))],
    },
  };

  const chipLabel = {
    type: filters.type ? clientTypeLabel(filters.type) : "All types",
    tag: filters.tag ? (tags.find((t) => t.id === filters.tag)?.name ?? "Tag") : "All tags",
    source: filters.source ? clientSourceLabel(filters.source) : "All sources",
  };

  const header = (
    <View style={{ gap: 14, paddingBottom: 6 }}>
      {/* Title — web: icon tile + "Client Records" + "N clients" pill + subtitle */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.soft, alignItems: "center", justifyContent: "center" }}>
          <Contact size={19} color={theme.text} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 22, color: "#0D1B3E" }}>Client Records</Text>
            {pages ? (
              <View style={{ backgroundColor: theme.soft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 11.5, color: theme.text }}>
                  {`${total} ${total === 1 ? "client" : "clients"}`}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: "#7089B8" }}>Client profiles, fact finds, and notes.</Text>
        </View>
        {canAdd ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add client"
            onPress={() => router.push("/clients/new")}
            hitSlop={6}
            style={({ pressed }) => ({
              width: 46,
              height: 46,
              borderRadius: 14,
              // Deep org shade (text-safe colour, darkened) so it never melts into the light page, even for pale org colours.
              backgroundColor: pressed ? mix(theme.text, "#000000", 0.32) : addBg,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: addBg,
              shadowOpacity: 0.35,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 5,
            })}
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={2.6} />
          </Pressable>
        ) : null}
      </View>

      {/* Search */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#DCE3EE",
          borderRadius: 14,
          paddingHorizontal: 12,
          height: 46,
        }}
      >
        <Search size={17} color="#8A97B5" strokeWidth={2} />
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Search by name, email, or phone"
          placeholderTextColor="#A3AFC6"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          selectionColor={theme.base}
          style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, color: "#0D1B3E", paddingVertical: 0 }}
        />
        {searchInput ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setSearchInput("")} hitSlop={10}>
            <X size={17} color="#8A97B5" strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>

      {/* Active / Archived */}
      <View style={{ flexDirection: "row", backgroundColor: "#E6ECF5", borderRadius: 12, padding: 3 }}>
        {[
          { key: false, label: "Active" },
          { key: true, label: "Archived" },
        ].map((opt) => {
          const active = filters.archived === opt.key;
          return (
            <Pressable
              key={opt.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setFilters((f) => ({ ...f, archived: opt.key }))}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: active ? "#FFFFFF" : "transparent",
                shadowColor: "#0D1B3E",
                shadowOpacity: active ? 0.08 : 0,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 1 },
                elevation: active ? 1 : 0,
              }}
            >
              <Text style={{ fontFamily: active ? FONT.semibold : FONT.medium, fontSize: 14, color: active ? "#0D1B3E" : "#6B7A99" }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Filter chips → bottom sheets */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {(["type", "tag", "source"] as const).map((kind) => {
          const set = !!filters[kind];
          return (
            <Pressable
              key={kind}
              accessibilityRole="button"
              onPress={() => setSheet(kind)}
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
              <Text style={{ fontFamily: FONT.medium, fontSize: 13, color: set ? theme.text : "#0D1B3E" }}>{chipLabel[kind]}</Text>
              <ChevronDown size={14} color={set ? theme.text : "#6B7A99"} strokeWidth={2.4} />
            </Pressable>
          );
        })}
        {filtered ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setSearchInput("");
              setFilters((f) => ({ ...f, tag: "", type: "", source: "" }));
            }}
            style={{ paddingHorizontal: 10, paddingVertical: 8, justifyContent: "center" }}
          >
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: theme.text }}>Clear</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );

  const errorMessage = query.error instanceof ApiError ? query.error.message : "Couldn't load clients.";

  return (
    <View className="bg-background flex-1">
      <AppHeader />
      <FlatList<ClientRecord>
        data={clients}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <ClientCard
            client={item}
            onPress={() => router.push({ pathname: "/clients/[id]", params: { id: item.id, name: item.name } })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={{ marginBottom: 12 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.base} colors={[theme.base]} />}
        ListEmptyComponent={
          query.isPending ? (
            <View style={{ gap: 10 }}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={{ height: 112, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E4EAF3", opacity: 0.7 }} />
              ))}
            </View>
          ) : query.isError ? (
            <EmptyState
              title="Couldn't load clients"
              message={errorMessage}
              action={{ label: "Try again", onPress: () => void query.refetch() }}
              tint={theme.text}
            />
          ) : filtered ? (
            <EmptyState title="No matching clients" message="Try a different search or clear the filters." tint={theme.text} />
          ) : filters.archived ? (
            <EmptyState title="No archived clients" message="Clients you archive on the web will show here." tint={theme.text} />
          ) : (
            <EmptyState title="No clients yet" message="Clients added in your adviser portal will show here." tint={theme.text} />
          )
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator color={theme.base} style={{ paddingVertical: 16 }} />
          ) : clients.length > 0 && !query.hasNextPage && clients.length >= 10 ? (
            <Text style={{ textAlign: "center", fontFamily: FONT.regular, fontSize: 12.5, color: "#9AA6BF", paddingTop: 16 }}>
              {`All ${total} clients shown`}
            </Text>
          ) : null
        }
      />

      {sheet ? (
        <OptionSheet
          visible
          title={sheetConfig[sheet].title}
          options={sheetConfig[sheet].options}
          value={sheetConfig[sheet].value}
          onSelect={(value) =>
            setFilters((f) => ({
              ...f,
              ...(sheet === "type" ? { type: value as ClientType | "" } : null),
              ...(sheet === "tag" ? { tag: value } : null),
              ...(sheet === "source" ? { source: value as ClientSource | "" } : null),
            }))
          }
          onClose={() => setSheet(null)}
        />
      ) : null}
    </View>
  );
}

function EmptyState({
  title,
  message,
  action,
  tint,
}: {
  title: string;
  message: string;
  action?: { label: string; onPress: () => void };
  tint: string;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        gap: 8,
        paddingVertical: 36,
        paddingHorizontal: 24,
        borderRadius: 18,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#DCE3EE",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Inbox size={24} color="#9AAACB" strokeWidth={1.8} />
      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: "#0D1B3E" }}>{title}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: "#6B7A99", textAlign: "center" }}>{message}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={action.onPress} hitSlop={8} style={{ marginTop: 4 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: tint }}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
