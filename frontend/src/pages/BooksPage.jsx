import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';

export default function BooksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const books = [
    {
      id: 101,
      title: 'Bộ 50 Đề Thi Thử Toán THPTQG 2026 (Có Lời Giải Chi Tiết)',
      author: 'ThS. Nguyễn Văn Nguyên & Hội đồng Chuyên môn',
      subject: 'Toán Học',
      grade: 'Lớp 12',
      originalPrice: 250000,
      price: 189000,
      rating: 4.9,
      reviewsCount: 450,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600',
      badge: 'BÁN CHẠY NHẤT',
      desc: 'Tuyển tập 50 đề thi thử chuẩn cấu trúc mới Bộ GD&ĐT, đầy đủ ma trận lý thuyết và lời giải tự luận - trắc nghiệm chi tiết.'
    },
    {
      id: 102,
      title: 'Chuyên Đề Vận Dụng Cao Hình Học Không Gian 11 & 12',
      author: 'ThS. Lê Hoàng Nam',
      subject: 'Toán Học',
      grade: 'Lớp 11-12',
      originalPrice: 195000,
      price: 149000,
      rating: 4.8,
      reviewsCount: 310,
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600',
      badge: 'HOT',
      desc: 'Phương pháp bấm máy Casio phản xạ nhanh 30s và tư duy hình học không gian 3D đột phá điểm 9+.'
    },
    {
      id: 103,
      title: 'Sổ Tay Công Thức & Phản Xạ Nhanh Vật Lý 12',
      author: 'Thầy Lê Hoàng Nam',
      subject: 'Vật Lý',
      grade: 'Lớp 12',
      originalPrice: 170000,
      price: 129000,
      rating: 4.95,
      reviewsCount: 520,
      image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600',
      badge: 'KHUYÊN DÙNG',
      desc: 'Tổng hợp 100% công thức Vật Lý 12 tinh gọn dạng mindmap, kèm 500 bài tập ví dụ mẫu minh họa sinh động.'
    },
    {
      id: 104,
      title: 'Cẩm Nang Bứt Phá Điểm 9+ Tiếng Anh THPT QG',
      author: 'Cô Trần Thị Bích (IELTS 8.5)',
      subject: 'Tiếng Anh',
      grade: 'THPT',
      originalPrice: 220000,
      price: 169000,
      rating: 4.9,
      reviewsCount: 380,
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600',
      badge: 'TOP 1 SÁCH ANH',
      desc: 'Chiến thuật làm bài đọc hiểu, 2000 từ vựng cốt lõi bám sát đề thi và phương pháp loại trừ đáp án nhiễu cực chuẩn.'
    },
    {
      id: 105,
      title: 'Đột Phá 8+ Hóa Học THPTQG - Chuyên Đề Bài Tập Hữu Cơ',
      author: 'ThS. Nguyễn Văn Nguyên',
      subject: 'Hóa Học',
      grade: 'THPT',
      originalPrice: 180000,
      price: 139000,
      rating: 4.75,
      reviewsCount: 210,
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600',
      badge: 'MỚI XUẤT BẢN',
      desc: 'Phân dạng bài tập Este, Lipit, Cacbohidrat và Amin từ cơ bản đến nâng cao có giải mã chi tiết.'
    },
    {
      id: 106,
      title: 'Tuyển Tập Đề Thi Đánh Giá Năng Lực ĐHQG 2026',
      author: 'Hội đồng Giáo viên Chuyên môn',
      subject: 'Tổng Hợp',
      grade: 'Lớp 12',
      originalPrice: 280000,
      price: 219000,
      rating: 4.9,
      reviewsCount: 640,
      image: 'https://images.unsplash.com/photo-1471970471555-19d4b113e9ed?q=80&w=600',
      badge: 'ĐỒNG HÀNH ĐGNL',
      desc: 'Trọn bộ 20 đề thi thử ĐGNL chuẩn định dạng ĐHQG TP.HCM & Hà Nội kèm hệ thống phân tích kết quả AI.'
    }
  ];

  const filteredBooks = books.filter((book) => {
    const titleMatch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
    const subjectMatch = book.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const searchMatch = titleMatch || subjectMatch;

    if (activeFilter === 'all') return searchMatch;
    return searchMatch && book.subject.toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <MainLayout overlayHeader={true}>
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden select-none pt-28 sm:pt-32 pb-4 bg-transparent text-slate-900">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-slate-900 mb-2">
            Sách & Tài Liệu
          </h1>
          <p className="text-slate-600 text-xs md:text-sm max-w-xl leading-relaxed font-normal">
            Tổng hợp sách tham khảo và giáo trình luyện thi độc quyền.
          </p>
        </div>
      </section>

      {/* Books List Section */}
      <section className="py-6 sm:py-8 bg-transparent min-h-screen text-slate-900">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">

            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 text-xl">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm tên sách, môn học, tác giả..."
                className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-full text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none shadow-sm transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Subject Filters */}
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
              {subjectFilters.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setActiveFilter(btn.key)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === btn.key
                    ? 'bg-gradient-to-r from-primary via-emerald-600 to-emerald-400 text-white shadow-md shadow-primary/30'
                    : 'bg-white border border-slate-200 text-slate-700 hover:text-primary hover:border-primary'
                    }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Books Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-950/20 flex flex-col group hover:shadow-2xl hover:border-primary hover:-translate-y-1.5 transition-all duration-300 text-slate-900"
              >
                <div className="relative h-60 overflow-hidden bg-slate-100 flex items-center justify-center p-4">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-primary to-emerald-400 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                    {book.badge}
                  </span>
                </div>
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span className="text-primary font-bold">{book.subject}</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span>{book.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 line-clamp-2 min-h-[44px] group-hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-slate-500 text-xs italic">Tác giả: {book.author}</p>
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-normal">
                      {book.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[10px] text-slate-400 line-through block font-medium">{book.originalPrice.toLocaleString('vi-VN')} đ</span>
                      <span className="text-lg font-black text-primary">{book.price.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <Link
                      to={`/Auth/Checkout?bookId=${book.id}`}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary via-emerald-600 to-emerald-400 text-white text-xs font-black hover:brightness-110 shadow-md shadow-primary/20 transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                      Đặt Mua
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
