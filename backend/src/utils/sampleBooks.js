/**
 * Sách mẫu cho máy local (bìa vẽ bằng mã, đúng màu LumiEdu) để trang bán sách không trống khi phát triển.
 *   node src/utils/sampleBooks.js            tạo bìa + thêm sách mẫu nếu bảng Books đang trống
 *   node src/utils/sampleBooks.js --covers   chỉ vẽ lại ảnh bìa (frontend/public/images/books)
 * Không tự chạy ở production (server.js chỉ gọi ensureSampleBooks khi NODE_ENV !== 'production'): trên Render
 * admin tự thêm sách thật, để khách không thấy sản phẩm giả có giá.
 */
const path = require('path');
const sharp = require('sharp');

const OUT = path.join(__dirname, '../../../frontend/public/images/books');
const THEMES = { 'Toán học': ['#1467E8', '#0B2A5E'], 'Vật lý': ['#4a3aa7', '#1c1458'], 'Hóa học': ['#12906a', '#064a38'], 'Tiếng Anh': ['#d9582a', '#6b2410'], 'Ngữ văn': ['#c2527f', '#5e1b3a'], 'Combo': ['#c88f2a', '#5a3a08'] };

const BOOKS = [
  { slug: 'toan-12-bo-de', title: 'Bộ 30 đề thi thử Toán THPT 2026', sub: 'Có lời giải chi tiết', author: 'Tổ Toán LumiEdu', subject: 'Toán học', grade: 'Lớp 12', price: 189000, original: 250000, badge: 'Bán chạy', desc: '30 đề thi thử bám sát cấu trúc đề của Bộ GD&ĐT, kèm ma trận kiến thức và lời giải từng bước cho cả trắc nghiệm lẫn tự luận.' },
  { slug: 'toan-hinh-khong-gian', title: 'Chuyên đề Hình học không gian 11–12', sub: 'Từ nền tảng đến vận dụng cao', author: 'Tổ Toán LumiEdu', subject: 'Toán học', grade: 'Lớp 11-12', price: 149000, original: 195000, badge: null, desc: 'Hệ thống dạng bài hình học không gian, phương pháp dựng hình và tính khoảng cách, góc, thể tích kèm 300 bài tập phân loại.' },
  { slug: 'ly-12-so-tay', title: 'Sổ tay công thức Vật lý 12', sub: 'Sơ đồ tư duy + 500 bài mẫu', author: 'Tổ Vật lý LumiEdu', subject: 'Vật lý', grade: 'Lớp 12', price: 129000, original: 170000, badge: 'Mới', desc: 'Toàn bộ công thức Vật lý 12 trình bày bằng sơ đồ tư duy, mỗi chuyên đề có bài mẫu và mẹo xử lý nhanh.' },
  { slug: 'hoa-12-ly-thuyet', title: 'Hóa học 12: Hệ thống lý thuyết và bài tập', sub: 'Hữu cơ – Vô cơ trọng tâm', author: 'Tổ Hóa LumiEdu', subject: 'Hóa học', grade: 'Lớp 12', price: 139000, original: 180000, badge: null, desc: 'Tóm tắt lý thuyết trọng tâm, phản ứng thường gặp và bài tập theo mức độ nhận biết đến vận dụng cao.' },
  { slug: 'anh-thpt-ngu-phap', title: 'Cẩm nang ngữ pháp và từ vựng Tiếng Anh THPT', sub: 'Ôn thi tốt nghiệp', author: 'Tổ Tiếng Anh LumiEdu', subject: 'Tiếng Anh', grade: 'THPT', price: 169000, original: 220000, badge: 'Bán chạy', desc: 'Ngữ pháp trọng tâm, 2.000 từ vựng theo chủ đề và các dạng bài đọc hiểu, điền từ thường gặp trong đề thi.' },
  { slug: 'van-nghi-luan', title: 'Nghị luận văn học: kỹ năng và bài mẫu', sub: 'Lập dàn ý – Viết mở bài – Kết bài', author: 'Tổ Ngữ văn LumiEdu', subject: 'Ngữ văn', grade: 'Lớp 11-12', price: 119000, original: 155000, badge: null, desc: 'Quy trình làm bài nghị luận văn học, 40 bài văn mẫu có nhận xét và hướng dẫn chấm điểm.' },
  { slug: 'toan-10-kiem-tra', title: 'Bộ đề kiểm tra định kỳ Toán 10', sub: 'Giữa kỳ & cuối kỳ', author: 'Tổ Toán LumiEdu', subject: 'Toán học', grade: 'Lớp 10', price: 99000, original: null, badge: null, desc: '20 đề kiểm tra giữa kỳ và cuối kỳ Toán 10, có đáp án và thang điểm.' },
  { slug: 'combo-so-tay-3-mon', title: 'Combo sổ tay công thức Toán – Lý – Hóa', sub: 'Tiết kiệm hơn mua lẻ', author: 'Tổ chuyên môn LumiEdu', subject: 'Combo', grade: 'THPT', price: 299000, original: 399000, badge: 'Combo', desc: 'Trọn bộ ba cuốn sổ tay công thức Toán, Vật lý, Hóa học dành cho học sinh THPT.' }
];

// Bẻ tên sách thành các dòng ngắn để vẽ lên bìa
const wrap = (text, max) => text.split(' ').reduce((lines, w) => { const last = lines[lines.length - 1]; if (last && (last + ' ' + w).length <= max) lines[lines.length - 1] = `${last} ${w}`; else lines.push(w); return lines; }, []);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function coverSvg(b) {
  const [c1, c2] = THEMES[b.subject] || THEMES['Toán học'];
  const lines = wrap(b.title.toUpperCase(), 17).slice(0, 5);
  const text = lines.map((l, i) => `<text x="300" y="${330 + i * 54}" font-size="44" font-weight="700" fill="#fff" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif">${esc(l)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <rect width="600" height="800" fill="url(#g)"/>
  <circle cx="520" cy="90" r="190" fill="#fff" opacity=".08"/><circle cx="60" cy="760" r="230" fill="#fff" opacity=".07"/>
  <rect x="0" y="0" width="26" height="800" fill="#000" opacity=".18"/>
  <rect x="64" y="70" width="190" height="42" rx="21" fill="#fff" opacity=".16"/>
  <text x="159" y="99" font-size="22" font-weight="700" fill="#fff" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif">${esc(b.subject.toUpperCase())}</text>
  <text x="300" y="${330 - 70}" font-size="24" font-weight="600" fill="#ffe9a8" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" letter-spacing="3">${esc((b.grade || '').toUpperCase())}</text>
  ${text}
  <rect x="190" y="${340 + lines.length * 54}" width="220" height="4" rx="2" fill="#f6d77e"/>
  <text x="300" y="${390 + lines.length * 54}" font-size="26" fill="#e6eefc" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif">${esc(b.sub || '')}</text>
  <text x="300" y="735" font-size="30" font-weight="700" fill="#fff" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" letter-spacing="2">LumiEdu</text>
</svg>`;
}

async function drawCovers() {
  const fs = require('fs');
  fs.mkdirSync(OUT, { recursive: true });
  for (const b of BOOKS) await sharp(Buffer.from(coverSvg(b))).webp({ quality: 90 }).toFile(path.join(OUT, `${b.slug}.webp`));
}

async function ensureSampleBooks(db) {
  if (await db.Book.count()) return 0;
  await drawCovers();
  await db.Book.bulkCreate(BOOKS.map((b, i) => ({
    Title: b.title, Author: b.author, Subject: b.subject, Grade: b.grade, Price: b.price, OriginalPrice: b.original, Description: b.desc,
    CoverUrl: `/images/books/${b.slug}.webp`, Badge: b.badge, InStock: true, IsActive: true, SortOrder: i
  })));
  return BOOKS.length;
}

module.exports = { ensureSampleBooks, drawCovers, BOOKS };

if (require.main === module) {
  (async () => {
    if (process.argv.includes('--covers')) { await drawCovers(); console.log('Đã vẽ', BOOKS.length, 'ảnh bìa vào', OUT); process.exit(0); }
    if (process.env.DATABASE_URL) { console.error('Từ chối: đang trỏ tới cơ sở dữ liệu thật (DATABASE_URL).'); process.exit(1); }
    const db = require('../models');
    await db.sequelize.sync();
    console.log('Đã thêm', await ensureSampleBooks(db), 'sách mẫu');
    process.exit(0);
  })().catch((e) => { console.error(e); process.exit(1); });
}
