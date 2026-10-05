import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NinjaCmsLogo } from "@/components/brand/ninja-cms-logo";
import { initials } from "@/lib/user-display";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";

/**
 * The signed-in app bar, shared by every tab: the Ninja CMS wordmark in the
 * ORG's colour (`theme.logoTint`, Ninja CMS blue when the org has none) and the
 * user's initials, which open Settings (sign out lives there now).
 * Owns the top safe-area inset and the dark status bar.
 */
export function AppHeader() {
  const insets = useSafeAreaInsets();
  const { data: session } = useSession();
  const { theme } = useOrgTheme();
  const [pressed, setPressed] = React.useState(false);

  return (
    <View
      className="bg-card border-border flex-row items-center justify-between border-b px-5 pb-3"
      style={{ paddingTop: insets.top + 10 }}
    >
      <StatusBar style="dark" />
      <NinjaCmsLogo width={88} color={theme.logoTint} />
      {/* Plain style object (NativeWind drops Pressable function styles). */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        onPress={() => router.navigate("/settings")}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        hitSlop={10}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: theme.soft,
          borderWidth: 1.5,
          borderColor: theme.line,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.6 : 1,
        }}
      >
        <Text style={{ fontFamily: "BricolageGrotesque_700Bold", fontSize: 13, color: theme.text }}>
          {initials(session?.user)}
        </Text>
      </Pressable>
    </View>
  );
}
