import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../services/api';

const ROLES = [
  { key: 'STUDENT', label: 'Học Viên', icon: 'school' },
  { key: 'TEACHER', label: 'Giáo Viên', icon: 'person_play' },
  { key: 'PARENT', label: 'Phụ Huynh', icon: 'family_restroom' }
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/Auth/Register', {
        fullName,
        email,
        phone,
        password,
        confirmPassword,
        role
      });

      // If EJS Adaptor returns render with error
      if (res.data && res.data.type === 'render') {
        if (res.data.data && res.data.data.errorMessage) {
          setErrorMessage(res.data.data.errorMessage);
        } else if (res.data.view === 'auth/login') {
          navigate(`/Auth/Login${location.search}`, {
            state: { successMessage: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập để bắt đầu.' }
          });
        }
      } else {
        navigate(`/Auth/Login${location.search}`, {
          state: { successMessage: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.' }
        });
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Đã xảy ra lỗi khi đăng ký tài khoản. Vui lòng thử lại.');
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
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Main Register Card */}
        <div className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-7 sm:p-9 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
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
              Tạo Tài Khoản Mới
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Đăng ký để tham gia các khóa học và luyện thi chất lượng cao
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="bg-slate-100/90 p-1.5 rounded-2xl flex gap-1.5 border border-slate-200/80">
            {ROLES.map((r) => {
              const active = role === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
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

          {/* Register Form */}
          <form onSubmit={handleRegister} autoComplete="off" className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-slate-700 font-bold text-xs block mb-1.5">
                Họ và Tên <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[20px]">
                  person
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-[#065f46] focus:ring-4 focus:ring-emerald-500/10 bg-white transition-all text-sm font-medium"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                />
              </div>
            </div>

            {/* Email & Phone grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-slate-700 font-bold text-xs block mb-1.5">
                  Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[18px]">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-[#065f46] focus:ring-4 focus:ring-emerald-500/10 bg-white transition-all text-xs font-medium"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold text-xs block mb-1.5">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[18px]">
                    call
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-[#065f46] focus:ring-4 focus:ring-emerald-500/10 bg-white transition-all text-xs font-medium"
                    placeholder="0912 345 678"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-slate-700 font-bold text-xs block mb-1.5">
                Mật khẩu <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[20px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-[#065f46] focus:ring-4 focus:ring-emerald-500/10 bg-white transition-all text-sm font-medium"
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div>
              <label className="text-slate-700 font-bold text-xs block mb-1.5">
                Xác nhận Mật khẩu <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[20px]">
                  verified_user
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-[#065f46] focus:ring-4 focus:ring-emerald-500/10 bg-white transition-all text-sm font-medium"
                  placeholder="Nhập lại mật khẩu"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
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
                <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
              )}
              <span>ĐĂNG KÝ TÀI KHOẢN</span>
            </button>
          </form>

          {/* Login Link Footer */}
          <div className="border-t border-slate-100 text-center text-xs text-slate-600 pt-4 font-medium">
            Đã có tài khoản?{' '}
            <Link
              to={`/Auth/Login${location.search}`}
              className="text-[#065f46] font-bold hover:underline ml-1"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
