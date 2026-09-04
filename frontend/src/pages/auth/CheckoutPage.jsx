import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

const PROVINCES = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bắc Ninh',
  'Quảng Ninh',
  'Nghệ An',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Khánh Hòa',
  'Bình Dương',
  'Đồng Nai',
  'Tỉnh / Thành phố khác'
];

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, openCart } = useCart();

  const { data, loading, error } = useFetchData(`/Auth/Checkout?courseId=${courseId || (cartItems[0]?.Id || cartItems[0]?.id || 1)}`);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [province, setProvince] = useState('Hà Nội');
  const [address, setAddress] = useState('');
  const [sendDocuments, setSendDocuments] = useState(true);

  const [shippingMethod, setShippingMethod] = useState('standard'); // 'standard' | 'express'
  const [paymentMethod, setPaymentMethod] = useState('momo'); // 'momo' | 'zalopay' | 'atm' | 'qr'
  const [selectedClass, setSelectedClass] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const course = data?.course || (cartItems.length > 0 ? cartItems[0] : null);
  const classes = data?.classes || [];
  const classStudentCounts = data?.classStudentCounts || {};

  useEffect(() => {
    if (user) {
      if (!fullName && user.fullName) setFullName(user.fullName);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].Id);
    }
  }, [classes, selectedClass]);

  const rawPrice = course?.BasePrice || course?.Price || 780000;
  const shippingFee = shippingMethod === 'express' ? 30000 : 0;
  const totalAmount = Math.max(0, rawPrice + shippingFee - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (couponCode.trim().toUpperCase() === 'MAGIAM10' || couponCode.trim().toUpperCase() === 'ANHTE10') {
      const discount = Math.round(rawPrice * 0.1);
      setDiscountAmount(discount);
      setCouponApplied(true);
      alert(`🎉 Áp dụng mã giảm giá thành công! Giảm ${discount.toLocaleString('vi-VN')} đ`);
    } else {
      alert('⚠️ Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !phone || !email) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Email!');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/Auth/Checkout', {
        courseId: course?.Id || courseId,
        classId: selectedClass || (classes[0]?.Id || 1),
        paymentMethod,
        fullName,
        phone,
        email,
        province,
        address,
        shippingMethod,
        totalAmount
      });

      if (response.data?.success && response.data?.type === 'redirect') {
        window.location.href = response.data.url;
      } else {
        alert('🎉 Đăng ký khóa học thành công! Ban quản trị sẽ liên hệ để xác nhận.');
        navigate('/Student/Dashboard');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi tạo đơn đăng ký. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClassObj = classes.find((c) => c.Id === selectedClass) || classes[0];

  return (
    <MainLayout hideFooter={true} hideChatbot={true}>
      <div className="min-h-screen bg-[#fcfdfd] text-slate-800 py-8 sm:py-10 px-4 sm:px-6 lg:px-8 select-none font-sans">
        <div className="max-w-[1240px] mx-auto">
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Form Steps (7 Cols) */}
            <div className="lg:col-span-7 space-y-7">
              
              {/* STEP 1: THÔNG TIN GIAO HÀNG / HỌC VIÊN */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-[#065f46]">
                  <span className="material-symbols-outlined text-[24px]">local_shipping</span>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
                    1. Thông tin học viên / Giao giáo trình
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-[#065f46] focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0987 654 321"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-[#065f46] focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email nhận tài khoản <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nguyenvana@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-[#065f46] focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tỉnh / Thành phố <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-[#065f46] focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium appearance-none cursor-pointer"
                    >
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Địa chỉ nhận sách / giáo trình <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-[#065f46] focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={sendDocuments}
                    onChange={(e) => setSendDocuments(e.target.checked)}
                    className="w-4 h-4 rounded text-[#065f46] focus:ring-[#065f46] accent-[#065f46]"
                  />
                  <span>Giao giáo trình bản in và quà tặng học tập tận nhà miễn phí</span>
                </label>
              </div>

              {/* STEP 2: PHƯƠNG THỨC VẬN CHUYỂN / HỌC TẬP */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2.5 text-[#065f46]">
                  <span className="material-symbols-outlined text-[24px]">local_shipping</span>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
                    2. Phương thức giao giáo trình
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Option 1: Standard */}
                  <div
                    onClick={() => setShippingMethod('standard')}
                    className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                      shippingMethod === 'standard'
                        ? 'border-[#065f46] bg-emerald-50/40 ring-1 ring-[#065f46]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        shippingMethod === 'standard' ? 'border-[#065f46] bg-[#065f46]' : 'border-slate-300'
                      }`}>
                        {shippingMethod === 'standard' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Giao hàng tiêu chuẩn</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Nhận sách từ 2 - 4 ngày</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#065f46]">Miễn phí</span>
                  </div>

                  {/* Option 2: Express */}
                  <div
                    onClick={() => setShippingMethod('express')}
                    className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                      shippingMethod === 'express'
                        ? 'border-[#065f46] bg-emerald-50/40 ring-1 ring-[#065f46]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        shippingMethod === 'express' ? 'border-[#065f46] bg-[#065f46]' : 'border-slate-300'
                      }`}>
                        {shippingMethod === 'express' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Giao hỏa tốc 24h</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Nhận sách trong ngày</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-800">30.000đ</span>
                  </div>
                </div>
              </div>

              {/* STEP 3: PHƯƠNG THỨC THANH TOÁN */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2.5 text-[#065f46]">
                  <span className="material-symbols-outlined text-[24px]">credit_card</span>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
                    3. Phương thức thanh toán
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {/* Card 1: Ví MoMo */}
                  <div
                    onClick={() => setPaymentMethod('momo')}
                    className={`border rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-between text-center cursor-pointer transition-all bg-white min-h-[165px] ${
                      paymentMethod === 'momo'
                        ? 'border-[#065f46] ring-1 ring-[#065f46] bg-emerald-50/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Checkbox */}
                    <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 ${
                      paymentMethod === 'momo' ? 'border-[#065f46] bg-[#065f46] text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {paymentMethod === 'momo' && <span className="material-symbols-outlined text-[12px] font-black">check</span>}
                    </div>

                    {/* Big Center Logo & Title */}
                    <div className="my-1.5 flex flex-col items-center space-y-1.5">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#a50064] text-white flex items-center justify-center text-sm font-black shadow-md">
                        mo<br/>mo
                      </div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">Ví MoMo</h4>
                    </div>

                    {/* Bottom Label */}
                    <span className="text-[#a50064] font-black text-xs sm:text-sm tracking-tight">momo</span>
                  </div>

                  {/* Card 2: ZaloPay */}
                  <div
                    onClick={() => setPaymentMethod('zalopay')}
                    className={`border rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-between text-center cursor-pointer transition-all bg-white min-h-[165px] ${
                      paymentMethod === 'zalopay'
                        ? 'border-[#065f46] ring-1 ring-[#065f46] bg-emerald-50/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Checkbox */}
                    <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 ${
                      paymentMethod === 'zalopay' ? 'border-[#065f46] bg-[#065f46] text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {paymentMethod === 'zalopay' && <span className="material-symbols-outlined text-[12px] font-black">check</span>}
                    </div>

                    {/* Big Center Logo & Title */}
                    <div className="my-1.5 flex flex-col items-center space-y-1.5">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#0068ff] text-white flex items-center justify-center text-xs font-black shadow-md">
                        Zalo<br/>Pay
                      </div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">ZaloPay</h4>
                    </div>

                    {/* Bottom Label */}
                    <span className="text-[#00c853] font-black text-xs sm:text-sm tracking-tight">Zalo Pay</span>
                  </div>

                  {/* Card 3: Thẻ ATM */}
                  <div
                    onClick={() => setPaymentMethod('atm')}
                    className={`border rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-between text-center cursor-pointer transition-all bg-white min-h-[165px] ${
                      paymentMethod === 'atm'
                        ? 'border-[#065f46] ring-1 ring-[#065f46] bg-emerald-50/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Checkbox */}
                    <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 ${
                      paymentMethod === 'atm' ? 'border-[#065f46] bg-[#065f46] text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {paymentMethod === 'atm' && <span className="material-symbols-outlined text-[12px] font-black">check</span>}
                    </div>

                    {/* Big Center Logo & Title */}
                    <div className="my-1.5 flex flex-col items-center space-y-1.5">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                        <span className="material-symbols-outlined text-[30px]">credit_card</span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                        Thẻ ATM /<br/>Thẻ nội địa
                      </h4>
                    </div>

                    {/* Bottom Logos */}
                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-black tracking-wider text-slate-700">
                      <span className="text-emerald-700">napas</span>
                      <span className="text-blue-800">VISA</span>
                      <span className="text-red-600">MC</span>
                    </div>
                  </div>

                  {/* Card 4: COD */}
                  <div
                    onClick={() => setPaymentMethod('qr')}
                    className={`border rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-between text-center cursor-pointer transition-all bg-white min-h-[165px] ${
                      paymentMethod === 'qr'
                        ? 'border-[#065f46] ring-1 ring-[#065f46] bg-emerald-50/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Checkbox */}
                    <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 ${
                      paymentMethod === 'qr' ? 'border-[#065f46] bg-[#065f46] text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {paymentMethod === 'qr' && <span className="material-symbols-outlined text-[12px] font-black">check</span>}
                    </div>

                    {/* Big Center Logo & Title */}
                    <div className="my-1.5 flex flex-col items-center space-y-1.5">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 text-[#065f46] flex items-center justify-center shadow-md border border-emerald-200">
                        <span className="material-symbols-outlined text-[30px]">payments</span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                        Thanh toán khi<br/>nhận hàng (COD)
                      </h4>
                    </div>

                    {/* Bottom Label */}
                    <span className="text-[10px] text-slate-400 font-medium leading-tight line-clamp-1">
                      Tiền mặt khi nhận
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Back Button & Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={openCart}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#065f46] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Quay lại giỏ hàng</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-10 py-3.5 bg-[#065f46] hover:bg-[#047857] text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-950/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  {submitting ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  ) : null}
                  <span>ĐẶT HÀNG / XÁC NHẬN</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center sm:text-right font-medium">
                🔒 Bằng cách đặt hàng, bạn đồng ý với <Link to="/Home/Privacy" className="text-[#065f46] underline">Điều khoản sử dụng</Link> của Anh Tê Education
              </p>
            </div>

            {/* RIGHT COLUMN: Order Summary Card (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 space-y-6 shadow-xs">
              
              {/* Card Title */}
              <div className="flex items-center gap-2 text-[#065f46] border-b border-slate-100 pb-4">
                <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wide">
                  Đơn hàng của bạn
                </h3>
              </div>

              {/* Items List */}
              <div className="space-y-4 divide-y divide-slate-100">
                {course ? (
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={course.ImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200'}
                        alt={course.Title}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200/80"
                      />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
                          {course.Title}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Lớp: {selectedClassObj?.ClassName || 'Toán 10 - K1'} | Số lượng: 1
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black text-xs sm:text-sm text-slate-900">
                        {rawPrice.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs italic">
                    Chưa có khóa học nào được chọn.
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs sm:text-sm font-medium text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Tạm tính</span>
                  <span className="font-bold text-slate-900">{rawPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Phí vận chuyển giáo trình</span>
                  <span className="font-bold text-slate-900">{shippingFee > 0 ? `${shippingFee.toLocaleString('vi-VN')}đ` : 'Miễn phí'}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-rose-600 font-bold">
                    <span>Giảm giá ({couponCode.toUpperCase()})</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
              </div>

              {/* Total Row */}
              <div className="pt-4 border-t border-slate-200/80 flex justify-between items-baseline">
                <div>
                  <span className="text-base sm:text-lg font-black text-slate-900 uppercase">TỔNG CỘNG</span>
                  <span className="block text-[10px] text-slate-400 font-medium">(Đã bao gồm VAT & tài liệu học)</span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-[#065f46]">
                  {totalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>

              {/* Discount Code Input Box */}
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Nhập mã giảm giá (vd: MAGIAM10)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#065f46] focus:bg-white font-medium uppercase"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-[#065f46] hover:text-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>

              {/* 3 Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
                <div className="space-y-1">
                  <span className="material-symbols-outlined text-[#065f46] text-[24px]">verified</span>
                  <p className="text-[10px] font-bold text-slate-700 leading-tight">Khóa học & sách chuẩn 100%</p>
                </div>
                <div className="space-y-1">
                  <span className="material-symbols-outlined text-[#065f46] text-[24px]">sync_alt</span>
                  <p className="text-[10px] font-bold text-slate-700 leading-tight">Đổi lớp dễ dàng trong 7 ngày</p>
                </div>
                <div className="space-y-1">
                  <span className="material-symbols-outlined text-[#065f46] text-[24px]">lock</span>
                  <p className="text-[10px] font-bold text-slate-700 leading-tight">Thanh toán bảo mật</p>
                </div>
              </div>

            </div>

          </form>

        </div>
      </div>
    </MainLayout>
  );
}
