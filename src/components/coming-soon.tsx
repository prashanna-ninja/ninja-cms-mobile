import * as React from "react";
import { ScrollView, Text, View } from "react-native";

import { AppHeader } from "@/components/app-header";
import { Sparkles } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

const FONT = {
  regular: "BricolageGrotesque_400Regular",
  medium: "BricolageGrotesque_500Medium",
  semibold: "BricolageGrotesque_600SemiBold",
  bold: "BricolageGrotesque_700Bold",
};

/**
 * A clean placeholder for a tab whose feature isn't built yet: page title, then a
 * card with the feature's icon on an org-tinted tile, a one-line description,
 * what it will include, and a "Coming soon" pill. All in the org's colours.
 */
export function ComingSoon({
  title,
  icon: Icon,
  headline,
  description,
  features,
}: {
  title: string;
  icon: IconComponent;
  headline: string;
  description: string;
  /** What the tab will include — mirrors the web portal section. */
  features: string[];
}) {
  const { theme } = useOrgTheme();

  return (
    <View className="bg-background flex-1">
      <AppHeader />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 26, color: "#0D1B3E" }}>{title}</Text>

        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: theme.line,
            padding: 22,
            gap: 18,
            shadowColor: theme.base,
            shadowOpacity: 0.06,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 1,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: theme.soft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={26} color={theme.text} strokeWidth={2} />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: theme.soft,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <Sparkles size={12} color={theme.text} strokeWidth={2.2} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: theme.text }}>Coming soon</Text>
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 19, lineHeight: 25, color: "#0D1B3E" }}>{headline}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: "#5B6B8C" }}>{description}</Text>
          </View>

          <View style={{ height: 1, backgroundColor: theme.line }} />

          <View style={{ gap: 12 }}>
            {features.map((feature) => (
              <View key={feature} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.base }} />
                <Text style={{ flex: 1, fontFamily: FONT.medium, fontSize: 14, color: "#1F2A44" }}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
