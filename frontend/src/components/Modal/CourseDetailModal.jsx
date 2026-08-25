import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import ShoppingBagPlusIcon from '../Icons/ShoppingBagPlusIcon';

export default function CourseDetailModal({ course, isOpen, onClose }) {
  const { addToCart, isInCart } = useCart();
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);

  const courseId = course?.Id || course?.id || course?.CourseId;

  useEffect(() => {
    if (isOpen && courseId) {
      setLoading(true);
      api.get(`/Home/CourseDetail/${courseId}`)
        .then((res) => {
          if (res.data?.success) {
            setDetailData(res.data.data);
          }
        })
        .catch((err) => {
          console.error('Error fetching course detail:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setDetailData(null);
    }
  }, [isOpen, courseId]);

  if (!isOpen || !course) return null;

  const currentCourse = detailData?.course || course;
  const price = currentCourse.BasePrice || currentCourse.Price || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] my-auto border border-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
          title="Đóng cửa sổ"
        >
          <span className="text-xl font-bold">✕</span>
        </button>

        {/* Modal Header Banner */}
        <div className="relative bg-gradient-to-r from-[#0c2340] via-[#047857] to-[#03543f] text-white p-6 sm:p-8 shrink-0">
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
            <img
              src={currentCourse.ImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400'}
              alt={currentCourse.Title || currentCourse.title}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-white/30 shadow-lg shrink-0"
            />
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {currentCourse.CourseCode || 'CHUYÊN SÂU'}
                </span>
                <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  FLASHSTUDY HIGH QUALITY
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-serif text-white leading-tight">
                {currentCourse.Title || currentCourse.title}
              </h2>
              <p className="text-xs text-emerald-100 font-medium line-clamp-2">
                {currentCourse.Description || 'Khóa học cung cấp kiến thức toàn diện, nâng cao tư duy làm bài và cam kết bứt phá điểm số tối đa.'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-amber-200 font-bold pt-1">
                <span>📹 {currentCourse.TotalLessons || 36} buổi học</span>
                <span>🎓 Mục tiêu: Target 8.5+ - 9+</span>
                <span>👥 {currentCourse.EnrolledStudentsCount || 120}+ Học viên</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-[#047857] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-semibold">Đang tải thông tin chi tiết khóa học...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-start gap-3">
                  <span className="text-2xl">📹</span>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-800">Bài Giảng Video Full HD</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Xem lại bài học mọi lúc mọi nơi không giới hạn số lần.</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-800">Kho Đề Thi & Bài Tập</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Tự động chấm điểm, đáp án chi tiết từng câu hỏi.</p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-start gap-3">
                  <span className="text-2xl">🔴</span>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-800">Livestream Trực Tiếp</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Học tương tác cùng thầy cô, chữa đề live hàng tuần.</p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-800">Hỗ Trợ 24/7 Qua Zalo Group</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Đội ngũ trợ giảng giải đáp thắc mắc chuyên môn liên tục.</p>
                  </div>
                </div>
              </div>

              {/* Detail Description */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
                <h4 className="font-extrabold text-sm text-slate-800 font-serif">Mô tả khóa học</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {currentCourse.Description || 'Khóa học được thiết kế chuẩn cấu trúc đề thi THPT Quốc Gia mới nhất. Học viên sẽ được trang bị nền tảng lý thuyết vững chắc, kết hợp cùng các phương pháp giải nhanh độc quyền giúp tối ưu hóa thời gian làm bài.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">HỌC PHÍ TRỌN KHÓA</span>
            <span className="text-xl sm:text-2xl font-black text-[#e59e00]">
              {price > 0 ? `${Number(price).toLocaleString('vi-VN')}đ` : '1.300.000đ'}
            </span>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <Link
              to={`/Auth/Checkout?courseId=${courseId}`}
              onClick={onClose}
              className="flex-1 sm:flex-none bg-[#047857] hover:bg-[#03543f] active:scale-95 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full transition-all shadow-md text-center"
            >
              Đăng ký ngay
            </Link>

            <button
              onClick={() => addToCart(currentCourse)}
              className={`p-2 transition-transform hover:scale-110 active:scale-95 shrink-0 ${
                isInCart(courseId) ? 'text-amber-500' : 'text-slate-700 hover:text-[#047857]'
              }`}
              title={isInCart(courseId) ? "Đã có trong giỏ hàng" : "Thêm vào giỏ hàng"}
            >
              <ShoppingBagPlusIcon className="w-7 h-7" strokeWidth={1.8} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
