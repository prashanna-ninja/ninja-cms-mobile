import { StatusBar } from "expo-status-bar";
import { Alert, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NinjaCmsLogo } from "@/components/brand/ninja-cms-logo";
import { LogOut } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";

/**
 * The signed-in app bar, shared by every tab: the Ninja CMS wordmark in the
 * ORG's colour (`theme.logoTint`, Ninja CMS blue when the org has none) and a
 * sign-out button. Owns the top safe-area inset and the dark status bar.
 */
export function AppHeader() {
  const insets = useSafeAreaInsets();
  const { signOut } = useSession();
  const { theme } = useOrgTheme();

  const confirmSignOut = () =>
    Alert.alert("Sign out?", "You'll need your email and password to sign back in.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);

  return (
    <View
      className="bg-card border-border flex-row items-center justify-between border-b px-5 pb-3"
      style={{ paddingTop: insets.top + 10 }}
    >
      <StatusBar style="dark" />
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
  );
}
