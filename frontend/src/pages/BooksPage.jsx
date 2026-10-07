import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useBookCart } from '../hooks/useBookCart';
import api from '../services/api';

const money = (n) => `${Math.round(Number(n) || 0).toLocaleString('vi-VN')}đ`;
const SORTS = { featured: 'Nổi bật', asc: 'Giá thấp đến cao', desc: 'Giá cao đến thấp' };
const input = 'w-full rounded-xl border border-[#E4EAF2] bg-white px-3 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#1467E8]/30 focus:border-[#1467E8]';

function Cover({ book }) {
  const [bad, setBad] = useState(!book.coverUrl);
  return bad
    ? <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1467E8] to-[#0B2A5E] text-white p-5 text-center font-bold">{book.title}</div>
    : <img src={book.coverUrl} alt={book.title} loading="lazy" onError={() => setBad(true)} className="w-full h-full object-cover" />;
}

function BookCard({ book, onAdd }) {
  const off = book.originalPrice && book.originalPrice > book.price ? Math.round((1 - book.price / book.originalPrice) * 100) : 0;
  return (
    <article className="group bg-white rounded-2xl border border-[#E4EAF2] shadow-[0_2px_12px_rgba(20,60,120,0.06)] overflow-hidden flex flex-col hover:shadow-[0_10px_30px_rgba(20,60,120,0.14)] transition-shadow">
      <div className="relative aspect-[3/4] bg-[#EAF3FF] overflow-hidden">
        <Cover book={book} />
        {book.badge && <span className="absolute top-3 left-3 bg-[#1467E8] text-white text-xs font-semibold px-3 py-1 rounded-full shadow">{book.badge}</span>}
        {off > 0 && <span className="absolute top-3 right-3 bg-[#FF4D4F] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">-{off}%</span>}
        {!book.inStock && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><span className="bg-[#172B4D] text-white text-sm font-semibold px-4 py-1.5 rounded-full">Hết hàng</span></div>}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-[#60708A] mb-1">{[book.subject, book.grade].filter(Boolean).join(' · ')}</div>
        <h3 className="font-semibold text-[#172B4D] leading-snug line-clamp-2 min-h-[2.75rem]" title={book.title}>{book.title}</h3>
        {book.author && <div className="text-xs text-[#60708A] mt-1 truncate">{book.author}</div>}
        {book.description && <p className="text-xs text-[#60708A] mt-2 line-clamp-2">{book.description}</p>}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#1467E8]">{money(book.price)}</span>
            {off > 0 && <span className="text-sm text-slate-400 line-through">{money(book.originalPrice)}</span>}
          </div>
          <button disabled={!book.inStock} onClick={() => onAdd(book)} className="mt-3 w-full py-2.5 rounded-xl bg-[#1467E8] hover:bg-[#0B57D0] disabled:bg-slate-200 disabled:text-slate-500 text-white text-sm font-semibold transition-colors">
            {book.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
          </button>
        </div>
      </div>
    </article>
  );
}

function CartDrawer({ open, onClose, books, cart }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState('cart'); // cart | form
  const [form, setForm] = useState({ buyerName: '', phone: '', address: '', note: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const byId = useMemo(() => Object.fromEntries(books.map((b) => [b.id, b])), [books]);
  const lines = cart.items.map((i) => ({ ...i, book: byId[i.bookId] })).filter((l) => l.book);
  const total = lines.reduce((s, l) => s + l.book.price * l.quantity, 0);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => { if (user) setForm((f) => ({ ...f, buyerName: f.buyerName || user.fullName || '', phone: f.phone || user.phone || '' })); }, [user]);
  useEffect(() => { if (!open) { setStep('cart'); setError(''); } }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const res = await api.post('/api/BookOrders', { ...form, items: lines.map((l) => ({ bookId: l.bookId, quantity: l.quantity })) });
      cart.clear();
      onClose();
      navigate(`/Home/Books/Order/${res.data.orderId}?token=${res.data.token}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Không đặt được hàng. Vui lòng thử lại.');
    } finally { setBusy(false); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Giỏ sách">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4EAF2]">
          <h2 className="font-bold text-lg text-[#172B4D]">{step === 'cart' ? `Giỏ sách (${cart.count})` : 'Thông tin nhận sách'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100" aria-label="Đóng"><span className="material-symbols-outlined">close</span></button>
        </div>

        {step === 'cart' ? (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {lines.length === 0 && <p className="text-center text-[#60708A] py-16">Giỏ sách đang trống.</p>}
              {lines.map((l) => (
                <div key={l.bookId} className="flex gap-3">
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#EAF3FF] shrink-0"><Cover book={l.book} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#172B4D] line-clamp-2">{l.book.title}</div>
                    <div className="text-sm text-[#1467E8] font-semibold mt-0.5">{money(l.book.price)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => cart.setQty(l.bookId, l.quantity - 1)} className="w-7 h-7 rounded-lg border border-[#E4EAF2] hover:bg-slate-50" aria-label="Giảm">−</button>
                      <span className="w-6 text-center text-sm font-semibold">{l.quantity}</span>
                      <button onClick={() => cart.setQty(l.bookId, l.quantity + 1)} className="w-7 h-7 rounded-lg border border-[#E4EAF2] hover:bg-slate-50" aria-label="Tăng">+</button>
                      <button onClick={() => cart.remove(l.bookId)} className="ml-auto text-xs text-red-500 hover:underline">Xóa</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E4EAF2] p-5">
              <div className="flex justify-between text-[#172B4D] mb-3"><span className="font-semibold">Tạm tính</span><span className="text-xl font-bold text-[#1467E8]">{money(total)}</span></div>
              <button disabled={lines.length === 0} onClick={() => setStep('form')} className="w-full py-3 rounded-xl bg-[#1467E8] hover:bg-[#0B57D0] disabled:opacity-50 text-white font-semibold">Đặt mua</button>
            </div>
          </>
        ) : (
          <form onSubmit={submit} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <label className="block text-sm font-semibold text-[#172B4D]">Họ và tên<input required maxLength={100} className={`${input} mt-1`} value={form.buyerName} onChange={set('buyerName')} /></label>
              <label className="block text-sm font-semibold text-[#172B4D]">Số điện thoại<input required inputMode="tel" maxLength={15} className={`${input} mt-1`} value={form.phone} onChange={set('phone')} /></label>
              <label className="block text-sm font-semibold text-[#172B4D]">Địa chỉ nhận sách<textarea required minLength={8} maxLength={300} rows={3} className={`${input} mt-1`} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" value={form.address} onChange={set('address')} /></label>
              <label className="block text-sm font-semibold text-[#172B4D]">Ghi chú <span className="font-normal text-[#60708A]">(không bắt buộc)</span><input maxLength={300} className={`${input} mt-1`} value={form.note} onChange={set('note')} /></label>
              <div className="rounded-xl bg-[#EAF3FF] p-3 text-sm text-[#0B57D0]">Bạn thanh toán bằng chuyển khoản ở bước tiếp theo. Trung tâm gửi sách sau khi nhận được tiền.</div>
              {error && <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm p-3">{error}</div>}
            </div>
            <div className="border-t border-[#E4EAF2] p-5 space-y-2">
              <div className="flex justify-between text-[#172B4D]"><span className="font-semibold">Tổng cộng</span><span className="text-xl font-bold text-[#1467E8]">{money(total)}</span></div>
              <button disabled={busy} className="w-full py-3 rounded-xl bg-[#1467E8] hover:bg-[#0B57D0] disabled:opacity-60 text-white font-semibold">{busy ? 'Đang tạo đơn…' : 'Xác nhận đặt hàng'}</button>
              <button type="button" onClick={() => setStep('cart')} className="w-full text-sm font-semibold text-[#60708A] hover:text-[#1467E8]">Quay lại giỏ</button>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}

export default function BooksPage() {
  const cart = useBookCart();
  const [books, setBooks] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [sort, setSort] = useState('featured');
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { api.get('/api/Books').then((r) => setBooks(r.data.books || [])).catch(() => setError('Không tải được danh sách sách. Vui lòng thử lại.')); }, []);

  const subjects = useMemo(() => [...new Set((books || []).map((b) => b.subject).filter(Boolean))], [books]);
  const grades = useMemo(() => [...new Set((books || []).map((b) => b.grade).filter(Boolean))], [books]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = (books || []).filter((b) => (!subject || b.subject === subject) && (!grade || b.grade === grade)
      && (!needle || [b.title, b.author, b.subject].some((v) => String(v || '').toLowerCase().includes(needle))));
    if (sort === 'asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [books, q, subject, grade, sort]);

  const add = (book) => { cart.add(book.id); setToast(`Đã thêm "${book.title}" vào giỏ`); setTimeout(() => setToast(''), 2200); };

  return (
    <MainLayout hideChatbot>
      <section className="bg-gradient-to-br from-[#1467E8] to-[#0B2A5E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Sách của LumiEdu</h1>
          <p className="mt-2 text-[#d6e7ff] max-w-2xl">Tài liệu ôn thi do giáo viên của trung tâm biên soạn. Đặt online, chuyển khoản và nhận sách tại nhà.</p>
          <div className="mt-6 relative max-w-xl">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên sách, tác giả, môn học…" className="w-full pl-11 pr-4 py-3 rounded-xl text-[#172B4D] text-sm focus:outline-none focus:ring-2 focus:ring-white/60" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {['', ...subjects].map((s) => (
              <button key={s || 'all'} onClick={() => setSubject(s)} className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${subject === s ? 'bg-[#1467E8] text-white border-[#1467E8]' : 'bg-white text-[#172B4D] border-[#E4EAF2] hover:border-[#1467E8]'}`}>{s || 'Tất cả'}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="rounded-xl border border-[#E4EAF2] bg-white px-3 py-2 text-sm" aria-label="Khối lớp">
              <option value="">Mọi khối</option>{grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-[#E4EAF2] bg-white px-3 py-2 text-sm" aria-label="Sắp xếp">
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button onClick={() => setOpen(true)} className="relative inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1467E8] hover:bg-[#0B57D0] text-white text-sm font-semibold">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span> Giỏ sách
              {cart.count > 0 && <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-[#FF4D4F] text-xs font-bold flex items-center justify-center">{cart.count}</span>}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3">{error}</div>}
        {books === null && !error && <p className="text-center text-[#60708A] py-20">Đang tải sách…</p>}
        {books && books.length === 0 && <p className="text-center text-[#60708A] py-20">Trung tâm chưa đăng sách nào. Vui lòng quay lại sau.</p>}
        {books && books.length > 0 && shown.length === 0 && <p className="text-center text-[#60708A] py-20">Không tìm thấy sách phù hợp.</p>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {shown.map((b) => <BookCard key={b.id} book={b} onAdd={add} />)}
        </div>
      </div>

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-[#172B4D] text-white text-sm px-4 py-2.5 rounded-xl shadow-lg max-w-[90vw] truncate">{toast}</div>}
      <CartDrawer open={open} onClose={() => setOpen(false)} books={books || []} cart={cart} />
    </MainLayout>
  );
}
