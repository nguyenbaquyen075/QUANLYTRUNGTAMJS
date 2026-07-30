import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import api from '../services/api';

const DEFAULT_COURSES = [
  {
    CourseID: 'c1',
    CourseName: 'Tổng ôn Cấp tốc 2K9 - Mục tiêu 9+',
    Category: 'BEST SELLER',
    Rating: 4.9,
    StudentsCount: 1200,
    OldPrice: '1,200,000đ',
    Price: '899,000đ',
    ImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzWXjnqvQX63M3qnyOZKb9-tJ8CpOJpTpyO8_KI_V0OL6CqdVpNaVokoWd5S1GRozX4miNOoYwofu0JGDOrGlj3m8gpBEgAkabO8AT6hg-GmqX9IdHHfmiwcLro4Axc7KQ-AIy97HhKdhJgt1n1joAO3AnCYAdxVh0E8xLE_M8D_Hguvx395qVC9aTOLNQlKL9bIvxdinNiIAbMYVDiODi1bohh-mtOpsgqsAD1EaR2h1-ssOGFNKx9g'
  },
  {
    CourseID: 'c2',
    CourseName: 'Chuyên đề Lịch sử Thế giới Hiện đại',
    Category: 'LIVE CLASS',
    Rating: 4.8,
    StudentsCount: 850,
    OldPrice: '850,000đ',
    Price: '599,000đ',
    ImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARh7mA-CsFGsTgD_6JroLv1oBQd9yvPvumC3sDWuX6e3wAc4VQSbArudNZ-Ia_0_HuKwMx6agcXjuoqBKQW3ir1qvLy2hI8Wh5vSMawa8I1wxeTj9LZ-B9INqQDwH2abPk3zLMK0dh2kYosODJuO35BvmA3iDC2wxWlGVkfE2vz-I_77qtODeqtOXgF0s2DogemBm-d8i_QJqUuXzmnMlTPatKgfYLdNVPmvAXPi7SnTCYdeGV1YJ8EA'
  },
  {
    CourseID: 'c3',
    CourseName: 'Lịch sử Việt Nam từ 1919 đến nay',
    Category: 'HOT',
    Rating: 5.0,
    StudentsCount: 2100,
    OldPrice: '1,050,000đ',
    Price: '750,000đ',
    ImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBy6xHWuzZLJjk3m1OS_XykV4o3SOZJwogM1NsI8u-7aZhtYZxZDkYsxtmfSyVnvulE5_WNXoW--wnrIchDmtyRj5tT8brr1ThVW2LazqmBJzrvR0UOI1AfZH3TOcf46BXVVlTht1l_pgPQz-AHv-gfdYA-AKSI0r263Ppue793kp2y4xSzCxzTdFkL2NsziHE67aqG_wGgQVwYvKfogmKE9UOyrA0pj7DvMtB82tRNXPEuCF0PZPdE3w'
  }
];

const BOOKS = [
  {
    id: 1,
    title: 'Sử Việt 5.0 - Tư duy mới',
    author: 'Thầy Anh Tê & Team',
    oldPrice: '350,000đ',
    price: '250,000đ',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2NjD8v4sdZBCBwGlsv7lEKxuZZqg-TdTPFWDkjY3De7BLt2BoSfwmDfNcnSKxy9gQWLZ5wu7uDVwfAL61hyVHIXtFD7vJabFzA80gtx6FfEfiqMiH4bmgvHiw_b4TfRqwxasOcfVeeidq7MlFaKTggtpe0TZO3WrXaTXBUJ65k63TKse7J-QFfChb2fopwTg16-6_3Ksd1pufraYwLkwUPUhN-JKNaAei-9DyqcA34XSwS79lVMfY1Q'
  },
  {
    id: 2,
    title: 'Siêu trọng tâm Sử 2025',
    author: 'Sách ôn thi cấp tốc',
    oldPrice: '380,000đ',
    price: '250,000đ',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeR2EBxfDW2v30mCwpp1fLrOoHK2f_10QCjer4mFkrtHlO1rSeGMvzwQUB-SORsrdS0tH96XBlM2yLr0uno3VxfMml6WhkJCezngPI6OhM-rm1WEaojtaF-BUdRT8hJ3oBO0BDma7HQIusTQRn3HLOwSTKGU6L3wHBjlchQDKMjNrOwr-Wt6UySK9fjAbwU05GPTPQ6sAsKRBVkw8gsI3lixPe6nlv-s7c9PcRjcBBsoZiCcbMURIJaQ'
  },
  {
    id: 3,
    title: 'Bách Khoa Lịch Sử',
    author: 'Tài liệu tham khảo',
    oldPrice: '600,000đ',
    price: '450,000đ',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWiKuxX0cP-UTvOGgG59WqtN4iZUCxFGpPt7yu0YYN8sMY6hQSXGqazK52Q5U1QbAG2Yn8fNqx5cpRL69kRWPL7NsoiFni-_I_CxiKXlcyE16thlwr3a33x8K5akqXK2RYt9rEBUkD2GBB-w198kTpNe73d959BvYV4nlygBipv6PaPFFKjZcPg5eR5xuhXI-XSufAptsvmrq-NTFDch0K-DH9IOC-Zl1cTpQwq7qsAeln8F9UnsRruQ'
  }
];

const DEFAULT_TEACHERS = [
  {
    FullName: 'Thầy Anh Tê',
    AvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_l5gEoACOkJL7AZDcw8JwHZZBjb9B73XtKdQewWVncrg1VS2zfGM1ODMbIw1wC2jr8slhTljJSgTZRZ0WqOzPcm7XJV-DkO1jdPqmJBqyK-6J-tZ7dv0F40gOWOf6KwflpTpCdq_QpHNPz5qEV9WOoqdpnaMYTlvs5tUY3j9v-DFAY2KdZBs_cKdD6hBLRP8OUmNANAsef7gbAI9GnDRDLuZU5O70jSD-YUtiFqmuInq0ZfKiASJUxVAkgjSjpkkM7Rs',
    Profile: {
      Subject: 'Lịch sử THPT',
      TeacherTitle: 'Giảng viên chủ chốt',
      TeacherBio: 'Chuyên gia luyện thi THPT Quốc gia với hơn 10 năm kinh nghiệm. Tác giả nhiều đầu sách lịch sử bán chạy nhất.',
      TeacherExperience: 10,
      TeacherStudents: 5000,
      TeacherRating: 5.0
    }
  },
  {
    FullName: 'Cô Minh Tú',
    AvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTLxEjqz19EdW_mkvTApARGmtzhJC2OPI-2wQQk0OYkav0isM0K9il3WS4WadDRtCgsH59z6bDI9qSNy_XMdefA2Ym7WtLF2W8jysI9Mr5Yd1Grlb-W7AZkvSs5wZwamEV6aN7CgNHG4LCznTZUR1M2baSnZmLFsEq8Gn0pNhRzoDtn39xFH2ZqE8qV2Z5VFK0MQuVW6hkzkvzgzyigTn00rdakqp6-sUl5P_rZ9O8rJMi3inQ-8QEYA',
    Profile: {
      Subject: 'Lịch sử Thế giới',
      TeacherTitle: 'Chuyên gia Lịch sử Thế giới',
      TeacherBio: 'Thạc sĩ Lịch sử học, chuyên sâu về quan hệ quốc tế với phương pháp giảng dạy trực quan, sinh động.',
      TeacherExperience: 7,
      TeacherStudents: 3200,
      TeacherRating: 4.9
    }
  },
  {
    FullName: 'Thầy Đức Huy',
    AvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5j38BAECrpki6aLCKHfihaotAfyFT5g0TCfe2UuLNo-MvBrIDeKy8_78YubBKUrhTgnef2IG4H86wbPRufrEr_toT7U4dsSMH2CD0U2ZAsWshkoMswcKc-J7cTlZIoT3rEuGDzZ90fyBETW2ZKSYj5-MCGeZx_i_JpUzDID-gTsz7MQFpv2tspYlOsUrkG8PqwJF8sV1lgJH3KkA8XTLwgSqyqCUnHET4cLLTZ_yX86AK_yOoce1GRA',
    Profile: {
      Subject: 'Luyện đề & Cố vấn',
      TeacherTitle: 'Cố vấn học thuật',
      TeacherBio: 'Chuyên gia xây dựng lộ trình học tập cá nhân hóa, giúp học sinh tối ưu hóa thời gian và đạt hiệu quả cao.',
      TeacherExperience: 8,
      TeacherStudents: 4100,
      TeacherRating: 4.9
    }
  }
];

const HONORS = [
  {
    name: 'Minh Anh',
    score: '10.0',
    quote: '"Khóa học giúp em không còn sợ môn Sử. Cách thầy liên hệ kiến thức cực dễ nhớ!"',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8ht5aw5h265wmZKMOd7PcLKSinO8Ki8RbG3Qhi3ChxIGhwzUz8ngP-5OCrU2jZh6I_qt9AZX1hewPID7ns0XC7OY1gi9gEypR2mAVf8u37xdPr9kbv6PIUe9HnlNFT05uIjM9jUbicEij7tKVhBperUupp-CMscz2P_JNAAbWdMvbeiZcyvHZbeIYNLEDZFdesRJk_99gxq-GC0JKC4jKtt6EF_l1FHtgut-ya9bAR8pFU3LsQ-ftkQ'
  },
  {
    name: 'Hoàng Nam',
    score: '9.75',
    quote: '"Em từ mất gốc đã đạt điểm cao nhờ lộ trình ôn thi chi tiết của team Anh Tê."',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTLxEjqz19EdW_mkvTApARGmtzhJC2OPI-2wQQk0OYkav0isM0K9il3WS4WadDRtCgsH59z6bDI9qSNy_XMdefA2Ym7WtLF2W8jysI9Mr5Yd1Grlb-W7AZkvSs5wZwamEV6aN7CgNHG4LCznTZUR1M2baSnZmLFsEq8Gn0pNhRzoDtn39xFH2ZqE8qV2Z5VFK0MQuVW6hkzkvzgzyigTn00rdakqp6-sUl5P_rZ9O8rJMi3inQ-8QEYA'
  },
  {
    name: 'Thanh Thảo',
    score: '9.75',
    quote: '"Tài liệu quá chất lượng, trúng tủ rất nhiều câu trong đề chính thức."',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe5vKNJfDsebE_eV4JLW6zyCE4NH92AF6bclvJ4TOGnn7zo-4qMZV-CLxb4VVRP88TR8XZ-ZYPDJZ1vvdYFxBvQNPVdERcumfML1H4cp59YMJhKtY2nccVN1CPTdD_JzjYgl41JRwcielx-7nM1LC8XCuVPkWWbCs_fBN9qrT3qZlgl_bDYzOkl1i-jOtrElhCfOU9ezMjfo45d9E6gd73l1ni3yxVN3Sm_3o441iPHFqp9wifkkxARA'
  },
  {
    name: 'Đức Duy',
    score: '10.0',
    quote: '"Video bài giảng sinh động như xem phim, học xong nhớ kiến thức tại lớp."',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5j38BAECrpki6aLCKHfihaotAfyFT5g0TCfe2UuLNo-MvBrIDeKy8_78YubBKUrhTgnef2IG4H86wbPRufrEr_toT7U4dsSMH2CD0U2ZAsWshkoMswcKc-J7cTlZIoT3rEuGDzZ90fyBETW2ZKSYj5-MCGeZx_i_JpUzDID-gTsz7MQFpv2tspYlOsUrkG8PqwJF8sV1lgJH3KkA8XTLwgSqyqCUnHET4cLLTZ_yX86AK_yOoce1GRA'
  }
];

/** Slides content up + fades it in the first time it scrolls into view. */
function Reveal({ children, delay = 0, className = '', as: Tag = 'div', ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    // Tailwind's runtime CDN compiler styles the page a beat after React mounts it,
    // so the very first layout pass can measure elements in their pre-Tailwind
    // (unstyled/collapsed) position. Wait two paints for layout to settle before
    // starting the observer, otherwise below-the-fold sections can be marked
    // "visible" immediately instead of animating in on scroll.
    let raf1, raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => observer.observe(el));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      observer.disconnect();
    };
  }, []);

  const delayClass = delay ? ` reveal-delay-${Math.min(delay, 4)}` : '';
  return (
    <Tag ref={ref} className={`reveal-up${visible ? ' is-visible' : ''}${delayClass} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  useEffect(() => {
    api.get('/Home/Data')
      .then(res => {
        if (res.data && res.data.success) {
          setData(res.data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const teachers = (data?.teachers && data.teachers.length > 0) ? data.teachers : DEFAULT_TEACHERS;

  const openTeacherDetailModal = (t) => {
    setSelectedTeacher(t);
    setIsTeacherModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeTeacherDetailModal = () => {
    setIsTeacherModalOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <MainLayout overlayHeader={true}>
      <div className="bg-surface-container-low min-h-screen text-on-surface font-body">

        {/* 1. Hero Section - Full-bleed background photo (matches trangchinh.html) */}
        <section
          className="relative min-h-[100vh] flex items-center overflow-hidden pt-[72px] bg-[#04322b] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/anhte_teacher_hero.jpg')" }}
        >
          <div className="max-w-container-max mx-auto pl-[150px] pr-gutter w-full relative z-10 py-12">
            {/* Content Column */}
            <div className="max-w-2xl space-y-7 animate-fade-in text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2fdf9d]/[0.06] backdrop-blur-md border border-[#2fdf9d]/55 shadow-lg">
                <span className="material-symbols-outlined text-[#2fdf9d] text-lg">school</span>
                <span className="text-xs font-bold uppercase tracking-widest text-[#2fdf9d]">ÔN THI TN THPT - KHÓA 2K9</span>
              </div>

              <h1
                className="font-bold leading-tight text-white text-4xl sm:text-5xl lg:text-6xl drop-shadow-md"
                style={{ fontFamily: '"Baloo 2", "Be Vietnam Pro", sans-serif' }}
              >
                Chinh phục Lịch Sử <br />
                <span
                  className="text-[#2fdf9d] italic"
                  style={{ fontFamily: '"Playfair Display", "Be Vietnam Pro", serif' }}
                >
                  cùng Anh Tê
                </span>
              </h1>

              <p className="text-lg text-[#a7c2ba] max-w-xl leading-relaxed font-normal">
                Hệ thống bài giảng chuyên sâu, phương pháp tư duy hình ảnh &amp; lộ trình ôn thi tinh gọn giúp học sinh 2K9 bứt phá điểm số 9+ môn Lịch Sử THPT 2025.
              </p>

              {/* Key achievements list */}
              <div className="space-y-2.5 max-w-lg bg-white/[0.045] p-5 rounded-2xl border border-white/[0.09] backdrop-blur-md shadow-xl">
                <div className="flex items-center gap-3 text-sm text-white font-semibold">
                  <span className="w-6 h-6 rounded-full bg-[#2fdf9d] text-[#04231d] flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                  <span>10 điểm Lịch Sử - Thủ khoa khối C00 Thái Nguyên</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white font-semibold">
                  <span className="w-6 h-6 rounded-full bg-[#2fdf9d] text-[#04231d] flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                  <span>Nhiều năm liền có Á khoa, Thủ khoa khối C các tỉnh thành</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white font-semibold">
                  <span className="w-6 h-6 rounded-full bg-[#2fdf9d] text-[#04231d] flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                  <span>Hơn 5.000+ học sinh &amp; Tác giả nhiều cuốn sách ôn thi</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/Auth/Register"
                  className="bg-[#2fdf9d] text-[#04231d] px-8 py-4 rounded-full font-extrabold flex items-center gap-2 hover:bg-[#22c48a] transition-all hover:scale-105 shadow-xl group"
                >
                  <span className="material-symbols-outlined transition-transform group-hover:rotate-12">rocket_launch</span>
                  Bắt đầu ngay
                </Link>
                <Link
                  to="/Home/Courses"
                  className="border border-white/32 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-white/10 transition-all hover:scale-105 backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined">menu_book</span>
                  Xem khoá học
                </Link>
              </div>

              {/* Highlights badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/[0.09] text-white">
                <div className="space-y-1 bg-white/[0.045] p-3 rounded-2xl border border-white/[0.09] backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-xl bg-[#2fdf9d]/[0.14] flex items-center justify-center text-[#2fdf9d]">
                    <span className="material-symbols-outlined text-lg">auto_stories</span>
                  </div>
                  <h4 className="font-bold text-xs text-white">Tài liệu chuẩn</h4>
                  <p className="text-[10px] text-[#a7c2ba] leading-tight">Bám sát cấu trúc đề</p>
                </div>
                <div className="space-y-1 bg-white/[0.045] p-3 rounded-2xl border border-white/[0.09] backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-xl bg-[#2fdf9d]/[0.14] flex items-center justify-center text-[#2fdf9d]">
                    <span className="material-symbols-outlined text-lg">groups</span>
                  </div>
                  <h4 className="font-bold text-xs text-white">Lộ trình 9+</h4>
                  <p className="text-[10px] text-[#a7c2ba] leading-tight">Tối ưu hóa thời gian</p>
                </div>
                <div className="space-y-1 bg-white/[0.045] p-3 rounded-2xl border border-white/[0.09] backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-xl bg-[#2fdf9d]/[0.14] flex items-center justify-center text-[#2fdf9d]">
                    <span className="material-symbols-outlined text-lg">assignment</span>
                  </div>
                  <h4 className="font-bold text-xs text-white">Luyện đề 24/7</h4>
                  <p className="text-[10px] text-[#a7c2ba] leading-tight">Ngân hàng câu hỏi</p>
                </div>
                <div className="space-y-1 bg-white/[0.045] p-3 rounded-2xl border border-white/[0.09] backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-xl bg-[#2fdf9d]/[0.14] flex items-center justify-center text-[#2fdf9d]">
                    <span className="material-symbols-outlined text-lg">gpp_good</span>
                  </div>
                  <h4 className="font-bold text-xs text-white">Cam kết đầu ra</h4>
                  <p className="text-[10px] text-[#a7c2ba] leading-tight">Hỗ trợ đến ngày thi</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Core Courses Section */}
        <section className="py-24 max-w-container-max mx-auto px-gutter bg-surface-container-low">
          <Reveal className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-on-surface uppercase tracking-tight">
              KHÓA HỌC <span className="text-primary italic">TIÊU BIỂU</span>
            </h2>
            <p className="text-on-surface-variant max-w-xl mx-auto text-lg">
              Lộ trình học bài bản từ cơ bản đến nâng cao, giúp bạn làm chủ mọi kiến thức lịch sử.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {DEFAULT_COURSES.map((course, idx) => (
              <Reveal
                as="article"
                key={course.CourseID}
                delay={idx % 3}
                className="group bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-60 overflow-hidden">
                    <img
                      alt={course.CourseName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      src={course.ImageUrl}
                    />
                    <div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                      {course.Category}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">
                      {course.CourseName}
                    </h3>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                        <span className="font-bold text-sm">{course.Rating}</span>
                      </div>
                      <span className="text-sm text-on-surface-variant">{course.StudentsCount}+ Học viên</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-0 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant line-through mb-1">{course.OldPrice}</span>
                    <span className="text-2xl font-bold text-primary">{course.Price}</span>
                  </div>
                  <Link
                    to="/Auth/Checkout"
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold hover:bg-primary/90 transition-all hover:-translate-y-1"
                  >
                    Đăng ký
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link
              to="/Home/Courses"
              className="border-2 border-primary text-primary px-10 py-3.5 rounded-full font-bold flex items-center gap-3 hover:bg-primary/5 transition-all hover:scale-105 group shadow-sm"
            >
              Xem thêm khóa học
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* 3. Book Library Section */}
        <section className="py-24 bg-surface-container-low overflow-hidden rounded-[3rem] mx-gutter my-12 border border-outline-variant/30">
          <Reveal className="max-w-container-max mx-auto px-gutter mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-on-surface uppercase tracking-tight">
              SÁCH <span className="text-primary italic">ĐỘC QUYỀN</span>
            </h2>
          </Reveal>
          <div className="flex gap-8 px-gutter max-w-container-max mx-auto overflow-x-auto pb-12 no-scrollbar scroll-smooth snap-x">
            {BOOKS.map((book, idx) => (
              <Reveal
                key={book.id}
                delay={idx % 3}
                className="flex-none w-[320px] snap-center group bg-white rounded-2xl overflow-hidden border border-outline-variant/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={book.image}
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-lg font-bold text-on-surface mb-1">{book.title}</h3>
                  <p className="text-xs text-on-surface-variant mb-6 uppercase tracking-wider">{book.author}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant line-through">{book.oldPrice}</span>
                      <span className="text-xl font-bold text-primary">{book.price}</span>
                    </div>
                    <button className="bg-primary text-on-primary px-5 py-2 rounded-full text-xs font-bold hover:bg-primary/90 transition-colors shadow-md">
                      Mua ngay
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="flex justify-center">
            <Link
              to="/Home/Documents"
              className="border-2 border-primary text-primary px-8 py-3 rounded-full font-bold flex items-center gap-3 hover:bg-primary/5 transition-all hover:scale-105"
            >
              Xem thêm sách
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* 4. Instructors Section */}
        <section className="py-24 max-w-container-max mx-auto px-gutter bg-surface-container-low">
          <Reveal className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-serif font-bold text-on-surface uppercase tracking-tight">
              ĐỘI NGŨ <span className="text-primary italic">GIẢNG VIÊN</span>
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">
              Những người đồng hành tâm huyết, giúp bạn biến đam mê lịch sử thành kết quả thực tế.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {teachers.map((teacher, index) => (
              <Reveal
                key={index}
                delay={index % 3}
                onClick={() => openTeacherDetailModal(teacher)}
                className="group text-center space-y-6 px-4 cursor-pointer"
              >
                <div className="relative w-52 h-52 mx-auto rounded-full overflow-hidden border-4 border-primary/20 p-2 group-hover:border-primary/50 transition-all duration-500 shadow-md">
                  <img
                    alt={teacher.FullName}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700"
                    src={teacher.AvatarUrl}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-primary">{teacher.FullName}</h3>
                  <p className="text-secondary font-bold text-sm uppercase tracking-widest">{teacher.Profile?.TeacherTitle || 'Giảng viên'}</p>
                </div>
                <p className="text-on-surface-variant text-[15px] leading-relaxed">
                  {teacher.Profile?.TeacherBio}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 5. Honors Section (Wall of Fame) */}
        <section className="py-24 bg-surface-container-low rounded-[3rem] mx-gutter my-12 border border-outline-variant/30">
          <Reveal className="max-w-container-max mx-auto px-gutter text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-on-surface uppercase tracking-tight mb-4">
              BẢNG VÀNG <span className="text-primary italic">VINH DANH</span>
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Tự hào về những thế hệ học viên đã xuất sắc vượt vũ môn.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-container-max mx-auto px-gutter">
            {HONORS.map((student, idx) => (
              <Reveal
                as="article"
                key={idx}
                delay={idx % 4}
                className="bg-white p-8 rounded-3xl border border-outline-variant/30 text-center hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <img
                  alt={student.name}
                  className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-primary/10 object-cover"
                  src={student.avatar}
                />
                <h4 className="font-bold text-lg">{student.name}</h4>
                <div className="text-primary font-bold text-sm mb-4">Điểm Sử: {student.score}</div>
                <p className="text-sm text-on-surface-variant italic leading-relaxed">{student.quote}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 6. About Center Section */}
        <section className="py-24 max-w-container-max mx-auto px-gutter bg-surface-container-low">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <Reveal className="space-y-10">
              <header className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-on-surface uppercase tracking-tight">
                  GIỚI THIỆU <span className="text-primary">TRUNG TÂM</span>
                </h2>
                <div className="w-24 h-1.5 bg-primary rounded-full" />
              </header>
              <div className="space-y-6 text-on-surface-variant text-lg leading-relaxed">
                <p>
                  Trung tâm <strong>Tri Thức Lịch Sử</strong> được sáng lập bởi Thầy Anh Tê với khát vọng thay đổi cách tiếp cận môn Lịch sử. Chúng tôi không chỉ dạy kiến thức, mà còn truyền cảm hứng về cội nguồn dân tộc.
                </p>
                <p>
                  Với hệ sinh thái học tập hiện đại, kết hợp công nghệ hình ảnh hóa kiến thức, Anh Tê đã giúp hàng ngàn học sinh tự tin chinh phục những điểm số cao nhất.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-none text-primary">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Nội dung chuẩn</h4>
                    <p className="text-sm text-on-surface-variant">Bám sát cấu trúc đề mới.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-none text-primary">
                    <span className="material-symbols-outlined">psychology</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Tư duy hình ảnh</h4>
                    <p className="text-sm text-on-surface-variant">Ghi nhớ qua sơ đồ tư duy.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-none text-primary">
                    <span className="material-symbols-outlined">groups</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Đội ngũ chuyên gia</h4>
                    <p className="text-sm text-on-surface-variant">Giảng viên giàu kinh nghiệm.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-none text-primary">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Lộ trình bứt phá</h4>
                    <p className="text-sm text-on-surface-variant">Tối ưu hóa thời gian học.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={1} className="relative group">
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-500" />
              <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden">
                <img
                  alt="Trung tâm Tri Thức Lịch Sử"
                  className="w-full h-[500px] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOrbu4zKru3YWOvUeOlXeQnHRlviJBAYCVenaR7gtKQ18cOXRwQOD0hb5sklmPwz_XSCz7lDhMip7dN4F1MvUAKjvrJVGJk7aFkH6GyxESuMV9aBBOV05XICMKZ1rXF7BaZu7AREsU06DBR3ya5T82FYo4-hJ3EiVCAAtKL6PO5uKplmA_EKdbuGW4GMbkJuLDeJX_xDsM5uiowEjK4L0hrn-2drS0mr6vzh5xFfRGJmm8HYq8JQWUBGJXLSysru9Z75o"
                />
              </div>
            </Reveal>
          </div>
        </section>

      </div>

      {/* Teacher Detail Modal */}
      {isTeacherModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 relative shadow-2xl space-y-6 border border-outline-variant/30">
            <button
              onClick={closeTeacherDetailModal}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-6">
              <img
                src={selectedTeacher.AvatarUrl}
                alt={selectedTeacher.FullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-md"
              />
              <div>
                <h3 className="text-2xl font-bold text-primary">{selectedTeacher.FullName}</h3>
                <p className="text-secondary font-bold text-sm">{selectedTeacher.Profile?.TeacherTitle}</p>
                <div className="flex items-center gap-1 text-amber-500 mt-1">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  <span className="font-bold text-sm text-on-surface">{selectedTeacher.Profile?.TeacherRating || 5.0}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-outline-variant/30 text-sm text-on-surface-variant">
              <p><strong>Kinh nghiệm:</strong> {selectedTeacher.Profile?.TeacherExperience || 10}+ năm kinh nghiệm</p>
              <p><strong>Học viên đã đào tạo:</strong> {selectedTeacher.Profile?.TeacherStudents || 5000}+ học viên</p>
              <p className="leading-relaxed"><strong>Giới thiệu:</strong> {selectedTeacher.Profile?.TeacherBio}</p>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
