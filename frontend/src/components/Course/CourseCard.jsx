import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagPlusIcon } from '../Icons/ShoppingBagPlusIcon';

export default function CourseCard({ course, onSelectCourse, onAddToCart, isInCart }) {
  if (!course) return null;

  const courseId = course.Id || course.CourseId || course.id;
  const title = course.Title || course.CourseName || course.title || 'Khóa học chất lượng cao';
  const price = course.BasePrice ?? course.Price ?? course.price ?? 0;
  const formattedPrice = typeof price === 'number'
    ? `${price.toLocaleString('vi-VN')}đ`
    : (String(price).endsWith('đ') ? String(price) : `${price}đ`);

  const lessonsCount = course.TotalLessons || course.videos || course.lessonsCount || 36;
  const studentsCount = course.EnrolledStudentsCount || course.studentsCount || 6;
  const imgUrl = course.ImageUrl || course.ThumbnailUrl || course.image || course.imageUrl || '';

  const handleClickCard = () => {
    if (onSelectCourse) {
      onSelectCourse(course);
    }
  };

  return (
    <div
      onClick={handleClickCard}
      className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer h-full"
      title="Bấm vào để xem chi tiết khóa học"
    >
      <div>
        {/* Course Image Thumbnail */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={title}
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-emerald-600 via-teal-700 to-blue-800 p-4 flex flex-col justify-center items-center text-center text-white rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm mb-1">
                FLASHSTUDY
              </span>
              <h4 className="font-black text-sm sm:text-base leading-tight drop-shadow-md">{title}</h4>
            </div>
          )}

          {course.hot && (
            <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-md tracking-wider">
              HOT
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#047857] transition-colors leading-snug line-clamp-2 mt-3.5">
          {title}
        </h3>

        {/* Info Stats Row: Buổi học & Học viên */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 font-medium">
          <span className="flex items-center gap-1">📚 {lessonsCount} buổi học</span>
          <span className="flex items-center gap-1">👥 {studentsCount} học viên</span>
        </div>
      </div>

      {/* Bottom Area: Price & Action Buttons */}
      <div className="pt-3 mt-1">
        {/* Price Tag in Bright Amber/Orange */}
        <div className="text-[#f59e0b] font-black text-lg sm:text-xl mb-3">
          {formattedPrice}
        </div>

        {/* Action Row: Full Green Register Button + Circular Shopping Bag Plus Button */}
        <div className="flex items-center gap-3">
          <Link
            to={`/Auth/Checkout?courseId=${courseId}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-[#047857] hover:bg-[#03543f] text-white py-2.5 px-4 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 text-center flex items-center justify-center"
          >
            Đăng ký
          </Link>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToCart) onAddToCart(course);
            }}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 active:scale-95 ${
              isInCart
                ? 'border-amber-600 bg-amber-500 text-white shadow-md scale-105'
                : 'border-amber-400 bg-white text-amber-500 hover:bg-amber-50 hover:border-amber-500'
            }`}
            title={isInCart ? 'Đã có trong giỏ hàng' : 'Thêm vào giỏ hàng'}
          >
            <ShoppingBagPlusIcon className={`w-4 h-4 ${isInCart ? 'text-white' : 'text-amber-500'}`} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
