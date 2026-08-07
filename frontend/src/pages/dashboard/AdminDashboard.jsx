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
  status: 'OPEN',
  subject: '',
  gradeLevel: '',
  priceNote: '',
  lessonDuration: '',
  plannedStartDate: '',
};

const SUBJECT_OPTIONS = ['Toán', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lý', 'Tin học', 'Khác'];
const GRADE_LEVEL_OPTIONS = ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];

// MetadataTags/Description have no dedicated DB columns for subject/grade/fee-note/duration/planned date,
// so these are encoded into the existing text fields with a parseable convention and decoded back on edit.
const encodeTags = ({ subject, gradeLevel, tags }) => {
  const parts = [];
  if (subject) parts.push(`mon:${subject}`);
  if (gradeLevel) parts.push(`khoi:${gradeLevel}`);
  if (tags) parts.push(tags);
  return parts.join(', ');
};

const decodeTags = (tagsStr) => {
  const items = (tagsStr || '').split(',').map((s) => s.trim()).filter(Boolean);
  let subject = '';
  let gradeLevel = '';
  const rest = [];
  items.forEach((item) => {
    if (item.startsWith('mon:')) subject = item.slice(4).trim();
    else if (item.startsWith('khoi:')) gradeLevel = item.slice(5).trim();
    else rest.push(item);
  });
  return { subject, gradeLevel, tags: rest.join(', ') };
};

const DESCRIPTION_META_MARKER = '\n\n---\n';

const encodeDescription = ({ description, priceNote, lessonDuration, plannedStartDate }) => {
  const metaLines = [];
  if (priceNote) metaLines.push(`Ghi chú học phí: ${priceNote}`);
  if (lessonDuration) metaLines.push(`Thời lượng mỗi buổi: ${lessonDuration} phút`);
  if (plannedStartDate) metaLines.push(`Ngày dự kiến khai giảng: ${plannedStartDate}`);
  const base = description || '';
  return metaLines.length > 0 ? `${base}${DESCRIPTION_META_MARKER}${metaLines.join('\n')}` : base;
};

const decodeDescription = (descriptionRaw) => {
  const raw = descriptionRaw || '';
  const idx = raw.indexOf(DESCRIPTION_META_MARKER);
  if (idx === -1) return { description: raw, priceNote: '', lessonDuration: '', plannedStartDate: '' };
  const description = raw.slice(0, idx);
  const metaBlock = raw.slice(idx + DESCRIPTION_META_MARKER.length);
  const priceNoteMatch = metaBlock.match(/Ghi chú học phí: (.+)/);
  const lessonDurationMatch = metaBlock.match(/Thời lượng mỗi buổi: (\d+) phút/);
  const plannedStartDateMatch = metaBlock.match(/Ngày dự kiến khai giảng: (.+)/);
  return {
    description,
    priceNote: priceNoteMatch ? priceNoteMatch[1].trim() : '',
    lessonDuration: lessonDurationMatch ? lessonDurationMatch[1].trim() : '',
    plannedStartDate: plannedStartDateMatch ? plannedStartDateMatch[1].trim() : '',
  };
};

const emptyClassForm = {
  courseId: '',
  teacherId: '',
  className: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  scheduleDays: '2,5',
  scheduleTimes: '18:00-19:30',
  maxStudents: 25,
};

const ratingDotColor = (rating) => {
  if (rating === 'Xuất sắc') return 'emerald';
  if (rating === 'Khá' || rating === 'Tốt') return 'sky';
  if (rating === 'Đạt') return 'amber';
  return 'red';
};

function usePagination(items, initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    pageItems,
    setPage,
    setPageSize: (size) => { setPageSize(size); setPage(1); },
  };
}

function Pagination({ page, pageSize, totalItems, totalPages, onPageChange, onPageSizeChange }) {
  if (totalItems === 0) return null;
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  let startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  startPage = Math.max(1, endPage - 4);
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  const navBtn = "w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span>Đang hiển thị {startItem}–{endItem} trên {totalItems}</span>
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="appearance-none bg-none pl-2.5 pr-7 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:border-primary outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[16px]">expand_more</span>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button disabled={page === 1} onClick={() => onPageChange(1)} className={navBtn} title="Trang đầu">
            <span className="material-symbols-outlined text-[18px]">first_page</span>
          </button>
          <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className={navBtn} title="Trang trước">
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                p === page ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)} className={navBtn} title="Trang sau">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
          <button disabled={page === totalPages} onClick={() => onPageChange(totalPages)} className={navBtn} title="Trang cuối">
            <span className="material-symbols-outlined text-[18px]">last_page</span>
          </button>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ percent, color = 'bg-primary' }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-700 w-9 text-right">{clamped.toFixed(0)}%</span>
    </div>
  );
}

const DOT_COLORS = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
  slate: 'bg-slate-400',
};

function StatusDot({ color = 'slate', children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
      <span className={`w-2 h-2 rounded-full shrink-0 ${DOT_COLORS[color] || DOT_COLORS.slate}`} />
      {children}
    </span>
  );
}

// sortValue: current sort string (e.g. "title_asc"); field: base name (e.g. "title")
function SortableTh({ label, field, sortValue, onSort, className = '', align }) {
  const isAsc = sortValue === `${field}_asc`;
  const isDesc = sortValue === `${field}_desc`;
  return (
    <th className={`p-4 whitespace-nowrap select-none ${className}`}>
      <button
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 hover:text-slate-700 transition-colors ${align === 'right' ? 'justify-end w-full' : ''}`}
      >
        {label}
        <span className="flex flex-col leading-none text-[9px] -space-y-0.5">
          <span className={isAsc ? 'text-primary' : 'text-slate-300'}>▲</span>
          <span className={isDesc ? 'text-primary' : 'text-slate-300'}>▼</span>
        </span>
      </button>
    </th>
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
  const [classForm, setClassForm] = useState(emptyClassForm);
  const [createCourseImageFile, setCreateCourseImageFile] = useState(null);
  const [createCourseImagePreview, setCreateCourseImagePreview] = useState(null);
  const [editCourseImageFile, setEditCourseImageFile] = useState(null);
  const [editCourseImagePreview, setEditCourseImagePreview] = useState(null);
  const [editCourseRemoveImage, setEditCourseRemoveImage] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseSort, setCourseSort] = useState('newest');
  const [courseStatusFilter, setCourseStatusFilter] = useState('ALL');
  const [openCourseMenuId, setOpenCourseMenuId] = useState(null);
  const toggleCourseSort = (field) => {
    setCourseSort((prev) => (prev === `${field}_asc` ? `${field}_desc` : `${field}_asc`));
  };

  // Teachers state
  const [openTeacherMenuId, setOpenTeacherMenuId] = useState(null);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserForm, setCreateUserForm] = useState(emptyCreateUserForm);
  const [editTeacherForm, setEditTeacherForm] = useState(null);
  const [editTeacherAvatarPreview, setEditTeacherAvatarPreview] = useState(null);
  const [evaluationModal, setEvaluationModal] = useState(null); // teacher object
  const [evaluationForm, setEvaluationForm] = useState({ period: '', periodDate: '', criteria: [{ name: '', score: '', comment: '' }], overallComment: '' });
  const [savingEvaluation, setSavingEvaluation] = useState(false);

  const openEvaluationModal = (teacher) => {
    setEvaluationForm({ period: '', periodDate: new Date().toISOString().slice(0, 10), criteria: [{ name: '', score: '', comment: '' }], overallComment: '' });
    setEvaluationModal(teacher);
  };
  const addEvaluationCriterion = () => setEvaluationForm((f) => ({ ...f, criteria: [...f.criteria, { name: '', score: '', comment: '' }] }));
  const removeEvaluationCriterion = (i) => setEvaluationForm((f) => ({ ...f, criteria: f.criteria.filter((_, idx) => idx !== i) }));
  const updateEvaluationCriterion = (i, field, value) => setEvaluationForm((f) => ({
    ...f,
    criteria: f.criteria.map((c, idx) => (idx === i ? { ...c, [field]: value } : c))
  }));
  const submitEvaluation = async (e) => {
    e.preventDefault();
    setSavingEvaluation(true);
    try {
      await api.post('/Admin/CreateTeacherEvaluation', {
        teacherId: evaluationModal.Id,
        period: evaluationForm.period,
        periodDate: evaluationForm.periodDate,
        criteria: evaluationForm.criteria.filter((c) => c.name.trim() !== ''),
        overallComment: evaluationForm.overallComment
      });
      alert('Đã lưu đánh giá KPI giảng viên!');
      setEvaluationModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi lưu đánh giá KPI.');
    } finally {
      setSavingEvaluation(false);
    }
  };

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
      case 'code_asc':
        list = [...list].sort((a, b) => (a.CourseCode || '').localeCompare(b.CourseCode || '', 'vi'));
        break;
      case 'code_desc':
        list = [...list].sort((a, b) => (b.CourseCode || '').localeCompare(a.CourseCode || '', 'vi'));
        break;
      case 'title_asc':
        list = [...list].sort((a, b) => (a.Title || '').localeCompare(b.Title || '', 'vi'));
        break;
      case 'title_desc':
        list = [...list].sort((a, b) => (b.Title || '').localeCompare(a.Title || '', 'vi'));
        break;
      case 'lessons_asc':
        list = [...list].sort((a, b) => Number(a.TotalLessons) - Number(b.TotalLessons));
        break;
      case 'lessons_desc':
        list = [...list].sort((a, b) => Number(b.TotalLessons) - Number(a.TotalLessons));
        break;
      case 'price_desc':
        list = [...list].sort((a, b) => Number(b.BasePrice) - Number(a.BasePrice));
        break;
      case 'price_asc':
        list = [...list].sort((a, b) => Number(a.BasePrice) - Number(b.BasePrice));
        break;
      case 'classes_desc':
        list = [...list].sort((a, b) => classCountOf(b) - classCountOf(a));
        break;
      case 'classes_asc':
        list = [...list].sort((a, b) => classCountOf(a) - classCountOf(b));
        break;
      case 'status_asc':
        list = [...list].sort((a, b) => a.Status - b.Status);
        break;
      case 'status_desc':
        list = [...list].sort((a, b) => b.Status - a.Status);
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

  const handleCreateCourseImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setCreateCourseImageFile(file);
    setCreateCourseImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('courseCode', createCourseForm.courseCode);
      formData.append('title', createCourseForm.title);
      formData.append('description', encodeDescription(createCourseForm));
      formData.append('basePrice', createCourseForm.basePrice);
      formData.append('totalLessons', createCourseForm.totalLessons);
      formData.append('tags', encodeTags(createCourseForm));
      formData.append('status', createCourseForm.status);
      if (createCourseImageFile) formData.append('courseImage', createCourseImageFile);
      await api.post('/Admin/CreateCourse', formData, { headers: { 'Content-Type': undefined } });
      setShowCreateCourseModal(false);
      setCreateCourseForm(emptyCourseForm);
      setCreateCourseImageFile(null);
      setCreateCourseImagePreview(null);
      refetch();
    } catch (err) {
      alert('Không thể tạo khóa học.');
    } finally {
      setSaving(false);
    }
  };

  const openEditCourseModal = (course) => {
    setOpenCourseMenuId(null);
    const statusKeyMap = { 0: 'CLOSED', 1: 'OPEN', 2: 'ARCHIVED', 3: 'FULL' };
    const { subject, gradeLevel, tags } = decodeTags(course.MetadataTags);
    const { description, priceNote, lessonDuration, plannedStartDate } = decodeDescription(course.Description);
    setEditCourseForm({
      id: course.Id,
      title: course.Title || '',
      description,
      basePrice: course.BasePrice,
      totalLessons: course.TotalLessons,
      tags,
      subject,
      gradeLevel,
      priceNote,
      lessonDuration,
      plannedStartDate,
      status: statusKeyMap[course.Status] || 'OPEN',
      currentImageUrl: course.ImageUrl || '',
    });
    setEditCourseImageFile(null);
    setEditCourseImagePreview(null);
    setEditCourseRemoveImage(false);
  };

  const handleEditCourseChange = (field) => (e) => {
    setEditCourseForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleEditCourseImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setEditCourseImageFile(file);
    setEditCourseImagePreview(file ? URL.createObjectURL(file) : null);
    if (file) setEditCourseRemoveImage(false);
  };

  const handleRemoveEditCourseImage = () => {
    setEditCourseImageFile(null);
    setEditCourseImagePreview(null);
    setEditCourseRemoveImage(true);
  };

  const handleEditCourseSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', editCourseForm.title);
      formData.append('description', encodeDescription(editCourseForm));
      formData.append('basePrice', editCourseForm.basePrice);
      formData.append('totalLessons', editCourseForm.totalLessons);
      formData.append('tags', encodeTags(editCourseForm));
      formData.append('status', editCourseForm.status);
      formData.append('removeImage', editCourseRemoveImage ? 'true' : 'false');
      if (editCourseImageFile) formData.append('courseImage', editCourseImageFile);
      await api.post(`/Course/Update/${editCourseForm.id}`, formData, { headers: { 'Content-Type': undefined } });
      setEditCourseForm(null);
      refetch();
    } catch (err) {
      alert('Không thể cập nhật khóa học.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    setOpenCourseMenuId(null);
    if (!confirm(`Xác nhận xóa khóa học "${course.Title}"?`)) return;
    await api.post(`/Admin/DeleteCourse/${course.Id}`, {});
  };

  const handleClassFormChange = (field) => (e) => {
    setClassForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCreateClassSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { courseId, ...rest } = classForm;
      await api.post('/Admin/CreateClass', { courseId, ...rest });
      setShowClassPicker(false);
      setClassForm(emptyClassForm);
      refetch();
    } catch (err) {
      alert('Không thể tạo lớp học. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSaving(false);
    }
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
      avatarUrl: t.AvatarUrl || '',
      avatarFile: null,
    });
    setEditTeacherAvatarPreview(null);
  };

  const closeEditTeacherModal = () => {
    if (editTeacherAvatarPreview) URL.revokeObjectURL(editTeacherAvatarPreview);
    setEditTeacherAvatarPreview(null);
    setEditTeacherForm(null);
  };

  const handleEditTeacherChange = (field) => (e) => {
    setEditTeacherForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleEditTeacherAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (editTeacherAvatarPreview) URL.revokeObjectURL(editTeacherAvatarPreview);
    setEditTeacherAvatarPreview(file ? URL.createObjectURL(file) : null);
    setEditTeacherForm((prev) => ({ ...prev, avatarFile: file || null }));
  };

  const handleEditTeacherSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(editTeacherForm).forEach(([key, value]) => {
        if (key === 'avatarFile' || key === 'avatarUrl') return;
        formData.append(key, value ?? '');
      });
      if (editTeacherForm.avatarFile) {
        formData.append('avatar', editTeacherForm.avatarFile);
      }
      const res = await api.post('/Admin/UpdateTeacherInfo', formData, { headers: { 'Content-Type': undefined } });
      if (res.data?.success) {
        closeEditTeacherModal();
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

  // ---- Pagination for each table ----
  const coursesPagination = usePagination(filteredSortedCourses);
  const teachersPagination = usePagination(filteredTeachers);
  const studentsPagination = usePagination(filteredStudents);
  const paymentsPagination = usePagination(payments);
  const invoicesPagination = usePagination(invoices);
  const progressPagination = usePagination(classProgress);
  const studentKpiPagination = usePagination(studentKpis);
  const teacherKpiPagination = usePagination(teacherKpis);

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


          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-wrap justify-between items-center gap-3 px-6 py-5 border-b border-slate-100 sticky top-0 z-20 bg-white">
              <h3 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">menu_book</span> Danh sách khóa học
              </h3>
              <div className="flex items-center gap-2.5 ml-auto">
                <div className="relative w-64">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Tìm theo tên hoặc mã khóa..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div className="relative">
                  <select value={courseStatusFilter} onChange={(e) => setCourseStatusFilter(e.target.value)} className="appearance-none bg-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                    <option value="ALL">Trạng thái: Tất cả</option>
                    <option value="1">Đang mở đăng ký</option>
                    <option value="3">Đã đầy</option>
                    <option value="0">Ngừng tuyển sinh</option>
                    <option value="2">Lưu trữ</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                </div>
                <button
                  onClick={() => { setCreateCourseForm(emptyCourseForm); setCreateCourseImageFile(null); setCreateCourseImagePreview(null); setShowCreateCourseModal(true); }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span> Tạo Khóa Học
                </button>
                <button
                  onClick={() => { setClassForm({ ...emptyClassForm, courseId: courses[0]?.Id || '', teacherId: teachers[0]?.Id || '' }); setShowClassPicker(true); }}
                  className="px-4 py-2 bg-primary text-white hover:bg-primary/80 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">event</span> Tạo Lớp Học
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[560px]">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
                    <SortableTh label="Mã Khóa" field="code" sortValue={courseSort} onSort={toggleCourseSort} />
                    <SortableTh label="Tên Khóa Học" field="title" sortValue={courseSort} onSort={toggleCourseSort} />
                    <SortableTh label="Số Buổi" field="lessons" sortValue={courseSort} onSort={toggleCourseSort} />
                    <SortableTh label="Học Phí Gốc" field="price" sortValue={courseSort} onSort={toggleCourseSort} />
                    <SortableTh label="Số Lớp" field="classes" sortValue={courseSort} onSort={toggleCourseSort} />
                    <SortableTh label="Trạng Thái" field="status" sortValue={courseSort} onSort={toggleCourseSort} />
                    <th className="p-4 text-center whitespace-nowrap">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {coursesPagination.pageItems.map((course) => {
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
                            <StatusDot color="emerald">Đang mở đăng ký</StatusDot>
                          ) : course.Status === 3 ? (
                            <StatusDot color="sky">Đã đầy</StatusDot>
                          ) : course.Status === 2 ? (
                            <StatusDot color="slate">Lưu trữ</StatusDot>
                          ) : (
                            <StatusDot color="amber">Ngừng tuyển sinh</StatusDot>
                          )}
                        </td>
                        <td className="p-4 text-center whitespace-nowrap relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenCourseMenuId(openCourseMenuId === course.Id ? null : course.Id); }}
                            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                          {openCourseMenuId === course.Id && (
                            <div className="absolute right-6 top-10 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-40 text-left">
                              <a href={`/Admin/Courses/${course.Id}/Classes`} className="px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-[18px] text-primary">groups</span> Xem danh sách lớp
                              </a>
                              <button onClick={() => openEditCourseModal(course)} className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-[18px] text-sky-600">edit</span> Chỉnh sửa khóa học
                              </button>
                              <div className="border-t border-slate-100 my-1"></div>
                              <button onClick={() => handleDeleteCourse(course)} className="w-full px-3.5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-[18px]">delete</span> Xóa khóa học
                              </button>
                            </div>
                          )}
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
            <Pagination
              page={coursesPagination.page}
              pageSize={coursesPagination.pageSize}
              totalItems={coursesPagination.totalItems}
              totalPages={coursesPagination.totalPages}
              onPageChange={coursesPagination.setPage}
              onPageSizeChange={coursesPagination.setPageSize}
            />
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
            <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100 sticky top-0 z-20 bg-white">
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
                {paymentsPagination.pageItems.map((p, idx) => (
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
            <Pagination
              page={paymentsPagination.page}
              pageSize={paymentsPagination.pageSize}
              totalItems={paymentsPagination.totalItems}
              totalPages={paymentsPagination.totalPages}
              onPageChange={paymentsPagination.setPage}
              onPageSizeChange={paymentsPagination.setPageSize}
            />
          </div>
        </div>
      )}

      {/* TAB: TEACHERS */}
      {activeTab === 'tabTeachers' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-wrap justify-between items-center gap-3 px-6 py-5 border-b border-slate-100 sticky top-0 z-20 bg-white">
              <h3 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">group</span> Danh sách giáo viên của trung tâm
              </h3>
              <div className="flex items-center gap-2.5 ml-auto">
                <div className="relative w-64">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input
                    type="text"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    placeholder="Tìm kiếm giáo viên..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none transition-colors"
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
                {teachersPagination.pageItems.map((t) => {
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
                          <StatusDot color="emerald">Đang giảng dạy</StatusDot>
                        ) : (
                          <StatusDot color="red">Đang bị khóa</StatusDot>
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
                            <button onClick={() => { setOpenTeacherMenuId(null); openEvaluationModal(t); }} className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-[18px] text-violet-600">rate_review</span> Đánh giá KPI
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
            <Pagination
              page={teachersPagination.page}
              pageSize={teachersPagination.pageSize}
              totalItems={teachersPagination.totalItems}
              totalPages={teachersPagination.totalPages}
              onPageChange={teachersPagination.setPage}
              onPageSizeChange={teachersPagination.setPageSize}
            />
          </div>
        </div>
      )}

      {/* TAB: STUDENTS */}
      {activeTab === 'tabStudents' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-slate-100 sticky top-0 z-20 bg-white">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative w-52 shrink-0">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Tìm kiếm học sinh..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none"
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
                <div className="relative w-36 shrink-0">
                  <select value={studentBlockFilter} onChange={(e) => setStudentBlockFilter(e.target.value)} className="appearance-none bg-none w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                    <option value="ALL">Khối lớp: Tất cả</option>
                    <option value="Khối 10">Khối 10</option>
                    <option value="Khối 11">Khối 11</option>
                    <option value="Khối 12">Khối 12</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                </div>
                <div className="relative w-40 shrink-0">
                  <select value={studentStatusFilter} onChange={(e) => setStudentStatusFilter(e.target.value)} className="appearance-none bg-none w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                    <option value="ALL">Trạng thái: Tất cả</option>
                    <option value="Đang học">Đang học</option>
                    <option value="Đã nghỉ học">Đã nghỉ học</option>
                    <option value="Bảo lưu">Bảo lưu</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                </div>
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
                  {studentsPagination.pageItems.map((s) => (
                    <tr key={s.Id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 px-5 whitespace-nowrap text-slate-400">{s._idx}</td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar name={s.FullName} />
                          <span className="font-bold text-slate-800">{s.FullName}</span>
                        </div>
                      </td>
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
                          <StatusDot color="emerald">Đang học</StatusDot>
                        ) : s.Status === 2 ? (
                          <StatusDot color="amber">Bảo lưu</StatusDot>
                        ) : (
                          <StatusDot color="red">Đã nghỉ</StatusDot>
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
            <Pagination
              page={studentsPagination.page}
              pageSize={studentsPagination.pageSize}
              totalItems={studentsPagination.totalItems}
              totalPages={studentsPagination.totalPages}
              onPageChange={studentsPagination.setPage}
              onPageSizeChange={studentsPagination.setPageSize}
            />
          </div>
        </div>
      )}

      {/* TAB: PAYMENTS (Invoices) */}
      {activeTab === 'tabPayments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 sticky top-0 z-20 bg-white">
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
                {invoicesPagination.pageItems.map((inv) => (
                  <tr key={inv.Id} className="hover:bg-slate-50/60">
                    <td className="p-4 px-6 font-bold text-slate-800">{inv.InvoiceCode}</td>
                    <td className="p-4">{inv.Student?.FullName || ''}</td>
                    <td className="p-4 text-slate-500">{inv.Class?.ClassName || ''}</td>
                    <td className="p-4 font-bold text-primary">{Number(inv.Amount).toLocaleString('vi-VN')} đ</td>
                    <td className="p-4 text-slate-500">{new Date(inv.DueDate).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4">
                      {inv.Status === 1 ? (
                        <StatusDot color="emerald">Đã Đóng</StatusDot>
                      ) : (
                        <StatusDot color="amber">Chờ Thanh Toán</StatusDot>
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
            <Pagination
              page={invoicesPagination.page}
              pageSize={invoicesPagination.pageSize}
              totalItems={invoicesPagination.totalItems}
              totalPages={invoicesPagination.totalPages}
              onPageChange={invoicesPagination.setPage}
              onPageSizeChange={invoicesPagination.setPageSize}
            />
          </div>
        </div>
      )}

      {/* TAB: PROGRESS */}
      {activeTab === 'tabProgress' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 sticky top-0 z-20 bg-white">
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
                {progressPagination.pageItems.map((cp) => {
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
            <Pagination
              page={progressPagination.page}
              pageSize={progressPagination.pageSize}
              totalItems={progressPagination.totalItems}
              totalPages={progressPagination.totalPages}
              onPageChange={progressPagination.setPage}
              onPageSizeChange={progressPagination.setPageSize}
            />
          </div>
        </div>
      )}

      {/* TAB: KPI */}
      {activeTab === 'tabKpi' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 sticky top-0 z-20 bg-white">
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
                  {studentKpiPagination.pageItems.map((sk) => {
                    let progress = ((sk.AvgGrade * 10) + (sk.CompletionRate * 100) + (sk.AttendanceRate * 100)) / 3;
                    progress = Math.max(0, Math.min(100, progress));
                    return (
                      <tr key={sk.StudentId} className="hover:bg-slate-50/60">
                        <td className="p-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar name={sk.FullName} />
                            <span className="font-bold text-slate-800">{sk.FullName}</span>
                          </div>
                        </td>
                        <td className={`p-4 font-bold ${sk.AvgGrade >= 8 ? 'text-emerald-600' : sk.AvgGrade >= 5 ? 'text-amber-600' : 'text-red-600'}`}>
                          {Number(sk.AvgGrade).toFixed(1)}/10
                        </td>
                        <td className="p-4 text-slate-500">{(sk.CompletionRate * 100).toFixed(0)}%</td>
                        <td className="p-4 text-slate-500">{(sk.AttendanceRate * 100).toFixed(0)}%</td>
                        <td className="p-4"><ProgressBar percent={progress} /></td>
                        <td className="p-4 px-6">
                          <StatusDot color={ratingDotColor(sk.RatingClass)}>{sk.RatingClass}</StatusDot>
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
            <Pagination
              page={studentKpiPagination.page}
              pageSize={studentKpiPagination.pageSize}
              totalItems={studentKpiPagination.totalItems}
              totalPages={studentKpiPagination.totalPages}
              onPageChange={studentKpiPagination.setPage}
              onPageSizeChange={studentKpiPagination.setPageSize}
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 sticky top-0 z-20 bg-white">
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
                  {teacherKpiPagination.pageItems.map((tk) => {
                    let progress = (Math.min(tk.LessonsTaughtCount / 20.0, 1.0) * 100.0 + tk.AvgClassAttendance * 100.0) / 2.0;
                    progress = Math.max(0, Math.min(100, progress));
                    return (
                      <tr key={tk.TeacherId} className="hover:bg-slate-50/60">
                        <td className="p-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar name={tk.FullName} />
                            <span className="font-bold text-slate-800">{tk.FullName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500">{tk.ActiveClassesCount} lớp đang dạy</td>
                        <td className="p-4 font-bold text-primary">{tk.LessonsTaughtCount} buổi</td>
                        <td className="p-4 text-slate-500">{(tk.AvgClassAttendance * 100).toFixed(0)}%</td>
                        <td className="p-4"><ProgressBar percent={progress} /></td>
                        <td className="p-4 px-6">
                          <StatusDot color={ratingDotColor(tk.PerformanceRating)}>{tk.PerformanceRating}</StatusDot>
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
            <Pagination
              page={teacherKpiPagination.page}
              pageSize={teacherKpiPagination.pageSize}
              totalItems={teacherKpiPagination.totalItems}
              totalPages={teacherKpiPagination.totalPages}
              onPageChange={teacherKpiPagination.setPage}
              onPageSizeChange={teacherKpiPagination.setPageSize}
            />
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
                <div className="relative">
                  <select value={createUserForm.role} onChange={handleCreateUserChange('role')} className="appearance-none bg-none w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                    <option value="STUDENT">Học Viên (STUDENT)</option>
                    <option value="TEACHER">Giáo Viên (TEACHER)</option>
                    <option value="STAFF">Nhân Viên (STAFF)</option>
                    <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                </div>
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={closeEditTeacherModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-violet-600">person_edit</span> Chỉnh sửa thông tin giảng viên
              </h3>
              <button onClick={closeEditTeacherModal} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditTeacherSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {editTeacherAvatarPreview ? (
                    <img src={editTeacherAvatarPreview} alt="Xem trước" className="w-full h-full object-cover" />
                  ) : editTeacherForm.avatarUrl ? (
                    <img src={editTeacherForm.avatarUrl} alt="Ảnh đại diện" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-slate-300 text-3xl">person</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ảnh đại diện</label>
                  <input type="file" accept="image/*" onChange={handleEditTeacherAvatarChange} className="text-sm" />
                </div>
              </div>
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
                <button type="button" onClick={closeEditTeacherModal} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">Hủy</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
                  {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher KPI Evaluation Modal */}
      {evaluationModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setEvaluationModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-violet-600">rate_review</span> Đánh giá KPI — {evaluationModal.FullName}
              </h3>
              <button onClick={() => setEvaluationModal(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={submitEvaluation} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Kỳ đánh giá</label>
                  <input required type="text" value={evaluationForm.period} onChange={(e) => setEvaluationForm((f) => ({ ...f, period: e.target.value }))} placeholder="VD: Quý 1/2026" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày đánh giá</label>
                  <input required type="date" value={evaluationForm.periodDate} onChange={(e) => setEvaluationForm((f) => ({ ...f, periodDate: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Tiêu chí đánh giá</label>
                {evaluationForm.criteria.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={c.name} onChange={(e) => updateEvaluationCriterion(i, 'name', e.target.value)} placeholder="Tên tiêu chí (VD: Chất lượng giảng dạy)" className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    <input type="number" min="0" max="10" step="0.1" value={c.score} onChange={(e) => updateEvaluationCriterion(i, 'score', e.target.value)} placeholder="Điểm" className="w-20 px-2 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none text-center" />
                    <input type="text" value={c.comment} onChange={(e) => updateEvaluationCriterion(i, 'comment', e.target.value)} placeholder="Nhận xét" className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    {evaluationForm.criteria.length > 1 && (
                      <button type="button" onClick={() => removeEvaluationCriterion(i)} className="text-red-500 shrink-0"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addEvaluationCriterion} className="text-sm font-bold text-primary hover:underline">+ Thêm tiêu chí</button>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nhận xét tổng quan</label>
                <textarea rows={3} value={evaluationForm.overallComment} onChange={(e) => setEvaluationForm((f) => ({ ...f, overallComment: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none resize-y" />
              </div>

              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setEvaluationModal(null)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">Hủy</button>
                <button type="submit" disabled={savingEvaluation} className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
                  {savingEvaluation ? 'Đang lưu...' : 'Lưu đánh giá'}
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
                  <div className="relative">
                    <select value={editStudentForm.gender} onChange={handleEditStudentChange('gender')} className="appearance-none bg-none w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                      <option value="">-- Chưa chọn --</option>
                      <option value="0">Nam</option>
                      <option value="1">Nữ</option>
                      <option value="2">Khác</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                  </div>
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
                <div className="relative">
                  <select value={editStudentForm.parentId} onChange={handleEditStudentChange('parentId')} className="appearance-none bg-none w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                    <option value="">-- Chưa liên kết phụ huynh --</option>
                    {parents.map((p) => (
                      <option key={p.Id} value={p.Id}>{p.FullName} ({p.Phone})</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                </div>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl h-[90vh] p-8 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="font-bold text-2xl text-slate-900 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-3xl">add_circle</span> Tạo Khóa Học Mới
              </h3>
              <button onClick={() => setShowCreateCourseModal(false)} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreateCourseSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto pr-1 space-y-7">
                <div>
                  <h4 className="font-bold text-base text-slate-900 mb-3">Thông tin cơ bản</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên khóa học</label>
                      <input required type="text" value={createCourseForm.title} onChange={handleCreateCourseChange('title')} placeholder='Ví dụ: Toán 9 - Luyện thi vào 10' className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã khóa học</label>
                      <input required type="text" value={createCourseForm.courseCode} onChange={handleCreateCourseChange('courseCode')} placeholder="Ví dụ: TOAN10_MATGOC" className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Môn học</label>
                      <div className="relative">
                        <select value={createCourseForm.subject} onChange={handleCreateCourseChange('subject')} className="appearance-none bg-none w-full pl-3 pr-8 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                          <option value="">-- Chọn môn học --</option>
                          {SUBJECT_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Cấp độ / Khối lớp</label>
                      <div className="relative">
                        <select value={createCourseForm.gradeLevel} onChange={handleCreateCourseChange('gradeLevel')} className="appearance-none bg-none w-full pl-3 pr-8 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                          <option value="">-- Chọn khối lớp --</option>
                          {GRADE_LEVEL_OPTIONS.map((g) => (<option key={g} value={g}>{g}</option>))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả khóa học</label>
                      <textarea rows={4} value={createCourseForm.description} onChange={handleCreateCourseChange('description')} placeholder="Nội dung chương trình, mục tiêu khóa học..." className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none resize-y" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Ảnh đại diện khóa học</label>
                      {createCourseImagePreview ? (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200">
                          <img src={createCourseImagePreview} alt="Xem trước" className="w-full h-48 object-cover" />
                          <button
                            type="button"
                            onClick={() => { setCreateCourseImageFile(null); setCreateCourseImagePreview(null); }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center"
                            title="Bỏ ảnh"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-200 rounded-xl py-8 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                          <span className="material-symbols-outlined text-slate-400 text-[28px]">add_photo_alternate</span>
                          <span className="text-xs font-semibold text-slate-500">Bấm để chọn ảnh (JPG, PNG)</span>
                          <input type="file" accept="image/*" onChange={handleCreateCourseImageChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-base text-slate-900 mb-3 pt-1 border-t border-slate-100">Học phí</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Học phí trọn gói (VNĐ)</label>
                      <input required type="number" value={createCourseForm.basePrice} onChange={handleCreateCourseChange('basePrice')} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Ghi chú học phí</label>
                      <input type="text" value={createCourseForm.priceNote} onChange={handleCreateCourseChange('priceNote')} placeholder="Ví dụ: Ưu đãi 10% đóng trọn khóa" className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-base text-slate-900 mb-3 pt-1 border-t border-slate-100">Thời lượng & cấu trúc</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Tổng số buổi học</label>
                      <input required type="number" value={createCourseForm.totalLessons} onChange={handleCreateCourseChange('totalLessons')} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Thời lượng mỗi buổi (phút)</label>
                      <input type="number" value={createCourseForm.lessonDuration} onChange={handleCreateCourseChange('lessonDuration')} placeholder="Ví dụ: 90" className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày dự kiến khai giảng</label>
                      <input type="date" value={createCourseForm.plannedStartDate} onChange={handleCreateCourseChange('plannedStartDate')} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Trạng thái khóa học</label>
                      <div className="relative">
                        <select value={createCourseForm.status} onChange={handleCreateCourseChange('status')} className="appearance-none bg-none w-full pl-3 pr-8 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                          <option value="OPEN">Đang mở đăng ký</option>
                          <option value="FULL">Đã đầy</option>
                          <option value="CLOSED">Ngừng tuyển sinh</option>
                          <option value="ARCHIVED">Lưu trữ</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Từ khóa (Tags)</label>
                      <input type="text" value={createCourseForm.tags} onChange={handleCreateCourseChange('tags')} placeholder="Ví dụ: mat goc, luyen thi" className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-slate-100 shrink-0">
                <button type="button" onClick={() => setShowCreateCourseModal(false)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
                  {saving ? 'Đang lưu...' : 'Lưu Khóa Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editCourseForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setEditCourseForm(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl h-[90vh] p-8 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="font-bold text-2xl text-slate-900 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-sky-600 text-3xl">edit</span> Sửa Thông Tin Khóa Học
              </h3>
              <button onClick={() => setEditCourseForm(null)} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditCourseSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto pr-1 space-y-7">
                <div>
                  <h4 className="font-bold text-base text-slate-900 mb-3">Thông tin cơ bản</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên khóa học</label>
                      <input required type="text" value={editCourseForm.title} onChange={handleEditCourseChange('title')} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Môn học</label>
                      <div className="relative">
                        <select value={editCourseForm.subject} onChange={handleEditCourseChange('subject')} className="appearance-none bg-none w-full pl-3 pr-8 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                          <option value="">-- Chọn môn học --</option>
                          {SUBJECT_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Cấp độ / Khối lớp</label>
                      <div className="relative">
                        <select value={editCourseForm.gradeLevel} onChange={handleEditCourseChange('gradeLevel')} className="appearance-none bg-none w-full pl-3 pr-8 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                          <option value="">-- Chọn khối lớp --</option>
                          {GRADE_LEVEL_OPTIONS.map((g) => (<option key={g} value={g}>{g}</option>))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả khóa học</label>
                      <textarea rows={4} value={editCourseForm.description} onChange={handleEditCourseChange('description')} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none resize-y" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Ảnh đại diện khóa học</label>
                      {editCourseImagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200">
                      <img src={editCourseImagePreview} alt="Xem trước" className="w-full h-48 object-cover" />
                      <button
                        type="button"
                        onClick={() => { setEditCourseImageFile(null); setEditCourseImagePreview(null); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center"
                        title="Bỏ ảnh vừa chọn"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                      <span className="absolute bottom-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Ảnh mới</span>
                    </div>
                  ) : editCourseForm.currentImageUrl && !editCourseRemoveImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200">
                      <img src={editCourseForm.currentImageUrl} alt="Ảnh hiện tại" className="w-full h-48 object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveEditCourseImage}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/70 hover:bg-red-600 text-white flex items-center justify-center"
                        title="Xóa ảnh"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                      <label className="absolute bottom-2 right-2 bg-white/95 hover:bg-white text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">sync</span> Đổi ảnh khác
                        <input type="file" accept="image/*" onChange={handleEditCourseImageChange} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-200 rounded-xl py-8 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      <span className="material-symbols-outlined text-slate-400 text-[28px]">add_photo_alternate</span>
                      <span className="text-xs font-semibold text-slate-500">Bấm để chọn ảnh (JPG, PNG)</span>
                      <input type="file" accept="image/*" onChange={handleEditCourseImageChange} className="hidden" />
                    </label>
                  )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-base text-slate-900 mb-3 pt-1 border-t border-slate-100">Học phí</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Học phí trọn gói (VNĐ)</label>
                      <input required type="number" value={editCourseForm.basePrice} onChange={handleEditCourseChange('basePrice')} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Ghi chú học phí</label>
                      <input type="text" value={editCourseForm.priceNote} onChange={handleEditCourseChange('priceNote')} placeholder="Ví dụ: Ưu đãi 10% đóng trọn khóa" className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-base text-slate-900 mb-3 pt-1 border-t border-slate-100">Thời lượng & cấu trúc</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Tổng số buổi học</label>
                      <input required type="number" value={editCourseForm.totalLessons} onChange={handleEditCourseChange('totalLessons')} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Thời lượng mỗi buổi (phút)</label>
                      <input type="number" value={editCourseForm.lessonDuration} onChange={handleEditCourseChange('lessonDuration')} placeholder="Ví dụ: 90" className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày dự kiến khai giảng</label>
                      <input type="date" value={editCourseForm.plannedStartDate} onChange={handleEditCourseChange('plannedStartDate')} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Trạng thái khóa học</label>
                      <div className="relative">
                        <select value={editCourseForm.status} onChange={handleEditCourseChange('status')} className="appearance-none bg-none w-full pl-3 pr-8 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                          <option value="OPEN">Đang mở đăng ký</option>
                          <option value="FULL">Đã đầy</option>
                          <option value="CLOSED">Ngừng tuyển sinh</option>
                          <option value="ARCHIVED">Lưu trữ</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Từ khóa (Tags)</label>
                      <input type="text" value={editCourseForm.tags} onChange={handleEditCourseChange('tags')} placeholder="Ví dụ: mat goc, luyen thi" className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-6 mt-2 border-t border-slate-100 shrink-0">
                <button type="button" onClick={() => setEditCourseForm(null)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">Hủy</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
                  {saving ? 'Đang lưu...' : 'Cập Nhật Khóa Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {showClassPicker && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setShowClassPicker(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl h-[90vh] p-8 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="font-bold text-2xl text-slate-900 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-3xl">event</span> Tạo Lớp Học Mới
              </h3>
              <button onClick={() => setShowClassPicker(false)} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreateClassSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-x-8 gap-y-5 content-start pr-1">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Khóa học</label>
                  <div className="relative">
                    <select required value={classForm.courseId} onChange={handleClassFormChange('courseId')} className="appearance-none bg-none w-full pl-3 pr-8 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                      <option value="" disabled>-- Chọn khóa học --</option>
                      {courses.map((c) => (
                        <option key={c.Id} value={c.Id}>{c.Title} ({c.CourseCode})</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Chọn Giáo Viên</label>
                  <div className="relative">
                    <select required value={classForm.teacherId} onChange={handleClassFormChange('teacherId')} className="appearance-none bg-none w-full pl-3 pr-8 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none">
                      <option value="" disabled>-- Chọn giáo viên --</option>
                      {teachers.map((t) => (
                        <option key={t.Id} value={t.Id}>{t.FullName}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên lớp học</label>
                  <input required type="text" value={classForm.className} onChange={handleClassFormChange('className')} placeholder="Ví dụ: Lớp Toán 10 - Nhóm 2" className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày khai giảng</label>
                  <input required type="date" value={classForm.startDate} onChange={handleClassFormChange('startDate')} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày bế giảng</label>
                  <input required type="date" value={classForm.endDate} onChange={handleClassFormChange('endDate')} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Lịch học hàng tuần (Thứ)</label>
                  <input required type="text" value={classForm.scheduleDays} onChange={handleClassFormChange('scheduleDays')} placeholder="2,5" className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Khung Giờ</label>
                  <input required type="text" value={classForm.scheduleTimes} onChange={handleClassFormChange('scheduleTimes')} placeholder="18:00-19:30" className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Sĩ số tối đa</label>
                  <input required type="number" min="1" value={classForm.maxStudents} onChange={handleClassFormChange('maxStudents')} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-slate-100 shrink-0">
                <button type="button" onClick={() => setShowClassPicker(false)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
                  {saving ? 'Đang lưu...' : 'Lưu & Sinh Lịch Học Tự Động'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
