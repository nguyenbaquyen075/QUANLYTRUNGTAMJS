import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TYPE_LABELS = {
  OPEN_ASSIGNMENT: 'Mở bài cho học viên',
  CLOSE_ASSIGNMENT: 'Đóng bài (hết hạn nộp)',
  EXTEND_DUE: 'Gia hạn hạn nộp',
  NOTIFY_NOT_SUBMITTED: 'Nhắc học viên chưa nộp',
  TOGGLE_SECTION: 'Bật/tắt mục trang chủ'
};

const STATUS_STYLE = {
  PENDING: ['Đang chờ', 'bg-[#EAF3FF] text-[#1467E8]'],
  RUNNING: ['Đang chạy', 'bg-amber-50 text-amber-700'],
  DONE: ['Đã chạy', 'bg-emerald-50 text-emerald-700'],
  SKIPPED: ['Bỏ qua', 'bg-slate-100 text-slate-600'],
  FAILED: ['Lỗi', 'bg-red-50 text-red-600'],
  CANCELLED: ['Đã hủy', 'bg-slate-100 text-slate-500']
};

const fmt = (d) => (d ? new Date(d).toLocaleString('vi-VN') : '');

// datetime-local cho giá trị mặc định: 1 giờ nữa, theo giờ máy người dùng.
const defaultRunAt = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const inputCls = 'w-full rounded-xl border border-[#E4EAF2] bg-white px-3 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#1467E8]/30 focus:border-[#1467E8]';

export default function SchedulesPage() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [options, setOptions] = useState({ assignments: [], sections: [] });
  const [actions, setActions] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'EXTEND_DUE', assignmentId: '', runAt: defaultRunAt(), addHours: 24, minPercent: '', message: '', sectionKey: '', sectionValue: 'false'
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const load = useCallback(async () => {
    try {
      const [o, l] = await Promise.all([api.get('/api/Schedules/Options'), api.get('/api/Schedules')]);
      setOptions({ assignments: o.data.assignments || [], sections: o.data.sections || [] });
      setActions(l.data.actions || []);
    } catch (e) {
      setError('Không tải được dữ liệu. Bạn cần đăng nhập bằng tài khoản giáo viên hoặc admin.');
    }
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  const isSection = form.type === 'TOGGLE_SECTION';
  const typeChoices = useMemo(() => Object.entries(TYPE_LABELS).filter(([k]) => isAdmin || k !== 'TOGGLE_SECTION'), [isAdmin]);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setNotice('');
    const payload = isSection
      ? { key: form.sectionKey, value: form.sectionValue === 'true' }
      : { assignmentId: Number(form.assignmentId) };
    if (form.type === 'EXTEND_DUE') {
      payload.addHours = Number(form.addHours);
      if (form.minPercent !== '') payload.minNotSubmittedPercent = Number(form.minPercent);
    }
    if (form.type === 'NOTIFY_NOT_SUBMITTED' && form.message.trim()) payload.message = form.message.trim();
    setSaving(true);
    try {
      await api.post('/api/Schedules', { type: form.type, runAt: new Date(form.runAt).toISOString(), payload });
      setNotice('Đã tạo lịch hẹn. Hệ thống sẽ tự chạy đúng giờ.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Không tạo được lịch hẹn.');
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id) => {
    try { await api.post(`/api/Schedules/${id}/Cancel`); load(); }
    catch (err) { setError(err.response?.data?.message || 'Không hủy được.'); }
  };

  const describe = (a) => {
    const p = a.payload;
    if (a.type === 'TOGGLE_SECTION') return `${options.sections.find((s) => s.key === p.key)?.label || p.key} → ${p.value ? 'Bật' : 'Tắt'}`;
    const extra = a.type === 'EXTEND_DUE' ? ` +${p.addHours}h${p.minNotSubmittedPercent !== undefined ? ` nếu ≥${p.minNotSubmittedPercent}% chưa nộp` : ''}` : '';
    return `${a.assignmentTitle || `Bài #${p.assignmentId}`}${extra}`;
  };

  if (!authLoading && user && !['ADMIN', 'TEACHER'].includes(user.role)) {
    return <MainLayout><div className="p-10 text-center text-slate-600">Chỉ giáo viên và admin được dùng tính năng này.</div></MainLayout>;
  }

  return (
    <MainLayout hideChatbot>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to={isAdmin ? '/Admin/Dashboard' : '/Teacher/Dashboard'} className="text-sm text-[#1467E8] font-semibold hover:underline">← Quay lại bảng điều khiển</Link>
          <h1 className="text-2xl font-black text-[#172B4D] mt-2">Hẹn giờ tự động</h1>
          <p className="text-sm text-[#60708A]">Đặt trước việc mở bài, đóng bài, gia hạn và nhắc nộp. Đến giờ hệ thống tự chạy, quá hạn học viên không nộp được cho đến khi gia hạn.</p>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3">{error}</div>}
        {notice && <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3">{notice}</div>}

        <form onSubmit={submit} className="bg-white rounded-2xl border border-[#E4EAF2] p-5 grid gap-4 sm:grid-cols-2 mb-8 shadow-sm">
          <label className="text-sm font-semibold text-[#172B4D]">Việc cần làm
            <select className={`${inputCls} mt-1`} value={form.type} onChange={set('type')}>
              {typeChoices.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-[#172B4D]">Chạy lúc
            <input type="datetime-local" required className={`${inputCls} mt-1`} value={form.runAt} onChange={set('runAt')} />
          </label>

          {!isSection ? (
            <label className="text-sm font-semibold text-[#172B4D] sm:col-span-2">Bài tập / bài kiểm tra
              <select required className={`${inputCls} mt-1`} value={form.assignmentId} onChange={set('assignmentId')}>
                <option value="">— Chọn bài —</option>
                {options.assignments.map((a) => <option key={a.id} value={a.id}>{a.title} · {a.className} · hạn {fmt(a.dueDate)}</option>)}
              </select>
            </label>
          ) : (
            <>
              <label className="text-sm font-semibold text-[#172B4D]">Mục trang chủ
                <select required className={`${inputCls} mt-1`} value={form.sectionKey} onChange={set('sectionKey')}>
                  <option value="">— Chọn mục —</option>
                  {options.sections.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-[#172B4D]">Chuyển sang
                <select className={`${inputCls} mt-1`} value={form.sectionValue} onChange={set('sectionValue')}>
                  <option value="false">Tắt (ẩn)</option>
                  <option value="true">Bật (hiện)</option>
                </select>
              </label>
            </>
          )}

          {form.type === 'EXTEND_DUE' && (
            <>
              <label className="text-sm font-semibold text-[#172B4D]">Gia hạn thêm (giờ)
                <input type="number" min="1" max="720" required className={`${inputCls} mt-1`} value={form.addHours} onChange={set('addHours')} />
              </label>
              <label className="text-sm font-semibold text-[#172B4D]">Chỉ gia hạn nếu ≥ … % chưa nộp <span className="font-normal text-[#60708A]">(để trống = luôn gia hạn)</span>
                <input type="number" min="0" max="100" className={`${inputCls} mt-1`} value={form.minPercent} onChange={set('minPercent')} />
              </label>
            </>
          )}
          {form.type === 'NOTIFY_NOT_SUBMITTED' && (
            <label className="text-sm font-semibold text-[#172B4D] sm:col-span-2">Nội dung nhắc <span className="font-normal text-[#60708A]">(để trống = dùng câu mặc định)</span>
              <input maxLength={300} className={`${inputCls} mt-1`} value={form.message} onChange={set('message')} />
            </label>
          )}

          <div className="sm:col-span-2">
            <button disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#1467E8] hover:bg-[#0B57D0] text-white text-sm font-bold disabled:opacity-60">
              {saving ? 'Đang lưu…' : 'Tạo lịch hẹn'}
            </button>
          </div>
        </form>

        <h2 className="text-lg font-black text-[#172B4D] mb-3">Danh sách lịch hẹn</h2>
        <div className="bg-white rounded-2xl border border-[#E4EAF2] overflow-hidden shadow-sm">
          {actions.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#60708A]">Chưa có lịch hẹn nào.</div>
          ) : (
            <ul className="divide-y divide-[#E4EAF2]">
              {actions.map((a) => {
                const [label, cls] = STATUS_STYLE[a.status] || [a.status, 'bg-slate-100 text-slate-600'];
                return (
                  <li key={a.id} className="px-5 py-4 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[220px]">
                      <div className="text-sm font-bold text-[#172B4D]">{TYPE_LABELS[a.type] || a.type}</div>
                      <div className="text-sm text-[#60708A]">{describe(a)}</div>
                      {a.result && <div className="text-xs text-[#60708A] mt-1">{a.result}</div>}
                    </div>
                    <div className="text-xs text-[#60708A] whitespace-nowrap">{fmt(a.runAt)}</div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>
                    {a.status === 'PENDING' && (
                      <button onClick={() => cancel(a.id)} className="text-xs font-bold text-red-600 hover:underline">Hủy</button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
