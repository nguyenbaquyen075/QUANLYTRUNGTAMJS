import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

const money = (n) => `${Number(n || 0).toLocaleString('vi-VN')} đ`;
const day = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : 'Chưa xác định');
const input = 'w-full rounded-lg border border-[#D5DEEA] bg-white px-3.5 py-2.5 text-sm text-[#172B4D] placeholder:text-[#9AA8BC] focus:outline-none focus:ring-2 focus:ring-[#1467E8]/25 focus:border-[#1467E8]';
const card = 'bg-white rounded-2xl border border-[#E4EAF2] shadow-sm';

const Icon = ({ name, className = '' }) => <span className={`material-symbols-outlined leading-none ${className}`} aria-hidden="true">{name}</span>;

// Ba bước quen thuộc của trang thanh toán: trang này là bước 2.
const STEPS = ['Chọn khóa học', 'Thanh toán', 'Hoàn tất'];

function Section({ n, title, aside, children }) {
  return (
    <section className={`${card} p-5 sm:p-6`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-[#172B4D]">
          <span className="w-7 h-7 rounded-full bg-[#1467E8] text-white text-sm flex items-center justify-center">{n}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { cartItems } = useCart();
  const { content } = useSiteContent();
  const courseId = searchParams.get('courseId') || cartItems[0]?.Id || cartItems[0]?.id;

  const { data, loading, error } = useFetchData(`/Auth/Checkout?courseId=${courseId}`);
  const [selectedClass, setSelectedClass] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(false);
  const [imgOk, setImgOk] = useState(true);

  const course = data?.course;
  const classes = data?.classes || [];
  const counts = data?.classStudentCounts || {};
  const seatsLeft = (c) => (c.MaxStudents ? Math.max(0, c.MaxStudents - (counts[c.Id] || 0)) : null);
  const isFull = (c) => seatsLeft(c) === 0;
  const hotline = content?.settings?.contact_phone;

  useEffect(() => {
    if (!selectedClass && classes.length) setSelectedClass((classes.find((c) => !isFull(c)) || classes[0]).Id);
  }, [classes]); // eslint-disable-line react-hooks/exhaustive-deps

  const chosen = classes.find((c) => c.Id === selectedClass);
  const isStudent = user?.role === 'STUDENT';
  const isGuest = !user;
  const canSubmit = isStudent || isGuest;
  const loginUrl = course ? `/Auth/Login?returnUrl=${encodeURIComponent(`/Auth/Checkout?courseId=${course.Id}`)}` : '/Auth/Login';

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
      <div className="min-h-screen bg-[#F5F7FA] py-8 sm:py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Thanh bước */}
          <ol className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold mb-8" aria-label="Các bước thanh toán">
            {STEPS.map((s, i) => {
              const done = i === 0;
              const now = i === 1;
              return (
                <li key={s} className="flex items-center gap-2 sm:gap-3">
                  <span className={`flex items-center gap-2 ${now ? 'text-[#1467E8]' : done ? 'text-[#172B4D]' : 'text-[#9AA8BC]'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${now ? 'bg-[#1467E8] text-white' : done ? 'bg-[#1467E8]/10 text-[#1467E8]' : 'bg-[#E4EAF2] text-[#60708A]'}`}>
                      {done ? <Icon name="check" className="text-[0.95rem]" /> : i + 1}
                    </span>
                    {s}
                  </span>
                  {i < STEPS.length - 1 && <span className="w-8 sm:w-16 h-px bg-[#C9D6E8]" />}
                </li>
              );
            })}
          </ol>

          {loading && <div className="text-center text-[#60708A] py-20">Đang tải…</div>}
          {error && <div className="rounded-2xl bg-red-50 border border-red-100 text-red-700 px-5 py-4">Không tải được khóa học.</div>}

          {course && (
            <form onSubmit={submit} className="grid lg:grid-cols-[minmax(0,1fr)_24rem] gap-6 items-start">
              <div className="space-y-5 min-w-0">
                <h1 className="text-2xl sm:text-[1.75rem] font-bold text-[#172B4D]">Thanh toán</h1>

                {/* 1. Thông tin học viên */}
                <Section n={1} title="Thông tin học viên"
                  aside={isGuest && <Link to={loginUrl} className="text-sm font-semibold text-[#1467E8] hover:underline">Đã có tài khoản? Đăng nhập</Link>}>
                  {isGuest && (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="checkout-name" className="block text-sm font-medium text-[#172B4D] mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                          <input id="checkout-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" maxLength={100} autoComplete="name" className={input} />
                        </div>
                        <div>
                          <label htmlFor="checkout-phone" className="block text-sm font-medium text-[#172B4D] mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                          <input id="checkout-phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" inputMode="tel" maxLength={15} autoComplete="tel" className={input} />
                        </div>
                      </div>
                      <p className="text-xs text-[#60708A] mt-3 flex items-start gap-1.5"><Icon name="info" className="text-[1rem]" />Chưa có tài khoản vẫn đăng ký được. Sau khi nhận học phí, trung tâm gửi tài khoản đăng nhập vào số điện thoại này.</p>
                    </>
                  )}
                  {isStudent && (
                    <div className="flex items-center gap-3 rounded-xl bg-[#F5F7FA] px-4 py-3">
                      <span className="w-10 h-10 rounded-full bg-[#1467E8]/10 text-[#1467E8] flex items-center justify-center"><Icon name="person" /></span>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#172B4D] truncate">{user.fullName}</div>
                        {user.email && <div className="text-sm text-[#60708A] truncate">{user.email}</div>}
                      </div>
                    </div>
                  )}
                  {user && !isStudent && <p className="text-sm text-amber-800 bg-amber-50 rounded-xl p-3">Chỉ tài khoản học viên mới đăng ký được khóa học. Vui lòng đăng nhập bằng tài khoản học viên.</p>}
                </Section>

                {/* 2. Chọn lớp */}
                <Section n={2} title="Chọn lớp học" aside={classes.length > 0 && <span className="text-xs text-[#60708A]">{classes.length} lớp đang mở</span>}>
                  {classes.length === 0 && <p className="text-sm text-[#60708A]">Khóa học này chưa có lớp đang mở. Vui lòng liên hệ trung tâm.</p>}
                  <div className="space-y-3">
                    {classes.map((c) => {
                      const left = seatsLeft(c);
                      const full = isFull(c);
                      const active = selectedClass === c.Id;
                      return (
                        <label key={c.Id} className={`flex items-start gap-3 rounded-xl border p-4 transition ${full ? 'opacity-55 cursor-not-allowed border-[#E4EAF2]' : active ? 'border-[#1467E8] ring-1 ring-[#1467E8] bg-[#F5F9FF] cursor-pointer' : 'border-[#D5DEEA] hover:border-[#9DBDF0] cursor-pointer'}`}>
                          <input type="radio" name="class" className="mt-1 w-4 h-4 accent-[#1467E8]" disabled={full} checked={active} onChange={() => setSelectedClass(c.Id)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <span className="font-semibold text-[#172B4D]">{c.ClassName}</span>
                              <span className={`text-xs font-semibold shrink-0 ${full ? 'text-red-600' : left !== null && left <= 5 ? 'text-amber-700' : 'text-emerald-700'}`}>
                                {left === null ? 'Còn chỗ' : full ? 'Hết chỗ' : `Còn ${left}/${c.MaxStudents} chỗ`}
                              </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#60708A]">
                              {c.Schedule && <span className="inline-flex items-center gap-1"><Icon name="schedule" className="text-[1rem]" />{c.Schedule}</span>}
                              <span className="inline-flex items-center gap-1"><Icon name="event" className="text-[1rem]" />Khai giảng {day(c.StartDate)}</span>
                              {c.Teacher?.FullName && <span className="inline-flex items-center gap-1"><Icon name="person" className="text-[1rem]" />GV {c.Teacher.FullName}</span>}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </Section>

                {/* 3. Phương thức thanh toán */}
                <Section n={3} title="Phương thức thanh toán">
                  <label className="flex items-start gap-3 rounded-xl border border-[#1467E8] ring-1 ring-[#1467E8] bg-[#F5F9FF] p-4 cursor-pointer">
                    <input type="radio" name="method" className="mt-1 w-4 h-4 accent-[#1467E8]" checked readOnly />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-[#172B4D]">Chuyển khoản ngân hàng (VietQR)</span>
                        <Icon name="qr_code_2" className="text-[1.6rem] text-[#1467E8]" />
                      </div>
                      <p className="text-sm text-[#60708A] mt-1">Quét mã QR bằng ứng dụng ngân hàng bất kỳ. Mỗi đơn có nội dung chuyển khoản riêng để trung tâm đối chiếu.</p>
                      <ol className="mt-3 space-y-1.5 text-sm text-[#172B4D]">
                        {['Bấm "Thanh toán" để nhận hóa đơn và mã QR', 'Chuyển khoản đúng số tiền và nội dung', 'Trung tâm xác nhận rồi xếp bạn vào lớp'].map((t, i) => (
                          <li key={t} className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-white border border-[#C9D6E8] text-[0.6875rem] font-bold text-[#1467E8] flex items-center justify-center shrink-0">{i + 1}</span>{t}</li>
                        ))}
                      </ol>
                    </div>
                  </label>
                </Section>
              </div>

              {/* Tóm tắt đơn hàng */}
              <aside className="lg:sticky lg:top-24 space-y-4">
                <div className={`${card} p-5 sm:p-6`}>
                  <h2 className="text-lg font-bold text-[#172B4D] mb-4">Tóm tắt đơn hàng</h2>
                  <div className="flex gap-3">
                    {course.ImageUrl && imgOk
                      ? <img src={course.ImageUrl} alt="" onError={() => setImgOk(false)} className="w-20 h-14 rounded-lg object-cover bg-[#EAF3FF] shrink-0" />
                      : <span className="w-20 h-14 rounded-lg bg-[#EAF3FF] text-[#1467E8] flex items-center justify-center shrink-0"><Icon name="school" /></span>}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#172B4D] leading-snug line-clamp-2">{course.Title}</div>
                      <div className="text-xs text-[#60708A] mt-1 truncate">{chosen ? chosen.ClassName : 'Chưa chọn lớp'}{course.TotalLessons > 0 ? ` · ${course.TotalLessons} bài giảng` : ''}</div>
                    </div>
                  </div>

                  <dl className="mt-5 pt-4 border-t border-[#E4EAF2] space-y-2.5 text-sm">
                    <div className="flex justify-between"><dt className="text-[#60708A]">Học phí</dt><dd className="text-[#172B4D]">{money(course.BasePrice)}</dd></div>
                    <div className="flex justify-between"><dt className="text-[#60708A]">Phí giao dịch</dt><dd className="text-[#172B4D]">0 đ</dd></div>
                  </dl>
                  <div className="mt-4 pt-4 border-t border-[#E4EAF2] flex justify-between items-baseline">
                    <span className="font-semibold text-[#172B4D]">Tổng thanh toán</span>
                    <span className="text-2xl font-bold text-[#1467E8]">{money(course.BasePrice)}</span>
                  </div>

                  {canSubmit && (
                    <label className="mt-5 flex items-start gap-2.5 text-sm text-[#60708A] cursor-pointer">
                      <input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#1467E8] shrink-0" />
                      <span>Tôi đồng ý với <Link to="/Home/Privacy" target="_blank" className="font-semibold text-[#1467E8] hover:underline">điều khoản và chính sách bảo mật</Link> của trung tâm.</span>
                    </label>
                  )}

                  {submitError && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5" role="alert">{submitError}</p>}

                  {canSubmit && (
                    <button disabled={submitting || !chosen || isFull(chosen) || !agree} className="mt-5 w-full py-3.5 rounded-xl bg-[#1467E8] hover:bg-[#0B57D0] disabled:bg-[#9DBDF0] disabled:cursor-not-allowed text-white font-bold transition-colors">
                      {submitting ? 'Đang tạo hóa đơn…' : `Thanh toán ${money(course.BasePrice)}`}
                    </button>
                  )}
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#60708A]">
                    <Icon name="lock" className="text-[0.95rem]" /> Chỉ xếp lớp khi trung tâm đã nhận đủ học phí
                  </p>
                </div>

                {hotline && (
                  <div className={`${card} p-4 flex items-center gap-3`}>
                    <span className="w-10 h-10 rounded-full bg-[#1467E8]/10 text-[#1467E8] flex items-center justify-center shrink-0"><Icon name="support_agent" /></span>
                    <div className="text-sm">
                      <div className="text-[#60708A]">Cần hỗ trợ đăng ký?</div>
                      <div className="font-semibold text-[#172B4D] select-all">Hotline {hotline}</div>
                    </div>
                  </div>
                )}
              </aside>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
