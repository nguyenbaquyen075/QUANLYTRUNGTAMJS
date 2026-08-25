import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useCart } from '../context/CartContext';
import { ShoppingBagIcon, ShoppingBagPlusIcon } from '../components/Icons/ShoppingBagPlusIcon';

export default function CartPage() {
  const { cartItems, registeredCourses, removeFromCart, clearCart } = useCart();
  const [activeTab, setActiveTab] = useState('cart'); // 'cart' or 'registered'
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.BasePrice || item.Price || 0), 0);

  const handleCheckout = (courseId) => {
    if (courseId) {
      navigate(`/Auth/Checkout?courseId=${courseId}`);
    } else if (cartItems.length > 0) {
      // Checkout first item or primary item
      const firstId = cartItems[0].Id || cartItems[0].id || cartItems[0].CourseId;
      navigate(`/Auth/Checkout?courseId=${firstId}`);
    }
  };

  return (
    <MainLayout overlayHeader={false}>
      <div className="bg-[#f8fafc] min-h-screen text-slate-900 py-10 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0c2340] via-[#047857] to-[#03543f] rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="bg-amber-400/20 text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                  FLASHSTUDY CART & ENROLLMENTS
                </span>
                <h1 className="text-2xl sm:text-4xl font-black font-serif">Giỏ Hàng & Khóa Học Đã Đăng Ký</h1>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                  Quản lý danh sách các khóa học đã lưu vào giỏ hàng và lộ trình học tập của bạn.
                </p>
              </div>
              <Link
                to="/Home/Courses"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all backdrop-blur-sm shrink-0 flex items-center gap-2"
              >
                <span>➕ Tìm thêm khóa học</span>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-8 bg-white p-1.5 rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex-1 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'cart'
                  ? 'bg-[#047857] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingBagIcon className="w-5 h-5" />
              <span>Giỏ Hàng Của Bạn</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activeTab === 'cart' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {cartItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('registered')}
              className={`flex-1 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'registered'
                  ? 'bg-[#047857] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>🎓 Khóa Học Đã Đăng Ký</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activeTab === 'registered' ? 'bg-amber-400 text-gray-900' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {registeredCourses.length}
              </span>
            </button>
          </div>

          {/* TAB 1: GIỎ HÀNG */}
          {activeTab === 'cart' && (
            <div>
              {cartItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto my-8">
                  <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBagPlusIcon className="w-10 h-10 text-amber-500" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-800">Giỏ hàng của bạn đang trống!</h3>
                  <p className="text-xs text-gray-500 mt-2 mb-6">
                    Hãy duyệt danh sách khóa học và bấm "Thêm vào giỏ hàng" để chọn các khóa học yêu thích.
                  </p>
                  <Link
                    to="/Home/Courses"
                    className="bg-[#047857] hover:bg-[#03543f] text-white px-6 py-3 rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-emerald-700/20 transition-all inline-block"
                  >
                    Xem Danh Sách Khóa Học
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Cart Items List */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Danh sách khóa học ({cartItems.length})
                      </span>
                      <button
                        onClick={clearCart}
                        className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors"
                      >
                        Xóa tất cả
                      </button>
                    </div>

                    {cartItems.map((course, idx) => {
                      const courseId = course.Id || course.id || course.CourseId;
                      const price = Number(course.BasePrice || course.Price || 0);

                      return (
                        <div
                          key={courseId || idx}
                          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <img
                              src={course.ImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200'}
                              alt={course.Title}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 border border-gray-100"
                            />
                            <div className="space-y-1">
                              <span className="bg-emerald-50 text-[#047857] text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                                FLASHSTUDY
                              </span>
                              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 line-clamp-2">
                                {course.Title}
                              </h3>
                              <p className="text-xs text-gray-500">
                                📚 {course.TotalLessons || 36} buổi học • Luyện thi THPTQG
                              </p>
                              {/* Price in Yellow */}
                              <div className="pt-1">
                                <span className="text-base sm:text-lg font-black text-[#e59e00]">
                                  {price.toLocaleString('vi-VN')}đ
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                            <button
                              onClick={() => handleCheckout(courseId)}
                              className="flex-1 sm:flex-initial bg-[#047857] hover:bg-[#03543f] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5"
                            >
                              <span>Đăng ký ngay</span>
                            </button>
                            <button
                              onClick={() => removeFromCart(courseId)}
                              className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Xóa khỏi giỏ"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Summary Side Card */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md sticky top-24 space-y-6">
                      <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-4">
                        Tóm Tắt Đơn Hàng
                      </h3>

                      <div className="space-y-3 text-xs font-semibold text-gray-600">
                        <div className="flex justify-between">
                          <span>Số lượng khóa học:</span>
                          <span className="font-bold text-gray-900">{cartItems.length} khóa</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ưu đãi áp dụng:</span>
                          <span className="text-emerald-600 font-bold">-0đ (Miễn phí ghi danh)</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-baseline justify-between">
                        <span className="text-xs font-extrabold text-gray-500 uppercase">TỔNG THÀNH TIỀN</span>
                        {/* Price in Yellow */}
                        <span className="text-2xl font-black text-[#e59e00]">
                          {totalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      </div>

                      <button
                        onClick={() => handleCheckout()}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-4 rounded-2xl text-xs sm:text-sm font-black shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span>XÁC NHẬN ĐĂNG KÝ HỌC</span>
                        <span>➔</span>
                      </button>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[11px] text-gray-500 space-y-1">
                        <p className="font-bold text-gray-700">🔒 Cam kết chất lượng FlashStudy:</p>
                        <p>• Hỗ trợ học tập 24/7 từ đội ngũ giảng viên</p>
                        <p>• Truy cập trọn đời tài liệu và video bài giảng</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: KHÓA HỌC ĐÃ ĐĂNG KÝ */}
          {activeTab === 'registered' && (
            <div>
              {registeredCourses.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto my-8">
                  <div className="w-20 h-20 bg-emerald-50 text-[#047857] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    🎓
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-800">Bạn chưa đăng ký khóa học nào!</h3>
                  <p className="text-xs text-gray-500 mt-2 mb-6">
                    Đăng ký khóa học ngay hôm nay để sẵn sàng bứt phá điểm số trong kỳ thi sắp tới.
                  </p>
                  <Link
                    to="/Home/Courses"
                    className="bg-[#047857] hover:bg-[#03543f] text-white px-6 py-3 rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-emerald-700/20 transition-all inline-block"
                  >
                    Khám Phá Khóa Học
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registeredCourses.map((course, idx) => {
                    const price = Number(course.BasePrice || course.Price || 0);

                    return (
                      <div
                        key={course.Id || course.id || idx}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                            <img
                              src={course.ImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300'}
                              alt={course.Title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md uppercase">
                              ĐÃ ĐĂNG KÝ
                            </span>
                          </div>

                          <h3 className="font-extrabold text-base text-gray-900 line-clamp-2">
                            {course.Title}
                          </h3>

                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                            <span>📚 {course.TotalLessons || 36} buổi học</span>
                            {/* Price in Yellow */}
                            <span className="font-black text-[#e59e00]">
                              {price.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[11px] text-gray-400 font-semibold">
                            Hạn dùng: Trọn đời
                          </span>
                          <Link
                            to="/Student/Dashboard"
                            className="bg-[#047857] hover:bg-[#03543f] text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-sm"
                          >
                            Vào Học Ngay ➔
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
