import * as Application from "expo-application";
import Constants from "expo-constants";
import * as React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { useMyOrgs } from "@/api/advice.api";
import { AppHeader } from "@/components/app-header";
import { NinjaCmsLogo } from "@/components/brand/ninja-cms-logo";
import { FadeIn } from "@/components/login/fade-in";
import { MemberCard } from "@/components/settings/member-card";
import { SettingsGroup, SettingsRow } from "@/components/settings/settings-group";
import { API_BASE_URL } from "@/constants/env";
import { ArrowLeftRight, Globe, Info, KeyRound, LogOut, Mail, UserRound } from "@/lib/icons";
import { openUrl } from "@/lib/open-url";
import { roleLabel } from "@/lib/user-display";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";

const FONT = {
  regular: "BricolageGrotesque_400Regular",
  semibold: "BricolageGrotesque_600SemiBold",
  bold: "BricolageGrotesque_700Bold",
};

const host = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url || "—";
  }
};

/**
 * Settings tab — who you are, where you're working, the app, and sign out.
 *
 *   Member card (org-coloured pass: logo, monogram, name, email, role)
 *   Organisation — current org (+ Switch when you belong to 2+)
 *   Account      — email, role, "Profile & password" (web portal settings)
 *   App          — version (build), server
 *   Sign out     — confirm, then back to sign-in (session provider clears the cache)
 */
export default function SettingsScreen() {
  const { data: session, signOut } = useSession();
  const { org, theme, setOrg } = useOrgTheme();
  const orgsQuery = useMyOrgs();
  const user = session?.user;
  const canSwitch = (orgsQuery.data?.length ?? 0) > 1;

  const version = Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? "—";
  const build = Application.nativeBuildVersion;

  const confirmSignOut = () =>
    Alert.alert("Sign out?", "You'll need your email and password to sign back in.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);

  const [signOutPressed, setSignOutPressed] = React.useState(false);

  return (
    <View className="bg-background flex-1">
      <AppHeader />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 22, paddingBottom: 36 }}>
        <FadeIn delay={0}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 26, color: "#0D1B3E" }}>Settings</Text>
        </FadeIn>

        <FadeIn delay={60}>
          <MemberCard />
        </FadeIn>

        <FadeIn delay={120}>
          <SettingsGroup title="Organisation">
            <SettingsRow
              label={org?.name ?? "—"}
              caption="Current organisation"
              leading={
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: theme.base,
                    borderWidth: 3,
                    borderColor: theme.soft,
                  }}
                />
              }
            />
            {canSwitch ? (
              <SettingsRow
                icon={ArrowLeftRight}
                label="Switch organisation"
                caption={`${orgsQuery.data?.length} organisations`}
                onPress={() => setOrg(null)}
              />
            ) : null}
          </SettingsGroup>
        </FadeIn>

        <FadeIn delay={180}>
          <SettingsGroup title="Account">
            <SettingsRow icon={Mail} label="Email" value={user?.email ?? ""} />
            <SettingsRow icon={UserRound} label="Role" value={roleLabel(user?.role)} />
            <SettingsRow
              icon={KeyRound}
              label="Profile & password"
              caption="Opens your adviser portal settings"
              trailing="external"
              onPress={() => void openUrl(`${API_BASE_URL}/portal/${org?.id ?? ""}/settings`, theme.base)}
            />
          </SettingsGroup>
        </FadeIn>

        <FadeIn delay={240}>
          <SettingsGroup title="App">
            <SettingsRow icon={Info} label="Version" value={build ? `${version} (${build})` : version} />
            <SettingsRow icon={Globe} label="Server" value={host(API_BASE_URL)} />
          </SettingsGroup>
        </FadeIn>

        <FadeIn delay={300}>
          {/* Destructive, but calm: red text + icon on white, a soft red wash while pressed. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            onPress={confirmSignOut}
            onPressIn={() => setSignOutPressed(true)}
            onPressOut={() => setSignOutPressed(false)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              height: 54,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "#F5D0D0",
              backgroundColor: signOutPressed ? "#FEF2F2" : "#FFFFFF",
            }}
          >
            <LogOut size={18} color="#DC2626" strokeWidth={2.2} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: "#DC2626" }}>Sign out</Text>
          </Pressable>
        </FadeIn>

        <FadeIn delay={360}>
          <View style={{ alignItems: "center", gap: 8, paddingTop: 6 }}>
            <NinjaCmsLogo width={64} color="#B9C3D6" />
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "#9AA6BF" }}>
              {`Ninja CMS · v${version}${build ? ` (${build})` : ""}`}
            </Text>
          </View>
        </FadeIn>
      </ScrollView>
    </View>
  );
}
