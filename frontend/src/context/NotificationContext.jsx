import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isLoggedIn, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/Notification/List');
      if (res.data && res.data.success && Array.isArray(res.data.notifications)) {
        const notifs = res.data.notifications;
        setNotifications(notifs);
        const unread = notifs.filter(n => !n.IsRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => (n.Id === id ? { ...n, IsRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      await api.post('/Notification/MarkAsRead', { id });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Revert if needed
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, IsRead: true })));
      setUnreadCount(0);

      await api.post('/Notification/MarkAllAsRead', {});
    } catch (err) {
      console.error('Error marking all as read:', err);
      fetchNotifications();
    }
  };

  // Backend đã có sẵn hub realtime ở /notificationHub nhưng trước đây không client
  // React nào nối vào, nên phải poll 60s. Nối thẳng vào hub thì bỏ được poll:
  // thông báo tới ngay lập tức và không còn request định kỳ nào.
  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    let ws;
    let reconnectTimer;
    let disposed = false;

    const connect = () => {
      const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${scheme}//${window.location.host}/notificationHub`);

      ws.onopen = () => ws.send('{"protocol":"json","version":1}\u001e');

      ws.onmessage = (event) => {
        // SignalR ngăn cách các frame bằng ký tự 0x1e, một message có thể chứa nhiều frame
        for (const frame of String(event.data).split('\u001e')) {
          if (!frame) continue;
          let payload;
          try {
            payload = JSON.parse(frame);
          } catch (err) {
            continue;
          }
          // Tải lại danh sách thay vì ghép payload của hub: hub trả field thường
          // (title/content) còn API trả field hoa (Title/Content), tải lại là khỏi lệch.
          if (payload.target === 'ReceiveNotification') fetchNotifications();
        }
      };

      ws.onerror = () => ws.close();

      ws.onclose = () => {
        if (!disposed) reconnectTimer = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [isLoggedIn, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      fetchNotifications: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
    };
  }
  return context;
}
