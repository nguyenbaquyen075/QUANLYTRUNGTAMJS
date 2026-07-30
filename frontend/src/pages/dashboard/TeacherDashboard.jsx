import React, { useEffect } from 'react';

export default function TeacherDashboard() {
  useEffect(() => {
    window.location.replace('/Teacher/Dashboard');
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-700 font-sans">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="font-extrabold text-slate-800 text-base mb-1">Đang tải Bảng Tin Giảng Viên...</h3>
        <p className="text-xs text-slate-400">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
}
