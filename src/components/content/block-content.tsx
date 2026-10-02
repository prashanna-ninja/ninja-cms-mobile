import { Image } from "expo-image";
import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { RichText } from "@/components/content/rich-text";
import { CirclePlay, ClipboardList, ExternalLink, FileText } from "@/lib/icons";
import { openUrl } from "@/lib/open-url";
import type { OrgTheme } from "@/lib/org-theme";
import type { BlockContent, Row } from "@/schemas/grid-builder.schema";

/**
 * Native views for CMS grid-builder content (notices now, articles later).
 * Web equivalent: components/custom-ui/custom-grid-builder/BlockContentView.tsx.
 *
 * On a phone every block is full width and rows stack (the web uses a 12-col
 * grid from `md` up and stacks below that too). Anything that opens a URL —
 * links, documents, buttons, videos, forms — goes through `openUrl` (in-app browser).
 */

const FONT = {
  regular: "BricolageGrotesque_400Regular",
  medium: "BricolageGrotesque_500Medium",
  semibold: "BricolageGrotesque_600SemiBold",
};

function ContentImage({ src, alt, caption, redirectUrl, backgroundColor, tint }: {
  src: string;
  alt: string;
  caption?: string;
  redirectUrl?: string;
  backgroundColor?: string;
  tint: string;
}) {
  const [ratio, setRatio] = React.useState(4 / 3);
  const image = (
    <Image
      source={{ uri: src }}
      accessibilityLabel={alt}
      style={{ width: "100%", aspectRatio: ratio, maxHeight: 500, borderRadius: 10 }}
      contentFit="contain"
      cachePolicy="disk"
      transition={150}
      onLoad={(e) => {
        const { width, height } = e.source;
        if (width && height) setRatio(width / height);
      }}
    />
  );
  const framed = (
    <View style={backgroundColor ? { backgroundColor, borderRadius: 10, paddingVertical: 16 } : undefined}>{image}</View>
  );
  return (
    <View style={{ gap: 6 }}>
      {redirectUrl ? (
        <Pressable accessibilityRole="link" onPress={() => void openUrl(redirectUrl, tint)}>
          {framed}
        </Pressable>
      ) : (
        framed
      )}
      {caption ? (
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: "#6B7A99", textAlign: "center" }}>{caption}</Text>
      ) : null}
    </View>
  );
}

/** Document / form / video: a tappable row card (icon tile + label + external-link glyph). */
function LinkCard({ icon, title, subtitle, onPress, theme }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  theme: OrgTheme;
}) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${title}, ${subtitle}`}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.line,
        backgroundColor: pressed ? theme.soft : "#FFFFFF",
      }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: theme.soft, alignItems: "center", justifyContent: "center" }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#0D1B3E" }}>
          {title}
        </Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "#6B7A99" }}>{subtitle}</Text>
      </View>
      <ExternalLink size={16} color={theme.text} strokeWidth={2} />
    </Pressable>
  );
}

function fileExtension(name: string) {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "FILE" : name.slice(dot + 1).toUpperCase();
}

export function BlockContentView({ content, theme, variables }: {
  content: BlockContent;
  theme: OrgTheme;
  variables?: { name?: string; email?: string };
}) {
  switch (content.type) {
    case "rich-text":
      return <RichText html={content.html} linkColor={theme.text} variables={variables} />;

    case "image":
      return content.src ? (
        <ContentImage
          src={content.src}
          alt={content.alt}
          caption={content.caption}
          redirectUrl={content.redirectUrl}
          backgroundColor={content.backgroundColor}
          tint={theme.base}
        />
      ) : null;

    case "document":
      return (
        <LinkCard
          theme={theme}
          icon={<FileText size={20} color={theme.text} strokeWidth={2} />}
          title={content.fileName.replace(/\.[^/.]+$/, "")}
          subtitle={`${fileExtension(content.fileName)} · Tap to open`}
          onPress={() => void openUrl(content.fileUrl, theme.base)}
        />
      );

    case "buttons":
      return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {content.buttons.map((btn) => (
            <Pressable
              key={btn.id}
              accessibilityRole="button"
              onPress={() => void openUrl(btn.url, theme.base)}
              style={{ backgroundColor: theme.base, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 }}
            >
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: theme.onBase }}>{btn.title || "Button"}</Text>
            </Pressable>
          ))}
        </View>
      );

    case "video":
      // No inline player (would need a WebView) — opens in the in-app browser / YouTube.
      return (
        <LinkCard
          theme={theme}
          icon={<CirclePlay size={20} color={theme.text} strokeWidth={2} />}
          title="Watch video"
          subtitle={hostOf(content.url)}
          onPress={() => void openUrl(content.url, theme.base)}
        />
      );

    case "form":
      return (
        <LinkCard
          theme={theme}
          icon={<ClipboardList size={20} color={theme.text} strokeWidth={2} />}
          title={content.title || "Open form"}
          subtitle="Form · Tap to open"
          onPress={() => void openUrl(content.url, theme.base)}
        />
      );

    default:
      return null;
  }
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Tap to open";
  }
}

/** A whole layout: rows stacked, blocks stacked within a row. */
export function ContentRows({ rows, theme, variables }: {
  rows: Row[];
  theme: OrgTheme;
  variables?: { name?: string; email?: string };
}) {
  return (
    <View style={{ gap: 18 }}>
      {rows.map((row, r) => (
        <View key={row.id ?? r} style={{ gap: 14 }}>
          {row.blocks.map((block) =>
            block.content ? <BlockContentView key={block.id} content={block.content} theme={theme} variables={variables} /> : null,
          )}
        </View>
      ))}
    </View>
  );
}

/** Same counts the web card shows ("1 image", "2 attachments"). */
export function countMedia(rows: Row[]) {
  const blocks = rows.flatMap((r) => r.blocks);
  return {
    documents: blocks.filter((b) => b.content?.type === "document").length,
    images: blocks.filter((b) => b.content?.type === "image").length,
  };
}
