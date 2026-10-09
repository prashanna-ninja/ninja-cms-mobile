import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { FEE_STYLES, accountLabel, entityStyle, paidParts } from "@/lib/revenue";
import { formatMoney } from "@/lib/format";
import { useOrgTheme } from "@/providers/org-theme-provider";
import type { RevenueTransaction } from "@/types/revenue.types";

const F = { regular: "BricolageGrotesque_400Regular", medium: "BricolageGrotesque_500Medium", semibold: "BricolageGrotesque_600SemiBold", bold: "BricolageGrotesque_700Bold" };

export function Badge({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={{ fontFamily: F.semibold, fontSize: 11, color: fg }}>{label}</Text>
    </View>
  );
}

/** Mapped client (green pill) or an amber "Unmapped" marker — web Client column. */
export function ClientMark({ client }: { client: { name: string } | null }) {
  return client ? (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, maxWidth: 150 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#16A34A" }} />
      <Text style={{ fontFamily: F.medium, fontSize: 12, color: "#15803D" }} numberOfLines={1}>
        {client.name}
      </Text>
    </View>
  ) : (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: "#D97706" }} />
      <Text style={{ fontFamily: F.medium, fontSize: 12, color: "#B45309" }}>Unmapped</Text>
    </View>
  );
}

/**
 * One transaction as a ledger line (web table row on a phone):
 *   [day · weekday] | account · product / subproduct · licensee + fee badges | net, gross, client
 * The adviser column is dropped — every row is your own revenue. Tap → map its account.
 */
export function TransactionRow({ tx, onPress, first }: { tx: RevenueTransaction; onPress?: () => void; first?: boolean }) {
  const { theme } = useOrgTheme();
  const [pressed, setPressed] = React.useState(false);
  const { day, dow } = paidParts(tx.datePaid);
  const ent = entityStyle(tx.entity);
  const fee = tx.feeType ? FEE_STYLES[tx.feeType] : null;
  const product = [tx.productProvider, tx.subproductName].filter(Boolean).join(" · ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${accountLabel(tx)}, ${formatMoney(tx.netAmount)} net. ${tx.client ? `Mapped to ${tx.client.name}` : "Unmapped"}. Map client`}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 13,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: "#EEF2F8",
        backgroundColor: pressed ? "#F7F9FD" : "#FFFFFF",
      }}
    >
      {/* Date stub */}
      <View style={{ width: 38, alignItems: "center", paddingTop: 1 }}>
        <Text style={{ fontFamily: F.bold, fontSize: 19, color: theme.text, lineHeight: 22 }}>{day}</Text>
        <Text style={{ fontFamily: F.medium, fontSize: 10.5, letterSpacing: 0.6, color: "#8A97B5" }}>{dow.toUpperCase()}</Text>
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={{ fontFamily: F.semibold, fontSize: 15, color: "#0D1B3E" }} numberOfLines={1}>
              {accountLabel(tx)}
            </Text>
            {tx.accountName && tx.accountNumber ? (
              <Text style={{ fontFamily: F.regular, fontSize: 11.5, color: "#9AA6BF" }} numberOfLines={1}>
                {tx.accountNumber}
              </Text>
            ) : null}
          </View>
          <View style={{ alignItems: "flex-end", gap: 1 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 15, color: "#0D1B3E", fontVariant: ["tabular-nums"] }}>{formatMoney(tx.netAmount)}</Text>
            <Text style={{ fontFamily: F.regular, fontSize: 11.5, color: "#9AA6BF", fontVariant: ["tabular-nums"] }}>
              {`gross ${formatMoney(tx.grossAmount)}`}
            </Text>
          </View>
        </View>

        {product ? (
          <Text style={{ fontFamily: F.regular, fontSize: 13, color: "#4B5A78" }} numberOfLines={1}>
            {product}
          </Text>
        ) : null}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
          <Badge label={tx.entity} bg={ent.bg} fg={ent.fg} />
          {fee ? <Badge label={fee.label} bg={fee.bg} fg={fee.fg} /> : null}
          <View style={{ flex: 1 }} />
          <ClientMark client={tx.client} />
        </View>
      </View>
    </Pressable>
  );
}
