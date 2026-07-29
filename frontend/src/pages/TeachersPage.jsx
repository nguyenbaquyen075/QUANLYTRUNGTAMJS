import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useFetchData } from '../hooks/useFetchData';

const DEFAULT_TEACHERS = [
  {
    FullName: 'Thầy Anh Tê',
    AvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_l5gEoACOkJL7AZDcw8JwHZZBjb9B73XtKdQewWVncrg1VS2zfGM1ODMbIw1wC2jr8slhTljJSgTZRZ0WqOzPcm7XJV-DkO1jdPqmJBqyK-6J-tZ7dv0F40gOWOf6KwflpTpCdq_QpHNPz5qEV9WOoqdpnaMYTlvs5tUY3j9v-DFAY2KdZBs_cKdD6hBLRP8OUmNANAsef7gbAI9GnDRDLuZU5O70jSD-YUtiFqmuInq0ZfKiASJUxVAkgjSjpkkM7Rs',
    Profile: {
      Subject: 'Lịch sử THPT',
      TeacherTitle: 'Giảng viên chủ chốt',
      TeacherBio: 'Chuyên gia luyện thi THPT Quốc gia với hơn 10 năm kinh nghiệm. Tác giả của nhiều đầu sách lịch sử bán chạy nhất hiện nay, mang phương pháp tư duy hình ảnh giúp học sinh ghi nhớ cực nhanh.',
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
      TeacherBio: 'Thạc sĩ Lịch sử học, chuyên sâu về các chuyên đề quan hệ quốc tế và lịch sử hiện đại với phương pháp giảng dạy trực quan, tư duy phân tích sự kiện sắc bén.',
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
      TeacherBio: 'Chuyên gia xây dựng lộ trình học tập cá nhân hóa, giúp học sinh tối ưu hóa thời gian ôn luyện và bứt phá điểm số vượt bậc trong thời gian ngắn.',
      TeacherExperience: 8,
      TeacherStudents: 4100,
      TeacherRating: 4.9
    }
  }
];

export default function TeachersPage() {
  const { data, loading } = useFetchData('/Home/Teachers');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const apiTeachers = data?.teachers || [];
  const teachers = apiTeachers.length > 0 ? apiTeachers : DEFAULT_TEACHERS;

  const openTeacherDetailModal = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeTeacherDetailModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <MainLayout overlayHeader={true}>
      <div className="pt-20 bg-surface-container-low min-h-screen text-on-surface font-body">
        {/* 1. Hero Section */}
        <section className="relative min-h-[750px] flex items-center overflow-hidden bg-white py-12">
          <div className="max-w-[1280px] mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant/50">
                <span className="material-symbols-outlined text-primary text-lg">history_edu</span>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  ÔN THI TN THPT - KHÓA 2K9
                </span>
              </div>
              <h1 className="font-serif font-bold leading-tight text-on-surface text-5xl md:text-7xl">
                Chinh phục Lịch Sử <br />
                <span className="text-primary">cùng Anh Tê</span>
              </h1>
              <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
                Hệ thống bài giảng chuyên sâu, lộ trình ôn thi tinh gọn giúp học sinh 2K9 bứt phá điểm số môn Lịch Sử trong kỳ thi tốt nghiệp THPT năm 2025.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/Auth/Register"
                  className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-primary/90 transition-all hover:scale-105 shadow-xl group"
                >
                  <span className="material-symbols-outlined transition-transform group-hover:rotate-12">rocket_launch</span>
                  Bắt đầu ngay
                </Link>
                <Link
                  to="/Home/Courses"
                  className="border-2 border-primary text-primary px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-primary/5 transition-all hover:scale-105"
                >
                  <span className="material-symbols-outlined">menu_book</span>
                  Xem khoá học
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-outline-variant/30">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">auto_stories</span>
                  </div>
                  <h4 className="font-bold text-sm">Tài liệu chuẩn</h4>
                  <p className="text-[11px] text-on-surface-variant leading-tight">Bám sát cấu trúc đề</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">rocket_launch</span>
                  </div>
                  <h4 className="font-bold text-sm">Lộ trình bứt phá</h4>
                  <p className="text-[11px] text-on-surface-variant leading-tight">Tối ưu hóa thời gian</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">quiz</span>
                  </div>
                  <h4 className="font-bold text-sm">Luyện đề 24/7</h4>
                  <p className="text-[11px] text-on-surface-variant leading-tight">Ngân hàng câu hỏi</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">workspace_premium</span>
                  </div>
                  <h4 className="font-bold text-sm">Cam kết đầu ra</h4>
                  <p className="text-[11px] text-on-surface-variant leading-tight">Hỗ trợ đến khi thi</p>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block h-[580px] rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent z-10" />
              <img
                alt="Thầy Anh Tê - Giảng viên Lịch sử"
                className="w-full h-full object-cover opacity-90 scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOrbu4zKru3YWOvUeOlXeQnHRlviJBAYCVenaR7gtKQ18cOXRwQOD0hb5sklmPwz_XSCz7lDhMip7dN4F1MvUAKjvrJVGJk7aFkH6GyxESuMV9aBBOV05XICMKZ1rXF7BaZu7AREsU06DBR3ya5T82FYo4-hJ3EiVCAAtKL6PO5uKplmA_EKdbuGW4GMbkJuLDeJX_xDsM5uiowEjK4L0hrn-2drS0mr6vzh5xFfRGJmm8HYq8JQWUBGJXLSysru9Z75o"
              />
            </div>
          </div>
        </section>

        {/* 2. Core Courses Section */}
        <section className="py-20 max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-on-surface uppercase tracking-tight">
              KHÓA HỌC <span className="text-primary italic">TIÊU BIỂU</span>
            </h2>
            <p className="text-on-surface-variant max-w-xl mx-auto text-lg">
              Lộ trình học bài bản từ cơ bản đến nâng cao, giúp bạn làm chủ mọi kiến thức lịch sử.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Course Card 1 */}
            <article className="group bg-white rounded-2xl overflow-hidden border border-outline-variant/50 hover:shadow-2xl transition-all duration-300">
              <div className="relative h-60 overflow-hidden">
                <img
                  alt="Khóa học tổng ôn"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzWXjnqvQX63M3qnyOZKb9-tJ8CpOJpTpyO8_KI_V0OL6CqdVpNaVokoWd5S1GRozX4miNOoYwofu0JGDOrGlj3m8gpBEgAkabO8AT6hg-GmqX9IdHHfmiwcLro4Axc7KQ-AIy97HhKdhJgt1n1joAO3AnCYAdxVh0E8xLE_M8D_Hguvx395qVC9aTOLNQlKL9bIvxdinNiIAbMYVDiODi1bohh-mtOpsgqsAD1EaR2h1-ssOGFNKx9g"
                />
                <div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                  BEST SELLER
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">
                  Tổng ôn Cấp tốc 2K9 - Mục tiêu 9+
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1 text-primary">
                    <span className="material-symbols-outlined text-sm text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-bold text-sm">4.9</span>
                  </div>
                  <span className="text-sm text-on-surface-variant">1,200+ Học viên</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant line-through mb-1">1,200,000đ</span>
                    <span className="text-2xl font-bold text-primary">899,000đ</span>
                  </div>
                  <Link
                    to="/Home/Courses"
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold hover:bg-primary/90 transition-all hover:-translate-y-1 text-xs"
                  >
                    Đăng ký
                  </Link>
                </div>
              </div>
            </article>

            {/* Course Card 2 */}
            <article className="group bg-white rounded-2xl overflow-hidden border border-outline-variant/50 hover:shadow-2xl transition-all duration-300">
              <div className="relative h-60 overflow-hidden">
                <img
                  alt="Lịch sử thế giới"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuARh7mA-CsFGsTgD_6JroLv1oBQd9yvPvumC3sDWuX6e3wAc4VQSbArudNZ-Ia_0_HuKwMx6agcXjuoqBKQW3ir1qvLy2hI8Wh5vSMawa8I1wxeTj9LZ-B9INqQDwH2abPk3zLMK0dh2kYosODJuO35BvmA3iDC2wxWlGVkfE2vz-I_77qtODeqtOXgF0s2DogemBm-d8i_QJqUuXzmnMlTPatKgfYLdNVPmvAXPi7SnTCYdeGV1YJ8EA"
                />
                <div className="absolute top-4 left-4 bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                  LIVE CLASS
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">
                  Chuyên đề Lịch sử Thế giới Hiện đại
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1 text-primary">
                    <span className="material-symbols-outlined text-sm text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-bold text-sm">4.8</span>
                  </div>
                  <span className="text-sm text-on-surface-variant">850+ Học viên</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant line-through mb-1">850,000đ</span>
                    <span className="text-2xl font-bold text-primary">599,000đ</span>
                  </div>
                  <Link
                    to="/Home/Courses"
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold hover:bg-primary/90 transition-all hover:-translate-y-1 text-xs"
                  >
                    Đăng ký
                  </Link>
                </div>
              </div>
            </article>

            {/* Course Card 3 */}
            <article className="group bg-white rounded-2xl overflow-hidden border border-outline-variant/50 hover:shadow-2xl transition-all duration-300">
              <div className="relative h-60 overflow-hidden">
                <img
                  alt="Lịch sử Việt Nam"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBy6xHWuzZLJjk3m1OS_XykV4o3SOZJwogM1NsI8u-7aZhtYZxZDkYsxtmfSyVnvulE5_WNXoW--wnrIchDmtyRj5tT8brr1ThVW2LazqmBJzrvR0UOI1AfZH3TOcf46BXVVlTht1l_pgPQz-AHv-gfdYA-AKSI0r263Ppue793kp2y4xSzCxzTdFkL2NsziHE67aqG_wGgQVwYvKfogmKE9UOyrA0pj7DvMtB82tRNXPEuCF0PZPdE3w"
                />
                <div className="absolute top-4 left-4 bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                  HOT
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">
                  Lịch sử Việt Nam từ 1919 đến nay
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1 text-primary">
                    <span className="material-symbols-outlined text-sm text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-bold text-sm">5.0</span>
                  </div>
                  <span className="text-sm text-on-surface-variant">2,100+ Học viên</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant line-through mb-1">1,050,000đ</span>
                    <span className="text-2xl font-bold text-primary">750,000đ</span>
                  </div>
                  <Link
                    to="/Home/Courses"
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold hover:bg-primary/90 transition-all hover:-translate-y-1 text-xs"
                  >
                    Đăng ký
                  </Link>
                </div>
              </div>
            </article>
          </div>
          <div className="flex justify-center mt-12">
            <Link
              to="/Home/Courses"
              className="border-2 border-primary text-primary px-10 py-3.5 rounded-full font-bold flex items-center gap-3 hover:bg-primary/5 transition-all hover:scale-105 group shadow-sm text-sm"
            >
              Xem thêm khóa học
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* 3. Book Library Section */}
        <section className="py-20 bg-surface-container-low overflow-hidden rounded-[3rem] mx-4 sm:mx-8 my-8">
          <div className="max-w-[1280px] mx-auto px-6 mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-on-surface uppercase tracking-tight">
              SÁCH <span className="text-primary italic">ĐỘC QUYỀN</span>
            </h2>
          </div>
          <div className="flex gap-8 px-6 max-w-[1280px] mx-auto overflow-x-auto pb-10 no-scrollbar scroll-smooth snap-x">
            {/* Book 1 */}
            <div className="flex-none w-[310px] snap-center group bg-white rounded-2xl overflow-hidden border border-outline-variant/30 hover:shadow-xl transition-all duration-300">
              <div className="relative h-56 overflow-hidden">
                <img
                  alt="Book 1"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2NjD8v4sdZBCBwGlsv7lEKxuZZqg-TdTPFWDkjY3De7BLt2BoSfwmDfNcnSKxy9gQWLZ5wu7uDVwfAL61hyVHIXtFD7vJabFzA80gtx6FfEfiqMiH4bmgvHiw_b4TfRqwxasOcfVeeidq7MlFaKTggtpe0TZO3WrXaTXBUJ65k63TKse7J-QFfChb2fopwTg16-6_3Ksd1pufraYwLkwUPUhN-JKNaAei-9DyqcA34XSwS79lVMfY1Q"
                />
              </div>
              <div className="p-7">
                <h3 className="text-lg font-bold text-on-surface mb-1">Sử Việt 5.0 - Tư duy mới</h3>
                <p className="text-xs text-on-surface-variant mb-6 uppercase tracking-wider">Thầy Anh Tê & Team</p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-on-surface-variant line-through">350,000đ</span>
                    <span className="text-xl font-bold text-primary">250,000đ</span>
                  </div>
                  <Link
                    to="/Home/Documents"
                    className="bg-primary text-on-primary px-5 py-2 rounded-full text-xs font-bold hover:bg-primary/90 transition-colors shadow-md"
                  >
                    Mua ngay
                  </Link>
                </div>
              </div>
            </div>

            {/* Book 2 */}
            <div className="flex-none w-[310px] snap-center group bg-white rounded-2xl overflow-hidden border border-outline-variant/30 hover:shadow-xl transition-all duration-300">
              <div className="relative h-56 overflow-hidden">
                <img
                  alt="Book 2"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeR2EBxfDW2v30mCwpp1fLrOoHK2f_10QCjer4mFkrtHlO1rSeGMvzwQUB-SORsrdS0tH96XBlM2yLr0uno3VxfMml6WhkJCezngPI6OhM-rm1WEaojtaF-BUdRT8hJ3oBO0BDma7HQIusTQRn3HLOwSTKGU6L3wHBjlchQDKMjNrOwr-Wt6UySK9fjAbwU05GPTPQ6sAsKRBVkw8gsI3lixPe6nlv-s7c9PcRjcBBsoZiCcbMURIJaQ"
                />
              </div>
              <div className="p-7">
                <h3 className="text-lg font-bold text-on-surface mb-1">Siêu trọng tâm Sử 2025</h3>
                <p className="text-xs text-on-surface-variant mb-6 uppercase tracking-wider">Sách ôn thi cấp tốc</p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-on-surface-variant line-through">380,000đ</span>
                    <span className="text-xl font-bold text-primary">250,000đ</span>
                  </div>
                  <Link
                    to="/Home/Documents"
                    className="bg-primary text-on-primary px-5 py-2 rounded-full text-xs font-bold hover:bg-primary/90 transition-colors shadow-md"
                  >
                    Mua ngay
                  </Link>
                </div>
              </div>
            </div>

            {/* Book 3 */}
            <div className="flex-none w-[310px] snap-center group bg-white rounded-2xl overflow-hidden border border-outline-variant/30 hover:shadow-xl transition-all duration-300">
              <div className="relative h-56 overflow-hidden">
                <img
                  alt="Book 3"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWiKuxX0cP-UTvOGgG59WqtN4iZUCxFGpPt7yu0YYN8sMY6hQSXGqazK52Q5U1QbAG2Yn8fNqx5cpRL69kRWPL7NsoiFni-_I_CxiKXlcyE16thlwr3a33x8K5akqXK2RYt9rEBUkD2GBB-w198kTpNe73d959BvYV4nlygBipv6PaPFFKjZcPg5eR5xuhXI-XSufAptsvmrq-NTFDch0K-DH9IOC-Zl1cTpQwq7qsAeln8F9UnsRruQ"
                />
              </div>
              <div className="p-7">
                <h3 className="text-lg font-bold text-on-surface mb-1">Bách Khoa Lịch Sử</h3>
                <p className="text-xs text-on-surface-variant mb-6 uppercase tracking-wider">Tài liệu tham khảo</p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-on-surface-variant line-through">600,000đ</span>
                    <span className="text-xl font-bold text-primary">450,000đ</span>
                  </div>
                  <Link
                    to="/Home/Documents"
                    className="bg-primary text-on-primary px-5 py-2 rounded-full text-xs font-bold hover:bg-primary/90 transition-colors shadow-md"
                  >
                    Mua ngay
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <Link
              to="/Home/Documents"
              className="border-2 border-primary text-primary px-8 py-3 rounded-full font-bold flex items-center gap-3 hover:bg-primary/5 transition-all hover:scale-105 text-sm"
            >
              Xem thêm sách
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* 4. Instructors Section */}
        <section className="py-20 max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-serif font-bold text-on-surface uppercase tracking-tight">
              ĐỘI NGŨ <span className="text-primary italic">GIẢNG VIÊN</span>
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">
              Những người đồng hành tâm huyết, giúp bạn biến đam mê lịch sử thành kết quả thực tế.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {teachers.map((teacher, index) => {
                const profile = teacher.Profile || {};
                const avatarUrl = teacher.AvatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_l5gEoACOkJL7AZDcw8JwHZZBjb9B73XtKdQewWVncrg1VS2zfGM1ODMbIw1wC2jr8slhTljJSgTZRZ0WqOzPcm7XJV-DkO1jdPqmJBqyK-6J-tZ7dv0F40gOWOf6KwflpTpCdq_QpHNPz5qEV9WOoqdpnaMYTlvs5tUY3j9v-DFAY2KdZBs_cKdD6hBLRP8OUmNANAsef7gbAI9GnDRDLuZU5O70jSD-YUtiFqmuInq0ZfKiASJUxVAkgjSjpkkM7Rs';
                return (
                  <div
                    key={index}
                    onClick={() => openTeacherDetailModal(teacher)}
                    className="group text-center space-y-6 px-4 cursor-pointer"
                  >
                    <div className="relative w-52 h-52 mx-auto rounded-full overflow-hidden border-4 border-primary/20 p-2 group-hover:border-primary/50 transition-all duration-500">
                      <img
                        alt={teacher.FullName}
                        className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700"
                        src={avatarUrl}
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold text-primary">{teacher.FullName}</h3>
                      <p className="text-secondary font-bold text-xs uppercase tracking-widest">
                        {profile.TeacherTitle || profile.Subject || 'Giảng viên chủ chốt'}
                      </p>
                    </div>
                    <p className="text-on-surface-variant text-[15px] leading-relaxed line-clamp-3">
                      {profile.TeacherBio || 'Chuyên gia luyện thi THPT Quốc gia với nhiều năm kinh nghiệm, luôn đồng hành tận tâm cùng học viên.'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 5. Honors Section (Wall of Fame) */}
        <section className="py-20 bg-surface-container-low rounded-[3rem] mx-4 sm:mx-8 my-8">
          <div className="max-w-[1280px] mx-auto px-6 text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-on-surface uppercase tracking-tight mb-4">
              BẢNG VÀNG <span className="text-primary italic">VINH DANH</span>
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Tự hào về những thế hệ học viên đã xuất sắc vượt vũ môn.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1280px] mx-auto px-6">
            {/* Student 1 */}
            <article className="bg-white p-7 rounded-3xl border border-outline-variant/30 text-center hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-lg">
              <img
                alt="Minh Anh"
                className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-primary/10 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8ht5aw5h265wmZKMOd7PcLKSinO8Ki8RbG3Qhi3ChxIGhwzUz8ngP-5OCrU2jZh6I_qt9AZX1hewPID7ns0XC7OY1gi9gEypR2mAVf8u37xdPr9kbv6PIUe9HnlNFT05uIjM9jUbicEij7tKVhBperUupp-CMscz2P_JNAAbWdMvbeiZcyvHZbeIYNLEDZFdesRJk_99gxq-GC0JKC4jKtt6EF_l1FHtgut-ya9bAR8pFU3LsQ-ftkQ"
              />
              <h4 className="font-bold text-lg">Minh Anh</h4>
              <div className="text-primary font-bold text-sm mb-4">Điểm Sử: 10.0</div>
              <p className="text-sm text-on-surface-variant italic leading-relaxed">
                "Khóa học giúp em không còn sợ môn Sử. Cách thầy liên hệ kiến thức cực dễ nhớ!"
              </p>
            </article>

            {/* Student 2 */}
            <article className="bg-white p-7 rounded-3xl border border-outline-variant/30 text-center hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-lg">
              <img
                alt="Hoàng Nam"
                className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-primary/10 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTLxEjqz19EdW_mkvTApARGmtzhJC2OPI-2wQQk0OYkav0isM0K9il3WS4WadDRtCgsH59z6bDI9qSNy_XMdefA2Ym7WtLF2W8jysI9Mr5Yd1Grlb-W7AZkvSs5wZwamEV6aN7CgNHG4LCznTZUR1M2baSnZmLFsEq8Gn0pNhRzoDtn39xFH2ZqE8qV2Z5VFK0MQuVW6hkzkvzgzyigTn00rdakqp6-sUl5P_rZ9O8rJMi3inQ-8QEYA"
              />
              <h4 className="font-bold text-lg">Hoàng Nam</h4>
              <div className="text-primary font-bold text-sm mb-4">Điểm Sử: 9.75</div>
              <p className="text-sm text-on-surface-variant italic leading-relaxed">
                "Em từ mất gốc đã đạt điểm cao nhờ lộ trình ôn thi chi tiết của team Anh Tê."
              </p>
            </article>

            {/* Student 3 */}
            <article className="bg-white p-7 rounded-3xl border border-outline-variant/30 text-center hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-lg">
              <img
                alt="Thanh Thảo"
                className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-primary/10 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAe5vKNJfDsebE_eV4JLW6zyCE4NH92AF6bclvJ4TOGnn7zo-4qMZV-CLxb4VVRP88TR8XZ-ZYPDJZ1vvdYFxBvQNPVdERcumfML1H4cp59YMJhKtY2nccVN1CPTdD_JzjYgl41JRwcielx-7nM1LC8XCuVPkWWbCs_fBN9qrT3qZlgl_bDYzOkl1i-jOtrElhCfOU9ezMjfo45d9E6gd73l1ni3yxVN3Sm_3o441iPHFqp9wifkkxARA"
              />
              <h4 className="font-bold text-lg">Thanh Thảo</h4>
              <div className="text-primary font-bold text-sm mb-4">Điểm Sử: 9.75</div>
              <p className="text-sm text-on-surface-variant italic leading-relaxed">
                "Tài liệu quá chất lượng, trúng tủ rất nhiều câu trong đề chính thức."
              </p>
            </article>

            {/* Student 4 */}
            <article className="bg-white p-7 rounded-3xl border border-outline-variant/30 text-center hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-lg">
              <img
                alt="Đức Duy"
                className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-primary/10 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5j38BAECrpki6aLCKHfihaotAfyFT5g0TCfe2UuLNo-MvBrIDeKy8_78YubBKUrhTgnef2IG4H86wbPRufrEr_toT7U4dsSMH2CD0U2ZAsWshkoMswcKc-J7cTlZIoT3rEuGDzZ90fyBETW2ZKSYj5-MCGeZx_i_JpUzDID-gTsz7MQFpv2tspYlOsUrkG8PqwJF8sV1lgJH3KkA8XTLwgSqyqCUnHET4cLLTZ_yX86AK_yOoce1GRA"
              />
              <h4 className="font-bold text-lg">Đức Duy</h4>
              <div className="text-primary font-bold text-sm mb-4">Điểm Sử: 10.0</div>
              <p className="text-sm text-on-surface-variant italic leading-relaxed">
                "Video bài giảng sinh động như xem phim, học xong nhớ kiến thức tại lớp."
              </p>
            </article>
          </div>
          <div className="flex justify-center mt-12">
            <Link
              to="/Home/Teachers"
              className="border-2 border-primary text-primary px-8 py-3 rounded-full font-bold flex items-center gap-3 hover:bg-primary/5 transition-all hover:scale-105 group text-sm"
            >
              Xem thêm vinh danh
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* 6. About Center Section */}
        <section className="py-20 max-w-[1280px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <header className="space-y-3">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-on-surface uppercase tracking-tight">
                  GIỚI THIỆU <span className="text-primary">TRUNG TÂM</span>
                </h2>
                <div className="w-24 h-1.5 bg-primary rounded-full" />
              </header>
              <div className="space-y-5 text-on-surface-variant text-base leading-relaxed">
                <p>
                  Trung tâm <strong>Tri Thức Lịch Sử</strong> được sáng lập bởi Thầy Anh Tê với khát vọng thay đổi cách tiếp cận môn Lịch sử. Chúng tôi không chỉ dạy kiến thức, mà còn truyền cảm hứng về cội nguồn dân tộc.
                </p>
                <p>
                  Với hệ sinh thái học tập hiện đại, kết hợp công nghệ hình ảnh hóa kiến thức, Anh Tê đã giúp hàng ngàn học sinh tự tin chinh phục những điểm số cao nhất.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-none text-primary">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">Nội dung chuẩn</h4>
                    <p className="text-xs text-on-surface-variant">Bám sát cấu trúc đề mới.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-none text-primary">
                    <span className="material-symbols-outlined">psychology</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">Tư duy hình ảnh</h4>
                    <p className="text-xs text-on-surface-variant">Ghi nhớ qua sơ đồ tư duy.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-none text-primary">
                    <span className="material-symbols-outlined">groups</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">Đội ngũ chuyên gia</h4>
                    <p className="text-xs text-on-surface-variant">Giảng viên giàu kinh nghiệm.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-none text-primary">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">Lộ trình bứt phá</h4>
                    <p className="text-xs text-on-surface-variant">Tối ưu hóa thời gian học.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-500" />
              <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden">
                <img
                  alt="Trung tâm Tri Thức Lịch Sử"
                  className="w-full h-[450px] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOrbu4zKru3YWOvUeOlXeQnHRlviJBAYCVenaR7gtKQ18cOXRwQOD0hb5sklmPwz_XSCz7lDhMip7dN4F1MvUAKjvrJVGJk7aFkH6GyxESuMV9aBBOV05XICMKZ1rXF7BaZu7AREsU06DBR3ya5T82FYo4-hJ3EiVCAAtKL6PO5uKplmA_EKdbuGW4GMbkJuLDeJX_xDsM5uiowEjK4L0hrn-2drS0mr6vzh5xFfRGJmm8HYq8JQWUBGJXLSysru9Z75o"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Teacher Detail Modal */}
      {isModalOpen && selectedTeacher && (
        <div
          className="fixed inset-0 bg-[#080e1e]/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          onClick={closeTeacherDetailModal}
        >
          <div
            className="bg-[#0b2e22] border border-primary/40 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-scale-in text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeTeacherDetailModal}
              className="absolute top-5 right-5 text-slate-300 hover:text-white transition-colors w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center z-10"
            >
              <span className="material-symbols-outlined text-[20px] font-bold">close</span>
            </button>

            {/* Left Side: Profile Intro */}
            <div className="md:w-[38%] bg-[#080e1e]/60 p-8 border-b md:border-b-0 md:border-r border-primary/25 flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 rounded-full border-4 border-primary/40 overflow-hidden bg-primary/10 shadow-md mb-4">
                <img
                  className="w-full h-full object-cover"
                  src={selectedTeacher.AvatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_l5gEoACOkJL7AZDcw8JwHZZBjb9B73XtKdQewWVncrg1VS2zfGM1ODMbIw1wC2jr8slhTljJSgTZRZ0WqOzPcm7XJV-DkO1jdPqmJBqyK-6J-tZ7dv0F40gOWOf6KwflpTpCdq_QpHNPz5qEV9WOoqdpnaMYTlvs5tUY3j9v-DFAY2KdZBs_cKdD6hBLRP8OUmNANAsef7gbAI9GnDRDLuZU5O70jSD-YUtiFqmuInq0ZfKiASJUxVAkgjSjpkkM7Rs'}
                  alt={selectedTeacher.FullName}
                />
              </div>
              <span className="bg-gradient-to-r from-primary to-emerald-400 text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm mb-3">
                {selectedTeacher.Profile?.Subject || 'Lịch sử THPT'}
              </span>
              <h3 className="text-xl font-extrabold text-white mb-1 leading-tight">
                {selectedTeacher.FullName}
              </h3>
              <p className="text-xs text-emerald-400 font-semibold px-2">
                {selectedTeacher.Profile?.TeacherTitle || 'Giảng viên tiêu biểu'}
              </p>

              <div className="grid grid-cols-3 gap-2 w-full pt-5 border-t border-primary/25 mt-5">
                <div className="text-center">
                  <span className="block text-base font-extrabold text-emerald-400">
                    {selectedTeacher.Profile?.TeacherExperience !== null && selectedTeacher.Profile?.TeacherExperience !== undefined ? selectedTeacher.Profile.TeacherExperience : 5}+
                  </span>
                  <span className="text-[9px] text-slate-300 uppercase font-bold tracking-wider block mt-0.5">Năm KN</span>
                </div>
                <div className="text-center border-x border-primary/25">
                  <span className="block text-base font-extrabold text-emerald-400">
                    {selectedTeacher.Profile?.TeacherStudents !== null && selectedTeacher.Profile?.TeacherStudents !== undefined ? selectedTeacher.Profile.TeacherStudents : 1000}+
                  </span>
                  <span className="text-[9px] text-slate-300 uppercase font-bold tracking-wider block mt-0.5">Học sinh</span>
                </div>
                <div className="text-center">
                  <span className="block text-base font-extrabold text-amber-400 flex items-center justify-center gap-0.5">
                    {selectedTeacher.Profile?.TeacherRating ? parseFloat(selectedTeacher.Profile.TeacherRating).toFixed(1) : '4.9'}
                  </span>
                  <span className="text-[9px] text-slate-300 uppercase font-bold tracking-wider block mt-0.5">Đánh giá</span>
                </div>
              </div>
            </div>

            {/* Right Side: Details / Bio */}
            <div className="md:w-[62%] p-8 flex flex-col justify-between">
              <div className="flex-grow">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <i className="fa-solid fa-graduation-cap" /> Tiểu sử & Phương pháp giảng dạy
                </h4>
                <div className="overflow-y-auto max-h-[280px] pr-2">
                  <p className="text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                    {selectedTeacher.Profile?.TeacherBio || 'Chuyên gia giảng dạy môn Lịch sử với phương pháp hiện đại, tư duy sơ đồ hóa tư duy giúp học sinh nhớ lâu và tự tin trong mọi kỳ thi.'}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-primary/25 flex justify-end">
                <button
                  onClick={closeTeacherDetailModal}
                  className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-lg hover:bg-primary/80 transition-all"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}


