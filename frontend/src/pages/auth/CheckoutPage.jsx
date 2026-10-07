import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

const money = (n) => `${Number(n || 0).toLocaleString('vi-VN')} đ`;
const day = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : 'Chưa xác định');

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { cartItems } = useCart();
  const courseId = searchParams.get('courseId') || cartItems[0]?.Id || cartItems[0]?.id;

  const { data, loading, error } = useFetchData(`/Auth/Checkout?courseId=${courseId}`);
  const [selectedClass, setSelectedClass] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const course = data?.course;
  const classes = data?.classes || [];
  const counts = data?.classStudentCounts || {};
  const seatsLeft = (c) => (c.MaxStudents ? Math.max(0, c.MaxStudents - (counts[c.Id] || 0)) : null);
  const isFull = (c) => seatsLeft(c) === 0;

  useEffect(() => {
    if (!selectedClass && classes.length) setSelectedClass((classes.find((c) => !isFull(c)) || classes[0]).Id);
  }, [classes]); // eslint-disable-line react-hooks/exhaustive-deps

  const chosen = classes.find((c) => c.Id === selectedClass);
  const isStudent = user?.role === 'STUDENT';

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/Auth/Checkout', { courseId: course.Id, classId: selectedClass });
      if (res.data?.success && res.data.type === 'redirect') window.location.href = res.data.url;
    } catch (err) {
      alert(err.response?.data?.message || 'Không tạo được hóa đơn. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout hideFooter hideChatbot>
      <div className="min-h-screen bg-[#F6F9FD] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {loading && <div className="text-center text-[#60708A] py-20">Đang tải…</div>}
          {error && <div className="rounded-2xl bg-red-50 border border-red-100 text-red-700 px-5 py-4">Không tải được khóa học.</div>}

          {course && (
            <form onSubmit={submit}>
              <h1 className="text-2xl font-black text-[#172B4D] mb-1">Đăng ký khóa học</h1>
              <p className="text-sm text-[#60708A] mb-6">Chọn lớp, rồi chuyển khoản học phí. Bạn vào lớp sau khi trung tâm xác nhận đã nhận tiền.</p>

              <div className="grid lg:grid-cols-5 gap-6 items-start">
                <section className="lg:col-span-3 bg-white rounded-3xl border border-[#E4EAF2] shadow-sm p-6">
                  <h2 className="font-black text-[#172B4D] mb-4">1. Chọn lớp</h2>
                  {classes.length === 0 && <p className="text-sm text-[#60708A]">Khóa học này chưa có lớp đang mở. Vui lòng liên hệ trung tâm.</p>}
                  <div className="space-y-3">
                    {classes.map((c) => {
                      const left = seatsLeft(c);
                      const active = selectedClass === c.Id;
                      return (
                        <label key={c.Id} className={`block rounded-2xl border-2 p-4 cursor-pointer transition ${isFull(c) ? 'opacity-50 cursor-not-allowed border-[#E4EAF2]' : active ? 'border-[#1467E8] bg-[#EAF3FF]' : 'border-[#E4EAF2] hover:border-[#B0D0FB]'}`}>
                          <div className="flex items-start gap-3">
                            <input type="radio" name="class" className="mt-1 accent-[#1467E8]" disabled={isFull(c)} checked={active} onChange={() => setSelectedClass(c.Id)} />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-[#172B4D]">{c.ClassName}</div>
                              <div className="text-xs text-[#60708A] mt-1">Khai giảng {day(c.StartDate)}{c.Schedule ? ` · ${c.Schedule}` : ''}</div>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${isFull(c) ? 'bg-red-50 text-red-600' : 'bg-white text-[#1467E8]'}`}>
                              {left === null ? 'Còn chỗ' : isFull(c) ? 'Hết chỗ' : `Còn ${left} chỗ`}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <h2 className="font-black text-[#172B4D] mt-7 mb-3">2. Thanh toán</h2>
                  <div className="rounded-2xl bg-[#F6F9FD] border border-[#E4EAF2] p-4 text-sm text-[#172B4D]">
                    <b>Chuyển khoản ngân hàng.</b> Sau khi bấm tiếp tục bạn nhận mã QR và nội dung chuyển khoản riêng. Học phí về tài khoản trung tâm thì bạn được xếp vào lớp.
                  </div>
                </section>

                <aside className="lg:col-span-2 bg-white rounded-3xl border border-[#E4EAF2] shadow-sm p-6">
                  <h2 className="font-black text-[#172B4D] mb-3">Đơn đăng ký</h2>
                  <div className="font-bold text-[#172B4D]">{course.Title}</div>
                  {chosen && <div className="text-sm text-[#60708A] mt-1">Lớp: {chosen.ClassName}</div>}
                  <div className="flex justify-between items-baseline border-t border-[#E4EAF2] mt-4 pt-4">
                    <span className="text-sm font-semibold text-[#60708A]">Học phí</span>
                    <span className="text-2xl font-black text-[#1467E8]">{money(course.BasePrice)}</span>
                  </div>

                  {!user && (
                    <Link to={`/Auth/Login?returnUrl=${encodeURIComponent(`/Auth/Checkout?courseId=${course.Id}`)}`} className="block text-center mt-5 py-3 rounded-xl bg-[#1467E8] hover:bg-[#0B57D0] text-white font-bold">
                      Đăng nhập để đăng ký
                    </Link>
                  )}
                  {user && !isStudent && <p className="mt-5 text-sm text-amber-700 bg-amber-50 rounded-xl p-3">Chỉ tài khoản học viên mới đăng ký được khóa học.</p>}
                  {isStudent && (
                    <button disabled={submitting || !chosen || isFull(chosen)} className="mt-5 w-full py-3 rounded-xl bg-[#1467E8] hover:bg-[#0B57D0] disabled:opacity-50 text-white font-bold">
                      {submitting ? 'Đang tạo hóa đơn…' : 'Tiếp tục thanh toán'}
                    </button>
                  )}
                </aside>
              </div>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
