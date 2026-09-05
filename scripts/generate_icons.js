import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Use sharp to convert svg to png
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');

async function generateIcons() {
  const svgPath = path.join(publicDir, 'icon.svg');
  if (!fs.existsSync(svgPath)) {
    console.error('icon.svg not found!');
    return;
  }

  const svgBuffer = fs.readFileSync(svgPath);

  try {
    // Generate 192x192
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('Created icon-192.png');

    // Generate 512x512
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('Created icon-512.png');

    // Generate favicon.ico (using 32x32 png for simplicity, browsers support it as favicon.ico)
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('Created favicon.ico');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();