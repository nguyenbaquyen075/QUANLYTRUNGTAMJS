import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetchData } from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { MockTestView } from '../MockTestPage';
import NotificationDrawer from '../../components/Notification/NotificationDrawer';
import SidebarFooterSupport from '../../components/Layout/SidebarFooterSupport';

const NAV_ITEMS = [
  { key: 'my-courses', label: 'Khóa học của tôi', icon: 'school' },
  { key: 'mock-tests', label: 'Thi thử', icon: 'quiz' },
  { key: 'schedule', label: 'Lịch học lớp', icon: 'calendar_month' },
  { key: 'assignments', label: 'Bài tập về nhà', icon: 'assignment' },
  { key: 'quizzes', label: 'Bài kiểm tra', icon: 'fact_check' },
  { key: 'progress', label: 'Tiến độ học tập', icon: 'trending_up' },
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
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-courses');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subFilter, setSubFilter] = useState('Tất cả');
  const [studentNotifFilter, setStudentNotifFilter] = useState('ALL');
  const [studentNotifSearch, setStudentNotifSearch] = useState('');
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

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
          <Link to="/" className="flex items-center gap-3 text-[#065f46] no-underline">
            <img src="/images/logo.jpg" alt="Anh Tê Logo" className="h-10 w-10 rounded-xl object-cover shadow-sm" />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-2xl tracking-tight leading-none text-[#065f46]">Anh Tê</span>
              <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">Education</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setNotifDrawerOpen(true)}
            className="relative w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 hover:text-primary hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-emerald-200"
            title="Thông báo"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-black min-w-[19px] h-[19px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm shadow-rose-500/40 animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
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
          <aside className="w-72 bg-white text-slate-800 border-r border-slate-200/80 flex flex-col shrink-0 select-none relative h-full overflow-hidden">
            {/* Bottom Oriental Landscape Artwork Background Layer */}
            <SidebarFooterSupport />

            {/* Navigation Items (Overlaying naturally on top of background) */}
            <div className="relative z-10 pt-6 pb-6 px-3.5 space-y-1.5 flex-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`group w-full flex items-center justify-start text-left px-4 py-2.5 rounded-2xl font-bold text-[15.5px] tracking-tight transition-all cursor-pointer select-none ${
                      isActive
                        ? 'bg-[#065f46] text-white shadow-md shadow-emerald-950/20'
                        : 'text-slate-800 hover:bg-white/90 hover:text-[#065f46] hover:shadow-xs'
                    }`}
                  >
                    {item.icon && (
                      <span className={`material-symbols-outlined mr-3.5 text-[23px] transition-colors ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-[#065f46]'}`}>
                        {item.icon}
                      </span>
                    )}
                    <span className="flex-1 leading-snug font-bold">{item.label}</span>
                    {item.isNotif && unreadCount > 0 && (
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-[#065f46]' : 'bg-rose-500 text-white shadow-xs'}`}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        <main className="flex-1 flex flex-col overflow-hidden bg-[#f7f8fa]">
          {/* Fixed Top Breadcrumb Header */}
          <div className="shrink-0 px-9 py-3.5 bg-white border-b border-slate-200/80 shadow-xs flex items-center justify-between z-30">
            <div className="flex items-center gap-2 text-sm sm:text-base text-slate-500 select-none flex-wrap">
              <button onClick={() => setActiveTab('my-courses')} className="text-slate-500 hover:text-[#065f46] font-medium hover:underline transition-colors cursor-pointer">Trang chủ</button>
              <span className="text-slate-300">›</span>
              <span className="text-[#065f46] font-bold">{activeLabel}</span>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-9 py-6">

          {/* ============ TAB 1: KHÓA HỌC CỦA TÔI ============ */}
          {activeTab === 'my-courses' && (
            <div>
              {/* Hero Banner */}
              <section className="relative bg-gradient-to-r from-[#065f46] via-[#047857] to-[#0d9488] text-white py-8 px-7 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '36px 36px'
                  }}
                />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5 font-serif">
                      Danh sách khóa học của tôi
                    </h1>
                    <p className="text-emerald-100 text-sm font-medium">
                      Các lớp học trực tuyến bạn đang tham gia tại Anh Tê Education
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 p-2 shadow-inner border border-white/20 backdrop-blur-xs">
                    <div className="w-full h-full rounded-xl bg-white/20 flex items-center justify-center text-3xl shadow-xs">
                      🎓
                    </div>
                  </div>
                </div>
              </section>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl py-4 px-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-6 text-sm font-semibold text-slate-600 overflow-x-auto w-full md:w-auto">
                  {['Tất cả', 'Đang học', 'Đã kết thúc'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSubFilter(status)}
                      className={`py-1 transition-colors whitespace-nowrap ${subFilter === status ? 'text-[#065f46] font-bold border-b-2 border-[#065f46]' : 'text-slate-500 hover:text-[#065f46]'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    placeholder="Nhập từ khóa tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065f46]/20 focus:border-[#065f46]"
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Cards Grid */}
              {enrollments.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl text-center py-16 px-6 shadow-xs">
                  <div className="text-3xl mb-2">📚</div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Bạn chưa đăng ký lớp học nào</h4>
                  <p className="text-sm text-slate-500 mb-5">Vui lòng truy cập Tab Thi thử để tham gia rèn luyện các đề thi mới nhất.</p>
                  <button onClick={() => setActiveTab('mock-tests')} className="px-5 py-2.5 bg-[#065f46] hover:bg-[#047857] text-white font-bold rounded-xl text-sm shadow-xs transition-all">
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
                          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-[#065f46]/40 transition-all flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-[84px] h-[100px] shrink-0 rounded-xl bg-gradient-to-tr from-[#065f46] via-[#047857] to-[#0d9488] p-2.5 flex flex-col justify-between text-white shadow-xs">
                              <div className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-md w-max backdrop-blur-xs">
                                {course?.CourseCode || 'LỚP'}
                              </div>
                              <div className="text-[12px] font-black text-emerald-100 uppercase truncate">
                                {e.Class?.ClassName || 'LỚP HỌC'}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-[#065f46] uppercase tracking-wider mb-1">
                                {course?.CourseCode || 'KHÓA HỌC'}
                              </div>
                              <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-[#065f46] transition-colors leading-snug mb-2 line-clamp-2">
                                {course?.Title || e.Class?.ClassName}
                              </h3>
                              <div className="space-y-1 text-xs text-slate-500 font-medium">
                                <div>Lớp: <strong className="text-slate-800">{e.Class?.ClassName}</strong></div>
                                <div>Giáo viên: <strong className="text-slate-800">{e.Class?.Teacher?.FullName || 'Chưa phân công'}</strong></div>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 pl-2">
                            <Link
                              to={`/Student/Classroom/${e.ClassId}`}
                              className="bg-[#065f46] hover:bg-[#047857] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center gap-1.5 no-underline"
                            >
                              Vào học
                              <span className="material-symbols-outlined text-base">arrow_forward</span>
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
              <section className="relative bg-gradient-to-r from-[#065f46] via-[#047857] to-[#0d9488] text-white py-8 px-7 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '36px 36px'
                  }}
                />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5 font-serif">
                      Danh sách lịch học trực tuyến
                    </h1>
                    <p className="text-emerald-100 text-sm font-medium">
                      Theo dõi thời gian biểu & ca học Zoom hàng tuần tại Anh Tê Education
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 p-2 shadow-inner border border-white/20 backdrop-blur-xs">
                    <div className="w-full h-full rounded-xl bg-white/20 flex items-center justify-center text-3xl shadow-xs">
                      📅
                    </div>
                  </div>
                </div>
              </section>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl py-4 px-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-6 text-sm font-semibold text-slate-600 overflow-x-auto w-full md:w-auto">
                  {['Tất cả', 'Đang diễn ra', 'Sắp diễn ra', 'Đã kết thúc'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSubFilter(status)}
                      className={`py-1 transition-colors whitespace-nowrap ${subFilter === status ? 'text-[#065f46] font-bold border-b-2 border-[#065f46]' : 'text-slate-500 hover:text-[#065f46]'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    placeholder="Nhập từ khóa tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065f46]/20 focus:border-[#065f46]"
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Cards Grid */}
              {lessons.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl text-center py-16 px-6 shadow-xs">
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
                          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-[#065f46]/40 transition-all flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-[84px] h-[100px] shrink-0 rounded-xl bg-gradient-to-tr from-[#065f46] via-[#047857] to-[#0d9488] p-2.5 flex flex-col justify-between text-white shadow-xs text-center">
                              <div className="text-[10px] uppercase font-black bg-white/20 rounded py-0.5 backdrop-blur-xs">
                                T.{new Date(l.LessonDate).getMonth() + 1}
                              </div>
                              <div className="text-2xl font-black">{new Date(l.LessonDate).getDate()}</div>
                              <div className="text-[10px] font-bold text-emerald-100">
                                {new Date(l.LessonDate).getFullYear()}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-[#065f46] transition-colors leading-snug mb-2 line-clamp-2">
                                {l.Title}
                              </h3>
                              <div className="space-y-1 text-xs text-slate-500 font-medium">
                                <div>Thời gian: <strong className="text-slate-800">{formatTime(l.StartTime)} - {formatTime(l.EndTime)}</strong></div>
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
                                className="bg-[#065f46] hover:bg-[#047857] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                Vào học
                                <span className="material-symbols-outlined text-base">arrow_forward</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => openLessonDetail(l, 'Lớp học', 'Giảng viên')}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs cursor-pointer"
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
              <section className="relative bg-gradient-to-r from-[#065f46] via-[#047857] to-[#0d9488] text-white py-8 px-7 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '36px 36px'
                  }}
                />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5 font-serif">
                      Danh sách bài tập về nhà
                    </h1>
                    <p className="text-emerald-100 text-sm font-medium">
                      Thực hiện đầy đủ bài tập được giao đúng hạn tại Anh Tê Education
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 p-2 shadow-inner border border-white/20 backdrop-blur-xs">
                    <div className="w-full h-full rounded-xl bg-white/20 flex items-center justify-center text-3xl shadow-xs">
                      📝
                    </div>
                  </div>
                </div>
              </section>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl py-4 px-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-6 text-sm font-semibold text-slate-600 overflow-x-auto w-full md:w-auto">
                  {['Tất cả', 'Chưa làm', 'Đã nộp', 'Quá hạn'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSubFilter(status)}
                      className={`py-1 transition-colors whitespace-nowrap ${subFilter === status ? 'text-[#065f46] font-bold border-b-2 border-[#065f46]' : 'text-slate-500 hover:text-[#065f46]'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    placeholder="Nhập từ khóa tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065f46]/20 focus:border-[#065f46]"
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Cards Grid */}
              {essayAssignments.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl text-center py-16 px-6 shadow-xs">
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
                          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-[#065f46]/40 transition-all flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-[84px] h-[100px] shrink-0 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 p-2.5 flex flex-col justify-between text-white shadow-xs text-center">
                              <div className="text-[10px] uppercase font-black bg-white/20 rounded py-0.5 backdrop-blur-xs">
                                BÀI TẬP
                              </div>
                              <div className="text-2xl font-black">📄</div>
                              <div className="text-[10px] font-bold text-amber-100">TỰ LUẬN</div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-[#065f46] transition-colors leading-snug mb-2 line-clamp-2">
                                {a.Title}
                              </h3>
                              <div className="space-y-1 text-xs text-slate-500 font-medium">
                                <div>Hạn nộp: <strong className={isOverdue ? 'text-red-600' : 'text-slate-800'}>{new Date(a.DueDate).toLocaleDateString('vi-VN')}</strong></div>
                                <div>Trạng thái: {isSub ? <span className="text-emerald-600 font-bold">Đã nộp bài</span> : isOverdue ? <span className="text-red-600 font-bold">Quá hạn</span> : <span className="text-amber-600 font-bold">Chưa làm</span>}</div>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 pl-2">
                            {isSub ? (
                              <button
                                onClick={() => openSubmissionDetail(a)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs cursor-pointer"
                              >
                                Xem bài
                              </button>
                            ) : (
                              <Link
                                to={`/Student/DoAssignment/${a.Id}`}
                                className="bg-[#065f46] hover:bg-[#047857] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs no-underline inline-flex items-center gap-1.5"
                              >
                                Làm bài
                                <span className="material-symbols-outlined text-base">arrow_forward</span>
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
              <section className="relative bg-gradient-to-r from-[#065f46] via-[#047857] to-[#0d9488] text-white py-8 px-7 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '36px 36px'
                  }}
                />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5 font-serif">
                      Danh sách bài kiểm tra trắc nghiệm
                    </h1>
                    <p className="text-emerald-100 text-sm font-medium">
                      Thực hiện bài test trắc nghiệm tự động chấm điểm để đánh giá năng lực
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 p-2 shadow-inner border border-white/20 backdrop-blur-xs">
                    <div className="w-full h-full rounded-xl bg-white/20 flex items-center justify-center text-3xl shadow-xs">
                      ✏️
                    </div>
                  </div>
                </div>
              </section>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl py-4 px-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-6 text-sm font-semibold text-slate-600 overflow-x-auto w-full md:w-auto">
                  {['Tất cả', 'Chưa làm', 'Đã làm'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSubFilter(status)}
                      className={`py-1 transition-colors whitespace-nowrap ${subFilter === status ? 'text-[#065f46] font-bold border-b-2 border-[#065f46]' : 'text-slate-500 hover:text-[#065f46]'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    placeholder="Nhập từ khóa tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065f46]/20 focus:border-[#065f46]"
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Cards Grid */}
              {quizAssignments.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl text-center py-16 px-6 shadow-xs">
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
                          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-[#065f46]/40 transition-all flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-[84px] h-[100px] shrink-0 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 p-2.5 flex flex-col justify-between text-white shadow-xs text-center">
                              <div className="text-[10px] uppercase font-black bg-white/20 rounded py-0.5 backdrop-blur-xs">
                                TEST
                              </div>
                              <div className="text-2xl font-black">🎯</div>
                              <div className="text-[10px] font-bold text-sky-100">TRẮC NGHIỆM</div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-[#065f46] transition-colors leading-snug mb-2 line-clamp-2">
                                {q.Title}
                              </h3>
                              <div className="space-y-1 text-xs text-slate-500 font-medium">
                                <div>Chấm điểm: <strong className="text-emerald-700 font-semibold">Tự động bởi AI</strong></div>
                                <div>Kết quả: {isSub ? <strong className="text-emerald-600 font-bold">{sub?.Grade != null ? Number(sub.Grade).toFixed(1) : '10'}/10 điểm</strong> : <span className="text-slate-500">Chưa kiểm tra</span>}</div>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 pl-2">
                            {isSub ? (
                              <button
                                onClick={() => openSubmissionDetail(q)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs cursor-pointer"
                              >
                                Xem bài
                              </button>
                            ) : (
                              <Link
                                to={`/Student/DoAssignment/${q.Id}`}
                                className="bg-[#065f46] hover:bg-[#047857] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs no-underline inline-flex items-center gap-1.5"
                              >
                                Làm bài
                                <span className="material-symbols-outlined text-base">arrow_forward</span>
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
              <section className="relative bg-gradient-to-r from-[#065f46] via-[#047857] to-[#0d9488] text-white py-8 px-7 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '36px 36px'
                  }}
                />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5 font-serif">
                      Báo cáo tiến độ học tập
                    </h1>
                    <p className="text-emerald-100 text-sm font-medium">
                      Thống kê tổng hợp điểm số, tỉ lệ tham gia và kết quả học tập
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 p-2 shadow-inner border border-white/20 backdrop-blur-xs">
                    <div className="w-full h-full rounded-xl bg-white/20 flex items-center justify-center text-3xl shadow-xs">
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
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-[#065f46]/40 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-base text-slate-900">{e.Class?.Course?.Title || e.Class?.ClassName}</h4>
                          <span className="text-xs text-slate-500 font-medium">Lớp: {e.Class?.ClassName}</span>
                        </div>
                        <span className="text-sm font-black text-[#065f46] bg-emerald-50 px-3 py-1 rounded-xl">{percent}%</span>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-slate-500 mb-1.5 font-medium">Đã học: {finished} / {total} buổi</div>
                        <ProgressBar percent={percent} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </div>
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
                  <span className="text-xs font-bold bg-emerald-50 text-[#065f46] px-2.5 py-1 rounded-full">{className}</span>
                  <h3 className="font-bold text-xl text-slate-900 mt-2 font-serif">{l.Title}</h3>
                </div>
                <button onClick={() => setLessonDetail(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
              </div>

              <div className="space-y-4 mb-2">
                <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <span className="text-slate-500">Giảng viên:</span>
                  <strong className="text-slate-800">{teacherName || 'Chưa cập nhật'}</strong>
                  <span className="text-slate-500">Thời gian:</span>
                  <span className="text-slate-800 font-medium">{new Date(l.LessonDate).toLocaleDateString('vi-VN')} | {formatTime(l.StartTime)} - {formatTime(l.EndTime)}</span>
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full w-fit ${statusInfo.cls}`}>{statusInfo.label}</span>
                </div>

                {(l.MeetingUrl || l.Status === 1 || l.MeetingId) && l.Status !== 2 && (
                  <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200">
                    <h4 className="font-bold text-sm text-[#065f46] mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">videocam</span>
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
                      className="block text-center w-full py-2.5 bg-[#065f46] hover:bg-[#047857] text-white font-bold rounded-xl text-sm no-underline shadow-xs transition-all"
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

      {/* ==================== TAB 7: THÔNG BÁO HỌC VIÊN ==================== */}
      {activeTab === 'notifications' && (() => {
        const filteredList = notifications.filter((notif) => {
          if (studentNotifFilter === 'UNREAD' && notif.IsRead) return false;
          if (studentNotifFilter === 'READ' && !notif.IsRead) return false;
          if (studentNotifSearch.trim()) {
            const q = studentNotifSearch.toLowerCase();
            const t = (notif.Title || '').toLowerCase();
            const c = (notif.Content || '').toLowerCase();
            if (!t.includes(q) && !c.includes(q)) return false;
          }
          return true;
        });

        const handleNotifClick = async (notif) => {
          if (!notif.IsRead) {
            await markAsRead(notif.Id);
          }
          if (notif.LinkUrl && notif.LinkUrl !== 'null' && notif.LinkUrl.trim() !== '') {
            const url = notif.LinkUrl.trim();
            if (url.startsWith('http')) {
              window.open(url, '_blank');
            } else {
              navigate(url);
            }
          }
        };

        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex flex-wrap justify-between items-center gap-3 px-6 py-5 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">notifications_active</span>
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
                      Thông Báo Học Viên
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                          {unreadCount} mới
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Nhắc nhở bài tập, điểm danh, kết quả thi và thông báo từ trung tâm</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 ml-auto flex-wrap">
                  {/* Search */}
                  <div className="relative w-56">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                    <input
                      type="text"
                      value={studentNotifSearch}
                      onChange={(e) => setStudentNotifSearch(e.target.value)}
                      placeholder="Tìm thông báo..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none transition-colors"
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={studentNotifFilter}
                    onChange={(e) => setStudentNotifFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none"
                  >
                    <option value="ALL">Tất cả ({notifications.length})</option>
                    <option value="UNREAD">Chưa đọc ({unreadCount})</option>
                    <option value="READ">Đã đọc</option>
                  </select>

                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 border border-emerald-200"
                    >
                      <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
                      Đã đọc tất cả
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="divide-y divide-slate-100">
                {filteredList.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-[36px]">notifications_off</span>
                    </div>
                    <h4 className="font-bold text-slate-700 text-base mb-1">
                      {studentNotifSearch ? 'Không tìm thấy thông báo phù hợp' : 'Không có thông báo nào'}
                    </h4>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto">
                      {studentNotifSearch
                        ? `Không có kết quả khớp với "${studentNotifSearch}".`
                        : studentNotifFilter === 'UNREAD'
                          ? 'Bạn đã đọc toàn bộ thông báo.'
                          : 'Mọi thông báo từ lớp học và trung tâm sẽ hiển thị tại đây.'}
                    </p>
                  </div>
                ) : (
                  filteredList.map((notif) => {
                    const isAssignment = notif.Title.includes('Bài tập') || notif.Title.includes('điểm') || notif.Title.includes('thi');
                    const isPayment = notif.Title.includes('học phí') || notif.Title.includes('Hóa đơn') || notif.Title.includes('thanh toán');
                    return (
                      <div
                        key={notif.Id}
                        onClick={() => handleNotifClick(notif)}
                        className={`p-5 px-6 flex items-start gap-4 transition-all cursor-pointer hover:bg-slate-50/80 ${!notif.IsRead ? 'bg-emerald-50/20 border-l-4 border-l-emerald-500' : ''
                          }`}
                      >
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isAssignment
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                            : isPayment
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                          <span className="material-symbols-outlined text-[22px]">
                            {isAssignment ? 'menu_book' : isPayment ? 'receipt_long' : 'campaign'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className={`text-base ${!notif.IsRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                              {notif.Title}
                            </h4>
                            {!notif.IsRead && (
                              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Mới
                              </span>
                            )}
                            <span className="text-xs text-slate-400 font-medium ml-auto flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              {new Date(notif.CreatedAt).toLocaleString('vi-VN')}
                            </span>
                          </div>

                          <p className="text-sm text-slate-600 leading-relaxed break-words">
                            {notif.Content}
                          </p>

                          {notif.LinkUrl && notif.LinkUrl !== 'null' && notif.LinkUrl.trim() !== '' && (
                            <div className="mt-3">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition-colors">
                                <span>Xem chi tiết & làm bài</span>
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {!notif.IsRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.Id);
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0"
                            title="Đánh dấu đã đọc"
                          >
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          </button>
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
                                      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold' : isWrongPick ? 'bg-red-50 border-red-300 text-red-800' : 'bg-white border-slate-200 text-slate-700'
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

      {/* Right-Side Notification Drawer Panel */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
      />
    </div>
  );
}
