import React, { useState, useEffect } from 'react';

const SECTION_FIELDS = {
  promo_slide: { titleLabel: 'Tiêu đề slide', subtitleLabel: 'Badge (VD: 🔥 GIẢM 20%)', bodyLabel: 'Ghi chú ngắn', hasExtra: true },
  honor_student: { titleLabel: 'Tên học sinh', subtitleLabel: null, bodyLabel: 'Thành tích (mỗi dòng 1 ý)', hasExtra: false },
  testimonial: { titleLabel: 'Tên học viên (để trống dùng mặc định)', subtitleLabel: null, bodyLabel: 'Nội dung feedback', hasExtra: false }
};

export default function HomepageItemModal({ section, item, onClose, onSaved }) {
  const fields = SECTION_FIELDS[section];
  const isEdit = !!item;

  const [form, setForm] = useState({
    title: item?.Title || '',
    subtitle: item?.Subtitle || '',
    body: item?.Body || '',
    sortOrder: item?.SortOrder ?? 0,
    price: '',
    oldPrice: '',
    code: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item?.ExtraData) {
      try {
        const extra = JSON.parse(item.ExtraData);
        setForm((prev) => ({ ...prev, price: extra.price || '', oldPrice: extra.oldPrice || '', code: extra.code || '' }));
      } catch (e) {
        // giữ nguyên nếu JSON hỏng
      }
    }
  }, [item]);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

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
      if (fields.hasExtra) {
        formData.append('extraData', JSON.stringify({ price: form.price, oldPrice: form.oldPrice, code: form.code }));
      }
      if (imageFile) formData.append('image', imageFile);

      const url = isEdit ? `/Admin/Settings/Items/${item.Id}` : '/Admin/Settings/Items';
      const res = await api.post(url, formData, { headers: { 'Content-Type': undefined } });
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-xl text-slate-900">{isEdit ? 'Sửa nội dung' : 'Thêm nội dung mới'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">{fields.titleLabel}</label>
            <input type="text" value={form.title} onChange={handleChange('title')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
          </div>
          {fields.subtitleLabel && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">{fields.subtitleLabel}</label>
              <input type="text" value={form.subtitle} onChange={handleChange('subtitle')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">{fields.bodyLabel}</label>
            <textarea rows={4} value={form.body} onChange={handleChange('body')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none resize-y" />
          </div>
          {fields.hasExtra && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Giá</label>
                <input type="text" value={form.price} onChange={handleChange('price')} placeholder="Giảm 20%" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Giá cũ</label>
                <input type="text" value={form.oldPrice} onChange={handleChange('oldPrice')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã giảm giá</label>
                <input type="text" value={form.code} onChange={handleChange('code')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Thứ tự hiển thị</label>
              <input type="number" value={form.sortOrder} onChange={handleChange('sortOrder')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Ảnh</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-sm" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">Hủy</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
