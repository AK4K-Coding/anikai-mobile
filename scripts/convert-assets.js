const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

// SVG content for icons
const iconSvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#0f0f0f"/>
  <rect x="100" y="100" width="824" height="824" rx="180" fill="#1a1a1a"/>
  <text x="512" y="580" font-family="Arial, sans-serif" font-size="300" font-weight="bold" text-anchor="middle" fill="#ff4757">A</text>
  <path d="M 350 750 Q 512 820 674 750" stroke="#ff4757" stroke-width="20" fill="none"/>
</svg>`;

const adaptiveIconSvg = `<svg width="108" height="108" xmlns="http://www.w3.org/2000/svg">
  <rect width="108" height="108" fill="#1a1a1a"/>
  <text x="54" y="68" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#ff4757">A</text>
</svg>`;

const splashSvg = `<svg width="1242" height="2436" xmlns="http://www.w3.org/2000/svg">
  <rect width="1242" height="2436" fill="#0f0f0f"/>
  <rect x="421" y="918" width="400" height="400" rx="80" fill="#1a1a1a"/>
  <text x="621" y="1180" font-family="Arial, sans-serif" font-size="180" font-weight="bold" text-anchor="middle" fill="#ff4757">A</text>
  <text x="621" y="1400" font-family="Arial, sans-serif" font-size="48" font-weight="600" text-anchor="middle" fill="#fff">AniKai</text>
  <text x="621" y="1450" font-family="Arial, sans-serif" font-size="28" text-anchor="middle" fill="#666">Watch Anime Free</text>
</svg>`;

const faviconSvg = `<svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="8" fill="#0f0f0f"/>
  <text x="24" y="34" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#ff4757">A</text>
</svg>`;

const notificationSvg = `<svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="#ff4757"/>
  <text x="48" y="66" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#fff">A</text>
</svg>`;

async function convertSvgToPng(svgContent, outputPath, width, height) {
  await sharp(Buffer.from(svgContent))
    .resize(width, height)
    .png()
    .toFile(outputPath);
  console.log(`Created: ${outputPath}`);
}

async function main() {
  try {
    // Create icon.png (1024x1024)
    await convertSvgToPng(iconSvg, path.join(assetsDir, 'icon.png'), 1024, 1024);
    
    // Create adaptive-icon.png (108x108)
    await convertSvgToPng(adaptiveIconSvg, path.join(assetsDir, 'adaptive-icon.png'), 108, 108);
    
    // Create splash.png (1242x2436)
    await convertSvgToPng(splashSvg, path.join(assetsDir, 'splash.png'), 1242, 2436);
    
    // Create favicon.png (48x48)
    await convertSvgToPng(faviconSvg, path.join(assetsDir, 'favicon.png'), 48, 48);
    
    // Create notification-icon.png (96x96)
    await convertSvgToPng(notificationSvg, path.join(assetsDir, 'notification-icon.png'), 96, 96);
    
    console.log('All assets converted successfully!');
  } catch (error) {
    console.error('Error converting assets:', error);
    process.exit(1);
  }
}

main();
