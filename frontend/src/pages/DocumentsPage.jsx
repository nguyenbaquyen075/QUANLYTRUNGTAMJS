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
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden select-none pt-28 sm:pt-32 pb-4 bg-transparent text-slate-900">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-slate-900 mb-2">
            Kho Tài Liệu Học Tập
          </h1>
          <p className="text-slate-600 text-xs md:text-sm max-w-xl leading-relaxed font-normal">
            Tổng hợp đề thi, bài tập và tài liệu bổ trợ chất lượng cao.
          </p>
        </div>
      </section>

      {/* Documents List Section */}
      <section className="py-6 sm:py-8 bg-transparent min-h-screen text-slate-900">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">

          {/* Document Section */}
          <div className="mb-14">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Đề Thi & Tài Liệu Nổi Bật</h2>
                <p className="text-xs text-slate-600 font-normal">Tải xuống miễn phí bộ đề có đáp án chi tiết.</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {[
                  { key: 'all', label: 'Tất cả' },
                  { key: 'toán', label: 'Toán Học' },
                  { key: 'lý', label: 'Vật Lý' },
                  { key: 'đề thi', label: 'Bộ Đề Thi' }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeFilter === f.key
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white border border-slate-200 text-slate-700 hover:text-blue-600'
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {filteredDocs.map((doc, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-blue-400 hover:shadow-xl transition-all group text-slate-900 shadow-lg shadow-slate-950/10"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 font-bold text-xs shadow-md ${doc.type === 'PDF'
                          ? 'bg-gradient-to-br from-red-500 to-rose-600'
                          : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                        }`}
                    >
                      {doc.type}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {doc.title}
                      </h4>
                      <p className="text-slate-500 text-xs font-normal mt-0.5">
                        {doc.subject} • {doc.size} • {doc.downloads} lượt tải
                      </p>
                    </div>
                  </div>

                  <a
                    href="#"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="pt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-white">Câu Hỏi Thường Gặp (FAQ)</h2>
              <p className="text-slate-300 text-xs mt-1 font-normal">Giải đáp nhanh các thắc mắc của học sinh và phụ huynh.</p>
            </div>

            <div className="space-y-4 max-w-4xl">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className={`bg-[#1a2b56]/95 border rounded-2xl overflow-hidden transition-all text-white ${isOpen ? 'border-cyan-400 shadow-lg shadow-blue-950/40' : 'border-blue-500/30'
                      }`}
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-5 text-left font-extrabold text-sm flex items-center justify-between gap-4 text-white hover:text-cyan-400 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span className="material-symbols-outlined text-cyan-400 transition-transform duration-200">
                        {isOpen ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-slate-300 text-xs leading-relaxed border-t border-blue-900/40 font-normal">
                        {faq.a}
                      </div>
                    )}
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
