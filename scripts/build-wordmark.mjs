// Builds the white "CMS NINJA" wordmark (assets/images/ninja-cms-logo.png) from code.
//
//   node scripts/build-wordmark.mjs        then: node scripts/generate-app-icons.mjs
//
// Source: assets/source/ninja-mark-source.png — the Ninja PRM square mark (1080²,
// white art on orange, the user's reference). Steps:
//   1. orange → transparent (alpha from the blue channel, keeps anti-aliasing)
//   2. erase "PRM", draw "CMS" in Montserrat Bold (measured to match PRM's weight)
//      — baseline and left edge (aligned to the J) unchanged; only the size varies
//   3. crop tight around the artwork
//
// Tweak the size with CAP_HEIGHT. PRM was 77px (the 2026-10-02 first version);
// 2026-10-02 rev 2 = 88px ("a little bit bigger", +14%) — still clears the A.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";

const CAP_HEIGHT = 88; // px on the 1080 source; PRM = 77
const BASELINE_Y = 401; // PRM baseline (sits 27px above the NINJA letters)
const LEFT_X = 655; // PRM/CMS left edge, aligned to the J
const MAX_RIGHT_X = 954; // right edge of the A — CMS must not pass it

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const fontPath = require.resolve("@expo-google-fonts/montserrat/700Bold/Montserrat_700Bold.ttf");
const buf = readFileSync(fontPath);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const toD = (p) =>
  p.commands
    .map((c) =>
      c.type === "M" ? `M${c.x} ${c.y}`
      : c.type === "L" ? `L${c.x} ${c.y}`
      : c.type === "Q" ? `Q${c.x1} ${c.y1} ${c.x} ${c.y}`
      : c.type === "C" ? `C${c.x1} ${c.y1} ${c.x2} ${c.y2} ${c.x} ${c.y}`
      : "Z",
    )
    .join(" ");

const { data, info } = await sharp(join(root, "assets/source/ninja-mark-source.png"))
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const out = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  const blue = data[i * info.channels + 2]; // bg orange has blue 22, white 255
  const a = Math.max(0, Math.min(255, Math.round(((blue - 22) / (255 - 22)) * 255)));
  out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = 255;
  out[i * 4 + 3] = a;
}
// Erase "PRM" (x 655–904, y 324–401) with a margin — nothing else lives there.
for (let y = 300; y < 414; y++) for (let x = 640; x < 960; x++) out[(y * W + x) * 4 + 3] = 0;

// "CMS": measure cap height on the flat-topped M, align its bottom to the baseline.
const m100 = font.getPath("M", 0, 0, 100).getBoundingBox();
const size = (CAP_HEIGHT / (m100.y2 - m100.y1)) * 100;
const mb = font.getPath("M", 0, 0, size).getBoundingBox();
const probe = font.getPath("CMS", 0, 0, size).getBoundingBox();
const path = font.getPath("CMS", LEFT_X - probe.x1, BASELINE_Y - mb.y2, size);
const bb = path.getBoundingBox();
if (bb.x2 > MAX_RIGHT_X) throw new Error(`CMS too wide (right edge ${bb.x2.toFixed(0)} > ${MAX_RIGHT_X}) — lower CAP_HEIGHT`);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><path d="${toD(path)}" fill="#fff"/></svg>`;
const full = await sharp(out, { raw: { width: W, height: H, channels: 4 } })
  .composite([{ input: Buffer.from(svg) }])
  .png()
  .toBuffer();

// Tight crop around the artwork (+8px).
const trimmed = await sharp(full).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
const PAD = 8;
const logo = await sharp(trimmed.data)
  .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toBuffer();
await sharp(logo).toFile(join(root, "assets/images/ninja-cms-logo.png"));
const meta = await sharp(logo).metadata();
console.log(
  `✓ assets/images/ninja-cms-logo.png ${meta.width}×${meta.height} — CMS cap ${CAP_HEIGHT}px, x ${bb.x1.toFixed(0)}–${bb.x2.toFixed(0)}, top ${bb.y1.toFixed(0)}`,
);
console.log(`  aspect ${(meta.width / meta.height).toFixed(4)} → update ASPECT in src/components/brand/ninja-cms-logo.tsx if it changed`);
