import React, { useState, useEffect } from 'react';

const SECTION_FIELDS = {
  promo_slide: {
    titleLabel: 'Tiêu đề Slide Khuyến Mãi',
    subtitleLabel: 'Huy hiệu / Badge (Ví dụ: GIẢM 20% HỌC PHÍ)',
    bodyLabel: 'Ghi chú ngắn / Mô tả ngắn',
    hasExtra: true,
    frameType: 'promo'
  },
  roadmap_slide: {
    titleLabel: 'Tiêu đề Banner Lộ Trình (Ví dụ: Khóa Tổng Ôn 2027)',
    subtitleLabel: 'Tên Giai đoạn (Ví dụ: Giai đoạn 1: Xây nền tảng)',
    bodyLabel: 'Mô tả ngắn về giai đoạn lộ trình',
    hasExtra: false,
    frameType: 'promo'
  },
  chat_proof: {
    titleLabel: 'Tên Học sinh / Tên chat',
    subtitleLabel: 'Điểm số / Thành tích',
    bodyLabel: 'Ghi chú tin nhắn tra cứu',
    hasExtra: false,
    frameType: 'honor'
  },
  honor_student: {
    titleLabel: 'Tên Học sinh / Thủ khoa',
    subtitleLabel: null,
    bodyLabel: 'Danh sách Thành tích (mỗi dòng 1 ý)',
    hasExtra: false,
    frameType: 'honor'
  },
  testimonial: {
    titleLabel: 'Tên Học viên / Trường THPT',
    subtitleLabel: null,
    bodyLabel: 'Nội dung Feedback / Đánh giá chi tiết',
    hasExtra: false,
    frameType: 'testimonial'
  }
};

export default function HomepageItemModal({ section, item, onClose, onSaved }) {
  const fields = SECTION_FIELDS[section] || SECTION_FIELDS.promo_slide;
  const isEdit = !!item;

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [form, setForm] = useState({
    title: item?.Title || '',
    subtitle: item?.Subtitle || '',
    body: item?.Body || '',
    sortOrder: item?.SortOrder ?? 0,
    price: '',
    oldPrice: '',
    code: '',
    objectFit: 'object-cover',
    objectPosition: 'object-center'
  });

  const [scaleZoom, setScaleZoom] = useState(100);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(item?.ImageUrl || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item?.ExtraData) {
      try {
        const extra = JSON.parse(item.ExtraData);
        setForm((prev) => ({
          ...prev,
          price: extra.price || '',
          oldPrice: extra.oldPrice || '',
          code: extra.code || '',
          objectFit: extra.objectFit || 'object-cover',
          objectPosition: extra.objectPosition || 'object-center'
        }));
        if (extra.scaleZoom) setScaleZoom(extra.scaleZoom);
        if (extra.offsetX) setOffsetX(extra.offsetX);
        if (extra.offsetY) setOffsetY(extra.offsetY);
      } catch (e) {
        console.error(e);
      }
    }
  }, [item]);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const api = (await import('../../services/api')).default;
      const formData = new FormData();
      formData.append('section', section);
      formData.append('title', form.title);
      formData.append('subtitle', form.subtitle);
      formData.append('body', form.body);
      formData.append('sortOrder', form.sortOrder);

      const extraDataObj = {
        price: form.price,
        oldPrice: form.oldPrice,
        code: form.code,
        objectFit: form.objectFit,
        objectPosition: form.objectPosition,
        scaleZoom,
        offsetX,
        offsetY
      };
      formData.append('extraData', JSON.stringify(extraDataObj));

      if (imageFile) formData.append('image', imageFile);

      const url = isEdit ? `/Admin/Settings/Items/${item.Id}` : '/Admin/Settings/Items';
      const res = await api.post(url, formData);
      if (res.data?.success) {
        onSaved();
      } else {
        alert(res.data?.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-3 sm:p-6 transition-all duration-300`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none max-w-none' : 'w-full max-w-5xl max-h-[94vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider bg-[#047857] text-white px-2.5 py-1 rounded-md">
              {section === 'promo_slide' ? 'SLIDE BANNER' : section === 'honor_student' ? 'BẢNG VÀNG' : 'FEEDBACK'}
            </span>
            <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
              {isEdit ? 'Chỉnh Sửa Chi Tiết Mục' : 'Thêm Mục Nội Dung Mới'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold rounded-lg transition-all border border-slate-700"
            >
              {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-lg font-bold transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                {fields.titleLabel}
              </label>
              <input
                type="text"
                value={form.title}
                onChange={handleChange('title')}
                placeholder="Nhập tiêu đề hiển thị (nếu có)..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#047857] outline-none transition-all"
              />
            </div>

            {fields.subtitleLabel && (
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  {fields.subtitleLabel}
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={handleChange('subtitle')}
                  placeholder="Ví dụ: GIẢM HỌC PHÍ THÁNG 8"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#047857] outline-none transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                {fields.bodyLabel}
              </label>
              <textarea
                rows={4}
                value={form.body}
                onChange={handleChange('body')}
                placeholder="Nhập nội dung mô tả chi tiết..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-[#047857] outline-none transition-all leading-relaxed"
              />
            </div>

            {fields.hasExtra && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#047857] block">
                  Ưu Đãi & Giá Khuyến Mãi (Tùy Chọn)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Giá khuyến mãi</label>
                    <input
                      type="text"
                      value={form.price}
                      onChange={handleChange('price')}
                      placeholder="1.200.000đ"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-[#047857] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Giá cũ niêm yết</label>
                    <input
                      type="text"
                      value={form.oldPrice}
                      onChange={handleChange('oldPrice')}
                      placeholder="2.000.000đ"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-[#047857] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Mã giảm giá</label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={handleChange('code')}
                      placeholder="FLASH2025"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-[#047857] outline-none uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={handleChange('sortOrder')}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-[#047857] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Chọn Tệp Ảnh
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#047857] file:text-white hover:file:bg-[#03543f] cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  CĂN CHỈNH THỦ CÔNG (ZOOM & VỊ TRÍ)
                </span>
                <button
                  type="button"
                  onClick={() => { setScaleZoom(100); setOffsetX(0); setOffsetY(0); }}
                  className="text-[11px] font-bold text-[#047857] hover:underline"
                >
                  Đặt lại
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>Thu phóng:</span>
                    <span className="font-mono text-[#047857]">{scaleZoom}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="5"
                    value={scaleZoom}
                    onChange={(e) => setScaleZoom(Number(e.target.value))}
                    className="w-full accent-[#047857] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>Ngang (X):</span>
                    <span className="font-mono text-[#047857]">{offsetX}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={offsetX}
                    onChange={(e) => setOffsetX(Number(e.target.value))}
                    className="w-full accent-[#047857] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>Dọc (Y):</span>
                    <span className="font-mono text-[#047857]">{offsetY}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={offsetY}
                    onChange={(e) => setOffsetY(Number(e.target.value))}
                    className="w-full accent-[#047857] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-white">Xem Khung Cố Định Chuẩn Realtime</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Khung chuẩn tỷ lệ vị trí trên trang web</p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/30">
                  FIXED MATCH
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Chế Độ Co Dãn (Fit Mode)
                    </label>
                    <select
                      value={form.objectFit}
                      onChange={handleChange('objectFit')}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:border-[#047857] outline-none"
                    >
                      <option value="object-cover">Cover (Co dãn đầy khung)</option>
                      <option value="object-contain">Contain (Vừa vặn không mất góc)</option>
                      <option value="object-fill">Fill (Kéo dãn 100%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Căn Vị Trí Mặc Định
                    </label>
                    <select
                      value={form.objectPosition}
                      onChange={handleChange('objectPosition')}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:border-[#047857] outline-none"
                    >
                      <option value="object-center">Chính giữa (Center)</option>
                      <option value="object-top">Phía trên (Top)</option>
                      <option value="object-bottom">Phía dưới (Bottom)</option>
                      <option value="object-left">Bên trái (Left)</option>
                      <option value="object-right">Bên phải (Right)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="relative bg-slate-950 p-2.5 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center min-h-[220px]">
                {previewUrl ? (
                  <div className="relative w-full h-[220px] rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        transform: `scale(${scaleZoom / 100}) translate(${offsetX}%, ${offsetY}%)`,
                        transition: 'transform 0.1s ease-out'
                      }}
                      className={`w-full h-full ${form.objectFit} ${form.objectPosition}`}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs font-bold">
                    Chưa có ảnh được chọn
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold rounded-xl text-xs transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#047857] hover:bg-[#03543f] text-white font-extrabold rounded-xl text-xs shadow-md transition-all disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi ✓'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
