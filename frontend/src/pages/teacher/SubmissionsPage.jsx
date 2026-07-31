import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';

export default function SubmissionsPage() {
  const { id } = useParams(); // assignmentId
  const { data, loading } = useFetchData(`/Teacher/Submissions/${id}`);

  const assignment = data?.assignment || null;
  const allSubmissions = data?.submissions || [];

  const [expandedStudentId, setExpandedStudentId] = useState(null);

  // Mặc định chỉ hiện lần nộp chính thức (AttemptNumber=1); các lần luyện tập thêm xem qua chevron mở rộng
  const officialSubmissions = useMemo(() => allSubmissions.filter((s) => s.AttemptNumber === 1), [allSubmissions]);
  const practiceByStudent = useMemo(() => {
    const map = {};
    allSubmissions.filter((s) => s.AttemptNumber > 1).forEach((s) => {
      if (!map[s.StudentId]) map[s.StudentId] = [];
      map[s.StudentId].push(s);
    });
    Object.values(map).forEach((list) => list.sort((a, b) => a.AttemptNumber - b.AttemptNumber));
    return map;
  }, [allSubmissions]);

  const gradedCount = officialSubmissions.filter((s) => s.Grade !== null).length;
  const totalCount = officialSubmissions.length;

  return (
    <MainLayout hideHeader={false}>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 select-none text-slate-800">

        {/* Back Link */}
        <div>
          <Link to="/Teacher/Dashboard" className="inline-flex items-center gap-1 text-slate-400 hover:text-primary transition-all text-xs font-bold">
            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            Quay lại Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
          </div>
        ) : !assignment ? (
          <div className="text-center py-10 text-slate-500 font-semibold">
            Không tìm thấy thông tin bài tập hoặc không có bài nộp nào.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div className="pb-6 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-800 font-serif flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[28px]">grading</span>
                  Chấm Điểm Bài Tập Học Viên
                </h1>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Bài tập: <strong className="text-primary">{assignment.Title}</strong> | Lớp: <strong>{assignment.Lesson?.Class?.ClassName}</strong>
                </p>
              </div>
              <div className="text-xs bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl font-bold">
                Đã chấm: <strong className="text-primary">{gradedCount} / {totalCount} bài làm chính thức</strong>
              </div>
            </div>

            {/* Submissions list */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                    <th className="p-4 w-8"></th>
                    <th className="p-4">Học sinh nộp</th>
                    <th className="p-4">Bài làm / Tệp đính kèm</th>
                    <th className="p-4">Thời gian nộp</th>
                    <th className="p-4 text-center">Điểm số</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {officialSubmissions.map((sub) => {
                    const practiceAttempts = practiceByStudent[sub.StudentId] || [];
                    const isExpanded = expandedStudentId === sub.StudentId;
                    return (
                      <React.Fragment key={sub.Id}>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-4">
                            {practiceAttempts.length > 0 && (
                              <button
                                onClick={() => setExpandedStudentId(isExpanded ? null : sub.StudentId)}
                                className="w-6 h-6 rounded-full hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-[18px]">{isExpanded ? 'expand_less' : 'chevron_right'}</span>
                              </button>
                            )}
                          </td>
                          <td className="p-4 font-bold text-slate-800">
                            {sub.Student?.FullName}
                            {practiceAttempts.length > 0 && (
                              <span className="ml-1.5 text-[9px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full">+{practiceAttempts.length} luyện tập</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="max-w-xs space-y-1">
                              <p className="truncate text-slate-500 italic">"{sub.Content || 'Không có ghi chú'}"</p>
                              {sub.FileUrl && (
                                <a
                                  href={sub.FileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary font-bold flex items-center gap-1 hover:underline text-[10px]"
                                >
                                  <i className="fa-solid fa-paperclip" /> Xem file đính kèm
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-slate-400">
                            {new Date(sub.SubmittedAt).toLocaleString('vi-VN')}
                          </td>
                          <td className="p-4 text-center font-black text-xs md:text-sm">
                            {sub.Grade !== null ? (
                              <span className="text-primary">{sub.Grade} / 10</span>
                            ) : (
                              <span className="text-amber-600">Chưa chấm</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <Link
                              to={`/Teacher/Grading/${sub.Id}`}
                              className="inline-block bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all no-underline"
                            >
                              Chấm điểm
                            </Link>
                          </td>
                        </tr>
                        {isExpanded && practiceAttempts.map((p) => (
                          <tr key={p.Id} className="bg-sky-50/40">
                            <td className="p-3"></td>
                            <td className="p-3 text-slate-400 italic pl-2">↳ Lần {p.AttemptNumber} (luyện tập — không tính điểm)</td>
                            <td className="p-3">
                              <p className="truncate text-slate-500 italic max-w-xs">"{p.Content || 'Không có ghi chú'}"</p>
                            </td>
                            <td className="p-3 text-slate-400">{new Date(p.SubmittedAt).toLocaleString('vi-VN')}</td>
                            <td className="p-3 text-center text-slate-500">{p.Grade !== null ? `${p.Grade} / 10` : '—'}</td>
                            <td className="p-3 text-center text-slate-300 text-[10px]">Chỉ xem</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                  {officialSubmissions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400 italic">Chưa ghi nhận bài nộp nào cho bài tập này.</td>
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
