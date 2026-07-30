import React, { useEffect } from 'react';

export default function TeacherDashboard() {
  useEffect(() => {
    window.location.href = '/Teacher/Dashboard';
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      color: '#1e3a8a',
      background: 'linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #e0f2fe 100%)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Đang chuyển sang Trang Giảng Viên...</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
}
