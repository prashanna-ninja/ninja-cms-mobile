// Renders the app icons from code: each org colour as the background, the white
// CMS NINJA wordmark (assets/images/ninja-cms-logo.png) centred on top.
//
//   node scripts/generate-app-icons.mjs
//
// Colours + names come from src/constants/app-icons.json. Outputs (all committed):
//   assets/app-icons/<name>.png          1024² opaque — iOS icon (default + alternates)
//   assets/app-icons/adaptive-foreground.png  1024² transparent — Android adaptive
//                                        foreground, shared by every icon (only the
//                                        background colour differs per org)
//   assets/app-icons/monochrome.png      Android 13+ themed icon (same artwork)
//   assets/app-icons/favicon.png         web
//   assets/app-icons/preview.png         contact sheet of every icon (for review)
//
// Sizing: iOS masks a rounded square, so the wordmark takes 62% of the width.
// Android adaptive icons are masked to a shape inside the central 66% "safe zone"
// (a 676px circle on 1024), so the wordmark is 52% wide there (its diagonal fits).
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "src/constants/app-icons.json"), "utf8"));
const LOGO = join(root, "assets/images/ninja-cms-logo.png");
const OUT = join(root, "assets/app-icons");
const SIZE = 1024;

mkdirSync(OUT, { recursive: true });

/** The white wordmark scaled to `width`, centred on a transparent SIZE² canvas. */
async function centredLogo(width, size = SIZE) {
  const logo = await sharp(LOGO).resize({ width }).png().toBuffer();
  const { height } = await sharp(logo).metadata();
  return sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: logo, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }])
    .png()
    .toBuffer();
}

async function solidIcon(color, size = SIZE, logoRatio = 0.62) {
  const logo = await centredLogo(Math.round(size * logoRatio), size);
  return sharp({ create: { width: size, height: size, channels: 3, background: color } })
    .composite([{ input: logo }])
    .flatten({ background: color }) // iOS: no alpha channel allowed
    .png()
    .toBuffer();
}

const icons = [config.default, ...config.alternates];

for (const icon of icons) {
  await sharp(await solidIcon(icon.color)).toFile(join(OUT, `${icon.name}.png`));
  console.log(`✓ ${icon.name}.png  ${icon.color}`);
}

const foreground = await centredLogo(Math.round(SIZE * 0.52));
await sharp(foreground).toFile(join(OUT, "adaptive-foreground.png"));
await sharp(foreground).toFile(join(OUT, "monochrome.png"));
console.log("✓ adaptive-foreground.png, monochrome.png");

await sharp(await solidIcon(config.default.color, 196, 0.7)).toFile(join(OUT, "favicon.png"));
console.log("✓ favicon.png");

// Contact sheet: every icon, rounded like a home screen, with its name.
const TILE = 220;
const GAP = 36;
const cols = 4;
const rows = Math.ceil(icons.length / cols);
const sheetW = cols * TILE + (cols + 1) * GAP;
const sheetH = rows * (TILE + 56) + (rows + 1) * GAP;
const mask = Buffer.from(`<svg width="${TILE}" height="${TILE}"><rect width="${TILE}" height="${TILE}" rx="50" ry="50"/></svg>`);
const tiles = [];
for (const [i, icon] of icons.entries()) {
  const tile = await sharp(join(OUT, `${icon.name}.png`))
    .resize(TILE)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
  const x = GAP + (i % cols) * (TILE + GAP);
  const y = GAP + Math.floor(i / cols) * (TILE + 56 + GAP);
  const label = Buffer.from(
    `<svg width="${TILE + 40}" height="40"><text x="50%" y="26" text-anchor="middle" font-family="Segoe UI, Arial" font-size="20" fill="#0D1B3E">${icon.label.replace(/&/g, "&amp;").replace(/\+/g, "&#43;")}</text></svg>`,
  );
  tiles.push({ input: tile, left: x, top: y }, { input: label, left: x - 20, top: y + TILE + 8 });
}
await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: "#F0F4FB" } })
  .composite(tiles)
  .png()
  .toFile(join(OUT, "preview.png"));
console.log("✓ preview.png");
