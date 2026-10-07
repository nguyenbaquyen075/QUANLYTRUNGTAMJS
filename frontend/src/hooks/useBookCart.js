import { useCallback, useEffect, useState } from 'react';

// Giỏ sách lưu trong trình duyệt (chỉ gồm mã sách + số lượng; giá luôn do server tính lại khi đặt hàng).
const KEY = 'lumiedu_book_cart';
const EVENT = 'lumiedu-book-cart';
const MAX_QTY = 20;

const read = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((i) => Number.isInteger(i.bookId) && i.quantity > 0) : [];
  } catch (e) { return []; }
};
const write = (items) => {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* trình duyệt chặn lưu: giỏ chỉ sống trong phiên */ }
  window.dispatchEvent(new Event(EVENT));
};

export function useBookCart() {
  const [items, setItems] = useState(read);
  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener('storage', sync); };
  }, []);

  const add = useCallback((bookId, qty = 1) => {
    const cur = read();
    const found = cur.find((i) => i.bookId === bookId);
    if (found) found.quantity = Math.min(MAX_QTY, found.quantity + qty); else cur.push({ bookId, quantity: Math.min(MAX_QTY, qty) });
    write(cur);
  }, []);
  const setQty = useCallback((bookId, quantity) => {
    const q = Math.max(0, Math.min(MAX_QTY, quantity));
    write(read().map((i) => (i.bookId === bookId ? { ...i, quantity: q } : i)).filter((i) => i.quantity > 0));
  }, []);
  const remove = useCallback((bookId) => write(read().filter((i) => i.bookId !== bookId)), []);
  const clear = useCallback(() => write([]), []);

  return { items, count: items.reduce((s, i) => s + i.quantity, 0), add, setQty, remove, clear };
}
