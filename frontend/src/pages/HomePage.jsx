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
        @keyframes blob-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.08); }
          66% { transform: translate(-15px, 15px) scale(0.95); }
        }
        .blob { animation: blob-float 14s ease-in-out infinite; }
        .blob-delay-2 { animation-delay: 3s; }
        .blob-delay-3 { animation-delay: 6s; }
      `}</style>

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-emerald-300/30 blur-3xl blob pointer-events-none"></div>
        <div className="absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full bg-sky-300/30 blur-3xl blob blob-delay-2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[380px] h-[380px] rounded-full bg-amber-300/25 blur-3xl blob blob-delay-3 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left Column */}
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 bg-white border border-emerald-200 px-4 py-2 rounded-full shadow-sm">
                <span className="material-symbols-outlined text-emerald-500 text-[18px]">auto_awesome</span>
                <span className="text-[11px] font-black tracking-[0.2em] text-emerald-700 uppercase">Nền tảng học tập cùng AI</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
                <span className="text-slate-900 block">Thắp Sáng Đam Mê</span>
                <span className="block bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 bg-clip-text text-transparent">Chinh Phục Đỉnh Cao</span>
              </h1>

              <p className="text-slate-600 text-base md:text-lg max-w-2xl leading-relaxed font-medium">
                Chương trình đào tạo bám sát cấu trúc đề thi mới nhất, đội ngũ giáo viên giỏi chuyên môn đồng hành cùng trợ lý AI cá nhân hóa lộ trình học tập 24/7.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/Auth/Register" className="bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-black px-8 py-3.5 rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm">
                  Đăng Ký Học Thử Miễn Phí
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>
                <Link to="/Home/Courses" className="bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold px-7 py-3.5 rounded-full transition-all text-sm shadow-sm">
                  Khám Phá Khóa Học
                </Link>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 pt-8 max-w-xl">
                <div className="bg-white border border-emerald-100 rounded-2xl p-4 text-center shadow-sm">
                  <div className="text-2xl lg:text-3xl font-black text-emerald-600">5,000+</div>
                  <div className="text-slate-500 text-[10px] font-extrabold uppercase tracking-wider mt-1">Học viên theo học</div>
                </div>
                <div className="bg-white border border-sky-100 rounded-2xl p-4 text-center shadow-sm">
                  <div className="text-2xl lg:text-3xl font-black text-sky-600">98.5%</div>
                  <div className="text-slate-500 text-[10px] font-extrabold uppercase tracking-wider mt-1">Đạt nguyện vọng 1</div>
                </div>
                <div className="bg-white border border-amber-100 rounded-2xl p-4 text-center shadow-sm">
                  <div className="text-2xl lg:text-3xl font-black text-amber-500">15+</div>
                  <div className="text-slate-500 text-[10px] font-extrabold uppercase tracking-wider mt-1">Năm kinh nghiệm</div>
                </div>
              </div>
            </div>

            {/* Right Column - Spotlight Cards */}
            <div className="lg:col-span-5 relative h-[460px] hidden lg:block">
              {/* Course spotlight card */}
              <div className="absolute top-0 left-0 w-[88%] rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/20 bg-gradient-to-br from-emerald-500 to-sky-500 p-6 text-white z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">Khóa Học Nổi Bật</span>
                  <span className="material-symbols-outlined">local_fire_department</span>
                </div>
                {spotlightCourse ? (
                  <>
                    <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-white/10 mb-4">
                      {spotlightCourse.ImageUrl ? (
                        <img src={spotlightCourse.ImageUrl} alt={spotlightCourse.Title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-[56px] text-white/50">school</span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-black text-lg mb-1 line-clamp-1">{spotlightCourse.Title}</h4>
                    <p className="text-white/80 text-xs font-semibold mb-4">{spotlightCourse.TotalLessons} buổi học · {Number(spotlightCourse.BasePrice) > 0 ? Number(spotlightCourse.BasePrice).toLocaleString('vi-VN') + ' đ' : 'Miễn phí'}</p>
                    <Link to={`/Auth/Checkout?courseId=${spotlightCourse.Id}`} className="inline-flex items-center gap-1.5 bg-white text-emerald-700 font-black text-xs px-4 py-2.5 rounded-full hover:scale-105 transition-all">
                      Đăng ký ngay <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </>
                ) : (
                  <p className="text-white/80 text-sm font-semibold py-8 text-center">Đang cập nhật khóa học...</p>
                )}
              </div>

              {/* Teacher spotlight card */}
              <div className="absolute bottom-0 right-0 w-[80%] rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/20 bg-white border border-amber-100 p-5 z-20">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">Giáo Viên Tiêu Biểu</span>
                {spotlightTeacher ? (
                  <div className="flex items-center gap-4 mt-4">
                    <img src={spotlightTeacher.avatarUrl} alt={spotlightTeacher.fullName} className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300 shrink-0 shadow-sm" />
                    <div className="min-w-0">
                      <h4 className="text-slate-900 font-extrabold text-base leading-tight truncate">{spotlightTeacher.fullName}</h4>
                      <p className="text-emerald-600 text-xs font-bold truncate">{spotlightTeacher.subject} · {spotlightTeacher.experience}+ năm KN</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-amber-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-slate-600 text-xs font-bold">{spotlightTeacher.rating} · {spotlightTeacher.students}+ học sinh</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm font-semibold py-6 text-center">Đang cập nhật đội ngũ giáo viên...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURED COURSES SECTION ===================== */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="w-12 h-[2px] bg-emerald-500"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Hệ sinh thái tri thức</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Khám Phá Khóa Học</h2>
            </div>
            <p className="text-slate-500 max-w-sm text-base leading-relaxed font-medium">
              Chọn khóa học phù hợp để bắt đầu hành trình học tập rực rỡ cùng các giáo viên xuất sắc nhất.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <i className="fa-solid fa-spinner fa-spin text-emerald-500 text-4xl" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {courses.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 italic">
                    Chưa có khóa học nào được đăng tải.
                  </div>
                ) : (
                  courses.slice(0, 4).map((course, idx) => {
                    const accent = ACCENTS[idx % ACCENTS.length];
                    return (
                      <div key={course.Id ?? idx} className={`bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl ${accent.glow} transition-all duration-300 hover:-translate-y-2 group flex flex-col`}>
                        <div className={`h-1.5 w-full bg-gradient-to-r ${accent.grad}`}></div>
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                          {course.ImageUrl ? (
                            <img
                              alt={course.Title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              src={course.ImageUrl}
                            />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center ${accent.tint}`}>
                              <span className={`material-symbols-outlined text-[80px] ${accent.text} opacity-40`}>school</span>
                            </div>
                          )}
                          <span className={`absolute top-5 right-5 ${accent.chip} text-white text-[9px] font-black uppercase px-3 py-1 rounded-lg shadow-md`}>
                            {course.CourseCode || 'ACTIVE'}
                          </span>
                        </div>
                        <div className="p-6 space-y-5 flex-1 flex flex-col">
                          <h4 className="font-black text-xl text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                            {course.Title}
                          </h4>
                          <div className="flex items-center justify-between text-slate-500 text-[13px] font-bold">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">schedule</span>
                              {course.TotalLessons} buổi học
                            </div>
                            <div className={`flex items-center gap-1 ${accent.text}`}>
                              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              4.9
                            </div>
                          </div>
                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1">
                            {course.Description}
                          </p>
                          <div className="flex justify-between items-center pt-5 border-t border-slate-100 mt-auto">
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold">Học phí</span>
                              <div className={`font-extrabold text-lg ${accent.text}`}>
                                {course.BasePrice && Number(course.BasePrice) > 0
                                  ? Number(course.BasePrice).toLocaleString('vi-VN') + ' đ'
                                  : 'Miễn phí'
                                }
                              </div>
                            </div>
                            <Link
                              to={`/Auth/Checkout?courseId=${course.Id}`}
                              className={`w-12 h-12 rounded-2xl ${accent.tint} flex items-center justify-center ${accent.text} group-hover:bg-gradient-to-br group-hover:${accent.grad} group-hover:text-white transition-all shadow-sm`}
                            >
                              <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-16 text-center">
                <Link
                  to="/Home/Courses"
                  className="px-12 py-4 rounded-2xl border-2 border-emerald-200 text-emerald-700 font-black transition-all shadow-sm inline-block hover:bg-gradient-to-r hover:from-emerald-500 hover:to-sky-500 hover:text-white hover:border-transparent"
                >
                  Xem tất cả chương trình
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===================== FEATURED TEACHERS SECTION ===================== */}
      <section className="py-28 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 text-violet-600 justify-center">
              <span className="w-12 h-[2px] bg-violet-500"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Đội ngũ tận tâm</span>
              <span className="w-12 h-[2px] bg-violet-500"></span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900">Giáo Viên Tiêu Biểu</h2>
          </div>

          {!loading && teacherCards.length === 0 ? (
            <div className="py-12 text-center text-slate-400 italic">Chưa có thông tin giáo viên.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teacherCards.slice(0, 4).map((t, idx) => {
                const accent = ACCENTS[idx % ACCENTS.length];
                return (
                  <button
                    key={t.id ?? idx}
                    onClick={() => openTeacherDetail(t)}
                    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md hover:shadow-xl transition-all hover:-translate-y-2 text-center group"
                  >
                    <div className={`w-24 h-24 mx-auto rounded-full overflow-hidden border-4 ${accent.ring} shadow-md mb-4`}>
                      <img src={t.avatarUrl} alt={t.fullName} className="w-full h-full object-cover" />
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full ${accent.tint} ${accent.text} text-[10px] font-black uppercase tracking-wide mb-2`}>
                      {t.subject}
                    </span>
                    <h4 className="font-black text-slate-900 text-base leading-tight mb-1">{t.fullName}</h4>
                    <p className="text-slate-500 text-xs font-semibold mb-3 line-clamp-1">{t.title}</p>
                    <div className="flex items-center justify-center gap-1 text-amber-500 text-xs font-bold">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      {t.rating} · {t.experience}+ năm KN
                    </div>
                    <span className={`mt-4 inline-flex items-center gap-1 text-xs font-black ${accent.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      Xem hồ sơ <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link
              to="/Home/Teachers"
              className="px-12 py-4 rounded-2xl border-2 border-violet-200 text-violet-700 font-black transition-all shadow-sm inline-block hover:bg-gradient-to-r hover:from-violet-500 hover:to-sky-500 hover:text-white hover:border-transparent"
            >
              Xem toàn bộ đội ngũ giảng viên
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== INFORMATION BENTO GRID SECTION ===================== */}
      <section className="py-28 relative" style={{ background: '#fdfbf7' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
          <div className="text-center mb-20 space-y-5">
            <div className="inline-block px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-[10px] font-black uppercase tracking-[0.3em]">
              Nền Tảng Giáo Dục Hiện Đại
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900">Thông Tin Trung Tâm</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Feature - Mission */}
            <div className="md:col-span-8 bg-white rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative border border-slate-100 shadow-lg" style={{ minHeight: '260px' }}>
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-50 to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <span className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-lg mb-6 inline-block">Sứ Mệnh &amp; Tầm Nhìn</span>
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 max-w-xl leading-tight">
                  Kiến tạo tương lai số thông qua giáo dục khai phóng
                </h3>
                <p className="text-slate-500 text-lg font-light max-w-lg mt-4 leading-relaxed">
                  Chúng tôi cam kết mang lại trải nghiệm học tập vượt trội, kết hợp giữa tri thức hàn lâm và công nghệ AI tiên tiến nhất hiện nay.
                </p>
              </div>
              <div className="flex items-center gap-4 mt-6 relative z-10">
                <div className="flex -space-x-4">
                  <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center font-black text-emerald-600 text-xs shadow-sm">Edu</div>
                  <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white">hub</span>
                  </div>
                </div>
                <span className="text-slate-500 text-xs font-bold">Hệ sinh thái đào tạo toàn diện</span>
              </div>
            </div>

            {/* Certificate */}
            <div className="md:col-span-4 bg-white rounded-3xl p-8 flex flex-col justify-between border border-slate-100 hover:border-amber-200 transition-all shadow-lg">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
                <span className="material-symbols-outlined text-amber-500 text-[36px]">workspace_premium</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Chứng Chỉ Quốc Tế</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Hệ thống văn bằng và chứng chỉ được công nhận bởi các đối tác giáo dục uy tín.
                </p>
              </div>
            </div>

            {/* Global Network */}
            <div className="md:col-span-4 bg-white rounded-3xl p-8 flex flex-col justify-between border border-slate-100 hover:border-sky-200 transition-all shadow-lg">
              <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mb-6 border border-sky-100">
                <span className="material-symbols-outlined text-sky-500 text-[36px]">public</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Mạng Lưới Toàn Cầu</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Kết nối cộng đồng học viên tại hơn 10 quốc gia, mở rộng cơ hội giao lưu quốc tế.
                </p>
              </div>
            </div>

            {/* Facilities */}
            <div className="md:col-span-8 bg-white rounded-3xl p-8 flex flex-col lg:flex-row gap-8 border border-slate-100 overflow-hidden shadow-lg">
              <div className="flex-1 flex flex-col justify-center">
                <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 border border-violet-100">
                  <span className="material-symbols-outlined text-violet-500 text-[32px]">apartment</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 leading-tight">Cơ Sở Vật Chất Hiện Đại</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Không gian học tập cảm hứng với trang thiết bị 4.0 giúp tối ưu hóa sự sáng tạo và tập trung.
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <span className="px-4 py-2 rounded-full text-violet-700 text-[10px] font-black uppercase tracking-widest border border-violet-200 bg-violet-50">
                    Tiêu chuẩn 5 sao
                  </span>
                </div>
              </div>
              {/* Bar Chart Visual */}
              <div className="flex-1 flex items-end justify-between gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                {[
                  { h: '6rem', accent: ACCENTS[0] },
                  { h: '10rem', accent: ACCENTS[1] },
                  { h: '14rem', accent: ACCENTS[3] },
                  { h: '8rem', accent: ACCENTS[2] },
                  { h: '11rem', accent: ACCENTS[1] }
                ].map((bar, i) => (
                  <div key={i} className={`w-full rounded-xl relative overflow-hidden ${bar.accent.tint}`} style={{ height: bar.h }}>
                    <div className={`absolute bottom-0 w-full rounded-xl bg-gradient-to-t ${bar.accent.grad}`} style={{ height: '70%' }}></div>
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
            <div className="md:w-[35%] bg-gradient-to-br from-emerald-50 to-sky-50 p-12 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden bg-white shadow-md mb-6">
                <img className="w-full h-full object-cover" src={selectedTeacher.avatarUrl} alt={selectedTeacher.fullName} />
              </div>
              <span className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm mb-4">{selectedTeacher.subject}</span>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 leading-tight">{selectedTeacher.fullName}</h3>
              <p className="text-xs text-slate-500 font-semibold px-2">{selectedTeacher.title}</p>
              <div className="grid grid-cols-3 gap-2 w-full pt-6 border-t border-slate-200 mt-8">
                <div className="text-center">
                  <span className="block text-lg font-extrabold text-emerald-600">{selectedTeacher.experience}+</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Năm KN</span>
                </div>
                <div className="text-center border-x border-slate-200">
                  <span className="block text-lg font-extrabold text-sky-600">{selectedTeacher.students}+</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Học sinh</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-extrabold text-amber-500">{selectedTeacher.rating}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Đánh giá</span>
                </div>
              </div>
            </div>

            {/* Right: Bio */}
            <div className="md:w-[65%] p-12 flex flex-col justify-between">
              <div className="flex-grow">
                <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  <i className="fa-solid fa-graduation-cap"></i> Tiểu sử &amp; Kinh nghiệm giảng dạy
                </h4>
                <div className="overflow-y-auto max-h-[300px] pr-4">
                  <p className="text-sm text-slate-600 leading-relaxed font-semibold whitespace-pre-line">{selectedTeacher.bio}</p>
                </div>
              </div>
              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
                <button onClick={closeTeacherDetail} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all">
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
