import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import api from '../../services/api';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const navigate = useNavigate();

  const { data, loading, error } = useFetchData(`/Auth/Checkout?courseId=${courseId}`);
  const [selectedClass, setSelectedClass] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('vnpay'); // 'vnpay' or 'momo'
  const [submitting, setSubmitting] = useState(false);

  const course = data?.course || null;
  const classes = data?.classes || [];
  const classStudentCounts = data?.classStudentCounts || {};

  useEffect(() => {
    if (classes.length > 0) {
      setSelectedClass(classes[0].Id);
    }
  }, [classes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      alert('Vui lòng chọn một lớp học!');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/Auth/Checkout', {
        courseId,
        classId: selectedClass,
        paymentMethod
      });
      // The api interceptor will automatically redirect if the backend sends a redirect JSON action,
      // otherwise we handle standard responses here.
      if (response.data?.success && response.data?.type === 'redirect') {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi trong quá trình xử lý đăng ký học.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-slate-50 to-indigo-100 py-16 px-6 select-none">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-blue-100 shadow-2xl p-8 md:p-12">
          {loading ? (
            <div className="flex justify-center py-10">
              <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
            </div>
          ) : error || !course ? (
            <div className="text-center py-10 text-slate-500 font-semibold">
              Không thể tải thông tin thanh toán khóa học. Vui lòng thử lại.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="border-b border-slate-100 pb-6 text-center">
                <h1 className="text-2xl font-black text-slate-800 font-serif">Đăng Ký Học & Thanh Toán</h1>
                <p className="text-xs text-slate-400 mt-1 font-semibold">Chỉ một bước đơn giản để bắt đầu lộ trình học tập của bạn.</p>
              </div>

              {/* Course Info Summary */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                <img
                  src={course.ImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=128'}
                  alt={course.Title}
                  className="w-24 h-24 rounded-xl object-cover shrink-0 border border-slate-200"
                />
                <div className="text-center md:text-left">
                  <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    {course.CourseCode}
                  </span>
                  <h2 className="text-lg font-black text-slate-800 mt-2 font-serif">{course.Title}</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Số buổi: {course.TotalLessons} buổi</p>
                </div>
              </div>

              {/* Class Selection */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-700 text-sm flex items-center gap-1.5">
                  <i className="fa-solid fa-chalkboard" /> Chọn Lớp Học Đang Mở
                </h3>
                <div className="space-y-2">
                  {classes.map((cls) => {
                    const currentCount = classStudentCounts[cls.Id] || 0;
                    const availableSeats = Math.max(0, cls.MaxStudents - currentCount);
                    const isFull = availableSeats <= 0;
                    const isSelected = selectedClass === cls.Id;

                    return (
                      <div
                        key={cls.Id}
                        onClick={() => !isFull && setSelectedClass(cls.Id)}
                        className={`flex items-center gap-4 border p-4 rounded-xl cursor-pointer transition-all ${
                          isFull
                            ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
                            : isSelected
                            ? 'border-primary bg-blue-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-primary bg-primary' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-800 text-xs md:text-sm">{cls.ClassName}</div>
                          <div className="flex flex-wrap gap-x-4 text-[10px] text-slate-400 font-semibold mt-1">
                            <span>📅 Ngày bắt đầu: {new Date(cls.StartDate).toLocaleDateString('vi-VN')}</span>
                            <span>⏰ Lịch học: {cls.ScheduleDescription || 'Chưa cập nhật'}</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {isFull ? (
                            <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full text-[9px] font-bold">Hết chỗ</span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                              Còn {availableSeats} chỗ
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {classes.length === 0 && (
                    <div className="text-center py-6 text-slate-400 italic text-xs">
                      Hiện tại chưa có lớp học nào đang mở cho khóa học này.
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-700 text-sm flex items-center gap-1.5">
                  <i className="fa-solid fa-credit-card" /> Phương Thức Thanh Toán
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: 'vnpay', label: 'Cổng VNPay', desc: 'Thẻ ATM nội địa, thẻ quốc tế hoặc quét mã QRPay', icon: '💳' },
                    { key: 'momo', label: 'Ví Momo', desc: 'Thanh toán quét mã qua app ví điện tử Momo', icon: '📱' }
                  ].map((method) => {
                    const isSelected = paymentMethod === method.key;
                    return (
                      <div
                        key={method.key}
                        onClick={() => setPaymentMethod(method.key)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 select-none ${
                          isSelected ? 'border-primary bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-2xl">{method.icon}</div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-800 text-xs md:text-sm">{method.label}</h4>
                          <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">{method.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">TỔNG CỘNG HỌC PHÍ</span>
                <span className="text-xl font-black text-primary">
                  {Number(course.BasePrice).toLocaleString()}đ
                </span>
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={submitting || classes.length === 0}
                className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl text-xs font-black shadow-xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐĂNG KÝ HỌC'}
              </button>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
