import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

export default function DocumentsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);

  const docs = [
    {
      type: 'PDF',
      bg: '#fee2e2',
      color: '#dc2626',
      name: 'Bộ 50 Đề thi thử Toán THPT Quốc Gia (Có giải chi tiết)',
      meta: 'PDF • 4.5 MB',
      downloads: '1,234 lượt tải',
      tag: 'toán'
    },
    {
      type: 'PDF',
      bg: '#dbeafe',
      color: '#2563eb',
      name: 'Tóm tắt công thức Vật Lý 11 (Cả năm học)',
      meta: 'PDF • 2.1 MB',
      downloads: '890 lượt tải',
      tag: 'lý'
    },
    {
      type: 'PDF',
      bg: '#fee2e2',
      color: '#dc2626',
      name: 'Chuyên đề Hình học Không Gian lớp 11',
      meta: 'PDF • 3.8 MB',
      downloads: '678 lượt tải',
      tag: 'toán'
    },
    {
      type: 'XLS',
      bg: '#dcfce7',
      color: '#16a34a',
      name: 'Bảng tổng hợp công thức Toán lớp 10 (Excel)',
      meta: 'XLSX • 1.2 MB',
      downloads: '456 lượt tải',
      tag: 'toán'
    },
    {
      type: 'PDF',
      bg: '#dbeafe',
      color: '#2563eb',
      name: 'Đề thi thử Vật Lý 2026 (Có giải chi tiết — Bộ 30 đề)',
      meta: 'PDF • 5.2 MB',
      downloads: '1,056 lượt tải',
      tag: 'đề thi'
    },
    {
      type: 'PPT',
      bg: '#fff7ed',
      color: '#ea580c',
      name: 'Slide bài giảng Phương trình Lượng giác lớp 11',
      meta: 'PPTX • 8.5 MB',
      downloads: '234 lượt tải',
      tag: 'toán'
    }
  ];

  const faqs = [
    {
      q: 'Lớp học online tại trung tâm diễn ra như thế nào?',
      a: 'Học sinh sẽ tham gia học trực tiếp tương tác 2 chiều với giáo viên thông qua nền tảng Zoom/Meet được tích hợp sẵn trong phòng học ảo. Tất cả buổi học đều được ghi hình lưu trữ lại để học sinh xem lại bất cứ lúc nào.'
    },
    {
      q: 'Hệ thống AI giám sát và phân tích học tập như thế nào?',
      a: 'Hệ thống AI sẽ tự động phân tích điểm số các bài tập về nhà và tỉ lệ chuyên cần hàng tuần của học sinh. Từ đó, AI phân loại học sinh để cảnh báo giáo viên hỗ trợ kịp thời hoặc vinh danh học sinh xuất sắc.'
    },
    {
      q: 'Học phí thanh toán như thế nào?',
      a: 'Học phí được thanh toán online qua hệ thống hóa đơn điện tử. Phụ huynh và học sinh có thể theo dõi trạng thái thanh toán trực tiếp trên hệ thống. Hỗ trợ chuyển khoản ngân hàng và ví điện tử.'
    },
    {
      q: 'Tôi có thể học thử trước khi đăng ký chính thức không?',
      a: 'Có! Trung tâm có chính sách cho học thử miễn phí 1 buổi đầu tiên. Bạn chỉ cần đăng ký tài khoản và liên hệ chatbot AI để được hướng dẫn đăng ký học thử nhanh chóng.'
    }
  ];

  const filteredDocs = docs.filter((doc) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'toán') return doc.tag === 'toán';
    if (activeFilter === 'lý') return doc.tag === 'lý';
    if (activeFilter === 'đề thi') return doc.tag === 'đề thi';
    return true;
  });

  const toggleFaq = (idx) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  return (
    <MainLayout overlayHeader={true}>
      <style>{`
        .doc-card {
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
          transition: all 0.22s ease;
          color: #0f172a;
          cursor: pointer;
        }
        .doc-card:hover {
          border-color: #1e3a8a;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(30, 58, 138, 0.1);
        }
        .faq-item {
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          transition: border-color 0.2s;
        }
        .faq-item.active { border-color: #1e3a8a; }
      `}</style>

      {/* Hero Banner Section */}
      <section 
        className="relative overflow-hidden select-none pt-36 pb-20 border-b border-slate-800/20"
        style={{
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(15, 23, 42, 0.28) 0%, rgba(15, 23, 42, 0.12) 100%), url('/images/hero-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <h1 
            className="text-4xl md:text-5xl font-black font-serif leading-tight text-white mb-4"
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8), 0 4px 15px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.4)' }}
          >
            Tài Liệu & Đề Thi Thử
          </h1>
          <p 
            className="text-slate-200 text-xs md:text-sm max-w-xl leading-relaxed font-semibold"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.5)' }}
          >
            Tải xuống các tài liệu ôn thi chọn lọc chất lượng cao do hội đồng giáo viên biên soạn.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-800 font-serif">Kho Tài Liệu Học Tập</h2>
            <p className="text-slate-400 text-xs mt-1 font-semibold">Tài liệu được biên soạn bởi hội đồng giáo viên — hoàn toàn miễn phí.</p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2.5 mb-8">
            {[
              { key: 'all', label: 'Tất Cả' },
              { key: 'toán', label: 'Toán Học' },
              { key: 'lý', label: 'Vật Lý' },
              { key: 'đề thi', label: 'Đề Thi Thử' }
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setActiveFilter(btn.key)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                  activeFilter === btn.key
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Documents Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc, idx) => (
              <div key={idx} className="doc-card">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-[10px] shrink-0"
                  style={{ backgroundColor: doc.bg, color: doc.color }}
                >
                  {doc.type}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="doc-name text-slate-800 font-bold text-xs line-clamp-2 leading-snug mb-1">{doc.name}</div>
                  <div className="flex gap-3 text-[10px] text-slate-400 font-semibold">
                    <span>{doc.meta}</span>
                    <span>{doc.downloads}</span>
                  </div>
                </div>
                <span className="text-slate-400 font-bold text-base ml-auto">↓</span>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-24">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-extrabold text-slate-800 font-serif">Câu Hỏi Thường Gặp</h2>
              <p className="text-slate-400 text-xs mt-1 font-semibold">Mọi thắc mắc thường gặp khi tham gia trung tâm online.</p>
            </div>

            <div className="max-w-[800px] mx-auto space-y-3">
              {faqs.map((faq, idx) => {
                const active = openFaq === idx;
                return (
                  <div key={idx} className={`faq-item ${active ? 'active' : ''}`}>
                    <div
                      className="flex justify-between items-center p-4 cursor-pointer font-bold text-xs md:text-sm text-slate-800 select-none gap-4"
                      onClick={() => toggleFaq(idx)}
                    >
                      {faq.q}
                      <span className={`text-slate-400 transition-transform duration-200 text-[10px] ${active ? 'rotate-180 text-primary' : ''}`}>
                        ▼
                      </span>
                    </div>
                    <div
                      className="transition-all duration-300 overflow-hidden text-xs md:text-sm text-slate-600 leading-relaxed font-semibold px-4"
                      style={{
                        maxHeight: active ? '200px' : '0px',
                        paddingBottom: active ? '1rem' : '0px'
                      }}
                    >
                      {faq.a}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
