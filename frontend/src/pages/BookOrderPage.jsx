import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import api from '../services/api';

const money = (n) => `${Math.round(Number(n) || 0).toLocaleString('vi-VN')}đ`;
const STEPS = [['PENDING', 'Chờ chuyển khoản'], ['PAID', 'Đã nhận tiền'], ['SHIPPED', 'Đã gửi sách']];

function CopyRow({ label, value, strong }) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard.writeText(String(value)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[#E4EAF2] last:border-0">
      <div className="min-w-0">
        <div className="text-xs font-semibold text-[#60708A]">{label}</div>
        <div className={`break-all ${strong ? 'text-lg font-bold text-[#1467E8]' : 'text-sm font-semibold text-[#172B4D]'}`}>{value}</div>
      </div>
      <button type="button" onClick={copy} className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#EAF3FF] text-[#1467E8] hover:bg-[#D6E7FF]">{copied ? 'Đã chép' : 'Sao chép'}</button>
    </div>
  );
}

export default function BookOrderPage() {
  const { id } = useParams();
  const token = useSearchParams()[0].get('token') || '';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [reported, setReported] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { const r = await api.get(`/api/BookOrders/${id}`, { params: { token } }); setData(r.data); }
    catch (e) { setError('Không tìm thấy đơn hàng. Hãy mở lại đúng đường dẫn đã nhận sau khi đặt hàng.'); }
  }, [id, token]);
  useEffect(() => { load(); }, [load]);

  const order = data?.order, bank = data?.bank;
  const active = order && (order.status === 'PENDING' || order.status === 'PAID');
  useEffect(() => { if (!active) return undefined; const t = setInterval(load, 8000); return () => clearInterval(t); }, [active, load]);

  const report = async () => {
    setBusy(true);
    try { await api.post(`/api/BookOrders/${id}/ReportTransfer`, { token }); setReported(true); }
    catch (e) { alert(e.response?.data?.message || 'Không gửi được thông báo. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  };

  const qr = order && bank?.configured && order.status === 'PENDING'
    ? `https://img.vietqr.io/image/${encodeURIComponent(bank.bankCode)}-${encodeURIComponent(bank.accountNumber)}-compact2.png?amount=${Math.round(order.total)}&addInfo=${encodeURIComponent(order.code)}${bank.accountName ? `&accountName=${encodeURIComponent(bank.accountName)}` : ''}`
    : '';
  const stepIndex = order ? STEPS.findIndex(([k]) => k === order.status) : -1;

  return (
    <MainLayout hideChatbot>
      <div className="bg-[#F6F9FD] min-h-[70vh] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {error && <div className="rounded-2xl bg-red-50 border border-red-100 text-red-700 px-5 py-4">{error} <Link to="/Home/Books" className="font-semibold underline">Về trang sách</Link></div>}
          {!error && !order && <p className="text-center text-[#60708A] py-20">Đang tải đơn hàng…</p>}

          {order && (
            <>
              <h1 className="text-2xl font-bold text-[#172B4D]">Đơn sách {order.code}</h1>
              <p className="text-sm text-[#60708A] mt-1">Lưu lại trang này để theo dõi đơn. Trang tự cập nhật khi trung tâm xác nhận.</p>

              {order.status === 'CANCELLED' ? (
                <div className="mt-6 rounded-2xl bg-slate-100 text-slate-600 px-5 py-4">Đơn này đã bị hủy. <Link to="/Home/Books" className="font-semibold text-[#1467E8] underline">Chọn lại sách</Link></div>
              ) : (
                <ol className="grid sm:grid-cols-3 gap-3 mt-6">
                  {STEPS.map(([k, label], i) => (
                    <li key={k} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${i <= stepIndex ? 'bg-white border-[#1467E8]' : 'bg-white/60 border-[#E4EAF2] text-[#60708A]'}`}>
                      <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${i <= stepIndex ? 'bg-[#1467E8] text-white' : 'bg-slate-200 text-slate-500'}`}>{i < stepIndex ? '✓' : i + 1}</span>
                      <span className="font-semibold">{label}</span>
                    </li>
                  ))}
                </ol>
              )}

              <div className="grid lg:grid-cols-5 gap-6 items-start mt-6">
                <section className="lg:col-span-3 bg-white rounded-3xl border border-[#E4EAF2] shadow-sm p-6">
                  {order.status === 'PENDING' ? (
                    bank?.configured ? (
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="flex flex-col items-center">
                          <img src={qr} alt="Mã QR chuyển khoản" className="w-full max-w-[260px] rounded-2xl border border-[#E4EAF2]" />
                          <p className="text-xs text-[#60708A] mt-2 text-center">Mở app ngân hàng và quét mã. Số tiền và nội dung đã điền sẵn.</p>
                        </div>
                        <div>
                          <CopyRow label="Ngân hàng" value={bank.bankCode} />
                          <CopyRow label="Số tài khoản" value={bank.accountNumber} />
                          {bank.accountName && <CopyRow label="Chủ tài khoản" value={bank.accountName} />}
                          <CopyRow label="Số tiền" value={money(order.total)} strong />
                          <CopyRow label="Nội dung chuyển khoản (bắt buộc)" value={order.code} strong />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 p-5 text-sm">Trung tâm chưa cập nhật tài khoản nhận tiền. Vui lòng liên hệ trung tâm và báo mã đơn <b>{order.code}</b> để được hướng dẫn thanh toán.</div>
                    )
                  ) : (
                    <div className="text-center py-6">
                      <div className="mx-auto w-14 h-14 rounded-full bg-[#EAF3FF] text-[#1467E8] flex items-center justify-center mb-3"><span className="material-symbols-outlined text-[32px]">{order.status === 'SHIPPED' ? 'local_shipping' : 'check_circle'}</span></div>
                      <h2 className="text-xl font-bold text-[#172B4D]">{order.status === 'SHIPPED' ? 'Sách đã được gửi đi' : 'Trung tâm đã nhận tiền'}</h2>
                      <p className="text-sm text-[#60708A] mt-1">{order.status === 'SHIPPED' ? 'Vui lòng giữ điện thoại để nhận hàng.' : 'Sách sẽ được gói và gửi đến địa chỉ của bạn sớm nhất.'}</p>
                    </div>
                  )}
                  <div className="mt-6 pt-5 border-t border-[#E4EAF2] text-sm text-[#172B4D] space-y-1">
                    <div className="font-semibold">Giao đến</div>
                    <div>{order.buyerName} · {order.phone}</div>
                    <div className="text-[#60708A]">{order.address}</div>
                    {order.note && <div className="text-[#60708A]">Ghi chú: {order.note}</div>}
                  </div>
                </section>

                <aside className="lg:col-span-2 bg-white rounded-3xl border border-[#E4EAF2] shadow-sm p-6">
                  <h2 className="font-bold text-[#172B4D] mb-3">Sách đã đặt</h2>
                  <ul className="space-y-2 text-sm">
                    {order.items.map((i) => (
                      <li key={i.bookId} className="flex justify-between gap-3"><span className="text-[#172B4D]">{i.title} <span className="text-[#60708A]">× {i.quantity}</span></span><span className="font-semibold whitespace-nowrap">{money(i.unitPrice * i.quantity)}</span></li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-baseline border-t border-[#E4EAF2] mt-4 pt-4"><span className="text-sm font-semibold text-[#60708A]">Tổng cần chuyển</span><span className="text-2xl font-bold text-[#1467E8]">{money(order.total)}</span></div>
                  {order.status === 'PENDING' && (reported
                    ? <div className="mt-5 rounded-xl bg-[#EAF3FF] text-[#0B57D0] text-sm font-semibold p-4">Đã báo cho trung tâm. Khi nhận được tiền, trung tâm sẽ xác nhận và gửi sách.</div>
                    : <button onClick={report} disabled={busy || !bank?.configured} className="mt-5 w-full py-3 rounded-xl bg-[#1467E8] hover:bg-[#0B57D0] disabled:opacity-50 text-white font-semibold">{busy ? 'Đang gửi…' : 'Tôi đã chuyển khoản'}</button>)}
                  <Link to="/Home/Books" className="block text-center text-sm font-semibold text-[#60708A] hover:text-[#1467E8] mt-3">Tiếp tục xem sách</Link>
                </aside>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
