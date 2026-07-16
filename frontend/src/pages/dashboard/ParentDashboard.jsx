import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';

export default function ParentDashboard() {
  const { data, loading, error } = useFetchData('/Parent/Dashboard');
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('children');

  const children = data?.children || [];
  const invoices = data?.invoices || [];
  const initial = data?.currentUserFullName ? data.currentUserFullName.charAt(0).toUpperCase() : 'P';

  return (
    <MainLayout hideHeader={true}>
      <style>{`
        .parent-layout {
            display: flex;
            height: 100vh;
            background: #ffffff;
            overflow: hidden;
        }
        .parent-sidebar {
            width: 270px;
            background: linear-gradient(135deg, #fef3c7 0%, #ffffff 50%, #fffbeb 100%);
            border-right: 1px solid rgba(245, 158, 11, 0.1);
            display: flex;
            flex-direction: column;
            padding: 1.5rem 1rem 0.75rem 1rem;
            flex-shrink: 0;
            z-index: 10;
        }
        .parent-content-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
        }
        .parent-content-header {
            height: 70px;
            background: linear-gradient(135deg, #fef3c7 0%, #ffffff 50%, #fffbeb 100%);
            border-bottom: 1px solid rgba(245, 158, 11, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 2.5rem;
            flex-shrink: 0;
            z-index: 5;
        }
        .parent-content-body {
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
            background: rgba(245, 158, 11, 0.04);
            color: #b45309;
            padding-left: 1.30rem;
        }
        .sidebar-item.active {
            background: rgba(245, 158, 11, 0.08);
            color: #b45309;
            font-weight: 700;
            border-left: 4px solid #f59e0b;
            border-radius: 4px 12px 12px 4px;
        }
      `}</style>

      <div className="parent-layout select-none">
        
        {/* Sidebar */}
        <aside className="parent-sidebar">
          <div className="pb-6 border-b border-slate-200/60 mb-6 flex items-center gap-3 px-2 shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img alt="Logo" className="h-10 w-auto" src="/images/logo.png?v=3" />
              <span className="font-black text-sm text-slate-800 tracking-wide">TrungTâmOnline</span>
            </Link>
          </div>

          <div className="sidebar-menu flex-1 overflow-y-auto space-y-1">
            <button
              onClick={() => setActiveTab('children')}
              className={`sidebar-item ${activeTab === 'children' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-users" /> Con học viên
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`sidebar-item ${activeTab === 'billing' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-file-invoice-dollar" /> Đóng học phí
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
        <div className="parent-content-container">
          
          {/* Header */}
          <header className="parent-content-header select-none">
            <h2 className="font-extrabold text-slate-800 text-lg">
              {activeTab === 'children' && 'Quản lý học tập của con'}
              {activeTab === 'billing' && 'Thông tin học phí cần nộp'}
            </h2>

            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-500">
                Phụ huynh: <strong>{data?.currentUserFullName}</strong>
              </span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 text-white font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-md">
                {data?.currentUserAvatarUrl ? (
                  <img src={data.currentUserAvatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
            </div>
          </header>

          {/* Body */}
          <div className="parent-content-body">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <i className="fa-solid fa-spinner fa-spin text-amber-500 text-3xl" />
              </div>
            ) : (
              <>
                {/* CHILDREN TAB */}
                {activeTab === 'children' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {children.map((child, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-xl font-bold">
                            {child.FullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-base">{child.FullName}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{child.Email}</p>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-500">SĐT: {child.Phone || 'Chưa cập nhật'}</span>
                          <span className="text-primary font-bold">Role: Học viên</span>
                        </div>
                      </div>
                    ))}
                    {children.length === 0 && (
                      <div className="col-span-full text-center py-20 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 italic text-xs">
                        Tài khoản phụ huynh này chưa liên kết với tài khoản con học viên nào.
                      </div>
                    )}
                  </div>
                )}

                {/* BILLING TAB */}
                {activeTab === 'billing' && (
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                          <th className="p-4">Mã hóa đơn</th>
                          <th className="p-4">Học viên (Con)</th>
                          <th className="p-4">Lớp học</th>
                          <th className="p-4">Số tiền</th>
                          <th className="p-4">Trạng thái</th>
                          <th className="p-4 text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {invoices.map((inv, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-800">{inv.InvoiceCode}</td>
                            <td className="p-4">{inv.Student?.FullName}</td>
                            <td className="p-4">{inv.Class?.ClassName}</td>
                            <td className="p-4 font-bold text-primary">{Number(inv.Amount).toLocaleString()}đ</td>
                            <td className="p-4">
                              {inv.Status === 1 ? (
                                <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold">Đã thanh toán</span>
                              ) : (
                                <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-bold">Chưa thanh toán</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {inv.Status === 0 ? (
                                <Link
                                  to={`/Parent/PayInvoice/${inv.Id}`}
                                  className="bg-primary text-white font-bold px-3 py-1.5 rounded-lg text-[10px] hover:bg-primary-hover shadow-sm inline-block"
                                >
                                  Thanh toán ngay
                                </Link>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Đã hoàn tất</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {invoices.length === 0 && (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-slate-400 italic">Hiện không có hóa đơn học phí nào cần đóng.</td>
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
