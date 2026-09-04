import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';

export default function NotificationDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const drawerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (activeTab === 'UNREAD' && notif.IsRead) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const t = (notif.Title || '').toLowerCase();
        const c = (notif.Content || '').toLowerCase();
        if (!t.includes(q) && !c.includes(q)) return false;
      }
      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24 && date.getDate() === now.getDate()) {
        return `Hôm nay lúc ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
      }
      if (diffDays === 1) {
        return `Hôm qua lúc ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
      }
      return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateStr;
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.IsRead) {
      await markAsRead(notif.Id);
    }
    if (notif.LinkUrl && notif.LinkUrl !== 'null' && notif.LinkUrl.trim() !== '') {
      const url = notif.LinkUrl.trim();
      onClose();
      if (url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        navigate(url);
      }
    }
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await api.post('/Notification/Delete', { id });
      fetchNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] overflow-hidden">
      {/* Frosted Glass Backdrop with Smooth Fade */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Right Panel */}
      <div
        ref={drawerRef}
        className="fixed inset-y-0 right-0 max-w-full flex z-10 animate-in slide-in-from-right duration-300 ease-out"
      >
        <div className="w-screen max-w-[440px] bg-gradient-to-b from-white via-[#fcfdfd] to-[#f8fafc] shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.25)] rounded-l-[32px] border-l border-white/80 ring-1 ring-black/5 flex flex-col h-full overflow-hidden">

          {/* ================= Luxurious Radiant Header ================= */}
          <div className="relative bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#0f766e] text-white px-6 pt-6 pb-5 shrink-0 overflow-hidden shadow-lg">
            {/* Ambient Background Glow Particles */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-teal-300/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner relative group">
                  <span className="material-symbols-outlined text-[24px] text-emerald-100 group-hover:scale-110 transition-transform">
                    notifications_active
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-[#064e3b] animate-ping" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif italic font-black text-2xl text-white tracking-tight">
                      Thông Báo
                    </h3>
                    {unreadCount > 0 && (
                      <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm ring-1 ring-white/30 animate-pulse">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-100/80 font-medium mt-0.5">
                    Tin tức, nhắc bài & cập nhật hệ thống
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowSearch(!showSearch)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${showSearch
                    ? 'bg-white text-emerald-800 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  title="Tìm kiếm thông báo"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:rotate-90"
                  title="Đóng bảng thông báo"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Quick Search Slide-down */}
            {showSearch && (
              <div className="relative mt-3.5 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-emerald-800 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm nội dung thông báo..."
                  className="w-full pl-9 pr-8 py-2 bg-white text-slate-800 placeholder:text-slate-400 text-xs rounded-xl font-medium outline-none shadow-md focus:ring-2 focus:ring-emerald-300"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ================= Filter Tabs & Mark All Action ================= */}
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-white/90 backdrop-blur-md shrink-0">
            {/* Segmented Pills */}
            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 shadow-inner">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'ALL'
                  ? 'bg-white text-[#047857] shadow-sm shadow-black/5'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>Tất cả</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${activeTab === 'ALL' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                  {notifications.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('UNREAD')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'UNREAD'
                  ? 'bg-white text-rose-600 shadow-sm shadow-black/5'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>Chưa đọc</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-rose-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="group text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/80 transition-all flex items-center gap-1 shadow-xs hover:scale-102"
                title="Đánh dấu tất cả là đã đọc"
              >
                <span className="material-symbols-outlined text-[15px] group-hover:rotate-12 transition-transform">
                  done_all
                </span>
                <span>Đã đọc hết</span>
              </button>
            )}
          </div>

          {/* ================= Notification List Scroll Area ================= */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {loading && notifications.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="relative w-12 h-12 mb-3">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                  <span className="material-symbols-outlined absolute inset-0 m-auto text-[20px] text-emerald-600">
                    notifications
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold">Đang đồng bộ thông báo...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center my-auto">
                <div className="relative w-20 h-20 mb-4">
                  <div className="w-20 h-20 bg-gradient-to-tr from-emerald-50 to-teal-100 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner ring-8 ring-emerald-50/50">
                    <span className="material-symbols-outlined text-[36px]">
                      {activeTab === 'UNREAD' ? 'mark_email_read' : 'notifications_none'}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <span className="material-symbols-outlined text-[14px]">sparkles</span>
                  </div>
                </div>

                <h4 className="font-serif italic font-bold text-slate-800 text-base mb-1">
                  {searchQuery
                    ? 'Không có kết quả khớp'
                    : activeTab === 'UNREAD'
                      ? 'Tuyệt vời! Đã xem hết'
                      : 'Hộp thông báo đang trống'}
                </h4>
                <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
                  {searchQuery
                    ? `Không tìm thấy thông báo nào với "${searchQuery}".`
                    : activeTab === 'UNREAD'
                      ? 'Bạn không còn thông báo chưa đọc nào cần xử lý.'
                      : 'Mọi thông báo cập nhật, bài tập và điểm số mới sẽ hiển thị tại đây.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const titleLower = (notif.Title || '').toLowerCase();
                const isAssignment =
                  titleLower.includes('bài tập') ||
                  titleLower.includes('điểm') ||
                  titleLower.includes('thi') ||
                  titleLower.includes('lớp');
                const isPayment =
                  titleLower.includes('học phí') ||
                  titleLower.includes('hóa đơn') ||
                  titleLower.includes('thanh toán');
                const isWarning =
                  titleLower.includes('cảnh báo') ||
                  titleLower.includes('nhắc nhở') ||
                  titleLower.includes('hết hạn');

                return (
                  <div
                    key={notif.Id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${!notif.IsRead
                      ? 'bg-gradient-to-r from-emerald-50/80 via-teal-50/30 to-white border-emerald-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5'
                      : 'bg-white border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/60 hover:shadow-xs'
                      }`}
                  >
                    {/* Glowing Left Indicator for Unread */}
                    {!notif.IsRead && (
                      <span className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-emerald-500 to-teal-400 rounded-r-full shadow-sm" />
                    )}

                    <div className="flex items-start gap-3">
                      {/* Category Icon with 3D Gradient Glow */}
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105 ${isAssignment
                          ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-500/25'
                          : isPayment
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25'
                            : isWarning
                              ? 'bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-rose-500/25'
                              : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/25'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {isAssignment
                            ? 'menu_book'
                            : isPayment
                              ? 'receipt_long'
                              : isWarning
                                ? 'warning'
                                : 'campaign'}
                        </span>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <h4
                            className={`text-sm leading-snug line-clamp-1 ${!notif.IsRead
                              ? 'font-bold text-slate-900'
                              : 'font-semibold text-slate-700'
                              }`}
                          >
                            {notif.Title}
                          </h4>
                          {!notif.IsRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-xs animate-pulse" />
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {notif.Content}
                        </p>

                        {/* Metadata & Actions */}
                        <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-100/80 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[13px] text-slate-300">
                              schedule
                            </span>
                            {formatTime(notif.CreatedAt)}
                          </span>

                          {notif.LinkUrl && notif.LinkUrl !== 'null' && (
                            <span className="text-emerald-700 font-bold hover:text-emerald-800 inline-flex items-center gap-0.5 group/btn">
                              <span>Xem ngay</span>
                              <span className="material-symbols-outlined text-[13px] group-hover/btn:translate-x-0.5 transition-transform">
                                arrow_forward
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Delete on Hover */}
                      <button
                        onClick={(e) => handleDeleteNotif(e, notif.Id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-all shrink-0"
                        title="Xóa thông báo"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ================= Glassmorphic Aesthetic Footer ================= */}
          <div className="p-3.5 border-t border-slate-100 bg-white/95 backdrop-blur-md flex items-center justify-between px-5 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Anh Tê Notifications</span>
            </div>

            <button
              onClick={() => {
                onClose();
                navigate('/Notification');
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1 border border-emerald-100"
            >
              <span>Xem toàn bộ lịch sử</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
