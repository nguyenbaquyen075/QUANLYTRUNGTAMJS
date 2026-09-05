import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { ShoppingBagIcon } from '../Icons/ShoppingBagPlusIcon';
import NotificationDrawer from '../Notification/NotificationDrawer';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/Home/Courses', label: 'Khóa học' },
  { to: '/Home/MockTest', label: 'Thi thử' },
  { to: '/Home/BigMockTest', label: 'Thách đấu cao thủ' },
  { to: '/Home/Documents', label: 'Tài liệu' },
];

export default function Navbar({ onOpenProfile }) {
  const { isLoggedIn, user, logout } = useAuth();
  const { cartCount, openCart } = useCart();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  const getDashboardUrl = () => {
    if (!user) return '/';
    const role = user.role;
    if (role === 'ADMIN' || role === 'STAFF') return '/Admin/Dashboard';
    if (role === 'TEACHER') return '/Teacher/Dashboard';
    if (role === 'STUDENT') return '/Student/Dashboard';
    if (role === 'PARENT') return '/Parent/Dashboard';
    return '/';
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.toLowerCase().startsWith(path.toLowerCase())) return true;
    return false;
  };

  const navDashboardUrl = getDashboardUrl();
  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 w-full z-[9999] bg-white/95 backdrop-blur-md shadow-md transition-shadow">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 no-underline group">
          <img src="/images/logo.jpg" alt="Anh Tê Logo" className="h-10 w-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-2xl tracking-tight leading-none text-[#065f46]">Anh Tê</span>
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">Education</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-[18px]">
          {NAV_LINKS.map((link, idx) => {
            const active = isActive(link.to);
            return (
              <Link
                key={`${link.to}-${idx}`}
                to={link.to}
                className={`py-5 relative font-medium transition-colors hover:text-[#047857] ${active ? 'text-[#047857] font-semibold' : 'text-gray-700'
                  }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#047857] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Cart & Auth Actions */}
        <div className="flex items-center gap-5 sm:gap-6">
          {/* Notification Bell (Logged in) */}
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => setNotifDrawerOpen(true)}
              className="relative w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 hover:text-[#047857] hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-emerald-200"
              title="Thông báo"
            >
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-black min-w-[19px] h-[19px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm shadow-rose-500/40 animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Button (Opens Cart Slide-Over Drawer) */}
          <button
            type="button"
            onClick={openCart}
            className="p-2 rounded-2xl text-slate-700 hover:text-[#065f46] hover:bg-emerald-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-emerald-200"
            title="Giỏ hàng khóa học"
          >
            <div className="relative inline-flex items-center justify-center">
              <ShoppingBagIcon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-800 hover:text-[#065f46]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#065f46] text-white text-[10px] font-black w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs pointer-events-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
          </button>

          {isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              <Link
                to={navDashboardUrl}
                className="bg-[#065f46] hover:bg-[#047857] text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-md shadow-emerald-950/20"
              >
                Bảng điều khiển
              </Link>
              <button
                onClick={onOpenProfile}
                className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 text-[#065f46] font-bold text-sm flex items-center justify-center hover:bg-emerald-100 transition-colors"
                title="Thông tin cá nhân"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{initial}</span>
                )}
              </button>
              <button
                onClick={logout}
                className="text-slate-500 hover:text-rose-600 font-medium text-sm px-2 py-1 transition-colors"
              >
                Thoát
              </button>
            </div>
          ) : (
            <Link
              to="/Auth/Login"
              className="bg-[#065f46] hover:bg-[#047857] text-white font-semibold text-sm px-5 py-2 rounded-lg transition-all shadow-md shadow-emerald-950/20"
            >
              Bắt đầu ngay
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[26px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {NAV_LINKS.map((link, idx) => (
            <Link
              key={`m-${link.to}-${idx}`}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive(link.to) ? 'bg-emerald-50 text-[#065f46] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              openCart();
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ShoppingBagIcon className="w-5 h-5 text-slate-700" />
              <span>Giỏ hàng</span>
            </span>
            {cartCount > 0 && (
              <span className="bg-[#065f46] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Right-Side Notification Drawer Panel */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
      />
    </header>
  );
}
