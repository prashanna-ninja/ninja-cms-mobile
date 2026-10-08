import { Text, View } from "react-native";

import { F } from "@/components/client-detail/ui";
import { clientSourceLabel, clientTypeLabel, clientTypeStyle, DEFAULT_TAG_COLOR } from "@/lib/clients";
import type { Tag } from "@/types/workflow.types";

/** Type + source badges (web ClientTypeBadge / ClientSourceBadge colours), optional first N tags + "+N". */
export function ClientBadges({ type, source, tags = [], maxTags = 2 }: { type: string; source: string; tags?: Tag[]; maxTags?: number }) {
  const t = clientTypeStyle(type);
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 5 }}>
      <View style={{ backgroundColor: t.bg, borderColor: t.ring, borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 }}>
        <Text style={{ fontFamily: F.medium, fontSize: 11, color: t.fg }}>{clientTypeLabel(type)}</Text>
      </View>
      <View style={{ backgroundColor: "#F5F5F5", borderColor: "#E5E5E5", borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 }}>
        <Text style={{ fontFamily: F.medium, fontSize: 11, color: "#404040" }}>{clientSourceLabel(source)}</Text>
      </View>
      {tags.slice(0, maxTags).map((tag) => {
        const color = tag.color ?? DEFAULT_TAG_COLOR;
        return (
          <View key={tag.id} style={{ borderWidth: 1, borderColor: `${color}55`, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1, maxWidth: 140 }}>
            <Text numberOfLines={1} style={{ fontFamily: F.medium, fontSize: 11, color }}>
              {tag.name}
            </Text>
          </View>
        );
      })}
      {tags.length > maxTags ? <Text style={{ fontFamily: F.medium, fontSize: 11, color: "#9AA6BF" }}>{`+${tags.length - maxTags}`}</Text> : null}
    </View>
  );
}

/** "Admin" / "Adviser" role from a stage name, as a quiet pill. */
export function RoleBadge({ role, tint, bg }: { role: string; tint: string; bg: string }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 }}>
      <Text style={{ fontFamily: F.semibold, fontSize: 10.5, color: tint, letterSpacing: 0.3 }}>{role.toUpperCase()}</Text>
    </View>
  );
}
