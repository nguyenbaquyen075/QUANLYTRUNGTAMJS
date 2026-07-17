import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.post('/Auth/Register', {
        fullName,
        email,
        phone,
        password,
        confirmPassword: password, // Autopopulate to satisfy backend requirement
        role
      });

      // If EJS Adaptor returns render with error
      if (res.data && res.data.type === 'render') {
        if (res.data.data && res.data.data.errorMessage) {
          setErrorMessage(res.data.data.errorMessage);
        } else if (res.data.view === 'auth/login') {
          // Success renders the login view with a success message!
          navigate('/Auth/Login', {
            state: { successMessage: 'Đăng ký tài khoản thành công! Vui lòng chờ Ban quản trị duyệt tài khoản trước khi đăng nhập.' }
          });
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Đã xảy ra lỗi khi đăng ký tài khoản.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout hideHeader={false} hideFooter={true} hideChatbot={true} overlayHeader={true}>
      <style>{`
        .register-container {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 7.5rem 2rem 4rem 2rem;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
        }
        .register-container::before {
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
        .register-container::after {
            content: '';
            position: absolute;
            bottom: -20%;
            left: -10%;
            width: 500px;
            height: 500px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(30, 58, 138, 0.06) 0%, transparent 70%);
            pointer-events: none;
            z-index: 0;
        }
        .register-card {
            background: rgba(255, 255, 255, 0.82);
            backdrop-filter: blur(28px);
            -webkit-backdrop-filter: blur(28px);
            border: 1.5px solid rgba(255, 255, 255, 0.6);
            border-radius: 24px;
            padding: 4.25rem 2.25rem;
            width: 100%;
            max-width: 520px;
            box-shadow: 0 24px 48px -12px rgba(30, 58, 138, 0.18), 0 0 0 1px rgba(255,255,255,0.3) inset;
            animation: fadeSlideIn 0.4s ease;
            position: relative;
            z-index: 1;
        }
        @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="register-container">
        <div className="register-card">
          <div className="text-center mb-6">
            <h2 className="text-[1.55rem] font-extrabold text-slate-900 mb-1.5">Tạo Tài Khoản Mới</h2>
            <p className="text-slate-500 text-xs">Đăng ký để bắt đầu hành trình học tập.</p>
          </div>

          <form onSubmit={handleRegister} autoComplete="off" className="space-y-6">
            {errorMessage && (
              <div className="bg-red-100 border border-red-200 text-red-700 text-[13px] font-semibold p-3 rounded-xl flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="text-slate-600 font-bold text-[11px] block uppercase tracking-wider mb-1.5">Họ và Tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-primary bg-white focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-xs"
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold text-[11px] block uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-primary bg-white focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-xs"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold text-[11px] block uppercase tracking-wider mb-1.5">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-primary bg-white focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-xs"
                placeholder="0901234567"
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
                placeholder="Tối thiểu 6 ký tự"
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold text-[11px] block uppercase tracking-wider mb-1.5">Vai trò</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-primary bg-white focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-xs appearance-none"
              >
                <option value="STUDENT">Học Viên</option>
                <option value="TEACHER">Giáo Viên</option>
                <option value="PARENT">Phụ Huynh</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-blue-900 text-white font-extrabold text-xs py-3 rounded-full hover:brightness-110 shadow-lg hover:shadow-primary/25 shadow-primary/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-8"
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <i className="fa-solid fa-user-check"></i>
              )}
              ĐĂNG KÝ NGAY
            </button>
          </form>

          <div className="border-t border-slate-200/60 text-center text-xs text-slate-600 mt-6 pt-5">
            Đã có tài khoản?{' '}
            <Link to="/Auth/Login" className="text-primary font-bold hover:underline">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
