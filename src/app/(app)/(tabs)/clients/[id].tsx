import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { Alert, Linking, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { useArchiveClient, useClientDetail, useClientRevenueAccess, useDeleteClient } from "@/api/client-detail.api";
import { AppHeader } from "@/components/app-header";
import { ActivitySection } from "@/components/client-detail/activity-section";
import { FactFindSection } from "@/components/client-detail/fact-find-section";
import { FilesSection } from "@/components/client-detail/files-section";
import { NotesSection } from "@/components/client-detail/notes-section";
import { OngoingSection } from "@/components/client-detail/ongoing-section";
import { OverviewSection } from "@/components/client-detail/overview-section";
import { RevenueSection } from "@/components/client-detail/revenue-section";
import { SECTIONS, SectionTabs, type SectionKey } from "@/components/client-detail/section-tabs";
import { C, ErrorNote, F, Loading, PillButton, errorMessage, text } from "@/components/client-detail/ui";
import { ApiError } from "@/lib/api-client";
import { clientSourceLabel, clientTypeLabel, clientTypeStyle } from "@/lib/clients";
import { formatDateTime, nameInitials } from "@/lib/format";
import { Archive, ArrowLeft, Calendar, Mail, Pencil, Phone, RefreshCw, Trash } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";

/**
 * A client record — the web's /portal/[adviceId]/client-records/[clientId]:
 * header card + section pills (Overview · Revenue · Fact Find · Files · File Notes ·
 * Ongoing client · Activity Log). Revenue only when the server allows it.
 * `?tab=` selects a section (like the web). docs/12-CLIENTS.md §6.
 */
export default function ClientDetailScreen() {
  const { id, name, tab } = useLocalSearchParams<{ id: string; name?: string; tab?: string }>();
  const { org, theme } = useOrgTheme();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const adviceId = org?.id;

  const client = useClientDetail(adviceId, id);
  const revenueAllowed = useClientRevenueAccess(adviceId, id);
  const sections = React.useMemo(() => SECTIONS.filter((s) => s.key !== "revenue" || revenueAllowed === true), [revenueAllowed]);
  const [section, setSection] = React.useState<SectionKey>(() => (SECTIONS.some((s) => s.key === tab) ? (tab as SectionKey) : "overview"));
  const active: SectionKey = sections.some((s) => s.key === section) ? section : "overview";
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["client"] });
    } finally {
      setRefreshing(false);
    }
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/clients"));
  const openClient = (clientId: string, clientName: string) =>
    router.push({ pathname: "/clients/[id]", params: { id: clientId, name: clientName } });

  // The client GET has no adviser/org names; we know the org, and the adviser when it's the signed-in user.
  // Staff can edit but not archive / delete (web: same — the API answers 403).
  const canManage = session?.user.role !== "staff";
  const archive = useArchiveClient(adviceId, id);
  const remove = useDeleteClient(adviceId, id);
  const archived = !!client.data?.archivedAt;
  const fail = (title: string) => (e: Error) => Alert.alert(title, e.message);

  const confirmArchive = () =>
    Alert.alert(
      archived ? "Restore client?" : "Archive client?",
      archived ? "The client moves back to your active list." : "The client is hidden from your active list. You can restore it from Archived.",
      [
        { text: "Cancel", style: "cancel" },
        { text: archived ? "Restore" : "Archive", onPress: () => archive.mutate(!archived, { onError: fail("Couldn’t update client") }) },
      ],
    );
  const confirmDelete = () =>
    Alert.alert("Delete client?", "This permanently deletes the client and their fact find, files, notes and history. This can’t be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => remove.mutate(undefined, { onSuccess: () => router.replace("/clients"), onError: fail("Couldn’t delete client") }),
      },
    ]);

  const adviserName = client.data && session?.user.id === client.data.adviserUserId ? session.user.name ?? undefined : undefined;

  return (
    <View className="bg-background flex-1">
      <AppHeader />
      <ScrollView
        stickyHeaderIndices={[2]}
        contentContainerStyle={{ paddingBottom: 36 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.base} colors={[theme.base]} />}
      >
        {/* 0 — back */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} hitSlop={10} style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
            <ArrowLeft size={17} color={C.ink} strokeWidth={2.2} />
            <Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.ink }}>Go back</Text>
          </Pressable>
        </View>

        {/* 1 — header card */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          {client.isPending ? (
            <Loading />
          ) : client.isError ? (
            <ErrorNote
              message={client.error instanceof ApiError && client.error.status === 404 ? "This client couldn't be found." : errorMessage(client.error)}
              onRetry={() => void client.refetch()}
            />
          ) : (
            <HeaderCard
              name={client.data.name || name || "Client"}
              type={client.data.type}
              source={client.data.source}
              subtitle={[adviserName, org?.name].filter(Boolean).join(" · ")}
              email={client.data.email}
              phone={client.data.phone}
              createdAt={client.data.createdAt}
              archived={archived}
            />
          )}
          {client.data ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              <PillButton label="Edit" icon={Pencil} color={theme.text} onPress={() => router.push({ pathname: "/clients/edit", params: { id } })} />
              {canManage ? (
                <>
                  <PillButton label={archived ? "Restore" : "Archive"} icon={archived ? RefreshCw : Archive} onPress={confirmArchive} disabled={archive.isPending} />
                  <PillButton label="Delete" icon={Trash} tone="danger" onPress={confirmDelete} disabled={remove.isPending} />
                </>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* 2 — section pills (sticky) */}
        <View style={{ backgroundColor: "#F0F4FB", paddingVertical: 8 }}>
          {client.data ? <SectionTabs sections={sections} value={active} onChange={setSection} /> : null}
        </View>

        {/* 3 — the selected section */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          {client.data && adviceId ? (
            active === "overview" ? (
              <OverviewSection client={client.data} adviceId={adviceId} adviserName={adviserName} onOpenClient={openClient} />
            ) : active === "revenue" ? (
              <RevenueSection adviceId={adviceId} clientId={id} />
            ) : active === "fact-find" ? (
              <FactFindSection adviceId={adviceId} clientId={id} />
            ) : active === "files" ? (
              <FilesSection adviceId={adviceId} clientId={id} />
            ) : active === "notes" ? (
              <NotesSection adviceId={adviceId} clientId={id} />
            ) : active === "annual-consent" ? (
              <OngoingSection adviceId={adviceId} clientId={id} />
            ) : (
              <ActivitySection adviceId={adviceId} clientId={id} />
            )
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

/** Web header: colour band, rounded avatar, name + type/source badges, "adviser · org", email/phone, "Client since". */
function HeaderCard({
  name,
  type,
  source,
  subtitle,
  email,
  phone,
  createdAt,
  archived,
}: {
  name: string;
  type: string;
  source: string;
  subtitle: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  archived: boolean;
}) {
  const { theme } = useOrgTheme();
  const t = clientTypeStyle(type);
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        overflow: "hidden",
        shadowColor: "#0B2D6F",
        shadowOpacity: 0.06,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      }}
    >
      <View style={{ height: 44, backgroundColor: theme.base }} />
      <View style={{ padding: 16, paddingTop: 0, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12, marginTop: -26 }}>
          <View style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: theme.base, borderWidth: 3, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: F.semibold, fontSize: 20, color: theme.onBase }}>{nameInitials(name)}</Text>
          </View>
          <View style={{ flex: 1 }} />
          {email ? <RoundButton label="Email client" icon={Mail} onPress={() => void Linking.openURL(`mailto:${email}`)} /> : null}
          {phone ? <RoundButton label="Call client" icon={Phone} onPress={() => void Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`)} /> : null}
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 22, color: C.ink }}>{name}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            <View style={{ backgroundColor: t.bg, borderColor: t.ring, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 }}>
              <Text style={{ fontFamily: F.medium, fontSize: 12, color: t.fg }}>{clientTypeLabel(type)}</Text>
            </View>
            <View style={{ backgroundColor: "#F5F5F5", borderColor: "#E5E5E5", borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 }}>
              <Text style={{ fontFamily: F.medium, fontSize: 12, color: "#404040" }}>{clientSourceLabel(source)}</Text>
            </View>
            {archived ? (
              <View style={{ backgroundColor: "#FEF3C7", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 }}>
                <Text style={{ fontFamily: F.medium, fontSize: 12, color: "#92400E" }}>Archived</Text>
              </View>
            ) : null}
          </View>
          {subtitle ? <Text style={[text.meta, { fontSize: 13.5, color: C.muted }]}>{subtitle}</Text> : null}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
          <Calendar size={13} color="#6B7A99" strokeWidth={2} />
          <Text style={{ fontFamily: F.medium, fontSize: 12.5, color: "#3B4A68" }}>{`Client since ${formatDateTime(createdAt)}`}</Text>
        </View>
      </View>
    </View>
  );
}

function RoundButton({ label, icon: Icon, onPress }: { label: string; icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: "#DCE3EE", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}
    >
      <Icon size={16} color="#3B4A68" strokeWidth={2} />
    </Pressable>
  );
}
