import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFetchData } from '../../hooks/useFetchData';
import api from '../../services/api';

const EXAM_TYPE_OPTIONS = [
  { value: '15MIN', label: '⏱ Kiểm tra 15 phút' },
  { value: '45MIN', label: '📄 Kiểm tra 1 tiết (45 phút)' },
  { value: 'SEMESTER', label: '🎓 Thi học kỳ' },
  { value: 'OTHER', label: '📌 Khác' },
];

const SECTION_META = {
  tn: { label: 'Trắc nghiệm', sub: 'PHẦN I', accent: 'sky' },
  ds: { label: 'Đúng / Sai', sub: 'PHẦN II', accent: 'emerald' },
  tl: { label: 'Tự luận', sub: 'PHẦN III', accent: 'amber' },
};

const accentClasses = {
  sky: { chipActive: 'border-sky-500 bg-sky-50', text: 'text-sky-700', badge: 'bg-sky-600', ring: 'border-sky-200' },
  emerald: { chipActive: 'border-emerald-500 bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-600', ring: 'border-emerald-200' },
  amber: { chipActive: 'border-amber-500 bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-600', ring: 'border-amber-200' },
};

const toRoman = (n) => ['I', 'II', 'III', 'IV', 'V'][n - 1] || String(n);

const STEPS = [
  { key: 1, label: 'Thông tin chung' },
  { key: 2, label: 'Soạn câu hỏi' },
  { key: 3, label: 'Xem lại & Xuất bản' },
];

const defaultOpenAt = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const defaultDueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

function StepIndicator({ step }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                step === s.key ? 'bg-primary text-white' : step > s.key ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step > s.key ? <span className="material-symbols-outlined text-[18px]">check</span> : s.key}
            </div>
            <span className={`text-sm font-bold hidden sm:inline ${step === s.key ? 'text-primary' : step > s.key ? 'text-emerald-600' : 'text-slate-400'}`}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 min-w-6 ${step > s.key ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function CreateExamPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { data } = useFetchData(`/Teacher/CreateExam/${classId}`);
  const cls = data?.cls || null;

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState('45MIN');
  const [openAt, setOpenAt] = useState(defaultOpenAt());
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(45);
  const [allowMultipleAttempts, setAllowMultipleAttempts] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [activeSections, setActiveSections] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [tfQuestions, setTfQuestions] = useState([]);
  const [essayQuestions, setEssayQuestions] = useState([]);

  const inputCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none transition-colors';
  const labelCls = 'block text-sm font-bold text-slate-700 mb-1.5';

  // ---- Quiz (trắc nghiệm) ----
  const addQuizQuestion = () => setQuizQuestions((prev) => [...prev, { question_text: '', options: ['', '', '', ''], correct_index: 0, points: 1 }]);
  const removeQuizQuestion = (i) => setQuizQuestions((prev) => prev.filter((_, idx) => idx !== i));
  const updateQuizField = (i, field, value) => setQuizQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, [field]: value } : q)));
  const updateQuizOption = (i, oi, value) => setQuizQuestions((prev) => prev.map((q, idx) => {
    if (idx !== i) return q;
    const options = [...q.options];
    options[oi] = value;
    return { ...q, options };
  }));

  // ---- True/False (đúng sai) ----
  const emptyTfQuestion = () => ({
    stem: '',
    items: [
      { text: '', answer: null, points: 0.25 },
      { text: '', answer: null, points: 0.25 },
      { text: '', answer: null, points: 0.25 },
      { text: '', answer: null, points: 0.25 },
    ],
  });
  const addTfQuestion = () => setTfQuestions((prev) => [...prev, emptyTfQuestion()]);
  const removeTfQuestion = (i) => setTfQuestions((prev) => prev.filter((_, idx) => idx !== i));
  const updateTfStem = (i, value) => setTfQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, stem: value } : q)));
  const updateTfItem = (i, ii, field, value) => setTfQuestions((prev) => prev.map((q, idx) => {
    if (idx !== i) return q;
    const items = q.items.map((item, itemIdx) => (itemIdx === ii ? { ...item, [field]: value } : item));
    return { ...q, items };
  }));

  // ---- Essay (tự luận) ----
  const addEssayQuestion = () => setEssayQuestions((prev) => [...prev, { question_text: '', points: 1 }]);
  const removeEssayQuestion = (i) => setEssayQuestions((prev) => prev.filter((_, idx) => idx !== i));
  const updateEssayField = (i, field, value) => setEssayQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, [field]: value } : q)));

  // ---- Drag reorder (chỉ trong từng phần) ----
  const dragIndexRef = React.useRef(null);
  const reorder = (list, from, to) => {
    const copy = [...list];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    return copy;
  };
  const handleDrop = (setList, list, dropIndex) => {
    const from = dragIndexRef.current;
    if (from === null || from === dropIndex) return;
    setList(reorder(list, from, dropIndex));
    dragIndexRef.current = null;
  };

  const toggleSection = (type) => {
    const isActive = activeSections.includes(type);
    if (isActive) {
      setActiveSections((prev) => prev.filter((t) => t !== type));
    } else {
      setActiveSections((prev) => [...prev, type]);
      if (type === 'tn' && quizQuestions.length === 0) addQuizQuestion();
      if (type === 'ds' && tfQuestions.length === 0) addTfQuestion();
      if (type === 'tl' && essayQuestions.length === 0) addEssayQuestion();
    }
  };

  const summaryParts = activeSections.map((type, idx) => {
    const meta = SECTION_META[type];
    let count = 0;
    let pts = 0;
    if (type === 'tn') { count = quizQuestions.length; quizQuestions.forEach((q) => { pts += parseFloat(q.points || 0); }); }
    else if (type === 'ds') { count = tfQuestions.length; tfQuestions.forEach((q) => q.items.forEach((it) => { pts += parseFloat(it.points || 0); })); }
    else { count = essayQuestions.length; essayQuestions.forEach((q) => { pts += parseFloat(q.points || 0); }); }
    return { label: `Phần ${toRoman(idx + 1)}: ${meta.label}`, count, pts, accent: meta.accent };
  });
  const totalPoints = summaryParts.reduce((sum, p) => sum + p.pts, 0);

  const step1Valid = !!title && !!dueDate && !!openAt && !!examType && !!timeLimitMinutes;
  const step2Valid = activeSections.length > 0;

  const buildFormData = (statusValue) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('examType', examType);
    formData.append('dueDate', dueDate);
    formData.append('openAt', openAt);
    formData.append('timeLimitMinutes', timeLimitMinutes);
    formData.append('allowMultipleAttempts', allowMultipleAttempts ? 'true' : 'false');
    formData.append('instruction', instruction);
    formData.append('status', statusValue);
    if (attachment) formData.append('attachment', attachment);

    let assignmentType;
    if (activeSections.length === 1) {
      const t = activeSections[0];
      if (t === 'tn') {
        assignmentType = 'QUIZ';
        formData.append('quizQuestions', JSON.stringify(quizQuestions));
      } else if (t === 'ds') {
        assignmentType = 'TRUE_FALSE';
        formData.append('trueFalseQuestions', JSON.stringify(tfQuestions));
      } else {
        assignmentType = 'ESSAY';
        formData.append('examData', JSON.stringify({ essay: essayQuestions }));
      }
    } else {
      assignmentType = 'EXAM';
      formData.append('examData', JSON.stringify({
        sectionOrder: activeSections,
        quiz: activeSections.includes('tn') ? quizQuestions : [],
        tf: activeSections.includes('ds') ? tfQuestions : [],
        essay: activeSections.includes('tl') ? essayQuestions : [],
      }));
    }
    formData.append('assignmentType', assignmentType);
    return formData;
  };

  const handlePublish = async (statusValue) => {
    if (activeSections.length === 0) {
      alert('Vui lòng chọn ít nhất 1 phần câu hỏi.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = buildFormData(statusValue);
      await api.post(`/Teacher/CreateExam/${classId}`, formData, { headers: { 'Content-Type': undefined } });
      alert(statusValue === 'draft' ? 'Đã lưu nháp bài kiểm tra!' : 'Xuất bản bài kiểm tra thành công!');
      navigate('/Teacher/Dashboard');
    } catch (err) {
      alert('Đã xảy ra lỗi khi tạo bài kiểm tra.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-800 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex justify-between items-end mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black font-serif text-slate-900 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-3xl">fact_check</span> Tạo Bài Kiểm Tra Lớn
            </h1>
            {cls && (
              <div className="flex items-center gap-2.5 text-sm text-slate-500 font-semibold mt-2">
                <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">groups</span> Lớp: <strong className="text-slate-700">{cls.ClassName}</strong></span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">menu_book</span> Môn: <strong className="text-slate-700">{cls.Course ? cls.Course.Title : ''}</strong></span>
              </div>
            )}
          </div>
          <Link to="/Teacher/Dashboard" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary no-underline px-4 py-2 rounded-xl border border-slate-200 hover:border-primary/40 transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Trở Về
          </Link>
        </div>

        <StepIndicator step={step} />

        {/* ============ BƯỚC 1: THÔNG TIN CHUNG ============ */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 space-y-6">
            <div>
              <label className={labelCls}>Tiêu đề bài kiểm tra</label>
              <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Kiểm tra 1 tiết - Chương 1: Hàm số và Đồ thị" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Hình thức kiểm tra</label>
                <div className="relative">
                  <select required value={examType} onChange={(e) => setExamType(e.target.value)} className={`appearance-none bg-none pr-8 ${inputCls}`}>
                    {EXAM_TYPE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                </div>
              </div>
              <div>
                <label className={labelCls}>Thời gian làm bài (phút)</label>
                <input required type="number" min="1" value={timeLimitMinutes} onChange={(e) => setTimeLimitMinutes(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Ngày giờ mở bài</label>
                <input required type="datetime-local" value={openAt} onChange={(e) => setOpenAt(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Ngày giờ đóng bài</label>
                <input required type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
                {openAt && dueDate && new Date(dueDate) <= new Date(openAt) && (
                  <p className="text-xs text-red-500 font-semibold mt-1">Giờ đóng bài phải sau giờ mở bài.</p>
                )}
              </div>
            </div>

            <div>
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={allowMultipleAttempts} onChange={(e) => setAllowMultipleAttempts(e.target.checked)} className="w-4 h-4" />
                <span className={labelCls + ' mb-0'}>Cho phép làm lại nhiều lần</span>
              </label>
              {allowMultipleAttempts && (
                <p className="text-xs text-amber-600 font-semibold mt-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  Điểm chính thức luôn tính theo lần nộp đầu tiên. Các lần sau chỉ để học viên luyện tập.
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>Hướng dẫn / Ghi chú chung cho bài thi</label>
              <textarea
                rows={3}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Ví dụ: Học sinh làm bài trong vòng 45 phút, không được sử dụng tài liệu..."
                className={`${inputCls} resize-y mb-2`}
              />
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">attach_file</span> Đính kèm đề thi (PDF...)
                  <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={(e) => setAttachment(e.target.files?.[0] || null)} className="hidden" />
                </label>
                <span className="text-xs text-slate-500 font-semibold">
                  {attachment ? `${attachment.name} (${(attachment.size / (1024 * 1024)).toFixed(2)} MB)` : 'Chưa đính kèm'}
                </span>
                {attachment && (
                  <button type="button" onClick={() => setAttachment(null)} className="text-xs font-bold text-red-500">Hủy</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============ BƯỚC 2: SOẠN CÂU HỎI ============ */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 sticky top-0 bg-white z-10 pb-3 -mt-1 border-b border-slate-100">
              <div>
                <label className={labelCls + ' mb-1'}>Cấu trúc đề kiểm tra</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(SECTION_META).map(([type, meta]) => {
                    const isActive = activeSections.includes(type);
                    const accent = accentClasses[meta.accent];
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => toggleSection(type)}
                        className={`flex items-center justify-between gap-2 border-2 rounded-xl px-4 py-3.5 text-left transition-all ${
                          isActive ? accent.chipActive : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className={`text-sm font-bold ${isActive ? accent.text : 'text-slate-700'}`}>{meta.label}</div>
                          <div className={`text-[11px] font-semibold uppercase tracking-wide ${isActive ? accent.text : 'text-slate-400'}`}>{meta.sub}</div>
                        </div>
                        {isActive && (
                          <span className={`w-6 h-6 rounded-full ${accent.badge} text-white flex items-center justify-center text-xs font-black shrink-0`}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 font-bold block uppercase">Tổng điểm</span>
                <span className="text-2xl font-black text-primary">{totalPoints.toFixed(2)}đ</span>
              </div>
            </div>

            {activeSections.length === 0 && (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl py-10 px-6 text-center">
                <span className="material-symbols-outlined text-slate-300 text-4xl block mb-2">quiz</span>
                <h3 className="font-bold text-slate-700 mb-1">Chưa chọn loại câu hỏi nào</h3>
                <p className="text-sm text-slate-400">Vui lòng chọn các phần cấu trúc đề kiểm tra phía trên để bắt đầu tạo nội dung chi tiết cho bài kiểm tra của bạn.</p>
              </div>
            )}

            {/* ===== BUILDER: TRẮC NGHIỆM ===== */}
            {activeSections.includes('tn') && (
              <div className="border border-sky-200 rounded-2xl overflow-hidden">
                <div className="bg-sky-50 px-5 py-3 flex items-center gap-2 font-bold text-sky-800 text-sm border-b border-sky-200">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Phần {toRoman(activeSections.indexOf('tn') + 1)}: Trắc nghiệm (A/B/C/D)
                </div>
                <div className="p-5 space-y-3">
                  {quizQuestions.length === 0 && <p className="text-sm text-slate-400 text-center py-2">Chưa thêm câu hỏi trắc nghiệm nào.</p>}
                  {quizQuestions.map((q, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={() => { dragIndexRef.current = i; }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(setQuizQuestions, quizQuestions, i)}
                      className="border border-slate-200 rounded-xl p-4 bg-white cursor-move"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-300 text-[18px]">drag_indicator</span>
                          <strong className="text-sky-700 text-sm">TN Câu {i + 1}</strong>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-500">Điểm:</span>
                            <input type="number" min="0.25" max="10" step="0.25" value={q.points} onChange={(e) => updateQuizField(i, 'points', parseFloat(e.target.value) || 0)} className="w-16 px-2 py-1 text-center text-sm font-bold border border-slate-200 rounded-lg" />
                          </div>
                        </div>
                        <button type="button" onClick={() => removeQuizQuestion(i)} className="text-red-500"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                      <textarea required rows={2} value={q.question_text} onChange={(e) => updateQuizField(i, 'question_text', e.target.value)} placeholder="Nội dung câu hỏi..." className={`${inputCls} mb-3 resize-y`} />
                      <div className="grid grid-cols-2 gap-3">
                        {['A', 'B', 'C', 'D'].map((ltr, oi) => (
                          <div key={ltr} className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                              <input type="radio" name={`correct_${i}`} checked={q.correct_index === oi} onChange={() => updateQuizField(i, 'correct_index', oi)} className="w-4 h-4" />
                              <span className="font-bold text-sky-700 text-sm">{ltr}.</span>
                            </label>
                            <input required type="text" value={q.options[oi]} onChange={(e) => updateQuizOption(i, oi, e.target.value)} placeholder={`Đáp án ${ltr}`} className={inputCls} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addQuizQuestion} className="w-full py-2.5 border-2 border-dashed border-sky-300 text-sky-700 font-bold text-sm rounded-xl hover:bg-sky-50">
                    + Thêm câu trắc nghiệm
                  </button>
                </div>
              </div>
            )}

            {/* ===== BUILDER: ĐÚNG/SAI ===== */}
            {activeSections.includes('ds') && (
              <div className="border border-emerald-200 rounded-2xl overflow-hidden">
                <div className="bg-emerald-50 px-5 py-3 flex items-center gap-2 font-bold text-emerald-800 text-sm border-b border-emerald-200">
                  <span className="material-symbols-outlined text-[18px]">toggle_on</span>
                  Phần {toRoman(activeSections.indexOf('ds') + 1)}: Đúng / Sai
                </div>
                <div className="p-5 space-y-3">
                  {tfQuestions.length === 0 && <p className="text-sm text-slate-400 text-center py-2">Chưa thêm câu hỏi Đúng/Sai nào.</p>}
                  {tfQuestions.map((q, i) => {
                    const totalPts = q.items.reduce((sum, it) => sum + (parseFloat(it.points) || 0), 0);
                    return (
                      <div
                        key={i}
                        draggable
                        onDragStart={() => { dragIndexRef.current = i; }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(setTfQuestions, tfQuestions, i)}
                        className="border border-slate-200 rounded-xl p-4 bg-white cursor-move"
                      >
                        <div className="flex justify-between items-center mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-slate-300 text-[18px]">drag_indicator</span>
                            <strong className="text-emerald-700 text-sm">ĐS Câu {i + 1}</strong>
                            <span className="text-xs font-semibold text-slate-500">Tổng điểm: <strong className="text-emerald-700">{totalPts.toFixed(2)}đ</strong></span>
                          </div>
                          <button type="button" onClick={() => removeTfQuestion(i)} className="text-red-500 text-xs font-bold inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">delete</span> Xóa
                          </button>
                        </div>
                        <textarea required rows={1} value={q.stem} onChange={(e) => updateTfStem(i, e.target.value)} placeholder="Câu dẫn..." className={`${inputCls} mb-2.5`} />
                        <div className="space-y-2">
                          {['a', 'b', 'c', 'd'].map((letter, ii) => (
                            <div key={letter} className="flex items-center gap-2.5 border border-slate-100 bg-slate-50 rounded-lg px-3 py-2">
                              <span className="w-6 h-6 shrink-0 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">{letter}</span>
                              <input required type="text" value={q.items[ii].text} onChange={(e) => updateTfItem(i, ii, 'text', e.target.value)} placeholder={`Ý ${letter}...`} className={`${inputCls} flex-1`} />
                              <button
                                type="button"
                                onClick={() => updateTfItem(i, ii, 'answer', 'dung')}
                                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg shrink-0 ${q.items[ii].answer === 'dung' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}
                              >
                                ✓ Đúng
                              </button>
                              <button
                                type="button"
                                onClick={() => updateTfItem(i, ii, 'answer', 'sai')}
                                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg shrink-0 ${q.items[ii].answer === 'sai' ? 'bg-red-500 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}
                              >
                                ✗ Sai
                              </button>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[11px] font-semibold text-slate-400">Điểm</span>
                                <input type="number" min="0" max="10" step="0.25" value={q.items[ii].points} onChange={(e) => updateTfItem(i, ii, 'points', parseFloat(e.target.value) || 0)} className="w-14 px-1.5 py-1 text-center text-xs font-bold border border-slate-200 rounded-lg" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <button type="button" onClick={addTfQuestion} className="w-full py-2.5 border-2 border-dashed border-emerald-300 text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-50">
                    + Thêm câu Đúng/Sai
                  </button>
                </div>
              </div>
            )}

            {/* ===== BUILDER: TỰ LUẬN ===== */}
            {activeSections.includes('tl') && (
              <div className="border border-amber-200 rounded-2xl overflow-hidden">
                <div className="bg-amber-50 px-5 py-3 flex items-center gap-2 font-bold text-amber-800 text-sm border-b border-amber-200">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  Phần {toRoman(activeSections.indexOf('tl') + 1)}: Tự luận
                </div>
                <div className="p-5 space-y-3">
                  {essayQuestions.length === 0 && <p className="text-sm text-slate-400 text-center py-2">Chưa thêm câu tự luận nào.</p>}
                  {essayQuestions.map((q, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={() => { dragIndexRef.current = i; }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(setEssayQuestions, essayQuestions, i)}
                      className="border border-slate-200 rounded-xl p-4 bg-white cursor-move"
                    >
                      <div className="flex justify-between items-center mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-300 text-[18px]">drag_indicator</span>
                          <strong className="text-amber-700 text-sm">TL Câu {i + 1}</strong>
                        </div>
                        <button type="button" onClick={() => removeEssayQuestion(i)} className="text-red-500"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <textarea required rows={1} value={q.question_text} onChange={(e) => updateEssayField(i, 'question_text', e.target.value)} placeholder="Nội dung câu tự luận..." className={`${inputCls} flex-1`} />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-semibold text-slate-500">Điểm:</span>
                          <input type="number" min="0.25" max="10" step="0.25" value={q.points} onChange={(e) => updateEssayField(i, 'points', parseFloat(e.target.value) || 0)} className="w-16 px-2 py-1 text-center text-sm font-bold border border-slate-200 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addEssayQuestion} className="w-full py-2.5 border-2 border-dashed border-amber-300 text-amber-700 font-bold text-sm rounded-xl hover:bg-amber-50">
                    + Thêm câu tự luận
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ BƯỚC 3: XEM LẠI & XUẤT BẢN ============ */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 space-y-6">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              Xem trước — đúng như giao diện học viên sẽ thấy
            </div>

            <div className="border-b border-slate-100 pb-5 space-y-1.5">
              <h2 className="text-xl font-black font-serif text-slate-900">{title || '(Chưa có tiêu đề)'}</h2>
              <p className="text-sm text-slate-500 font-semibold">
                {EXAM_TYPE_OPTIONS.find((o) => o.value === examType)?.label} · {timeLimitMinutes} phút làm bài
              </p>
              <p className="text-sm text-slate-500">
                Mở bài: <strong className="text-slate-700">{openAt ? new Date(openAt).toLocaleString('vi-VN') : '—'}</strong> · Đóng bài: <strong className="text-slate-700">{dueDate ? new Date(dueDate).toLocaleString('vi-VN') : '—'}</strong>
              </p>
              {allowMultipleAttempts && <p className="text-xs text-amber-600 font-bold">Cho phép làm lại nhiều lần để luyện tập (điểm chính thức tính lần đầu)</p>}
              {instruction && <p className="text-sm text-slate-600 whitespace-pre-line mt-2 bg-slate-50 rounded-xl p-3 border border-slate-100">{instruction}</p>}
            </div>

            {summaryParts.map((p, idx) => (
              <div key={idx} className={`border rounded-xl p-4 ${accentClasses[p.accent].ring}`}>
                <div className="flex items-center justify-between mb-2">
                  <strong className={`text-sm ${accentClasses[p.accent].text}`}>{p.label}</strong>
                  <span className="text-xs font-bold text-slate-500">{p.count} câu · {p.pts.toFixed(2)}đ</span>
                </div>
                {activeSections[idx] === 'tn' && quizQuestions.map((q, i) => (
                  <p key={i} className="text-sm text-slate-600 py-1 border-t border-slate-100 first:border-t-0">Câu {i + 1}: {q.question_text || '(trống)'}</p>
                ))}
                {activeSections[idx] === 'ds' && tfQuestions.map((q, i) => (
                  <p key={i} className="text-sm text-slate-600 py-1 border-t border-slate-100 first:border-t-0">Câu {i + 1}: {q.stem || '(trống)'}</p>
                ))}
                {activeSections[idx] === 'tl' && essayQuestions.map((q, i) => (
                  <p key={i} className="text-sm text-slate-600 py-1 border-t border-slate-100 first:border-t-0">Câu {i + 1}: {q.question_text || '(trống)'}</p>
                ))}
              </div>
            ))}

            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-5 py-3">
              <span className="text-sm font-bold text-slate-600">Tổng điểm toàn bài</span>
              <span className="text-xl font-black text-primary">{totalPoints.toFixed(2)}đ</span>
            </div>
          </div>
        )}

        {/* ============ NAVIGATION ============ */}
        <div className="flex justify-between items-center gap-4 mt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 disabled:opacity-0 disabled:pointer-events-none"
          >
            Quay lại
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
              className="px-8 py-3 bg-primary hover:bg-primary/80 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-md transition-all"
            >
              Tiếp theo
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handlePublish('draft')}
                disabled={submitting}
                className="px-6 py-3 border border-slate-300 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 disabled:opacity-50"
              >
                Lưu nháp
              </button>
              <button
                type="button"
                onClick={() => handlePublish('published')}
                disabled={submitting}
                className="px-8 py-3 bg-primary hover:bg-primary/80 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm shadow-md transition-all"
              >
                {submitting ? 'Đang xuất bản...' : 'Xuất bản'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
