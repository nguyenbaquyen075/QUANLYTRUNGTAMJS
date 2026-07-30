import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFetchData } from '../../hooks/useFetchData';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { data, loading } = useFetchData('/Student/Dashboard');
  const [activeTab, setActiveTab] = useState('my-courses');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const enrollments = data?.enrollments || [];
  const currentUserFullName = data?.currentUserFullName || user?.fullName || 'Học viên';

  const tabNames = {
    'my-courses': 'Khóa học của tôi',
    'courses-store': 'Đăng ký khóa học',
    'schedule': 'Lịch học lớp',
    'assignments': 'Bài tập về nhà',
    'quizzes': 'Bài kiểm tra',
    'progress': 'Tiến độ học tập',
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
                <div className="text-[11px] text-slate-500 mt-0.5">Học viên hệ thống</div>
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
                    <div className="text-[11px] text-slate-400">hocvien@trungtam.com</div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
                      <i className="fa-solid fa-circle-check"></i> Học Viên
                    </span>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setActiveTab('progress'); setUserDropdownOpen(false); }}
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
                onClick={() => setActiveTab('my-courses')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'my-courses'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-book w-4 text-center"></i> Khóa học của tôi
              </button>
              <button
                onClick={() => setActiveTab('courses-store')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'courses-store'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-store w-4 text-center"></i> Đăng ký khóa học
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-calendar-days w-4 text-center"></i> Lịch học lớp
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'assignments'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-file-signature w-4 text-center"></i> Bài tập về nhà
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'quizzes'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-square-poll-vertical w-4 text-center"></i> Bài kiểm tra
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'progress'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-chart-line w-4 text-center"></i> Tiến độ học tập
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
            <span className="hover:text-slate-800 cursor-pointer">Góc học tập học viên</span>
            <span className="text-slate-400">›</span>
            <span className="font-bold text-slate-900">{tabNames[activeTab]}</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">{tabNames[activeTab]}</h3>
                <p className="text-xs text-slate-500 mt-1">Danh sách thông tin học tập cá nhân</p>
              </div>
            </div>

            {enrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="h-36 bg-emerald-600 relative flex items-center justify-center">
                      <i className="fa-solid fa-graduation-cap text-5xl text-white/30"></i>
                    </div>
                    <div className="p-4">
                      <h4 className="font-extrabold text-slate-800 text-sm">{item.Class ? item.Class.ClassName : 'Lớp Học'}</h4>
                      <p className="text-xs text-slate-500 mt-1">GV: {item.Class && item.Class.Teacher ? item.Class.Teacher.FullName : 'Chưa phân công'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs italic">
                Bạn hiện tại chưa đăng ký tham gia lớp học nào.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
