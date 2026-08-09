import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAuth } from '../context/AuthContext';

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

  // After login redirects back here with ?testId=, reopen that exam's detail screen
  useEffect(() => {
    const testId = new URLSearchParams(window.location.search).get('testId');
    if (testId) {
      const match = MOCK_TESTS_DATA.find((t) => String(t.id) === testId);
      if (match) setSelectedTestDetail(match);
    }
  }, []);

  // Allow anyone (guests included) to open an exam's detail screen without login
  const handleOpenTestDetail = (test) => {
    setSelectedTestDetail(test);
  };

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
              {/* Rank 2 (Left - Silver) */}
              <div className="flex flex-col items-center text-center w-32">
                <div className="relative mb-2">
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl drop-shadow-sm">🥈</span>
                  <div className="w-16 h-16 rounded-full border-2 border-slate-300 p-0.5 bg-white shadow-md overflow-hidden">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-400 to-emerald-600 flex items-center justify-center text-white font-extrabold text-lg">M</div>
                  </div>
                </div>
                <div className="text-sm font-extrabold text-slate-900 truncate w-full">Bùi Đức Mạnh <span className="text-emerald-600 font-black">♂</span></div>
                <span className="inline-block bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-md mt-1 shadow-2xs">🔥 Thách Đấu</span>
                <div className="text-xs font-black text-slate-700 mt-1.5">Tổng: <span className="text-emerald-600 font-extrabold text-sm">10 điểm</span></div>
              </div>

              {/* Rank 1 (Center - Gold Champion) */}
              <div className="flex flex-col items-center text-center w-36 -translate-y-4">
                <div className="relative mb-2">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl drop-shadow-md">👑</span>
                  <div className="w-20 h-20 rounded-full border-4 border-amber-400 p-0.5 bg-white shadow-lg overflow-hidden">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center text-white font-black text-2xl">T</div>
                  </div>
                </div>
                <div className="text-base font-black text-slate-900 truncate w-full">Việt Toàn <span className="text-emerald-600 font-black">♂</span></div>
                <span className="inline-block bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white font-black text-xs px-3 py-0.5 rounded-md mt-1 shadow-xs uppercase">🔥 Thách Đấu</span>
                <div className="text-xs font-black text-amber-600 mt-1.5 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 inline-block shadow-2xs">Tổng: 10 điểm</div>
              </div>

              {/* Rank 3 (Right - Bronze) */}
              <div className="flex flex-col items-center text-center w-32">
                <div className="relative mb-2">
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl drop-shadow-sm">🥉</span>
                  <div className="w-16 h-16 rounded-full border-2 border-amber-700/60 p-0.5 bg-white shadow-md overflow-hidden">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-700 to-orange-800 flex items-center justify-center text-white font-extrabold text-lg">N</div>
                  </div>
                </div>
                <div className="text-sm font-extrabold text-slate-900 truncate w-full">Trần Đăng Nguyên <span className="text-emerald-600 font-black">♂</span></div>
                <span className="inline-block bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-md mt-1 shadow-2xs">🔥 Thách Đấu</span>
                <div className="text-xs font-black text-slate-700 mt-1.5">Tổng: <span className="text-emerald-600 font-extrabold text-sm">10 điểm</span></div>
              </div>
            </div>

            {/* Ranks 4 to 8 List Cards */}
            <div className="space-y-3">
              {[
                { rank: 4, name: 'Tian Nhật Hoàng', gender: '♂', score: '10 Điểm' },
                { rank: 5, name: 'Thủyy Trangg', gender: '♀', score: '10 Điểm' },
                { rank: 6, name: 'Trần Thị Như Quỳnh', gender: '♀', score: '10 Điểm' },
                { rank: 7, name: 'Khưu Bảo', gender: '♂', score: '10 Điểm' },
                { rank: 8, name: 'Thu Huyền', gender: '♀', score: '10 Điểm' }
              ].map((user) => (
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
                        <span className={user.gender === '♀' ? 'text-pink-500 font-black' : 'text-emerald-600 font-black'}>{user.gender}</span>
                      </div>
                      <span className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-[9px] px-2 py-0.5 rounded mt-0.5 inline-block uppercase shadow-2xs">🔥 THÁCH ĐẤU</span>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shrink-0 shadow-2xs">
                    Tổng: <strong className="text-emerald-600 font-extrabold">{user.score}</strong>
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

              {/* ACTION: VÀO PHÒNG THI */}
              <button
                onClick={() => handleStartExam(selectedTestDetail)}
                className="w-full sm:w-auto bg-[#047857] hover:bg-[#035e44] text-white px-8 py-3.5 rounded-2xl font-black text-base transition-all shadow-lg shadow-emerald-600/25 whitespace-nowrap shrink-0 hover:scale-105 cursor-pointer"
              >
                Vào phòng thi
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

      {/* FULLSCREEN EXAM SIMULATOR MODAL MATCHING FLASHSTUDY.VN SCREENSHOT */}
      {isExamStarted && activeExam && (
        <div className="fixed inset-0 z-50 bg-[#eef2f7] flex flex-col text-slate-800 overflow-y-auto select-none font-sans animate-fadeIn">
          
          {/* Header Bar matching screenshot */}
          <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-2xs shrink-0 select-none z-30">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsExamStarted(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-extrabold text-sm transition-colors"
              >
                ←
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#047857] to-[#0088ff] flex items-center justify-center text-white shadow-xs">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-black text-lg text-slate-900 tracking-tight">Flash <span className="text-[#047857]">Study</span></span>
              </div>

              <span className="text-gray-300 font-light text-base mx-1">|</span>

              <h2 className="font-bold text-slate-800 text-sm truncate max-w-xl">
                {activeExam.title}
              </h2>
            </div>
          </header>

          {/* Sub-Header Breadcrumb Bar matching screenshot */}
          <div className="bg-[#f8fafc] border-b border-gray-200/80 px-6 py-2.5 text-xs font-medium text-gray-500 flex items-center gap-2">
            <span>Thi thử</span>
            <span>/</span>
            <span className="truncate max-w-md">{activeExam.title}</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">Làm bài</span>
          </div>

          {/* Main Work Area */}
          <div className="flex-1 p-4 sm:p-8 bg-[#eef2f7] min-h-[calc(100vh-100px)]">
            <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT SIDE: PAPER EXAM SHEET (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Download Button right above paper */}
                <div className="flex justify-end">
                  <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors">
                    Tải xuống 📥
                  </button>
                </div>

                {/* White Paper Sheet Card */}
                <div className="bg-white rounded-2xl border border-gray-200/90 shadow-md p-6 sm:p-12 text-slate-800 space-y-8 min-h-[900px]">
                  
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
                      <div className="space-y-2 flex-1 pr-6">
                        <div>Họ và tên: <span className="border-b border-dotted border-gray-400 inline-block w-[75%]" /></div>
                        <div className="flex justify-between">
                          <span>Số báo danh: <span className="border-b border-dotted border-gray-400 inline-block w-[140px]" /></span>
                          <span>Chữ ký: <span className="border-b border-dotted border-gray-400 inline-block w-[140px]" /></span>
                        </div>
                      </div>
                      <div className="border-2 border-[#2563eb] rounded-lg w-20 h-16 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-[#2563eb]">Điểm</span>
                      </div>
                    </div>
                  </div>

                  {/* Section Title */}
                  <div className="text-[#2563eb] font-extrabold text-xs sm:text-sm">
                    PHẦN I. (3,0 điểm) Câu trắc nghiệm nhiều phương án lựa chọn. Học sinh trả lời từ câu 1 đến câu 12.
                  </div>

                  {/* Questions List */}
                  <div className="space-y-8">
                    {activeExam.questions.map((q, qIdx) => {
                      return (
                        <div key={q.id} id={`q-${qIdx}`} className="space-y-3 pt-2">
                          {/* Question Title */}
                          <div className="font-bold text-[#0047ba] text-sm leading-relaxed">
                            <span>Câu {qIdx + 1}. </span>
                            <span className="text-red-500 font-black">[KID] </span>
                            <span className="text-slate-900 font-semibold">{q.content}</span>
                          </div>

                          {/* Options Grid (A, B on line 1; C, D on line 2) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const isCurrentOptSelected = userAnswers[q.id] === optIdx;

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => handleSelectOption(q.id, optIdx)}
                                  className={`text-left p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                                    isCurrentOptSelected
                                      ? 'bg-blue-50 border-[#2563eb] text-[#2563eb] font-bold ring-1 ring-[#2563eb]'
                                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isCurrentOptSelected && <span className="text-[#2563eb] font-black text-xs">✓</span>}
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

              {/* RIGHT SIDE: ANSWER BUBBLE SHEET SIDEBAR (4 cols) */}
              <div className="lg:col-span-4 sticky top-6 space-y-4">
                
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
                      className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-sm py-3 px-6 rounded-xl w-full transition-all shadow-md hover:shadow-blue-500/20 active:scale-98"
                    >
                      Nộp bài
                    </button>
                  </div>

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

