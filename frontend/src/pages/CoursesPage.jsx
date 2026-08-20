import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useFetchData } from '../hooks/useFetchData';

// Smooth Scroll Reveal Component (Left-to-Right Entrance Animation)
function AnimatedBlock({ children, className = '', delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (domRef.current) observer.unobserve(domRef.current);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 50px 0px' }
    );

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
      className={`transition-all duration-1000 ease-out transform ${isVisible
          ? 'opacity-100 translate-x-0 scale-100'
          : 'opacity-0 -translate-x-28 scale-95'
        } ${className}`}
    >
      {children}
    </div>
  );
}

const PROMO_SLIDES = [
  {
    id: 0,
    title: 'KHÓA TỔNG ÔN LỊCH SỬ THPTQG 2027',
    note: 'Học phí: 2.600.000đ • Ưu đãi giảm 20% (Mã: TONGON20)',
    image: '/images/history_promo_tongon.png?v=12',
    badge: '🔥 HOT! KHÓA TỔNG ÔN LỊCH SỬ',
    price: '1.300.000đ',
    oldPrice: '2.600.000đ',
    code: 'TONGON20'
  },
  {
    id: 1,
    title: 'KHÓA LUYỆN ĐỀ THI THPTQG MÔN LỊCH SỬ',
    note: 'Tặng bộ đề minh họa + Sách trọng tâm Lịch Sử THPT',
    image: '/images/history_promo_luyende.png?v=12',
    badge: '🎁 GIẢM 20% + TẶNG SÁCH LỊCH SỬ',
    price: '1.990.000đ',
    oldPrice: '3.600.000đ',
    code: 'LUYENDE20'
  },
  {
    id: 2,
    title: 'KHÓA CẤP TỐC LỊCH SỬ THPTQG 2027',
    note: 'Chinh phục điểm 9+ Lịch sử trong giai đoạn nước rút',
    image: '/images/history_promo_captoc.png?v=12',
    badge: '⚡ CẤP TỐC NƯỚC RÚT LỊCH SỬ',
    price: '1.200.000đ',
    oldPrice: '2.400.000đ',
    code: 'CAPTOC20'
  }
];

const STUDENT_PROOF_CHATS = [
  {
    score: '29.75',
    scoreLabel: 'Á KHOA',
    scoreColor: 'from-amber-400 via-amber-500 to-red-600',
    name: 'TRƯƠNG NHẬT MINH',
    increase: '🏆 Á KHOA B00 TOÀN QUỐC',
    message: 'Á Khoa B00 xuất sắc 29.75 điểm (10 Toán | 10 Sinh | 9.75 Hóa)! Cảm ơn thầy Kid và FlashStudy rất nhiều!',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '10',
    scoreLabel: 'ĐIỂM 10',
    scoreColor: 'from-[#047857] via-blue-600 to-indigo-700',
    name: 'NGUYỄN ĐÌNH ANH TUẤN',
    increase: '🔥 10 ĐIỂM MÔN TOÁN',
    message: 'Em đã xuất sắc đạt 10 ĐIỂM TUYỆT ĐỐI môn Toán THPTQG! Bộ đề phát triển của trung tâm sát 100%!',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '10',
    scoreLabel: 'ĐIỂM 10',
    scoreColor: 'from-yellow-400 via-amber-500 to-red-500',
    name: 'LÊ THỊ KIM NGÂN',
    increase: '⚡ TĂNG 2.5 ĐIỂM (7.5 ➔ 10)',
    message: 'Từ 7.5 điểm thi thử bứt phá vọt lên 10 ĐIỂM thi thật! Phương pháp giải nhanh trắc nghiệm siêu đỉnh!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '9.8',
    scoreLabel: 'THỦ KHOA',
    scoreColor: 'from-emerald-500 via-teal-600 to-blue-700',
    name: 'NGUYỄN THỊ HỒNG NHUNG',
    increase: '🌟 THỦ KHOA KHỐI A00',
    message: 'Em đạt 9.8 điểm môn Toán! Bài giảng video chuyên sâu và hệ thống thi thử giúp em tự tin tuyệt đối.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '9.6',
    scoreLabel: 'XUẤT SẮC',
    scoreColor: 'from-purple-500 via-indigo-600 to-blue-800',
    name: 'ĐẶNG ĐÌNH CẦU NAM',
    increase: '🚀 TĂNG 2.0 ĐIỂM (7.6 ➔ 9.6)',
    message: 'Xuất sắc đạt 9.6 điểm Toán THPTQG. Cảm ơn thầy cô trung tâm luôn giải đáp thắc mắc 24/7!',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '9.5',
    scoreLabel: 'GIỎI',
    scoreColor: 'from-orange-500 to-red-600',
    name: 'NGUYỄN QUANG THẮNG',
    increase: '📈 TĂNG 3.0 ĐIỂM (6.5 ➔ 9.5)',
    message: 'Tăng dốc từ 6.5 lên 9.5 điểm! Nhờ lộ trình khóa Tổng Ôn Cấp Tốc sát ma trận đề thi.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '9.2',
    scoreLabel: 'BỨT PHÁ',
    scoreColor: 'from-cyan-500 to-blue-700',
    name: 'LÝ YẾN NHI',
    increase: '🔥 TĂNG 4.6 ĐIỂM (4.6 ➔ 9.2)',
    message: 'Từ 4.6 điểm thi thử bứt phá thần kỳ lên 9.2 điểm thi thật! Sự kiên trì và phương pháp đúng đắn!',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '9.4',
    scoreLabel: 'XUẤT SẮC',
    scoreColor: 'from-blue-600 to-indigo-800',
    name: 'NGUYỄN ĐỨC MINH QUÂN',
    increase: '⚡ TĂNG 2.5 ĐIỂM (6.9 ➔ 9.4)',
    message: 'Đạt 9.4 điểm Toán trong kỳ thi THPTQG. Bộ đề minh họa phát triển chuẩn đét!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '29.0',
    scoreLabel: 'THỦ KHOA',
    scoreColor: 'from-amber-500 via-orange-600 to-red-700',
    name: 'PHẠM THÀNH LONG',
    increase: '🏆 THỦ KHOA KHỐI A01',
    message: 'Đạt 29.0 điểm khối A01 (9.8 Toán | 9.6 Lý | 9.6 Anh)! Hệ thống đề luyện thi cực kỳ chất lượng.',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '9.6',
    scoreLabel: 'XUẤT SẮC',
    scoreColor: 'from-pink-500 to-rose-700',
    name: 'HOÀNG THỊ THU HÀ',
    increase: '🌟 CHINH PHỤC 9.6 TOÁN 12',
    message: 'Khóa học giúp em từ học sinh trung bình bứt phá vọt lên top đầu lớp với 9.6 điểm Toán!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  }
];

export default function CoursesPage() {
  const { data, loading } = useFetchData('/Home/Courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activePromoSlide, setActivePromoSlide] = useState(0);
  const [isPromoHovered, setIsPromoHovered] = useState(false);

  // Bảng Vàng Thành Tích Infinite Loop State
  const [achievementIndex, setAchievementIndex] = useState(0);
  const [isAchievementTransitioning, setIsAchievementTransitioning] = useState(true);
  const [isAchievementHovered, setIsAchievementHovered] = useState(false);

  const courses = data?.courses || [];
  const displayList = [...STUDENT_PROOF_CHATS, ...STUDENT_PROOF_CHATS];

  // Auto-play Banner Slide (slide mới vào từ bên phải)
  useEffect(() => {
    if (isPromoHovered) return;
    const slideInterval = setInterval(() => {
      setActivePromoSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 2000);
    return () => clearInterval(slideInterval);
  }, [isPromoHovered]);

  // Reset infinite loop seamlessly
  useEffect(() => {
    if (achievementIndex >= STUDENT_PROOF_CHATS.length) {
      const resetTimer = setTimeout(() => {
        setIsAchievementTransitioning(false);
        setAchievementIndex(0);
      }, 700);
      return () => clearTimeout(resetTimer);
    }
  }, [achievementIndex]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const filteredCourses = courses.filter((course) => {
    const courseName = (course.Title || course.CourseName || '').toLowerCase();
    const courseTags = (course.MetadataTags || course.Description || '').toLowerCase();
    const searchMatch = courseName.includes(searchTerm.toLowerCase()) || courseTags.includes(searchTerm.toLowerCase());

    if (activeFilter === 'all') {
      return searchMatch;
    }
    const targetKey = activeFilter.toLowerCase();
    return searchMatch && (courseName.includes(targetKey) || courseTags.includes(targetKey));
  });

  return (
    <MainLayout overlayHeader={false}>
      <div className="bg-[#f8fafc] min-h-screen text-slate-900 pt-0 pb-16">

        {/* ============================================================== */}
        {/* PROMO BANNER SLIDER (LEFT-TO-RIGHT AUTO-PLAY SLIDE)           */}
        {/* ============================================================== */}
        <AnimatedBlock delay={50}>
          <section className="w-full relative z-20 mb-6">
            <div
              className="relative w-full overflow-hidden shadow-xl bg-slate-900 group h-[340px] sm:h-[460px] lg:h-[540px] xl:h-[600px]"
              onMouseEnter={() => setIsPromoHovered(true)}
              onMouseLeave={() => setIsPromoHovered(false)}
            >
              {/* Horizontal Track Moving Left-to-Right */}
              <div
                className="flex transition-transform duration-700 ease-in-out w-full h-full"
                style={{ transform: `translateX(-${activePromoSlide * 100}%)` }}
              >
                {PROMO_SLIDES.map((slide, idx) => (
                  <div key={idx} className="min-w-full w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-900">
                    <img
                      src={slide.image}
                      alt={slide.title || `Slide ${idx + 1}`}
                      className="w-full h-full object-fill object-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedBlock>

        {/* ============================================================== */}
        {/* FILTERS & SEARCH SECTION (KHÓA TỔNG ÔN, LUYỆN ĐỀ, CẤP TỐC)     */}
        {/* ============================================================== */}
        <section id="course-list" className="max-w-[1340px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-4">

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'tổng ôn', label: 'Khóa Tổng Ôn' },
                { key: 'luyện đề', label: 'Luyện Đề' },
                { key: 'cấp tốc', label: 'Cấp Tốc' }
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => handleFilterClick(btn.key)}
                  className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${activeFilter === btn.key
                      ? 'bg-[#047857] text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-72 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Nhập từ khóa tìm kiếm..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#047857]/30 focus:border-[#047857] outline-none shadow-sm transition-all text-gray-800 placeholder:text-gray-400"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

          </div>

          {/* Course Grid Display */}
          {loading ? (
            <div className="flex justify-center py-16">
              <i className="fa-solid fa-spinner fa-spin text-[#047857] text-3xl" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mt-8">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course, idx) => {
                  const imgUrl = course.ImageUrl || course.ThumbnailUrl || '';
                  return (
                    <AnimatedBlock key={course.Id || course.CourseId || idx} delay={idx * 180}>
                      <div
                        className="bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-100/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group h-full"
                      >
                        <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={course.Title || course.CourseName}
                              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-[#047857] rounded-xl">
                              <span className="font-extrabold text-lg">FLASHSTUDY</span>
                            </div>
                          )}
                          <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-lg shadow-md">
                            HOT
                          </span>
                        </div>

                        <div className="pt-3 px-1 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 group-hover:text-[#047857] transition-colors line-clamp-2">
                              {course.Title || course.CourseName}
                            </h3>
                            <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                              {course.Description || 'Khóa học chất lượng cao bám sát chương trình chuẩn bộ GD&ĐT.'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 font-semibold">
                            <div className="flex items-center gap-1">
                              <span>📹 {course.TotalLessons || 36} bài học</span>
                            </div>
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <span>★ 4.9</span>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                            <div>
                              <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Học phí</span>
                              <span className="text-base font-black text-gray-900">
                                {(course.BasePrice || course.Price || 0) > 0 ? `${(course.BasePrice || course.Price || 0).toLocaleString('vi-VN')}đ` : '1.300.000đ'}
                              </span>
                            </div>

                            <Link
                              to={`/Home/Courses/${course.Id || course.CourseId}`}
                              className="bg-[#047857] hover:bg-[#03543f] text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1 group-hover:shadow-md"
                            >
                              Chi tiết &rarr;
                            </Link>
                          </div>
                        </div>
                      </div>
                    </AnimatedBlock>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-16 text-gray-400 font-semibold">
                  Chưa tìm thấy khóa học phù hợp với tìm kiếm của bạn.
                </div>
              )}
            </div>
          )}
        </section>



      </div>
    </MainLayout>
  );
}
