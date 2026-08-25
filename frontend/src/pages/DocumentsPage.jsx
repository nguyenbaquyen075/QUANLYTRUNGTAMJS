import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

export default function DocumentsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);

  const docs = [
    {
      id: 1,
      type: 'PDF',
      title: 'Bộ 50 Đề thi thử Toán THPT Quốc Gia (Có giải chi tiết)',
      subject: 'Môn Toán 12',
      size: '4.5 MB',
      downloads: '1,234',
      tag: 'toán'
    },
    {
      id: 2,
      type: 'PDF',
      title: 'Tóm tắt công thức Vật Lý 11 (Cả năm học)',
      subject: 'Môn Vật Lý 11',
      size: '2.1 MB',
      downloads: '890',
      tag: 'lý'
    },
    {
      id: 3,
      type: 'PDF',
      title: 'Chuyên đề Hình học Không Gian lớp 11 bứt phá điểm số',
      subject: 'Môn Toán 11',
      size: '3.8 MB',
      downloads: '678',
      tag: 'toán'
    },
    {
      id: 4,
      type: 'XLS',
      title: 'Bảng tổng hợp công thức Toán lớp 10 (File Excel chuẩn)',
      subject: 'Môn Toán 10',
      size: '1.2 MB',
      downloads: '456',
      tag: 'toán'
    },
    {
      id: 5,
      type: 'PDF',
      title: 'Đề thi thử Vật Lý 2026 (Có giải chi tiết — Bộ 30 đề)',
      subject: 'Môn Vật Lý 12',
      size: '5.2 MB',
      downloads: '1,056',
      tag: 'đề thi'
    },
    {
      id: 6,
      type: 'PPT',
      title: 'Slide bài giảng Phương trình Lượng giác lớp 11',
      subject: 'Môn Toán 11',
      size: '8.5 MB',
      downloads: '234',
      tag: 'toán'
    }
  ];

  const faqs = [
    {
      q: 'Lớp học online tại trung tâm diễn ra như thế nào?',
      a: 'Học sinh sẽ tham gia học trực tiếp tương tác 2 chiều với giáo viên thông qua nền tảng phòng học ảo Flash Study. Tất cả buổi học đều được ghi hình lưu trữ lại để học sinh xem lại bất cứ lúc nào.'
    },
    {
      q: 'Hệ thống AI giám sát và phân tích học tập như thế nào?',
      a: 'Hệ thống AI sẽ tự động phân tích điểm số các bài tập về nhà và tỉ lệ chuyên cần hàng tuần của học sinh. Từ đó, AI phân loại để cảnh báo giáo viên hỗ trợ kịp thời hoặc vinh danh học sinh xuất sắc.'
    },
    {
      q: 'Học phí thanh toán như thế nào?',
      a: 'Học phí được thanh toán online qua hệ thống hóa đơn điện tử. Phụ huynh và học sinh có thể theo dõi trạng thái thanh toán trực tiếp trên hệ thống qua chuyển khoản ngân hàng hoặc quét mã QR.'
    },
    {
      q: 'Tôi có thể học thử trước khi đăng ký chính thức không?',
      a: 'Có! Trung tâm hỗ trợ học thử miễn phí. Bạn chỉ cần chọn khóa học và nhấn "Đăng ký" để vào lớp học thử ngay.'
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
    <MainLayout overlayHeader={false}>
      {/* Subtle Soft Green Grid Hero Banner */}
      <section className="relative bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#03543f] text-white py-14 sm:py-16 overflow-hidden shadow-xs">
        {/* Soft background grid lines */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px)`,
            backgroundSize: '36px 36px'
          }}
        />

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white drop-shadow-xs">
            Kho Tài Liệu Học Tập
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base font-medium">
            Tổng hợp đề thi thử, tài liệu độc quyền và sơ đồ tư duy bám sát chương trình THPT Quốc Gia.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto">
            {[
              { key: 'all', label: 'Tất cả tài liệu' },
              { key: 'toán', label: 'Môn Toán' },
              { key: 'lý', label: 'Môn Vật Lý' },
              { key: 'đề thi', label: 'Bộ Đề Thi' }
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === f.key
                    ? 'bg-[#047857] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:block">
            Hiển thị {filteredDocs.length} tài liệu
          </span>
        </div>
      </section>

      {/* Documents List & FAQ Section */}
      <section className="bg-[#f8fafc] py-10 min-h-screen">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">

          {/* Document Cards Grid */}
          <div>
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif">
                Đề Thi & Tài Liệu Mới Nhất
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Tải xuống miễn phí bộ đề thi có đáp án chi tiết và tài liệu ôn tập chất lượng cao.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 hover:border-[#047857] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 font-black text-xs shadow-sm ${
                        doc.type === 'PDF'
                          ? 'bg-gradient-to-br from-red-500 to-rose-600'
                          : doc.type === 'XLS'
                          ? 'bg-gradient-to-br from-[#047857] to-emerald-600'
                          : 'bg-gradient-to-br from-amber-500 to-orange-600'
                      }`}
                    >
                      {doc.type}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#047857] transition-colors line-clamp-1">
                        {doc.title}
                      </h4>
                      <p className="text-slate-500 text-xs font-medium mt-1 flex items-center gap-2">
                        <span>{doc.subject}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">{doc.downloads} lượt tải</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Đang chuẩn bị tải về tài liệu: ${doc.title}`)}
                    className="w-10 h-10 rounded-full bg-emerald-50 hover:bg-[#047857] text-[#047857] hover:text-white flex items-center justify-center transition-all shrink-0 shadow-2xs"
                    title="Tải xuống tài liệu"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </MainLayout>
  );
}
