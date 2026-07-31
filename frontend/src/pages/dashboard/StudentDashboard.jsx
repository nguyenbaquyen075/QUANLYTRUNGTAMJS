import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetchData } from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { key: 'my-courses', label: 'Khóa học của tôi' },
  { key: 'courses-store', label: 'Đăng ký khóa học' },
  { key: 'schedule', label: 'Lịch học lớp' },
  { key: 'assignments', label: 'Bài tập về nhà' },
  { key: 'quizzes', label: 'Bài kiểm tra' },
  { key: 'progress', label: 'Tiến độ học tập' },
];

const formatTime = (t) => (t ? String(t).slice(0, 5) : '');

const LESSON_STATUS_INFO = {
  1: { label: 'Đang học', cls: 'bg-red-50 text-red-600' },
  2: { label: 'Đã kết thúc', cls: 'bg-slate-100 text-slate-500' },
  3: { label: 'Đã hủy', cls: 'bg-slate-100 text-slate-500' },
};
const defaultLessonStatus = { label: 'Sắp diễn ra', cls: 'bg-amber-50 text-amber-600' };

const ATTENDANCE_INFO = {
  0: { label: 'Có mặt', cls: 'bg-emerald-50 text-emerald-600' },
  1: { label: 'Đi muộn', cls: 'bg-amber-50 text-amber-600' },
  2: { label: 'Vắng có phép', cls: 'bg-sky-50 text-sky-600' },
  3: { label: 'Vắng không phép', cls: 'bg-red-50 text-red-600' },
};

const CARD_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
const cardColorFor = (id) => CARD_COLORS[(id || 0) % CARD_COLORS.length];

function ProgressBar({ percent }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full" style={{ width: `${clamped}%` }} />
    </div>
  );
}

export default function StudentDashboard() {
  const { data, loading } = useFetchData('/Student/Dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-courses');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const enrollments = data?.enrollments || [];
  const lessons = data?.lessons || [];
  const assignments = data?.assignments || [];
  const submissions = data?.submissions || [];
  const submittedIds = data?.submittedIds || [];
  const allCourses = data?.allCourses || [];
  const attendances = data?.attendances || [];

  // Faithful port of backend/src/views/student/dashboard.ejs naming: "essay" tab (Bài tập về nhà) shows
  // AssignmentType 0, "quiz" tab (Bài kiểm tra) shows AssignmentType 1 — matches the live EJS exactly.
  const essayAssignments = useMemo(() => assignments.filter((a) => a.AssignmentType === 0), [assignments]);
  const quizAssignments = useMemo(() => assignments.filter((a) => a.AssignmentType === 1), [assignments]);

  const isSubmitted = (id) => submittedIds.includes(id);
  const getSubmission = (id) => submissions.find((s) => s.AssignmentId === id);

  const currentUserFullName = user?.fullName || 'Học viên';
  const initial = currentUserFullName.charAt(0).toUpperCase();
  const activeLabel = NAV_ITEMS.find((t) => t.key === activeTab)?.label || '';

  const [openScheduleGroups, setOpenScheduleGroups] = useState({});
  const [openAssignmentGroups, setOpenAssignmentGroups] = useState({});
  const [openQuizGroups, setOpenQuizGroups] = useState({});
  const toggleGroup = (setter, key) => setter((prev) => ({ ...prev, [key]: !prev[key] }));

  const [lessonDetail, setLessonDetail] = useState(null); // { lesson, className, teacherName }
  const [progressDetail, setProgressDetail] = useState(null); // enrollment
  const [submissionDetail, setSubmissionDetail] = useState(null); // { assignment, submission }

  const attendedLessonIds = useMemo(() => new Set(attendances.filter((a) => a.VideoAccess === true).map((a) => a.LessonId)), [attendances]);

  const openLessonDetail = (lesson, className, teacherName) => {
    setLessonDetail({ lesson, className, teacherName });
  };

  const openSubmissionDetail = (assignment) => {
    setSubmissionDetail({ assignment, submission: getSubmission(assignment.Id) });
  };

  const [openLessonMenuId, setOpenLessonMenuId] = useState(null);

  const handleLessonAssignmentClick = (lesson) => {
    setOpenLessonMenuId(null);
    const lessonAssignment = assignments.find((a) => a.LessonId === lesson.Id);
    if (!lessonAssignment) {
      alert('Buổi học này chưa có bài tập nào được giao.');
      return;
    }
    if (isSubmitted(lessonAssignment.Id)) {
      openSubmissionDetail(lessonAssignment);
    } else {
      navigate(`/Student/DoAssignment/${lessonAssignment.Id}`);
    }
  };

  const handleLessonDocumentClick = (lesson) => {
    setOpenLessonMenuId(null);
    if (lesson.DocumentUrl) {
      window.open(lesson.DocumentUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('Giảng viên chưa đính kèm tài liệu cho buổi học này.');
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-700 font-sans">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-extrabold text-slate-800 text-base mb-1">Đang tải Góc Học Tập Học Viên...</h3>
          <p className="text-xs text-slate-400">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f7f8fa] text-slate-800 font-sans">
      {/* Top Navbar */}
      <header className="h-[68px] bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-50 shrink-0 select-none">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Ẩn/Hiện thanh Menu"
          >
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </button>
          <Link to="/" className="flex items-center gap-3 text-primary no-underline">
            <img src="/images/logo.jpg" alt="Anh Tê Logo" className="h-10 w-10 rounded-xl object-cover shadow-md" />
            <span className="font-serif italic font-bold text-4xl tracking-tight">Anh Tê</span>
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <Link to="/Notification" className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Thông báo">
            <span className="material-symbols-outlined text-[26px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[11px] font-extrabold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white">3</span>
          </Link>
          <button type="button" className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Trợ giúp">
            <span className="material-symbols-outlined text-[26px]">help_outline</span>
          </button>

          <div className="relative">
            <div
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 pl-1 pr-2.5 py-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary text-white font-bold text-base flex items-center justify-center shadow-sm">
                {initial}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-base font-bold text-slate-800 leading-tight">{currentUserFullName}</div>
                <div className="text-sm text-slate-500 mt-0.5">Học viên hệ thống</div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[22px]">expand_more</span>
            </div>

            {userDropdownOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100">
                  <div className="w-11 h-11 rounded-full bg-primary text-white font-black flex items-center justify-center text-lg">
                    {initial}
                  </div>
                  <div>
                    <div className="font-bold text-base text-slate-800">{currentUserFullName}</div>
                    <div className="text-sm text-slate-400">{user?.email || 'hocvien@trungtam.com'}</div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 border border-primary/20">
                      Học Viên
                    </span>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setActiveTab('progress'); setUserDropdownOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-base font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    Thông tin cá nhân
                  </button>
                  <button
                    onClick={() => alert('Tính năng cài đặt đang phát triển')}
                    className="w-full px-4 py-2.5 text-left text-base font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    Cài đặt tài khoản
                  </button>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2.5 text-left text-base font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <aside className="w-80 bg-white border-r border-slate-200/80 flex flex-col p-5 shrink-0 select-none overflow-y-auto">
            <div className="space-y-1.5 flex-1 pt-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-base transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary rounded-l-none shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto p-9 bg-[#f7f8fa]">
          <div className="flex items-center gap-2 text-base text-slate-500 mb-7 select-none flex-wrap">
            <button onClick={() => setActiveTab('my-courses')} className="text-slate-500 hover:text-primary active:text-primary hover:underline transition-colors">Trang chủ</button>
            <span className="text-slate-300">›</span>
            <span className="text-primary">{activeLabel}</span>
          </div>

          {/* ============ TAB 1: KHÓA HỌC CỦA TÔI ============ */}
          {activeTab === 'my-courses' && (
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-2xl mb-1">Khóa Học Đang Tham Gia</h2>
              <p className="text-sm text-slate-500 mb-6">Danh sách các lớp học trực tuyến bạn đang theo học tại trung tâm.</p>

              {enrollments.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl text-center py-16 px-6">
                  <h4 className="font-bold text-slate-900 mb-1.5">Bạn chưa đăng ký lớp học nào</h4>
                  <p className="text-sm text-slate-500 mb-5">Vui lòng truy cập Tab Đăng ký khóa học để tham gia các lớp học bổ trợ.</p>
                  <button onClick={() => setActiveTab('courses-store')} className="px-5 py-2.5 bg-primary hover:bg-primary/80 text-white font-bold rounded-xl text-sm">
                    Xem khóa học
                  </button>
                </div>
              ) : (
                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                  {enrollments.map((e) => {
                    const course = e.Class?.Course;
                    const color = cardColorFor(e.Class?.CourseId);
                    return (
                      <div key={e.Id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                        <div className="relative w-full aspect-video bg-slate-100">
                          <span className="absolute top-3 left-3 bg-primary text-white text-[11px] font-black uppercase px-2 py-1 rounded-md z-10">
                            {course?.CourseCode}
                          </span>
                          {course?.ImageUrl ? (
                            <img src={course.ImageUrl} alt={e.Class?.ClassName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}, #1e293b)` }}>
                              <span className="material-symbols-outlined text-white/30 text-5xl">school</span>
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex flex-col gap-3 flex-1">
                          <span className="text-sm text-slate-500">GV: <strong className="text-slate-700">{e.Class?.Teacher?.FullName || 'Chưa phân công'}</strong></span>
                          <h3 className="font-bold text-lg text-slate-900">{e.Class?.ClassName}</h3>
                          <div className="border-t border-slate-100 pt-3 mt-auto flex justify-between items-center">
                            <span className="text-sm text-slate-500">Lịch học trực tuyến lớp</span>
                            <Link to={`/Student/Classroom/${e.ClassId}`} className="px-4 py-2 bg-primary hover:bg-primary/80 text-white font-bold rounded-lg text-sm no-underline">
                              Vào lớp
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============ TAB 2: ĐĂNG KÝ KHÓA HỌC ============ */}
          {activeTab === 'courses-store' && (
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-2xl mb-1">Khóa Học Khả Dụng</h2>
              <p className="text-sm text-slate-500 mb-6">Danh sách khóa học chất lượng cao tại trung tâm. Đăng ký để liên hệ tư vấn mua khóa học.</p>

              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {allCourses.map((c) => {
                  const isJoined = enrollments.some((e) => e.Class?.CourseId === c.Id);
                  const color = cardColorFor(c.Id);
                  return (
                    <div key={c.Id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                      <div className="relative w-full aspect-video bg-slate-100">
                        <span className="absolute top-3 left-3 bg-primary text-white text-[11px] font-black uppercase px-2 py-1 rounded-md z-10">
                          {c.CourseCode}
                        </span>
                        {c.ImageUrl ? (
                          <img src={c.ImageUrl} alt={c.Title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}, #1e293b)` }}>
                            <span className="material-symbols-outlined text-white/30 text-5xl">school</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col gap-3 flex-1">
                        <h3 className="font-bold text-lg text-slate-900">{c.Title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-3">{c.Description}</p>
                        <div className="border-t border-slate-100 pt-3 mt-auto flex justify-between items-center">
                          <div>
                            <span className="text-xs text-slate-500 block">Học phí gốc</span>
                            <strong className="text-emerald-600 text-lg font-black">{Number(c.BasePrice).toLocaleString('vi-VN')} đ</strong>
                          </div>
                          {isJoined ? (
                            <span className="inline-flex items-center text-sm font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg">Đang học</span>
                          ) : (
                            <Link to="/Home/Courses" className="px-4 py-2 bg-primary hover:bg-primary/80 text-white font-bold rounded-lg text-sm no-underline">
                              Mua ngay
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ TAB 3: LỊCH HỌC LỚP ============ */}
          {activeTab === 'schedule' && (
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-2xl mb-1">Lịch Học Lớp</h2>
              <p className="text-sm text-slate-500 mb-6">Xem và theo dõi lịch trình chi tiết các buổi học trực tuyến theo từng lớp học.</p>

              {enrollments.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl text-center py-16 px-6">
                  <h4 className="font-bold text-slate-900 mb-1.5">Bạn chưa tham gia lớp học nào</h4>
                  <p className="text-sm text-slate-500">Vui lòng đăng ký khóa học để xem lịch lớp học.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {enrollments.map((e) => {
                    const classLessons = lessons.filter((l) => l.ClassId === e.ClassId);
                    const isOpen = !!openScheduleGroups[e.ClassId];
                    return (
                      <div key={e.Id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div
                          onClick={() => toggleGroup(setOpenScheduleGroups, e.ClassId)}
                          className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer select-none"
                        >
                          <div>
                            <span className="text-sm text-slate-500">{e.Class?.Course?.Title || 'Khóa học'}</span>
                            <div className="font-bold text-slate-900">{e.Class?.ClassName}</div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">{classLessons.length} buổi học</span>
                            <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`}>expand_more</span>
                          </div>
                        </div>
                        {isOpen && (
                          <div className="p-5 flex flex-col gap-2.5">
                            {classLessons.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-3">Chưa có lịch học nào được tạo cho lớp học này.</p>
                            ) : (
                              classLessons.map((l) => {
                                const isPast = new Date(l.LessonDate) < new Date();
                                const statusInfo = LESSON_STATUS_INFO[l.Status] || (isPast ? { label: 'Lớp đã đóng', cls: 'bg-slate-100 text-slate-500' } : defaultLessonStatus);
                                return (
                                  <div
                                    key={l.Id}
                                    className={`flex items-center justify-between gap-4 border border-slate-200 rounded-xl px-4 py-3 transition-colors ${isPast ? 'opacity-75' : ''}`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="bg-sky-50 text-primary border border-sky-200 rounded-xl w-14 h-14 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[10px] uppercase font-black">T.{new Date(l.LessonDate).getMonth() + 1}</span>
                                        <strong className="text-lg leading-none">{new Date(l.LessonDate).getDate()}</strong>
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-sm text-slate-800">{l.Title}</h4>
                                        <p className="text-sm text-slate-500 mt-0.5">Giờ học: {formatTime(l.StartTime)} - {formatTime(l.EndTime)}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {l.Status === 1 ? (
                                        <>
                                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white">Đang diễn ra</span>
                                          <Link to={`/Student/Classroom/${l.ClassId}`} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm no-underline">
                                            Vào học
                                          </Link>
                                        </>
                                      ) : (
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusInfo.cls}`}>{statusInfo.label}</span>
                                      )}
                                      <div className="relative">
                                        <button
                                          onClick={(ev) => { ev.stopPropagation(); setOpenLessonMenuId(openLessonMenuId === l.Id ? null : l.Id); }}
                                          className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center"
                                        >
                                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                        </button>
                                        {openLessonMenuId === l.Id && (
                                          <>
                                            <div className="fixed inset-0 z-10" onClick={() => setOpenLessonMenuId(null)} />
                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
                                              <button
                                                onClick={() => { setOpenLessonMenuId(null); openLessonDetail(l, e.Class?.ClassName, e.Class?.Teacher?.FullName); }}
                                                className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                              >
                                                <span className="material-symbols-outlined text-[18px] text-primary">play_circle</span> Xem bài giảng
                                              </button>
                                              <button
                                                onClick={() => handleLessonAssignmentClick(l)}
                                                className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                              >
                                                <span className="material-symbols-outlined text-[18px] text-amber-500">assignment</span> Bài tập
                                              </button>
                                              <button
                                                onClick={() => handleLessonDocumentClick(l)}
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
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============ TAB 4: BÀI TẬP VỀ NHÀ ============ */}
          {activeTab === 'assignments' && (
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-2xl mb-1">Bài Tập Về Nhà</h2>
              <p className="text-sm text-slate-500 mb-6">Thực hiện đầy đủ các bài tập giáo viên giao theo từng lớp học và nộp bài đúng hạn.</p>

              {enrollments.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl text-center py-16 px-6">
                  <h4 className="font-bold text-slate-900 mb-1.5">Bạn chưa tham gia lớp học nào</h4>
                  <p className="text-sm text-slate-500">Hãy đăng ký khóa học để theo dõi bài tập.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {enrollments.map((e) => {
                    const classAssignments = essayAssignments.filter((a) => a.Lesson?.ClassId === e.ClassId);
                    const isOpen = !!openAssignmentGroups[e.ClassId];
                    return (
                      <div key={e.Id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div
                          onClick={() => toggleGroup(setOpenAssignmentGroups, e.ClassId)}
                          className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer select-none"
                        >
                          <div>
                            <span className="text-sm text-slate-500">{e.Class?.Course?.Title || 'Khóa học'}</span>
                            <div className="font-bold text-slate-900">{e.Class?.ClassName}</div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">{classAssignments.length} bài tập</span>
                            <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`}>expand_more</span>
                          </div>
                        </div>
                        {isOpen && (
                          <div className="p-5 flex flex-col gap-2.5">
                            {classAssignments.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-3">Chưa có bài tập tự luận nào được giao cho lớp học này.</p>
                            ) : (
                              classAssignments.map((a) => {
                                const isSub = isSubmitted(a.Id);
                                const sub = getSubmission(a.Id);
                                const isOverdue = new Date(a.DueDate) < new Date() && !isSub;
                                return (
                                  <div key={a.Id} className="flex items-center justify-between gap-4 border border-slate-200 rounded-xl px-4 py-3 flex-wrap">
                                    <div>
                                      <h4 className="font-bold text-sm text-slate-800">{a.Title}</h4>
                                      <p className={`text-sm mt-0.5 ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                                        Hạn nộp: {new Date(a.DueDate).toLocaleString('vi-VN')}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {isSub ? (
                                        <div className="flex flex-col items-end gap-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">Đã nộp bài</span>
                                            <button onClick={() => openSubmissionDetail(a)} className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                                              Xem bài làm
                                            </button>
                                          </div>
                                          {sub?.Grade != null ? (
                                            <span className="text-sm font-black text-emerald-600">Điểm: {Number(sub.Grade).toFixed(1)}/10</span>
                                          ) : (
                                            <span className="text-xs text-slate-500">Chờ chấm điểm</span>
                                          )}
                                        </div>
                                      ) : isOverdue ? (
                                        <span className="text-xs font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-full">Quá hạn nộp</span>
                                      ) : (
                                        <Link to={`/Student/DoAssignment/${a.Id}`} className="px-4 py-2 bg-primary hover:bg-primary/80 text-white font-bold rounded-lg text-sm no-underline">
                                          Làm bài ngay
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============ TAB 5: BÀI KIỂM TRA ============ */}
          {activeTab === 'quizzes' && (
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-2xl mb-1">Bài Kiểm Tra Trắc Nghiệm</h2>
              <p className="text-sm text-slate-500 mb-6">Thực hiện các bài test trắc nghiệm khách quan tự động chấm điểm để đánh giá năng lực của bạn.</p>

              {enrollments.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl text-center py-16 px-6">
                  <h4 className="font-bold text-slate-900 mb-1.5">Bạn chưa tham gia lớp học nào</h4>
                  <p className="text-sm text-slate-500">Hãy đăng ký khóa học để theo dõi bài kiểm tra.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {enrollments.map((e) => {
                    const classQuizzes = quizAssignments.filter((q) => q.Lesson?.ClassId === e.ClassId);
                    const isOpen = !!openQuizGroups[e.ClassId];
                    return (
                      <div key={e.Id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div
                          onClick={() => toggleGroup(setOpenQuizGroups, e.ClassId)}
                          className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer select-none"
                        >
                          <div>
                            <span className="text-sm text-slate-500">{e.Class?.Course?.Title || 'Khóa học'}</span>
                            <div className="font-bold text-slate-900">{e.Class?.ClassName}</div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">{classQuizzes.length} bài kiểm tra</span>
                            <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`}>expand_more</span>
                          </div>
                        </div>
                        {isOpen && (
                          <div className="p-5 flex flex-col gap-2.5">
                            {classQuizzes.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-3">Chưa có bài kiểm tra trắc nghiệm nào được giao cho lớp học này.</p>
                            ) : (
                              classQuizzes.map((q) => {
                                const isSub = isSubmitted(q.Id);
                                const sub = getSubmission(q.Id);
                                return (
                                  <div key={q.Id} className="flex items-center justify-between gap-4 border border-slate-200 rounded-xl px-4 py-3 flex-wrap">
                                    <div>
                                      <h4 className="font-bold text-sm text-slate-800">{q.Title}</h4>
                                      <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full mt-1">
                                        Đề chấm tự động bởi AI
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {isSub ? (
                                        <div className="flex flex-col items-end gap-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">Đã hoàn thành</span>
                                            <button onClick={() => openSubmissionDetail(q)} className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                                              Xem bài làm
                                            </button>
                                          </div>
                                          <span className="text-sm font-black text-emerald-600">Điểm: {sub?.Grade != null ? Number(sub.Grade).toFixed(1) : '10'}/10</span>
                                        </div>
                                      ) : (
                                        <Link to={`/Student/DoAssignment/${q.Id}`} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm no-underline">
                                          Bắt đầu Test
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============ TAB 6: TIẾN ĐỘ HỌC TẬP ============ */}
          {activeTab === 'progress' && (
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-2xl mb-1">Tiến Độ & Kết Quả Học Tập</h2>
              <p className="text-sm text-slate-500 mb-6">Thống kê tổng hợp về điểm số, tỉ lệ chuyên cần được trích xuất tự động.</p>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
                <h3 className="font-bold text-slate-900 mb-4">Tiến Độ Khóa Học Đang Tham Gia</h3>
                {enrollments.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">Bạn chưa đăng ký khóa học nào đang hoạt động.</p>
                ) : (
                  <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {enrollments.map((e) => {
                      const total = e.Class?.Course?.TotalLessons || 12;
                      const finished = lessons.filter((l) => l.ClassId === e.ClassId && l.Status === 2).length;
                      const percent = Math.min(Math.round((finished / total) * 100), 100);
                      return (
                        <div
                          key={e.Id}
                          onClick={() => setProgressDetail(e)}
                          className="border border-sky-200 bg-sky-50/60 rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-colors"
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-slate-900 truncate">{e.Class?.Course?.Title || e.Class?.ClassName}</h4>
                              <span className="text-xs text-slate-500 truncate block">Lớp: {e.Class?.ClassName} | GV: {e.Class?.Teacher?.FullName || 'Chưa phân công'}</span>
                            </div>
                            <span className="text-sm font-black text-primary bg-white px-2 py-0.5 rounded-md shrink-0">{percent}%</span>
                          </div>
                          <div className="mt-3">
                            <div className="text-xs text-slate-500 mb-1">Đã học: {finished} / {total} buổi (Bấm xem chi tiết)</div>
                            <ProgressBar percent={percent} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-4">Lịch Sử Điểm Số & Phản Hồi</h3>
                {submissions.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">Chưa có điểm số nào được công bố.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                          <th className="p-3">Bài kiểm tra / Bài tập</th>
                          <th className="p-3 whitespace-nowrap">Lớp học</th>
                          <th className="p-3 whitespace-nowrap">Ngày nộp</th>
                          <th className="p-3 text-center whitespace-nowrap">Điểm số</th>
                          <th className="p-3">Lời phê giáo viên</th>
                          <th className="p-3 text-center whitespace-nowrap">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {submissions.map((s) => (
                          <tr key={s.Id}>
                            <td className="p-3 font-bold text-slate-900">{s.Assignment?.Title || ''}</td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">{s.Assignment?.Lesson?.Class?.ClassName || ''}</td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">{new Date(s.SubmittedAt).toLocaleString('vi-VN')}</td>
                            <td className="p-3 text-center whitespace-nowrap">
                              {s.Grade !== null ? (
                                <strong className="text-emerald-600">{Number(s.Grade).toFixed(1)} / 10</strong>
                              ) : (
                                <span className="text-slate-400 italic">Chờ chấm</span>
                              )}
                            </td>
                            <td className="p-3 text-slate-600 max-w-[220px] truncate" title={s.TeacherComment || ''}>{s.TeacherComment || 'Chưa có nhận xét'}</td>
                            <td className="p-3 text-center whitespace-nowrap">
                              <button
                                onClick={() => s.Assignment && openSubmissionDetail(s.Assignment)}
                                className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                              >
                                Xem bài
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================== Modal: Chi tiết buổi học ==================== */}
      {lessonDetail && (() => {
        const { lesson: l, className, teacherName } = lessonDetail;
        const statusInfo = LESSON_STATUS_INFO[l.Status] || defaultLessonStatus;
        const isAttended = attendedLessonIds.has(l.Id);
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setLessonDetail(null)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-7 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-5 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold bg-sky-50 text-primary px-2.5 py-1 rounded-full">{className}</span>
                  <h3 className="font-bold text-xl text-slate-900 mt-2">{l.Title}</h3>
                </div>
                <button onClick={() => setLessonDetail(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
              </div>

              <div className="space-y-4 mb-2">
                <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <span className="text-slate-500">Giảng viên:</span>
                  <strong className="text-slate-800">{teacherName || 'Chưa cập nhật'}</strong>
                  <span className="text-slate-500">Thời gian:</span>
                  <span className="text-slate-800">{new Date(l.LessonDate).toLocaleDateString('vi-VN')} | {formatTime(l.StartTime)} - {formatTime(l.EndTime)}</span>
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full w-fit ${statusInfo.cls}`}>{statusInfo.label}</span>
                </div>

                {l.MeetingUrl && l.Status !== 2 && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h4 className="font-bold text-sm text-slate-800 mb-2">Phòng học trực tuyến</h4>
                    <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm text-slate-600 mb-3">
                      <span>Meeting ID:</span> <strong className="text-slate-800">{l.MeetingId || 'Không có ID'}</strong>
                      <span>Mật khẩu:</span> <strong className="text-slate-800">{l.MeetingPassword || 'Không có mật khẩu'}</strong>
                    </div>
                    <a href={l.MeetingUrl} target="_blank" rel="noreferrer" className="block text-center w-full py-2.5 bg-primary hover:bg-primary/80 text-white font-bold rounded-xl text-sm no-underline">
                      Tham gia lớp học online
                    </a>
                  </div>
                )}

                {l.VideoUrl && (
                  <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
                    <h4 className="font-bold text-sm text-primary mb-2">Video ghi hình buổi học</h4>
                    {isAttended ? (
                      <a href={l.VideoUrl} target="_blank" rel="noreferrer" className="block text-center w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm no-underline">
                        Xem Video Replay
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-dashed border-sky-300 rounded-xl">
                        <span className="material-symbols-outlined text-primary">lock</span>
                        <div>
                          <p className="text-sm font-bold text-primary">Bạn chưa được điểm danh buổi học này</p>
                          <p className="text-xs text-primary/80 mt-0.5">Video xem lại chỉ có thể truy cập sau khi giáo viên xác nhận điểm danh của bạn.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-sm text-slate-800 mb-2">Tài liệu đính kèm từ giảng viên</h4>
                  {l.DocumentUrl ? (
                    <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-sm font-semibold text-emerald-800 truncate">{l.DocumentName || 'Tài liệu học tập'}</span>
                      <a href={l.DocumentUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs no-underline shrink-0 ml-2">
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

      {/* ==================== Modal: Tiến độ chi tiết khóa học ==================== */}
      {progressDetail && (() => {
        const e = progressDetail;
        const total = e.Class?.Course?.TotalLessons || 12;
        const classLessons = lessons.filter((l) => l.ClassId === e.ClassId);
        const finished = classLessons.filter((l) => l.Status === 2).length;
        const percent = Math.min(Math.round((finished / total) * 100), 100);
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setProgressDetail(null)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-7 max-h-[85vh] overflow-y-auto" onClick={(e2) => e2.stopPropagation()}>
              <div className="flex justify-between items-start mb-5 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold bg-sky-50 text-primary px-2.5 py-1 rounded-full">{e.Class?.ClassName}</span>
                  <h3 className="font-bold text-xl text-slate-900 mt-2">{e.Class?.Course?.Title || 'Tiến độ chi tiết khóa học'}</h3>
                  <p className="text-sm text-slate-500 mt-1">Giảng viên phụ trách: {e.Class?.Teacher?.FullName || 'Chưa phân công'}</p>
                </div>
                <button onClick={() => setProgressDetail(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-bold text-slate-600">Tiến độ hoàn thành</span>
                  <strong className="text-lg font-black text-primary">{percent}%</strong>
                </div>
                <ProgressBar percent={percent} />
                <div className="text-sm text-slate-500 mt-2">Đã học: {finished} / {total} buổi</div>
              </div>

              <h4 className="font-bold text-sm text-slate-800 mb-3">Danh Sách Bài Học & Bài Xem Lại:</h4>
              <div className="flex flex-col gap-2.5">
                {classLessons.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Chưa có buổi học nào được tạo cho lớp này.</p>
                ) : (
                  classLessons.map((l, idx) => {
                    const isFinished = l.Status === 2;
                    const att = attendances.find((a) => a.LessonId === l.Id);
                    const attInfo = isFinished
                      ? (att ? ATTENDANCE_INFO[att.Status] : null) || { label: 'Đã kết thúc', cls: 'bg-slate-100 text-slate-500' }
                      : l.Status === 1
                      ? { label: 'Đang diễn ra', cls: 'bg-sky-50 text-sky-600' }
                      : { label: 'Chưa học', cls: 'bg-slate-100 text-slate-500' };
                    return (
                      <div key={l.Id} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <span className="text-[11px] font-bold text-slate-400">BUỔI {idx + 1} • {new Date(l.LessonDate).toLocaleDateString('vi-VN')}</span>
                            <strong className="block text-sm text-slate-800 mt-0.5">{l.Title}</strong>
                          </div>
                          <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${attInfo.cls}`}>{attInfo.label}</span>
                        </div>
                        {isFinished && (l.VideoUrl || l.DocumentUrl) && (
                          <div className="flex gap-2 mt-2">
                            {l.VideoUrl && (
                              <a href={l.VideoUrl} target="_blank" rel="noreferrer" className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white no-underline">
                                Xem lại video
                              </a>
                            )}
                            {l.DocumentUrl && (
                              <a href={l.DocumentUrl} target="_blank" rel="noreferrer" className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 no-underline">
                                Tài liệu
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ==================== Modal: Chi tiết bài làm đã nộp ==================== */}
      {submissionDetail && (() => {
        const { assignment: a, submission: sub } = submissionDetail;
        let quizQuestions = [];
        let answersParsed = null;
        if (a.AssignmentType === 0 || a.AssignmentType === 2) {
          try { quizQuestions = JSON.parse(a.QuizData || '[]'); } catch { quizQuestions = []; }
          try { answersParsed = JSON.parse(sub?.Content || (a.AssignmentType === 2 ? '{}' : '[]')); } catch { answersParsed = a.AssignmentType === 2 ? {} : []; }
        }
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setSubmissionDetail(null)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-7 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-5 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">Kết quả học tập</span>
                  <h3 className="font-bold text-xl text-slate-900 mt-2">{a.Title || 'Chi tiết bài làm'}</h3>
                </div>
                <button onClick={() => setSubmissionDetail(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
              </div>

              <div className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 mb-2">Đề bài & Yêu cầu</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 whitespace-pre-line">
                    {a.Instruction || 'Không có mô tả hoặc đề bài.'}
                  </div>
                  {a.AttachmentUrl && (
                    <a href={a.AttachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-primary mt-2 no-underline">
                      Tải đề bài
                    </a>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-800 mb-1">Bài làm của bạn</h4>
                  {sub && <p className="text-xs text-slate-500 mb-2">Nộp lúc: {new Date(sub.SubmittedAt).toLocaleString('vi-VN')}</p>}

                  {a.AssignmentType === 0 || a.AssignmentType === 2 ? (
                    <div className="flex flex-col gap-4">
                      {quizQuestions.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">Không có dữ liệu câu hỏi.</p>
                      ) : a.AssignmentType === 0 ? (
                        quizQuestions.map((q, qIdx) => {
                          const studentAns = Array.isArray(answersParsed) ? answersParsed[qIdx] : -1;
                          return (
                            <div key={qIdx} className="border-b border-dashed border-slate-200 pb-3">
                              <div className="flex items-start gap-2 text-sm font-semibold text-slate-800 mb-2">
                                <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded shrink-0">Câu {qIdx + 1}</span>
                                <span>{q.question_text || q.question}</span>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                                  const isCorrect = optIdx === q.correct_index;
                                  const isWrongPick = optIdx === studentAns && !isCorrect;
                                  return (
                                    <div
                                      key={letter}
                                      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${
                                        isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold' : isWrongPick ? 'bg-red-50 border-red-300 text-red-800' : 'bg-white border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <strong>{letter}.</strong> {q.options ? q.options[optIdx] : ''}
                                      {isCorrect && <span className="ml-auto text-xs font-bold text-emerald-600">Đáp án đúng</span>}
                                      {isWrongPick && <span className="ml-auto text-xs font-bold text-red-500">Bạn chọn sai</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        quizQuestions.map((q, qIdx) => (
                          <div key={qIdx} className="border-b border-dashed border-slate-200 pb-3">
                            <div className="text-sm font-semibold text-slate-800 mb-2">{q.stem}</div>
                            <div className="flex flex-col gap-1.5">
                              {['a', 'b', 'c', 'd'].map((letter, ii) => {
                                const item = q.items?.[ii];
                                if (!item) return null;
                                const studentAns = answersParsed?.[qIdx]?.[letter];
                                const isCorrect = studentAns === item.answer;
                                return (
                                  <div key={letter} className={`flex items-center justify-between gap-2 text-sm px-3 py-2 rounded-lg border ${isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
                                    <span><strong className="uppercase">{letter}:</strong> {item.text}</span>
                                    <span className="text-xs font-bold">{item.answer === 'dung' ? 'Đúng' : 'Sai'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-line min-h-[80px]">
                      {sub?.Content || ''}
                    </div>
                  )}

                  {sub?.FileUrl && (
                    <div className="flex items-center justify-between mt-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-sm font-semibold text-emerald-800">File bài làm đã nộp</span>
                      <a href={sub.FileUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs no-underline">
                        Tải file
                      </a>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="font-bold text-sm text-slate-800 mb-3">Nhận xét & Điểm số từ giáo viên</h4>
                  <div className="flex gap-5 items-center">
                    <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-center min-w-[100px]">
                      <span className="text-[11px] font-bold text-slate-500 uppercase block">Điểm số</span>
                      <strong className="text-2xl font-black text-emerald-600">{sub?.Grade != null ? Number(sub.Grade).toFixed(1) : '-'} / 10</strong>
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Lời phê của giáo viên</span>
                      <p className="text-sm text-slate-600 italic">{sub?.TeacherComment || 'Chưa có nhận xét.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
