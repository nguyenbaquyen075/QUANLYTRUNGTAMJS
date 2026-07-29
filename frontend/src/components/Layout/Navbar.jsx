import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/Home/Courses', label: 'Khóa học' },
  { to: '/Home/Courses', label: 'Lộ trình học' },
  { to: '/Home/Teachers', label: 'Giáo viên' },
  { to: '/Home/News', label: 'Tin tức' },
  { to: '/Home/Documents', label: 'Tài liệu' },
];

export default function Navbar({ onOpenProfile }) {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardUrl = () => {
    if (!user) return '/';
    const role = user.role;
    if (role === 'ADMIN' || role === 'STAFF') {
      return '/Admin/Dashboard';
    } else if (role === 'TEACHER') {
      return '/Teacher/Dashboard';
    } else if (role === 'STUDENT') {
      return '/Student/Dashboard';
    } else if (role === 'PARENT') {
      return '/Parent/Dashboard';
    }
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
    <header
      id="navbar"
      className="fixed top-0 w-full z-50 bg-[#052821] border-0 shadow-none"
    >
      <div className="h-[72px] max-w-[1360px] mx-auto px-6 sm:px-10 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="font-bold text-lg sm:text-xl text-white tracking-tight" style={{ fontFamily: '"Be Vietnam Pro", sans-serif' }}>
            Anh Tê - Tri Thức Lịch Sử
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-8 text-sm">
          {NAV_LINKS.map((link, idx) => (
            <Link
              key={`${link.to}-${idx}`}
              to={link.to}
              className={`transition-colors ${isActive(link.to)
                  ? 'text-white font-bold'
                  : 'text-white/[0.78] font-medium hover:text-white'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth / Avatar Section */}
        <div className="flex items-center gap-4 text-sm">
          {isLoggedIn && user ? (
            <>
              <a
                href={navDashboardUrl}
                className="bg-[#2fdf9d] text-[#04231d] px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-[#22c48a] transition-all"
              >
                Bảng Điều Khiển
              </a>
              <div
                onClick={onOpenProfile}
                className="w-9 h-9 rounded-full bg-[#2fdf9d] text-[#04231d] font-bold text-sm flex items-center justify-center cursor-pointer border border-[#2fdf9d]"
                title="Xem thông tin cá nhân"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              <button
                onClick={logout}
                className="text-white hover:text-[#2fdf9d] font-medium px-3 py-1.5 transition-all text-sm"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/Auth/Login"
                className="text-white font-medium hover:text-[#2fdf9d] px-3 py-2 transition-all"
              >
                Đăng nhập
              </Link>
              <Link
                to="/Auth/Register"
                className="bg-[#2fdf9d] text-[#04231d] px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-[#22c48a] transition-all hover:scale-105"
              >
                Đăng ký
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden w-9 h-9 rounded-lg border border-white/20 text-white flex items-center justify-center hover:bg-white/10 shrink-0"
          >
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#052821] p-4 space-y-1 border-t border-white/10 shadow-2xl">
          {NAV_LINKS.map((link, idx) => (
            <Link
              key={`${link.to}-${idx}`}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 ${isActive(link.to) ? 'text-white font-bold' : 'text-white/[0.78]'
                }`}
            >
              {link.label}
            </Link>
          ))}
          {!isLoggedIn ? (
            <>
              <Link
                to="/Auth/Login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:text-[#2fdf9d] hover:bg-white/10"
              >
                Đăng nhập
              </Link>
              <Link
                to="/Auth/Register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-bold bg-[#2fdf9d] text-[#04231d] hover:bg-[#22c48a] text-center"
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <button
              onClick={() => { setIsMobileMenuOpen(false); logout(); }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:bg-white/10"
            >
              Đăng xuất
            </button>
          )}
        </div>
      )}
    </header>
  );
}
