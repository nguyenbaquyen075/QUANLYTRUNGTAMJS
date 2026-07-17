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

  const navDashboardUrl = getDashboardUrl();
  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  const linkClass = (path) => {
    const active = isActive(path);
    return `text-[12px] font-semibold transition-all whitespace-nowrap px-3 py-1.5 rounded-full ${
      active
        ? 'text-on-surface font-bold relative after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-primary'
        : 'text-on-surface-variant hover:text-primary'
    }`;
  };

  return (
    <header
      id="navbar"
      className={`w-full fixed top-0 z-[100] transition-all duration-500 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-md shadow-lg border-b border-white/40 navbar-scrolled'
          : 'bg-transparent navbar-top'
      }`}
    >
      <style>{`
        /* Navigation capsule at top (not scrolled) */
        #navbar.navbar-top nav.glass-premium {
            background-color: rgba(15, 23, 42, 0.35) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            transition: all 0.5s ease;
        }
        #navbar.navbar-top nav.glass-premium a {
            color: #ffffff !important;
            font-weight: 800 !important;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9), 0 0 6px rgba(0, 0, 0, 0.5) !important;
            font-size: 13px !important;
            transition: all 0.2s ease;
        }
        #navbar.navbar-top nav.glass-premium a:hover {
            color: #38bdf8 !important;
            transform: translateY(-1px);
        }
        #navbar.navbar-top nav.glass-premium a.text-on-surface::after {
            background-color: #38bdf8 !important;
        }

        /* Navigation capsule when scrolled */
        #navbar.navbar-scrolled nav.glass-premium {
            background-color: rgba(255, 255, 255, 0.4) !important;
            border: 1px solid rgba(0, 0, 0, 0.05) !important;
            transition: all 0.5s ease;
        }
        #navbar.navbar-scrolled nav.glass-premium a {
            color: #000000 !important;
            font-weight: 800 !important;
            text-shadow: 0 1px 1.5px rgba(255, 255, 255, 0.9), 0 0 3px rgba(255, 255, 255, 0.6) !important;
            font-size: 13px !important;
            transition: all 0.2s ease;
        }
        #navbar.navbar-scrolled nav.glass-premium a:hover {
            color: var(--primary, #1e3a8a) !important;
            transform: translateY(-1px);
        }
        #navbar.navbar-scrolled nav.glass-premium a.text-on-surface::after {
            background-color: var(--primary, #1e3a8a) !important;
        }

        .nav-login-btn {
            transition: all 0.3s ease !important;
        }
        .nav-login-btn:hover {
            color: #ffffff !important;
            background: linear-gradient(to right, #1e3a8a, #1d4ed8) !important;
            text-shadow: none !important;
            box-shadow: 0 4px 14px rgba(30, 58, 138, 0.5), 0 0 8px rgba(30, 58, 138, 0.4) !important;
            transform: translateY(-1px);
        }
        .nav-login-btn:active {
            transform: scale(0.95) !important;
        }
      `}</style>
      <div
        className={`max-w-7xl mx-auto px-5 lg:px-8 transition-all duration-300 flex justify-between items-center gap-2 ${
          isScrolled ? 'py-3' : 'py-5'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <img alt="Logo" className="h-16 w-auto" src="/images/logo.png?v=3" />
            <span 
              className={`font-black text-xl hidden sm:block tracking-wide transition-all duration-300 ${
                isScrolled ? 'text-slate-800' : 'text-white'
              }`}
              style={!isScrolled ? { textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)' } : {}}
            >
              TrungTâmOnline
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 bg-white/40 glass-premium rounded-full px-10 py-2.5 shadow-sm">
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
              <span className="hidden xl:inline text-xs font-semibold text-slate-600">
                Xin chào, {user.fullName}
              </span>
              
              <a
                href={navDashboardUrl}
                className="bg-primary/5 border border-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-primary/10 transition-all shadow-sm shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">dashboard</span>
                <span className="hidden sm:inline">Bảng Điều Khiển</span>
              </a>

              {/* Notification icon */}
              <a
                href="/Notification"
                className="relative w-9 h-9 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/10 text-primary flex items-center justify-center transition-all shrink-0"
                title="Thông báo"
              >
                <i className="fa-solid fa-bell text-sm" />
                <span
                  id="notifBadge"
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 hidden items-center justify-center border-2 border-white"
                >
                  0
                </span>
              </a>

              {/* Avatar trigger */}
              <div
                onClick={onOpenProfile}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-sm flex items-center justify-center cursor-pointer border-2 border-white shadow-md hover:scale-105 transition-all shrink-0"
                title="Xem thông tin cá nhân"
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
                className="hidden lg:flex items-center gap-1 text-slate-500 hover:text-red-600 text-xs font-semibold hover:bg-red-50 px-3 py-2 rounded-full transition-all shrink-0"
              >
                <i className="fa-solid fa-right-from-bracket" /> Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/Auth/Login"
                className={`hidden sm:flex text-xs font-bold transition-all px-5 py-2.5 rounded-full nav-login-btn shrink-0 ${
                  isScrolled 
                    ? 'text-slate-600' 
                    : 'text-white'
                }`}
                style={!isScrolled ? { textShadow: '0 2px 5px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)' } : {}}
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
