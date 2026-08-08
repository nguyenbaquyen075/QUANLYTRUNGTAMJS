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
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, boxX: 0, boxY: 0 });
  const containerRef = useRef(null);

  // Smart Fit Mode: 'fill' (Phủ tràn vừa khít) vs 'cover_crop' (Cắt tự do)
  const [smartFitMode, setSmartFitMode] = useState('fill');

  // Manual Fine-Tuning Scale
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

  // Mouse Dragging & Resizing logic for Crop Box Window and Corner Handles
  const [activeHandle, setActiveHandle] = useState(null); // 'move' | 'tl' | 'tr' | 'bl' | 'br'
  const handleDragRef = useRef({ mouseX: 0, mouseY: 0, boxX: 0, boxY: 0, boxW: 100, boxH: 100 });

  const handleMouseDownHandle = (handleType) => (e) => {
    e.stopPropagation();
    e.preventDefault();
    setSmartFitMode('cover_crop');
    setActiveHandle(handleType);
    handleDragRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
      boxW: cropBox.width,
      boxH: cropBox.height
    };
  };

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
    } else if (activeHandle === 'top') {
      let newH = Math.max(10, Math.min(boxY + boxH, boxH - deltaYPercent));
      let newY = Math.max(0, boxY + (boxH - newH));
      setCropBox((prev) => ({ ...prev, y: newY, height: newH }));
    } else if (activeHandle === 'bottom') {
      let newH = Math.max(10, Math.min(100 - boxY, boxH + deltaYPercent));
      setCropBox((prev) => ({ ...prev, height: newH }));
    } else if (activeHandle === 'left') {
      let newW = Math.max(10, Math.min(boxX + boxW, boxW - deltaXPercent));
      let newX = Math.max(0, boxX + (boxW - newW));
      setCropBox((prev) => ({ ...prev, x: newX, width: newW }));
    } else if (activeHandle === 'right') {
      let newW = Math.max(10, Math.min(100 - boxX, boxW + deltaXPercent));
      setCropBox((prev) => ({ ...prev, width: newW }));
    } else if (activeHandle === 'br') {
      let newW = Math.max(10, Math.min(100 - boxX, boxW + deltaXPercent));
      let newH = Math.max(10, Math.min(100 - boxY, boxH + deltaYPercent));
      setCropBox((prev) => ({ ...prev, width: newW, height: newH }));
    } else if (activeHandle === 'bl') {
      let newW = Math.max(10, Math.min(boxX + boxW, boxW - deltaXPercent));
      let newX = Math.max(0, boxX + (boxW - newW));
      let newH = Math.max(10, Math.min(100 - boxY, boxH + deltaYPercent));
      setCropBox((prev) => ({ ...prev, x: newX, width: newW, height: newH }));
    } else if (activeHandle === 'tr') {
      let newW = Math.max(10, Math.min(100 - boxX, boxW + deltaXPercent));
      let newH = Math.max(10, Math.min(boxY + boxH, boxH - deltaYPercent));
      let newY = Math.max(0, boxY + (boxH - newH));
      setCropBox((prev) => ({ ...prev, y: newY, width: newW, height: newH }));
    } else if (activeHandle === 'tl') {
      let newW = Math.max(10, Math.min(boxX + boxW, boxW - deltaXPercent));
      let newX = Math.max(0, boxX + (boxW - newW));
      let newH = Math.max(10, Math.min(boxY + boxH, boxH - deltaYPercent));
      let newY = Math.max(0, boxY + (boxH - newH));
      setCropBox((prev) => ({ ...prev, x: newX, y: newY, width: newW, height: newH }));
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
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
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
        {/* Left Column: File Selector & Fit Strategy Mode */}
        <div className="lg:col-span-6 space-y-4">
          <label className="flex flex-col items-center justify-center px-4 py-3 bg-white hover:bg-emerald-50/40 border-2 border-dashed border-slate-300 hover:border-[#047857] rounded-2xl cursor-pointer transition-all text-center group">
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

          {/* 2 Modes Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-black uppercase text-slate-800 block border-b border-slate-100 pb-2">
              TÙY CHỌN HIỂN THỊ TRONG KHUNG WEBPAGE
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSmartFitMode('fill')}
                className={`p-3 rounded-xl border text-left transition-all ${smartFitMode === 'fill'
                    ? 'bg-emerald-50 border-[#047857] text-[#047857] ring-2 ring-emerald-500/20 font-black'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <div className="font-extrabold text-xs">1. Phủ Tràn Vừa Khít 100% Khung</div>
                <div className="text-[10px] opacity-80 mt-0.5">Tự co giãn 100% bức ảnh vừa kín khung, không xén chi tiết nào</div>
              </button>

              <button
                type="button"
                onClick={() => setSmartFitMode('cover_crop')}
                className={`p-3 rounded-xl border text-left transition-all ${smartFitMode === 'cover_crop'
                    ? 'bg-emerald-50 border-[#047857] text-[#047857] ring-2 ring-emerald-500/20 font-black'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <div className="font-extrabold text-xs">2. Cắt Tự Do Chọn Trọng Tâm Web</div>
                <div className="text-[10px] opacity-80 mt-0.5">Kéo thả ô vuông cắt tự do để chọn vùng nét muốn hiển thị</div>
              </button>
            </div>
          </div>

          {/* Interactive Image Cropper Window */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold border-b border-slate-800 pb-2">
              <span>CỬA SỔ CẮT THEO KÍCH THƯỚC KHUNG WEBPAGE ({aspectRatio})</span>
              <button
                type="button"
                onClick={handleResetCrop}
                className="text-[11px] font-extrabold text-[#047857] hover:underline"
              >
                Đặt lại 100%
              </button>
            </div>

            <div className="relative w-full h-[380px] sm:h-[420px] bg-slate-950 rounded-2xl overflow-hidden select-none border border-slate-800 flex items-center justify-center p-4 shadow-2xl">
              {activeUrl ? (
                <div
                  ref={containerRef}
                  className="relative inline-block overflow-hidden shadow-2xl rounded-xl border border-slate-700 max-h-[360px] max-w-full"
                >
                  <img
                    src={activeUrl}
                    alt="Crop Canvas"
                    className="block max-h-[360px] max-w-full w-auto h-auto object-contain pointer-events-none opacity-60"
                  />

                  <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                  <div
                    onMouseDown={handleMouseDownCrop}
                    style={{
                      left: `${cropBox.x}%`,
                      top: `${cropBox.y}%`,
                      width: `${cropBox.width}%`,
                      height: `${cropBox.height}%`
                    }}
                    className="absolute border-2 border-emerald-400 shadow-2xl cursor-move bg-transparent z-10 flex items-center justify-center"
                  >
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-emerald-400/30 pointer-events-none">
                      <div className="border-r border-b border-emerald-400/30"></div>
                      <div className="border-r border-b border-emerald-400/30"></div>
                      <div className="border-b border-emerald-400/30"></div>
                      <div className="border-r border-b border-emerald-400/30"></div>
                      <div className="border-r border-b border-emerald-400/30"></div>
                      <div className="border-b border-emerald-400/30"></div>
                    </div>

                    {/* 4 Interactive Edge Line Drag Bar Handles (Top, Bottom, Left, Right) */}
                    <div
                      onMouseDown={handleMouseDownHandle('top')}
                      className="absolute -top-2.5 inset-x-4 h-5 cursor-ns-resize z-20 group hover:bg-emerald-400/30 rounded transition-colors flex items-center justify-center"
                      title="Kéo đường kẻ viền trên"
                    >
                      <div className="w-10 h-1.5 bg-emerald-400 border border-white rounded-full shadow transition-transform group-hover:scale-110" />
                    </div>

                    <div
                      onMouseDown={handleMouseDownHandle('bottom')}
                      className="absolute -bottom-2.5 inset-x-4 h-5 cursor-ns-resize z-20 group hover:bg-emerald-400/30 rounded transition-colors flex items-center justify-center"
                      title="Kéo đường kẻ viền dưới"
                    >
                      <div className="w-10 h-1.5 bg-emerald-400 border border-white rounded-full shadow transition-transform group-hover:scale-110" />
                    </div>

                    <div
                      onMouseDown={handleMouseDownHandle('left')}
                      className="absolute -left-2.5 inset-y-4 w-5 cursor-ew-resize z-20 group hover:bg-emerald-400/30 rounded transition-colors flex items-center justify-center"
                      title="Kéo đường kẻ viền trái"
                    >
                      <div className="h-10 w-1.5 bg-emerald-400 border border-white rounded-full shadow transition-transform group-hover:scale-110" />
                    </div>

                    <div
                      onMouseDown={handleMouseDownHandle('right')}
                      className="absolute -right-2.5 inset-y-4 w-5 cursor-ew-resize z-20 group hover:bg-emerald-400/30 rounded transition-colors flex items-center justify-center"
                      title="Kéo đường kẻ viền phải"
                    >
                      <div className="h-10 w-1.5 bg-emerald-400 border border-white rounded-full shadow transition-transform group-hover:scale-110" />
                    </div>

                    {/* 4 Interactive Corner Drag Resizing Handles */}
                    <div
                      onMouseDown={handleMouseDownHandle('tl')}
                      className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-emerald-400 hover:bg-emerald-300 border-2 border-white rounded-md shadow-xl cursor-nwse-resize z-30 transition-transform hover:scale-125"
                      title="Kéo góc trên-trái để chỉnh tự do"
                    />
                    <div
                      onMouseDown={handleMouseDownHandle('tr')}
                      className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-emerald-400 hover:bg-emerald-300 border-2 border-white rounded-md shadow-xl cursor-nesw-resize z-30 transition-transform hover:scale-125"
                      title="Kéo góc trên-phải để chỉnh tự do"
                    />
                    <div
                      onMouseDown={handleMouseDownHandle('bl')}
                      className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-emerald-400 hover:bg-emerald-300 border-2 border-white rounded-md shadow-xl cursor-nesw-resize z-30 transition-transform hover:scale-125"
                      title="Kéo góc dưới-trái để chỉnh tự do"
                    />
                    <div
                      onMouseDown={handleMouseDownHandle('br')}
                      className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-emerald-400 hover:bg-emerald-300 border-2 border-white rounded-md shadow-xl cursor-nwse-resize z-30 transition-transform hover:scale-125"
                      title="Kéo góc dưới-phải để chỉnh tự do"
                    />

                    <span className="bg-slate-900/90 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/50 shadow pointer-events-none">
                      KÉO VÙNG CẮT
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-xs font-bold">Chưa chọn ảnh</div>
              )}
            </div>

            {/* Quick 100% Full Image Selection & Zoom Slider */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-300 font-bold">
              <button
                type="button"
                onClick={() => setCropBox({ x: 0, y: 0, width: 100, height: 100 })}
                className="w-full sm:w-auto px-3 py-1.5 bg-[#047857] hover:bg-[#03543f] text-white rounded-lg text-xs font-black shadow transition-all shrink-0 text-center"
              >
                ✓ LẤY TOÀN BỘ 100% BỨC ẢNH
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                <span className="text-[11px] text-slate-400 shrink-0 font-bold">Thu phóng vùng cắt:</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={cropBox.width}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const newX = Math.max(0, (100 - val) / 2);
                    const newY = Math.max(0, (100 - val) / 2);
                    setCropBox({ x: newX, y: newY, width: val, height: val });
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-emerald-400 font-mono font-black shrink-0">{Math.round(cropBox.width)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SECTION MATCHING PREVIEW FRAME CONTAINER */}
        <div className="lg:col-span-6 space-y-2 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-[11px] text-slate-500 font-bold">
            <span>KHUNG HIỂN THỊ THEO TỈ LỆ WEBPAGE CHUẨN</span>
            <span className="text-[#047857] font-mono">{aspectRatio}</span>
          </div>

          {/* Clean Direct Frame - Zero Outer Grey Border */}
          <div
            style={
              aspectRatio === '4/5'
                ? { aspectRatio: '4/5', height: '360px', width: 'auto' }
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

          <div className="w-full text-[10px] text-slate-400 font-mono text-right pt-1">
            ✓ KHUNG THEO CHUẨN TỈ LỆ VỊ TRÍ NÀY TRÊN WEBPAGE
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SiteSettingsPage() {
  const [topPageTab, setTopPageTab] = useState('homepage'); // 'homepage' | 'courses' | 'exams'
  const [settings, setSettings] = useState({});
  const [items, setItems] = useState([]);
  const [generalForm, setGeneralForm] = useState(null);
  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState(false);
  const [modalState, setModalState] = useState(null); // { section, item }
  const [toast, setToast] = useState(null); // { type, message }
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  // Position alignment overrides
  const [heroFit, setHeroFit] = useState('object-cover');
  const [heroPos, setHeroPos] = useState('object-center');
  const [teacherFit, setTeacherFit] = useState('object-contain');
  const [teacherPos, setTeacherPos] = useState('object-bottom');

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
    const defaultTeachingStyle = "Phương pháp giảng dạy tư duy trực quan, dột phá giải nhanh\nGiáo án bám sát 100% ma trận cấu trúc đề thi Bộ GD&ĐT\nHỗ trợ học sinh giải đáp bài tập 24/7";

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
      spotlightTeachingStyle: parseBullets('spotlight_teaching_style') || defaultTeachingStyle
    });
  }, [settings]);

  // Crop/Zoom configuration states for live sync onto public website
  const [heroBannerConfig, setHeroBannerConfig] = useState(null);
  const [spotlightImageConfig, setSpotlightImageConfig] = useState(null);
  const [aboutImageConfig, setAboutImageConfig] = useState(null);
  const [logoConfig, setLogoConfig] = useState(null);

  const handleGeneralChange = (key) => (e) => setGeneralForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleFileChange = (key) => (file) => setFiles((prev) => ({ ...prev, [key]: file }));

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
        showToast('Đã lưu toàn bộ cài đặt Trang Chủ thành công!');
        alert('Đã lưu toàn bộ cài đặt Trang Chủ thành công! Mời bạn mở lại Trang Chủ để xem thay đổi.');
      } else {
        showToast(res.data?.message || 'Có lỗi xảy ra khi lưu.', 'error');
        alert(res.data?.message || 'Có lỗi xảy ra khi lưu.');
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

  const handleToggleActive = async (item) => {
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
      <AdminLayout activeTab="tabSettings" breadcrumb={['Trang chủ', 'Quản trị hệ thống', 'Cài đặt Website']}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#047857] gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#047857] rounded-full animate-spin"></div>
          <p className="text-sm font-bold">Đang tải cấu hình trang web...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="tabSettings" breadcrumb={['Trang chủ', 'Quản trị hệ thống', 'Cài đặt Website']}>
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[2000] px-5 py-3.5 rounded-xl shadow-2xl text-white font-extrabold text-xs sm:text-sm flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-600' : 'bg-[#047857]'
            }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      <div className={isFullscreenMode ? 'fixed inset-0 bg-slate-900 text-white z-[1500] p-6 overflow-y-auto' : ''}>

        {/* Module Header Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg mb-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#047857] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                KHUNG BẢO TỒN KÍCH THƯỚC CỐ ĐỊNH 100%
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded">
                Không Thay Đổi Kích Thước Khung Outer
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Quản Lý & Chỉnh Sửa Chi Tiết Giao Diện Trang Chủ
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Khung hiển thị giữ nguyên kích thước cố định tuyệt đối. Chỉ hình ảnh bên trong được co dãn / điều chỉnh.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreenMode(!isFullscreenMode)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl text-xs transition-all border border-slate-700"
            >
              {isFullscreenMode ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
            </button>

            <button
              type="button"
              onClick={handleGeneralSubmit}
              disabled={saving}
              className="px-6 py-2.5 bg-[#047857] hover:bg-[#03543f] text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              <span>{saving ? 'Đang lưu...' : 'LƯU TOÀN BỘ NỘI DUNG TRANG CHỦ ✓'}</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all border border-slate-700 flex items-center gap-1"
            >
              <span>Xem Live</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* Top-Level Page Modules Tabs */}
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
          <button
            onClick={() => setTopPageTab('homepage')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 ${topPageTab === 'homepage'
                ? 'bg-[#047857] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            <span>MỤC 1: CHỈNH SỬA TRANG CHỦ (TRANG DÀI LIÊN TỤC)</span>
          </button>

          <button
            onClick={() => {
              setTopPageTab('courses');
              showToast('Mục 2: Cấu hình Khóa Học sẽ được cập nhật ở bước tiếp theo!', 'info');
            }}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 ${topPageTab === 'courses'
                ? 'bg-[#047857] text-white shadow-md'
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200 opacity-80'
              }`}
          >
            <span>MỤC 2: KHÓA HỌC & HỌC PHÍ</span>
          </button>

          <button
            onClick={() => {
              setTopPageTab('exams');
              showToast('Mục 3: Cấu hình Đề Thi sẽ được cập nhật ở bước tiếp theo!', 'info');
            }}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 ${topPageTab === 'exams'
                ? 'bg-[#047857] text-white shadow-md'
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200 opacity-80'
              }`}
          >
            <span>MỤC 3: ĐỀ THI & THI THỬ</span>
          </button>
        </div>

        {topPageTab === 'homepage' && (
          <form onSubmit={handleGeneralSubmit} className="space-y-8 w-full max-w-none">

            {/* KHỐI 01: HEADER & LOGO THƯƠNG HIỆU */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded">01</span>
                    <span className="text-xs font-bold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Header & Footer</span>
                  </div>
                  <h3 className="font-extrabold text-base uppercase tracking-wide text-[#047857]">
                    THÔNG TIN THƯƠNG HIỆU & LOGO
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Logo trung tâm, số điện thoại hotline, email hỗ trợ, Zalo tư vấn và Facebook</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Tên Trung Tâm</label>
                  <input
                    type="text"
                    value={generalForm.centerName}
                    onChange={handleGeneralChange('centerName')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#047857] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Địa Chỉ Trung Tâm</label>
                  <input
                    type="text"
                    value={generalForm.contactAddress}
                    onChange={handleGeneralChange('contactAddress')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#047857] outline-none"
                  />
                </div>
              </div>

              <ExactWebFrameUploader
                label="Logo Trung Tâm"
                hint="Khung hiển thị giữ cố định 100% kích thước"
                currentUrl={settings.logo_url}
                file={files.logo}
                onChange={handleFileChange('logo')}
                frameType="logo"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Hotline / Số Điện Thoại</label>
                  <input
                    type="text"
                    value={generalForm.contactPhone}
                    onChange={handleGeneralChange('contactPhone')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#047857] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Email Hỗ Trợ</label>
                  <input
                    type="email"
                    value={generalForm.contactEmail}
                    onChange={handleGeneralChange('contactEmail')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#047857] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Zalo Tư Vấn Link</label>
                  <input
                    type="text"
                    value={generalForm.contactZaloUrl}
                    onChange={handleGeneralChange('contactZaloUrl')}
                    placeholder="https://zalo.me/..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#047857] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Fanpage Facebook Link</label>
                  <input
                    type="text"
                    value={generalForm.socialFacebookUrl}
                    onChange={handleGeneralChange('socialFacebookUrl')}
                    placeholder="https://facebook.com/..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#047857] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* KHỐI 02: BANNER HERO & ĐẾM NGƯỢC THI */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded">02</span>
                    <span className="text-xs font-bold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Banner Đầu Trang</span>
                  </div>
                  <h3 className="font-extrabold text-base uppercase tracking-wide text-[#047857]">
                    HỌC LỊCH SỬ - HIỂU QUÁ KHỨ, VỮNG TƯƠNG LAI
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Banner chính kích thước lớn trải rộng 100% màn hình ở vị trí trên cùng</p>
                </div>
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
                previewHeight="260px"
              />

              <div className="pt-4 border-t border-slate-200">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Thời Gian Đếm Ngược Kỳ Thi THPTQG (ISO Format)</label>
                <input
                  type="text"
                  value={generalForm.examCountdownDate}
                  onChange={handleGeneralChange('examCountdownDate')}
                  placeholder="2027-06-11T07:30:00"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-[#047857] outline-none"
                />
              </div>
            </div>

            {/* KHỐI 03: SLIDE KHUYẾN MÃI */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded">03</span>
                    <span className="text-xs font-bold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Slide Khuyến Mãi</span>
                  </div>
                  <h3 className="font-extrabold text-base uppercase tracking-wide text-[#047857]">
                    CHƯƠNG TRÌNH KHUYẾN MÃI & ƯU ĐÃI
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Các ô banner ưu đãi chuyển động trượt tự động từ phải sang trái 2s</p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalState({ section: 'promo_slide', item: null })}
                  className="px-5 py-2.5 bg-[#047857] hover:bg-[#03543f] text-white font-extrabold rounded-xl text-xs shadow-md transition-all shrink-0"
                >
                  + Thêm Banner Khuyến Mãi Mới
                </button>
              </div>

              {items.filter((it) => it.Section === 'promo_slide').length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 space-y-1">
                  <p className="text-sm font-bold text-slate-700">Chưa có banner khuyến mãi riêng được tạo</p>
                  <p className="text-xs">Trang chủ hiện đang sử dụng bộ 3 banner mặc định của trung tâm.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                  {items.filter((it) => it.Section === 'promo_slide').map((it) => (
                    <div key={it.Id} className="bg-slate-50 rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                      {it.ImageUrl && (
                        <div className="relative h-32 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                          <img src={it.ImageUrl} alt={it.Title} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">Thứ tự: {it.SortOrder}</span>
                        </div>
                      )}
                      <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{it.Title}</h4>
                      {it.Subtitle && <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">{it.Subtitle}</span>}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                        <button type="button" onClick={() => setModalState({ section: 'promo_slide', item: it })} className="text-[#047857] hover:underline">Sửa</button>
                        <button type="button" onClick={() => handleToggleActive(it)} className="text-slate-600">{it.IsActive === false ? 'Hiện' : 'Ẩn'}</button>
                        <button type="button" onClick={() => handleDeleteItem(it)} className="text-red-600 hover:underline">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* KHỐI 04: CHAT PROOFS */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded">04</span>
                    <span className="text-xs font-bold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Tra cứu điểm thi</span>
                  </div>
                  <h3 className="font-extrabold text-base uppercase tracking-wide text-[#047857]">
                    NHỮNG CON SỐ BIẾT NÓI
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Các ô hình ảnh tin nhắn tra cứu điểm thi THPTQG hiển thị dạng khối vuông 1:1</p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalState({ section: 'chat_proof', item: null })}
                  className="px-5 py-2.5 bg-[#047857] hover:bg-[#03543f] text-white font-extrabold rounded-xl text-xs shadow-md transition-all shrink-0"
                >
                  + Thêm Ảnh Tin Nhắn Mới
                </button>
              </div>

              {items.filter((it) => it.Section === 'chat_proof').length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 space-y-1">
                  <p className="text-sm font-bold text-slate-700">Chưa có ảnh tin nhắn tra cứu điểm riêng được tạo</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                  {items.filter((it) => it.Section === 'chat_proof').map((it) => (
                    <div key={it.Id} className="bg-slate-50 rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                      {it.ImageUrl && (
                        <div className="relative h-32 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                          <img src={it.ImageUrl} alt={it.Title} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">Thứ tự: {it.SortOrder}</span>
                        </div>
                      )}
                      <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{it.Title || 'Ảnh tin nhắn điểm 10'}</h4>
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                        <button type="button" onClick={() => setModalState({ section: 'chat_proof', item: it })} className="text-[#047857] hover:underline">Sửa</button>
                        <button type="button" onClick={() => handleToggleActive(it)} className="text-slate-600">{it.IsActive === false ? 'Hiện' : 'Ẩn'}</button>
                        <button type="button" onClick={() => handleDeleteItem(it)} className="text-red-600 hover:underline">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* KHỐI 05: ROADMAPS */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded">05</span>
                    <span className="text-xs font-bold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Slide Lộ Trình Banner</span>
                  </div>
                  <h3 className="font-extrabold text-base uppercase tracking-wide text-[#047857]">
                    LỘ TRÌNH KHÓA HỌC
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Các ô banner lộ trình chuyển động trượt tự động (Tổng Ôn, Luyện Đề, Cấp Tốc)</p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalState({ section: 'roadmap_slide', item: null })}
                  className="px-5 py-2.5 bg-[#047857] hover:bg-[#03543f] text-white font-extrabold rounded-xl text-xs shadow-md transition-all shrink-0"
                >
                  + Thêm Banner Lộ Trình Mới
                </button>
              </div>

              {items.filter((it) => it.Section === 'roadmap_slide').length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 space-y-1">
                  <p className="text-sm font-bold text-slate-700">Chưa có banner lộ trình riêng được tạo</p>
                  <p className="text-xs">Trang chủ hiện đang sử dụng bộ 3 banner lộ trình mặc định (Tổng Ôn, Luyện Đề, Cấp Tốc).</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                  {items.filter((it) => it.Section === 'roadmap_slide').map((it) => (
                    <div key={it.Id} className="bg-slate-50 rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                      {it.ImageUrl && (
                        <div className="relative h-32 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                          <img src={it.ImageUrl} alt={it.Title} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">Thứ tự: {it.SortOrder}</span>
                        </div>
                      )}
                      <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{it.Title}</h4>
                      {it.Subtitle && <span className="inline-block bg-emerald-100 text-[#047857] text-[10px] font-bold px-2 py-0.5 rounded">{it.Subtitle}</span>}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                        <button type="button" onClick={() => setModalState({ section: 'roadmap_slide', item: it })} className="text-[#047857] hover:underline">Sửa</button>
                        <button type="button" onClick={() => handleToggleActive(it)} className="text-slate-600">{it.IsActive === false ? 'Hiện' : 'Ẩn'}</button>
                        <button type="button" onClick={() => handleDeleteItem(it)} className="text-red-600 hover:underline">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* KHỐI 06: HONOR STUDENTS */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded">06</span>
                    <span className="text-xs font-bold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Bảng Vàng</span>
                  </div>
                  <h3 className="font-extrabold text-base uppercase tracking-wide text-[#047857]">
                    THÀNH TÍCH NỔI BẬT CỦA HỌC VIÊN
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Danh sách học sinh xuất sắc đạt điểm 10 THPTQG và Thủ khoa các khối</p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalState({ section: 'honor_student', item: null })}
                  className="px-5 py-2.5 bg-[#047857] hover:bg-[#03543f] text-white font-extrabold rounded-xl text-xs shadow-md transition-all shrink-0"
                >
                  + Thêm Thủ Khoa Mới
                </button>
              </div>

              {items.filter((it) => it.Section === 'honor_student').length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 space-y-1">
                  <p className="text-sm font-bold text-slate-700">Chưa có danh sách thủ khoa riêng được tạo</p>
                  <p className="text-xs">Trang chủ hiện đang sử dụng bộ 4 học sinh tiêu biểu mặc định.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                  {items.filter((it) => it.Section === 'honor_student').map((it) => (
                    <div key={it.Id} className="bg-slate-50 rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                      {it.ImageUrl && (
                        <div className="relative h-36 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                          <img src={it.ImageUrl} alt={it.Title} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">Thứ tự: {it.SortOrder}</span>
                        </div>
                      )}
                      <h4 className="font-extrabold text-sm text-slate-900">{it.Title}</h4>
                      {it.Body && <p className="text-xs text-slate-500 line-clamp-2">{it.Body}</p>}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                        <button type="button" onClick={() => setModalState({ section: 'honor_student', item: it })} className="text-[#047857] hover:underline">Sửa</button>
                        <button type="button" onClick={() => handleToggleActive(it)} className="text-slate-600">{it.IsActive === false ? 'Hiện' : 'Ẩn'}</button>
                        <button type="button" onClick={() => handleDeleteItem(it)} className="text-red-600 hover:underline">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* KHỐI 07: TEACHER PROFILE */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded">07</span>
                  <span className="text-xs font-bold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Hồ sơ giáo viên</span>
                </div>
                <h3 className="font-extrabold text-base uppercase tracking-wide text-[#047857]">
                  GIÁO VIÊN GIẢNG DẠY
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Ảnh chân dung tách nền Clean PNG, Điểm nổi bật và Phong cách giảng dạy</p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Tên Giáo Viên Nổi Bật</label>
                <input
                  type="text"
                  value={generalForm.spotlightTeacherName}
                  onChange={handleGeneralChange('spotlightTeacherName')}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#047857] outline-none"
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
                previewHeight="320px"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Điểm Nổi Bật / Thành Tích (Mỗi dòng 1 ý)</label>
                  <textarea
                    rows={6}
                    value={generalForm.spotlightHighlights}
                    onChange={handleGeneralChange('spotlightHighlights')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-[#047857] outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Phong Cách Giảng Dạy (Mỗi dòng 1 ý)</label>
                  <textarea
                    rows={6}
                    value={generalForm.spotlightTeachingStyle}
                    onChange={handleGeneralChange('spotlightTeachingStyle')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-[#047857] outline-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* KHỐI 08: FEEDBACK */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded">08</span>
                    <span className="text-xs font-bold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Feedback</span>
                  </div>
                  <h3 className="font-extrabold text-base uppercase tracking-wide text-[#047857]">
                    FEEDBACK CỦA HỌC VIÊN
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Nhận xét chi tiết từ các học viên đã và đang đăng ký khóa học</p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalState({ section: 'testimonial', item: null })}
                  className="px-5 py-2.5 bg-[#047857] hover:bg-[#03543f] text-white font-extrabold rounded-xl text-xs shadow-md transition-all shrink-0"
                >
                  + Thêm Feedback Mới
                </button>
              </div>

              {items.filter((it) => it.Section === 'testimonial').length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 space-y-1">
                  <p className="text-sm font-bold text-slate-700">Chưa có feedback riêng được tạo</p>
                  <p className="text-xs">Trang chủ hiện đang sử dụng bộ 3 feedback mặc định.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {items.filter((it) => it.Section === 'testimonial').map((it) => (
                    <div key={it.Id} className="bg-slate-50 rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                      <h4 className="font-extrabold text-sm text-slate-900">{it.Title || 'Học viên Flashstudy'}</h4>
                      {it.Body && <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{it.Body}</p>}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                        <button type="button" onClick={() => setModalState({ section: 'testimonial', item: it })} className="text-[#047857] hover:underline">Sửa</button>
                        <button type="button" onClick={() => handleToggleActive(it)} className="text-slate-600">{it.IsActive === false ? 'Hiện' : 'Ẩn'}</button>
                        <button type="button" onClick={() => handleDeleteItem(it)} className="text-red-600 hover:underline">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* KHỐI 09: ABOUT CENTER */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded">09</span>
                  <span className="text-xs font-bold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Cuối trang chủ</span>
                </div>
                <h3 className="font-extrabold text-base uppercase tracking-wide text-[#047857]">
                  VỀ TRUNG TÂM LUYỆN THI ANH TÊ
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Tiêu đề, bài viết tổng quan và hình ảnh cơ sở vật chất trung tâm</p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Tiêu Đề Giới Thiệu</label>
                <input
                  type="text"
                  value={generalForm.aboutTitle}
                  onChange={handleGeneralChange('aboutTitle')}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#047857] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Nội Dung Giới Thiệu (Mỗi dòng là 1 đoạn văn)</label>
                <textarea
                  rows={6}
                  value={generalForm.aboutBody}
                  onChange={handleGeneralChange('aboutBody')}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-[#047857] outline-none leading-relaxed"
                />
              </div>

              <ExactWebFrameUploader
                label="Hình Ảnh Giới Thiệu Trung Tâm"
                hint="Khung hiển thị giữ cố định 100% kích thước"
                currentUrl={settings.about_image_url}
                file={files.aboutImage}
                onChange={handleFileChange('aboutImage')}
                frameType="promo"
              />
            </div>

            {/* Bottom Global Save Button Bar - Static at End of Page */}
            <div className="mt-10 p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between shadow-xl border border-slate-800 gap-4">
              <div>
                <h4 className="font-extrabold text-base text-white">Hoàn Tất Chỉnh Sửa Trang Chủ</h4>
                <p className="text-xs text-slate-400 mt-0.5">Bấm nút bên cạnh để lưu lại toàn bộ 9 khối thông tin cùng lúc</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#047857] hover:bg-[#03543f] text-white font-black rounded-xl text-xs sm:text-sm shadow-lg transition-all disabled:opacity-60 shrink-0"
              >
                {saving ? 'Đang lưu cài đặt...' : 'LƯU TOÀN BỘ NỘI DUNG TRANG CHỦ ✓'}
              </button>
            </div>

          </form>
        )}

        {/* Modal Editor */}
        {modalState && (
          <HomepageItemModal
            section={modalState.section}
            item={modalState.item}
            onClose={() => setModalState(null)}
            onSaved={() => {
              setModalState(null);
              load();
              showToast('Đã cập nhật mục thành công!');
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}
