import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetchData } from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const NAV_ITEMS = [
  { key: 'tabHome', label: 'Trang chủ' },
  { key: 'tabLessons', label: 'Lịch dạy & Điểm danh' },
  { key: 'tabAssignments', label: 'Bài tập về nhà' },
  { key: 'tabExams', label: 'Bài kiểm tra' },
  { key: 'tabCourseProgress', label: 'Tiến độ các khóa học' },
  { key: 'tabMyCourses', label: 'Khóa học của tôi' },
  { key: 'tabStudentKpi', label: 'Đánh giá KPI học viên' },
  { key: 'tabTeacherKpi', label: 'Đánh giá KPI giảng viên' },
  { key: 'tabNotifications', label: 'Thông báo' },
  { key: 'tabTeacherProfile', label: 'Thông tin giới thiệu' },
];

const LESSON_STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'Sắp diễn ra' },
  { value: 'IN_PROGRESS', label: 'Đang học' },
  { value: 'FINISHED', label: 'Đã hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const emptyLessonForm = {
  classId: '',
  title: '',
  lessonDate: new Date().toISOString().slice(0, 10),
  startTimeStr: '18:00',
  endTimeStr: '19:30',
  meetingUrl: '',
  meetingId: '',
  meetingPassword: '',
};

const emptyProfileForm = {
  fullName: '',
  phone: '',
  teacherTitle: '',
  subject: '',
  teacherExperience: 5,
  teacherStudents: 100,
  teacherBio: '',
};

const formatTime = (t) => (t ? String(t).slice(0, 5) : '');

function ProgressBar({ percent, color = 'bg-primary' }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${clamped}%` }} />
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

function Avatar({ name, size = 'w-9 h-9' }) {
  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <div className={`${size} rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm`}>
      {initial}
    </div>
  );
}

export default function TeacherDashboard() {
  const { data, loading, refetch } = useFetchData('/Teacher/Dashboard');
  const { data: notifData, refetch: refetchNotifications } = useFetchData('/Notification/List');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tabHome');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const classes = data?.classes || [];
  const lessons = data?.lessons || [];
  const assignments = data?.assignments || [];
  const submissionCounts = data?.submissionCounts || {};
  const classStudentsMap = data?.classStudentsMap || {};
  const studentKpis = data?.studentKpis || [];
  const teacherLessonsTaught = data?.teacherLessonsTaught || 0;
  const teacherAvgAttendance = data?.teacherAvgAttendance ?? 1;
  const teacherEvaluations = data?.teacherEvaluations || [];
  const [selectedEvalIdx, setSelectedEvalIdx] = useState(0);
  const teacherProfile = data?.teacherProfile || null;
  const teacherUser = data?.teacherUser || null;
  const pendingSubmissions = data?.submissions || [];
  const notifications = notifData?.notifications || [];
  const unreadNotifCount = notifications.filter((n) => !n.IsRead).length;

  const homeworkAssignments = useMemo(() => assignments.filter((a) => a.AssignmentType !== 3), [assignments]);
  const examAssignments = useMemo(() => assignments.filter((a) => a.AssignmentType === 3), [assignments]);

  const currentUserFullName = user?.fullName || 'Giảng viên';
  const initial = currentUserFullName.charAt(0).toUpperCase();

  // ---- Dashboard (Trang chủ) computed stats ----
  const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  const todayLessons = useMemo(() => {
    const today = new Date();
    return lessons.filter((l) => isSameDay(new Date(l.LessonDate), today));
  }, [lessons]);
  const thisWeekLessonsCount = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    return lessons.filter((l) => {
      const d = new Date(l.LessonDate);
      return d >= startOfWeek && d < endOfWeek;
    }).length;
  }, [lessons]);
  const warningStudents = useMemo(
    () => studentKpis.filter((s) => s.AttendanceRate < 0.7 || s.AverageGrade < 5),
    [studentKpis]
  );

  // ---- Lesson grouping (by class) ----
  const groupedLessons = useMemo(() => {
    const groups = {};
    lessons.forEach((l) => {
      const className = l.Class ? l.Class.ClassName : 'Lớp khác';
      if (!groups[className]) groups[className] = [];
      groups[className].push(l);
    });
    return groups;
  }, [lessons]);
  const [openLessonGroups, setOpenLessonGroups] = useState({});
  const toggleLessonGroup = (key) => setOpenLessonGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  const [openLessonMenuId, setOpenLessonMenuId] = useState(null);
  const handleOpenAttendance = async (lessonId) => {
    try {
      await api.post('/Teacher/OpenAttendance', { lessonId });
    } catch (err) {
      // Vẫn điều hướng đến trang điểm danh dù mở thất bại — teacher có thể thử lại tại đó
      console.error(err);
    }
    navigate(`/Teacher/Attendance/${lessonId}`);
  };

  // ---- Assignment / Exam grouping (by class) ----
  const groupByClass = (list) => {
    const groups = {};
    list.forEach((assign) => {
      if (assign.Lesson && assign.Lesson.Class) {
        const classId = assign.Lesson.Class.Id;
        if (!groups[classId]) groups[classId] = { Class: assign.Lesson.Class, List: [] };
        groups[classId].List.push(assign);
      }
    });
    return Object.values(groups);
  };
  const groupedAssignments = useMemo(() => groupByClass(homeworkAssignments), [homeworkAssignments]);
  const groupedExams = useMemo(() => groupByClass(examAssignments), [examAssignments]);
  const [openAssignmentGroups, setOpenAssignmentGroups] = useState({});
  const [openExamGroups, setOpenExamGroups] = useState({});
  const toggleAssignmentGroup = (id) => setOpenAssignmentGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleExamGroup = (id) => setOpenExamGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  // ---- My courses (deduped from classes) ----
  const myCourses = useMemo(() => {
    const seen = new Set();
    const list = [];
    classes.forEach((c) => {
      if (c.Course && !seen.has(c.Course.Id)) {
        seen.add(c.Course.Id);
        list.push(c.Course);
      }
    });
    return list;
  }, [classes]);

  const [progressReportClass, setProgressReportClass] = useState(null);

  // ==================== Lesson Create Modal ====================
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState(emptyLessonForm);
  const [lessonDocFile, setLessonDocFile] = useState(null);

  const handleLessonFormChange = (field) => (e) => {
    setLessonForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const openCreateLessonModal = () => {
    setLessonForm({ ...emptyLessonForm, classId: classes[0]?.Id || '' });
    setLessonDocFile(null);
    setShowLessonModal(true);
  };

  const handleCreateLessonSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(lessonForm).forEach(([key, value]) => formData.append(key, value));
      if (lessonDocFile) formData.append('document', lessonDocFile);
      await api.post('/Teacher/CreateLesson', formData, { headers: { 'Content-Type': undefined } });
      setShowLessonModal(false);
      refetch();
    } catch (err) {
      alert('Có lỗi xảy ra khi thêm buổi học mới.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== Lesson Edit Modal ====================
  const [editLessonForm, setEditLessonForm] = useState(null);
  const [editLessonDocFile, setEditLessonDocFile] = useState(null);
  const [editLessonRemoveDoc, setEditLessonRemoveDoc] = useState(false);

  const statusRevMap = { 0: 'SCHEDULED', 1: 'IN_PROGRESS', 2: 'FINISHED', 3: 'CANCELLED' };

  const openEditLessonModal = (l) => {
    setEditLessonForm({
      id: l.Id,
      title: l.Title || '',
      meetingUrl: l.MeetingUrl || '',
      meetingId: l.MeetingId || '',
      meetingPassword: l.MeetingPassword || '',
      videoUrl: l.VideoUrl || '',
      statusStr: statusRevMap[l.Status] || 'SCHEDULED',
      documentUrl: l.DocumentUrl || '',
      documentName: l.DocumentName || '',
    });
    setEditLessonDocFile(null);
    setEditLessonRemoveDoc(false);
  };

  const handleEditLessonChange = (field) => (e) => {
    setEditLessonForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleEditLessonSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('id', editLessonForm.id);
      formData.append('title', editLessonForm.title);
      formData.append('meetingUrl', editLessonForm.meetingUrl);
      formData.append('meetingId', editLessonForm.meetingId);
      formData.append('meetingPassword', editLessonForm.meetingPassword);
      formData.append('videoUrl', editLessonForm.videoUrl);
      formData.append('statusStr', editLessonForm.statusStr);
      formData.append('removeDocument', editLessonRemoveDoc ? 'true' : 'false');
      if (editLessonDocFile) formData.append('document', editLessonDocFile);
      await api.post('/Teacher/UpdateLesson', formData, { headers: { 'Content-Type': undefined } });
      setEditLessonForm(null);
      refetch();
    } catch (err) {
      alert('Lỗi hệ thống khi cập nhật buổi học.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== Upload Video Modal ====================
  const [videoModalLesson, setVideoModalLesson] = useState(null);
  const [videoModalTab, setVideoModalTab] = useState('file');
  const [videoLinkValue, setVideoLinkValue] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoUploading, setVideoUploading] = useState(false);

  const openVideoModal = (l) => {
    setVideoModalLesson(l);
    setVideoModalTab('file');
    setVideoLinkValue(l.VideoUrl || '');
    setVideoFile(null);
  };

  const handleVideoLinkSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/Teacher/UpdateLessonVideo', { lessonId: videoModalLesson.Id, videoUrl: videoLinkValue });
      setVideoModalLesson(null);
      refetch();
    } catch (err) {
      alert('Lỗi hệ thống khi cập nhật video.');
    } finally {
      setSaving(false);
    }
  };

  const handleVideoFileSubmit = async () => {
    if (!videoFile) return;
    setVideoUploading(true);
    try {
      const formData = new FormData();
      formData.append('lessonId', videoModalLesson.Id);
      formData.append('videoFile', videoFile);
      const res = await api.post('/Teacher/UploadLessonVideo', formData, { headers: { 'Content-Type': undefined } });
      if (res.data?.success) {
        setVideoModalLesson(null);
        refetch();
      } else {
        alert(res.data?.message || 'Upload video thất bại.');
      }
    } catch (err) {
      alert('Lỗi hệ thống khi upload video.');
    } finally {
      setVideoUploading(false);
    }
  };

  // ==================== Course Edit Modal ====================
  const [editCourseForm, setEditCourseForm] = useState(null);
  const [editCourseImageFile, setEditCourseImageFile] = useState(null);
  const [editCourseImagePreview, setEditCourseImagePreview] = useState(null);
  const [editCourseRemoveImage, setEditCourseRemoveImage] = useState(false);

  const openEditCourseModal = (course) => {
    setEditCourseForm({
      id: course.Id,
      courseCode: course.CourseCode || '',
      title: course.Title || '',
      description: course.Description || '',
      basePrice: course.BasePrice,
      totalLessons: course.TotalLessons,
      tags: course.MetadataTags || '',
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

  const handleEditCourseSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', editCourseForm.title);
      formData.append('description', editCourseForm.description);
      formData.append('basePrice', editCourseForm.basePrice);
      formData.append('totalLessons', editCourseForm.totalLessons);
      formData.append('tags', editCourseForm.tags);
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

  // ==================== Teacher Profile ====================
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [profileAvatarFile, setProfileAvatarFile] = useState(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState(null);
  const [profileRemoveAvatar, setProfileRemoveAvatar] = useState(false);

  const enterProfileEditMode = () => {
    setProfileForm({
      fullName: teacherUser?.FullName || '',
      phone: teacherUser?.Phone || '',
      teacherTitle: teacherProfile?.TeacherTitle || '',
      subject: teacherProfile?.Subject || '',
      teacherExperience: teacherProfile?.TeacherExperience ?? 5,
      teacherStudents: teacherProfile?.TeacherStudents ?? 100,
      teacherBio: teacherProfile?.TeacherBio || '',
    });
    setProfileAvatarFile(null);
    setProfileAvatarPreview(null);
    setProfileRemoveAvatar(false);
    setIsEditingProfile(true);
  };

  const handleProfileChange = (field) => (e) => {
    setProfileForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleProfileAvatarChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProfileAvatarFile(file);
    setProfileAvatarPreview(file ? URL.createObjectURL(file) : null);
    if (file) setProfileRemoveAvatar(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(profileForm).forEach(([key, value]) => formData.append(key, value));
      formData.append('removeAvatar', profileRemoveAvatar ? 'true' : 'false');
      if (profileAvatarFile) formData.append('avatarFile', profileAvatarFile);
      const res = await api.post('/Profile/UpdateDetails', formData, { headers: { 'Content-Type': undefined } });
      if (res.data?.success) {
        setIsEditingProfile(false);
        refetch();
      } else {
        alert(res.data?.message || 'Không thể cập nhật hồ sơ.');
      }
    } catch (err) {
      alert('Lỗi hệ thống khi cập nhật hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  const activeLabel = NAV_ITEMS.find((t) => t.key === activeTab)?.label || '';

  const inputCls = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none';
  const labelCls = 'block text-sm font-bold text-slate-700 mb-1.5';

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-700 font-sans">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-extrabold text-slate-800 text-base mb-1">Đang tải Bảng Tin Giảng Viên...</h3>
          <p className="text-xs text-slate-400">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f7f8fa] text-slate-800 font-sans">
      {/* Top Navbar */}
      <header className="h-[68px] bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-50 shrink-0 select-none">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Ẩn/Hiện thanh Menu"
          >
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </button>
          <Link to="/" className="flex items-center gap-3 text-primary no-underline">
            <img src="/images/logo.jpg" alt="Anh Tê Logo" className="h-10 w-10 rounded-xl object-cover shadow-md" />
            <span className="font-serif italic font-bold text-4xl tracking-tight">Anh Tê</span>
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setActiveTab('tabNotifications')}
            className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            title="Thông báo"
          >
            <span className="material-symbols-outlined text-[26px]">notifications</span>
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[11px] font-extrabold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </button>
          <button type="button" className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Trợ giúp">
            <span className="material-symbols-outlined text-[26px]">help_outline</span>
          </button>

          <div className="relative">
            <div
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 pl-1 pr-2.5 py-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary text-white font-bold text-base flex items-center justify-center shadow-sm">
                {initial}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-base font-bold text-slate-800 leading-tight">{currentUserFullName}</div>
                <div className="text-sm text-slate-500 mt-0.5">Giảng viên hệ thống</div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[22px]">expand_more</span>
            </div>

            {userDropdownOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100">
                  <div className="w-11 h-11 rounded-full bg-primary text-white font-black flex items-center justify-center text-lg">
                    {initial}
                  </div>
                  <div>
                    <div className="font-bold text-base text-slate-800">{currentUserFullName}</div>
                    <div className="text-sm text-slate-400">{teacherUser?.Email || 'giangvien@trungtam.com'}</div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 border border-primary/20">
                      Giảng Viên
                    </span>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setActiveTab('tabTeacherProfile'); setUserDropdownOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-base font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    Thông tin cá nhân
                  </button>
                  <button
                    onClick={() => alert('Tính năng cài đặt đang phát triển')}
                    className="w-full px-4 py-2.5 text-left text-base font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    Cài đặt tài khoản
                  </button>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2.5 text-left text-base font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <aside className="w-80 bg-white border-r border-slate-200/80 flex flex-col p-5 shrink-0 select-none overflow-y-auto">
            <div className="space-y-1.5 flex-1 pt-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.key;
                let count = null;
                if (item.key === 'tabAssignments') count = homeworkAssignments.length;
                if (item.key === 'tabExams') count = examAssignments.length;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center justify-between gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-base transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary rounded-l-none shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>{item.label}{count !== null ? ` (${count})` : ''}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto p-9 bg-[#f7f8fa]">
          <div className="flex items-center gap-2 text-base text-slate-500 mb-7 select-none flex-wrap">
            <button onClick={() => setActiveTab('tabHome')} className="text-slate-500 hover:text-primary active:text-primary hover:underline transition-colors">Trang chủ</button>
            <span className="text-slate-300">›</span>
            <span className="text-primary">{activeLabel}</span>
          </div>

          {/* ============ TAB: Trang chủ (Dashboard tổng quan) ============ */}
          {activeTab === 'tabHome' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button onClick={() => setActiveTab('tabLessons')} className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-primary/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[24px]">school</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 leading-none">{classes.length}</div>
                  <div className="text-sm font-semibold text-slate-500 mt-1.5">Số lớp đang dạy</div>
                </button>
                <button onClick={() => setActiveTab('tabAssignments')} className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-primary/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[24px]">pending_actions</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 leading-none">{pendingSubmissions.length}</div>
                  <div className="text-sm font-semibold text-slate-500 mt-1.5">Bài chờ chấm</div>
                </button>
                <button onClick={() => setActiveTab('tabLessons')} className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-primary/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[24px]">event</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 leading-none">{thisWeekLessonsCount}</div>
                  <div className="text-sm font-semibold text-slate-500 mt-1.5">Buổi dạy tuần này</div>
                </button>
                <button onClick={() => setActiveTab('tabStudentKpi')} className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-primary/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[24px]">warning</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 leading-none">{warningStudents.length}</div>
                  <div className="text-sm font-semibold text-slate-500 mt-1.5">Học viên cảnh báo</div>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-serif font-bold text-slate-900 text-base">Buổi học hôm nay</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {todayLessons.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">Hôm nay bạn không có buổi dạy nào.</div>
                    ) : (
                      todayLessons.map((l) => (
                        <div key={l.Id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{l.Title}</p>
                            <p className="text-xs text-slate-500">{formatTime(l.StartTime)} - {formatTime(l.EndTime)} · {l.Class?.ClassName}</p>
                          </div>
                          {l.AttendanceStatus === 0 ? (
                            <button
                              onClick={() => handleOpenAttendance(l.Id)}
                              className="shrink-0 text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-hover"
                            >
                              Vào điểm danh
                            </button>
                          ) : (
                            <StatusDot color={l.AttendanceStatus === 2 ? 'sky' : 'emerald'}>{l.AttendanceStatus === 2 ? 'Đã khoá' : 'Đang điểm danh'}</StatusDot>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-serif font-bold text-slate-900 text-base">Thông báo gần đây</h3>
                    <button onClick={() => setActiveTab('tabNotifications')} className="text-xs font-bold text-primary hover:underline">Xem tất cả</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">Chưa có thông báo nào.</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.Id} className="px-6 py-3.5 flex items-start gap-3">
                          <span className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${n.IsRead ? 'text-slate-300' : 'text-primary'}`}>
                            {!n.IsRead ? 'mark_email_unread' : 'mail'}
                          </span>
                          <div className="min-w-0">
                            <p className={`text-sm truncate ${n.IsRead ? 'text-slate-500' : 'font-bold text-slate-800'}`}>{n.Title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{new Date(n.CreatedAt).toLocaleString('vi-VN')}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ TAB: Thông báo ============ */}
          {activeTab === 'tabNotifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-serif font-bold text-slate-900 text-xl">Thông Báo</h2>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={async () => { await api.post('/Notification/MarkAllAsRead'); refetchNotifications(); }}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    Đánh dấu đã đọc tất cả
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-sm">Chưa có thông báo nào.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.Id}
                      onClick={async () => {
                        if (!n.IsRead) {
                          await api.post('/Notification/MarkAsRead', { notificationId: n.Id });
                          refetchNotifications();
                        }
                      }}
                      className={`px-6 py-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50/70 ${!n.IsRead ? 'bg-primary/[0.03]' : ''}`}
                    >
                      <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${n.IsRead ? 'text-slate-300' : 'text-primary'}`}>
                        {!n.IsRead ? 'mark_email_unread' : 'mail'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${n.IsRead ? 'text-slate-600' : 'font-bold text-slate-800'}`}>{n.Title}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{n.Content}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(n.CreatedAt).toLocaleString('vi-VN')}</p>
                      </div>
                      {!n.IsRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ============ TAB: Lịch dạy & Điểm danh ============ */}
          {activeTab === 'tabLessons' && (
            <div>
              <div className="flex justify-between items-center mb-5 border-b border-slate-200 pb-3 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
                    Danh sách các buổi học được giao
                  </h2>
                  <span className="inline-flex items-center text-xs font-bold bg-sky-50 text-sky-600 px-2.5 py-1 rounded-full">{lessons.length} buổi</span>
                </div>
                <button
                  onClick={openCreateLessonModal}
                  className="px-4 py-2 bg-primary text-white hover:bg-primary/80 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  Thêm buổi học mới
                </button>
              </div>

              {lessons.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 py-12 text-center text-slate-400 rounded-2xl">
                  Không có buổi học nào.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {Object.keys(groupedLessons).map((className) => {
                    const isOpen = !!openLessonGroups[className];
                    return (
                      <div key={className} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div
                          onClick={() => toggleLessonGroup(className)}
                          className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer select-none"
                        >
                          <span className="text-base font-bold text-slate-900 flex items-center gap-2">
                            Lớp: {className}
                          </span>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold bg-sky-50 text-sky-600 px-2.5 py-1 rounded-full">{groupedLessons[className].length} buổi</span>
                            {groupedLessons[className][0]?.ClassId && (
                              <Link
                                to={`/Teacher/ClassDetail/${groupedLessons[className][0].ClassId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs font-bold text-primary hover:underline no-underline px-2 py-1"
                              >
                                Quản lý lớp
                              </Link>
                            )}
                            <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`}>expand_more</span>
                          </div>
                        </div>
                        {isOpen && (
                          <div className="p-5 flex flex-col gap-3">
                            {groupedLessons[className].map((l) => (
                              <div key={l.Id} className="border border-slate-200 rounded-xl px-5 py-4 flex justify-between items-center flex-wrap gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                    <h4 className="text-sm font-bold text-slate-900">{l.Title}</h4>
                                    <StatusDot color={l.Status === 2 ? 'emerald' : l.Status === 3 ? 'red' : 'amber'}>
                                      {l.Status === 2 ? 'Đã hoàn thành' : l.Status === 3 ? 'Đã hủy' : 'Sắp dạy'}
                                    </StatusDot>
                                    <StatusDot color={l.AttendanceStatus === 2 ? 'sky' : l.AttendanceStatus === 1 ? 'emerald' : 'slate'}>
                                      {l.AttendanceStatus === 2 ? 'Đã khoá điểm danh' : l.AttendanceStatus === 1 ? 'Đang điểm danh' : 'Chưa mở điểm danh'}
                                    </StatusDot>
                                    {l.VideoUrl && (
                                      <StatusDot color="violet">Có video</StatusDot>
                                    )}
                                  </div>
                                  <div className="text-sm text-slate-500 flex gap-4 flex-wrap items-center">
                                    <span className="inline-flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                                      {new Date(l.LessonDate).toLocaleDateString('vi-VN')} | {formatTime(l.StartTime)} - {formatTime(l.EndTime)}
                                    </span>
                                    {l.MeetingUrl && (
                                      <a href={l.MeetingUrl} target="_blank" rel="noreferrer" className="text-primary font-bold no-underline inline-flex items-center gap-1">
                                        Vào phòng học
                                      </a>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="relative">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setOpenLessonMenuId(openLessonMenuId === l.Id ? null : l.Id); }}
                                      className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                    </button>
                                    {openLessonMenuId === l.Id && (
                                      <>
                                        <div className="fixed inset-0 z-10" onClick={() => setOpenLessonMenuId(null)} />
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
                                          {l.Status !== 2 && l.AttendanceStatus === 0 ? (
                                            <button
                                              onClick={() => { setOpenLessonMenuId(null); handleOpenAttendance(l.Id); }}
                                              className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                            >
                                              Mở điểm danh
                                            </button>
                                          ) : (
                                            <Link
                                              to={`/Teacher/Attendance/${l.Id}`}
                                              onClick={() => setOpenLessonMenuId(null)}
                                              className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 no-underline"
                                            >
                                              {l.Status === 2 ? 'Duyệt Video' : l.AttendanceStatus === 2 ? 'Sửa điểm danh' : 'Điểm danh'}
                                            </Link>
                                          )}
                                          {l.Status === 2 && (
                                            <button
                                              onClick={() => { setOpenLessonMenuId(null); openVideoModal(l); }}
                                              className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                            >
                                              {l.VideoUrl ? 'Sửa Video' : 'Upload Video'}
                                            </button>
                                          )}
                                          <button
                                            onClick={() => { setOpenLessonMenuId(null); openEditLessonModal(l); }}
                                            className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                          >
                                            Cập nhật
                                          </button>
                                          <Link
                                            to={`/Teacher/CreateAssignment/${l.Id}`}
                                            onClick={() => setOpenLessonMenuId(null)}
                                            className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 no-underline"
                                          >
                                            Giao bài tập
                                          </Link>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============ TAB: Bài tập về nhà ============ */}
          {activeTab === 'tabAssignments' && (
            <div>
              <div className="flex justify-between items-center mb-5 border-b border-slate-200 pb-3 flex-wrap gap-2">
                <h2 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
                  Thống kê bài tập đã giao theo Lớp học
                </h2>
                <span className="text-sm text-slate-400">Click vào lớp học để xem danh sách bài tập</span>
              </div>

              {groupedAssignments.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 py-12 text-center text-slate-400 rounded-2xl">
                  Chưa có bài tập nào được giao.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {groupedAssignments.map((group) => {
                    const isOpen = !!openAssignmentGroups[group.Class.Id];
                    return (
                      <div key={group.Class.Id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div
                          onClick={() => toggleAssignmentGroup(group.Class.Id)}
                          className="bg-slate-50 px-6 py-4 flex justify-between items-center cursor-pointer border-b border-slate-200 select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base font-bold text-slate-900 flex items-center gap-2">
                              {group.Class.ClassName}
                            </span>
                            <span className="text-xs font-bold bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full">{group.List.length} bài tập đã giao</span>
                          </div>
                          <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`}>expand_more</span>
                        </div>
                        {isOpen && (
                          <div className="p-5 overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                              <thead>
                                <tr className="text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                                  <th className="p-3">Tên bài tập</th>
                                  <th className="p-3">Buổi học</th>
                                  <th className="p-3 whitespace-nowrap">Hạn nộp bài</th>
                                  <th className="p-3 whitespace-nowrap">Hình thức</th>
                                  <th className="p-3 whitespace-nowrap">Đã nộp</th>
                                  <th className="p-3 text-right whitespace-nowrap">Thao tác</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {group.List.map((assign) => (
                                  <tr key={assign.Id}>
                                    <td className="p-3 font-bold text-slate-800">{assign.Title}</td>
                                    <td className="p-3">{assign.Lesson ? assign.Lesson.Title : ''}</td>
                                    <td className="p-3 whitespace-nowrap">{new Date(assign.DueDate).toLocaleString('vi-VN')}</td>
                                    <td className="p-3 whitespace-nowrap">
                                      <span className="inline-flex text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 whitespace-nowrap">
                                        {assign.AssignmentType === 0 ? 'Trắc nghiệm' : assign.AssignmentType === 2 ? 'Đúng/Sai' : 'Tự luận'}
                                      </span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap"><strong className="text-primary">{submissionCounts[assign.Id] || 0}</strong> học viên nộp</td>
                                    <td className="p-3 text-right whitespace-nowrap">
                                      <Link to={`/Teacher/Submissions/${assign.Id}`} className="inline-flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-lg text-white no-underline bg-primary hover:bg-primary/80">
                                        Xem & Chấm điểm
                                      </Link>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============ TAB: Bài kiểm tra ============ */}
          {activeTab === 'tabExams' && (
            <div>
              <div className="flex justify-between items-center mb-5 border-b border-slate-200 pb-3 flex-wrap gap-2">
                <h2 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
                  Bài Kiểm Tra Lớp Học
                </h2>
                <span className="text-sm text-slate-400">Kiểm tra 15 phút, 1 tiết, học kỳ...</span>
              </div>

              {classes.length > 0 && (
                <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                  {classes.map((c) => (
                    <Link
                      key={c.Id}
                      to={`/Teacher/CreateExam/${c.Id}`}
                      className="flex items-center gap-3 bg-gradient-to-br from-violet-100 to-violet-200 border border-violet-300 rounded-xl px-5 py-4 no-underline hover:-translate-y-0.5 transition-transform"
                    >
                      <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white">add</span>
                      </div>
                      <div>
                        <div className="font-bold text-violet-900 text-sm">{c.ClassName}</div>
                        <div className="text-xs text-violet-600">Tạo bài kiểm tra mới</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {examAssignments.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 py-12 text-center text-slate-400 rounded-2xl">
                  <span className="material-symbols-outlined text-violet-300 text-4xl block mb-2">fact_check</span>
                  Chưa có bài kiểm tra nào. Nhấn <strong>"Tạo bài kiểm tra mới"</strong> ở trên để bắt đầu.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {groupedExams.map((group) => {
                    const isOpen = !!openExamGroups[group.Class.Id];
                    return (
                      <div key={group.Class.Id} className="bg-white border border-violet-300 rounded-2xl overflow-hidden shadow-sm">
                        <div
                          onClick={() => toggleExamGroup(group.Class.Id)}
                          className="bg-violet-50 px-6 py-4 flex justify-between items-center cursor-pointer border-b border-violet-200 select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base font-bold text-violet-900 flex items-center gap-2">
                              {group.Class.ClassName}
                            </span>
                            <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{group.List.length} bài kiểm tra</span>
                          </div>
                          <span className={`material-symbols-outlined text-violet-500 transition-transform ${isOpen ? '' : '-rotate-90'}`}>expand_more</span>
                        </div>
                        {isOpen && (
                          <div className="p-5 overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                              <thead>
                                <tr className="text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                                  <th className="p-3">Tiêu đề</th>
                                  <th className="p-3 whitespace-nowrap">Hình thức</th>
                                  <th className="p-3 whitespace-nowrap">Thời gian thi</th>
                                  <th className="p-3 whitespace-nowrap">Đã nộp</th>
                                  <th className="p-3 text-right whitespace-nowrap">Thao tác</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {group.List.map((assign) => (
                                  <tr key={assign.Id}>
                                    <td className="p-3 font-bold text-slate-800">{assign.Title}</td>
                                    <td className="p-3 whitespace-nowrap"><span className="inline-flex text-xs font-bold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 whitespace-nowrap">Kiểm tra</span></td>
                                    <td className="p-3 whitespace-nowrap">{new Date(assign.DueDate).toLocaleString('vi-VN')}</td>
                                    <td className="p-3 whitespace-nowrap"><strong className="text-violet-600">{submissionCounts[assign.Id] || 0}</strong> nộp</td>
                                    <td className="p-3 text-right whitespace-nowrap">
                                      <Link to={`/Teacher/Submissions/${assign.Id}`} className="inline-flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-lg text-white no-underline bg-violet-600 hover:bg-violet-700">
                                        Xem & Chấm
                                      </Link>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============ TAB: Tiến độ các khóa học ============ */}
          {activeTab === 'tabCourseProgress' && (
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2 mb-5">
                Tiến trình dạy các khóa học được phân công
              </h2>

              <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
                {classes.map((c) => {
                  const total = c.Course ? c.Course.TotalLessons : 12;
                  const classLessons = lessons.filter((l) => l.ClassId === c.Id);
                  const finished = classLessons.filter((l) => l.Status === 2).length;
                  const percent = total > 0 ? (finished / total) * 100 : 0;
                  const now = new Date();
                  const lateLessons = classLessons.filter((l) => l.Status !== 2 && l.Status !== 3 && new Date(l.LessonDate) < now);
                  return (
                    <div key={c.Id} className="flex items-center gap-5 px-6 py-4 flex-wrap">
                      <div className="w-64 shrink-0">
                        <h3 className="font-bold text-slate-900 text-lg">{c.ClassName}</h3>
                        <p className="text-sm text-slate-500 truncate">{c.Course ? c.Course.Title : ''}</p>
                      </div>

                      <div className="w-64 shrink-0">
                        <div className="flex justify-between text-sm font-bold text-slate-600 mb-1">
                          <span>Đã dạy: {finished} / {total} buổi</span>
                          <span>{percent.toFixed(0)}%</span>
                        </div>
                        <ProgressBar percent={percent} />
                      </div>

                      <div className="shrink-0">
                        {lateLessons.length > 0 ? (
                          <StatusDot color="red">{lateLessons.length} buổi chậm</StatusDot>
                        ) : (
                          <StatusDot color="emerald">Đúng tiến độ</StatusDot>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-auto">
                        <button
                          onClick={() => setProgressReportClass(c)}
                          className="text-sm font-bold px-3.5 py-2 rounded-lg text-white bg-primary hover:bg-primary/80 flex items-center gap-1.5"
                        >
                          Xem tiến độ
                        </button>
                        <Link to={`/Teacher/ClassReport/${c.Id}`} className="text-sm font-bold px-3.5 py-2 rounded-lg text-slate-700 border border-slate-200 no-underline hover:bg-slate-100">
                          Chi tiết AI
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ TAB: Khóa học của tôi ============ */}
          {activeTab === 'tabMyCourses' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
                  Khóa Học Của Tôi
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
                      <th className="p-4 whitespace-nowrap">Mã Khóa</th>
                      <th className="p-4 whitespace-nowrap">Tên Khóa Học</th>
                      <th className="p-4 whitespace-nowrap">Số Buổi</th>
                      <th className="p-4 whitespace-nowrap">Học Phí Gốc</th>
                      <th className="p-4 text-right whitespace-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {myCourses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">Bạn chưa có khóa học nào được phân công.</td>
                      </tr>
                    ) : (
                      myCourses.map((c) => (
                        <tr key={c.Id} className="hover:bg-slate-50/70">
                          <td className="p-4 whitespace-nowrap"><span className="bg-slate-100 px-2 py-1 rounded-md">{c.CourseCode}</span></td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {c.ImageUrl ? (
                                <img src={c.ImageUrl} alt="" className="w-9 h-7 rounded-lg object-cover" />
                              ) : (
                                <div className="w-9 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[16px]">school</span>
                                </div>
                              )}
                              <span className="font-bold text-slate-900">{c.Title}</span>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">{c.TotalLessons} buổi</td>
                          <td className="p-4 font-extrabold text-slate-900 whitespace-nowrap">{Number(c.BasePrice).toLocaleString('vi-VN')} đ</td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => openEditCourseModal(c)}
                              className="inline-flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-lg border border-sky-300 text-sky-600 hover:bg-sky-50"
                            >
                              Sửa
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ TAB: Đánh giá KPI học viên ============ */}
          {activeTab === 'tabStudentKpi' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-serif font-bold text-slate-900 text-xl flex items-center gap-2">
                  Chỉ số chất lượng học tập của Học Viên (KPI)
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
                      <th className="p-4 whitespace-nowrap">Học viên</th>
                      <th className="p-4 whitespace-nowrap">Điểm TB bài tập</th>
                      <th className="p-4 whitespace-nowrap">Tỉ lệ nộp bài</th>
                      <th className="p-4 whitespace-nowrap">Tỉ lệ đi học (Chuyên cần)</th>
                      <th className="p-4 whitespace-nowrap">Xếp loại học lực</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {studentKpis.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">Chưa có dữ liệu đánh giá học lực học sinh.</td>
                      </tr>
                    ) : (
                      studentKpis.map((sk) => (
                        <tr key={sk.StudentId}>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Avatar name={sk.FullName} />
                              <span className="font-bold text-slate-900">{sk.FullName}</span>
                            </div>
                          </td>
                          <td className={`p-4 font-extrabold whitespace-nowrap ${sk.AverageGrade >= 8 ? 'text-emerald-600' : sk.AverageGrade >= 5 ? 'text-amber-600' : 'text-red-600'}`}>
                            {Number(sk.AverageGrade).toFixed(1)} / 10
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 w-32">
                              <ProgressBar percent={sk.AssignmentCompletionRate * 100} color="bg-sky-500" />
                              <span className="text-xs font-bold text-slate-600 shrink-0">{(sk.AssignmentCompletionRate * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">{(sk.AttendanceRate * 100).toFixed(0)}%</td>
                          <td className="p-4 whitespace-nowrap">
                            <StatusDot color={sk.Status === 'Hoàn thành tốt' ? 'emerald' : sk.Status === 'Ổn định' ? 'sky' : 'red'}>
                              {sk.Status}
                            </StatusDot>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ TAB: Đánh giá KPI giảng viên ============ */}
          {activeTab === 'tabTeacherKpi' && (() => {
            const periods = teacherEvaluations;
            const selected = periods[selectedEvalIdx] ?? periods[periods.length - 1];
            const avgScore = (ev) => {
              if (!ev || !ev.Criteria || ev.Criteria.length === 0) return null;
              const scores = ev.Criteria.map((c) => parseFloat(c.score)).filter((n) => !isNaN(n));
              return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
            };
            return (
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">lock</span>
                  Mục này chỉ hiển thị đánh giá do Admin nhập — giáo viên không thể chỉnh sửa.
                </div>

                {periods.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center text-slate-400 text-sm">
                    Chưa có đánh giá KPI nào từ Admin.
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                      <h4 className="text-sm font-bold text-slate-800 mb-3">Xu hướng điểm đánh giá trung bình theo kỳ</h4>
                      <div className="flex items-end gap-3 h-28">
                        {periods.map((ev, i) => {
                          const avg = avgScore(ev) || 0;
                          return (
                            <button key={ev.Id} onClick={() => setSelectedEvalIdx(i)} className="flex-1 flex flex-col items-center justify-end gap-1.5 group">
                              <span className="text-[10px] font-bold text-slate-500">{avg.toFixed(1)}</span>
                              <div className={`w-full rounded-t-md transition-all ${selected?.Id === ev.Id ? 'bg-primary' : 'bg-slate-200 group-hover:bg-slate-300'}`} style={{ height: `${Math.max((avg / 10) * 80, 4)}px` }} />
                              <span className="text-[9px] text-slate-400 truncate max-w-full">{ev.Period}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selected && (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-800">Kỳ: {selected.Period}</h3>
                          <span className="text-xs text-slate-400">{new Date(selected.PeriodDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
                              <th className="p-4">Tiêu chí</th>
                              <th className="p-4 text-center">Điểm</th>
                              <th className="p-4">Nhận xét từ Admin</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {selected.Criteria.map((c, i) => (
                              <tr key={i}>
                                <td className="p-4">{c.name}</td>
                                <td className="p-4 text-center font-black text-primary">{c.score}</td>
                                <td className="p-4 text-slate-500">{c.comment || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {selected.OverallComment && (
                          <div className="px-6 py-4 bg-sky-50 border-t border-sky-100 text-sm text-sky-900">{selected.OverallComment}</div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}

          {/* ============ TAB: Thông tin giới thiệu ============ */}
          {activeTab === 'tabTeacherProfile' && (
            <div>
              {!isEditingProfile ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 grid gap-10" style={{ gridTemplateColumns: '320px 1fr' }}>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Xem trước card công khai</p>
                    <div className="bg-white border border-slate-200 rounded-2xl p-7 text-center shadow-sm">
                      <div className="relative inline-block mb-4">
                        <div className="w-28 h-28 rounded-full border-4 border-primary/15 overflow-hidden bg-primary/10 mx-auto flex items-center justify-center">
                          {teacherUser?.AvatarUrl ? (
                            <img src={teacherUser.AvatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-4xl font-black text-primary">{currentUserFullName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow">
                          {teacherProfile?.Subject || 'Chưa cập nhật'}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-primary mt-3 mb-1">{teacherUser?.FullName || currentUserFullName}</h3>
                      <p className="text-sm font-bold text-slate-500 mb-4">{teacherProfile?.TeacherTitle || 'Giáo viên tiêu biểu'}</p>
                      <p className="text-sm text-slate-500 leading-relaxed mb-5 text-left whitespace-pre-line">
                        {teacherProfile?.TeacherBio || 'Giảng viên giàu kinh nghiệm ôn luyện và bồi dưỡng kiến thức toàn diện cho các em học viên.'}
                      </p>
                      <div className="border-t border-slate-100 pt-4 flex justify-between gap-2">
                        <div className="flex-1 text-center">
                          <span className="block text-xl font-black text-primary">{teacherProfile?.TeacherExperience ?? 5}+</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Năm KN</span>
                        </div>
                        <div className="flex-1 text-center">
                          <span className="block text-xl font-black text-primary">{teacherProfile?.TeacherStudents ?? 100}+</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Học sinh</span>
                        </div>
                        <div className="flex-1 text-center">
                          <span className="block text-xl font-black text-primary">{teacherProfile?.TeacherRating != null ? Number(teacherProfile.TeacherRating).toFixed(1) : '4.8'} ⭐</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Đánh giá</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b-2 border-sky-100 pb-3 mb-5">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                          Hồ Sơ Giảng Viên Chi Tiết
                        </h3>
                        <button
                          onClick={enterProfileEditMode}
                          className="px-4 py-2 bg-primary hover:bg-primary/80 text-white font-bold rounded-lg text-sm flex items-center gap-1.5"
                        >
                          Chỉnh sửa thông tin
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
                          <span className="block text-[11px] text-slate-400 uppercase font-bold mb-1">Họ và Tên</span>
                          <span className="text-sm font-bold text-slate-900">{teacherUser?.FullName || ''}</span>
                        </div>
                        <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
                          <span className="block text-[11px] text-slate-400 uppercase font-bold mb-1">Môn giảng dạy chính</span>
                          <span className="text-sm font-bold text-slate-900">{teacherProfile?.Subject || 'Chưa thiết lập'}</span>
                        </div>
                      </div>
                      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                        <span className="block text-[11px] text-slate-400 uppercase font-bold mb-1.5">Tiểu sử & Phương châm giảng dạy</span>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                          {teacherProfile?.TeacherBio || 'Giảng viên chưa cập nhật thông tin giới thiệu.'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-6 border-t border-dashed border-slate-200 pt-3">
                      Bản xem trước giúp bạn thấy được giao diện thẻ hiển thị của mình trên danh sách giáo viên công khai của hệ thống.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <div className="flex justify-between items-center mb-7 border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      Cập Nhật Hồ Sơ Giảng Viên
                    </h3>
                    <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm flex items-center gap-1.5">
                      Quay lại
                    </button>
                  </div>
                  <form onSubmit={handleProfileSubmit} className="grid gap-8" style={{ gridTemplateColumns: '1fr 300px' }}>
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className={labelCls}>Họ và Tên *</label>
                          <input required type="text" value={profileForm.fullName} onChange={handleProfileChange('fullName')} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Ảnh đại diện</label>
                          {profileAvatarPreview || (teacherUser?.AvatarUrl && !profileRemoveAvatar) ? (
                            <div className="flex items-center gap-3">
                              <img src={profileAvatarPreview || teacherUser.AvatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                              <label className="text-sm font-bold text-primary cursor-pointer">
                                Đổi ảnh
                                <input type="file" accept="image/*" onChange={handleProfileAvatarChange} className="hidden" />
                              </label>
                              <button type="button" onClick={() => { setProfileAvatarFile(null); setProfileAvatarPreview(null); setProfileRemoveAvatar(true); }} className="text-sm font-bold text-red-500">
                                Xóa
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center gap-1.5 border-2 border-dashed border-slate-200 rounded-xl py-2.5 cursor-pointer hover:border-primary hover:bg-primary/5 text-xs font-semibold text-slate-500">
                              Chọn ảnh
                              <input type="file" accept="image/*" onChange={handleProfileAvatarChange} className="hidden" />
                            </label>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className={labelCls}>Học vị</label>
                          <input type="text" value={profileForm.teacherTitle} onChange={handleProfileChange('teacherTitle')} placeholder="Ví dụ: Thạc sĩ, Tiến sĩ..." className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Môn giảng dạy chính</label>
                          <input type="text" value={profileForm.subject} onChange={handleProfileChange('subject')} placeholder="Ví dụ: Toán học, Vật lý..." className={inputCls} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className={labelCls}>Số năm kinh nghiệm</label>
                          <input type="number" min="0" max="60" value={profileForm.teacherExperience} onChange={handleProfileChange('teacherExperience')} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Số học sinh đã dạy</label>
                          <input type="number" min="0" value={profileForm.teacherStudents} onChange={handleProfileChange('teacherStudents')} className={inputCls} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Tiểu sử & Giới thiệu ngắn</label>
                        <textarea rows={10} value={profileForm.teacherBio} onChange={handleProfileChange('teacherBio')} placeholder="Viết vài dòng giới thiệu về bản thân, thành tích nổi bật, phương pháp giảng dạy..." className={`${inputCls} resize-y`} />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm">Hủy</button>
                        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm flex items-center gap-1.5">
                          {saving ? 'Đang lưu...' : 'Lưu hồ sơ công khai'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Xem trước trên trang chủ</p>
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                        <div className="relative inline-block mb-4">
                          <div className="w-20 h-20 rounded-full border-[3px] border-primary/15 overflow-hidden bg-primary/10 mx-auto flex items-center justify-center">
                            {profileAvatarPreview || (teacherUser?.AvatarUrl && !profileRemoveAvatar) ? (
                              <img src={profileAvatarPreview || teacherUser.AvatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl font-black text-primary">{(profileForm.fullName || currentUserFullName).charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow">
                            {profileForm.subject || 'Môn học'}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 mt-3 mb-0.5">{profileForm.fullName}</h3>
                        <p className="text-xs font-bold text-primary mb-2">{profileForm.teacherTitle || 'Thạc sĩ'}</p>
                        <p className="text-xs text-slate-500 leading-relaxed mb-3 text-left line-clamp-3">{profileForm.teacherBio || 'Giảng viên giàu kinh nghiệm tại trung tâm.'}</p>
                        <div className="flex justify-around border-t border-slate-100 pt-3">
                          <div className="text-center flex-1">
                            <span className="block text-sm font-black text-primary">{profileForm.teacherExperience}+</span>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Năm KN</span>
                          </div>
                          <div className="w-px bg-slate-100 mx-1" />
                          <div className="text-center flex-1">
                            <span className="block text-sm font-black text-primary">{profileForm.teacherStudents}+</span>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Học sinh</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ==================== Modal: Báo Cáo Tiến Độ Khóa Học ==================== */}
      {progressReportClass && (() => {
        const c = progressReportClass;
        const now = new Date();
        const total = c.Course ? c.Course.TotalLessons : 12;
        const classLessons = lessons.filter((l) => l.ClassId === c.Id);
        const finishedLessons = classLessons.filter((l) => l.Status === 2);
        const lateLessons = classLessons.filter((l) => l.Status !== 2 && l.Status !== 3 && new Date(l.LessonDate) < now);
        const lessonPercent = total > 0 ? (finishedLessons.length / total) * 100 : 0;

        const classAssignments = assignments.filter((a) => a.Lesson && a.Lesson.Class && a.Lesson.Class.Id === c.Id);
        const studentCount = classStudentsMap[c.Id] || 0;
        const avgSubmissionRate = classAssignments.length > 0
          ? (classAssignments.reduce((sum, a) => sum + (studentCount > 0 ? (submissionCounts[a.Id] || 0) / studentCount : 0), 0) / classAssignments.length) * 100
          : 0;

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setProgressReportClass(null)}>
            <div className="bg-white rounded-2xl shadow-xl w-[95vw] max-w-[1600px] h-[94vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 shrink-0">
                <div>
                  <h3 className="font-bold text-2xl font-serif text-slate-900 flex items-center gap-2.5">
                    Báo Cáo Tiến Độ Khóa Học
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Lớp: <strong className="text-slate-700">{c.ClassName}</strong> • Khóa học: <strong className="text-slate-700">{c.Course ? c.Course.Title : ''}</strong>
                  </p>
                </div>
                <button onClick={() => setProgressReportClass(null)} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
                {/* Stat strip */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <span className="block text-xs font-bold text-slate-500 mb-1">Buổi dạy hoàn thành</span>
                    <span className="block text-2xl font-black text-slate-900">{finishedLessons.length}/{total}</span>
                    <span className="text-xs text-slate-400">{lessonPercent.toFixed(0)}% tiến độ</span>
                  </div>
                  <div className={`border rounded-xl p-4 ${lateLessons.length > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <span className={`block text-xs font-bold mb-1 ${lateLessons.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>Buổi chậm tiến độ</span>
                    <span className={`block text-2xl font-black ${lateLessons.length > 0 ? 'text-red-700' : 'text-emerald-700'}`}>{lateLessons.length}</span>
                    <span className="text-xs text-slate-400">{lateLessons.length > 0 ? 'Cần bù buổi sớm' : 'Không có buổi trễ'}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <span className="block text-xs font-bold text-slate-500 mb-1">Bài tập đã giao</span>
                    <span className="block text-2xl font-black text-slate-900">{classAssignments.length}</span>
                    <span className="text-xs text-slate-400">{studentCount} học sinh trong lớp</span>
                  </div>
                  <div className={`border rounded-xl p-4 ${avgSubmissionRate >= 80 ? 'bg-emerald-50 border-emerald-200' : avgSubmissionRate >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                    <span className={`block text-xs font-bold mb-1 ${avgSubmissionRate >= 80 ? 'text-emerald-600' : avgSubmissionRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>Tỉ lệ nộp bài TB</span>
                    <span className={`block text-2xl font-black ${avgSubmissionRate >= 80 ? 'text-emerald-700' : avgSubmissionRate >= 50 ? 'text-amber-700' : 'text-red-700'}`}>{avgSubmissionRate.toFixed(0)}%</span>
                    <span className="text-xs text-slate-400">Trung bình mọi bài tập</span>
                  </div>
                </div>

                {/* Section: Lesson progress */}
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
                    Tiến độ buổi dạy
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    {classLessons.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-6">Lớp chưa có buổi học nào.</p>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {classLessons.map((l) => {
                          const isLate = l.Status !== 2 && l.Status !== 3 && new Date(l.LessonDate) < now;
                          const statusInfo = l.Status === 2
                            ? { label: 'Đúng tiến độ', color: 'emerald' }
                            : l.Status === 3
                            ? { label: 'Đã hủy', color: 'slate' }
                            : isLate
                            ? { label: 'Chậm tiến độ', color: 'red' }
                            : { label: 'Sắp diễn ra', color: 'sky' };
                          return (
                            <div key={l.Id} className="flex items-center justify-between gap-3 text-sm px-4 py-2.5">
                              <span className="text-slate-700 font-semibold truncate">{l.Title}</span>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-slate-400">{new Date(l.LessonDate).toLocaleDateString('vi-VN')}</span>
                                <StatusDot color={statusInfo.color}>{statusInfo.label}</StatusDot>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Assignment progress */}
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
                    Tiến độ bài tập & bài kiểm tra
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    {classAssignments.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-6">Lớp chưa có bài tập nào được giao.</p>
                    ) : (
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                            <th className="p-3">Tên bài</th>
                            <th className="p-3 whitespace-nowrap">Hạn nộp</th>
                            <th className="p-3 whitespace-nowrap">Đã nộp / Sĩ số</th>
                            <th className="p-3 whitespace-nowrap">Tỉ lệ hoàn thành</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {classAssignments.map((a) => {
                            const submitted = submissionCounts[a.Id] || 0;
                            const rate = studentCount > 0 ? (submitted / studentCount) * 100 : 0;
                            const overdue = new Date(a.DueDate) < now;
                            const rateInfo = rate >= 80
                              ? { label: 'Đạt tốt', cls: 'text-emerald-600' }
                              : rate >= 50
                              ? { label: 'Trung bình', cls: 'text-amber-600' }
                              : { label: 'Thấp', cls: 'text-red-600' };
                            return (
                              <tr key={a.Id}>
                                <td className="p-3 font-bold text-slate-800">
                                  {a.Title}
                                  {a.AssignmentType === 3 && <span className="ml-1.5 text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded whitespace-nowrap">KT</span>}
                                </td>
                                <td className="p-3 text-slate-500 whitespace-nowrap">
                                  {new Date(a.DueDate).toLocaleDateString('vi-VN')}
                                  {overdue && <span className="ml-1.5 text-[10px] font-bold text-red-500">Đã hết hạn</span>}
                                </td>
                                <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">{submitted} / {studentCount || '?'}</td>
                                <td className="p-3 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, rate)}%` }} />
                                    </div>
                                    <span className={`text-xs font-bold whitespace-nowrap ${rateInfo.cls}`}>{rate.toFixed(0)}% · {rateInfo.label}</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 shrink-0">
                <Link
                  to={`/Teacher/ClassReport/${c.Id}`}
                  onClick={() => setProgressReportClass(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm no-underline flex items-center gap-1.5"
                >
                  Xem phân tích AI theo học sinh
                </Link>
                <button onClick={() => setProgressReportClass(null)} className="px-6 py-2.5 bg-primary hover:bg-primary/80 text-white font-bold rounded-xl text-sm">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ==================== Modal: Thêm Buổi Học Mới ==================== */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setShowLessonModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-900">Thêm Buổi Học Mới</h3>
              <button onClick={() => setShowLessonModal(false)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreateLessonSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Chọn Lớp Học</label>
                <select required value={lessonForm.classId} onChange={handleLessonFormChange('classId')} className={inputCls}>
                  {classes.map((c) => (<option key={c.Id} value={c.Id}>{c.ClassName}</option>))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Tên / Tiêu đề buổi học</label>
                <input required type="text" value={lessonForm.title} onChange={handleLessonFormChange('title')} placeholder="Ví dụ: Buổi 5: Thực hành và thảo luận" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Ngày học</label>
                <input required type="date" value={lessonForm.lessonDate} onChange={handleLessonFormChange('lessonDate')} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Giờ bắt đầu</label>
                  <input required type="text" value={lessonForm.startTimeStr} onChange={handleLessonFormChange('startTimeStr')} placeholder="HH:mm" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Giờ kết thúc</label>
                  <input required type="text" value={lessonForm.endTimeStr} onChange={handleLessonFormChange('endTimeStr')} placeholder="HH:mm" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Link phòng học online (Zoom, Meet,...)</label>
                <input type="url" value={lessonForm.meetingUrl} onChange={handleLessonFormChange('meetingUrl')} placeholder="https://zoom.us/j/..." className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>ID Phòng học</label>
                  <input type="text" value={lessonForm.meetingId} onChange={handleLessonFormChange('meetingId')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Mật khẩu (Passcode)</label>
                  <input type="text" value={lessonForm.meetingPassword} onChange={handleLessonFormChange('meetingPassword')} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Tài liệu đính kèm (PDF, Word, Excel, Hình ảnh...)</label>
                <input type="file" onChange={(e) => setLessonDocFile(e.target.files?.[0] || null)} className={inputCls} />
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm">
                {saving ? 'Đang lưu...' : 'Thêm Buổi Học'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== Modal: Sửa Buổi Học ==================== */}
      {editLessonForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setEditLessonForm(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-900">Cập Nhật Thông Tin Buổi Học</h3>
              <button onClick={() => setEditLessonForm(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditLessonSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Tên / Tiêu đề buổi học</label>
                <input required type="text" value={editLessonForm.title} onChange={handleEditLessonChange('title')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Link phòng học online (Zoom, Meet,...)</label>
                <input type="url" value={editLessonForm.meetingUrl} onChange={handleEditLessonChange('meetingUrl')} placeholder="https://zoom.us/j/..." className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>ID Phòng học</label>
                  <input type="text" value={editLessonForm.meetingId} onChange={handleEditLessonChange('meetingId')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Mật khẩu (Passcode)</label>
                  <input type="text" value={editLessonForm.meetingPassword} onChange={handleEditLessonChange('meetingPassword')} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Link Video Xem Lại (Replay/Recording URL)</label>
                <input type="url" value={editLessonForm.videoUrl} onChange={handleEditLessonChange('videoUrl')} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
              </div>
              {editLessonForm.documentUrl && !editLessonRemoveDoc && (
                <div className="flex items-center justify-between px-3 py-2 bg-slate-100 rounded-lg text-sm border border-slate-200">
                  <a href={editLessonForm.documentUrl} target="_blank" rel="noreferrer" className="text-primary font-semibold no-underline flex items-center gap-1.5">
                    {editLessonForm.documentName || 'Tài liệu'}
                  </a>
                  <button type="button" onClick={() => setEditLessonRemoveDoc(true)} className="text-sm font-bold text-red-500">Xóa</button>
                </div>
              )}
              <div>
                <label className={labelCls}>Tài liệu đính kèm mới (để trống nếu giữ nguyên)</label>
                <input type="file" onChange={(e) => setEditLessonDocFile(e.target.files?.[0] || null)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Trạng thái buổi học</label>
                <select value={editLessonForm.statusStr} onChange={handleEditLessonChange('statusStr')} className={inputCls}>
                  {LESSON_STATUS_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm">
                {saving ? 'Đang lưu...' : 'Cập Nhật Buổi Học'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== Modal: Upload Video Xem Lại ==================== */}
      {videoModalLesson && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setVideoModalLesson(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[20px]">videocam</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Video Xem Lại</h3>
                  <p className="text-xs text-slate-500">{videoModalLesson.Title}</p>
                </div>
              </div>
              <button onClick={() => setVideoModalLesson(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>

            <div className="flex border-b-2 border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => setVideoModalTab('file')}
                className={`flex-1 py-2.5 text-sm font-bold border-b-[3px] -mb-0.5 ${videoModalTab === 'file' ? 'border-violet-600 text-violet-600' : 'border-transparent text-slate-400'}`}
              >
                Tải file lên
              </button>
              <button
                type="button"
                onClick={() => setVideoModalTab('link')}
                className={`flex-1 py-2.5 text-sm font-bold border-b-[3px] -mb-0.5 ${videoModalTab === 'link' ? 'border-violet-600 text-violet-600' : 'border-transparent text-slate-400'}`}
              >
                Dán link
              </button>
            </div>

            {videoModalTab === 'file' ? (
              <div>
                <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-violet-200 rounded-xl py-8 cursor-pointer hover:border-violet-400 hover:bg-violet-50/40 transition-colors mb-3">
                  <span className="material-symbols-outlined text-violet-500 text-3xl">cloud_upload</span>
                  <span className="text-sm font-bold text-violet-900">Kéo thả hoặc nhấn để chọn file</span>
                  <span className="text-xs text-slate-500">MP4, AVI, MOV, MKV... • Tối đa 500MB</span>
                  <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
                {videoFile && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-violet-50 border border-violet-200 rounded-xl mb-3">
                    <span className="material-symbols-outlined text-violet-600 text-2xl">movie</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{videoFile.name}</p>
                      <p className="text-xs text-slate-500">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                    </div>
                    <button type="button" onClick={() => setVideoFile(null)} className="text-red-500">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setVideoModalLesson(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm">Hủy</button>
                  <button
                    type="button"
                    disabled={!videoFile || videoUploading}
                    onClick={handleVideoFileSubmit}
                    className="flex-[2] py-2.5 bg-gradient-to-br from-violet-600 to-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm"
                  >
                    {videoUploading ? 'Đang tải lên...' : 'Tải lên'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVideoLinkSubmit}>
                <label className="block text-sm font-bold text-violet-700 mb-1.5 flex items-center gap-1.5">
                  Link Video (YouTube, Drive...)
                </label>
                <input
                  type="url"
                  value={videoLinkValue}
                  onChange={(e) => setVideoLinkValue(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border-2 border-violet-200 focus:border-violet-500 rounded-xl text-sm outline-none mb-4"
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setVideoModalLesson(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm">Hủy</button>
                  <button type="submit" disabled={saving} className="flex-[2] py-2.5 bg-gradient-to-br from-violet-600 to-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm">
                    {saving ? 'Đang lưu...' : 'Lưu Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================== Modal: Sửa Khóa Học ==================== */}
      {editCourseForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setEditCourseForm(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-900">Sửa Thông Tin Khóa Học</h3>
              <button onClick={() => setEditCourseForm(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditCourseSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Mã Khóa học</label>
                <input type="text" value={editCourseForm.courseCode} disabled className={`${inputCls} bg-slate-100 cursor-not-allowed`} />
              </div>
              <div>
                <label className={labelCls}>Tên khóa học</label>
                <input required type="text" value={editCourseForm.title} onChange={handleEditCourseChange('title')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mô tả khóa học</label>
                <textarea rows={3} value={editCourseForm.description} onChange={handleEditCourseChange('description')} className={`${inputCls} resize-y`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Học phí gốc (VNĐ)</label>
                  <input required type="number" value={editCourseForm.basePrice} onChange={handleEditCourseChange('basePrice')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Số buổi học</label>
                  <input required type="number" value={editCourseForm.totalLessons} onChange={handleEditCourseChange('totalLessons')} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Từ khóa (Tags)</label>
                <input type="text" value={editCourseForm.tags} onChange={handleEditCourseChange('tags')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Ảnh mô tả khóa học</label>
                {editCourseImagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200">
                    <img src={editCourseImagePreview} alt="" className="w-full h-36 object-cover" />
                    <button type="button" onClick={() => { setEditCourseImageFile(null); setEditCourseImagePreview(null); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/70 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ) : editCourseForm.currentImageUrl && !editCourseRemoveImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200">
                    <img src={editCourseForm.currentImageUrl} alt="" className="w-full h-36 object-cover" />
                    <button type="button" onClick={() => setEditCourseRemoveImage(true)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/70 hover:bg-red-600 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                    <label className="absolute bottom-2 right-2 bg-white/95 hover:bg-white text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer shadow-sm flex items-center gap-1">
                      Đổi ảnh khác
                      <input type="file" accept="image/*" onChange={handleEditCourseImageChange} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-200 rounded-xl py-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 text-[28px]">add_photo_alternate</span>
                    <span className="text-xs font-semibold text-slate-500">Bấm để chọn ảnh (JPG, PNG)</span>
                    <input type="file" accept="image/*" onChange={handleEditCourseImageChange} className="hidden" />
                  </label>
                )}
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm">
                {saving ? 'Đang lưu...' : 'Cập Nhật Khóa Học'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
