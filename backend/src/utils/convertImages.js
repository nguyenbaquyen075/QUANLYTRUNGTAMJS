/**
 * Tạo bản .webp (tối đa 1920px) cho mọi PNG/JPG dưới public/ của backend và
 * frontend. Giữ nguyên file gốc; app tự phục vụ .webp thay cho file gốc
 * (xem webpNegotiation trong app.js). Chạy: node src/utils/convertImages.js
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const roots = [
  path.join(__dirname, '../../public'),
  path.join(__dirname, '../../../frontend/public')
];

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'lib') yield* walk(p); }
    else if (/\.(jpe?g|png)$/i.test(e.name)) yield p;
  }
}

(async () => {
  let before = 0, after = 0;
  for (const root of roots) for (const src of walk(root)) {
    const out = src.replace(/\.(jpe?g|png)$/i, '.webp');
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) continue;
    try {
      await sharp(src).rotate().resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 78, effort: 5 }).toFile(out);
      before += fs.statSync(src).size; after += fs.statSync(out).size;
    } catch (err) { console.error('skip', src, err.message); }
  }
  console.log(`${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB`);
})();
