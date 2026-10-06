/**
 * Đổi màu xanh lá → xanh dương trong các ảnh đang được dùng (chỉ dải hue xanh lá, giữ nguyên
 * da người, vàng, nâu, đỏ). Chạy lại nhiều lần vẫn an toàn: ảnh đã xanh dương thì bị bỏ qua.
 * Dùng: node src/utils/recolorImages.js [--dry] [tên-file-không-đuôi ...]
 * Không truyền tên: tự quét các ảnh /images/... được tham chiếu trong frontend/src, css và backend/src.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '../../..');
const DIRS = [path.join(ROOT, 'frontend/public/images'), path.join(ROOT, 'backend/public/images'), path.join(ROOT, 'frontend/src/assets')];
const MIN_GREEN = 0.08; // ảnh có ít hơn 8% pixel xanh lá thì không đụng vào

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// Trả về hue mới, hoặc null nếu pixel không phải xanh lá.
function newHue(h, s, l) {
  if (s < 0.08 || l < 0.05 || l > 0.98 || h < 50 || h > 195) return null;
  const mapped = 205 + (Math.min(Math.max(h, 75), 190) - 75) * (31 / 115);
  return h < 75 ? h + (mapped - h) * ((h - 50) / 25) : mapped;
}

async function recolor(file, dry) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let hit = 0;
  const n = info.width * info.height;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    const M = Math.max(r, g, b), m = Math.min(r, g, b), l = (M + m) / 2, d = M - m;
    if (!d) continue;
    const s = d / (1 - Math.abs(2 * l - 1));
    let h = M === r ? ((g - b) / d) % 6 : M === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
    const nh = newHue(h, s, l);
    if (nh === null) continue;
    hit++;
    if (dry) continue;
    const [R, G, B] = hslToRgb(nh, s, l + (1 - l) * 0.1); // nâng sáng nhẹ cho hợp tông xanh edu
    data[i] = R; data[i + 1] = G; data[i + 2] = B;
  }
  const ratio = hit / n;
  if (dry || ratio < MIN_GREEN) return ratio;
  const img = sharp(data, { raw: info });
  const ext = path.extname(file).toLowerCase();
  const buf = ext === '.png' ? await img.png().toBuffer()
    : ext === '.webp' ? await img.webp({ quality: 82 }).toBuffer()
    : await img.removeAlpha().jpeg({ quality: 90 }).toBuffer();
  fs.writeFileSync(file, buf);
  return ratio;
}

function referencedNames() {
  const out = execSync(
    `grep -rhoE "/images/[A-Za-z0-9_.-]+\\.(png|jpe?g|webp)" frontend/src frontend/public/css frontend/index.html backend/src --exclude-dir=views || true`,
    { cwd: ROOT }).toString();
  return [...new Set(out.split('\n').filter(Boolean).map((s) => path.basename(s).replace(/\.\w+$/, '')))];
}

(async () => {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const names = args.filter((a) => a !== '--dry');
  const wanted = new Set(names.length ? names : referencedNames());
  for (const dir of DIRS) {
    for (const f of fs.readdirSync(dir)) {
      if (!/\.(png|jpe?g|webp)$/i.test(f) || !wanted.has(f.replace(/\.\w+$/, ''))) continue;
      try {
        const ratio = await recolor(path.join(dir, f), dry);
        if (ratio >= MIN_GREEN) console.log(`${dry ? 'would recolor' : 'recolored'} ${(ratio * 100).toFixed(0)}%  ${path.relative(ROOT, path.join(dir, f))}`);
      } catch (e) { console.error('skip', f, e.message); }
    }
  }
})();
