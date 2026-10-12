import { Image } from "expo-image";
import * as React from "react";
import { Text, View } from "react-native";

import { useStoredImage } from "@/lib/stored-file";
import { useOrgTheme } from "@/providers/org-theme-provider";

/** "Cobalt Licensee Solutions" → "CL" (web PortalNav does the same). */
function initials(name: string): string {
  return (
    (name || "?")
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

/**
 * The active org's logo, for headers on the org-coloured background.
 *
 * Mirrors the web portal nav (app/portal/[adviceId]/_components/PortalNav.tsx):
 * the `Advice.logo` image when there is one, otherwise a translucent initials
 * tile. The logo is a stored CMS file (R2, old S3 or the CMS database — lib/stored-file.ts); expo-image caches it to disk so it's there
 * offline and on the next cold start.
 */
export function OrgLogo({ height = 32, maxWidth = 160 }: { height?: number; maxWidth?: number }) {
  const { org, theme } = useOrgTheme();
  const logo = useStoredImage(org?.logo);

  if (org?.logo && !logo.failed) {
    return (
      <Image
        source={logo.source}
        style={{ height, width: maxWidth }}
        contentFit="contain"
        contentPosition="left"
        cachePolicy="disk"
        onError={logo.onError}
        accessibilityLabel={org.name}
      />
    );
  }

  return (
    <View
      accessibilityLabel={org?.name ?? "Ninja CMS"}
      style={{
        height,
        width: height,
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: theme.onBase, fontFamily: "BricolageGrotesque_700Bold", fontSize: height * 0.38 }}>
        {initials(org?.name ?? "Ninja CMS")}
      </Text>
    </View>
  );
}
