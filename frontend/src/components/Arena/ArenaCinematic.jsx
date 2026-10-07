import React, { useEffect, useRef, useState } from 'react';
import './ArenaCinematic.css';

// Cảnh phim được tách thành chuỗi ảnh (xem backend/src/utils/extractVideoFrames.js) và vẽ lên canvas theo vị trí cuộn.
// Cuộn mượt cả hai chiều, kể cả điện thoại; thẻ <video> tua trực tiếp sẽ giật vì video chỉ có vài khung hình chính.
// Hai bộ ảnh: máy tính 96 khung rộng 1920px (nét), điện thoại 48 khung rộng 960px (nhẹ).
const SETS = {
  desktop: { dir: '/video/arena', count: 96 },
  mobile: { dir: '/video/arena-m', count: 48 }
};
const frameUrl = (set, i) => `${set.dir}/f${String(i).padStart(3, '0')}.webp`;

// [bắt đầu, kết thúc, nhãn, tiêu đề, mô tả] theo tiến độ cuộn 0..1
const SCENES = [
  [0.10, 0.34, 'Hồi 1', 'Sương sớm tan', 'Một bóng người bước lên bậc đá cổ'],
  [0.38, 0.62, 'Hồi 2', 'Giáp mặt', 'Hai cao thủ rút kiếm giữa màn sương'],
  [0.67, 0.97, 'Hồi 3', 'Long hổ tranh hùng', 'Hai long ấn thức tỉnh. Chọn lôi đài của bạn']
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function ArenaCinematic({ title, children }) {
  const rootRef = useRef(null);
  const zoneRef = useRef(null);
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [scene, setScene] = useState(-1);
  const [isStatic, setIsStatic] = useState(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Vẽ cảnh phim theo cuộn
  useEffect(() => {
    const root = rootRef.current, canvas = canvasRef.current, zone = zoneRef.current;
    const ctx = canvas.getContext('2d');
    const set = window.innerWidth < 900 ? SETS.mobile : SETS.desktop;
    const indices = Array.from({ length: set.count }, (_, i) => i);
    const imgs = new Array(indices.length).fill(null);
    let loaded = 0, shown = isStatic ? 1 : 0, target = isStatic ? 1 : 0, lastKey = '', raf = 0, mx = 0, my = 0, tmx = 0, tmy = 0, sceneNow = -1, alive = true;

    const resize = () => {
      // Vẽ đúng độ phân giải màn hình (kể cả Retina) để không bị CSS kéo giãn làm nhòe.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high'; // mặc định là 'low' nên ảnh bị mềm khi đổi cỡ
      lastKey = '';
    };

    const draw = (i, zoom, ox, oy) => {
      // khung chưa tải xong thì lấy khung gần nhất đã có
      let k = i;
      while (k >= 0 && !imgs[k]) k--;
      if (k < 0) { k = i; while (k < imgs.length && !imgs[k]) k++; }
      const img = imgs[k];
      if (!img) return;
      const cw = canvas.width, ch = canvas.height;
      // Phóng và dịch chuyển ngay trong canvas (thay vì transform CSS) nên không bị lấy mẫu lại, giữ nguyên độ nét.
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * zoom;
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) / 2 + ox * cw, (ch - h) / 2 + oy * ch, w, h);
    };

    const load = (n) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        imgs[n] = img; loaded++;
        if (n === 0 || loaded === 1) setReady(true);
        lastKey = '';
      };
      img.src = frameUrl(set, indices[n]);
    };
    load(0);
    // phần còn lại tải dần sau khung đầu để trang hiện nhanh
    let next = 1;
    const pump = () => { for (let k = 0; k < 6 && next < indices.length; k++) load(next++); if (next < indices.length) setTimeout(pump, 40); };
    setTimeout(pump, 60);

    const measure = () => {
      const vh = window.innerHeight;
      const scrolled = -root.getBoundingClientRect().top;
      const span = Math.max(1, zone.offsetHeight - vh * 1.05); // phim kết thúc ngay trước khi lôi đài hiện
      target = isStatic ? 1 : clamp(scrolled / span, 0, 1);
    };

    const tick = () => {
      if (!alive) return;
      shown += (target - shown) * 0.16;
      if (Math.abs(target - shown) < 0.0004) shown = target;
      mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
      root.style.setProperty('--p', shown.toFixed(4));
      root.style.setProperty('--mx', mx.toFixed(3));
      root.style.setProperty('--my', my.toFixed(3));
      const idx = Math.round(shown * (indices.length - 1));
      const zoom = 1.03 + shown * 0.09;                       // camera đẩy tới
      const ox = -mx * 0.008, oy = -my * 0.005;               // chuột dịch cảnh nhẹ để có chiều sâu
      const key = `${idx}|${Math.round(zoom * 400)}|${Math.round(ox * 4000)}|${Math.round(oy * 4000)}`;
      if (key !== lastKey) { lastKey = key; draw(idx, zoom, ox, oy); }
      const s = SCENES.findIndex(([a, b]) => shown >= a && shown < b);
      if (s !== sceneNow) { sceneNow = s; setScene(s); }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => { tmx = (e.clientX / window.innerWidth - 0.5) * 2; tmy = (e.clientY / window.innerHeight - 0.5) * 2; };
    resize(); measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', () => { resize(); measure(); });
    if (!isStatic && window.matchMedia('(pointer: fine)').matches) window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(raf); window.removeEventListener('scroll', measure); window.removeEventListener('mousemove', onMove); };
  }, [isStatic]);

  // Hiện lôi đài / bảng khi cuộn tới
  useEffect(() => {
    const els = contentRef.current ? contentRef.current.querySelectorAll('.arena-reveal') : [];
    if (isStatic || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return undefined; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });

  return (
    <div ref={rootRef} className={`arena-cine${isStatic ? ' is-static' : ''}`}>
      <div className="arena-cine__stage">
        <div className={`arena-cine__poster${ready ? ' is-ready' : ''}`} style={{ backgroundImage: `url(${frameUrl(typeof window !== 'undefined' && window.innerWidth < 900 ? SETS.mobile : SETS.desktop, 0)})` }} />
        <div className="arena-cine__rig">
          <canvas ref={canvasRef} className="arena-cine__canvas" role="img" aria-label="Cảnh phim đấu trường: hai cao thủ giao đấu dưới bóng hai rồng" />
          <div className="arena-cine__fog" />
        </div>
        <div className="arena-cine__vignette" />
        <div className="arena-cine__title">{title}</div>
        {SCENES.map(([, , kicker, head, sub], i) => (
          <div key={head} className={`arena-cine__scene${scene === i ? ' is-on' : ''}`}>
            <small>{kicker}</small><strong>{head}</strong><span>{sub}</span>
          </div>
        ))}
        <div className="arena-cine__hint"><i /> <span>Cuộn xuống để bước vào đấu trường</span></div>
        <div className="arena-cine__bar" />
      </div>
      <div ref={zoneRef} className="arena-cine__zone" aria-hidden="true" />
      <div ref={contentRef} className="arena-cine__content">{children}</div>
    </div>
  );
}
