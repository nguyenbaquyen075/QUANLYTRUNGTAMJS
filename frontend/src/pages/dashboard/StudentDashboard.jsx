import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { data, loading, error } = useFetchData('/Student/Dashboard');
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const classes = data?.classes || [];
  const lessons = data?.lessons || [];
  const assignments = data?.assignments || [];
  const submissions = data?.submissions || [];
  const invoices = data?.invoices || [];
  const aiProfile = data?.aiProfile || null;
  const recommendedCourses = data?.recommendedCourses || [];

  const attendedCount = data?.attendances?.filter(a => a.Status === 1 || a.Status === 2).length || 0;
  const totalLessons = lessons.length;
  const attendanceRate = totalLessons > 0 ? ((attendedCount / totalLessons) * 100).toFixed(1) : '100.0';

  const gradedSubmissions = submissions.filter(s => s.Grade !== null);
  const gpa = gradedSubmissions.length > 0
    ? (gradedSubmissions.reduce((sum, s) => sum + parseFloat(s.Grade), 0) / gradedSubmissions.length).toFixed(1)
    : '0.0';

  const getSubmissionForAssignment = (assignId) => {
    return submissions.find(s => s.AssignmentId === assignId);
  };

  const initial = data?.currentUserFullName ? data.currentUserFullName.charAt(0).toUpperCase() : 'S';

  return (
    <MainLayout hideHeader={true}>
      <style>{`
        .student-layout {
            display: flex;
            height: 100vh;
            background: #ffffff;
            overflow: hidden;
        }
        .student-sidebar {
            width: 270px;
            background: linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #e0f2fe 100%);
            border-right: 1px solid rgba(30, 58, 138, 0.08);
            display: flex;
            flex-direction: column;
            padding: 1.5rem 1rem 0.75rem 1rem;
            flex-shrink: 0;
            z-index: 10;
        }
        .student-content-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
        }
        .student-content-header {
            height: 70px;
            background: linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #e0f2fe 100%);
            border-bottom: 1px solid rgba(30, 58, 138, 0.08);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 2.5rem;
            flex-shrink: 0;
            z-index: 5;
        }
        .student-content-body {
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
            background: rgba(30, 58, 138, 0.04);
            color: #1e3a8a;
            padding-left: 1.30rem;
        }
        .sidebar-item.active {
            background: rgba(30, 58, 138, 0.06);
            color: #1e3a8a;
            font-weight: 700;
            border-left: 4px solid #1e3a8a;
            border-radius: 4px 12px 12px 4px;
        }
      `}</style>

      <div className="student-layout select-none">
        
        {/* Sidebar */}
        <aside className="student-sidebar">
          <div className="pb-6 border-b border-slate-200/60 mb-6 flex items-center gap-3 px-2 shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img alt="Logo" className="h-10 w-auto" src="/images/logo.png?v=3" />
              <span className="font-black text-sm text-slate-800 tracking-wide">TrungTâmOnline</span>
            </Link>
          </div>

          <div className="sidebar-menu flex-1 overflow-y-auto space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-chart-line" /> Bảng điều khiển
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`sidebar-item ${activeTab === 'classes' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-graduation-cap" /> Lớp học của tôi
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`sidebar-item ${activeTab === 'assignments' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-file-signature" /> Bài tập & Kiểm tra
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`sidebar-item ${activeTab === 'billing' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-credit-card" /> Học phí & Hóa đơn
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`sidebar-item ${activeTab === 'ai' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-brain" /> Đề xuất từ AI
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
        <div className="student-content-container">
          
          {/* Header */}
          <header className="student-content-header select-none">
            <h2 className="font-extrabold text-slate-800 text-lg">
              {activeTab === 'overview' && 'Chào mừng quay trở lại!'}
              {activeTab === 'classes' && 'Các lớp học của bạn'}
              {activeTab === 'assignments' && 'Bài tập về nhà & Quizzes'}
              {activeTab === 'billing' && 'Học phí & Lịch sử thanh toán'}
              {activeTab === 'ai' && 'Đề xuất lộ trình học tập cá nhân từ AI'}
            </h2>

            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-500">
                Học viên: <strong>{data?.currentUserFullName}</strong>
              </span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-md">
                {data?.currentUserAvatarUrl ? (
                  <img src={data.currentUserAvatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
            </div>
          </header>

          {/* Body */}
          <div className="student-content-body">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
              </div>
            ) : (
              <>
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl">
                          <i className="fa-solid fa-book" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Số lớp học</span>
                          <strong className="text-lg text-slate-800">{classes.length} lớp</strong>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 text-xl">
                          <i className="fa-solid fa-star" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Điểm trung bình (GPA)</span>
                          <strong className="text-lg text-slate-800">{gpa} / 10</strong>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 text-xl">
                          <i className="fa-solid fa-calendar-check" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Tỉ lệ điểm danh</span>
                          <strong className="text-lg text-slate-800">{attendanceRate}%</strong>
                        </div>
                      </div>
                    </div>

                    {/* Class List Summary */}
                    <div className="space-y-4">
                      <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Lớp Học Đang Tham Gia</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        {classes.map((cls, idx) => (
                          <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                            <h4 className="font-extrabold text-slate-800 text-base">{cls.ClassName}</h4>
                            <p className="text-xs text-slate-500 font-semibold">Khóa: {cls.Course?.Title}</p>
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full font-bold uppercase">Active</span>
                              <Link to={`/Student/Classroom/${cls.Id}`} className="text-xs font-bold text-primary hover:underline">Vào phòng học &rarr;</Link>
                            </div>
                          </div>
                        ))}
                        {classes.length === 0 && (
                          <div className="col-span-2 text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 italic text-xs">
                            Bạn chưa đăng ký tham gia lớp học nào.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* CLASSES TAB */}
                {activeTab === 'classes' && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((cls, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="space-y-3">
                          <h4 className="font-extrabold text-slate-800 text-base line-clamp-1">{cls.ClassName}</h4>
                          <span className="text-[10px] text-primary uppercase font-bold block">Khóa: {cls.Course?.Title}</span>
                          <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-3">
                            {cls.Course?.Description || 'Lớp học trực tuyến chất lượng cao.'}
                          </p>
                        </div>
                        <div className="pt-6 border-t border-slate-100 mt-6 flex justify-between items-center">
                          <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">STUDENT</span>
                          <Link
                            to={`/Student/Classroom/${cls.Id}`}
                            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                          >
                            Vào học
                          </Link>
                        </div>
                      </div>
                    ))}
                    {classes.length === 0 && (
                      <div className="col-span-full text-center py-20 text-slate-400 italic text-xs">
                        Bạn chưa tham gia lớp học nào.
                      </div>
                    )}
                  </div>
                )}

                {/* ASSIGNMENTS TAB */}
                {activeTab === 'assignments' && (
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                          <th className="p-4">Tiêu đề bài tập</th>
                          <th className="p-4">Lớp học</th>
                          <th className="p-4">Hạn nộp</th>
                          <th className="p-4">Trạng thái</th>
                          <th className="p-4 text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold">
                        {assignments.map((item, idx) => {
                          const sub = getSubmissionForAssignment(item.Id);
                          const isDone = !!sub;
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-4 font-bold text-slate-800">{item.Title}</td>
                              <td className="p-4 text-slate-500">{item.Lesson?.Class?.ClassName}</td>
                              <td className="p-4 text-slate-400">{item.DueDate ? new Date(item.DueDate).toLocaleDateString('vi-VN') : 'Không hạn'}</td>
                              <td className="p-4">
                                {isDone ? (
                                  <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                    Đã nộp {sub.Grade !== null ? `(${sub.Grade}đ)` : ''}
                                  </span>
                                ) : (
                                  <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-bold">Chưa nộp</span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                {!isDone ? (
                                  <Link
                                    to={`/Student/DoAssignment/${item.Id}`}
                                    className="bg-primary text-white font-bold px-3 py-1.5 rounded-lg text-[10px] hover:bg-primary-hover shadow-sm"
                                  >
                                    Làm bài
                                  </Link>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">Đã hoàn thành</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {assignments.length === 0 && (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-slate-400 italic">Hiện không có bài tập hay kiểm tra nào được giao.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* BILLING TAB */}
                {activeTab === 'billing' && (
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                          <th className="p-4">Mã hóa đơn</th>
                          <th className="p-4">Lớp học</th>
                          <th className="p-4">Số tiền</th>
                          <th className="p-4">Hạn đóng</th>
                          <th className="p-4">Trạng thái</th>
                          <th className="p-4 text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {invoices.map((inv, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-800">{inv.InvoiceCode}</td>
                            <td className="p-4">{inv.Class?.ClassName}</td>
                            <td className="p-4 font-bold text-primary">{Number(inv.Amount).toLocaleString()}đ</td>
                            <td className="p-4 text-slate-400">{new Date(inv.DueDate).toLocaleDateString('vi-VN')}</td>
                            <td className="p-4">
                              {inv.Status === 1 ? (
                                <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold">Đã đóng</span>
                              ) : (
                                <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-bold">Chưa thanh toán</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {inv.Status === 0 ? (
                                <Link
                                  to={`/Auth/GatewayPayment?invoiceId=${inv.Id}`}
                                  className="bg-primary text-white font-bold px-3 py-1.5 rounded-lg text-[10px] hover:bg-primary-hover shadow-sm"
                                >
                                  Thanh toán
                                </Link>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Hoàn thành</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {invoices.length === 0 && (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-slate-400 italic">Bạn không có hóa đơn học phí nào.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* AI RECOMMENDATIONS TAB */}
                {activeTab === 'ai' && (
                  <div className="space-y-8 animate-fade-in">
                    {/* Learning profile summary */}
                    <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 p-6 rounded-2xl border border-primary/10">
                      <h4 className="font-extrabold text-sm text-primary uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <i className="fa-solid fa-brain" /> Phân tích học lực từ AI
                      </h4>
                      {aiProfile ? (
                        <div className="space-y-4">
                          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                            Dựa trên điểm số bài tập và kiểm tra của bạn, hệ thống AI đã phân tích được các mảng kiến thức sau:
                          </p>
                          <div className="flex flex-wrap gap-2.5">
                            {aiProfile.weak_areas?.map((area, i) => (
                              <span key={i} className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-[11px] font-bold">
                                ⚠️ Cần bổ trợ: {area}
                              </span>
                            ))}
                            {(!aiProfile.weak_areas || aiProfile.weak_areas.length === 0) && (
                              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-[11px] font-bold">
                                🎉 Học lực tốt, không phát hiện lỗ hổng kiến thức nghiêm trọng!
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 font-semibold italic">
                          Chưa có đủ dữ liệu bài tập để AI tiến hành phân tích học lực. Hãy hoàn thành các bài tập được giao để AI gợi ý tốt nhất nhé!
                        </p>
                      )}
                    </div>

                    {/* Recommended courses list */}
                    <div className="space-y-4">
                      <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Khóa học gợi ý riêng cho bạn</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendedCourses.map((c, idx) => (
                          <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                            <div>
                              <h5 className="font-bold text-slate-800 text-sm mb-1">{c.Title || c.CourseName}</h5>
                              <span className="text-[10px] text-primary uppercase font-bold block mb-3">Mã: {c.CourseCode}</span>
                              <p className="text-slate-500 text-xs font-semibold leading-relaxed line-clamp-3">
                                {c.Description}
                              </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 mt-6 flex justify-between items-center">
                              <span className="text-primary font-black text-xs">{(c.Price || c.BasePrice || 0).toLocaleString()}đ</span>
                              <Link
                                to={`/Auth/Checkout?courseId=${c.Id}`}
                                className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-primary-hover shadow-sm"
                              >
                                Đăng ký học
                              </Link>
                            </div>
                          </div>
                        ))}
                        {recommendedCourses.length === 0 && (
                          <div className="col-span-full text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 italic text-xs">
                            Hiện tại chưa có khóa học gợi ý mới nào phù hợp.
                          </div>
                        )}
                      </div>
                    </div>
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
