import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import api from '../services/api';

const ACCENTS = [
  { ring: 'border-emerald-400', chip: 'bg-emerald-500', text: 'text-emerald-600', tint: 'bg-emerald-50', grad: 'from-emerald-500 to-emerald-600', glow: 'shadow-emerald-500/20' },
  { ring: 'border-sky-400', chip: 'bg-sky-500', text: 'text-sky-600', tint: 'bg-sky-50', grad: 'from-sky-500 to-sky-600', glow: 'shadow-sky-500/20' },
  { ring: 'border-amber-400', chip: 'bg-amber-500', text: 'text-amber-600', tint: 'bg-amber-50', grad: 'from-amber-500 to-amber-600', glow: 'shadow-amber-500/20' },
  { ring: 'border-violet-400', chip: 'bg-violet-500', text: 'text-violet-600', tint: 'bg-violet-50', grad: 'from-violet-500 to-violet-600', glow: 'shadow-violet-500/20' },
];

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.get('/Home/Data')
      .then(res => {
        if (res.data && res.data.success) {
          setData(res.data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            // Continuous re-trigger when scrolling back into view
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [loading]);

  const courses = data?.courses || [];
  const teachers = data?.teachers || [];

  const buildTeacherCard = (t) => {
    const profile = t.Profile || {};
    return {
      id: t.Id,
      fullName: t.FullName,
      avatarUrl: t.AvatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
      subject: profile.Subject || 'Toán học',
      title: profile.TeacherTitle || 'Giáo viên tiêu biểu',
      experience: profile.TeacherExperience !== null && profile.TeacherExperience !== undefined ? profile.TeacherExperience : 5,
      students: profile.TeacherStudents !== null && profile.TeacherStudents !== undefined ? profile.TeacherStudents : 100,
      rating: profile.TeacherRating !== null && profile.TeacherRating !== undefined ? parseFloat(profile.TeacherRating).toFixed(1) : '4.8',
      bio: profile.TeacherBio || 'Giảng viên giàu kinh nghiệm ôn luyện và bồi dưỡng kiến thức toàn diện cho các em học viên.'
    };
  };

  const teacherCards = teachers.map(buildTeacherCard);
  const spotlightTeacher = teacherCards[0];
  const spotlightCourse = courses[0];

  const openTeacherDetail = (teacherCard) => {
    setSelectedTeacher(teacherCard);
    setIsTeacherModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeTeacherDetail = () => {
    setIsTeacherModalOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <MainLayout overlayHeader={true}>
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes stroke-flow {
          0% { stroke-dashoffset: 400; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes wave-pulse {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.65; }
          50% { transform: translateY(-8px) scale(1.03); opacity: 0.9; }
        }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 6s ease-in-out infinite; }
        .animate-stroke-flow-1 {
          stroke-dasharray: 24 12;
          animation: stroke-flow 12s linear infinite;
        }
        .animate-stroke-flow-2 {
          stroke-dasharray: 10 10;
          animation: stroke-flow 8s linear infinite reverse;
        }
        .animate-stroke-flow-3 {
          stroke-dasharray: 18 18;
          animation: stroke-flow 16s linear infinite;
        }
        .animate-wave-pulse {
          animation: wave-pulse 6s ease-in-out infinite;
        }
        .bg-tech-grid-voxora {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.048) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.048) 1px, transparent 1px);
          background-size: 54px 54px;
          -webkit-mask-image: radial-gradient(ellipse 85% 75% at 50% 50%, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 0.45) 75%, transparent 100%);
          mask-image: radial-gradient(ellipse 85% 75% at 50% 50%, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 0.45) 75%, transparent 100%);
        }
      `}</style>

      {/* ===================== HERO SECTION (BRIGHT EDU ROYAL BLUE THEME) ===================== */}
      <section className="relative min-h-screen flex items-center pt-[190px] sm:pt-[210px] pb-28 sm:pb-36 overflow-hidden bg-[#22386e] text-white">

        {/* Voxora Style Square Grid Background Overlay (Chỉ hiện ở trung tâm, mờ mất hẳn ở tất cả cạnh lề) */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.055) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.055) 1px, transparent 1px)
            `,
            backgroundSize: '54px 54px',
            WebkitMaskImage: 'radial-gradient(ellipse 45% 45% at 50% 50%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.4) 45%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 45% 45% at 50% 50%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.4) 45%, transparent 100%)'
          }}
        />

        {/* Bright Ambient Blue Glow Orb */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-tr from-blue-600/30 via-cyan-500/20 to-transparent blur-[160px] rounded-full pointer-events-none" />

        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* LEFT BLOCK (Chiếm 7/12 Cột - DÃN DÒNG CỰC KỲ THOÁNG ĐÃNG) */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-10 pl-0 reveal-on-scroll">
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-md border border-white/30 text-cyan-300 text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-full w-fit shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Hệ Thống Luyện Thi Trực Tuyến AI 4.0</span>
              </div>

              {/* Multi-Line Main Heading */}
              <h1 className="flex flex-col space-y-3.5 sm:space-y-4.5 font-black text-white text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[58px] leading-[1.28] tracking-tight">
                <span className="block">Học Thông Minh Hơn</span>
                <span className="block">
                  Bứt Phá Điểm Số Cùng{' '}
                  <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent drop-shadow-md">
                    Trung Tâm Online
                  </span>
                </span>
              </h1>

              {/* Paragraph */}
              <p className="text-slate-100 text-sm sm:text-base lg:text-lg font-normal leading-[2.0] max-w-2xl">
                Nền tảng học tập trực tuyến tích hợp AI hàng đầu. Tự động phát hiện lỗ hổng kiến thức, cung cấp bài tập bám sát ma trận đề thi và giải đáp thắc mắc 24/7.
              </p>

              {/* CTA Buttons Row */}
              <div className="flex flex-wrap items-center gap-5 sm:gap-6 pt-3">
                <Link
                  to="/Auth/Register"
                  className="group inline-flex items-center justify-center gap-3 min-w-[185px] sm:min-w-[200px] px-6 py-4 rounded-2xl text-base font-black text-white bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 hover:brightness-110 shadow-xl shadow-blue-500/40 hover:scale-[1.03] active:scale-95 transition-all text-center"
                >
                  <span>Bắt đầu ngay</span>
                  <i className="fa-solid fa-arrow-right text-sm group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/Home/Courses"
                  className="group inline-flex items-center justify-center gap-3 min-w-[185px] sm:min-w-[200px] px-6 py-4 rounded-2xl text-base font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 hover:border-cyan-300 shadow-lg hover:scale-[1.03] active:scale-95 transition-all text-center"
                >
                  <i className="fa-solid fa-book-open-reader text-cyan-300 text-base group-hover:scale-110 transition-transform" />
                  <span>Xem khóa học</span>
                </Link>
              </div>

              {/* Bottom Inline Stats Row (XẾP HÀNG NGANG RỘNG RÃI SIÊU THOÁNG) */}
              <div className="flex flex-wrap items-center gap-8 sm:gap-11 pt-8 text-xs sm:text-sm font-bold text-slate-300 max-w-2xl w-full">
                <div className="flex items-center gap-2">
                  <strong className="text-white font-black text-sm sm:text-base">5,000+</strong> học viên học thử
                </div>
                <div className="flex items-center gap-2">
                  <strong className="text-cyan-400 font-black text-sm sm:text-base">Từ 0đ</strong> / 1 buổi học thử
                </div>
                <div className="flex items-center gap-2">
                  <strong className="text-sky-300 font-black text-sm sm:text-base">Tức thì</strong> phân tích lỗi sai 24/7
                </div>
              </div>
            </div>

            {/* RIGHT BLOCK (BRIGHT EDU BLUE SLIDER SHOWCASE CARD) */}
            <div className="lg:col-span-5 relative flex justify-end items-start pt-8 lg:pt-24 xl:pt-28 lg:pr-[30px] xl:pr-[60px]">

              {/* Background Animated Sine Wave Aura Graphic (Bright Edu Blue Waves) */}
              <svg className="absolute -inset-16 w-[155%] h-[155%] opacity-75 pointer-events-none animate-wave-pulse" viewBox="0 0 500 300" fill="none">
                <path d="M 0 150 Q 125 35, 250 150 T 500 150" stroke="#00d2ff" strokeWidth="2.8" className="animate-stroke-flow-1" />
                <path d="M 0 170 Q 125 245, 250 150 T 500 120" stroke="#3b82f6" strokeWidth="2.0" className="animate-stroke-flow-2" />
                <path d="M 0 130 Q 125 205, 250 150 T 500 185" stroke="#6366f1" strokeWidth="1.6" opacity="0.8" className="animate-stroke-flow-3" />
              </svg>

              {/* Outer Roomier Showcase Card (Edu Blue Theme, max-w-[570px]) */}
              <div className="relative w-full max-w-[570px] bg-[#1a2b56]/95 backdrop-blur-2xl border border-blue-500/40 rounded-[32px] p-6.5 sm:p-7.5 shadow-2xl shadow-blue-950/80 space-y-5.5 z-10 overflow-hidden">

                {/* Card Top Navigation Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-blue-900/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                    <span className="text-xs font-black text-slate-100 uppercase tracking-wider">
                      {heroSlide === 0 ? 'Khóa Học Nổi Bật' : heroSlide === 1 ? 'Giảng Viên Tiêu Biểu' : 'Thông Tin Trung Tâm'}
                    </span>
                  </div>

                  {/* Manual Arrow Controls & Pagination Dots */}
                  <div className="flex items-center gap-2.5">
                    {/* Dots */}
                    <div className="flex items-center gap-1.5 mr-1">
                      {[0, 1, 2].map((idx) => (
                        <button
                          key={idx}
                          onClick={() => setHeroSlide(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${heroSlide === idx ? 'w-6 bg-cyan-400 shadow-sm shadow-cyan-400/60' : 'w-2 bg-slate-700 hover:bg-slate-500'
                            }`}
                          title={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Prev Arrow */}
                    <button
                      onClick={() => setHeroSlide((prev) => (prev === 0 ? 2 : prev - 1))}
                      className="w-7 h-7 rounded-full bg-slate-900 border border-blue-500/40 text-slate-300 hover:text-white hover:border-cyan-400 flex items-center justify-center transition-all text-xs active:scale-90"
                      title="Slide trước"
                    >
                      <i className="fa-solid fa-chevron-left text-[11px]" />
                    </button>

                    {/* Next Arrow */}
                    <button
                      onClick={() => setHeroSlide((prev) => (prev === 2 ? 0 : prev + 1))}
                      className="w-7 h-7 rounded-full bg-slate-900 border border-blue-500/40 text-slate-300 hover:text-white hover:border-cyan-400 flex items-center justify-center transition-all text-xs active:scale-90"
                      title="Slide sau"
                    >
                      <i className="fa-solid fa-chevron-right text-[11px]" />
                    </button>
                  </div>
                </div>

                {/* SLIDES CONTAINER WITH SMOOTH RIGHT-TO-LEFT TRANSLATION */}
                <div className="overflow-hidden w-full">
                  <div
                    className="flex transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(-${heroSlide * 100}%)` }}
                  >

                    {/* ==================== SLIDE 0: KHÓA HỌC NỔI BẬT ==================== */}
                    <div className="w-full shrink-0 space-y-5">
                      {/* Course Header Banner */}
                      <div className="bg-[#080e1e] border border-blue-900/70 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-cyan-300 bg-blue-950/90 border border-cyan-500/40 px-3 py-1 rounded-lg">
                            Khóa 9+ THPT QG
                          </span>
                          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <i className="fa-solid fa-star text-[11px]" /> 4.9/5 (1,280 học viên)
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                          Khóa Chuyên Đề: Toán Vận Dụng Cao 9+
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                          Tích hợp Trợ Lý AI LMS 4.0 chấm bài tự động & phát hiện 100% dạng bài còn yếu.
                        </p>
                      </div>

                      {/* Course Features Highlight List */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 text-xs text-slate-200 bg-[#080e1e]/80 border border-blue-900/60 p-2.5 rounded-xl">
                          <span className="w-5 h-5 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">✓</span>
                          <span><strong>45 Bài giảng 4K</strong> quay sẵn + 100+ Đề thi AI bám sát ma trận.</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-200 bg-[#080e1e]/80 border border-blue-900/60 p-2.5 rounded-xl">
                          <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0">✓</span>
                          <span><strong>Trợ lý AI giải đề 24/7</strong> giải thích từng bước trắc nghiệm & tự luận.</span>
                        </div>
                      </div>

                      {/* Course Quick Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div className="bg-[#080e1e] border border-blue-900/70 rounded-2xl p-4 flex flex-col justify-center">
                          <span className="text-slate-400 font-medium text-xs">Giảng viên chuyên môn</span>
                          <span className="text-cyan-400 font-bold text-xs sm:text-sm truncate mt-1">ThS. Minh Quân 👨‍🏫</span>
                        </div>
                        <div className="bg-[#080e1e] border border-blue-900/70 rounded-2xl p-4 flex flex-col justify-center">
                          <span className="text-slate-400 font-medium text-xs">Lịch học trực tiếp</span>
                          <span className="text-sky-300 font-bold text-xs sm:text-sm mt-1">T2-T4-T6 (19h30) 📅</span>
                        </div>
                      </div>

                      {/* Footer CTA */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs sm:text-sm text-slate-400 font-medium">
                          Học thử: <strong className="text-cyan-400 font-bold">0đ / 1 buổi</strong>
                        </span>
                        <Link
                          to="/Home/Courses"
                          className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 hover:brightness-110 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          Xem Khóa Học
                          <i className="fa-solid fa-arrow-right text-xs" />
                        </Link>
                      </div>
                    </div>

                    {/* ==================== SLIDE 1: ĐỘI NGŨ GIẢNG VIÊN ==================== */}
                    <div className="w-full shrink-0 space-y-5">
                      {/* Teacher Profile Box */}
                      <div className="bg-[#080e1e] border border-blue-900/70 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-3.5">
                          <img
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop"
                            alt="ThS. Minh Quân"
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400 shadow-md"
                          />
                          <div>
                            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                              ThS. Nguyễn Minh Quân
                            </h3>
                            <span className="text-xs sm:text-sm font-bold text-cyan-400 block mt-0.5">
                              12+ Năm Kn Luyện Thi Thủ Khoa
                            </span>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                          Cựu sinh viên Chuyên Toán ĐHQG, đào tạo hơn 10,000+ học sinh đạt điểm 9+ môn Toán THPT QG.
                        </p>
                      </div>

                      {/* Teacher Achievements List */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 text-xs text-slate-200 bg-[#080e1e]/80 border border-blue-900/60 p-2.5 rounded-xl">
                          <span className="w-5 h-5 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">🎓</span>
                          <span><strong>Bằng Thạc Sĩ Toán Học</strong> xuất sắc Đại Học Quốc Gia.</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-200 bg-[#080e1e]/80 border border-blue-900/60 p-2.5 rounded-xl">
                          <span className="w-5 h-5 rounded-lg bg-indigo-500/20 text-sky-300 flex items-center justify-center font-bold shrink-0">⭐</span>
                          <span><strong>Biên soạn 50+ bộ sách</strong> bí quyết chinh phục Toán vận dụng cao.</span>
                        </div>
                      </div>

                      {/* Teacher Quick Metrics */}
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div className="bg-[#080e1e] border border-blue-900/70 rounded-2xl p-4 flex flex-col justify-center">
                          <span className="text-slate-400 font-medium text-xs">Học viên 9+</span>
                          <span className="text-cyan-400 font-bold text-xs sm:text-sm mt-1">10,000+ Thành công 🎓</span>
                        </div>
                        <div className="bg-[#080e1e] border border-blue-900/70 rounded-2xl p-4 flex flex-col justify-center">
                          <span className="text-slate-400 font-medium text-xs">Đánh giá học sinh</span>
                          <span className="text-amber-300 font-bold text-xs sm:text-sm mt-1">⭐ 99.4% 5 Sao</span>
                        </div>
                      </div>

                      {/* Footer CTA */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs sm:text-sm text-slate-400 font-medium">
                          Đội ngũ: <strong className="text-slate-100 font-bold">50+ Thầy cô giỏi</strong>
                        </span>
                        <Link
                          to="/Home/Teachers"
                          className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 hover:brightness-110 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          Xem Giảng Viên
                          <i className="fa-solid fa-arrow-right text-xs" />
                        </Link>
                      </div>
                    </div>

                    {/* ==================== SLIDE 2: THÔNG TIN TRUNG TÂM ==================== */}
                    <div className="w-full shrink-0 space-y-5">
                      {/* Center Info Banner */}
                      <div className="bg-[#080e1e] border border-blue-900/70 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-cyan-300 bg-blue-950/90 border border-cyan-500/40 px-3 py-1 rounded-lg">
                            Hệ Thống LMS 4.0
                          </span>
                          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                            🏆 Top 1 Trung Tâm AI
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                          TrungTâmOnline - Đào Tạo Bứt Phá
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                          Tiên phong ứng dụng trí tuệ nhân tạo chẩn đoán lỗ hổng kiến thức & cá nhân hóa lộ trình 1-1.
                        </p>
                      </div>

                      {/* Center Features List */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 text-xs text-slate-200 bg-[#080e1e]/80 border border-blue-900/60 p-2.5 rounded-xl">
                          <span className="w-5 h-5 rounded-lg bg-blue-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0">🏫</span>
                          <span><strong>12 Chi nhánh toàn quốc</strong> & phòng học trực tuyến 4K siêu mượt.</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-200 bg-[#080e1e]/80 border border-blue-900/60 p-2.5 rounded-xl">
                          <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">⚡</span>
                          <span><strong>Báo cáo tiến độ học tập</strong> tự động gửi phụ huynh theo tuần.</span>
                        </div>
                      </div>

                      {/* Center Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div className="bg-[#080e1e] border border-blue-900/70 rounded-2xl p-4 flex flex-col justify-center">
                          <span className="text-slate-400 font-medium text-xs">Đỗ Nguyện Vọng 1</span>
                          <span className="text-cyan-400 font-bold text-xs sm:text-sm mt-1">98.6% Học viên 🏆</span>
                        </div>
                        <div className="bg-[#080e1e] border border-blue-900/70 rounded-2xl p-4 flex flex-col justify-center">
                          <span className="text-slate-400 font-medium text-xs">Hỗ trợ kỹ thuật</span>
                          <span className="text-sky-300 font-bold text-xs sm:text-sm mt-1">Trợ Lý AI 24/7 ⚡</span>
                        </div>
                      </div>

                      {/* Footer CTA */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs sm:text-sm text-slate-400 font-medium">
                          Tư vấn: <strong className="text-cyan-400 font-bold">Miễn phí 24/7</strong>
                        </span>
                        <Link
                          to="/Auth/Register"
                          className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 hover:brightness-110 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          Nhận Lộ Trình
                          <i className="fa-solid fa-arrow-right text-xs" />
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>      {/* ===================== MỤC 1: KHÓA HỌC TIÊU BIỂU ===================== */}
      <section className="py-24 sm:py-32 lg:py-36 bg-[#22386e] relative overflow-hidden text-white">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10">
          <div className="text-center mb-16 sm:mb-20 space-y-3 max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center justify-center gap-2 text-cyan-400">
              <span className="w-6 h-[2px] bg-cyan-400 rounded-full"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest">Hệ sinh thái tri thức</span>
              <span className="w-6 h-[2px] bg-cyan-400 rounded-full"></span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Khóa Học Tiêu Biểu
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-normal">
              Chọn khóa học phù hợp để bắt đầu hành trình học tập bứt phá cùng đội ngũ giáo viên giỏi nhất.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <i className="fa-solid fa-spinner fa-spin text-cyan-400 text-3xl" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 reveal-on-scroll reveal-delay-1">
                {courses.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-300 italic text-sm">
                    Chưa có khóa học nào được đăng tải.
                  </div>
                ) : (
                  courses.slice(0, 4).map((course, idx) => {
                    const imgUrl = course.ImageUrl || course.ThumbnailUrl || '';
                    const displayPrice = course.BasePrice || course.Price || 0;
                    return (
                      <div
                        key={course.Id ?? idx}
                        className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-950/20 hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col text-slate-900"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                          {imgUrl ? (
                            <img
                              alt={course.Title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              src={imgUrl}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-sky-50">
                              <span className="material-symbols-outlined text-[64px] text-blue-400/40">school</span>
                            </div>
                          )}
                          <span className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg shadow-sm">
                            {course.CourseCode || 'ACTIVE'}
                          </span>
                        </div>
                        <div className="p-5 space-y-3.5 flex-1 flex flex-col">
                          <h4 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {course.Title}
                          </h4>
                          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-blue-600">schedule</span>
                              {course.TotalLessons || 36} buổi học
                            </div>
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              4.9
                            </div>
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 flex-1 font-normal">
                            {course.Description || 'Khóa học được biên soạn chi tiết bám sát ma trận thi.'}
                          </p>
                          <div className="flex justify-between items-center pt-3.5 border-t border-slate-100 mt-auto">
                            <div>
                              <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Học phí</span>
                              <div className="font-extrabold text-base text-blue-600">
                                {displayPrice > 0 ? `${Number(displayPrice).toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                              </div>
                            </div>
                            <Link
                              to={`/Home/Courses`}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-xs hover:brightness-110 shadow-md shadow-blue-500/20 transition-all"
                            >
                              Chi tiết
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-10 text-center">
                <Link
                  to="/Home/Courses"
                  className="px-7 py-3 rounded-full bg-white text-slate-900 border border-slate-200 hover:border-cyan-400 text-xs font-bold transition-all inline-block shadow-md hover:scale-105"
                >
                  Xem tất cả khóa học
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===================== MỤC 2: SẢN PHẨM BÁN CHẠY (SÁCH) ===================== */}
      <section className="py-24 sm:py-32 lg:py-36 bg-[#22386e] relative overflow-hidden text-white">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10">
          <div className="text-center mb-16 sm:mb-20 space-y-3 max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center justify-center gap-2 text-cyan-400">
              <span className="w-6 h-[2px] bg-cyan-400 rounded-full"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest">Ấn phẩm độc quyền</span>
              <span className="w-6 h-[2px] bg-cyan-400 rounded-full"></span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Sách & Tài Liệu Bán Chạy
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-normal">
              Bộ sách tham khảo & bí quyết ôn luyện độc quyền biên soạn bởi hội đồng chuyên môn.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 reveal-on-scroll reveal-delay-1">
            {[
              {
                id: 101,
                title: 'Bộ 50 Đề Thi Thử Toán THPTQG 2026 (Có Lời Giải Chi Tiết)',
                author: 'ThS. Nguyễn Văn Nguyên',
                subject: 'Toán Học',
                price: 189000,
                originalPrice: 250000,
                rating: 4.9,
                image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600',
                badge: 'BÁN CHẠY NHẤT'
              },
              {
                id: 102,
                title: 'Chuyên Đề Vận Dụng Cao Hình Học Không Gian 11 & 12',
                author: 'ThS. Lê Hoàng Nam',
                subject: 'Toán Học',
                price: 149000,
                originalPrice: 195000,
                rating: 4.8,
                image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600',
                badge: 'HOT'
              },
              {
                id: 103,
                title: 'Sổ Tay Công Thức & Phản Xạ Nhanh Vật Lý 12',
                author: 'Thầy Lê Hoàng Nam',
                subject: 'Vật Lý',
                price: 129000,
                originalPrice: 170000,
                rating: 4.95,
                image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600',
                badge: 'KHUYÊN DÙNG'
              },
              {
                id: 104,
                title: 'Cẩm Nang Bứt Phá Điểm 9+ Tiếng Anh THPT QG',
                author: 'Cô Trần Thị Bích (IELTS 8.5)',
                subject: 'Tiếng Anh',
                price: 169000,
                originalPrice: 220000,
                rating: 4.9,
                image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600',
                badge: 'TOP 1 SÁCH ANH'
              }
            ].map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-950/20 flex flex-col group hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1.5 transition-all duration-300 text-slate-900"
              >
                <div className="relative h-52 overflow-hidden bg-slate-100 flex items-center justify-center p-3">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                    {book.badge}
                  </span>
                </div>
                <div className="p-5 space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span className="text-blue-600 font-bold">{book.subject}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span>{book.rating}</span>
                    </div>
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 line-clamp-2 min-h-[44px] group-hover:text-blue-600 transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-slate-500 text-xs italic">Tác giả: {book.author}</p>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[10px] text-slate-400 line-through block">{book.originalPrice.toLocaleString('vi-VN')} đ</span>
                      <span className="text-base font-black text-blue-600">{book.price.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <Link
                      to="/Home/Books"
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white text-xs font-black hover:brightness-110 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">shopping_cart</span>
                      Đặt Mua
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/Home/Books"
              className="px-7 py-3 rounded-full bg-white text-slate-900 border border-slate-200 hover:border-cyan-400 text-xs font-bold transition-all inline-block shadow-md hover:scale-105"
            >
              Xem toàn bộ kho sách hot
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== MỤC 3: GIẢNG VIÊN TIÊU BIỂU ===================== */}
      <section className="py-24 sm:py-32 lg:py-36 bg-[#22386e] relative overflow-hidden text-white">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10">
          <div className="text-center mb-16 sm:mb-20 space-y-3 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 text-cyan-400 justify-center">
              <span className="w-6 h-[2px] bg-cyan-400 rounded-full"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest">Đội ngũ tận tâm</span>
              <span className="w-6 h-[2px] bg-cyan-400 rounded-full"></span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white">Đội Ngũ Giảng Viên Tiêu Biểu</h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto font-normal">
              Thầy cô có chuyên môn cao, nhiều năm kinh nghiệm luyện thi THPTQG & ĐGNL.
            </p>
          </div>

          {!loading && teacherCards.length === 0 ? (
            <div className="py-12 text-center text-slate-300 italic text-sm">Chưa có thông tin giáo viên.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 reveal-on-scroll reveal-delay-1">
              {teacherCards.slice(0, 4).map((t, idx) => (
                <button
                  key={t.id ?? idx}
                  onClick={() => openTeacherDetail(t)}
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-950/20 hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1.5 transition-all duration-300 text-center group cursor-pointer text-slate-900 flex flex-col items-center"
                >
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-blue-100 shadow-md mb-4 bg-slate-50">
                    <img src={t.avatarUrl} alt={t.fullName} className="w-full h-full object-cover" />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-wide mb-2 shadow-sm">
                    {t.subject}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-base leading-tight mb-1 group-hover:text-blue-600 transition-colors">{t.fullName}</h4>
                  <p className="text-blue-600 text-xs font-semibold mb-3 line-clamp-1">{t.title}</p>
                  <div className="flex items-center justify-center gap-1 text-amber-500 text-xs font-bold mt-auto">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {t.rating} · {t.experience}+ năm KN
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to="/Home/Teachers"
              className="px-7 py-3 rounded-full bg-white text-slate-900 border border-slate-200 hover:border-cyan-400 text-xs font-bold transition-all inline-block shadow-md hover:scale-105"
            >
              Xem toàn bộ đội ngũ giảng viên
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== MỤC 4: BÀI VIẾT MỚI NHẤT (CÂU CHUYỆN HỌC VIÊN VƯỢT KHÓ) ===================== */}
      <section className="py-24 sm:py-32 lg:py-36 bg-[#22386e] relative overflow-hidden text-white">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10">
          <div className="text-center mb-16 sm:mb-20 space-y-3 max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center justify-center gap-2 text-cyan-400">
              <span className="w-6 h-[2px] bg-cyan-400 rounded-full"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest">Hành trình truyền cảm hứng</span>
              <span className="w-6 h-[2px] bg-cyan-400 rounded-full"></span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Bài Viết Mới Nhất
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-normal">
              Những câu chuyện xúc động về sự nỗ lực vươn lên bứt phá điểm số của học sinh trung tâm.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 reveal-on-scroll reveal-delay-1">
            {[
              {
                id: 1,
                tag: 'GƯƠNG SÁNG VƯỢT KHÓ',
                title: 'Hành trình từ cậu bé mồ côi mất gốc Toán vươn lên Thủ khoa 29.25 điểm',
                desc: 'Bằng sự kiên trì vượt qua hoàn cảnh gia đình khó khăn và sự giúp đỡ tận tình của thầy cô trung tâm cùng Trợ lý AI LMS, em Nguyễn Văn Tú đã xuất sắc trở thành Thủ khoa khối A00.',
                image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600',
                date: '15 Tháng 7, 2026',
                studentName: 'Em Nguyễn Văn Tú (Thủ khoa Khối A00)'
              },
              {
                id: 2,
                tag: 'BỨT PHÁ ĐIỂM SỐ',
                title: 'Từ điểm 4 trung bình vượt lên 9.6 Toán THPTQG nhờ phương pháp tự học AI',
                desc: 'Dù xuất phát điểm khiêm tốn, em Phạm Mai Anh đã xây dựng lộ trình luyện đề cá nhân hóa hàng ngày, bù đắp 100% lỗ hổng kiến thức chỉ sau 3 tháng luyện thi.',
                image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600',
                date: '10 Tháng 7, 2026',
                studentName: 'Em Phạm Mai Anh (Học sinh THPT Chuyên)'
              },
              {
                id: 3,
                tag: 'VƯƠN XA ƯỚC MƠ',
                title: 'Nỗ lực chinh phục 8.5 IELTS của cô nữ sinh vùng xa nhờ lớp học ảo 4K',
                desc: 'Không có điều kiện học trung tâm đắt đỏ ở thành phố, em Lê Hoàng Yến tận dụng phòng học ảo online của trung tâm để rèn phản xạ nói trực tiếp 1-1 với giáo viên.',
                image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600',
                date: '05 Tháng 7, 2026',
                studentName: 'Em Lê Hoàng Yến (Đạt 8.5 IELTS)'
              }
            ].map((story) => (
              <div
                key={story.id}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-950/20 hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col group text-slate-900"
              >
                <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                    {story.tag}
                  </span>
                </div>
                <div className="p-6 space-y-3 flex-1 flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold block">{story.date} • {story.studentName}</span>
                  <h4 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                    {story.title}
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 font-normal flex-1">
                    {story.desc}
                  </p>
                  <Link
                    to="/Home/News"
                    className="mt-auto text-blue-600 font-bold text-xs inline-flex items-center gap-1.5 hover:gap-2.5 transition-all pt-2"
                  >
                    Đọc câu chuyện đầy đủ <i className="fa-solid fa-arrow-right text-[10px]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/Home/News"
              className="px-7 py-3 rounded-full bg-white text-slate-900 border border-slate-200 hover:border-cyan-400 text-xs font-bold transition-all inline-block shadow-md hover:scale-105"
            >
              Xem tất cả bài viết & câu chuyện
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== MỤC 5: HỌC SINH NÓI GÌ VỀ TRUNG TÂM ===================== */}
      <section className="py-24 sm:py-32 lg:py-36 bg-[#22386e] relative overflow-hidden text-white">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10">
          <div className="text-center mb-16 sm:mb-20 space-y-3 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 text-cyan-400 justify-center">
              <span className="w-6 h-[2px] bg-cyan-400 rounded-full"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest">Cảm nhận thực tế</span>
              <span className="w-6 h-[2px] bg-cyan-400 rounded-full"></span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white">
              Học Sinh & Phụ Huynh Nói Gì Về Chúng Tôi
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto font-normal">
              Hàng ngàn đánh giá chân thực từ các em học sinh và phụ huynh trên cả nước.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 reveal-on-scroll reveal-delay-1">
            {[
              {
                id: 1,
                name: 'Đặng Minh Hoàng',
                school: 'THPT Chuyên Hà Nội - Amsterdam',
                scoreBadge: '29.25 Điểm Khối A00',
                avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256',
                comment: 'Nhờ Trợ lý AI và thầy Quân giảng dạy, em đã hiểu sâu bản chất toán vận dụng cao. Đề thi thử trung tâm sát 99% đề thi thật THPTQG!'
              },
              {
                id: 2,
                name: 'Trần Quỳnh Anh',
                school: 'THPT Lê Hồng Phong (TP.HCM)',
                scoreBadge: '9.8 Môn Toán · 9.5 Vật Lý',
                avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=256',
                comment: 'Hệ thống báo cáo học tập giúp em nhận ra bài sai ở đâu để chữa ngay. Thầy cô hỗ trợ nhiệt tình kể cả 11h đêm.'
              },
              {
                id: 3,
                name: 'Bác Nguyễn Quốc Bảo',
                school: 'Phụ huynh em Nguyễn Minh Đức',
                scoreBadge: 'Đỗ Nguyện Vọng 1 Bách Khoa',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256',
                comment: 'Gia đình rất yên tâm khi trung tâm gửi báo cáo chuyên cần và điểm số tự động hàng tuần. Con tôi đã tự giác học tập và tiến bộ rõ rệt!'
              }
            ].map((review) => (
              <div
                key={review.id}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-950/20 flex flex-col justify-between space-y-4 text-slate-900 hover:border-blue-400 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic font-normal">
                    "{review.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3.5">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-blue-400/40"
                  />
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm">{review.name}</h5>
                    <span className="text-[11px] text-blue-600 font-bold block">{review.scoreBadge}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{review.school}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ===================== TEACHER DETAIL MODAL ===================== */}
      {isTeacherModalOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-[#080e1e]/80 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={closeTeacherDetail}>
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative text-slate-900" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeTeacherDetail} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-[20px] font-bold">close</span>
            </button>

            {/* Left: Profile */}
            <div className="md:w-[35%] bg-slate-50 p-10 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-36 h-36 rounded-full border-4 border-blue-200 overflow-hidden bg-white shadow-md mb-5">
                <img className="w-full h-full object-cover" src={selectedTeacher.avatarUrl} alt={selectedTeacher.fullName} />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-black px-4 py-1 rounded-full shadow-sm mb-3">{selectedTeacher.subject}</span>
              <h3 className="text-xl font-extrabold text-slate-900 mb-1.5 leading-tight">{selectedTeacher.fullName}</h3>
              <p className="text-xs text-blue-600 font-semibold px-2">{selectedTeacher.title}</p>
              <div className="grid grid-cols-3 gap-2 w-full pt-5 border-t border-slate-200 mt-6">
                <div className="text-center">
                  <span className="block text-lg font-extrabold text-blue-600">{selectedTeacher.experience}+</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Năm KN</span>
                </div>
                <div className="text-center border-x border-slate-200">
                  <span className="block text-lg font-extrabold text-blue-600">{selectedTeacher.students}+</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Học sinh</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-extrabold text-amber-500">{selectedTeacher.rating}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Đánh giá</span>
                </div>
              </div>
            </div>

            {/* Right: Bio */}
            <div className="md:w-[65%] p-10 flex flex-col justify-between">
              <div className="flex-grow">
                <h4 className="text-xs font-black text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <i className="fa-solid fa-graduation-cap"></i> Tiểu sử &amp; Kinh nghiệm giảng dạy
                </h4>
                <div className="overflow-y-auto max-h-[300px] pr-4">
                  <p className="text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">{selectedTeacher.bio}</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button onClick={closeTeacherDetail} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg hover:brightness-110 transition-all">
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
