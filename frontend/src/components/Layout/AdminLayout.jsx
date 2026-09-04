import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDrawer from '../Notification/NotificationDrawer';
import SidebarFooterSupport from './SidebarFooterSupport';

const NAV_ITEMS = [
  { key: 'tabCourses', icon: 'school', label: 'Quản lý Khóa / Lớp Học' },
  { key: 'tabRevenue', icon: 'trending_up', label: 'Doanh thu & Báo cáo' },
  { key: 'tabTeachers', icon: 'co_present', label: 'Quản lý Giáo viên' },
  { key: 'tabStudents', icon: 'groups', label: 'Quản lý Học sinh' },
  { key: 'tabPayments', icon: 'receipt_long', label: 'Thanh toán học phí' },
  { key: 'tabProgress', icon: 'insights', label: 'Tiến độ học tập' },
  { key: 'tabKpi', icon: 'military_tech', label: 'Đánh giá KPI' },
  { key: 'tabSettings', icon: 'settings', label: 'Cài đặt Website', link: '/Admin/Settings' },
];

export default function AdminLayout({ activeTab, onTabClick, breadcrumb, children }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  const currentUserFullName = user?.fullName || 'Quản trị viên';
  const initial = currentUserFullName.charAt(0).toUpperCase();

  const tabClassName = (isActive) =>
    `group w-full flex items-center justify-start text-left px-4 py-2.5 rounded-2xl font-bold text-[15.5px] tracking-tight transition-all cursor-pointer select-none ${isActive
      ? 'bg-[#065f46] text-white shadow-md shadow-emerald-950/20'
      : 'text-slate-800 hover:bg-white/90 hover:text-[#065f46] hover:shadow-xs'
    }`;

  const renderTab = (item) => {
    const isActive = activeTab === item.key;
    const content = (
      <>
        <span className={`material-symbols-outlined mr-3.5 text-[23px] transition-colors ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-[#065f46]'}`}>
          {item.icon}
        </span>
        <span className="flex-1 leading-snug font-bold">{item.label}</span>
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
      <header className="h-[68px] bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-50 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="Ẩn/Hiện thanh Menu"
          >
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </button>
          <a href="/" className="flex items-center gap-3 text-[#065f46] no-underline">
            <img src="/images/logo.jpg" alt="Anh Tê Logo" className="h-10 w-10 rounded-xl object-cover shadow-sm" />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-2xl tracking-tight leading-none text-[#065f46]">Anh Tê</span>
              <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">Education</span>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-5">
          {/* Notification Bell -> Opens Right-Side Drawer Panel */}
          <button
            type="button"
            onClick={() => setNotifDrawerOpen(true)}
            className="relative w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 hover:text-[#065f46] hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-emerald-200"
            title="Xem thông báo"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-black min-w-[19px] h-[19px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm shadow-rose-500/40 animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <div
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 pl-1 pr-2.5 py-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#065f46] text-white font-bold text-base flex items-center justify-center shadow-sm">
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
                  <div className="w-11 h-11 rounded-full bg-[#065f46] text-white font-black flex items-center justify-center text-lg">
                    {initial}
                  </div>
                  <div>
                    <div className="font-bold text-base text-slate-800">{currentUserFullName}</div>
                    <div className="text-sm text-slate-400">admin@trungtam.com</div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-[#065f46] px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
                      <span className="material-symbols-outlined text-[15px]">verified</span> Quản Trị Viên
                    </span>
                  </div>
                </div>
                <div className="py-1">
                  <a
                    href="/Admin/Dashboard?tab=tabKpi"
                    className="w-full px-4 py-2.5 text-left text-base font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <span className="material-symbols-outlined text-[21px] text-[#065f46]">account_circle</span> Thông tin cá nhân
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
          <aside className="w-72 bg-white text-slate-800 border-r border-slate-200/80 flex flex-col shrink-0 select-none relative h-full overflow-hidden">
            {/* Bottom Oriental Landscape Artwork Background Layer */}
            <SidebarFooterSupport />

            {/* Navigation Items (Overlaying naturally on top of background) */}
            <div className="relative z-10 pt-6 pb-6 px-3.5 space-y-1.5 flex-1 overflow-y-auto">
              {NAV_ITEMS.map(renderTab)}
            </div>
          </aside>
        )}

        <main className="flex-1 flex flex-col overflow-hidden bg-[#f7f8fa]">
          {breadcrumb && Array.isArray(breadcrumb) && (
            <div className="shrink-0 px-9 py-3.5 bg-white border-b border-slate-200/80 shadow-xs flex items-center justify-between z-30">
              <div className="flex items-center gap-2 text-sm sm:text-base text-slate-500 select-none flex-wrap">
                {breadcrumb.map((b, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-slate-300">›</span>}
                    <span className={idx === breadcrumb.length - 1 ? 'text-[#065f46] font-bold' : 'text-slate-500 font-medium'}>
                      {b}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-9 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Right-Side Notification Drawer Panel */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
      />
    </div>
  );
}
