import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useFetchData } from '../hooks/useFetchData';

export default function TeachersPage() {
  const { data, loading } = useFetchData('/Home/Teachers');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const teachers = data?.teachers || [];

  const openTeacherDetailModal = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeTeacherDetailModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <MainLayout overlayHeader={true}>
      {/* Hero Banner Section (Edu Royal Navy Theme #0b132b) */}
      <section className="relative overflow-hidden select-none pt-28 sm:pt-32 pb-4 bg-[#1a2b56] text-white">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-white mb-2">
            Đội Ngũ Giáo Viên
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl leading-relaxed font-normal">
            Những người thầy cô tâm huyết, chuyên môn cao, đồng hành cùng bạn chinh phục mọi kỳ thi.
          </p>
        </div>
      </section>

      {/* Teachers List Section */}
      <section className="py-6 sm:py-8 bg-[#1a2b56] min-h-screen text-white">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          {loading ? (
            <div className="flex justify-center py-16">
              <i className="fa-solid fa-spinner fa-spin text-cyan-400 text-3xl" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {teachers.length > 0 ? (
                teachers.map((teacher, index) => {
                  const profile = teacher.Profile || {};
                  const avatarUrl = teacher.AvatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop';
                  return (
                    <div
                      key={index}
                      onClick={() => openTeacherDetailModal(teacher)}
                      className="bg-white border border-slate-100 rounded-3xl overflow-visible flex flex-col items-center p-7 text-center hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-slate-900 shadow-xl shadow-slate-950/20"
                    >
                      <div className="relative mb-5">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-cyan-400/40 overflow-hidden bg-blue-950 shadow-md flex items-center justify-center">
                          <img className="w-full h-full object-cover" src={avatarUrl} alt={teacher.FullName} />
                        </div>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 text-white text-[10px] font-extrabold px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                          {profile.Subject || 'Toán học'}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white mb-1 mt-1.5">{teacher.FullName}</h3>
                      <p className="text-xs font-bold text-cyan-400 mb-3">{profile.TeacherTitle || 'Giáo viên tiêu biểu tại trung tâm'}</p>
                      <p className="text-xs text-slate-300 mb-5 leading-relaxed line-clamp-3 italic font-normal">
                        "{profile.TeacherBio || 'Giảng viên giàu kinh nghiệm ôn luyện và bồi dưỡng kiến thức toàn diện cho các em học viên.'}"
                      </p>
                      <div className="mt-auto w-full pt-5 flex justify-between gap-2 text-center">
                        <div className="flex-1">
                          <span className="text-lg font-black text-cyan-400 block">{profile.TeacherExperience !== null ? profile.TeacherExperience : 5}+</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Năm KN</span>
                        </div>
                        <div className="flex-1 border-x border-blue-900/50">
                          <span className="text-lg font-black text-cyan-400 block">{profile.TeacherStudents !== null ? profile.TeacherStudents : 100}+</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Học sinh</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-0.5">
                            {profile.TeacherRating !== null ? parseFloat(profile.TeacherRating).toFixed(1) : '4.8'}{' '}
                            <span className="material-symbols-outlined text-[14px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Đánh giá</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-slate-400">
                  Hiện chưa có danh sách giáo viên nào được kích hoạt.
                </div>
              )}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-3xl p-7 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-2xl border border-white/20 text-white">
            <div className="relative z-10 text-center md:text-left space-y-1.5">
              <h2 className="text-xl md:text-2xl font-black text-white">
                Bạn muốn được tư vấn lộ trình học?
              </h2>
              <p className="text-slate-100 text-xs md:text-sm font-normal">
                Kết nối ngay với đội ngũ giáo viên và chuyên gia tư vấn của chúng tôi.
              </p>
            </div>
            <div className="relative z-10 flex gap-4 flex-wrap justify-center items-center">
              <Link to="/Home/Courses" className="bg-white text-blue-900 px-7 py-3 rounded-full font-black text-xs shadow-xl hover:bg-slate-100 transition-all flex items-center gap-2 whitespace-nowrap hover:scale-105 active:scale-95">
                <span className="material-symbols-outlined text-[18px]">school</span>
                Xem Khóa Học
              </Link>
              <Link to="/Auth/Register" className="bg-white/10 text-white border border-white/30 px-7 py-3 rounded-full font-bold hover:bg-white/20 transition-all whitespace-nowrap text-xs">
                Đăng Ký Ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Teacher Detail Modal */}
      {isModalOpen && selectedTeacher && (
        <div
          className="fixed inset-0 bg-[#080e1e]/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          onClick={closeTeacherDetailModal}
        >
          <div
            className="bg-[#1a2b56] border border-blue-500/40 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-scale-in text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeTeacherDetailModal}
              className="absolute top-6 right-6 text-slate-300 hover:text-white transition-colors w-10 h-10 rounded-full bg-blue-900/60 flex items-center justify-center z-10"
            >
              <span className="material-symbols-outlined text-[20px] font-bold">close</span>
            </button>

            {/* Left Side: Profile Intro */}
            <div className="md:w-[35%] bg-[#080e1e]/60 p-10 border-b md:border-b-0 md:border-r border-blue-900/60 flex flex-col items-center justify-center text-center">
              <div className="w-36 h-36 rounded-full border-4 border-cyan-400/40 overflow-hidden bg-blue-950 shadow-md mb-5">
                <img
                  className="w-full h-full object-cover"
                  src={selectedTeacher.AvatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop'}
                  alt={selectedTeacher.FullName}
                />
              </div>
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-black px-4 py-1 rounded-full shadow-sm mb-3">
                {selectedTeacher.Profile?.Subject || 'Toán học'}
              </span>
              <h3 className="text-xl font-extrabold text-white mb-1.5 leading-tight">
                {selectedTeacher.FullName}
              </h3>
              <p className="text-xs text-cyan-400 font-semibold px-2">
                {selectedTeacher.Profile?.TeacherTitle || 'Giáo viên tiêu biểu'}
              </p>

              <div className="grid grid-cols-3 gap-2 w-full pt-5 border-t border-blue-900/60 mt-6">
                <div className="text-center">
                  <span className="block text-lg font-extrabold text-cyan-400">{selectedTeacher.Profile?.TeacherExperience !== null ? selectedTeacher.Profile.TeacherExperience : 5}+</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Năm KN</span>
                </div>
                <div className="text-center border-x border-blue-900/60">
                  <span className="block text-lg font-extrabold text-cyan-400">{selectedTeacher.Profile?.TeacherStudents !== null ? selectedTeacher.Profile.TeacherStudents : 100}+</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Học sinh</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-extrabold text-amber-400 flex items-center justify-center gap-0.5">
                    {selectedTeacher.Profile?.TeacherRating !== null ? parseFloat(selectedTeacher.Profile.TeacherRating).toFixed(1) : '4.8'}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Đánh giá</span>
                </div>
              </div>
            </div>

            {/* Right Side: Details / Bio */}
            <div className="md:w-[65%] p-10 flex flex-col justify-between">
              <div className="flex-grow">
                <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <i className="fa-solid fa-graduation-cap"></i> Tiểu sử & Kinh nghiệm giảng dạy
                </h4>
                <div className="overflow-y-auto max-h-[300px] pr-4">
                  <p className="text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                    {selectedTeacher.Profile?.TeacherBio || 'Giảng viên giàu kinh nghiệm ôn luyện và bồi dưỡng kiến thức toàn diện cho các em học viên.'}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-blue-900/60 flex justify-end">
                <button
                  onClick={closeTeacherDetailModal}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg hover:brightness-110 transition-all"
                >
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
