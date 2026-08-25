import React, { useState } from 'react';
import Navbar from './Navbar';
import AIChatbot from './AIChatbot';
import ProfileModal from './ProfileModal';
import TuLinhArenaBackground from './TuLinhArenaBackground';
import { Link } from 'react-router-dom';
import { useSiteContent } from '../../hooks/useSiteContent';

export default function MainLayout({ children, hideHeader = false, hideChatbot = false, overlayHeader = false, hideFooter = false }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { settings } = useSiteContent();
  const centerName = settings.center_name || 'Anh Tê - Tri Thức Lịch Sử';
  const copyrightName = settings.center_name || 'Tri Thức Lịch Sử Anh Tê';
  const contactEmail = settings.contact_email || 'lienhe@anhte.vn';
  const contactPhone = settings.contact_phone || '+84 123 456 789';
  const contactAddress = settings.contact_address || 'Hà Nội, Việt Nam';
  const zaloUrl = settings.contact_zalo_url || '#';
  const facebookUrl = settings.social_facebook_url || '#';
  const telHref = `tel:${(settings.contact_phone || '0123456789').replace(/[^\d+]/g, '')}`;

  return (
    <TuLinhArenaBackground>
      <div className="min-h-screen flex flex-col bg-transparent text-slate-100 relative overflow-x-clip">
      {/* Navbar Header */}
      {!hideHeader && (
        <Navbar onOpenProfile={() => setIsProfileOpen(true)} />
      )}

      {/* Main Content */}
      <main className="flex-1 pt-0">
        {children}
      </main>

      {/* Footer & Sticky Buttons (Only show on guest pages) */}
      {!hideHeader && !hideFooter && (
        <>
          {/* Footer - Compact & Sleek */}
          <footer className="bg-[#047857] border-t border-white/10 pt-10 pb-6 text-white select-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2 space-y-3">
                <h3 className="text-lg sm:text-xl font-black text-white">{centerName}</h3>
                <p className="text-white/80 max-w-sm leading-relaxed text-xs">
                  Sứ mệnh của chúng tôi là biến những trang sử khô khan thành hành trình khám phá sống động và đầy cảm hứng cho thế hệ trẻ Việt Nam thông qua công nghệ và tư duy hình ảnh.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-extrabold text-white uppercase tracking-wider text-xs">Về trung tâm</h4>
                <ul className="space-y-2 text-white/80 text-xs font-medium">
                  <li><Link className="hover:text-white transition-colors" to="/">Trang chủ</Link></li>
                  <li><Link className="hover:text-white transition-colors" to="/Home/Courses">Khoá học</Link></li>
                  <li><Link className="hover:text-white transition-colors" to="/Home/Teachers">Giáo viên</Link></li>
                  <li><Link className="hover:text-white transition-colors" to="/Home/Documents">Tài liệu</Link></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-extrabold text-white uppercase tracking-wider text-xs">Liên hệ</h4>
                <ul className="space-y-2 text-white/80 text-xs font-medium">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-base text-white/90">mail</span> {contactEmail}</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-base text-white/90">call</span> {contactPhone}</li>
                  <li className="flex items-start gap-2"><span className="material-symbols-outlined text-base text-white/90 mt-0.5">location_on</span> {contactAddress}</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-extrabold text-white uppercase tracking-wider text-xs">Theo dõi</h4>
                <div className="flex gap-3">
                  <a className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#047857] transition-all" href={facebookUrl}>
                    <span className="material-symbols-outlined text-base">public</span>
                  </a>
                  <a className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#047857] transition-all" href="#">
                    <span className="material-symbols-outlined text-base">video_library</span>
                  </a>
                  <a className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#047857] transition-all" href="#">
                    <span className="material-symbols-outlined text-base">groups</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 border-t border-white/10 pt-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-white/70">
              <span>© 2026 {copyrightName}. All rights reserved.</span>
              <div className="flex gap-6">
                <Link className="hover:text-white transition-colors" to="/Home/Privacy">Chính sách bảo mật</Link>
                <Link className="hover:text-white transition-colors" to="/Home/Privacy">Điều khoản sử dụng</Link>
              </div>
            </div>
          </footer>

          {/* Sticky Contact Buttons */}
          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[100] select-none">
            {/* Zalo Button */}
            <a
              className="w-12 h-12 bg-[#0068ff] text-white rounded-full flex items-center justify-center shadow-2xl group transition-all hover:scale-110 active:scale-95"
              href={zaloUrl}
              {...(settings.contact_zalo_url ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M2.3 12c0-4.418 4.343-8 9.7-8s9.7 3.582 9.7 8-4.343 8-9.7 8c-1.07 0-2.09-.14-3.03-.4l-4.14 1.4c-.4.14-.76-.17-.67-.57l.67-2.6C3.3 15.63 2.3 13.92 2.3 12zm10.7-3.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm10 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
              </svg>
              <span className="absolute right-full mr-3 bg-white px-3 py-1 rounded-lg text-[10px] font-bold text-primary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Chat Zalo</span>
            </a>
            {/* Phone Button */}
            <a className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center shadow-2xl group transition-all hover:scale-110 active:scale-95" href={telHref}>
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
    </TuLinhArenaBackground>
  );
}
