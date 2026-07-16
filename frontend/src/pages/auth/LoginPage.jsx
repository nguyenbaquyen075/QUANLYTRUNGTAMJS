import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { checkAuth } = useAuth();
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.post('/Auth/Login', {
        username,
        password,
        selectedRole
      });

      // If EJS Adaptor returns render with error
      if (res.data && res.data.type === 'render') {
        if (res.data.data && res.data.data.errorMessage) {
          setErrorMessage(res.data.data.errorMessage);
        }
      } else if (res.data && res.data.type === 'redirect') {
        await checkAuth();
        window.location.href = res.data.url;
      } else {
        // Successful login, refresh state
        await checkAuth();
        if (selectedRole === 'STUDENT') window.location.href = '/Student/Dashboard';
        else if (selectedRole === 'TEACHER') window.location.href = '/Teacher/Dashboard';
        else if (selectedRole === 'ADMIN') window.location.href = '/Admin/Dashboard';
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Đã xảy ra lỗi kết nối với máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleIconAndColors = () => {
    switch (selectedRole) {
      case 'STUDENT':
        return {
          icon: 'fa-graduation-cap',
          bg: 'rgba(30, 58, 138, 0.05)',
          label: 'Email hoặc Số điện thoại học viên',
          placeholder: 'Nhập email hoặc SĐT học viên/phụ huynh'
        };
      case 'TEACHER':
        return {
          icon: 'fa-chalkboard-user',
          bg: 'rgba(5, 150, 105, 0.15)',
          label: 'Email hoặc Số điện thoại giáo viên',
          placeholder: 'Nhập email hoặc SĐT giáo viên'
        };
      case 'ADMIN':
        return {
          icon: 'fa-shield-halved',
          bg: 'rgba(79, 70, 229, 0.15)',
          label: 'Tài khoản quản trị / Nhân viên',
          placeholder: 'Nhập email hoặc SĐT quản trị'
        };
      default:
        return {};
    }
  };

  const config = getRoleIconAndColors();

  return (
    <MainLayout hideHeader={true} hideChatbot={true}>
      <style>{`
        .login-card-container {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 4rem 2rem 3rem 2rem;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
        }
        .login-card-container::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(219,234,254,0.35) 100%),
                              url('/images/ryunosuke-kikuno-uIRtLhPN_nQ-unsplash.jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            filter: brightness(0.88);
            z-index: 0;
        }
        .login-card-container::after {
            content: '';
            position: absolute;
            top: -30%;
            right: -20%;
            width: 600px;
            height: 600px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(30, 58, 138,0.06) 0%, transparent 70%);
            pointer-events: none;
            z-index: 0;
        }
        .login-card {
            background: rgba(255,255,255,0.82);
            backdrop-filter: blur(28px);
            -webkit-backdrop-filter: blur(28px);
            border: 1.5px solid rgba(255, 255, 255, 0.6);
            border-radius: 24px;
            padding: 2.5rem 2.25rem;
            width: 100%;
            max-width: 460px;
            box-shadow: 0 24px 48px -12px rgba(30, 58, 138, 0.18), 0 0 0 1px rgba(255,255,255,0.3) inset;
            position: relative;
            z-index: 1;
        }
        .role-tabs {
            display: flex;
            background-color: rgba(30, 58, 138, 0.05);
            padding: 0.35rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            gap: 0.25rem;
            border: 1px solid rgba(30, 58, 138, 0.1);
        }
        .role-tab {
            flex: 1;
            text-align: center;
            padding: 0.6rem 0.5rem;
            font-size: 0.82rem;
            font-weight: 700;
            color: #334155;
            background: none;
            border: none;
            border-radius: 9px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
        }
        .role-tab:hover { color: #1e3a8a; background: rgba(30, 58, 138, 0.05); }
        .role-tab.active {
            background: #1e3a8a;
            color: #fff;
            box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
        }
      `}</style>

      <div className="login-card-container">
        <div className="login-card">
          <div className="text-center mb-7">
            <div className="w-16 h-16 rounded-[18px] text-primary flex items-center justify-center text-3xl mb-4 shadow-md border border-slate-200/50 mx-auto transition-all duration-300" style={{ backgroundColor: config.bg }}>
              <i className={`fa-solid ${config.icon}`}></i>
            </div>
            <h2 className="text-[1.6rem] font-extrabold text-slate-900 mb-1">Chào Mừng Quay Lại</h2>
            <p className="text-slate-500 text-xs">Đăng nhập để vào lớp học và quản trị trung tâm.</p>
          </div>

          <div className="role-tabs">
            <button
              type="button"
              className={`role-tab ${selectedRole === 'STUDENT' ? 'active' : ''}`}
              onClick={() => handleRoleChange('STUDENT')}
            >
              <i className="fa-solid fa-graduation-cap"></i> Học Viên
            </button>
            <button
              type="button"
              className={`role-tab ${selectedRole === 'TEACHER' ? 'active' : ''}`}
              onClick={() => handleRoleChange('TEACHER')}
            >
              <i className="fa-solid fa-chalkboard-user"></i> Giáo Viên
            </button>
            <button
              type="button"
              className={`role-tab ${selectedRole === 'ADMIN' ? 'active' : ''}`}
              onClick={() => handleRoleChange('ADMIN')}
            >
              <i className="fa-solid fa-shield-halved"></i> Quản Trị
            </button>
          </div>

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
            {errorMessage && (
              <div className="bg-red-100 border border-red-200 text-red-700 text-[13px] font-semibold p-3 rounded-xl flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="bg-emerald-100 border border-emerald-200 text-emerald-700 text-[13px] font-semibold p-3 rounded-xl flex items-center gap-2">
                <i className="fa-solid fa-circle-check"></i>
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <label className="text-slate-600 font-bold text-[11px] block uppercase tracking-wider mb-1.5">{config.label}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-primary bg-white focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-xs"
                placeholder={config.placeholder}
                required
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold text-[11px] block uppercase tracking-wider mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-primary bg-white focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-xs"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-blue-900 text-white font-extrabold text-xs py-3 rounded-full hover:brightness-110 shadow-lg hover:shadow-primary/25 shadow-primary/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-8"
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <i className="fa-solid fa-right-to-bracket"></i>
              )}
              ĐĂNG NHẬP
            </button>
          </form>

          <div className="border-t border-slate-200/60 text-center text-xs text-slate-600 mt-6 pt-5">
            Chưa có tài khoản?{' '}
            <Link to="/Auth/Register" className="text-primary font-bold hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
