import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/Layout/AdminLayout';
import HomepageItemModal from './HomepageItemModal';

// Interactive Crop Box & Smart Fit Padding Uploader with Absolute Fixed Preview Box
function ExactWebFrameUploader({
  label,
  hint,
  file,
  onChange,
  currentUrl,
  objectFit,
  setObjectFit,
  objectPosition,
  setObjectPosition,
  onConfigChange,
  initialConfig,
  aspectRatio = "16/9",
  previewHeight = "240px"
}) {
  const [preview, setPreview] = useState(null);

  // Interactive Square Crop Box Bounds (in Percentage %) — Defaults to 100% Full Image
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const containerRef = useRef(null);

  // Smart Fit Mode: 'fill' (Phủ tràn vừa khít) vs 'cover_crop' (Cắt tự do)
  const [smartFitMode, setSmartFitMode] = useState('fill');
  const [scaleZoom, setScaleZoom] = useState(100);

  useEffect(() => {
    if (initialConfig) {
      try {
        const parsed = typeof initialConfig === 'string' ? JSON.parse(initialConfig) : initialConfig;
        if (parsed.cropBox) setCropBox(parsed.cropBox);
        if (parsed.smartFitMode) setSmartFitMode(parsed.smartFitMode);
        if (parsed.scaleZoom) setScaleZoom(parsed.scaleZoom);
      } catch (e) { }
    }
  }, [initialConfig]);

  useEffect(() => {
    if (onConfigChange) {
      onConfigChange({
        cropBox,
        scaleZoom,
        smartFitMode,
        objectFit: objectFit || 'object-cover',
        objectPosition: objectPosition || 'object-center'
      });
    }
  }, [cropBox, scaleZoom, smartFitMode, objectFit, objectPosition, onConfigChange]);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [file]);

  const activeUrl = preview || currentUrl;

  const [activeHandle, setActiveHandle] = useState(null);
  const handleDragRef = useRef({ mouseX: 0, mouseY: 0, boxX: 0, boxY: 0, boxW: 100, boxH: 100 });

  const handleMouseDownCrop = (e) => {
    e.preventDefault();
    setSmartFitMode('cover_crop');
    setActiveHandle('move');
    handleDragRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
      boxW: cropBox.width,
      boxH: cropBox.height
    };
  };

  const handleMouseMoveCrop = useCallback((e) => {
    if (!activeHandle || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - handleDragRef.current.mouseX) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - handleDragRef.current.mouseY) / rect.height) * 100;

    const { boxX, boxY, boxW, boxH } = handleDragRef.current;

    if (activeHandle === 'move') {
      let newX = Math.max(0, Math.min(100 - boxW, boxX + deltaXPercent));
      let newY = Math.max(0, Math.min(100 - boxH, boxY + deltaYPercent));
      setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
    }
  }, [activeHandle]);

  const handleMouseUpCrop = useCallback(() => {
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (activeHandle) {
      window.addEventListener('mousemove', handleMouseMoveCrop);
      window.addEventListener('mouseup', handleMouseUpCrop);
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveCrop);
        window.removeEventListener('mouseup', handleMouseUpCrop);
      };
    }
  }, [activeHandle, handleMouseMoveCrop, handleMouseUpCrop]);

  const handleResetCrop = () => {
    setCropBox({ x: 0, y: 0, width: 100, height: 100 });
    setScaleZoom(100);
    setSmartFitMode('fill');
  };

  return (
    <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">{label}</h4>
          {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
        </div>
        <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-[#047857] px-2.5 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
          KHUNG ĐỐI ỨNG CHUẨN TỈ LỆ WEBPAGE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: File Selector & Fine-Tuning */}
        <div className="lg:col-span-6 space-y-4">
          <label className="flex flex-col items-center justify-center px-4 py-3.5 bg-white hover:bg-emerald-50/40 border-2 border-dashed border-slate-300 hover:border-[#047857] rounded-2xl cursor-pointer transition-all text-center group">
            <span className="text-xs font-black text-slate-800 group-hover:text-[#047857] transition-colors">
              {file ? file.name : 'Nhấp để chọn ảnh mới từ máy tính'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ PNG, JPG, WEBP</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onChange(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          {/* Mode Tabs */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-300">Chế độ khớp khung</span>
              <button
                type="button"
                onClick={handleResetCrop}
                className="text-[11px] font-bold text-emerald-400 hover:underline"
              >
                Đặt lại mặc định
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSmartFitMode('fill')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  smartFitMode === 'fill'
                    ? 'bg-[#047857] text-white border-emerald-500 shadow'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                1. Phủ Tự Động (Fill)
              </button>
              <button
                type="button"
                onClick={() => setSmartFitMode('cover_crop')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  smartFitMode === 'cover_crop'
                    ? 'bg-[#047857] text-white border-emerald-500 shadow'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                2. Cắt Chỉnh Tay (Crop)
              </button>
            </div>

            {/* Sliders for Crop */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-400">Tọa độ Ngang (X):</span>
                    <span className="text-emerald-400 font-mono font-black">{Math.round(cropBox.x)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, 100 - cropBox.width)}
                    value={cropBox.x}
                    onChange={(e) => {
                      setSmartFitMode('cover_crop');
                      setCropBox((prev) => ({ ...prev, x: Number(e.target.value) }));
                    }}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5"
                  />
                </div>

                <div className="space-y-1 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-400">Tọa độ Dọc (Y):</span>
                    <span className="text-emerald-400 font-mono font-black">{Math.round(cropBox.y)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, 100 - cropBox.height)}
                    value={cropBox.y}
                    onChange={(e) => {
                      setSmartFitMode('cover_crop');
                      setCropBox((prev) => ({ ...prev, y: Number(e.target.value) }));
                    }}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5"
                  />
                </div>
              </div>

              {/* Nudge buttons */}
              <div className="flex items-center justify-between gap-1.5 pt-1 text-[11px] font-bold">
                <span className="text-slate-400 shrink-0">Dịch chuyển 3%:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSmartFitMode('cover_crop');
                      setCropBox((prev) => ({ ...prev, x: Math.max(0, prev.x - 3) }));
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors"
                  >
                    ← Trái
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSmartFitMode('cover_crop');
                      setCropBox((prev) => ({ ...prev, x: Math.min(100 - prev.width, prev.x + 3) }));
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors"
                  >
                    Phải →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSmartFitMode('cover_crop');
                      setCropBox((prev) => ({ ...prev, y: Math.max(0, prev.y - 3) }));
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors"
                  >
                    ↑ Lên
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSmartFitMode('cover_crop');
                      setCropBox((prev) => ({ ...prev, y: Math.min(100 - prev.height, prev.y + 3) }));
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors"
                  >
                    Xuống ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSmartFitMode('cover_crop');
                      setCropBox((prev) => ({
                        ...prev,
                        x: Math.max(0, (100 - prev.width) / 2),
                        y: Math.max(0, (100 - prev.height) / 2)
                      }));
                    }}
                    className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded transition-colors"
                  >
                    🎯 Căn giữa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview Frame Container */}
        <div className="lg:col-span-6 space-y-2 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-[11px] text-slate-500 font-bold">
            <span>KHUNG HIỂN THỊ THEO TỈ LỆ WEBPAGE CHUẨN</span>
            <span className="text-[#047857] font-mono">{aspectRatio}</span>
          </div>

          <div
            style={
              aspectRatio === '4/5'
                ? { aspectRatio: '4/5', height: '320px', width: 'auto' }
                : { aspectRatio, height: previewHeight, width: '100%' }
            }
            className="max-w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl relative flex items-center justify-center"
          >
            {activeUrl ? (
              <img
                src={activeUrl}
                alt={label}
                style={
                  smartFitMode === 'cover_crop'
                    ? {
                        objectFit: 'cover',
                        objectPosition: `${Math.max(0, Math.min(100, Math.round(cropBox.x + cropBox.width / 2)))}% ${Math.max(0, Math.min(100, Math.round(cropBox.y + cropBox.height / 2)))}%`,
                        width: '100%',
                        height: '100%'
                      }
                    : {
                        objectFit: 'fill',
                        width: '100%',
                        height: '100%'
                      }
                }
                className="w-full h-full block transition-all duration-75"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-center text-slate-500 text-xs font-bold">
                Chưa có hình ảnh được tải lên
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState({});
  const [items, setItems] = useState([]);
  const [generalForm, setGeneralForm] = useState(null);
  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState(false);

  // Editing Modal State for Section detail editing
  const [activeEditSection, setActiveEditSection] = useState(null); // '01' | '02' | ... | '12'
  const [itemModalState, setItemModalState] = useState(null); // { section, item }
  const [toast, setToast] = useState(null);

  // Crop configs for images
  const [heroBannerConfig, setHeroBannerConfig] = useState(null);
  const [spotlightImageConfig, setSpotlightImageConfig] = useState(null);
  const [aboutImageConfig, setAboutImageConfig] = useState(null);
  const [logoConfig, setLogoConfig] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      const res = await api.get('/Admin/Settings');
      if (res.data?.success) {
        setSettings(res.data.data.settings || {});
        setItems(res.data.data.items || []);
      }
    } catch (err) {
      showToast('Lỗi khi tải cài đặt website.', 'error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!settings) return;
    const parseBullets = (key) => {
      try {
        return settings[key] ? JSON.parse(settings[key]).join('\n') : '';
      } catch (e) {
        return '';
      }
    };

    const defaultHighlights = "Top 1 Giáo viên môn Toán THPTQG được yêu thích nhất\nHơn 10 năm kinh nghiệm luyện thi Thủ Khoa & Á Khoa\nTỉ lệ học sinh đạt điểm 9+ môn Toán trên 85%";
    const defaultTeachingStyle = "Phương pháp giảng dạy tư duy trực quan, đột phá giải nhanh\nGiáo án bám sát 100% ma trận cấu trúc đề thi Bộ GD&ĐT\nHỗ trợ học sinh giải đáp bài tập 24/7";

    setGeneralForm({
      centerName: settings.center_name || 'TRUNG TÂM LUYỆN THI ANH TÊ',
      contactAddress: settings.contact_address || 'Số 12, Ngõ 45, Đường Trần Thái Tông, Cầu Giấy, Hà Nội',
      contactPhone: settings.contact_phone || '0988.777.666',
      contactEmail: settings.contact_email || 'lienhe@anhte.edu.vn',
      contactZaloUrl: settings.contact_zalo_url || 'https://zalo.me/0988777666',
      socialFacebookUrl: settings.social_facebook_url || 'https://facebook.com/luyenthianhte',
      aboutTitle: settings.about_title || 'HỌC LỊCH SỬ - HIỂU QUÁ KHỨ, VỮNG TƯƠNG LAI',
      aboutBody: settings.about_body || 'Chào mừng các em học sinh đến với Trung tâm Luyện thi Anh Tê.\nNơi đồng hành cùng hàng ngàn học sinh chinh phục điểm 9, 10 kỳ thi THPT Quốc Gia.\nVới đội ngũ giáo viên giàu kinh nghiệm và lộ trình học tập khoa học.',
      examCountdownDate: settings.exam_countdown_date || '2027-06-11T07:30:00',
      spotlightTeacherName: settings.spotlight_teacher_name || 'Anh Giáo Kid',
      spotlightHighlights: parseBullets('spotlight_highlights') || defaultHighlights,
      spotlightTeachingStyle: parseBullets('spotlight_teaching_style') || defaultTeachingStyle,

      // Display options (Section 12)
      showCoursesCount: settings.show_courses_count !== 'false',
      showReviews: settings.show_reviews !== 'false',
      showPartners: settings.show_partners !== 'false',
      showTopBanner: settings.show_top_banner !== 'false',

      // Section visibility states (01 - 12)
      sec01Active: settings.sec01_active !== 'false',
      sec02Active: settings.sec02_active !== 'false',
      sec03Active: settings.sec03_active !== 'false',
      sec04Active: settings.sec04_active !== 'false',
      sec05Active: settings.sec05_active !== 'false',
      sec06Active: settings.sec06_active !== 'false',
      sec07Active: settings.sec07_active !== 'false',
      sec08Active: settings.sec08_active !== 'false',
      sec09Active: settings.sec09_active !== 'false',
      sec10Active: settings.sec10_active !== 'false',
      sec11Active: settings.sec11_active !== 'false',
      sec12Active: settings.sec12_active !== 'false'
    });
  }, [settings]);

  const handleGeneralChange = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setGeneralForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleFileChange = (key) => (file) => setFiles((prev) => ({ ...prev, [key]: file }));

  const handleToggleSectionActive = (secKey) => {
    setGeneralForm((prev) => ({ ...prev, [secKey]: !prev[secKey] }));
  };

  const handleGeneralSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(generalForm).forEach(([key, value]) => formData.append(key, value ?? ''));
      Object.entries(files).forEach(([key, file]) => { if (file) formData.append(key, file); });

      if (heroBannerConfig) formData.append('heroBannerConfig', JSON.stringify(heroBannerConfig));
      if (spotlightImageConfig) formData.append('spotlightImageConfig', JSON.stringify(spotlightImageConfig));
      if (aboutImageConfig) formData.append('aboutImageConfig', JSON.stringify(aboutImageConfig));
      if (logoConfig) formData.append('logoConfig', JSON.stringify(logoConfig));

      const res = await api.post('/Admin/Settings/General', formData);
      if (res.data?.success) {
        setFiles({});
        load();
        showToast('Đã lưu tất cả thay đổi thành công!');
      } else {
        showToast(res.data?.message || 'Có lỗi xảy ra khi lưu.', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ. Vui lòng thử lại.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${item.Title || 'mục này'}"?`)) return;
    try {
      const res = await api.post(`/Admin/Settings/Items/${item.Id}/Delete`, {});
      if (res.data?.success) {
        load();
        showToast('Đã xóa mục thành công.');
      }
    } catch (err) {
      showToast('Không thể xóa mục này.', 'error');
    }
  };

  const handleToggleItemActive = async (item) => {
    try {
      const formData = new FormData();
      formData.append('isActive', String(!item.IsActive));
      const res = await api.post(`/Admin/Settings/Items/${item.Id}`, formData, { headers: { 'Content-Type': undefined } });
      if (res.data?.success) {
        load();
        showToast(`Đã ${!item.IsActive ? 'hiển thị' : 'ẩn'} mục thành công.`);
      }
    } catch (err) {
      showToast('Lỗi khi thay đổi trạng thái.', 'error');
    }
  };

  if (!generalForm) {
    return (
      <AdminLayout activeTab="tabSettings" breadcrumb={['Trang chủ', 'Quản trị hệ thống', 'Quản lý trang chủ']}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#047857] gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#047857] rounded-full animate-spin"></div>
          <p className="text-sm font-bold">Đang tải cấu hình trang chủ...</p>
        </div>
      </AdminLayout>
    );
  }

  // Helper arrays for items
  const promoItems = items.filter((it) => it.Section === 'promo_slide');
  const chatProofItems = items.filter((it) => it.Section === 'chat_proof');
  const roadmapItems = items.filter((it) => it.Section === 'roadmap_slide');
  const honorItems = items.filter((it) => it.Section === 'honor_student');
  const testimonialItems = items.filter((it) => it.Section === 'testimonial');

  // Define 12 Section Cards
  const sectionCards = [
    {
      id: '01',
      title: 'Ảnh giới thiệu trung tâm',
      subtitle: 'Banner giới thiệu về trung tâm',
      badge: '1 ảnh',
      activeKey: 'sec01Active',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      preview: (
        <div className="flex items-center gap-3 bg-slate-900/90 rounded-xl p-2 max-w-md overflow-hidden border border-slate-800">
          <img
            src={settings.hero_banner_url || '/images/history_center_official_banner_hd.jpg'}
            alt="Hero Banner"
            className="w-36 h-12 object-cover rounded-lg shrink-0"
          />
          <div className="text-white text-xs font-semibold truncate">
            <p className="text-emerald-400 font-bold truncate">{generalForm.aboutTitle}</p>
            <p className="text-slate-400 text-[10px] truncate">Học lịch sử - Hiểu quá khứ, Vững tương lai</p>
          </div>
        </div>
      )
    },
    {
      id: '02',
      title: 'Ảnh ưu đãi khóa học',
      subtitle: 'Các banner ưu đãi, khuyến mãi khóa học',
      badge: `${promoItems.length || 4} ảnh`,
      activeKey: 'sec02Active',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm0 13C10.832 19.877 9.422 19 7.5 19c-1.25 0-2.427.375-3.393 1.018A1.996 1.996 0 012 18.5V7a2 2 0 012-2c1.25 0 2.427.375 3.393 1.018C8.309 6.427 9.5 6 10.5 6c.928 0 1.832.32 2.5 1m-1 12c1.168-.877 2.578-1.75 4.5-1.75 1.25 0 2.427.375 3.393 1.018A1.996 1.996 0 0022 18.5V7a2 2 0 00-2-2c-1.25 0-2.427.375-3.393 1.018C15.691 6.427 14.5 6 13.5 6c-.928 0-1.832.32-2.5 1" />
        </svg>
      ),
      preview: (
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {promoItems.length > 0 ? (
            promoItems.slice(0, 3).map((it) => (
              <img key={it.Id} src={it.ImageUrl} alt={it.Title} className="w-28 h-10 object-cover rounded-lg border border-slate-200" />
            ))
          ) : (
            <div className="flex items-center gap-2">
              <img src="/images/history_promo_tongon.png" alt="Promo" className="w-28 h-10 object-cover rounded-lg border border-slate-200" />
              <img src="/images/history_promo_luyende.png" alt="Promo" className="w-28 h-10 object-cover rounded-lg border border-slate-200" />
            </div>
          )}
        </div>
      )
    },
    {
      id: '03',
      title: 'Ảnh báo điểm của sinh viên',
      subtitle: 'Những con số biết nói',
      badge: `${chatProofItems.length || 12} ảnh`,
      activeKey: 'sec03Active',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      preview: (
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {chatProofItems.length > 0 ? (
            chatProofItems.slice(0, 5).map((it) => (
              <img key={it.Id} src={it.ImageUrl} alt="Proof" className="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-sm" />
            ))
          ) : (
            <div className="flex items-center gap-1.5">
              <img src="/images/chat_user_1.jpg" alt="Proof" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
              <img src="/images/chat_user_2.jpg" alt="Proof" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
              <img src="/images/chat_user_3.jpg" alt="Proof" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
              <img src="/images/chat_user_4.jpg" alt="Proof" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
            </div>
          )}
        </div>
      )
    },
    {
      id: '04',
      title: 'Các khóa học',
      subtitle: 'Hiển thị các khóa học nổi bật',
      badge: '8 khóa học',
      activeKey: 'sec04Active',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      preview: (
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80" alt="Course 1" className="w-20 h-11 object-cover rounded-lg border border-slate-200" />
          <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&auto=format&fit=crop&q=80" alt="Course 2" className="w-20 h-11 object-cover rounded-lg border border-slate-200" />
          <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&auto=format&fit=crop&q=80" alt="Course 3" className="w-20 h-11 object-cover rounded-lg border border-slate-200" />
          <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&auto=format&fit=crop&q=80" alt="Course 4" className="w-20 h-11 object-cover rounded-lg border border-slate-200" />
        </div>
      )
    },
    {
      id: '05',
      title: 'Ảnh lộ trình khóa học',
      subtitle: 'Hình ảnh lộ trình học tập',
      badge: `${roadmapItems.length || 1} ảnh`,
      activeKey: 'sec05Active',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      preview: (
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {roadmapItems.length > 0 ? (
            roadmapItems.slice(0, 2).map((it) => (
              <img key={it.Id} src={it.ImageUrl} alt={it.Title} className="w-32 h-10 object-cover rounded-lg border border-slate-200" />
            ))
          ) : (
            <img src="/images/roadmap_tongon_wide.png" alt="Roadmap" className="w-36 h-10 object-cover rounded-lg border border-slate-200" />
          )}
        </div>
      )
    },
    {
      id: '06',
      title: 'Ảnh thành tích nổi bật',
      subtitle: 'Thành tích, giải thưởng của học viên',
      badge: `${honorItems.length || 1} ảnh`,
      activeKey: 'sec06Active',
      iconBg: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      preview: (
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {honorItems.length > 0 ? (
            honorItems.slice(0, 4).map((it) => (
              <div key={it.Id} className="w-24 bg-gradient-to-b from-[#b91c1c] to-[#7f1d1d] rounded-xl p-1.5 text-center shrink-0 border border-red-800 text-white shadow-sm">
                <span className="text-[7px] text-amber-300 font-extrabold block">⚡ FLASHSTUDY</span>
                <img src={it.ImageUrl} alt={it.Title} className="w-8 h-8 rounded-full border-2 border-amber-400 mx-auto object-cover my-1" />
                <div className="bg-gradient-to-r from-amber-400 to-yellow-300 text-[#5c0f11] text-[7px] font-black rounded-sm py-0.5 mb-1 truncate">THÀNH TÍCH</div>
                <div className="text-[9px] font-bold truncate text-white">{it.Title}</div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gradient-to-b from-[#b91c1c] to-[#7f1d1d] rounded-xl p-1.5 text-center shrink-0 border border-red-800 text-white shadow-sm">
                <span className="text-[7px] text-amber-300 font-extrabold block">⚡ FLASHSTUDY</span>
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Kim Ngân" className="w-8 h-8 rounded-full border-2 border-amber-400 mx-auto object-cover my-1" />
                <div className="bg-gradient-to-r from-amber-400 to-yellow-300 text-[#5c0f11] text-[7px] font-black rounded-sm py-0.5 mb-1 truncate">THÀNH TÍCH</div>
                <div className="text-[9px] font-bold truncate text-white">Lê Thị Kim Ngân</div>
              </div>
              <div className="w-24 bg-gradient-to-b from-[#b91c1c] to-[#7f1d1d] rounded-xl p-1.5 text-center shrink-0 border border-red-800 text-white shadow-sm">
                <span className="text-[7px] text-amber-300 font-extrabold block">⚡ FLASHSTUDY</span>
                <img src="https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&auto=format&fit=crop&q=80" alt="Cầu Nam" className="w-8 h-8 rounded-full border-2 border-amber-400 mx-auto object-cover my-1" />
                <div className="bg-gradient-to-r from-amber-400 to-yellow-300 text-[#5c0f11] text-[7px] font-black rounded-sm py-0.5 mb-1 truncate">THÀNH TÍCH</div>
                <div className="text-[9px] font-bold truncate text-white">Đặng Đình Cầu Nam</div>
              </div>
              <div className="w-24 bg-gradient-to-b from-[#b91c1c] to-[#7f1d1d] rounded-xl p-1.5 text-center shrink-0 border border-red-800 text-white shadow-sm">
                <span className="text-[7px] text-amber-300 font-extrabold block">⚡ FLASHSTUDY</span>
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80" alt="Trương Nhật Minh" className="w-8 h-8 rounded-full border-2 border-amber-400 mx-auto object-cover my-1" />
                <div className="bg-gradient-to-r from-amber-400 to-yellow-300 text-[#5c0f11] text-[7px] font-black rounded-sm py-0.5 mb-1 truncate">THÀNH TÍCH</div>
                <div className="text-[9px] font-bold truncate text-white">Trương Nhật Minh</div>
              </div>
              <div className="w-24 bg-gradient-to-b from-[#b91c1c] to-[#7f1d1d] rounded-xl p-1.5 text-center shrink-0 border border-red-800 text-white shadow-sm">
                <span className="text-[7px] text-amber-300 font-extrabold block">⚡ FLASHSTUDY</span>
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Anh Tuấn" className="w-8 h-8 rounded-full border-2 border-amber-400 mx-auto object-cover my-1" />
                <div className="bg-gradient-to-r from-amber-400 to-yellow-300 text-[#5c0f11] text-[7px] font-black rounded-sm py-0.5 mb-1 truncate">THÀNH TÍCH</div>
                <div className="text-[9px] font-bold truncate text-white">Nguyễn Đình Anh Tuấn</div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: '07',
      title: 'Giáo viên giảng dạy',
      subtitle: 'Danh sách giáo viên và thông tin',
      badge: '12 giáo viên',
      activeKey: 'sec07Active',
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      preview: (
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg text-xs font-bold text-slate-800">
            <img src={settings.spotlight_image_url || '/images/anhte_teacher_cutout_clean.png'} alt="GV" className="w-6 h-6 rounded-full object-cover border border-emerald-500" />
            <span>{generalForm.spotlightTeacherName}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg text-xs font-bold text-slate-800">
            <div className="w-6 h-6 rounded-full bg-indigo-500 text-white font-black text-[10px] flex items-center justify-center">TB</div>
            <span>Cô Trần Thị B</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg text-xs font-bold text-slate-800">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center">LC</div>
            <span>Thầy Lê Văn C</span>
          </div>
        </div>
      )
    },

    {
      id: '09',
      title: 'Giới thiệu trung tâm',
      subtitle: 'Nội dung giới thiệu về trung tâm',
      badge: '1 nội dung',
      activeKey: 'sec09Active',
      iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="flex items-center gap-3">
          {settings.about_image_url ? (
            <img src={settings.about_image_url} alt="About" className="w-16 h-10 object-cover rounded-lg border border-slate-200" />
          ) : (
            <div className="w-16 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-500 font-bold">Nội dung</div>
          )}
          <p className="text-xs text-slate-600 font-medium max-w-sm line-clamp-1">
            {generalForm.aboutBody}
          </p>
        </div>
      )
    },
    {
      id: '10',
      title: 'Địa chỉ và thông tin trung tâm',
      subtitle: 'Thông tin các cơ sở của trung tâm',
      badge: '3 cơ sở',
      activeKey: 'sec10Active',
      iconBg: 'bg-red-50 text-red-600 border-red-100',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      preview: (
        <div className="text-xs text-slate-700 space-y-0.5 max-w-md">
          <p className="font-semibold line-clamp-1">📍 CS 1: {generalForm.contactAddress}</p>
          <p className="text-slate-500 text-[11px]">📍 CS 2: Số 05, Đường Láng, Đống Đa, Hà Nội</p>
        </div>
      )
    },
    {
      id: '11',
      title: 'Thông tin liên hệ',
      subtitle: 'Thông tin liên hệ chung',
      badge: '1 thông tin',
      activeKey: 'sec11Active',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      preview: (
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1">📞 {generalForm.contactPhone}</span>
          <span className="flex items-center gap-1">✉️ {generalForm.contactEmail}</span>
          <span className="flex items-center gap-1">🌐 www.anhte.edu.vn</span>
        </div>
      )
    },
    {
      id: '12',
      title: 'Cài đặt khác',
      subtitle: 'Các thiết lập hiển thị khác',
      badge: '4 tùy chọn',
      activeKey: 'sec12Active',
      iconBg: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      preview: (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-medium text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${generalForm.showCoursesCount ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            <span>Hiển thị số lượng khóa học</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${generalForm.showReviews ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            <span>Hiển thị đánh giá</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${generalForm.showPartners ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            <span>Hiển thị đối tác</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${generalForm.showTopBanner ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            <span>Hiển thị banner trên cùng</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <AdminLayout activeTab="tabSettings" breadcrumb={['Trang chủ', 'Quản trị hệ thống', 'Quản lý trang chủ']}>
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[2000] px-5 py-3.5 rounded-xl shadow-2xl text-white font-extrabold text-xs sm:text-sm flex items-center gap-3 ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-[#047857]'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      <div className="space-y-6 pb-24 max-w-7xl mx-auto">
        {/* Top Header Bar matching User Mockup */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quản lý trang chủ
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
              Quản lý và chỉnh sửa nội dung hiển thị trên trang chủ website
            </p>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            {/* Notification Bell Badge */}
            <div className="relative cursor-pointer p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 bg-red-500 text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                12
              </span>
            </div>

            {/* Admin Avatar Badge */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                A
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-black text-slate-900">Admin</div>
                <div className="text-[10px] text-slate-500 font-semibold">Quản trị viên</div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {sectionCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Info Column */}
              <div className="flex items-start sm:items-center gap-3.5 shrink-0 min-w-[260px]">
                {/* Number Box */}
                <div className="w-10 h-10 rounded-xl bg-slate-100/90 border border-slate-200/80 font-mono font-black text-slate-700 flex items-center justify-center text-sm shrink-0">
                  {card.id}
                </div>

                {/* Colored Icon Container */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${card.iconBg}`}>
                  {card.icon}
                </div>

                {/* Title, Subtitle, Badge */}
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{card.subtitle}</p>
                  <span className="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-[#047857] border border-emerald-200">
                    {card.badge}
                  </span>
                </div>
              </div>

              {/* Middle Live Preview Box */}
              <div className="flex-1 min-w-0 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 flex items-center justify-start overflow-hidden">
                {card.preview}
              </div>

              {/* Right Action Column */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-auto border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 w-full md:w-auto justify-between md:justify-end">
                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => setActiveEditSection(card.id)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-[#047857] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Chỉnh sửa</span>
                </button>

                {/* Status Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleSectionActive(card.activeKey)}
                  className={`flex items-center gap-1.5 text-xs font-extrabold px-3 py-2 rounded-xl transition-all border ${
                    generalForm[card.activeKey]
                      ? 'bg-emerald-50 text-[#047857] border-emerald-200'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${generalForm[card.activeKey] ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span>{generalForm[card.activeKey] ? 'Hiển thị' : 'Đang ẩn'}</span>
                </button>

                {/* More Options Button */}
                <button
                  type="button"
                  onClick={() => setActiveEditSection(card.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Footer Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm font-medium">
            <span className="text-blue-600 text-base">ⓘ</span>
            <span>Lưu ý: Sau khi chỉnh sửa nội dung, hãy nhấn "Lưu tất cả thay đổi" để cập nhật trên trang chủ.</span>
          </div>

          <button
            type="button"
            onClick={handleGeneralSubmit}
            disabled={saving}
            className="w-full sm:w-auto px-7 py-3 bg-[#047857] hover:bg-[#03543f] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all disabled:opacity-60 shrink-0 flex items-center justify-center gap-2"
          >
            <span>{saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}</span>
          </button>
        </div>
      </div>

      {/* Detail Edit Modal for Active Section */}
      {activeEditSection && (
        <div className="fixed inset-0 z-[1600] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded mr-2">
                  MỤC {activeEditSection}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 inline">
                  {sectionCards.find(c => c.id === activeEditSection)?.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveEditSection(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-sm flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body depending on Section ID */}
            {activeEditSection === '01' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Tiêu Đề Banner Hero</label>
                  <input
                    type="text"
                    value={generalForm.aboutTitle}
                    onChange={handleGeneralChange('aboutTitle')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <ExactWebFrameUploader
                  label="Ảnh Banner Hero Trang Chủ (1920x600px)"
                  hint="Khung đối ứng chuẩn tỉ lệ Banner Webpage (3.2:1)"
                  currentUrl={settings.hero_banner_url || '/images/history_center_official_banner_hd.jpg'}
                  file={files.heroBanner}
                  onChange={handleFileChange('heroBanner')}
                  onConfigChange={setHeroBannerConfig}
                  initialConfig={settings.hero_banner_config}
                  aspectRatio="3.2/1"
                  previewHeight="240px"
                />
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Thời Gian Đếm Ngược Kỳ Thi THPTQG</label>
                  <input
                    type="text"
                    value={generalForm.examCountdownDate}
                    onChange={handleGeneralChange('examCountdownDate')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>
            )}

            {activeEditSection === '02' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Quản lý danh sách Banner Khuyến Mãi (Slide chuyển động)</p>
                  <button
                    type="button"
                    onClick={() => setItemModalState({ section: 'promo_slide', item: null })}
                    className="px-4 py-2 bg-[#047857] text-white font-extrabold rounded-xl text-xs"
                  >
                    + Thêm Banner Mới
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {promoItems.map((it) => (
                    <div key={it.Id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={it.ImageUrl} alt={it.Title} className="w-20 h-10 object-cover rounded" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{it.Title}</div>
                          <div className="text-[10px] text-amber-700 font-semibold">{it.Subtitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <button type="button" onClick={() => setItemModalState({ section: 'promo_slide', item: it })} className="text-[#047857]">Sửa</button>
                        <button type="button" onClick={() => handleDeleteItem(it)} className="text-red-600">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeEditSection === '03' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Quản lý danh sách Ảnh Tin Nhắn Tra Cứu Điểm Thi</p>
                  <button
                    type="button"
                    onClick={() => setItemModalState({ section: 'chat_proof', item: null })}
                    className="px-4 py-2 bg-[#047857] text-white font-extrabold rounded-xl text-xs"
                  >
                    + Thêm Ảnh Mới
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {chatProofItems.map((it) => (
                    <div key={it.Id} className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-center space-y-2">
                      <img src={it.ImageUrl} alt={it.Title} className="w-full h-24 object-cover rounded-lg" />
                      <div className="text-xs font-bold text-slate-800 truncate">{it.Title || 'Ảnh tin nhắn'}</div>
                      <div className="flex items-center justify-center gap-2 text-xs font-bold">
                        <button type="button" onClick={() => setItemModalState({ section: 'chat_proof', item: it })} className="text-[#047857]">Sửa</button>
                        <button type="button" onClick={() => handleDeleteItem(it)} className="text-red-600">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeEditSection === '05' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Quản lý các Slide Lộ Trình Khóa Học</p>
                  <button
                    type="button"
                    onClick={() => setItemModalState({ section: 'roadmap_slide', item: null })}
                    className="px-4 py-2 bg-[#047857] text-white font-extrabold rounded-xl text-xs"
                  >
                    + Thêm Lộ Trình Mới
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {roadmapItems.map((it) => (
                    <div key={it.Id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={it.ImageUrl} alt={it.Title} className="w-20 h-10 object-cover rounded" />
                        <div className="text-xs font-bold text-slate-900">{it.Title}</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <button type="button" onClick={() => setItemModalState({ section: 'roadmap_slide', item: it })} className="text-[#047857]">Sửa</button>
                        <button type="button" onClick={() => handleDeleteItem(it)} className="text-red-600">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeEditSection === '06' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Danh sách Học sinh Tiêu biểu / Bảng Vàng</p>
                  <button
                    type="button"
                    onClick={() => setItemModalState({ section: 'honor_student', item: null })}
                    className="px-4 py-2 bg-[#047857] text-white font-extrabold rounded-xl text-xs"
                  >
                    + Thêm Thủ Khoa Mới
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {honorItems.map((it) => (
                    <div key={it.Id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={it.ImageUrl} alt={it.Title} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{it.Title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{it.Body}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <button type="button" onClick={() => setItemModalState({ section: 'honor_student', item: it })} className="text-[#047857]">Sửa</button>
                        <button type="button" onClick={() => handleDeleteItem(it)} className="text-red-600">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeEditSection === '07' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Tên Giáo Viên Nổi Bật</label>
                  <input
                    type="text"
                    value={generalForm.spotlightTeacherName}
                    onChange={handleGeneralChange('spotlightTeacherName')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <ExactWebFrameUploader
                  label="Ảnh Chân Dung Tách Nền Clean PNG"
                  hint="Khung đối ứng chuẩn tỉ lệ Chân Dung Giáo Viên Webpage (4:5)"
                  currentUrl={settings.spotlight_image_url || '/images/anhte_teacher_cutout_clean.png'}
                  file={files.spotlightImage}
                  onChange={handleFileChange('spotlightImage')}
                  onConfigChange={setSpotlightImageConfig}
                  initialConfig={settings.spotlight_image_config}
                  aspectRatio="4/5"
                  previewHeight="280px"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Điểm Nổi Bật / Thành Tích</label>
                    <textarea
                      rows={5}
                      value={generalForm.spotlightHighlights}
                      onChange={handleGeneralChange('spotlightHighlights')}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Phong Cách Giảng Dạy</label>
                    <textarea
                      rows={5}
                      value={generalForm.spotlightTeachingStyle}
                      onChange={handleGeneralChange('spotlightTeachingStyle')}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeEditSection === '08' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Quản lý nhận xét feedback từ học viên</p>
                  <button
                    type="button"
                    onClick={() => setItemModalState({ section: 'testimonial', item: null })}
                    className="px-4 py-2 bg-[#047857] text-white font-extrabold rounded-xl text-xs"
                  >
                    + Thêm Feedback Mới
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {testimonialItems.map((it) => (
                    <div key={it.Id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                      <div className="text-xs font-bold text-slate-900">{it.Title}</div>
                      <div className="text-[11px] text-slate-600 line-clamp-2">{it.Body}</div>
                      <div className="flex items-center justify-end gap-2 text-xs font-bold pt-1">
                        <button type="button" onClick={() => setItemModalState({ section: 'testimonial', item: it })} className="text-[#047857]">Sửa</button>
                        <button type="button" onClick={() => handleDeleteItem(it)} className="text-red-600">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeEditSection === '09' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Tiêu Đề Giới Thiệu Trung Tâm</label>
                  <input
                    type="text"
                    value={generalForm.aboutTitle}
                    onChange={handleGeneralChange('aboutTitle')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Nội Dung Giới Thiệu (Mỗi dòng là 1 đoạn)</label>
                  <textarea
                    rows={5}
                    value={generalForm.aboutBody}
                    onChange={handleGeneralChange('aboutBody')}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <ExactWebFrameUploader
                  label="Hình Ảnh Giới Thiệu Trung Tâm"
                  hint="Khung hiển thị giữ cố định 100% kích thước"
                  currentUrl={settings.about_image_url}
                  file={files.aboutImage}
                  onChange={handleFileChange('aboutImage')}
                />
              </div>
            )}

            {(activeEditSection === '10' || activeEditSection === '11') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Tên Trung Tâm</label>
                  <input
                    type="text"
                    value={generalForm.centerName}
                    onChange={handleGeneralChange('centerName')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Địa Chỉ Cơ Sở 1</label>
                  <input
                    type="text"
                    value={generalForm.contactAddress}
                    onChange={handleGeneralChange('contactAddress')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Hotline</label>
                    <input
                      type="text"
                      value={generalForm.contactPhone}
                      onChange={handleGeneralChange('contactPhone')}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={generalForm.contactEmail}
                      onChange={handleGeneralChange('contactEmail')}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Zalo Link</label>
                    <input
                      type="text"
                      value={generalForm.contactZaloUrl}
                      onChange={handleGeneralChange('contactZaloUrl')}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Facebook Fanpage</label>
                    <input
                      type="text"
                      value={generalForm.socialFacebookUrl}
                      onChange={handleGeneralChange('socialFacebookUrl')}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeEditSection === '12' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Thiết lập bật/tắt các khối nội dung hiển thị phụ trên trang chủ</p>
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-bold text-slate-800">Hiển thị số lượng khóa học</span>
                    <input
                      type="checkbox"
                      checked={generalForm.showCoursesCount}
                      onChange={handleGeneralChange('showCoursesCount')}
                      className="w-5 h-5 accent-[#047857] cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-bold text-slate-800">Hiển thị đánh giá học viên</span>
                    <input
                      type="checkbox"
                      checked={generalForm.showReviews}
                      onChange={handleGeneralChange('showReviews')}
                      className="w-5 h-5 accent-[#047857] cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-bold text-slate-800">Hiển thị đối tác</span>
                    <input
                      type="checkbox"
                      checked={generalForm.showPartners}
                      onChange={handleGeneralChange('showPartners')}
                      className="w-5 h-5 accent-[#047857] cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-bold text-slate-800">Hiển thị banner trên cùng</span>
                    <input
                      type="checkbox"
                      checked={generalForm.showTopBanner}
                      onChange={handleGeneralChange('showTopBanner')}
                      className="w-5 h-5 accent-[#047857] cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setActiveEditSection(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={(e) => {
                  handleGeneralSubmit(e);
                  setActiveEditSection(null);
                }}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#047857] hover:bg-[#03543f] text-white font-black text-xs shadow-md"
              >
                Lưu thay đổi mục này ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub Item Modal */}
      {itemModalState && (
        <HomepageItemModal
          section={itemModalState.section}
          item={itemModalState.item}
          onClose={() => setItemModalState(null)}
          onSaved={() => {
            setItemModalState(null);
            load();
            showToast('Đã cập nhật mục thành công!');
          }}
        />
      )}
    </AdminLayout>
  );
}
