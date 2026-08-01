import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import api from '../services/api';

const TEACHERS = [
  {
    name: 'Vũ Hoàng Hải',
    subject: 'Giáo viên môn Vật Lý - Flashstudy',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    color: 'from-blue-600 to-indigo-900'
  },
  {
    name: 'Anh Giáo Kid',
    subject: 'Giáo viên môn Toán - Flashstudy',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    color: 'from-cyan-600 to-blue-900'
  },
  {
    name: 'Trung Anh Siêu Nhân',
    subject: 'Giáo viên môn Toán - Flashstudy',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    color: 'from-blue-500 to-slate-900'
  },
  {
    name: 'Nghĩa Ngôn Ngữ',
    subject: 'Giáo viên môn Tiếng Anh - Flashstudy',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    color: 'from-[#0088ff] to-[#003399]'
  }
];

const GOLDEN_HONORS = [
  {
    title: 'VINH DANH Á KHOA B00',
    subtitle: 'HỌC SINH 2K6 - FLASHSTUDY',
    name: 'TRƯƠNG NHẬT MINH',
    school: 'Khóa VIP Toán THPTQG 2024',
    totalScore: '29.75',
    detailScore: '10 Toán | 10 Sinh | 9.75 Hóa',
    badge: 'Á KHOA',
    bg: 'linear-gradient(135deg, #fce043 0%, #e70837 100%)',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'NGUYỄN ĐÌNH ANH TUẤN',
    increase: 'TĂNG 2 ĐIỂM',
    detail: 'Từ 8 ➔ 10 ĐIỂM',
    teacher: 'ANH GIÁO KID',
    badge: 'DIỂM THI MÔN TOÁN',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'LÊ THỊ KIM NGÂN',
    increase: 'TĂNG 2.5 ĐIỂM',
    detail: 'Từ 7.5 ➔ 10 ĐIỂM',
    teacher: 'ANH GIÁO KID',
    badge: 'ĐIỂM THI MÔN TOÁN',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'ĐẶNG ĐÌNH CẦU NAM',
    increase: 'TĂNG 2 ĐIỂM',
    detail: 'Từ 8 ➔ 10 ĐIỂM',
    teacher: 'ANH GIÁO KID',
    badge: 'ĐIỂM THI MÔN TOÁN',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'LÝ YẾN NHI',
    increase: 'TĂNG 4.4 ĐIỂM',
    detail: 'Từ 4.6 ➔ 9 ĐIỂM',
    teacher: 'ANH GIÁO KID',
    badge: 'ĐIỂM THI MÔN TOÁN',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'NGUYỄN DANH QUANG',
    increase: 'TĂNG 4 ĐIỂM',
    detail: 'Từ 5 ➔ 9 ĐIỂM',
    teacher: 'ANH GIÁO KID',
    badge: 'ĐIỂM THI MÔN TOÁN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'NGUYỄN ĐỨC MINH QUÂN',
    increase: 'TĂNG 2.5 ĐIỂM',
    detail: 'Từ 6.5 ➔ 9 ĐIỂM',
    teacher: 'ANH GIÁO KID',
    badge: 'ĐIỂM THI MÔN TOÁN',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'NGUYỄN DƯƠNG NGUYÊN',
    increase: 'TĂNG 1.5 ĐIỂM',
    detail: 'Từ 7.5 ➔ 9 ĐIỂM',
    teacher: 'ANH GIÁO KID',
    badge: 'ĐIỂM THI MÔN TOÁN',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
  }
];

const FEATURED_COURSES = [
  {
    id: 1,
    title: 'TOÁN 10 | KHÓA VIP 2027 - CHINH PHỤC 8+ THPTQG 2028',
    teacher: 'Anh Giáo Kid +...',
    videos: 11,
    exercises: 0,
    tests: 2,
    price: '1.150.000',
    oldPrice: '2.600.000',
    discount: '56%',
    hot: true,
    bannerBg: 'from-amber-500 via-orange-500 to-red-500',
    bannerTitle: 'KHÓA VIP TOÁN 10',
    bannerSub: 'CHINH PHỤC 8+ THPTQG 2028'
  },
  {
    id: 2,
    title: 'TOÁN 9 | KHÓA HỌC KÌ 1 2K10 - BẬT TỐC ĐIỂM SỐ',
    teacher: 'Trung Anh Siêu Nhân',
    videos: 18,
    exercises: 0,
    tests: 4,
    price: '1.300.000',
    oldPrice: '2.000.000',
    discount: '35%',
    hot: true,
    bannerBg: 'from-emerald-500 via-teal-600 to-blue-700',
    bannerTitle: 'KHÓA 2K12 TOÁN 9',
    bannerSub: 'KHÓA HK1'
  },
  {
    id: 3,
    title: 'TOÁN 11 | KHÓA VIP 2027 - CHINH PHỤC TOÁN 11',
    teacher: 'Anh Giáo Kid',
    videos: 33,
    exercises: 3,
    tests: 3,
    price: '1.300.000',
    oldPrice: '2.600.000',
    discount: '50%',
    hot: true,
    bannerBg: 'from-teal-600 to-cyan-800',
    bannerTitle: 'KHÓA VIP 2027',
    bannerSub: 'CHINH PHỤC TOÁN 11 - MÔN TOÁN'
  },
  {
    id: 4,
    title: 'TOÁN 12 | KHÓA [L] NỀN TẢNG LUYỆN THI THPTQG 2027',
    teacher: 'Anh Giáo Kid',
    videos: 68,
    exercises: 7,
    tests: 11,
    price: '1.990.000',
    oldPrice: '3.600.000',
    discount: '45%',
    hot: true,
    bannerBg: 'from-blue-600 via-indigo-600 to-purple-800',
    bannerTitle: 'KHÓA CHUYÊN ĐỀ 12',
    bannerSub: 'LUYỆN THI THPTQG 2027 - MÔN TOÁN'
  },
  {
    id: 5,
    title: 'TOÁN 12 | KHÓA 30 ĐỀ MINH HỌA VÀ ĐỀ PHÁT TRIỂN',
    teacher: 'Đang cập nhật...',
    videos: 30,
    exercises: 0,
    tests: 30,
    price: '990.000',
    oldPrice: '1.800.000',
    discount: '45%',
    hot: false,
    bannerBg: 'from-slate-300 to-slate-400',
    bannerTitle: '30 ĐỀ MINH HỌA',
    bannerSub: 'TOÁN 12'
  },
  {
    id: 6,
    title: 'TIẾNG ANH 10 | KHÓA HỌC KÌ 2 - 2K11 BỨC PHÁ',
    teacher: 'Đang cập nhật...',
    videos: 0,
    exercises: 0,
    tests: 0,
    price: '850.000',
    oldPrice: '1.500.000',
    discount: '43%',
    hot: false,
    bannerBg: 'from-amber-400 to-yellow-600',
    bannerTitle: 'TIẾNG ANH KHÓA HK2',
    bannerSub: '2K11'
  },
  {
    id: 7,
    title: 'TIẾNG ANH 11 | KHÓA HỌC KÌ 2 - 2K10 CHINH PHỤC',
    teacher: 'Đang cập nhật...',
    videos: 0,
    exercises: 0,
    tests: 0,
    price: '850.000',
    oldPrice: '1.500.000',
    discount: '43%',
    hot: false,
    bannerBg: 'from-amber-500 to-orange-600',
    bannerTitle: 'TIẾNG ANH KHÓA HK2',
    bannerSub: '2K10'
  },
  {
    id: 8,
    title: 'TIẾNG ANH 10 | KHÓA HỌC KÌ 1 - 2K11 NỀN TẢNG',
    teacher: 'Đang cập nhật...',
    videos: 0,
    exercises: 0,
    tests: 0,
    price: '850.000',
    oldPrice: '1.500.000',
    discount: '43%',
    hot: false,
    bannerBg: 'from-sky-400 to-blue-600',
    bannerTitle: 'TIẾNG ANH KHÓA HK1',
    bannerSub: '2K11'
  }
];

const STUDENT_PROOF_CHATS = [
  {
    score: '9.5',
    scoreColor: 'from-orange-500 to-red-600',
    name: 'Nguyễn Thị Hồng Nhung',
    message: 'Hệ thống vừa nhận được thông tin em được 9.5 điểm môn Toán! Anh Kid chúc mừng em nhé!',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '10',
    scoreColor: 'from-[#0256d0] to-blue-700',
    name: 'Nguyễn Đình Anh Tuấn',
    message: 'Em được 10 điểm toán! Cần cung cấp gì để nhận thưởng ạ. Yay chúc mừng em nhất!!',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '9.5',
    scoreColor: 'from-orange-500 to-red-600',
    name: 'Nguyễn Quang Thắng',
    message: 'Ơi, anh Kid xin chúc mừng em một lần nữa nha! Em gửi lại ảnh giấy báo dự thi...',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '10',
    scoreColor: 'from-yellow-500 to-orange-500',
    name: 'Đặng Đình Cầu Nam',
    message: 'Hệ thống FlashStudy vừa báo lại anh là em đã xuất sắc đạt 10 điểm toán đúng không nè?',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80'
  }
];

export default function HomePage() {
  const [selectedGrade, setSelectedGrade] = useState('12');
  const [timeLeft, setTimeLeft] = useState({ days: 314, hours: 12, mins: 1, secs: 52 });
  const [selectedExam, setSelectedExam] = useState(0);

  // Countdown Timer Logic
  useEffect(() => {
    const targetDate = new Date('2027-06-11T07:30:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, mins, secs });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const examSchedules = [
    { title: 'Ngữ Văn', time: '11/6/2027 • 07:30', active: true },
    { title: 'Toán', time: '11/6/2027 • 14:20', active: false },
    { title: 'Bài thi tự chọn môn thứ nhất', time: '12/6/2027 • 07:30', active: false },
    { title: 'Bài thi tự chọn môn thứ hai', time: '12/6/2027 • 08:35', active: false }
  ];

  return (
    <MainLayout>
      <div className="bg-[#f8fafc] text-gray-800 overflow-x-hidden font-sans">
        
        {/* ============================================================== */}
        {/* SECTION 1: HERO BANNER (FLASHSTUDY EXACT CONTAINER STRUCTURE) */}
        {/* ============================================================== */}
        <section className="relative w-full bg-gradient-to-b from-[#093016] via-[#0c401e] to-[#082a13] py-6 lg:py-10 px-4 sm:px-6 overflow-hidden border-b border-emerald-800/40">
          {/* Background Glow Pattern */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="max-w-[1340px] mx-auto relative z-10">
            <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950/60 border border-emerald-400/30 bg-[#0c401e] flex items-center justify-center">
              <img 
                src="/images/hero-banner.png" 
                alt="Hệ thống Luyện thi Cấp tốc THPT - Flash Study" 
                className="w-full h-auto max-h-[520px] object-cover sm:object-contain object-center block"
              />
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 2: COURSE PROMOTIONS & SPECIAL DISCOUNTS CARD          */}
        {/* ============================================================== */}
        <section className="max-w-[1340px] mx-auto px-4 py-10 lg:py-14 relative z-20">
          <div className="bg-gradient-to-br from-[#0c3c9c] via-[#052b77] to-[#02184a] rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-blue-400/30 relative overflow-hidden">
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* LEFT SIDE: PROMO COUNTDOWN TIMER */}
              <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
                <div>
                  <div className="inline-flex items-center gap-2 bg-amber-400 text-red-950 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 shadow">
                    🔥 ĐẶC QUYỀN GIẢM GIÁ ĐẾN 56%
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Chương Trình Ưu Đãi Khóa Học
                  </h2>
                  <p className="text-sm sm:text-base text-cyan-300 font-semibold mt-2 flex items-center justify-center sm:justify-start gap-2">
                    <svg className="w-5 h-5 animate-pulse text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thời gian ưu đãi còn lại : <span className="underline decoration-cyan-400">Giảm sâu khóa VIP</span>
                  </p>
                </div>

                {/* 4 White Countdown Boxes */}
                <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-lg mx-auto sm:mx-0">
                  {[
                    { label: 'Ngày', value: String(timeLeft.days).padStart(3, '0') },
                    { label: 'Giờ', value: String(timeLeft.hours).padStart(2, '0') },
                    { label: 'Phút', value: String(timeLeft.mins).padStart(2, '0') },
                    { label: 'Giây', value: String(timeLeft.secs).padStart(2, '0') }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-full bg-white text-[#042878] rounded-2xl py-3 sm:py-5 shadow-lg border border-blue-100 flex items-center justify-center">
                        <span className="text-2xl sm:text-4xl xl:text-5xl font-black tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                          {item.value}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-blue-200 mt-2">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE: PROMO PACKAGES LIST */}
              <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-3">
                <div className="flex items-center justify-between text-blue-200 font-bold text-sm mb-2">
                  <span className="flex items-center gap-2 text-amber-300">
                    🎁 Danh sách gói ưu đãi hot
                  </span>
                  <span className="text-xs text-cyan-300">Chỉ còn 15 suất</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { title: 'Giảm 56% Khóa VIP Toán 10 & 11', note: 'Chỉ còn 1.150.000đ • Mã: FLASH56' },
                    { title: 'Combo Luyện Thi THPT QG Toán 12', note: 'Tặng bộ đề minh họa + Sách siêu trọng tâm' },
                    { title: 'Ưu đãi Đăng ký theo nhóm (Từ 2 người)', note: 'Giảm thêm 200.000đ trực tiếp vào học phí' },
                    { title: 'Học bổng Xuất sắc dành cho 2K8, 2K9', note: 'Hỗ trợ 100% tài liệu ôn tập độc quyền' }
                  ].map((promo, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedExam(idx)}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                        selectedExam === idx 
                          ? 'bg-[#0256d0] text-white shadow-lg border border-cyan-400/50 scale-[1.02]' 
                          : 'bg-white text-gray-800 hover:bg-blue-50'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-sm">{promo.title}</h4>
                        <p className={`text-xs mt-0.5 ${selectedExam === idx ? 'text-blue-100' : 'text-gray-500'}`}>
                          {promo.note}
                        </p>
                      </div>
                      {selectedExam === idx && (
                        <span className="bg-amber-400 text-red-950 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm shrink-0">
                          Nhận ngay ⚡
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 3: STUDENT ACHIEVEMENTS CHAT PROOF CAROUSEL            */}
        {/* ============================================================== */}
        <section className="max-w-[1340px] mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0256d0] flex items-center gap-2">
              <span className="text-amber-500">★</span> Thành tích học sinh 2K8 THPTQG 2026
            </h2>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                &larr;
              </button>
              <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STUDENT_PROOF_CHATS.map((chat, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative hover:shadow-md transition-shadow">
                {/* Score badge sticker */}
                <div className={`absolute -top-3 -left-3 bg-gradient-to-br ${chat.scoreColor} text-white font-extrabold w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white transform -rotate-12`}>
                  <span className="text-lg leading-none">{chat.score}</span>
                  <span className="text-[9px] uppercase font-bold">Điểm</span>
                </div>

                <div className="pl-8 pt-1">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={chat.avatar} alt={chat.name} className="w-7 h-7 rounded-full object-cover" />
                    <span className="font-semibold text-xs text-gray-800 line-clamp-1">{chat.name}</span>
                  </div>
                  <div className="bg-blue-50 text-blue-950 p-2.5 rounded-xl text-xs leading-relaxed border border-blue-100">
                    "{chat.message}"
                  </div>
                  <div className="mt-2 text-right">
                    <span className="inline-block text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded border border-red-200">
                      TRA CỨU ĐIỂM THI THPT
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>



        {/* ============================================================== */}
        {/* SECTION 5: FEATURED COURSES ("Khóa học nổi bật")               */}
        {/* ============================================================== */}
        <section className="max-w-[1340px] mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-red-500">🔥</span> Khóa học nổi bật
            </h2>
            <Link to="/Home/Courses" className="text-sm font-semibold text-[#0256d0] hover:underline flex items-center gap-1">
              Xem tất cả &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_COURSES.map((course) => (
              <div 
                key={course.id} 
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Course Banner Thumbnail */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  <div className={`w-full h-full bg-gradient-to-tr ${course.bannerBg} p-4 flex flex-col justify-center items-center text-center text-white relative`}>
                    <span className="text-[10px] font-extrabold uppercase bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm mb-1">
                      FLASHSTUDY
                    </span>
                    <h4 className="font-black text-base sm:text-lg leading-tight drop-shadow-md">
                      {course.bannerTitle}
                    </h4>
                    <p className="text-[11px] text-amber-200 font-bold mt-1">
                      {course.bannerSub}
                    </p>
                  </div>

                  {/* Hot Badge Ribbon */}
                  {course.hot && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-md uppercase tracking-wider">
                      HOT
                    </div>
                  )}
                </div>

                {/* Course Content Info */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-[#0256d0] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Giáo viên: <span className="font-semibold text-gray-700">{course.teacher}</span>
                    </p>

                    {/* Media tags */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-blue-100 text-[#0256d0] text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        VIDEO ▶
                      </span>
                      <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        LIVESTREAM 🔴
                      </span>
                    </div>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-y-1 text-[11px] text-gray-600 mt-3 pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1">📹 {course.videos} Video</span>
                      <span className="flex items-center gap-1">📝 {course.exercises} Bài tập</span>
                      <span className="flex items-center gap-1">📝 {course.tests} Bài thi</span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-[#0256d0]">
                          {course.price}đ
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          {course.oldPrice}đ
                        </span>
                      </div>
                      <span className="bg-red-50 text-red-600 text-[11px] font-extrabold px-1.5 py-0.5 rounded">
                        {course.discount}
                      </span>
                    </div>

                    <Link 
                      to={`/Home/Courses/${course.id}`}
                      className="w-full bg-white hover:bg-blue-50 text-[#0256d0] border-2 border-[#0256d0] py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1"
                    >
                      Học thử ngay
                    </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 6: LEARNING PATHWAY ("Lộ trình học")                   */}
        {/* ============================================================== */}
        <section className="max-w-[1340px] mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-[#0256d0]">📊</span> Lộ trình học
            </h2>

            {/* Filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['12', '11', '10', '9'].map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedGrade === grade
                      ? 'bg-[#0256d0] text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Lớp {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Large Promo Curriculum Banner */}
          <div className="bg-gradient-to-r from-[#942008] via-[#B82E12] to-[#701605] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-red-500/30">
            
            <div className="space-y-4 max-w-xl text-center lg:text-left">
              <span className="bg-amber-400 text-red-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                HOT! 2K9 XPS TOÁN 12
              </span>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Chinh phục 9+ Toán THPTQG <span className="text-amber-300">2027</span>
              </h3>
              
              <div className="flex items-baseline justify-center lg:justify-start gap-3">
                <span className="text-sm text-red-200 line-through">Học phí: 3.600.000đ</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300">
                  Ưu đãi còn <span className="text-3xl sm:text-4xl underline">1.990.000đ</span>
                </span>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <span className="bg-red-950/60 border border-amber-400/40 text-amber-300 font-extrabold text-sm px-4 py-2 rounded-xl">
                  Chỉ còn : <span className="text-white font-black text-base">9 Slots</span> &gt;
                </span>
                <button className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-red-950 font-black px-8 py-3 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 text-base">
                  ĐĂNG KÝ NGAY
                </button>
              </div>
            </div>

            {/* Book Combo Graphic Placeholder */}
            <div className="flex items-center gap-2 sm:gap-3">
              {['HÀM SỐ', 'HÌNH OXYZ', 'XÁC SUẤT', 'NGUYÊN HÀM'].map((book, idx) => (
                <div 
                  key={idx}
                  className="w-20 sm:w-28 aspect-[3/4] bg-gradient-to-b from-red-800 to-red-950 rounded-xl border border-amber-400/40 shadow-2xl p-2 flex flex-col justify-between text-center transform -rotate-3 hover:rotate-0 transition-transform"
                >
                  <span className="text-[9px] text-amber-300 font-bold">FLASHSTUDY</span>
                  <span className="text-xs font-black text-white">{book}</span>
                  <span className="text-[8px] text-red-300 font-semibold">TOÁN 12</span>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 7: BẢNG VÀNG THÀNH TÍCH (HONOR ROLL CAROUSEL)         */}
        {/* ============================================================== */}
        <section className="max-w-[1340px] mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-[#0256d0]">📊</span> Bảng vàng thành tích
            </h2>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                &larr;
              </button>
              <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                name: 'Phạm Hải Nam',
                avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
                achievements: ['9 điểm toán THPT Quốc gia', 'Học sinh Giỏi lớp 11, 12']
              },
              {
                name: 'Lưu Gia Huy',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
                achievements: ['9 điểm toán THPT Quốc gia', 'Học sinh Xuất sắc lớp 10, 11, 12', 'Đạt giải Khuyến khích HSG']
              },
              {
                name: 'Nguyễn Đình Đức Duy',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
                achievements: ['9 điểm toán THPT Quốc gia']
              },
              {
                name: 'Nguyễn Tuấn Anh',
                avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
                achievements: ['9 điểm toán THPT Quốc gia', 'Học sinh Giỏi lớp 10, 11, 12']
              }
            ].map((student, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                {/* Red Laurel Frame Container */}
                <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-b from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] p-4 flex flex-col items-center justify-center text-white overflow-hidden shadow-inner mb-4">
                  {/* Watermark Logo */}
                  <span className="text-[10px] text-amber-300 font-extrabold tracking-widest uppercase mb-2">⚡ FLASHSTUDY</span>
                  
                  {/* Avatar inside laurel wreath styling */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-400 overflow-hidden shadow-2xl relative z-10">
                    <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Golden Ribbon */}
                  <div className="w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 font-black text-xs py-1 rounded-lg text-center mt-3 shadow-md">
                    THÀNH TÍCH XUẤT SẮC
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-base text-gray-900 text-center">{student.name}</h3>
                  <ul className="space-y-1">
                    {student.achievements.map((item, aIdx) => (
                      <li key={aIdx} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="text-[#0256d0] font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 8: GIÁO VIÊN GIẢNG DẠY (TEACHER DETAILED PROFILE)     */}
        {/* ============================================================== */}
        <section className="max-w-[1340px] mx-auto px-4 py-10 border-t border-gray-100">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-[#0256d0]">👤</span> Giáo viên giảng dạy
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm">
            
            {/* LEFT ARTWORK COLUMN */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm aspect-[4/5] rounded-3xl bg-gradient-to-b from-[#0256d0] to-[#013582] p-6 flex flex-col justify-between items-center text-white overflow-hidden shadow-2xl">
                
                {/* Background Typography Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-15 text-7xl font-black tracking-tighter select-none">
                  KID
                </div>

                <div className="relative z-10 w-full text-center pt-2">
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
                    ⚡ GIÁO VIÊN CHỦ CHỐT
                  </span>
                </div>

                {/* Portrait */}
                <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full border-4 border-cyan-300 overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80" 
                    alt="Anh Giáo Kid" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name Badge */}
                <div className="relative z-10 bg-white text-[#0256d0] font-black text-lg px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <span>📖</span>
                  <span>Anh giáo Kid</span>
                </div>

              </div>
            </div>

            {/* RIGHT INFO COLUMN */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Information Bullets */}
              <div className="space-y-3">
                <h3 className="text-lg font-extrabold text-gray-900">Thông tin giáo viên</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0256d0] font-bold text-base mt-0.5">✓</span>
                    <span>Có hơn <strong>40.000 học sinh</strong> 2K7, <strong>15.000 học sinh</strong> 2K6 và <strong>7000 học sinh</strong> 2K6 đã đăng ký khóa học.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0256d0] font-bold text-base mt-0.5">✓</span>
                    <span>Trong kỳ thi THPTQG 2025, anh Kid có học sinh đạt điểm <strong>10 Toán</strong> và hàng trăm học sinh đạt điểm <strong>9+</strong>, hàng nghìn học sinh đạt điểm <strong>8+</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0256d0] font-bold text-base mt-0.5">✓</span>
                    <span>Giáo viên có lượt xem <strong>livestream đạt TOP ĐẦU</strong> trên các nền tảng Facebook và Tiktok trong 3 năm liên tiếp 2023, 2024, 2025.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0256d0] font-bold text-base mt-0.5">✓</span>
                    <span><strong>Trao quỹ học bổng 800.000.000 Vnd</strong> dành cho học sinh 2K7 đạt thành tích cao trong kỳ thi THPTQG 2025.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0256d0] font-bold text-base mt-0.5">✓</span>
                    <span>2 Năm liền trao <strong>tặng quỹ học bổng trị giá 20.000.000 Vnd</strong> cho học sinh trường THPT Xuân Đỉnh.</span>
                  </li>
                </ul>
              </div>

              {/* Teaching Style Bullets */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h3 className="text-lg font-extrabold text-gray-900">Phong cách giảng dạy</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0256d0] font-bold text-base mt-0.5">✓</span>
                    <span>Dạy <strong>đúng trọng tâm</strong> và chuẩn cấu trúc chương trình mới.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0256d0] font-bold text-base mt-0.5">✓</span>
                    <span>Năng động, sáng tạo, chi tiết, chậm rãi, phù hợp với tất cả các học sinh, đặc biệt là học sinh <strong>mất gốc</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0256d0] font-bold text-base mt-0.5">✓</span>
                    <span>Đi sâu vào bản chất, rèn luyện <strong>tư duy</strong> để có thể xử lý bài toán linh hoạt, không máy móc.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0256d0] font-bold text-base mt-0.5">✓</span>
                    <span>Kết hợp dạy Casio để bổ trợ đa dạng kiến thức và cách làm các bài toán.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 9: FEEDBACK CỦA HỌC VIÊN (STUDENT REVIEWS)              */}
        {/* ============================================================== */}
        <section className="max-w-[1340px] mx-auto px-4 py-10 pb-16 border-t border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-[#0256d0]">💬</span> Feedback của học viên
            </h2>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                &larr;
              </button>
              <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              "Bản thân mình là đứa siêu ghét Toán lại còn mất gốc nữa nên lúc đki thi cũng sợ này kia. Mà ai dè mình nhận được kết quả hơn mong đợi lun ó. A dạy dễ hiểu mà cũng tận tâm, lộ trình khoá khá kì càng chi tiết, các ac trợ giảng thì vô cùng nhiệt tình. Mình thi điểm so với lứa 2k7 không cao, nhưng mà cũng gọi là tạm nên là siêu rcm cho 2kB nếu mà đang muốn học a Kid nhen",
              "Biết học khối C mà điểm toán vượt mức pickleball là như nào k? Biết, tại được 8.5 toán cơ đấy. Nói chung là biết anh Kid hơi muộn xíu nhưng bằng niềm tin k lung lay và sự đồng hành đầy sát sao, lộ trình trình học chi tiết của a thì sếp đã có thể tự tin điền thêm vài nguyện vọng khi có thêm tổ hợp xét tuyển đhoc đó. Mấy nhỏ 2k8 mà đang phân vân chọn giáo viên học thì học anh Kid đi cmay ơi, cmay sẽ khóc đó, khóc vì k học a sớm hơn",
              "Em biết anh Kid khi xem live trên tiktok và ấn tượng vì anh dạy kì và siêu vui tính, vì vậy nên em quyết định đăng kí học. Sau khi vào khoá em còn bất ngờ hơn nữa vì bài giảng trong khoá siêu chi tiết, có lộ trình các buổi cụ thể thể biết xem bản thân đã học đến đâu. Anh Kid thì siêu tận tâm, anh giảng kì nên một đứa học ở mức trung bình khá như em cảm thấy rất dễ hiểu, bên cạnh đó còn có các anh chị trợ giảng hỗ trợ em học rất nhiệt tình."
            ].map((reviewText, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm relative flex flex-col justify-between hover:bg-white hover:shadow-md transition-all">
                <div className="text-4xl font-black text-[#0256d0] font-serif leading-none mb-2">“</div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  {reviewText}
                </p>
                <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs font-semibold text-gray-500">
                  <span>Học viên 2K8 - Flashstudy</span>
                  <span className="text-[#0256d0]">⭐⭐⭐⭐⭐</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
