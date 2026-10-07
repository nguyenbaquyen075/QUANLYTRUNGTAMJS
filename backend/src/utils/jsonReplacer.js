// Dùng cho app.set('json replacer'): mọi JSON gửi ra trình duyệt, ở mọi độ sâu (kể cả User lồng trong Class, Invoice...),
// không bao giờ chứa mã băm mật khẩu. Trước đây các API admin trả cả PasswordHash của mọi người dùng.
module.exports = (key, value) => (key === 'PasswordHash' ? undefined : value);
