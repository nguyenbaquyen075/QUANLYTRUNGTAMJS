import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationPage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNREAD' | 'READ'
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'ASSIGNMENT' | 'PAYMENT' | 'SYSTEM'
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper to categorize notifications
  const getCategory = (notif) => {
    const text = `${notif.Title || ''} ${notif.Content || ''}`.toLowerCase();
    if (text.includes('bài tập') || text.includes('điểm') || text.includes('thi') || text.includes('lớp') || text.includes('khóa học') || text.includes('buổi học')) {
      return 'ASSIGNMENT';
    }
    if (text.includes('học phí') || text.includes('hóa đơn') || text.includes('thanh toán') || text.includes('tiền') || text.includes('nạp')) {
      return 'PAYMENT';
    }
    return 'SYSTEM';
  };

  // Helper for category styling & icons
  const getCategoryMeta = (notif) => {
    const cat = getCategory(notif);
    switch (cat) {
      case 'ASSIGNMENT':
        return {
          icon: 'menu_book',
          label: 'Học tập & Lớp học',
          bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
          badgeColor: 'bg-indigo-600 text-white',
          cardBorder: 'hover:border-indigo-300',
        };
      case 'PAYMENT':
        return {
          icon: 'receipt_long',
          label: 'Học phí & Hóa đơn',
          bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          badgeColor: 'bg-emerald-600 text-white',
          cardBorder: 'hover:border-emerald-300',
        };
      case 'SYSTEM':
      default:
        return {
          icon: 'campaign',
          label: 'Hệ thống & Sự kiện',
          bgColor: 'bg-amber-50 text-amber-600 border-amber-100',
          badgeColor: 'bg-amber-600 text-white',
          cardBorder: 'hover:border-amber-300',
        };
    }
  };

  // Format date helper
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.IsRead) {
      await markAsRead(notif.Id);
    }
    if (notif.LinkUrl && notif.LinkUrl !== 'null' && notif.LinkUrl.trim() !== '') {
      const url = notif.LinkUrl.trim();
      if (url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        navigate(url);
      }
    }
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Tab filter
      if (activeTab === 'UNREAD' && notif.IsRead) return false;
      if (activeTab === 'READ' && !notif.IsRead) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && getCategory(notif) !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = (notif.Title || '').toLowerCase().includes(query);
        const contentMatch = (notif.Content || '').toLowerCase().includes(query);
        if (!titleMatch && !contentMatch) return false;
      }

      return true;
    });
  }, [notifications, activeTab, selectedCategory, searchQuery]);

  const getDashboardUrl = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/Admin/Dashboard';
    if (user.role === 'TEACHER') return '/Teacher/Dashboard';
    if (user.role === 'PARENT') return '/Parent/Dashboard';
    return '/Student/Dashboard';
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Navigation & Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg shadow-emerald-950/5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">home</span> Trang chủ
              </Link>
              <span>›</span>
              {isLoggedIn && (
                <>
                  <Link to={getDashboardUrl()} className="hover:text-primary transition-colors">
                    Bảng điều khiển
                  </Link>
                  <span>›</span>
                </>
              )}
              <span className="text-slate-800">Thông báo</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <span className="material-symbols-outlined text-[28px]">notifications_active</span>
              </div>
              <div>
                <h1 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
                  Trung Tâm Thông Báo
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-sm">
                      {unreadCount} mới
                    </span>
                  )}
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  Theo dõi tin nhắn cập nhật, nhắc nhở bài tập, kết quả học tập và thông báo hệ thống.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              title="Tải lại danh sách"
            >
              <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
              Làm mới
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('UNREAD')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'UNREAD'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chưa đọc
              {unreadCount > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('READ')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'READ'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã đọc
            </button>
          </div>

          {/* Category Dropdown & Search Input */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 pr-9 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                <option value="ALL">📁 Tất cả thể loại</option>
                <option value="ASSIGNMENT">📚 Học tập & Lớp học</option>
                <option value="PAYMENT">💳 Học phí & Hóa đơn</option>
                <option value="SYSTEM">🔔 Hệ thống & Sự kiện</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>

            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm thông báo..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="bg-white/95 rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-600 font-semibold text-sm">Đang đồng bộ danh sách thông báo...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[42px]">notifications_off</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {searchQuery ? 'Không tìm thấy thông báo phù hợp' : 'Không có thông báo nào'}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {searchQuery
                ? `Không có thông báo nào chứa từ khóa "${searchQuery}". Hãy thử tìm kiếm từ khác.`
                : activeTab === 'UNREAD'
                ? 'Tuyệt vời! Bạn đã đọc hết toàn bộ thông báo.'
                : 'Mọi thông báo, bài tập mới và sự kiện từ trung tâm sẽ xuất hiện tại đây khi có cập nhật.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const meta = getCategoryMeta(notif);
              return (
                <div
                  key={notif.Id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative bg-white/95 backdrop-blur-sm rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 cursor-pointer hover:shadow-md ${
                    meta.cardBorder
                  } ${
                    notif.IsRead
                      ? 'border-slate-200/80 hover:bg-slate-50/80 opacity-90'
                      : 'border-emerald-300 bg-emerald-50/20 shadow-sm'
                  }`}
                >
                  {/* Unread Accent Indicator */}
                  {!notif.IsRead && (
                    <span className="absolute left-0 top-3 bottom-3 w-1.5 bg-emerald-500 rounded-r-full" />
                  )}

                  {/* Notification Icon */}
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${meta.bgColor}`}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {meta.icon}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${meta.bgColor}`}
                      >
                        {meta.label}
                      </span>
                      {!notif.IsRead && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                          Mới
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-medium ml-auto flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {formatTime(notif.CreatedAt)}
                      </span>
                    </div>

                    <h4
                      className={`text-base font-bold mb-1 group-hover:text-emerald-700 transition-colors ${
                        notif.IsRead ? 'text-slate-800' : 'text-slate-900 font-extrabold'
                      }`}
                    >
                      {notif.Title}
                    </h4>

                    <p className="text-sm text-slate-600 leading-relaxed break-words line-clamp-3">
                      {notif.Content}
                    </p>

                    {/* Action Link Footer */}
                    {notif.LinkUrl && notif.LinkUrl !== 'null' && notif.LinkUrl.trim() !== '' && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg transition-colors border border-emerald-200">
                          <span>Xem chi tiết</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Toggle */}
                  <div className="sm:self-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    {!notif.IsRead ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.Id);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Đánh dấu là đã đọc"
                      >
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      </button>
                    ) : (
                      <span className="material-symbols-outlined text-slate-300 text-[20px]" title="Đã đọc">
                        done_all
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
