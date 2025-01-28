const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [16, 48, 128];

async function generateIcons() {
  const svgBuffer = await fs.readFile(path.join(__dirname, '../public/icon.svg'));
  
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `../public/icon${size}.png`));
    
    console.log(`Generated icon${size}.png`);
  }
}

generateIcons().catch(console.error); 