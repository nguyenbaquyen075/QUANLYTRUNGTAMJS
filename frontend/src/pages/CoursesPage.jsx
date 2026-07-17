import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useFetchData } from '../hooks/useFetchData';

export default function CoursesPage() {
  const { data, loading, error } = useFetchData('/Home/Courses');
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
      <section 
        className="relative overflow-hidden select-none pt-36 pb-20 border-b border-slate-800/20"
        style={{
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(15, 23, 42, 0.28) 0%, rgba(15, 23, 42, 0.12) 100%), url('/images/hero-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <h1 
            className="text-4xl md:text-5xl font-black font-serif leading-tight text-white mb-4"
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8), 0 4px 15px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.4)' }}
          >
            Tất Cả Khóa Học
          </h1>
          <p 
            className="text-slate-200 text-xs md:text-sm max-w-xl leading-relaxed font-semibold"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.5)' }}
          >
            Khám phá chương trình đào tạo đa dạng - được thiết kế bởi đội ngũ giáo viên giỏi nhất.
          </p>
        </div>
      </section>

      {/* Filters & Search Section */}
      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* Search Bar */}
            <div className="w-full lg:max-w-md relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Tìm kiếm tên khóa học, môn học..."
                className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-full text-xs focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none shadow-sm transition-all text-slate-800"
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
                  className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeFilter === btn.key
                      ? 'bg-primary text-white shadow-md shadow-primary/10'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="flex justify-center py-24">
              <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => {
                  const imgUrl = course.ImageUrl || course.ThumbnailUrl || '';
                  const displayPrice = course.BasePrice || course.Price || 0;
                  return (
                    <div
                      key={course.Id || course.CourseId}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-100 flex flex-col group hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
                    >
                      <div className="relative aspect-video overflow-hidden bg-primary/5">
                        {imgUrl ? (
                          <img
                            alt={course.Title || course.CourseName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            src={imgUrl}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <span className="material-symbols-outlined text-[64px] text-primary/30">school</span>
                          </div>
                        )}
                        <span className="absolute top-4 left-4 bg-primary text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg shadow-md">
                          {course.CourseCode || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="p-6 space-y-4 flex-1 flex flex-col">
                        <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">school</span>
                            {course.Grade || 'Mọi cấp lớp'}
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 4.9
                          </div>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 line-clamp-2 min-h-[50px] group-hover:text-primary transition-colors">
                          {course.Title || course.CourseName}
                        </h3>
                        <p className="text-slate-500 text-xs font-semibold leading-relaxed line-clamp-3 min-h-[54px]">
                          {course.Description || 'Chương trình học chất lượng cao được thiết kế bởi đội ngũ giáo viên chuyên nghiệp.'}
                        </p>
                        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div>
                            {displayPrice > 0 ? (
                              <div className="text-primary font-extrabold text-base">
                                {Number(displayPrice).toLocaleString('vi-VN')} đ
                              </div>
                            ) : (
                              <div className="text-primary font-extrabold text-base">Miễn phí</div>
                            )}
                          </div>
                          <Link
                            to={`/Auth/Checkout?courseId=${course.Id || course.CourseId}`}
                            className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-extrabold hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all shadow-md"
                          >
                            Đăng ký
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-24">
                  <span className="material-symbols-outlined text-[72px] text-slate-300">search_off</span>
                  <p className="text-slate-500 font-bold mt-4 text-base">Không tìm thấy khóa học phù hợp.</p>
                  <p className="text-slate-400 text-xs mt-2">Vui lòng thử tìm kiếm với từ khóa khác!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
