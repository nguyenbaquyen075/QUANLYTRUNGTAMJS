import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetchData } from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';
import { MockTestView } from '../MockTestPage';

const NAV_ITEMS = [
  { key: 'my-courses', label: 'Khóa học của tôi' },
  { key: 'mock-tests', label: 'Thi thử' },
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
  const [searchTerm, setSearchTerm] = useState('');
  const [subFilter, setSubFilter] = useState('Tất cả');

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
              {/* Hero Banner */}
              <section className="relative bg-[#38bdf8] text-white py-10 px-8 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '36px 36px'
                  }}
                />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                      Danh sách khóa học của tôi
                    </h1>
                    <p className="text-blue-50 text-sm font-normal">
                      Các lớp học trực tuyến bạn đang tham gia tại Flash Study
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-24 h-24 rounded-full bg-sky-200/40 p-2 shadow-inner border border-white/20">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-400 to-blue-200 flex items-center justify-center text-3xl shadow-md">
                      🎓
                    </div>
                  </div>
                </div>
              </section>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-gray-200 rounded-xl py-4 px-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-6 text-sm font-semibold text-gray-600 overflow-x-auto w-full md:w-auto">
                  {['Tất cả', 'Đang học', 'Đã kết thúc'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSubFilter(status)}
                      className={`py-1 transition-colors whitespace-nowrap ${
                        subFilter === status ? 'text-gray-900 font-bold border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    placeholder="Nhập từ khóa tìm kiếm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Cards Grid */}
              {enrollments.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl text-center py-16 px-6">
                  <div className="text-3xl mb-2">📚</div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Bạn chưa đăng ký lớp học nào</h4>
                  <p className="text-sm text-slate-500 mb-5">Vui lòng truy cập Tab Thi thử để tham gia rèn luyện các đề thi mới nhất.</p>
                  <button onClick={() => setActiveTab('mock-tests')} className="px-5 py-2.5 bg-[#0256d0] hover:bg-[#0147b3] text-white font-bold rounded-lg text-sm">
                    Thi thử ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {enrollments
                    .filter((e) => {
                      const matchSearch = (e.Class?.ClassName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          (e.Class?.Course?.Title || '').toLowerCase().includes(searchTerm.toLowerCase());
                      return matchSearch;
                    })
                    .map((e) => {
                      const course = e.Class?.Course;
                      return (
                        <div
                          key={e.Id}
                          className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-[84px] h-[100px] shrink-0 rounded-lg bg-gradient-to-tr from-[#2563eb] via-[#3b82f6] to-[#60a5fa] p-2 flex flex-col justify-between text-white shadow-sm">
                              <div className="bg-[#0f172a] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full w-max">
                                {course?.CourseCode || 'LỚP'}
                              </div>
                              <div className="text-[12px] font-black text-blue-100 uppercase truncate">
                                {e.Class?.ClassName}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[#0256d0] transition-colors leading-snug mb-2 line-clamp-2">
                                {e.Class?.ClassName}
                              </h3>
                              <div className="space-y-1 text-xs text-gray-500 font-medium">
                                <div>Giảng viên: <strong className="text-gray-700">{e.Class?.Teacher?.FullName || 'Giáo viên trung tâm'}</strong></div>
                                <div>Khóa học: <strong className="text-gray-700">{course?.Title || 'Chính thức'}</strong></div>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 pl-2">
                            <Link
                              to={`/Student/Classroom/${e.ClassId}`}
                              className="bg-[#0256d0] hover:bg-[#0147b3] text-white px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-xs no-underline inline-block"
                            >
                              Vào lớp
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ============ TAB 2: THI THỬ ============ */}
          {activeTab === 'mock-tests' && (
            <div>
              <MockTestView embeddedInDashboard={true} />
            </div>
          )}

          {/* ============ TAB 3: LỊCH HỌC LỚP ============ */}
          {activeTab === 'schedule' && (
            <div>
              {/* Hero Banner */}
              <section className="relative bg-[#38bdf8] text-white py-10 px-8 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '36px 36px'
                  }}
                />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                      Danh sách lịch học trực tuyến
                    </h1>
                    <p className="text-blue-50 text-sm font-normal">
                      Theo dõi thời gian biểu & ca học Zoom hàng tuần tại Flash Study
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-24 h-24 rounded-full bg-sky-200/40 p-2 shadow-inner border border-white/20">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-400 to-blue-200 flex items-center justify-center text-3xl shadow-md">
                      📅
                    </div>
                  </div>
                </div>
              </section>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-gray-200 rounded-xl py-4 px-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-6 text-sm font-semibold text-gray-600 overflow-x-auto w-full md:w-auto">
                  {['Tất cả', 'Đang diễn ra', 'Sắp diễn ra', 'Đã kết thúc'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSubFilter(status)}
                      className={`py-1 transition-colors whitespace-nowrap ${
                        subFilter === status ? 'text-gray-900 font-bold border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    placeholder="Nhập từ khóa tìm kiếm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Cards Grid */}
              {lessons.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl text-center py-16 px-6">
                  <div className="text-3xl mb-2">📅</div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Chưa có lịch học trực tuyến</h4>
                  <p className="text-sm text-slate-500">Giáo viên sẽ mở lịch ca học sớm nhất.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {lessons
                    .filter((l) => (l.Title || '').toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((l) => {
                      const isPast = new Date(l.LessonDate) < new Date();
                      const statusInfo = LESSON_STATUS_INFO[l.Status] || (isPast ? { label: 'Đã kết thúc', cls: 'bg-slate-100 text-slate-500' } : defaultLessonStatus);
                      return (
                        <div
                          key={l.Id}
                          className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-[84px] h-[100px] shrink-0 rounded-lg bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 p-2 flex flex-col justify-between text-white shadow-sm text-center">
                              <div className="text-[10px] uppercase font-black bg-black/20 rounded py-0.5">
                                T.{new Date(l.LessonDate).getMonth() + 1}
                              </div>
                              <div className="text-2xl font-black">{new Date(l.LessonDate).getDate()}</div>
                              <div className="text-[10px] font-bold text-sky-200">
                                {new Date(l.LessonDate).getFullYear()}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[#0256d0] transition-colors leading-snug mb-2 line-clamp-2">
                                {l.Title}
                              </h3>
                              <div className="space-y-1 text-xs text-gray-500 font-medium">
                                <div>Thời gian: <strong className="text-gray-700">{formatTime(l.StartTime)} - {formatTime(l.EndTime)}</strong></div>
                                <div>Trạng thái: <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${statusInfo.cls}`}>{statusInfo.label}</span></div>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 pl-2">
                            {l.Status === 1 ? (
                              <button
                                onClick={() => {
                                  const zoomUrl = l.MeetingUrl || (l.MeetingId ? `https://zoom.us/j/${l.MeetingId}` : 'https://zoom.us/j/8889991234');
                                  window.open(zoomUrl, '_blank', 'noopener,noreferrer');
                                }}
                                className="bg-[#2D8CFF] hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-xs flex items-center gap-1"
                              >
                                Vào học
                              </button>
                            ) : (
                              <button
                                onClick={() => openLessonDetail(l, 'Lớp học', 'Giảng viên')}
                                className="bg-[#0256d0] hover:bg-[#0147b3] text-white px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-xs"
                              >
                                Chi tiết
                              </button>
                            )}
                          </div>
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
              {/* Hero Banner */}
              <section className="relative bg-[#38bdf8] text-white py-10 px-8 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '36px 36px'
                  }}
                />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                      Danh sách bài tập về nhà
                    </h1>
                    <p className="text-blue-50 text-sm font-normal">
                      Thực hiện đầy đủ bài tập được giao đúng hạn tại Flash Study
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-24 h-24 rounded-full bg-sky-200/40 p-2 shadow-inner border border-white/20">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-400 to-blue-200 flex items-center justify-center text-3xl shadow-md">
                      📝
                    </div>
                  </div>
                </div>
              </section>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-gray-200 rounded-xl py-4 px-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-6 text-sm font-semibold text-gray-600 overflow-x-auto w-full md:w-auto">
                  {['Tất cả', 'Chưa làm', 'Đã nộp', 'Quá hạn'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSubFilter(status)}
                      className={`py-1 transition-colors whitespace-nowrap ${
                        subFilter === status ? 'text-gray-900 font-bold border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    placeholder="Nhập từ khóa tìm kiếm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Cards Grid */}
              {essayAssignments.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl text-center py-16 px-6">
                  <div className="text-3xl mb-2">📝</div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Chưa có bài tập nào</h4>
                  <p className="text-sm text-slate-500">Giáo viên sẽ giao bài tập khi có buổi học mới.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {essayAssignments
                    .filter((a) => (a.Title || '').toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((a) => {
                      const isSub = isSubmitted(a.Id);
                      const sub = getSubmission(a.Id);
                      const isOverdue = new Date(a.DueDate) < new Date() && !isSub;
                      return (
                        <div
                          key={a.Id}
                          className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-[84px] h-[100px] shrink-0 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-2 flex flex-col justify-between text-white shadow-sm text-center">
                              <div className="text-[10px] uppercase font-black bg-black/20 rounded py-0.5">
                                BÀI TẬP
                              </div>
                              <div className="text-2xl font-black">📄</div>
                              <div className="text-[10px] font-bold text-purple-200">TỰ LUẬN</div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[#0256d0] transition-colors leading-snug mb-2 line-clamp-2">
                                {a.Title}
                              </h3>
                              <div className="space-y-1 text-xs text-gray-500 font-medium">
                                <div>Hạn nộp: <strong className={isOverdue ? 'text-red-600' : 'text-gray-700'}>{new Date(a.DueDate).toLocaleDateString('vi-VN')}</strong></div>
                                <div>Trạng thái: {isSub ? <span className="text-emerald-600 font-bold">Đã nộp bài</span> : isOverdue ? <span className="text-red-600 font-bold">Quá hạn</span> : <span className="text-amber-600 font-bold">Chưa làm</span>}</div>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 pl-2">
                            {isSub ? (
                              <button
                                onClick={() => openSubmissionDetail(a)}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-xs"
                              >
                                Xem bài
                              </button>
                            ) : (
                              <Link
                                to={`/Student/DoAssignment/${a.Id}`}
                                className="bg-[#0256d0] hover:bg-[#0147b3] text-white px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-xs no-underline inline-block"
                              >
                                Làm bài
                              </Link>
                            )}
                          </div>
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
              {/* Hero Banner */}
              <section className="relative bg-[#38bdf8] text-white py-10 px-8 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '36px 36px'
                  }}
                />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                      Danh sách bài kiểm tra trắc nghiệm
                    </h1>
                    <p className="text-blue-50 text-sm font-normal">
                      Thực hiện bài test trắc nghiệm tự động chấm điểm để đánh giá năng lực
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-24 h-24 rounded-full bg-sky-200/40 p-2 shadow-inner border border-white/20">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-400 to-blue-200 flex items-center justify-center text-3xl shadow-md">
                      ✏️
                    </div>
                  </div>
                </div>
              </section>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-gray-200 rounded-xl py-4 px-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-6 text-sm font-semibold text-gray-600 overflow-x-auto w-full md:w-auto">
                  {['Tất cả', 'Chưa làm', 'Đã làm'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSubFilter(status)}
                      className={`py-1 transition-colors whitespace-nowrap ${
                        subFilter === status ? 'text-gray-900 font-bold border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    placeholder="Nhập từ khóa tìm kiếm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Cards Grid */}
              {quizAssignments.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl text-center py-16 px-6">
                  <div className="text-3xl mb-2">✏️</div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Chưa có bài kiểm tra nào</h4>
                  <p className="text-sm text-slate-500">Giáo viên sẽ tạo các bài test trắc nghiệm mới.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {quizAssignments
                    .filter((q) => (q.Title || '').toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((q) => {
                      const isSub = isSubmitted(q.Id);
                      const sub = getSubmission(q.Id);
                      return (
                        <div
                          key={q.Id}
                          className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-[84px] h-[100px] shrink-0 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 p-2 flex flex-col justify-between text-white shadow-sm text-center">
                              <div className="text-[10px] uppercase font-black bg-black/20 rounded py-0.5">
                                TEST
                              </div>
                              <div className="text-2xl font-black">🎯</div>
                              <div className="text-[10px] font-bold text-emerald-100">TRẮC NGHIỆM</div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[#0256d0] transition-colors leading-snug mb-2 line-clamp-2">
                                {q.Title}
                              </h3>
                              <div className="space-y-1 text-xs text-gray-500 font-medium">
                                <div>Chấm điểm: <strong className="text-emerald-700 font-semibold">Tự động bởi AI</strong></div>
                                <div>Kết quả: {isSub ? <strong className="text-emerald-600">{sub?.Grade != null ? Number(sub.Grade).toFixed(1) : '10'}/10 điểm</strong> : <span className="text-slate-500">Chưa kiểm tra</span>}</div>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 pl-2">
                            {isSub ? (
                              <button
                                onClick={() => openSubmissionDetail(q)}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-xs"
                              >
                                Xem bài
                              </button>
                            ) : (
                              <Link
                                to={`/Student/DoAssignment/${q.Id}`}
                                className="bg-[#0256d0] hover:bg-[#0147b3] text-white px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-xs no-underline inline-block"
                              >
                                Làm bài
                              </Link>
                            )}
                          </div>
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
              {/* Hero Banner */}
              <section className="relative bg-[#38bdf8] text-white py-10 px-8 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '36px 36px'
                  }}
                />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                      Báo cáo tiến độ học tập
                    </h1>
                    <p className="text-blue-50 text-sm font-normal">
                      Thống kê tổng hợp điểm số, tỉ lệ tham gia và kết quả học tập
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-24 h-24 rounded-full bg-sky-200/40 p-2 shadow-inner border border-white/20">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-400 to-blue-200 flex items-center justify-center text-3xl shadow-md">
                      📊
                    </div>
                  </div>
                </div>
              </section>

              {/* Progress cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {enrollments.map((e) => {
                  const total = e.Class?.Course?.TotalLessons || 12;
                  const finished = lessons.filter((l) => l.ClassId === e.ClassId && l.Status === 2).length;
                  const percent = Math.min(Math.round((finished / total) * 100), 100);
                  return (
                    <div
                      key={e.Id}
                      onClick={() => setProgressDetail(e)}
                      className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-base text-gray-900">{e.Class?.Course?.Title || e.Class?.ClassName}</h4>
                          <span className="text-xs text-gray-500">Lớp: {e.Class?.ClassName}</span>
                        </div>
                        <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{percent}%</span>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1 font-medium">Đã học: {finished} / {total} buổi</div>
                        <ProgressBar percent={percent} />
                      </div>
                    </div>
                  );
                })}
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

                {(l.MeetingUrl || l.Status === 1 || l.MeetingId) && l.Status !== 2 && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-bold text-sm text-blue-900 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 fill-current text-[#2D8CFF]" viewBox="0 0 24 24">
                        <path d="M4.5 4.5A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 15 4.5H4.5zm13.75 3.31a.75.75 0 0 0-1.125-.652L15 8.448V15.55l2.125 1.29a.75.75 0 0 0 1.125-.652V7.81z"/>
                      </svg>
                      Phòng học trực tuyến Zoom
                    </h4>
                    <div className="grid grid-cols-[110px_1fr] gap-y-1 text-sm text-slate-600 mb-3">
                      <span>Meeting ID:</span> <strong className="text-slate-800">{l.MeetingId || '888-999-1234'}</strong>
                      <span>Mật khẩu:</span> <strong className="text-slate-800">{l.MeetingPassword || '123456'}</strong>
                    </div>
                    <a
                      href={l.MeetingUrl || (l.MeetingId ? `https://zoom.us/j/${l.MeetingId}` : 'https://zoom.us/j/8889991234')}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center w-full py-2.5 bg-[#2D8CFF] hover:bg-blue-600 text-white font-bold rounded-xl text-sm no-underline shadow-sm"
                    >
                      Mở trang Zoom tham gia lớp học ngay
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
