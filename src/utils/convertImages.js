/**
 * Script nén ảnh PNG → WebP
 * Giữ nguyên file PNG gốc, chỉ tạo thêm file .webp
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, '../../public/images');

const imagesToConvert = [
  'courses-hero-bg.png',
  'blue-silk-hero.png',
  'hero-silk-bg.png',
  'courses-filter-bg.png',
  'blue-wave-hero.png',
  'logo.png'
];

async function convertToWebP() {
  console.log('🔄 Bắt đầu nén ảnh PNG → WebP...\n');
  
  for (const filename of imagesToConvert) {
    const inputPath = path.join(imagesDir, filename);
    const outputFilename = filename.replace('.png', '.webp');
    const outputPath = path.join(imagesDir, outputFilename);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Bỏ qua (không tìm thấy): ${filename}`);
      continue;
    }

    try {
      const inputStats = fs.statSync(inputPath);
      
      await sharp(inputPath)
        .webp({ quality: 82, effort: 6 }) // quality 82 — chất lượng tốt, nén cao
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
      const inputKB = (inputStats.size / 1024).toFixed(0);
      const outputKB = (outputStats.size / 1024).toFixed(0);

      console.log(`✅ ${filename}`);
      console.log(`   ${inputKB} KB → ${outputKB} KB (tiết kiệm ${savings}%)\n`);
    } catch (err) {
      console.error(`❌ Lỗi khi xử lý ${filename}:`, err.message);
    }
  }

  console.log('🎉 Hoàn thành nén ảnh!');
}

convertToWebP().catch(console.error);
