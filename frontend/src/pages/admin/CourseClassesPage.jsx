import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';

export default function CourseClassesPage() {
  const { courseId } = useParams();
  const { data, loading, error } = useFetchData(`/Admin/Courses/${courseId}/Classes`);

  const course = data?.course || null;
  const classes = data?.classes || [];

  return (
    <MainLayout hideHeader={false}>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 select-none text-slate-800">
        
        {/* Back Link */}
        <div>
          <Link to="/Admin/Dashboard" className="inline-flex items-center gap-1 text-slate-400 hover:text-primary transition-all text-xs font-bold">
            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            Quay lại Admin Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
          </div>
        ) : !course ? (
          <div className="text-center py-10 text-slate-500 font-semibold">
            Không tìm thấy thông tin khóa học hoặc danh sách lớp học.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header info */}
            <div className="pb-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-800 font-serif flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[28px]">domain</span>
                  Quản lý Lớp học - Khóa: {course.Title}
                </h1>
                <p className="text-xs text-slate-500 font-semibold mt-1">Mã khóa học: <strong>{course.CourseCode}</strong></p>
              </div>
              <button
                onClick={() => alert('Chức năng tạo lớp học trực tiếp mới đang được bảo trì.')}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1"
              >
                + Thêm Lớp Học
              </button>
            </div>

            {/* Classes Table list */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                    <th className="p-4">Tên lớp học</th>
                    <th className="p-4">Giáo viên phụ trách</th>
                    <th className="p-4">Sĩ số (Max)</th>
                    <th className="p-4">Lịch khai giảng</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {classes.map((cls, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">{cls.ClassName}</td>
                      <td className="p-4">{cls.Teacher?.FullName || 'Chưa phân công'}</td>
                      <td className="p-4">{cls.MaxStudents} học sinh</td>
                      <td className="p-4 text-slate-400">
                        {cls.StartDate ? new Date(cls.StartDate).toLocaleDateString('vi-VN') : 'Chưa định'}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => alert('Tính năng chỉnh sửa lớp học đang phát triển.')}
                          className="text-primary hover:underline mx-2"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => alert('Bạn không có quyền xóa lớp học này.')}
                          className="text-red-600 hover:underline mx-2"
                        >
                          Xóa
                        </button>
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

          </div>
        )}
      </div>
    </MainLayout>
  );
}
