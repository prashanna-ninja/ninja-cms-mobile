import { z } from "zod";

/**
 * CMS "grid builder" content — the JSON stored in `Notice.content` (and articles).
 * Ported 1:1 from the CMS `types/grid-builder.ts` so the same payload validates
 * on both sides. A layout is rows → blocks (12-col `span` on desktop; stacked
 * on mobile) → one content item each.
 */
const richTextContentSchema = z.object({ type: z.literal("rich-text"), html: z.string() });

const imageContentSchema = z.object({
  type: z.literal("image"),
  src: z.string(),
  alt: z.string(),
  bucketKey: z.string().optional(),
  caption: z.string().optional(),
  redirectUrl: z.string().optional(),
  backgroundColor: z.string().optional(),
});

const documentContentSchema = z.object({
  type: z.literal("document"),
  fileName: z.string(),
  fileUrl: z.string(),
  bucketKey: z.string().optional(),
});

const buttonsContentSchema = z.object({
  type: z.literal("buttons"),
  buttons: z.array(z.object({ id: z.string(), title: z.string(), url: z.string() })),
});

const videoContentSchema = z.object({ type: z.literal("video"), url: z.string() });

const formContentSchema = z.object({ type: z.literal("form"), title: z.string(), url: z.string() });

const blockContentSchema = z.discriminatedUnion("type", [
  richTextContentSchema,
  imageContentSchema,
  documentContentSchema,
  buttonsContentSchema,
  videoContentSchema,
  formContentSchema,
]);

const blockSchema = z.object({
  id: z.string(),
  span: z.number(),
  content: blockContentSchema.optional(),
});

const rowSchema = z.object({ id: z.string(), blocks: z.array(blockSchema) });

export const rowsSchema = z.array(rowSchema);

/** Same as the CMS `parseRows`: invalid / unknown content → no rows (never throws). */
export function parseRows(content: unknown): Row[] {
  const result = rowsSchema.safeParse(content);
  return result.success ? result.data : [];
}

export type BlockContent = z.infer<typeof blockContentSchema>;
export type Block = z.infer<typeof blockSchema>;
export type Row = z.infer<typeof rowSchema>;
