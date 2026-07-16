import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import api from '../../services/api';

export default function GatewayPaymentPage() {
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  const navigate = useNavigate();

  const { data, loading, error } = useFetchData(`/Auth/GatewayPayment?invoiceId=${invoiceId}`);
  const [selectedGateway, setSelectedGateway] = useState('Momo');
  const [minutes, setMinutes] = useState(9);
  const [seconds, setSeconds] = useState(59);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const invoice = data?.invoice || null;
  const courseTitle = invoice?.Class?.Course?.Title || '';
  const amount = invoice?.Amount || 0;
  const paymentContent = invoice ? `CKHP ${invoice.InvoiceCode}` : '';
  const courseId = invoice?.Class?.CourseId || '';

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(timer);
        } else {
          setMinutes((m) => m - 1);
          setSeconds(59);
        }
      } else {
        setSeconds((s) => s - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [minutes, seconds]);

  const qrConfigs = {
    Momo: {
      color: 'a50064',
      logo: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.svg',
      label: 'Ví MoMo',
      data: `momo://pay?phone=0987654321&amount=${amount}&note=${paymentContent}`
    },
    VNPay: {
      color: '005baa',
      logo: 'https://images.vietnamnet.vn/files/2019/12/3/vnpay-1.jpg',
      label: 'VNPay QR',
      data: `vnpay://pay?amount=${amount}&note=${paymentContent}`
    },
    ZaloPay: {
      color: '007bee',
      logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png',
      label: 'ZaloPay',
      data: `zalopay://pay?amount=${amount}&note=${paymentContent}`
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setConfirming(true);
    try {
      const response = await api.post('/Auth/ConfirmGatewayPayment', {
        invoiceId,
        gateway: selectedGateway
      });
      if (response.data?.success && response.data?.type === 'redirect') {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Không thể xác nhận giao dịch. Vui lòng liên hệ hỗ trợ hoặc thử lại.');
    } finally {
      setConfirming(false);
    }
  };

  const currentConfig = qrConfigs[selectedGateway];
  const qrUrl = currentConfig
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=${currentConfig.color}&data=${encodeURIComponent(currentConfig.data)}`
    : '';

  return (
    <MainLayout>
      <style>{`
        .gateway-tab {
          flex: 1;
          text-align: center;
          padding: 1.25rem 1rem;
          border: 2px solid #E2E8F0;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #ffffff;
        }
        .gateway-tab:hover {
          border-color: #CBD5E1;
          transform: translateY(-2px);
        }
        .gateway-tab.active-momo {
          border-color: #A50064;
          background: #FFF0F6;
        }
        .gateway-tab.active-vnpay {
          border-color: #005BAA;
          background: #F0F7FF;
        }
        .gateway-tab.active-zalopay {
          border-color: #007BEE;
          background: #F0F9FF;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-slate-50 to-indigo-100 py-16 px-6 select-none">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
            </div>
          ) : error || !invoice ? (
            <div className="text-center py-20 text-slate-500 font-semibold">
              Không tìm thấy thông tin hóa đơn thanh toán hợp lệ.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Header */}
              <div className="p-8 md:p-10 bg-slate-50/50 text-center">
                <h1 className="text-2xl font-black text-slate-800 font-serif flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl">shield_with_heart</span> Cổng Thanh Toán Trực Tuyến
                </h1>
                <p className="text-xs text-slate-500 font-semibold mt-1">Đăng ký khóa học: <strong>{courseTitle}</strong></p>
              </div>

              <div className="p-8 md:p-12 space-y-10">
                {/* Step 1 */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-700 text-sm flex items-center gap-1.5">
                    <i className="fa-solid fa-wallet text-primary" /> Bước 1: Chọn ví điện tử hoặc cổng thanh toán
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {Object.keys(qrConfigs).map((key) => {
                      const isActive = selectedGateway === key;
                      return (
                        <div
                          key={key}
                          onClick={() => setSelectedGateway(key)}
                          className={`gateway-tab ${isActive ? `active-${key.toLowerCase()}` : ''}`}
                        >
                          <img
                            src={qrConfigs[key].logo}
                            alt={qrConfigs[key].label}
                            className="h-9 mx-auto object-contain mb-2"
                          />
                          <span className="text-xs font-bold text-slate-700 block">{qrConfigs[key].label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2 */}
                <div className="grid md:grid-cols-2 gap-8 items-center pt-4 border-t border-slate-100">
                  {/* Left Column: QR */}
                  <div className="flex flex-col items-center justify-center text-center space-y-4 md:border-r border-slate-100 pr-0 md:pr-8">
                    <div className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-3xl inline-block shadow-inner">
                      <img src={qrUrl} alt="QR Code Payment" className="w-48 h-48 object-contain" />
                    </div>
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 font-bold px-4 py-1.5 rounded-full text-xs">
                      <span className="material-symbols-outlined text-[16px]">alarm</span>
                      <span>
                        {minutes === 0 && seconds === 0
                          ? 'Hết hạn'
                          : `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">Mã QR sẽ hết hạn sau thời gian đếm ngược.</p>
                  </div>

                  {/* Right Column: Information */}
                  <div className="space-y-5">
                    <h3 className="font-extrabold text-slate-700 text-sm flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-info text-primary" /> Thông tin thanh toán chuyển khoản
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Đơn vị nhận</span>
                        <strong className="text-xs md:text-sm text-slate-800">TRUNG TAM HOC THEM ONLINE</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Số tiền học phí</span>
                        <strong className="text-xl font-black text-red-500">
                          {Number(amount).toLocaleString('vi-VN')} đ
                        </strong>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">
                          Nội dung thanh toán (Bắt buộc giữ nguyên)
                        </span>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                          <span className="text-xs font-mono font-bold text-slate-800 select-all">{paymentContent}</span>
                          <button
                            type="button"
                            onClick={handleCopy}
                            className={`ml-auto text-[10px] px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm ${
                              copied ? 'bg-emerald-600 text-white' : 'bg-primary text-white hover:bg-primary-hover'
                            }`}
                          >
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl text-[11px] text-amber-700 font-semibold leading-relaxed">
                        ⚠️ Vui lòng thực hiện chuyển khoản chính xác số tiền và nội dung để tài khoản được kích hoạt ngay lập tức.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100">
                  <Link
                    to={`/Auth/Checkout?courseId=${courseId}`}
                    className="text-xs font-bold text-slate-500 hover:text-primary transition-all flex items-center gap-1"
                  >
                    <i className="fa-solid fa-chevron-left" /> Thay đổi phương thức thanh toán
                  </Link>

                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-3.5 rounded-xl text-xs shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {confirming ? 'ĐANG XÁC THỰC...' : 'TÔI ĐÃ THANH TOÁN THÀNG CÔNG'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
