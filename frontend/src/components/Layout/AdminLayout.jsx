import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    title: 'Danh Mục & Lớp Học',
    items: [
      { key: 'tabCourses', icon: 'school', label: 'Quản lý Khóa / Lớp Học' },
      { key: 'tabRevenue', icon: 'trending_up', label: 'Doanh thu & Báo cáo' },
    ],
  },
  {
    title: 'Quản Lý Nhân Sự',
    items: [
      { key: 'tabTeachers', icon: 'co_present', label: 'Quản lý Giáo viên' },
      { key: 'tabStudents', icon: 'groups', label: 'Quản lý Học sinh' },
    ],
  },
  {
    title: 'Tài Chính & Đào Tạo',
    items: [
      { key: 'tabPayments', icon: 'receipt_long', label: 'Thanh toán học phí' },
      { key: 'tabProgress', icon: 'insights', label: 'Tiến độ học tập' },
      { key: 'tabKpi', icon: 'military_tech', label: 'Đánh giá KPI' },
    ],
  },
  {
    title: 'Giao Diện & Content',
    items: [
      { key: 'tabSettings', icon: 'auto_fix_high', label: 'Cài đặt Website', link: '/Admin/Settings' },
    ],
  },
];

export default function AdminLayout({ activeTab, onTabClick, breadcrumb, children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currentUserFullName = user?.fullName || 'Quản trị viên';
  const initial = currentUserFullName.charAt(0).toUpperCase();

  const tabClassName = (isActive) =>
    `w-full flex items-center justify-start text-left px-4 py-3 rounded-xl font-extrabold text-[15px] transition-all ${isActive
      ? 'bg-white text-[#047857] shadow-md shadow-black/20'
      : 'text-emerald-100/90 hover:bg-white/10 hover:text-white'
    }`;

  const renderTab = (item) => {
    const isActive = activeTab === item.key;
    const content = (
      <>
        <span className="material-symbols-outlined mr-3 text-[20px]">{item.icon}</span>
        {item.label}
      </>
    );
    if (item.link) {
      return (
        <a key={item.key} href={item.link} className={tabClassName(isActive)}>
          {content}
        </a>
      );
    }
    if (onTabClick) {
      return (
        <button key={item.key} onClick={() => onTabClick(item.key)} className={tabClassName(isActive)}>
          {content}
        </button>
      );
    }
    return (
      <a key={item.key} href={`/Admin/Dashboard?tab=${item.key}`} className={tabClassName(isActive)}>
        {content}
      </a>
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f7f8fa] text-slate-800 font-sans">
      {/* Top Navbar */}
      <header className="h-[68px] bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-[9999] shrink-0 select-none">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Ẩn/Hiện thanh Menu"
          >
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </button>
          <a href="/" className="flex items-center gap-3 text-[#047857] no-underline">
            <img src="/images/logo.jpg" alt="Anh Tê Logo" className="h-10 w-10 rounded-xl object-cover shadow-md" />
            <span className="font-serif italic font-bold text-4xl tracking-tight">Anh Tê</span>
          </a>
        </div>

        <div className="flex items-center gap-5">
          <a href="/Notification" className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Thông báo">
            <span className="material-symbols-outlined text-[26px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[11px] font-extrabold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white">3</span>
          </a>
          <button type="button" className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Trợ giúp">
            <span className="material-symbols-outlined text-[26px]">help_outline</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <div
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 pl-1 pr-2.5 py-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#047857] text-white font-bold text-base flex items-center justify-center shadow-sm">
                {initial}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-base font-bold text-slate-800 leading-tight">{currentUserFullName}</div>
                <div className="text-sm text-slate-500 mt-0.5">Quản trị hệ thống</div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[22px]">expand_more</span>
            </div>

            {userDropdownOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100">
                  <div className="w-11 h-11 rounded-full bg-[#047857] text-white font-black flex items-center justify-center text-lg">
                    {initial}
                  </div>
                  <div>
                    <div className="font-bold text-base text-slate-800">{currentUserFullName}</div>
                    <div className="text-sm text-slate-400">admin@trungtam.com</div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-[#047857] px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
                      <span className="material-symbols-outlined text-[15px]">verified</span> Quản Trị Viên
                    </span>
                  </div>
                </div>
                <div className="py-1">
                  <a
                    href="/Admin/Dashboard?tab=tabKpi"
                    className="w-full px-4 py-2.5 text-left text-base font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <span className="material-symbols-outlined text-[21px] text-[#047857]">account_circle</span> Thông tin cá nhân
                  </a>
                  <Link
                    to="/Admin/Settings"
                    className="w-full px-4 py-2.5 text-left text-base font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <span className="material-symbols-outlined text-[21px] text-slate-400">settings</span> Cài đặt Website
                  </Link>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2.5 text-left text-base font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                  >
                    <span className="material-symbols-outlined text-[21px]">logout</span> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <aside className="w-72 bg-[#064e3b] text-white border-r border-[#047857]/40 flex flex-col p-4 shrink-0 select-none overflow-y-auto">
            <div className="space-y-1.5 flex-1">
              {NAV_GROUPS.map((group, idx) => (
                <React.Fragment key={group.title}>
                  <div className={`text-xs font-black uppercase tracking-wider text-emerald-200/70 text-left px-3.5 pb-2 ${idx === 0 ? 'pt-1' : 'pt-5'}`}>
                    {group.title}
                  </div>
                  {group.items.map(renderTab)}
                </React.Fragment>
              ))}
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto p-9 bg-[#f7f8fa]">
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-2 text-base text-slate-500 mb-7 select-none flex-wrap">
              {breadcrumb.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-300">›</span>}
                  <span className={idx === breadcrumb.length - 1 ? 'font-bold text-slate-900' : ''}>{crumb}</span>
                </React.Fragment>
              ))}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
