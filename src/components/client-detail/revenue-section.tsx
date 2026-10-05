import * as React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useClientRevenue } from "@/api/client-detail.api";
import { C, Card, Empty, ErrorNote, F, Loading, errorMessage, text } from "@/components/client-detail/ui";
import { formatDate } from "@/lib/date";
import { formatMoney } from "@/lib/format";
import { DollarSign } from "@/lib/icons";

/**
 * Revenue — web ClientRevenueTab: "This financial year" (Total / Upfront / Ongoing)
 * + "Mapped transactions" (date paid, licensee, product, fee type, net). Read-only.
 * Only shown when the server allows it (403 hides the section pill).
 */
export function RevenueSection({ adviceId, clientId }: { adviceId: string; clientId: string }) {
  const q = useClientRevenue(adviceId, clientId);
  if (q.isPending) return <Loading />;
  if (q.isError) return <ErrorNote message={errorMessage(q.error)} onRetry={() => void q.refetch()} />;

  const summary = q.data.pages[0].summary;
  const txs = q.data.pages.flatMap((p) => p.transactions.data);
  const total = q.data.pages[0].transactions.total;

  return (
    <View style={{ gap: 14 }}>
      <Text style={[text.label, { letterSpacing: 1, marginLeft: 4 }]}>THIS FINANCIAL YEAR</Text>
      <View style={{ gap: 10 }}>
        <Stat label="Total revenue" value={formatMoney(summary.totalNet)} color={C.ink} big />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Stat label={`Upfront · ${summary.upfrontCount} txn${summary.upfrontCount === 1 ? "" : "s"}`} value={formatMoney(summary.upfrontNet)} color="#1D4ED8" />
          <Stat label={`Ongoing · ${summary.ongoingCount} txn${summary.ongoingCount === 1 ? "" : "s"}`} value={formatMoney(summary.ongoingNet)} color="#7E22CE" />
        </View>
      </View>

      <Card icon={DollarSign} iconBg="#ECFDF5" iconFg="#059669" title={`Mapped transactions${total ? ` (${total})` : ""}`}>
        {txs.length === 0 ? (
          <Empty
            icon={DollarSign}
            title="No revenue mapped yet"
            message="Map this client's account to revenue transactions from Manage Revenue to see them here."
          />
        ) : (
          <View>
            {txs.map((tx, i) => (
              <View key={tx.id} style={{ flexDirection: "row", gap: 12, paddingVertical: 11, borderTopWidth: i ? 1 : 0, borderTopColor: C.hairline }}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={text.value}>{tx.productProvider ?? "—"}</Text>
                  {tx.subproductName ? <Text style={text.meta}>{tx.subproductName}</Text> : null}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <FeeBadge type={tx.feeType} />
                    <Text style={text.meta}>{`${formatDate(tx.datePaid)} · ${tx.entity}`}</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: F.semibold, fontSize: 15, color: C.ink }}>{formatMoney(tx.netAmount)}</Text>
              </View>
            ))}
            {q.hasNextPage ? (
              <Pressable accessibilityRole="button" onPress={() => void q.fetchNextPage()} disabled={q.isFetchingNextPage} style={{ alignItems: "center", paddingTop: 12 }}>
                {q.isFetchingNextPage ? (
                  <ActivityIndicator color="#8A97B5" />
                ) : (
                  <Text style={{ fontFamily: F.semibold, fontSize: 14, color: "#3B4A68" }}>Show more</Text>
                )}
              </Pressable>
            ) : null}
          </View>
        )}
      </Card>
    </View>
  );
}

function Stat({ label, value, color, big }: { label: string; value: string; color: string; big?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, gap: 4 }}>
      <Text style={text.label}>{label}</Text>
      <Text style={{ fontFamily: F.bold, fontSize: big ? 26 : 19, color }}>{value}</Text>
    </View>
  );
}

function FeeBadge({ type }: { type: "upfront" | "ongoing" | null }) {
  if (!type) return <Text style={text.meta}>—</Text>;
  const s = type === "upfront" ? { bg: "#DBEAFE", fg: "#1D4ED8", label: "Upfront" } : { bg: "#F3E8FF", fg: "#7E22CE", label: "Ongoing" };
  return (
    <View style={{ backgroundColor: s.bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 }}>
      <Text style={{ fontFamily: F.medium, fontSize: 11.5, color: s.fg }}>{s.label}</Text>
    </View>
  );
}
