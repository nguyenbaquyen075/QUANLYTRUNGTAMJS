const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../models');
const svc = require('../services/bookService');
const { uploadToCloud } = require('../utils/cloudinary');

const controller = {};

// ---- Tải ảnh bìa lên (chỉ ảnh, tối đa 5 MB) ----
const uploadsDir = path.join(__dirname, '../../public/uploads');
controller.upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => { fs.mkdirSync(uploadsDir, { recursive: true }); cb(null, uploadsDir); },
    filename: (req, file, cb) => cb(null, `book_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${path.extname(file.originalname).toLowerCase()}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(/^image\/(jpeg|png|webp)$/.test(file.mimetype) ? null : new Error('Chỉ nhận ảnh JPG, PNG hoặc WebP.'), /^image\/(jpeg|png|webp)$/.test(file.mimetype))
}).single('cover');

const plain = (b) => ({
  id: b.Id, title: b.Title, author: b.Author, subject: b.Subject, grade: b.Grade, price: Number(b.Price),
  originalPrice: b.OriginalPrice == null ? null : Number(b.OriginalPrice), description: b.Description, coverUrl: b.CoverUrl, badge: b.Badge,
  inStock: b.InStock, isActive: b.IsActive, sortOrder: b.SortOrder
});

const orderJson = (o) => ({
  id: o.Id, code: o.OrderCode, buyerName: o.BuyerName, phone: o.Phone, address: o.Address, note: o.Note, status: o.Status,
  total: Number(o.TotalAmount), paymentMethod: o.PaymentMethod, createdAt: o.CreatedAt, paidAt: o.PaidAt, shippedAt: o.ShippedAt,
  items: (o.Items || []).map((i) => ({ bookId: i.BookId, title: i.Title, unitPrice: Number(i.UnitPrice), quantity: i.Quantity }))
});

const fail = (res, err) => {
  if (!err.status) console.error(err);
  return res.status(err.status || 500).json({ success: false, message: err.status ? err.message : 'Lỗi hệ thống.' });
};

// ================= CÔNG KHAI =================
controller.listBooks = async (req, res) => {
  try { res.json({ success: true, books: (await svc.listPublicBooks()).map(plain) }); } catch (e) { fail(res, e); }
};

// Giới hạn đặt hàng không cần đăng nhập: 10 đơn / giờ / địa chỉ mạng.
const attempts = new Map();
const limited = (ip) => {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((t) => now - t < 3600 * 1000);
  if (recent.length >= 10) { attempts.set(ip, recent); return true; }
  recent.push(now); attempts.set(ip, recent); return false;
};

controller.createOrder = async (req, res) => {
  try {
    if (limited(req.ip)) return res.status(429).json({ success: false, message: 'Bạn đặt hàng quá nhiều lần. Vui lòng thử lại sau hoặc liên hệ trung tâm.' });
    const order = await svc.createOrder(req.body, req.session && req.session.userId);
    res.json({ success: true, orderId: order.Id, code: order.OrderCode, token: svc.signOrder(order.Id) });
  } catch (e) { fail(res, e); }
};

controller.getOrder = async (req, res) => {
  try {
    const order = await svc.getOrderForBuyer(parseInt(req.params.id), req.query.token);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    res.json({ success: true, order: orderJson(order), bank: await svc.getBankInfo() });
  } catch (e) { fail(res, e); }
};

controller.reportTransfer = async (req, res) => {
  try {
    const r = await svc.reportTransfer(parseInt(req.params.id), req.body && req.body.token);
    if (!r) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đang chờ thanh toán.' });
    res.json({ success: true, notified: r.notified });
  } catch (e) { fail(res, e); }
};

// ================= ADMIN =================
const toNumber = (v) => (v === '' || v == null ? null : Number(v));
const bool = (v, d) => (v === undefined ? d : v === true || v === 'true' || v === '1' || v === 'on');

function readBookFields(req, existing) {
  const b = req.body || {};
  const title = String(b.title !== undefined ? b.title : (existing && existing.Title) || '').trim();
  const price = b.price !== undefined ? toNumber(b.price) : (existing && Number(existing.Price));
  if (title.length < 2 || title.length > 200) throw Object.assign(new Error('Tên sách từ 2 đến 200 ký tự.'), { status: 400 });
  if (!(price >= 0) || price > 100000000) throw Object.assign(new Error('Giá bán không hợp lệ.'), { status: 400 });
  const original = b.originalPrice !== undefined ? toNumber(b.originalPrice) : (existing ? existing.OriginalPrice : null);
  if (original != null && !(original >= 0)) throw Object.assign(new Error('Giá gốc không hợp lệ.'), { status: 400 });
  const pick = (k, col, max) => (b[k] !== undefined ? String(b[k]).trim().slice(0, max) || null : (existing ? existing[col] : null));
  return {
    Title: title, Price: price, OriginalPrice: original,
    Author: pick('author', 'Author', 150), Subject: pick('subject', 'Subject', 40), Grade: pick('grade', 'Grade', 30),
    Description: pick('description', 'Description', 2000), Badge: pick('badge', 'Badge', 30),
    InStock: bool(b.inStock, existing ? existing.InStock : true), IsActive: bool(b.isActive, existing ? existing.IsActive : true),
    SortOrder: b.sortOrder !== undefined ? parseInt(b.sortOrder) || 0 : (existing ? existing.SortOrder : 0)
  };
}

async function saveCover(req) {
  if (!req.file) return undefined;
  const cloud = await uploadToCloud(req.file.path, 'books');
  return cloud || `/uploads/${req.file.filename}`;
}

controller.adminListBooks = async (req, res) => {
  try { res.json({ success: true, books: (await db.Book.findAll({ order: [['SortOrder', 'ASC'], ['Id', 'DESC']] })).map(plain) }); } catch (e) { fail(res, e); }
};

controller.adminCreateBook = async (req, res) => {
  try {
    const fields = readBookFields(req, null);
    const cover = await saveCover(req);
    const book = await db.Book.create({ ...fields, CoverUrl: cover || null });
    res.json({ success: true, book: plain(book) });
  } catch (e) { fail(res, e); }
};

controller.adminUpdateBook = async (req, res) => {
  try {
    const book = await db.Book.findByPk(parseInt(req.params.id));
    if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sách.' });
    const fields = readBookFields(req, book);
    const cover = await saveCover(req);
    await book.update({ ...fields, ...(cover ? { CoverUrl: cover } : {}) });
    res.json({ success: true, book: plain(book) });
  } catch (e) { fail(res, e); }
};

// Sách đã có đơn thì chỉ ẩn (giữ lịch sử đơn); chưa có đơn thì xóa hẳn.
controller.adminDeleteBook = async (req, res) => {
  try {
    const book = await db.Book.findByPk(parseInt(req.params.id));
    if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sách.' });
    const used = await db.BookOrderItem.count({ where: { BookId: book.Id } });
    if (used) { await book.update({ IsActive: false }); return res.json({ success: true, hidden: true, message: 'Sách đã có đơn hàng nên được ẩn khỏi trang bán thay vì xóa.' }); }
    await book.destroy();
    res.json({ success: true, hidden: false, message: 'Đã xóa sách.' });
  } catch (e) { fail(res, e); }
};

controller.adminListOrders = async (req, res) => {
  try {
    const orders = await db.BookOrder.findAll({ ...{ include: [{ model: db.BookOrderItem, as: 'Items' }] }, order: [['Id', 'DESC']], limit: 300 });
    res.json({ success: true, orders: orders.map(orderJson) });
  } catch (e) { fail(res, e); }
};

const changer = (to) => async (req, res) => {
  try {
    const order = await svc.changeStatus(parseInt(req.params.id), to, { method: req.body && req.body.method });
    res.json({ success: true, status: order.Status });
  } catch (e) { fail(res, e); }
};
controller.adminConfirm = changer('PAID');
controller.adminShip = changer('SHIPPED');
controller.adminCancel = changer('CANCELLED');

module.exports = controller;
