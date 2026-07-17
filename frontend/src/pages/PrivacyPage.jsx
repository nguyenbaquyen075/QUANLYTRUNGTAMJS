import React from 'react';
import MainLayout from '../components/Layout/MainLayout';

export default function PrivacyPage() {
  return (
    <MainLayout overlayHeader={true}>
      {/* Hero Banner Section */}
      <section 
        className="relative overflow-hidden select-none pt-36 pb-20 border-b border-slate-800/20"
        style={{
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(15, 23, 42, 0.28) 0%, rgba(15, 23, 42, 0.12) 100%), url('/images/hero-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <h1 
            className="text-4xl md:text-5xl font-black font-serif leading-tight text-white mb-4"
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8), 0 4px 15px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.4)' }}
          >
            Chính Sách & Điều Khoản
          </h1>
          <p 
            className="text-slate-200 text-xs md:text-sm max-w-xl leading-relaxed font-semibold"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.5)' }}
          >
            Cam kết bảo vệ thông tin cá nhân và cung cấp môi trường học tập an toàn.
          </p>
        </div>
      </section>

      <section className="pb-20 max-w-4xl mx-auto px-6">
        <div className="prose text-sm text-slate-600 space-y-4 leading-relaxed font-semibold">
          <p>Chào mừng bạn đến với Trung Tâm Học Thêm Online. Chúng tôi rất coi trọng quyền riêng tư của bạn và cam kết bảo vệ thông tin cá nhân của người học và giảng viên.</p>
          <h2 className="text-lg font-bold text-slate-800 pt-4">1. Thu thập thông tin</h2>
          <p>Chúng tôi thu thập thông tin cá nhân cơ bản như Họ tên, Email, Số điện thoại và Vai trò (Học viên, Giáo viên, Phụ huynh) để cung cấp tài khoản đăng nhập và liên lạc trong quá trình học tập.</p>
          <h2 className="text-lg font-bold text-slate-800 pt-4">2. Sử dụng thông tin</h2>
          <p>Thông tin thu thập được sử dụng để cá nhân hóa lộ trình học bằng AI, gửi hóa đơn thanh toán học phí, ghi chép kết quả bài tập về nhà và thông báo thời khóa biểu lớp học ảo.</p>
          <h2 className="text-lg font-bold text-slate-800 pt-4">3. Bảo mật thông tin</h2>
          <p>Hệ thống dữ liệu của chúng tôi được bảo vệ và mã hóa mật khẩu, đảm bảo thông tin cá nhân không bị rò rỉ hoặc truy cập trái phép từ bên ngoài.</p>
        </div>
      </section>
    </MainLayout>
  );
}
