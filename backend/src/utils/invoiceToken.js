// Người mua chưa có tài khoản không có phiên đăng nhập. Link thanh toán của họ mang theo mã ký bằng khóa của server,
// đoán/ sửa số hóa đơn trên URL sẽ không đủ để xem hóa đơn của người khác.
const crypto = require('crypto');

const secret = () => process.env.SESSION_SECRET || 'quanlytrungtam_secret_key_123';
// scope tách mã của hóa đơn khóa học và đơn sách: mã của loại này không dùng được cho loại kia.
const sign = (id, scope = 'invoice') => crypto.createHmac('sha256', secret()).update(`${scope}:${id}`).digest('hex').slice(0, 32);

const verify = (invoiceId, token, scope = 'invoice') => {
  if (!token || typeof token !== 'string') return false;
  const a = Buffer.from(sign(invoiceId, scope));
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

module.exports = { sign, verify };
