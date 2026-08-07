import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import HomepageItemModal from './HomepageItemModal';

const SECTION_LABELS = {
  promo_slide: 'Slide khuyến mãi',
  honor_student: 'Bảng vàng thành tích',
  testimonial: 'Feedback học viên'
};

const inputClass = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none';
const labelClass = 'block text-sm font-bold text-slate-700 mb-1.5';

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState({});
  const [items, setItems] = useState([]);
  const [activeSection, setActiveSection] = useState('general');
  const [generalForm, setGeneralForm] = useState(null);
  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState(false);
  const [modalState, setModalState] = useState(null); // { section, item }

  const load = useCallback(async () => {
    const res = await api.get('/Admin/Settings');
    if (res.data?.success) {
      setSettings(res.data.data.settings);
      setItems(res.data.data.items);
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
    setGeneralForm({
      centerName: settings.center_name || '',
      contactAddress: settings.contact_address || '',
      contactPhone: settings.contact_phone || '',
      contactEmail: settings.contact_email || '',
      contactZaloUrl: settings.contact_zalo_url || '',
      socialFacebookUrl: settings.social_facebook_url || '',
      aboutTitle: settings.about_title || '',
      aboutBody: settings.about_body || '',
      examCountdownDate: settings.exam_countdown_date || '',
      spotlightTeacherName: settings.spotlight_teacher_name || '',
      spotlightHighlights: parseBullets('spotlight_highlights'),
      spotlightTeachingStyle: parseBullets('spotlight_teaching_style')
    });
  }, [settings]);

  const handleGeneralChange = (key) => (e) => setGeneralForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleFileChange = (key) => (e) => setFiles((prev) => ({ ...prev, [key]: e.target.files?.[0] || null }));

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(generalForm).forEach(([key, value]) => formData.append(key, value ?? ''));
      Object.entries(files).forEach(([key, file]) => { if (file) formData.append(key, file); });
      const res = await api.post('/Admin/Settings/General', formData, { headers: { 'Content-Type': undefined } });
      if (res.data?.success) {
        setFiles({});
        load();
        alert('Đã lưu cài đặt.');
      } else {
        alert(res.data?.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Xóa "${item.Title || 'mục này'}"?`)) return;
    const res = await api.post(`/Admin/Settings/Items/${item.Id}/Delete`, {});
    if (res.data?.success) load();
  };

  if (!generalForm) {
    return <div className="p-9 text-slate-500">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-9">
      <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">Cài đặt Website</h1>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {['general', 'homepage', 'lists'].map((key) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors ${activeSection === key ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {key === 'general' ? 'Liên hệ & Thương hiệu' : key === 'homepage' ? 'Nội dung trang chủ' : 'Danh sách marketing'}
          </button>
        ))}
      </div>

      {(activeSection === 'general' || activeSection === 'homepage') && (
        <form onSubmit={handleGeneralSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 max-w-2xl">
          {activeSection === 'general' && (
            <>
              <div>
                <label className={labelClass}>Tên trung tâm</label>
                <input type="text" value={generalForm.centerName} onChange={handleGeneralChange('centerName')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Logo</label>
                <input type="file" accept="image/*" onChange={handleFileChange('logo')} className="text-sm" />
                {settings.logo_url && <img src={settings.logo_url} alt="Logo hiện tại" className="h-12 mt-2 rounded" />}
              </div>
              <div>
                <label className={labelClass}>Địa chỉ</label>
                <input type="text" value={generalForm.contactAddress} onChange={handleGeneralChange('contactAddress')} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Hotline</label>
                  <input type="text" value={generalForm.contactPhone} onChange={handleGeneralChange('contactPhone')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={generalForm.contactEmail} onChange={handleGeneralChange('contactEmail')} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Link Zalo</label>
                  <input type="text" value={generalForm.contactZaloUrl} onChange={handleGeneralChange('contactZaloUrl')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Link Facebook</label>
                  <input type="text" value={generalForm.socialFacebookUrl} onChange={handleGeneralChange('socialFacebookUrl')} className={inputClass} />
                </div>
              </div>
            </>
          )}

          {activeSection === 'homepage' && (
            <>
              <div>
                <label className={labelClass}>Ảnh banner trang chủ</label>
                <input type="file" accept="image/*" onChange={handleFileChange('heroBanner')} className="text-sm" />
                {settings.hero_banner_url && <img src={settings.hero_banner_url} alt="Banner hiện tại" className="h-24 mt-2 rounded" />}
              </div>
              <div>
                <label className={labelClass}>Tiêu đề giới thiệu trung tâm</label>
                <input type="text" value={generalForm.aboutTitle} onChange={handleGeneralChange('aboutTitle')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nội dung giới thiệu (mỗi dòng 1 đoạn)</label>
                <textarea rows={4} value={generalForm.aboutBody} onChange={handleGeneralChange('aboutBody')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ảnh giới thiệu</label>
                <input type="file" accept="image/*" onChange={handleFileChange('aboutImage')} className="text-sm" />
                {settings.about_image_url && <img src={settings.about_image_url} alt="Ảnh giới thiệu hiện tại" className="h-24 mt-2 rounded" />}
              </div>
              <div>
                <label className={labelClass}>Thời điểm đếm ngược thi (VD: 2027-06-11T07:30:00)</label>
                <input type="text" value={generalForm.examCountdownDate} onChange={handleGeneralChange('examCountdownDate')} placeholder="2027-06-11T07:30:00" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tên giáo viên nổi bật</label>
                <input type="text" value={generalForm.spotlightTeacherName} onChange={handleGeneralChange('spotlightTeacherName')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ảnh giáo viên nổi bật</label>
                <input type="file" accept="image/*" onChange={handleFileChange('spotlightImage')} className="text-sm" />
                {settings.spotlight_image_url && <img src={settings.spotlight_image_url} alt="Ảnh giáo viên hiện tại" className="h-24 mt-2 rounded" />}
              </div>
              <div>
                <label className={labelClass}>Điểm nổi bật (mỗi dòng 1 ý)</label>
                <textarea rows={4} value={generalForm.spotlightHighlights} onChange={handleGeneralChange('spotlightHighlights')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phong cách giảng dạy (mỗi dòng 1 ý)</label>
                <textarea rows={4} value={generalForm.spotlightTeachingStyle} onChange={handleGeneralChange('spotlightTeachingStyle')} className={inputClass} />
              </div>
            </>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </form>
      )}

      {activeSection === 'lists' && (
        <div className="space-y-8 max-w-3xl">
          {Object.keys(SECTION_LABELS).map((section) => (
            <div key={section} className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-900">{SECTION_LABELS[section]}</h3>
                <button
                  onClick={() => setModalState({ section, item: null })}
                  className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm"
                >
                  + Thêm mới
                </button>
              </div>
              <div className="space-y-2">
                {items.filter((it) => it.Section === section).length === 0 && (
                  <p className="text-sm text-slate-400">Chưa có nội dung — trang chủ đang dùng nội dung mặc định.</p>
                )}
                {items.filter((it) => it.Section === section).map((it) => (
                  <div key={it.Id} className="flex items-center gap-3 border border-slate-100 rounded-xl p-3">
                    {it.ImageUrl && <img src={it.ImageUrl} alt={it.Title} className="w-12 h-12 object-cover rounded-lg" />}
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-slate-800">{it.Title || '(Không tiêu đề)'}</div>
                      <div className="text-xs text-slate-400">Thứ tự: {it.SortOrder}</div>
                    </div>
                    <button onClick={() => setModalState({ section, item: it })} className="text-primary text-sm font-semibold">Sửa</button>
                    <button onClick={() => handleDeleteItem(it)} className="text-red-500 text-sm font-semibold">Xóa</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalState && (
        <HomepageItemModal
          section={modalState.section}
          item={modalState.item}
          onClose={() => setModalState(null)}
          onSaved={() => { setModalState(null); load(); }}
        />
      )}
    </div>
  );
}
