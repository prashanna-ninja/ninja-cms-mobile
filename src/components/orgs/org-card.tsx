import { Image } from "expo-image";
import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { buildOrgTheme } from "@/lib/org-theme";
import { ArrowRight } from "@/lib/icons";
import type { OrgSummary } from "@/types/advice.types";

/**
 * One organisation tile in the picker — a port of the web card
 * (CMS app/portal/_components/OrgCard.tsx): filled with the org's colour, its
 * (usually white) logo centred, and a translucent "View Portal →" pill.
 *
 * Differences from the web, on purpose:
 *  - The pill/text colour comes from the theme engine (`onBase`), so a pale org
 *    colour gets dark text instead of unreadable white.
 *  - No logo (or it fails to load) → the first letter AND the org name, since
 *    on a phone there's no hover/tooltip to tell you which org a letter is.
 *
 * ⚠️ Plain style objects on Pressable (NativeWind drops function styles) — the
 * pressed state is tracked by hand.
 */
export function OrgCard({ org, onPress }: { org: OrgSummary; onPress: (org: OrgSummary) => void }) {
  const theme = buildOrgTheme(org.colorTheme);
  const [pressed, setPressed] = React.useState(false);
  const [logoFailed, setLogoFailed] = React.useState(false);
  const onDark = theme.onBase === "#FFFFFF";
  const showLogo = !!org.logo && !logoFailed;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${org.name}, view portal`}
      onPress={() => onPress(org)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        flex: 1,
        aspectRatio: 1,
        borderRadius: 18,
        backgroundColor: theme.base,
        padding: 14,
        alignItems: "center",
        justifyContent: "space-between",
        transform: [{ scale: pressed ? 0.97 : 1 }],
        // Web: "0 2px 8px rgba(0,0,0,0.15)"
        shadowColor: "#000",
        shadowOpacity: pressed ? 0.08 : 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: pressed ? 1 : 3,
      }}
    >
      {/* Spacer keeps the logo optically centred above the pill. */}
      <View style={{ height: 4 }} />

      {showLogo ? (
        <Image
          source={{ uri: org.logo! }}
          style={{ width: "86%", height: "52%" }}
          contentFit="contain"
          cachePolicy="disk"
          transition={150}
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <View style={{ alignItems: "center", gap: 4, paddingHorizontal: 4 }}>
          <Text style={{ color: theme.onBase, fontFamily: "BricolageGrotesque_700Bold", fontSize: 44, lineHeight: 50 }}>
            {org.name.charAt(0).toUpperCase()}
          </Text>
          <Text
            numberOfLines={2}
            style={{
              color: theme.onBase,
              opacity: 0.85,
              fontFamily: "BricolageGrotesque_500Medium",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {org.name}
          </Text>
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 999,
          backgroundColor: onDark
            ? pressed
              ? "rgba(255,255,255,0.25)"
              : "rgba(255,255,255,0.15)"
            : pressed
              ? "rgba(13,27,62,0.16)"
              : "rgba(13,27,62,0.10)",
        }}
      >
        <Text style={{ color: theme.onBase, fontFamily: "BricolageGrotesque_600SemiBold", fontSize: 12 }}>
          View Portal
        </Text>
        <ArrowRight size={12} color={theme.onBase} strokeWidth={2.5} />
      </View>
    </Pressable>
  );
}
