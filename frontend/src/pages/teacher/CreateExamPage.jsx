import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../services/api';

export default function CreateExamPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [instruction, setInstruction] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) {
      alert('Vui lòng điền tiêu đề kỳ thi và hạn chót!');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/Teacher/CreateExam/${classId}`, {
        title,
        dueDate,
        instruction
      });
      alert('Tạo kỳ thi/kiểm tra thành công!');
      navigate('/Teacher/Dashboard');
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi tạo kỳ thi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout hideHeader={false}>
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8 select-none text-slate-800">
        <div>
          <Link to="/Teacher/Dashboard" className="inline-flex items-center gap-1 text-slate-400 hover:text-primary transition-all text-xs font-bold">
            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            Quay lại Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 bg-slate-50 border-b border-slate-100 text-center space-y-1">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 font-serif flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-primary text-[28px]">quiz</span>
              Tạo Đề Thi / Kiểm Tra Mới
            </h1>
            <p className="text-xs text-slate-500 font-semibold">Tạo bài thi đánh giá năng lực học viên của lớp.</p>
          </div>

          <div className="p-8 md:p-12 space-y-6">
            <div className="space-y-2">
              <label className="font-extrabold text-slate-700 text-xs block">Tiêu đề bài kiểm tra</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Đề thi thử Toán THPT Quốc Gia số 1"
                className="w-full border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-2.5 text-xs font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="font-extrabold text-slate-700 text-xs block">Hạn đóng đề thi</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-2.5 text-xs font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="font-extrabold text-slate-700 text-xs block">Yêu cầu & Nội dung mô tả đề thi</label>
              <textarea
                rows={5}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Nhập nội quy phòng thi và cấu trúc bài thi tại đây..."
                className="w-full border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-4 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-8 py-3.5 rounded-xl shadow-lg transition-all"
            >
              {submitting ? 'ĐANG TẠO...' : 'TẠO ĐỀ THI'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
