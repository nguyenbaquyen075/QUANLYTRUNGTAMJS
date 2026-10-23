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
  right: { label: 'Đúng', icon: 'check_circle', pill: 'bg-[#ECFDF3] text-[#067647]', box: 'bg-[#F6FEF9] border-[#75E0A7]', solid: 'bg-[#17B26A] border-[#17B26A] text-white', text: 'text-[#067647]' },
  wrong: { label: 'Sai', icon: 'cancel', pill: 'bg-red-50 text-red-700', box: 'bg-red-50/60 border-red-300', solid: 'bg-red-500 border-red-500 text-white', text: 'text-red-600' },
  blank: { label: 'Chưa làm', icon: 'radio_button_unchecked', pill: 'bg-slate-100 text-slate-600', box: 'border-slate-200', solid: 'bg-white border-slate-300 text-slate-500', text: 'text-slate-400' },
};

const quizStatus = (q, picked) => (picked === undefined || picked === null ? 'blank' : picked === q.correct_index ? 'right' : 'wrong');
// Câu Đúng/Sai chỉ tính là đúng khi mọi ý đều đúng
const tfStatus = (q, picks) => {
  const items = q.items || [];
  if (!items.length || items.every((_, ii) => !picks?.['abcd'[ii]])) return 'blank';
  return items.every((item, ii) => picks?.['abcd'[ii]] === item.answer) ? 'right' : 'wrong';
};
const matches = (filter, status) => filter === 'all' || (filter === 'right' ? status === 'right' : status !== 'right');
const tfLabel = (v) => (v === 'dung' ? 'Đúng' : v === 'sai' ? 'Sai' : 'Chưa chọn');

function StatusPill({ status }) {
  const t = TONE[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${t.pill}`}>
      <span className="material-symbols-outlined text-[1rem]">{t.icon}</span>{t.label}
    </span>
  );
}

function QuestionCard({ id, number, points, status, focused, stem, children }) {
  return (
    <article id={id} className={`scroll-mt-6 bg-white rounded-2xl border p-5 sm:p-6 ${focused ? 'border-primary ring-4 ring-primary/10' : 'border-slate-200'}`}>
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

// Bảng câu hỏi bên phải: lọc câu đúng / chưa đúng, ấn số câu để tới câu đó
function AnswerSheet({ groups, counts, filter, onFilter, focus, onJump }) {
  const tabs = [['all', 'Tất cả', counts.all], ['right', 'Đúng', counts.right], ['wrong', 'Chưa đúng', counts.wrong + counts.blank]];
  return (
    <aside className="bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="text-sm font-bold text-slate-900 mb-3">Bảng câu hỏi</h2>
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mb-5" role="tablist" aria-label="Lọc câu hỏi">
        {tabs.map(([v, label, n]) => (
          <button key={v} type="button" role="tab" aria-selected={filter === v} onClick={() => onFilter(v)}
            className={`rounded-lg py-1.5 text-xs font-semibold ${filter === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            {label} <span className={filter === v ? 'text-primary' : 'text-slate-400'}>{n}</span>
          </button>
        ))}
      </div>
      {groups.map((g) => (
        <div key={g.key} className="mb-5 last:mb-0">
          {groups.length > 1 && <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-slate-400 mb-2">{g.title}</p>}
          <div className="grid grid-cols-5 gap-2">
            {g.statuses.map((st, i) => (
              <button key={i} type="button" onClick={() => onJump(g.key, i)} aria-label={`Câu ${i + 1}: ${TONE[st].label}`}
                className={`h-9 rounded-lg border text-sm font-bold ${TONE[st].solid} ${focus === `${g.key}${i}` ? 'ring-2 ring-primary ring-offset-2' : ''} ${matches(filter, st) ? '' : 'opacity-25'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
        {['right', 'wrong', 'blank'].map((st) => (
          <span key={st} className="inline-flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded border ${TONE[st].solid}`} />{TONE[st].label}
          </span>
        ))}
      </div>
    </aside>
  );
}

function Stat({ label, value, className = 'text-slate-900' }) {
  return (
    <div>
      <span className="block text-xs font-medium text-slate-500">{label}</span>
      <strong className={`text-lg font-bold ${className}`}>{value}</strong>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
        <span className="material-symbols-outlined text-[1.25rem] text-primary">{icon}</span>{title}
      </h2>
      {children}
    </section>
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
  const graded = sub?.Grade !== null && sub?.Grade !== undefined;

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

  const sectionHead = (title, right) => (
    <div className="flex items-baseline justify-between gap-3 pt-2">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <span className="text-sm text-slate-500">{right}</span>
    </div>
  );

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
              {/* Tổng quan */}
              <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold">
                      <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full">{KIND[type] || 'Bài tập'}</span>
                      {sub
                        ? <span className="text-slate-500">Nộp lúc {new Date(sub.SubmittedAt).toLocaleString('vi-VN')}</span>
                        : <span className="text-amber-700">Bạn chưa nộp bài này</span>}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-3 leading-snug">{assignment.Title}</h1>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <span className="block text-xs font-semibold text-slate-500">Điểm số</span>
                    <strong className="text-4xl font-bold text-primary">{graded ? Number(sub.Grade).toFixed(1) : '–'}</strong>
                    <span className="text-base font-semibold text-slate-400">/10</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{graded ? 'Đã chấm' : 'Chưa chấm'}</span>
                  </div>
                </div>
                {counts.all > 0 && (
                  <div className="border-t border-slate-100 bg-slate-50/70 px-5 sm:px-6 py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <Stat label="Tổng số câu" value={counts.all} />
                      <Stat label="Đúng" value={counts.right} className={TONE.right.text} />
                      <Stat label="Sai" value={counts.wrong} className={TONE.wrong.text} />
                      <Stat label="Chưa làm" value={counts.blank} className="text-slate-500" />
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-slate-200 mt-4" aria-hidden="true">
                      <span className="bg-[#17B26A]" style={{ width: `${(counts.right / counts.all) * 100}%` }} />
                      <span className="bg-red-500" style={{ width: `${(counts.wrong / counts.all) * 100}%` }} />
                    </div>
                  </div>
                )}
              </section>

              <div className={counts.all ? 'grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-5 items-start' : ''}>
                {counts.all > 0 && (
                  <div className="lg:order-last lg:sticky lg:top-6">
                    <AnswerSheet groups={groups} counts={counts} filter={filter} onFilter={changeFilter} focus={focus} onJump={jump} />
                  </div>
                )}

                <div className="space-y-4 min-w-0">
                  <Card title="Nhận xét của giáo viên" icon="rate_review">
                    <p className="text-sm text-slate-700 whitespace-pre-line">{sub?.TeacherComment || 'Chưa có nhận xét.'}</p>
                  </Card>

                  {(assignment.Instruction || assignment.AttachmentUrl) && (
                    <Card title="Đề bài và yêu cầu" icon="description">
                      {assignment.Instruction && <div className="text-sm text-slate-700 whitespace-pre-line">{assignment.Instruction}</div>}
                      {assignment.AttachmentUrl && (
                        <a href={assignment.AttachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-primary mt-3">
                          <span className="material-symbols-outlined text-base">download</span> Tải đề bài
                        </a>
                      )}
                    </Card>
                  )}

                  {shownQuiz.length > 0 && (
                    <>
                      {sectionHead(partLabel('I', 'Trắc nghiệm'), `${rightIn('q', quizQs)}/${quizQs.length} câu đúng`)}
                      {shownQuiz.map((i) => (
                        <QuestionCard key={`q${i}`} id={`cau-q${i}`} number={i + 1} points={quizQs[i].points} status={status('q', i)} focused={focus === `q${i}`} stem={quizQs[i].question_text || quizQs[i].question}>
                          <QuizOptions q={quizQs[i]} picked={quizPicks[i]} />
                          {status('q', i) === 'blank' && <p className="text-xs text-amber-700 mt-3">Bạn chưa chọn đáp án câu này.</p>}
                        </QuestionCard>
                      ))}
                    </>
                  )}

                  {shownTf.length > 0 && (
                    <>
                      {sectionHead(partLabel(quizQs.length ? 'II' : 'I', 'Đúng / Sai'), `${rightIn('t', tfQs)}/${tfQs.length} câu đúng`)}
                      {shownTf.map((i) => (
                        <QuestionCard key={`t${i}`} id={`cau-t${i}`} number={i + 1} status={status('t', i)} focused={focus === `t${i}`} stem={tfQs[i].stem || tfQs[i].question_text}>
                          <TfRows q={tfQs[i]} picks={tfPicks[i]} />
                        </QuestionCard>
                      ))}
                    </>
                  )}

                  {counts.all > 0 && !shownQuiz.length && !shownTf.length && (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                      {filter === 'right' ? 'Bạn chưa làm đúng câu nào.' : 'Bạn đã làm đúng tất cả các câu.'}
                    </div>
                  )}

                  {filter === 'all' && essayQs.length > 0 && (
                    <>
                      {sectionHead(partLabel(['I', 'II', 'III'][groups.length], 'Tự luận'), `${essayQs.length} câu`)}
                      {essayQs.map((q, i) => (
                        <QuestionCard key={`e${i}`} id={`cau-e${i}`} number={i + 1} points={q.points} stem={q.question_text}>
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-line min-h-[3rem]">{answers?.essay?.[i] || 'Không có bài làm.'}</div>
                        </QuestionCard>
                      ))}
                    </>
                  )}

                  {type === 1 && (
                    <Card title="Bài làm của bạn" icon="edit_note">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-line min-h-[5rem]">{sub?.Content || 'Không có nội dung.'}</div>
                    </Card>
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
