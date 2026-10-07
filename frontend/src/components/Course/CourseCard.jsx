import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function getGradeTag(title, tags) {
  const combined = `${title || ''} ${tags || ''}`.toLowerCase();
  if (combined.includes('lớp 12') || combined.includes('12')) return 'Lớp 12';
  if (combined.includes('lớp 11') || combined.includes('11')) return 'Lớp 11';
  if (combined.includes('lớp 10') || combined.includes('10')) return 'Lớp 10';
  if (combined.includes('ielts')) return 'IELTS';
  if (combined.includes('thpt')) return 'THPT QG';
  return 'Lớp 11';
}

export default function CourseCard({ course, onSelectCourse, onAddToCart, isInCart }) {
  if (!course) return null;

  const [imgError, setImgError] = useState(false);

  const courseId = course.Id || course.CourseId || course.id;
  const title = course.Title || course.CourseName || course.title || 'Tiếng Anh Lớp 11 - Ngữ Pháp Trọng Tâm & Nghe Nói';
  const description =
    course.Description ||
    course.desc ||
    course.description ||
    'Hệ thống kiến thức trọng tâm, rèn kỹ năng làm bài và phát triển toàn diện 4 kỹ năng.';

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
  const durationHours = course.durationHours || Math.round((lessonsCount * 30) / 60) || 12;

  const rawStudents = course.EnrolledStudentsCount || course.studentsCount;
  const studentsCountText =
    typeof rawStudents === 'string'
      ? (rawStudents.includes('học viên') ? rawStudents : `${rawStudents} học viên`)
      : (typeof rawStudents === 'number' && rawStudents > 50)
      ? `${(rawStudents / 1000).toFixed(1)}k học viên`
      : '6.2k học viên';

  const rawTeacher = course.TeacherName || course.teacher || course.teacherName;
  const teacherName = (title.includes('Tiếng Anh Lớp 11') || !rawTeacher || rawTeacher === 'Teacher')
    ? 'Nguyễn Thị Mai'
    : rawTeacher;
  const ratingScore = course.Rating || course.rating || '4.8';
  const reviewsCount = course.ReviewsCount || course.reviewsCount || '2.4k';

  const badgeText = course.Badge || course.badge || ''; // chỉ hiện khi khóa học thật sự có nhãn (trước đây mọi thẻ đều ghi "nổi bật")
  const gradeTag = getGradeTag(title, course.MetadataTags);

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

  return (
    <div
      onClick={handleClickCard}
      className="bg-white rounded-[28px] sm:rounded-[32px] p-3.5 sm:p-4 border border-slate-100 shadow-[0_8px_26px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col justify-between group cursor-pointer h-full relative"
      title="Bấm vào để xem chi tiết khóa học"
    >
      <div>
        {/* ============================================================== */}
        {/* THUMBNAIL BANNER CONTAINER WITH BADGES & CART BUTTON          */}
        {/* ============================================================== */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-[20px] sm:rounded-[22px] bg-slate-100">
          <img
            src={displayImg}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Nhãn góc trên trái: chỉ khi khóa học có nhãn riêng */}
          {badgeText && (
            <div className="absolute top-3 left-3 bg-[#1467E8] text-white text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md z-10">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
              <span>{badgeText}</span>
            </div>
          )}

          {/* Top Right Cart Plus Button */}
          <button
            type="button"
            onClick={handleAddToCartClick}
            className={`absolute top-3 right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-md flex items-center justify-center transition-all z-10 active:scale-95 ${
              isInCart
                ? 'bg-[#1467E8] text-white ring-2 ring-white shadow-emerald-800/40'
                : 'bg-white text-[#1467E8] hover:bg-emerald-50 hover:scale-105 border border-slate-100'
            }`}
            title={isInCart ? 'Đã có trong giỏ hàng' : 'Thêm vào giỏ hàng'}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              <line x1="12" y1="5" x2="12" y2="9" />
              <line x1="10" y1="7" x2="14" y2="7" />
            </svg>
          </button>

          {/* Bottom Left Badge: Lớp 11 / Grade */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] sm:text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20 shadow-sm z-10">
            <svg
              className="w-3.5 h-3.5 text-white/90 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>{gradeTag}</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TITLE & DESCRIPTION                                           */}
        {/* ============================================================== */}
        <h3 className="text-base sm:text-[18px] font-black text-slate-900 leading-snug line-clamp-2 mt-4 group-hover:text-[#1467E8] transition-colors">
          {title}
        </h3>

        <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed line-clamp-2 mt-1.5 font-normal">
          {description}
        </p>

        {/* Thông tin chính: viết thành chữ rõ ràng, không dùng ô nhỏ bị cắt chữ. */}
        <dl className="mt-3.5 pt-3 border-t border-slate-100 text-[13px] space-y-1.5">
          <div className="flex gap-2 min-w-0">
            <dt className="text-slate-400 shrink-0">Giảng viên</dt>
            <dd className="font-semibold text-slate-800 truncate" title={teacherName}>{teacherName}</dd>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500">
            <span>{lessonsCount} bài giảng ({durationHours} giờ học)</span>
            <span>{studentsCountText}</span>
          </div>
        </dl>
      </div>

      {/* ============================================================== */}
      {/* BOTTOM AREA: RATING, PRICING & CTA BUTTON                     */}
      {/* ============================================================== */}
      <div className="pt-3">
        {/* Rating Row */}
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" viewBox="0 0 24 24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="font-extrabold text-xs sm:text-sm text-slate-800">{ratingScore}</span>
          <span className="text-[11px] sm:text-xs text-slate-400 font-normal">({reviewsCount} đánh giá)</span>
        </div>

        {/* Pricing Row: Giá bán + Giá gốc gạch ngang + Tag giảm giá */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-xl sm:text-[24px] font-black text-[#1467E8] tracking-tight">
            {formattedPrice}
          </span>
          {oldPriceNum > basePrice && (
            <span className="text-xs sm:text-sm font-semibold text-slate-400 line-through">
              {formattedOldPrice}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#ff3b69] text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Call to Action Button: Đăng ký ngay */}
        <Link
          to={`/Auth/Checkout?courseId=${courseId}`}
          onClick={(e) => e.stopPropagation()}
          className="w-full mt-3.5 py-3 px-4 rounded-full bg-[#1467E8] hover:bg-[#1467E8] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(20, 103, 232,0.28)] hover:shadow-[0_6px_20px_rgba(20, 103, 232,0.38)] active:scale-[0.98] transition-all"
        >
          <svg
            className="w-4 h-4 text-white shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span>Đăng ký ngay</span>
          <svg
            className="w-4 h-4 text-white shrink-0 ml-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
