import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';

const formatTime = (t) => (t ? String(t).slice(0, 5) : '');

const LESSON_STATUS_INFO = {
  2: { label: 'Đã hoàn thành', cls: 'bg-emerald-50 text-emerald-600' },
};

export default function ClassroomPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetchData(`/Student/Classroom/${id}`);

  const activeClass = data?.Class || null;
  const lessons = data?.lessons || [];
  const studentCount = data?.studentCount || 0;
  const assignments = data?.assignments || [];
  const submissions = data?.submissions || {}; // { [assignmentId]: submission }

  const [openLessonMenuId, setOpenLessonMenuId] = useState(null);
  const [lessonDetail, setLessonDetail] = useState(null); // lesson
  const [lessonAssignmentsModal, setLessonAssignmentsModal] = useState(null); // lesson

  const handleDocumentClick = (lesson) => {
    setOpenLessonMenuId(null);
    if (lesson.DocumentUrl) {
      window.open(lesson.DocumentUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('Giảng viên chưa đính kèm tài liệu cho buổi học này.');
    }
  };

  return (
    <MainLayout hideHeader={true}>
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


            {/* Lessons list */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">menu_book</span>
                Danh sách Buổi học
              </h2>
              <div className="divide-y divide-slate-100">
                {lessons.map((lesson, idx) => {
                  const isSameDay = new Date().toDateString() === new Date(lesson.LessonDate).toDateString();
                  const isLive = lesson.Status === 1 || (lesson.Status === 0 && isSameDay);
                  const statusInfo = LESSON_STATUS_INFO[lesson.Status] || (isLive ? { label: 'Đang diễn ra', cls: 'bg-red-50 text-red-600' } : { label: 'Chưa mở', cls: 'bg-slate-100 text-slate-500' });
                  return (
                    <div key={lesson.Id || idx} className="py-4 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isLive ? 'text-rose-600' : lesson.Status === 2 ? 'text-primary' : 'text-slate-400'}`}>
                          Buổi {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs md:text-sm truncate">{lesson.Title}</h4>
                        <div className="flex gap-4 text-[10px] text-slate-400 font-semibold">
                          <span>Ngày học: {new Date(lesson.LessonDate).toLocaleDateString('vi-VN')}</span>
                          <span>Ca học: {formatTime(lesson.StartTime)} - {formatTime(lesson.EndTime)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isLive && (
                          <button
                            onClick={() => {
                              const zoomUrl = lesson.MeetingUrl || (lesson.MeetingId ? `https://zoom.us/j/${lesson.MeetingId}` : 'https://zoom.us/j/8889991234');
                              window.open(zoomUrl, '_blank', 'noopener,noreferrer');
                            }}
                            className="px-3.5 py-1.5 bg-[#2D8CFF] hover:bg-blue-600 text-white font-bold rounded-lg text-xs md:text-sm flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
                          >
                            🎥 Vào học Zoom
                          </button>
                        )}
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusInfo.cls} ${isLive ? 'animate-pulse' : ''}`}>{statusInfo.label}</span>
                        <div className="relative">
                          <button
                            onClick={() => setOpenLessonMenuId(openLessonMenuId === lesson.Id ? null : lesson.Id)}
                            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                          {openLessonMenuId === lesson.Id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenLessonMenuId(null)} />
                              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
                                <button
                                  onClick={() => { setOpenLessonMenuId(null); setLessonDetail(lesson); }}
                                  className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-[18px] text-primary">play_circle</span> Xem lại buổi học
                                </button>
                                <button
                                  onClick={() => { setOpenLessonMenuId(null); setLessonAssignmentsModal(lesson); }}
                                  className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-[18px] text-amber-500">assignment</span> Bài tập về nhà
                                </button>
                                <button
                                  onClick={() => handleDocumentClick(lesson)}
                                  className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-[18px] text-emerald-500">folder_open</span> Tài liệu
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {lessons.length === 0 && (
                  <div className="text-center py-10 text-slate-400 italic text-xs">Chưa có lịch buổi học nào cho lớp này.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ==================== Large Modal: Xem lại buổi học ==================== */}
      {lessonDetail && (() => {
        const l = lessonDetail;
        const isSameDay = new Date().toDateString() === new Date(l.LessonDate).toDateString();
        const isLive = l.Status === 1 || (l.Status === 0 && isSameDay);
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setLessonDetail(null)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-10 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold bg-sky-50 text-primary px-2.5 py-1 rounded-full">{activeClass?.ClassName}</span>
                  <h3 className="font-bold text-2xl text-slate-900 mt-2">{l.Title}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(l.LessonDate).toLocaleDateString('vi-VN')} | {formatTime(l.StartTime)} - {formatTime(l.EndTime)}
                  </p>
                </div>
                <button onClick={() => setLessonDetail(null)} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
              </div>

              <div className="space-y-5">
                {l.Status === 2 ? (
                  <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                    <h4 className="font-bold text-emerald-800 mb-2">Video ghi hình buổi học</h4>
                    {l.VideoUrl ? (
                      <a href={l.VideoUrl} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm no-underline">
                        Xem Video Replay
                      </a>
                    ) : (
                      <p className="text-sm text-emerald-700 italic">Buổi học này chưa được cập nhật video xem lại. Vui lòng quay lại sau!</p>
                    )}
                  </div>
                ) : isLive ? (
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 fill-current text-[#2D8CFF]" viewBox="0 0 24 24">
                        <path d="M4.5 4.5A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 15 4.5H4.5zm13.75 3.31a.75.75 0 0 0-1.125-.652L15 8.448V15.55l2.125 1.29a.75.75 0 0 0 1.125-.652V7.81z"/>
                      </svg>
                      Phòng học trực tuyến Zoom
                    </h4>
                    <div className="grid grid-cols-[110px_1fr] gap-y-1.5 text-sm text-slate-600 mb-4">
                      <span>Meeting ID:</span> <strong className="text-slate-800">{l.MeetingId || '888-999-1234'}</strong>
                      <span>Mật khẩu:</span> <strong className="text-slate-800">{l.MeetingPassword || '123456'}</strong>
                    </div>
                    <a
                      href={l.MeetingUrl || (l.MeetingId ? `https://zoom.us/j/${l.MeetingId}` : 'https://zoom.us/j/8889991234')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center w-full py-3 bg-[#2D8CFF] hover:bg-blue-600 text-white font-bold rounded-xl text-sm no-underline shadow-md transition-all hover:scale-[1.01]"
                    >
                      Mở trang Zoom tham gia lớp học ngay
                    </a>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-center">
                    <p className="text-sm text-slate-500">Buổi học này chưa mở. Vui lòng quay lại vào ngày học để xem chi tiết.</p>
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Tài liệu đính kèm từ giảng viên</h4>
                  {l.DocumentUrl ? (
                    <div className="flex items-center justify-between px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl">
                      <span className="text-sm font-semibold text-sky-800 truncate">{l.DocumentName || 'Tài liệu học tập'}</span>
                      <a href={l.DocumentUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs no-underline shrink-0 ml-2">
                        Tải xuống
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Giảng viên chưa đính kèm tài liệu cho buổi học này.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ==================== Large Modal: Bài tập về nhà của buổi học ==================== */}
      {lessonAssignmentsModal && (() => {
        const l = lessonAssignmentsModal;
        const lessonAssignments = assignments.filter((a) => a.LessonId === l.Id);
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setLessonAssignmentsModal(null)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-10 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">{l.Title}</span>
                  <h3 className="font-bold text-2xl text-slate-900 mt-2">Bài Tập Về Nhà</h3>
                </div>
                <button onClick={() => setLessonAssignmentsModal(null)} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
              </div>

              {lessonAssignments.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-8">Buổi học này chưa có bài tập nào được giao.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {lessonAssignments.map((item) => {
                    const sub = submissions[item.Id] || null;
                    const isOverdue = !sub && new Date() > new Date(item.DueDate);
                    return (
                      <div key={item.Id} className="flex items-center justify-between gap-4 bg-slate-50 rounded-xl px-5 py-4">
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-slate-800 text-sm">{item.Title}</h5>
                          <p className="text-xs text-slate-500 mt-1">Hạn nộp: {new Date(item.DueDate).toLocaleString('vi-VN')}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {sub && sub.Grade !== null ? (
                            <span className="text-emerald-600 font-black text-sm">{Number(sub.Grade).toFixed(1)}/10</span>
                          ) : sub ? (
                            <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold">Chờ chấm</span>
                          ) : isOverdue ? (
                            <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-xs font-bold">Trễ hạn</span>
                          ) : (
                            <span className="bg-slate-200 text-slate-500 px-2.5 py-1 rounded-md text-xs font-bold">Chưa làm</span>
                          )}
                          <Link
                            to={`/Student/DoAssignment/${item.Id}`}
                            className={`px-4 py-2 rounded-lg text-sm font-bold no-underline whitespace-nowrap ${
                              sub ? 'bg-white text-primary border border-slate-200' : 'bg-primary text-white'
                            }`}
                          >
                            {sub ? (sub.Grade !== null ? 'Làm lại' : 'Xem lại') : 'Làm bài'}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </MainLayout>
  );
}
