# 🚀 DEPLOY LÊN RENDER — LẤY LINK CHO SẾP CHECK

Toàn bộ app chạy trên **1 web service duy nhất**: backend Express phục vụ luôn
`frontend/dist` và WebSocket, nên frontend gọi API cùng origin — không cần cấu
hình domain chéo.

**Production dùng Postgres, không dùng SQLite.** SQLite chỉ để chạy local.
Lý do: `sqlite3` là native module, bản prebuilt của nó cần glibc mới hơn máy chủ
Render nên app không khởi động được; còn `pg` là JavaScript thuần, chạy ở đâu
cũng được. Ngoài ra ổ đĩa của Render là ephemeral — SQLite sẽ mất sạch dữ liệu
mỗi lần deploy.

Code tự chọn: có `DATABASE_URL` thì dùng Postgres, không có thì dùng SQLite.
Không phải sửa dòng code nào khi đổi qua lại.

---

## Nếu tạo mới bằng Blueprint

1. Push code lên GitHub: `git push github main`
2. [Render Dashboard](https://dashboard.render.com/) → **New +** → **Blueprint**
   → chọn repo `QUANLYTRUNGTAMJS` → **Apply**.
3. `render.yaml` tự tạo luôn Postgres và nối `DATABASE_URL` vào web service.
   Không phải điền biến nào.
4. Chờ build ~5–8 phút → **Live** → gửi link cho sếp.

## Nếu service đã tạo tay từ trước

Service tạo tay không đọc `render.yaml`, phải nối DB thủ công:

1. **New +** → **Postgres** → chọn **cùng region với web service** → Create.
   (Khác region thì hostname nội bộ không phân giải được.)
2. Mở Postgres vừa tạo → copy **Internal Database URL**.
3. Về web service → **Environment** → **Add variable**
   → key `DATABASE_URL`, value là URL vừa copy → **Save changes**.
4. **Manual Deploy** → **Deploy latest commit**.

---

## Tài khoản demo (mật khẩu chung: `123456`)

| Vai trò | Email |
| :--- | :--- |
| Admin | `admin@trungtam.com` |
| Giáo viên / Học sinh / Phụ huynh | xem danh sách trong `backend/seed.js` |

Seed chạy trong lúc build, nhưng **chỉ seed khi DB còn rỗng**. Nếu đã có user thì
nó bỏ qua, để deploy mới không xoá mất dữ liệu người dùng đã nhập. Muốn xoá sạch
và seed lại từ đầu thì thêm biến `SEED_FORCE=true`, deploy một lần, rồi xoá biến
đó đi (để nguyên là mỗi lần deploy lại mất dữ liệu).

---

## Lỗi thường gặp

**`getaddrinfo ENOTFOUND dpg-xxxxx` + "Application exited early"**
`DATABASE_URL` trỏ tới Postgres đã bị xoá hoặc hết hạn. App tự phát hiện host
không tồn tại và quay về SQLite thay vì chết — nhưng trên Render SQLite lại vướng
lỗi glibc bên dưới, nên cách sửa đúng là trỏ `DATABASE_URL` vào một Postgres còn
sống, hoặc xoá hẳn biến rồi tạo DB mới.

**`ERR_DLOPEN_FAILED` / `GLIBC_2.38 not found` (node_sqlite3.node)**
App đang chạy SQLite trên Render. Nghĩa là `DATABASE_URL` đang thiếu hoặc sai.
Nối Postgres theo hướng dẫn ở trên.

**Trang trắng / không có khoá học nào**
DB rỗng vì seed chưa chạy. Xem log build có dòng `SEEDED SUCCESSFULLY` không.

---

## Lưu ý gói Free

* Service ngủ sau 15 phút không ai truy cập. Workflow
  `.github/workflows/keepalive.yml` ping mỗi 10 phút nên link **luôn thức**.
  Sửa `APP_URL` trong file đó cho khớp tên service, rồi vào tab **Actions** của
  repo bấm **Enable workflows** (GitHub tắt cron của repo mới cho tới khi bật tay).
  GitHub tạm ngưng cron nếu repo 60 ngày không có commit — vào Actions bấm chạy
  lại là được.
* **Postgres free của Render hết hạn sau 30 ngày** rồi bị xoá, lúc đó link sẽ
  chết. Cần dùng lâu hơn thì tạo DB trên [Neon](https://neon.tech) (free không
  hết hạn) và dán connection string của nó vào `DATABASE_URL`.
* Ảnh upload vẫn mất khi restart vì ổ đĩa ephemeral — muốn giữ thì cấu hình
  `CLOUDINARY_*`.

## Kiểm tra nhanh sau khi Live

* `/` → trang chủ React hiển thị danh sách khoá học.
* Đăng nhập `admin@trungtam.com` / `123456` → vào được Admin Dashboard.
  (Không vào được: kiểm tra `NODE_ENV=production` — cookie session dùng `secure`
  + `trust proxy`.)
