import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { ArrowLeft } from "@/lib/icons";

/** Title row for the add / edit client screens: back arrow + title + subtitle. */
export function FormScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 10 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/clients"))}
        hitSlop={10}
        style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}
      >
        <ArrowLeft size={17} color="#0D1B3E" strokeWidth={2.2} />
        <Text style={{ fontFamily: "BricolageGrotesque_600SemiBold", fontSize: 14, color: "#0D1B3E" }}>Go back</Text>
      </Pressable>
      <View style={{ gap: 2 }}>
        <Text style={{ fontFamily: "BricolageGrotesque_700Bold", fontSize: 24, color: "#0D1B3E" }}>{title}</Text>
        {subtitle ? <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 13.5, color: "#7089B8" }}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}
