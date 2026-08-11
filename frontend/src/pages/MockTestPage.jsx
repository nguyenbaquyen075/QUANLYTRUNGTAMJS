import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function MockTestView({ embeddedInDashboard = false }) {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTestDetail, setSelectedTestDetail] = useState(null); // Pre-Exam Leaderboard Screen state

  // Interactive Simulator State
  const [activeExam, setActiveExam] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [examViewMode, setExamViewMode] = useState('paper'); // Default to Paper PDF Sheet UI (Screenshot 2)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default: Full-Page Exam Paper Sheet; 3-bars button toggles right answer sheet
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [examResult, setExamResult] = useState(null);

  const [mockTestsData, setMockTestsData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api.get('/Home/MockTests')
      .then((res) => setMockTestsData(res.data?.data || []))
      .catch((err) => console.error('Lỗi tải danh sách đề thi:', err));
  }, []);

  // Timer Effect
  useEffect(() => {
    let timer = null;
    if (isExamStarted && timeLeft > 0 && !examResult) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            calculateAndShowResult();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isExamStarted, timeLeft, examResult]);

  // Filter tests matching selected grade and search query
  const filteredTests = mockTestsData.filter((test) => {
    const matchesGrade = selectedGrade === 'Tất cả' || test.grade === selectedGrade;
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  // After login redirects back here with ?testId=, reopen that exam's detail screen
  useEffect(() => {
    const testId = new URLSearchParams(window.location.search).get('testId');
    if (testId) {
      api.get(`/Home/MockTests/${testId}`)
        .then((res) => { if (res.data?.data) setSelectedTestDetail(res.data.data); })
        .catch((err) => console.error('Lỗi tải đề thi:', err));
    }
  }, []);

  // Allow anyone (guests included) to open an exam's detail screen without login
  const handleOpenTestDetail = (test) => {
    setSelectedTestDetail(test); // hiện ngay khung metadata trong lúc chờ tải câu hỏi
    api.get(`/Home/MockTests/${test.id}`)
      .then((res) => { if (res.data?.data) setSelectedTestDetail(res.data.data); })
      .catch((err) => console.error('Lỗi tải đề thi:', err));
  };

  // Fetch leaderboard whenever a test detail screen is opened
  useEffect(() => {
    if (!selectedTestDetail?.id) { setLeaderboard([]); return; }
    api.get(`/Home/MockTests/${selectedTestDetail.id}/Leaderboard`)
      .then((res) => setLeaderboard(res.data?.data || []))
      .catch((err) => console.error('Lỗi tải bảng xếp hạng:', err));
  }, [selectedTestDetail?.id]);

  // Handle Exam Actions
  const handleStartExam = (test) => {
    setActiveExam(test);
    setUserAnswers({});
    setFlaggedQuestions({});
    setCurrentQIndex(0);
    setTimeLeft(test.duration * 60);
    setIsExamStarted(true);
    setExamResult(null);
  };

  // Dedicated Handlers for Tải tài liệu (.docx), Tải file PDF (.pdf), and In trực tiếp
  const handleDownloadDocx = () => {
    const title = activeExam?.title || "De_Thi_Thach_Dau";
    const questions = activeExam?.questions || [];
    
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.4; color: #1e293b; }
          .header-top { width: 100%; margin-bottom: 10px; }
          .brand-title { font-size: 14pt; font-weight: bold; color: #0055d4; }
          .author-name { text-align: right; font-size: 11pt; font-weight: bold; color: #1d4ed8; }
          .frame-table { width: 100%; border: 2px solid #2563eb; border-collapse: collapse; margin: 12px 0; text-align: center; }
          .frame-table td { padding: 10px; border: 1px solid #2563eb; }
          .frame-left { width: 35%; background-color: #eff6ff; font-weight: bold; color: #2563eb; }
          .frame-right { width: 65%; font-weight: bold; color: #1e3a8a; }
          .info-table { width: 100%; margin: 15px 0 20px 0; border-collapse: collapse; font-size: 11pt; }
          .info-table td { padding: 4px 0; vertical-align: bottom; }
          .dotted-line { border-bottom: 1px dotted #64748b; display: inline-block; width: 80%; }
          .score-box { border: 2px solid #2563eb; width: 60px; height: 75px; text-align: center; border-collapse: collapse; font-size: 10pt; font-weight: bold; color: #2563eb; }
          .section-title { font-weight: bold; color: #2563eb; font-size: 11.5pt; margin: 18px 0 12px 0; }
          .question-box { margin-bottom: 16px; page-break-inside: avoid; }
          .question-title { font-weight: bold; color: #0047ba; margin-bottom: 6px; }
          .options-table { width: 100%; border-collapse: collapse; margin-left: 10px; }
          .options-table td { width: 50%; padding: 4px 8px 4px 0; vertical-align: top; font-size: 11pt; }
        </style>
      </head>
      <body>
        <table class="header-top">
          <tr>
            <td class="brand-title">⚡ FLASHSTUDY</td>
            <td class="author-name">Lê Quốc Tuấn - Anh Giáo Kid</td>
          </tr>
        </table>

        <table class="frame-table">
          <tr>
            <td class="frame-left">
              <div style="font-size: 11pt; color: #2563eb;">FLASH STUDY</div>
              <div style="font-size: 15pt; color: #dc2626; margin-top: 4px;">ĐỀ SỐ 02</div>
            </td>
            <td class="frame-right">
              <div style="font-size: 12pt; color: #2563eb; text-transform: uppercase;">${title.toUpperCase()}</div>
              <div style="font-size: 11pt; color: #1e3a8a; margin-top: 4px;">MÔN: TOÁN 12</div>
              <div style="font-size: 9.5pt; font-style: italic; color: #64748b; font-weight: normal; margin-top: 4px;">Thời gian làm bài: 90 phút (không kể thời gian phát đề)</div>
            </td>
          </tr>
        </table>

        <table class="info-table">
          <tr>
            <td style="width: 75%;">
              <div>Họ và tên: <span class="dotted-line"></span></div>
              <div style="margin-top: 8px;">
                Số báo danh: <span style="border-bottom: 1px dotted #64748b; display: inline-block; width: 180px;"></span>
              </div>
            </td>
            <td style="width: 25%; text-align: right;">
              <table align="right" class="score-box">
                <tr><td style="vertical-align: top; padding-top: 6px;">Điểm</td></tr>
              </table>
            </td>
          </tr>
        </table>

        <div class="section-title">PHẦN I. (3,0 điểm) Câu trắc nghiệm nhiều phương án lựa chọn. Học sinh trả lời từ câu 1 đến câu 12.</div>

        ${questions.map((q, qIdx) => {
          const optA = q.options[0] || '';
          const optB = q.options[1] || '';
          const optC = q.options[2] || '';
          const optD = q.options[3] || '';
          return `
            <div class="question-box">
              ${qIdx > 0 ? '<hr style="border:none;border-top:1px solid #bfdbfe;margin:0 0 14px 0;" />' : ''}
              <div class="question-title">Câu ${qIdx + 1}. <span style="color: #dc2626;">[KID]</span> ${q.content}</div>
              <table class="options-table">
                <tr>
                  <td><b>A.</b> ${optA}</td>
                  <td><b>B.</b> ${optB}</td>
                </tr>
                <tr>
                  <td><b>C.</b> ${optC}</td>
                  <td><b>D.</b> ${optD}</td>
                </tr>
              </table>
            </div>
          `;
        }).join('')}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${title.replace(/[^a-zA-Z0-9_]/g, '_')}_FormDe.doc`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const handlePrintDirect = () => {
    window.print();
  };

  const handleSelectOption = (qId, optionIdx) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleToggleFlag = (qId) => {
    setFlaggedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const calculateAndShowResult = () => {
    if (!activeExam) return;
    let correctCount = 0;
    activeExam.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const totalQ = activeExam.questions.length;
    const score = Number(((correctCount / totalQ) * 10).toFixed(1));
    const accuracy = Math.round((correctCount / totalQ) * 100);
    const timeSpentSeconds = activeExam.duration * 60 - timeLeft;

    setExamResult({
      score,
      correctCount,
      totalQ,
      accuracy,
      timeSpentSeconds,
      submittedAt: new Date().toLocaleTimeString('vi-VN')
    });
    setShowSubmitConfirm(false);

    const guestName = isLoggedIn ? undefined : (window.prompt('Nhập tên của bạn để lưu vào bảng xếp hạng:') || 'Khách');
    api.post(`/Home/MockTests/${activeExam.id}/Submit`, { answers: userAnswers, guestName })
      .catch((err) => console.error('Lỗi khi lưu kết quả:', err));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const viewContent = (
    <>
      {selectedTestDetail ? (
        /* PRE-EXAM LEADERBOARD & HISTORY DETAIL SCREEN matching exact user screenshot */
    <div className="bg-[#f2faf5] min-h-screen pb-16 select-none relative overflow-hidden font-sans">
      
      {/* Soft Glare-Free Green Gradient Header & Sharp Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Top Gentle Pastel Green Curved Banner */}
        <div className="h-64 bg-gradient-to-r from-[#a7f3d0]/70 via-[#6ee7b7]/60 to-[#d1fae5]/70 opacity-60" />
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-transparent via-[#f2faf5]/80 to-[#f2faf5]" />
        
        {/* Crisp, Sharp & Distinct Green Grid Line Overlay */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(16, 185, 129, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.14) 1px, transparent 1px)`,
            backgroundSize: '28px 28px'
          }}
        />

        {/* Soft glowing ambient lighting circles */}
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-teal-100/40 blur-3xl" />
      </div>

      {/* Top Breadcrumb */}
      <div className="relative z-10 py-4 px-8 text-xs font-semibold text-slate-700">
        <div className="max-w-[1530px] mx-auto flex items-center gap-2 text-sm">
          <button onClick={() => setSelectedTestDetail(null)} className="hover:text-emerald-700 transition-colors font-bold">
            Thi thử
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 font-bold truncate">{selectedTestDetail.title}</span>
        </div>
      </div>

      {/* Main Container - Widened to 1530px */}
      <div className="max-w-[1530px] mx-auto px-4 sm:px-8 pt-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: BẢNG XẾP HẠNG TOP THÍ SINH (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-emerald-100/90 rounded-3xl p-6 sm:p-7 shadow-md">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
              <span className="text-lg">🏆</span> BẢNG XẾP HẠNG THÍ SINH XUẤT SẮC
            </h3>

            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-4 mb-8 pt-2">
              {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, slot) => {
                const rank = [2, 1, 3][slot];
                const sizeClass = rank === 1 ? 'w-36 -translate-y-4' : rank === 2 ? 'w-32' : 'w-32';
                const medal = rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉';
                return (
                  <div key={rank} className={`flex flex-col items-center text-center ${sizeClass}`}>
                    <div className="relative mb-2">
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl drop-shadow-sm">{medal}</span>
                      <div className="w-16 h-16 rounded-full border-2 border-slate-300 p-0.5 bg-white shadow-md overflow-hidden">
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-400 to-emerald-600 flex items-center justify-center text-white font-extrabold text-lg">
                          {entry ? entry.name.charAt(0) : '—'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 truncate w-full">{entry ? entry.name : 'Chưa có bài nộp'}</div>
                    <div className="text-xs font-black text-slate-700 mt-1.5">Tổng: <span className="text-emerald-600 font-extrabold text-sm">{entry ? `${entry.score} điểm` : '—'}</span></div>
                  </div>
                );
              })}
            </div>

            {/* Ranks 4 to 8 List Cards */}
            <div className="space-y-3">
              {leaderboard.slice(3, 8).map((user) => (
                <div key={user.rank} className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-2xs hover:bg-white hover:border-emerald-300 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3.5">
                    <span className="font-black text-sm text-slate-600 w-7 h-7 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 group-hover:bg-[#047857] group-hover:text-white group-hover:border-[#047857] transition-colors">
                      {user.rank}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#047857] to-[#10b981] flex items-center justify-center text-white font-black text-sm shadow-xs shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <span>{user.name}</span>
                      </div>
                      <span className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-[9px] px-2 py-0.5 rounded mt-0.5 inline-block uppercase shadow-2xs">🔥 THÁCH ĐẤU</span>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shrink-0 shadow-2xs">
                    Tổng: <strong className="text-emerald-600 font-extrabold">{user.score} điểm</strong>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT COLUMN: TEST INFO CARD + HISTORY (7 cols) */}
          <div className="lg:col-span-7 space-y-8">

            {/* Test Info Header Box */}
            <div className="bg-white border border-emerald-100/90 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 w-full sm:w-auto">
                <div className="w-[100px] h-[120px] shrink-0 rounded-2xl bg-gradient-to-tr from-[#047857] via-[#10b981] to-[#34d399] p-3 flex flex-col justify-between text-white shadow-md">
                  <div className="bg-[#064e3b] text-white text-xs font-black px-2.5 py-1 rounded-full w-max">
                    {selectedTestDetail.subject || 'Toán'}
                  </div>
                  <div className="text-sm font-black text-emerald-100 uppercase tracking-wider">
                    {selectedTestDetail.grade?.toUpperCase() || 'LỚP 12'}
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                    {selectedTestDetail.title}
                  </h2>
                  <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span>Tổng số câu: <strong className="text-slate-900 font-black text-sm sm:text-base">{selectedTestDetail.totalQuestions}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>Thời gian làm bài: <strong className="text-slate-900 font-black text-sm sm:text-base">{selectedTestDetail.duration} phút</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION: VÀO PHÒNG THI WITH ROOM OPEN ICON */}
              <button
                onClick={() => handleStartExam(selectedTestDetail)}
                disabled={!selectedTestDetail.questions}
                className="w-full sm:w-auto bg-[#047857] hover:bg-[#035e44] text-white px-8 py-3.5 rounded-2xl font-black text-base transition-all shadow-lg shadow-emerald-600/25 whitespace-nowrap shrink-0 hover:scale-105 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span>🖥️</span>
                <span>Vào phòng thi</span>
                <span className="text-sm font-bold opacity-80">↗️</span>
              </button>
            </div>

            {/* History Box: Lịch sử làm bài */}
            <div className="bg-white border border-emerald-100/90 rounded-3xl p-7 sm:p-8 shadow-md min-h-[300px]">
              <h3 className="text-lg font-black text-[#047857] mb-5 flex items-center gap-2">
                <span>📋</span> Lịch sử làm bài
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-medium">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-black text-xs uppercase tracking-wider">
                      <th className="py-4 px-5">Ngày thi</th>
                      <th className="py-4 px-5">Thời gian làm bài</th>
                      <th className="py-4 px-5">Điểm</th>
                      <th className="py-4 px-5 text-right">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examResult ? (
                      <tr className="border-b border-slate-100 font-semibold hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-5 text-slate-800 font-bold">{examResult.submittedAt}</td>
                        <td className="py-4 px-5 text-slate-600">{formatTime(examResult.timeSpentSeconds)}</td>
                        <td className="py-4 px-5 font-black text-emerald-600 text-base">{examResult.score} / 10</td>
                        <td className="py-4 px-5 text-right">
                          <button onClick={() => setExamResult(examResult)} className="text-emerald-700 hover:underline font-extrabold">Xem kết quả</button>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-slate-400 font-semibold italic text-sm">
                          Không có dữ liệu !
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Floating Right Edge Widget matching screenshot */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-30 hidden lg:block">
        <button className="w-9 h-9 rounded-full bg-white border border-emerald-100 shadow-md text-emerald-600 flex items-center justify-center text-sm hover:scale-110 transition-transform cursor-pointer">
          💧
        </button>
      </div>
    </div>
  ) : (
    <div>
      {/* Blue Grid Hero Banner matching exact screenshot */}
      <section className="relative bg-[#38bdf8] text-white py-12 px-6 sm:px-12 overflow-hidden">
        {/* Subtle background grid lines */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '36px 36px'
          }}
        />

        <div className="max-w-[1240px] mx-auto flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 font-sans">
              Danh sách bài thi thử
            </h1>
            <p className="text-blue-50 text-sm sm:text-base font-normal">
              Trải nghiệm kho đề độc quyền tại Flash Study
            </p>
          </div>

          {/* Right Sticker Illustration */}
          <div className="hidden md:flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-sky-200/40 p-2 shadow-inner border border-white/20">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-400 to-blue-200 flex items-center justify-center text-4xl shadow-md">
              📖
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs Bar + Search Box matching screenshot */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Grade Selector Tabs */}
          <div className="flex items-center gap-6 text-sm font-semibold text-gray-600 overflow-x-auto w-full md:w-auto">
            {['Tất cả', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'].map((grade) => {
              const active = selectedGrade === grade;
              return (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`py-1 transition-colors whitespace-nowrap border-b-2 ${active
                      ? 'text-gray-900 font-bold border-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                  {grade}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Nhập từ khóa tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-xs"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

        </div>
      </section>

      {/* Main 2-Column Test Grid matching exact screenshot styling */}
      <section className="bg-[#f8fafc] py-8 min-h-[60vh]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">

          {filteredTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 flex items-center justify-between gap-4 group"
                >
                  {/* Left Thumbnail Badge / Book Cover */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {test.isBookCover ? (
                      <div className="w-[84px] h-[100px] shrink-0 rounded-lg overflow-hidden border border-blue-200 bg-sky-100 flex flex-col items-center justify-center p-1.5 text-center shadow-xs">
                        <div className="text-xl mb-1">📘</div>
                        <span className="text-[11px] font-extrabold text-blue-900 line-clamp-2 leading-tight">Tỉ Số Lượng Giác</span>
                      </div>
                    ) : (
                      <div className="w-[84px] h-[100px] shrink-0 rounded-lg bg-gradient-to-tr from-[#2563eb] via-[#3b82f6] to-[#60a5fa] p-2 flex flex-col justify-between text-white relative shadow-sm">
                        {/* Top subject tag */}
                        <div className="bg-[#0f172a] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full w-max shadow-xs">
                          {test.subject}
                        </div>
                        {/* Bottom grade label */}
                        <div>
                          <div className="text-[12px] font-black tracking-wider text-blue-100 uppercase">
                            {test.grade.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Middle Text Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[#047857] transition-colors leading-snug mb-2 line-clamp-2">
                        {test.title}
                      </h3>

                      <div className="space-y-1 text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Tổng số câu: <strong className="text-gray-700 font-semibold">{test.totalQuestions}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Thời gian làm bài: <strong className="text-gray-700 font-semibold">{test.duration} phút</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Button: Clicking opens the Pre-Exam Leaderboard Detail screen */}
                  <div className="shrink-0 pl-2">
                    <button
                      onClick={() => handleOpenTestDetail(test)}
                      className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 hover:scale-105"
                    >
                      Làm bài
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="text-base font-bold text-gray-800">Không tìm thấy bài thi</h3>
              <p className="text-gray-500 text-xs mt-1">Vui lòng chọn khối lớp hoặc từ khóa khác.</p>
            </div>
          )}

        </div>
      </section>
    </div>
  )}

      {/* FULLSCREEN EXAM SIMULATOR MODAL MATCHING SCREENSHOT 2 (PAPER PDF EXAM SHEET) */}
      {isExamStarted && activeExam && (
        <div className="fixed inset-0 z-[99999] bg-[#eef2f7] flex flex-col text-slate-800 overflow-y-auto select-none font-sans animate-fadeIn print:static print:bg-white print:p-0 print:m-0 print:overflow-visible print:block">
          
          {/* Distraction-Free Exam Top Bar with Exit Button on Top Right (Hidden on Print) */}
          <div className="bg-white border-b border-gray-200/90 px-6 py-3 flex items-center justify-between shadow-2xs sticky top-0 z-40 shrink-0 print:hidden">
            {/* Left Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#047857] to-[#0088ff] flex items-center justify-center text-white shadow-xs">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="font-extrabold text-slate-900 text-sm sm:text-base truncate max-w-xl">
                {activeExam.title}
              </h2>
            </div>

            {/* Right Actions: 3-Bars Hamburger Button + Exit Button */}
            <div className="flex items-center gap-2.5">
              {/* 3-Bars Hamburger Button (Kích vào hiện giao diện phiếu đáp án) */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className={`px-3.5 py-2 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-2xs hover:scale-105 active:scale-95 ${
                  isSidebarOpen
                    ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-md'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                title="Bật/Tắt phiếu làm bài"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="hidden sm:inline font-extrabold">Phiếu đáp án</span>
              </button>

              {/* Nút Thoát Phòng Thi */}
              <button
                type="button"
                onClick={() => setIsExamStarted(false)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-2xs hover:scale-105 active:scale-95"
              >
                {/* SVG Logout Icon matching user image 100% */}
                <svg className="w-5 h-5 text-rose-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 5h2.5A3.5 3.5 0 0 1 20 8.5v7a3.5 3.5 0 0 1-3.5 3.5H14" />
                  <path d="M15 12H4m4.5-4.5L4 12l4.5 4.5" strokeWidth="2.5" />
                </svg>
                <span>Thoát phòng thi</span>
              </button>
            </div>
          </div>

          {/* Main Work Area: Full width by default, 8/4 columns when 3-bars sidebar is open */}
          <div className="flex-1 p-4 sm:p-8 bg-[#eef2f7] min-h-[calc(100vh-100px)] print:p-0 print:m-0 print:bg-white print:block print:min-h-0">
            <div className={`mx-auto grid grid-cols-1 gap-6 items-start transition-all duration-300 print:block print:w-full print:max-w-none ${
              isSidebarOpen ? 'max-w-[1380px] lg:grid-cols-12' : 'max-w-[1100px] lg:grid-cols-1'
            }`}>
              
              {/* LEFT SIDE: PAPER EXAM SHEET (Full width by default, 8 cols when sidebar open) */}
              <div className={`print:w-full print:block ${isSidebarOpen ? 'lg:col-span-8 space-y-4' : 'w-full space-y-4'}`}>
                
                {/* White Paper Sheet Card with Sticky Integrated Control Toolbar */}
                <div className="bg-white rounded-2xl border border-gray-200/90 shadow-md text-slate-800 space-y-0 min-h-[900px] print:shadow-none print:border-none print:rounded-none print:p-0 print:min-h-0">
                  
                  {/* Integrated Control Toolbar (Sticky Top Overlay - Perfect Sweet Spot Size) */}
                  <div className="sticky top-[58px] z-30 bg-white/98 backdrop-blur-md border-b border-gray-200/90 px-6 sm:px-9 py-3 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs print:hidden">
                    <div className="flex items-center gap-3">
                      {/* Timer Chip */}
                      <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-700 shadow-2xs">
                        <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>Còn lại:</span>
                        <strong className="text-red-600 font-mono text-sm sm:text-base font-black">{formatTime(timeLeft)}</strong>
                      </div>

                      {/* Progress Chip */}
                      <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-700 shadow-2xs">
                        <svg className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 11 12 14 22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        <span>Đã làm:</span>
                        <strong className="text-blue-600 font-extrabold text-sm sm:text-base">{Object.keys(userAnswers).length}/{activeExam.questions.length} câu</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Tải xuống Button with Click-Toggle Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowDownloadMenu((prev) => !prev)}
                          className="bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-800 hover:bg-slate-50 font-black text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2 rounded-xl shadow-2xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95"
                        >
                          <svg className="w-4 h-4 text-slate-800 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          <span>Tải xuống</span>
                          <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showDownloadMenu ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>

                        {/* Professional Dropdown Option Menu */}
                        {showDownloadMenu && (
                          <>
                            {/* Backdrop overlay to close when clicking outside */}
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setShowDownloadMenu(false)} 
                            />
                            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200/90 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 print:hidden">
                              <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-4 py-2 border-b border-slate-100 mb-1">
                                Chọn định dạng tải & in
                              </div>

                              {/* Option 1: File Word (.docx) - Original Google Docs Blue Icon Logo */}
                              <button
                                type="button"
                                onClick={() => { setShowDownloadMenu(false); handleDownloadDocx(); }}
                                className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 text-slate-700 hover:text-blue-700 font-extrabold text-xs flex items-center gap-3 transition-colors cursor-pointer"
                              >
                                {/* Blue Google Docs Icon */}
                                <div className="w-5 h-6 rounded-md bg-[#4285f4] relative overflow-hidden p-1 flex flex-col justify-end gap-0.5 shadow-2xs shrink-0">
                                  <div className="w-2 h-2 bg-[#a1c2fa] absolute top-0 right-0 rounded-bl-xs" />
                                  <div className="w-3/4 h-0.5 bg-white rounded-full" />
                                  <div className="w-full h-0.5 bg-white rounded-full" />
                                  <div className="w-full h-0.5 bg-white rounded-full" />
                                  <div className="w-1/2 h-0.5 bg-white rounded-full mb-0.5" />
                                </div>
                                <div className="flex flex-col flex-1">
                                  <span className="font-extrabold text-slate-800 text-xs sm:text-sm">Tải file tài liệu (.docx)</span>
                                  <span className="text-[10px] text-slate-400 font-normal">Microsoft Word / Google Docs</span>
                                </div>
                              </button>

                              {/* Option 2: File PDF (.pdf) - Original Red Vector PDF Icon Logo */}
                              <button
                                type="button"
                                onClick={() => { setShowDownloadMenu(false); handleDownloadPdf(); }}
                                className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50/70 text-slate-700 hover:text-rose-700 font-extrabold text-xs flex items-center gap-3 transition-colors cursor-pointer"
                              >
                                {/* Vector SVG PDF Icon Logo */}
                                <svg className="w-5 h-6 shrink-0 shadow-2xs" viewBox="0 0 20 24" fill="none">
                                  <rect x="1" y="1" width="18" height="22" rx="2" fill="#F4F4F5" stroke="#E4E4E7" strokeWidth="1" />
                                  <rect x="4.5" y="4" width="11" height="1.8" rx="0.9" fill="#D9381E" />
                                  <rect x="4.5" y="7.2" width="11" height="1.8" rx="0.9" fill="#D9381E" />
                                  <rect x="4.5" y="10.4" width="11" height="1.8" rx="0.9" fill="#D9381E" />
                                  <rect x="1" y="13.5" width="18" height="9.5" rx="1.5" fill="#D9381E" />
                                  <text x="10" y="20.5" fill="#FFFFFF" fontSize="6.5" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle" letterSpacing="-0.2">PDF</text>
                                </svg>
                                <div className="flex flex-col flex-1">
                                  <span className="font-extrabold text-slate-800 text-xs sm:text-sm">Tải file PDF (.pdf)</span>
                                  <span className="text-[10px] text-slate-400 font-normal">Đề thi bản in PDF sắc nét</span>
                                </div>
                              </button>

                              {/* Option 3: Direct Print - Original Printer SVG Logo */}
                              <button
                                type="button"
                                onClick={() => { setShowDownloadMenu(false); handlePrintDirect(); }}
                                className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/70 text-slate-700 hover:text-emerald-700 font-extrabold text-xs flex items-center gap-3 transition-colors cursor-pointer border-t border-slate-100 mt-1 pt-2.5"
                              >
                                <svg className="w-5 h-5 text-slate-900 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M 7 9 V 4.5 A 1.5 1.5 0 0 1 8.5 3 h 7 A 1.5 1.5 0 0 1 17 4.5 V 9" />
                                  <rect x="3" y="9" width="18" height="7" rx="2.5" />
                                  <circle cx="17.5" cy="12.5" r="0.75" fill="currentColor" />
                                  <path d="M 7 15.5 v 4 a 1.5 1.5 0 0 0 1.5 1.5 h 7 a 1.5 1.5 0 0 0 1.5 -1.5 v -4" />
                                </svg>
                                <div className="flex flex-col flex-1">
                                  <span className="font-extrabold text-slate-800 text-xs sm:text-sm">In đề thi trực tiếp</span>
                                  <span className="text-[10px] text-slate-400 font-normal">Xuất lệnh in ra máy in</span>
                                </div>
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Nộp bài Button */}
                      {!isSidebarOpen && (
                        <button
                          type="button"
                          onClick={() => setShowSubmitConfirm(true)}
                          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs sm:text-sm px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap hover:scale-105 active:scale-95"
                        >
                          <span>Nộp bài</span>
                          <span className="text-xs sm:text-sm">➔</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Strict Print CSS Override to Preserve Full Exam Form & Colors */}
                  <style>{`
                    @media print {
                      /* Hide absolutely everything */
                      body * { visibility: hidden !important; }

                      /* Show only the exam paper */
                      #printable-exam-paper-sheet,
                      #printable-exam-paper-sheet * {
                        visibility: visible !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                      }

                      /* Position exam sheet to fill the page */
                      #printable-exam-paper-sheet {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100vw !important;
                        min-height: 100vh !important;
                        padding: 20mm 15mm !important;
                        margin: 0 !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                        overflow: visible !important;
                        font-family: 'Times New Roman', Times, serif !important;
                      }

                      /* Ensure question items don't break across pages */
                      #printable-exam-paper-sheet [id^="q-"] {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                      }

                      /* Options printed as 2 columns */
                      #printable-exam-paper-sheet .options-print-grid {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 4px !important;
                      }

                      /* Make option buttons look like plain text for print */
                      #printable-exam-paper-sheet button {
                        background: none !important;
                        border: none !important;
                        padding: 2px 0 !important;
                        box-shadow: none !important;
                        color: inherit !important;
                        font: inherit !important;
                        display: inline !important;
                        visibility: visible !important;
                        text-align: left !important;
                      }

                      /* Blue separator lines between questions */
                      #printable-exam-paper-sheet .question-divider {
                        display: block !important;
                        visibility: visible !important;
                        border: none !important;
                        border-top: 1px solid #bfdbfe !important;
                        margin: 6px 0 10px 0 !important;
                      }

                      /* Preserve blue colors */
                      #printable-exam-paper-sheet .text-\\[\\#2563eb\\],
                      #printable-exam-paper-sheet .text-\\[\\#0047ba\\],
                      #printable-exam-paper-sheet .text-blue-700,
                      #printable-exam-paper-sheet .text-\\[\\#0055d4\\] {
                        color: #2563eb !important;
                      }

                      /* Page settings */
                      @page {
                        size: A4 portrait;
                        margin: 10mm;
                      }
                    }
                  `}</style>

                  {/* Paper Content Inner Padding */}
                  <div id="printable-exam-paper-sheet" className="p-6 sm:p-12 space-y-8 print:p-0 print:m-0 print:space-y-6">
                  
                  {/* Paper Header Box */}
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-[#0055d4] font-black text-lg tracking-tight">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>FLASHSTUDY</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold">https://flashstudy.vn</span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-blue-700 block">Lê Quốc Tuấn</span>
                        <span className="text-[10px] text-gray-400 block">Anh Giáo Kid</span>
                      </div>
                    </div>

                    {/* Blue Frame Box */}
                    <div className="border-2 border-[#2563eb] rounded-xl grid grid-cols-12 overflow-hidden text-center text-xs font-bold my-4">
                      <div className="col-span-4 border-r-2 border-[#2563eb] p-3 bg-blue-50/50 flex flex-col justify-center">
                        <span className="text-[#2563eb] font-black text-sm uppercase">FLASH STUDY</span>
                        <span className="text-red-600 font-extrabold text-lg mt-1">ĐỀ SỐ 02</span>
                      </div>
                      <div className="col-span-8 p-3 flex flex-col justify-center space-y-1">
                        <span className="text-[#2563eb] font-extrabold text-sm uppercase">ĐỀ KIỂM TRA TOÀN DIỆN</span>
                        <span className="text-blue-900 font-extrabold">MÔN: TOÁN 12</span>
                        <span className="text-gray-500 font-normal italic text-[11px]">Thời gian làm bài: 90 phút (không kể thời gian phát đề)</span>
                      </div>
                    </div>

                    {/* Student Information Lines */}
                    <div className="flex justify-between items-end text-xs text-gray-700 font-medium pt-2">
                      <div className="space-y-2 flex-1 max-w-lg pr-4">
                        <div>Họ và tên: <span className="border-b border-dotted border-gray-400 inline-block w-[75%]" /></div>
                        <div>
                          <span>Số báo danh: <span className="border-b border-dotted border-gray-400 inline-block w-[180px]" /></span>
                        </div>
                      </div>
                      <div className="border-2 border-[#2563eb] rounded-lg w-16 h-20 sm:h-24 flex flex-col items-center pt-1.5 shrink-0 mr-4 sm:mr-8">
                        <span className="text-[11px] font-bold text-[#2563eb]">Điểm</span>
                      </div>
                    </div>
                  </div>

                  {/* Section Title */}
                  <div className="text-[#2563eb] font-extrabold text-xs sm:text-sm">
                    PHẦN I. (3,0 điểm) Câu trắc nghiệm nhiều phương án lựa chọn. Học sinh trả lời từ câu 1 đến câu 12.
                  </div>

                  {/* Questions List */}
                  <div className="space-y-0">
                    {activeExam.questions.map((q, qIdx) => {
                      return (
                        <div key={q.id} id={`q-${qIdx}`} className="space-y-3 pt-5 pb-5">
                          {/* Subtle Blue Divider between questions (not before first) */}
                          {qIdx > 0 && (
                            <hr className="question-divider border-none mb-4" style={{borderTop: '1px solid #bfdbfe', marginBottom: '18px'}} />
                          )}

                          {/* Question Title */}
                          <div className="font-bold text-[#0047ba] text-sm leading-relaxed">
                            <span>Câu {qIdx + 1}. </span>
                            <span className="text-red-500 font-black">[KID] </span>
                            <span className="text-slate-900 font-semibold">{q.content}</span>
                          </div>

                          {/* Options Grid */}
                          <div className="options-print-grid grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const isCurrentOptSelected = userAnswers[q.id] === optIdx;
                              const labels = ['A', 'B', 'C', 'D'];

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => handleSelectOption(q.id, optIdx)}
                                  className={`text-left p-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                                    isCurrentOptSelected
                                      ? 'bg-blue-50 border-[#2563eb] text-[#2563eb] font-bold ring-1 ring-[#2563eb]'
                                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <span className="font-black text-xs shrink-0 w-4">{labels[optIdx]}.</span>
                                  <span>{opt}</span>
                                  {isCurrentOptSelected && <span className="text-[#2563eb] font-black text-xs ml-auto">✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                </div>
              </div>

              {/* RIGHT SIDE: ANSWER BUBBLE SHEET SIDEBAR (Hidden on Print) */}
              {isSidebarOpen && (
                <div className="lg:col-span-4 sticky top-6 space-y-4 animate-fadeIn print:hidden">
                  
                  {/* Top Progress & Red Timer Box */}
                  <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between gap-3 text-xs font-bold">
                      <div className="flex-1 bg-blue-100/80 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#2563eb] h-full rounded-full transition-all duration-300"
                          style={{ width: `${(Object.keys(userAnswers).length / activeExam.questions.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-700 font-mono text-xs shrink-0">
                        {Object.keys(userAnswers).length}/{activeExam.questions.length}
                      </span>
                      <div className="bg-red-500 text-white font-mono font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-2xs shrink-0">
                        ⏱️ {formatTime(timeLeft)}
                      </div>
                    </div>
                  </div>

                  {/* Answer Bubble Sheet Card */}
                  <div className="bg-white rounded-2xl border border-gray-200/90 shadow-md overflow-hidden">
                    
                    {/* Table Header Bar */}
                    <div className="bg-[#2563eb] text-white px-5 py-3 font-extrabold text-xs flex justify-between items-center shadow-xs">
                      <span>Câu</span>
                      <span>Đáp án</span>
                    </div>

                    {/* Section Banner Note */}
                    <div className="bg-blue-50 text-[#1e40af] text-[11px] font-bold p-3 border-b border-blue-100 leading-tight">
                      • PHẦN I. (3,0 ĐIỂM) CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN. HỌC SINH TRẢ LỜI TỪ CÂU 1 ĐẾN CÂU 12.
                    </div>

                    {/* Bubble List Rows */}
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100 p-2">
                      {activeExam.questions.map((q, qIdx) => {
                        const selectedOpt = userAnswers[q.id];

                        return (
                          <div key={q.id} className="py-2 px-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <span className="text-xs font-bold text-gray-700">Câu {qIdx + 1}</span>
                            
                            <div className="flex items-center gap-2">
                              {['A', 'B', 'C', 'D'].map((label, optIdx) => {
                                const isSelected = selectedOpt === optIdx;

                                return (
                                  <button
                                    key={label}
                                    type="button"
                                    onClick={() => handleSelectOption(q.id, optIdx)}
                                    className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#2563eb] text-white border border-[#2563eb] shadow-xs scale-105'
                                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Submit Button inside Sidebar */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                      <button
                        type="button"
                        onClick={() => setShowSubmitConfirm(true)}
                        className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-sm py-3 px-6 rounded-xl w-full transition-all shadow-md hover:shadow-blue-500/20 active:scale-98 cursor-pointer"
                      >
                        Nộp bài
                      </button>
                    </div>

                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* CONFIRM SUBMIT MODAL */}
      {showSubmitConfirm && activeExam && (
        <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-slate-100 shadow-2xl">
            <h3 className="text-xl font-bold mb-3 text-center">Xác Nhận Nộp Bài Thi</h3>

            <div className="bg-slate-900/60 p-4 rounded-2xl mb-6 space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Số câu đã làm:</span>
                <strong className="text-emerald-400">{Object.keys(userAnswers).length} / {activeExam.questions.length} câu</strong>
              </div>
              <div className="flex justify-between">
                <span>Số câu chưa làm:</span>
                <strong className="text-rose-400">{activeExam.questions.length - Object.keys(userAnswers).length} câu</strong>
              </div>
              <div className="flex justify-between">
                <span>Thời gian còn lại:</span>
                <strong className="text-blue-400">{formatTime(timeLeft)}</strong>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-xl font-bold text-sm"
              >
                Tiếp Tục Làm
              </button>
              <button
                onClick={calculateAndShowResult}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/30"
              >
                Đồng Ý Nộp Bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULT MODAL */}
      {examResult && activeExam && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-slate-100 shadow-2xl my-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-3 border border-emerald-500/40">
                🎉
              </div>
              <h2 className="text-2xl font-extrabold text-white">Kết Quả Bài Thi Thử</h2>
              <p className="text-slate-400 text-xs mt-1">{activeExam.title}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/30 rounded-2xl p-6 mb-6 text-center">
              <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-1">
                {examResult.score} <span className="text-2xl font-bold text-slate-400">/ 10</span>
              </div>
              <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Điểm Số Đạt Được
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setExamResult(null)}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-blue-600/30"
              >
                🔍 Xem Lời Giải Chi Tiết
              </button>

              <button
                onClick={() => {
                  setIsExamStarted(false);
                  setActiveExam(null);
                  setExamResult(null);
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3.5 rounded-xl text-sm transition-colors"
              >
                Trở Về Danh Sách Đề
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (embeddedInDashboard) {
    return <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">{viewContent}</div>;
  }

  return <MainLayout overlayHeader={false}>{viewContent}</MainLayout>;
}

export default function MockTestPage() {
  return <MockTestView embeddedInDashboard={false} />;
}

