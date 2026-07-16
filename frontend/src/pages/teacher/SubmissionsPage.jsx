import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import api from '../../services/api';

export default function SubmissionsPage() {
  const { id } = useParams(); // assignmentId
  const { data, loading, error, refetch } = useFetchData(`/Teacher/Submissions/${id}`);

  const assignment = data?.assignment || null;
  const submissions = data?.submissions || [];
  const otherAssignments = data?.otherAssignments || [];

  const [activeSubmission, setActiveSubmission] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [grading, setGrading] = useState(false);

  const gradedCount = submissions.filter(s => s.Grade !== null).length;
  const totalCount = submissions.length;

  const handleOpenGradeModal = (sub) => {
    setActiveSubmission(sub);
    setGradeInput(sub.Grade !== null ? String(sub.Grade) : '');
    setFeedbackInput(sub.TeacherComment || '');
  };

  const handleCloseGradeModal = () => {
    setActiveSubmission(null);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!activeSubmission) return;

    setGrading(true);
    try {
      await api.post(`/Teacher/GradeSubmission/${activeSubmission.Id}`, {
        grade: gradeInput,
        teacherComment: feedbackInput
      });
      alert('Đã nhập điểm và phản hồi bài làm thành công!');
      handleCloseGradeModal();
      refetch();
    } catch (err) {
      console.error(err);
      alert('Không thể lưu kết quả chấm điểm.');
    } finally {
      setGrading(false);
    }
  };

  return (
    <MainLayout hideHeader={false}>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 select-none text-slate-800">
        
        {/* Back Link */}
        <div>
          <Link to="/Teacher/Dashboard" className="inline-flex items-center gap-1 text-slate-400 hover:text-primary transition-all text-xs font-bold">
            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            Quay lại Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
          </div>
        ) : !assignment ? (
          <div className="text-center py-10 text-slate-500 font-semibold">
            Không tìm thấy thông tin bài tập hoặc không có bài nộp nào.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div className="pb-6 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-800 font-serif flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[28px]">grading</span>
                  Chấm Điểm Bài Tập Học Viên
                </h1>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Bài tập: <strong className="text-primary">{assignment.Title}</strong> | Lớp: <strong>{assignment.Lesson?.Class?.ClassName}</strong>
                </p>
              </div>
              <div className="text-xs bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl font-bold">
                Đã chấm: <strong className="text-primary">{gradedCount} / {totalCount} bài làm</strong>
              </div>
            </div>

            {/* Submissions list */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                    <th className="p-4">Học sinh nộp</th>
                    <th className="p-4">Bài làm / Tệp đính kèm</th>
                    <th className="p-4">Thời gian nộp</th>
                    <th className="p-4 text-center">Điểm số</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {submissions.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">{sub.Student?.FullName}</td>
                      <td className="p-4">
                        <div className="max-w-xs space-y-1">
                          <p className="truncate text-slate-500 italic">"{sub.Notes || 'Không có ghi chú'}"</p>
                          {sub.AttachmentUrl && (
                            <a
                              href={sub.AttachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary font-bold flex items-center gap-1 hover:underline text-[10px]"
                            >
                              <i className="fa-solid fa-paperclip" /> Xem file đính kèm
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(sub.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-4 text-center font-black text-xs md:text-sm">
                        {sub.Grade !== null ? (
                          <span className="text-primary">{sub.Grade} / 10</span>
                        ) : (
                          <span className="text-amber-600">Chưa chấm</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenGradeModal(sub)}
                          className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                        >
                          Chấm điểm
                        </button>
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400 italic">Chưa ghi nhận bài nộp nào cho bài tập này.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grade Submission Modal Overlay */}
        {activeSubmission && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4"
            onClick={handleCloseGradeModal}
          >
            <form
              onSubmit={handleGradeSubmit}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-scale-in"
            >
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-800 text-sm">
                  Chấm điểm: {activeSubmission.Student?.FullName}
                </h3>
                <button
                  type="button"
                  onClick={handleCloseGradeModal}
                  className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6 text-xs font-semibold">
                {/* Submitted Content Detail */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Bài làm học sinh</span>
                  <p className="text-slate-600 leading-relaxed font-semibold italic">"{activeSubmission.Notes || 'Không nhập text'}"</p>
                  {activeSubmission.AttachmentUrl && (
                    <a
                      href={activeSubmission.AttachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold flex items-center gap-1 hover:underline text-[10px] pt-1"
                    >
                      <i className="fa-solid fa-paperclip" /> Nhấn để xem tài liệu đính kèm
                    </a>
                  )}
                </div>

                {/* Score Input */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-extrabold text-xs block">Điểm số (Thang điểm 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    placeholder="Nhập điểm từ 0 đến 10..."
                    className="w-full border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                {/* Comment Input */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-extrabold text-xs block">Nhận xét & Feedback của giáo viên</label>
                  <textarea
                    rows={4}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Nhập nhận xét hoặc hướng dẫn sửa bài cho em học viên..."
                    className="w-full border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseGradeModal}
                  className="px-5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={grading}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-lg"
                >
                  {grading ? 'ĐANG LƯU...' : 'LƯU KẾT QUẢ'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
