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

  const fetchUnreadCountOnly = useCallback(async () => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.get('/Notification/GetUnreadCount');
      if (res.data && typeof res.data.count === 'number') {
        setUnreadCount(res.data.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
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

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      // Poll every 60 seconds
      const interval = setInterval(fetchUnreadCountOnly, 60000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isLoggedIn, fetchNotifications, fetchUnreadCountOnly]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCountOnly,
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
      fetchUnreadCountOnly: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
    };
  }
  return context;
}
