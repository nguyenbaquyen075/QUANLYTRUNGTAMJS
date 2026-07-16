import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';

export default function PayInvoicePage() {
  const { id } = useParams();
  const { data, loading, error } = useFetchData(`/Parent/PayInvoice/${id}`);

  const invoice = data?.invoice || null;
  const qrCodeUrl = data?.QrCodeUrl || '';
  const bankName = data?.BankName || '';
  const bankAccount = data?.BankAccount || '';
  const accountHolder = data?.AccountHolder || '';

  return (
    <MainLayout hideHeader={false}>
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 select-none text-slate-800">
        
        {/* Back Link */}
        <div>
          <Link to="/Parent/Dashboard" className="inline-flex items-center gap-1 text-slate-400 hover:text-primary transition-all text-xs font-bold">
            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            Quay lại Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
          </div>
        ) : !invoice ? (
          <div className="text-center py-10 text-slate-500 font-semibold">
            Không tìm thấy thông tin hóa đơn cần đóng học phí.
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-amber-200/50 shadow-xl p-8 md:p-12 space-y-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xl mx-auto">
                <i className="fa-solid fa-file-invoice-dollar" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 font-serif">Thanh Toán Học Phí</h1>
              <p className="text-xs text-slate-400 font-semibold">Hóa đơn: <strong>{invoice.InvoiceCode}</strong></p>
            </div>

            <div className="grid md:grid-cols-12 gap-8 items-start">
              {/* Left Column: Info details */}
              <div className="md:col-span-7 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-700 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">info</span> Thông tin thanh toán
                  </h3>
                  <div className="space-y-2 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Học sinh:</span>
                      <strong className="text-slate-800">{invoice.Student?.FullName || 'Chưa rõ'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lớp học:</span>
                      <strong className="text-slate-800">{invoice.Class?.ClassName || 'Chưa rõ'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hạn thanh toán:</span>
                      <strong className="text-red-500">{new Date(invoice.DueDate).toLocaleDateString('vi-VN')}</strong>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-100">
                      <span className="text-slate-500 font-bold">Số tiền cần đóng:</span>
                      <strong className="text-primary text-base font-black">
                        {Number(invoice.Amount).toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-700 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">account_balance</span> Thông tin chuyển khoản
                  </h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs font-semibold space-y-3">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Ngân hàng</span>
                      <strong className="text-slate-800">{bankName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Số tài khoản</span>
                      <strong className="text-slate-800 text-sm font-black">{bankAccount}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Chủ tài khoản</span>
                      <strong className="text-slate-800">{accountHolder}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Nội dung chuyển khoản (Đúng cú pháp)</span>
                      <strong className="text-amber-700 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-lg mt-1 inline-block font-mono text-xs">
                        CKHP {invoice.InvoiceCode}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: QR Scan */}
              <div className="md:col-span-5 text-center flex flex-col items-center justify-center space-y-4">
                <h3 className="font-extrabold text-slate-700 text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span> Quét mã VietQR
                </h3>
                {qrCodeUrl ? (
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-inner">
                    <img src={qrCodeUrl} alt="Mã VietQR" className="w-48 h-48 object-contain" />
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">Mã QR chuyển khoản hiện chưa khả dụng.</p>
                )}
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed max-w-[240px]">
                  Hệ thống đối soát tự động 24/7. Hóa đơn sẽ được kích hoạt chuyển sang trạng thái <strong>Đã thanh toán</strong> ngay sau khi hệ thống nhận được tiền.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
