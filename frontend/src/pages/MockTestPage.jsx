import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';

// Mock Data matching exact screenshot items + interactive questions
const MOCK_TESTS_DATA = [
  {
    id: 1,
    grade: 'Lớp 12',
    subject: 'Toán',
    subjectCode: 'toan',
    coverBg: 'from-blue-600 to-indigo-700',
    title: 'Đề Kiểm Tra Toàn Diện - Đề Số 02 - Lớp 12 - Môn Toán',
    totalQuestions: 34,
    duration: 90,
    questions: [
      {
        id: 101,
        content: 'Cho hàm số y = f(x) có bảng biến thiên trên đoạn [-2; 3]. Giá trị lớn nhất của hàm số f(x) trên đoạn [-2; 3] bằng bao nhiêu?',
        options: [
          'A. Max f(x) = 5 tại x = 1',
          'B. Max f(x) = 3 tại x = 2',
          'C. Max f(x) = 7 tại x = 3',
          'D. Max f(x) = -1 tại x = -2'
        ],
        correctIndex: 2,
        explanation: 'Dựa vào bảng biến thiên trên đoạn [-2; 3], ta thấy f(-2) = 1, f(1) = 5, f(3) = 7. Vậy giá trị lớn nhất của f(x) trên [-2; 3] là 7 tại x = 3.'
      },
      {
        id: 102,
        content: 'Tích phân I = ∫[0 đến 1] (3x² + 2x + 1) dx có giá trị bằng:',
        options: ['A. 2', 'B. 3', 'C. 4', 'D. 5'],
        correctIndex: 1,
        explanation: 'Ta có F(x) = x³ + x² + x. Do đó I = F(1) - F(0) = (1 + 1 + 1) - 0 = 3.'
      },
      {
        id: 103,
        content: 'Trong không gian Oxyz, mặt phẳng (P): 2x - y + 3z - 5 = 0 có một vectơ pháp tuyến là:',
        options: ['A. n = (2; -1; 3)', 'B. n = (2; 1; 3)', 'C. n = (2; -1; -5)', 'D. n = (-2; 1; 3)'],
        correctIndex: 0,
        explanation: 'Phương trình mặt phẳng Ax + By + Cz + D = 0 có VTPT n = (A; B; C) = (2; -1; 3).'
      }
    ]
  },
  {
    id: 2,
    grade: 'Lớp 12',
    subject: 'Vật Lý',
    subjectCode: 'ly',
    coverBg: 'from-blue-600 to-indigo-700',
    title: 'Đề Kiểm Tra Toàn Diện - Đề Số 01 - Lớp 12 - Môn Vật Lý',
    totalQuestions: 40,
    duration: 50,
    questions: [
      {
        id: 201,
        content: 'Một con lắc đơn có chiều dài l = 1m dao động điều hòa tại nơi có g = π² m/s². Chu kỳ dao động T của con lắc là:',
        options: ['A. 1 s', 'B. 2 s', 'C. 1.5 s', 'D. 0.5 s'],
        correctIndex: 1,
        explanation: 'Công thức T = 2π√(l/g) = 2π√(1/π²) = 2 giây.'
      }
    ]
  },
  {
    id: 3,
    grade: 'Lớp 12',
    subject: 'Hóa Học',
    subjectCode: 'hoa',
    coverBg: 'from-blue-600 to-indigo-700',
    title: 'Đề Kiểm Tra Toàn Diện - Đề Số 01 - Lớp 12 - Môn Hóa Học',
    totalQuestions: 40,
    duration: 50,
    questions: [
      {
        id: 301,
        content: 'Chất nào sau đây là este no, đơn chức, mạch hở?',
        options: ['A. HCOOCH₃', 'B. CH₂=CH-COOCH₃', 'C. C₆H₅COOCH₃', 'D. (HCOO)₂C₂H₄'],
        correctIndex: 0,
        explanation: 'HCOOCH₃ (Metyl fomat) có công thức C₂H₄O₂ thuộc dãy đồng đẳng este no, đơn chức, mạch hở.'
      }
    ]
  },
  {
    id: 4,
    grade: 'Lớp 12',
    subject: 'Tiếng Anh',
    subjectCode: 'anh',
    coverBg: 'from-blue-600 to-indigo-700',
    title: 'Đề Kiểm Tra Toàn Diện - Lớp 12 - Đề số 01 - Môn Tiếng Anh',
    totalQuestions: 35,
    duration: 60,
    questions: [
      {
        id: 401,
        content: 'Mark the letter A, B, C, or D to indicate the word whose underlined part differs from the other three in pronunciation:',
        options: ['A. published', 'B. ordered', 'C. adopted', 'D. started'],
        correctIndex: 1,
        explanation: '"ordered" kết thúc bằng âm hữu thanh nên đuôi -ed được phát âm là /d/.'
      }
    ]
  },
  {
    id: 5,
    grade: 'Lớp 12',
    subject: 'Toán',
    subjectCode: 'toan',
    coverBg: 'from-blue-600 to-indigo-700',
    title: 'Đề Kiểm Tra Toàn Diện - Đề Số 01',
    totalQuestions: 34,
    duration: 90,
    questions: [
      {
        id: 501,
        content: 'Nghiệm của phương trình 2^(x - 1) = 8 là:',
        options: ['A. x = 4', 'B. x = 3', 'C. x = 2', 'D. x = 5'],
        correctIndex: 0,
        explanation: '2^(x-1) = 2^3 => x - 1 = 3 => x = 4.'
      }
    ]
  },
  {
    id: 6,
    grade: 'Lớp 12',
    subject: 'Toán',
    subjectCode: 'toan',
    coverBg: 'from-blue-600 to-indigo-700',
    title: 'Đề Kiểm Tra Đánh Giá Kiến Thức Hàm Số - Đề Số 01',
    totalQuestions: 34,
    duration: 90,
    questions: [
      {
        id: 601,
        content: 'Đồ thị hàm số y = (2x + 1)/(x - 1) có đường tiệm cận đứng là:',
        options: ['A. x = 1', 'B. y = 2', 'C. x = -1', 'D. y = 1'],
        correctIndex: 0,
        explanation: 'Tiệm cận đứng là nghiệm của mẫu số x - 1 = 0 => x = 1.'
      }
    ]
  },
  {
    id: 7,
    grade: 'Lớp 12',
    subject: 'Toán',
    subjectCode: 'toan',
    coverBg: 'from-blue-600 to-indigo-700',
    title: 'Đề Kiểm Tra Đánh Giá Kiến Thức Hàm Số - Đề Số 02',
    totalQuestions: 34,
    duration: 90,
    questions: [
      {
        id: 701,
        content: 'Hàm số y = x³ - 3x + 2 đồng biến trên khoảng nào dưới đây?',
        options: ['A. (-∞; -1) và (1; +∞)', 'B. (-1; 1)', 'C. (-∞; 1)', 'D. (-1; +∞)'],
        correctIndex: 0,
        explanation: 'y\' = 3x² - 3 = 0 <=> x = ±1. y\' > 0 khi x < -1 hoặc x > 1.'
      }
    ]
  },
  {
    id: 8,
    grade: 'Lớp 9',
    subject: 'Toán',
    subjectCode: 'toan',
    isBookCover: true,
    title: 'Tỉ Số Lượng Giác',
    totalQuestions: 15,
    duration: 30,
    questions: [
      {
        id: 801,
        content: 'Trong tam giác ABC vuông tại A có AB = 3, AC = 4, BC = 5. Giá trị sin B bằng:',
        options: ['A. 4/5', 'B. 3/5', 'C. 4/3', 'D. 3/4'],
        correctIndex: 0,
        explanation: 'sin B = đối / huyền = AC / BC = 4/5.'
      }
    ]
  },
  {
    id: 9,
    grade: 'Lớp 11',
    subject: 'Toán',
    subjectCode: 'toan',
    coverBg: 'from-blue-600 to-indigo-700',
    title: 'Đề Kiểm Tra Định Kỳ - Đề Số 06 - Lớp 11 - Môn Toán',
    totalQuestions: 35,
    duration: 60,
    questions: [
      {
        id: 901,
        content: 'Phương trình sin x = 1/2 có nghiệm là:',
        options: ['A. x = π/6 + k2π hoặc x = 5π/6 + k2π', 'B. x = π/3 + k2π', 'C. x = π/4 + k2π', 'D. x = -π/6 + k2π'],
        correctIndex: 0,
        explanation: 'sin x = sin(π/6) => x = π/6 + k2π hoặc x = π - π/6 + k2π = 5π/6 + k2π.'
      }
    ]
  },
  {
    id: 10,
    grade: 'Lớp 12',
    subject: 'Toán',
    subjectCode: 'toan',
    coverBg: 'from-blue-600 to-indigo-700',
    title: 'Đề Kiểm Tra Định Kỳ - Đề Số 05 - Lớp 12 - Môn Toán',
    totalQuestions: 40,
    duration: 90,
    questions: [
      {
        id: 1001,
        content: 'Trong không gian Oxyz, cho hai điểm A(1; 2; 3) và B(3; 4; 5). Trung điểm I của đoạn thẳng AB có tọa độ là:',
        options: ['A. (2; 3; 4)', 'B. (4; 6; 8)', 'C. (1; 1; 1)', 'D. (2; 2; 2)'],
        correctIndex: 0,
        explanation: 'I = ((1+3)/2; (2+4)/2; (3+5)/2) = (2; 3; 4).'
      }
    ]
  }
];

export function MockTestView({ embeddedInDashboard = false }) {
  const [selectedGrade, setSelectedGrade] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTestDetail, setSelectedTestDetail] = useState(null); // Pre-Exam Leaderboard Screen state

  // Interactive Simulator State
  const [activeExam, setActiveExam] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [examResult, setExamResult] = useState(null);

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
  const filteredTests = MOCK_TESTS_DATA.filter((test) => {
    const matchesGrade = selectedGrade === 'Tất cả' || test.grade === selectedGrade;
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

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
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const viewContent = selectedTestDetail ? (
    /* PRE-EXAM LEADERBOARD & HISTORY DETAIL SCREEN matching exact user screenshot */
    <div className="bg-[#f0f7ff] min-h-screen pb-12 select-none">
      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-3.5 px-6">
        <div className="max-w-[1240px] mx-auto flex items-center gap-2 text-xs font-semibold text-gray-500">
          <button onClick={() => setSelectedTestDetail(null)} className="hover:text-blue-600 transition-colors">
            Thi thử
          </button>
          <span>/</span>
          <span className="text-gray-900 font-bold truncate">{selectedTestDetail.title}</span>
        </div>
      </div>

      {/* Main Container */}
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
                  <div className="w-13 h-13 rounded-full border-2 border-amber-600/50 p-0.5 bg-white shadow-xs overflow-hidden">
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
                    {selectedTestDetail.subject || 'Toán'}
                  </div>
                  <div className="text-[12px] font-black text-blue-100 uppercase">
                    {selectedTestDetail.grade?.toUpperCase() || 'LỚP 12'}
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-snug mb-2">
                    {selectedTestDetail.title}
                  </h2>
                  <div className="space-y-1 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      <span>Tổng số câu: <strong className="text-slate-800 font-bold">{selectedTestDetail.totalQuestions}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <span>Thời gian làm bài: <strong className="text-slate-800 font-bold">{selectedTestDetail.duration} phút</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION: VÀO PHÒNG THI */}
              <button
                onClick={() => handleStartExam(selectedTestDetail)}
                className="w-full sm:w-auto bg-[#0256d0] hover:bg-[#0147b3] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md shadow-blue-500/20 whitespace-nowrap shrink-0 hover:scale-105"
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
                    {examResult ? (
                      <tr className="border-b border-slate-100 font-semibold">
                        <td className="py-3 px-4 text-slate-800">{examResult.submittedAt}</td>
                        <td className="py-3 px-4 text-slate-600">{formatTime(examResult.timeSpentSeconds)}</td>
                        <td className="py-3 px-4 font-black text-emerald-600">{examResult.score} / 10</td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => setExamResult(examResult)} className="text-blue-600 hover:underline font-bold">Xem kết quả</button>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 font-semibold italic">
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
    </div>
  ) : (
    <>
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
                  className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                    active
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
                      <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[#0256d0] transition-colors leading-snug mb-2 line-clamp-2">
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
                      onClick={() => setSelectedTestDetail(test)}
                      className="bg-[#0256d0] hover:bg-[#0147b3] text-white px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-xs"
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

      {/* FULLSCREEN EXAM SIMULATOR MODAL */}
      {isExamStarted && activeExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col text-slate-100 overflow-hidden animate-fadeIn">
          
          {/* Header */}
          <header className="bg-slate-800/90 border-b border-slate-700 px-4 sm:px-8 py-3.5 flex items-center justify-between select-none">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <h2 className="font-bold text-white text-sm sm:text-base line-clamp-1">
                  {activeExam.title}
                </h2>
                <span className="text-xs text-slate-400">Hệ thống thi trực tuyến Flash Study</span>
              </div>
            </div>

            {/* Timer & Controls */}
            <div className="flex items-center gap-4">
              <div className={`px-4 py-1.5 rounded-xl font-mono font-extrabold text-lg sm:text-xl border transition-colors flex items-center gap-2 ${
                timeLeft < 300 ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' : 'bg-blue-500/20 text-blue-300 border-blue-400/40'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatTime(timeLeft)}</span>
              </div>

              {!examResult && (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/30"
                >
                  Nộp Bài Thi
                </button>
              )}
            </div>
          </header>

          {/* Simulator Workspace */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Main Question View */}
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-4xl mx-auto w-full">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                <span className="text-sm font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                  Câu hỏi {currentQIndex + 1} / {activeExam.questions.length}
                </span>

                <button
                  onClick={() => handleToggleFlag(activeExam.questions[currentQIndex].id)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                    flaggedQuestions[activeExam.questions[currentQIndex].id]
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <span>{flaggedQuestions[activeExam.questions[currentQIndex].id] ? '🚩 Đã đánh dấu xem lại' : '🏳️ Đánh dấu xem lại'}</span>
                </button>
              </div>

              {/* Question Text */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 mb-6 shadow-inner">
                <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                  {activeExam.questions[currentQIndex].content}
                </p>
              </div>

              {/* Option Choices */}
              <div className="space-y-3 mb-8">
                {activeExam.questions[currentQIndex].options.map((opt, idx) => {
                  const qId = activeExam.questions[currentQIndex].id;
                  const isSelected = userAnswers[qId] === idx;
                  const isCorrect = activeExam.questions[currentQIndex].correctIndex === idx;

                  let borderStyle = 'border-slate-700 hover:border-slate-500 bg-slate-800/40';
                  if (isSelected && !examResult) {
                    borderStyle = 'border-blue-500 bg-blue-500/20 text-blue-200 ring-1 ring-blue-500';
                  }

                  if (examResult) {
                    if (isCorrect) {
                      borderStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold';
                    } else if (isSelected && !isCorrect) {
                      borderStyle = 'border-rose-500 bg-rose-500/20 text-rose-200 line-through';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !examResult && handleSelectOption(qId, idx)}
                      className={`w-full text-left p-4 rounded-xl border text-sm sm:text-base transition-all flex items-center justify-between ${borderStyle}`}
                    >
                      <span className="font-medium">{opt}</span>
                      {isSelected && !examResult && (
                        <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">✓</span>
                      )}
                      {examResult && isCorrect && (
                        <span className="text-emerald-400 font-bold text-xs bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">Đáp án đúng</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation in Review Mode */}
              {examResult && (
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 mb-6 text-sm text-emerald-200">
                  <h4 className="font-bold text-emerald-300 mb-2 flex items-center gap-2">
                    💡 Lời Giải Chi Tiết Từ Giáo Viên:
                  </h4>
                  <p className="leading-relaxed">
                    {activeExam.questions[currentQIndex].explanation}
                  </p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-sm font-bold transition-colors"
                >
                  ← Câu Trước
                </button>

                <button
                  disabled={currentQIndex === activeExam.questions.length - 1}
                  onClick={() => setCurrentQIndex((prev) => Math.min(activeExam.questions.length - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-sm font-bold transition-colors"
                >
                  Câu Tiếp →
                </button>
              </div>
            </div>

            {/* Sidebar Matrix */}
            <div className="w-72 bg-slate-800/80 border-l border-slate-700/80 p-5 hidden md:flex flex-col justify-between select-none">
              <div>
                <h3 className="font-bold text-sm text-slate-200 mb-4 pb-2 border-b border-slate-700">
                  Danh Sách Câu Hỏi ({Object.keys(userAnswers).length}/{activeExam.questions.length})
                </h3>

                <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto pr-1">
                  {activeExam.questions.map((q, idx) => {
                    const isSelected = userAnswers[q.id] !== undefined;
                    const isFlagged = flaggedQuestions[q.id];
                    const isCurrent = currentQIndex === idx;

                    let bgClass = 'bg-slate-700/60 text-slate-300 hover:bg-slate-700';
                    if (isSelected) bgClass = 'bg-blue-600 text-white font-bold';
                    if (isFlagged) bgClass = 'bg-amber-500 text-slate-950 font-bold';
                    if (isCurrent) bgClass += ' ring-2 ring-white shadow-lg';

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQIndex(idx)}
                        className={`h-10 rounded-lg text-xs font-semibold flex items-center justify-center transition-all relative ${bgClass}`}
                      >
                        {idx + 1}
                        {isFlagged && <span className="absolute -top-1 -right-1 text-[10px]">🚩</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRM SUBMIT MODAL */}
      {showSubmitConfirm && activeExam && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
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
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
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
