import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import api from '../services/api';

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

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

  const courses = data?.courses || [];
  const teachers = data?.teachers || [];

  // Build carousel slides
  const teacherSlides = teachers.map((t) => {
    const profile = t.Profile || {};
    const avatarUrl = t.AvatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop';
    return {
      type: 'teacher',
      label: 'Xem tất cả giảng viên',
      url: '/Home/Teachers',
      teacher: t,
      avatarUrl,
      fullName: t.FullName,
      subject: profile.Subject || 'Toán học',
      title: profile.TeacherTitle || 'Giáo viên tiêu biểu',
      experience: profile.TeacherExperience !== null ? profile.TeacherExperience : 5,
      students: profile.TeacherStudents !== null ? profile.TeacherStudents : 100,
      rating: profile.TeacherRating !== null ? parseFloat(profile.TeacherRating).toFixed(1) : '4.8',
      bio: profile.TeacherBio || 'Giảng viên giàu kinh nghiệm ôn luyện và bồi dưỡng kiến thức toàn diện cho các em học viên.'
    };
  });

  const allSlides = [
    { type: 'courses', label: 'Xem tất cả khóa học', url: '/Home/Courses' },
    ...teacherSlides,
    { type: 'about', label: 'Khám phá trung tâm', url: '/Home/Courses' }
  ];

  const slidesCount = allSlides.length;

  const nextSlide = () => {
    if (slidesCount > 0) setCurrentSlide((prev) => (prev + 1) % slidesCount);
  };
  const prevSlide = () => {
    if (slidesCount > 0) setCurrentSlide((prev) => (prev - 1 + slidesCount) % slidesCount);
  };

  useEffect(() => {
    if (slidesCount > 0) {
      const timer = setInterval(nextSlide, 6000);
      return () => clearInterval(timer);
    }
  }, [slidesCount]);

  const openTeacherDetail = (teacherSlide) => {
    setSelectedTeacher(teacherSlide);
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
        .hero-premium-bg {
            position: relative;
            background: transparent;
            overflow: hidden;
        }
        .hero-premium-bg::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.25) 100%),
                              url('/images/ryunosuke-kikuno-uIRtLhPN_nQ-unsplash.jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            filter: brightness(0.8);
            z-index: 0;
        }
        @media (min-width: 1024px) {
            .hero-premium-bg::before {
                background-image: linear-gradient(90deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.03) 100%),
                                  url('/images/ryunosuke-kikuno-uIRtLhPN_nQ-unsplash.jpg');
            }
        }
        .hero-left-content h1 { color:#000!important; font-weight:900!important; text-shadow:0 1px 3px rgba(255,255,255,0.98),0 0 8px rgba(255,255,255,0.85),0 0 15px rgba(255,255,255,0.6); }
        .hero-left-content p { color:#1e293b!important; font-weight:700!important; text-shadow:0 1px 2px rgba(255,255,255,0.98),0 0 6px rgba(255,255,255,0.8),0 0 12px rgba(255,255,255,0.5); }
        .hero-left-content .text-on-surface-variant { color:#000!important; font-weight:700!important; text-shadow:0 1px 2px rgba(255,255,255,0.98),0 0 6px rgba(255,255,255,0.8),0 0 12px rgba(255,255,255,0.5)!important; }
        .hero-left-content .text-3xl { color:#000!important; font-weight:900!important; text-shadow:0 1px 2px rgba(255,255,255,0.98),0 0 6px rgba(255,255,255,0.8),0 0 12px rgba(255,255,255,0.5); }
        .glass-slider-card {
            background-color: rgba(255, 255, 255, 0.12) !important;
            border-color: rgba(255, 255, 255, 0.20) !important;
            backdrop-filter: blur(35px) !important;
            -webkit-backdrop-filter: blur(35px) !important;
            border-radius: 40px !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        }
        .glass-slider-card .text-shadow-sm {
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }
        /* Carousel track styling handled via absolute transitions */
        .blended-gradient { background:linear-gradient(135deg,#1e3a8a 0%,#172554 100%); }
        .platinum-white-gradient { background:linear-gradient(180deg,#f1f5f9 0%,#ffffff 100%); }
        .card-shadow { box-shadow:0 20px 40px -15px rgba(30,58,138,0.15); }
        .hover-lift { transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .hover-lift:hover { transform:translateY(-8px); }
      `}</style>

      {/* ===================== HERO SECTION ===================== */}
      <section className="min-h-screen relative flex items-center pt-24 overflow-hidden hero-premium-bg select-none">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 hero-left-content">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
                <span className="material-symbols-outlined text-[18px] text-primary">auto_awesome</span>
                <span className="text-[10px] font-black tracking-[0.25em] text-primary uppercase">Công nghệ AI thế hệ mới</span>
              </div>
              <h1 className="text-on-surface text-5xl md:text-7xl leading-[1.05] font-black tracking-tight font-serif">
                Nâng Tầm Tri Thức <br />
                <span className="text-primary">Đột Phá Bản Thân</span>
              </h1>
              <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl leading-relaxed font-normal">
                Học trực tuyến hiệu quả cao với lộ trình cá nhân hóa. Đội ngũ giáo viên chuyên môn giỏi kết hợp trợ lý AI thông minh đồng hành cùng học viên 24/7 để bứt phá điểm số.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/Auth/Register" className="blended-gradient text-white px-8 py-4 rounded-full font-black text-sm shadow-xl hover:brightness-110 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group">
                  Đăng Ký Học Thử Ngay
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
                <Link to="/Home/Courses" className="bg-white/30 backdrop-blur-md border border-white/60 text-on-surface px-8 py-4 rounded-full font-black text-sm hover:bg-white/50 transition-all flex items-center gap-2 shadow-md">
                  Xem Khóa Học
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-12 pt-16 border-t border-outline-variant/30">
                <div className="space-y-1">
                  <div className="text-3xl font-black text-on-surface">5,000+</div>
                  <div className="text-on-surface-variant/60 text-[10px] font-bold uppercase tracking-widest">Học sinh</div>
                </div>
                <div className="w-px h-10 bg-outline-variant/30"></div>
                <div className="space-y-1">
                  <div className="text-3xl font-black text-on-surface">98%</div>
                  <div className="text-on-surface-variant/60 text-[10px] font-bold uppercase tracking-widest">Đột phá điểm</div>
                </div>
                <div className="w-px h-10 bg-outline-variant/30"></div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-3xl font-black text-on-surface">4.9</span>
                    <span className="material-symbols-outlined text-vibrant-sky text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                  <div className="text-on-surface-variant/60 text-[10px] font-bold uppercase tracking-widest">Đánh giá</div>
                </div>
              </div>
            </div>

            {/* Right Column Slider */}
            <div className="lg:col-span-5 relative lg:block hidden">
              <div className="glass-slider-card overflow-hidden shadow-2xl group min-h-[460px] flex flex-col justify-between transition-all duration-300">
                <div className="relative flex-grow w-full overflow-hidden">
                  <div 
                    className="flex h-full transition-transform duration-500 ease-in-out" 
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {allSlides.map((slide, idx) => {
                      const slideClasses = "w-full shrink-0 h-full flex flex-col justify-between";

                      if (slide.type === 'courses') {
                        return (
                          <div key={idx} className={slideClasses}>
                            <div className="p-6 md:p-8 pb-0 flex-grow flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-center mb-6">
                                  <span className="px-3 py-1 bg-white/10 border border-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest text-shadow-sm">Khóa Học Nổi Bật</span>
                                  <div className="flex gap-2">
                                    <button type="button" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all text-white active:scale-95" onClick={(e) => { e.stopPropagation(); prevSlide(); }}>
                                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    </button>
                                    <button type="button" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all text-white active:scale-95" onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
                                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <img alt="Toán học" className="w-full aspect-video object-cover rounded-xl border border-white/10 shadow-sm" src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=256" />
                                  <p className="text-white font-bold text-xs text-shadow-sm">Toán Tư Duy Pro</p>
                                </div>
                                <div className="space-y-2">
                                  <img alt="Vật lý" className="w-full aspect-video object-cover rounded-xl border border-white/10 shadow-md" src="https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=256" />
                                  <p className="text-white font-bold text-xs text-shadow-sm">Vật Lý 4.0</p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 mb-2 p-3 bg-white/5 rounded-xl border border-white/10">
                              <p className="text-white/80 text-[10px] italic font-semibold leading-relaxed text-shadow-sm">
                                "Chương trình học bám sát cấu trúc đề thi mới nhất, tích hợp công nghệ AI cá nhân hóa."
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (slide.type === 'teacher') {
                      return (
                        <div key={idx} onClick={() => openTeacherDetail(slide)} className={`${slideClasses} cursor-pointer hover:bg-white/5 transition-colors`}>
                          <div className="p-6 md:p-8 pb-0 flex-grow flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-6">
                                <span className="px-3 py-1 bg-white/10 border border-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest text-shadow-sm">Đội Ngũ Giảng Viên</span>
                                <div className="flex gap-2">
                                  <button type="button" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all text-white active:scale-95" onClick={(e) => { e.stopPropagation(); prevSlide(); }}>
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                  </button>
                                  <button type="button" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all text-white active:scale-95" onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                  </button>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 mb-6 mt-4">
                                <div className="w-16 h-16 rounded-full border-2 border-sky-400 overflow-hidden bg-white shadow-md shrink-0">
                                  <img alt={slide.fullName} className="w-full h-full object-cover" src={slide.avatarUrl} />
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-white font-extrabold text-lg md:text-xl tracking-tight text-shadow-sm">{slide.fullName}</h4>
                                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-wide leading-snug text-shadow-sm">{slide.title} ({slide.subject})</p>
                                </div>
                              </div>
                              
                              <div className="space-y-4 mt-6">
                                <div className="flex items-center gap-3 text-white text-xs md:text-sm font-semibold text-shadow-sm">
                                  <span className="material-symbols-outlined text-white text-[22px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                  <span>Chuyên môn: {slide.subject} ({slide.experience} năm kinh nghiệm)</span>
                                </div>
                                <div className="flex items-center gap-3 text-white text-xs md:text-sm font-semibold text-shadow-sm">
                                  <span className="material-symbols-outlined text-white text-[22px] shrink-0">school</span>
                                  <span>Lượt đánh giá học viên đạt {slide.rating}/5.0 sao</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // about slide
                    return (
                      <div key={idx} className={slideClasses}>
                        <div className="p-6 md:p-8 pb-0 flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center mb-6">
                              <span className="px-3 py-1 bg-white/10 border border-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest text-shadow-sm">Về Trung Tâm</span>
                              <div className="flex gap-2">
                                <button type="button" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all text-white active:scale-95" onClick={(e) => { e.stopPropagation(); prevSlide(); }}>
                                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                <button type="button" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all text-white active:scale-95" onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
                                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                              </div>
                            </div>
                            <h3 className="text-white text-xl md:text-2xl font-black mb-3 leading-tight text-shadow-sm">Môi Trường Học Tập Đẳng Cấp</h3>
                            <p className="text-white/85 text-xs leading-relaxed mb-4 font-semibold text-shadow-sm">
                              AcademiaPro tự hào là đơn vị tiên phong ứng dụng Hybrid Learning cùng hệ thống quản lý học tập thông minh.
                            </p>
                            <div className="grid grid-cols-3 gap-3 mt-4">
                              <div className="bg-white/5 p-3 rounded-xl text-center border border-white/10 hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-white text-xl mb-1">wifi</span>
                                <p className="text-[9px] text-white/95 font-bold uppercase tracking-wider">Phòng Lab</p>
                              </div>
                              <div className="bg-white/5 p-3 rounded-xl text-center border border-white/10 hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-white text-xl mb-1">auto_awesome</span>
                                <p className="text-[9px] text-white/95 font-bold uppercase tracking-wider">AI Support</p>
                              </div>
                              <div className="bg-white/5 p-3 rounded-xl text-center border border-white/10 hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-white text-xl mb-1">coffee</span>
                                <p className="text-[9px] text-white/95 font-bold uppercase tracking-wider">Lounge</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>

                <div className="p-6 md:p-8 pt-4 pb-8">
                  <a
                    href={allSlides[currentSlide]?.url || '/Home/Courses'}
                    className="w-full bg-[#1a2b6d] text-white py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-[#152252] transition-all hover:scale-[1.02] active:scale-95 animate-fade-in"
                  >
                    <span className="material-symbols-outlined text-white text-[18px]">explore</span>
                    <span>{allSlides[currentSlide]?.label || 'Xem tất cả khóa học'}</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-widest">Khám phá</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent"></div>
        </div>
      </section>

      {/* ===================== FEATURED COURSES SECTION ===================== */}
      <section className="py-32 platinum-white-gradient relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-primary">
                <span className="w-12 h-[2px] bg-primary"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Hệ sinh thái tri thức</span>
              </div>
              <h2 className="text-5xl font-black text-on-surface leading-tight font-serif">Khám Phá Khóa Học</h2>
            </div>
            <p className="text-on-surface-variant max-w-sm text-lg leading-relaxed font-medium">
              Chọn khóa học phù hợp để bắt đầu hành trình học tập thông minh cùng các giáo viên xuất sắc nhất.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <i className="fa-solid fa-spinner fa-spin text-primary text-4xl" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {courses.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-on-surface-variant italic">
                    Chưa có khóa học nào được đăng tải.
                  </div>
                ) : (
                  courses.slice(0, 4).map((course, idx) => (
                    <div key={idx} className="bg-white/40 backdrop-blur-md rounded-3xl overflow-hidden card-shadow hover-lift group border border-white/30 flex flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden bg-primary/10">
                        {course.ImageUrl ? (
                          <img
                            alt={course.Title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            src={course.ImageUrl}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <span className="material-symbols-outlined text-[80px] text-primary/40">school</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <span className="absolute top-6 right-6 bg-primary text-white text-[9px] font-black uppercase px-3 py-1 rounded-lg shadow-xl">
                          {course.CourseCode || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="p-6 space-y-6 flex-1 flex flex-col">
                        <h4 className="font-black text-xl text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          {course.Title}
                        </h4>
                        <div className="flex items-center justify-between text-on-surface-variant text-[13px] font-bold">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                            {course.TotalLessons} buổi học
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px] text-vibrant-sky" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            4.9
                          </div>
                        </div>
                        <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 flex-1">
                          {course.Description}
                        </p>
                        <div className="flex justify-between items-center pt-6 border-t border-outline-variant/30 mt-auto">
                          <div>
                            <span className="text-on-surface-variant text-[10px] uppercase font-bold">Học phí</span>
                            <div className="text-primary font-extrabold text-lg">
                              {course.BasePrice && Number(course.BasePrice) > 0
                                ? Number(course.BasePrice).toLocaleString('vi-VN') + ' đ'
                                : 'Miễn phí'
                              }
                            </div>
                          </div>
                          <Link
                            to={`/Auth/Checkout?courseId=${course.Id}`}
                            className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary hover:blended-gradient hover:text-white transition-all shadow-sm"
                            style={{}}
                          >
                            <span className="material-symbols-outlined">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-20 text-center">
                <a
                  href="/Home/Courses"
                  className="px-12 py-4 rounded-2xl border-2 border-primary/20 text-primary font-black transition-all shadow-sm inline-block hover:bg-primary hover:text-white hover:border-transparent"
                >
                  Xem tất cả chương trình
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===================== INFORMATION BENTO GRID SECTION ===================== */}
      <section className="py-32 relative" style={{ background: '#faf8f0' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
          <div className="text-center mb-24 space-y-6">
            <div className="inline-block px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.3em]">
              Nền Tảng Giáo Dục Hiện Đại
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-on-surface font-serif">Thông Tin Trung Tâm</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6" style={{ minHeight: '600px' }}>
            {/* Main Feature - Mission */}
            <div className="md:col-span-8 bg-white/45 backdrop-blur-md rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative border border-white/30 shadow-xl" style={{ minHeight: '260px' }}>
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <span className="blended-gradient text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-lg mb-6 inline-block">Sứ Mệnh &amp; Tầm Nhìn</span>
                <h3 className="text-4xl font-black text-on-surface max-w-xl leading-tight font-serif">
                  Kiến tạo tương lai số thông qua giáo dục khai phóng
                </h3>
                <p className="text-on-surface-variant text-lg font-light max-w-lg mt-4 leading-relaxed">
                  Chúng tôi cam kết mang lại trải nghiệm học tập vượt trội, kết hợp giữa tri thức hàn lâm và công nghệ AI tiên tiến nhất hiện nay.
                </p>
              </div>
              <div className="flex items-center gap-4 mt-6 relative z-10">
                <div className="flex -space-x-4">
                  <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center font-black text-primary text-xs shadow-sm">Edu</div>
                  <div className="w-12 h-12 rounded-full border-2 border-white blended-gradient flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white">hub</span>
                  </div>
                </div>
                <span className="text-on-surface-variant text-xs font-bold">Hệ sinh thái đào tạo toàn diện</span>
              </div>
            </div>

            {/* Certificate */}
            <div className="md:col-span-4 bg-white/45 backdrop-blur-md rounded-3xl p-8 flex flex-col justify-between border border-white/30 hover:border-primary/20 transition-all shadow-xl">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 border border-primary/10">
                <span className="material-symbols-outlined text-primary text-[36px]">workspace_premium</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-on-surface mb-2">Chứng Chỉ Quốc Tế</h3>
                <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
                  Hệ thống văn bằng và chứng chỉ được công nhận bởi các đối tác giáo dục uy tín.
                </p>
              </div>
            </div>

            {/* Global Network */}
            <div className="md:col-span-4 bg-white/45 backdrop-blur-md rounded-3xl p-8 flex flex-col justify-between border border-white/30 hover:border-primary/20 transition-all shadow-xl">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border" style={{ background: 'rgba(3,105,161,0.05)', borderColor: 'rgba(3,105,161,0.1)' }}>
                <span className="material-symbols-outlined text-[36px]" style={{ color: '#0369a1' }}>public</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-on-surface mb-2">Mạng Lưới Toàn Cầu</h3>
                <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
                  Kết nối cộng đồng học viên tại hơn 10 quốc gia, mở rộng cơ hội giao lưu quốc tế.
                </p>
              </div>
            </div>

            {/* Facilities */}
            <div className="md:col-span-8 bg-white/45 backdrop-blur-md rounded-3xl p-8 flex flex-col lg:flex-row gap-8 border border-white/30 overflow-hidden shadow-xl">
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-3xl font-black text-on-surface mb-4 leading-tight font-serif">Cơ Sở Vật Chất Hiện Đại</h3>
                <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
                  Không gian học tập cảm hứng với trang thiết bị 4.0 giúp tối ưu hóa sự sáng tạo và tập trung.
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <span className="px-4 py-2 rounded-full text-primary text-[10px] font-black uppercase tracking-widest border" style={{ background: 'rgba(30,58,138,0.1)', borderColor: 'rgba(30,58,138,0.2)' }}>
                    Tiêu chuẩn 5 sao
                  </span>
                </div>
              </div>
              {/* Bar Chart Visual */}
              <div className="flex-1 flex items-end justify-between gap-4 p-6 rounded-2xl" style={{ background: 'rgba(241,245,249,0.3)', border: '1px solid rgba(203,213,225,0.2)' }}>
                {[
                  { h: '6rem', bg: 'rgba(30,58,138,0.3)' },
                  { h: '10rem', bg: 'rgba(3,105,161,0.3)' },
                  { h: '14rem', bg: 'linear-gradient(135deg,#1e3a8a 0%,#172554 100%)' },
                  { h: '8rem', bg: 'rgba(30,58,138,0.3)' },
                  { h: '11rem', bg: 'rgba(3,105,161,0.3)' }
                ].map((bar, i) => (
                  <div key={i} className="w-full rounded-xl relative overflow-hidden" style={{ height: bar.h, background: 'rgba(30,58,138,0.1)' }}>
                    <div className="absolute bottom-0 w-full rounded-xl" style={{ height: '70%', background: bar.bg }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TEACHER DETAIL MODAL ===================== */}
      {isTeacherModalOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={closeTeacherDetail}>
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeTeacherDetail} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-[20px] font-bold">close</span>
            </button>

            {/* Left: Profile */}
            <div className="md:w-[35%] bg-slate-50 p-12 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-40 h-40 rounded-full border-4 border-primary/10 overflow-hidden bg-white shadow-md mb-6">
                <img className="w-full h-full object-cover" src={selectedTeacher.avatarUrl} alt={selectedTeacher.fullName} />
              </div>
              <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm mb-4">{selectedTeacher.subject}</span>
              <h3 className="text-xl font-extrabold text-primary mb-2 leading-tight">{selectedTeacher.fullName}</h3>
              <p className="text-xs text-slate-500 font-semibold px-2">{selectedTeacher.title}</p>
              <div className="grid grid-cols-3 gap-2 w-full pt-6 border-t border-slate-200 mt-8">
                <div className="text-center">
                  <span className="block text-lg font-extrabold text-primary">{selectedTeacher.experience}+</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Năm KN</span>
                </div>
                <div className="text-center border-x border-slate-200">
                  <span className="block text-lg font-extrabold text-primary">{selectedTeacher.students}+</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Học sinh</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-extrabold text-primary">{selectedTeacher.rating}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Đánh giá</span>
                </div>
              </div>
            </div>

            {/* Right: Bio */}
            <div className="md:w-[65%] p-12 flex flex-col justify-between">
              <div className="flex-grow">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  <i className="fa-solid fa-graduation-cap"></i> Tiểu sử &amp; Kinh nghiệm giảng dạy
                </h4>
                <div className="overflow-y-auto max-h-[300px] pr-4">
                  <p className="text-sm text-slate-600 leading-relaxed font-semibold whitespace-pre-line">{selectedTeacher.bio}</p>
                </div>
              </div>
              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
                <button onClick={closeTeacherDetail} className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-lg transition-all">
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
