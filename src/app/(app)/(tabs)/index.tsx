import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { useMyOrgs } from "@/api/advice.api";
import { AppHeader } from "@/components/app-header";
import { NoticesSection } from "@/components/notices/notices-section";
import { OrgLogo } from "@/components/org-logo";
import { ArrowLeftRight } from "@/lib/icons";
import { qk } from "@/lib/query-keys";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";

/**
 * Dashboard tab (interim) — welcome banner + Notices. The full portal home
 * (quick links, events, workspace tiles… CMS app/portal/[adviceId]/page.tsx)
 * grows here later; Notices is the first real section (docs/09-NOTICES.md).
 */
export default function DashboardScreen() {
  const { data: session } = useSession();
  const { org, theme, setOrg } = useOrgTheme();
  const orgsQuery = useMyOrgs();
  const user = session?.user;
  const canSwitch = (orgsQuery.data?.length ?? 0) > 1;
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = React.useState(false);

  // Pull to refresh: the org list (colour/logo edits) + this org's notices and their content.
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.myOrgs() }),
        queryClient.invalidateQueries({ queryKey: qk.notices(org?.id ?? "") }),
        queryClient.invalidateQueries({ queryKey: ["notice"] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View className="bg-background flex-1">
      <AppHeader />

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.base} colors={[theme.base]} />
        }
      >
        {/* Welcome banner — like the web portal nav: org colour, org logo. */}
        <LinearGradient
          colors={theme.gradient}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ borderRadius: 20, padding: 20, gap: 18 }}
        >
          <OrgLogo height={40} maxWidth={180} />
          <View style={{ gap: 4 }}>
            <Text style={{ color: theme.onBase, fontFamily: "BricolageGrotesque_700Bold", fontSize: 26 }}>
              {`Welcome back, ${firstName}`}
            </Text>
            <Text
              style={{ color: theme.onBase, opacity: 0.85, fontFamily: "BricolageGrotesque_400Regular", fontSize: 14 }}
            >
              {`Adviser Portal · ${org?.name ?? ""}`}
            </Text>
          </View>

          {canSwitch ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setOrg(null)}
              style={{
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: theme.onBase === "#FFFFFF" ? "rgba(255,255,255,0.18)" : "rgba(13,27,62,0.10)",
              }}
            >
              <ArrowLeftRight size={13} color={theme.onBase} strokeWidth={2.4} />
              <Text style={{ color: theme.onBase, fontFamily: "BricolageGrotesque_600SemiBold", fontSize: 13 }}>
                Switch organisation
              </Text>
            </Pressable>
          ) : null}
        </LinearGradient>

        <NoticesSection />
      </ScrollView>
    </View>
  );
}
