import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingBagIcon, ShoppingBagPlusIcon } from '../Icons/ShoppingBagPlusIcon';

export default function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, clearCart } = useCart();
  const drawerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.BasePrice || item.Price || 0), 0);

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      const firstId = cartItems[0].Id || cartItems[0].id || cartItems[0].CourseId;
      onClose();
      navigate(`/Auth/Checkout?courseId=${firstId}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] overflow-hidden select-none">
      {/* Backdrop blur overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out"
        >
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#065f46] flex items-center justify-center">
                <ShoppingBagIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-serif">Giỏ hàng của bạn</h3>
                <span className="text-xs text-slate-400 font-medium">({cartItems.length} khóa học)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Xóa tất cả"
                >
                  Xóa tất cả
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Cart Items Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-emerald-50 text-[#065f46] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <ShoppingBagPlusIcon className="w-8 h-8 text-[#065f46]" />
                </div>
                <h4 className="font-bold text-base text-slate-800">Giỏ hàng đang trống</h4>
                <p className="text-xs text-slate-500 mt-1 mb-6 max-w-xs mx-auto">
                  Hãy khám phá các khóa học chất lượng cao và thêm vào giỏ hàng ngay hôm nay.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/Home/Courses');
                  }}
                  className="bg-[#065f46] hover:bg-[#047857] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer"
                >
                  Khám phá khóa học
                </button>
              </div>
            ) : (
              cartItems.map((course, idx) => {
                const courseId = course.Id || course.id || course.CourseId;
                const price = Number(course.BasePrice || course.Price || 0);

                return (
                  <div
                    key={courseId || idx}
                    className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-2xl flex items-center gap-3.5 hover:bg-white hover:border-[#065f46]/30 hover:shadow-xs transition-all group"
                  >
                    <img
                      src={course.ImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200'}
                      alt={course.Title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200/80"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-[#065f46] uppercase tracking-wider mb-0.5">
                        {course.CourseCode || 'KHÓA HỌC'}
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate leading-snug">
                        {course.Title}
                      </h5>
                      <div className="text-xs font-black text-[#065f46] mt-1">
                        {price > 0 ? `${price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(courseId)}
                      className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Xóa khỏi giỏ hàng"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Checkout Actions */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-white space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Tổng thanh toán:</span>
                <span className="text-xl font-black text-[#065f46]">
                  {totalPrice > 0 ? `${totalPrice.toLocaleString('vi-VN')} đ` : '0 đ'}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-[#065f46] hover:bg-[#047857] text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Tiến hành Đăng ký & Thanh toán</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>

              <Link
                to="/Home/Courses"
                onClick={onClose}
                className="block text-center text-xs font-bold text-slate-500 hover:text-[#065f46] transition-colors py-1"
              >
                + Thêm khóa học khác
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
