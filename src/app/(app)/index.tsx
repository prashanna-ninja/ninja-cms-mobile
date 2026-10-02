import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMyOrgs } from "@/api/advice.api";
import { NinjaCmsLogo } from "@/components/brand/ninja-cms-logo";
import { OrgLogo } from "@/components/org-logo";
import { ArrowLeftRight, LogOut } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";

/**
 * Temporary portal home — proves the org round-trip: sign in → org (auto or
 * picked) → everything in the org's colour + logo. Replaced by the real portal
 * home (CMS app/portal/[adviceId]/page.tsx) in the next step.
 *
 * Shows both ways of theming (docs/07 §4):
 *  - `useOrgTheme().theme` for props that can't take a class (gradient, logo tint, icons)
 *  - NativeWind classes (`bg-secondary`, `text-secondary-foreground`, `bg-primary`)
 *    recoloured by OrgThemeScope.
 */
export default function PortalHomeScreen() {
  const insets = useSafeAreaInsets();
  const { data: session, signOut } = useSession();
  const { org, theme, setOrg } = useOrgTheme();
  const orgsQuery = useMyOrgs();
  const user = session?.user;
  const canSwitch = (orgsQuery.data?.length ?? 0) > 1;
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const confirmSignOut = () =>
    Alert.alert("Sign out?", "You'll need your email and password to sign back in.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);

  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />

      {/* App bar: the Ninja CMS wordmark in the ORG's colour (Ninja CMS blue when no org colour). */}
      <View
        className="bg-card border-border flex-row items-center justify-between border-b px-5 pb-3"
        style={{ paddingTop: insets.top + 10 }}
      >
        <NinjaCmsLogo width={88} color={theme.logoTint} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          onPress={confirmSignOut}
          hitSlop={10}
          className="bg-secondary h-9 w-9 items-center justify-center rounded-full"
        >
          <LogOut size={16} color={theme.text} strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 24 }}>
        {/* Org banner — like the web portal nav: org colour, org logo. */}
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

        <View className="bg-card border-border gap-3 rounded-2xl border p-5">
          <Text className="font-sans-semibold text-foreground text-base">Signed in</Text>
          <Text className="font-sans text-muted-foreground text-sm">{user?.email}</Text>
          {user?.role ? (
            <View className="bg-secondary self-start rounded-full px-3 py-1">
              <Text className="font-sans-medium text-secondary-foreground text-xs capitalize">{user.role}</Text>
            </View>
          ) : null}
          <Text className="font-sans text-muted-foreground text-sm">
            The portal home (notices, quick links, content) is coming next.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
