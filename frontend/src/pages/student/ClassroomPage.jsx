import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';

const formatTime = (t) => (t ? String(t).slice(0, 5) : '');

const LESSON_STATUS_INFO = {
  2: { label: 'Đã hoàn thành', cls: 'bg-emerald-50 text-[#065f46] border border-emerald-200/60' },
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
    <MainLayout hideFooter={true} hideChatbot={true}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 space-y-6 select-none text-slate-800 pb-16">

        {/* Breadcrumb Navigation & Prominent Back Button */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            to="/Student/Dashboard"
            className="inline-flex items-center gap-2 bg-white border border-slate-200/90 shadow-xs px-4 py-2.5 rounded-xl text-slate-700 font-bold text-sm hover:bg-[#065f46] hover:text-white hover:border-[#065f46] transition-all no-underline group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-white transition-colors">
              arrow_back
            </span>
            <span>Quay lại Dashboard</span>
          </Link>

          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Link to="/Student/Dashboard" className="hover:text-[#065f46] transition-colors">Trang chủ</Link>
            <span className="text-slate-300">›</span>
            <span className="text-[#065f46] font-bold">Chi tiết Lớp học</span>
          </div>
        </div>

        {/* Loading / Error / Emerald Hero Banner */}
        {loading ? (
          <div className="flex justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-[#065f46] text-3xl" />
          </div>
        ) : !activeClass ? (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 text-slate-500 font-semibold shadow-xs">
            Không tìm thấy thông tin lớp học.
          </div>
        ) : (
          <>
            {/* Rich Emerald Hero Banner */}
            <section className="relative bg-gradient-to-r from-[#065f46] via-[#047857] to-[#0d9488] text-white py-8 px-8 rounded-2xl overflow-hidden shadow-md">
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                  backgroundSize: '36px 36px'
                }}
              />
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-white/20 text-white backdrop-blur-xs border border-white/20 px-3 py-1 rounded-lg font-black text-xs">
                      {activeClass.ClassName}
                    </span>
                    <span className="bg-white/15 text-emerald-100 backdrop-blur-xs border border-white/10 px-3 py-1 rounded-lg font-bold text-xs">
                      {activeClass.Course?.Title}
                    </span>
                    <span className="bg-white/15 text-white backdrop-blur-xs border border-white/10 px-3 py-1 rounded-lg font-bold text-xs">
                      👥 {studentCount} Học viên
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-serif">
                    Lớp: {activeClass.ClassName}
                  </h1>
                  <p className="text-emerald-100 flex items-center gap-2 text-sm font-medium">
                    <span className="material-symbols-outlined text-emerald-200 text-[20px]">school</span>
                    Giảng dạy: <strong className="text-white font-bold">{activeClass.Teacher?.FullName || 'Chưa phân công'}</strong>
                  </p>
                </div>

                <div className="hidden sm:flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 p-2 shadow-inner border border-white/20 backdrop-blur-xs">
                  <div className="w-full h-full rounded-xl bg-white/20 flex items-center justify-center text-4xl shadow-xs">
                    🎓
                  </div>
                </div>
              </div>
            </section>

            {/* Lessons list card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#065f46] text-[22px]">menu_book</span>
                  Danh sách Buổi học
                </h2>
                <span className="text-xs font-bold text-[#065f46] bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-lg">
                  Tổng số: {lessons.length} buổi
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {lessons.map((lesson, idx) => {
                  const isSameDay = new Date().toDateString() === new Date(lesson.LessonDate).toDateString();
                  const isLive = lesson.Status === 1 || (lesson.Status === 0 && isSameDay);
                  const statusInfo = LESSON_STATUS_INFO[lesson.Status] || (isLive ? { label: 'Đang diễn ra', cls: 'bg-rose-50 text-rose-600 border border-rose-200/60' } : { label: 'Chưa mở', cls: 'bg-slate-100 text-slate-500' });
                  return (
                    <div key={lesson.Id || idx} className="py-4.5 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${isLive ? 'text-rose-600' : lesson.Status === 2 ? 'text-[#065f46]' : 'text-slate-400'}`}>
                          Buổi {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">{lesson.Title}</h4>
                        <div className="flex gap-4 text-xs text-slate-500 font-medium">
                          <span>Ngày học: <strong>{new Date(lesson.LessonDate).toLocaleDateString('vi-VN')}</strong></span>
                          <span>Ca học: <strong>{formatTime(lesson.StartTime)} - {formatTime(lesson.EndTime)}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {isLive && (
                          <button
                            onClick={() => {
                              const zoomUrl = lesson.MeetingUrl || (lesson.MeetingId ? `https://zoom.us/j/${lesson.MeetingId}` : 'https://zoom.us/j/8889991234');
                              window.open(zoomUrl, '_blank', 'noopener,noreferrer');
                            }}
                            className="px-4 py-2 bg-[#065f46] hover:bg-[#047857] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all cursor-pointer animate-pulse"
                          >
                            <span className="material-symbols-outlined text-[18px]">videocam</span>
                            Vào học Zoom
                          </button>
                        )}
                        <span className={`text-xs font-bold px-3 py-1 rounded-lg ${statusInfo.cls}`}>{statusInfo.label}</span>
                        <div className="relative">
                          <button
                            onClick={() => setOpenLessonMenuId(openLessonMenuId === lesson.Id ? null : lesson.Id)}
                            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                          {openLessonMenuId === lesson.Id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenLessonMenuId(null)} />
                              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
                                <button
                                  onClick={() => { setOpenLessonMenuId(null); setLessonDetail(lesson); }}
                                  className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[18px] text-[#065f46]">play_circle</span> Xem lại buổi học
                                </button>
                                <button
                                  onClick={() => { setOpenLessonMenuId(null); setLessonAssignmentsModal(lesson); }}
                                  className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[18px] text-amber-500">assignment</span> Bài tập về nhà
                                </button>
                                <button
                                  onClick={() => handleDocumentClick(lesson)}
                                  className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[18px] text-teal-600">folder_open</span> Tài liệu
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
                  <div className="text-center py-10 text-slate-400 italic text-sm">Chưa có lịch buổi học nào cho lớp này.</div>
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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-8 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold bg-emerald-50 text-[#065f46] border border-emerald-200/60 px-2.5 py-1 rounded-lg">{activeClass?.ClassName}</span>
                  <h3 className="font-bold text-2xl text-slate-900 mt-2 font-serif">{l.Title}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(l.LessonDate).toLocaleDateString('vi-VN')} | {formatTime(l.StartTime)} - {formatTime(l.EndTime)}
                  </p>
                </div>
                <button onClick={() => setLessonDetail(null)} className="text-slate-400 hover:text-slate-700 text-3xl leading-none cursor-pointer">&times;</button>
              </div>

              <div className="space-y-5">
                {l.Status === 2 ? (
                  <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200">
                    <h4 className="font-bold text-emerald-900 mb-2">Video ghi hình buổi học</h4>
                    {l.VideoUrl ? (
                      <a href={l.VideoUrl} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-3 bg-[#065f46] hover:bg-[#047857] text-white font-bold rounded-xl text-sm no-underline transition-all">
                        Xem Video Replay
                      </a>
                    ) : (
                      <p className="text-sm text-emerald-700 italic">Buổi học này chưa được cập nhật video xem lại. Vui lòng quay lại sau!</p>
                    )}
                  </div>
                ) : isLive ? (
                  <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200">
                    <h4 className="font-bold text-[#065f46] mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">videocam</span>
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
                      className="block text-center w-full py-3 bg-[#065f46] hover:bg-[#047857] text-white font-bold rounded-xl text-sm no-underline shadow-xs transition-all"
                    >
                      Mở trang Zoom tham gia lớp học ngay
                    </a>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-center">
                    <p className="text-sm text-slate-500">Buổi học này chưa mở. Vui lòng quay lại vào ngày học để xem chi tiết.</p>
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Tài liệu đính kèm từ giảng viên</h4>
                  {l.DocumentUrl ? (
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-sm font-semibold text-slate-800 truncate">{l.DocumentName || 'Tài liệu học tập'}</span>
                      <a href={l.DocumentUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#065f46] hover:bg-[#047857] text-white font-bold rounded-lg text-xs no-underline shrink-0 ml-2">
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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-8 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-lg">{l.Title}</span>
                  <h3 className="font-bold text-2xl text-slate-900 mt-2 font-serif">Bài Tập Về Nhà</h3>
                </div>
                <button onClick={() => setLessonAssignmentsModal(null)} className="text-slate-400 hover:text-slate-700 text-3xl leading-none cursor-pointer">&times;</button>
              </div>

              {lessonAssignments.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-8">Buổi học này chưa có bài tập nào được giao.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {lessonAssignments.map((item) => {
                    const sub = submissions[item.Id] || null;
                    const isOverdue = !sub && new Date() > new Date(item.DueDate);
                    return (
                      <div key={item.Id} className="flex items-center justify-between gap-4 bg-slate-50 border border-slate-100 rounded-xl px-5 py-4">
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-slate-900 text-sm sm:text-base">{item.Title}</h5>
                          <p className="text-xs text-slate-500 mt-1">Hạn nộp: {new Date(item.DueDate).toLocaleString('vi-VN')}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {sub && sub.Grade !== null ? (
                            <span className="text-emerald-600 font-black text-sm">{Number(sub.Grade).toFixed(1)}/10</span>
                          ) : sub ? (
                            <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold">Chờ chấm</span>
                          ) : isOverdue ? (
                            <span className="bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-1 rounded-lg text-xs font-bold">Trễ hạn</span>
                          ) : (
                            <span className="bg-slate-200 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold">Chưa làm</span>
                          )}
                          <Link
                            to={`/Student/DoAssignment/${item.Id}`}
                            className={`px-4 py-2 rounded-xl text-sm font-bold no-underline whitespace-nowrap transition-all ${
                              sub ? 'bg-white text-[#065f46] border border-slate-200 hover:bg-slate-50' : 'bg-[#065f46] hover:bg-[#047857] text-white shadow-xs'
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
