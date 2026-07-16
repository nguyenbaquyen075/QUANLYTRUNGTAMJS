import React from 'react';
import MainLayout from '../components/Layout/MainLayout';

export default function PrivacyPage() {
  return (
    <MainLayout>
      <section className="py-20 max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-black font-serif text-slate-800 mb-6">Chính Sách Bảo Mật</h1>
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
