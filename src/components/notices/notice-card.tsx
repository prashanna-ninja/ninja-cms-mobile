import * as React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { ContentRows, countMedia } from "@/components/content/block-content";
import { formatDate } from "@/lib/date";
import { Calendar, ChevronDown, ChevronUp, ImageIcon, Paperclip } from "@/lib/icons";
import type { OrgTheme } from "@/lib/org-theme";
import { parseRows } from "@/schemas/grid-builder.schema";
import type { NoticeDetail, NoticeListItem } from "@/types/notice.types";

const FONT = {
  regular: "BricolageGrotesque_400Regular",
  semibold: "BricolageGrotesque_600SemiBold",
  bold: "BricolageGrotesque_700Bold",
};
const META = "#9AAACB";

/**
 * One notice — a port of the web card (CMS app/portal/[adviceId]/_components/NoticeCard.tsx):
 * org-coloured left rule + border, numbered tile, title + NEW badge, date and
 * image/attachment counts, a round chevron that fills with the org colour when open.
 *
 * Content comes from the prefetched detail query; until it arrives the card is
 * still tappable and shows a spinner when opened.
 */
export function NoticeCard({
  index,
  notice,
  detail,
  detailPending,
  detailError,
  isNew,
  expanded,
  onToggle,
  onRetry,
  theme,
  variables,
}: {
  index: number;
  notice: NoticeListItem;
  detail?: NoticeDetail;
  detailPending: boolean;
  detailError: boolean;
  isNew: boolean;
  expanded: boolean;
  onToggle: () => void;
  onRetry: () => void;
  theme: OrgTheme;
  variables?: { name?: string; email?: string };
}) {
  const rows = React.useMemo(() => (detail ? parseRows(detail.content) : []), [detail]);
  const { documents, images } = countMedia(rows);
  // Like the web: no content → not expandable (only known once the detail has loaded).
  const expandable = !detail || rows.length > 0;

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: theme.line,
        borderLeftWidth: 3,
        borderLeftColor: theme.base,
        overflow: "hidden",
        // web: 0 1px 3px themeColor/5%, 0 4px 16px themeColor/3%
        shadowColor: theme.base,
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 1,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded, disabled: !expandable }}
        accessibilityLabel={`${notice.title}${isNew ? ", new" : ""}`}
        disabled={!expandable}
        onPress={onToggle}
        style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14 }}
      >
        <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: theme.soft, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: theme.text, fontVariant: ["tabular-nums"] }}>
            {String(index + 1).padStart(2, "0")}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", columnGap: 8, rowGap: 4 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 15, lineHeight: 20, color: "#0D1B3E", flexShrink: 1 }}>{notice.title}</Text>
            {isNew ? (
              <View style={{ backgroundColor: "#ECFDF5", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: 0.6, color: "#059669" }}>NEW</Text>
              </View>
            ) : null}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", columnGap: 12, rowGap: 2 }}>
            <Meta icon={<Calendar size={11} color={META} strokeWidth={2} />} label={formatDate(notice.createdAt)} />
            {documents > 0 ? (
              <Meta
                icon={<Paperclip size={11} color={META} strokeWidth={2} />}
                label={`${documents} ${documents === 1 ? "attachment" : "attachments"}`}
              />
            ) : null}
            {images > 0 ? (
              <Meta icon={<ImageIcon size={11} color={META} strokeWidth={2} />} label={`${images} ${images === 1 ? "image" : "images"}`} />
            ) : null}
          </View>
        </View>

        {expandable ? (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: expanded ? theme.base : theme.soft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {expanded ? (
              <ChevronUp size={14} strokeWidth={2.5} color={theme.onBase} />
            ) : (
              <ChevronDown size={14} strokeWidth={2.5} color={theme.text} />
            )}
          </View>
        ) : null}
      </Pressable>

      {expanded ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 18 }}>
          <View style={{ height: 1, backgroundColor: theme.line, marginBottom: 14 }} />
          {detail ? (
            <ContentRows rows={rows} theme={theme} variables={variables} />
          ) : detailError ? (
            <Pressable accessibilityRole="button" onPress={onRetry} style={{ paddingVertical: 6 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "#DC2626" }}>
                {"Couldn't load this notice. "}
                <Text style={{ fontFamily: FONT.semibold, color: theme.text }}>Try again</Text>
              </Text>
            </Pressable>
          ) : detailPending ? (
            <ActivityIndicator color={theme.base} style={{ paddingVertical: 12 }} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function Meta({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      {icon}
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: META }}>{label}</Text>
    </View>
  );
}
