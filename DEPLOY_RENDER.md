# 🚀 DEPLOY LÊN RENDER — LẤY LINK CHO SẾP CHECK

Toàn bộ app chạy trên **1 web service duy nhất**: backend Express phục vụ luôn
`frontend/dist` và WebSocket, nên frontend gọi API cùng origin — không cần cấu
hình domain chéo.

**Không cần tạo database.** Khi không có `DATABASE_URL`, app tự dùng SQLite và
lệnh build sẽ seed sẵn dữ liệu demo (10 khóa học, lớp, đề 15 câu, hóa đơn).

---

## 4 bước

1. Push code lên GitHub: `git push github main`
2. [Render Dashboard](https://dashboard.render.com/) → **New +** → **Blueprint**
   → chọn repo `QUANLYTRUNGTAMJS`.
3. Render đọc `render.yaml`, tự điền sẵn mọi thứ (`SESSION_SECRET` tự sinh).
   Nhấn **Apply**.
4. Chờ build ~5–8 phút → trạng thái **Live** → gửi link
   `https://quanlytrungtam-app.onrender.com` cho sếp.

---

## Tài khoản demo (mật khẩu chung: `123456`)

| Vai trò | Email |
| :--- | :--- |
| Admin | `admin@trungtam.com` |
| Giáo viên / Học sinh / Phụ huynh | xem danh sách trong `backend/seed.js` |

---

## Lưu ý gói Free

* Service **ngủ sau 15 phút** không ai truy cập → lần vào đầu tiên chờ ~50 giây.
  Nhắc sếp reload nếu trang trắng lần đầu.
* Dữ liệu SQLite **reset về bản seed** mỗi lần service khởi động lại. Đủ để
  demo; muốn giữ dữ liệu lâu dài thì tạo Postgres trên Render rồi thêm biến
  `DATABASE_URL` — code tự chuyển sang Postgres, không phải sửa gì.
* Ảnh upload trong lúc demo cũng mất khi restart (trừ khi cấu hình Cloudinary
  qua `CLOUDINARY_*`).

## Kiểm tra nhanh sau khi Live

* `/` → trang chủ React hiển thị danh sách khóa học.
* Đăng nhập `admin@trungtam.com` / `123456` → vào được Admin Dashboard.
  (Nếu đăng nhập không vào được: kiểm tra `NODE_ENV=production` và service đang
  chạy HTTPS — cookie session dùng `secure` + `trust proxy`.)
