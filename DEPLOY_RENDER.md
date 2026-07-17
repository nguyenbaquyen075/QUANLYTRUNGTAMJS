# 🚀 HƯỚNG DẪN DEPLOY DỰ ÁN LÊN RENDER.COM

Dự án được cấu hình theo mô hình Monorepo:
* **Backend**: Express.js chạy trên cổng cấu hình bởi Render (biến `PORT`).
* **Frontend**: React.js (Vite) được build sẵn sang thư mục `frontend/dist` và được Backend phục vụ tĩnh (static file hosting).

Vì vậy, bạn chỉ cần tạo **một Web Service duy nhất** trên Render để chạy toàn bộ ứng dụng.

---

## 🛠️ CÁCH 1: DEPLOY TỰ ĐỘNG BẰNG BLUEPRINT (Khuyên dùng)

Render hỗ trợ đọc file cấu hình `render.yaml` có sẵn trong dự án để tự động thiết lập toàn bộ dịch vụ.

1. Commit tất cả các thay đổi và push code lên repository GitHub/GitLab của bạn.
2. Truy cập vào trang quản lý [Render Dashboard](https://dashboard.render.com/).
3. Nhấp vào nút **New +** ở góc trên cùng bên phải và chọn **Blueprint**.
4. Kết nối tài khoản GitHub/GitLab của bạn và chọn repository của dự án này.
5. Render sẽ tự động đọc tệp `render.yaml` và hiển thị trang cấu hình:
   * **Service Name**: Tên dịch vụ (mặc định là `quanlytrungtam-app`).
   * **DATABASE_URL**: Nhập URL cơ sở dữ liệu PostgreSQL của bạn (Ví dụ: `postgres://admin:...@...render.com:5432/quanlytrungtam?ssl=true`).
   * **SESSION_SECRET**: Render tự động tạo một khóa bí mật ngẫu nhiên cho bạn.
   * **CLOUDINARY_***: Nhập các thông số Cloudinary nếu bạn có sử dụng tính năng tải ảnh lên Cloudinary (nếu không dùng, bạn có thể bỏ qua hoặc xóa bớt).
6. Nhấp vào **Apply** để Render tự động tạo Web Service và bắt đầu build dự án.

---

## ✍️ CÁCH 2: DEPLOY THỦ CÔNG (MANUAL)

Nếu bạn không muốn sử dụng Blueprint, bạn có thể thiết lập thủ công Web Service như sau:

### Bước 1: Tạo Web Service mới
1. Trên Render Dashboard, nhấp vào **New +** -> **Web Service**.
2. Chọn **Build and deploy from a Git repository** và kết nối tới repo của bạn.

### Bước 2: Cấu hình thông tin cơ bản
* **Name**: `quanlytrungtam-app` (hoặc tên bất kỳ bạn thích)
* **Region**: Chọn khu vực gần người dùng của bạn nhất (ví dụ: `Singapore` hoặc `Oregon`).
* **Branch**: `main` (hoặc nhánh chứa code chính thức của bạn).
* **Runtime**: `Node`
* **Build Command**: `npm run install-all && npm run build`
* **Start Command**: `npm start`
* **Plan**: `Free` (hoặc gói cấu hình cao hơn tùy nhu cầu).

### Bước 3: Cấu hình các biến môi trường (Environment Variables)
Chuyển qua tab **Environment** (hoặc Advanced) và thêm các biến môi trường sau:

| Tên biến (Key) | Giá trị (Value) | Giải thích |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Chạy Node ở chế độ production để tối ưu hiệu năng |
| `DATABASE_URL` | *Chuỗi kết nối PostgreSQL của bạn* | Ví dụ: `postgres://user:password@host/dbname?ssl=true` |
| `SESSION_SECRET` | *Chuỗi bảo mật tùy ý* | Dùng để mã hóa Cookie Session (ví dụ: `quanlytrungtam_secret_key_123`) |
| `CLOUDINARY_CLOUD_NAME` | *Cloud Name của bạn* | (Tùy chọn) Sử dụng cho dịch vụ Cloudinary |
| `CLOUDINARY_API_KEY` | *API Key của bạn* | (Tùy chọn) Sử dụng cho dịch vụ Cloudinary |
| `CLOUDINARY_API_SECRET` | *API Secret của bạn* | (Tùy chọn) Sử dụng cho dịch vụ Cloudinary |

---

## 🔍 KIỂM TRA SAU KHI DEPLOY THÀNH CÔNG

1. Sau khi Render hoàn tất việc build và hiển thị trạng thái **Live** (màu xanh lá), nhấp vào đường dẫn URL do Render cấp (ví dụ: `https://quanlytrungtam-app.onrender.com`).
2. **Kiểm tra kết nối CSDL**:
   * Truy cập vào đường dẫn chẩn đoán: `https://<ten-app-cua-ban>.onrender.com/test-db`
   * Trang này sẽ hiển thị thông tin Host CSDL đang kết nối và thống kê danh sách người dùng trong hệ thống. Nếu trang hiển thị danh sách người dùng bình thường tức là kết nối Database đã thông suốt!
