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
   `https://quanlytrungtamjs-3.onrender.com` cho sếp.

---

## Tài khoản demo (mật khẩu chung: `123456`)

| Vai trò | Email |
| :--- | :--- |
| Admin | `admin@trungtam.com` |
| Giáo viên / Học sinh / Phụ huynh | xem danh sách trong `backend/seed.js` |

---

## Lưu ý gói Free

* Service ngủ sau 15 phút không ai truy cập. Workflow
  `.github/workflows/keepalive.yml` tự ping app mỗi 10 phút nên link **luôn
  thức**, sếp vào lúc nào cũng mở ngay. Sau khi deploy xong nhớ sửa `APP_URL`
  trong file đó nếu tên service khác `quanlytrungtam-app`, rồi vào tab
  **Actions** của repo bấm **Enable workflows** (GitHub tắt cron của repo mới
  cho tới khi bật thủ công).
  Lưu ý: GitHub tạm ngưng cron nếu repo không có commit nào trong 60 ngày —
  lúc đó chỉ cần vào Actions bấm chạy lại.
* Dữ liệu SQLite **reset về bản seed** mỗi lần service khởi động lại (deploy
  mới, hoặc Render bảo trì). Đủ để demo; muốn giữ dữ liệu lâu dài thì tạo
  Postgres (Render hoặc [Neon](https://neon.tech) free) rồi thêm biến
  `DATABASE_URL` — code tự chuyển sang Postgres, không phải sửa gì.
* Muốn chắc chắn không bao giờ ngủ mà khỏi cần ping: nâng service lên gói
  **Starter $7/tháng** trong Render.
* Ảnh upload trong lúc demo cũng mất khi restart (trừ khi cấu hình Cloudinary
  qua `CLOUDINARY_*`).

## Lỗi thường gặp

**`getaddrinfo ENOTFOUND dpg-xxxxx` + "Application exited early"**
Biến `DATABASE_URL` trên Render đang trỏ tới một Postgres đã bị xóa hoặc hết
hạn. App không có DB để kết nối nên thoát ngay.
→ Vào **Environment** của service, **xóa hẳn biến `DATABASE_URL`**, Save, rồi
**Manual Deploy → Deploy latest commit**. App sẽ tự quay về SQLite và seed lại
dữ liệu demo trong lúc build.
(Muốn dùng Postgres thật thì tạo DB mới rồi dán **Internal Database URL** của
nó vào `DATABASE_URL` — nhớ DB và web service phải cùng region.)

## Kiểm tra nhanh sau khi Live

* `/` → trang chủ React hiển thị danh sách khóa học.
* Đăng nhập `admin@trungtam.com` / `123456` → vào được Admin Dashboard.
  (Nếu đăng nhập không vào được: kiểm tra `NODE_ENV=production` và service đang
  chạy HTTPS — cookie session dùng `secure` + `trust proxy`.)
