import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import api from '../../services/api';

export default function DoAssignmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useFetchData(`/Student/DoAssignment/${id}`);

  const assignment = data?.assignment || null;
  const isQuiz = assignment?.AssignmentType === 0;
  const isEssay = assignment?.AssignmentType === 1;
  const isTrueFalse = assignment?.AssignmentType === 2;
  const isExam = assignment?.AssignmentType === 3;

  // Show Pre-Exam Leaderboard Screen FIRST before entering exam simulator
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  // Timer state (e.g. 87:41 default matching screenshot)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(87 * 60 + 41);

  const [quizData, setQuizData] = useState([]);
  const [tfData, setTfData] = useState([]);
  const [examData, setExamData] = useState({ quiz: [], tf: [], essay: [] });
  const [answers, setAnswers] = useState({}); // Quiz: { qIndex: choiceIndex }
  const [tfAnswers, setTfAnswers] = useState({}); // TF: { qIndex: { a, b, c, d } }
  const [examQuizAnswers, setExamQuizAnswers] = useState({});
  const [examTfAnswers, setExamTfAnswers] = useState({});
  const [examEssayAnswers, setExamEssayAnswers] = useState({});
  const [essayText, setEssayText] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!assignment || !assignment.QuizData) return;
    try {
      const raw = assignment.QuizData;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (isQuiz) {
        setQuizData(Array.isArray(parsed) ? parsed : []);
      } else if (isTrueFalse) {
        setTfData(Array.isArray(parsed) ? parsed : []);
      } else if (isExam) {
        setExamData({ quiz: parsed.quiz || [], tf: parsed.tf || [], essay: parsed.essay || [] });
      }
    } catch (e) {
      console.error('Quiz parsing error:', e);
    }
  }, [assignment]);

  // Countdown timer effect
  useEffect(() => {
    if (showLeaderboard) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showLeaderboard]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleChoiceSelect = (qIdx, choiceIdx) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: choiceIdx }));
  };

  const handleTfSelect = (qIdx, letter, value) => {
    setTfAnswers((prev) => ({ ...prev, [qIdx]: { ...(prev[qIdx] || {}), [letter]: value } }));
  };

  const handleExamQuizSelect = (qIdx, choiceIdx) => {
    setExamQuizAnswers((prev) => ({ ...prev, [qIdx]: choiceIdx }));
  };

  const isQuestionAnswered = (qIdx) => {
    if (isQuiz) {
      return answers[qIdx] !== undefined;
    }
    if (isTrueFalse) {
      return tfAnswers[qIdx] && Object.keys(tfAnswers[qIdx]).length > 0;
    }
    if (isExam) {
      const totalQuiz = examData.quiz.length;
      const totalTf = examData.tf.length;
      if (qIdx < totalQuiz) {
        return examQuizAnswers[qIdx] !== undefined;
      } else if (qIdx < totalQuiz + totalTf) {
        const tfIdx = qIdx - totalQuiz;
        return examTfAnswers[tfIdx] && Object.keys(examTfAnswers[tfIdx]).length > 0;
      } else {
        const essayIdx = qIdx - totalQuiz - totalTf;
        return !!examEssayAnswers[essayIdx];
      }
    }
    return !!essayText || !!attachmentFile;
  };

  const getTotalQuestionsCount = () => {
    if (isQuiz) return quizData.length || 15;
    if (isTrueFalse) return tfData.length || 15;
    if (isExam) return examData.quiz.length + examData.tf.length + examData.essay.length || 15;
    return 15;
  };

  const getAnsweredQuestionsCount = () => {
    const total = getTotalQuestionsCount();
    let count = 0;
    for (let i = 0; i < total; i++) {
      if (isQuestionAnswered(i)) count++;
    }
    return count;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      if (isQuiz) {
        const answersArray = quizData.map((_, qIdx) => (answers[qIdx] !== undefined ? answers[qIdx] : null));
        await api.post('/Student/SubmitAssignment', {
          assignmentId: id,
          content: JSON.stringify(answersArray),
        });
        alert('Nộp bài trắc nghiệm thành công!');
      } else if (isTrueFalse) {
        const answersArray = tfData.map((_, qIdx) => tfAnswers[qIdx] || {});
        await api.post('/Student/SubmitAssignment', {
          assignmentId: id,
          content: JSON.stringify(answersArray),
        });
        alert('Nộp bài Đúng/Sai thành công!');
      } else if (isExam) {
        let fileUrl = null;
        if (attachmentFile) {
          const uploadForm = new FormData();
          uploadForm.append('file', attachmentFile);
          const uploadRes = await api.post('/Student/UploadFile', uploadForm, { headers: { 'Content-Type': undefined } });
          if (!uploadRes.data?.success) {
            alert(uploadRes.data?.message || 'Lỗi khi tải file lên.');
            setSubmitting(false);
            return;
          }
          fileUrl = uploadRes.data.fileUrl;
        }
        const content = {
          quiz: examData.quiz.map((_, qIdx) => (examQuizAnswers[qIdx] !== undefined ? examQuizAnswers[qIdx] : null)),
          tf: examData.tf.map((_, qIdx) => examTfAnswers[qIdx] || {}),
          essay: examData.essay.map((_, qIdx) => examEssayAnswers[qIdx] || '')
        };
        await api.post('/Student/SubmitAssignment', {
          assignmentId: id,
          content: JSON.stringify(content),
          fileUrl,
        });
        alert('Nộp bài kiểm tra thành công!');
      } else {
        let fileUrl = null;
        if (attachmentFile) {
          const uploadForm = new FormData();
          uploadForm.append('file', attachmentFile);
          const uploadRes = await api.post('/Student/UploadFile', uploadForm, { headers: { 'Content-Type': undefined } });
          if (!uploadRes.data?.success) {
            alert(uploadRes.data?.message || 'Lỗi khi tải file lên.');
            setSubmitting(false);
            return;
          }
          fileUrl = uploadRes.data.fileUrl;
        }
        await api.post('/Student/SubmitAssignment', {
          assignmentId: id,
          content: essayText,
          fileUrl,
        });
        alert('Nộp bài tự luận thành công!');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi trong quá trình nộp bài.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalQuestions = getTotalQuestionsCount();
  const answeredCount = getAnsweredQuestionsCount();

  // Generated question list with 2-column options matching user screenshot
  const questionsList = (isQuiz && quizData.length > 0)
    ? quizData.map((q, idx) => ({
        id: idx + 1,
        tag: '[KID]',
        question: q.question || q.question_text,
        options: (q.choices || q.options || []).map((optStr, choiceIdx) => {
          const prefix = String.fromCharCode(65 + choiceIdx) + '. ';
          return optStr.startsWith(prefix) ? optStr : `${prefix}${optStr}`;
        })
      }))
    : Array.from({ length: totalQuestions }).map((_, idx) => ({
        id: idx + 1,
        tag: '[KID]',
        question: `Câu ${idx + 1}: [Toán Học Lớp 11 - Lượng Giác & Hình Không Gian] Trong bài Buổi 2: Chuyên đề trọng tâm 2 - Toán Học Lớp 11 - Lượng Giác & Hình Không Gian, tìm khẳng định đúng về phương trình và dạng toán nâng cao số ${idx + 1}?`,
        options: [
          `A. Giá trị của tham số m nằm trong khoảng (${idx + 1}, ${idx + 6})`,
          `B. Hàm số đạt cực trị tại x = ${(idx + 1) * 2}`,
          `C. Nghiệm của phương trình là x = ${idx + 1} hoặc x = -${idx + 1}`,
          `D. Tập xác định của hàm số D = R \\ {${idx + 1}}`
        ]
      }));

  return (
    <MainLayout hideHeader={!showLeaderboard} hideFooter={!showLeaderboard} hideChatbot={true}>
      {loading ? (
        <div className="flex justify-center py-20">
          <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
        </div>
      ) : !assignment ? (
        <div className="text-center py-20 text-slate-500 font-semibold">
          Không tìm thấy bài tập được chỉ định hoặc bạn đã nộp bài tập này rồi.
        </div>
      ) : showLeaderboard ? (
        /* PRE-EXAM LEADERBOARD SCREEN matching exact user screenshot */
        <div className="bg-[#f0f7ff] min-h-screen pb-12 select-none">
          {/* Top Breadcrumb Header */}
          <div className="bg-white border-b border-gray-100 py-3.5 px-6">
            <div className="max-w-[1240px] mx-auto flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Link to="/Student/Dashboard" className="hover:text-blue-600 transition-colors">
                Thi thử
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-bold truncate">{assignment.Title}</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: BẢNG XẾP HẠNG TOP THÍ SINH (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-blue-100 rounded-2xl p-5 shadow-xs">
                
                {/* Top 3 Podium */}
                <div className="flex items-end justify-center gap-3 mb-6 pt-4">
                  {/* Rank 2 (Left) */}
                  <div className="flex flex-col items-center text-center w-28">
                    <div className="relative mb-2">
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-base">🥈</span>
                      <div className="w-13 h-13 rounded-full border-2 border-slate-300 p-0.5 bg-white shadow-xs overflow-hidden">
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-base">M</div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate w-full">Bùi Đức Mạnh <span className="text-blue-600">♂</span></div>
                    <span className="inline-block bg-gradient-to-r from-amber-500 to-red-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full mt-1">🔥 Thách Đấu</span>
                    <div className="text-xs font-extrabold text-slate-700 mt-1">Tổng: <span className="text-blue-600">10 điểm</span></div>
                  </div>

                  {/* Rank 1 (Center - Higher) */}
                  <div className="flex flex-col items-center text-center w-32 -translate-y-3">
                    <div className="relative mb-2">
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">👑</span>
                      <div className="w-16 h-16 rounded-full border-2 border-amber-400 p-0.5 bg-white shadow-md overflow-hidden">
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xl">T</div>
                      </div>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 truncate w-full">Việt Toàn <span className="text-blue-600">♂</span></div>
                    <span className="inline-block bg-gradient-to-r from-amber-500 to-red-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full mt-1 shadow-xs">🔥 Thách Đấu</span>
                    <div className="text-xs font-black text-amber-600 mt-1">Tổng: <span className="text-amber-600">10 điểm</span></div>
                  </div>

                  {/* Rank 3 (Right) */}
                  <div className="flex flex-col items-center text-center w-28">
                    <div className="relative mb-2">
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-base">🥉</span>
                      <div className="w-14 h-14 rounded-full border-2 border-amber-600/50 p-0.5 bg-white shadow-xs overflow-hidden">
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-600 to-orange-700 flex items-center justify-center text-white font-bold text-base">N</div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate w-full">Trần Đăng Nguyên <span className="text-blue-600">♂</span></div>
                    <span className="inline-block bg-gradient-to-r from-amber-500 to-red-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full mt-1">🔥 Thách Đấu</span>
                    <div className="text-xs font-extrabold text-slate-700 mt-1">Tổng: <span className="text-blue-600">10 điểm</span></div>
                  </div>
                </div>

                {/* Ranks 4 to 8 List */}
                <div className="space-y-2">
                  {[
                    { rank: 4, name: 'Tian Nhật Hoàng', gender: '♂', score: '10 Điểm' },
                    { rank: 5, name: 'Thủyy Trangg', gender: '♀', score: '10 Điểm' },
                    { rank: 6, name: 'Trần Thị Như Quỳnh', gender: '♀', score: '10 Điểm' },
                    { rank: 7, name: 'Khưu Bảo', gender: '♂', score: '10 Điểm' },
                    { rank: 8, name: 'Phan Công Lý', gender: '♂', score: '10 Điểm' }
                  ].map((user) => (
                    <div key={user.rank} className="bg-slate-50/80 border border-slate-100 rounded-xl p-2.5 flex items-center justify-between shadow-2xs hover:bg-white hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-slate-400 text-xs w-4 text-center">{user.rank}</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-sky-400 flex items-center justify-center text-white font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            {user.name} <span className={user.gender === '♀' ? 'text-pink-500 font-bold' : 'text-blue-600 font-bold'}>{user.gender}</span>
                          </div>
                          <span className="bg-gradient-to-r from-amber-500 to-red-500 text-white font-extrabold text-[8px] px-1.5 py-0.2 rounded mt-0.5 inline-block">🔥 THÁCH ĐẤU</span>
                        </div>
                      </div>
                      <div className="text-xs font-extrabold text-slate-600">
                        Tổng: <strong className="text-slate-800">{user.score}</strong>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* RIGHT COLUMN: TEST INFO CARD + HISTORY (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Test Info Header Box */}
                <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-[84px] h-[100px] shrink-0 rounded-lg bg-gradient-to-tr from-[#2563eb] via-[#3b82f6] to-[#60a5fa] p-2 flex flex-col justify-between text-white shadow-sm">
                      <div className="bg-[#0f172a] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full w-max">
                        Toán
                      </div>
                      <div className="text-[12px] font-black text-blue-100 uppercase">
                        LỚP 11
                      </div>
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-snug mb-2">
                        {assignment.Title}
                      </h2>
                      <div className="space-y-1 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          <span>Tổng số câu: <strong className="text-slate-800 font-bold">{totalQuestions} câu</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          <span>Hạn nộp: <strong className="text-slate-800 font-bold">{new Date(assignment.DueDate).toLocaleDateString('vi-VN')}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTON: VÀO PHÒNG THI */}
                  <button
                    onClick={() => {
                      setShowLeaderboard(false);
                    }}
                    className="w-full sm:w-auto bg-[#0256d0] hover:bg-[#0147b3] text-white px-7 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 whitespace-nowrap shrink-0 hover:scale-105"
                  >
                    Vào phòng thi
                  </button>
                </div>

                {/* History Box: Lịch sử làm bài */}
                <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xs min-h-[220px]">
                  <h3 className="text-base font-bold text-blue-600 mb-4">
                    Lịch sử làm bài
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold">
                          <th className="py-3 px-4">Ngày thi</th>
                          <th className="py-3 px-4">Thời gian làm bài</th>
                          <th className="py-3 px-4">Điểm</th>
                          <th className="py-3 px-4 text-right">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400 font-semibold italic">
                            Không có dữ liệu !
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      ) : (
        /* EXACT PDF PAPER EXAM SIMULATOR WITH CLEAN VECTOR SVG ICONS */
        <div className="bg-[#eef2f7] min-h-screen select-none font-sans text-slate-800 print:bg-white print:p-0">
          
          {/* TOP HEADER NAV BAR */}
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-2xs print:hidden">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLeaderboard(true)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors text-sm"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#0256d0] text-white flex items-center justify-center text-xs">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <span className="font-extrabold text-slate-900 text-base">Flash Study</span>
              </div>
              <span className="text-slate-300 font-bold">|</span>
              <span className="font-bold text-slate-800 text-sm truncate max-w-xl">
                {assignment.Title}
              </span>
            </div>
          </div>

          {/* BREADCRUMB ROW */}
          <div className="px-8 py-2 text-xs font-semibold text-slate-500 print:hidden">
            <span>Thi thử</span>
            <span className="mx-1">/</span>
            <span>{assignment.Title}</span>
            <span className="mx-1">/</span>
            <span className="text-slate-900 font-bold">Làm bài</span>
          </div>

          {/* MAIN SPLIT VIEW: LEFT PDF PAPER SHEET (8 cols) + RIGHT BUBBLE ANSWER SHEET (4 cols) */}
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-12 print:p-0 print:m-0 print:max-w-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block">
              
              {/* LEFT COLUMN: PDF TEST PAPER SHEET (8 COLS) */}
              <div className="lg:col-span-8 space-y-3 print:w-full print:p-0">
                
                {/* Download Paper & Print Buttons Bar with Clean Vector Icons */}
                <div className="flex items-center justify-end gap-2.5 print:hidden">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>In đề thi</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-[#0256d0] hover:bg-[#0147b3] text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Tải xuống</span>
                  </button>
                </div>

                {/* WHITE PAPER CARD SHEET (Target for printing) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 sm:p-12 space-y-8 min-h-[900px] print:shadow-none print:border-none print:p-0 print:m-0 print:w-full">
                  
                  {/* Paper Header Logo & Titles Box */}
                  <div className="border-b-2 border-blue-600 pb-4">
                    <div className="flex items-center justify-between text-xs text-blue-600 font-bold mb-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-black">FLASHSTUDY</span>
                        <span className="text-[10px] text-slate-400 font-medium">https://flashstudy.vn/</span>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-blue-700">Lê Quốc Tuấn</div>
                        <div className="text-[10px] text-slate-400">Anh Giáo Kid</div>
                      </div>
                    </div>

                    {/* Blue Title Boxes Header */}
                    <div className="grid grid-cols-12 gap-3 items-stretch">
                      <div className="col-span-4 border-2 border-blue-600 p-3 text-center rounded-lg flex flex-col justify-center bg-blue-50/20">
                        <div className="font-extrabold text-blue-800 text-xs uppercase tracking-wider">FLASH STUDY</div>
                        <div className="font-black text-red-600 text-xl tracking-tight mt-0.5">ĐỀ SỐ 02</div>
                      </div>

                      <div className="col-span-8 border-2 border-blue-600 p-3 text-center rounded-lg flex flex-col justify-center bg-blue-50/20">
                        <div className="font-black text-blue-800 text-sm uppercase tracking-wide">
                          {assignment.Title}
                        </div>
                        <div className="font-bold text-blue-600 text-xs mt-0.5">MÔN: TOÁN 12</div>
                        <div className="text-[10px] font-semibold text-slate-500 italic mt-0.5">
                          Thời gian làm bài: 90 phút (không kể thời gian phát đề)
                        </div>
                      </div>
                    </div>

                    {/* Student Information Fields & Score Box */}
                    <div className="grid grid-cols-12 gap-4 items-center mt-4 text-xs font-semibold text-slate-700">
                      <div className="col-span-9 space-y-1.5">
                        <div>Họ và tên: <span className="border-b border-dotted border-slate-400 inline-block w-4/5"></span></div>
                        <div className="flex gap-4">
                          <span>Số báo danh: <span className="border-b border-dotted border-slate-400 inline-block w-32"></span></span>
                          <span>Chữ ký: <span className="border-b border-dotted border-slate-400 inline-block w-32"></span></span>
                        </div>
                      </div>

                      <div className="col-span-3 border border-blue-600 rounded-lg p-2 text-center h-full flex flex-col justify-between">
                        <div className="text-[11px] font-bold text-blue-800 border-b border-blue-200 pb-0.5">Điểm</div>
                        <div className="text-lg font-black text-slate-300 py-1">---</div>
                      </div>
                    </div>
                  </div>

                  {/* Section Title */}
                  <div className="text-xs font-black text-blue-700 uppercase tracking-wide">
                    PHẦN I. (3,0 điểm) CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN. HỌC SINH TRẢ LỜI TỪ CÂU 1 ĐẾN CÂU 12.
                  </div>

                  {/* Paper Questions List */}
                  <div className="space-y-8 text-xs font-medium leading-relaxed text-slate-900">
                    {questionsList.map((q, idx) => {
                      const selectedChoice = answers[idx] !== undefined ? answers[idx] : examQuizAnswers[idx];

                      return (
                        <div key={idx} id={`paper-question-${idx}`} className="space-y-3 border-b border-slate-100 pb-6 print:break-inside-avoid">
                          
                          {/* Question Stem */}
                          <div className="font-bold text-xs sm:text-sm text-slate-900 leading-relaxed">
                            <span className="text-blue-700 font-extrabold mr-1">Câu {idx + 1}.</span>
                            <span className="text-red-600 font-bold mr-1.5">{q.tag}</span>
                            <span>{q.question}</span>
                          </div>

                          {/* 2-COLUMN OPTIONS GRID MATCHING SCREENSHOT */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                            {(q.options || []).map((opt, choiceIdx) => {
                              const isChoiceSelected = selectedChoice === choiceIdx;
                              return (
                                <div
                                  key={choiceIdx}
                                  onClick={() => {
                                    if (isQuiz) handleChoiceSelect(idx, choiceIdx);
                                    if (isExam) handleExamQuizSelect(idx, choiceIdx);
                                  }}
                                  className={`p-3.5 rounded-xl border cursor-pointer font-semibold text-xs transition-all flex items-center ${
                                    isChoiceSelected
                                      ? 'bg-blue-50/80 border-blue-600 text-blue-700 font-bold shadow-2xs ring-1 ring-blue-600'
                                      : 'border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  {opt}
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>

              {/* RIGHT COLUMN: BUBBLE ANSWER SHEET SIDEBAR (4 COLS - HIDDEN ON PRINT) */}
              <div className="lg:col-span-4 sticky top-20 space-y-4 print:hidden">
                
                {/* Progress & Timer Header Box */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    
                    {/* Progress slider bar & text */}
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden relative">
                        <div
                          className="h-full bg-[#0256d0] rounded-full transition-all duration-300"
                          style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-extrabold text-slate-600 shrink-0">
                        {answeredCount}/{totalQuestions}
                      </span>
                    </div>

                    {/* Red Countdown Timer Badge with Clean Clock SVG */}
                    <div className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-mono text-sm font-black">{formatTimer(timeLeftSeconds)}</span>
                    </div>

                  </div>
                </div>

                {/* BUBBLE ANSWER SHEET CARD TABLE */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  
                  {/* Table Header */}
                  <div className="bg-[#0256d0] text-white px-4 py-3 font-bold text-xs flex items-center justify-between">
                    <span>Câu</span>
                    <span className="pr-12">Đáp án</span>
                  </div>

                  {/* Section Banner Note inside Table */}
                  <div className="bg-blue-50/80 border-b border-blue-100 p-3 text-[11px] font-bold text-[#0256d0] leading-snug">
                    PHẦN I. (3,0 ĐIỂM) CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN. HỌC SINH TRẢ LỜI TỪ CÂU 1 ĐẾN CÂU 12.
                  </div>

                  {/* Answer Rows List */}
                  <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100 p-2">
                    {Array.from({ length: totalQuestions }).map((_, idx) => {
                      const selectedChoice = answers[idx] !== undefined ? answers[idx] : examQuizAnswers[idx];

                      return (
                        <div key={idx} className="flex items-center justify-between py-2 px-3 hover:bg-slate-50/80 transition-colors">
                          <span className="text-xs font-bold text-slate-700 w-16">
                            Câu {idx + 1}
                          </span>

                          {/* 4 Bubble Choices A B C D */}
                          <div className="flex items-center gap-2">
                            {['A', 'B', 'C', 'D'].map((letter, choiceIdx) => {
                              const isSelected = selectedChoice === choiceIdx;

                              return (
                                <button
                                  key={choiceIdx}
                                  type="button"
                                  onClick={() => {
                                    if (isQuiz) handleChoiceSelect(idx, choiceIdx);
                                    if (isExam) handleExamQuizSelect(idx, choiceIdx);
                                    // Smooth scroll left paper sheet to target question
                                    const el = document.getElementById(`paper-question-${idx}`);
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }}
                                  className={`w-7 h-7 rounded-full text-xs font-bold transition-all flex items-center justify-center border ${
                                    isSelected
                                      ? 'bg-[#0256d0] text-white border-[#0256d0] shadow-xs scale-105'
                                      : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400 hover:bg-slate-100'
                                  }`}
                                >
                                  {letter}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Submit Button inside Card */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="w-full bg-[#0256d0] hover:bg-[#0147b3] text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
                    </button>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      )}
    </MainLayout>
  );
}
