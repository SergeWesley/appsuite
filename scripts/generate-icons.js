const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];

async function generateIcons() {
  const svgPath = path.join(__dirname, '../public/icon.svg');
  const outputDir = path.join(__dirname, '../public');

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Icône ${size}x${size} générée: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la génération de l'icône ${size}x${size}:`, error);
    }
  }
}

generateIcons().catch(console.error); 