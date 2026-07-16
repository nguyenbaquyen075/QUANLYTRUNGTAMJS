import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { data, loading, error } = useFetchData('/Teacher/Dashboard');
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('classes');

  const classes = data?.classes || [];
  const lessons = data?.lessons || [];
  const initial = data?.currentUserFullName ? data.currentUserFullName.charAt(0).toUpperCase() : 'T';

  return (
    <MainLayout hideHeader={true}>
      <style>{`
        .teacher-layout {
            display: flex;
            height: 100vh;
            background: #ffffff;
            overflow: hidden;
        }
        .teacher-sidebar {
            width: 270px;
            background: linear-gradient(135deg, #dcfce7 0%, #ffffff 50%, #f0fdf4 100%);
            border-right: 1px solid rgba(16, 185, 129, 0.1);
            display: flex;
            flex-direction: column;
            padding: 1.5rem 1rem 0.75rem 1rem;
            flex-shrink: 0;
            z-index: 10;
        }
        .teacher-content-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
        }
        .teacher-content-header {
            height: 70px;
            background: linear-gradient(135deg, #dcfce7 0%, #ffffff 50%, #f0fdf4 100%);
            border-bottom: 1px solid rgba(16, 185, 129, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 2.5rem;
            flex-shrink: 0;
            z-index: 5;
        }
        .teacher-content-body {
            flex: 1;
            padding: 2.5rem;
            overflow-y: auto;
            background: #ffffff;
        }
        .sidebar-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.85rem 1.1rem;
            color: #475569;
            font-weight: 600;
            font-size: 0.92rem;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            border: none;
            background: none;
            width: 100%;
            text-align: left;
        }
        .sidebar-item:hover {
            background: rgba(16, 185, 129, 0.04);
            color: #047857;
            padding-left: 1.30rem;
        }
        .sidebar-item.active {
            background: rgba(16, 185, 129, 0.08);
            color: #047857;
            font-weight: 700;
            border-left: 4px solid #10b981;
            border-radius: 4px 12px 12px 4px;
        }
      `}</style>

      <div className="teacher-layout select-none">

        {/* Sidebar */}
        <aside className="teacher-sidebar">
          <div className="pb-6 border-b border-slate-200/60 mb-6 flex items-center gap-3 px-2 shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img alt="Logo" className="h-10 w-auto" src="/images/logo.png?v=3" />
              <span className="font-black text-sm text-slate-800 tracking-wide">TrungTâmOnline</span>
            </Link>
          </div>

          <div className="sidebar-menu flex-1 overflow-y-auto space-y-1">
            <button
              onClick={() => setActiveTab('classes')}
              className={`sidebar-item ${activeTab === 'classes' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-chalkboard-user" /> Lớp dạy của tôi
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`sidebar-item ${activeTab === 'schedule' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-calendar-days" /> Lịch dạy học
            </button>
          </div>

          <button
            onClick={logout}
            className="sidebar-item text-red-600 hover:bg-red-50 mt-auto shrink-0"
          >
            <i className="fa-solid fa-right-from-bracket" /> Đăng xuất
          </button>
        </aside>

        {/* Content Area */}
        <div className="teacher-content-container">

          {/* Header */}
          <header className="teacher-content-header select-none">
            <h2 className="font-extrabold text-slate-800 text-lg">
              {activeTab === 'classes' && 'Các lớp học giảng dạy'}
              {activeTab === 'schedule' && 'Lịch trình bài giảng'}
            </h2>

            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-500">
                Giáo viên: <strong>{data?.currentUserFullName}</strong>
              </span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-md">
                {data?.currentUserAvatarUrl ? (
                  <img src={data.currentUserAvatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
            </div>
          </header>

          {/* Body */}
          <div className="teacher-content-body">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <i className="fa-solid fa-spinner fa-spin text-emerald-600 text-3xl" />
              </div>
            ) : (
              <>
                {/* CLASSES TAB */}
                {activeTab === 'classes' && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((cls, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                        <div className="space-y-3">
                          <h4 className="font-extrabold text-slate-800 text-base line-clamp-1">{cls.ClassName}</h4>
                          <span className="text-[10px] text-emerald-600 uppercase font-bold block">Khóa: {cls.Course?.Title}</span>
                          <div className="text-xs text-slate-500 font-semibold space-y-1">
                            <div>👥 Sĩ số tối đa: {cls.MaxStudents} học sinh</div>
                            <div>📅 Ngày bắt đầu: {cls.StartDate ? new Date(cls.StartDate).toLocaleDateString('vi-VN') : 'Chưa định'}</div>
                          </div>
                        </div>
                        <div className="pt-6 border-t border-slate-100 mt-6 flex gap-2">
                          <Link
                            to={`/Teacher/Attendance/${cls.Id}`}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-all text-center flex-1"
                          >
                            Điểm danh
                          </Link>
                          <Link
                            to={`/Teacher/ClassReport/${cls.Id}`}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-2 rounded-lg transition-all text-center flex-1"
                          >
                            Báo cáo lớp
                          </Link>
                        </div>
                      </div>
                    ))}
                    {classes.length === 0 && (
                      <div className="col-span-full text-center py-20 text-slate-400 italic text-xs">
                        Bạn chưa có lớp học giảng dạy nào được giao.
                      </div>
                    )}
                  </div>
                )}

                {/* SCHEDULE TAB */}
                {activeTab === 'schedule' && (
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                          <th className="p-4">Tên bài giảng</th>
                          <th className="p-4">Lớp dạy</th>
                          <th className="p-4">Thời gian học</th>
                          <th className="p-4">Phòng học online</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {lessons.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-800">{item.Title}</td>
                            <td className="p-4">{item.Class?.ClassName}</td>
                            <td className="p-4">
                              📅 {item.LessonDate ? new Date(item.LessonDate).toLocaleDateString('vi-VN') : ''} <br />
                              ⏰ {item.StartTime} - {item.EndTime}
                            </td>
                            <td className="p-4">
                              {item.MeetingUrl ? (
                                <a
                                  href={item.MeetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:underline flex items-center gap-1 font-bold"
                                >
                                  <i className="fa-solid fa-video" /> Vào Zoom/Meet
                                </a>
                              ) : (
                                <span className="text-slate-400">Không có meeting</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {lessons.length === 0 && (
                          <tr>
                            <td colSpan="4" className="p-8 text-center text-slate-400 italic">Hiện không có lịch dạy học nào được tạo.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
