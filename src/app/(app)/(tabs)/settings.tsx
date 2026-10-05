import * as React from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";

import { useMyOrgs } from "@/api/advice.api";
import { AppHeader } from "@/components/app-header";
import { NinjaCmsLogo } from "@/components/brand/ninja-cms-logo";
import { FadeIn } from "@/components/login/fade-in";
import { MemberCard } from "@/components/settings/member-card";
import { SettingsGroup, SettingsRow } from "@/components/settings/settings-group";
import { API_BASE_URL, SUPPORT_EMAIL } from "@/constants/env";
import { appVersion } from "@/lib/app-version";
import { ArrowLeftRight, Info, KeyRound, LogOut, Mail, UserRound, UserX } from "@/lib/icons";
import { openUrl } from "@/lib/open-url";
import { roleLabel } from "@/lib/user-display";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";

const FONT = {
  regular: "BricolageGrotesque_400Regular",
  semibold: "BricolageGrotesque_600SemiBold",
  bold: "BricolageGrotesque_700Bold",
};

/**
 * Settings tab — who you are, where you're working, the app, sign out, delete account.
 *
 *   Member card (org-coloured pass: logo, monogram, name, email, role)
 *   Organisation   — current org (+ Switch when you belong to 2+)
 *   Account        — email, role, "Profile & password" (web portal settings)
 *   App            — version (build)
 *   Sign out       — confirm, then back to sign-in (session provider clears the cache)
 *   Delete account — confirm, then a pre-filled deletion-request email (Ninja CRM pattern)
 */
export default function SettingsScreen() {
  const { data: session, signOut } = useSession();
  const { org, theme, setOrg } = useOrgTheme();
  const orgsQuery = useMyOrgs();
  const user = session?.user;
  const canSwitch = (orgsQuery.data?.length ?? 0) > 1;

  const { version, build } = appVersion();

  const confirmSignOut = () =>
    Alert.alert("Sign out?", "You'll need your email and password to sign back in.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);

  // Accounts are invite-only / org-provisioned (no in-app sign-up) and the records
  // belong to the organisation, so deletion is a REQUEST our team processes — the
  // same flow as Ninja CRM mobile (Apple 5.1.1(v): see docs/10-RELEASE-IOS.md §6).
  // Composes an email to support; with no mail app, tells the user the address.
  const requestAccountDeletion = () =>
    Alert.alert(
      "Delete account",
      "This sends a request to permanently delete your Ninja CMS account and associated data. Our team will process it and confirm by email. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request deletion",
          style: "destructive",
          onPress: async () => {
            const subject = "Account deletion request";
            const body =
              "Please delete my Ninja CMS account and all associated data.\n\n" +
              `Account email: ${user?.email ?? ""}\n` +
              `Name: ${user?.name ?? ""}\n` +
              `Organisation: ${org?.name ?? ""}\n`;
            const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            try {
              await Linking.openURL(url);
            } catch {
              Alert.alert("Couldn't open email", `Please email ${SUPPORT_EMAIL} to request account deletion.`);
            }
          },
        },
      ],
    );

  const [signOutPressed, setSignOutPressed] = React.useState(false);
  const [deletePressed, setDeletePressed] = React.useState(false);

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

        <FadeIn delay={330}>
          {/* Quieter than Sign out on purpose — rare and irreversible, but must be easy to find (Apple 5.1.1(v)). */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete account, request permanent deletion of your account and data"
            onPress={requestAccountDeletion}
            onPressIn={() => setDeletePressed(true)}
            onPressOut={() => setDeletePressed(false)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              paddingHorizontal: 14,
              paddingVertical: 13,
              borderRadius: 18,
              backgroundColor: deletePressed ? "#FEF2F2" : "transparent",
            }}
          >
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" }}>
              <UserX size={17} color="#DC2626" strokeWidth={2} />
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: "#DC2626" }}>Delete account</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: "#7C8AA8" }}>
                Request permanent deletion of your account and data
              </Text>
            </View>
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
