import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMyOrgs } from "@/api/advice.api";
import { NINJA_CMS_BLUE, NinjaCmsLogo } from "@/components/brand/ninja-cms-logo";
import { OrgCard } from "@/components/orgs/org-card";
import { LogOut } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";

const GAP = 12;
const GUTTER = 20;

/**
 * "Select an Organisation" — only reachable for users with 2+ orgs (or admins,
 * who see every org). A port of the web picker (CMS app/portal/page.tsx +
 * _components/OrgSwitcher.tsx): light portal background, the thin navy→blue
 * gradient bar, Ninja CMS wordmark (in Ninja CMS blue — no org yet), then a grid
 * of org-coloured cards (3 columns on web, 2 on a phone).
 *
 * Picking one calls setOrg → the (app) gate flips to the portal, now in that
 * org's colour and logo.
 */
export default function SelectOrgScreen() {
  const insets = useSafeAreaInsets();
  const { setOrg } = useOrgTheme();
  const { signOut } = useSession();
  const orgsQuery = useMyOrgs();

  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />
      {/* Web: fixed 3px bar, linear-gradient(90deg, #0B2D6F, #1A4DB3, #4A7AD4). */}
      <LinearGradient
        colors={["#0B2D6F", "#1A4DB3", "#4A7AD4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: insets.top + 3, paddingTop: insets.top }}
      />

      <FlatList
        data={orgsQuery.data ?? []}
        keyExtractor={(o) => o.id}
        numColumns={2}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{
          gap: GAP,
          paddingHorizontal: GUTTER,
          paddingTop: 28,
          paddingBottom: insets.bottom + 24,
        }}
        refreshControl={
          <RefreshControl
            refreshing={orgsQuery.isRefetching}
            onRefresh={() => void orgsQuery.refetch()}
            tintColor={NINJA_CMS_BLUE}
            colors={[NINJA_CMS_BLUE]}
          />
        }
        ListHeaderComponent={
          <View className="mb-4 items-center gap-6">
            <NinjaCmsLogo width={120} color={NINJA_CMS_BLUE} />
            <View className="items-center gap-1.5">
              <Text className="font-display text-foreground text-center text-2xl">
                Select an Organisation
              </Text>
              <Text className="font-sans text-muted-foreground text-center text-sm">
                Choose an organisation to access your adviser portal
              </Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const isLastOdd = index === (orgsQuery.data?.length ?? 0) - 1 && index % 2 === 0;
          return (
            <>
              <OrgCard org={item} onPress={setOrg} />
              {/* Keep a lone last card half-width instead of stretching across the row. */}
              {isLastOdd ? <View style={{ flex: 1 }} /> : null}
            </>
          );
        }}
        ListFooterComponent={
          <Pressable
            accessibilityRole="button"
            onPress={() => void signOut()}
            hitSlop={10}
            className="mt-4 flex-row items-center gap-2 self-center px-4 py-2"
          >
            <LogOut size={15} color="#6B7A99" strokeWidth={2} />
            <Text className="font-sans-medium text-muted-foreground text-sm">Sign out</Text>
          </Pressable>
        }
      />
    </View>
  );
}
