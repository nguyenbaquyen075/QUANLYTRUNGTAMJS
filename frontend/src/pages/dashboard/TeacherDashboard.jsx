import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFetchData } from '../../hooks/useFetchData';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const { data, loading } = useFetchData('/Teacher/Dashboard');
  const [activeTab, setActiveTab] = useState('tabLessons');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const lessons = data?.lessons || [];
  const assignments = data?.assignments || [];
  const currentUserFullName = data?.currentUserFullName || user?.fullName || 'Giảng viên';

  const tabNames = {
    tabLessons: 'Lịch dạy & Điểm danh',
    tabAssignments: 'Bài tập về nhà',
    tabExams: 'Bài kiểm tra',
    tabCourseProgress: 'Tiến độ các khóa học',
    tabMyCourses: 'Khóa học của tôi',
    tabStudentKpi: 'Đánh giá KPI học viên',
    tabTeacherKpi: 'Đánh giá KPI giảng viên',
    tabTeacherProfile: 'Thông tin giới thiệu',
  };

  const initial = currentUserFullName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-800 font-sans">
      {/* Top Navbar Header */}
      <header className="h-[56px] bg-white border-b border-slate-200 px-5 flex items-center justify-between z-50 shrink-0 select-none">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Ẩn/Hiện thanh Menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
          <a href="/" className="flex items-center gap-2.5 text-[#047857] font-extrabold text-lg tracking-tight no-underline">
            <img src="/images/logo.jpg" alt="Anh Tê Logo" className="h-9 w-9 rounded-lg object-cover shadow-sm" />
            <span>Anh Tê</span>
          </a>
        </div>

        <div className="flex items-center gap-4">
          <a href="/Notification" className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Thông báo">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">3</span>
          </a>
          <button type="button" className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Trợ giúp">
            <span className="material-symbols-outlined text-[22px]">help_outline</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <div
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 px-2 py-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                {initial}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{currentUserFullName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Giảng viên hệ thống</div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">expand_more</span>
            </div>

            {userDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                <div className="px-4 py-2.5 flex items-center gap-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-base">
                    {initial}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-800">{currentUserFullName}</div>
                    <div className="text-[11px] text-slate-400">giangvien@trungtam.com</div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
                      <i className="fa-solid fa-circle-check"></i> Giảng Viên
                    </span>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setActiveTab('tabTeacherProfile'); setUserDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px] text-sky-600">account_circle</span> Thông tin cá nhân
                  </button>
                  <button
                    onClick={() => alert('Tính năng cài đặt đang phát triển')}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px] text-slate-400">settings</span> Cài đặt tài khoản
                  </button>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Menu */}
        {sidebarOpen && (
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-3 shrink-0 select-none overflow-y-auto">
            <div className="space-y-1 flex-1 pt-2">
              <button
                onClick={() => setActiveTab('tabLessons')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabLessons'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-calendar-week w-4 text-center"></i> Lịch dạy & Điểm danh
              </button>
              <button
                onClick={() => setActiveTab('tabAssignments')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabAssignments'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-file-lines w-4 text-center"></i> Bài tập về nhà ({assignments.filter(a => a.AssignmentType !== 3).length})
              </button>
              <button
                onClick={() => setActiveTab('tabExams')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabExams'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-square-poll-vertical w-4 text-center"></i> Bài kiểm tra ({assignments.filter(a => a.AssignmentType === 3).length})
              </button>
              <button
                onClick={() => setActiveTab('tabCourseProgress')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabCourseProgress'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-chart-line w-4 text-center"></i> Tiến độ các khóa học
              </button>
              <button
                onClick={() => setActiveTab('tabMyCourses')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabMyCourses'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-book w-4 text-center"></i> Khóa học của tôi
              </button>
              <button
                onClick={() => setActiveTab('tabStudentKpi')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabStudentKpi'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-user-graduate w-4 text-center"></i> Đánh giá KPI học viên
              </button>
              <button
                onClick={() => setActiveTab('tabTeacherKpi')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabTeacherKpi'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-award w-4 text-center"></i> Đánh giá KPI giảng viên
              </button>
              <button
                onClick={() => setActiveTab('tabTeacherProfile')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabTeacherProfile'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-id-card w-4 text-center"></i> Thông tin giới thiệu
              </button>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
          {/* Breadcrumb Trail inside main content */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-5 select-none">
            <span className="hover:text-slate-800 cursor-pointer">Trang chủ</span>
            <span className="text-slate-400">›</span>
            <span className="hover:text-slate-800 cursor-pointer">Bảng tin giáo viên</span>
            <span className="text-slate-400">›</span>
            <span className="font-bold text-slate-900">{tabNames[activeTab]}</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">{tabNames[activeTab]}</h3>
                <p className="text-xs text-slate-500 mt-1">Danh sách thông tin được phân công giảng dạy</p>
              </div>
              <button className="px-4 py-2 bg-[#047857] text-white hover:bg-emerald-700 rounded-xl text-xs font-bold shadow-md transition-all">
                <i className="fa-solid fa-plus"></i> Thêm mới
              </button>
            </div>

            {lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {lesson.Class ? lesson.Class.ClassName : 'Buổi dạy'}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm mt-1">{lesson.Title || `Buổi ${idx + 1}`}</h4>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{lesson.LessonDate ? new Date(lesson.LessonDate).toLocaleDateString('vi-VN') : 'Theo lịch'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs italic">
                Hiện tại không có lịch dạy nào cần xử lý.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
