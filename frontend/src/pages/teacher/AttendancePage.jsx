import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import api from '../../services/api';

export default function AttendancePage() {
  const { id } = useParams(); // lessonId or classId
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useFetchData(`/Teacher/Attendance/${id}`);

  const lesson = data?.lesson || null;
  const students = data?.students || [];
  const initialMap = data?.attendanceMap || {};

  const [statuses, setStatuses] = useState({}); // { studentId: 'PRESENT' | 'LATE' | ... }
  const [remarks, setRemarks] = useState({}); // { studentId: '...' }
  const [videoAccess, setVideoAccess] = useState({}); // { studentId: true | false }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (students.length > 0) {
      const initialStatuses = {};
      const initialRemarks = {};
      const initialVideo = {};
      students.forEach((s) => {
        const att = initialMap[s.Id] || null;
        // status values: 0=PRESENT, 1=LATE, 2=ABSENT_REQUESTED, 3=ABSENT_UNEXCUSED
        const statusMap = { 0: 'PRESENT', 1: 'LATE', 2: 'ABSENT_REQUESTED', 3: 'ABSENT_UNEXCUSED' };
        initialStatuses[s.Id] = att ? statusMap[att.Status] : 'PRESENT';
        initialRemarks[s.Id] = att ? att.Remark : '';
        initialVideo[s.Id] = att ? att.VideoAccess : true;
      });
      setStatuses(initialStatuses);
      setRemarks(initialRemarks);
      setVideoAccess(initialVideo);
    }
  }, [students, initialMap]);

  const handleStatusChange = (studentId, status) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
    // Auto-update video permission based on attendance status rules
    if (status === 'PRESENT' || status === 'LATE') {
      setVideoAccess((prev) => ({ ...prev, [studentId]: true }));
    } else if (status === 'ABSENT_UNEXCUSED') {
      setVideoAccess((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  const handleRemarkChange = (studentId, val) => {
    setRemarks((prev) => ({ ...prev, [studentId]: val }));
  };

  const handleVideoToggle = (studentId) => {
    setVideoAccess((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleQuickGrant = async (studentId, hasAccess) => {
    try {
      const response = await api.post('/Teacher/GrantVideoAccess', {
        lessonId: lesson?.Id,
        studentId: studentId,
        grant: !hasAccess
      });
      if (response.data?.success) {
        setVideoAccess((prev) => ({ ...prev, [studentId]: !hasAccess }));
        alert(response.data.message || 'Cập nhật quyền thành công!');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể cập nhật quyền xem video.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Map states back to backend array payload formats
      const studentIds = students.map(s => s.Id);
      const statusesArray = students.map((s, idx) => statuses[s.Id] || 'PRESENT');
      const remarksArray = students.map(s => remarks[s.Id] || '');
      const videoAccessesArray = students.filter(s => videoAccess[s.Id]).map(s => s.Id);

      await api.post('/Teacher/SaveAttendance', {
        lessonId: lesson?.Id,
        studentIds,
        statuses: statusesArray,
        remarks: remarksArray,
        videoAccesses: videoAccessesArray
      });

      alert('Đã lưu chuyên cần buổi học thành công!');
      navigate('/Teacher/Dashboard');
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi lưu chuyên cần.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout hideHeader={false}>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 select-none text-slate-800">
        
        {/* Back Link */}
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
        ) : !lesson ? (
          <div className="text-center py-10 text-slate-500 font-semibold">
            Không tìm thấy thông tin buổi học cần điểm danh.
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-8 bg-slate-50 border-b border-slate-100 space-y-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-800 font-serif flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[28px]">assignment_turned_in</span>
                Điểm Danh Buổi Học
              </h1>
              <p className="text-xs text-slate-500 font-semibold">
                Lớp: <strong className="text-primary">{lesson.Class?.ClassName}</strong> | Bài học: <strong>{lesson.Title}</strong>
              </p>
            </div>

            {/* Hint alert */}
            <div className="p-6 bg-purple-50 border-b border-purple-100 flex items-start gap-3 text-purple-700 text-xs font-semibold leading-relaxed">
              <span className="material-symbols-outlined text-purple-500 text-[18px]">info</span>
              <div>
                Học sinh <strong>"Có mặt"</strong> và <strong>"Trễ"</strong> sẽ tự động được xem video ghi hình bài giảng. Bạn có thể thay đổi thủ công quyền hạn này cho học sinh vắng có lý do.
              </div>
            </div>

            {/* Students list table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                    <th className="p-4">Học sinh</th>
                    <th className="p-4 text-center">Trạng thái chuyên cần</th>
                    <th className="p-4">Nhận xét nhanh</th>
                    <th className="p-4 text-center">Xem video bài giảng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {students.map((student, idx) => {
                    const studentStatus = statuses[student.Id] || 'PRESENT';
                    const studentRemark = remarks[student.Id] || '';
                    const hasVideo = !!videoAccess[student.Id];

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            <img
                              src={student.AvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                              alt={student.FullName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-xs md:text-sm">{student.FullName}</div>
                            {hasVideo ? (
                              <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 inline-block border border-emerald-100">
                                ✓ Được xem video
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 inline-block border border-amber-100">
                                🔒 Khóa video
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex gap-4 flex-wrap justify-center">
                            {[
                              { val: 'PRESENT', label: 'Có mặt', color: 'accent-primary' },
                              { val: 'LATE', label: 'Trễ', color: 'accent-amber-500' },
                              { val: 'ABSENT_REQUESTED', label: 'Vắng phép', color: 'accent-blue-500' },
                              { val: 'ABSENT_UNEXCUSED', label: 'Vắng không phép', color: 'accent-red-500' }
                            ].map((opt) => (
                              <label key={opt.val} className="flex items-center gap-1 cursor-pointer select-none">
                                <input
                                  type="radio"
                                  name={`status-${student.Id}`}
                                  value={opt.val}
                                  checked={studentStatus === opt.val}
                                  onChange={() => handleStatusChange(student.Id, opt.val)}
                                  className="w-4 h-4 text-primary focus:ring-primary"
                                />
                                <span className="text-[11px] font-semibold">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            value={studentRemark}
                            onChange={(e) => handleRemarkChange(student.Id, e.target.value)}
                            placeholder="Nhập nhận xét nhanh..."
                            className="w-full border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-1.5 text-xs font-semibold"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hasVideo}
                                onChange={() => handleVideoToggle(student.Id)}
                                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                              />
                              <span className="text-[10px] text-slate-500 font-bold">{hasVideo ? 'Được xem' : 'Khóa'}</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => handleQuickGrant(student.Id, hasVideo)}
                              className={`text-[9px] px-2 py-1 rounded-lg font-bold border transition-all ${
                                hasVideo
                                  ? 'bg-red-50 border-red-100 text-red-700 hover:bg-red-100'
                                  : 'bg-primary border-primary text-white hover:bg-primary-hover shadow-sm'
                              }`}
                            >
                              {hasVideo ? 'Thu hồi' : 'Duyệt ngay'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer buttons */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-8 py-3.5 rounded-xl shadow-lg transition-all"
              >
                {saving ? 'ĐANG LƯU...' : 'LƯU & KHÓA BUỔI HỌC'}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
