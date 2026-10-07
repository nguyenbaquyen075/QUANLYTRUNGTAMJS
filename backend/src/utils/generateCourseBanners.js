/**
 * Sinh 8 ảnh (4 khóa × slide khuyến mãi + slide lộ trình) bằng SVG + sharp.
 * Chữ tiếng Việt luôn đúng dấu, kích thước đúng khung trong docs/huong-dan-anh.md.
 * Chạy: node backend/src/utils/generateCourseBanners.js
 * Ảnh ra: frontend/public/images/{promo,roadmap}_<khóa>.jpg
 * Cần font có tiếng Việt trên máy chạy (Arial/Helvetica có sẵn trên macOS/Windows).
 */
const sharp = require('sharp');
const path = require('path');

const OUT = path.join(__dirname, '../../../frontend/public/images');
const C = { primary: '#1467E8', light: '#4A8DEE', pale: '#EAF3FF', bg: '#F6F9FD', text: '#172B4D', orange: '#FF9F1C' };
const FONT = "font-family=\"'Helvetica Neue', Arial, sans-serif\"";

const COURSES = [
  { key: 'co-ban', name: 'Khóa Cơ Bản', title: 'Nền tảng vững – lớp 10–12', lines: ['Học từ gốc, hiểu chắc', 'từng chương'], tag: 'Học từ gốc',
    steps: ['Nắm kiến thức', 'Làm bài tập', 'Kiểm tra cuối chương'], glyph: 'sprout' },
  { key: 'nang-cao', name: 'Khóa Nâng Cao', title: 'Bứt phá điểm 8+', lines: ['Chuyên sâu các dạng khó,', 'tư duy vận dụng cao'], tag: 'Chuyên sâu',
    steps: ['Chuyên đề khó', 'Vận dụng cao', 'Tổng hợp chương'], glyph: 'stairs' },
  { key: 'luyen-de', name: 'Khóa Luyện Đề', title: 'Chinh phục điểm cao', lines: ['Bộ đề bám sát cấu trúc thi,', 'chấm và chữa chi tiết'], tag: 'Đề sát cấu trúc',
    steps: ['Làm đề', 'Chấm & chữa', 'Rút kinh nghiệm'], glyph: 'paper' },
  { key: 'cap-toc', name: 'Khóa Cấp Tốc', title: 'Về đích sớm', lines: ['Tổng ôn trọng tâm trong', 'thời gian ngắn trước kỳ thi'], tag: 'Trọng tâm',
    steps: ['Trọng tâm', 'Đề nhanh', 'Chốt kiến thức'], glyph: 'bolt' },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, size, weight, fill, s, extra = '') =>
  `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${esc(s)}</text>`;

// Biểu tượng đơn giản của từng khóa, vẽ trong khung 400×400 gốc (0,0).
const GLYPHS = {
  sprout: `<rect x="190" y="200" width="20" height="180" rx="10"/><path d="M200 230 C120 230 90 170 100 110 C170 110 210 160 200 230Z"/><path d="M200 260 C280 260 320 200 310 140 C240 140 190 190 200 260Z"/>`,
  stairs: `<rect x="20" y="300" width="90" height="80"/><rect x="110" y="230" width="90" height="150"/><rect x="200" y="160" width="90" height="220"/><rect x="290" y="90" width="90" height="290"/><rect x="332" y="10" width="10" height="80"/><path d="M342 10 L392 30 L342 50Z"/>`,
  paper: `<rect x="80" y="20" width="240" height="340" rx="22"/><g fill="${C.primary}"><rect x="120" y="80" width="160" height="14" rx="7"/><rect x="120" y="130" width="160" height="14" rx="7"/><rect x="120" y="180" width="110" height="14" rx="7"/></g><path d="M130 270 L175 315 L270 235" fill="none" stroke="${C.orange}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>`,
  bolt: `<path d="M230 10 L70 220 H180 L150 390 L330 160 H215Z"/>`,
};
const glyph = (k, x, y, scale, fill) => `<g transform="translate(${x} ${y}) scale(${scale})" fill="${fill}">${GLYPHS[k]}</g>`;

function promo(c) {
  const W = 2600, H = 1040;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.primary}"/><stop offset="1" stop-color="${C.light}"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <circle cx="2250" cy="180" r="380" fill="#fff" opacity="0.08"/><circle cx="1500" cy="980" r="300" fill="#fff" opacity="0.07"/><circle cx="2500" cy="900" r="200" fill="#fff" opacity="0.08"/>
  <rect x="120" y="130" width="1250" height="800" rx="56" fill="#fff"/>
  ${text(200, 250, 46, 800, C.primary, 'LumiEdu')}
  ${text(200, 400, 120, 800, C.text, c.name)}
  ${text(200, 490, 58, 700, C.primary, c.title)}
  ${c.lines.map((l, i) => text(200, 585 + i * 58, 44, 500, '#60708A', l)).join('')}
  <rect x="200" y="740" width="420" height="104" rx="52" fill="${C.primary}"/>${text(410, 808, 44, 700, '#fff', 'Đăng ký ngay', 'text-anchor="middle"')}
  <circle cx="1950" cy="540" r="330" fill="#fff" opacity="0.16"/>
  ${glyph(c.glyph, 1750, 340, 1, '#fff')}
  <circle cx="2330" cy="300" r="120" fill="${C.orange}"/>${text(2330, 285, 40, 700, '#fff', 'GIẢM', 'text-anchor="middle"')}${text(2330, 345, 62, 800, '#fff', '20%', 'text-anchor="middle"')}
</svg>`;
}

function roadmap(c) {
  const W = 2600, H = 1080;
  const nodes = [[560, 800], [1300, 520], [2040, 300]];
  const card = ([x, y], i) => `<circle cx="${x}" cy="${y}" r="62" fill="${C.pale}" stroke="${C.primary}" stroke-width="12"/>${text(x, y + 22, 60, 800, C.primary, String(i + 1), 'text-anchor="middle"')}
  <rect x="${x - 230}" y="${y + 100}" width="460" height="110" rx="30" fill="#fff" stroke="#E4EAF2" stroke-width="3"/>${text(x, y + 168, 44, 700, C.text, c.steps[i], 'text-anchor="middle"')}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <circle cx="2350" cy="150" r="330" fill="${C.pale}"/>
  ${glyph(c.glyph, 2200, 40, 0.55, C.light)}
  ${text(120, 180, 96, 800, C.primary, c.name)}${text(120, 260, 52, 600, '#60708A', c.tag)}
  <path d="M0 960 C 400 960 300 800 ${nodes[0][0]} ${nodes[0][1]} S 1000 520 ${nodes[1][0]} ${nodes[1][1]} S 1700 300 ${nodes[2][0]} ${nodes[2][1]} S 2500 260 2600 200" fill="none" stroke="${C.light}" stroke-width="16" stroke-linecap="round" stroke-dasharray="2 34"/>
  ${nodes.map(card).join('')}
  ${text(1300, 1030, 40, 600, '#60708A', 'LumiEdu – Thắp sáng tri thức', 'text-anchor="middle"')}
</svg>`;
}

(async () => {
  for (const c of COURSES) {
    for (const [prefix, svg] of [['promo', promo(c)], ['roadmap', roadmap(c)]]) {
      const file = path.join(OUT, `${prefix}_${c.key}.jpg`);
      await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(file);
      console.log('wrote', path.relative(process.cwd(), file));
    }
  }
})();
