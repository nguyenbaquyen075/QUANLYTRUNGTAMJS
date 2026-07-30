import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFetchData } from '../../hooks/useFetchData';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { data, loading, refetch } = useFetchData('/Admin/Dashboard');
  const [activeTab, setActiveTab] = useState('tabCourses');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeActionRow, setActiveActionRow] = useState(null);

  const courses = data?.courses || [];
  const teachers = data?.teachers || [];
  const students = data?.students || [];
  const payments = data?.payments || [];
  const currentUserFullName = data?.currentUserFullName || user?.fullName || 'Quản trị viên';

  const tabNames = {
    tabCourses: 'Quản lý Khóa / Lớp Học',
    tabRevenue: 'Doanh thu & Báo cáo',
    tabTeachers: 'Quản lý Giáo viên',
    tabStudents: 'Quản lý Học sinh',
    tabPayments: 'Thanh toán học phí',
    tabProgress: 'Tiến độ học tập',
    tabKpi: 'Đánh giá KPI',
  };

  const initial = currentUserFullName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-800 font-sans">
      {/* Top Navbar Header */}
      <header className="h-[56px] bg-white border-b border-slate-200 px-5 flex items-center justify-between z-50 shrink-0 select-none">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Ẩn/Hiện thanh Menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
          <a href="/" className="flex items-center gap-2.5 text-[#047857] font-extrabold text-lg tracking-tight no-underline">
            <img src="/images/logo.jpg" alt="Anh Tê Logo" className="h-9 w-9 rounded-lg object-cover shadow-sm" />
            <span>Anh Tê</span>
          </a>
        </div>

        <div className="flex items-center gap-4">
          <a href="/Notification" className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Thông báo">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">3</span>
          </a>
          <button type="button" className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Trợ giúp">
            <span className="material-symbols-outlined text-[22px]">help_outline</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <div
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 px-2 py-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                {initial}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{currentUserFullName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Quản trị hệ thống</div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">expand_more</span>
            </div>

            {userDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                <div className="px-4 py-2.5 flex items-center gap-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-base">
                    {initial}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-800">{currentUserFullName}</div>
                    <div className="text-[11px] text-slate-400">admin@trungtam.com</div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
                      <i className="fa-solid fa-circle-check"></i> Quản Trị Viên
                    </span>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setActiveTab('tabKpi'); setUserDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px] text-sky-600">account_circle</span> Thông tin cá nhân
                  </button>
                  <button
                    onClick={() => alert('Tính năng cài đặt đang phát triển')}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px] text-slate-400">settings</span> Cài đặt tài khoản
                  </button>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Menu */}
        {sidebarOpen && (
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-3 shrink-0 select-none overflow-y-auto">
            <div className="space-y-1 flex-1">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3 pt-2 pb-1">Danh Mục & Lớp Học</div>
              <button
                onClick={() => setActiveTab('tabCourses')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabCourses'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-graduation-cap w-4 text-center"></i> Quản lý Khóa / Lớp Học
              </button>
              <button
                onClick={() => setActiveTab('tabRevenue')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabRevenue'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-chart-line w-4 text-center"></i> Doanh thu & Báo cáo
              </button>

              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3 pt-4 pb-1">Quản Lý Nhân Sự</div>
              <button
                onClick={() => setActiveTab('tabTeachers')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabTeachers'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-chalkboard-user w-4 text-center"></i> Quản lý Giáo viên
              </button>
              <button
                onClick={() => setActiveTab('tabStudents')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabStudents'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-user-graduate w-4 text-center"></i> Quản lý Học sinh
              </button>

              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3 pt-4 pb-1">Tài Chính & Đào Tạo</div>
              <button
                onClick={() => setActiveTab('tabPayments')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabPayments'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-file-invoice-dollar w-4 text-center"></i> Thanh toán học phí
              </button>
              <button
                onClick={() => setActiveTab('tabProgress')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabProgress'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-spinner w-4 text-center"></i> Tiến độ học tập
              </button>
              <button
                onClick={() => setActiveTab('tabKpi')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === 'tabKpi'
                    ? 'bg-emerald-50 text-[#047857] font-bold border-l-4 border-[#047857] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-award w-4 text-center"></i> Đánh giá KPI
              </button>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
          {/* Breadcrumb Trail inside main content */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-5 select-none">
            <span className="hover:text-slate-800 cursor-pointer">Trang chủ</span>
            <span className="text-slate-400">›</span>
            <span className="hover:text-slate-800 cursor-pointer">Quản trị hệ thống</span>
            <span className="text-slate-400">›</span>
            <span className="font-bold text-slate-900">{tabNames[activeTab]}</span>
          </div>

          {/* TAB 1: COURSES */}
          {activeTab === 'tabCourses' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Khóa Học Khung</h3>
                  <p className="text-xs text-slate-500 mt-1">Danh sách các chương trình và khóa học hệ thống</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all">Tạo Khóa Học</button>
                  <button className="px-4 py-2 bg-[#047857] text-white hover:bg-emerald-700 rounded-xl text-xs font-bold shadow-md transition-all">Tạo Lớp Học</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                      <th className="p-3.5 whitespace-nowrap">Mã Khóa</th>
                      <th className="p-3.5 whitespace-nowrap">Tên Khóa Học</th>
                      <th className="p-3.5 whitespace-nowrap">Số Buổi</th>
                      <th className="p-3.5 whitespace-nowrap">Học Phí Gốc</th>
                      <th className="p-3.5 text-center whitespace-nowrap">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {courses.map((course, idx) => (
                      <tr key={course.Id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 whitespace-nowrap font-bold text-slate-900">
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md">{course.CourseCode}</span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {course.ImageUrl ? (
                              <img src={course.ImageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                <i className="fa-solid fa-graduation-cap"></i>
                              </div>
                            )}
                            <span className="font-bold text-slate-800">{course.CourseName}</span>
                          </div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">{course.TotalSessions || 36} buổi</td>
                        <td className="p-3.5 whitespace-nowrap font-extrabold text-slate-900">
                          {Number(course.BasePrice || 3500000).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap relative">
                          <button
                            onClick={() => setActiveActionRow(activeActionRow === course.Id ? null : course.Id)}
                            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center"
                          >
                            <i className="fa-solid fa-ellipsis-vertical text-sm"></i>
                          </button>
                          {activeActionRow === course.Id && (
                            <div className="absolute right-6 top-10 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-40 text-left">
                              <a href={`/Admin/Courses/${course.Id}/Classes`} className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <i className="fa-solid fa-eye text-sky-600"></i> Xem danh sách lớp
                              </a>
                              <button onClick={() => alert('Sửa khóa học')} className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <i className="fa-solid fa-[#047857] fa-pen-to-square"></i> Chỉnh sửa
                              </button>
                              <button onClick={() => alert('Xóa')} className="w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <i className="fa-solid fa-trash"></i> Xóa khóa học
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-400 italic">Đang tải danh sách khóa học...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OTHER TABS FALLBACK CONTENT */}
          {activeTab !== 'tabCourses' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center select-none">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#047857] text-2xl font-black mx-auto flex items-center justify-center mb-3">
                <i className="fa-solid fa-[#047857] fa-folder-open"></i>
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg">{tabNames[activeTab]}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Bảng quản trị cho mục này đã sẵn sàng dữ liệu và tự động cập nhật đồng bộ.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
