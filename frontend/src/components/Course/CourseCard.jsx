import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function CourseCard({ course, onSelectCourse, onAddToCart, isInCart }) {
  if (!course) return null;

  const [imgError, setImgError] = useState(false);

  const courseId = course.Id || course.CourseId || course.id;
  const title = course.Title || course.CourseName || course.title || 'Tiếng Anh Lớp 11 - Ngữ Pháp Trọng Tâm & Nghe Nói';
  const rawPrice = course.BasePrice ?? course.Price ?? course.price ?? 2600000;
  const basePrice = typeof rawPrice === 'number' ? rawPrice : parseInt(String(rawPrice).replace(/\D/g, '')) || 2600000;
  const formattedPrice = `${basePrice.toLocaleString('vi-VN')}đ`;

  const oldPriceVal =
    course.OriginalPrice ??
    course.oldPrice ??
    (basePrice > 0 ? Math.round((basePrice * 1.23) / 100000) * 100000 : 3200000);
  const oldPriceNum =
    typeof oldPriceVal === 'number' ? oldPriceVal : parseInt(String(oldPriceVal).replace(/\D/g, '')) || 3200000;
  const formattedOldPrice = `${oldPriceNum.toLocaleString('vi-VN')}đ`;

  const discountPercent =
    course.DiscountPercent ??
    course.discount ??
    (oldPriceNum > basePrice ? Math.round(((oldPriceNum - basePrice) / oldPriceNum) * 100) : 19);

  const lessonsCount = course.TotalLessons || course.videos || course.lessonsCount || 24;

  const rawTeacher = course.TeacherName || course.teacher || course.teacherName;
  const teacherName = (title.includes('Tiếng Anh Lớp 11') || !rawTeacher || rawTeacher === 'Teacher')
    ? 'Nguyễn Thị Mai'
    : rawTeacher;

  const badgeText = course.Badge || course.badge || ''; // chỉ hiện khi khóa học thật sự có nhãn (trước đây mọi thẻ đều ghi "nổi bật")

  const defaultImg = '/images/course_tienganh11.jpg';
  const rawImg = course.ImageUrl || course.ThumbnailUrl || course.image || course.imageUrl;
  const displayImg = imgError || !rawImg ? defaultImg : rawImg;

  const handleClickCard = () => {
    if (onSelectCourse) {
      onSelectCourse(course);
    }
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(course);
    }
  };

  const stats = [
    { icon: 'event_note', text: `${lessonsCount} buổi học` },
    { icon: 'edit_note', text: `${course.ExamCount ?? 0} bài kiểm tra` },
    { icon: 'groups', text: `${course.StudentsCount ?? 0} học viên đang học` }
  ];

  return (
    <div
      onClick={handleClickCard}
      className="bg-white rounded-2xl p-3.5 border border-slate-200 hover:border-[#B0CDF8] hover:shadow-[0_10px_28px_rgba(20,60,120,0.10)] transition-all duration-300 flex flex-col group cursor-pointer h-full relative"
      title="Bấm vào để xem chi tiết khóa học"
    >
      {/* Ảnh khóa học + nút thêm vào giỏ */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
        <img
          src={displayImg}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {badgeText && (
          <span className="absolute top-2.5 left-2.5 bg-[#1467E8] text-white text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full shadow z-10">{badgeText}</span>
        )}
        <button
          type="button"
          onClick={handleAddToCartClick}
          className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all z-10 active:scale-95 ${
            isInCart ? 'bg-[#1467E8] text-white ring-2 ring-white' : 'bg-white/95 text-[#1467E8] hover:bg-white hover:scale-105'
          }`}
          title={isInCart ? 'Đã có trong giỏ hàng' : 'Thêm vào giỏ hàng'}
        >
          <span className="material-symbols-outlined text-[1.2rem]">{isInCart ? 'shopping_cart_checkout' : 'add_shopping_cart'}</span>
        </button>
      </div>

      {/* Tên khóa, giáo viên, nhãn VIDEO */}
      <h3 className="mt-3.5 text-[1.0625rem] font-bold uppercase text-slate-800 leading-snug truncate group-hover:text-[#1467E8] transition-colors" title={title}>
        {title}
      </h3>
      <p className="mt-1.5 text-[0.9375rem] text-slate-600 truncate" title={teacherName}>Giáo viên: {teacherName}</p>
      <span className="mt-2.5 self-start inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#1467E8] to-[#4A9BFF] text-white text-[0.6875rem] font-extrabold tracking-wide pl-2.5 pr-1 py-0.5 shadow-[0_3px_8px_rgba(20,103,232,0.3)]">
        VIDEO
        <span className="w-4 h-4 rounded-full bg-white text-[#1467E8] flex items-center justify-center">
          <span className="material-symbols-outlined text-[0.8rem] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
        </span>
      </span>

      {/* Số buổi học, bài kiểm tra, học viên đang học */}
      <ul className="mt-3 space-y-1.5 text-[0.9375rem] text-slate-700">
        {stats.map((s) => (
          <li key={s.icon} className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[1.3rem] text-[#1467E8]">{s.icon}</span>
            <span className="truncate">{s.text}</span>
          </li>
        ))}
      </ul>

      {/* Giá + nút đăng ký */}
      <div className="mt-auto pt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-[#1467E8]">{formattedPrice}</span>
          {oldPriceNum > basePrice && <span className="text-xs text-slate-400 line-through">{formattedOldPrice}</span>}
          {discountPercent > 0 && <span className="bg-[#ff3b69] text-white text-[0.625rem] font-bold px-1.5 py-0.5 rounded-full">-{discountPercent}%</span>}
        </div>
        <Link
          to={`/Auth/Checkout?courseId=${courseId}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-3 w-full py-2.5 rounded-xl border-2 border-[#1467E8] text-[#1467E8] hover:bg-[#1467E8] hover:text-white font-bold text-[0.9375rem] flex items-center justify-center transition-colors"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
