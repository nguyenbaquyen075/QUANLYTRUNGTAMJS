import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

  const isDarkTheme = true;

  const navDashboardUrl = getDashboardUrl();
  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  const linkClass = (path) => {
    const active = isActive(path);
    if (isDarkTheme) {
      return `text-sm sm:text-base font-extrabold transition-colors whitespace-nowrap px-4.5 py-2.5 ${active
          ? 'text-cyan-400 font-black'
          : 'text-slate-100 hover:text-cyan-400'
        }`;
    }
    return `text-sm sm:text-base font-extrabold transition-colors whitespace-nowrap px-4.5 py-2.5 ${active
        ? 'text-blue-600 font-black'
        : 'text-slate-700 hover:text-blue-600'
      }`;
  };

  return (
    <header
      id="navbar"
      className={`w-full fixed top-0 z-[100] transition-all duration-300 ${isScrolled
          ? 'bg-[#1a2b56]/95 backdrop-blur-md shadow-lg shadow-slate-950/40 border-b border-blue-900/40 py-3.5 sm:py-4'
          : 'bg-[#1a2b56]/80 backdrop-blur-md py-6.5 sm:py-8'
        }`}
    >
      <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 flex justify-between items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-600/10 border border-blue-400/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.35)]">
              <span className="material-symbols-outlined text-cyan-400 text-2xl sm:text-3xl">school</span>
            </div>
            <div className="flex flex-col">
              <span className={`font-black text-xl md:text-2xl tracking-wide leading-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'
                }`}>
                TrungTâm<span className="text-cyan-400">Online</span>
              </span>
              <span className="text-[#ffd700] font-bold text-[10px] sm:text-[11px] tracking-[0.2em] uppercase -mt-0.5">
                TRI THỨC & LUYỆN THI
              </span>
            </div>
          </Link>
        </div>

        {/* Traditional Desktop Nav Bar (Inline Full Block Layout) */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-8 xl:space-x-10">
          <Link to="/" className={linkClass('/')}>Trang Chủ</Link>
          <Link to="/Home/Courses" className={linkClass('/Home/Courses')}>Khóa Học</Link>
          <Link to="/Home/Teachers" className={linkClass('/Home/Teachers')}>Giáo Viên</Link>
          <Link to="/Home/News" className={linkClass('/Home/News')}>Tin Tức</Link>
          <Link to="/Home/Documents" className={linkClass('/Home/Documents')}>Tài Liệu</Link>
        </nav>

        {/* Auth / Avatar Section */}
        <div className="flex items-center gap-3.5">
          {isLoggedIn && user ? (
            <>
              <a
                href={navDashboardUrl}
                className="h-11 sm:h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white px-6 rounded-full text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(56,189,248,0.35)] active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span className="hidden sm:inline">Bảng Điều Khiển</span>
              </a>

              {/* Avatar trigger */}
              <div
                onClick={onOpenProfile}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-700 to-cyan-500 text-white font-bold text-base flex items-center justify-center cursor-pointer border-2 border-white shadow-md hover:scale-105 transition-all shrink-0"
                title="Xem thông tin cá nhân"
                style={{ boxSizing: 'border-box' }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{initial}</span>
                )}
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className={`hidden lg:flex h-11 sm:h-12 items-center justify-center gap-2 text-xs sm:text-sm font-bold px-5 rounded-full border transition-all shrink-0 ${isDarkTheme
                    ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
              >
                <i className="fa-solid fa-right-from-bracket" /> Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/Auth/Login"
                className={`hidden sm:flex text-xs sm:text-sm font-extrabold transition-all px-5 py-3 rounded-full shrink-0 ${isDarkTheme
                    ? 'text-slate-200 hover:text-cyan-400'
                    : 'text-slate-800 hover:text-blue-600'
                  }`}
              >
                Đăng Nhập
              </Link>
              <Link
                to="/Auth/Register"
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white px-6 py-3 rounded-full text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(56,189,248,0.35)] active:scale-95 shrink-0"
              >
                <i className="fa-solid fa-user-plus" /> Đăng Ký
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 shrink-0"
          >
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 space-y-2 shadow-lg">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Trang Chủ
          </Link>
          <Link
            to="/Home/Courses"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Khóa Học
          </Link>
          <Link
            to="/Home/Teachers"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Giáo Viên
          </Link>
          <Link
            to="/Home/News"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Tin Tức
          </Link>
          <Link
            to="/Home/Documents"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Tài Liệu
          </Link>
          {!isLoggedIn && (
            <Link
              to="/Auth/Login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-primary/5"
            >
              Đăng Nhập
            </Link>
          )}
          {isLoggedIn && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Đăng xuất
            </button>
          )}
        </div>
      )}
    </header>
  );
}
