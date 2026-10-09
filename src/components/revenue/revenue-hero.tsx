import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { Text, View } from "react-native";

import { formatMoney } from "@/lib/format";
import { FileText, Users, Wallet } from "@/lib/icons";
import { mix } from "@/lib/org-theme";
import { useOrgTheme } from "@/providers/org-theme-provider";
import type { RevenueStats } from "@/types/revenue.types";

const F = { regular: "BricolageGrotesque_400Regular", medium: "BricolageGrotesque_500Medium", semibold: "BricolageGrotesque_600SemiBold", bold: "BricolageGrotesque_700Bold" };

/**
 * The web's four stat cards (Gross · Net · Transactions · Clients) folded into one
 * org-coloured statement card: Gross as the headline figure, the other three as
 * frosted tiles underneath. Faint rings in the corner give it depth without a
 * hard-coded colour — everything derives from the active org's theme.
 * `dim` while new figures for changed filters are loading.
 */
export function RevenueHero({ stats, rangeLabel, dim }: { stats: RevenueStats | undefined; rangeLabel: string; dim?: boolean }) {
  const { theme } = useOrgTheme();
  const deep = mix(theme.text, "#000000", 0.28);
  const light = theme.onBase === "#FFFFFF";
  const ink = theme.onBase;
  const soft = light ? "rgba(255,255,255,0.72)" : "rgba(13,27,62,0.62)";
  const tile = light ? "rgba(255,255,255,0.13)" : "rgba(13,27,62,0.07)";
  const ring = light ? "rgba(255,255,255,0.10)" : "rgba(13,27,62,0.06)";

  const [whole, cents] = splitMoney(stats ? formatMoney(stats.grossAmount) : "$—");
  const count = stats?.transactionCount ?? 0;

  return (
    <View style={{ borderRadius: 24, backgroundColor: deep, shadowColor: deep, shadowOpacity: 0.28, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5 }}>
      <LinearGradient
        colors={[theme.base, deep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 24, padding: 20, paddingBottom: 16, overflow: "hidden", gap: 18 }}
      >
        {/* Corner rings — texture, not information. */}
        {[220, 150, 84].map((size) => (
          <View
            key={size}
            pointerEvents="none"
            style={{ position: "absolute", top: -size / 2.6, right: -size / 2.6, width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: ring }}
          />
        ))}

        <View style={{ gap: 4, opacity: dim ? 0.55 : 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontFamily: F.semibold, fontSize: 11.5, letterSpacing: 1.4, color: soft }}>GROSS REVENUE</Text>
            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: soft }} />
            <Text style={{ fontFamily: F.medium, fontSize: 12, color: soft }} numberOfLines={1}>
              {rangeLabel}
            </Text>
          </View>
          <Text style={{ color: ink }} adjustsFontSizeToFit numberOfLines={1}>
            <Text style={{ fontFamily: F.bold, fontSize: 40, letterSpacing: -1 }}>{whole}</Text>
            <Text style={{ fontFamily: F.semibold, fontSize: 22, color: soft }}>{cents}</Text>
          </Text>
          <Text style={{ fontFamily: F.regular, fontSize: 13, color: soft }}>
            {stats ? `${count} transaction${count === 1 ? "" : "s"} in this view` : "Loading…"}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8, opacity: dim ? 0.55 : 1 }}>
          <Tile bg={tile} icon={Wallet} label="Net" hint="after GST" value={stats ? formatMoney(stats.netAmount) : "—"} ink={ink} soft={soft} wide />
          <Tile bg={tile} icon={FileText} label="Txns" value={stats ? String(count) : "—"} ink={ink} soft={soft} />
          <Tile bg={tile} icon={Users} label="Clients" value={stats ? String(stats.accountCount) : "—"} ink={ink} soft={soft} />
        </View>
      </LinearGradient>
    </View>
  );
}

function Tile({
  bg,
  icon: Icon,
  label,
  hint,
  value,
  ink,
  soft,
  wide,
}: {
  bg: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  hint?: string;
  value: string;
  ink: string;
  soft: string;
  wide?: boolean;
}) {
  return (
    <View style={{ flex: wide ? 1.9 : 1, backgroundColor: bg, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, gap: 3 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <Icon size={12} color={soft} strokeWidth={2.2} />
        <Text style={{ fontFamily: F.medium, fontSize: 11.5, color: soft }} numberOfLines={1}>
          {hint ? `${label} · ${hint}` : label}
        </Text>
      </View>
      <Text style={{ fontFamily: F.bold, fontSize: 16.5, color: ink, fontVariant: ["tabular-nums"] }} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

/** "$138,922.81" → ["$138,922", ".81"] so the cents can sit smaller. */
function splitMoney(s: string): [string, string] {
  const i = s.lastIndexOf(".");
  return i === -1 ? [s, ""] : [s.slice(0, i), s.slice(i)];
}
