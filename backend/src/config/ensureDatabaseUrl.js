const dns = require('dns').promises;
require('dotenv').config();

// Render giữ lại biến DATABASE_URL trỏ tới Postgres đã bị xoá, làm app chết ngay
// khi khởi động (getaddrinfo ENOTFOUND dpg-xxx). Host không tồn tại thì vô hiệu
// hoá biến để app tự chạy SQLite thay vì sập.
//
// Chỉ bỏ qua khi ENOTFOUND (host chắc chắn không có thật) hoặc URL sai định dạng.
// Lỗi DNS tạm thời (EAI_AGAIN) vẫn ném ra ngoài — nếu Postgres thật chỉ chớp tắt
// mà ta lặng lẽ quay về SQLite thì dữ liệu ghi mới sẽ rơi vào DB rỗng rồi mất.
//
// Gán chuỗi rỗng chứ không delete: dotenv.config() ở các module nạp sau chỉ bỏ
// qua key đã tồn tại trong process.env, delete xong nó sẽ nạp lại từ file .env.
module.exports = async function ensureDatabaseUrl() {
  if (!process.env.DATABASE_URL) return;

  let hostname;
  try {
    hostname = new URL(process.env.DATABASE_URL).hostname;
  } catch {
    console.warn('DATABASE_URL sai định dạng, bỏ qua và dùng SQLite.');
    process.env.DATABASE_URL = '';
    return;
  }

  try {
    await dns.lookup(hostname);
  } catch (err) {
    if (err.code !== 'ENOTFOUND') throw err;
    console.warn(`DATABASE_URL trỏ tới host không tồn tại (${hostname}), dùng SQLite thay thế.`);
    process.env.DATABASE_URL = '';
  }
};
