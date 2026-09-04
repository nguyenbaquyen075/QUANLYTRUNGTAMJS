import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  { key: 'STUDENT', label: 'Học Viên', icon: 'school' },
  { key: 'TEACHER', label: 'Giáo Viên', icon: 'person_play' },
  { key: 'ADMIN', label: 'Quản Trị', icon: 'admin_panel_settings' }
];

export default function LoginPage() {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');
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
        await checkAuth();
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        if (returnUrl) window.location.href = returnUrl;
        else if (selectedRole === 'STUDENT') window.location.href = '/Student/Dashboard';
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

  return (
    <MainLayout hideHeader={true} hideFooter={true} hideChatbot={true}>
      <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 select-none bg-[#f4f7f5] overflow-hidden">
        {/* Background Image Overlay with Emerald Gradient */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(6,95,70,0.85) 0%, rgba(4,120,87,0.75) 50%, rgba(13,148,136,0.65) 100%), url('/images/anhte_teacher_hero.jpg')`,
            filter: 'brightness(0.95)'
          }}
        />

        {/* Decorative Blur Circles */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Main Login Card */}
        <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-7 sm:p-9 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-3 no-underline group mb-1">
              <img
                src="/images/logo.jpg"
                alt="Anh Tê Logo"
                className="h-11 w-11 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="text-left">
                <span className="font-serif font-black text-2xl tracking-tight leading-none text-[#065f46] block">
                  Anh Tê
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5 block">
                  Education
                </span>
              </div>
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
              Chào Mừng Quay Lại
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Đăng nhập để vào lớp học và quản trị trung tâm
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="bg-slate-100/90 p-1.5 rounded-2xl flex gap-1.5 border border-slate-200/80">
            {ROLES.map((r) => {
              const active = selectedRole === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleRoleChange(r.key)}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-[#065f46] text-white shadow-sm shadow-emerald-950/20'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2.5">
              <span className="material-symbols-outlined text-rose-600 text-[20px] shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-[#065f46] text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#065f46] text-[20px] shrink-0">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
            {/* Username / Email */}
            <div>
              <label className="text-slate-700 font-bold text-xs block mb-1.5">
                Email hoặc Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[20px]">
                  person
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-[#065f46] focus:ring-4 focus:ring-emerald-500/10 bg-white transition-all text-sm font-medium"
                  placeholder="Nhập email hoặc SĐT"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 font-bold text-xs">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[20px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-[#065f46] focus:ring-4 focus:ring-emerald-500/10 bg-white transition-all text-sm font-medium"
                  placeholder="Nhập mật khẩu của bạn"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#065f46] hover:bg-[#047857] text-white font-bold text-sm py-3.5 rounded-2xl shadow-md shadow-emerald-950/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6 cursor-pointer"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">login</span>
              )}
              <span>ĐĂNG NHẬP NGAY</span>
            </button>
          </form>

          {/* Register Link Footer */}
          <div className="border-t border-slate-100 text-center text-xs text-slate-600 pt-4 font-medium">
            Chưa có tài khoản?{' '}
            <Link
              to={`/Auth/Register${location.search}`}
              className="text-[#065f46] font-bold hover:underline ml-1"
            >
              Đăng ký tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
