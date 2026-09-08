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

## Cách dựng chuẩn (xoá sạch làm lại)

Service hiện tại được tạo tay nên không đọc `render.yaml` — cấu hình nằm rải rác
trong dashboard, lệch với file trong repo. Dựng lại bằng Blueprint để `render.yaml`
là nguồn duy nhất:

1. Xoá service cũ: **Settings** → cuối trang → **Delete Web Service**.
2. Xoá luôn các Postgres cũ/hết hạn: Render chỉ cho **1 Postgres free mỗi tài
   khoản**, còn cái cũ thì Blueprint không tạo được cái mới.
3. Push code: `git push github main`
4. **New +** → **Blueprint** → chọn repo `QUANLYTRUNGTAMJS` → **Apply**.
   Render tự tạo Postgres, tự nối `DATABASE_URL`, tự sinh `SESSION_SECRET`.
   Không phải điền gì.
5. Chờ build ~5–8 phút → **Live**.
6. Render cấp link theo tên service. Nếu `quanlytrungtam-app` đã có người dùng,
   Render thêm hậu tố (`-1`, `-2`…). Xem link thật ở đầu trang service rồi sửa
   `APP_URL` trong `.github/workflows/keepalive.yml` cho khớp — không khớp thì
   cron ping nhầm địa chỉ và service vẫn ngủ.

Từ đó về sau **chỉ sửa `render.yaml` rồi push**, đừng chỉnh tay trong dashboard.
Chỉnh tay là file và service thật lệch nhau, lần sau không ai biết cái nào đúng.

## Nếu muốn giữ service cũ

Service tạo tay không đọc `render.yaml`, phải tự làm những gì file đó mô tả:

1. **New +** → **Postgres** → **cùng region với web service** → Create.
2. Copy **Internal Database URL** của DB vừa tạo.
3. Web service → **Environment** → thêm **đúng một biến**: `DATABASE_URL`
   (URL vừa copy). `SESSION_SECRET` nên thêm cho chắc, còn lại bỏ trống được.
   **Đừng thêm `NODE_ENV=production` ở đây** — xem mục lỗi `vite: not found`.
4. **Không cần sửa Build/Start Command.** Lệnh mặc định của Render
   (`npm install; npm run build` và `npm start`) chạy đúng, vì script
   `postinstall` ở gốc tự cài cả backend lẫn frontend.
5. **Manual Deploy** → **Deploy latest commit**.

---

## Tài khoản demo (mật khẩu chung: `123456`)

| Vai trò | Email |
| :--- | :--- |
| Admin | `admin@trungtam.com` |
| Giáo viên / Học sinh / Phụ huynh | xem danh sách trong `backend/seed.js` |

Seed chạy **lúc app khởi động**, và **chỉ khi DB còn rỗng**. Nếu đã có user thì
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

**`vite: not found` khi build (exit status 127)**
Lệnh `npm install` ở thư mục gốc không cài gì cho `frontend/`. Script
`postinstall` ở `package.json` gốc lo việc này — nếu ai đó xoá nó thì lỗi quay
lại ngay.
Nguyên nhân thứ hai:
`NODE_ENV=production` làm npm bỏ qua devDependencies, mà `vite` nằm trong đó.
Biến trong `envVars` áp dụng cho **cả lúc build**, nên đặt `NODE_ENV` ở đó là
tự bắn vào chân mình. Cách sửa: bỏ nó khỏi `envVars`, đưa vào `startCommand`
(`NODE_ENV=production npm start`) để chỉ có tác dụng lúc chạy.
Cờ `--include=dev` trong `install:frontend` cũng sửa được, nhưng phụ thuộc phiên
bản npm — npm 11 chấp nhận, npm 10 trên Render thì không. Giữ cờ đó làm lớp
chặn thứ hai, đừng dựa vào nó.

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
