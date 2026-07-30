import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFetchData } from '../../hooks/useFetchData';
import AdminLayout from '../../components/Layout/AdminLayout';
import api from '../../services/api';

const emptyCreateUserForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '123456',
  role: 'TEACHER',
};

const emptyCourseForm = {
  courseCode: '',
  title: '',
  description: '',
  basePrice: 1200000,
  totalLessons: 12,
  tags: '',
};

const ratingBadgeClass = (rating) => {
  if (rating === 'Xuất sắc') return 'bg-emerald-50 text-emerald-600';
  if (rating === 'Khá' || rating === 'Tốt') return 'bg-sky-50 text-sky-600';
  if (rating === 'Đạt') return 'bg-amber-50 text-amber-600';
  return 'bg-red-50 text-red-600';
};

function ProgressBar({ percent, color = 'bg-primary' }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-700 w-9 text-right">{clamped.toFixed(0)}%</span>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, loading, refetch } = useFetchData('/Admin/Dashboard');
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'tabCourses');
  const [saving, setSaving] = useState(false);

  // Courses state
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [createCourseForm, setCreateCourseForm] = useState(emptyCourseForm);
  const [editCourseForm, setEditCourseForm] = useState(null);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [classPickerCourseId, setClassPickerCourseId] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [courseSort, setCourseSort] = useState('newest');
  const [courseStatusFilter, setCourseStatusFilter] = useState('ALL');

  // Teachers state
  const [openTeacherMenuId, setOpenTeacherMenuId] = useState(null);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserForm, setCreateUserForm] = useState(emptyCreateUserForm);
  const [editTeacherForm, setEditTeacherForm] = useState(null);

  // Students state
  const [openStudentMenuId, setOpenStudentMenuId] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('ALL');
  const [classFilterOpen, setClassFilterOpen] = useState(false);
  const [classFilterSearch, setClassFilterSearch] = useState('');
  const [studentBlockFilter, setStudentBlockFilter] = useState('ALL');
  const [studentStatusFilter, setStudentStatusFilter] = useState('ALL');
  const [editStudentForm, setEditStudentForm] = useState(null);
  const [addToClassStudent, setAddToClassStudent] = useState(null);
  const [addToClassId, setAddToClassId] = useState('');

  const courses = data?.courses || [];
  const teachers = data?.teachers || [];
  const students = data?.students || [];
  const classes = data?.classes || [];
  const users = data?.users || [];
  const invoices = data?.invoices || [];
  const payments = data?.payments || [];
  const classProgress = data?.classProgress || [];
  const studentKpis = data?.studentKpis || [];
  const teacherKpis = data?.teacherKpis || [];

  const courseStats = useMemo(() => {
    const classCountByCourse = {};
    classes.forEach((cls) => {
      classCountByCourse[cls.CourseId] = (classCountByCourse[cls.CourseId] || 0) + 1;
    });
    const enrolledStudents = students.filter((s) =>
      (s.ClassEnrollments || []).some((e) => e.Status === 0 || e.Status === 1)
    ).length;
    const potentialRevenue = courses.reduce(
      (sum, c) => sum + Number(c.BasePrice || 0) * (classCountByCourse[c.Id] || 0),
      0
    );
    const topCourse = courses.reduce((best, c) => {
      const count = classCountByCourse[c.Id] || 0;
      if (!best || count > best.count) return { course: c, count };
      return best;
    }, null);
    return {
      totalClasses: classes.length,
      enrolledStudents,
      potentialRevenue,
      topCourse: topCourse && topCourse.count > 0 ? topCourse.course : null,
      classCountByCourse,
    };
  }, [courses, classes, students]);

  const filteredSortedCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    let list = courses.filter(
      (c) => !q || (c.Title || '').toLowerCase().includes(q) || (c.CourseCode || '').toLowerCase().includes(q)
    );
    if (courseStatusFilter !== 'ALL') {
      list = list.filter((c) => String(c.Status) === courseStatusFilter);
    }
    const classCountOf = (c) => courseStats.classCountByCourse[c.Id] || 0;
    switch (courseSort) {
      case 'price_desc':
        list = [...list].sort((a, b) => Number(b.BasePrice) - Number(a.BasePrice));
        break;
      case 'price_asc':
        list = [...list].sort((a, b) => Number(a.BasePrice) - Number(b.BasePrice));
        break;
      case 'classes_desc':
        list = [...list].sort((a, b) => classCountOf(b) - classCountOf(a));
        break;
      case 'title_asc':
        list = [...list].sort((a, b) => (a.Title || '').localeCompare(b.Title || '', 'vi'));
        break;
      default:
        list = [...list].sort((a, b) => b.Id - a.Id);
    }
    return list;
  }, [courses, courseSearch, courseSort, courseStatusFilter, courseStats]);

  const tabNames = {
    tabCourses: 'Quản lý Khóa / Lớp Học',
    tabRevenue: 'Doanh thu & Báo cáo',
    tabTeachers: 'Quản lý Giáo viên',
    tabStudents: 'Quản lý Học sinh',
    tabPayments: 'Thanh toán học phí',
    tabProgress: 'Tiến độ học tập',
    tabKpi: 'Đánh giá KPI',
  };

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams(tabKey === 'tabCourses' ? {} : { tab: tabKey });
  };

  const filteredTeachers = useMemo(() => {
    const q = teacherSearch.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter((t) =>
      (t.FullName || '').toLowerCase().includes(q) ||
      (t.Email || '').toLowerCase().includes(q) ||
      (t.Phone || '').toLowerCase().includes(q)
    );
  }, [teachers, teacherSearch]);

  const handleCreateUserChange = (field) => (e) => {
    setCreateUserForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/Admin/CreateUser', createUserForm);
      setShowCreateUserModal(false);
      setCreateUserForm(emptyCreateUserForm);
    } catch (err) {
      alert('Không thể tạo tài khoản.');
      setSaving(false);
    }
  };

  // ---- Courses handlers ----
  const handleCreateCourseChange = (field) => (e) => {
    setCreateCourseForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/Admin/CreateCourse', createCourseForm);
      setShowCreateCourseModal(false);
      setCreateCourseForm(emptyCourseForm);
      refetch();
    } catch (err) {
      alert('Không thể tạo khóa học.');
    } finally {
      setSaving(false);
    }
  };

  const openEditCourseModal = (course) => {
    setActiveActionRow(null);
    setEditCourseForm({
      id: course.Id,
      title: course.Title || '',
      description: course.Description || '',
      basePrice: course.BasePrice,
      totalLessons: course.TotalLessons,
      tags: course.MetadataTags || '',
    });
  };

  const handleEditCourseChange = (field) => (e) => {
    setEditCourseForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleEditCourseSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/Course/Update/${editCourseForm.id}`, editCourseForm);
      setEditCourseForm(null);
      refetch();
    } catch (err) {
      alert('Không thể cập nhật khóa học.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    setActiveActionRow(null);
    if (!confirm(`Xác nhận xóa khóa học "${course.Title}"?`)) return;
    await api.post(`/Admin/DeleteCourse/${course.Id}`, {});
  };

  const openEditTeacherModal = (t) => {
    setOpenTeacherMenuId(null);
    const p = t.Profile || {};
    setEditTeacherForm({
      teacherId: t.Id,
      fullName: t.FullName || '',
      phone: t.Phone || '',
      teacherTitle: p.TeacherTitle || '',
      subject: p.Subject || '',
      teacherExperience: p.TeacherExperience ?? '',
      teacherStudents: p.TeacherStudents ?? '',
      teacherRating: p.TeacherRating ?? '',
      teacherBio: p.TeacherBio || '',
    });
  };

  const handleEditTeacherChange = (field) => (e) => {
    setEditTeacherForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleEditTeacherSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/Admin/UpdateTeacherInfo', editTeacherForm);
      if (res.data?.success) {
        setEditTeacherForm(null);
        refetch();
      } else {
        alert(res.data?.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTeacherStatus = async (t) => {
    setOpenTeacherMenuId(null);
    await api.post(`/Admin/ToggleUserStatus/${t.Id}`, {});
  };

  const handleDeleteTeacher = async (t) => {
    setOpenTeacherMenuId(null);
    if (!confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN giáo viên này khỏi hệ thống không?')) return;
    await api.post(`/Admin/DeleteUser/${t.Id}`, {});
  };

  // ---- Students derived data ----
  const enrichedStudents = useMemo(() => {
    return students.map((s, idx) => {
      const sp = s.Profile || {};
      let className = 'Chưa add';
      if (s.ClassEnrollments && s.ClassEnrollments.length > 0) {
        const active = s.ClassEnrollments.find((e) => e.Status === 0 || e.Status === 1) || s.ClassEnrollments[0];
        if (active && active.Class) {
          className = active.Class.Course ? active.Class.Course.Title : active.Class.ClassName;
        }
      }
      const blockName = s.Id % 3 === 0 ? 'Khối 10' : s.Id % 3 === 1 ? 'Khối 11' : 'Khối 12';
      let statusText = 'Đang học';
      if (s.Status === 1) statusText = 'Đã nghỉ học';
      else if (s.Status === 2) statusText = 'Bảo lưu';
      return { ...s, _idx: idx + 1, _className: className, _blockName: blockName, _statusText: statusText, _profile: sp };
    });
  }, [students]);

  const uniqueClassNames = useMemo(() => {
    const set = new Set();
    classes.forEach((cls) => {
      if (cls.Course && cls.Course.Title) set.add(cls.Course.Title);
      else if (cls.ClassName) set.add(cls.ClassName);
    });
    return Array.from(set);
  }, [classes]);

  const filteredClassFilterOptions = useMemo(() => {
    const q = classFilterSearch.trim().toLowerCase();
    if (!q) return uniqueClassNames;
    return uniqueClassNames.filter((name) => name.toLowerCase().includes(q));
  }, [uniqueClassNames, classFilterSearch]);

  useEffect(() => {
    if (!classFilterOpen) return;
    const close = () => setClassFilterOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [classFilterOpen]);

  const selectClassFilter = (value) => {
    setStudentClassFilter(value);
    setClassFilterOpen(false);
    setClassFilterSearch('');
  };

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return enrichedStudents.filter((s) => {
      if (q && !(s.FullName || '').toLowerCase().includes(q) && !(s.Email || '').toLowerCase().includes(q) && !(s.Phone || '').includes(q)) return false;
      if (studentClassFilter !== 'ALL' && s._className !== studentClassFilter) return false;
      if (studentBlockFilter !== 'ALL' && s._blockName !== studentBlockFilter) return false;
      if (studentStatusFilter !== 'ALL' && s._statusText !== studentStatusFilter) return false;
      return true;
    });
  }, [enrichedStudents, studentSearch, studentClassFilter, studentBlockFilter, studentStatusFilter]);

  const parents = useMemo(() => users.filter((u) => u.Role === 4), [users]);

  const openEditStudentModal = (s) => {
    setOpenStudentMenuId(null);
    const sp = s._profile || {};
    setEditStudentForm({
      studentId: s.Id,
      fullName: s.FullName || '',
      phone: s.Phone || '',
      gender: sp.Gender ?? '',
      dob: sp.Dob ? new Date(sp.Dob).toISOString().slice(0, 10) : '',
      address: sp.Address || '',
      parentId: sp.ParentId || '',
    });
  };

  const handleEditStudentChange = (field) => (e) => {
    setEditStudentForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleEditStudentSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/Admin/UpdateStudentInfo', editStudentForm);
      if (res.data?.success) {
        setEditStudentForm(null);
        refetch();
      } else {
        alert(res.data?.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStudentStatus = async (s) => {
    setOpenStudentMenuId(null);
    await api.post(`/Admin/ToggleUserStatus/${s.Id}`, {});
  };

  const handleDeleteStudent = async (s) => {
    setOpenStudentMenuId(null);
    if (!confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN học sinh này khỏi hệ thống không?')) return;
    await api.post(`/Admin/DeleteUser/${s.Id}`, {});
  };

  const openAddToClassModal = (s) => {
    setOpenStudentMenuId(null);
    setAddToClassStudent(s);
    setAddToClassId('');
  };

  const handleAddToClassSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/Admin/AddStudentToClass', { studentId: addToClassStudent.Id, classId: addToClassId });
      if (res.data?.success) {
        setAddToClassStudent(null);
        refetch();
      } else {
        alert(res.data?.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const exportStudentsCSV = () => {
    const header = ['Họ Tên', 'Email', 'Số Điện Thoại', 'Lớp học', 'Khối lớp', 'Trạng thái'];
    const rows = filteredStudents.map((s) => [s.FullName, s.Email, s.Phone, s._className, s._blockName, s._statusText]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'danh-sach-hoc-sinh.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Revenue derived data ----
  const revenueStats = useMemo(() => {
    let paidRevenue = 0;
    let unpaidRevenue = 0;
    let paidCount = 0;
    invoices.forEach((inv) => {
      if (inv.Status === 1) {
        paidRevenue += Number(inv.Amount);
        paidCount++;
      } else {
        unpaidRevenue += Number(inv.Amount);
      }
    });
    const paidPercentage = invoices.length > 0 ? (paidCount / invoices.length) * 100 : 0;
    return { paidRevenue, unpaidRevenue, paidPercentage };
  }, [invoices]);

  const handleMarkInvoicePaid = async (inv) => {
    await api.post(`/Admin/MarkInvoicePaid/${inv.Id}`, {});
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabClick={handleTabClick}
      breadcrumb={['Trang chủ', 'Quản trị hệ thống', tabNames[activeTab]]}
    >
      {/* TAB: COURSES */}
      {activeTab === 'tabCourses' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-serif font-bold text-slate-900 text-3xl">Khóa Học Khung</h3>
            <p className="text-sm text-slate-500 mt-1.5">
              {courses.length} chương trình đào tạo · {classes.length} lớp học thực tế đang vận hành
            </p>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">school</span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 leading-none">{courses.length}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">Khóa học đang mở</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">groups</span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 leading-none">{courseStats.totalClasses}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">Lớp học thực tế</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">how_to_reg</span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 leading-none">{courseStats.enrolledStudents}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">Học viên đang theo học</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 leading-none">{(courseStats.potentialRevenue / 1000000).toFixed(1)}tr</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">Doanh thu tiềm năng</div>
              </div>
            </div>
          </div>

          {courseStats.topCourse && (
            <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-2xl border border-primary/20 p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[22px]">workspace_premium</span>
              <p className="text-sm text-slate-700">
                <strong className="text-primary">{courseStats.topCourse.Title}</strong> đang là khóa học có nhiều lớp thực tế nhất
                ({courseStats.classCountByCourse[courseStats.topCourse.Id]} lớp đang vận hành).
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-wrap justify-between items-center gap-3 px-6 py-5 border-b border-slate-100">
              <h3 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">menu_book</span> Danh sách khóa học
              </h3>
              <div className="flex items-center gap-2.5 ml-auto">
                <div className="relative w-64">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Tìm theo tên hoặc mã khóa..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none transition-colors"
                  />
                </div>
                <select value={courseStatusFilter} onChange={(e) => setCourseStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                  <option value="ALL">Trạng thái: Tất cả</option>
                  <option value="1">Đang hoạt động</option>
                  <option value="0">Bản nháp</option>
                  <option value="2">Đã lưu trữ</option>
                </select>
                <select value={courseSort} onChange={(e) => setCourseSort(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                  <option value="newest">Sắp xếp: Mới nhất</option>
                  <option value="title_asc">Tên A-Z</option>
                  <option value="price_desc">Học phí: Cao → Thấp</option>
                  <option value="price_asc">Học phí: Thấp → Cao</option>
                  <option value="classes_desc">Nhiều lớp nhất</option>
                </select>
                <button
                  onClick={() => { setCreateCourseForm(emptyCourseForm); setShowCreateCourseModal(true); }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span> Tạo Khóa Học
                </button>
                <button
                  onClick={() => { setClassPickerCourseId(courses[0]?.Id || ''); setShowClassPicker(true); }}
                  className="px-4 py-2 bg-primary text-white hover:bg-primary/80 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">event</span> Tạo Lớp Học
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
                    <th className="p-4 whitespace-nowrap">Mã Khóa</th>
                    <th className="p-4 whitespace-nowrap">Tên Khóa Học</th>
                    <th className="p-4 whitespace-nowrap">Số Buổi</th>
                    <th className="p-4 whitespace-nowrap">Học Phí Gốc</th>
                    <th className="p-4 whitespace-nowrap">Số Lớp</th>
                    <th className="p-4 whitespace-nowrap">Trạng Thái</th>
                    <th className="p-4 text-center whitespace-nowrap">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredSortedCourses.map((course) => {
                    const classCount = courseStats.classCountByCourse[course.Id] || 0;
                    return (
                      <tr key={course.Id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 whitespace-nowrap font-bold text-slate-900">
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md">{course.CourseCode}</span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <a href={`/Admin/Courses/${course.Id}/Classes`} className="flex items-center gap-3 no-underline">
                            {course.ImageUrl ? (
                              <img src={course.ImageUrl} alt="" className="w-9 h-7 rounded-lg object-cover" />
                            ) : (
                              <div className="w-9 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                                <span className="material-symbols-outlined text-[18px]">school</span>
                              </div>
                            )}
                            <span className="font-bold text-slate-800">{course.Title}</span>
                          </a>
                        </td>
                        <td className="p-4 whitespace-nowrap">{course.TotalLessons} buổi</td>
                        <td className="p-4 whitespace-nowrap font-extrabold text-slate-900">
                          {Number(course.BasePrice).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <a href={`/Admin/Courses/${course.Id}/Classes`} className="inline-flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                            <span className="material-symbols-outlined text-sm">groups</span> {classCount} lớp
                          </a>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {course.Status === 1 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                              <span className="material-symbols-outlined text-sm">check_circle</span> Đang hoạt động
                            </span>
                          ) : course.Status === 2 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                              <span className="material-symbols-outlined text-sm">archive</span> Đã lưu trữ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">
                              <span className="material-symbols-outlined text-sm">edit_note</span> Bản nháp
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => openEditCourseModal(course)}
                              title="Chỉnh sửa khóa học"
                              className="w-8 h-8 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-600 flex items-center justify-center transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course)}
                              title="Xóa khóa học"
                              className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-10 text-center text-slate-400 italic">
                        {loading ? 'Đang tải danh sách khóa học...' : 'Chưa có khóa học nào.'}
                      </td>
                    </tr>
                  )}
                  {courses.length > 0 && filteredSortedCourses.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-10 text-center text-slate-400">
                        <span className="material-symbols-outlined text-3xl mb-1.5 block">search_off</span>
                        <span className="text-sm italic">Không tìm thấy khóa học phù hợp.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: REVENUE */}
      {activeTab === 'tabRevenue' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 leading-none">{revenueStats.paidRevenue.toLocaleString('vi-VN')} đ</div>
                <div className="text-sm font-semibold text-slate-500 mt-1.5">Thực nhận (đã thu)</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">pending_actions</span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 leading-none">{revenueStats.unpaidRevenue.toLocaleString('vi-VN')} đ</div>
                <div className="text-sm font-semibold text-slate-500 mt-1.5">Dự thu (chưa thanh toán)</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">donut_large</span>
              </div>
              <div>
                <div className="text-4xl font-black text-slate-900 leading-none">{revenueStats.paidPercentage.toFixed(0)}%</div>
                <div className="text-sm font-semibold text-slate-500 mt-1.5">Tỉ lệ hoàn thành học phí</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
              <h3 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">receipt_long</span> Nhật ký giao dịch đóng học phí gần đây
              </h3>
            </div>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-xs">
                  <th className="p-4 px-6">Mã giao dịch</th>
                  <th className="p-4">Học viên</th>
                  <th className="p-4">Mã hóa đơn</th>
                  <th className="p-4">Số tiền</th>
                  <th className="p-4">Phương thức</th>
                  <th className="p-4 px-6">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {payments.map((p, idx) => (
                  <tr key={p.Id || idx} className="hover:bg-slate-50/60">
                    <td className="p-4 px-6 font-bold text-primary">{p.TransactionCode}</td>
                    <td className="p-4">{p.Invoice?.Student?.FullName || ''}</td>
                    <td className="p-4 text-slate-500">{p.Invoice?.InvoiceCode || ''}</td>
                    <td className="p-4 font-bold text-emerald-600">+{Number(p.Amount).toLocaleString('vi-VN')} đ</td>
                    <td className="p-4">
                      <span className="inline-flex items-center text-xs font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                        {p.PaymentMethod === 1 ? 'Tiền mặt' : 'Chuyển khoản'}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-slate-500">{new Date(p.PaymentTime).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-400 italic">
                      {loading ? 'Đang tải...' : 'Chưa có giao dịch nào.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: TEACHERS */}
      {activeTab === 'tabTeachers' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-wrap justify-between items-center gap-3 px-6 py-5 border-b border-slate-100">
              <h3 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">group</span> Danh sách giáo viên của trung tâm
              </h3>
              <div className="flex items-center gap-2.5 ml-auto">
                <div className="relative w-64">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                  <input
                    type="text"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    placeholder="Tìm kiếm giáo viên..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none transition-colors"
                  />
                </div>
                <button
                  onClick={() => { setCreateUserForm({ ...emptyCreateUserForm, role: 'TEACHER' }); setShowCreateUserModal(true); }}
                  className="px-4 py-2 bg-primary hover:bg-primary/80 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span> Thêm Người Dùng
                </button>
              </div>
            </div>

            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-xs">
                  <th className="p-4 px-5">Họ Tên</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Số Điện Thoại</th>
                  <th className="p-4">Học vị / Môn dạy</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 px-5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredTeachers.map((t) => {
                  const p = t.Profile || {};
                  const initial = (t.FullName || '?').charAt(0).toUpperCase();
                  return (
                    <tr key={t.Id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-black text-sm flex items-center justify-center shrink-0">
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{t.FullName}</div>
                            {p.TeacherTitle && <div className="text-xs text-slate-500 mt-0.5">{p.TeacherTitle}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-slate-500">{t.Email}</td>
                      <td className="p-4 whitespace-nowrap text-slate-500">{t.Phone}</td>
                      <td className="p-4 whitespace-nowrap">
                        {p.Subject ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full font-bold">
                            <span className="material-symbols-outlined text-sm">menu_book</span> {p.Subject}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa cập nhật</span>
                        )}
                        {p.TeacherExperience != null && p.TeacherExperience !== '' && (
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs text-amber-500">star</span> {p.TeacherExperience} năm KN
                          </div>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {t.Status === 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                            <span className="material-symbols-outlined text-sm">check_circle</span> Đang giảng dạy
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
                            <span className="material-symbols-outlined text-sm">lock</span> Đang bị khóa
                          </span>
                        )}
                      </td>
                      <td className="p-4 px-5 text-right relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenTeacherMenuId(openTeacherMenuId === t.Id ? null : t.Id); }}
                          className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                        {openTeacherMenuId === t.Id && (
                          <div className="absolute right-5 top-9 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-40 text-left">
                            <button onClick={() => openEditTeacherModal(t)} className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-[18px] text-sky-600">edit</span> Chỉnh sửa
                            </button>
                            <button onClick={() => handleToggleTeacherStatus(t)} className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                              {t.Status === 0 ? (
                                <><span className="material-symbols-outlined text-[18px] text-amber-600">lock_open</span> Tạm khóa tài khoản</>
                              ) : (
                                <><span className="material-symbols-outlined text-[18px] text-primary">lock</span> Mở khóa tài khoản</>
                              )}
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button onClick={() => handleDeleteTeacher(t)} className="w-full px-3.5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-[18px]">delete</span> Xóa giáo viên
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl mb-1.5 block">
                        {loading ? 'hourglass_empty' : 'person_search'}
                      </span>
                      <span className="text-base italic">
                        {loading ? 'Đang tải danh sách giáo viên...' : 'Không tìm thấy giáo viên nào.'}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: STUDENTS */}
      {activeTab === 'tabStudents' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative w-52 shrink-0">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Tìm kiếm học sinh..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none"
                  />
                </div>
                <div className="relative w-48 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setClassFilterOpen((o) => !o); }}
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none flex items-center justify-between gap-1.5 transition-colors ${
                      classFilterOpen
                        ? 'border-primary bg-white ring-2 ring-primary/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{studentClassFilter === 'ALL' ? 'Lớp học: Tất cả' : studentClassFilter}</span>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0">expand_more</span>
                  </button>
                  {classFilterOpen && (
                    <div onClick={(e) => e.stopPropagation()} className="absolute left-0 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">search</span>
                          <input
                            autoFocus
                            type="text"
                            value={classFilterSearch}
                            onChange={(e) => setClassFilterSearch(e.target.value)}
                            placeholder="Tìm lớp học..."
                            className="w-full pl-7 pr-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        <button type="button" onClick={() => selectClassFilter('ALL')} className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${studentClassFilter === 'ALL' ? 'font-bold text-primary bg-primary/5' : 'text-slate-700'}`}>
                          Tất cả
                        </button>
                        <button type="button" onClick={() => selectClassFilter('Chưa add')} className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${studentClassFilter === 'Chưa add' ? 'font-bold text-primary bg-primary/5' : 'text-slate-700'}`}>
                          Chưa add
                        </button>
                        {filteredClassFilterOptions.map((name) => (
                          <button key={name} type="button" onClick={() => selectClassFilter(name)} className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 truncate ${studentClassFilter === name ? 'font-bold text-primary bg-primary/5' : 'text-slate-700'}`}>
                            {name}
                          </button>
                        ))}
                        {filteredClassFilterOptions.length === 0 && (
                          <div className="px-3 py-4 text-center text-xs text-slate-400 italic">Không tìm thấy lớp học nào.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <select value={studentBlockFilter} onChange={(e) => setStudentBlockFilter(e.target.value)} className="w-36 shrink-0 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                  <option value="ALL">Khối lớp: Tất cả</option>
                  <option value="Khối 10">Khối 10</option>
                  <option value="Khối 11">Khối 11</option>
                  <option value="Khối 12">Khối 12</option>
                </select>
                <select value={studentStatusFilter} onChange={(e) => setStudentStatusFilter(e.target.value)} className="w-40 shrink-0 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                  <option value="ALL">Trạng thái: Tất cả</option>
                  <option value="Đang học">Đang học</option>
                  <option value="Đã nghỉ học">Đã nghỉ học</option>
                  <option value="Bảo lưu">Bảo lưu</option>
                </select>
                <button onClick={exportStudentsCSV} className="shrink-0 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-lg flex items-center gap-1.5 whitespace-nowrap">
                  <span className="material-symbols-outlined text-[18px]">download</span> Xuất dữ liệu
                </button>
              </div>
              <button
                onClick={() => { setCreateUserForm({ ...emptyCreateUserForm, role: 'STUDENT' }); setShowCreateUserModal(true); }}
                className="shrink-0 px-4 py-2 bg-primary hover:bg-primary/80 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span> Thêm Học Sinh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-xs">
                    <th className="p-4 px-5">STT</th>
                    <th className="p-4">Họ Tên</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">SĐT</th>
                    <th className="p-4">Lớp học</th>
                    <th className="p-4">Khối lớp</th>
                    <th className="p-4">Trạng Thái</th>
                    <th className="p-4 px-5 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredStudents.map((s) => (
                    <tr key={s.Id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 px-5 whitespace-nowrap text-slate-400">{s._idx}</td>
                      <td className="p-4 whitespace-nowrap font-bold text-slate-800">{s.FullName}</td>
                      <td className="p-4 whitespace-nowrap text-slate-500">{s.Email}</td>
                      <td className="p-4 whitespace-nowrap text-slate-500">{s.Phone}</td>
                      <td className="p-4 whitespace-nowrap">
                        {s._className === 'Chưa add' ? (
                          <button onClick={() => openAddToClassModal(s)} className="inline-flex items-center gap-1 text-xs font-bold bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full hover:bg-red-100 transition-colors">
                            <span className="material-symbols-outlined text-sm">add_circle</span> Chưa add
                          </button>
                        ) : (
                          <span className="inline-flex items-center text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                            {s._className}
                          </span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap text-slate-500">{s._blockName}</td>
                      <td className="p-4 whitespace-nowrap">
                        {s.Status === 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                            <span className="material-symbols-outlined text-sm">check_circle</span> Đang học
                          </span>
                        ) : s.Status === 2 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">
                            <span className="material-symbols-outlined text-sm">pending</span> Bảo lưu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
                            <span className="material-symbols-outlined text-sm">cancel</span> Đã nghỉ
                          </span>
                        )}
                      </td>
                      <td className="p-4 px-5 text-right relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenStudentMenuId(openStudentMenuId === s.Id ? null : s.Id); }}
                          className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                        {openStudentMenuId === s.Id && (
                          <div className="absolute right-5 top-9 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-40 text-left">
                            <button onClick={() => openEditStudentModal(s)} className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-[18px] text-sky-600">edit</span> Chỉnh sửa
                            </button>
                            <button onClick={() => openAddToClassModal(s)} className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-[18px] text-primary">group_add</span> {s._className === 'Chưa add' ? 'Add vào lớp' : 'Chuyển lớp khác'}
                            </button>
                            <button onClick={() => handleToggleStudentStatus(s)} className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                              {s.Status === 0 ? (
                                <><span className="material-symbols-outlined text-[18px] text-amber-600">lock_open</span> Tạm khóa tài khoản</>
                              ) : (
                                <><span className="material-symbols-outlined text-[18px] text-primary">lock</span> Mở khóa tài khoản</>
                              )}
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button onClick={() => handleDeleteStudent(s)} className="w-full px-3.5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-[18px]">delete</span> Xóa học sinh
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-10 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-1.5 block">
                          {loading ? 'hourglass_empty' : 'person_search'}
                        </span>
                        <span className="text-base italic">
                          {loading ? 'Đang tải danh sách học sinh...' : 'Không tìm thấy học sinh nào.'}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PAYMENTS (Invoices) */}
      {activeTab === 'tabPayments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
            <h3 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">request_quote</span> Danh sách hóa đơn học phí phát hành
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-xs">
                  <th className="p-4 px-6">Mã HĐ</th>
                  <th className="p-4">Học viên</th>
                  <th className="p-4">Lớp Học</th>
                  <th className="p-4">Số Tiền</th>
                  <th className="p-4">Hạn Đóng</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {invoices.map((inv) => (
                  <tr key={inv.Id} className="hover:bg-slate-50/60">
                    <td className="p-4 px-6 font-bold text-slate-800">{inv.InvoiceCode}</td>
                    <td className="p-4">{inv.Student?.FullName || ''}</td>
                    <td className="p-4 text-slate-500">{inv.Class?.ClassName || ''}</td>
                    <td className="p-4 font-bold text-primary">{Number(inv.Amount).toLocaleString('vi-VN')} đ</td>
                    <td className="p-4 text-slate-500">{new Date(inv.DueDate).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4">
                      {inv.Status === 1 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-sm">check_circle</span> Đã Đóng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-sm">schedule</span> Chờ Thanh Toán
                        </span>
                      )}
                    </td>
                    <td className="p-4 px-6 text-right">
                      {inv.Status === 0 ? (
                        <button onClick={() => handleMarkInvoicePaid(inv)} className="px-3 py-1.5 bg-primary hover:bg-primary/80 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">paid</span> Thu tiền
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-emerald-500">check_circle</span> Đã thu đủ
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-slate-400 italic">
                      {loading ? 'Đang tải...' : 'Chưa có hóa đơn nào.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PROGRESS */}
      {activeTab === 'tabProgress' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
            <h3 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">insights</span> Theo dõi tiến trình giảng dạy của các lớp
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-xs">
                  <th className="p-4 px-6">Lớp Học</th>
                  <th className="p-4">Khóa Học</th>
                  <th className="p-4">Giáo Viên Giảng Dạy</th>
                  <th className="p-4">Số buổi đã học</th>
                  <th className="p-4">Tổng số buổi</th>
                  <th className="p-4 px-6">Tỉ lệ hoàn thành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {classProgress.map((cp) => {
                  const percent = cp.TotalLessons > 0 ? (cp.TaughtLessons / cp.TotalLessons) * 100 : 0;
                  return (
                    <tr key={cp.ClassId} className="hover:bg-slate-50/60">
                      <td className="p-4 px-6 font-bold text-slate-800">{cp.ClassName}</td>
                      <td className="p-4 text-slate-500">{cp.CourseTitle}</td>
                      <td className="p-4 text-slate-500">{cp.TeacherName}</td>
                      <td className="p-4 font-bold text-primary">{cp.TaughtLessons} buổi</td>
                      <td className="p-4 text-slate-500">{cp.TotalLessons} buổi</td>
                      <td className="p-4 px-6"><ProgressBar percent={percent} /></td>
                    </tr>
                  );
                })}
                {classProgress.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-400 italic">
                      {loading ? 'Đang tải...' : 'Chưa có dữ liệu tiến độ.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: KPI */}
      {activeTab === 'tabKpi' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <h3 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">military_tech</span> Đánh giá hiệu suất & KPI Học Viên
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-xs">
                    <th className="p-4 px-6">Tên học sinh</th>
                    <th className="p-4">Điểm TB bài tập</th>
                    <th className="p-4">Tỉ lệ nộp bài</th>
                    <th className="p-4">Chuyên cần</th>
                    <th className="p-4">Hiệu suất tổng quan</th>
                    <th className="p-4 px-6">Phân loại AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {studentKpis.map((sk) => {
                    let progress = ((sk.AvgGrade * 10) + (sk.CompletionRate * 100) + (sk.AttendanceRate * 100)) / 3;
                    progress = Math.max(0, Math.min(100, progress));
                    return (
                      <tr key={sk.StudentId} className="hover:bg-slate-50/60">
                        <td className="p-4 px-6 font-bold text-slate-800">{sk.FullName}</td>
                        <td className={`p-4 font-bold ${sk.AvgGrade >= 8 ? 'text-emerald-600' : sk.AvgGrade >= 5 ? 'text-amber-600' : 'text-red-600'}`}>
                          {Number(sk.AvgGrade).toFixed(1)}/10
                        </td>
                        <td className="p-4 text-slate-500">{(sk.CompletionRate * 100).toFixed(0)}%</td>
                        <td className="p-4 text-slate-500">{(sk.AttendanceRate * 100).toFixed(0)}%</td>
                        <td className="p-4"><ProgressBar percent={progress} /></td>
                        <td className="p-4 px-6">
                          <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${ratingBadgeClass(sk.RatingClass)}`}>{sk.RatingClass}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {studentKpis.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-slate-400 italic">
                        {loading ? 'Đang tải...' : 'Chưa có dữ liệu KPI học sinh.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <h3 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">workspace_premium</span> Đánh giá hiệu suất & KPI Giảng Viên
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-xs">
                    <th className="p-4 px-6">Tên giáo viên</th>
                    <th className="p-4">Lớp phụ trách</th>
                    <th className="p-4">Số buổi đã dạy</th>
                    <th className="p-4">Tỉ lệ đi học lớp</th>
                    <th className="p-4">Chỉ số KPI đạt được</th>
                    <th className="p-4 px-6">Đánh giá chất lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {teacherKpis.map((tk) => {
                    let progress = (Math.min(tk.LessonsTaughtCount / 20.0, 1.0) * 100.0 + tk.AvgClassAttendance * 100.0) / 2.0;
                    progress = Math.max(0, Math.min(100, progress));
                    return (
                      <tr key={tk.TeacherId} className="hover:bg-slate-50/60">
                        <td className="p-4 px-6 font-bold text-slate-800">{tk.FullName}</td>
                        <td className="p-4 text-slate-500">{tk.ActiveClassesCount} lớp đang dạy</td>
                        <td className="p-4 font-bold text-primary">{tk.LessonsTaughtCount} buổi</td>
                        <td className="p-4 text-slate-500">{(tk.AvgClassAttendance * 100).toFixed(0)}%</td>
                        <td className="p-4"><ProgressBar percent={progress} /></td>
                        <td className="p-4 px-6">
                          <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${ratingBadgeClass(tk.PerformanceRating)}`}>{tk.PerformanceRating}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {teacherKpis.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-slate-400 italic">
                        {loading ? 'Đang tải...' : 'Chưa có dữ liệu KPI giáo viên.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setShowCreateUserModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_add</span> Thêm Tài Khoản Mới
              </h3>
              <button onClick={() => setShowCreateUserModal(false)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ Tên</label>
                <input required type="text" value={createUserForm.fullName} onChange={handleCreateUserChange('fullName')} placeholder="Ví dụ: Nguyễn Văn A" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                <input required type="email" value={createUserForm.email} onChange={handleCreateUserChange('email')} placeholder="email@gmail.com" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Số Điện Thoại</label>
                <input required type="text" value={createUserForm.phone} onChange={handleCreateUserChange('phone')} placeholder="0912345678" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu ban đầu</label>
                <input required type="text" value={createUserForm.password} onChange={handleCreateUserChange('password')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                <p className="text-xs text-slate-400 mt-1">Nhập mật khẩu hoặc giữ nguyên mặc định. Hãy ghi nhớ để cung cấp cho người dùng.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Vai trò thành viên</label>
                <select value={createUserForm.role} onChange={handleCreateUserChange('role')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                  <option value="STUDENT">Học Viên (STUDENT)</option>
                  <option value="TEACHER">Giáo Viên (TEACHER)</option>
                  <option value="STAFF">Nhân Viên (STAFF)</option>
                  <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
                </select>
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
                {saving ? 'Đang tạo...' : 'Tạo Tài Khoản'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editTeacherForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setEditTeacherForm(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-violet-600">person_edit</span> Chỉnh sửa thông tin giảng viên
              </h3>
              <button onClick={() => setEditTeacherForm(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditTeacherSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và Tên</label>
                  <input required type="text" value={editTeacherForm.fullName} onChange={handleEditTeacherChange('fullName')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Số Điện Thoại</label>
                  <input type="text" value={editTeacherForm.phone} onChange={handleEditTeacherChange('phone')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Học vị</label>
                  <input type="text" value={editTeacherForm.teacherTitle} onChange={handleEditTeacherChange('teacherTitle')} placeholder="Ví dụ: Thạc sĩ, Tiến sĩ..." className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Môn giảng dạy chính</label>
                  <input type="text" value={editTeacherForm.subject} onChange={handleEditTeacherChange('subject')} placeholder="Ví dụ: Toán, Vật lý..." className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Số năm kinh nghiệm</label>
                  <input type="number" min="0" max="60" value={editTeacherForm.teacherExperience} onChange={handleEditTeacherChange('teacherExperience')} placeholder="5" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Số học sinh đã dạy</label>
                  <input type="number" min="0" value={editTeacherForm.teacherStudents} onChange={handleEditTeacherChange('teacherStudents')} placeholder="100" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Đánh giá (0-5)</label>
                  <input type="number" min="0" max="5" step="0.1" value={editTeacherForm.teacherRating} onChange={handleEditTeacherChange('teacherRating')} placeholder="4.8" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tiểu sử & Giới thiệu</label>
                <textarea rows={4} value={editTeacherForm.teacherBio} onChange={handleEditTeacherChange('teacherBio')} placeholder="Viết vài dòng giới thiệu về giảng viên, thành tích nổi bật, phương pháp giảng dạy..." className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none resize-y" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setEditTeacherForm(null)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">Hủy</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
                  {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editStudentForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setEditStudentForm(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">person_edit</span> Chỉnh sửa thông tin học sinh
              </h3>
              <button onClick={() => setEditStudentForm(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditStudentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và Tên</label>
                  <input required type="text" value={editStudentForm.fullName} onChange={handleEditStudentChange('fullName')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Số Điện Thoại</label>
                  <input required type="text" value={editStudentForm.phone} onChange={handleEditStudentChange('phone')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Giới tính</label>
                  <select value={editStudentForm.gender} onChange={handleEditStudentChange('gender')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                    <option value="">-- Chưa chọn --</option>
                    <option value="0">Nam</option>
                    <option value="1">Nữ</option>
                    <option value="2">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày sinh</label>
                  <input type="date" value={editStudentForm.dob} onChange={handleEditStudentChange('dob')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Địa chỉ</label>
                <input type="text" value={editStudentForm.address} onChange={handleEditStudentChange('address')} placeholder="123 Nguyễn Huệ, Quận 1..." className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Phụ huynh liên kết</label>
                <select value={editStudentForm.parentId} onChange={handleEditStudentChange('parentId')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                  <option value="">-- Chưa liên kết phụ huynh --</option>
                  {parents.map((p) => (
                    <option key={p.Id} value={p.Id}>{p.FullName} ({p.Phone})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setEditStudentForm(null)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">Hủy</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
                  {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add To Class Modal */}
      {addToClassStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setAddToClassStudent(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">school</span> Add Học Sinh Vào Lớp Học
              </h3>
              <button onClick={() => setAddToClassStudent(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddToClassSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Học sinh</label>
                <div className="font-bold text-slate-800 py-2 border-b border-slate-200">{addToClassStudent.FullName}</div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Chọn Lớp học</label>
                <select required value={addToClassId} onChange={(e) => setAddToClassId(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                  <option value="" disabled>-- Chọn lớp học --</option>
                  {classes.map((cls) => (
                    <option key={cls.Id} value={cls.Id}>{cls.ClassName} ({cls.Course ? cls.Course.Title : 'N/A'})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setAddToClassStudent(null)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">Hủy</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
                  {saving ? 'Đang lưu...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setShowCreateCourseModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_circle</span> Tạo Khóa Học Mới
              </h3>
              <button onClick={() => setShowCreateCourseModal(false)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreateCourseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã Khóa học</label>
                <input required type="text" value={createCourseForm.courseCode} onChange={handleCreateCourseChange('courseCode')} placeholder="Ví dụ: TOAN10_MATGOC" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên khóa học</label>
                <input required type="text" value={createCourseForm.title} onChange={handleCreateCourseChange('title')} placeholder="Ví dụ: Toán Lớp 10 Lấy Lại Căn Bản" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả khóa học</label>
                <textarea rows={3} value={createCourseForm.description} onChange={handleCreateCourseChange('description')} placeholder="Nhập tóm tắt nội dung khóa học..." className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Học phí gốc (VNĐ)</label>
                  <input required type="number" value={createCourseForm.basePrice} onChange={handleCreateCourseChange('basePrice')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Số buổi học</label>
                  <input required type="number" value={createCourseForm.totalLessons} onChange={handleCreateCourseChange('totalLessons')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Từ khóa (Tags)</label>
                <input type="text" value={createCourseForm.tags} onChange={handleCreateCourseChange('tags')} placeholder="Ví dụ: toan, mat goc, lop 10" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
                {saving ? 'Đang lưu...' : 'Lưu Khóa Học'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editCourseForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setEditCourseForm(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-600">edit</span> Sửa Thông Tin Khóa Học
              </h3>
              <button onClick={() => setEditCourseForm(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditCourseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên khóa học</label>
                <input required type="text" value={editCourseForm.title} onChange={handleEditCourseChange('title')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả khóa học</label>
                <textarea rows={3} value={editCourseForm.description} onChange={handleEditCourseChange('description')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Học phí gốc (VNĐ)</label>
                  <input required type="number" value={editCourseForm.basePrice} onChange={handleEditCourseChange('basePrice')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Số buổi học</label>
                  <input required type="number" value={editCourseForm.totalLessons} onChange={handleEditCourseChange('totalLessons')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Từ khóa (Tags)</label>
                <input type="text" value={editCourseForm.tags} onChange={handleEditCourseChange('tags')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setEditCourseForm(null)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">Hủy</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
                  {saving ? 'Đang lưu...' : 'Cập Nhật Khóa Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Picker Modal (leads into CourseClassesPage to actually create the class) */}
      {showClassPicker && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setShowClassPicker(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">event</span> Tạo Lớp Học Mới
              </h3>
              <button onClick={() => setShowClassPicker(false)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Chọn khóa học để tạo lớp học thực tế (lịch học, giáo viên phụ trách, sĩ số...).</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Khóa học</label>
                <select value={classPickerCourseId} onChange={(e) => setClassPickerCourseId(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                  {courses.map((c) => (
                    <option key={c.Id} value={c.Id}>{c.Title} ({c.CourseCode})</option>
                  ))}
                </select>
              </div>
              <a
                href={classPickerCourseId ? `/Admin/Courses/${classPickerCourseId}/Classes` : undefined}
                className={`w-full py-2.5 rounded-xl text-sm font-bold text-center block transition-all ${
                  classPickerCourseId ? 'bg-primary hover:bg-primary/80 text-white' : 'bg-slate-100 text-slate-400 pointer-events-none'
                }`}
              >
                Tiếp tục
              </a>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
