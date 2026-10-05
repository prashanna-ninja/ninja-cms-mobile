import * as React from "react";
import { Text, View } from "react-native";

import { useClientActivity } from "@/api/client-detail.api";
import { C, Card, Empty, ErrorNote, Loading, text } from "@/components/client-detail/ui";
import { formatDateTime } from "@/lib/format";
import { Activity, ArrowRightLeft, DollarSign, FileUp, Pencil, Plus, Users } from "@/lib/icons";

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

/** Web ClientActivityTab picks the icon from the SUMMARY text, checked in this order. */
function iconFor(summary: string): IconComponent {
  const s = summary.toLowerCase();
  if (s.includes("moved from")) return ArrowRightLeft;
  if (s.includes("revenue")) return DollarSign;
  if (s.includes("group")) return Users;
  if (s.includes("file")) return FileUp;
  if (s.includes("consent")) return Pencil;
  if (s.includes("note") || s.includes("fact find") || s.includes("updated")) return Pencil;
  if (s.includes("added") || s.includes("created")) return Plus;
  return Activity;
}

/** Activity Log — "Client log" timeline, newest first (last 100, like the web). */
export function ActivitySection({ adviceId, clientId }: { adviceId: string; clientId: string }) {
  const q = useClientActivity(adviceId, clientId);
  if (q.isPending) return <Loading />;
  if (q.isError) return <ErrorNote message={q.error.message} onRetry={() => void q.refetch()} />;
  if (q.data.length === 0) {
    return <Empty icon={Activity} title="No activity yet" message="Changes, notes, and file uploads will be recorded here." />;
  }

  return (
    <Card icon={Activity} iconBg="#F1F5F9" iconFg="#475569" title="Client log">
      <View style={{ paddingTop: 6 }}>
        {q.data.map((a, i) => {
          const Icon = iconFor(a.summary);
          const last = i === q.data.length - 1;
          return (
            <View key={a.id} style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ alignItems: "center", width: 32 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={15} color="#475569" strokeWidth={2} />
                </View>
                {!last ? <View style={{ flex: 1, width: 1.5, backgroundColor: C.hairline, marginVertical: 2 }} /> : null}
              </View>
              <View style={{ flex: 1, paddingBottom: last ? 0 : 16, paddingTop: 5, gap: 2 }}>
                <Text style={text.value}>{a.summary}</Text>
                <Text style={text.meta}>{`${a.actor?.name ?? "Someone"} · ${formatDateTime(a.createdAt)}`}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
