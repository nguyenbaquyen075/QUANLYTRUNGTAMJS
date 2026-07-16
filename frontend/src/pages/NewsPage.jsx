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
    <MainLayout>
      <style>{`
        .news-card {
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          box-sizing: border-box;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          border: 1px solid #e2e8f0;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        .news-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(30, 58, 138, 0.12);
        }
      `}</style>

      {/* Hero Banner Section */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden select-none">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_30%,rgba(30,58,138,0.4),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-white text-3xl">newspaper</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-serif leading-tight text-white mb-4">
            Tin Tức & Kinh Nghiệm
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl leading-relaxed font-semibold">
            Cập nhật thay đổi mới nhất về thi cử, tuyển sinh và các mẹo ôn luyện hiệu quả từ hội đồng giáo viên.
          </p>
        </div>
      </section>

      {/* News Grid Section */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="mb-10">
            <h2 className="text-2xl font-extrabold text-slate-800">Tin Tức Mới Nhất</h2>
            <p className="text-slate-400 text-xs mt-1">Cập nhật liên tục các tin tức nóng hổi xoay quanh trung tâm và giáo dục.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item, idx) => (
              <div key={idx} className="news-card">
                <div className="relative h-[200px] bg-primary/5 overflow-hidden shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                  <span className="absolute top-4 left-4 bg-primary text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                    {item.tag}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] text-slate-400 font-bold block mb-2">{item.date}</span>
                  <h3 className="text-base font-extrabold text-slate-800 leading-snug line-clamp-2 mb-3 hover:text-primary transition-all cursor-pointer">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-6 font-semibold">
                    {item.desc}
                  </p>
                  <a href="#" className="mt-auto text-primary font-bold text-xs inline-flex items-center gap-1 hover:gap-2 transition-all">
                    Xem chi tiết <i className="fa-solid fa-arrow-right text-[10px]" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-20 bg-slate-50 border border-slate-100 rounded-3xl p-8 md:p-10 shadow-sm">
            <div className="mb-8">
              <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">lightbulb</span> Mẹo ôn luyện hiệu quả
              </h3>
              <p className="text-slate-400 text-xs mt-1">Một số gợi ý nhỏ giúp bạn duy trì năng suất học tập tối đa.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {tips.map((tip, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                    {tip.num}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm mb-1">{tip.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed font-semibold">{tip.desc}</p>
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
