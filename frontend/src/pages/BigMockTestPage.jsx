import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAuth } from '../context/AuthContext';

// ⛈ Hyper-Realistic Thunderstorm Cloud & Spiderweb Lightning SVG Component (Exact Match to User Photo)
const RealLightningStrikeOverlay = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Ambient Sky White-Blue Strobe Flash */}
    <div className="absolute inset-0 animate-sky-flash transition-opacity pointer-events-none" />

    {/* Volumetric Glowing Thundercloud Nebulas (Origin Clouds) */}
    <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[300px] thunder-cloud-origin animate-cloud-pulse pointer-events-none" />
    <div className="absolute top-0 right-1/4 translate-x-1/2 w-[600px] h-[300px] thunder-cloud-origin animate-cloud-pulse pointer-events-none" />

    {/* ⚡ STRIKE 1: Giant Central Spiderweb Thunderbolt (Matching User Photo) */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[900px] origin-top animate-lightning-strike-1">
      <svg className="w-full h-full" viewBox="0 0 600 900" fill="none" xmlns="http://www.w3.org/2000/svg">

        {/* Outer Deep Blue Electric Plasma Glow Layer */}
        <path
          d="M 300 0 L 270 90 L 320 110 L 250 210 L 330 230 L 220 380 L 310 400 L 190 590 L 260 610 L 170 780 L 220 790 L 130 900"
          stroke="#0088ff"
          strokeWidth="20"
          strokeOpacity="0.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Medium Electric Cyan Halo Layer */}
        <path
          d="M 300 0 L 270 90 L 320 110 L 250 210 L 330 230 L 220 380 L 310 400 L 190 590 L 260 610 L 170 780 L 220 790 L 130 900"
          stroke="#00f0ff"
          strokeWidth="12"
          strokeOpacity="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Blinding White Core Lightning Trunk */}
        <path
          d="M 300 0 L 270 90 L 320 110 L 250 210 L 330 230 L 220 380 L 310 400 L 190 590 L 260 610 L 170 780 L 220 790 L 130 900"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_25px_#ffffff] drop-shadow-[0_0_60px_#00f0ff]"
        />

        {/* 🕸 DENSE SPIDERWEB BRANCHING TENDRILS (Matching Photo) */}
        <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Upper Cloud Branches */}
          <path d="M 270 90 L 210 140 L 160 160 M 210 140 L 230 180" />
          <path d="M 320 110 L 390 150 L 440 170 M 390 150 L 370 200" />

          {/* Mid Section Spiderweb Mesh */}
          <path d="M 250 210 L 170 270 L 120 300 M 170 270 L 190 330 L 160 380" />
          <path d="M 330 230 L 420 290 L 470 320 M 420 290 L 400 350 L 450 400" />
          <path d="M 220 380 L 140 440 L 90 470 M 140 440 L 160 500 M 90 470 L 60 520" />
          <path d="M 310 400 L 390 460 L 430 490 M 390 460 L 360 520 M 430 490 L 460 550" />

          {/* Lower Fine Root Tendrils */}
          <path d="M 190 590 L 120 660 L 70 700 M 120 660 L 140 730 M 70 700 L 40 760" />
          <path d="M 260 610 L 330 670 L 380 710 M 330 670 L 310 740 M 380 710 L 410 780" />
          <path d="M 170 780 L 110 830 L 80 870" />
        </g>

        {/* Micro Cyan Hair Tendrils */}
        <g stroke="#00f0ff" strokeWidth="1.5" strokeOpacity="0.9" className="animate-tendril-flicker">
          <path d="M 160 160 L 130 180 M 440 170 L 480 190 M 120 300 L 80 320 M 470 320 L 520 340" />
          <path d="M 60 520 L 30 540 M 460 550 L 500 580 M 40 760 L 10 790 M 410 780 L 450 810" />
        </g>
      </svg>
    </div>

    {/* ⚡ STRIKE 2: Top-Left Secondary Spiderweb Thunderbolt */}
    <div className="absolute top-[5%] left-[2%] w-[420px] h-[750px] origin-top animate-lightning-strike-2">
      <svg className="w-full h-full" viewBox="0 0 420 750" fill="none">
        <path
          d="M 210 0 L 180 110 L 230 130 L 150 270 L 220 290 L 120 460 L 180 480 L 90 650 L 140 660 L 60 750"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_20px_#ffffff] drop-shadow-[0_0_50px_#00f0ff]"
        />
        <path
          d="M 210 0 L 180 110 L 230 130 L 150 270 L 220 290 L 120 460 L 180 480 L 90 650 L 140 660 L 60 750"
          stroke="#00f0ff"
          strokeWidth="10"
          strokeOpacity="0.7"
        />
        {/* Tendril Branches */}
        <path d="M 180 110 L 110 180 L 70 210 M 230 130 L 300 200 L 340 230" stroke="#ffffff" strokeWidth="2" />
        <path d="M 150 270 L 80 340 L 40 370 M 220 290 L 290 360 L 330 390" stroke="#00f0ff" strokeWidth="2" />
      </svg>
    </div>

    {/* ⚡ STRIKE 3: Top-Right Secondary Spiderweb Thunderbolt */}
    <div className="absolute top-[5%] right-[2%] w-[440px] h-[780px] origin-top animate-lightning-strike-3">
      <svg className="w-full h-full" viewBox="0 0 440 780" fill="none">
        <path
          d="M 220 0 L 250 120 L 200 140 L 290 280 L 230 300 L 330 480 L 270 500 L 370 680 L 320 690 L 400 780"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_20px_#ffffff] drop-shadow-[0_0_50px_#00f0ff]"
        />
        <path
          d="M 220 0 L 250 120 L 200 140 L 290 280 L 230 300 L 330 480 L 270 500 L 370 680 L 320 690 L 400 780"
          stroke="#00f0ff"
          strokeWidth="10"
          strokeOpacity="0.7"
        />
        {/* Tendril Branches */}
        <path d="M 250 120 L 330 190 L 370 210 M 200 140 L 130 210 L 90 230" stroke="#ffffff" strokeWidth="2" />
        <path d="M 290 280 L 370 350 L 410 380 M 230 300 L 160 370 L 120 400" stroke="#00f0ff" strokeWidth="2" />
      </svg>
    </div>
  </div>
);

// 🔌 Animated Circuit Board Traces & Cyber Grid Background Component
const CyberCircuitTracesBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Full Page SVG Circuit Board Tracks */}
    <svg className="w-full h-full opacity-80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="circuitGlowWhiteCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>

      {/* Static Circuit Track Lines Background */}
      <g stroke="rgba(0, 240, 255, 0.25)" strokeWidth="2" fill="none">
        {/* Left Circuit Bus */}
        <path d="M 0 150 L 150 150 L 220 220 L 220 550 L 120 650 L 0 650" />
        <path d="M 0 200 L 120 200 L 180 260 L 180 500 L 80 600 L 0 600" />
        {/* Right Circuit Bus */}
        <path d="M 1920 150 L 1770 150 L 1700 220 L 1700 550 L 1800 650 L 1920 650" />
        <path d="M 1920 200 L 1800 200 L 1740 260 L 1740 500 L 1840 600 L 1920 600" />
        {/* Center Connecting Traces */}
        <path d="M 300 0 L 300 120 L 450 270 L 1470 270 L 1620 120 L 1620 0" />
        <path d="M 500 0 L 500 180 L 600 280 L 1320 280 L 1420 180 L 1420 0" />
      </g>

      {/* Animated Glowing Electric Current Pulses Moving Along Circuit Traces */}
      <g fill="none" strokeWidth="4" strokeLinecap="round">
        <path
          d="M 0 150 L 150 150 L 220 220 L 220 550 L 120 650 L 0 650"
          stroke="url(#circuitGlowWhiteCyan)"
          className="animate-circuit-flow"
        />
        <path
          d="M 0 200 L 120 200 L 180 260 L 180 500 L 80 600 L 0 600"
          stroke="url(#circuitGlowWhiteCyan)"
          className="animate-circuit-flow-fast"
        />
        <path
          d="M 1920 150 L 1770 150 L 1700 220 L 1700 550 L 1800 650 L 1920 650"
          stroke="url(#circuitGlowWhiteCyan)"
          className="animate-circuit-flow"
        />
        <path
          d="M 1920 200 L 1800 200 L 1740 260 L 1740 500 L 1840 600 L 1920 600"
          stroke="url(#circuitGlowWhiteCyan)"
          className="animate-circuit-flow-fast"
        />
        <path
          d="M 300 0 L 300 120 L 450 270 L 1470 270 L 1620 120 L 1620 0"
          stroke="url(#circuitGlowWhiteCyan)"
          className="animate-circuit-flow"
        />
      </g>

      {/* Glowing Circuit Node Junction Dots */}
      <g fill="#ffffff" className="animate-pulse">
        <circle cx="150" cy="150" r="5" className="drop-shadow-[0_0_12px_#00f0ff]" />
        <circle cx="220" cy="220" r="5" className="drop-shadow-[0_0_12px_#00f0ff]" />
        <circle cx="220" cy="550" r="5" className="drop-shadow-[0_0_12px_#00f0ff]" />
        <circle cx="1770" cy="150" r="5" className="drop-shadow-[0_0_12px_#00f0ff]" />
        <circle cx="1700" cy="220" r="5" className="drop-shadow-[0_0_12px_#00f0ff]" />
        <circle cx="1700" cy="550" r="5" className="drop-shadow-[0_0_12px_#00f0ff]" />
        <circle cx="450" cy="270" r="5" className="drop-shadow-[0_0_12px_#00f0ff]" />
        <circle cx="1470" cy="270" r="5" className="drop-shadow-[0_0_12px_#00f0ff]" />
      </g>
    </svg>

    {/* Concentric Rotating HUD Rings */}
    <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full border-2 border-dashed border-cyan-400/30 animate-hud-spin" />
    <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full border-2 border-dashed border-cyan-400/30 animate-hud-spin-reverse" />
  </div>
);

// Mock Data matching exact game UI screenshot items
const GAME_SESSIONS_DATA = [
  {
    id: 1,
    title: 'Đợt 1',
    period: 'T12/2025',
    element: 'water',
    name: 'Đợt 1 - Băng Thủy (Tháng 12)',
    status: 'ACTIVE',
    colorHeader: 'from-[#00c6ff] to-[#0072ff]',
    cardBorder: 'border-cyan-300',
    cardGlow: 'shadow-[0_0_45px_rgba(0,210,255,0.75)]',
    bgGradient: 'from-[#127294] via-[#0a516b] to-[#00a3e0]',
    accentColor: '#00d2ff',
    watermarkSvg: (
      <svg className="w-48 h-48 text-cyan-200/40" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 5 C30 35 15 50 15 70 A35 35 0 0 0 85 70 C85 50 70 35 50 5 Z M40 60 C40 50 50 45 55 55 C58 60 55 70 45 70 C38 70 36 65 40 60 Z" />
      </svg>
    ),
    subjects: ['Toán', 'Vật Lý', 'Hóa Học', 'Tiếng Anh'],
    examinations: [
      { id: 101, code: 'TOAN-01', name: 'Đề số 01 - Đợt 1 - Mùa 1 (Môn Toán)', duration: 90, totalQuestions: 50 },
      { id: 102, code: 'LY-01', name: 'Đề số 01 - Đợt 1 - Mùa 1 (Môn Vật Lý)', duration: 50, totalQuestions: 40 },
      { id: 103, code: 'HOA-01', name: 'Đề số 01 - Đợt 1 - Mùa 1 (Môn Hóa Học)', duration: 50, totalQuestions: 40 }
    ]
  },
  {
    id: 2,
    title: 'Đợt 2',
    period: 'T1/2026',
    element: 'fire',
    name: 'Đợt 2 - Rực Hỏa (Tháng 1)',
    status: 'ACTIVE',
    colorHeader: 'from-[#ff512f] to-[#dd2476]',
    cardBorder: 'border-rose-300',
    cardGlow: 'shadow-[0_0_45px_rgba(255,81,47,0.75)]',
    bgGradient: 'from-[#b82a2a] via-[#851818] to-[#e64a4a]',
    accentColor: '#ff4d4d',
    watermarkSvg: (
      <svg className="w-48 h-48 text-rose-200/40" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 5 C55 25 75 35 75 60 C75 80 60 95 45 95 C30 95 20 82 25 65 C28 53 38 45 42 35 C45 28 42 18 50 5 Z M48 50 C40 60 45 75 55 80 C65 75 62 60 52 55 C48 52 46 48 48 50 Z" />
      </svg>
    ),
    subjects: ['Toán', 'Vật Lý', 'Hóa Học', 'Tiếng Anh'],
    examinations: [
      { id: 201, code: 'TOAN-02', name: 'Đề số 02 - Đợt 2 - Mùa 1 (Môn Toán)', duration: 90, totalQuestions: 50 },
      { id: 202, code: 'LY-02', name: 'Đề số 02 - Đợt 2 - Mùa 1 (Môn Vật Lý)', duration: 50, totalQuestions: 40 }
    ]
  },
  {
    id: 3,
    title: 'Đợt 3',
    period: 'T3/2026',
    element: 'wood',
    name: 'Đợt 3 - Phong Mộc (Tháng 3)',
    status: 'UPCOMING',
    colorHeader: 'from-[#11998e] to-[#38ef7d]',
    cardBorder: 'border-emerald-300',
    cardGlow: 'shadow-[0_0_45px_rgba(56,239,125,0.75)]',
    bgGradient: 'from-[#158051] via-[#0b5435] to-[#25b865]',
    accentColor: '#2ecc71',
    watermarkSvg: (
      <svg className="w-48 h-48 text-emerald-200/40" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 10 C75 30 85 60 65 85 C45 100 15 80 20 50 C25 30 40 20 50 10 Z M45 40 C35 50 40 70 55 70 C65 65 60 45 50 45 Z" />
      </svg>
    ),
    subjects: ['Toán', 'Vật Lý', 'Hóa Học', 'Tiếng Anh'],
    examinations: [
      { id: 301, code: 'TOAN-03', name: 'Đề số 03 - Đợt 3 - Mùa 1 (Môn Toán)', duration: 90, totalQuestions: 50 }
    ]
  },
  {
    id: 4,
    title: 'Đợt 4',
    period: 'T5/2026',
    element: 'shadow',
    name: 'Đợt 4 - Huyền Kim (Tháng 5)',
    status: 'UPCOMING',
    colorHeader: 'from-[#4facfe] to-[#00f2fe]',
    cardBorder: 'border-sky-300',
    cardGlow: 'shadow-[0_0_45px_rgba(79,172,254,0.75)]',
    bgGradient: 'from-[#2b689e] via-[#1a4972] to-[#38bdf8]',
    accentColor: '#38bdf8',
    watermarkSvg: (
      <svg className="w-48 h-48 text-sky-200/40" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 10 L85 30 L75 80 L50 95 L25 80 L15 30 Z M50 30 L35 70 L65 70 Z" />
      </svg>
    ),
    subjects: ['Toán', 'Vật Lý', 'Hóa Học', 'Tiếng Anh'],
    examinations: [
      { id: 401, code: 'TOAN-04', name: 'Đề số 04 - Đợt 4 - Mùa 1 (Môn Toán)', duration: 90, totalQuestions: 50 }
    ]
  }
];

// Leaderboard Top 3 Podium Users
const TOP3_PODIUM_USERS = [
  {
    rank: 1,
    name: 'Phương Anh',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Hà Nội - Amsterdam',
    parts: [3, 4, 3],
    total: 10,
    badgeBg: 'from-amber-400 via-yellow-500 to-amber-600',
    borderColor: 'border-amber-400',
    glowColor: 'shadow-[0_0_40px_rgba(251,191,36,0.8)]',
    titleTag: 'TOP 1'
  },
  {
    rank: 2,
    name: 'Phan Anh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Lê Hồng Phong',
    parts: [3, 4, 3],
    total: 10,
    badgeBg: 'from-slate-300 via-cyan-200 to-slate-400',
    borderColor: 'border-cyan-300',
    glowColor: 'shadow-[0_0_35px_rgba(103,232,249,0.7)]',
    titleTag: 'TOP 2'
  },
  {
    rank: 3,
    name: 'Phạm Long',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Quốc Học Huế',
    parts: [3, 4, 3],
    total: 10,
    badgeBg: 'from-red-400 via-rose-500 to-amber-700',
    borderColor: 'border-rose-400',
    glowColor: 'shadow-[0_0_35px_rgba(244,63,94,0.7)]',
    titleTag: 'TOP 3'
  }
];

// Full Leaderboard Table Data
const LEADERBOARD_ROWS = [
  { rank: 3, name: 'Ngọc anh', part1: 3, part2: 4, part3: 3, total: 10 },
  { rank: 4, name: 'minh quân leo top', part1: 3, part2: 4, part3: 3, total: 10 },
  { rank: 5, name: 'Nguyễn Bình', part1: 3, part2: 4, part3: 3, total: 10 },
  { rank: 6, name: 'Minh Quân', part1: 3, part2: 4, part3: 3, total: 10 },
  { rank: 7, name: 'Nguyễn Ngọc Long', part1: 3, part2: 4, part3: 3, total: 10 },
  { rank: 8, name: 'Lang Anh', part1: 3, part2: 4, part3: 3, total: 10 },
  { rank: 9, name: 'phạm gia huy', part1: 3, part2: 4, part3: 3, total: 10 },
  { rank: 10, name: 'Vũ Quốc Việt', part1: 3, part2: 3, part3: 3, total: 9 }
];

// Interactive Test Questions
const INTERACTIVE_QUESTIONS = [
  {
    id: 1,
    content: 'Cho hàm số y = f(x) liên tục trên đoạn [-2; 3] và có bảng biến thiên như sau. Giá trị lớn nhất của f(x) trên [-2; 3] bằng bao nhiêu?',
    options: ['A. Max f(x) = 5 tại x = 1', 'B. Max f(x) = 3 tại x = 2', 'C. Max f(x) = 7 tại x = 3', 'D. Max f(x) = -1 tại x = -2'],
    correct: 0
  },
  {
    id: 2,
    content: 'Trong không gian Oxyz, cho mặt phẳng (P): 2x - y + 3z - 6 = 0. Vectơ nào sau đây là một vectơ pháp tuyến của (P)?',
    options: ['A. n = (2; -1; 3)', 'B. n = (2; 1; 3)', 'C. n = (2; -1; -6)', 'D. n = (-2; 1; 3)'],
    correct: 0
  }
];

export default function BigMockTestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedExamModal, setSelectedExamModal] = useState(false);
  const [currentSession, setCurrentSession] = useState(GAME_SESSIONS_DATA[0]);
  const [selectedExam, setSelectedExam] = useState(null);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [isInTestRoom, setIsInTestRoom] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default: Full-Page Exam Paper Sheet; 3-bars button toggles right answer sheet
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const [timeLeft, setTimeLeft] = useState(5400); // 90 mins
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const [filterDot, setFilterDot] = useState('Đợt 1');
  const [filterDe, setFilterDe] = useState('Đề số 01 - Đợt 1 - Mùa 1');

  const handleCardClick = (session) => {
    setCurrentSession(session);
    if (session.examinations && session.examinations.length > 0) {
      setSelectedExam(session.examinations[0]);
    }
    setSelectedExamModal(true);
  };

  const handleStartExamFlow = () => {
    setSelectedExamModal(false);
    setShowFullscreenPrompt(true);
  };

  const handleEnterFullscreenTest = () => {
    setShowFullscreenPrompt(false);
    setIsInTestRoom(true);
    setTimeLeft(5400);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => { });
    }
  };

  useEffect(() => {
    let timer = null;
    if (isInTestRoom && !showResultModal && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowResultModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isInTestRoom, showResultModal, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleExitTestRoom = () => {
    setIsInTestRoom(false);
    setShowResultModal(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => { });
    }
  };

  // Dedicated Handlers for Tải tài liệu (.docx), Tải file PDF (.pdf), and In trực tiếp
  const handleDownloadDocx = () => {
    const title = selectedExam?.name || "De_Thi_Thach_Dau_THPTQG";
    const questions = INTERACTIVE_QUESTIONS || [];
    
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
                  <td>${optA}</td>
                  <td>${optB}</td>
                </tr>
                <tr>
                  <td>${optC}</td>
                  <td>${optD}</td>
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

  return (
    <MainLayout>
      {/* 🚀 Game Mode Test Room Fullscreen */}
      {isInTestRoom ? (
        <div className="fixed inset-0 z-[99999] bg-[#eef2f7] text-slate-800 flex flex-col font-sans overflow-y-auto animate-fadeIn select-none print:static print:bg-white print:p-0 print:m-0 print:overflow-visible print:block">
          
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
                {selectedExam ? selectedExam.name : 'Thách Đấu Thi Thử THPTQG'}
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
                onClick={handleExitTestRoom}
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
                        <strong className="text-blue-600 font-extrabold text-sm sm:text-base">{Object.keys(selectedAnswers).length}/{INTERACTIVE_QUESTIONS.length} câu</strong>
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
                                  <path d="M 7 15.5 v 4 a 1.5 1.5 0 0 1 1.5 1.5 h 7 a 1.5 1.5 0 0 1 1.5 -1.5 v -4" />
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
                          onClick={() => setShowResultModal(true)}
                          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs sm:text-sm px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap hover:scale-105 active:scale-95"
                        >
                          <span>Nộp bài</span>
                          <span className="text-xs sm:text-sm">➔</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Strict Print CSS Override to Hide Everything except Test Paper Sheet */}
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
                        padding: 0 !important;
                        box-shadow: none !important;
                        ring: none !important;
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

                      /* Preserve colors on blue text */
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
                    {INTERACTIVE_QUESTIONS.map((q, qIdx) => {
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

                          {/* Options Grid - also used for print via options-print-grid class */}
                          <div className="options-print-grid grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const isCurrentOptSelected = selectedAnswers[q.id] === optIdx;
                              const labels = ['A', 'B', 'C', 'D'];

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
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
                          style={{ width: `${(Object.keys(selectedAnswers).length / INTERACTIVE_QUESTIONS.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-700 font-mono text-xs shrink-0">
                        {Object.keys(selectedAnswers).length}/{INTERACTIVE_QUESTIONS.length}
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
                      {INTERACTIVE_QUESTIONS.map((q, qIdx) => {
                        const selectedOpt = selectedAnswers[q.id];

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
                                    onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
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
                        onClick={() => setShowResultModal(true)}
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
      ) : null}

      {/* 🎮 BRIGHT VIBRANT CYBER THUNDERSTORM GAME CONTAINER */}
      <div className="min-h-screen bg-gradient-to-b from-[#137a8c] via-[#108c9f] to-[#0a6272] text-white font-sans relative overflow-hidden select-none">

        {/* Animated Cyber Circuit Traces Background */}
        <CyberCircuitTracesBackground />

        {/* Hyper-Realistic Spiderweb Thunderstorm Overlay */}
        <RealLightningStrikeOverlay />

        {/* 1️⃣ HIGH-TECH GAME HERO BANNER */}
        <section className="relative pt-10 pb-16 px-4 max-w-[1300px] mx-auto z-10 text-center">

          {/* 🎯 TRANSPARENT COMPACT ESPORTS HUD TITLE FRAME */}
          <div className="relative max-w-[800px] w-full mx-auto my-4 px-4 sm:px-8 pt-6 pb-10 text-center select-none bg-transparent">

            {/* Background removed completely for transparent see-through view */}

            {/* 2. Responsive SVG HUD Orange Outer Circuit Frame (Exact Photo Micro-Line Replica) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10"
              viewBox="0 0 1000 280"
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="hudOrangeNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Main Outer Orange Chamfered Box Path */}
              <path
                d="M 55 15 
                   L 945 15 
                   L 975 45 
                   L 975 120 L 985 120 L 985 140 L 975 140 L 975 235 
                   L 945 265 
                   L 55 265 
                   L 25 235 L 25 140 L 15 140 L 15 120 L 25 120 
                   L 25 45 Z"
                stroke="#ff6000"
                strokeWidth="2.5"
                fill="none"
                filter="url(#hudOrangeNeonGlow)"
              />

              {/* Inner Parallel Thin Trace Line */}
              <path
                d="M 62 23 
                   L 938 23 
                   L 967 52 
                   L 967 228 
                   L 938 257 
                   L 62 257 
                   L 33 228 
                   L 33 52 Z"
                stroke="#ff8800"
                strokeWidth="1.2"
                strokeDasharray="160 12 240 12"
                fill="none"
                opacity="0.8"
              />

              {/* Bottom Double Parallel Accent Line (Exact Photo Match) */}
              <path
                d="M 80 273 L 920 273"
                stroke="#ff6000"
                strokeWidth="1.5"
                strokeDasharray="400 20 400"
              />
              <path d="M 60 273 L 70 273 M 930 273 L 940 273" stroke="#ff6000" strokeWidth="1.5" />

              {/* Double Diagonal Corner Lines (Bottom Left & Top Left - Exact Photo Match) */}
              <path d="M 18 240 L 48 270" stroke="#ff6000" strokeWidth="1.5" />
              <path d="M 18 40 L 48 10" stroke="#ff6000" strokeWidth="1.5" strokeDasharray="15 5" />
              <path d="M 952 270 L 982 240" stroke="#ff6000" strokeWidth="1.5" />
              <path d="M 952 10 L 982 40" stroke="#ff6000" strokeWidth="1.5" />

              {/* Left & Right Side Square Notch Ticks */}
              <rect x="7" y="116" width="6" height="6" fill="#ff7700" />
              <rect x="987" y="116" width="6" height="6" fill="#ff7700" />
              <rect x="7" y="138" width="6" height="6" fill="#ff7700" />
              <rect x="987" y="138" width="6" height="6" fill="#ff7700" />

              {/* Outward Horizontal Extension Antenna Lines */}
              <path d="M 0 130 L 15 130 M 985 130 L 1000 130" stroke="#ff7700" strokeWidth="2" />
              <path d="M 0 45 L 25 45 M 975 45 L 1000 45" stroke="#ff7700" strokeWidth="1" strokeDasharray="10 5" />
              <path d="M 0 235 L 25 235 M 975 235 L 1000 235" stroke="#ff7700" strokeWidth="1" strokeDasharray="10 5" />

              {/* Small '✕' Crosshair Ticks in Corners */}
              <g fill="#ff7700" fontSize="10" fontWeight="bold" fontFamily="monospace">
                <text x="35" y="38">✕</text>
                <text x="955" y="38">✕</text>
                <text x="35" y="248">✕</text>
                <text x="955" y="248">✕</text>
              </g>

              {/* Floating Background Accent Circuit Lines & Dashes (Exact Photo Match) */}
              <g stroke="#ff7700" opacity="0.45" strokeWidth="1.2" fill="none">
                {/* Left Side Floating Circuit Dashes */}
                <path d="M 90 75 L 170 75 M 120 85 L 220 85 M 80 165 L 160 165 M 100 175 L 250 175" strokeDasharray="20 8 40 8" />
                {/* Right Side Floating Circuit Dashes */}
                <path d="M 830 75 L 910 75 M 780 85 L 880 85 M 840 165 L 920 165 M 750 175 L 900 175" strokeDasharray="20 8 40 8" />
                <circle cx="220" cy="85" r="2" fill="#ff7700" />
                <circle cx="780" cy="85" r="2" fill="#ff7700" />
                <circle cx="250" cy="175" r="2" fill="#ff7700" />
                <circle cx="750" cy="175" r="2" fill="#ff7700" />
              </g>
            </svg>

            {/* 3. Text & Content Layer (Z-20) */}
            <div className="relative z-20 flex flex-col items-center justify-center">

              {/* Row 1: THÁCH⚡ĐẤU (Metallic White 3D + Lightning Bolt) */}
              <div className="relative inline-flex items-center justify-center gap-2 sm:gap-4 my-1">

                {/* Blue Electric Arc 1 behind THÁCH */}
                <svg className="absolute -top-5 -left-8 w-24 h-24 pointer-events-none animate-pulse" viewBox="0 0 100 100" fill="none">
                  <path d="M10 50 Q 30 10 50 50 T 90 50" stroke="#00f0ff" strokeWidth="2.5" filter="drop-shadow(0 0 8px #00f0ff)" />
                </svg>

                {/* Word 1: THÁCH */}
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] uppercase whitespace-nowrap pt-1">
                  THÁCH
                </h1>

                {/* Center Glowing Yellow/Orange Lightning Bolt Icon (Exact Photo Match) */}
                <div className="relative mx-1 sm:mx-2 flex items-center justify-center">
                  <div className="absolute inset-0 bg-amber-400/40 rounded-full blur-md animate-ping" />
                  <svg className="w-10 h-12 sm:w-14 sm:h-16 text-amber-400 fill-current drop-shadow-[0_0_20px_#ffaa00] relative z-10" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>

                {/* Word 2: ĐẤU */}
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] uppercase whitespace-nowrap pt-1">
                  ĐẤU
                </h1>

                {/* Blue Electric Arc 2 behind ĐẤU */}
                <svg className="absolute -top-5 -right-8 w-24 h-24 pointer-events-none animate-pulse" viewBox="0 0 100 100" fill="none">
                  <path d="M10 50 Q 50 90 90 50" stroke="#00f0ff" strokeWidth="2.5" filter="drop-shadow(0 0 8px #00f0ff)" />
                </svg>
              </div>

              {/* Row 2: THI THỬ THPTQG (3D Vibrant Orange with Thick White Stroke - Exact Photo Match) */}
              <div className="relative mt-1 mb-4 inline-block">

                {/* Electric Cyan Arc behind THPTQG */}
                <svg className="absolute -right-8 top-1 w-16 h-16 pointer-events-none animate-pulse" viewBox="0 0 100 100" fill="none">
                  <path d="M20 20 L50 80 L80 40" stroke="#00e5ff" strokeWidth="3" filter="drop-shadow(0 0 10px #00e5ff)" />
                </svg>

                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#ff5500] text-stroke-white-photo tracking-tight uppercase whitespace-nowrap px-4">
                  THI THỬ THPTQG
                </h2>
              </div>

              {/* Row 3: Glossy Red Pill Badge Overlapping Bottom Border (Exact Photo Match) */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 z-30">
                <div className="px-6 sm:px-10 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#e51d27] via-[#c4121b] to-[#990a11] text-white font-extrabold text-xs sm:text-base border-2 border-white shadow-[0_0_35px_rgba(229,29,39,0.9)] tracking-wide uppercase whitespace-nowrap flex items-center justify-center">
                  Môn Toán - Anh Giáo Kid
                </div>
              </div>

            </div>
          </div>

          {/* 🃏 4 ELEMENTAL STAGE CARDS (WITH 3D DIAGONAL CARD FLIP: MẶT SẤP LẬT CHÉO MẶT NGỬA) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-24 sm:mt-32">
            {GAME_SESSIONS_DATA.map((session) => (
              <div
                key={session.id}
                onClick={() => handleCardClick(session)}
                className="group perspective-1000 w-full h-[450px] cursor-pointer"
              >
                {/* 3D Rotator Box */}
                <div className="relative w-full h-full duration-700 transition-transform preserve-3d group-hover-flip-diag">

                  {/* ====================================================================
                      🎴 MẶT SẤP (FACE DOWN CARD BACK - DEFAULT UNHOVERED STATE)
                      ==================================================================== */}
                  <div className={`absolute inset-0 rounded-3xl border-2 ${session.cardBorder} bg-gradient-to-b from-[#147b8c] via-[#0d5966] to-[#073c45] ${session.cardGlow} backface-hidden p-6 flex flex-col items-center justify-between overflow-hidden shadow-2xl`}>

                    {/* Outer Cyber Card Back Lines */}
                    <div className="absolute inset-3 border border-cyan-400/40 rounded-2xl pointer-events-none" />
                    <div className="absolute inset-5 border border-dashed border-cyan-400/25 rounded-xl pointer-events-none" />

                    {/* Corner Card Back Runic Accents */}
                    <span className="absolute top-4 left-5 text-cyan-300 font-mono text-xs select-none">⚡</span>
                    <span className="absolute top-4 right-5 text-cyan-300 font-mono text-xs select-none">⚡</span>
                    <span className="absolute bottom-4 left-5 text-cyan-300 font-mono text-xs select-none">⚡</span>
                    <span className="absolute bottom-4 right-5 text-cyan-300 font-mono text-xs select-none">⚡</span>

                    {/* Header Badge */}
                    <div className="z-10 mt-2">
                      <div className={`px-5 py-1.5 rounded-full bg-gradient-to-r ${session.colorHeader} text-white font-extrabold text-xs shadow-lg uppercase tracking-wider border border-white/30`}>
                        ĐỢT {session.id} • {session.period}
                      </div>
                    </div>

                    {/* Center Glowing Elemental Runic Seal (Mặt sấp lá bài) */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                      <div className="relative w-32 h-32 rounded-full border-2 border-amber-400 bg-[#073d47]/90 flex items-center justify-center shadow-[0_0_35px_rgba(0,240,255,0.6)] animate-pulse">
                        <div className="absolute inset-2 rounded-full border border-dashed border-amber-300/80 animate-spin" />
                        {session.watermarkSvg}
                      </div>
                      <p className="text-xs text-amber-300 font-extrabold uppercase tracking-widest mt-4 drop-shadow-md">
                        ⚡ {session.title} ⚡
                      </p>
                    </div>
                  </div>

                  {/* ====================================================================
                      🃏 MẶT NGỬA (FACE UP CARD FRONT - HOVERED FLIPPED STATE)
                      ==================================================================== */}
                  <div className={`absolute inset-0 rounded-3xl border-2 ${session.cardBorder} bg-gradient-to-b ${session.bgGradient} ${session.cardGlow} backface-hidden rotate-diag-back p-6 flex flex-col justify-between overflow-hidden shadow-2xl`}>
                    {/* Top Game Crest Badge */}
                    <div className="relative z-10 -mt-2">
                      <div className={`mx-auto w-44 py-2 rounded-b-2xl bg-gradient-to-r ${session.colorHeader} text-white font-extrabold text-xs shadow-lg border-b-2 border-amber-300 tracking-wide uppercase text-center border-x border-white/20`}>
                        <span className="block text-[10px] text-amber-200">ĐỢT {session.id}</span>
                        <span>{session.period}</span>
                      </div>
                    </div>

                    {/* Watermark Elemental Symbol */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-60 pointer-events-none">
                      {session.watermarkSvg}
                    </div>

                    {/* Bottom Elemental Details & Action Button */}
                    <div className="relative z-10 mt-auto text-center space-y-4">
                      <h3 className="font-extrabold text-xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{session.title}</h3>
                      <div className="text-xs text-cyan-100 font-semibold bg-[#03232a]/80 backdrop-blur-md py-2 px-4 rounded-xl inline-block border border-cyan-400/30">
                        {session.name}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(session);
                        }}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-450 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_35px_rgba(251,191,36,0.95)] transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-amber-200"
                      >
                        <span>VÀO THI NGAY</span>
                        <span>⚡</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2️⃣ KEY STATS CIRCLES BAND */}
        <section className="py-14 px-4 max-w-[1200px] mx-auto z-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Stat Circle 1 */}
            <div className="bg-[#04333b]/80 border border-cyan-400/50 rounded-3xl p-8 text-center backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.2)] flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-400 hover:shadow-[0_0_40px_rgba(255,170,0,0.5)] transition-all">
              <div className="w-36 h-36 rounded-full border-4 border-cyan-400/80 bg-[radial-gradient(circle,rgba(0,240,255,0.25),transparent)] flex flex-col items-center justify-center mb-4 shadow-[0_0_35px_rgba(0,240,255,0.5)]">
                <span className="text-4xl font-black text-amber-400 font-mono drop-shadow-[0_2px_12px_rgba(255,170,0,0.9)]">10</span>
              </div>
              <p className="text-xs text-cyan-100 font-medium leading-relaxed max-w-xs">
                Triệu là tổng giá trị giải thưởng dành cho Top 1,2,3 trong các đề thi thử
              </p>
            </div>

            {/* Stat Circle 2 */}
            <div className="bg-[#04333b]/80 border border-cyan-400/50 rounded-3xl p-8 text-center backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.2)] flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-400 hover:shadow-[0_0_40px_rgba(255,170,0,0.5)] transition-all">
              <div className="w-36 h-36 rounded-full border-4 border-cyan-400/80 bg-[radial-gradient(circle,rgba(0,240,255,0.25),transparent)] flex flex-col items-center justify-center mb-4 shadow-[0_0_35px_rgba(0,240,255,0.5)]">
                <span className="text-3xl font-black text-amber-400 font-mono drop-shadow-[0_2px_12px_rgba(255,170,0,0.9)]">73000 +</span>
              </div>
              <p className="text-xs text-cyan-100 font-medium leading-relaxed max-w-xs">
                Học sinh theo học đối với các khóa 2K5, 2K6, 2K7
              </p>
            </div>

            {/* Stat Circle 3 */}
            <div className="bg-[#04333b]/80 border border-cyan-400/50 rounded-3xl p-8 text-center backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.2)] flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-400 hover:shadow-[0_0_40px_rgba(255,170,0,0.5)] transition-all">
              <div className="w-36 h-36 rounded-full border-4 border-cyan-400/80 bg-[radial-gradient(circle,rgba(0,240,255,0.25),transparent)] flex flex-col items-center justify-center mb-4 shadow-[0_0_35px_rgba(0,240,255,0.5)]">
                <span className="text-3xl font-black text-amber-400 font-mono drop-shadow-[0_2px_12px_rgba(255,170,0,0.9)]">80 %</span>
              </div>
              <p className="text-xs text-cyan-100 font-medium leading-relaxed max-w-xs">
                Tỉ lệ ra đề sát với cấu trúc, ma trận đề thi thực tế
              </p>
            </div>
          </div>

          {/* Central Horizontal Electric Arc Line */}
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent mt-12 opacity-80 shadow-[0_0_20px_#00f0ff]" />
        </section>

        {/* 3️⃣ GUIDELINE VIDEO STAGE */}
        <section className="py-12 px-4 max-w-[1000px] mx-auto z-10 text-center">

          {/* Diamond Cut Ribbon Header */}
          <div className="inline-block relative mb-8">
            <div className="px-10 py-3 bg-[#053d47] border-2 border-cyan-400 text-white font-extrabold text-lg sm:text-xl tracking-widest uppercase shadow-[0_0_25px_rgba(0,240,255,0.5)] transform -skew-x-12">
              <span className="block transform skew-x-12 flex items-center gap-2">
                <span>⚡ HƯỚNG DẪN THI ⚡</span>
              </span>
            </div>
          </div>

          {/* 3D Sci-Fi Hologram Arena Video Box */}
          <div
            onClick={() => setShowVideoModal(true)}
            className="relative rounded-3xl border-2 border-amber-400/90 bg-[#032329] p-4 shadow-[0_0_60px_rgba(0,240,255,0.5)] cursor-pointer group overflow-hidden"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80"
                alt="Guideline Thumbnail"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-[0_0_35px_rgba(251,191,36,0.9)] group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Title Text Banner inside Video */}
              <div className="absolute bottom-6 left-6 right-6 text-left">
                <h3 className="font-extrabold text-xl sm:text-2xl text-white drop-shadow-md">
                  HƯỚNG DẪN THI THỬ THÁCH ĐẤU THI THỬ THPTQG
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/* 4️⃣ LEADERBOARD SECTION */}
        <section id="bàng-xep-hang" className="py-14 px-4 max-w-[1100px] mx-auto z-10 text-center">

          {/* Diamond Cut Ribbon Header */}
          <div className="inline-block relative mb-12">
            <div className="px-12 py-3 bg-[#053d47] border-2 border-cyan-400 text-white font-extrabold text-xl tracking-widest uppercase shadow-[0_0_25px_rgba(0,240,255,0.5)] transform -skew-x-12">
              <span className="block transform skew-x-12 flex items-center gap-2">
                <span>⚡ BẢNG XẾP HẠNG ⚡</span>
              </span>
            </div>
          </div>

          {/* TOP 3 CHARACTER BADGES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-12">

            {/* TOP 2 (LEFT) */}
            <div className="flex flex-col items-center order-2 md:order-1">
              <div className="relative w-32 h-32 mb-3">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-300 bg-cyan-500/20 shadow-[0_0_35px_rgba(103,232,249,0.8)]" />
                <img
                  src={TOP3_PODIUM_USERS[1].avatar}
                  alt={TOP3_PODIUM_USERS[1].name}
                  className="w-full h-full rounded-full object-cover p-1 relative z-10"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-full bg-slate-300 text-black font-black text-xs border border-white">
                  TOP 2
                </span>
              </div>
              <h4 className="font-extrabold text-lg text-white mb-1">{TOP3_PODIUM_USERS[1].name}</h4>
              <div className="flex items-center gap-3 font-mono font-bold text-sm text-cyan-200">
                <span>3</span> <span>4</span> <span>3</span> <span className="text-amber-400 text-base">10</span>
              </div>
            </div>

            {/* TOP 1 (CENTER - ELEVATED HIGHEST) */}
            <div className="flex flex-col items-center order-1 md:order-2 scale-110 -translate-y-4">
              <div className="relative w-40 h-40 mb-4">
                <div className="absolute -inset-3 rounded-full border-4 border-amber-400 bg-amber-500/20 shadow-[0_0_60px_rgba(251,191,36,1)] animate-pulse" />
                <img
                  src={TOP3_PODIUM_USERS[0].avatar}
                  alt={TOP3_PODIUM_USERS[0].name}
                  className="w-full h-full rounded-full object-cover p-1.5 relative z-10"
                />
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full bg-amber-400 text-black font-black text-xs border-2 border-amber-200 shadow-xl">
                  👑 TOP 1
                </span>
              </div>
              <h4 className="font-black text-xl text-amber-300 mb-1">{TOP3_PODIUM_USERS[0].name}</h4>
              <div className="flex items-center gap-3 font-mono font-bold text-base text-amber-200">
                <span>3</span> <span>4</span> <span>3</span> <span className="text-amber-400 font-extrabold text-lg">10</span>
              </div>
            </div>

            {/* TOP 3 (RIGHT) */}
            <div className="flex flex-col items-center order-3 md:order-3">
              <div className="relative w-32 h-32 mb-3">
                <div className="absolute inset-0 rounded-full border-4 border-rose-400 bg-rose-500/20 shadow-[0_0_35px_rgba(244,63,94,0.8)]" />
                <img
                  src={TOP3_PODIUM_USERS[2].avatar}
                  alt={TOP3_PODIUM_USERS[2].name}
                  className="w-full h-full rounded-full object-cover p-1 relative z-10"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-full bg-rose-500 text-white font-black text-xs border border-white">
                  TOP 3
                </span>
              </div>
              <h4 className="font-extrabold text-lg text-white mb-1">{TOP3_PODIUM_USERS[2].name}</h4>
              <div className="flex items-center gap-3 font-mono font-bold text-sm text-cyan-200">
                <span>3</span> <span>4</span> <span>3</span> <span className="text-amber-400 text-base">10</span>
              </div>
            </div>
          </div>

          {/* LEADERBOARD TABLE CONTAINER */}
          <div className="bg-[#042f36]/90 border border-cyan-400/50 rounded-3xl p-6 backdrop-blur-md shadow-[0_0_35px_rgba(0,240,255,0.3)] space-y-6">

            <p className="text-xs text-cyan-200 font-semibold">
              Bạn hãy chọn đợt thi và đề thi mong muốn tra cứu!
            </p>

            {/* Filter Dropdowns Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <select
                value={filterDot}
                onChange={(e) => setFilterDot(e.target.value)}
                className="w-full bg-[#03232a] border border-cyan-400/60 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Đợt 1">Đợt 1</option>
                <option value="Đợt 2">Đợt 2</option>
                <option value="Đợt 3">Đợt 3</option>
                <option value="Đợt 4">Đợt 4</option>
              </select>

              <select
                value={filterDe}
                onChange={(e) => setFilterDe(e.target.value)}
                className="w-full bg-[#03232a] border border-cyan-400/60 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Đề số 01 - Đợt 1 - Mùa 1">Đề số 01 - Đợt 1 - Mùa 1</option>
                <option value="Đề số 02 - Đợt 1 - Mùa 1">Đề số 02 - Đợt 1 - Mùa 1</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-cyan-500/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#063f4a] text-cyan-200 font-extrabold uppercase text-[11px] border-b border-cyan-500/30">
                  <tr>
                    <th className="py-3.5 px-6 text-center">#TOP</th>
                    <th className="py-3.5 px-6">Thí sinh</th>
                    <th className="py-3.5 px-6 text-center">Phần 1</th>
                    <th className="py-3.5 px-6 text-center">Phần 2</th>
                    <th className="py-3.5 px-6 text-center">Phần 3</th>
                    <th className="py-3.5 px-6 text-center">Tổng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/20 text-gray-100 font-medium">
                  {LEADERBOARD_ROWS.map((row) => (
                    <tr key={row.rank} className="hover:bg-[#084855] transition-colors">
                      <td className="py-3.5 px-6 text-center font-mono font-bold text-amber-300">
                        {row.rank}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-white">{row.name}</td>
                      <td className="py-3.5 px-6 text-center font-mono">{row.part1}</td>
                      <td className="py-3.5 px-6 text-center font-mono">{row.part2}</td>
                      <td className="py-3.5 px-6 text-center font-mono">{row.part3}</td>
                      <td className="py-3.5 px-6 text-center font-mono font-black text-amber-400">
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* 📌 EXAM SELECTION MODAL */}
      {selectedExamModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#042d35] border-2 border-cyan-400 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
              <h3 className="font-extrabold text-lg text-amber-300 uppercase flex items-center gap-2">
                <span>⚡ Lựa chọn đề thi ({currentSession.title})</span>
              </h3>
              <button
                onClick={() => setSelectedExamModal(false)}
                className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {currentSession.examinations.map((exam) => (
                <div
                  key={exam.id}
                  onClick={() => setSelectedExam(exam)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedExam?.id === exam.id
                      ? 'bg-cyan-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                      : 'bg-[#021d23] border-gray-700 text-gray-300'
                    }`}
                >
                  <h4 className="font-bold text-sm text-amber-200">{exam.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    ⏱ {exam.duration} phút | 📝 {exam.totalQuestions} câu hỏi
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartExamFlow}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(251,191,36,0.6)]"
            >
              BẮT ĐẦU LÀM BÀI ⚡
            </button>
          </div>
        </div>
      )}

      {/* 📌 FULLSCREEN WARNING PROMPT */}
      {showFullscreenPrompt && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#042d35] border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 text-white text-center space-y-5 shadow-[0_0_50px_rgba(251,191,36,0.4)]">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-300 text-3xl flex items-center justify-center mx-auto">
              ⚡
            </div>
            <h3 className="font-extrabold text-xl text-amber-300 uppercase">
              YÊU CẦU FULL SCREEN
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed text-left bg-[#021d23] p-4 rounded-2xl border border-cyan-500/30">
              Bạn phải vào chế độ <strong>Toàn màn hình (Full Screen)</strong> mới làm được bài thi.
            </p>
            <button
              onClick={handleEnterFullscreenTest}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase shadow-[0_0_20px_rgba(251,191,36,0.6)]"
            >
              VÀO FULL SCREEN NGAY ➔
            </button>
          </div>
        </div>
      )}

      {/* 📌 VIDEO LIGHTBOX */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-black border border-gray-800 rounded-[#042d35] max-w-4xl w-full overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-900 text-white font-bold"
            >
              ✕
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/EDP-HKJZVdU?autoplay=1"
                title="Guideline"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
