import React, { useMemo, useRef, useState } from 'react';

// Trang Doanh thu: bộ lọc ngày, 4 chỉ số so với kỳ trước, biểu đồ theo thời gian, top khóa học, cơ cấu theo môn, đơn hàng gần đây.
// Vẽ bằng SVG thuần. Màu môn học lấy từ bộ màu phân loại đã chạy validate_palette (cố định theo môn, không theo thứ hạng);
// mọi lát/cột đều có nhãn chữ + tooltip + bảng số liệu nên không dựa vào màu một mình.
const BLUE = '#1467E8';
const INK = '#172B4D';
const MUTED = '#60708A';
const GRID = '#E4EAF2';
const SUBJECTS = [
  ['TOAN', 'Toán', '#2a78d6'], ['ANH', 'Tiếng Anh', '#eb6834'], ['VAN', 'Ngữ Văn', '#e87ba4'], ['LY', 'Vật Lý', '#4a3aa7'],
  ['HOA', 'Hóa Học', '#1baf7a'], ['SINH', 'Sinh Học', '#eda100'], ['SU', 'Lịch Sử', '#008300'], ['DIA', 'Địa Lý', '#e34948']
];
const OTHER = ['Khác', '#9aa3b2'];
const STATUS = {
  paid: ['Thành công', 'bg-[#E7F7EC] text-[#0F8A3B]'],
  pending: ['Chờ thanh toán', 'bg-amber-50 text-amber-700'],
  overdue: ['Quá hạn', 'bg-red-50 text-red-600'],
  cancelled: ['Đã hủy', 'bg-slate-100 text-slate-500']
};
const DAY = 86400000;

const vnd = (n) => `${Math.round(n).toLocaleString('vi-VN')}đ`;
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dmy = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const startOf = (s) => new Date(`${s}T00:00:00`);
const endOf = (s) => new Date(`${s}T23:59:59.999`);
const niceMax = (v) => {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const f = v / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
};
const subjectOf = (code) => {
  const key = String(code || '').replace(/\d.*$/, '').toUpperCase();
  const i = SUBJECTS.findIndex((s) => s[0] === key);
  return i >= 0 ? { key, name: SUBJECTS[i][1], color: SUBJECTS[i][2], order: i } : { key: 'OTHER', name: OTHER[0], color: OTHER[1], order: 99 };
};

function presetRange(preset) {
  const today = new Date();
  const to = ymd(today);
  if (preset === '7') return { from: ymd(new Date(today.getTime() - 6 * DAY)), to };
  if (preset === 'month') return { from: ymd(new Date(today.getFullYear(), today.getMonth(), 1)), to };
  if (preset === 'quarter') return { from: ymd(new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)), to };
  return { from: ymd(new Date(today.getTime() - 29 * DAY)), to };
}

function useTip() {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);
  const show = (e, content) => {
    const r = ref.current.getBoundingClientRect();
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top, content });
  };
  const hide = () => setTip(null);
  const node = tip && (
    <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full -mt-3 rounded-xl bg-white border border-slate-200 shadow-lg px-3 py-2 text-xs whitespace-nowrap" style={{ left: tip.x, top: tip.y }}>
      {tip.content}
    </div>
  );
  return { ref, show, hide, node };
}

function Card({ title, right, children, className = '' }) {
  return (
    <section className={`bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(20,60,120,0.06)] p-6 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-black text-lg text-[#172B4D]">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

const Select = ({ value, onChange, children }) => (
  <select value={value} onChange={onChange} className="text-sm font-semibold text-[#172B4D] border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#1467E8]/30">{children}</select>
);

function Delta({ cur, prev, label }) {
  let node;
  if (prev > 0) {
    const pct = ((cur - prev) / prev) * 100;
    const up = pct >= 0;
    node = <span className={`font-bold ${up ? 'text-[#0F8A3B]' : 'text-red-600'}`}>{up ? '↑' : '↓'} {Math.abs(pct).toFixed(pct % 1 === 0 ? 0 : 1)}%</span>;
  } else {
    node = <span className="font-bold text-slate-500">{cur > 0 ? '↑ Mới' : '—'}</span>;
  }
  return <div className="text-sm mt-2 flex items-center gap-1.5">{node}<span className="text-[#60708A]">{label}</span></div>;
}

function TimeBars({ rows, metric }) {
  const { ref, show, hide, node } = useTip();
  const [hover, setHover] = useState(-1);
  const W = 780, H = 290, L = 92, R = 10, T = 14, B = 34;
  const max = niceMax(Math.max(...rows.map((r) => r[metric]), 0));
  const bw = (W - L - R) / rows.length;
  const y = (v) => T + (H - T - B) * (1 - v / max);
  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => t * max);
  const every = Math.ceil(rows.length / 11);
  const fmt = (v) => (metric === 'revenue' ? Math.round(v).toLocaleString('vi-VN') : String(Math.round(v)));
  return (
    <div ref={ref} className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Doanh thu theo thời gian">
        <defs>
          <linearGradient id="barLight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9CC2FB" /><stop offset="1" stopColor="#D6E7FF" /></linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={GRID} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={MUTED}>{fmt(t)}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const x = L + i * bw + bw * 0.15;
          const w = bw * 0.7;
          const h = (H - T - B) * (r[metric] / max);
          const active = hover === i;
          return (
            <g key={r.key} onMouseMove={(e) => { setHover(i); show(e, (
              <><div className="text-[#60708A] mb-1">{r.full}</div><div className="font-bold text-[#172B4D]"><span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: BLUE }} />{metric === 'revenue' ? `Doanh thu: ${vnd(r.revenue)}` : `Số đơn hàng: ${r.orders}`}</div></>
            )); }} onMouseLeave={() => { setHover(-1); hide(); }}>
              <rect x={L + i * bw} y={T} width={bw} height={H - T - B} fill="transparent" />
              {h > 0 && <rect x={x} y={y(r[metric])} width={w} height={h} rx="3" fill={active ? BLUE : 'url(#barLight)'} />}
              {i % every === 0 && <text x={x + w / 2} y={H - 12} textAnchor="middle" fontSize="11" fill={MUTED}>{r.label}</text>}
            </g>
          );
        })}
      </svg>
      {node}
    </div>
  );
}

function SubjectDonut({ slices, total }) {
  const { ref, show, hide, node } = useTip();
  const R = 78, C = 2 * Math.PI * R, GAP = 2;
  let acc = 0;
  return (
    <div className="flex flex-wrap items-center gap-8">
      <div ref={ref} className="relative w-56 h-56 shrink-0">
        <svg viewBox="0 0 220 220" className="w-full h-full -rotate-90" role="img" aria-label="Cơ cấu doanh thu theo môn học">
          <circle cx="110" cy="110" r={R} fill="none" stroke={GRID} strokeWidth="30" />
          {total > 0 && slices.map((s) => {
            const len = (s.value / total) * C;
            const el = <circle key={s.key} cx="110" cy="110" r={R} fill="none" stroke={s.color} strokeWidth="30" strokeDasharray={`${Math.max(0, len - GAP)} ${C}`} strokeDashoffset={-acc}
              onMouseMove={(e) => show(e, <><div className="font-bold text-[#172B4D]">{s.name}</div><div className="text-[#60708A]">{vnd(s.value)} · {((s.value / total) * 100).toFixed(1)}%</div></>)} onMouseLeave={hide} />;
            acc += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-8">
          <div className="text-lg font-black text-[#172B4D] leading-tight">{vnd(total)}</div>
          <div className="text-xs text-[#60708A] mt-1">Tổng doanh thu</div>
        </div>
        {node}
      </div>
      <ul className="flex-1 min-w-[260px] space-y-3 text-sm">
        {slices.length === 0 && <li className="text-slate-400">Chưa có doanh thu trong kỳ này.</li>}
        {slices.map((s) => (
          <li key={s.key} className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="font-semibold text-[#172B4D] flex-1">{s.name}</span>
            <span className="text-[#60708A] w-14 text-right">{((s.value / total) * 100).toFixed(1)}%</span>
            <span className="font-bold text-[#172B4D] w-28 text-right">{vnd(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Thumb({ src }) {
  const [bad, setBad] = useState(!src);
  return bad
    ? <div className="w-11 h-11 rounded-lg bg-[#EAF3FF] text-[#1467E8] flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-[22px]">menu_book</span></div>
    : <img src={src} alt="" onError={() => setBad(true)} className="w-11 h-11 rounded-lg object-cover shrink-0" />;
}

const KPIS = [
  { key: 'revenue', label: 'Tổng doanh thu', icon: 'payments', tint: 'from-[#EAF3FF] to-white', iconCls: 'bg-[#1467E8] text-white', money: true },
  { key: 'orders', label: 'Số đơn hàng', icon: 'shopping_cart', tint: 'from-rose-50 to-white', iconCls: 'bg-rose-100 text-rose-500' },
  { key: 'students', label: 'Số học viên mới', icon: 'group', tint: 'from-[#E9F8EF] to-white', iconCls: 'bg-[#D4F1DE] text-[#0F8A3B]' },
  { key: 'sold', label: 'Số khóa học đã bán', icon: 'menu_book', tint: 'from-amber-50 to-white', iconCls: 'bg-amber-100 text-amber-600' }
];

export default function RevenueDashboard({ invoices, payments, courses, classes, onViewAll }) {
  const [preset, setPreset] = useState('30');
  const [range, setRange] = useState(() => presetRange('30'));
  const [metric, setMetric] = useState('revenue');
  const [topN, setTopN] = useState(5);
  const [q, setQ] = useState('');

  const applyPreset = (p) => { setPreset(p); setRange(presetRange(p)); };
  const setDate = (k) => (e) => { setPreset('custom'); setRange((r) => ({ ...r, [k]: e.target.value })); };

  const d = useMemo(() => {
    const start = startOf(range.from), end = endOf(range.to);
    const valid = !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start <= end;
    const len = valid ? end - start + 1 : DAY;
    const prevStart = new Date(start.getTime() - len), prevEnd = new Date(start.getTime() - 1);
    const inRange = (t, a, b) => { const x = new Date(t); return x >= a && x <= b; };

    const courseById = Object.fromEntries(courses.map((c) => [c.Id, c]));
    const courseOfPayment = (p) => courseById[p.Invoice?.Class?.CourseId ?? p.Invoice?.Class?.Course?.Id];
    const firstPay = {};
    payments.forEach((p) => { const sid = p.Invoice?.StudentId ?? p.Invoice?.Student?.Id; const t = new Date(p.PaymentTime).getTime(); if (sid != null && (firstPay[sid] === undefined || t < firstPay[sid])) firstPay[sid] = t; });

    const stats = (a, b) => {
      const ps = payments.filter((p) => inRange(p.PaymentTime, a, b));
      const students = new Set(ps.map((p) => p.Invoice?.StudentId ?? p.Invoice?.Student?.Id).filter((id) => id != null && firstPay[id] >= a.getTime() && firstPay[id] <= b.getTime()));
      return {
        revenue: ps.reduce((s, p) => s + Number(p.Amount), 0),
        sold: ps.length,
        orders: invoices.filter((i) => i.Status !== 3 && inRange(i.CreatedAt, a, b)).length,
        students: students.size
      };
    };
    const cur = valid ? stats(start, end) : { revenue: 0, sold: 0, orders: 0, students: 0 };
    const prev = valid ? stats(prevStart, prevEnd) : { revenue: 0, sold: 0, orders: 0, students: 0 };

    // Chuỗi thời gian: theo ngày (≤ 62 ngày) hoặc theo tháng.
    const days = valid ? Math.round(len / DAY) : 0;
    const monthly = days > 62;
    const rows = [];
    if (valid) {
      if (monthly) {
        for (let m = new Date(start.getFullYear(), start.getMonth(), 1); m <= end; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) {
          rows.push({ key: `${m.getFullYear()}-${m.getMonth()}`, label: `T${m.getMonth() + 1}/${String(m.getFullYear()).slice(2)}`, full: `Tháng ${m.getMonth() + 1}/${m.getFullYear()}`, revenue: 0, orders: 0 });
        }
      } else {
        for (let t = new Date(start); t <= end; t = new Date(t.getTime() + DAY)) {
          rows.push({ key: ymd(t), label: `${pad(t.getDate())}/${pad(t.getMonth() + 1)}`, full: dmy(t), revenue: 0, orders: 0 });
        }
      }
      const byKey = Object.fromEntries(rows.map((r) => [r.key, r]));
      payments.forEach((p) => {
        const t = new Date(p.PaymentTime);
        if (t < start || t > end) return;
        const row = byKey[monthly ? `${t.getFullYear()}-${t.getMonth()}` : ymd(t)];
        if (row) { row.revenue += Number(p.Amount); row.orders += 1; }
      });
    }

    // Theo khóa học / theo môn (chỉ tính tiền đã thu trong kỳ).
    const perCourse = {}, perSubject = {};
    payments.filter((p) => valid && inRange(p.PaymentTime, start, end)).forEach((p) => {
      const c = courseOfPayment(p);
      const id = c ? c.Id : `x${p.Invoice?.ClassId}`;
      perCourse[id] = perCourse[id] || { id, title: c?.Title || p.Invoice?.Class?.Course?.Title || 'Khóa học khác', image: c?.ImageUrl, value: 0 };
      perCourse[id].value += Number(p.Amount);
      const sj = subjectOf(c?.CourseCode);
      perSubject[sj.key] = perSubject[sj.key] || { ...sj, value: 0 };
      perSubject[sj.key].value += Number(p.Amount);
    });
    const courseRows = Object.values(perCourse).sort((a, b) => b.value - a.value);
    const slices = Object.values(perSubject).sort((a, b) => a.order - b.order);

    // Danh sách đơn của kỳ (mới nhất trước) và các dòng để xuất báo cáo.
    const orders = invoices.filter((i) => valid && inRange(i.CreatedAt, start, end))
      .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
    const paidRows = payments.filter((p) => valid && inRange(p.PaymentTime, start, end));
    return { valid, cur, prev, rows, monthly, courseRows, slices, total: cur.revenue, orders, paidRows };
  }, [range, invoices, payments, courses, classes]);

  const needle = q.trim().toLowerCase();
  const matchOrder = (i) => !needle || [i.InvoiceCode, i.Student?.FullName, i.Student?.Phone, i.Class?.Course?.Title, i.Class?.ClassName].some((v) => String(v || '').toLowerCase().includes(needle));
  const shownOrders = d.orders.filter(matchOrder).slice(0, 5);
  const shownCourses = d.courseRows.filter((c) => !needle || c.title.toLowerCase().includes(needle)).slice(0, topN);
  const maxCourse = Math.max(...shownCourses.map((c) => c.value), 1);
  const compareLabel = preset === '7' ? 'so với 7 ngày trước' : preset === '30' ? 'so với 30 ngày trước' : 'so với kỳ trước';

  const statusOf = (i) => (i.Status === 1 ? 'paid' : i.Status === 3 ? 'cancelled' : (i.Status === 2 || new Date(i.DueDate) < new Date()) ? 'overdue' : 'pending');

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['Thời gian nhận tiền', 'Mã hóa đơn', 'Học viên', 'Số điện thoại', 'Khóa học', 'Lớp', 'Số tiền (đ)', 'Hình thức'];
    const lines = d.paidRows.map((p) => [
      new Date(p.PaymentTime).toLocaleString('vi-VN'), p.Invoice?.InvoiceCode, p.Invoice?.Student?.FullName, p.Invoice?.Student?.Phone,
      p.Invoice?.Class?.Course?.Title, p.Invoice?.Class?.ClassName, Math.round(Number(p.Amount)), p.PaymentMethod === 1 ? 'Tiền mặt' : 'Chuyển khoản'
    ].map(esc).join(','));
    lines.push(['', '', '', '', '', 'Tổng', Math.round(d.total), ''].map(esc).join(','));
    const blob = new Blob([`﻿${[head.map(esc).join(','), ...lines].join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `doanh-thu_${range.from}_${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const PRESETS = [['7', '7 ngày'], ['30', '30 ngày'], ['month', 'Tháng này'], ['quarter', 'Quý này']];

  return (
    <div className="space-y-6">
      <div className="relative max-w-xl">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm học viên, khóa học, đơn hàng..." className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1467E8]/30 focus:border-[#1467E8]" />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#172B4D] leading-tight">Doanh thu</h2>
          <p className="text-[#60708A] mt-1">Theo dõi doanh thu bán khóa học và tình hình kinh doanh của LumiEdu</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-[#172B4D]">
            <span className="material-symbols-outlined text-[18px] text-slate-500">calendar_month</span>
            <input type="date" value={range.from} max={range.to} onChange={setDate('from')} className="bg-transparent focus:outline-none" aria-label="Từ ngày" />
            <span className="text-slate-400">–</span>
            <input type="date" value={range.to} min={range.from} onChange={setDate('to')} className="bg-transparent focus:outline-none" aria-label="Đến ngày" />
          </div>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-sm font-semibold">
            {PRESETS.map(([k, label]) => (
              <button key={k} onClick={() => applyPreset(k)} className={`px-3.5 py-1.5 rounded-lg transition ${preset === k ? 'bg-[#1467E8] text-white shadow' : 'text-[#172B4D] hover:bg-[#EAF3FF]'}`}>{label}</button>
            ))}
          </div>
          <button onClick={exportCsv} disabled={!d.valid} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1467E8] hover:bg-[#0B57D0] disabled:opacity-50 text-white text-sm font-bold">
            <span className="material-symbols-outlined text-[18px]">download</span> Xuất báo cáo
          </button>
        </div>
      </div>
      {!d.valid && <div className="rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-sm px-4 py-3">Khoảng ngày không hợp lệ: "Từ ngày" phải trước hoặc bằng "Đến ngày".</div>}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {KPIS.map((k) => (
          <div key={k.key} className={`rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(20,60,120,0.06)] p-5 bg-gradient-to-br ${k.tint}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${k.iconCls}`}><span className="material-symbols-outlined text-[26px]">{k.icon}</span></div>
              <div className="text-sm font-semibold text-[#172B4D]">{k.label}</div>
            </div>
            <div className="text-3xl font-black text-[#172B4D] mt-3">{k.money ? vnd(d.cur[k.key]) : d.cur[k.key].toLocaleString('vi-VN')}</div>
            <Delta cur={d.cur[k.key]} prev={d.prev[k.key]} label={compareLabel} />
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-12 gap-6">
        <Card className="xl:col-span-8" title="Doanh thu theo thời gian" right={
          <Select value={metric} onChange={(e) => setMetric(e.target.value)}>
            <option value="revenue">Doanh thu</option>
            <option value="orders">Số đơn hàng</option>
          </Select>}>
          {d.valid ? <TimeBars rows={d.rows} metric={metric} /> : <p className="text-sm text-slate-400 py-10 text-center">Chọn khoảng ngày hợp lệ.</p>}
          <details className="mt-2">
            <summary className="text-xs font-bold text-[#1467E8] cursor-pointer select-none">Xem bảng số liệu</summary>
            <div className="max-h-56 overflow-y-auto mt-2">
              <table className="w-full text-xs">
                <thead><tr className="text-slate-500 text-left"><th className="py-1">{d.monthly ? 'Tháng' : 'Ngày'}</th><th>Số đơn</th><th className="text-right">Doanh thu</th></tr></thead>
                <tbody>{d.rows.map((r) => <tr key={r.key} className="border-t border-slate-100"><td className="py-1">{r.full}</td><td>{r.orders}</td><td className="text-right font-semibold">{vnd(r.revenue)}</td></tr>)}</tbody>
              </table>
            </div>
          </details>
        </Card>

        <Card className="xl:col-span-4" title="Doanh thu theo khóa học" right={
          <Select value={topN} onChange={(e) => setTopN(Number(e.target.value))}>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
          </Select>}>
          {shownCourses.length === 0 ? <p className="text-sm text-slate-400 py-10 text-center">Chưa có doanh thu trong kỳ này.</p> : (
            <ol className="space-y-4">
              {shownCourses.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-slate-100 text-[#172B4D] text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                  <Thumb src={c.image} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#172B4D] leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={c.title}>{c.title}</div>
                    <div className="h-2 rounded-full bg-[#EAF3FF] mt-2"><div className="h-full rounded-full" style={{ width: `${Math.max(3, (c.value / maxCourse) * 100)}%`, background: BLUE }} /></div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-[#172B4D]">{vnd(c.value)}</div>
                    <div className="text-xs text-[#60708A]">{d.total ? ((c.value / d.total) * 100).toFixed(1) : 0}%</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <Card className="min-[1700px]:col-span-5 col-span-12" title="Cơ cấu doanh thu theo môn học">
          <SubjectDonut slices={d.slices} total={d.total} />
        </Card>

        <Card className="min-[1700px]:col-span-7 col-span-12" title="Đơn hàng gần đây" right={<button onClick={onViewAll} className="text-sm font-bold text-[#1467E8] hover:underline">Xem tất cả</button>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F6F9FD] text-[#172B4D] text-left text-xs font-bold">
                  <th className="px-3 py-2.5 rounded-l-lg">Thời gian</th><th className="px-3">Mã đơn</th><th className="px-3">Học viên</th><th className="px-3">Khóa học</th><th className="px-3 text-right">Số tiền</th><th className="px-3 rounded-r-lg">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {shownOrders.map((i) => {
                  const [label, cls] = STATUS[statusOf(i)];
                  const t = new Date(i.CreatedAt);
                  return (
                    <tr key={i.Id} className="border-b border-slate-100 last:border-0 text-[#172B4D]">
                      <td className="px-3 py-3 whitespace-nowrap">{pad(t.getDate())}/{pad(t.getMonth() + 1)} {pad(t.getHours())}:{pad(t.getMinutes())}</td>
                      <td className="px-3 whitespace-nowrap font-semibold text-[#1467E8]">{i.InvoiceCode}</td>
                      <td className="px-3 whitespace-nowrap">{i.Student?.FullName}</td>
                      <td className="px-3 max-w-[260px] truncate" title={i.Class?.Course?.Title}>{i.Class?.Course?.Title || i.Class?.ClassName}</td>
                      <td className="px-3 text-right font-semibold whitespace-nowrap">{vnd(i.Amount)}</td>
                      <td className="px-3"><span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${cls}`}>{label}</span></td>
                    </tr>
                  );
                })}
                {shownOrders.length === 0 && <tr><td colSpan="6" className="py-10 text-center text-slate-400">Không có đơn hàng nào trong kỳ này.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
