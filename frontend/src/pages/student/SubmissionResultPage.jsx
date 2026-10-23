import React, { useEffect, useState } from 'react';
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
  right: { label: 'Đúng', icon: 'check', text: 'text-[#067647]', soft: 'bg-[#ECFDF3] text-[#067647]', solid: 'bg-[#17B26A] text-white' },
  wrong: { label: 'Sai', icon: 'close', text: 'text-red-600', soft: 'bg-red-50 text-red-700', solid: 'bg-red-500 text-white' },
  blank: { label: 'Chưa làm', icon: 'remove', text: 'text-slate-500', soft: 'bg-slate-100 text-slate-600', solid: 'bg-slate-200 text-slate-600' },
};

const quizStatus = (q, picked) => (picked === undefined || picked === null ? 'blank' : picked === q.correct_index ? 'right' : 'wrong');
// Câu Đúng/Sai chỉ tính là đúng khi mọi ý đều đúng
const tfStatus = (q, picks) => {
  const items = q.items || [];
  if (!items.length || items.every((_, ii) => !picks?.['abcd'[ii]])) return 'blank';
  return items.every((item, ii) => picks?.['abcd'[ii]] === item.answer) ? 'right' : 'wrong';
};
const matches = (filter, status) => filter === 'all' || filter === status;
const tfLabel = (v) => (v === 'dung' ? 'Đúng' : v === 'sai' ? 'Sai' : '—');

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

function StatTile({ status, value }) {
  const t = TONE[status];
  return (
    <div className="rounded-xl border border-slate-200 px-4 py-3">
      <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center ${t.soft}`}>
        <span className="material-symbols-outlined text-[1rem] font-bold">{t.icon}</span>
      </span>
      <strong className={`block text-2xl font-bold mt-1.5 ${t.text}`}>{value}</strong>
      <span className="text-xs text-slate-500 whitespace-nowrap">{t.label}</span>
    </div>
  );
}

// Thống kê câu đúng / sai / chưa làm: "Xem" để lọc, ấn số câu để tới câu đó
function StatsPanel({ groups, filter, onFilter, onJump }) {
  const rows = [['right', 'Câu đúng'], ['wrong', 'Câu sai'], ['blank', 'Chưa làm']]
    .map(([st, label]) => ({ st, label, parts: groups.map((g) => ({ ...g, nums: g.statuses.map((s, i) => (s === st ? i : -1)).filter((i) => i >= 0) })) }))
    .map((r) => ({ ...r, count: r.parts.reduce((n, g) => n + g.nums.length, 0) }))
    .filter((r) => r.st !== 'blank' || r.count > 0);
  return (
    <aside className="bg-white rounded-2xl border border-slate-200 text-sm">
      <h2 className="px-5 pt-4 pb-3 font-bold text-slate-900">Thống kê câu đúng / sai</h2>
      {rows.map((r) => (
        <div key={r.st} className={`px-5 py-3.5 border-t border-slate-100 ${filter === r.st ? 'bg-slate-50' : ''}`}>
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className={`font-semibold ${TONE[r.st].text}`}>{r.label} ({r.count})</span>
            {r.count > 0 && (
              <button type="button" onClick={() => onFilter(filter === r.st ? 'all' : r.st)} className="text-xs font-semibold text-primary hover:underline">
                {filter === r.st ? 'Bỏ lọc' : 'Xem'}
              </button>
            )}
          </div>
          {r.count === 0 && <p className="text-slate-400">Không có</p>}
          {r.parts.filter((g) => g.nums.length).map((g) => (
            <p key={g.key} className={`leading-relaxed font-medium ${TONE[r.st].text}`}>
              {groups.length > 1 && <span className="text-slate-400 font-normal">{g.title}: </span>}
              {g.nums.map((i, k) => (
                <React.Fragment key={i}>
                  {k > 0 && ', '}
                  <button type="button" onClick={() => onJump(g.key, i)} className="hover:underline">{i + 1}</button>
                </React.Fragment>
              ))}
            </p>
          ))}
        </div>
      ))}
    </aside>
  );
}

// Một phần của đề (Trắc nghiệm, Đúng/Sai, Tự luận): các câu xếp liền trong một khung
function Part({ title, summary, children }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-baseline justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {summary && <span className="text-sm text-slate-500">{summary}</span>}
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </section>
  );
}

function Question({ id, number, points, status, focused, stem, children }) {
  const t = status ? TONE[status] : null;
  return (
    <article id={id} className={`scroll-mt-6 px-5 sm:px-6 py-5 flex gap-4 ${focused ? 'bg-primary/5' : ''}`}>
      <span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${t ? t.solid : 'bg-primary/10 text-primary'}`}>{number}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-[0.9375rem] leading-relaxed text-slate-800 whitespace-pre-line pt-1">{stem}</p>
          <span className="shrink-0 flex items-center gap-2 pt-1.5 text-xs">
            {points ? <span className="text-slate-400">{points} điểm</span> : null}
            {t && <span className={`font-semibold ${t.text}`}>{t.label}</span>}
          </span>
        </div>
        {children}
      </div>
    </article>
  );
}

function QuizOptions({ q, picked }) {
  return (
    <div className="grid sm:grid-cols-2 gap-x-3 gap-y-1.5">
      {(q.options || []).map((opt, i) => {
        const isCorrect = i === q.correct_index;
        const isPicked = i === picked;
        const cls = isCorrect ? TONE.right.soft : isPicked ? TONE.wrong.soft : 'text-slate-600';
        return (
          <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${cls}`}>
            <b className="shrink-0">{LETTERS[i]}.</b>
            <span className={`min-w-0 flex-1 ${isCorrect || isPicked ? 'font-semibold' : ''}`}>{opt}</span>
            {isPicked && <span className="text-xs font-semibold shrink-0">Bạn chọn</span>}
            {isCorrect && !isPicked && <span className="text-xs font-semibold shrink-0">Đáp án đúng</span>}
          </div>
        );
      })}
      {(picked === undefined || picked === null) && <p className="sm:col-span-2 text-xs text-amber-700 px-3 pt-1">Bạn chưa chọn đáp án câu này.</p>}
    </div>
  );
}

function TfRows({ q, picks }) {
  const cols = 'grid grid-cols-[minmax(0,1fr)_5rem_5rem] gap-3 items-center px-3';
  return (
    <div className="text-sm">
      <div className={`${cols} pb-1.5 text-xs font-semibold text-slate-400`}>
        <span>Mệnh đề</span><span className="text-center">Bạn chọn</span><span className="text-center">Đáp án</span>
      </div>
      {(q.items || []).map((item, ii) => {
        const letter = 'abcd'[ii];
        const mine = picks?.[letter];
        const tone = !mine ? TONE.blank : mine === item.answer ? TONE.right : TONE.wrong;
        return (
          <div key={letter} className={`${cols} py-2 rounded-lg odd:bg-slate-50`}>
            <span className="min-w-0 text-slate-700"><b className="text-slate-900 mr-1">{letter})</b>{item.text}</span>
            <span className={`text-center font-semibold ${tone.text}`}>{tfLabel(mine)}</span>
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
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    if (focus) document.getElementById(`cau-${focus}`)?.scrollIntoView({ block: 'start' });
  }, [focus]);

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
  const visible = (key, list) => list.map((_, i) => i).filter((i) => matches(filter, status(key, i)));
  const shownQuiz = quizQs.length ? visible('q', quizQs) : [];
  const shownTf = tfQs.length ? visible('t', tfQs) : [];
  const rightIn = (key, list) => list.filter((_, i) => status(key, i) === 'right').length;
  const partLabel = (n, name) => (type === 3 ? `Phần ${n}. ${name}` : name);

  const changeFilter = (v) => { setFilter(v); setFocus(null); };
  const jump = (key, i) => { setFilter('all'); setFocus(`${key}${i}`); };

  return (
    <MainLayout hideChatbot>
      <div className="min-h-screen bg-[#F5F7FA] py-8 px-4">
        <div className={`${counts.all ? 'max-w-6xl' : 'max-w-4xl'} mx-auto space-y-5`}>
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
                  <div className="grid grid-cols-3 gap-3 md:w-[22rem] shrink-0">
                    <StatTile status="right" value={counts.right} />
                    <StatTile status="wrong" value={counts.wrong} />
                    <StatTile status="blank" value={counts.blank} />
                  </div>
                )}
              </section>

              <div className={counts.all ? 'grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-5 items-start' : ''}>
                {counts.all > 0 && (
                  <div className="lg:order-last lg:sticky lg:top-6">
                    <StatsPanel groups={groups} filter={filter} onFilter={changeFilter} onJump={jump} />
                  </div>
                )}

                <div className="space-y-5 min-w-0">
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

                  {shownQuiz.length > 0 && (
                    <Part title={partLabel('I', 'Trắc nghiệm')} summary={`${rightIn('q', quizQs)}/${quizQs.length} câu đúng`}>
                      {shownQuiz.map((i) => (
                        <Question key={`q${i}`} id={`cau-q${i}`} number={i + 1} points={quizQs[i].points} status={status('q', i)} focused={focus === `q${i}`} stem={quizQs[i].question_text || quizQs[i].question}>
                          <QuizOptions q={quizQs[i]} picked={quizPicks[i]} />
                        </Question>
                      ))}
                    </Part>
                  )}

                  {shownTf.length > 0 && (
                    <Part title={partLabel(quizQs.length ? 'II' : 'I', 'Đúng / Sai')} summary={`${rightIn('t', tfQs)}/${tfQs.length} câu đúng`}>
                      {shownTf.map((i) => (
                        <Question key={`t${i}`} id={`cau-t${i}`} number={i + 1} status={status('t', i)} focused={focus === `t${i}`} stem={tfQs[i].stem || tfQs[i].question_text}>
                          <TfRows q={tfQs[i]} picks={tfPicks[i]} />
                        </Question>
                      ))}
                    </Part>
                  )}

                  {counts.all > 0 && !shownQuiz.length && !shownTf.length && (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Không có câu nào.</div>
                  )}

                  {filter === 'all' && essayQs.length > 0 && (
                    <Part title={partLabel(['I', 'II', 'III'][groups.length], 'Tự luận')} summary={`${essayQs.length} câu`}>
                      {essayQs.map((q, i) => (
                        <Question key={`e${i}`} id={`cau-e${i}`} number={i + 1} points={q.points} stem={q.question_text}>
                          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-line min-h-[3rem]">{answers?.essay?.[i] || 'Không có bài làm.'}</div>
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
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
