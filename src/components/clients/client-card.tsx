import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { clientSourceLabel, clientTypeLabel, clientTypeStyle, DEFAULT_TAG_COLOR } from "@/lib/clients";
import { formatShortDate } from "@/lib/date";
import { ChevronRight, Mail, Phone } from "@/lib/icons";
import { initials } from "@/lib/user-display";
import { useOrgTheme } from "@/providers/org-theme-provider";
import type { ClientRecord } from "@/types/client.types";

const FONT = {
  regular: "BricolageGrotesque_400Regular",
  medium: "BricolageGrotesque_500Medium",
  semibold: "BricolageGrotesque_600SemiBold",
  bold: "BricolageGrotesque_700Bold",
};

/**
 * One client in the list — the web table row (Client · Type · Source · Tags ·
 * Email · Phone · Added) folded into a card for a phone: monogram + name + type
 * badge, then email / phone, then source · added date and tag chips.
 * Badge colours match the web (ClientTypeBadge / ClientSourceBadge).
 */
export function ClientCard({ client, onPress }: { client: ClientRecord; onPress: () => void }) {
  const { theme } = useOrgTheme();
  const [pressed, setPressed] = React.useState(false);
  const type = clientTypeStyle(client.type);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${client.name}, ${clientTypeLabel(client.type)}`}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        backgroundColor: pressed ? "#F7F9FC" : "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E4EAF3",
        padding: 14,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.soft, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: theme.text }}>{initials({ name: client.name, email: client.email ?? "" })}</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 16, color: "#0D1B3E" }}>
            {client.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ backgroundColor: type.bg, borderColor: type.ring, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 }}>
              <Text style={{ fontFamily: FONT.medium, fontSize: 11.5, color: type.fg }}>{clientTypeLabel(client.type)}</Text>
            </View>
            <View style={{ backgroundColor: "#F5F5F5", borderColor: "#E5E5E5", borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 }}>
              <Text style={{ fontFamily: FONT.medium, fontSize: 11.5, color: "#404040" }}>{clientSourceLabel(client.source)}</Text>
            </View>
          </View>
        </View>
        <ChevronRight size={18} color="#A3AFC6" strokeWidth={2.2} />
      </View>

      {client.email || client.phone ? (
        <View style={{ gap: 5, paddingLeft: 52 }}>
          {client.email ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
              <Mail size={13} color="#8A97B5" strokeWidth={2} />
              <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13.5, color: "#3B4A68" }}>
                {client.email}
              </Text>
            </View>
          ) : null}
          {client.phone ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
              <Phone size={13} color="#8A97B5" strokeWidth={2} />
              <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: "#3B4A68" }}>{client.phone}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, paddingLeft: 52 }}>
        {client.tags.map((tag) => {
          const color = tag.color ?? DEFAULT_TAG_COLOR;
          return (
            <View
              key={tag.id}
              style={{ flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: `${color}55`, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
              <Text style={{ fontFamily: FONT.medium, fontSize: 11.5, color }}>{tag.name}</Text>
            </View>
          );
        })}
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "#8A97B5", marginLeft: client.tags.length ? 2 : 0 }}>
          {client.archivedAt ? `Archived ${formatShortDate(client.archivedAt)}` : `Added ${formatShortDate(client.createdAt)}`}
        </Text>
      </View>
    </Pressable>
  );
}
