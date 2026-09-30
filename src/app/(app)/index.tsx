import { Alert, Pressable, Text, View } from "react-native";

import { Container } from "@/components/container";
import { Screen } from "@/components/screen";
import { LogOut } from "@/lib/icons";
import { useSession } from "@/providers/session-provider";

/**
 * Temporary signed-in home — proves the session round-trip (sign in → guard →
 * here → sign out). Replaced by the dashboard in the next step.
 */
export default function HomeScreen() {
  const { data, signOut } = useSession();
  const user = data?.user;

  const confirmSignOut = () =>
    Alert.alert("Sign out?", "You'll need your email and password to sign back in.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);

  return (
    <Screen>
      <Container className="flex-1 justify-center gap-6">
        <View className="gap-2">
          <Text className="font-sans-semibold text-muted-foreground text-xs tracking-widest">
            SIGNED IN
          </Text>
          <Text className="font-display text-foreground text-3xl">
            {user?.name || user?.email?.split("@")[0] || "Welcome"}
          </Text>
          <Text className="font-sans text-muted-foreground text-base">{user?.email}</Text>
          {user?.role ? (
            <View className="bg-secondary self-start rounded-full px-3 py-1">
              <Text className="font-sans-medium text-secondary-foreground text-xs capitalize">
                {user.role}
              </Text>
            </View>
          ) : null}
        </View>

        <Text className="font-sans text-muted-foreground text-sm">
          The dashboard is coming next.
        </Text>

        {/* Plain style object on Pressable (NativeWind drops function styles). */}
        <Pressable
          accessibilityRole="button"
          onPress={confirmSignOut}
          style={{ alignSelf: "flex-start" }}
          className="border-border flex-row items-center gap-2 rounded-full border px-5 py-3"
        >
          <LogOut size={16} color="#DC2626" strokeWidth={2} />
          <Text className="font-sans-semibold text-destructive text-sm">Sign out</Text>
        </Pressable>
      </Container>
    </Screen>
  );
}
