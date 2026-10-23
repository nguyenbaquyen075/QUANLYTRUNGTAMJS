import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';

const LETTERS = ['A', 'B', 'C', 'D'];
const parse = (raw, fallback) => {
  try { return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : fallback; } catch { return fallback; }
};

// Phần trắc nghiệm: tô xanh đáp án đúng, đỏ đáp án học viên chọn sai
function QuizReview({ questions, picks }) {
  return (
    <div className="space-y-5">
      {questions.map((q, qIdx) => {
        const picked = Array.isArray(picks) ? picks[qIdx] : undefined;
        const right = picked === q.correct_index;
        return (
          <div key={qIdx} className="border-b border-dashed border-slate-200 pb-5 last:border-0 last:pb-0">
            <div className="flex items-start gap-2 text-sm font-semibold text-slate-800 mb-2.5">
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 text-white ${right ? 'bg-emerald-600' : 'bg-red-500'}`}>Câu {qIdx + 1}</span>
              <span className="whitespace-pre-line">{q.question_text || q.question}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {(q.options || []).map((opt, optIdx) => {
                const isCorrect = optIdx === q.correct_index;
                const isWrongPick = optIdx === picked && !isCorrect;
                return (
                  <div key={optIdx} className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg border ${isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold' : isWrongPick ? 'bg-red-50 border-red-300 text-red-800' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <strong>{LETTERS[optIdx]}.</strong> <span className="min-w-0">{opt}</span>
                    {isCorrect && <span className="ml-auto text-xs font-bold text-emerald-600 shrink-0">{picked === optIdx ? 'Bạn chọn đúng' : 'Đáp án đúng'}</span>}
                    {isWrongPick && <span className="ml-auto text-xs font-bold text-red-500 shrink-0">Bạn chọn</span>}
                  </div>
                );
              })}
            </div>
            {picked === undefined || picked === null ? <p className="text-xs text-amber-700 mt-2">Bạn chưa chọn đáp án câu này.</p> : null}
          </div>
        );
      })}
    </div>
  );
}

// Phần Đúng/Sai: mỗi ý ghi bạn chọn gì và đáp án đúng
function TfReview({ questions, picks }) {
  const label = (v) => (v === 'dung' ? 'Đúng' : v === 'sai' ? 'Sai' : 'Chưa chọn');
  return (
    <div className="space-y-5">
      {questions.map((q, qIdx) => (
        <div key={qIdx} className="border-b border-dashed border-slate-200 pb-5 last:border-0 last:pb-0">
          <div className="text-sm font-semibold text-slate-800 mb-2.5 whitespace-pre-line"><span className="text-primary mr-1">Câu {qIdx + 1}.</span>{q.stem || q.question_text}</div>
          <div className="space-y-1.5">
            {(q.items || []).map((item, ii) => {
              const letter = 'abcd'[ii];
              const mine = picks?.[qIdx]?.[letter];
              const ok = mine === item.answer;
              return (
                <div key={letter} className={`flex items-center justify-between gap-3 text-sm px-3 py-2 rounded-lg border ${ok ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
                  <span className="min-w-0"><strong>{letter})</strong> {item.text}</span>
                  <span className="text-xs font-bold shrink-0">Bạn chọn: {label(mine)} · Đáp án: {label(item.answer)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, aside, children }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default function SubmissionResultPage() {
  const { id } = useParams();
  const { data, loading } = useFetchData('/Student/Dashboard');
  const assignment = (data?.assignments || []).find((a) => String(a.Id) === String(id));
  const sub = (data?.submissions || []).find((s) => String(s.AssignmentId) === String(id));

  const type = assignment?.AssignmentType;
  const quizData = parse(assignment?.QuizData, type === 3 ? {} : []);
  const answers = parse(sub?.Content, null);
  const quizQs = type === 0 ? quizData : type === 3 ? quizData.quiz || [] : [];
  const quizPicks = type === 0 ? answers : type === 3 ? answers?.quiz : [];
  const tfQs = type === 2 ? quizData : type === 3 ? quizData.tf || [] : [];
  const tfPicks = type === 2 ? answers : type === 3 ? answers?.tf : [];
  const essayQs = type === 3 ? quizData.essay || [] : [];
  const correctCount = quizQs.filter((q, i) => Array.isArray(quizPicks) && quizPicks[i] === q.correct_index).length;
  const graded = sub?.Grade !== null && sub?.Grade !== undefined;

  return (
    <MainLayout hideChatbot>
      <div className="min-h-screen bg-[#F5F7FA] py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-5">
          <Link to="/Student/Dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary">
            <span className="material-symbols-outlined text-base">arrow_back</span> Quay lại trang học viên
          </Link>

          {loading && <div className="text-center text-slate-500 py-20">Đang tải kết quả…</div>}
          {!loading && !assignment && <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">Không tìm thấy bài làm này.</div>}

          {assignment && (
            <>
              {/* Tiêu đề + điểm */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:items-center">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">Kết quả học tập</span>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 leading-snug">{assignment.Title}</h1>
                  {sub ? <p className="text-sm text-slate-500 mt-1.5">Nộp lúc {new Date(sub.SubmittedAt).toLocaleString('vi-VN')}</p> : <p className="text-sm text-amber-700 mt-1.5">Bạn chưa nộp bài này.</p>}
                </div>
                <div className="flex gap-3 shrink-0">
                  {quizQs.length > 0 && (
                    <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-center min-w-[6.5rem]">
                      <span className="text-[0.6875rem] font-bold text-slate-500 uppercase block">Trắc nghiệm</span>
                      <strong className="text-xl font-bold text-slate-800">{correctCount}/{quizQs.length}</strong>
                      <span className="block text-[0.6875rem] text-slate-500">câu đúng</span>
                    </div>
                  )}
                  <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 text-center min-w-[6.5rem]">
                    <span className="text-[0.6875rem] font-bold text-slate-500 uppercase block">Điểm số</span>
                    <strong className="text-2xl font-black text-primary">{graded ? Number(sub.Grade).toFixed(1) : '–'}</strong>
                    <span className="block text-[0.6875rem] text-slate-500">{graded ? 'trên thang 10' : 'chưa chấm'}</span>
                  </div>
                </div>
              </section>

              {/* Nhận xét */}
              <Section title="Nhận xét của giáo viên">
                <p className="text-sm text-slate-700 whitespace-pre-line">{sub?.TeacherComment || 'Chưa có nhận xét.'}</p>
              </Section>

              {/* Đề bài */}
              {(assignment.Instruction || assignment.AttachmentUrl) && (
                <Section title="Đề bài và yêu cầu">
                  {assignment.Instruction && <div className="text-sm text-slate-700 whitespace-pre-line">{assignment.Instruction}</div>}
                  {assignment.AttachmentUrl && (
                    <a href={assignment.AttachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-primary mt-3">
                      <span className="material-symbols-outlined text-base">description</span> Tải đề bài
                    </a>
                  )}
                </Section>
              )}

              {/* Bài làm */}
              {quizQs.length > 0 && (
                <Section title="Phần trắc nghiệm" aside={<span className="text-sm text-slate-500">Đúng {correctCount}/{quizQs.length} câu</span>}>
                  <QuizReview questions={quizQs} picks={quizPicks} />
                </Section>
              )}
              {tfQs.length > 0 && (
                <Section title="Phần Đúng / Sai">
                  <TfReview questions={tfQs} picks={tfPicks} />
                </Section>
              )}
              {essayQs.length > 0 && (
                <Section title="Phần tự luận">
                  <div className="space-y-4">
                    {essayQs.map((q, i) => (
                      <div key={i}>
                        <div className="text-sm font-semibold text-slate-800 mb-1.5"><span className="text-primary mr-1">Câu {i + 1}.</span>{q.question_text}</div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 whitespace-pre-line min-h-[3rem]">{answers?.essay?.[i] || 'Không có bài làm.'}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {type === 1 && (
                <Section title="Bài làm của bạn">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-line min-h-[5rem]">{sub?.Content || 'Không có nội dung.'}</div>
                </Section>
              )}
              {sub?.FileUrl && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl">
                  <span className="text-sm font-semibold text-slate-800">Tệp bài làm đã nộp</span>
                  <a href={sub.FileUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg text-xs">Tải tệp</a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
