import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useFetchData } from '../hooks/useFetchData';

export default function CoursesPage() {
  const { data, loading } = useFetchData('/Home/Courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const courses = data?.courses || [];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const filteredCourses = courses.filter((course) => {
    const courseName = (course.Title || course.CourseName || '').toLowerCase();
    const courseTags = (course.MetadataTags || '').toLowerCase();
    const searchMatch = courseName.includes(searchTerm.toLowerCase()) || courseTags.includes(searchTerm.toLowerCase());

    if (activeFilter === 'all') {
      return searchMatch;
    }
    return searchMatch && (courseName.includes(activeFilter) || courseTags.includes(activeFilter));
  });

  return (
    <MainLayout overlayHeader={true}>
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden select-none pt-28 sm:pt-32 pb-4 bg-transparent text-slate-900">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-slate-900 mb-2">
            Tất Cả Khóa Học
          </h1>
          <p className="text-slate-600 text-xs md:text-sm max-w-xl leading-relaxed font-normal">
            Khám phá chương trình đào tạo đa dạng - được thiết kế bởi đội ngũ giáo viên giỏi nhất.
          </p>
        </div>
      </section>

      {/* Filters & Search Section */}
      <section className="py-6 sm:py-8 bg-transparent min-h-screen text-slate-900">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">

            {/* Search Bar */}
            <div className="w-full lg:max-w-md relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Tìm kiếm tên khóa học, môn học..."
                className="w-full pl-12 pr-6 py-3.5 bg-[#1a2b56] border border-blue-500/30 rounded-full text-xs focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 outline-none shadow-sm transition-all text-white placeholder:text-slate-400"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-none">
              {[
                { key: 'all', label: 'Tất Cả' },
                { key: 'toán', label: 'Toán Học' },
                { key: 'vật lý', label: 'Vật Lý' },
                { key: 'hóa', label: 'Hóa Học' },
                { key: 'tiếng anh', label: 'Tiếng Anh' }
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => handleFilterClick(btn.key)}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === btn.key
                    ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 text-white shadow-md shadow-blue-500/30'
                    : 'bg-[#1a2b56] border border-blue-900/70 text-slate-300 hover:text-white hover:border-cyan-400'
                    }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <i className="fa-solid fa-spinner fa-spin text-cyan-400 text-3xl" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mt-10">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => {
                  const imgUrl = course.ImageUrl || course.ThumbnailUrl || '';
                  return (
                    <div
                      key={course.Id || course.CourseId}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-950/20 flex flex-col group hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1.5 transition-all duration-300 text-slate-900"
                    >
                      <div className="relative aspect-video overflow-hidden bg-slate-100">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={course.Title || course.CourseName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-sky-50 text-blue-500">
                            <span className="material-symbols-outlined text-[48px]">school</span>
                          </div>
                        )}
                        <span className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                          {course.CourseCode || 'THPT'}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {course.Title || course.CourseName}
                          </h3>
                          <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                            {course.Description || 'Khóa học chất lượng cao bám sát chương trình chuẩn bộ GD&ĐT.'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-semibold">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-blue-600">schedule</span>
                            <span>{course.TotalLessons || 36} buổi học</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span>4.9</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Học phí</span>
                            <span className="text-base font-black text-blue-600">
                              {(course.BasePrice || course.Price || 0) > 0 ? `${(course.BasePrice || course.Price || 0).toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                            </span>
                          </div>

                          <Link
                            to={`/Home/Courses/${course.Id || course.CourseId}`}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-black rounded-xl shadow-md hover:brightness-110 transition-all"
                          >
                            Chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-16 text-slate-400">
                  <span className="material-symbols-outlined text-4xl block mb-2 text-cyan-400">search_off</span>
                  Chưa tìm thấy khóa học phù hợp.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
