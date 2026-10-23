// Dựng .pptx từ slides.json (đo ở khung 1280×720 px; 96 px = 1 inch, cỡ chữ px × 0.75 = pt)
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

const [,, jsonPath, assetDir, outPath] = process.argv;
const slides = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const assets = Object.fromEntries(fs.readdirSync(assetDir).map((f) => [f.split('.')[0], path.join(assetDir, f)]));
const IN = (px) => +(px / 96).toFixed(4);
const PT = (px) => +(px * 0.75).toFixed(2);

const pres = new pptxgen();
pres.defineLayout({ name: 'HTML', width: 1280 / 96, height: 720 / 96 });
pres.layout = 'HTML';
pres.title = 'Báo cáo kết quả thực tập tốt nghiệp – LumiEdu';
pres.author = 'Nguyễn Bá Quyến';

slides.forEach((items) => {
  const slide = pres.addSlide();
  items.forEach((it, n) => {
    const pos = { x: IN(it.x), y: IN(it.y), w: IN(it.w), h: IN(it.h) };
    if (it.t === 'shape') {
      const fill = it.fill ? { color: it.fill.hex, transparency: Math.round((1 - it.fill.alpha) * 100) } : { type: 'none' };
      const line = it.line ? { color: it.line.hex, width: PT(it.line.w), dashType: it.line.dash ? 'dash' : 'solid' } : { type: 'none' };
      const r = Math.min(it.radius, Math.min(it.w, it.h) / 2);
      let type = pres.ShapeType.rect;
      const extra = {};
      if (it.chev) type = it.chev === 'chevron' ? pres.ShapeType.chevron : pres.ShapeType.homePlate;
      else if (r > 0 && r >= Math.min(it.w, it.h) / 2 - 0.5 && Math.abs(it.w - it.h) < 1) type = pres.ShapeType.ellipse;
      else if (r > 0) { type = pres.ShapeType.roundRect; extra.rectRadius = IN(r); }
      if (it.chev) extra.adjustments = undefined;
      slide.addShape(type, { ...pos, fill, line, ...extra, objectName: `shape-${n}` });
    } else if (it.t === 'img') {
      const src = it.src.startsWith('data:') ? { data: it.src.slice(5) } : { path: assets[it.src] };
      slide.addImage({ ...src, ...pos, objectName: `image-${n}` });
    } else if (it.t === 'text') {
      const runs = [];
      it.paras.forEach((para, pi) => {
        para.forEach((r, ri) => {
          const o = { fontFace: r.font === 'Georgia' ? 'Georgia' : 'Arial', fontSize: PT(r.size), bold: r.bold, italic: r.italic, color: r.color };
          if (r.highlight) o.highlight = r.highlight;
          if (ri === para.length - 1 && pi < it.paras.length - 1) o.breakLine = true;
          if (ri === 0 && pi > 0 && it.gap) o.paraSpaceBefore = PT(it.gap);
          runs.push({ text: r.text, options: o });
        });
      });
      const first = it.paras[0][0];
      const opts = {
        ...pos, margin: 0, align: it.align, valign: it.valign, isTextBox: true, wrap: true, fit: 'none',
        objectName: `text-${n}`,
      };
      if (it.lh) opts.lineSpacing = PT(it.lh);
      // khung chữ một dòng: nới chiều rộng một chút để PowerPoint không tự xuống dòng
      if (it.paras.length === 1 && it.h < first.size * 2) opts.w = IN(it.w + 6);
      slide.addText(runs, opts);
    }
  });
});

pres.writeFile({ fileName: outPath }).then((f) => console.log('wrote', f));
