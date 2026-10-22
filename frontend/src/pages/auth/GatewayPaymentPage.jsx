import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../services/api';

const money = (n) => `${Number(n || 0).toLocaleString('vi-VN')} đ`;

function InfoRow({ label, value, strong }) {
  return (
    <div className="py-3 border-b border-[#E4EAF2] last:border-0">
      <div className="text-xs font-semibold text-[#60708A]">{label}</div>
      <div className={`break-all ${strong ? 'text-lg font-black text-[#1467E8]' : 'text-sm font-bold text-[#172B4D]'}`}>{value}</div>
    </div>
  );
}

// Hộp thông báo sau khi học viên bấm "Tôi đã chuyển khoản"
function ReportedDialog({ amount, memo, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="reported-title">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <span className="material-symbols-outlined text-[2.5rem]">check_circle</span>
        </div>
        <h2 id="reported-title" className="text-xl font-black text-[#172B4D] mt-4">Đã ghi nhận chuyển khoản</h2>
        <p className="text-sm text-[#60708A] mt-2">
          Trung tâm đang kiểm tra khoản <b className="text-[#172B4D]">{money(amount)}</b> với nội dung <b className="text-[#172B4D]">{memo}</b>.
          Bạn được xếp vào lớp ngay khi trung tâm xác nhận, trang này tự cập nhật.
        </p>
        <button type="button" onClick={onClose} autoFocus className="mt-6 w-full py-3 rounded-xl bg-[#1467E8] hover:bg-[#0B57D0] text-white font-bold">OK</button>
      </div>
    </div>
  );
}

export default function GatewayPaymentPage() {
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  const token = searchParams.get('token') || '';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [reported, setReported] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const closeDialog = useCallback(() => setShowDialog(false), []);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/Auth/GatewayPayment?invoiceId=${invoiceId}&token=${encodeURIComponent(token)}`);
      if (res.data?.success && res.data.type === 'render') setData(res.data.data);
      else setError('Không tìm thấy hóa đơn.');
    } catch (e) {
      setError('Không tải được hóa đơn. Hãy mở lại đúng đường dẫn thanh toán đã nhận, hoặc đăng nhập tài khoản học viên.');
    }
  }, [invoiceId, token]);

  useEffect(() => { load(); }, [load]);

  const invoice = data?.invoice;
  const bank = data?.bank;
  const paid = invoice?.Status === 1;

  // Chưa thanh toán: hỏi lại mỗi 8 giây để tự chuyển sang "đã vào lớp" khi admin xác nhận.
  useEffect(() => {
    if (!invoice || paid) return undefined;
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [invoice, paid, load]);

  const report = async () => {
    setReporting(true);
    setReportError('');
    try {
      await api.post('/Auth/ReportTransfer', { invoiceId: Number(invoiceId), token });
      setReported(true);
      setShowDialog(true);
    } catch (e) {
      setReportError(e.response?.data?.message || 'Không gửi được thông báo. Vui lòng thử lại.');
    } finally {
      setReporting(false);
    }
  };

  const course = invoice?.Class?.Course;
  const memo = invoice?.InvoiceCode || '';
  const qrUrl = bank?.configured && invoice
    ? `https://img.vietqr.io/image/${encodeURIComponent(bank.bankCode)}-${encodeURIComponent(bank.accountNumber)}-compact2.png?amount=${Math.round(invoice.Amount)}&addInfo=${encodeURIComponent(memo)}${bank.accountName ? `&accountName=${encodeURIComponent(bank.accountName)}` : ''}`
    : '';

  return (
    <MainLayout hideFooter hideChatbot>
      <div className="min-h-screen bg-[#F6F9FD] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {error && <div className="rounded-2xl bg-red-50 border border-red-100 text-red-700 px-5 py-4">{error} <Link to="/Auth/Login" className="font-bold underline">Đăng nhập</Link></div>}
          {!error && !invoice && <div className="text-center text-[#60708A] py-20">Đang tải hóa đơn…</div>}

          {invoice && paid && (
            <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#E4EAF2] shadow-sm p-10 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[2.25rem]">check_circle</span>
              </div>
              <h1 className="text-2xl font-black text-[#172B4D]">Đã nhận học phí, bạn đã vào lớp</h1>
              <p className="text-[#60708A] mt-2">{course?.Title} · {invoice.Class?.ClassName}</p>
              {invoice.Student?.Status === 0 ? (
                <Link to="/Student/Dashboard" className="inline-block mt-6 px-6 py-3 rounded-xl bg-[#1467E8] hover:bg-[#0B57D0] text-white font-bold">Vào lớp học</Link>
              ) : (
                <p className="mt-5 rounded-xl bg-[#EAF3FF] text-[#0B57D0] text-sm font-semibold p-4">
                  Trung tâm sẽ gửi tài khoản đăng nhập vào số điện thoại <b>{invoice.Student?.Phone}</b> trong thời gian sớm nhất. Bạn đã được xếp vào lớp.
                </p>
              )}
            </div>
          )}

          {invoice && !paid && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-black text-[#172B4D]">Thanh toán học phí bằng chuyển khoản</h1>
                <p className="text-sm text-[#60708A] mt-1">Bạn sẽ được xếp vào lớp ngay khi trung tâm xác nhận đã nhận tiền.</p>
              </div>

              <ol className="grid sm:grid-cols-3 gap-3 mb-6 text-sm">
                {['Chuyển khoản đúng số tiền và nội dung', 'Bấm “Tôi đã chuyển khoản”', 'Trung tâm xác nhận, bạn vào lớp'].map((t, i) => (
                  <li key={t} className="flex items-center gap-3 bg-white rounded-2xl border border-[#E4EAF2] px-4 py-3">
                    <span className="w-7 h-7 shrink-0 rounded-full bg-[#1467E8] text-white text-xs font-black flex items-center justify-center">{i + 1}</span>
                    <span className="font-semibold text-[#172B4D]">{t}</span>
                  </li>
                ))}
              </ol>

              <div className="grid lg:grid-cols-5 gap-6 items-start">
                <section className="lg:col-span-3 bg-white rounded-3xl border border-[#E4EAF2] shadow-sm p-6">
                  {bank?.configured ? (
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="flex flex-col items-center">
                        <img src={qrUrl} alt="Mã QR chuyển khoản" className="w-full max-w-[16.25rem] rounded-2xl border border-[#E4EAF2]" />
                        <p className="text-xs text-[#60708A] mt-2 text-center">Mở app ngân hàng, quét mã. Số tiền và nội dung đã điền sẵn.</p>
                      </div>
                      <div>
                        <InfoRow label="Ngân hàng" value={bank.bankCode} />
                        <InfoRow label="Số tài khoản" value={bank.accountNumber} />
                        {bank.accountName && <InfoRow label="Chủ tài khoản" value={bank.accountName} />}
                        <InfoRow label="Số tiền" value={money(invoice.Amount)} strong />
                        <InfoRow label="Nội dung chuyển khoản (bắt buộc)" value={memo} strong />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 p-5 text-sm">
                      Trung tâm chưa cập nhật tài khoản nhận tiền. Vui lòng liên hệ trung tâm để được hướng dẫn thanh toán, và báo mã hóa đơn <b>{memo}</b>.
                    </div>
                  )}
                </section>

                <aside className="lg:col-span-2 bg-white rounded-3xl border border-[#E4EAF2] shadow-sm p-6">
                  <h2 className="font-black text-[#172B4D] mb-3">Đơn đăng ký</h2>
                  <div className="text-sm space-y-1.5 text-[#172B4D]">
                    <div className="font-bold">{course?.Title}</div>
                    <div className="text-[#60708A]">Lớp: {invoice.Class?.ClassName}</div>
                    <div className="text-[#60708A]">Mã hóa đơn: {memo}</div>
                    {invoice.Student?.Status !== 0 && <div className="text-[#60708A]">Người đăng ký: {invoice.Student?.FullName} · {invoice.Student?.Phone}</div>}
                    <div className="text-[#60708A]">Hạn thanh toán: {new Date(invoice.DueDate).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div className="flex justify-between items-baseline border-t border-[#E4EAF2] mt-4 pt-4">
                    <span className="text-sm font-semibold text-[#60708A]">Tổng cần chuyển</span>
                    <span className="text-2xl font-black text-[#1467E8]">{money(invoice.Amount)}</span>
                  </div>

                  {reported ? (
                    <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm p-4 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[1.3rem] text-emerald-600">check_circle</span>
                      <span><b>Đã ghi nhận chuyển khoản.</b> Đang chờ trung tâm xác nhận, trang này tự cập nhật khi bạn được xếp lớp.</span>
                    </div>
                  ) : (
                    <button onClick={report} disabled={reporting || !bank?.configured} className="mt-5 w-full py-3 rounded-xl bg-[#1467E8] hover:bg-[#0B57D0] disabled:opacity-50 text-white font-bold">
                      {reporting ? 'Đang gửi…' : 'Tôi đã chuyển khoản'}
                    </button>
                  )}
                  {reportError && <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5" role="alert">{reportError}</p>}
                  {invoice.Student?.Status === 0 ? (
                    <Link to="/Student/Dashboard" className="block text-center text-sm font-semibold text-[#60708A] hover:text-[#1467E8] mt-3">Để sau, quay về trang cá nhân</Link>
                  ) : (
                    <p className="text-xs text-[#60708A] mt-3 text-center">Hãy lưu lại trang này (hoặc chụp màn hình mã hóa đơn) để xem lại trạng thái thanh toán.</p>
                  )}
                </aside>
              </div>
            </>
          )}
        </div>
      </div>
      {showDialog && invoice && <ReportedDialog amount={invoice.Amount} memo={memo} onClose={closeDialog} />}
    </MainLayout>
  );
}
