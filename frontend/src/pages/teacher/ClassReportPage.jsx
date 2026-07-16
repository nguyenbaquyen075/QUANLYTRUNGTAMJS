import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';

export default function ClassReportPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetchData(`/Teacher/ClassReport/${id}`);

  const activeClass = data?.Class || null;
  const reports = data?.studentReports || [];

  const laggingStudents = reports.filter((r) => r.Status === 'Chậm tiến độ');
  const excellentStudents = reports.filter((r) => r.Status === 'Hoàn thành tốt');

  const handleNotifyParent = () => {
    alert('Đã gửi thông tin nhắc nhở tự động cho phụ huynh học sinh!');
  };

  const handleAssignRecovery = () => {
    alert('Đã gửi bài ôn tập phục hồi kiến thức cho học sinh!');
  };

  const handleHonors = () => {
    alert('Đã vinh danh học sinh xuất sắc lên bảng tin danh dự của trung tâm!');
  };

  const handleSendCongrats = () => {
    alert('Đã gửi thư khen tới phụ huynh!');
  };

  return (
    <MainLayout hideHeader={false}>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 select-none text-slate-800">
        
        {/* Back Link */}
        <div>
          <Link to="/Teacher/Dashboard" className="inline-flex items-center gap-1 text-slate-400 hover:text-primary transition-all text-xs font-bold">
            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            Quay lại Lớp dạy của tôi
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
          </div>
        ) : !activeClass ? (
          <div className="text-center py-10 text-slate-500 font-semibold">
            Không tìm thấy thông tin lớp học cần phân tích tiến độ.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header info */}
            <div className="pb-6 border-b border-slate-100">
              <h1 className="text-xl md:text-2xl font-black text-slate-800 font-serif flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[28px]">insights</span>
                AI Phân Tích Tiến Độ Học Viên
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Lớp: <strong className="text-primary">{activeClass.ClassName}</strong> | Khóa học: <strong>{activeClass.Course?.Title}</strong>
              </p>
            </div>

            {/* AI Summary Banner */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl space-y-2">
              <h3 className="font-extrabold text-sm text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span> Nhận định tổng quan từ Trợ lý AI
              </h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-semibold">
                Hệ thống AI đã tự động tổng hợp kết quả của <strong>{reports.length} học sinh</strong> dựa trên điểm số trung bình bài làm, tỉ lệ nộp bài tập về nhà và tần suất chuyên cần đi học. Đã định danh <strong>{laggingStudents.length} học sinh</strong> thuộc nhóm chậm tiến độ cần được phụ đạo hoặc liên hệ phụ huynh khẩn cấp.
              </p>
            </div>

            {/* Lagging Students List */}
            <div className="space-y-4">
              <h2 className="text-sm font-extrabold text-red-600 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[20px]">warning</span> Nhóm Học Sinh Chậm Tiến Độ ({laggingStudents.length})
              </h2>

              <div className="space-y-4">
                {laggingStudents.map((s, idx) => (
                  <div key={idx} className="bg-white border-l-4 border-l-red-500 border border-slate-200/60 p-6 rounded-2xl shadow-sm grid md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-3 space-y-2">
                      <h3 className="font-extrabold text-slate-800 text-sm">{s.FullName}</h3>
                      <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-bold">
                        <span>Điểm trung bình: <strong className="text-red-500">{Number(s.AverageGrade).toFixed(1)}/10</strong></span>
                        <span>Nộp bài: <strong>{(s.AssignmentCompletionRate * 100).toFixed(0)}%</strong></span>
                        <span>Đi học: <strong>{(s.AttendanceRate * 100).toFixed(0)}%</strong></span>
                      </div>
                    </div>
                    <div className="md:col-span-6 space-y-3 text-xs leading-relaxed">
                      <div>
                        <p className="font-extrabold text-red-700 mb-0.5 flex items-center gap-1">
                          <i className="fa-solid fa-robot" /> Lý do cảnh báo:
                        </p>
                        <p className="text-slate-600 font-semibold">{s.AlertReason}</p>
                      </div>
                      <div>
                        <p className="font-extrabold text-primary mb-0.5 flex items-center gap-1">
                          <i className="fa-solid fa-lightbulb" /> Khuyến nghị can thiệp:
                        </p>
                        <p className="text-slate-600 font-semibold italic">{s.RecommendedAction}</p>
                      </div>
                    </div>
                    <div className="md:col-span-3 flex flex-col gap-2">
                      <button
                        onClick={handleNotifyParent}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl text-[10px] shadow-md transition-all text-center"
                      >
                        Nhắc nhở phụ huynh
                      </button>
                      <button
                        onClick={handleAssignRecovery}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold py-2 rounded-xl text-[10px] transition-all text-center"
                      >
                        Giao bài phục hồi
                      </button>
                    </div>
                  </div>
                ))}
                {laggingStudents.length === 0 && (
                  <div className="bg-white border border-slate-100 p-8 rounded-3xl text-center text-slate-400 font-semibold italic text-xs">
                    🎉 Không phát hiện học sinh nào chậm tiến độ trong tuần này.
                  </div>
                )}
              </div>
            </div>

            {/* Excellent Students List */}
            <div className="space-y-4">
              <h2 className="text-sm font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[20px]">workspace_premium</span> Nhóm Học Sinh Xuất Sắc ({excellentStudents.length})
              </h2>

              <div className="space-y-4">
                {excellentStudents.map((s, idx) => (
                  <div key={idx} className="bg-white border-l-4 border-l-emerald-500 border border-slate-200/60 p-6 rounded-2xl shadow-sm grid md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-3 space-y-2">
                      <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                        {s.FullName} <span className="text-amber-500">🏆</span>
                      </h3>
                      <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-bold">
                        <span>Điểm trung bình: <strong className="text-emerald-600">{Number(s.AverageGrade).toFixed(1)}/10</strong></span>
                        <span>Nộp bài: <strong>{(s.AssignmentCompletionRate * 100).toFixed(0)}%</strong></span>
                        <span>Đi học: <strong>{(s.AttendanceRate * 100).toFixed(0)}%</strong></span>
                      </div>
                    </div>
                    <div className="md:col-span-6 space-y-3 text-xs leading-relaxed">
                      <div>
                        <p className="font-extrabold text-emerald-700 mb-0.5 flex items-center gap-1">
                          <i className="fa-solid fa-robot" /> Đánh giá AI:
                        </p>
                        <p className="text-slate-600 font-semibold">{s.AlertReason}</p>
                      </div>
                      <div>
                        <p className="font-extrabold text-primary mb-0.5 flex items-center gap-1">
                          <i className="fa-solid fa-trophy" /> Đề xuất AI:
                        </p>
                        <p className="text-slate-600 font-semibold italic">{s.RecommendedAction}</p>
                      </div>
                    </div>
                    <div className="md:col-span-3 flex flex-col gap-2">
                      <button
                        onClick={handleHonors}
                        className="bg-primary hover:bg-primary-hover text-white font-bold py-2 rounded-xl text-[10px] shadow-md transition-all text-center"
                      >
                        Vinh danh bảng tin
                      </button>
                      <button
                        onClick={handleSendCongrats}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold py-2 rounded-xl text-[10px] transition-all text-center"
                      >
                        Gửi thư chúc mừng
                      </button>
                    </div>
                  </div>
                ))}
                {excellentStudents.length === 0 && (
                  <div className="bg-white border border-slate-100 p-8 rounded-3xl text-center text-slate-400 font-semibold italic text-xs">
                    Chưa ghi nhận học sinh có thành tích vượt trội tuần này.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </MainLayout>
  );
}
