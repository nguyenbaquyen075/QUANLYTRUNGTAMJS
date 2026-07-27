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
      if (window.scrollY > 80) {
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

  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !isScrolled;

  const navDashboardUrl = getDashboardUrl();
  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  const linkClass = (path) => {
    const active = isActive(path);
    if (isTransparent) {
      return `text-[13px] font-bold transition-all whitespace-nowrap px-4 py-1.5 rounded-full ${
        active ? 'text-sky-400 font-black relative after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-sky-400' : 'text-white/90 hover:text-sky-300'
      }`;
    }
    return `text-[13px] font-bold transition-all whitespace-nowrap px-4 py-1.5 rounded-full ${
      active ? 'text-blue-700 font-black relative after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-blue-600' : 'text-slate-700 hover:text-blue-600'
    }`;
  };

  return (
    <header
      id="navbar"
      className={`w-full fixed top-0 z-[100] transition-all duration-300 ${
        !isTransparent
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 navbar-scrolled py-1'
          : 'bg-transparent navbar-top py-2'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 flex justify-between items-center gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <img alt="Logo" className="h-14 w-auto" src="/images/logo.png?v=3" />
            <span 
              className={`font-black text-xl hidden sm:block tracking-wide transition-all duration-300 ${
                !isTransparent ? 'text-slate-900' : 'text-white'
              }`}
              style={isTransparent ? { textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)' } : {}}
            >
              TrungTâmOnline
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className={`hidden md:flex items-center space-x-6 rounded-full px-8 py-2 shadow-sm transition-all ${
          isTransparent 
            ? 'bg-slate-900/40 border border-white/20 backdrop-blur-md' 
            : 'bg-slate-100/90 border border-slate-200/90'
        }`}>
          <Link to="/" className={linkClass('/')}>Trang Chủ</Link>
          <Link to="/Home/Courses" className={linkClass('/Home/Courses')}>Khóa Học</Link>
          <Link to="/Home/Teachers" className={linkClass('/Home/Teachers')}>Giáo Viên</Link>
          <Link to="/Home/News" className={linkClass('/Home/News')}>Tin Tức</Link>
          <Link to="/Home/Documents" className={linkClass('/Home/Documents')}>Tài Liệu</Link>
        </nav>

        {/* Auth / Avatar Section */}
        <div className="flex items-center gap-3">
          {isLoggedIn && user ? (
            <>
              <a
                href={navDashboardUrl}
                className="h-10 bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                <span className="hidden sm:inline">Bảng Điều Khiển</span>
              </a>

              {/* Avatar trigger */}
              <div
                onClick={onOpenProfile}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-700 to-blue-500 text-white font-bold text-sm flex items-center justify-center cursor-pointer border-2 border-white shadow-md hover:scale-105 transition-all shrink-0"
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
                className={`hidden lg:flex h-10 items-center justify-center gap-1.5 text-xs font-bold px-4 rounded-full border transition-all shrink-0 ${
                  !isTransparent
                    ? 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border-slate-200 hover:border-red-200'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                <i className="fa-solid fa-right-from-bracket" /> Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/Auth/Login"
                className={`hidden sm:flex text-xs font-bold transition-all px-5 py-2.5 rounded-full shrink-0 ${
                  !isTransparent 
                    ? 'text-slate-800 hover:text-blue-600' 
                    : 'text-white hover:text-sky-300'
                }`}
                style={isTransparent ? { textShadow: '0 2px 4px rgba(0,0,0,0.8)' } : {}}
              >
                Đăng Nhập
              </Link>
              <Link
                to="/Auth/Register"
                className="bg-gradient-to-r from-primary to-blue-700 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 hover:brightness-110 transition-all shadow-md active:scale-95 shrink-0"
                style={!isScrolled ? { boxShadow: '0 4px 14px rgba(30, 58, 138, 0.5), 0 0 8px rgba(30, 58, 138, 0.4)' } : {}}
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
