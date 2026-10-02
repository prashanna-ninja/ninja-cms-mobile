import { Image } from "expo-image";
import { parseDocument } from "htmlparser2";
import * as React from "react";
import { ScrollView, Text, View, type TextStyle } from "react-native";

import { openUrl } from "@/lib/open-url";

/**
 * Native renderer for the CMS's rich text (Tiptap HTML, the `rich-text` block).
 * Web equivalent: components/custom-ui/custom-grid-builder/RichTextView.tsx
 * (`prose` + dangerouslySetInnerHTML).
 *
 * Why not a WebView: notice/article bodies are short, appear in lists, and need
 * to size to their content and scroll with the page — a WebView per block is
 * heavy, needs height measuring, and doesn't match the app's fonts.
 *
 * Supported: p, h1–h6, strong/b, em/i, u, s/del, a, br, ul/ol/li (nested),
 * blockquote, code/pre, hr, table (scrolls sideways), img, span/div/mark.
 * Unknown tags render their children, so new Tiptap marks degrade to plain text.
 *
 * Template variables, like the web: `@name` → the org name (`@email` too when given).
 */

type DomNode = {
  type: string;
  name?: string;
  data?: string;
  attribs?: Record<string, string>;
  children?: DomNode[];
};

const INK = "#0D1B3E";
const BODY = "#1F2A44";
const MUTED = "#5B6B8C";
const FONT = {
  regular: "BricolageGrotesque_400Regular",
  medium: "BricolageGrotesque_500Medium",
  semibold: "BricolageGrotesque_600SemiBold",
  bold: "BricolageGrotesque_700Bold",
};

const BASE_TEXT: TextStyle = { fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: BODY };

const HEADINGS: Record<string, TextStyle> = {
  h1: { fontFamily: FONT.bold, fontSize: 22, lineHeight: 28, color: INK },
  h2: { fontFamily: FONT.bold, fontSize: 19, lineHeight: 25, color: INK },
  h3: { fontFamily: FONT.semibold, fontSize: 17, lineHeight: 23, color: INK },
  h4: { fontFamily: FONT.semibold, fontSize: 16, lineHeight: 22, color: INK },
  h5: { fontFamily: FONT.semibold, fontSize: 15, lineHeight: 21, color: INK },
  h6: { fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: INK },
};

const BLOCK_TAGS = new Set([
  "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote",
  "pre", "hr", "table", "thead", "tbody", "tr", "img", "figure", "section",
]);

const isBlock = (n: DomNode) => n.type === "tag" && !!n.name && BLOCK_TAGS.has(n.name);

type Ctx = { linkColor: string };

/** Inline styles for a mark tag, merged into the nested <Text>. */
function inlineStyle(name: string, ctx: Ctx): TextStyle | null {
  switch (name) {
    case "strong":
    case "b":
      return { fontFamily: FONT.semibold, color: INK };
    case "em":
    case "i":
      return { fontStyle: "italic" };
    case "u":
      return { textDecorationLine: "underline" };
    case "s":
    case "del":
    case "strike":
      return { textDecorationLine: "line-through" };
    case "code":
      return { fontFamily: undefined, backgroundColor: "#EEF2F8", fontSize: 13 };
    case "mark":
      return { backgroundColor: "#FEF3C7" };
    case "a":
      return { color: ctx.linkColor, textDecorationLine: "underline", fontFamily: FONT.medium };
    case "sub":
    case "sup":
      return { fontSize: 11 };
    default:
      return null;
  }
}

/** Collapse whitespace the way a browser does. */
const collapse = (s: string) => s.replace(/\s+/g, " ");

function renderInline(nodes: DomNode[], ctx: Ctx, keyPrefix: string): React.ReactNode[] {
  return nodes.map((node, i) => {
    const key = `${keyPrefix}-${i}`;
    if (node.type === "text") return collapse(node.data ?? "");
    if (node.type !== "tag" || !node.name) return null;
    if (node.name === "br") return "\n";
    const children = renderInline(node.children ?? [], ctx, key);
    const style = inlineStyle(node.name, ctx);
    if (node.name === "a") {
      const href = node.attribs?.href;
      return (
        <Text key={key} style={style ?? undefined} onPress={() => void openUrl(href, ctx.linkColor)} accessibilityRole="link">
          {children}
        </Text>
      );
    }
    return (
      <Text key={key} style={style ?? undefined}>
        {children}
      </Text>
    );
  });
}

/** Trim the leading/trailing space of a paragraph's first/last text run. */
function trimRuns(runs: React.ReactNode[]): React.ReactNode[] {
  const out = [...runs];
  if (typeof out[0] === "string") out[0] = (out[0] as string).replace(/^\s+/, "");
  const last = out.length - 1;
  if (typeof out[last] === "string") out[last] = (out[last] as string).replace(/\s+$/, "");
  return out;
}

const isBlank = (runs: React.ReactNode[]) =>
  runs.every((r) => r === null || (typeof r === "string" && r.trim() === ""));

function InlineImage({ src, alt }: { src: string; alt?: string }) {
  const [ratio, setRatio] = React.useState(16 / 9);
  return (
    <Image
      source={{ uri: src }}
      accessibilityLabel={alt}
      style={{ width: "100%", aspectRatio: ratio, borderRadius: 10 }}
      contentFit="contain"
      cachePolicy="disk"
      onLoad={(e) => {
        const { width, height } = e.source;
        if (width && height) setRatio(width / height);
      }}
    />
  );
}

/** Render a list of nodes as stacked blocks, wrapping loose inline runs in paragraphs. */
function renderBlocks(nodes: DomNode[], ctx: Ctx, keyPrefix: string, textStyle: TextStyle = BASE_TEXT): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let inlineRun: DomNode[] = [];

  const flush = () => {
    if (!inlineRun.length) return;
    const runs = renderInline(inlineRun, ctx, `${keyPrefix}-i${out.length}`);
    inlineRun = [];
    if (isBlank(runs)) return;
    out.push(
      <Text key={`${keyPrefix}-p${out.length}`} style={textStyle}>
        {trimRuns(runs)}
      </Text>,
    );
  };

  nodes.forEach((node, i) => {
    if (!isBlock(node)) {
      inlineRun.push(node);
      return;
    }
    flush();
    const key = `${keyPrefix}-${i}`;
    out.push(<BlockNode key={key} node={node} ctx={ctx} keyPrefix={key} textStyle={textStyle} />);
  });
  flush();
  return out;
}

function BlockNode({ node, ctx, keyPrefix, textStyle }: { node: DomNode; ctx: Ctx; keyPrefix: string; textStyle: TextStyle }) {
  const children = node.children ?? [];
  const name = node.name!;

  if (name in HEADINGS) {
    const runs = renderInline(children, ctx, keyPrefix);
    return isBlank(runs) ? null : <Text style={HEADINGS[name]}>{trimRuns(runs)}</Text>;
  }

  switch (name) {
    case "p":
    case "div":
    case "section":
    case "figure": {
      // A <p> holding only inline content → one Text; with nested blocks → a View.
      if (children.some(isBlock)) return <View style={{ gap: 10 }}>{renderBlocks(children, ctx, keyPrefix, textStyle)}</View>;
      const runs = renderInline(children, ctx, keyPrefix);
      // Tiptap writes empty <p></p> for blank lines — keep a small gap, like the web.
      if (isBlank(runs)) return <View style={{ height: 6 }} />;
      return <Text style={textStyle}>{trimRuns(runs)}</Text>;
    }

    case "ul":
    case "ol": {
      const items = children.filter((c) => c.type === "tag" && c.name === "li");
      return (
        <View style={{ gap: 6 }}>
          {items.map((li, idx) => (
            <View key={`${keyPrefix}-li${idx}`} style={{ flexDirection: "row", gap: 8, paddingRight: 4 }}>
              <Text style={[textStyle, { minWidth: name === "ol" ? 20 : 12, color: MUTED }]}>
                {name === "ol" ? `${idx + 1}.` : "•"}
              </Text>
              <View style={{ flex: 1, gap: 6 }}>{renderBlocks(li.children ?? [], ctx, `${keyPrefix}-li${idx}`, textStyle)}</View>
            </View>
          ))}
        </View>
      );
    }

    case "li":
      return <View style={{ gap: 6 }}>{renderBlocks(children, ctx, keyPrefix, textStyle)}</View>;

    case "blockquote":
      return (
        <View style={{ borderLeftWidth: 3, borderLeftColor: ctx.linkColor, paddingLeft: 12, gap: 8 }}>
          {renderBlocks(children, ctx, keyPrefix, { ...textStyle, color: MUTED, fontStyle: "italic" })}
        </View>
      );

    case "pre":
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: "#EEF2F8", borderRadius: 8 }}>
          <Text style={{ fontSize: 13, lineHeight: 19, color: INK, padding: 12 }}>{textOf(node)}</Text>
        </ScrollView>
      );

    case "hr":
      return <View style={{ height: 1, backgroundColor: "#E2E8F2", marginVertical: 4 }} />;

    case "img": {
      const src = node.attribs?.src;
      return src ? <InlineImage src={src} alt={node.attribs?.alt} /> : null;
    }

    case "table":
    case "thead":
    case "tbody": {
      const rows = collectRows(node);
      if (!rows.length) return null;
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View style={{ borderWidth: 1, borderColor: "#E2E8F2", borderRadius: 8, overflow: "hidden" }}>
            {rows.map((tr, r) => (
              <View key={`${keyPrefix}-tr${r}`} style={{ flexDirection: "row", borderTopWidth: r ? 1 : 0, borderColor: "#E2E8F2" }}>
                {(tr.children ?? [])
                  .filter((c) => c.type === "tag" && (c.name === "td" || c.name === "th"))
                  .map((cell, c) => (
                    <View
                      key={`${keyPrefix}-td${r}-${c}`}
                      style={{
                        width: 150,
                        padding: 8,
                        borderLeftWidth: c ? 1 : 0,
                        borderColor: "#E2E8F2",
                        backgroundColor: cell.name === "th" ? "#F3F6FB" : "#FFFFFF",
                        gap: 4,
                      }}
                    >
                      {renderBlocks(cell.children ?? [], ctx, `${keyPrefix}-c${r}-${c}`, {
                        ...textStyle,
                        fontSize: 13,
                        lineHeight: 19,
                        ...(cell.name === "th" ? { fontFamily: FONT.semibold, color: INK } : null),
                      })}
                    </View>
                  ))}
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }

    default:
      return <View style={{ gap: 10 }}>{renderBlocks(children, ctx, keyPrefix, textStyle)}</View>;
  }
}

function collectRows(node: DomNode): DomNode[] {
  const rows: DomNode[] = [];
  for (const child of node.children ?? []) {
    if (child.type !== "tag") continue;
    if (child.name === "tr") rows.push(child);
    else if (child.name === "thead" || child.name === "tbody" || child.name === "tfoot") rows.push(...collectRows(child));
  }
  return rows;
}

function textOf(node: DomNode): string {
  if (node.type === "text") return node.data ?? "";
  return (node.children ?? []).map(textOf).join("");
}

export function RichText({
  html,
  linkColor,
  variables,
}: {
  html: string;
  /** Links, quote bars — pass the org's readable text colour (`theme.text`). */
  linkColor: string;
  variables?: { name?: string; email?: string };
}) {
  const name = variables?.name;
  const email = variables?.email;
  const nodes = React.useMemo(() => {
    let source = html ?? "";
    if (name) source = source.replace(/@name/g, name);
    if (email) source = source.replace(/@email/g, email);
    return parseDocument(source).children as unknown as DomNode[];
  }, [html, name, email]);

  return <View style={{ gap: 10 }}>{renderBlocks(nodes, { linkColor }, "rt")}</View>;
}
