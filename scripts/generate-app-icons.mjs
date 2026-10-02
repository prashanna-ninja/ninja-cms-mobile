// Renders the app icons from code: the org colour as the background, with either
// the org's own brand logo (style "brand") or the white CMS NINJA wordmark
// (style "ninja") centred on top.
//
//   node scripts/generate-app-icons.mjs
//
// Config: src/constants/app-icons.json (`style`, colours, names). Brand logos come
// from assets/brand-logos/<name>.png (run scripts/fetch-brand-logos.mjs first).
// An org without a brand logo falls back to the wordmark. The default icon is
// always the wordmark on Ninja CMS blue.
//
// Outputs (all committed) in assets/app-icons/:
//   <name>.png              1024² opaque — iOS icon (Default = main app icon)
//   <name>-foreground.png   1024² transparent — Android adaptive foreground (alternates)
//   <name>-monochrome.png   Android 13+ themed icon (white silhouette)
//   adaptive-foreground.png / monochrome.png — the same, for the default icon
//   favicon.png, preview.png (contact sheet of every icon, for review)
//
// Sizing: iOS masks a rounded square; Android masks inside the central 66% safe
// zone (a 676px circle on 1024). Logos are fitted ("contain") into a box:
//   wordmark: 62% wide (iOS) / 52% wide (Android)
//   brand logos (wide, short): 76% × 42% (iOS) / 60% × 30% (Android) — the box
//   diagonal stays inside the safe circle.
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "src/constants/app-icons.json"), "utf8"));
const WORDMARK = join(root, "assets/images/ninja-cms-logo.png");
const BRAND_DIR = join(root, "assets/brand-logos");
const OUT = join(root, "assets/app-icons");
const SIZE = 1024;

const BOX = {
  wordmark: { ios: [0.62, 0.62], android: [0.52, 0.52] },
  brand: { ios: [0.76, 0.42], android: [0.6, 0.3] },
};

mkdirSync(OUT, { recursive: true });

function artFor(icon) {
  if (config.style === "brand" && icon.logoUrl) {
    const file = join(BRAND_DIR, `${icon.name}.png`);
    if (existsSync(file)) return { file, kind: "brand" };
    console.warn(`! ${icon.name}: no ${file} — run scripts/fetch-brand-logos.mjs. Using the wordmark.`);
  }
  return { file: WORDMARK, kind: "wordmark" };
}

/** `art` fitted into a (w×h fraction) box, centred on a transparent size² canvas. */
async function centred(art, [bw, bh], size = SIZE, { silhouette = false } = {}) {
  let img = sharp(art.file).resize({
    width: Math.round(size * bw),
    height: Math.round(size * bh),
    fit: "inside",
  });
  if (silhouette) {
    // Monochrome: keep only the shape (alpha), paint it white.
    const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) data[i] = data[i + 1] = data[i + 2] = 255;
    img = sharp(data, { raw: info });
  }
  const logo = await img.png().toBuffer();
  const { width, height } = await sharp(logo).metadata();
  return sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: logo, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }])
    .png()
    .toBuffer();
}

async function solidIcon(color, art, size = SIZE, box = BOX[art.kind].ios) {
  const fg = await centred(art, box, size);
  return sharp({ create: { width: size, height: size, channels: 3, background: color } })
    .composite([{ input: fg }])
    .flatten({ background: color }) // iOS: no alpha channel allowed
    .png()
    .toBuffer();
}

const icons = [config.default, ...config.alternates];
console.log(`style: ${config.style}`);

for (const icon of icons) {
  const art = icon === config.default ? { file: WORDMARK, kind: "wordmark" } : artFor(icon);
  await sharp(await solidIcon(icon.color, art)).toFile(join(OUT, `${icon.name}.png`));

  const fgName = icon === config.default ? "adaptive-foreground.png" : `${icon.name}-foreground.png`;
  const monoName = icon === config.default ? "monochrome.png" : `${icon.name}-monochrome.png`;
  await sharp(await centred(art, BOX[art.kind].android)).toFile(join(OUT, fgName));
  await sharp(await centred(art, BOX[art.kind].android, SIZE, { silhouette: true })).toFile(join(OUT, monoName));
  console.log(`✓ ${icon.name}  ${icon.color}  (${art.kind})`);
}

await sharp(await solidIcon(config.default.color, { file: WORDMARK, kind: "wordmark" }, 196, [0.7, 0.7])).toFile(
  join(OUT, "favicon.png"),
);
console.log("✓ favicon.png");

// Contact sheet: every icon rounded like a home screen + an Android circle crop, with its name.
const TILE = 200;
const GAP = 36;
const cols = 4;
const rows = Math.ceil(icons.length / cols);
const sheetW = cols * (TILE * 2 + 20) + (cols + 1) * GAP;
const sheetH = rows * (TILE + 56) + (rows + 1) * GAP;
const squircle = Buffer.from(`<svg width="${TILE}" height="${TILE}"><rect width="${TILE}" height="${TILE}" rx="46" ry="46"/></svg>`);
const circle = Buffer.from(`<svg width="${TILE}" height="${TILE}"><circle cx="${TILE / 2}" cy="${TILE / 2}" r="${TILE / 2}"/></svg>`);
const tiles = [];
for (const [i, icon] of icons.entries()) {
  const ios = await sharp(join(OUT, `${icon.name}.png`)).resize(TILE).composite([{ input: squircle, blend: "dest-in" }]).png().toBuffer();
  // Android preview: adaptive layers are 108dp with a 72dp visible area → crop the centre 2/3.
  const fg = icon === config.default ? "adaptive-foreground.png" : `${icon.name}-foreground.png`;
  const androidFull = await sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: icon.color } })
    .composite([{ input: join(OUT, fg) }])
    .png()
    .toBuffer();
  const android = await sharp(androidFull)
    .extract({ left: Math.round(SIZE / 6), top: Math.round(SIZE / 6), width: Math.round((SIZE * 2) / 3), height: Math.round((SIZE * 2) / 3) })
    .resize(TILE)
    .composite([{ input: circle, blend: "dest-in" }])
    .png()
    .toBuffer();
  const x = GAP + (i % cols) * (TILE * 2 + 20 + GAP);
  const y = GAP + Math.floor(i / cols) * (TILE + 56 + GAP);
  const label = Buffer.from(
    `<svg width="${TILE * 2 + 20}" height="40"><text x="50%" y="26" text-anchor="middle" font-family="Segoe UI, Arial" font-size="20" fill="#0D1B3E">${icon.label.replace(/&/g, "&amp;").replace(/\+/g, "&#43;")}  (iOS · Android)</text></svg>`,
  );
  tiles.push(
    { input: ios, left: x, top: y },
    { input: android, left: x + TILE + 20, top: y },
    { input: label, left: x, top: y + TILE + 8 },
  );
}
await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: "#F0F4FB" } })
  .composite(tiles)
  .png()
  .toFile(join(OUT, "preview.png"));
console.log("✓ preview.png");
