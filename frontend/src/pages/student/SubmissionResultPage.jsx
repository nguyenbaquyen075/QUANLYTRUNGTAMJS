import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';

const LETTERS = ['A', 'B', 'C', 'D'];
const KIND = { 0: 'Trắc nghiệm', 1: 'Tự luận', 2: 'Đúng / Sai', 3: 'Đề thi tổng hợp' };
const parse = (raw, fallback) => {
  try { return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : fallback; } catch { return fallback; }
};

// Bảng màu chung đổi mọi lớp green/emerald sang xanh dương, nên màu "đúng" ghi mã màu trực tiếp
const TONE = {
  right: { label: 'Đúng', icon: 'check_circle', text: 'text-[#067647]', pill: 'bg-[#ECFDF3] text-[#067647]', box: 'bg-[#F6FEF9] border-[#75E0A7]', solid: 'bg-[#17B26A] border-[#17B26A] text-white', tile: 'bg-[#F6FEF9] border-[#ABEFC6] text-[#067647] hover:border-[#17B26A]', active: 'bg-[#17B26A] border-[#17B26A] text-white' },
  wrong: { label: 'Sai', icon: 'cancel', text: 'text-red-600', pill: 'bg-red-50 text-red-700', box: 'bg-red-50/60 border-red-300', solid: 'bg-red-500 border-red-500 text-white', tile: 'bg-red-50 border-red-200 text-red-600 hover:border-red-500', active: 'bg-red-500 border-red-500 text-white' },
  blank: { label: 'Chưa làm', icon: 'radio_button_unchecked', text: 'text-slate-400', pill: 'bg-slate-100 text-slate-600' },
};

const quizStatus = (q, picked) => (picked === undefined || picked === null ? 'blank' : picked === q.correct_index ? 'right' : 'wrong');
// Câu Đúng/Sai chỉ tính là đúng khi mọi ý đều đúng
const tfStatus = (q, picks) => {
  const items = q.items || [];
  if (!items.length || items.every((_, ii) => !picks?.['abcd'[ii]])) return 'blank';
  return items.every((item, ii) => picks?.['abcd'[ii]] === item.answer) ? 'right' : 'wrong';
};
const tfLabel = (v) => (v === 'dung' ? 'Đúng' : v === 'sai' ? 'Sai' : 'Chưa chọn');

// Vòng điểm: cung xanh theo điểm trên thang 10
function ScoreRing({ grade }) {
  const r = 52;
  const len = 2 * Math.PI * r;
  const pct = grade === null ? 0 : Math.max(0, Math.min(1, grade / 10));
  return (
    <div className="relative w-32 h-32 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#EDF2F9" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1467E8" strokeWidth="10" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - pct)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <strong className="text-3xl font-bold text-slate-900 leading-none">{grade === null ? '–' : grade.toFixed(1)}</strong>
        <span className="text-xs text-slate-500 mt-1">{grade === null ? 'Chưa chấm' : 'trên 10 điểm'}</span>
      </div>
    </div>
  );
}

// Ô Đúng / Sai: ấn để chỉ xem các câu đúng hoặc sai, ấn lại để xem tất cả
function StatTile({ status, value, active, onClick }) {
  const t = TONE[status];
  return (
    <button type="button" onClick={onClick} aria-pressed={active} disabled={!value}
      className={`rounded-xl border px-4 py-3 flex items-baseline justify-center gap-1.5 disabled:cursor-default ${active ? t.active : t.tile}`}>
      <strong className="text-2xl font-bold">{value}</strong>
      <span className="text-sm font-semibold whitespace-nowrap">{t.label}</span>
    </button>
  );
}

// Một phần của đề (Trắc nghiệm, Đúng/Sai, Tự luận): tiêu đề phần rồi mỗi câu một thẻ
function Part({ title, summary, children }) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3 pt-2">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {summary && <span className="text-sm text-slate-500">{summary}</span>}
      </div>
      {children}
    </section>
  );
}

function StatusPill({ status }) {
  const t = TONE[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${t.pill}`}>
      <span className="material-symbols-outlined text-[1rem]">{t.icon}</span>{t.label}
    </span>
  );
}

function Question({ number, points, status, stem, children }) {
  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-sm font-bold text-slate-900">
          Câu {number}{points ? <span className="font-medium text-slate-400"> · {points} điểm</span> : null}
        </span>
        {status && <StatusPill status={status} />}
      </div>
      <p className="text-[0.9375rem] leading-relaxed text-slate-800 whitespace-pre-line mb-4">{stem}</p>
      {children}
    </article>
  );
}

function QuizOptions({ q, picked }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2.5">
      {(q.options || []).map((opt, i) => {
        const isCorrect = i === q.correct_index;
        const isPicked = i === picked;
        const tone = isCorrect ? TONE.right : isPicked ? TONE.wrong : null;
        return (
          <div key={i} className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${tone ? tone.box : 'border-slate-200'}`}>
            <span className={`w-7 h-7 shrink-0 rounded-full border text-xs font-bold flex items-center justify-center ${tone ? tone.solid : 'border-slate-300 text-slate-500'}`}>{LETTERS[i]}</span>
            <span className={`min-w-0 flex-1 ${tone ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{opt}</span>
            {isPicked && <span className={`text-xs font-semibold shrink-0 ${isCorrect ? TONE.right.text : TONE.wrong.text}`}>Bạn chọn</span>}
            {isCorrect && !isPicked && <span className={`text-xs font-semibold shrink-0 ${TONE.right.text}`}>Đáp án đúng</span>}
          </div>
        );
      })}
      {(picked === undefined || picked === null) && <p className="sm:col-span-2 text-xs text-amber-700">Bạn chưa chọn đáp án câu này.</p>}
    </div>
  );
}

function TfRows({ q, picks }) {
  const cols = 'grid grid-cols-[minmax(0,1fr)_6rem_5rem] gap-3 items-center px-4';
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden text-sm">
      <div className={`${cols} py-2 bg-slate-50 text-xs font-semibold text-slate-500`}>
        <span>Mệnh đề</span><span className="text-center">Bạn chọn</span><span className="text-center">Đáp án</span>
      </div>
      {(q.items || []).map((item, ii) => {
        const letter = 'abcd'[ii];
        const mine = picks?.[letter];
        const tone = !mine ? TONE.blank : mine === item.answer ? TONE.right : TONE.wrong;
        return (
          <div key={letter} className={`${cols} py-2.5 border-t border-slate-100`}>
            <span className="min-w-0 text-slate-700"><b className="text-slate-900 mr-1">{letter})</b>{item.text}</span>
            <span className={`inline-flex items-center justify-center gap-1 font-semibold ${tone.text}`}>
              <span className="material-symbols-outlined text-[1rem]">{tone.icon}</span>{tfLabel(mine)}
            </span>
            <span className="text-center font-semibold text-slate-900">{tfLabel(item.answer)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SubmissionResultPage() {
  const { id } = useParams();
  const { data, loading } = useFetchData('/Student/Dashboard');
  const [filter, setFilter] = useState('all');

  const assignment = (data?.assignments || []).find((a) => String(a.Id) === String(id));
  const sub = (data?.submissions || []).find((s) => String(s.AssignmentId) === String(id));

  const type = assignment?.AssignmentType;
  const quizData = parse(assignment?.QuizData, type === 3 ? {} : []);
  const answers = parse(sub?.Content, null);
  const quizQs = type === 0 ? quizData : type === 3 ? quizData.quiz || [] : [];
  const quizPicks = (type === 0 ? answers : type === 3 ? answers?.quiz : null) || [];
  const tfQs = type === 2 ? quizData : type === 3 ? quizData.tf || [] : [];
  const tfPicks = (type === 2 ? answers : type === 3 ? answers?.tf : null) || [];
  const essayQs = type === 3 ? quizData.essay || [] : [];
  const grade = sub?.Grade !== null && sub?.Grade !== undefined ? Number(sub.Grade) : null;

  const groups = [
    { key: 'q', title: 'Trắc nghiệm', statuses: quizQs.map((q, i) => quizStatus(q, quizPicks[i])) },
    { key: 't', title: 'Đúng / Sai', statuses: tfQs.map((q, i) => tfStatus(q, tfPicks[i])) },
  ].filter((g) => g.statuses.length > 0);
  const all = groups.flatMap((g) => g.statuses);
  const counts = {
    all: all.length,
    right: all.filter((s) => s === 'right').length,
    wrong: all.filter((s) => s === 'wrong').length,
    blank: all.filter((s) => s === 'blank').length,
  };
  const status = (key, i) => groups.find((g) => g.key === key).statuses[i];
  const shown = (key, list) => list.map((_, i) => i).filter((i) => filter === 'all' || status(key, i) === filter);
  const toggle = (st) => setFilter((f) => (f === st ? 'all' : st));
  const rightIn = (key, list) => list.filter((_, i) => status(key, i) === 'right').length;
  const partLabel = (n, name) => (type === 3 ? `Phần ${n}. ${name}` : name);


  return (
    <MainLayout hideChatbot>
      <div className="min-h-screen bg-[#F5F7FA] py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-5">
          <Link to="/Student/Dashboard" className="inline-flex items-center gap-1 text-base font-bold text-primary hover:text-primary-hover">
            <span className="material-symbols-outlined text-xl">arrow_back</span> Quay lại
          </Link>

          {loading && <div className="text-center text-slate-500 py-20">Đang tải kết quả…</div>}
          {!loading && !assignment && <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">Không tìm thấy bài làm này.</div>}

          {assignment && (
            <>
              {/* Tổng quan: điểm, tên bài, nhận xét, số câu đúng / sai */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col md:flex-row gap-6 md:items-center">
                <div className="flex gap-5 items-center flex-1 min-w-0">
                  <ScoreRing grade={grade} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
                      <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full">{KIND[type] || 'Bài tập'}</span>
                      {sub
                        ? <span className="text-slate-500">Nộp lúc {new Date(sub.SubmittedAt).toLocaleString('vi-VN')}</span>
                        : <span className="text-amber-700">Bạn chưa nộp bài này</span>}
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-2.5 leading-snug">{assignment.Title}</h1>
                    <p className="flex items-start gap-1.5 text-sm text-slate-600 mt-2">
                      <span className="material-symbols-outlined text-[1.125rem] text-slate-400 shrink-0">chat</span>
                      <span className="whitespace-pre-line">{sub?.TeacherComment || 'Giáo viên chưa nhận xét.'}</span>
                    </p>
                  </div>
                </div>
                {counts.all > 0 && (
                  <div className="grid grid-cols-2 gap-3 md:w-[15rem] shrink-0">
                    <StatTile status="right" value={counts.right} active={filter === 'right'} onClick={() => toggle('right')} />
                    <StatTile status="wrong" value={counts.wrong} active={filter === 'wrong'} onClick={() => toggle('wrong')} />
                  </div>
                )}
              </section>

              <div className="space-y-5">
                {filter !== 'all' && (
                  <div className="flex items-center justify-between gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm">
                    <span className="text-slate-600">Đang xem <b className={TONE[filter].text}>{counts[filter]} câu {TONE[filter].label.toLowerCase()}</b></span>
                    <button type="button" onClick={() => setFilter('all')} className="font-semibold text-primary hover:underline">Xem tất cả câu</button>
                  </div>
                )}

                  {(assignment.Instruction || assignment.AttachmentUrl) && (
                    <section className="bg-white rounded-2xl border border-slate-200 px-5 sm:px-6 py-4">
                      <h2 className="text-sm font-bold text-slate-900 mb-1.5">Đề bài và yêu cầu</h2>
                      {assignment.Instruction && <div className="text-sm text-slate-600 whitespace-pre-line">{assignment.Instruction}</div>}
                      {assignment.AttachmentUrl && (
                        <a href={assignment.AttachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-primary mt-2">
                          <span className="material-symbols-outlined text-base">download</span> Tải đề bài
                        </a>
                      )}
                    </section>
                  )}

                  {shown('q', quizQs).length > 0 && (
                    <Part title={partLabel('I', 'Trắc nghiệm')} summary={`${rightIn('q', quizQs)}/${quizQs.length} câu đúng`}>
                      {shown('q', quizQs).map((i) => (
                        <Question key={`q${i}`} number={i + 1} points={quizQs[i].points} status={status('q', i)} stem={quizQs[i].question_text || quizQs[i].question}>
                          <QuizOptions q={quizQs[i]} picked={quizPicks[i]} />
                        </Question>
                      ))}
                    </Part>
                  )}

                  {shown('t', tfQs).length > 0 && (
                    <Part title={partLabel(quizQs.length ? 'II' : 'I', 'Đúng / Sai')} summary={`${rightIn('t', tfQs)}/${tfQs.length} câu đúng`}>
                      {shown('t', tfQs).map((i) => (
                        <Question key={`t${i}`} number={i + 1} status={status('t', i)} stem={tfQs[i].stem || tfQs[i].question_text}>
                          <TfRows q={tfQs[i]} picks={tfPicks[i]} />
                        </Question>
                      ))}
                    </Part>
                  )}

                  {filter === 'all' && essayQs.length > 0 && (
                    <Part title={partLabel(['I', 'II', 'III'][groups.length], 'Tự luận')} summary={`${essayQs.length} câu`}>
                      {essayQs.map((q, i) => (
                        <Question key={`e${i}`} number={i + 1} points={q.points} stem={q.question_text}>
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-line min-h-[3rem]">{answers?.essay?.[i] || 'Không có bài làm.'}</div>
                        </Question>
                      ))}
                    </Part>
                  )}

                  {type === 1 && (
                    <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                      <h2 className="text-base font-bold text-slate-900 mb-3">Bài làm của bạn</h2>
                      <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-line min-h-[5rem]">{sub?.Content || 'Không có nội dung.'}</div>
                    </section>
                  )}

                  {sub?.FileUrl && (
                    <div className="flex items-center justify-between gap-3 px-5 py-4 bg-white border border-slate-200 rounded-2xl">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <span className="material-symbols-outlined text-[1.25rem] text-primary">attach_file</span>Tệp bài làm đã nộp
                      </span>
                      <a href={sub.FileUrl} target="_blank" rel="noreferrer" className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg text-xs">Tải tệp</a>
                    </div>
                  )}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
