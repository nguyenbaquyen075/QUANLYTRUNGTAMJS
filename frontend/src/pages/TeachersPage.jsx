import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useFetchData } from '../hooks/useFetchData';

export default function TeachersPage() {
  const { data, loading, error } = useFetchData('/Home/Teachers');
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
    <MainLayout>
      {/* Hero Banner Section */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden select-none">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_30%,rgba(30,58,138,0.4),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-white text-3xl">diversity_3</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-serif leading-tight text-white mb-4">
            Đội Ngũ Giáo Viên Tiêu Biểu
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed font-semibold">
            Học hỏi từ những thầy cô có chuyên môn cao, nhiều năm kinh nghiệm ôn thi và bồi dưỡng, cam kết mang lại lộ trình học tập tối ưu cho từng học sinh.
          </p>
        </div>
      </section>

      {/* Teachers Grid Section */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          {loading ? (
            <div className="flex justify-center py-20">
              <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teachers.length > 0 ? (
                teachers.map((teacher, index) => {
                  const profile = teacher.Profile || {};
                  const avatarUrl = teacher.AvatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop';
                  return (
                    <div
                      key={index}
                      onClick={() => openTeacherDetailModal(teacher)}
                      className="bg-white border border-slate-100 rounded-3xl overflow-visible flex flex-col items-center p-8 text-center hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                    >
                      <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full border-4 border-primary/10 overflow-hidden bg-slate-50 shadow-inner flex items-center justify-center">
                          <img className="w-full h-full object-cover" src={avatarUrl} alt={teacher.FullName} />
                        </div>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-extrabold px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                          {profile.Subject || 'Toán học'}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-primary mb-1 mt-2">{teacher.FullName}</h3>
                      <p className="text-xs font-bold text-slate-500 mb-4">{profile.TeacherTitle || 'Giáo viên tiêu biểu tại trung tâm'}</p>
                      <p className="text-xs text-slate-500 mb-6 leading-relaxed line-clamp-3 italic">
                        "{profile.TeacherBio || 'Giảng viên giàu kinh nghiệm ôn luyện và bồi dưỡng kiến thức toàn diện cho các em học viên.'}"
                      </p>
                      <div className="mt-auto w-full pt-6 border-t border-slate-100 flex justify-between gap-2 text-center">
                        <div className="flex-1">
                          <span className="text-lg font-black text-primary block">{profile.TeacherExperience !== null ? profile.TeacherExperience : 5}+</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Năm KN</span>
                        </div>
                        <div className="flex-1 border-x border-slate-100">
                          <span className="text-lg font-black text-primary block">{profile.TeacherStudents !== null ? profile.TeacherStudents : 100}+</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Học sinh</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-lg font-black text-primary flex items-center justify-center gap-0.5">
                            {profile.TeacherRating !== null ? parseFloat(profile.TeacherRating).toFixed(1) : '4.8'}{' '}
                            <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Đánh giá</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-slate-500">
                  Hiện chưa có danh sách giáo viên nào được kích hoạt.
                </div>
              )}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-24 bg-gradient-to-r from-primary to-blue-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative shadow-2xl border border-white/10 text-white">
            <div className="relative z-10 text-center md:text-left space-y-2">
              <h2 className="text-2xl font-black mb-1 font-serif">Bạn muốn được tư vấn lộ trình học?</h2>
              <p className="text-white/80 text-sm font-semibold">Kết nối ngay với đội ngũ giáo viên và chuyên gia tư vấn của chúng tôi.</p>
            </div>
            <div className="relative z-10 flex gap-4 flex-wrap justify-center items-center">
              <Link to="/Home/Courses" className="bg-white text-primary px-8 py-3.5 rounded-full font-black text-xs shadow-xl hover:bg-slate-50 transition-all flex items-center gap-2 whitespace-nowrap hover:scale-105 active:scale-95">
                <span className="material-symbols-outlined text-[18px]">school</span>
                Xem Khóa Học
              </Link>
              <Link to="/Auth/Register" className="bg-white/10 text-white border border-white/20 px-8 py-3.5 rounded-full font-bold hover:bg-white/20 transition-all whitespace-nowrap text-xs">
                Đăng Ký Ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Teacher Detail Modal */}
      {isModalOpen && selectedTeacher && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          onClick={closeTeacherDetailModal}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeTeacherDetailModal}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center z-10"
            >
              <span className="material-symbols-outlined text-[20px] font-bold">close</span>
            </button>

            {/* Left Side: Profile Intro */}
            <div className="md:w-[35%] bg-slate-50 p-12 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-40 h-40 rounded-full border-4 border-primary/10 overflow-hidden bg-white shadow-md mb-6">
                <img
                  className="w-full h-full object-cover"
                  src={selectedTeacher.AvatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop'}
                  alt={selectedTeacher.FullName}
                />
              </div>
              <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm mb-4">
                {selectedTeacher.Profile?.Subject || 'Toán học'}
              </span>
              <h3 className="text-xl font-extrabold text-primary mb-2 leading-tight">
                {selectedTeacher.FullName}
              </h3>
              <p className="text-xs text-slate-500 font-semibold px-2">
                {selectedTeacher.Profile?.TeacherTitle || 'Giáo viên tiêu biểu'}
              </p>

              <div className="grid grid-cols-3 gap-2 w-full pt-6 border-t border-slate-200 mt-8">
                <div className="text-center">
                  <span className="block text-lg font-extrabold text-primary">{selectedTeacher.Profile?.TeacherExperience !== null ? selectedTeacher.Profile.TeacherExperience : 5}+</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Năm KN</span>
                </div>
                <div className="text-center border-x border-slate-200">
                  <span className="block text-lg font-extrabold text-primary">{selectedTeacher.Profile?.TeacherStudents !== null ? selectedTeacher.Profile.TeacherStudents : 100}+</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Học sinh</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-extrabold text-primary flex items-center justify-center gap-0.5">
                    {selectedTeacher.Profile?.TeacherRating !== null ? parseFloat(selectedTeacher.Profile.TeacherRating).toFixed(1) : '4.8'}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mt-1">Đánh giá</span>
                </div>
              </div>
            </div>

            {/* Right Side: Details / Bio */}
            <div className="md:w-[65%] p-12 flex flex-col justify-between">
              <div className="flex-grow">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  <i className="fa-solid fa-graduation-cap"></i> Tiểu sử & Kinh nghiệm giảng dạy
                </h4>
                <div className="overflow-y-auto max-h-[300px] pr-4">
                  <p className="text-sm text-slate-600 leading-relaxed font-semibold whitespace-pre-line">
                    {selectedTeacher.Profile?.TeacherBio || 'Giảng viên giàu kinh nghiệm ôn luyện và bồi dưỡng kiến thức toàn diện cho các em học viên.'}
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
                <button
                  onClick={closeTeacherDetailModal}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-lg transition-all"
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
