// Bán sách: đặt hàng công khai (không cần tài khoản), chuyển khoản, admin xác nhận rồi giao.
// Giá luôn tính lại ở server từ bảng Books — không tin giá/tổng tiền do trình duyệt gửi.
const db = require('../models');
const authService = require('./authService');
const notificationService = require('./notificationService');
const invoiceToken = require('../utils/invoiceToken');

const { Op } = db.Sequelize;
const MAX_LINES = 20, MAX_QTY = 20;
const SCOPE = 'book';

exports.signOrder = (id) => invoiceToken.sign(id, SCOPE);
exports.verifyOrder = (id, token) => invoiceToken.verify(id, token, SCOPE);

// Trả về { error } hoặc { value } đã chuẩn hóa. Thuần: không đụng DB.
exports.validateOrderInput = (body) => {
  const b = body || {};
  const name = String(b.buyerName || '').trim().replace(/\s+/g, ' ');
  const phone = authService.normalizePhone(b.phone);
  const address = String(b.address || '').trim();
  const note = String(b.note || '').trim();
  if (name.length < 2 || name.length > 100) return { error: 'Vui lòng nhập họ tên.' };
  if (!phone) return { error: 'Số điện thoại không hợp lệ (cần 10 số, ví dụ 0912345678).' };
  if (address.length < 8 || address.length > 300) return { error: 'Vui lòng nhập địa chỉ nhận sách đầy đủ (số nhà, đường, phường/xã, tỉnh/thành).' };
  if (note.length > 300) return { error: 'Ghi chú tối đa 300 ký tự.' };
  if (!Array.isArray(b.items) || b.items.length === 0) return { error: 'Giỏ sách đang trống.' };
  if (b.items.length > MAX_LINES) return { error: `Mỗi đơn tối đa ${MAX_LINES} đầu sách.` };
  const merged = new Map();
  for (const it of b.items) {
    const bookId = Number(it && it.bookId), qty = Number(it && it.quantity);
    if (!Number.isInteger(bookId) || bookId <= 0 || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return { error: `Số lượng mỗi cuốn từ 1 đến ${MAX_QTY}.` };
    merged.set(bookId, (merged.get(bookId) || 0) + qty);
  }
  for (const q of merged.values()) if (q > MAX_QTY) return { error: `Số lượng mỗi cuốn tối đa ${MAX_QTY}.` };
  return { value: { name, phone, address, note: note || null, lines: [...merged].map(([bookId, quantity]) => ({ bookId, quantity })) } };
};

exports.listPublicBooks = () => db.Book.findAll({ where: { IsActive: true }, order: [['SortOrder', 'ASC'], ['Id', 'DESC']] });

exports.createOrder = async (body, userId) => {
  const { error, value } = exports.validateOrderInput(body);
  if (error) throw Object.assign(new Error(error), { status: 400 });

  const books = await db.Book.findAll({ where: { Id: { [Op.in]: value.lines.map((l) => l.bookId) }, IsActive: true } });
  const byId = new Map(books.map((b) => [b.Id, b]));
  for (const l of value.lines) {
    const book = byId.get(l.bookId);
    if (!book) throw Object.assign(new Error('Có sách trong giỏ không còn bán. Vui lòng tải lại trang.'), { status: 409 });
    if (!book.InStock) throw Object.assign(new Error(`Sách "${book.Title}" đã hết hàng.`), { status: 409 });
  }

  const total = value.lines.reduce((s, l) => s + Number(byId.get(l.bookId).Price) * l.quantity, 0);
  const order = await db.sequelize.transaction(async (t) => {
    const o = await db.BookOrder.create({
      OrderCode: `TMP${Date.now()}${Math.floor(Math.random() * 1e4)}`, BuyerName: value.name, Phone: value.phone, Address: value.address,
      Note: value.note, UserId: userId || null, Status: 'PENDING', TotalAmount: total
    }, { transaction: t });
    const day = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    o.OrderCode = `SACH${day}${String(o.Id).padStart(4, '0')}`; // ngắn, chỉ chữ + số: dùng luôn làm nội dung chuyển khoản
    await o.save({ transaction: t });
    await db.BookOrderItem.bulkCreate(value.lines.map((l) => {
      const book = byId.get(l.bookId);
      return { OrderId: o.Id, BookId: book.Id, Title: book.Title, UnitPrice: book.Price, Quantity: l.quantity };
    }), { transaction: t });
    return o;
  });

  await notifyAdmins('Đơn mua sách mới', `${value.name} (${value.phone}) đặt ${value.lines.reduce((s, l) => s + l.quantity, 0)} cuốn, tổng ${Math.round(total).toLocaleString('vi-VN')} đ. Mã ${order.OrderCode}.`);
  return order;
};

async function notifyAdmins(title, content) {
  const admins = await db.User.findAll({ where: { Role: db.User.RoleMap.ADMIN, Status: db.User.StatusMap.ACTIVE }, attributes: ['Id'] });
  if (admins.length) await notificationService.notifyUsers(admins.map((a) => a.Id), { title, content, linkUrl: '/Admin/Books' });
}

const withItems = { include: [{ model: db.BookOrderItem, as: 'Items' }] };

// Người mua xem lại đơn bằng link có mã ký (không cần tài khoản).
exports.getOrderForBuyer = async (id, token) => {
  if (!exports.verifyOrder(id, token)) return null;
  return db.BookOrder.findByPk(id, withItems);
};

const lastReport = new Map();
exports.reportTransfer = async (id, token) => {
  if (!exports.verifyOrder(id, token)) return null;
  const order = await db.BookOrder.findOne({ where: { Id: id, Status: 'PENDING' } });
  if (!order) return null;
  if (Date.now() - (lastReport.get(id) || 0) < 10 * 60 * 1000) return { order, notified: false };
  lastReport.set(id, Date.now());
  await notifyAdmins('Khách báo đã chuyển khoản mua sách', `${order.BuyerName} (${order.Phone}) báo đã chuyển ${Math.round(order.TotalAmount).toLocaleString('vi-VN')} đ cho đơn ${order.OrderCode}. Vui lòng kiểm tra tài khoản và xác nhận.`);
  return { order, notified: true };
};

// Chuyển trạng thái do admin thực hiện; chỉ cho phép các bước hợp lệ.
const TRANSITIONS = { PAID: ['PENDING'], SHIPPED: ['PAID'], CANCELLED: ['PENDING'] };
exports.canTransition = (from, to) => (TRANSITIONS[to] || []).includes(from);

exports.changeStatus = async (id, to, extra = {}) => {
  const order = await db.BookOrder.findByPk(id);
  if (!order) throw Object.assign(new Error('Không tìm thấy đơn.'), { status: 404 });
  if (!exports.canTransition(order.Status, to)) throw Object.assign(new Error(`Không thể chuyển đơn từ "${order.Status}" sang "${to}".`), { status: 409 });
  order.Status = to;
  if (to === 'PAID') { order.PaidAt = new Date(); order.PaymentMethod = extra.method === 'CASH' ? 'CASH' : 'BANK'; }
  if (to === 'SHIPPED') order.ShippedAt = new Date();
  await order.save();
  if (order.UserId) {
    const text = { PAID: `Trung tâm đã nhận tiền đơn sách ${order.OrderCode}. Sách sẽ được gửi sớm.`, SHIPPED: `Đơn sách ${order.OrderCode} đã được gửi đi.`, CANCELLED: `Đơn sách ${order.OrderCode} đã được hủy.` }[to];
    await notificationService.notifyUser(order.UserId, { title: 'Cập nhật đơn sách', content: text, linkUrl: '/Home/Books' });
  }
  return order;
};

exports.getBankInfo = authService.getBankInfo;
