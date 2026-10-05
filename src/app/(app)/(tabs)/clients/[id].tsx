import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { AppHeader } from "@/components/app-header";
import { SettingsGroup, SettingsRow } from "@/components/settings/settings-group";
import { clientSourceLabel, clientTypeLabel, clientTypeStyle } from "@/lib/clients";
import { formatShortDate } from "@/lib/date";
import { ArrowLeft, Calendar, Mail, Phone, Sparkles, Tag } from "@/lib/icons";
import { initials } from "@/lib/user-display";
import { useOrgTheme } from "@/providers/org-theme-provider";
import type { ClientRecord, ClientRecordsResponse } from "@/types/client.types";

const FONT = {
  regular: "BricolageGrotesque_400Regular",
  medium: "BricolageGrotesque_500Medium",
  semibold: "BricolageGrotesque_600SemiBold",
  bold: "BricolageGrotesque_700Bold",
};

/** Find a client in any cached Client Records page (the list already has the basics). */
function useCachedClient(id: string | undefined): ClientRecord | undefined {
  const queryClient = useQueryClient();
  return React.useMemo(() => {
    if (!id) return undefined;
    for (const [, data] of queryClient.getQueriesData<InfiniteData<ClientRecordsResponse>>({ queryKey: ["client-records"] })) {
      const hit = data?.pages.flatMap((p) => p.clients).find((c) => c.id === id);
      if (hit) return hit;
    }
    return undefined;
  }, [id, queryClient]);
}

/**
 * A client — placeholder until the full profile lands (web:
 * /portal/[adviceId]/client-records/[clientId]: profile, fact find, notes, files,
 * activity, workflows). Shows what the list already knows. docs/12-CLIENTS.md.
 */
export default function ClientDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { theme } = useOrgTheme();
  const client = useCachedClient(id);
  const title = client?.name ?? name ?? "Client";
  const type = client ? clientTypeStyle(client.type) : null;

  return (
    <View className="bg-background flex-1">
      <AppHeader />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 32 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to clients"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/clients"))}
          hitSlop={10}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}
        >
          <ArrowLeft size={18} color={theme.text} strokeWidth={2.2} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: theme.text }}>Client Records</Text>
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.soft, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 19, color: theme.text }}>{initials({ name: title, email: "" })}</Text>
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 24, color: "#0D1B3E" }}>{title}</Text>
            {client && type ? (
              <View style={{ flexDirection: "row", gap: 6 }}>
                <View style={{ backgroundColor: type.bg, borderColor: type.ring, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 }}>
                  <Text style={{ fontFamily: FONT.medium, fontSize: 12, color: type.fg }}>{clientTypeLabel(client.type)}</Text>
                </View>
                <View style={{ backgroundColor: "#F5F5F5", borderColor: "#E5E5E5", borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 }}>
                  <Text style={{ fontFamily: FONT.medium, fontSize: 12, color: "#404040" }}>{clientSourceLabel(client.source)}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {client ? (
          <SettingsGroup title="Contact">
            <SettingsRow icon={Mail} label="Email" value={client.email ?? "—"} />
            <SettingsRow icon={Phone} label="Phone" value={client.phone ?? "—"} />
            <SettingsRow icon={Calendar} label="Added" value={formatShortDate(client.createdAt)} />
            {client.tags.length ? (
              <SettingsRow icon={Tag} label="Tags" value={client.tags.map((t) => t.name).join(", ")} />
            ) : null}
          </SettingsGroup>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.line,
            padding: 16,
          }}
        >
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.soft, alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={17} color={theme.text} strokeWidth={2} />
          </View>
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "#5B6B8C" }}>
            The full client profile — fact find, notes, files and activity — is coming next.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
