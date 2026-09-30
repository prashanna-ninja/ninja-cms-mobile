import { Text, View } from "react-native";

import { Container } from "@/components/container";
import { Screen } from "@/components/screen";

/** Temporary home — replaced by the (auth)/(app) route groups in the login step. */
export default function Index() {
  return (
    <Screen>
      <Container className="flex-1 justify-center gap-3">
        <View className="bg-accent self-start rounded-lg px-3 py-1">
          <Text className="font-sans-semibold text-accent-foreground text-xs tracking-widest">
            NINJA CMS
          </Text>
        </View>
        <Text className="font-display text-foreground text-3xl">Foundation ready</Text>
        <Text className="font-sans text-muted-foreground text-base">
          Expo SDK 57 · NativeWind · TanStack Query. Next up: sign in.
        </Text>
      </Container>
    </Screen>
  );
}
