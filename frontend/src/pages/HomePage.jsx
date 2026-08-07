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
    score: '29.75',
    scoreLabel: 'Á KHOA',
    scoreColor: 'from-amber-400 via-amber-500 to-red-600',
    name: 'TRƯƠNG NHẬT MINH',
    increase: '🏆 Á KHOA B00 TOÀN QUỐC',
    message: 'Á Khoa B00 xuất sắc 29.75 điểm (10 Toán | 10 Sinh | 9.75 Hóa)! Cảm ơn thầy Kid và FlashStudy rất nhiều!',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '10',
    scoreLabel: 'ĐIỂM 10',
    scoreColor: 'from-[#0256d0] via-blue-600 to-indigo-700',
    name: 'NGUYỄN ĐÌNH ANH TUẤN',
    increase: '🔥 10 ĐIỂM MÔN TOÁN',
    message: 'Em đã xuất sắc đạt 10 ĐIỂM TUYỆT ĐỐI môn Toán THPTQG! Bộ đề phát triển của trung tâm sát 100%!',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '10',
    scoreLabel: 'ĐIỂM 10',
    scoreColor: 'from-yellow-400 via-amber-500 to-red-500',
    name: 'LÊ THỊ KIM NGÂN',
    increase: '⚡ TĂNG 2.5 ĐIỂM (7.5 ➔ 10)',
    message: 'Từ 7.5 điểm thi thử bứt phá vọt lên 10 ĐIỂM thi thật! Phương pháp giải nhanh trắc nghiệm siêu đỉnh!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '9.8',
    scoreLabel: 'THỦ KHOA',
    scoreColor: 'from-emerald-500 via-teal-600 to-blue-700',
    name: 'NGUYỄN THỊ HỒNG NHUNG',
    increase: '🌟 THỦ KHOA KHỐI A00',
    message: 'Em đạt 9.8 điểm môn Toán! Bài giảng video chuyên sâu và hệ thống thi thử giúp em tự tin tuyệt đối.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '9.6',
    scoreLabel: 'XUẤT SẮC',
    scoreColor: 'from-purple-500 via-indigo-600 to-blue-800',
    name: 'ĐẶNG ĐÌNH CẦU NAM',
    increase: '🚀 TĂNG 2.0 ĐIỂM (7.6 ➔ 9.6)',
    message: 'Xuất sắc đạt 9.6 điểm Toán THPTQG. Cảm ơn thầy cô trung tâm luôn giải đáp thắc mắc 24/7!',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '9.5',
    scoreLabel: 'GIỎI',
    scoreColor: 'from-orange-500 to-red-600',
    name: 'NGUYỄN QUANG THẮNG',
    increase: '📈 TĂNG 3.0 ĐIỂM (6.5 ➔ 9.5)',
    message: 'Tăng dốc từ 6.5 lên 9.5 điểm! Nhờ lộ trình khóa Tổng Ôn Cấp Tốc sát ma trận đề thi.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '9.2',
    scoreLabel: 'BỨT PHÁ',
    scoreColor: 'from-cyan-500 to-blue-700',
    name: 'LÝ YẾN NHI',
    increase: '🔥 TĂNG 4.6 ĐIỂM (4.6 ➔ 9.2)',
    message: 'Từ 4.6 điểm thi thử bứt phá thần kỳ lên 9.2 điểm thi thật! Sự kiên trì và phương pháp đúng đắn!',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '9.4',
    scoreLabel: 'XUẤT SẮC',
    scoreColor: 'from-blue-600 to-indigo-800',
    name: 'NGUYỄN ĐỨC MINH QUÂN',
    increase: '⚡ TĂNG 2.5 ĐIỂM (6.9 ➔ 9.4)',
    message: 'Đạt 9.4 điểm Toán trong kỳ thi THPTQG. Bộ đề minh họa phát triển chuẩn đét!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '29.0',
    scoreLabel: 'THỦ KHOA',
    scoreColor: 'from-amber-500 via-orange-600 to-red-700',
    name: 'PHẠM THÀNH LONG',
    increase: '🏆 THỦ KHOA KHỐI A01',
    message: 'Đạt 29.0 điểm khối A01 (9.8 Toán | 9.6 Lý | 9.6 Anh)! Hệ thống đề luyện thi cực kỳ chất lượng.',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80'
  },
  {
    score: '9.6',
    scoreLabel: 'XUẤT SẮC',
    scoreColor: 'from-pink-500 to-rose-700',
    name: 'HOÀNG THỊ THU HÀ',
    increase: '🌟 CHINH PHỤC 9.6 TOÁN 12',
    message: 'Khóa học giúp em từ học sinh trung bình bứt phá vọt lên top đầu lớp với 9.6 điểm Toán!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  }
];

const PROMO_SLIDES = [
  {
    id: 0,
    title: 'Khóa Học Tổng Ôn Lịch Sử - Giảm 20% Học Phí',
    note: 'Kiến thức toàn diện • Nắm chắc từ cơ bản đến nâng cao',
    image: '/images/history_promo_tongon.png',
    badge: '🔥 GIẢM 20% KHÓA TỔNG ÔN',
    price: 'Giảm 20%',
    oldPrice: '',
    code: 'TONGON20'
  },
  {
    id: 1,
    title: 'Khóa Học Luyện Đề Lịch Sử - Giảm 20% Học Phí',
    note: 'Luyện đúng • Trúng tủ • Điểm số bứt phá',
    image: '/images/history_promo_luyende.png',
    badge: '🎯 LUYỆN ĐỀ THPTQG - GIẢM 20%',
    price: 'Giảm 20%',
    oldPrice: '',
    code: 'LUYENDE20'
  },
  {
    id: 2,
    title: 'Khóa Học Cấp Tốc Lịch Sử - Giảm 20% Học Phí',
    note: 'Học nhanh • Hiệu quả • Về đích sớm',
    image: '/images/history_promo_captoc.png',
    badge: '⚡ BỨT PHÁ CẤP TỐC - GIẢM 20%',
    price: 'Giảm 20%',
    oldPrice: '',
    code: 'CAPTOC20'
  }
];

const ROADMAP_SLIDES = [
  {
    id: 0,
    title: 'Lộ Trình Khóa Học Tổng Ôn 5 Giai Đoạn',
    image: '/images/roadmap_tongon_wide.png',
  },
  {
    id: 1,
    title: 'Lộ Trình Khóa Học Luyện Đề 5 Giai Đoạn',
    image: '/images/roadmap_luyende_wide.png',
  },
  {
    id: 2,
    title: 'Lộ Trình Khóa Học Cấp Tốc 5 Giai Đoạn',
    image: '/images/roadmap_captoc_wide.png',
  }
];

const RED_CARD_STUDENTS = [
  {
    name: 'Phạm Hải Nam',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    achievements: ['9.8 điểm toán THPT Quốc gia', 'Á Khoa B00 Toán - Sinh - Hóa']
  },
  {
    name: 'Lưu Gia Huy',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    achievements: ['10 điểm toán THPT Quốc gia', 'Học sinh Xuất sắc lớp 10, 11, 12', 'Đạt giải Khuyến khích HSG']
  },
  {
    name: 'Nguyễn Đình Đức Duy',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    achievements: ['9.6 điểm toán THPT Quốc gia', 'Tăng dốc 2.5 điểm môn Toán']
  },
  {
    name: 'Nguyễn Tuấn Anh',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    achievements: ['10 điểm toán THPT Quốc gia', 'Học sinh Giỏi lớp 10, 11, 12']
  },
  {
    name: 'Trương Nhật Minh',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    achievements: ['29.75 điểm Khối B00', 'Thủ khoa Toán THPTQG 2026']
  },
  {
    name: 'Lê Thị Kim Ngân',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    achievements: ['10 điểm toán THPT Quốc gia', 'Tăng 2.5 điểm (7.5 ➔ 10)']
  },
  {
    name: 'Đặng Đình Cầu Nam',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    achievements: ['9.6 điểm toán THPT Quốc gia', 'Học sinh Giỏi cấp Tỉnh môn Toán']
  },
  {
    name: 'Hoàng Thị Thu Hà',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    achievements: ['9.5 điểm toán THPT Quốc gia', 'Chinh phục 9.5 Toán 12']
  }
];

const CHAT_PROOF_IMAGES = [
  '/images/chat_user_1.jpg',
  '/images/chat_user_2.jpg',
  '/images/chat_user_3.jpg',
  '/images/chat_user_4.jpg',
  '/images/chat_user_1.jpg',
  '/images/chat_user_2.jpg',
  '/images/chat_user_3.jpg',
  '/images/chat_user_4.jpg'
];

export default function HomePage() {
  const [selectedGrade, setSelectedGrade] = useState('12');
  const [timeLeft, setTimeLeft] = useState({ days: 314, hours: 12, mins: 1, secs: 52 });
  const [selectedExam, setSelectedExam] = useState(0);
  const [activePromoSlide, setActivePromoSlide] = useState(0);
  const [isPromoHovered, setIsPromoHovered] = useState(false);

  // Bảng Vàng Thành Tích Infinite Loop State
  const [achievementIndex, setAchievementIndex] = useState(0);
  const [isAchievementTransitioning, setIsAchievementTransitioning] = useState(true);
  const [isAchievementHovered, setIsAchievementHovered] = useState(false);

  // SECTION 7: Red Cards Bảng Vàng State
  const [honorCardIndex, setHonorCardIndex] = useState(0);
  const [isHonorCardTransitioning, setIsHonorCardTransitioning] = useState(true);
  const [isHonorCardHovered, setIsHonorCardHovered] = useState(false);

  // SECTION 6: Lộ Trình Khóa Học 3 Banners Slide State
  const [courseRoadmapSlide, setCourseRoadmapSlide] = useState(0);
  const [isCourseRoadmapHovered, setIsCourseRoadmapHovered] = useState(false);

  const displayList = [...CHAT_PROOF_IMAGES, ...CHAT_PROOF_IMAGES];
  const redCardDisplayList = [...RED_CARD_STUDENTS, ...RED_CARD_STUDENTS];

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

  // Promo Slider Right-to-Left Auto-play Timer (2s per slide)
  useEffect(() => {
    if (isPromoHovered) return;
    const slideInterval = setInterval(() => {
      setActivePromoSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 2000);
    return () => clearInterval(slideInterval);
  }, [isPromoHovered]);

  // SECTION 6: Lộ trình khóa học 3 Banners Auto-play Timer (2s per slide)
  useEffect(() => {
    if (isCourseRoadmapHovered) return;
    const slideInterval = setInterval(() => {
      setCourseRoadmapSlide((prev) => (prev + 1) % ROADMAP_SLIDES.length);
    }, 2000);
    return () => clearInterval(slideInterval);
  }, [isCourseRoadmapHovered]);

  // Bảng Vàng Thành Tích Right-to-Left Auto-play Timer (2s per sample - Infinite Loop)
  useEffect(() => {
    if (isAchievementHovered) return;
    const slideInterval = setInterval(() => {
      setIsAchievementTransitioning(true);
      setAchievementIndex((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(slideInterval);
  }, [isAchievementHovered]);

  // Reset infinite loop seamlessly
  useEffect(() => {
    if (achievementIndex >= CHAT_PROOF_IMAGES.length) {
      const resetTimer = setTimeout(() => {
        setIsAchievementTransitioning(false);
        setAchievementIndex(0);
      }, 800);
      return () => clearTimeout(resetTimer);
    }
  }, [achievementIndex]);

  // SECTION 7: Red Cards Bảng Vàng 2s Right-to-Left Infinite Loop
  useEffect(() => {
    if (isHonorCardHovered) return;
    const interval = setInterval(() => {
      setIsHonorCardTransitioning(true);
      setHonorCardIndex((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [isHonorCardHovered]);

  useEffect(() => {
    if (honorCardIndex >= RED_CARD_STUDENTS.length) {
      const resetTimer = setTimeout(() => {
        setIsHonorCardTransitioning(false);
        setHonorCardIndex(0);
      }, 800);
      return () => clearTimeout(resetTimer);
    }
  }, [honorCardIndex]);

  const examSchedules = [
    { title: 'Ngữ Văn', time: '11/6/2027 • 07:30', active: true },
    { title: 'Toán', time: '11/6/2027 • 14:20', active: false },
    { title: 'Bài thi tự chọn môn thứ nhất', time: '12/6/2027 • 07:30', active: false },
    { title: 'Bài thi tự chọn môn thứ hai', time: '12/6/2027 • 08:35', active: false }
  ];

  return (
    <MainLayout>
      <div className="bg-[#f0f7f4] text-gray-800 overflow-x-hidden font-sans">

        {/* ============================================================== */}
        {/* SECTION 1: HERO BANNER (100% WIDTH, FIXED 600PX HEIGHT, STRETCH) */}
        {/* ============================================================== */}
        <section className="relative w-full h-[600px] bg-[#f5f4f0] overflow-hidden border-b border-amber-900/10">
          <img
            src="/images/history_center_official_banner_hd.jpg"
            alt="Học Lịch Sử - Hiểu quá khứ, Vững tương lai"
            className="w-full h-[600px] block"
          />
        </section>
        {/* ============================================================== */}
        {/* SECTION 2: FULL-CONTAINER PROMO SLIDE CAROUSEL (RIGHT-TO-LEFT) */}
        {/* ============================================================== */}
        <section className="max-w-[1340px] mx-auto px-4 py-8 lg:py-12 relative z-20">

          {/* Marquee Banner Ribbon */}
          <div className="mb-4 overflow-hidden rounded-full bg-gradient-to-r from-[#0d3b1e] via-[#14532d] to-[#0d3b1e] border border-amber-500/30 py-2.5 px-4 shadow-lg">
            <div className="animate-marquee-rtl flex items-center gap-8 text-xs sm:text-sm font-extrabold text-amber-300">
              <span className="flex items-center gap-2">🔥 ƯU ĐÃI KHÓA HỌC LỊCH SỬ THPTQG - GIẢM GIÁ 20% TOÀN BỘ KHÓA HỌC</span>
              <span className="text-amber-200/50">•</span>
              <span className="flex items-center gap-2">🎁 TẶNG BỘ ĐỀ MINH HỌA 2027 + SÁCH TRỌNG TÂM LỊCH SỬ</span>
              <span className="text-amber-200/50">•</span>
              <span className="flex items-center gap-2">👥 ĐĂNG KÝ HỌC NHÓM GIẢM THÊM 200.000Đ/HỌC SINH</span>
              <span className="text-amber-200/50">•</span>
              <span className="flex items-center gap-2">⚡ MÃ GIẢM GIÁ: TONGON20 • LUYENDE20 • CAPTOC20</span>
              <span className="text-amber-200/50">•</span>
              {/* Duplicate for infinite loop */}
              <span className="flex items-center gap-2">🔥 ƯU ĐÃI KHÓA HỌC LỊCH SỬ THPTQG - GIẢM GIÁ 20% TOÀN BỘ KHÓA HỌC</span>
              <span className="text-amber-200/50">•</span>
              <span className="flex items-center gap-2">🎁 TẶNG BỘ ĐỀ MINH HỌA 2027 + SÁCH TRỌNG TÂM LỊCH SỬ</span>
              <span className="text-amber-200/50">•</span>
              <span className="flex items-center gap-2">👥 ĐĂNG KÝ HỌC NHÓM GIẢM THÊM 200.000Đ/HỌC SINH</span>
              <span className="text-amber-200/50">•</span>
              <span className="flex items-center gap-2">⚡ MÃ GIẢM GIÁ: TONGON20 • LUYENDE20 • CAPTOC20</span>
            </div>
          </div>

          {/* Full-Frame Slide Window Container */}
          <div
            className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-blue-400/30 bg-gradient-to-br from-[#0c3c9c] via-[#052b77] to-[#02184a] group h-[380px] sm:h-[460px] lg:h-[530px] xl:h-[560px]"
            onMouseEnter={() => setIsPromoHovered(true)}
            onMouseLeave={() => setIsPromoHovered(false)}
          >
            {/* Horizontal Track Moving Right-to-Left */}
            <div
              className="flex transition-transform duration-700 ease-in-out w-full h-full"
              style={{ transform: `translateX(-${activePromoSlide * 100}%)` }}
            >
              {PROMO_SLIDES.map((slide, idx) => (
                <div key={idx} className="min-w-full w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-900">
                  <img
                    src={slide.image}
                    alt={`Slide ${idx + 1}`}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ))}
            </div>

            {/* Clean auto-sliding container without arrows or dots */}

          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 3: THỰC TẾ TIN NHẮN THÀNH TÍCH (SLIDING 1S RIGHT-TO-LEFT)*/}
        {/* ============================================================== */}
        <section className="max-w-[1340px] mx-auto px-4 py-12 sm:py-16 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0256d0] uppercase tracking-wide flex items-center gap-3">
              <img
                src="/images/blue_star_badge_icon.png?v=7"
                alt="Blue Star Badge Icon"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain inline-block drop-shadow-sm"
              />
              <span className="tracking-wide">NHỮNG CON SỐ BIẾT NÓI</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAchievementIndex((prev) => (prev === 0 ? CHAT_PROOF_IMAGES.length - 1 : prev - 1))}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-[#0256d0] hover:text-white transition-all shadow-sm"
                aria-label="Previous Chat"
              >
                &larr;
              </button>
              <button
                onClick={() => setAchievementIndex((prev) => prev + 1)}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-[#0256d0] hover:text-white transition-all shadow-sm"
                aria-label="Next Chat"
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* Right-to-Left Infinite Auto-Sliding Window for Compact Chat Proof Images */}
          <div
            className="overflow-hidden w-full py-6 select-none"
            onMouseEnter={() => setIsAchievementHovered(true)}
            onMouseLeave={() => setIsAchievementHovered(false)}
          >
            <div
              className={`flex gap-4 ${isAchievementTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
              style={{ transform: `translateX(-${achievementIndex * 276}px)` }}
            >
              {displayList.map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="w-[230px] sm:w-[260px] h-[280px] sm:h-[310px] flex-shrink-0 bg-gray-100/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-200/80 relative transition-all duration-300 transform hover:-translate-y-1 group flex items-center justify-center p-1.5"
                >
                  <img
                    src={imgSrc}
                    alt={`Ảnh tin nhắn thành tích ${idx + 1}`}
                    className="max-w-full max-h-full object-contain group-hover:scale-102 transition-transform duration-500 rounded-xl"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* ============================================================== */}
        {/* SECTION 5: FEATURED COURSES ("Khóa học nổi bật")               */}
        {/* ============================================================== */}
        <section className="max-w-[1340px] mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0256d0] uppercase tracking-wide flex items-center gap-2.5">
              <img
                src="/images/gift_box_hand_icon.png"
                alt="Gift Box Icon"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain inline-block"
              />
              <span className="tracking-wide">KHÓA HỌC NỔI BẬT</span>
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
        {/* SECTION 6: LỘ TRÌNH KHÓA HỌC (AUTO-SLIDING BANNER 3 KHÓA)      */}
        {/* ============================================================== */}
        <section className="max-w-[1340px] mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0256d0] uppercase tracking-wide flex items-center gap-2.5">
                <img
                  src="/images/blue_map_roadmap_icon.png?v=2"
                  alt="Blue Folded Map Icon"
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain inline-block"
                />
                <span className="tracking-wide">LỘ TRÌNH KHÓA HỌC</span>
              </h2>
            </div>

            {/* Slide Navigation Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setCourseRoadmapSlide((prev) => (prev === 0 ? ROADMAP_SLIDES.length - 1 : prev - 1))}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-[#0256d0] hover:text-white transition-all shadow-sm"
                aria-label="Previous Course Banner"
              >
                &larr;
              </button>
              <button
                onClick={() => setCourseRoadmapSlide((prev) => (prev + 1) % ROADMAP_SLIDES.length)}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-[#0256d0] hover:text-white transition-all shadow-sm"
                aria-label="Next Course Banner"
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* Full-Width Auto-Sliding 3 Course Banner Container */}
          <div
            className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-emerald-500/20 bg-[#f5f8f5] group h-[280px] sm:h-[380px] md:h-[460px] lg:h-[510px] xl:h-[540px]"
            onMouseEnter={() => setIsCourseRoadmapHovered(true)}
            onMouseLeave={() => setIsCourseRoadmapHovered(false)}
          >
            <div
              className="flex transition-transform duration-700 ease-in-out w-full h-full"
              style={{ transform: `translateX(-${courseRoadmapSlide * 100}%)` }}
            >
              {ROADMAP_SLIDES.map((slide, idx) => (
                <div key={idx} className="min-w-full w-full h-full relative overflow-hidden flex items-center justify-center bg-[#f5f8f5]">
                  <img
                    src={slide.image}
                    alt={slide.title || `Lộ trình khóa học ${idx + 1}`}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 7: BẢNG VÀNG THÀNH TÍCH (AUTOPLAY 1S / 1 MẪU INFINITE) */}
        {/* ============================================================== */}
        <section className="max-w-[1340px] mx-auto px-4 py-10 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-[#0256d0]">📊</span> BẢNG VÀNG THÀNH TÍCH HỌC SINH XUẤT SẮC
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHonorCardIndex((prev) => (prev === 0 ? RED_CARD_STUDENTS.length - 1 : prev - 1))}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-[#0256d0] hover:text-white transition-all shadow-sm"
                aria-label="Previous Student"
              >
                &larr;
              </button>
              <button
                onClick={() => setHonorCardIndex((prev) => prev + 1)}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-[#0256d0] hover:text-white transition-all shadow-sm"
                aria-label="Next Student"
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* Right-to-Left Infinite Loop Window (1s per sample jump) */}
          <div
            className="overflow-hidden w-full py-4 select-none"
            onMouseEnter={() => setIsHonorCardHovered(true)}
            onMouseLeave={() => setIsHonorCardHovered(false)}
          >
            <div
              className={`flex gap-5 ${isHonorCardTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
              style={{ transform: `translateX(-${honorCardIndex * 330}px)` }}
            >
              {redCardDisplayList.map((student, idx) => (
                <div key={idx} className="w-[300px] sm:w-[315px] flex-shrink-0 bg-white rounded-2xl p-5 border border-gray-200/90 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                  {/* Red Laurel Frame Container */}
                  <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-b from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] p-4 flex flex-col items-center justify-center text-white overflow-hidden shadow-inner mb-4">
                    {/* Watermark Logo */}
                    <span className="text-[10px] text-amber-300 font-extrabold tracking-widest uppercase mb-2">⚡ FLASHSTUDY</span>

                    {/* Avatar inside laurel wreath styling */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-400 overflow-hidden shadow-2xl relative z-10 group-hover:scale-105 transition-transform">
                      <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Golden Ribbon */}
                    <div className="w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 font-black text-xs py-1 rounded-lg text-center mt-3 shadow-md">
                      THÀNH TÍCH XUẤT SẮC
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base text-gray-900 text-center truncate group-hover:text-[#0256d0] transition-colors">{student.name}</h3>
                    <ul className="space-y-1">
                      {student.achievements.map((item, aIdx) => (
                        <li key={aIdx} className="text-xs text-gray-600 flex items-start gap-1.5 font-medium">
                          <span className="text-[#0256d0] font-extrabold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
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
