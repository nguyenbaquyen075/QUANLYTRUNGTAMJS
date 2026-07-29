import React from 'react';
import MainLayout from '../components/Layout/MainLayout';

export default function NewsPage() {
  const news = [
    {
      tag: 'Thi Cử',
      date: '12 Tháng 7, 2026',
      title: 'Chính thức công bố phương án thi tốt nghiệp THPT từ năm 2025',
      desc: 'Bộ Giáo dục & Đào tạo công bố phương án thi tốt nghiệp THPT chính thức với 2 môn bắt buộc (Toán, Văn) và 2 môn tự chọn.',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600'
    },
    {
      tag: 'Tuyển Sinh',
      date: '10 Tháng 7, 2026',
      title: 'Kế hoạch tổ chức kỳ thi Đánh giá Năng lực ĐHQG TP.HCM',
      desc: 'Thông tin chi tiết về các đợt thi Đánh giá Năng lực năm học tới, cách thức đăng ký và quy đổi điểm xét tuyển đại học.',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600'
    },
    {
      tag: 'Mẹo Học Tập',
      date: '08 Tháng 7, 2026',
      title: 'Bí quyết đạt điểm 9+ môn Toán: Tập trung các chuyên đề cốt lõi',
      desc: 'Giáo viên chuyên môn chia sẻ lộ trình ôn tập khoa học, tránh bẫy lý thuyết và tối ưu thời gian làm bài trắc nghiệm Toán.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600'
    }
  ];

  const tips = [
    {
      num: '1',
      title: 'Lên Kế Hoạch Chi Tiết',
      desc: 'Chia nhỏ khối lượng kiến thức cần học theo ngày và tuần để không bị quá tải trước kỳ thi.'
    },
    {
      num: '2',
      title: 'Luyện Đề Bấm Giờ',
      desc: 'Giải đề thi thử với thời gian quy định giúp rèn luyện tâm lý phòng thi và quản lý thời gian tối ưu.'
    },
    {
      num: '3',
      title: 'Hỏi Ngay Khi Chưa Rõ',
      desc: 'Tận dụng Trợ lý AI và đội ngũ thầy cô hỗ trợ 24/7 của trung tâm để giải đáp các câu hỏi khó.'
    }
  ];

  return (
    <MainLayout overlayHeader={true}>
      {/* Hero Banner Section (Edu Royal Navy Theme #0e1935) */}
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden select-none pt-28 sm:pt-32 pb-4 bg-transparent text-slate-900">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-slate-900 mb-2">
            Tin Tức & Sự Kiện
          </h1>
          <p className="text-slate-600 text-xs md:text-sm max-w-xl leading-relaxed font-normal">
            Cập nhật tin tức giáo dục, thông tin tuyển sinh và hoạt động mới nhất.
          </p>
        </div>
      </section>

      {/* News List Section */}
      <section className="py-6 sm:py-8 bg-transparent min-h-screen text-slate-900">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900">Tin Tức Mới Nhất</h2>
            <p className="text-xs text-slate-600 mt-1">Cập nhật tin tức giáo dục, thông tin tuyển sinh và bí quyết học tập.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {news.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-950/20 flex flex-col group hover:-translate-y-1.5 hover:border-blue-400 transition-all duration-300 text-slate-900">
                <div className="relative h-[190px] bg-slate-100 overflow-hidden shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                    {item.tag}
                  </span>
                </div>
                <div className="p-6 space-y-3 flex-1 flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold block">{item.date}</span>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed line-clamp-3">
                    {item.desc}
                  </p>
                  <button className="text-blue-600 font-bold text-xs inline-flex items-center gap-1.5 hover:gap-2.5 transition-all pt-3 mt-auto">
                    Đọc tiếp <i className="fa-solid fa-arrow-right text-[10px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-14 bg-white border border-slate-100 rounded-3xl p-7 md:p-9 shadow-xl shadow-slate-950/20 text-slate-900">
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">lightbulb</span> Mẹo ôn luyện hiệu quả
              </h3>
              <p className="text-slate-600 text-xs mt-1">Phương pháp học tập thông minh giúp học sinh bứt phá điểm số.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {tips.map((tip, idx) => (
                <div key={idx} className="bg-[#080e1e] p-5 rounded-2xl border border-blue-900/60 flex items-start gap-4 text-white">
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                    {tip.num}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm mb-1">{tip.title}</h4>
                    <p className="text-slate-300 text-xs leading-relaxed font-normal">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
