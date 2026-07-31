import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import api from '../../services/api';

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    return fallback;
  }
}

export default function GradingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useFetchData(`/Teacher/Grading/${id}`);

  const submission = data?.submission || null;
  const assignment = data?.assignment || null;
  const practiceAttempts = data?.practiceAttempts || [];

  const [gradeInput, setGradeInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPractice, setShowPractice] = useState(false);

  useEffect(() => {
    if (submission) {
      setGradeInput(submission.Grade !== null && submission.Grade !== undefined ? String(submission.Grade) : '');
      setCommentInput(submission.TeacherComment || '');
    }
  }, [submission]);

  if (loading) {
    return (
      <MainLayout hideHeader={false}>
        <div className="flex justify-center py-20"><i className="fa-solid fa-spinner fa-spin text-primary text-3xl" /></div>
      </MainLayout>
    );
  }
  if (!submission || !assignment) {
    return (
      <MainLayout hideHeader={false}>
        <div className="max-w-4xl mx-auto px-6 py-12 text-center text-slate-500 font-semibold">Không tìm thấy bài làm cần chấm.</div>
      </MainLayout>
    );
  }

  const type = assignment.AssignmentType; // 0=QUIZ,1=ESSAY,2=TRUE_FALSE,3=EXAM
  const isAutoGraded = type === 0 || type === 2; // Đã có điểm tự động, không cần chấm tay
  const quizData = type === 0 ? safeParse(assignment.QuizData, []) : [];
  const tfData = type === 2 ? safeParse(assignment.QuizData, []) : [];
  const examData = type === 3 ? safeParse(assignment.QuizData, { quiz: [], tf: [], essay: [] }) : null;
  const studentAnswers = safeParse(submission.Content, type === 3 ? {} : (type === 0 || type === 2 ? [] : ''));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/Teacher/GradeSubmission', {
        submissionId: submission.Id,
        grade: gradeInput,
        comment: commentInput
      });
      // Backend redirects to /Teacher/Submissions/:assignmentId; axios interceptor follows it automatically.
    } catch (err) {
      alert('Không thể lưu kết quả chấm điểm.');
      setSaving(false);
    }
  };

  const QuizReview = ({ items, answersArr }) => (
    <div className="space-y-5">
      {items.map((q, i) => {
        const studentIdx = answersArr[i];
        const correctIdx = q.correct_index;
        return (
          <div key={i} className="border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-bold text-slate-800 mb-2">Câu {i + 1}: {q.question_text}</p>
            <div className="grid gap-1.5">
              {(q.options || []).map((opt, oi) => {
                const isStudent = studentIdx === oi;
                const isCorrect = correctIdx === oi;
                return (
                  <div
                    key={oi}
                    className={`text-xs font-semibold px-3 py-2 rounded-lg border flex items-center gap-2 ${
                      isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : isStudent ? 'bg-red-50 border-red-200 text-red-600' : 'border-slate-100 text-slate-500'
                    }`}
                  >
                    {isCorrect && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
                    {isStudent && !isCorrect && <span className="material-symbols-outlined text-[16px]">cancel</span>}
                    {opt} {isStudent && <span className="italic ml-auto">(học viên chọn)</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const TfReview = ({ items, answersArr }) => (
    <div className="space-y-5">
      {items.map((q, i) => {
        const studentAns = answersArr[i] || {};
        return (
          <div key={i} className="border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-bold text-slate-800 mb-2">Câu {i + 1}: {q.stem}</p>
            <div className="space-y-1.5">
              {['a', 'b', 'c', 'd'].map((letter, ii) => {
                const item = q.items?.[ii];
                if (!item) return null;
                const isRight = studentAns[letter] === item.answer;
                return (
                  <div key={letter} className={`text-xs font-semibold px-3 py-2 rounded-lg border flex items-center gap-2 ${isRight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                    <span className="material-symbols-outlined text-[16px]">{isRight ? 'check_circle' : 'cancel'}</span>
                    {letter}. {item.text} — học viên chọn: <strong>{studentAns[letter] === 'dung' ? 'Đúng' : studentAns[letter] === 'sai' ? 'Sai' : '(chưa chọn)'}</strong>, đáp án: <strong>{item.answer === 'dung' ? 'Đúng' : 'Sai'}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <MainLayout hideHeader={false}>
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6 select-none text-slate-800">
        <div>
          <Link to={`/Teacher/Submissions/${submission.AssignmentId}`} className="inline-flex items-center gap-1 text-slate-400 hover:text-primary transition-all text-xs font-bold">
            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            Quay lại danh sách bài nộp
          </Link>
        </div>

        {/* Sticky total bar */}
        <div className="sticky top-2 z-20 bg-white border border-slate-200 rounded-2xl shadow-md px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-black font-serif text-slate-900">{assignment.Title}</h1>
            <p className="text-sm text-slate-500 font-semibold">Học viên: <strong className="text-slate-700">{submission.Student?.FullName}</strong></p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-bold block uppercase">Tổng điểm</span>
            <span className="text-2xl font-black text-primary">{gradeInput !== '' ? gradeInput : '—'} / 10</span>
          </div>
        </div>

        {practiceAttempts.length > 0 && (
          <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
            <button type="button" onClick={() => setShowPractice((v) => !v)} className="text-sm font-bold text-sky-700 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">{showPractice ? 'expand_less' : 'expand_more'}</span>
              Xem thêm {practiceAttempts.length} lần luyện tập khác (chỉ tham khảo, không tính điểm)
            </button>
            {showPractice && (
              <div className="mt-3 space-y-2">
                {practiceAttempts.map((a) => (
                  <div key={a.Id} className="text-xs font-semibold text-slate-600 bg-white rounded-lg px-3 py-2 border border-sky-100">
                    Lần {a.AttemptNumber} · Nộp lúc {new Date(a.SubmittedAt).toLocaleString('vi-VN')} {a.Grade !== null ? `· Điểm luyện tập: ${a.Grade}/10` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* QUIZ / TRUE_FALSE: auto-graded, read-only reference */}
          {type === 0 && <QuizReview items={quizData} answersArr={Array.isArray(studentAnswers) ? studentAnswers : []} />}
          {type === 2 && <TfReview items={tfData} answersArr={Array.isArray(studentAnswers) ? studentAnswers : []} />}

          {/* EXAM: mixed sections */}
          {type === 3 && examData && (
            <div className="space-y-8">
              {examData.quiz.length > 0 && (
                <div>
                  <h3 className="font-black text-sm text-sky-700 uppercase tracking-wide mb-3">Phần trắc nghiệm</h3>
                  <QuizReview items={examData.quiz} answersArr={studentAnswers.quiz || []} />
                </div>
              )}
              {examData.tf.length > 0 && (
                <div>
                  <h3 className="font-black text-sm text-emerald-700 uppercase tracking-wide mb-3">Phần Đúng / Sai</h3>
                  <TfReview items={examData.tf} answersArr={studentAnswers.tf || []} />
                </div>
              )}
              {examData.essay.length > 0 && (
                <div>
                  <h3 className="font-black text-sm text-amber-700 uppercase tracking-wide mb-3">Phần tự luận</h3>
                  <div className="space-y-3">
                    {examData.essay.map((q, i) => (
                      <div key={i} className="border border-slate-200 rounded-xl p-4">
                        <p className="text-sm font-bold text-slate-800 mb-1.5">Câu {i + 1}: {q.question_text}</p>
                        <p className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 rounded-lg p-3">{(studentAnswers.essay || [])[i] || '(Không trả lời)'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {submission.FileUrl && (
                <a href={submission.FileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                  <span className="material-symbols-outlined text-[18px]">attach_file</span> Xem file đính kèm
                </a>
              )}
            </div>
          )}

          {/* ESSAY: plain text + file */}
          {type === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-800">Bài làm của học viên</p>
              <p className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 rounded-lg p-4 border border-slate-100">{submission.Content || '(Không có nội dung)'}</p>
              {submission.FileUrl && (
                <a href={submission.FileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                  <span className="material-symbols-outlined text-[18px]">attach_file</span> Xem file đính kèm
                </a>
              )}
            </div>
          )}

          {isAutoGraded && (
            <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
              Bài này đã được hệ thống tự động chấm. Bạn vẫn có thể chỉnh sửa điểm nếu cần.
            </p>
          )}

          {/* Grade + comment form */}
          <form onSubmit={handleSave} className="border-t border-slate-100 pt-6 space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1.5">Điểm số (0 - 10)</label>
              <input
                type="number" step="0.1" min="0" max="10"
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                className="w-40 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-sm font-bold"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1.5">Nhận xét cho học viên</label>
              <textarea
                rows={4}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Nhập nhận xét hoặc hướng dẫn sửa bài..."
                className="w-full border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm font-semibold"
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="bg-primary hover:bg-primary-hover text-white text-sm font-black px-8 py-3 rounded-xl shadow-lg disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Lưu & Hoàn Tất Chấm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
