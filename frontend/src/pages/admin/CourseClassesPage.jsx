import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFetchData } from '../../hooks/useFetchData';
import AdminLayout from '../../components/Layout/AdminLayout';
import api from '../../services/api';

const emptyCreateForm = {
  teacherId: '',
  className: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  scheduleDays: '2,5',
  scheduleTimes: '18:00-19:30',
};

export default function CourseClassesPage() {
  const { courseId } = useParams();
  const { data, loading, refetch } = useFetchData(`/Admin/Courses/${courseId}/Classes`);

  const course = data?.course || null;
  const classes = data?.classes || [];
  const teachers = data?.teachers || [];

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editingClass, setEditingClass] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (openMenuId === null) return;
    const closeMenu = () => setOpenMenuId(null);
    document.addEventListener('click', closeMenu);
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
        maxStudents: 25,
        ...createForm,
      });
      setShowCreateModal(false);
      setCreateForm(emptyCreateForm);
      refetch();
    } catch (err) {
      alert('Không thể tạo lớp học. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (cls) => {
    setOpenMenuId(null);
    setEditingClass({
      id: cls.Id,
      courseId: cls.CourseId,
      teacherId: cls.TeacherId || '',
      className: cls.ClassName,
      maxStudents: cls.MaxStudents,
      startDate: cls.StartDate ? new Date(cls.StartDate).toISOString().slice(0, 10) : '',
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

  return (
    <AdminLayout
      activeTab="tabCourses"
      breadcrumb={['Trang chủ', 'Quản trị hệ thống', 'Quản lý Khóa / Lớp Học', course?.Title || '...']}
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
        </div>
      ) : !course ? (
        <div className="text-center py-10 text-slate-500 font-semibold">
          Không tìm thấy thông tin khóa học hoặc danh sách lớp học.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">school</span> Danh sách Lớp Học Thực Tế
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Khóa học: <strong>{course.Title}</strong> ({course.CourseCode})
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-primary hover:bg-primary/80 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[22px]">event</span> Tạo Lớp Học Mới
            </button>
          </div>

          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-xs">
                <th className="p-4 px-6">Tên lớp học</th>
                <th className="p-4">Giáo viên phụ trách</th>
                <th className="p-4">Sĩ số (Max)</th>
                <th className="p-4">Lịch khai giảng</th>
                <th className="p-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {classes.map((cls) => (
                <tr key={cls.Id} className="hover:bg-slate-50/50">
                  <td className="p-4 px-6 font-bold text-slate-800">{cls.ClassName}</td>
                  <td className="p-4">
                    {cls.Teacher?.FullName ? (
                      cls.Teacher.FullName
                    ) : (
                      <span className="text-red-600 font-bold inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[20px]">warning</span> Thiếu giáo viên
                      </span>
                    )}
                  </td>
                  <td className="p-4">{cls.MaxStudents} học sinh</td>
                  <td className="p-4 text-slate-400">
                    {cls.StartDate ? new Date(cls.StartDate).toLocaleDateString('vi-VN') : 'Chưa định'}
                  </td>
                  <td className="p-4 px-6 text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === cls.Id ? null : cls.Id);
                      }}
                      className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[24px]">more_vert</span>
                    </button>
                    {openMenuId === cls.Id && (
                      <div className="absolute right-5 top-9 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-40 text-left">
                        <button
                          onClick={() => openEditModal(cls)}
                          className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                        >
                          <span className="material-symbols-outlined text-[18px] text-primary">edit</span> Sửa lớp học
                        </button>
                        <button
                          onClick={() => handleDelete(cls)}
                          className="w-full px-3.5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span> Xóa lớp học
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 italic">Khóa học này hiện chưa được mở lớp học nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-900">Tạo Lớp Học Mới</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Chọn Giáo Viên</label>
                <select required value={createForm.teacherId} onChange={handleCreateChange('teacherId')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                  <option value="" disabled>-- Chọn giáo viên --</option>
                  {teachers.map((t) => (
                    <option key={t.Id} value={t.Id}>{t.FullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên lớp học</label>
                <input required type="text" value={createForm.className} onChange={handleCreateChange('className')} placeholder="Ví dụ: Lớp Toán 10 - Nhóm 2" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày khai giảng</label>
                  <input required type="date" value={createForm.startDate} onChange={handleCreateChange('startDate')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày bế giảng</label>
                  <input required type="date" value={createForm.endDate} onChange={handleCreateChange('endDate')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Lịch học hàng tuần (Thứ)</label>
                  <input required type="text" value={createForm.scheduleDays} onChange={handleCreateChange('scheduleDays')} placeholder="2,5" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Khung Giờ</label>
                  <input required type="text" value={createForm.scheduleTimes} onChange={handleCreateChange('scheduleTimes')} placeholder="18:00-19:30" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
                {saving ? 'Đang lưu...' : 'Lưu & Sinh Lịch Học Tự Động'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setEditingClass(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-900">Cập Nhật Lớp Học</h3>
              <button onClick={() => setEditingClass(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Chọn Giáo Viên</label>
                <select required value={editingClass.teacherId} onChange={handleEditChange('teacherId')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                  <option value="" disabled>-- Chọn giáo viên --</option>
                  {teachers.map((t) => (
                    <option key={t.Id} value={t.Id}>{t.FullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên lớp học</label>
                <input required type="text" value={editingClass.className} onChange={handleEditChange('className')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày khai giảng</label>
                  <input required type="date" value={editingClass.startDate} onChange={handleEditChange('startDate')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Sĩ số tối đa</label>
                  <input required type="number" value={editingClass.maxStudents} onChange={handleEditChange('maxStudents')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
                {saving ? 'Đang lưu...' : 'Cập Nhật Lớp Học'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
