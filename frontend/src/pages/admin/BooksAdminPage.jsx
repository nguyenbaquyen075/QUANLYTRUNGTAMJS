import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import api from '../../services/api';

const money = (n) => `${Math.round(Number(n) || 0).toLocaleString('vi-VN')}đ`;
const when = (d) => (d ? new Date(d).toLocaleString('vi-VN') : '');
const STATUS = {
  PENDING: ['Chờ chuyển khoản', 'bg-amber-50 text-amber-700'],
  PAID: ['Đã nhận tiền, chờ gửi', 'bg-[#EAF3FF] text-[#1467E8]'],
  SHIPPED: ['Đã gửi', 'bg-[#E7F7EC] text-[#0F8A3B]'],
  CANCELLED: ['Đã hủy', 'bg-slate-100 text-slate-500']
};
const EMPTY = { title: '', author: '', subject: '', grade: '', price: '', originalPrice: '', description: '', badge: '', inStock: true, isActive: true, sortOrder: 0 };
const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1467E8]/30 focus:border-[#1467E8]';

function BookForm({ book, onClose, onSaved }) {
  const [f, setF] = useState(book ? { ...EMPTY, ...book, originalPrice: book.originalPrice ?? '', author: book.author || '', subject: book.subject || '', grade: book.grade || '', description: book.description || '', badge: book.badge || '' } : EMPTY);
  const [cover, setCover] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const fd = new FormData();
    ['title', 'author', 'subject', 'grade', 'price', 'originalPrice', 'description', 'badge', 'sortOrder'].forEach((k) => fd.append(k, f[k] ?? ''));
    fd.append('inStock', f.inStock); fd.append('isActive', f.isActive);
    if (cover) fd.append('cover', cover);
    try {
      await api.post(book ? `/api/Admin/Books/${book.id}` : '/api/Admin/Books', fd, { headers: { 'Content-Type': undefined } });
      onSaved();
    } catch (err) { setError(err.response?.data?.message || 'Không lưu được sách.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 space-y-3">
        <h3 className="font-bold text-lg text-slate-900">{book ? 'Sửa sách' : 'Thêm sách'}</h3>
        <label className="block text-sm font-semibold text-slate-700">Tên sách<input required maxLength={200} className={`${field} mt-1`} value={f.title} onChange={set('title')} /></label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block text-sm font-semibold text-slate-700">Tác giả<input maxLength={150} className={`${field} mt-1`} value={f.author} onChange={set('author')} /></label>
          <label className="block text-sm font-semibold text-slate-700">Nhãn nổi bật <span className="font-normal text-slate-400">(vd: Bán chạy)</span><input maxLength={30} className={`${field} mt-1`} value={f.badge} onChange={set('badge')} /></label>
          <label className="block text-sm font-semibold text-slate-700">Môn<input maxLength={40} placeholder="Toán học, Vật lý…" className={`${field} mt-1`} value={f.subject} onChange={set('subject')} /></label>
          <label className="block text-sm font-semibold text-slate-700">Khối / lớp<input maxLength={30} placeholder="Lớp 12, Lớp 11-12…" className={`${field} mt-1`} value={f.grade} onChange={set('grade')} /></label>
          <label className="block text-sm font-semibold text-slate-700">Giá bán (đ)<input required type="number" min="0" step="1000" className={`${field} mt-1`} value={f.price} onChange={set('price')} /></label>
          <label className="block text-sm font-semibold text-slate-700">Giá gốc (đ) <span className="font-normal text-slate-400">để gạch ngang, có thể bỏ trống</span><input type="number" min="0" step="1000" className={`${field} mt-1`} value={f.originalPrice} onChange={set('originalPrice')} /></label>
        </div>
        <label className="block text-sm font-semibold text-slate-700">Mô tả<textarea rows={3} maxLength={2000} className={`${field} mt-1`} value={f.description} onChange={set('description')} /></label>
        <div className="flex flex-wrap items-center gap-4">
          {book?.coverUrl && !cover && <img src={book.coverUrl} alt="" className="w-14 h-[74px] object-cover rounded-lg border border-slate-200" />}
          <label className="text-sm font-semibold text-slate-700">Ảnh bìa <span className="font-normal text-slate-400">(JPG/PNG/WebP, tối đa 5 MB, nên cỡ 600×800)</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="block mt-1 text-sm" onChange={(e) => setCover(e.target.files[0] || null)} />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-700">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.inStock} onChange={set('inStock')} /> Còn hàng</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.isActive} onChange={set('isActive')} /> Hiện trên trang bán</label>
          <label className="flex items-center gap-2">Thứ tự<input type="number" className={`${field} w-20`} value={f.sortOrder} onChange={set('sortOrder')} /></label>
        </div>
        {error && <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm p-3">{error}</div>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100">Hủy</button>
          <button disabled={busy} className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#1467E8] hover:bg-[#0B57D0] disabled:opacity-60 text-white">{busy ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </form>
    </div>
  );
}

export default function BooksAdminPage() {
  const [tab, setTab] = useState('orders');
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | book
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    try {
      const [b, o] = await Promise.all([api.get('/api/Admin/Books'), api.get('/api/Admin/BookOrders')]);
      setBooks(b.data.books || []); setOrders(o.data.orders || []);
    } catch (e) { setMessage('Không tải được dữ liệu. Bạn cần đăng nhập bằng tài khoản admin.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (url, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try { const r = await api.post(url, {}); setMessage(r.data.message || 'Đã cập nhật.'); }
    catch (e) { setMessage(e.response?.data?.message || 'Thao tác không thành công.'); }
    load();
  };
  const confirmPaid = async (o, method) => {
    if (!window.confirm(`Xác nhận đã nhận ${money(o.total)} (${method === 'BANK' ? 'chuyển khoản' : 'tiền mặt'}) cho đơn ${o.code}?`)) return;
    try { await api.post(`/api/Admin/BookOrders/${o.id}/Confirm`, { method }); setMessage(`Đã xác nhận đơn ${o.code}. Hãy gói và gửi sách.`); }
    catch (e) { setMessage(e.response?.data?.message || 'Không xác nhận được.'); }
    load();
  };

  const pending = orders.filter((o) => o.status === 'PENDING').length;
  const toShip = orders.filter((o) => o.status === 'PAID').length;
  const shownOrders = orders.filter((o) => !filter || o.status === filter);

  return (
    <AdminLayout activeTab="tabBooks" breadcrumb={['Trang chủ', 'Quản trị hệ thống', 'Sách & đơn sách']}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Sách &amp; đơn sách</h2>
            <p className="text-slate-500 text-sm mt-1">Quản lý sách bán trên website và xử lý đơn mua sách. Đơn đã nhận tiền được tính vào Doanh thu &amp; Báo cáo.</p>
          </div>
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 text-sm font-semibold">
            {[['orders', `Đơn mua sách${pending + toShip ? ` (${pending + toShip})` : ''}`], ['books', `Danh mục sách (${books.length})`]].map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg ${tab === k ? 'bg-[#1467E8] text-white' : 'text-slate-700 hover:bg-[#EAF3FF]'}`}>{label}</button>
            ))}
          </div>
        </div>
        {message && <div className="rounded-xl bg-[#EAF3FF] text-[#0B57D0] text-sm font-semibold px-4 py-3 flex justify-between"><span>{message}</span><button onClick={() => setMessage('')} aria-label="Đóng">✕</button></div>}

        {tab === 'books' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Danh mục sách</h3>
              <button onClick={() => setEditing('new')} className="px-4 py-2 rounded-lg bg-[#1467E8] hover:bg-[#0B57D0] text-white text-sm font-semibold">+ Thêm sách</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase text-left"><th className="p-4">Sách</th><th>Môn / khối</th><th>Giá bán</th><th>Trạng thái</th><th className="p-4 text-right">Thao tác</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {books.map((b) => (
                    <tr key={b.id}>
                      <td className="p-4"><div className="flex items-center gap-3">{b.coverUrl ? <img src={b.coverUrl} alt="" className="w-10 h-[52px] object-cover rounded" /> : <div className="w-10 h-[52px] rounded bg-slate-100" />}<div><div className="font-semibold text-slate-800">{b.title}</div><div className="text-xs text-slate-500">{b.author}</div></div></div></td>
                      <td className="text-slate-600">{[b.subject, b.grade].filter(Boolean).join(' · ')}</td>
                      <td><div className="font-semibold text-slate-800">{money(b.price)}</div>{b.originalPrice && <div className="text-xs text-slate-400 line-through">{money(b.originalPrice)}</div>}</td>
                      <td className="space-x-1"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${b.isActive ? 'bg-[#E7F7EC] text-[#0F8A3B]' : 'bg-slate-100 text-slate-500'}`}>{b.isActive ? 'Đang bán' : 'Đã ẩn'}</span>{!b.inStock && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600">Hết hàng</span>}</td>
                      <td className="p-4 text-right whitespace-nowrap"><button onClick={() => setEditing(b)} className="text-[#1467E8] font-semibold mr-4 hover:underline">Sửa</button><button onClick={() => act(`/api/Admin/Books/${b.id}/Delete`, `Xóa "${b.title}"? Sách đã có đơn sẽ chỉ bị ẩn.`)} className="text-red-600 font-semibold hover:underline">Xóa</button></td>
                    </tr>
                  ))}
                  {books.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-slate-400">Chưa có sách nào. Bấm "Thêm sách" để bắt đầu.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-wrap justify-between items-center gap-3 px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Đơn mua sách <span className="font-normal text-slate-500 text-sm">· {pending} chờ chuyển khoản · {toShip} chờ gửi</span></h3>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" aria-label="Lọc trạng thái">
                <option value="">Tất cả trạng thái</option>{Object.entries(STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
            <div className="divide-y divide-slate-100">
              {shownOrders.map((o) => {
                const [label, cls] = STATUS[o.status] || [o.status, 'bg-slate-100'];
                return (
                  <div key={o.id} className="p-5 flex flex-wrap gap-4 justify-between">
                    <div className="min-w-[260px] flex-1">
                      <div className="flex items-center gap-3"><span className="font-bold text-[#1467E8]">{o.code}</span><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>{label}</span><span className="text-xs text-slate-400">{when(o.createdAt)}</span></div>
                      <div className="mt-1 text-sm text-slate-800 font-semibold">{o.buyerName} · {o.phone}</div>
                      <div className="text-sm text-slate-500">{o.address}{o.note ? ` — Ghi chú: ${o.note}` : ''}</div>
                      <ul className="mt-2 text-sm text-slate-600 list-disc pl-5">{o.items.map((i) => <li key={i.bookId}>{i.title} × {i.quantity} <span className="text-slate-400">({money(i.unitPrice)})</span></li>)}</ul>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-slate-900">{money(o.total)}</div>
                      {o.paidAt && <div className="text-xs text-slate-500">Nhận tiền {when(o.paidAt)} ({o.paymentMethod === 'CASH' ? 'tiền mặt' : 'chuyển khoản'})</div>}
                      <div className="mt-3 flex flex-wrap gap-2 justify-end">
                        {o.status === 'PENDING' && <>
                          <button onClick={() => confirmPaid(o, 'BANK')} className="px-3 py-1.5 rounded-lg bg-[#1467E8] hover:bg-[#0B57D0] text-white text-xs font-semibold">Đã nhận chuyển khoản</button>
                          <button onClick={() => confirmPaid(o, 'CASH')} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50">Tiền mặt</button>
                          <button onClick={() => act(`/api/Admin/BookOrders/${o.id}/Cancel`, `Hủy đơn ${o.code}?`)} className="px-3 py-1.5 rounded-lg text-red-600 text-xs font-semibold hover:bg-red-50">Hủy đơn</button>
                        </>}
                        {o.status === 'PAID' && <button onClick={() => act(`/api/Admin/BookOrders/${o.id}/Ship`, `Đánh dấu đã gửi sách cho đơn ${o.code}?`)} className="px-3 py-1.5 rounded-lg bg-[#0F8A3B] hover:bg-[#0c7332] text-white text-xs font-semibold">Đã gửi sách</button>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {shownOrders.length === 0 && <p className="p-10 text-center text-slate-400">Chưa có đơn mua sách nào.</p>}
            </div>
          </div>
        )}
      </div>
      {editing && <BookForm book={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setMessage('Đã lưu sách.'); load(); }} />}
    </AdminLayout>
  );
}
