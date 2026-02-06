import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const iconsDir = join(root, 'public', 'icons');

mkdirSync(iconsDir, { recursive: true });

const svgMain = readFileSync(join(iconsDir, 'icon-svg.svg'));
const svgMaskable = readFileSync(join(iconsDir, 'icon-maskable.svg'));

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  // Regular icons
  for (const size of sizes) {
    await sharp(svgMain)
      .resize(size, size)
      .png({ quality: 95 })
      .toFile(join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`✓ icon-${size}x${size}.png`);
  }

  // Maskable icons
  for (const size of [192, 512]) {
    await sharp(svgMaskable)
      .resize(size, size)
      .png({ quality: 95 })
      .toFile(join(iconsDir, `icon-maskable-${size}x${size}.png`));
    console.log(`✓ icon-maskable-${size}x${size}.png`);
  }

  // Apple touch icon
  await sharp(svgMain)
    .resize(180, 180)
    .png({ quality: 95 })
    .toFile(join(root, 'public', 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png');

  // Favicon 32x32
  await sharp(svgMain)
    .resize(32, 32)
    .png()
    .toFile(join(root, 'public', 'favicon-32x32.png'));
  console.log('✓ favicon-32x32.png');

  // Favicon 16x16
  await sharp(svgMain)
    .resize(16, 16)
    .png()
    .toFile(join(root, 'public', 'favicon-16x16.png'));
  console.log('✓ favicon-16x16.png');

  // Splash screens for iOS
  const splashSizes = [
    { w: 2048, h: 2732, name: 'splash-2048x2732' }, // iPad Pro 12.9
    { w: 1668, h: 2388, name: 'splash-1668x2388' }, // iPad Pro 11
    { w: 1536, h: 2048, name: 'splash-1536x2048' }, // iPad
    { w: 1125, h: 2436, name: 'splash-1125x2436' }, // iPhone X
    { w: 1242, h: 2688, name: 'splash-1242x2688' }, // iPhone XS Max
    { w: 828, h: 1792, name: 'splash-828x1792' },   // iPhone XR
    { w: 1170, h: 2532, name: 'splash-1170x2532' }, // iPhone 12/13/14
    { w: 1284, h: 2778, name: 'splash-1284x2778' }, // iPhone 12/13/14 Pro Max
  ];

  for (const { w, h, name } of splashSizes) {
    const iconSize = Math.min(Math.floor(w * 0.25), 256);
    const iconBuffer = await sharp(svgMain)
      .resize(iconSize, iconSize)
      .png()
      .toBuffer();

    // Create splash with gradient background and centered icon
    const svgSplash = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4f46e5"/>
          <stop offset="100%" style="stop-color:#06b6d4"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#bg)"/>
      <text x="${w/2}" y="${h/2 + iconSize/2 + 60}" 
            font-family="Inter, system-ui, sans-serif" 
            font-size="${Math.floor(w * 0.045)}" 
            font-weight="700" 
            fill="white" 
            text-anchor="middle" 
            opacity="0.95">PrecifiCALC</text>
      <text x="${w/2}" y="${h/2 + iconSize/2 + 60 + Math.floor(w * 0.035)}" 
            font-family="Inter, system-ui, sans-serif" 
            font-size="${Math.floor(w * 0.025)}" 
            font-weight="400" 
            fill="white" 
            text-anchor="middle" 
            opacity="0.7">Calculadora Empresarial</text>
    </svg>`;

    await sharp(Buffer.from(svgSplash))
      .composite([{
        input: iconBuffer,
        left: Math.floor((w - iconSize) / 2),
        top: Math.floor((h - iconSize) / 2) - 40,
      }])
      .png({ quality: 80 })
      .toFile(join(iconsDir, `${name}.png`));
    console.log(`✓ ${name}.png`);
  }

  console.log('\n✅ All icons generated!');
}

generate().catch(console.error);
