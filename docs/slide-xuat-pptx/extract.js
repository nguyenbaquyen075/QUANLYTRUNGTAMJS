// Chạy trong trang xem trước: đo từng slide (khung 1280×720) và trả về danh sách hình, ảnh, chữ theo thứ tự vẽ.
(() => {
  const INLINE = new Set(['SPAN', 'B', 'EM', 'BR', 'STRONG', 'SMALL', 'I']);
  const rgba = (c) => {
    const m = c && c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = '1'] = m[1].split(/[ ,/]+/).filter(Boolean);
    const al = parseFloat(a);
    if (al === 0) return null;
    const hex = [r, g, b].map((v) => Math.round(+v).toString(16).padStart(2, '0')).join('').toUpperCase();
    return { hex, alpha: al };
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && el.getClientRects().length > 0;
  };

  const slides = [...document.querySelectorAll('.s')].map((s) => {
    const base = s.getBoundingClientRect();
    const box = (r) => ({ x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height });
    const out = [];

    const shape = (el) => {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' && !el.classList.contains('dashbox')) return;
      const r = box(el.getBoundingClientRect());
      if (r.w < 0.5 || r.h < 0.5) return;
      const fill = rgba(cs.backgroundColor);
      const sides = ['Top', 'Right', 'Bottom', 'Left'].map((sd) => ({
        sd, w: parseFloat(cs[`border${sd}Width`]) || 0, style: cs[`border${sd}Style`], color: rgba(cs[`border${sd}Color`]),
      })).map((b) => ({ ...b, on: b.w > 0 && b.style !== 'none' && b.color }));
      const radius = parseFloat(cs.borderTopLeftRadius) || 0;
      const allSame = sides.every((b) => b.on && b.w === sides[0].w && b.color.hex === sides[0].color.hex && b.style === sides[0].style);
      const chev = el.classList.contains('chev');
      if (!fill && !sides.some((b) => b.on)) return;
      const item = { t: 'shape', ...r, fill, radius, chev: chev ? (el.previousElementSibling ? 'chevron' : 'homePlate') : null };
      if (allSame) item.line = { hex: sides[0].color.hex, w: sides[0].w, dash: sides[0].style === 'dashed' };
      out.push(item);
      // Viền một cạnh (thanh nhấn trái, viền trên ô số liệu, gạch chân dòng): vẽ thành dải đặc
      if (!allSame) sides.filter((b) => b.on).forEach((b) => {
        const st = { t: 'shape', fill: b.color, radius: 0 };
        if (b.sd === 'Left') out.push({ ...st, x: r.x, y: r.y, w: b.w, h: r.h });
        if (b.sd === 'Right') out.push({ ...st, x: r.x + r.w - b.w, y: r.y, w: b.w, h: r.h });
        if (b.sd === 'Top') out.push({ ...st, x: r.x, y: r.y, w: r.w, h: b.w });
        if (b.sd === 'Bottom') out.push({ ...st, x: r.x, y: r.y + r.h - b.w, w: r.w, h: b.w });
      });
    };

    // Các giả phần tử có hình: chấm đầu dòng, đường nối các bước, ô chú thích, viền trong trang bìa
    const pseudo = (el) => {
      const r = box(el.getBoundingClientRect());
      const p = getComputedStyle(el, '::before');
      if (el.matches('ul.b li')) {
        out.push({ t: 'shape', x: r.x + 6, y: r.y + 8, w: 6, h: 6, fill: rgba(p.backgroundColor), radius: 3 });
      } else if (el.matches('.steps')) {
        out.push({ t: 'shape', x: r.x + 16, y: r.y + 20, w: 2, h: r.h - 80, fill: rgba(p.backgroundColor), radius: 0 });
      } else if (el.matches('.legend span')) {
        out.push({ t: 'shape', x: r.x, y: r.y + (r.h - 15) / 2 + 1, w: 15, h: 15, fill: rgba(p.backgroundColor), radius: 0 });
      } else if (el.matches('.cover .border')) {
        const a = getComputedStyle(el, '::after');
        out.push({ t: 'shape', x: r.x + 3 + 5, y: r.y + 3 + 5, w: r.w - 16, h: r.h - 16, fill: null, radius: 0, line: { hex: rgba(a.borderTopColor).hex, w: 1 } });
      }
    };

    const image = (img) => {
      const r = box(img.getBoundingClientRect());
      let { x, y, w, h } = r;
      if (getComputedStyle(img).objectFit === 'contain' && img.naturalWidth) {
        const k = Math.min(w / img.naturalWidth, h / img.naturalHeight);
        const dw = img.naturalWidth * k, dh = img.naturalHeight * k;
        x += (w - dw) / 2; y += (h - dh) / 2; w = dw; h = dh;
      }
      const src = img.getAttribute('src');
      out.push({ t: 'img', x, y, w, h, src: src.startsWith('data:') ? src : src.replace('/_blob/', '') });
    };

    const runStyle = (el) => {
      const cs = getComputedStyle(el);
      const ph = el.closest('.ph:not(.ok)');
      return {
        size: parseFloat(cs.fontSize), bold: +cs.fontWeight >= 600, italic: cs.fontStyle === 'italic',
        color: rgba(cs.color)?.hex || '000000', font: cs.fontFamily.split(',')[0].replace(/"/g, '').trim(),
        highlight: ph ? rgba(getComputedStyle(ph).backgroundColor)?.hex : null,
      };
    };
    const contentBox = (el) => {
      const cs = getComputedStyle(el);
      const r = box(el.getBoundingClientRect());
      const pl = parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), pr = parseFloat(cs.paddingRight) + parseFloat(cs.borderRightWidth);
      const pt = parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth), pb = parseFloat(cs.paddingBottom) + parseFloat(cs.borderBottomWidth);
      return { x: r.x + pl, y: r.y + pt, w: r.w - pl - pr, h: r.h - pt - pb };
    };
    const isBlock = (el) => !/^inline/.test(getComputedStyle(el).display) || getComputedStyle(el.parentElement).display.includes('flex');

    // Gom chữ của một khối thành các đoạn (đoạn mới khi gặp phần tử dạng khối, flex dọc hoặc <br>)
    const paragraphs = (root) => {
      const paras = [[]];
      const walk = (node) => {
        for (const c of node.childNodes) {
          if (c.nodeType === 3) {
            const txt = c.textContent.replace(/\s+/g, ' ');
            if (txt.trim() || paras.at(-1).length) paras.at(-1).push({ text: txt, ...runStyle(node) });
          } else if (c.nodeType === 1 && visible(c)) {
            if (c.tagName === 'BR') { paras.push([]); continue; }
            const blk = isBlock(c);
            if (blk && paras.at(-1).length) paras.push([]);
            walk(c);
            if (blk) paras.push([]);
          }
        }
      };
      walk(root);
      return paras.map((p) => {
        while (p.length && !p[0].text.trim()) p.shift();
        if (p.length) { p[0].text = p[0].text.replace(/^\s+/, ''); p.at(-1).text = p.at(-1).text.replace(/\s+$/, ''); }
        return p.filter((r) => r.text);
      }).filter((p) => p.length);
    };

    const text = (el) => {
      const cs = getComputedStyle(el);
      const flexRow = cs.display.includes('flex') && !cs.flexDirection.startsWith('column');
      // Khối flex ngang (chân trang, tiêu đề minh chứng, dòng mức hoàn thành): mỗi phần một khung chữ riêng
      if (flexRow && el.children.length) {
        for (const c of el.childNodes) {
          if (c.nodeType === 3 && c.textContent.trim()) {
            const rg = document.createRange(); rg.selectNodeContents(c);
            const rr = box(rg.getBoundingClientRect());
            out.push({ t: 'text', ...rr, w: rr.w + 4, align: 'left', valign: 'top', lh: parseFloat(cs.lineHeight) || null, paras: [[{ text: c.textContent.trim(), ...runStyle(el) }]] });
          } else if (c.nodeType === 1 && visible(c)) {
            if (!/^inline$/.test(getComputedStyle(c).display)) shape(c);
            text(c);
          }
        }
        return;
      }
      const paras = paragraphs(el);
      if (!paras.length) return;
      const cb = contentBox(el);
      // chữ chú thích đứng sau ô vuông 15px + 10px lề
      if (el.matches('.legend span')) { cb.x += 25; cb.w -= 25; }
      const center = (cs.display.includes('flex') && (cs.alignItems === 'center' || cs.justifyContent === 'center'));
      out.push({
        t: 'text', ...cb, paras,
        align: cs.textAlign === 'center' || (center && (cs.flexDirection.startsWith('column') ? cs.alignItems === 'center' : cs.justifyContent === 'center')) ? 'center' : cs.textAlign === 'right' ? 'right' : 'left',
        valign: center ? 'middle' : 'top',
        lh: parseFloat(cs.lineHeight) || null,
        gap: parseFloat(cs.rowGap) || 0,
      });
    };

    const visit = (el) => {
      if (!visible(el) || el.classList.contains('slot-ctl')) return;
      shape(el);
      pseudo(el);
      if (el.tagName === 'IMG') { image(el); return; }
      const kids = [...el.children];
      const allInline = [...el.querySelectorAll('*')].every((d) => INLINE.has(d.tagName));
      if (allInline && el.textContent.trim()) {
        // Hình bên trong khối chữ (vòng tròn số) vẽ trước chữ
        kids.forEach((k) => { if (!/^inline$/.test(getComputedStyle(k).display) && getComputedStyle(el).display.includes('flex') === false) shape(k); });
        el.querySelectorAll('*').forEach(pseudo);
        text(el);
        return;
      }
      kids.forEach(visit);
    };
    [...s.children].forEach(visit);
    return out;
  });
  return JSON.stringify(slides);
})();
