import React, { useMemo, useRef, useState } from 'react';

// Biểu đồ doanh thu vẽ bằng SVG thuần (không thêm thư viện). Một cột = một màu xanh (độ lớn), trạng thái dùng
// đúng bộ màu trạng thái kèm biểu tượng + chữ, mọi cột đều có tooltip và có bảng số liệu để đọc không cần màu.
const BLUE = '#1467E8';
const INK = '#172B4D';
const MUTED = '#60708A';
const GRID = '#E4EAF2';
const STATUS = {
  paid: { color: '#0ca30c', icon: 'check_circle', label: 'Đã thu' },
  pending: { color: '#fab219', icon: 'schedule', label: 'Chờ thanh toán' },
  overdue: { color: '#d03b3b', icon: 'error', label: 'Quá hạn' }
};
// Chưa có cổng thanh toán thật nên loại 2 (dữ liệu mẫu) gộp vào chuyển khoản, giống nhật ký giao dịch.
const METHODS = { 0: 'Chuyển khoản', 1: 'Tiền mặt', 2: 'Chuyển khoản' };

const full = (n) => `${Math.round(n).toLocaleString('vi-VN')} đ`;
const short = (n) => {
  if (n >= 1e9) return `${+(n / 1e9).toFixed(1)} tỷ`;
  if (n >= 1e6) return `${+(n / 1e6).toFixed(1)} tr`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
  return String(Math.round(n));
};
// Trục chia đẹp: lấy đỉnh làm tròn lên 1/2/5 × 10^k.
const niceMax = (v) => {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const f = v / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
};

function Card({ title, subtitle, children, className = '' }) {
  return (
    <section className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 ${className}`}>
      <h3 className="font-bold text-slate-900 text-base">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5 mb-3">{subtitle}</p>}
      {children}
    </section>
  );
}

function useTip() {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);
  const show = (e, text) => {
    const r = ref.current.getBoundingClientRect();
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top, text });
  };
  const hide = () => setTip(null);
  const node = tip && (
    <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full -mt-2 rounded-lg bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 whitespace-nowrap shadow-lg"
      style={{ left: tip.x, top: tip.y }}>{tip.text}</div>
  );
  return { ref, show, hide, node };
}

function MonthlyBars({ rows }) {
  const { ref, show, hide, node } = useTip();
  const W = 640, H = 250, L = 46, R = 8, T = 12, B = 30;
  const max = niceMax(Math.max(...rows.map((r) => r.value), 0));
  const bw = (W - L - R) / rows.length;
  const y = (v) => T + (H - T - B) * (1 - v / max);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  return (
    <div ref={ref} className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Doanh thu theo tháng">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
            <text x={L - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill={MUTED}>{short(t)}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const x = L + i * bw + bw * 0.2;
          const w = bw * 0.6;
          const h = Math.max(0, (H - T - B) * (r.value / max));
          return (
            <g key={r.key} onMouseMove={(e) => show(e, `${r.label}: ${full(r.value)} (${r.count} giao dịch)`)} onMouseLeave={hide}>
              <rect x={L + i * bw} y={T} width={bw} height={H - T - B} fill="transparent" />
              {h > 0 && <path d={`M${x},${y(0)} V${y(r.value) + 4} Q${x},${y(r.value)} ${x + 4},${y(r.value)} H${x + w - 4} Q${x + w},${y(r.value)} ${x + w},${y(r.value) + 4} V${y(0)} Z`} fill={BLUE} />}
              <text x={x + w / 2} y={H - 10} textAnchor="middle" fontSize="11" fill={MUTED}>{r.short}</text>
            </g>
          );
        })}
      </svg>
      {node}
    </div>
  );
}

function HBars({ rows, empty }) {
  const { ref, show, hide, node } = useTip();
  if (rows.length === 0) return <p className="text-sm text-slate-400 py-8 text-center">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div ref={ref} className="relative space-y-3">
      {rows.map((r) => (
        <div key={r.key} onMouseMove={(e) => show(e, `${r.label}: ${full(r.value)}${r.extra ? ` · ${r.extra}` : ''}`)} onMouseLeave={hide}>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-700 truncate pr-3">{r.label}</span>
            <span className="text-slate-500 shrink-0">{short(r.value)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-[#EAF3FF]">
            <div className="h-full rounded-full" style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, background: BLUE }} />
          </div>
        </div>
      ))}
      {node}
    </div>
  );
}

function Donut({ slices, centerValue, centerLabel }) {
  const { ref, show, hide, node } = useTip();
  const total = slices.reduce((s, x) => s + x.value, 0);
  const R = 70, C = 2 * Math.PI * R, GAP = 2;
  let acc = 0;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div ref={ref} className="relative w-44 h-44 shrink-0">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" role="img" aria-label="Tình trạng học phí">
          <circle cx="100" cy="100" r={R} fill="none" stroke={GRID} strokeWidth="26" />
          {total > 0 && slices.filter((s) => s.value > 0).map((s) => {
            const len = (s.value / total) * C;
            const el = (
              <circle key={s.key} cx="100" cy="100" r={R} fill="none" stroke={s.color} strokeWidth="26"
                strokeDasharray={`${Math.max(0, len - GAP)} ${C}`} strokeDashoffset={-acc}
                onMouseMove={(e) => show(e, `${s.label}: ${full(s.value)} (${s.count} hóa đơn)`)} onMouseLeave={hide} />
            );
            acc += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-black text-slate-900 leading-none">{centerValue}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">{centerLabel}</div>
        </div>
        {node}
      </div>
      <ul className="space-y-2.5 text-sm min-w-[200px] flex-1">
        {slices.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" style={{ color: s.color }}>{s.icon}</span>
            <span className="font-semibold text-slate-700 flex-1">{s.label}</span>
            <span className="text-slate-500 text-xs">{s.count} HĐ</span>
            <span className="font-bold text-slate-900 w-24 text-right">{short(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RevenueCharts({ invoices, payments, courses, classes }) {
  const [months, setMonths] = useState(12);

  const data = useMemo(() => {
    const now = new Date();
    const monthRows = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthRows.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`, short: `T${d.getMonth() + 1}`, value: 0, count: 0 });
    }
    const byKey = Object.fromEntries(monthRows.map((r) => [r.key, r]));
    const methodTotals = {};
    payments.forEach((p) => {
      const d = new Date(p.PaymentTime);
      const row = byKey[`${d.getFullYear()}-${d.getMonth()}`];
      if (row) { row.value += Number(p.Amount); row.count += 1; }
      methodTotals[p.PaymentMethod] = (methodTotals[p.PaymentMethod] || 0) + Number(p.Amount);
    });

    const courseOfClass = Object.fromEntries(classes.map((c) => [c.Id, c.CourseId]));
    const titleOfCourse = Object.fromEntries(courses.map((c) => [c.Id, c.Title]));
    const byCourse = {};
    const sum = { paid: [0, 0], pending: [0, 0], overdue: [0, 0] };
    invoices.forEach((inv) => {
      const amt = Number(inv.Amount) || 0;
      if (inv.Status === 1) {
        const cid = inv.Class?.CourseId ?? courseOfClass[inv.ClassId];
        byCourse[cid] = byCourse[cid] || { value: 0, count: 0 };
        byCourse[cid].value += amt; byCourse[cid].count += 1;
        sum.paid[0] += amt; sum.paid[1] += 1;
      } else if (inv.Status === 3) {
        // đã hủy: không tính
      } else if (inv.Status === 2 || new Date(inv.DueDate) < now) {
        sum.overdue[0] += amt; sum.overdue[1] += 1;
      } else {
        sum.pending[0] += amt; sum.pending[1] += 1;
      }
    });

    const topCourses = Object.entries(byCourse)
      .map(([cid, v]) => ({ key: cid, label: titleOfCourse[cid] || `Khóa #${cid}`, value: v.value, extra: `${v.count} học viên` }))
      .sort((a, b) => b.value - a.value).slice(0, 8);
    const methodByLabel = {};
    Object.entries(methodTotals).forEach(([m, v]) => {
      const label = METHODS[m] || 'Khác';
      methodByLabel[label] = (methodByLabel[label] || 0) + v;
    });
    const methods = Object.entries(methodByLabel)
      .map(([label, value]) => ({ key: label, label, value }))
      .sort((a, b) => b.value - a.value);
    const slices = ['paid', 'pending', 'overdue'].map((k) => ({ key: k, ...STATUS[k], value: sum[k][0], count: sum[k][1] }));
    const total = slices.reduce((s, x) => s + x.value, 0);
    return { monthRows, topCourses, methods, slices, paidPct: total ? Math.round((sum.paid[0] / total) * 100) : 0 };
  }, [invoices, payments, courses, classes, months]);

  const monthTotal = data.monthRows.reduce((s, r) => s + r.value, 0);

  return (
    <div className="space-y-5">
      <Card title="Doanh thu theo tháng" subtitle={`Tổng ${full(monthTotal)} trong ${months} tháng gần nhất (tính theo ngày nhận tiền)`}>
        <div className="flex justify-end -mt-8 mb-2">
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="text-xs font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700">
            <option value={6}>6 tháng</option>
            <option value={12}>12 tháng</option>
          </select>
        </div>
        <MonthlyBars rows={data.monthRows} />
        <details className="mt-3">
          <summary className="text-xs font-bold text-[#1467E8] cursor-pointer select-none">Xem bảng số liệu</summary>
          <table className="w-full text-xs mt-2">
            <thead><tr className="text-slate-500 text-left"><th className="py-1">Tháng</th><th>Số giao dịch</th><th className="text-right">Doanh thu</th></tr></thead>
            <tbody>{data.monthRows.map((r) => <tr key={r.key} className="border-t border-slate-100"><td className="py-1">{r.label}</td><td>{r.count}</td><td className="text-right font-semibold">{full(r.value)}</td></tr>)}</tbody>
          </table>
        </details>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Tình trạng học phí" subtitle="Theo số tiền trên hóa đơn (không tính hóa đơn đã hủy)">
          <Donut slices={data.slices} centerValue={`${data.paidPct}%`} centerLabel="đã thu" />
        </Card>
        <Card title="Doanh thu theo khóa học" subtitle="Top 8 khóa, tính trên hóa đơn đã thu">
          <HBars rows={data.topCourses} empty="Chưa có hóa đơn nào được thu." />
        </Card>
      </div>

      <Card title="Phương thức thanh toán" subtitle="Tổng tiền đã nhận theo từng hình thức">
        <HBars rows={data.methods} empty="Chưa có giao dịch nào." />
      </Card>
    </div>
  );
}
