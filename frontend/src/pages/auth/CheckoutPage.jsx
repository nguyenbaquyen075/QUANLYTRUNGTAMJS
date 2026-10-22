import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

const money = (n) => `${Number(n || 0).toLocaleString('vi-VN')} đ`;
const day = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : 'Chưa xác định');
const weeks = (a, b) => (a && b ? Math.max(1, Math.round((new Date(b) - new Date(a)) / (7 * 24 * 3600 * 1000))) : null);
const input = 'w-full rounded-xl border border-[#E4EAF2] bg-white px-3.5 py-2.5 text-sm text-[#172B4D] placeholder:text-[#9AA8BC] focus:outline-none focus:ring-2 focus:ring-[#1467E8]/30 focus:border-[#1467E8]';

const Icon = ({ name, className = '' }) => <span className={`material-symbols-outlined leading-none ${className}`} aria-hidden="true">{name}</span>;

// Các bước từ lúc chọn lớp đến lúc vào học; bước đang làm trên trang này là 1 và 2.
const STEPS = ['Chọn lớp', 'Thông tin', 'Chuyển khoản', 'Vào lớp'];

const PAY_STEPS = [
  { icon: 'qr_code_2', title: 'Nhận mã QR', text: 'Bấm tiếp tục, hệ thống tạo hóa đơn kèm mã QR và nội dung chuyển khoản riêng cho bạn.' },
  { icon: 'account_balance', title: 'Chuyển khoản', text: 'Quét mã bằng app ngân hàng, giữ nguyên số tiền và nội dung chuyển khoản.' },
  { icon: 'verified', title: 'Xác nhận và xếp lớp', text: 'Trung tâm đối chiếu khoản tiền rồi xếp bạn vào lớp đã chọn.' }
];

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { cartItems } = useCart();
  const courseId = searchParams.get('courseId') || cartItems[0]?.Id || cartItems[0]?.id;

  const { data, loading, error } = useFetchData(`/Auth/Checkout?courseId=${courseId}`);
  const [selectedClass, setSelectedClass] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [imgOk, setImgOk] = useState(true);

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
  const isGuest = !user;
  const canSubmit = isStudent || isGuest;
  const currentStep = chosen ? 2 : 1;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post('/Auth/Checkout', { courseId: course.Id, classId: selectedClass, ...(user ? {} : { fullName, phone }) });
      if (res.data?.success && res.data.type === 'redirect') window.location.href = res.data.url;
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Không tạo được hóa đơn. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout hideFooter hideChatbot>
      <div className="min-h-screen bg-[#F6F9FD] py-8 sm:py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {loading && <div className="text-center text-[#60708A] py-20">Đang tải…</div>}
          {error && <div className="rounded-2xl bg-red-50 border border-red-100 text-red-700 px-5 py-4">Không tải được khóa học.</div>}

          {course && (
            <form onSubmit={submit}>
              <Link to="/Home/Courses" className="inline-flex items-center gap-1 text-sm font-semibold text-[#60708A] hover:text-[#1467E8]">
                <Icon name="arrow_back" className="text-[1.1rem]" /> Quay lại khóa học
              </Link>

              <div className="mt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#172B4D]">Đăng ký khóa học</h1>
                  <p className="text-sm text-[#60708A] mt-1">Chọn lớp, rồi chuyển khoản học phí. Bạn vào lớp sau khi trung tâm xác nhận đã nhận tiền.</p>
                </div>
                <ol className="flex items-center gap-2 text-xs font-semibold" aria-label="Các bước đăng ký">
                  {STEPS.map((s, i) => {
                    const n = i + 1;
                    const done = n < currentStep;
                    const now = n === currentStep;
                    return (
                      <li key={s} className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 rounded-full pl-1 pr-3 py-1 ${now ? 'bg-[#1467E8] text-white' : done ? 'bg-[#EAF3FF] text-[#1467E8]' : 'bg-white text-[#60708A] border border-[#E4EAF2]'}`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.6875rem] ${now ? 'bg-white text-[#1467E8]' : done ? 'bg-[#1467E8] text-white' : 'bg-[#EEF2F7]'}`}>
                            {done ? <Icon name="check" className="text-[0.875rem]" /> : n}
                          </span>
                          <span className="hidden sm:inline">{s}</span>
                        </span>
                        {n < STEPS.length && <span className="w-3 sm:w-5 h-px bg-[#C9D6E8]" />}
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_23rem] gap-6 items-start">
                <div className="space-y-6 min-w-0">
                  {/* Khóa học */}
                  <section className="bg-white rounded-3xl border border-[#E4EAF2] shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-5">
                    {course.ImageUrl && imgOk && (
                      <img src={course.ImageUrl} alt={course.Title} onError={() => setImgOk(false)} className="w-full sm:w-56 aspect-[16/10] object-cover rounded-2xl bg-[#EAF3FF] shrink-0" />
                    )}
                    <div className="min-w-0 flex flex-col">
                      {course.CourseCode && <span className="self-start text-[0.6875rem] font-bold tracking-wider text-[#1467E8] bg-[#EAF3FF] rounded-full px-2.5 py-1">{course.CourseCode}</span>}
                      <h2 className="text-lg sm:text-xl font-bold text-[#172B4D] leading-snug mt-2">{course.Title}</h2>
                      {course.Description && <p className="text-sm text-[#60708A] mt-1.5 line-clamp-3">{course.Description}</p>}
                      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-auto pt-3 text-sm text-[#172B4D]">
                        {course.TotalLessons > 0 && <span className="inline-flex items-center gap-1.5"><Icon name="play_circle" className="text-[1.15rem] text-[#1467E8]" />{course.TotalLessons} bài giảng</span>}
                        <span className="inline-flex items-center gap-1.5"><Icon name="replay" className="text-[1.15rem] text-[#1467E8]" />Xem lại video buổi học</span>
                        <span className="inline-flex items-center gap-1.5"><Icon name="assignment" className="text-[1.15rem] text-[#1467E8]" />Bài tập, bài kiểm tra có chấm điểm</span>
                      </div>
                    </div>
                  </section>

                  {/* Bước 1: chọn lớp */}
                  <section className="bg-white rounded-3xl border border-[#E4EAF2] shadow-sm p-5 sm:p-6">
                    <div className="flex items-baseline justify-between gap-3 mb-4">
                      <h2 className="text-lg font-bold text-[#172B4D]">1. Chọn lớp</h2>
                      {classes.length > 0 && <span className="text-xs text-[#60708A]">{classes.length} lớp đang mở</span>}
                    </div>
                    {classes.length === 0 && (
                      <div className="rounded-2xl bg-[#F6F9FD] border border-dashed border-[#C9D6E8] p-5 text-sm text-[#60708A] text-center">
                        Khóa học này chưa có lớp đang mở. Vui lòng liên hệ trung tâm để được thông báo khi có lớp mới.
                      </div>
                    )}
                    <div className="space-y-3">
                      {classes.map((c) => {
                        const left = seatsLeft(c);
                        const full = isFull(c);
                        const active = selectedClass === c.Id;
                        const taken = counts[c.Id] || 0;
                        const pct = c.MaxStudents ? Math.min(100, Math.round((taken / c.MaxStudents) * 100)) : null;
                        const w = weeks(c.StartDate, c.EndDate);
                        return (
                          <label key={c.Id} className={`block rounded-2xl border-2 p-4 sm:p-5 transition ${full ? 'opacity-55 cursor-not-allowed border-[#E4EAF2]' : active ? 'border-[#1467E8] bg-[#F3F8FF] cursor-pointer' : 'border-[#E4EAF2] hover:border-[#B0D0FB] cursor-pointer'}`}>
                            <div className="flex items-start gap-3">
                              <input type="radio" name="class" className="mt-1 w-4 h-4 accent-[#1467E8]" disabled={full} checked={active} onChange={() => setSelectedClass(c.Id)} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="font-bold text-[#172B4D]">{c.ClassName}</div>
                                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${full ? 'bg-red-50 text-red-600' : left !== null && left <= 5 ? 'bg-amber-50 text-amber-700' : 'bg-[#EAF3FF] text-[#1467E8]'}`}>
                                    {left === null ? 'Còn chỗ' : full ? 'Hết chỗ' : `Còn ${left} chỗ`}
                                  </span>
                                </div>
                                <dl className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                  {c.Teacher?.FullName && (
                                    <div className="flex items-center gap-2 min-w-0"><Icon name="person" className="text-[1.1rem] text-[#60708A]" /><dt className="sr-only">Giảng viên</dt><dd className="truncate"><span className="text-[#60708A]">GV </span><b className="font-semibold text-[#172B4D]">{c.Teacher.FullName}</b></dd></div>
                                  )}
                                  {c.Schedule && (
                                    <div className="flex items-center gap-2 min-w-0"><Icon name="schedule" className="text-[1.1rem] text-[#60708A]" /><dt className="sr-only">Lịch học</dt><dd className="truncate text-[#172B4D]">{c.Schedule}</dd></div>
                                  )}
                                  <div className="flex items-center gap-2 min-w-0"><Icon name="event" className="text-[1.1rem] text-[#60708A]" /><dt className="sr-only">Thời gian</dt><dd className="truncate text-[#172B4D]">{day(c.StartDate)}{c.EndDate ? ` – ${day(c.EndDate)}` : ''}{w ? <span className="text-[#60708A]"> · {w} tuần</span> : null}</dd></div>
                                  {c.MaxStudents > 0 && (
                                    <div className="flex items-center gap-2 min-w-0"><Icon name="groups" className="text-[1.1rem] text-[#60708A]" /><dt className="sr-only">Sĩ số</dt><dd className="text-[#172B4D]">{taken}/{c.MaxStudents} học viên</dd></div>
                                  )}
                                </dl>
                                {pct !== null && (
                                  <div className="mt-3 h-1.5 rounded-full bg-[#E4EAF2] overflow-hidden" aria-hidden="true">
                                    <div className={`h-full rounded-full ${full ? 'bg-red-400' : pct >= 80 ? 'bg-amber-400' : 'bg-[#1467E8]'}`} style={{ width: `${pct}%` }} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </section>

                  {/* Bước 2: cách thanh toán */}
                  <section className="bg-white rounded-3xl border border-[#E4EAF2] shadow-sm p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-[#172B4D]">2. Thanh toán bằng chuyển khoản</h2>
                    <p className="text-sm text-[#60708A] mt-1">Không cần thẻ, không qua cổng thanh toán. Tiền chuyển thẳng vào tài khoản của trung tâm.</p>
                    <ol className="mt-4 grid sm:grid-cols-3 gap-3">
                      {PAY_STEPS.map((s, i) => (
                        <li key={s.title} className="rounded-2xl bg-[#F6F9FD] border border-[#E4EAF2] p-4">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-[#1467E8] text-white flex items-center justify-center"><Icon name={s.icon} className="text-[1.1rem]" /></span>
                            <span className="text-xs font-bold text-[#60708A]">Bước {i + 1}</span>
                          </div>
                          <div className="font-bold text-[#172B4D] mt-2.5">{s.title}</div>
                          <p className="text-xs text-[#60708A] mt-1 leading-relaxed">{s.text}</p>
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>

                {/* Tóm tắt đơn */}
                <aside className="lg:sticky lg:top-24 bg-white rounded-3xl border border-[#E4EAF2] shadow-[0_8px_30px_rgba(20,60,120,0.08)] overflow-hidden">
                  <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-[#E4EAF2]">
                    <h2 className="text-lg font-bold text-[#172B4D]">Đơn đăng ký</h2>
                    <div className="font-semibold text-[#172B4D] mt-2 leading-snug">{course.Title}</div>
                  </div>

                  <dl className="px-5 sm:px-6 py-4 space-y-2.5 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-[#60708A]">Lớp</dt><dd className="font-semibold text-[#172B4D] text-right">{chosen ? chosen.ClassName : 'Chưa chọn'}</dd></div>
                    {chosen?.Schedule && <div className="flex justify-between gap-4"><dt className="text-[#60708A]">Lịch học</dt><dd className="text-[#172B4D] text-right">{chosen.Schedule}</dd></div>}
                    {chosen && <div className="flex justify-between gap-4"><dt className="text-[#60708A]">Khai giảng</dt><dd className="text-[#172B4D] text-right">{day(chosen.StartDate)}</dd></div>}
                    {chosen?.Teacher?.FullName && <div className="flex justify-between gap-4"><dt className="text-[#60708A]">Giảng viên</dt><dd className="text-[#172B4D] text-right">{chosen.Teacher.FullName}</dd></div>}
                  </dl>

                  <div className="mx-5 sm:mx-6 rounded-2xl bg-[#F3F8FF] px-4 py-3 flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-[#172B4D]">Học phí</span>
                    <span className="text-2xl font-bold text-[#1467E8]">{money(course.BasePrice)}</span>
                  </div>

                  <div className="px-5 sm:px-6 pb-6">
                    {isGuest && (
                      <div className="mt-5 space-y-3">
                        <div className="text-sm font-bold text-[#172B4D]">Thông tin của bạn <span className="font-normal text-[#60708A]">(chưa có tài khoản cũng đăng ký được)</span></div>
                        <div>
                          <label htmlFor="checkout-name" className="block text-xs font-semibold text-[#60708A] mb-1">Họ và tên</label>
                          <input id="checkout-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" maxLength={100} autoComplete="name" className={input} />
                        </div>
                        <div>
                          <label htmlFor="checkout-phone" className="block text-xs font-semibold text-[#60708A] mb-1">Số điện thoại</label>
                          <input id="checkout-phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" inputMode="tel" maxLength={15} autoComplete="tel" className={input} />
                          <p className="text-xs text-[#60708A] mt-1.5">Sau khi nhận học phí, trung tâm gửi tài khoản đăng nhập vào số này.</p>
                        </div>
                      </div>
                    )}
                    {user && isStudent && (
                      <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-[#F6F9FD] border border-[#E4EAF2] px-3.5 py-2.5 text-sm">
                        <Icon name="account_circle" className="text-[1.4rem] text-[#1467E8]" />
                        <span className="min-w-0 truncate">Đăng ký bằng tài khoản <b className="text-[#172B4D]">{user.fullName || user.email}</b></span>
                      </div>
                    )}
                    {user && !isStudent && <p className="mt-5 text-sm text-amber-800 bg-amber-50 rounded-xl p-3">Chỉ tài khoản học viên mới đăng ký được khóa học.</p>}

                    {submitError && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5" role="alert">{submitError}</p>}

                    {canSubmit && (
                      <button disabled={submitting || !chosen || isFull(chosen)} className="mt-5 w-full py-3.5 rounded-xl bg-[#1467E8] hover:bg-[#0B57D0] disabled:opacity-50 text-white font-bold inline-flex items-center justify-center gap-2 shadow-[0_6px_18px_rgba(20,103,232,0.28)] transition-colors">
                        {submitting ? 'Đang tạo hóa đơn…' : <>Tiếp tục thanh toán <Icon name="arrow_forward" className="text-[1.15rem]" /></>}
                      </button>
                    )}
                    {isGuest && (
                      <Link to={`/Auth/Login?returnUrl=${encodeURIComponent(`/Auth/Checkout?courseId=${course.Id}`)}`} className="block text-center mt-3 text-sm font-semibold text-[#1467E8] hover:underline">
                        Đã có tài khoản? Đăng nhập
                      </Link>
                    )}
                    <p className="mt-4 flex items-start gap-2 text-xs text-[#60708A]">
                      <Icon name="lock" className="text-[1rem] mt-px" />
                      Bạn chỉ được xếp vào lớp khi trung tâm đã nhận đủ học phí. Mỗi hóa đơn có nội dung chuyển khoản riêng để đối chiếu.
                    </p>
                  </div>
                </aside>
              </div>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
