/**
 * Vẽ 3 banner 1920x800 cho slide đầu trang Sách (frontend/public/images/books-banner).
 *   node src/utils/bookBanners.js
 * Ghép bìa sách thật từ frontend/public/images/books; chữ vẽ bằng SVG nên sửa nội dung ở SLIDES rồi chạy lại.
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const IMG = path.join(__dirname, '../../../frontend/public/images');
const OUT = path.join(IMG, 'books-banner');
const F = "font-family=\"'Helvetica Neue', Arial, sans-serif\"";

const SLIDES = [
  { file: 'banner-1', tag: 'SÁCH CỦA TÔI', l1: 'Sách ôn thi', l2: 'do giáo viên biên soạn', sub: 'Bám sát đề thi THPT, có lời giải chi tiết', covers: ['toan-12-bo-de', 'ly-12-so-tay', 'hoa-12-ly-thuyet'], c: ['#1467E8', '#0B2A5E'] },
  { file: 'banner-2', tag: 'ƯU ĐÃI', l1: 'Giảm đến 24%', l2: 'cho sách mới xuất bản', sub: 'Mua combo Toán – Lý – Hóa tiết kiệm hơn mua lẻ', covers: ['combo-so-tay-3-mon', 'toan-hinh-khong-gian', 'anh-thpt-ngu-phap'], c: ['#0B57D0', '#071E4A'] },
  { file: 'banner-3', tag: 'ĐẶT HÀNG DỄ DÀNG', l1: 'Chuyển khoản – Nhận sách', l2: 'ngay tại nhà', sub: 'Đặt online không cần tài khoản, trung tâm gửi sách sau khi nhận tiền', covers: ['van-nghi-luan', 'toan-10-kiem-tra', 'toan-12-bo-de'], c: ['#1976F2', '#0A2C66'] }
];

async function cover(slug, w, angle) {
  const buf = await sharp(path.join(IMG, 'books', slug + '.webp')).resize(w).toBuffer();
  const h = Math.round(w * 4 / 3);
  const shadow = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="10" fill="#000"/></svg>`);
  const rounded = await sharp(buf).composite([{ input: Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="10"/></svg>`), blend: 'dest-in' }]).png().toBuffer();
  return sharp(rounded).rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const s of SLIDES) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="800">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${s.c[0]}"/><stop offset="1" stop-color="${s.c[1]}"/></linearGradient></defs>
  <rect width="1920" height="800" fill="url(#g)"/>
  <circle cx="1500" cy="120" r="420" fill="#fff" opacity=".07"/><circle cx="1750" cy="760" r="320" fill="#fff" opacity=".06"/><circle cx="120" cy="780" r="260" fill="#fff" opacity=".05"/>
  <rect x="150" y="180" width="${s.tag.length * 17 + 56}" height="46" rx="23" fill="#fff" opacity=".16"/>
  <text x="178" y="212" font-size="22" font-weight="700" letter-spacing="3" fill="#fff" ${F}>${s.tag}</text>
  <text x="150" y="340" font-size="92" font-weight="800" fill="#fff" ${F}>${s.l1}</text>
  <text x="150" y="440" font-size="64" font-weight="700" fill="#ffd86b" ${F}>${s.l2}</text>
  <text x="150" y="520" font-size="30" fill="#d6e7ff" ${F}>${s.sub}</text>
</svg>`;
    const [a, b, c] = await Promise.all([cover(s.covers[0], 300, -8), cover(s.covers[1], 340, 0), cover(s.covers[2], 300, 8)]);
    await sharp(Buffer.from(svg)).composite([
      { input: a, left: 880, top: 200 }, { input: c, left: 1560, top: 200 }, { input: b, left: 1230, top: 140 }
    ]).webp({ quality: 88 }).toFile(path.join(OUT, s.file + '.webp'));
  }
  console.log('Đã vẽ', SLIDES.length, 'banner vào', OUT);
})();
