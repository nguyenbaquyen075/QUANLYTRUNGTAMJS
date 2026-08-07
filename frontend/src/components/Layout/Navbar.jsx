import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/Home/Courses', label: 'Khóa học' },
  { to: '/Home/MockTest', label: 'Thi thử' },
  { to: '/Home/BigMockTest', label: 'Thách đấu thi thử' },
  { to: '/Home/Documents', label: 'Tài liệu' },
];

export default function Navbar({ onOpenProfile }) {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#047857] to-[#0088ff] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-extrabold text-xl text-[#0c2340] tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Flash <span className="text-[#047857]">Study</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-[15px]">
          {NAV_LINKS.map((link, idx) => {
            const active = isActive(link.to);
            return (
              <Link
                key={`${link.to}-${idx}`}
                to={link.to}
                className={`py-5 relative font-medium transition-colors hover:text-[#047857] ${
                  active ? 'text-[#047857] font-semibold' : 'text-gray-700'
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

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              <Link
                to={navDashboardUrl}
                className="bg-[#047857] hover:bg-[#0144a8] text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-md shadow-blue-600/20"
              >
                Bảng điều khiển
              </Link>
              <button
                onClick={onOpenProfile}
                className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 text-[#047857] font-bold text-sm flex items-center justify-center hover:bg-blue-100 transition-colors"
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
                className="text-gray-500 hover:text-red-600 font-medium text-sm px-2 py-1 transition-colors"
              >
                Thoát
              </button>
            </div>
          ) : (
            <Link
              to="/Auth/Login"
              className="bg-[#047857] hover:bg-[#03543f] active:scale-95 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
            >
              Bắt đầu ngay
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 shadow-xl">
          {NAV_LINKS.map((link, idx) => (
            <Link
              key={`${link.to}-${idx}`}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to) ? 'bg-blue-50 text-[#047857] font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

