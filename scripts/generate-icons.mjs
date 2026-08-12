/**
 * Generates VYBE app icons + splash assets for both native platforms from
 * the brand logo (src/assets/logo.svg).
 *
 * Usage: bun scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logo = await readFile(join(root, "src/assets/logo.svg"));

const ANDROID = join(root, "android/app/src/main/res");
const IOS = join(root, "ios/App/App/Assets.xcassets/AppIcon.appiconset");

/** Android legacy launcher sizes (px at each density bucket). */
const ANDROID_MIPMAPS = [
  ["mdpi", 48],
  ["hdpi", 72],
  ["xhdpi", 96],
  ["xxhdpi", 144],
  ["xxxhdpi", 192],
];

/** iOS AppIcon sizes: [filename, px]. */
const IOS_ICONS = [
  ["AppIcon-20@1x.png", 20],
  ["AppIcon-20@2x.png", 40],
  ["AppIcon-20@3x.png", 60],
  ["AppIcon-29@1x.png", 29],
  ["AppIcon-29@2x.png", 58],
  ["AppIcon-29@3x.png", 87],
  ["AppIcon-40@1x.png", 40],
  ["AppIcon-40@2x.png", 80],
  ["AppIcon-40@3x.png", 120],
  ["AppIcon-60@2x.png", 120],
  ["AppIcon-60@3x.png", 180],
  ["AppIcon-76@1x.png", 76],
  ["AppIcon-76@2x.png", 152],
  ["AppIcon-83.5@2x.png", 167],
  ["AppIcon-512@2x.png", 1024],
];

/** Android splash sizes: [density, width] — 4:3-ish safe region, full-bleed PNG. */
const ANDROID_SPLASHES = [
  ["port-hdpi", 480, 320],
  ["port-mdpi", 320, 480],
  ["port-xhdpi", 720, 480],
  ["port-xxhdpi", 960, 640],
  ["port-xxxhdpi", 1280, 960],
  ["land-hdpi", 800, 480],
  ["land-mdpi", 480, 320],
  ["land-xhdpi", 1280, 720],
  ["land-xxhdpi", 1600, 960],
  ["land-xxxhdpi", 1920, 1280],
];

async function writePng(file, buffer) {
  await mkdir(dirname(file), { recursive: true });
  await sharp(buffer).png().toFile(file);
  console.log("wrote", file.replace(root + "/", ""));
}

// --- Android launcher icons ------------------------------------------------
for (const [density, size] of ANDROID_MIPMAPS) {
  const icon = await sharp(logo).resize(size, size).png().toBuffer();
  await writePng(join(ANDROID, `mipmap-${density}/ic_launcher.png`), icon);
  await writePng(join(ANDROID, `mipmap-${density}/ic_launcher_round.png`), icon);
  // Adaptive-icon foreground: logo at ~70% with brand background baked in.
  const fg = await sharp(logo)
    .resize(Math.round(size * 0.7), Math.round(size * 0.7))
    .png()
    .toBuffer();
  await writePng(join(ANDROID, `mipmap-${density}/ic_launcher_foreground.png`), fg);
}

// --- Android splash --------------------------------------------------------
for (const [name, w, h] of ANDROID_SPLASHES) {
  const splash = await sharp({
    create: { width: w, height: h, channels: 3, background: "#0b0b12" },
  })
    .composite([
      {
        input: await sharp(logo).resize(Math.round(Math.min(w, h) * 0.42)).png().toBuffer(),
        gravity: "centre",
      },
    ])
    .png()
    .toFile(join(ANDROID, `drawable-${name}/splash.png`));
  console.log("wrote", `android/app/src/main/res/drawable-${name}/splash.png`);
  void splash;
}
await writePng(join(ANDROID, "drawable/splash.png"), await sharp(logo).resize(480, 320).png().toBuffer());

// --- iOS AppIcon -----------------------------------------------------------
for (const [file, size] of IOS_ICONS) {
  const icon = await sharp(logo).resize(size, size).png().toBuffer();
  await writePng(join(IOS, file), icon);
}

// --- iOS splash ------------------------------------------------------------
// LaunchScreen background handled by the storyboard; provide a brand image.
const iosSplash = await sharp(logo).resize(2732, 2732).png().toBuffer();
await writePng(join(IOS, "../Splash.imageset/splash-2732x2732.png"), iosSplash);
await writePng(join(IOS, "../Splash.imageset/splash-2732x2732-1.png"), iosSplash);
await writePng(join(IOS, "../Splash.imageset/splash-2732x2732-2.png"), iosSplash);

console.log("Done. Run `npx cap sync` to push assets into the native projects.");
