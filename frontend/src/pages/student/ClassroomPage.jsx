import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';

export default function ClassroomPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetchData(`/Student/Classroom/${id}`);

  const activeClass = data?.Class || null;
  const lessons = data?.lessons || [];
  const studentCount = data?.studentCount || 0;
  const activeLesson = lessons.find(l => l.Status === 1) || null;
  const classroomFiles = data?.classroomFiles || [];
  const assignments = data?.assignments || [];

  return (
    <MainLayout hideHeader={false}>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 select-none text-slate-800">
        
        {/* Back Link */}
        <div className="mb-4">
          <Link to="/Student/Dashboard" className="inline-flex items-center gap-1 text-primary font-bold hover:underline text-xs">
            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            Quay lại Dashboard
          </Link>
        </div>

        {/* Header Banner */}
        {loading ? (
          <div className="flex justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
          </div>
        ) : !activeClass ? (
          <div className="text-center py-10 text-slate-500 font-semibold">
            Không tìm thấy thông tin lớp học.
          </div>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-3xl border border-slate-100 flex items-center px-8 md:px-12 py-8 min-h-[160px] bg-gradient-to-br from-blue-50 via-white to-sky-50 shadow-sm">
              <div className="relative z-10 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-[10px]">
                    {activeClass.ClassName}
                  </span>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-[10px]">
                    {activeClass.Course?.Title}
                  </span>
                  <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full font-bold text-[10px] border border-slate-200 text-slate-500">
                    {studentCount} Học viên
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800">Lớp: {activeClass.ClassName}</h1>
                <p className="text-slate-500 flex items-center gap-1.5 text-xs md:text-sm font-semibold">
                  <span className="material-symbols-outlined text-primary text-[18px]">school</span>
                  Giảng dạy: <span className="text-primary font-bold">{activeClass.Teacher?.FullName || 'Chưa có giáo viên'}</span>
                </p>
              </div>
            </section>

            {/* Active Zoom/Meet Banner */}
            {activeLesson && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[9px] border border-white/10 inline-flex items-center gap-1 uppercase font-bold tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span> Live
                  </span>
                  <h3 className="font-extrabold text-base md:text-lg">Lớp học Online đang diễn ra</h3>
                  <p className="opacity-90 text-xs md:text-sm">
                    Buổi học: <strong className="underline">{activeLesson.Title}</strong> | Thời gian: {activeLesson.StartTime} - {activeLesson.EndTime}
                  </p>
                </div>
                <div>
                  {activeLesson.MeetingUrl && (
                    <a
                      href={activeLesson.MeetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-white text-rose-600 hover:bg-rose-50 px-6 py-2.5 rounded-xl font-bold shadow-md transition-all text-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">video_call</span>
                      Vào Lớp Học Online
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Lessons & Files */}
              <div className="lg:col-span-8 space-y-8">
                {/* Lessons Section */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
                  <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                    Lịch học & Bài giảng
                  </h2>
                  <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-2">
                    {lessons.map((lesson, idx) => (
                      <div key={idx} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 text-xs md:text-sm">{lesson.Title}</h4>
                          <div className="flex gap-4 text-[10px] text-slate-400 font-semibold">
                            <span>📅 Ngày học: {new Date(lesson.LessonDate).toLocaleDateString('vi-VN')}</span>
                            <span>⏰ Ca học: {lesson.StartTime} - {lesson.EndTime}</span>
                          </div>
                        </div>
                        <div>
                          {lesson.Status === 1 ? (
                            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold">Đang diễn ra</span>
                          ) : lesson.Status === 2 ? (
                            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold">Đã học xong</span>
                          ) : (
                            <span className="bg-blue-50 text-primary px-3 py-1 rounded-full text-[10px] font-bold">Chưa học</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {lessons.length === 0 && (
                      <div className="text-center py-10 text-slate-400 italic text-xs">Chưa có bài giảng nào được tạo.</div>
                    )}
                  </div>
                </div>

                {/* Files Section */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
                  <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">folder_open</span>
                    Tài liệu bài giảng
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {classroomFiles.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.FileUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 border border-slate-200 hover:border-primary hover:bg-slate-50 rounded-2xl flex items-center gap-3 transition-all"
                      >
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl shrink-0">
                          <i className="fa-solid fa-file-pdf" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 text-xs truncate">{file.FileName}</p>
                          <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">Tải file PDF</span>
                        </div>
                      </a>
                    ))}
                    {classroomFiles.length === 0 && (
                      <div className="col-span-full text-center py-6 text-slate-400 italic text-xs">Không có tài liệu nào trong phòng học.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Assignments */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
                  <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">assignment</span>
                    Bài tập về nhà
                  </h2>
                  <div className="space-y-3">
                    {assignments.map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">{item.Title}</h4>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-1">Hạn nộp: {new Date(item.DueDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <Link
                          to={`/Student/DoAssignment/${item.Id}`}
                          className="w-full text-center bg-primary hover:bg-primary-hover text-white text-[10px] py-2 rounded-xl font-bold shadow-md block transition-all"
                        >
                          Làm bài tập
                        </Link>
                      </div>
                    ))}
                    {assignments.length === 0 && (
                      <div className="text-center py-6 text-slate-400 italic text-xs">Không có bài tập nào cần làm.</div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
