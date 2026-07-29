import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { data, loading, error } = useFetchData('/Admin/Dashboard');
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');

  const courses = data?.courses || [];
  const classes = data?.classes || [];
  const users = data?.users || [];
  const invoices = data?.invoices || [];
  const chatSessions = data?.chatSessions || [];
  const initial = data?.currentUserFullName ? data.currentUserFullName.charAt(0).toUpperCase() : 'A';

  return (
    <MainLayout hideHeader={true}>
      <style>{`
        .admin-layout {
            display: flex;
            height: 100vh;
            background: #f4fafd;
            overflow: hidden;
            font-family: 'Hanken Grotesk', 'Inter', sans-serif;
        }
        .admin-sidebar {
            width: 270px;
            background: #003d27;
            border-right: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            flex-direction: column;
            padding: 1.5rem 1rem 0.75rem 1rem;
            flex-shrink: 0;
            z-index: 10;
            color: #ffffff;
        }
        .admin-content-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
        }
        .admin-content-header {
            height: 70px;
            background: #ffffff;
            border-bottom: 1px solid rgba(0, 112, 74, 0.12);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 2.5rem;
            flex-shrink: 0;
            z-index: 5;
        }
        .admin-content-body {
            flex: 1;
            padding: 2.5rem;
            overflow-y: auto;
            background: #f4fafd;
        }
        .sidebar-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.85rem 1.1rem;
            color: #b3dfc9;
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
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
            padding-left: 1.30rem;
        }
        .sidebar-item.active {
            background: #00704a;
            color: #ffffff;
            font-weight: 700;
            border-left: 4px solid #4edea3;
            border-radius: 4px 12px 12px 4px;
            box-shadow: 0 4px 14px rgba(0, 112, 74, 0.35);
        }
      `}</style>

      <div className="admin-layout select-none">
        
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="pb-6 border-b border-white/10 mb-6 flex items-center gap-3 px-2 shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img alt="Logo" className="h-10 w-auto" src="/images/logo.png?v=3" />
              <span className="font-black text-sm text-white tracking-wide">Tri Thức Lịch Sử Anh Tê</span>
            </Link>
          </div>

          <div className="sidebar-menu flex-1 overflow-y-auto space-y-1">
            <button
              onClick={() => setActiveTab('courses')}
              className={`sidebar-item ${activeTab === 'courses' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-graduation-cap" /> Quản lý Khóa học
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`sidebar-item ${activeTab === 'classes' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-chalkboard-user" /> Quản lý Lớp học
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-users-gear" /> Quản lý Người dùng
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`sidebar-item ${activeTab === 'invoices' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-file-invoice-dollar" /> Quản lý Hóa đơn
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`sidebar-item ${activeTab === 'leads' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-brain" /> Khách hàng tư vấn AI
            </button>
          </div>

          <button
            onClick={logout}
            className="sidebar-item text-red-400 hover:bg-red-500/10 mt-auto shrink-0"
          >
            <i className="fa-solid fa-right-from-bracket" /> Đăng xuất
          </button>
        </aside>

        {/* Content Area */}
        <div className="admin-content-container">
          
          {/* Header */}
          <header className="admin-content-header select-none">
            <h2 className="font-extrabold text-slate-800 text-lg">
              {activeTab === 'courses' && 'Danh mục khóa học hệ thống'}
              {activeTab === 'classes' && 'Danh sách các lớp học hiện tại'}
              {activeTab === 'users' && 'Quản lý phân quyền tài khoản'}
              {activeTab === 'invoices' && 'Theo dõi hóa đơn học phí học viên'}
              {activeTab === 'leads' && 'Hồ sơ Leads tiềm năng từ Chatbot AI'}
            </h2>

            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-500">
                Quản trị: <strong className="text-[#00704a]">{data?.currentUserFullName}</strong>
              </span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#005537] to-[#00704a] text-white font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-md">
                {data?.currentUserAvatarUrl ? (
                  <img src={data.currentUserAvatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
            </div>
          </header>

          {/* Body */}
          <div className="admin-content-body">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <i className="fa-solid fa-spinner fa-spin text-sky-600 text-3xl" />
              </div>
            ) : (
              <>
                {/* COURSES TAB */}
                {activeTab === 'courses' && (
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                          <th className="p-4">Mã khóa</th>
                          <th className="p-4">Tên khóa học</th>
                          <th className="p-4">Cấp lớp</th>
                          <th className="p-4">Học phí gốc</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {courses.map((c, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-800">{c.CourseCode}</td>
                            <td className="p-4 font-bold text-slate-800">{c.Title || c.CourseName}</td>
                            <td className="p-4">{c.Grade || 'Mọi cấp lớp'}</td>
                            <td className="p-4 font-bold text-primary">{(c.BasePrice || c.Price || 0).toLocaleString()}đ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* CLASSES TAB */}
                {activeTab === 'classes' && (
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                          <th className="p-4">Tên lớp học</th>
                          <th className="p-4">Giáo viên dạy</th>
                          <th className="p-4">Sĩ số</th>
                          <th className="p-4">Ngày bắt đầu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {classes.map((cls, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-800">{cls.ClassName}</td>
                            <td className="p-4 text-slate-800 font-semibold">{cls.Teacher?.FullName || 'Chưa phân công'}</td>
                            <td className="p-4">{cls.MaxStudents} HS</td>
                            <td className="p-4 text-slate-400">{cls.StartDate ? new Date(cls.StartDate).toLocaleDateString('vi-VN') : 'Chưa định'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                          <th className="p-4">Họ và Tên</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Số điện thoại</th>
                          <th className="p-4">Vai trò</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {users.map((u, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-800">{u.FullName}</td>
                            <td className="p-4 text-slate-500">{u.Email}</td>
                            <td className="p-4">{u.Phone}</td>
                            <td className="p-4">
                              <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[9px] border border-sky-100">
                                {u.roleName || u.role || 'MEMBER'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* INVOICES TAB */}
                {activeTab === 'invoices' && (
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                          <th className="p-4">Mã hóa đơn</th>
                          <th className="p-4">Học viên</th>
                          <th className="p-4">Số tiền</th>
                          <th className="p-4">Ngày tạo</th>
                          <th className="p-4">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {invoices.map((inv, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-800">{inv.InvoiceCode}</td>
                            <td className="p-4 font-bold">{inv.Student?.FullName}</td>
                            <td className="p-4 font-bold text-primary">{Number(inv.Amount).toLocaleString()}đ</td>
                            <td className="p-4 text-slate-400">{new Date(inv.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td className="p-4">
                              {inv.Status === 1 ? (
                                <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold">Đã đóng</span>
                              ) : (
                                <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-bold">Chưa nộp</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* LEADS TAB */}
                {activeTab === 'leads' && (
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                          <th className="p-4">Tên khách hàng (Lead)</th>
                          <th className="p-4">SĐT liên hệ</th>
                          <th className="p-4">Tóm tắt nhu cầu học</th>
                          <th className="p-4">Phiên tư vấn cuối</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {chatSessions.map((session, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-800">{session.lead_name || 'Khách vãng lai'}</td>
                            <td className="p-4 font-bold">{session.lead_phone || 'Chưa cung cấp'}</td>
                            <td className="p-4 text-slate-600 max-w-sm line-clamp-2 leading-relaxed">{session.summary || 'Đang trò chuyện cùng AI...'}</td>
                            <td className="p-4 text-slate-400">{new Date(session.createdAt).toLocaleDateString('vi-VN')}</td>
                          </tr>
                        ))}
                        {chatSessions.length === 0 && (
                          <tr>
                            <td colSpan="4" className="p-8 text-center text-slate-400 italic">Chưa có thông tin leads nào được khai thác bởi chatbot AI.</td>
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
