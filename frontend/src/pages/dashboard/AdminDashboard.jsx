import React, { useState, useMemo } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import axios from 'axios';

const PAGE_SIZE = 10;

/* ---------------------------------------------------------------------- */
/* Small inline icons (copied from the static mockups in frontend/admin/) */
/* ---------------------------------------------------------------------- */
function IconSearch({ className = 'w-4 h-4' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>; }
function IconBell({ className = 'w-6 h-6' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>; }
function IconMail({ className = 'w-6 h-6' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>; }
function IconPlus({ className = 'w-4 h-4' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /><path d="M12 5v14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>; }
function IconEye({ className = 'w-4 h-4' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M2.062 12.348a1 1 0 010-.696 10.75 10.75 0 0119.876 0 1 1 0 010 .696 10.75 10.75 0 01-19.876 0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /><circle cx="12" cy="12" r="3" strokeWidth="2" /></svg>; }
function IconEdit({ className = 'w-4 h-4' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 21h8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /><path d="M21.174 6.812a1 1 0 00-3.986-3.987L3.842 16.174a2 2 0 00-.5.83l-1.321 4.352a.5.5 0 00.623.622l4.353-1.32a2 2 0 00.83-.497z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>; }
function IconTrash({ className = 'w-4 h-4' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 11v6M14 11v6M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>; }
function IconChevronLeft({ className = 'w-4 h-4' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>; }
function IconChevronRight({ className = 'w-4 h-4' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>; }
function IconStar({ className = 'w-4 h-4' }) { return <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>; }
function IconFilter({ className = 'w-5 h-5' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>; }
function IconDownload({ className = 'w-4 h-4' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>; }
function IconUsers({ className = 'w-3.5 h-3.5' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /><path d="M16 3.128a4 4 0 010 7.744" strokeWidth="2" /><path d="M22 21v-2a4 4 0 00-3-3.87" strokeWidth="2" /><circle cx="9" cy="7" r="4" strokeWidth="2" /></svg>; }
function IconMenu({ className = 'w-6 h-6' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>; }
function IconDots({ className = 'w-4 h-4' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" strokeWidth="2" /></svg>; }
function IconPencilBox({ className = 'w-4 h-4' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>; }
function IconCalendar({ className = 'w-4 h-4' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>; }
function IconChevronRightSm({ className = 'w-4 h-4' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>; }

/** Emerald toggle switch matching the them-giangvien.html / them-hoc-vien.html "Kích hoạt" control. */
function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-[#10B981] transition-colors" />
      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

/* ---------------------------------------------------------------------- */
/* Helpers                                                                  */
/* ---------------------------------------------------------------------- */
function initials(name) { return name ? name.trim().charAt(0).toUpperCase() : '?'; }
function money(n) { return `${Number(n || 0).toLocaleString('en-US')} đ`; }
function vnDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('vi-VN'); }
function vnDateTime(d) { if (!d) return '—'; const dt = new Date(d); return `${dt.toLocaleDateString('vi-VN')} ${dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`; }
function relativeTime(d) {
  if (!d) return '';
  const diffMs = Date.now() - new Date(d).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Vừa xong';
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  return `${day} ngày trước`;
}
const BADGE_PALETTE = [
  'bg-blue-50 text-blue-600',
  'bg-indigo-50 text-indigo-600',
  'bg-pink-50 text-pink-600',
  'bg-red-50 text-red-600',
  'bg-purple-50 text-purple-600',
  'bg-emerald-50 text-emerald-600',
  'bg-green-50 text-green-600',
];
function hashColor(text) {
  const s = text || '?';
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i);
  return BADGE_PALETTE[sum % BADGE_PALETTE.length];
}

function usePagedSearch(rows, searchFn) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((row) => searchFn(row).toLowerCase().includes(q));
  }, [rows, query, searchFn]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const changeQuery = (v) => { setQuery(v); setPage(1); };
  return { query, setQuery: changeQuery, page: safePage, setPage, totalPages, paged, total: filtered.length };
}

/** Shared pagination control — same w-8 h-8 rounded-lg button pattern used by all 3 mockups, only the accent color changes per page. */
function Pager({ page, setPage, totalPages, total, pageSize, activeClass }) {
  if (total === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  let pages = [];
  if (totalPages <= 7) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    pages = [1, 2, 3, '...', totalPages];
    if (page > 4 && page < totalPages - 2) pages = [1, '...', page, '...', totalPages];
  }
  return (
    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/30 flex-wrap gap-3">
      <div className="text-sm text-gray-500">Hiển thị <span className="font-bold text-gray-900">{start}-{end}</span> trong <span className="font-bold text-gray-900">{total}</span></div>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40">
          <IconChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, idx) => p === '...' ? (
          <span key={`e${idx}`} className="px-1 text-gray-400">...</span>
        ) : (
          <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold ${p === page ? activeClass : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
        ))}
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40">
          <IconChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/** Fire a redirect-style admin action (delete/toggle/mark-paid). The axios interceptor
 *  hard-navigates on success, which reloads the SPA at the redirected URL — acceptable
 *  since the Vite dev proxy bypasses non-XHR navigations back to the React app. */
async function postRedirectAction(url, body) {
  await api.post(url, body || {});
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006d43] focus:border-[#006d43]";

function FormActions({ onCancel, saving, saveLabel = 'Lưu' }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100">Hủy</button>
      <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#006d43] hover:bg-[#00512f] disabled:opacity-50">
        {saving ? 'Đang lưu...' : saveLabel}
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Sidebar — ported 1:1 from frontend/admin/thong-ke.html (the only mockup */
/* with a complete sidebar), shared by every tab per "lấy thanh khung bên  */
/* trái đồng nhất".                                                        */
/* ---------------------------------------------------------------------- */
const NAV_ITEMS = [
  { key: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { key: 'courses', icon: 'menu_book', label: 'Quản lý khóa học' },
  { key: 'teachers', icon: 'record_voice_over', label: 'Giảng viên' },
  { key: 'students', icon: 'group', label: 'Học viên' },
  { key: 'invoices', icon: 'receipt_long', label: 'Quản lý Hóa đơn' },
  { key: 'leads', icon: 'smart_toy', label: 'Khách hàng tư vấn AI' },
];

function Sidebar({ active, onSelect, onLogout }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-[#eef6f2] z-50 flex flex-col border-r border-[#e1ede6]">
      <div className="h-16 flex items-center px-6 gap-3 mb-4 shrink-0">
        <div className="w-8 h-8 rounded bg-[#006d43] flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[20px]">school</span>
        </div>
        <span className="text-[#006d43] text-[20px] tracking-tight leading-tight font-bold">Anh Tề</span>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all text-left ${active === item.key ? 'bg-[#006d43] text-white font-semibold shadow-sm' : 'text-[#3d6b56] hover:bg-white hover:text-[#00512f]'}`}
          >
            <span className="material-symbols-outlined mr-3 text-[20px]">{item.icon}</span>
            <span className="text-[13px]">{item.label}</span>
          </button>
        ))}
        <div className="pt-4 mt-4 border-t border-[#dcebe3]">
          <button onClick={onLogout} className="w-full flex items-center px-4 py-3 rounded-lg text-red-500 hover:bg-red-100/60 transition-all text-left">
            <span className="material-symbols-outlined mr-3 text-[20px]">logout</span>
            <span className="text-[13px]">Đăng xuất</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}

/* ---------------------------------------------------------------------- */
/* Entity modals — wired to the real backend endpoints in adminController */
/* ---------------------------------------------------------------------- */
function TeacherModal({ teacher, readOnly, onClose, onSaved }) {
  const p = teacher.Profile || {};
  const [form, setForm] = useState({
    fullName: teacher.FullName || '',
    phone: teacher.Phone || '',
    subject: p.Subject || '',
    teacherTitle: p.TeacherTitle || '',
    teacherExperience: p.TeacherExperience ?? '',
    teacherBio: p.TeacherBio || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/Admin/UpdateTeacherInfo', { teacherId: teacher.Id, ...form });
      if (res.data?.success) {
        onSaved();
      } else {
        setError(res.data?.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      setError('Không thể kết nối máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={readOnly ? 'Thông tin giảng viên' : 'Sửa thông tin giảng viên'} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Họ và tên"><input className={inputCls} value={form.fullName} onChange={set('fullName')} disabled={readOnly} required /></Field>
        <Field label="Số điện thoại"><input className={inputCls} value={form.phone} onChange={set('phone')} disabled={readOnly} /></Field>
        <Field label="Chuyên môn"><input className={inputCls} value={form.subject} onChange={set('subject')} disabled={readOnly} placeholder="VD: Toán học Cấp 3" /></Field>
        <Field label="Chức danh"><input className={inputCls} value={form.teacherTitle} onChange={set('teacherTitle')} disabled={readOnly} placeholder="VD: Giáo viên chính" /></Field>
        <Field label="Số năm kinh nghiệm"><input type="number" min="0" className={inputCls} value={form.teacherExperience} onChange={set('teacherExperience')} disabled={readOnly} /></Field>
        <Field label="Giới thiệu"><textarea rows={3} className={inputCls} value={form.teacherBio} onChange={set('teacherBio')} disabled={readOnly} /></Field>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {!readOnly && <FormActions onCancel={onClose} saving={saving} />}
      </form>
    </Modal>
  );
}

function StudentModal({ student, readOnly, onClose, onSaved }) {
  const p = student.Profile || {};
  const [form, setForm] = useState({
    fullName: student.FullName || '',
    phone: student.Phone || '',
    gender: p.Gender ?? '',
    dob: p.Dob ? new Date(p.Dob).toISOString().slice(0, 10) : '',
    address: p.Address || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/Admin/UpdateStudentInfo', { studentId: student.Id, ...form });
      if (res.data?.success) {
        onSaved();
      } else {
        setError(res.data?.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      setError('Không thể kết nối máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={readOnly ? 'Thông tin học viên' : 'Sửa thông tin học viên'} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Họ và tên"><input className={inputCls} value={form.fullName} onChange={set('fullName')} disabled={readOnly} required /></Field>
        <Field label="Số điện thoại"><input className={inputCls} value={form.phone} onChange={set('phone')} disabled={readOnly} /></Field>
        <Field label="Giới tính">
          <select className={inputCls} value={form.gender} onChange={set('gender')} disabled={readOnly}>
            <option value="">— Chưa rõ —</option>
            <option value="0">Nam</option>
            <option value="1">Nữ</option>
            <option value="2">Khác</option>
          </select>
        </Field>
        <Field label="Ngày sinh"><input type="date" className={inputCls} value={form.dob} onChange={set('dob')} disabled={readOnly} /></Field>
        <Field label="Địa chỉ"><input className={inputCls} value={form.address} onChange={set('address')} disabled={readOnly} /></Field>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {!readOnly && <FormActions onCancel={onClose} saving={saving} />}
      </form>
    </Modal>
  );
}

function CourseModal({ course, onClose, readOnly }) {
  const isEdit = !!course;
  const [form, setForm] = useState({
    courseCode: course?.CourseCode || '',
    title: course?.Title || '',
    description: course?.Description || '',
    basePrice: course?.BasePrice ?? '',
    totalLessons: course?.TotalLessons ?? '',
    tags: Array.isArray(course?.MetadataTags) ? course.MetadataTags.join(', ') : (course?.MetadataTags || ''),
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      if (!isEdit) fd.append('courseCode', form.courseCode);
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('basePrice', form.basePrice);
      fd.append('totalLessons', form.totalLessons);
      fd.append('tags', form.tags);
      if (imageFile) fd.append('courseImage', imageFile);

      const url = isEdit ? `/Course/Update/${course.Id}` : '/Admin/CreateCourse';
      await api.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      // Redirect-style endpoint: axios interceptor navigates on success; nothing else to do.
    } catch (err) {
      setError('Không thể kết nối máy chủ.');
      setSaving(false);
    }
  };

  return (
    <Modal title={readOnly ? 'Thông tin khóa học' : isEdit ? 'Sửa khóa học' : 'Thêm khóa học mới'} onClose={onClose} wide>
      <form onSubmit={submit}>
        {!isEdit && <Field label="Mã khóa học"><input className={inputCls} value={form.courseCode} onChange={set('courseCode')} disabled={readOnly} required /></Field>}
        <Field label="Tên khóa học"><input className={inputCls} value={form.title} onChange={set('title')} disabled={readOnly} required /></Field>
        <Field label="Mô tả"><textarea rows={3} className={inputCls} value={form.description} onChange={set('description')} disabled={readOnly} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Học phí gốc (đ)"><input type="number" min="0" className={inputCls} value={form.basePrice} onChange={set('basePrice')} disabled={readOnly} required /></Field>
          <Field label="Số buổi học"><input type="number" min="1" className={inputCls} value={form.totalLessons} onChange={set('totalLessons')} disabled={readOnly} required /></Field>
        </div>
        <Field label="Danh mục / thẻ (phân cách bởi dấu phẩy)"><input className={inputCls} value={form.tags} onChange={set('tags')} disabled={readOnly} placeholder="VD: Lập trình, Toán" /></Field>
        {!readOnly && <Field label="Ảnh khóa học"><input type="file" accept="image/*" className={inputCls} onChange={(e) => setImageFile(e.target.files?.[0] || null)} /></Field>}
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {readOnly ? (
          <div className="flex justify-end pt-2"><button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#006d43] hover:bg-[#00512f]">Đóng</button></div>
        ) : (
          <FormActions onCancel={onClose} saving={saving} saveLabel={isEdit ? 'Lưu thay đổi' : 'Tạo khóa học'} />
        )}
      </form>
    </Modal>
  );
}

/** Raw (interceptor-bypassing) POST — lets us create the account and immediately
 *  patch its profile fields in the same page without the shared `api` instance's
 *  hard-redirect-on-success behavior kicking in mid-flow. */
async function rawPost(url, body) {
  return axios.post(url, body, {
    withCredentials: true,
    headers: { 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/json', Accept: 'application/json' },
  });
}

/** Shared topbar for the two "Thêm ..." full-page forms, ported 1:1 from
 *  frontend/admin/them-giangvien.html / them-hoc-vien.html. */
function CreatePageTopbar({ currentUserFullName }) {
  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconSearch className="w-5 h-5 text-gray-400" /></span>
          <input className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] sm:text-sm" placeholder="Tìm kiếm giảng viên, khóa học, học viên, đơn hàng..." type="text" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-500"><IconBell className="w-6 h-6" /><span className="absolute top-1.5 right-1.5 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">5</span></button>
        <button className="relative p-2 text-gray-400 hover:text-gray-500"><IconMail className="w-6 h-6" /><span className="absolute top-1.5 right-1.5 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">3</span></button>
        <div className="flex items-center gap-3 pl-4 border-l border-[#E5E7EB]">
          <div className="text-right"><p className="text-sm font-semibold">{currentUserFullName}</p><p className="text-xs text-gray-500">Quản trị viên</p></div>
          <div className="h-10 w-10 rounded-full border border-[#E5E7EB] bg-[#10B981] text-white flex items-center justify-center font-bold">{initials(currentUserFullName)}</div>
        </div>
      </div>
    </header>
  );
}

function TeacherCreatePage({ onCancel, onSaved, currentUserFullName }) {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', dob: '', gender: 'Nam',
    subject: 'Toán học', teacherExperience: '', education: 'Đại học', workplace: '',
    username: '', password: '', active: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.fullName || !form.email || !form.password) { setError('Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.'); return; }
    setSaving(true);
    setError('');
    try {
      const createRes = await rawPost('/Admin/CreateUser', { fullName: form.fullName, email: form.email, phone: form.phone, password: form.password, role: 'TEACHER' });
      if (createRes.data?.type === 'redirect' && createRes.data?.url?.includes('errorMessage')) { /* no-op, backend uses session flash instead */ }
      const dashRes = await api.get('/Admin/Dashboard');
      const teachers = dashRes.data?.data?.teachers || [];
      const created = teachers.find((t) => (t.Email || '').toLowerCase() === form.email.trim().toLowerCase());
      if (!created) { setError('Tạo tài khoản thất bại (email có thể đã tồn tại).'); setSaving(false); return; }
      await api.post('/Admin/UpdateTeacherInfo', {
        teacherId: created.Id,
        fullName: form.fullName,
        phone: form.phone,
        teacherTitle: form.education,
        subject: form.subject,
        teacherExperience: form.teacherExperience,
        teacherBio: form.workplace ? `Đơn vị công tác: ${form.workplace}` : '',
      });
      onSaved();
    } catch (err) {
      setError('Không thể kết nối máy chủ, hoặc email đã được sử dụng.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }} className="bg-[#F3F4F6] min-h-screen">
      <CreatePageTopbar currentUserFullName={currentUserFullName} />
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <nav className="flex text-sm text-gray-500 mb-2 items-center gap-2">
              <button onClick={onCancel} className="hover:text-[#10B981]">Giảng viên</button>
              <IconChevronRightSm className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Thêm giảng viên mới</span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900">Thêm giảng viên mới</h1>
            <p className="text-sm text-gray-500">Tạo tài khoản giảng viên mới trên hệ thống</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">Hủy bỏ</button>
            <button onClick={submit} disabled={saving} className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu giảng viên'}</button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col gap-6">
            <h2 className="text-lg font-bold text-gray-900">Thông tin cơ bản</h2>
            <div className="space-y-4">
              <div className="space-y-1.5"><label className="text-sm font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label><input className="w-full rounded-lg border-gray-300 focus:ring-[#10B981] focus:border-[#10B981] text-sm p-2.5" type="text" value={form.fullName} onChange={set('fullName')} /></div>
              <div className="space-y-1.5"><label className="text-sm font-semibold text-gray-700">Email <span className="text-red-500">*</span></label><input className="w-full rounded-lg border-gray-300 focus:ring-[#10B981] focus:border-[#10B981] text-sm p-2.5" type="email" value={form.email} onChange={set('email')} /></div>
              <div className="space-y-1.5"><label className="text-sm font-semibold text-gray-700">Số điện thoại</label><input className="w-full rounded-lg border-gray-300 focus:ring-[#10B981] focus:border-[#10B981] text-sm p-2.5" type="tel" value={form.phone} onChange={set('phone')} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Ngày sinh</label>
                  <div className="relative"><input className="w-full rounded-lg border-gray-300 focus:ring-[#10B981] focus:border-[#10B981] text-sm p-2.5 pr-10" type="text" placeholder="DD/MM/YYYY" value={form.dob} onChange={set('dob')} /><span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400"><IconCalendar className="w-5 h-5" /></span></div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Giới tính</label>
                  <select className="w-full rounded-lg border-gray-300 focus:ring-[#10B981] focus:border-[#10B981] text-sm p-2.5" value={form.gender} onChange={set('gender')}>
                    <option>Nam</option><option>Nữ</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col gap-6">
            <h2 className="text-lg font-bold text-gray-900">Thông tin chuyên môn</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Chuyên môn / Lĩnh vực <span className="text-red-500">*</span></label>
                <select className="w-full rounded-lg border-gray-300 focus:ring-[#10B981] focus:border-[#10B981] text-sm p-2.5" value={form.subject} onChange={set('subject')}>
                  <option>Toán học</option><option>Ngữ văn</option><option>Tiếng Anh</option><option>Vật lý</option><option>Hóa học</option>
                </select>
              </div>
              <div className="space-y-1.5"><label className="text-sm font-semibold text-gray-700">Kinh nghiệm giảng dạy (năm)</label><input className="w-full rounded-lg border-gray-300 focus:ring-[#10B981] focus:border-[#10B981] text-sm p-2.5" type="number" value={form.teacherExperience} onChange={set('teacherExperience')} /></div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Học vấn</label>
                <select className="w-full rounded-lg border-gray-300 focus:ring-[#10B981] focus:border-[#10B981] text-sm p-2.5" value={form.education} onChange={set('education')}>
                  <option>Đại học</option><option>Thạc sĩ</option><option>Tiến sĩ</option>
                </select>
              </div>
              <div className="space-y-1.5"><label className="text-sm font-semibold text-gray-700">Đơn vị công tác</label><input className="w-full rounded-lg border-gray-300 focus:ring-[#10B981] focus:border-[#10B981] text-sm p-2.5" type="text" value={form.workplace} onChange={set('workplace')} /></div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col gap-6">
            <h2 className="text-lg font-bold text-gray-900">Tài khoản &amp; Quyền</h2>
            <div className="space-y-4">
              <div className="space-y-1.5"><label className="text-sm font-semibold text-gray-700">Tên đăng nhập</label><input className="w-full rounded-lg border-gray-300 focus:ring-[#10B981] focus:border-[#10B981] text-sm p-2.5" type="text" value={form.username} onChange={set('username')} /></div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Mật khẩu <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input className="w-full rounded-lg border-gray-300 focus:ring-[#10B981] focus:border-[#10B981] text-sm p-2.5 pr-10" type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"><IconEye className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Vai trò</label>
                <select className="w-full rounded-lg border-gray-300 focus:ring-[#10B981] focus:border-[#10B981] text-sm p-2.5" disabled>
                  <option>Giảng viên</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Trạng thái</label>
                <div className="flex items-center gap-3">
                  <Toggle checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                  <span className="text-sm font-medium text-gray-900">Kích hoạt</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StudentCreatePage({ onCancel, onSaved, currentUserFullName }) {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', dob: '', gender: 'Nữ',
    username: '', password: '', active: true,
    idNumber: '', idIssueDate: '', address: '', note: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.fullName || !form.email || !form.password) { setError('Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.'); return; }
    setSaving(true);
    setError('');
    try {
      await rawPost('/Admin/CreateUser', { fullName: form.fullName, email: form.email, phone: form.phone, password: form.password, role: 'STUDENT' });
      const dashRes = await api.get('/Admin/Dashboard');
      const students = dashRes.data?.data?.students || [];
      const created = students.find((s) => (s.Email || '').toLowerCase() === form.email.trim().toLowerCase());
      if (!created) { setError('Tạo tài khoản thất bại (email có thể đã tồn tại).'); setSaving(false); return; }
      await api.post('/Admin/UpdateStudentInfo', {
        studentId: created.Id,
        fullName: form.fullName,
        phone: form.phone,
        gender: form.gender === 'Nam' ? 0 : form.gender === 'Nữ' ? 1 : 2,
        dob: form.dob,
        address: form.address,
      });
      onSaved();
    } catch (err) {
      setError('Không thể kết nối máy chủ, hoặc email đã được sử dụng.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }} className="bg-[#f8fafc] min-h-screen">
      <CreatePageTopbar currentUserFullName={currentUserFullName} />
      <div className="p-8" style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
              <button onClick={onCancel} className="hover:text-[#10B981] transition-colors">Học viên</button>
              <span>&gt;</span>
              <span className="text-gray-600 font-medium">Thêm học viên mới</span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Thêm học viên mới</h1>
            <p className="text-gray-500 text-sm">Tạo tài khoản học viên mới trên hệ thống</p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={onCancel} className="px-6 py-2.5 rounded-lg border border-gray-200 font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">Hủy bỏ</button>
            <button onClick={submit} disabled={saving} className="px-6 py-2.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white font-semibold transition-colors shadow-sm disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu học viên'}</button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Thông tin cá nhân</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label><input className="w-full rounded-lg border-slate-200 text-sm py-2.5 focus:ring-[#10b981] focus:border-[#10b981]" type="text" value={form.fullName} onChange={set('fullName')} /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Email <span className="text-red-500">*</span></label><input className="w-full rounded-lg border-slate-200 text-sm py-2.5 focus:ring-[#10b981] focus:border-[#10b981]" type="email" value={form.email} onChange={set('email')} /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại</label><input className="w-full rounded-lg border-slate-200 text-sm py-2.5 focus:ring-[#10b981] focus:border-[#10b981]" type="tel" value={form.phone} onChange={set('phone')} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ngày sinh</label>
                  <div className="relative"><input className="w-full rounded-lg border-slate-200 text-sm py-2.5 focus:ring-[#10b981] focus:border-[#10b981]" type="text" placeholder="DD/MM/YYYY" value={form.dob} onChange={set('dob')} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"><IconCalendar className="w-4 h-4" /></span></div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giới tính</label>
                  <select className="w-full rounded-lg border-slate-200 text-sm py-2.5 focus:ring-[#10b981] focus:border-[#10b981]" value={form.gender} onChange={set('gender')}>
                    <option>Nữ</option><option>Nam</option><option>Khác</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Thông tin bổ sung</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Số CMND/CCCD</label><input className="w-full rounded-lg border-slate-200 text-sm py-2.5 focus:ring-[#10b981] focus:border-[#10b981]" type="text" value={form.idNumber} onChange={set('idNumber')} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Ngày cấp</label><input className="w-full rounded-lg border-slate-200 text-sm py-2.5 focus:ring-[#10b981] focus:border-[#10b981]" type="text" placeholder="DD/MM/YYYY" value={form.idIssueDate} onChange={set('idIssueDate')} /></div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phụ huynh (nếu có)</label>
                  <div className="relative"><input className="w-full rounded-lg border-slate-200 text-sm py-2.5 focus:ring-[#10b981] focus:border-[#10b981]" type="text" placeholder="Tên phụ huynh" disabled /></div>
                </div>
              </div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Địa chỉ</label><input className="w-full rounded-lg border-slate-200 text-sm py-2.5 focus:ring-[#10b981] focus:border-[#10b981]" type="text" value={form.address} onChange={set('address')} /></div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ghi chú</label>
                <div className="relative"><textarea className="w-full rounded-lg border-slate-200 text-sm py-2.5 focus:ring-[#10b981] focus:border-[#10b981] min-h-[120px] resize-none" placeholder="Nhập ghi chú..." value={form.note} onChange={set('note')} /></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Thông tin tài khoản</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên đăng nhập</label><input className="w-full rounded-lg border-slate-200 text-sm py-2.5 focus:ring-[#10b981] focus:border-[#10b981]" type="text" value={form.username} onChange={set('username')} /></div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input className="w-full rounded-lg border-slate-200 text-sm py-2.5 focus:ring-[#10b981] focus:border-[#10b981]" type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"><IconEye className="w-4 h-4" /></button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Trạng thái</label>
                <div className="flex items-center gap-3">
                  <Toggle checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                  <span className="text-sm font-medium text-slate-700">Kích hoạt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceCreateModal({ students, classes, onClose }) {
  const [form, setForm] = useState({ studentId: '', classId: '', amount: '', dueDate: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/Admin/CreateInvoice', form);
      // Redirect-style endpoint: axios interceptor navigates on success.
    } catch (err) {
      setError('Không thể kết nối máy chủ.');
      setSaving(false);
    }
  };

  return (
    <Modal title="Tạo hóa đơn học phí" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Học viên">
          <select className={inputCls} value={form.studentId} onChange={set('studentId')} required>
            <option value="">— Chọn học viên —</option>
            {students.map((s) => <option key={s.Id} value={s.Id}>{s.FullName}</option>)}
          </select>
        </Field>
        <Field label="Lớp học">
          <select className={inputCls} value={form.classId} onChange={set('classId')} required>
            <option value="">— Chọn lớp học —</option>
            {classes.map((c) => <option key={c.Id} value={c.Id}>{c.ClassName}{c.Course ? ` - ${c.Course.Title}` : ''}</option>)}
          </select>
        </Field>
        <Field label="Số tiền (đ)"><input type="number" min="0" className={inputCls} value={form.amount} onChange={set('amount')} required /></Field>
        <Field label="Hạn thanh toán"><input type="date" className={inputCls} value={form.dueDate} onChange={set('dueDate')} required /></Field>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <FormActions onCancel={onClose} saving={saving} saveLabel="Phát hành hóa đơn" />
      </form>
    </Modal>
  );
}

function RowMenu({ items }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen((o) => !o)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500"><IconDots className="w-4 h-4" /></button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1">
            {items.map((it, i) => (
              <button
                key={i}
                onClick={() => { setOpen(false); it.onClick(); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${it.danger ? 'text-red-600' : 'text-gray-700'}`}
              >
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function InvoiceViewModal({ invoice, onClose }) {
  return (
    <Modal title="Chi tiết hóa đơn" onClose={onClose}>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Mã hóa đơn</span><span className="font-bold text-gray-900">{invoice.InvoiceCode}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Học viên</span><span className="font-semibold text-gray-900">{invoice.Student?.FullName}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Lớp học</span><span className="font-semibold text-gray-900">{invoice.Class?.ClassName || '—'}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Số tiền</span><span className="font-bold text-[#006d43]">{money(invoice.Amount)}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Ngày tạo</span><span className="text-gray-900">{vnDate(invoice.CreatedAt)}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Hạn thanh toán</span><span className="text-gray-900">{vnDate(invoice.DueDate)}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Trạng thái</span><span className={`font-bold ${invoice.Status === 1 ? 'text-green-600' : 'text-red-600'}`}>{invoice.Status === 1 ? 'Đã đóng' : 'Chưa nộp'}</span></div>
      </div>
      <div className="flex justify-end pt-4">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#006d43] hover:bg-[#00512f]">Đóng</button>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------- */
/* Main component                                                          */
/* ---------------------------------------------------------------------- */
export default function AdminDashboard() {
  const { data, loading, refetch } = useFetchData('/Admin/Dashboard');
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    const map = { tabCourses: 'courses', tabTeachers: 'teachers', tabStudents: 'students', tabInvoices: 'invoices', tabLeads: 'leads' };
    return map[tab] || 'dashboard';
  });
  const [modal, setModal] = useState(null); // { type, payload }
  const closeModal = () => setModal(null);
  const closeAndRefetch = () => { setModal(null); refetch(); };

  const toggleUserStatus = async (userId) => {
    if (!window.confirm('Xác nhận thay đổi trạng thái hoạt động của tài khoản này?')) return;
    await postRedirectAction(`/Admin/ToggleUserStatus/${userId}`);
  };
  const deleteUser = async (userId, name) => {
    if (!window.confirm(`Xác nhận xóa tài khoản "${name}"? Hành động này không thể hoàn tác.`)) return;
    await postRedirectAction(`/Admin/DeleteUser/${userId}`);
  };
  const deleteCourse = async (courseId, title) => {
    if (!window.confirm(`Xác nhận xóa khóa học "${title}"? Hành động này không thể hoàn tác.`)) return;
    await postRedirectAction(`/Admin/DeleteCourse/${courseId}`);
  };
  const markInvoicePaid = async (invoiceId, code) => {
    if (!window.confirm(`Xác nhận đã nhận thanh toán tiền mặt cho hóa đơn ${code}?`)) return;
    await postRedirectAction(`/Admin/MarkInvoicePaid/${invoiceId}`);
  };

  const stats = data?.stats || {};
  const courses = data?.courses || [];
  const classes = data?.classes || [];
  const teachers = data?.teachers || [];
  const students = data?.students || [];
  const teacherKpis = data?.teacherKpis || [];
  const studentKpis = data?.studentKpis || [];
  const invoices = data?.invoices || [];
  const leads = data?.leads || [];
  const currentUserFullName = data?.currentUserFullName || 'Admin';

  const teacherKpiMap = useMemo(() => { const m = {}; teacherKpis.forEach((k) => { m[k.TeacherId] = k; }); return m; }, [teacherKpis]);
  const studentKpiMap = useMemo(() => { const m = {}; studentKpis.forEach((k) => { m[k.StudentId] = k; }); return m; }, [studentKpis]);
  const classTeacherMap = useMemo(() => { const m = {}; classes.forEach((c) => { m[c.Id] = c.TeacherId; }); return m; }, [classes]);
  const teacherClassesMap = useMemo(() => { const m = {}; classes.forEach((c) => { if (!m[c.TeacherId]) m[c.TeacherId] = []; m[c.TeacherId].push(c); }); return m; }, [classes]);
  const teacherRevenueMap = useMemo(() => {
    const m = {};
    invoices.forEach((inv) => {
      if (inv.Status !== 1) return;
      const teacherId = classTeacherMap[inv.ClassId];
      if (!teacherId) return;
      m[teacherId] = (m[teacherId] || 0) + Number(inv.Amount || 0);
    });
    return m;
  }, [invoices, classTeacherMap]);
  const studentSpendMap = useMemo(() => {
    const m = {};
    invoices.forEach((inv) => {
      if (inv.Status !== 1) return;
      m[inv.StudentId] = (m[inv.StudentId] || 0) + Number(inv.Amount || 0);
    });
    return m;
  }, [invoices]);

  const coursesSearch = usePagedSearch(courses, (c) => `${c.CourseCode || ''} ${c.Title || ''}`);
  const teachersSearch = usePagedSearch(teachers, (t) => `${t.FullName || ''} ${t.Email || ''} ${t.Profile?.Subject || ''}`);
  const studentsSearch = usePagedSearch(students, (s) => `${s.FullName || ''} ${s.Email || ''}`);
  const invoicesSearch = usePagedSearch(invoices, (inv) => `${inv.InvoiceCode || ''} ${inv.Student?.FullName || ''}`);
  const leadsSearch = usePagedSearch(leads, (l) => `${l.LeadName || ''} ${l.LeadPhone || ''}`);

  const recentInvoices = invoices.slice(0, 5);

  /* last 6 months buckets for the two dashboard charts (real, computed client-side) */
  const monthBuckets = useMemo(() => {
    const buckets = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ year: d.getFullYear(), month: d.getMonth(), label: `T${d.getMonth() + 1}` });
    }
    return buckets;
  }, []);
  const revenueByMonth = useMemo(() => monthBuckets.map((b) => ({
    ...b,
    total: invoices.filter((inv) => inv.Status === 1 && inv.CreatedAt && new Date(inv.CreatedAt).getFullYear() === b.year && new Date(inv.CreatedAt).getMonth() === b.month).reduce((s, inv) => s + Number(inv.Amount || 0), 0),
  })), [invoices, monthBuckets]);
  const studentsByMonth = useMemo(() => monthBuckets.map((b) => ({
    ...b,
    count: students.filter((s) => s.CreatedAt && new Date(s.CreatedAt).getFullYear() === b.year && new Date(s.CreatedAt).getMonth() === b.month).length,
  })), [students, monthBuckets]);
  const maxRevenue = Math.max(1, ...revenueByMonth.map((b) => b.total));
  const maxStudents = Math.max(1, ...studentsByMonth.map((b) => b.count));

  const recentActivity = useMemo(() => {
    const items = [];
    students.forEach((s) => { if (s.CreatedAt) items.push({ type: 'student', date: s.CreatedAt, text: <>{`Học viên `}<span className="font-label-bold">{s.FullName}</span>{` vừa tham gia hệ thống`}</> }); });
    invoices.forEach((inv) => { if (inv.Status === 1 && inv.CreatedAt) items.push({ type: 'invoice', date: inv.CreatedAt, text: <><span className="font-label-bold">{inv.Student?.FullName || 'Học viên'}</span>{` đã thanh toán hóa đơn `}<span className="text-[#006d43]">{money(inv.Amount)}</span></> }); });
    leads.forEach((l) => { if (l.CreatedAt) items.push({ type: 'lead', date: l.CreatedAt, text: <><span className="font-label-bold">{l.LeadName || 'Khách vãng lai'}</span>{` đã liên hệ tư vấn qua Chatbot AI`}</> }); });
    return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
  }, [students, invoices, leads]);

  const topCourses = useMemo(() => [...courses].slice(0, 3), [courses]);

  const initial = currentUserFullName.charAt(0).toUpperCase();

  const pageTitle = {
    dashboard: 'Dashboard',
    courses: 'Quản lý khóa học',
    teachers: 'Quản lý giảng viên',
    students: 'Quản lý học viên',
    invoices: 'Quản lý hóa đơn',
    leads: 'Khách hàng tư vấn AI',
  }[activeTab];

  return (
    <MainLayout hideHeader={true}>
      <div className="min-h-screen bg-[#f7faf8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Sidebar active={activeTab} onSelect={(tab) => { setActiveTab(tab); setModal(null); }} onLogout={logout} />
        <div className="pl-[260px] min-h-screen">
          {modal?.type === 'teacher-create-page' ? (
            <TeacherCreatePage onCancel={closeModal} onSaved={closeAndRefetch} currentUserFullName={currentUserFullName} />
          ) : modal?.type === 'student-create-page' ? (
            <StudentCreatePage onCancel={closeModal} onSaved={closeAndRefetch} currentUserFullName={currentUserFullName} />
          ) : loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="material-symbols-outlined animate-spin text-4xl text-[#006d43]">progress_activity</span>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardTab
                  stats={stats} students={students} courses={courses} invoices={invoices}
                  recentInvoices={recentInvoices} recentActivity={recentActivity} topCourses={topCourses}
                  revenueByMonth={revenueByMonth} studentsByMonth={studentsByMonth} maxRevenue={maxRevenue} maxStudents={maxStudents}
                  currentUserFullName={currentUserFullName} initial={initial}
                />
              )}
              {activeTab === 'courses' && (
                <CoursesTab
                  search={coursesSearch} allCourses={courses} classes={classes} currentUserFullName={currentUserFullName}
                  onCreate={() => setModal({ type: 'course-create' })}
                  onView={(c) => setModal({ type: 'course-view', course: c })}
                  onEdit={(c) => setModal({ type: 'course-edit', course: c })}
                  onDelete={(c) => deleteCourse(c.Id, c.Title)}
                />
              )}
              {activeTab === 'teachers' && (
                <TeachersTab
                  search={teachersSearch} teacherKpiMap={teacherKpiMap} teacherClassesMap={teacherClassesMap} teacherRevenueMap={teacherRevenueMap} currentUserFullName={currentUserFullName}
                  onCreate={() => setModal({ type: 'teacher-create-page' })}
                  onView={(t) => setModal({ type: 'teacher-view', teacher: t })}
                  onEdit={(t) => setModal({ type: 'teacher-edit', teacher: t })}
                  onToggleStatus={(t) => toggleUserStatus(t.Id)}
                  onDelete={(t) => deleteUser(t.Id, t.FullName)}
                />
              )}
              {activeTab === 'students' && (
                <StudentsTab
                  search={studentsSearch} studentKpiMap={studentKpiMap} studentSpendMap={studentSpendMap} currentUserFullName={currentUserFullName}
                  onCreate={() => setModal({ type: 'student-create-page' })}
                  onView={(s) => setModal({ type: 'student-view', student: s })}
                  onEdit={(s) => setModal({ type: 'student-edit', student: s })}
                  onToggleStatus={(s) => toggleUserStatus(s.Id)}
                  onDelete={(s) => deleteUser(s.Id, s.FullName)}
                />
              )}
              {activeTab === 'invoices' && (
                <SimpleTab title={pageTitle} subtitle="Theo dõi hóa đơn học phí của học viên" currentUserFullName={currentUserFullName}>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                    <div className="relative flex-1 max-w-xs">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch className="w-4 h-4" /></span>
                      <input type="text" value={invoicesSearch.query} onChange={(e) => invoicesSearch.setQuery(e.target.value)} placeholder="Tìm theo mã hóa đơn hoặc học viên..." className="w-full pl-10 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-[#006d43]" />
                    </div>
                    <button onClick={() => setModal({ type: 'invoice-create' })} className="ml-auto bg-[#006d43] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-[#00512f] shrink-0">
                      <IconPlus className="w-4 h-4" /> Tạo hóa đơn
                    </button>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mã hóa đơn</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Học viên</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Số tiền</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {invoicesSearch.paged.map((inv, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-900">{inv.InvoiceCode}</td>
                            <td className="px-6 py-4 font-semibold text-gray-700">{inv.Student?.FullName}</td>
                            <td className="px-6 py-4 font-bold text-[#006d43]">{money(inv.Amount)}</td>
                            <td className="px-6 py-4 text-gray-500 text-xs">{vnDate(inv.CreatedAt)}</td>
                            <td className="px-6 py-4">
                              {inv.Status === 1 ? (
                                <span className="flex items-center gap-1.5 text-green-600 text-[11px] font-bold bg-green-50 px-2 py-0.5 rounded-full w-fit"><span className="w-1.5 h-1.5 bg-green-600 rounded-full" /> Đã đóng</span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-red-600 text-[11px] font-bold bg-red-50 px-2 py-0.5 rounded-full w-fit"><span className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Chưa nộp</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-3">
                                <button onClick={() => setModal({ type: 'invoice-view', invoice: inv })} className="text-gray-400 hover:text-blue-500" title="Xem chi tiết"><IconEye /></button>
                                {inv.Status !== 1 && (
                                  <button onClick={() => markInvoicePaid(inv.Id, inv.InvoiceCode)} className="text-gray-400 hover:text-green-500" title="Đánh dấu đã đóng">
                                    <span className="material-symbols-outlined text-[18px]">task_alt</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {invoicesSearch.total === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-400 italic">Không tìm thấy hóa đơn phù hợp.</td></tr>}
                      </tbody>
                    </table>
                    <Pager page={invoicesSearch.page} setPage={invoicesSearch.setPage} totalPages={invoicesSearch.totalPages} total={invoicesSearch.total} pageSize={PAGE_SIZE} activeClass="bg-[#006d43] text-white" />
                  </div>
                </SimpleTab>
              )}
              {activeTab === 'leads' && (
                <SimpleTab title={pageTitle} subtitle="Hồ sơ khách hàng tiềm năng được Chatbot AI thu thập" currentUserFullName={currentUserFullName}>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4 flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch className="w-4 h-4" /></span>
                      <input type="text" value={leadsSearch.query} onChange={(e) => leadsSearch.setQuery(e.target.value)} placeholder="Tìm theo tên hoặc số điện thoại..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border-none text-sm focus:ring-2 focus:ring-[#006d43]" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tên khách hàng (Lead)</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">SĐT liên hệ</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tóm tắt nhu cầu</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Phiên tư vấn cuối</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {leadsSearch.paged.map((session, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-900">{session.LeadName || 'Khách vãng lai'}</td>
                            <td className="px-6 py-4 font-semibold text-gray-700">{session.LeadPhone || 'Chưa cung cấp'}</td>
                            <td className="px-6 py-4 text-gray-600 max-w-sm">{session.Summary || 'Đang trò chuyện cùng AI...'}</td>
                            <td className="px-6 py-4 text-gray-500 text-xs">{vnDate(session.CreatedAt)}</td>
                          </tr>
                        ))}
                        {leadsSearch.total === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-400 italic">Chưa có leads nào được ghi nhận.</td></tr>}
                      </tbody>
                    </table>
                    <Pager page={leadsSearch.page} setPage={leadsSearch.setPage} totalPages={leadsSearch.totalPages} total={leadsSearch.total} pageSize={PAGE_SIZE} activeClass="bg-[#006d43] text-white" />
                  </div>
                </SimpleTab>
              )}
            </>
          )}
        </div>
      </div>

      {modal?.type === 'teacher-view' && <TeacherModal teacher={modal.teacher} readOnly onClose={closeModal} onSaved={closeAndRefetch} />}
      {modal?.type === 'teacher-edit' && <TeacherModal teacher={modal.teacher} onClose={closeModal} onSaved={closeAndRefetch} />}
      {modal?.type === 'student-view' && <StudentModal student={modal.student} readOnly onClose={closeModal} onSaved={closeAndRefetch} />}
      {modal?.type === 'student-edit' && <StudentModal student={modal.student} onClose={closeModal} onSaved={closeAndRefetch} />}
      {modal?.type === 'course-view' && <CourseModal course={modal.course} onClose={closeModal} readOnly />}
      {modal?.type === 'course-edit' && <CourseModal course={modal.course} onClose={closeModal} />}
      {modal?.type === 'course-create' && <CourseModal course={null} onClose={closeModal} />}
      {modal?.type === 'invoice-create' && <InvoiceCreateModal students={students} classes={classes} onClose={closeModal} />}
      {modal?.type === 'invoice-view' && <InvoiceViewModal invoice={modal.invoice} onClose={closeModal} />}
    </MainLayout>
  );
}

/** Generic page shell for tabs that have no dedicated static mockup (Classes / Invoices / Leads). */
function SimpleTab({ title, subtitle, currentUserFullName, children }) {
  return (
    <div>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500">Quản trị: <strong className="text-[#006d43]">{currentUserFullName}</strong></span>
        </div>
      </header>
      <div className="p-8 space-y-1">
        <p className="text-sm text-gray-500 mb-6 -mt-1">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Dashboard tab — ported from frontend/admin/thong-ke.html                */
/* ---------------------------------------------------------------------- */
function DashboardTab({ stats, students, courses, invoices, recentInvoices, recentActivity, topCourses, revenueByMonth, studentsByMonth, maxRevenue, maxStudents, currentUserFullName, initial }) {
  const monthLabel = new Date().toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
  return (
    <div>
      <header className="h-16 bg-white/80 backdrop-blur-xl px-8 flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex-1 max-w-md">
          <div className="relative flex items-center">
            <span className="absolute left-3 text-gray-400"><IconSearch className="w-4 h-4" /></span>
            <input className="w-full bg-gray-50 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#006d43]/30" placeholder="Tìm kiếm hệ thống..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 relative"><IconBell className="w-6 h-6" /></button>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><IconMail className="w-6 h-6" /></button>
          <div className="h-8 w-px bg-gray-200 mx-2" />
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-gray-900">{currentUserFullName}</div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider">Admin</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#006d43] flex items-center justify-center text-white font-bold text-xs">{initial}</div>
          </div>
        </div>
      </header>

      <main className="p-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl text-gray-900 font-bold">Tổng quan hệ thống</h2>
            <p className="text-gray-500 text-sm">Số liệu thực tế cập nhật theo thời gian thực</p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-[#006d43] text-[20px]">calendar_today</span>
            <span className="font-bold text-sm text-gray-900">Tháng {monthLabel}</span>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Tổng học viên" value={students.length} caption="đang theo học" />
          <StatCard label="Tổng khóa học" value={stats.totalCourses ?? courses.length} caption="trên hệ thống" />
          <StatCard label="Doanh thu đã thu" value={money(stats.totalPayments || 0)} caption="tổng cộng" big />
          <StatCard label="Tổng hóa đơn" value={stats.totalInvoices ?? invoices.length} caption="đã phát hành" />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="mb-4">
              <h4 className="text-[16px] text-gray-900 font-bold">Doanh thu 6 tháng gần đây</h4>
              <p className="text-[10px] text-gray-500">(đơn vị: đồng, chỉ tính hóa đơn đã thanh toán)</p>
            </div>
            <div className="h-28 flex items-end justify-between gap-3 px-2">
              {revenueByMonth.map((b, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 w-full">
                  <span className="text-[10px] text-gray-400 font-semibold">{b.total > 0 ? `${Math.round(b.total / 1000)}k` : ''}</span>
                  <div className="w-full bg-[#006d43]/15 rounded-t-sm hover:bg-[#006d43] transition-all" style={{ height: `${Math.max(4, (b.total / maxRevenue) * 100)}%` }} />
                  <span className="text-[11px] text-gray-400">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="mb-4">
              <h4 className="text-[16px] text-gray-900 font-bold">Học viên mới</h4>
              <p className="text-[10px] text-gray-500">(6 tháng gần đây)</p>
            </div>
            <div className="h-28 flex items-end justify-between gap-2 px-2">
              {studentsByMonth.map((b, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 w-full">
                  <span className="text-[10px] text-gray-400 font-semibold">{b.count > 0 ? b.count : ''}</span>
                  <div className="w-full bg-[#006d43]/15 rounded-t-sm hover:bg-[#006d43] transition-all" style={{ height: `${Math.max(4, (b.count / maxStudents) * 100)}%` }} />
                  <span className="text-[11px] text-gray-400">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom lists */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h4 className="text-[18px] text-gray-900 mb-4 font-bold">Khóa học nổi bật</h4>
            <div className="space-y-4">
              {topCourses.map((c, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    {c.ImageUrl ? <img className="w-full h-full object-cover rounded-lg" src={c.ImageUrl} alt={c.Title} /> : (
                      <div className="w-full h-full rounded-lg flex items-center justify-center bg-[#e6f7ef] text-[#006d43]"><span className="material-symbols-outlined text-[20px]">menu_book</span></div>
                    )}
                    <span className="absolute -top-2 -left-2 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-sm text-gray-900 truncate">{c.Title}</h5>
                    <p className="text-xs text-gray-500">{c.TotalLessons ?? '—'} buổi học</p>
                  </div>
                  <p className="text-sm font-bold text-[#006d43]">{money(c.BasePrice)}</p>
                </div>
              ))}
              {topCourses.length === 0 && <p className="text-sm text-gray-400 italic">Chưa có khóa học nào.</p>}
            </div>
          </div>
          <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h4 className="text-[18px] text-gray-900 mb-4 font-bold">Hoạt động gần đây</h4>
            <div className="space-y-5">
              {recentActivity.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'student' ? 'bg-[#e6f7ef] text-[#006d43]' : item.type === 'invoice' ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'}`}>
                    <span className="material-symbols-outlined text-[20px]">{item.type === 'student' ? 'person_add' : item.type === 'invoice' ? 'payments' : 'smart_toy'}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">{item.text}</p>
                    <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tight">{relativeTime(item.date)}</p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && <p className="text-sm text-gray-400 italic">Chưa có hoạt động nào gần đây.</p>}
            </div>
          </div>
          <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col">
            <h4 className="text-[18px] text-gray-900 mb-4 font-bold">Hóa đơn mới nhất</h4>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-[11px] text-gray-400 uppercase tracking-wider">
                  <tr><th className="py-2 px-2 font-bold">Mã HĐ</th><th className="py-2 px-2 font-bold">Học viên</th><th className="py-2 px-2 font-bold text-right">Số tiền</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentInvoices.map((inv, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-2 text-[#006d43] font-bold text-sm">{inv.InvoiceCode}</td>
                      <td className="py-3 px-2 text-sm text-gray-800">{inv.Student?.FullName}</td>
                      <td className="py-3 px-2 text-right font-bold text-sm">{money(inv.Amount)}</td>
                    </tr>
                  ))}
                  {recentInvoices.length === 0 && <tr><td colSpan="3" className="py-6 text-center text-gray-400 italic text-sm">Chưa có hóa đơn nào.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, caption, big }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-1.5">
      <p className="text-xs text-gray-500">{label}</p>
      <h3 className={`${big ? 'text-[19px]' : 'text-[22px]'} font-bold leading-tight text-gray-900`}>{value}</h3>
      <p className="text-[10px] text-gray-400 italic">{caption}</p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Courses tab — ported from frontend/admin/quan-ly-khoa-hoc.html          */
/* ---------------------------------------------------------------------- */
const COURSE_STATUS = {
  0: { label: 'Nháp', className: 'text-orange-600 bg-orange-50', dot: 'bg-orange-600' },
  1: { label: 'Đang mở', className: 'text-green-600 bg-green-50', dot: 'bg-green-600' },
  2: { label: 'Lưu trữ', className: 'text-slate-500 bg-slate-100', dot: 'bg-slate-500' },
};

function CoursesTab({ search, allCourses, classes, currentUserFullName, onCreate, onView, onEdit, onDelete }) {
  const pagedCourses = search.paged;
  return (
    <div className="flex flex-col">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        <div className="relative w-1/3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch className="w-4 h-4" /></span>
          <input className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-[#006d43] focus:border-[#006d43]" placeholder="Tìm kiếm khóa học, giảng viên, học viên..." type="text" value={search.query} onChange={(e) => search.setQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onCreate} className="bg-[#006d43] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-[#00512f]"><IconPlus className="w-4 h-4" /> Thêm khóa học</button>
          <button className="text-gray-500"><IconBell className="w-6 h-6" /></button>
          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <div className="w-10 h-10 rounded-full bg-[#006d43] text-white flex items-center justify-center font-bold">{initials(currentUserFullName)}</div>
            <div className="text-left">
              <p className="text-sm font-semibold">{currentUserFullName}</p>
              <p className="text-xs text-gray-500">Quản trị viên</p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý khóa học</h2>
          <p className="text-sm text-gray-500">Quản lý, thêm mới và cập nhật các khóa học trên hệ thống</p>
        </div>

        <div className="grid grid-cols-4 gap-4" data-purpose="summary-stats" />

        <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch className="w-4 h-4" /></span>
            <input className="w-full pl-10 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-[#006d43]" placeholder="Tìm kiếm khóa học..." type="text" value={search.query} onChange={(e) => search.setQuery(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Danh mục</label>
              <select className="py-1.5 px-3 border-gray-200 rounded-lg text-sm min-w-[120px] focus:ring-[#006d43]"><option>Tất cả</option></select>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Trạng thái</label>
              <select className="py-1.5 px-3 border-gray-200 rounded-lg text-sm min-w-[120px] focus:ring-[#006d43]"><option>Tất cả</option></select>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Giảng viên</label>
              <select className="py-1.5 px-3 border-gray-200 rounded-lg text-sm min-w-[120px] focus:ring-[#006d43]"><option>Tất cả</option></select>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Sắp xếp</label>
              <select className="py-1.5 px-3 border-gray-200 rounded-lg text-sm min-w-[120px] focus:ring-[#006d43]"><option>Mới nhất</option></select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Khóa học</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Giảng viên</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Học viên</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Giá</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cập nhật</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedCourses.map((c, idx) => {
                const st = COURSE_STATUS[c.Status] || COURSE_STATUS[0];
                const courseClasses = classes.filter((cls) => cls.CourseId === c.Id);
                const teacherNames = [...new Set(courseClasses.map((cls) => cls.Teacher?.FullName).filter(Boolean))];
                const capacity = courseClasses.reduce((s, cls) => s + (cls.MaxStudents || 0), 0);
                const category = (Array.isArray(c.MetadataTags) ? c.MetadataTags[0] : c.MetadataTags) || 'Chung';
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {c.ImageUrl ? <img alt={c.Title} className="w-12 h-12 rounded-lg object-cover" src={c.ImageUrl} /> : (
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#e6f7ef] text-[#006d43]"><span className="material-symbols-outlined text-[20px]">menu_book</span></div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-snug">{c.Title}</p>
                          <p className="text-[11px] text-gray-400">ID: {c.CourseCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 text-[11px] font-semibold rounded ${hashColor(category)}`}>{category}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#006d43] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{initials(teacherNames[0])}</div>
                        <span className="text-sm">{teacherNames.length ? teacherNames.join(', ') : 'Chưa phân công'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="flex items-center gap-1"><IconUsers className="w-3.5 h-3.5 text-gray-400" /><span className="text-sm">{capacity || '—'}</span></div></td>
                    <td className="px-6 py-4 text-sm font-semibold">{money(c.BasePrice)}</td>
                    <td className="px-6 py-4"><span className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full w-fit ${st.className}`}><span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /> {st.label}</span></td>
                    <td className="px-6 py-4 text-xs text-gray-500">{vnDate(c.UpdatedAt || c.CreatedAt)}<br />{new Date(c.UpdatedAt || c.CreatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => onView(c)} className="text-gray-400 hover:text-blue-500" title="Xem"><IconEye /></button>
                        <button onClick={() => onEdit(c)} className="text-gray-400 hover:text-green-500" title="Sửa"><IconEdit /></button>
                        <button onClick={() => onDelete(c)} className="text-gray-400 hover:text-red-500" title="Xóa"><IconTrash /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {search.total === 0 && <tr><td colSpan="8" className="p-8 text-center text-gray-400 italic">Không tìm thấy khóa học phù hợp.</td></tr>}
            </tbody>
          </table>
          <Pager page={search.page} setPage={search.setPage} totalPages={search.totalPages} total={search.total} pageSize={PAGE_SIZE} activeClass="bg-[#006d43] text-white" />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Teachers tab — ported from frontend/admin/quan-ly-gv.html               */
/* ---------------------------------------------------------------------- */
function TeachersTab({ search, teacherKpiMap, teacherClassesMap, teacherRevenueMap, currentUserFullName, onCreate, onView, onEdit, onToggleStatus, onDelete }) {
  return (
    <div className="flex flex-col min-w-0">
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
        <div className="max-w-md w-full relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><IconSearch className="w-5 h-5" /></span>
          <input className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#006d43] focus:bg-white text-sm" placeholder="Tìm kiếm giảng viên..." type="text" value={search.query} onChange={(e) => search.setQuery(e.target.value)} />
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onCreate} className="bg-[#006d43] hover:bg-[#00512f] text-white px-4 py-2 rounded-lg font-semibold flex items-center text-sm transition-colors"><span className="mr-2 text-lg">+</span> Thêm giảng viên</button>
          <div className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full cursor-pointer">
            <IconBell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">2</span>
          </div>
          <div className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full cursor-pointer">
            <IconMail className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">5</span>
          </div>
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 leading-none">{currentUserFullName}</p>
              <p className="text-xs text-gray-500 mt-1">Quản trị viên</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#006d43] text-white flex items-center justify-center font-bold border border-gray-200">{initials(currentUserFullName)}</div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900">Quản lý giảng viên</h2>
          <p className="text-gray-500 text-sm mt-1">Quản lý thông tin và hiệu suất giảng viên trên hệ thống</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <select className="border-gray-200 rounded-xl text-sm focus:ring-[#006d43] focus:border-[#006d43] bg-white"><option>Tất cả trạng thái</option></select>
            <select className="border-gray-200 rounded-xl text-sm focus:ring-[#006d43] focus:border-[#006d43] bg-white"><option>Tất cả chuyên môn</option></select>
            <select className="border-gray-200 rounded-xl text-sm focus:ring-[#006d43] focus:border-[#006d43] bg-white"><option>Sắp xếp: Mới nhất</option></select>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><IconSearch className="w-4 h-4" /></span>
              <input className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#006d43]" placeholder="Tìm kiếm..." type="text" value={search.query} onChange={(e) => search.setQuery(e.target.value)} />
            </div>
            <button className="p-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50"><IconFilter className="w-5 h-5 text-gray-500" /></button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[11px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Giảng viên</th>
                <th className="px-6 py-4">Chuyên môn</th>
                <th className="px-6 py-4">Khóa học</th>
                <th className="px-6 py-4">Học viên</th>
                <th className="px-6 py-4">Doanh thu</th>
                <th className="px-6 py-4">Đánh giá</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {search.paged.map((t, idx) => {
                const kpi = teacherKpiMap[t.Id] || {};
                const tClasses = teacherClassesMap[t.Id] || [];
                const courseCount = new Set(tClasses.map((c) => c.CourseId)).size;
                const capacity = tClasses.reduce((s, c) => s + (c.MaxStudents || 0), 0);
                const revenue = teacherRevenueMap[t.Id] || 0;
                const subject = t.Profile?.Subject || 'Chưa cập nhật';
                const isActive = t.Status === 0;
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#006d43] text-white flex items-center justify-center font-bold shrink-0">{initials(t.FullName)}</div>
                        <div>
                          <p className="font-bold text-gray-900">{t.FullName}</p>
                          <p className="text-xs text-gray-500">{t.Email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${hashColor(subject)}`}>{subject}</span></td>
                    <td className="px-6 py-4 font-medium text-gray-700">{courseCount}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{capacity}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{money(revenue)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-yellow-400">
                        <IconStar className="w-4 h-4 fill-current" />
                        <span className="ml-1 text-gray-700 font-bold">{kpi.AvgClassAttendance != null ? (kpi.AvgClassAttendance * 5).toFixed(1) : '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${isActive ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>{isActive ? 'Hoạt động' : 'Không hoạt động'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => onView(t)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500" title="Xem"><IconEye className="w-4 h-4" /></button>
                        <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500" title="Sửa"><IconPencilBox className="w-4 h-4" /></button>
                        <RowMenu items={[
                          { label: isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản', onClick: () => onToggleStatus(t) },
                          { label: 'Xóa giảng viên', danger: true, onClick: () => onDelete(t) },
                        ]} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {search.total === 0 && <tr><td colSpan="8" className="p-8 text-center text-gray-400 italic">Không tìm thấy giảng viên phù hợp.</td></tr>}
            </tbody>
          </table>
          <Pager page={search.page} setPage={search.setPage} totalPages={search.totalPages} total={search.total} pageSize={PAGE_SIZE} activeClass="bg-[#e6f7ef] text-[#00512f]" />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Students tab — ported from frontend/admin/quan-ly-hv.html               */
/* ---------------------------------------------------------------------- */
function StudentsTab({ search, studentKpiMap, studentSpendMap, currentUserFullName, onCreate, onView, onEdit, onToggleStatus, onDelete }) {
  return (
    <div className="flex flex-col min-w-0">
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
        <div className="flex items-center flex-1 max-w-xl relative">
          <span className="absolute left-3 text-gray-400"><IconSearch className="w-5 h-5" /></span>
          <input className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#006d43]" placeholder="Tìm kiếm học viên..." type="text" value={search.query} onChange={(e) => search.setQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 text-[#006d43] border border-[#cbe8da] bg-[#e6f7ef] rounded-lg text-sm font-medium hover:bg-[#d3ecdf] transition-colors"><IconDownload className="w-4 h-4" /> Xuất Excel</button>
          <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2 bg-[#006d43] text-white rounded-lg text-sm font-medium hover:bg-[#00512f] transition-colors shadow-sm"><IconPlus className="w-4 h-4" /> Thêm học viên</button>
          <button className="p-2 text-gray-400 hover:text-gray-600"><IconMenu className="w-6 h-6" /></button>
        </div>
      </header>

      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Quản lý học viên</h1>
          <p className="text-gray-500 text-sm">Quản lý thông tin và quá trình học tập của học viên</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:ring-[#006d43] focus:border-[#006d43] min-w-[160px]"><option>Tất cả trạng thái</option></select>
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:ring-[#006d43] focus:border-[#006d43] min-w-[160px]"><option>Tất cả khóa học</option></select>
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:ring-[#006d43] focus:border-[#006d43] min-w-[160px]"><option>Sắp xếp: Mới nhất</option></select>
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch className="w-4 h-4" /></span>
            <input className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-[#006d43] focus:border-[#006d43]" placeholder="Tìm kiếm..." type="text" value={search.query} onChange={(e) => search.setQuery(e.target.value)} />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"><IconFilter className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Học viên</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email / SĐT</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Khóa học đã mua</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiến độ học</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Tổng chi tiêu</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {search.paged.map((s, idx) => {
                  const kpi = studentKpiMap[s.Id] || {};
                  const progress = kpi.CompletionRate != null ? Math.round(kpi.CompletionRate * 100) : 0;
                  const enrolledCount = s.ClassEnrollments?.length ?? 0;
                  const spend = studentSpendMap[s.Id] || 0;
                  const isActive = s.Status === 0;
                  return (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#006d43] text-white flex items-center justify-center font-bold border border-gray-200 shrink-0">{initials(s.FullName)}</div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{s.FullName}</div>
                            <div className="text-xs text-gray-400">Tham gia {vnDate(s.CreatedAt)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{s.Phone || '—'}</div>
                        <div className="text-xs text-gray-400">{s.Email}</div>
                      </td>
                      <td className="px-6 py-4"><span className="text-sm text-gray-600">{enrolledCount} khóa học</span></td>
                      <td className="px-6 py-4">
                        <div className="w-full max-w-[120px]">
                          <div className="flex items-center justify-between mb-1"><span className="text-xs font-medium text-gray-600">{progress}%</span></div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-[#006d43] h-1.5 rounded-full" style={{ width: `${progress}%` }} /></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right"><span className="text-sm font-medium text-gray-900">{money(spend)}</span></td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>{isActive ? 'Hoạt động' : 'Tạm khóa'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-gray-400">
                          <button onClick={() => onView(s)} className="p-1 hover:text-emerald-600" title="Xem"><IconEye className="w-5 h-5" /></button>
                          <button onClick={() => onEdit(s)} className="p-1 hover:text-blue-600" title="Sửa"><IconPencilBox className="w-5 h-5" /></button>
                          <RowMenu items={[
                            { label: isActive ? 'Tạm khóa tài khoản' : 'Mở khóa tài khoản', onClick: () => onToggleStatus(s) },
                            { label: 'Xóa học viên', danger: true, onClick: () => onDelete(s) },
                          ]} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {search.total === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-400 italic">Không tìm thấy học viên phù hợp.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pager page={search.page} setPage={search.setPage} totalPages={search.totalPages} total={search.total} pageSize={PAGE_SIZE} activeClass="bg-[#e6f7ef] text-[#00512f] border border-[#bfe3d1]" />
        </div>
      </div>
    </div>
  );
}
