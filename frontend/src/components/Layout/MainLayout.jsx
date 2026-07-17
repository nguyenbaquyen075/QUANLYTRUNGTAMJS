import React, { useState } from 'react';
import Navbar from './Navbar';
import AIChatbot from './AIChatbot';
import ProfileModal from './ProfileModal';
import { Link } from 'react-router-dom';

export default function MainLayout({ children, hideHeader = false, hideChatbot = false, overlayHeader = false, hideFooter = false }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Navbar Header */}
      {!hideHeader && (
        <Navbar onOpenProfile={() => setIsProfileOpen(true)} />
      )}

      {/* Main Content */}
      <main className={`flex-1 ${!hideHeader && !overlayHeader ? 'pt-24' : 'pt-0'}`}>
        {children}
      </main>

      {/* Footer & Sticky Buttons (Only show on guest pages) */}
      {!hideHeader && !hideFooter && (
        <>
          {/* Footer */}
          <footer style={{ backgroundColor: '#6c2f00' }} className="pt-12 pb-6 relative overflow-hidden border-t border-white/10 text-white select-none">
            <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
              <div className="grid lg:grid-cols-12 gap-8 mb-8">
                <div className="lg:col-span-4 space-y-6">
                  <div className="flex items-center gap-2">
                    <img alt="Logo" className="h-16 w-auto brightness-0 invert" src="/images/logo.png?v=3" />
                    <span className="text-white font-black text-xl">TrungTâmOnline</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed max-w-sm font-semibold">
                    Nền tảng giáo dục trực tuyến cao cấp, ứng dụng trí tuệ nhân tạo để kiến tạo lộ trình học tập tối ưu cho thế hệ tương lai.
                  </p>
                  <div className="flex gap-4 pt-2">
                    <a className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#6c2f00] transition-all text-white"
                        href="#">
                      <span className="material-symbols-outlined text-[16px]">public</span>
                    </a>
                    <a className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#6c2f00] transition-all text-white"
                        href="#">
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                    </a>
                    <a className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#6c2f00] transition-all text-white"
                        href="#">
                      <span className="material-symbols-outlined text-[16px]">play_circle</span>
                    </a>
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Đào tạo</h4>
                  <ul className="space-y-3 text-white/70 text-xs font-bold">
                    <li><a className="hover:text-white transition-colors" href="#">Luyện Thi Đại Học</a></li>
                    <li><a className="hover:text-white transition-colors" href="#">Tiếng Anh IELTS</a></li>
                    <li><a className="hover:text-white transition-colors" href="#">Toán - Lý - Hóa</a></li>
                    <li><a className="hover:text-white transition-colors" href="#">Kỹ Năng Mềm AI</a></li>
                  </ul>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Hỗ Trợ</h4>
                  <ul className="space-y-3 text-white/70 text-xs font-bold">
                    <li><Link className="hover:text-white transition-colors" to="/Home/Privacy">Chính Sách Bảo Mật</Link></li>
                    <li><Link className="hover:text-white transition-colors" to="/Home/Privacy">Điều Khoản Sử Dụng</Link></li>
                    <li><Link className="hover:text-white transition-colors" to="/Auth/Register">Hướng Dẫn Đăng Ký</Link></li>
                    <li><a className="hover:text-white transition-colors" href="#">Góp Ý Dịch Vụ</a></li>
                  </ul>
                </div>
                <div className="lg:col-span-4 space-y-6">
                  <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Ứng Dụng Di Động</h4>
                  <p className="text-white/70 text-xs font-semibold">Học tập liền mạch mọi lúc mọi nơi.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a className="flex items-center gap-3 bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all border border-white/20 flex-1" href="#">
                      <span className="material-symbols-outlined text-[24px] text-white">shop</span>
                      <div>
                        <div className="text-[8px] uppercase font-black tracking-widest text-white/40">Get it on</div>
                        <div className="font-black text-xs text-white">Google Play</div>
                      </div>
                    </a>
                    <a className="flex items-center gap-3 bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all border border-white/20 flex-1" href="#">
                      <span className="material-symbols-outlined text-[24px] text-white">phone_iphone</span>
                      <div>
                        <div className="text-[8px] uppercase font-black tracking-widest text-white/40">Available on</div>
                        <div className="font-black text-xs text-white">App Store</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3">
                <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">© 2024 ACADEMIAPRO. ALL RIGHTS RESERVED.</p>
                <div className="flex gap-8">
                  <Link className="text-white/30 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-colors" to="/Home/Privacy">Privacy Policy</Link>
                  <Link className="text-white/30 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-colors" to="/Home/Privacy">Terms of Service</Link>
                </div>
              </div>
            </div>
          </footer>

          {/* Sticky Contact Buttons */}
          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[100] select-none">
            {/* Zalo Button */}
            <a className="w-12 h-12 bg-[#0068ff] text-white rounded-full flex items-center justify-center shadow-2xl group transition-all hover:scale-110 active:scale-95" href="#">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M2.3 12c0-4.418 4.343-8 9.7-8s9.7 3.582 9.7 8-4.343 8-9.7 8c-1.07 0-2.09-.14-3.03-.4l-4.14 1.4c-.4.14-.76-.17-.67-.57l.67-2.6C3.3 15.63 2.3 13.92 2.3 12zm10.7-3.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm10 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
              </svg>
              <span className="absolute right-full mr-3 bg-white px-3 py-1 rounded-lg text-[10px] font-bold text-primary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Chat Zalo</span>
            </a>
            {/* Phone Button */}
            <a className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center shadow-2xl group transition-all hover:scale-110 active:scale-95" href="tel:0123456789">
              <span className="material-symbols-outlined text-[24px]">call</span>
              <span className="absolute right-full mr-3 bg-white px-3 py-1 rounded-lg text-[10px] font-bold text-secondary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Gọi Ngay</span>
            </a>
          </div>
        </>
      )}

      {/* AI Floating Chatbot Widget */}
      {!hideChatbot && (
        <AIChatbot />
      )}

      {/* Profile Details/Edit Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
