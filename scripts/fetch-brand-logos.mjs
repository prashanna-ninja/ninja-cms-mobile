// Downloads each org's brand logo (`logoUrl` in src/constants/app-icons.json) and
// normalises it for the icon generator:
//
//   node scripts/fetch-brand-logos.mjs
//
// → assets/brand-logos/<name>.png — transparent PNG, trimmed to the artwork,
//   at most 1600px wide (sources range from 734px to 9705px; SVGs are rasterised
//   at high density). Committed, so builds never depend on S3 being reachable.
//
// Use the ORIGINAL S3 URL, not the web's `/_next/image?url=…&w=256` resize.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "src/constants/app-icons.json"), "utf8"));
const OUT = join(root, "assets/brand-logos");
const MAX_WIDTH = 1600;

mkdirSync(OUT, { recursive: true });

for (const icon of config.alternates) {
  if (!icon.logoUrl) {
    console.log(`– ${icon.name}: no logoUrl, skipped (will use the CMS NINJA wordmark)`);
    continue;
  }
  const res = await fetch(icon.logoUrl);
  if (!res.ok) throw new Error(`${icon.name}: HTTP ${res.status} for ${icon.logoUrl}`);
  const input = Buffer.from(await res.arrayBuffer());
  const isSvg = /\.svg(\?|$)/i.test(icon.logoUrl) || (res.headers.get("content-type") ?? "").includes("svg");

  const png = await sharp(input, isSvg ? { density: 600 } : {})
    .ensureAlpha()
    .trim() // drop transparent padding so every logo is sized by its artwork
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();

  writeFileSync(join(OUT, `${icon.name}.png`), png);
  const { width, height } = await sharp(png).metadata();
  console.log(`✓ ${icon.name}.png  ${width}×${height}`);
}
