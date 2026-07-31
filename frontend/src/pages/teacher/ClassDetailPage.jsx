import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import api from '../../services/api';

const TABS = [
  { key: 'overview', label: 'Tổng quan', icon: 'dashboard' },
  { key: 'lessons', label: 'Buổi học', icon: 'event' },
  { key: 'students', label: 'Học viên', icon: 'groups' },
  { key: 'video', label: 'Video ghi hình', icon: 'smart_display' },
  { key: 'settings', label: 'Cài đặt', icon: 'settings' }
];

const STUDENT_STATUS_LABEL = { 0: 'Đang học', 1: 'Đã rời lớp', 2: 'Bảo lưu', 3: 'Bị chặn', 4: 'Đã loại khỏi lớp' };
const STUDENT_STATUS_COLOR = { 0: 'emerald', 1: 'slate', 2: 'amber', 3: 'red', 4: 'red' };
const LESSON_STATUS_LABEL = { 0: 'Sắp diễn ra', 1: 'Đang diễn ra', 2: 'Đã hoàn thành', 3: 'Đã huỷ' };
const LESSON_STATUS_COLOR = { 0: 'amber', 1: 'sky', 2: 'emerald', 3: 'red' };
const CLASS_STATUS_LABEL = { 0: 'Sắp khai giảng', 1: 'Đang diễn ra', 2: 'Đã kết thúc' };
const CLASS_STATUS_COLOR = { 0: 'amber', 1: 'emerald', 2: 'slate' };

const AUDIT_META = {
  UPDATE_CLASS_INFO: { icon: 'edit', color: 'sky' },
  ADD_MAKEUP_LESSON: { icon: 'event_available', color: 'emerald' },
  CANCEL_LESSON: { icon: 'event_busy', color: 'red' },
  RESCHEDULE_LESSON: { icon: 'schedule', color: 'amber' },
  TRANSFER_STUDENT: { icon: 'sync_alt', color: 'violet' },
  BLOCK_STUDENT: { icon: 'block', color: 'amber' },
  UNBLOCK_STUDENT: { icon: 'lock_open', color: 'emerald' },
  KICK_STUDENT: { icon: 'person_remove', color: 'red' },
  CLONE_CLASS: { icon: 'content_copy', color: 'sky' }
};
const DEFAULT_AUDIT_META = { icon: 'history', color: 'slate' };

const DOT_COLORS = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
  slate: 'bg-slate-400'
};

const BADGE_COLORS = {
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  sky: 'bg-sky-50 text-sky-600',
  violet: 'bg-violet-50 text-violet-600',
  slate: 'bg-slate-100 text-slate-500',
  primary: 'bg-primary/10 text-primary'
};

function IconBadge({ color = 'primary', icon, size = 'w-14 h-14', iconSize = 'text-[28px]' }) {
  return (
    <div className={`${size} rounded-2xl ${BADGE_COLORS[color] || BADGE_COLORS.primary} flex items-center justify-center shrink-0`}>
      <span className={`material-symbols-outlined ${iconSize}`}>{icon}</span>
    </div>
  );
}

function StatusDot({ color = 'slate', children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
      <span className={`w-2 h-2 rounded-full shrink-0 ${DOT_COLORS[color] || DOT_COLORS.slate}`} />
      {children}
    </span>
  );
}

function Avatar({ name, size = 'w-9 h-9' }) {
  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <div className={`${size} rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm`}>
      {initial}
    </div>
  );
}

function MiniBarChart({ data, valueKey, labelKey, color = 'bg-primary', formatValue }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-slate-400 py-10 text-center">Chưa có dữ liệu để hiển thị.</div>;
  }
  return (
    <div className="flex items-end gap-2 h-32 px-1">
      {data.map((d, i) => {
        const raw = d[valueKey];
        const pct = raw === null || raw === undefined ? 0 : Math.round(raw * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0 group">
            <span className="text-[10px] font-bold text-slate-500">{raw === null || raw === undefined ? '—' : `${pct}%`}</span>
            <div className="w-full rounded-t-md bg-slate-100 flex items-end" style={{ height: '80px' }}>
              <div className={`w-full rounded-t-md ${color} transition-all`} style={{ height: `${Math.max(pct, raw ? 4 : 0)}%` }} />
            </div>
            <span className="text-[9px] text-slate-400 truncate max-w-full" title={d[labelKey]}>{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="font-serif font-bold text-lg text-slate-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, refetch } = useFetchData(`/Teacher/ClassDetail/${id}`);

  const cls = data?.Class || null;
  const students = data?.students || [];
  const lessons = data?.lessons || [];
  const stats = data?.stats || {};
  const warnings = data?.warnings || [];
  const siblingClasses = data?.siblingClasses || [];
  const auditLog = data?.auditLog || [];
  const videoLessons = data?.videoLessons || [];

  const [activeTab, setActiveTab] = useState('overview');
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // ==================== Edit class info ====================
  const [editInfo, setEditInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ description: '', schedule: '', meetingUrl: '' });
  const openEditInfo = () => {
    setInfoForm({ description: cls?.Description || '', schedule: cls?.Schedule || '[]', meetingUrl: cls?.MeetingUrl || '' });
    setEditInfo(true);
  };
  const submitEditInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/Teacher/UpdateClassInfo', { classId: id, description: infoForm.description, schedule: infoForm.schedule, meetingUrl: infoForm.meetingUrl });
      setEditInfo(false);
      refetch();
    } catch (err) {
      alert('Lỗi khi cập nhật thông tin lớp học.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== Add makeup lesson ====================
  const [makeupModal, setMakeupModal] = useState(null); // { forLessonId }
  const [makeupForm, setMakeupForm] = useState({ title: '', lessonDate: '', startTime: '', endTime: '', meetingUrl: '', applyTo: 'all' });
  const openMakeupModal = (forLesson) => {
    setMakeupForm({
      title: forLesson ? `Bù: ${forLesson.Title}` : '',
      lessonDate: '',
      startTime: '',
      endTime: '',
      meetingUrl: cls?.MeetingUrl || '',
      applyTo: 'all'
    });
    setMakeupModal({ forLessonId: forLesson ? forLesson.Id : null });
  };
  const submitMakeup = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/Teacher/AddMakeupLesson', {
        classId: id,
        title: makeupForm.title,
        lessonDate: makeupForm.lessonDate,
        startTime: makeupForm.startTime,
        endTime: makeupForm.endTime,
        meetingUrl: makeupForm.meetingUrl,
        makeupOfLessonId: makeupModal.forLessonId,
        applyTo: makeupForm.applyTo
      });
      setMakeupModal(null);
      refetch();
    } catch (err) {
      alert('Lỗi khi thêm buổi học bù.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== Cancel lesson ====================
  const [cancelModal, setCancelModal] = useState(null); // lesson
  const [cancelReason, setCancelReason] = useState('');
  const submitCancel = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/Teacher/CancelLesson', { lessonId: cancelModal.Id, reason: cancelReason });
      const cancelledLesson = cancelModal;
      setCancelModal(null);
      setCancelReason('');
      refetch();
      if (res.data?.suggestMakeup && window.confirm('Đã huỷ buổi học. Bạn có muốn tạo ngay 1 buổi học bù thay thế không?')) {
        openMakeupModal(cancelledLesson);
      }
    } catch (err) {
      alert('Lỗi khi huỷ buổi học.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== Reschedule lesson ====================
  const [rescheduleModal, setRescheduleModal] = useState(null); // lesson
  const [rescheduleForm, setRescheduleForm] = useState({ lessonDate: '', startTime: '', endTime: '', meetingUrl: '' });
  const openReschedule = (lesson) => {
    setRescheduleForm({
      lessonDate: new Date(lesson.LessonDate).toISOString().slice(0, 10),
      startTime: (lesson.StartTime || '').slice(0, 5),
      endTime: (lesson.EndTime || '').slice(0, 5),
      meetingUrl: lesson.MeetingUrl || ''
    });
    setRescheduleModal(lesson);
  };
  const submitReschedule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/Teacher/RescheduleLesson', { lessonId: rescheduleModal.Id, ...rescheduleForm });
      setRescheduleModal(null);
      refetch();
    } catch (err) {
      alert('Lỗi khi đổi lịch buổi học.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== Student note ====================
  const [noteModal, setNoteModal] = useState(null); // student
  const [noteText, setNoteText] = useState('');
  const openNote = (s) => {
    setNoteText(s.Note || '');
    setNoteModal(s);
  };
  const submitNote = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/Teacher/AddStudentNote', { enrollmentId: noteModal.EnrollmentId, note: noteText });
      setNoteModal(null);
      refetch();
    } catch (err) {
      alert('Lỗi khi lưu ghi chú.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== Transfer student ====================
  const [transferModal, setTransferModal] = useState(null); // student
  const [transferTarget, setTransferTarget] = useState('');
  const submitTransfer = async (e) => {
    e.preventDefault();
    if (!transferTarget) return;
    setSaving(true);
    try {
      await api.post('/Teacher/TransferStudent', { enrollmentId: transferModal.EnrollmentId, targetClassId: transferTarget });
      setTransferModal(null);
      setTransferTarget('');
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi chuyển lớp.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== Block / Unblock ====================
  const [blockModal, setBlockModal] = useState(null); // student
  const [blockReason, setBlockReason] = useState('');
  const submitBlock = async (e) => {
    e.preventDefault();
    if (!blockReason.trim()) return;
    setSaving(true);
    try {
      await api.post('/Teacher/BlockStudent', { enrollmentId: blockModal.EnrollmentId, reason: blockReason });
      setBlockModal(null);
      setBlockReason('');
      refetch();
    } catch (err) {
      alert('Lỗi khi chặn học viên.');
    } finally {
      setSaving(false);
    }
  };
  const handleUnblock = async (s) => {
    if (!window.confirm(`Mở lại quyền truy cập cho học viên "${s.FullName}"?`)) return;
    setSaving(true);
    try {
      await api.post('/Teacher/UnblockStudent', { enrollmentId: s.EnrollmentId });
      refetch();
    } catch (err) {
      alert('Lỗi khi mở lại quyền truy cập.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== Kick student (double confirm + mandatory reason) ====================
  const [kickModal, setKickModal] = useState(null); // { student, step }
  const [kickReason, setKickReason] = useState('');
  const submitKickStep1 = (e) => {
    e.preventDefault();
    if (!kickReason.trim()) return;
    setKickModal((m) => ({ ...m, step: 2 }));
  };
  const confirmKickFinal = async () => {
    setSaving(true);
    try {
      await api.post('/Teacher/KickStudent', { enrollmentId: kickModal.student.EnrollmentId, reason: kickReason });
      setKickModal(null);
      setKickReason('');
      refetch();
    } catch (err) {
      alert('Lỗi khi loại học viên khỏi lớp.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== Notify class ====================
  const [notifyModal, setNotifyModal] = useState(false);
  const [notifyForm, setNotifyForm] = useState({ title: '', content: '' });
  const submitNotify = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/Teacher/NotifyClass', { classId: id, title: notifyForm.title, content: notifyForm.content });
      alert(res.data?.message || 'Đã gửi thông báo.');
      setNotifyModal(false);
      setNotifyForm({ title: '', content: '' });
    } catch (err) {
      alert('Lỗi khi gửi thông báo.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== Clone class ====================
  const [cloneModal, setCloneModal] = useState(false);
  const [cloneForm, setCloneForm] = useState({ className: '', startDate: '', endDate: '' });
  const submitClone = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/Teacher/CloneClass', { classId: id, ...cloneForm });
      alert(res.data?.message || 'Đã tạo lớp mới.');
      setCloneModal(false);
      if (res.data?.classId) navigate(`/Teacher/ClassDetail/${res.data.classId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi nhân bản lớp.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== Export ====================
  const handleExport = async (type) => {
    try {
      const res = await api.get(`/Teacher/ExportClass${type}/${id}`, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `danh-sach-lop.${type === 'Excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Lỗi khi xuất file.');
    }
  };

  // ==================== Video access (mở quyền xem cho học viên bị khoá) ====================
  const [grantingKey, setGrantingKey] = useState(null);
  const handleGrantVideoAccess = async (lessonId, studentId) => {
    const key = `${lessonId}-${studentId}`;
    setGrantingKey(key);
    try {
      await api.post('/Teacher/GrantVideoAccess', { lessonId, studentId, grant: true });
      refetch();
    } catch (err) {
      alert('Lỗi khi mở quyền xem video.');
    } finally {
      setGrantingKey(null);
    }
  };

  const [studentFilter, setStudentFilter] = useState('all');
  const filteredStudents = studentFilter === 'all' ? students : students.filter((s) => String(s.Status) === studentFilter);

  const formatTime = (t) => (t || '').slice(0, 5);

  return (
    <MainLayout hideHeader={false}>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-6 select-none text-slate-800">
        <div>
          <Link to="/Teacher/Dashboard" className="inline-flex items-center gap-1 text-slate-400 hover:text-primary transition-all text-xs font-bold">
            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            Quay lại Lịch dạy học
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
          </div>
        ) : !cls ? (
          <div className="text-center py-10 text-slate-500 font-semibold">Không tìm thấy lớp học hoặc bạn không có quyền truy cập.</div>
        ) : (
          <div className="space-y-6">
            {/* ===== Header ===== */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <IconBadge color="primary" icon="school" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 font-serif">{cls.ClassName}</h1>
                    <StatusDot color={CLASS_STATUS_COLOR[cls.Status]}>{CLASS_STATUS_LABEL[cls.Status]}</StatusDot>
                  </div>
                  <p className="text-sm text-slate-500 font-semibold mt-1">Khoá học: {cls.Course?.Title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setNotifyModal(true)} className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-hover shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">campaign</span>
                  Gửi thông báo
                </button>
                <div className="relative">
                  <button
                    onClick={() => setMoreMenuOpen((v) => !v)}
                    className="w-10 h-10 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 inline-flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                  </button>
                  {moreMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMoreMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
                        <button onClick={() => { setMoreMenuOpen(false); handleExport('Excel'); }} className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-slate-400">grid_on</span>
                          Xuất danh sách Excel
                        </button>
                        <button onClick={() => { setMoreMenuOpen(false); handleExport('Pdf'); }} className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-slate-400">picture_as_pdf</span>
                          Xuất danh sách PDF
                        </button>
                        <button
                          onClick={() => { setMoreMenuOpen(false); setCloneForm({ className: `${cls.ClassName} (Bản sao)`, startDate: '', endDate: '' }); setCloneModal(true); }}
                          className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px] text-slate-400">content_copy</span>
                          Nhân bản lớp
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ===== Warnings ===== */}
            {warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                <IconBadge color="amber" icon="warning" size="w-10 h-10" iconSize="text-[20px]" />
                <div>
                  <h3 className="text-sm font-bold text-amber-800 mb-1.5">Cảnh báo lớp học ({warnings.length})</h3>
                  <ul className="space-y-1">
                    {warnings.map((w, i) => (
                      <li key={i} className="text-sm text-amber-700 font-semibold">{w.StudentName}: {w.Detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ===== Quick stats ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                <IconBadge color="sky" icon="groups" />
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">{stats.studentCount ?? 0}</div>
                  <div className="text-sm font-semibold text-slate-500 mt-1.5">Học viên đang học</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                <IconBadge color="emerald" icon="event_available" />
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">{((stats.avgAttendanceRate ?? 1) * 100).toFixed(0)}%</div>
                  <div className="text-sm font-semibold text-slate-500 mt-1.5">Tỉ lệ đi học trung bình</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                <IconBadge color="violet" icon="task_alt" />
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">{((stats.onTimeSubmissionRate ?? 1) * 100).toFixed(0)}%</div>
                  <div className="text-sm font-semibold text-slate-500 mt-1.5">Tỉ lệ nộp bài đúng hạn</div>
                </div>
              </div>
            </div>

            {/* ===== Tabs ===== */}
            <div className="bg-slate-100 rounded-full p-1 inline-flex gap-1 flex-wrap">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-4 py-2 text-sm font-bold rounded-full transition-colors inline-flex items-center gap-1.5 ${activeTab === t.key ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ============ TAB: Tổng quan ============ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-emerald-500">show_chart</span>
                      Tỉ lệ chuyên cần theo buổi (đã khoá điểm danh)
                    </h3>
                    <MiniBarChart data={stats.attendanceTrend} valueKey="Rate" labelKey="Title" color="bg-emerald-500" />
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-sky-500">show_chart</span>
                      Tỉ lệ nộp bài đúng hạn theo bài tập
                    </h3>
                    <MiniBarChart data={stats.submissionTrend} valueKey="OnTimeRate" labelKey="Title" color="bg-sky-500" />
                  </div>
                </div>

                {siblingClasses.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">bar_chart</span>
                        So sánh nhanh với các lớp khác cùng khoá học
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
                            <th className="p-4">Lớp</th>
                            <th className="p-4">Sĩ số</th>
                            <th className="p-4">Tỉ lệ chuyên cần TB</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {siblingClasses.map((s) => (
                            <tr key={s.Id} className="hover:bg-slate-50/70">
                              <td className="p-4">
                                <Link to={`/Teacher/ClassDetail/${s.Id}`} className="text-primary font-bold no-underline hover:underline">{s.ClassName}</Link>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[16px] text-slate-400">groups</span>
                                  {s.StudentCount} học viên
                                </span>
                              </td>
                              <td className="p-4">
                                <StatusDot color={s.AvgAttendanceRate >= 0.8 ? 'emerald' : s.AvgAttendanceRate >= 0.6 ? 'amber' : 'red'}>
                                  {(s.AvgAttendanceRate * 100).toFixed(0)}%
                                </StatusDot>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-slate-400">history</span>
                      Nhật ký hoạt động gần đây
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {auditLog.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">Chưa có hoạt động nào được ghi nhận.</div>
                    ) : (
                      auditLog.map((l) => {
                        const meta = AUDIT_META[l.Action] || DEFAULT_AUDIT_META;
                        return (
                          <div key={l.Id} className="px-6 py-3.5 flex items-start gap-3">
                            <IconBadge color={meta.color} icon={meta.icon} size="w-9 h-9" iconSize="text-[18px]" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-700">{l.Description}</p>
                              {l.Reason && <p className="text-sm text-slate-500 mt-0.5">Lý do: {l.Reason}</p>}
                              <p className="text-xs text-slate-400 mt-0.5">{l.ActorName} · {new Date(l.CreatedAt).toLocaleString('vi-VN')}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ============ TAB: Buổi học ============ */}
            {activeTab === 'lessons' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">event</span>
                    Danh sách buổi học ({lessons.length})
                  </h3>
                  <button onClick={() => openMakeupModal(null)} className="inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Thêm buổi học bù
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {lessons.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Lớp học chưa có buổi học nào.</div>
                  ) : (
                    lessons.map((l) => {
                      const dateObj = new Date(l.LessonDate);
                      return (
                        <div
                          key={l.Id}
                          className={`px-6 py-4 flex items-center justify-between gap-3 flex-wrap border-l-4 ${
                            l.Status === 2 ? 'border-l-emerald-400' : l.Status === 3 ? 'border-l-red-300' : l.Status === 1 ? 'border-l-sky-400' : 'border-l-amber-300'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0 text-slate-500">
                              <span className="text-[10px] font-bold uppercase leading-none">Th{dateObj.getMonth() + 1}</span>
                              <span className="text-base font-black leading-none mt-0.5">{dateObj.getDate()}</span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="text-sm font-bold text-slate-900">{l.Title}</h4>
                                <StatusDot color={LESSON_STATUS_COLOR[l.Status]}>{LESSON_STATUS_LABEL[l.Status]}</StatusDot>
                                {l.MakeupOfLessonId && <StatusDot color="violet">Buổi bù cho #{l.MakeupOfLessonId}</StatusDot>}
                              </div>
                              <p className="text-sm text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[15px]">schedule</span>
                                {formatTime(l.StartTime)} - {formatTime(l.EndTime)}
                              </p>
                              {l.CancelReason && <p className="text-xs text-red-500 font-semibold mt-1">Lý do huỷ: {l.CancelReason}</p>}
                            </div>
                          </div>
                          {l.Status !== 3 && (
                            <div className="relative shrink-0">
                              <button
                                onClick={() => setOpenMenuId(openMenuId === `lesson-${l.Id}` ? null : `lesson-${l.Id}`)}
                                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                              </button>
                              {openMenuId === `lesson-${l.Id}` && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
                                    <button onClick={() => { setOpenMenuId(null); openReschedule(l); }} className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                      Đổi giờ/link phòng
                                    </button>
                                    <button onClick={() => { setOpenMenuId(null); openMakeupModal(l); }} className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                      Thêm buổi bù cho buổi này
                                    </button>
                                    <button onClick={() => { setOpenMenuId(null); setCancelModal(l); }} className="w-full px-4 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                                      Huỷ buổi học
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ============ TAB: Học viên ============ */}
            {activeTab === 'students' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">groups</span>
                    Danh sách học viên ({filteredStudents.length})
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { key: 'all', label: 'Tất cả' },
                      { key: '0', label: 'Đang học' },
                      { key: '2', label: 'Bảo lưu' },
                      { key: '3', label: 'Bị chặn' },
                      { key: '4', label: 'Đã loại' }
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setStudentFilter(f.key)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${studentFilter === f.key ? 'bg-primary text-white border-primary' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
                        <th className="p-4">Học viên</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4">Tỉ lệ đi học</th>
                        <th className="p-4">Bài nộp trễ</th>
                        <th className="p-4">Ghi chú</th>
                        <th className="p-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {filteredStudents.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-400">Không có học viên nào.</td></tr>
                      ) : (
                        filteredStudents.map((s) => (
                          <tr key={s.EnrollmentId} className="hover:bg-slate-50/70 align-top">
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <Avatar name={s.FullName} />
                                <div>
                                  <div className="font-bold text-slate-900">{s.FullName}</div>
                                  <div className="text-xs text-slate-400">{s.Email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <StatusDot color={STUDENT_STATUS_COLOR[s.Status]}>{STUDENT_STATUS_LABEL[s.Status]}</StatusDot>
                              {s.StatusReason && <div className="text-xs text-slate-400 mt-1 max-w-[180px]">{s.StatusReason}</div>}
                            </td>
                            <td className="p-4 whitespace-nowrap">{(s.AttendanceRate * 100).toFixed(0)}%</td>
                            <td className="p-4 whitespace-nowrap">{s.LateSubmissionCount}</td>
                            <td className="p-4 max-w-[200px]">
                              <button onClick={() => openNote(s)} className="text-left text-xs text-slate-500 hover:text-primary truncate block max-w-[200px]">
                                {s.Note ? s.Note : <span className="italic text-slate-300">Chưa có ghi chú — bấm để thêm</span>}
                              </button>
                            </td>
                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="relative inline-block">
                                <button
                                  onClick={() => setOpenMenuId(openMenuId === `student-${s.EnrollmentId}` ? null : `student-${s.EnrollmentId}`)}
                                  className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center"
                                >
                                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                </button>
                                {openMenuId === `student-${s.EnrollmentId}` && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                    <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20 text-left">
                                      <button onClick={() => { setOpenMenuId(null); openNote(s); }} className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                        Ghi chú nội bộ
                                      </button>
                                      <button onClick={() => { setOpenMenuId(null); setTransferModal(s); setTransferTarget(''); }} className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                        Chuyển lớp
                                      </button>
                                      {s.Status === 3 ? (
                                        <button onClick={() => { setOpenMenuId(null); handleUnblock(s); }} className="w-full px-4 py-2 text-left text-sm font-semibold text-emerald-600 hover:bg-emerald-50">
                                          Mở lại quyền truy cập
                                        </button>
                                      ) : s.Status === 0 || s.Status === 2 ? (
                                        <button onClick={() => { setOpenMenuId(null); setBlockModal(s); setBlockReason(''); }} className="w-full px-4 py-2 text-left text-sm font-semibold text-amber-600 hover:bg-amber-50">
                                          Chặn tạm khoá
                                        </button>
                                      ) : null}
                                      {s.Status !== 4 && (
                                        <button onClick={() => { setOpenMenuId(null); setKickModal({ student: s, step: 1 }); setKickReason(''); }} className="w-full px-4 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                                          Loại khỏi lớp (Kick)
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============ TAB: Video ghi hình ============ */}
            {activeTab === 'video' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">smart_display</span>
                    Video ghi hình các buổi học ({videoLessons.length})
                  </h3>
                </div>
                {videoLessons.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Chưa có buổi học nào được đính kèm video ghi hình.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {videoLessons.map((vl) => (
                      <div key={vl.Id} className="px-6 py-5">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{vl.Title}</h4>
                            <p className="text-xs text-slate-500">{new Date(vl.LessonDate).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <a href={vl.VideoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                            <span className="material-symbols-outlined text-[18px]">play_circle</span>
                            Xem video
                          </a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                            <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              Được xem ({vl.Granted.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {vl.Granted.length === 0 ? (
                                <span className="text-xs text-emerald-600/60 italic">Chưa có học viên nào</span>
                              ) : vl.Granted.map((s) => (
                                <span key={s.StudentId} className="text-xs font-semibold bg-white border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full">{s.FullName}</span>
                              ))}
                            </div>
                          </div>
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">lock</span>
                              Bị khoá ({vl.Blocked.length})
                            </p>
                            <div className="flex flex-col gap-1.5">
                              {vl.Blocked.length === 0 ? (
                                <span className="text-xs text-amber-600/60 italic">Không có học viên nào bị khoá</span>
                              ) : vl.Blocked.map((s) => (
                                <div key={s.StudentId} className="flex items-center justify-between gap-2 bg-white border border-amber-200 rounded-full px-2.5 py-1">
                                  <span className="text-xs font-semibold text-amber-700">{s.FullName}</span>
                                  <button
                                    onClick={() => handleGrantVideoAccess(vl.Id, s.StudentId)}
                                    disabled={grantingKey === `${vl.Id}-${s.StudentId}`}
                                    className="text-[10px] font-bold text-primary hover:underline disabled:opacity-50 shrink-0"
                                  >
                                    Mở quyền xem
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============ TAB: Cài đặt ============ */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Thông tin lớp học</h3>
                  <button onClick={openEditInfo} className="inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Sửa thông tin
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-slate-400 font-bold text-xs uppercase mb-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">description</span> Mô tả lớp
                    </p>
                    <p className="text-slate-700 font-semibold whitespace-pre-line">{cls.Description || '(Chưa có mô tả)'}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-slate-400 font-bold text-xs uppercase mb-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">link</span> Link phòng học online
                    </p>
                    <p className="text-slate-700 font-semibold break-all">{cls.MeetingUrl || '(Chưa có link)'}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 md:col-span-2">
                    <p className="text-slate-400 font-bold text-xs uppercase mb-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span> Lịch học định kỳ
                    </p>
                    <p className="text-slate-700 font-semibold whitespace-pre-line">{cls.Schedule && cls.Schedule !== '[]' ? cls.Schedule : '(Chưa cấu hình)'}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 md:col-span-2 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">lock</span>
                    <p className="text-slate-500 font-semibold text-sm">Học phí và khoá học gốc do Admin quản lý — giáo viên không thể chỉnh sửa mục này.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============ Modal: Sửa thông tin lớp ============ */}
      {editInfo && (
        <Modal title="Sửa thông tin lớp học" onClose={() => setEditInfo(false)} wide>
          <form onSubmit={submitEditInfo} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Mô tả lớp</label>
              <textarea rows={3} value={infoForm.description} onChange={(e) => setInfoForm({ ...infoForm, description: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Link phòng học online</label>
              <input type="text" value={infoForm.meetingUrl} onChange={(e) => setInfoForm({ ...infoForm, meetingUrl: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="https://meet.google.com/..." />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Lịch học định kỳ</label>
              <textarea rows={3} value={infoForm.schedule} onChange={(e) => setInfoForm({ ...infoForm, schedule: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono" placeholder="VD: Thứ 3 - Thứ 5, 18:00 - 19:30" />
            </div>
            <p className="text-xs text-slate-400">Học phí và khoá học gốc thuộc quyền quản lý của Admin, không thể sửa tại đây.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditInfo(false)} className="text-sm font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Huỷ</button>
              <button type="submit" disabled={saving} className="text-sm font-bold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============ Modal: Thêm buổi học bù ============ */}
      {makeupModal && (
        <Modal title="Thêm buổi học bù" onClose={() => setMakeupModal(null)}>
          <form onSubmit={submitMakeup} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Tiêu đề buổi học</label>
              <input required type="text" value={makeupForm.title} onChange={(e) => setMakeupForm({ ...makeupForm, title: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Ngày học</label>
                <input required type="date" value={makeupForm.lessonDate} onChange={(e) => setMakeupForm({ ...makeupForm, lessonDate: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div />
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Giờ bắt đầu</label>
                <input required type="time" value={makeupForm.startTime} onChange={(e) => setMakeupForm({ ...makeupForm, startTime: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Giờ kết thúc</label>
                <input required type="time" value={makeupForm.endTime} onChange={(e) => setMakeupForm({ ...makeupForm, endTime: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Link phòng học</label>
              <input type="text" value={makeupForm.meetingUrl} onChange={(e) => setMakeupForm({ ...makeupForm, meetingUrl: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            {makeupModal.forLessonId && (
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Áp dụng thông báo cho</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer">
                    <input type="radio" checked={makeupForm.applyTo === 'all'} onChange={() => setMakeupForm({ ...makeupForm, applyTo: 'all' })} /> Toàn bộ học viên
                  </label>
                  <label className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer">
                    <input type="radio" checked={makeupForm.applyTo === 'absent_only'} onChange={() => setMakeupForm({ ...makeupForm, applyTo: 'absent_only' })} /> Chỉ học viên đã xin nghỉ buổi gốc
                  </label>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setMakeupModal(null)} className="text-sm font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Huỷ</button>
              <button type="submit" disabled={saving} className="text-sm font-bold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50">{saving ? 'Đang lưu...' : 'Thêm buổi bù'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============ Modal: Huỷ buổi học ============ */}
      {cancelModal && (
        <Modal title={`Huỷ buổi học "${cancelModal.Title}"`} onClose={() => setCancelModal(null)}>
          <form onSubmit={submitCancel} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Lý do huỷ buổi học (bắt buộc)</label>
              <textarea required rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="VD: Giáo viên bận đột xuất..." />
            </div>
            <p className="text-xs text-slate-400">Hệ thống sẽ gửi thông báo huỷ buổi cho toàn bộ học viên trong lớp.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setCancelModal(null)} className="text-sm font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Đóng</button>
              <button type="submit" disabled={saving} className="text-sm font-bold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">{saving ? 'Đang huỷ...' : 'Xác nhận huỷ buổi học'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============ Modal: Đổi lịch buổi học ============ */}
      {rescheduleModal && (
        <Modal title={`Đổi lịch buổi "${rescheduleModal.Title}"`} onClose={() => setRescheduleModal(null)}>
          <form onSubmit={submitReschedule} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Ngày học</label>
                <input required type="date" value={rescheduleForm.lessonDate} onChange={(e) => setRescheduleForm({ ...rescheduleForm, lessonDate: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div />
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Giờ bắt đầu</label>
                <input required type="time" value={rescheduleForm.startTime} onChange={(e) => setRescheduleForm({ ...rescheduleForm, startTime: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Giờ kết thúc</label>
                <input required type="time" value={rescheduleForm.endTime} onChange={(e) => setRescheduleForm({ ...rescheduleForm, endTime: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Link phòng học</label>
              <input type="text" value={rescheduleForm.meetingUrl} onChange={(e) => setRescheduleForm({ ...rescheduleForm, meetingUrl: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <p className="text-xs text-slate-400">Thao tác này chỉ đổi lịch của riêng buổi học này, không ảnh hưởng lịch định kỳ cả lớp. Học viên sẽ nhận được thông báo.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setRescheduleModal(null)} className="text-sm font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Huỷ</button>
              <button type="submit" disabled={saving} className="text-sm font-bold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============ Modal: Ghi chú học viên ============ */}
      {noteModal && (
        <Modal title={`Ghi chú nội bộ — ${noteModal.FullName}`} onClose={() => setNoteModal(null)}>
          <form onSubmit={submitNote} className="space-y-4">
            <textarea rows={5} value={noteText} onChange={(e) => setNoteText(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="VD: hay quên bài, cần nhắc nhở thêm..." />
            <p className="text-xs text-slate-400">Ghi chú này chỉ giáo viên phụ trách lớp xem được, không hiển thị cho học viên hoặc admin khác.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setNoteModal(null)} className="text-sm font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Huỷ</button>
              <button type="submit" disabled={saving} className="text-sm font-bold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu ghi chú'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============ Modal: Chuyển lớp ============ */}
      {transferModal && (
        <Modal title={`Chuyển lớp — ${transferModal.FullName}`} onClose={() => setTransferModal(null)}>
          <form onSubmit={submitTransfer} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Chọn lớp đích (cùng khoá học, do bạn phụ trách)</label>
              <select required value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                <option value="">-- Chọn lớp --</option>
                {siblingClasses.map((s) => (
                  <option key={s.Id} value={s.Id}>{s.ClassName}</option>
                ))}
              </select>
              {siblingClasses.length === 0 && <p className="text-xs text-red-500 mt-1">Bạn chưa có lớp nào khác cùng khoá học này để chuyển sang.</p>}
            </div>
            <p className="text-xs text-slate-400">Học viên giữ nguyên đăng ký, không cần huỷ/đăng ký lại từ đầu.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setTransferModal(null)} className="text-sm font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Huỷ</button>
              <button type="submit" disabled={saving || siblingClasses.length === 0} className="text-sm font-bold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50">{saving ? 'Đang chuyển...' : 'Xác nhận chuyển lớp'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============ Modal: Chặn học viên ============ */}
      {blockModal && (
        <Modal title={`Chặn tạm khoá — ${blockModal.FullName}`} onClose={() => setBlockModal(null)}>
          <form onSubmit={submitBlock} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Lý do chặn (bắt buộc)</label>
              <textarea required rows={3} value={blockReason} onChange={(e) => setBlockReason(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <p className="text-xs text-slate-400">Học viên sẽ mất quyền truy cập bài tập/video nhưng vẫn còn trong danh sách lớp. Có thể mở lại bất kỳ lúc nào.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setBlockModal(null)} className="text-sm font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Huỷ</button>
              <button type="submit" disabled={saving} className="text-sm font-bold px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">{saving ? 'Đang xử lý...' : 'Xác nhận chặn'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============ Modal: Kick học viên (2 bước xác nhận) ============ */}
      {kickModal && kickModal.step === 1 && (
        <Modal title={`Loại khỏi lớp — ${kickModal.student.FullName}`} onClose={() => setKickModal(null)}>
          <form onSubmit={submitKickStep1} className="space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700 font-semibold">
              Hành động này sẽ loại hẳn học viên khỏi lớp. Không hoàn học phí theo chính sách hiện có. Lịch sử điểm số/bài làm vẫn được giữ nguyên để đối chiếu khi có tranh chấp.
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Lý do loại khỏi lớp (bắt buộc)</label>
              <textarea required rows={3} value={kickReason} onChange={(e) => setKickReason(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setKickModal(null)} className="text-sm font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Huỷ</button>
              <button type="submit" className="text-sm font-bold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Tiếp tục</button>
            </div>
          </form>
        </Modal>
      )}
      {kickModal && kickModal.step === 2 && (
        <Modal title="Xác nhận lần cuối" onClose={() => setKickModal(null)}>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700 font-bold text-center">
              Bạn có chắc chắn muốn loại "{kickModal.student.FullName}" khỏi lớp "{cls?.ClassName}"?<br />Hành động này không thể tự động hoàn tác.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setKickModal(null)} className="text-sm font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Huỷ bỏ</button>
              <button type="button" onClick={confirmKickFinal} disabled={saving} className="text-sm font-bold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">{saving ? 'Đang xử lý...' : 'Xác nhận loại khỏi lớp'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============ Modal: Gửi thông báo cho lớp ============ */}
      {notifyModal && (
        <Modal title="Gửi thông báo nhanh cho cả lớp" onClose={() => setNotifyModal(false)}>
          <form onSubmit={submitNotify} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Tiêu đề</label>
              <input required type="text" value={notifyForm.title} onChange={(e) => setNotifyForm({ ...notifyForm, title: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="VD: Buổi mai nghỉ" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Nội dung</label>
              <textarea required rows={4} value={notifyForm.content} onChange={(e) => setNotifyForm({ ...notifyForm, content: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="VD: Nhớ nộp bài trước 22h..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setNotifyModal(false)} className="text-sm font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Huỷ</button>
              <button type="submit" disabled={saving} className="text-sm font-bold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50">{saving ? 'Đang gửi...' : 'Gửi thông báo'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============ Modal: Nhân bản lớp ============ */}
      {cloneModal && (
        <Modal title="Nhân bản lớp học" onClose={() => setCloneModal(false)}>
          <form onSubmit={submitClone} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Tên lớp mới</label>
              <input required type="text" value={cloneForm.className} onChange={(e) => setCloneForm({ ...cloneForm, className: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Ngày bắt đầu</label>
                <input required type="date" value={cloneForm.startDate} onChange={(e) => setCloneForm({ ...cloneForm, startDate: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Ngày kết thúc</label>
                <input required type="date" value={cloneForm.endDate} onChange={(e) => setCloneForm({ ...cloneForm, endDate: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>
            </div>
            <p className="text-xs text-slate-400">Lớp mới sẽ có cùng cấu trúc (mô tả, lịch định kỳ, link phòng, khoá học gốc, sĩ số tối đa) nhưng KHÔNG sao chép học viên và buổi học — bạn cần tự thêm sau.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setCloneModal(false)} className="text-sm font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Huỷ</button>
              <button type="submit" disabled={saving} className="text-sm font-bold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50">{saving ? 'Đang tạo...' : 'Tạo lớp mới'}</button>
            </div>
          </form>
        </Modal>
      )}
    </MainLayout>
  );
}
