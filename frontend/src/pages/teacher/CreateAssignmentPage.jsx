import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import api from '../../services/api';

const LETTERS = ['A', 'B', 'C', 'D'];
const field = 'w-full border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-2.5 text-sm';

// Câu trắc nghiệm lưu đúng dạng trang làm bài của học viên đọc: question_text, options[4], correct_index, points
const newQuestion = () => ({ question_text: '', options: ['', '', '', ''], correct_index: 0, points: 1 });

export default function CreateAssignmentPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { data } = useFetchData(`/Teacher/CreateAssignment/${lessonId}`);
  const lesson = data?.lesson;

  const [title, setTitle] = useState('');
  const [assignmentType, setAssignmentType] = useState('QUIZ');
  const [dueDate, setDueDate] = useState('');
  const [instruction, setInstruction] = useState('');
  const [questions, setQuestions] = useState([newQuestion()]);
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isQuiz = assignmentType === 'QUIZ';
  const totalPoints = questions.reduce((s, q) => s + (Number(q.points) || 0), 0);

  const updateQuestion = (i, patch) => setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const updateOption = (i, oi, value) => setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, options: q.options.map((o, k) => (k === oi ? value : o)) } : q)));
  const removeQuestion = (i) => setQuestions((qs) => qs.filter((_, idx) => idx !== i));

  const validate = () => {
    if (!title.trim()) return 'Vui lòng nhập tiêu đề bài tập.';
    if (!dueDate) return 'Vui lòng chọn hạn nộp.';
    if (isQuiz) {
      if (questions.length === 0) return 'Bài trắc nghiệm cần ít nhất 1 câu hỏi.';
      const bad = questions.findIndex((q) => !q.question_text.trim() || q.options.some((o) => !o.trim()) || !(Number(q.points) > 0));
      if (bad >= 0) return `Câu ${bad + 1} chưa đủ: cần nội dung câu hỏi, đủ 4 đáp án và điểm lớn hơn 0.`;
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    setError(msg);
    if (msg) return;

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('assignmentType', assignmentType);
    formData.append('dueDate', dueDate);
    formData.append('instruction', instruction);
    if (isQuiz) {
      formData.append('quizQuestions', JSON.stringify(questions.map((q) => ({ ...q, question_text: q.question_text.trim(), points: Number(q.points) }))));
    } else if (attachment) {
      formData.append('attachment', attachment);
    }

    setSubmitting(true);
    try {
      await api.post(`/Teacher/CreateAssignment/${lessonId}`, formData, { headers: { 'Content-Type': undefined } });
      navigate('/Teacher/Dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Không tạo được bài tập. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout hideHeader={false}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6 text-slate-800">
        <Link to="/Teacher/Dashboard" className="inline-flex items-center gap-1 text-slate-500 hover:text-primary text-sm font-semibold">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Quay lại Dashboard
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[1.75rem]">add_task</span>
              Giao bài tập về nhà
            </h1>
            {lesson && (
              <p className="text-sm text-slate-500 mt-1">
                {lesson.Class?.ClassName}{lesson.Title ? ` · ${lesson.Title}` : ''}
              </p>
            )}
          </div>

          {/* Thông tin chung */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
            <div>
              <label htmlFor="as-title" className="font-semibold text-slate-700 text-sm block mb-1.5">Tiêu đề bài tập <span className="text-red-500">*</span></label>
              <input id="as-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Bài tập trắc nghiệm số 1 - Công thức nhân đôi" className={field} />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <span className="font-semibold text-slate-700 text-sm block mb-1.5">Hình thức làm bài</span>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: 'QUIZ', label: 'Trắc nghiệm', icon: 'checklist' }, { v: 'ESSAY', label: 'Tự luận', icon: 'edit_document' }].map((t) => (
                    <label key={t.v} className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold cursor-pointer ${assignmentType === t.v ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      <input type="radio" name="as-type" value={t.v} checked={assignmentType === t.v} onChange={() => setAssignmentType(t.v)} className="sr-only" />
                      <span className="material-symbols-outlined text-[1.15rem]">{t.icon}</span>{t.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="as-due" className="font-semibold text-slate-700 text-sm block mb-1.5">Hạn nộp <span className="text-red-500">*</span></label>
                <input id="as-due" type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={field} />
              </div>
            </div>

            <div>
              <label htmlFor="as-instruction" className="font-semibold text-slate-700 text-sm block mb-1.5">Hướng dẫn làm bài</label>
              <textarea id="as-instruction" rows={3} value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Ví dụ: Làm trong 30 phút, không dùng tài liệu." className={`${field} py-3`} />
            </div>
          </section>

          {/* Câu hỏi trắc nghiệm */}
          {isQuiz && (
            <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">Câu hỏi</h2>
                <span className="text-sm text-slate-500">{questions.length} câu · tổng <b className="text-slate-800">{totalPoints}</b> điểm</span>
              </div>

              {questions.map((q, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-primary">Câu {i + 1}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-sm text-slate-600">
                        Điểm
                        <input type="number" min="0.25" step="0.25" value={q.points} onChange={(e) => updateQuestion(i, { points: e.target.value })} className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm" aria-label={`Điểm câu ${i + 1}`} />
                      </label>
                      {questions.length > 1 && (
                        <button type="button" onClick={() => removeQuestion(i)} className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700">
                          <span className="material-symbols-outlined text-base">delete</span>Xóa
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea rows={2} value={q.question_text} onChange={(e) => updateQuestion(i, { question_text: e.target.value })} placeholder="Nội dung câu hỏi" className={`${field} py-2.5`} aria-label={`Nội dung câu ${i + 1}`} />
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {LETTERS.map((ltr, oi) => (
                      <div key={ltr} className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 ${q.correct_index === oi ? 'border-emerald-400 bg-emerald-50/60' : 'border-slate-200'}`}>
                        <input type="radio" name={`correct-${i}`} checked={q.correct_index === oi} onChange={() => updateQuestion(i, { correct_index: oi })} className="w-4 h-4 accent-emerald-600" aria-label={`Đáp án đúng của câu ${i + 1} là ${ltr}`} />
                        <span className="font-bold text-slate-600 w-4">{ltr}</span>
                        <input type="text" value={q.options[oi]} onChange={(e) => updateOption(i, oi, e.target.value)} placeholder={`Đáp án ${ltr}`} className="flex-1 min-w-0 bg-transparent py-1.5 text-sm focus:outline-none" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Chọn ô tròn cạnh đáp án đúng.</p>
                </div>
              ))}

              <button type="button" onClick={() => setQuestions((qs) => [...qs, newQuestion()])} className="w-full rounded-xl border-2 border-dashed border-slate-300 hover:border-primary hover:text-primary text-slate-600 font-semibold py-3 inline-flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined">add</span>Thêm câu hỏi
              </button>
            </section>
          )}

          {/* Tự luận: đề kèm tệp */}
          {!isQuiz && (
            <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Đề bài tự luận</h2>
              <p className="text-sm text-slate-500">Ghi đề ở phần hướng dẫn phía trên, hoặc đính kèm tệp đề (PDF, Word, ảnh). Học viên nộp bài bằng văn bản hoặc tệp.</p>
              <label className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-3 cursor-pointer hover:border-primary">
                <span className="material-symbols-outlined text-primary">attach_file</span>
                <span className="text-sm text-slate-700 truncate">{attachment ? attachment.name : 'Chọn tệp đề bài (không bắt buộc)'}</span>
                <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => setAttachment(e.target.files?.[0] || null)} className="sr-only" />
              </label>
            </section>
          )}

          {error && <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3" role="alert">{error}</p>}

          <div className="flex justify-end gap-3">
            <Link to="/Teacher/Dashboard" className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Hủy</Link>
            <button type="submit" disabled={submitting} className="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white text-sm font-bold px-7 py-3 rounded-xl">
              {submitting ? 'Đang giao bài…' : 'Giao bài tập'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
