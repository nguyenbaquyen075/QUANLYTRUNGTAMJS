import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFetchData } from '../../hooks/useFetchData';
import AdminLayout from '../../components/Layout/AdminLayout';
import api from '../../services/api';

const emptyCreateForm = {
  teacherId: '',
  className: '',
  maxStudents: 25,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  scheduleDays: '2,4,6',
  scheduleTimes: '19:30-21:00',
  status: 0,
  meetingUrl: '',
  description: '',
};

export default function CourseClassesPage() {
  const { courseId } = useParams();
  const { data, loading, refetch } = useFetchData(`/Admin/Courses/${courseId}/Classes`);

  const course = data?.course || null;
  const classes = data?.classes || [];
  const teachers = data?.teachers || [];

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editingClass, setEditingClass] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (openMenuId === null) return;
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [openMenuId]);

  const handleCreateChange = (field) => (e) => {
    setCreateForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/Admin/CreateClass', {
        courseId,
        ...createForm,
      });
      setShowCreatePage(false);
      setCreateForm(emptyCreateForm);
      refetch();
    } catch (err) {
      alert('Không thể tạo lớp học. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (cls) => {
    setOpenMenuId(null);
    let scheduleStr = cls.Schedule || '';
    if (scheduleStr.startsWith('[') || scheduleStr.startsWith('{')) {
      try {
        const parsed = JSON.parse(scheduleStr);
        if (Array.isArray(parsed)) {
          scheduleStr = parsed
            .map((s) => `Thứ ${s.day_of_week} (${s.start_time?.slice(0, 5) || ''} - ${s.end_time?.slice(0, 5) || ''})`)
            .join(', ');
        }
      } catch {
        // use raw
      }
    }

    setEditingClass({
      id: cls.Id,
      courseId: cls.CourseId,
      teacherId: cls.TeacherId || '',
      className: cls.ClassName || '',
      maxStudents: cls.MaxStudents || 25,
      startDate: cls.StartDate ? new Date(cls.StartDate).toISOString().slice(0, 10) : '',
      endDate: cls.EndDate ? new Date(cls.EndDate).toISOString().slice(0, 10) : '',
      schedule: scheduleStr || '',
      status: cls.Status !== undefined ? cls.Status : 0,
      meetingUrl: cls.MeetingUrl || '',
      description: cls.Description || '',
    });
  };

  const handleEditChange = (field) => (e) => {
    setEditingClass((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingClass) return;
    setSaving(true);
    try {
      await api.post(`/Admin/EditClass/${editingClass.id}`, {
        courseId: editingClass.courseId,
        teacherId: editingClass.teacherId,
        className: editingClass.className,
        maxStudents: editingClass.maxStudents,
        startDate: editingClass.startDate,
        endDate: editingClass.endDate,
        schedule: editingClass.schedule,
        status: parseInt(editingClass.status),
        meetingUrl: editingClass.meetingUrl,
        description: editingClass.description,
      });
      setEditingClass(null);
      refetch();
    } catch (err) {
      alert('Không thể cập nhật lớp học.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cls) => {
    setOpenMenuId(null);
    if (!confirm(`Bạn chắc chắn muốn xóa lớp "${cls.ClassName}"?`)) return;
    try {
      await api.post(`/Admin/DeleteClass/${cls.Id}`, { id: cls.Id });
      refetch();
    } catch (err) {
      alert('Không thể xóa lớp học.');
    }
  };

  // ================= 1. TRANG SỬA LỚP HỌC =================
  if (editingClass) {
    return (
      <AdminLayout
        activeTab="tabCourses"
        breadcrumb={['Trang chủ', 'Quản trị hệ thống', 'Quản lý Khóa / Lớp Học', course?.Title || 'Khóa học', `Sửa lớp: ${editingClass.className}`]}
      >
        <div className="max-w-4xl mx-auto space-y-5 pb-12">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-200 shrink-0"
                title="Quay lại danh sách"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Chỉnh sửa lớp học</h1>
                <p className="text-xs text-slate-500 mt-0.5">{course?.Title} ({course?.CourseCode})</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleEditSubmit}
                disabled={saving}
                className="px-5 py-2 bg-primary hover:bg-primary/85 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleEditSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên lớp học *</label>
                <input
                  required
                  type="text"
                  value={editingClass.className}
                  onChange={handleEditChange('className')}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Trạng thái</label>
                <div className="relative">
                  <select
                    value={editingClass.status}
                    onChange={handleEditChange('status')}
                    className="appearance-none w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none font-medium text-slate-800"
                  >
                    <option value={0}>Sắp khai giảng</option>
                    <option value={1}>Đang diễn ra</option>
                    <option value={2}>Đã kết thúc</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Giáo viên phụ trách *</label>
                <div className="relative">
                  <select
                    required
                    value={editingClass.teacherId}
                    onChange={handleEditChange('teacherId')}
                    className="appearance-none w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none font-medium text-slate-800"
                  >
                    <option value="" disabled>-- Chọn giáo viên --</option>
                    {teachers.map((t) => (
                      <option key={t.Id} value={t.Id}>{t.FullName} ({t.Email || 'GV'})</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Sĩ số tối đa *</label>
                <input
                  required
                  type="number"
                  min={1}
                  max={200}
                  value={editingClass.maxStudents}
                  onChange={handleEditChange('maxStudents')}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày khai giảng *</label>
                <input
                  required
                  type="date"
                  value={editingClass.startDate}
                  onChange={handleEditChange('startDate')}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày kết thúc dự kiến</label>
                <input
                  type="date"
                  value={editingClass.endDate}
                  onChange={handleEditChange('endDate')}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Lịch học chi tiết</label>
              <input
                type="text"
                value={editingClass.schedule}
                onChange={handleEditChange('schedule')}
                placeholder="Ví dụ: Thứ 2, Thứ 4, Thứ 6 (19:30 - 21:00)"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Phòng học / Link học trực tuyến</label>
              <input
                type="text"
                value={editingClass.meetingUrl}
                onChange={handleEditChange('meetingUrl')}
                placeholder="Ví dụ: https://meet.google.com/xyz hoặc Phòng 402"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Ghi chú & Dặn dò</label>
              <textarea
                rows={3}
                value={editingClass.description}
                onChange={handleEditChange('description')}
                placeholder="Ghi chú thêm về tài liệu, quy định lớp học..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none resize-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary hover:bg-primary/85 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    );
  }

  // ================= 2. TRANG TẠO LỚP HỌC MỚI =================
  if (showCreatePage) {
    return (
      <AdminLayout
        activeTab="tabCourses"
        breadcrumb={['Trang chủ', 'Quản trị hệ thống', 'Quản lý Khóa / Lớp Học', course?.Title || 'Khóa học', 'Tạo lớp học mới']}
      >
        <div className="max-w-4xl mx-auto space-y-5 pb-12">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowCreatePage(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-200 shrink-0"
                title="Quay lại danh sách"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Tạo lớp học mới</h1>
                <p className="text-xs text-slate-500 mt-0.5">{course?.Title} ({course?.CourseCode})</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCreatePage(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateSubmit}
                disabled={saving}
                className="px-5 py-2 bg-primary hover:bg-primary/85 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">add_task</span>
                <span>{saving ? 'Đang tạo...' : 'Tạo lớp học'}</span>
              </button>
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleCreateSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên lớp học *</label>
                <input
                  required
                  type="text"
                  value={createForm.className}
                  onChange={handleCreateChange('className')}
                  placeholder="Ví dụ: Lớp ANH12 - Nhóm 1"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Sĩ số tối đa *</label>
                <input
                  required
                  type="number"
                  min={1}
                  max={200}
                  value={createForm.maxStudents}
                  onChange={handleCreateChange('maxStudents')}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Giáo viên phụ trách *</label>
              <div className="relative">
                <select
                  required
                  value={createForm.teacherId}
                  onChange={handleCreateChange('teacherId')}
                  className="appearance-none w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none font-medium text-slate-800"
                >
                  <option value="" disabled>-- Chọn giáo viên --</option>
                  {teachers.map((t) => (
                    <option key={t.Id} value={t.Id}>{t.FullName} ({t.Email || 'GV'})</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày khai giảng *</label>
                <input
                  required
                  type="date"
                  value={createForm.startDate}
                  onChange={handleCreateChange('startDate')}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày kết thúc dự kiến *</label>
                <input
                  required
                  type="date"
                  value={createForm.endDate}
                  onChange={handleCreateChange('endDate')}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Các thứ trong tuần (ví dụ: 2,4,6) *</label>
                <input
                  required
                  type="text"
                  value={createForm.scheduleDays}
                  onChange={handleCreateChange('scheduleDays')}
                  placeholder="2,4,6"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Khung giờ học (HH:mm-HH:mm) *</label>
                <input
                  required
                  type="text"
                  value={createForm.scheduleTimes}
                  onChange={handleCreateChange('scheduleTimes')}
                  placeholder="19:30-21:00"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Phòng học / Link học trực tuyến</label>
              <input
                type="text"
                value={createForm.meetingUrl}
                onChange={handleCreateChange('meetingUrl')}
                placeholder="Ví dụ: https://meet.google.com/xyz hoặc Phòng 402"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Ghi chú</label>
              <textarea
                rows={3}
                value={createForm.description}
                onChange={handleCreateChange('description')}
                placeholder="Ghi chú thêm về lớp học..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none resize-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCreatePage(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary hover:bg-primary/85 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">add_task</span>
                <span>{saving ? 'Đang tạo...' : 'Tạo lớp học'}</span>
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    );
  }

  // ================= 3. DANH SÁCH LỚP HỌC =================
  return (
    <AdminLayout
      activeTab="tabCourses"
      breadcrumb={['Trang chủ', 'Quản trị hệ thống', 'Quản lý Khóa / Lớp Học', course?.Title || '...']}
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
        </div>
      ) : !course ? (
        <div className="text-center py-10 text-slate-500 font-semibold">
          Không tìm thấy thông tin khóa học hoặc danh sách lớp học.
        </div>
      ) : (
        <div className="space-y-5">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif font-bold text-slate-900 text-2xl tracking-tight">Danh sách lớp học</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Khóa học: <strong className="text-slate-800">{course.Title}</strong> ({course.CourseCode}) &bull; {classes.length} lớp học
              </p>
            </div>

            <button
              onClick={() => setShowCreatePage(true)}
              className="px-5 py-2.5 bg-primary hover:bg-primary/85 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Tạo Lớp Học Mới</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[320px] pb-16">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
                  <th className="py-4 px-6">Tên lớp</th>
                  <th className="py-4 px-4">Giáo viên</th>
                  <th className="py-4 px-4">Sĩ số</th>
                  <th className="py-4 px-4">Khai giảng</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {classes.map((cls) => (
                  <tr key={cls.Id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800 text-base">{cls.ClassName}</div>
                      {cls.MeetingUrl && (
                        <a
                          href={cls.MeetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline font-normal mt-0.5 inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">link</span>
                          <span>Phòng học online</span>
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {cls.Teacher?.FullName ? (
                        <span className="font-bold text-slate-800">{cls.Teacher.FullName}</span>
                      ) : (
                        <span className="text-rose-600 font-bold text-xs bg-rose-50 px-2 py-0.5 rounded">Chưa phân công</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-700">
                      {cls.EnrollmentCount || 0} / {cls.MaxStudents} học sinh
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {cls.StartDate ? new Date(cls.StartDate).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === cls.Id ? null : cls.Id);
                        }}
                        className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 inline-flex items-center justify-center transition-colors cursor-pointer"
                        title="Thao tác"
                      >
                        <span className="material-symbols-outlined text-[24px]">more_vert</span>
                      </button>

                      {openMenuId === cls.Id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-6 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-[100] text-left animate-in fade-in zoom-in-95 duration-150"
                        >
                          <button
                            type="button"
                            onClick={() => openEdit(cls)}
                            className="w-full px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                          >
                            <span className="material-symbols-outlined text-[18px] text-primary">edit</span>
                            <span>Sửa lớp học</span>
                          </button>
                          <div className="border-t border-slate-100 my-1" />
                          <button
                            type="button"
                            onClick={() => handleDelete(cls)}
                            className="w-full px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            <span>Xóa lớp học</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {classes.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-400 italic text-sm">
                      Chưa có lớp học nào trong khóa này. Nhấn <strong>"Tạo Lớp Học Mới"</strong> để thêm lớp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
