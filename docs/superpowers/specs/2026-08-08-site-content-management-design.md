# Thiết kế: Quản lý nội dung website qua Admin (Site Content Management)

Ngày: 2026-08-08

## 1. Bối cảnh & vấn đề

Hiện tại, các nội dung sau đang là hằng số hardcode trong React source, muốn đổi phải sửa code + deploy lại:

- **Footer/liên hệ** (`frontend/src/components/Layout/MainLayout.jsx`): tên trung tâm, mô tả, email, hotline, địa chỉ, link mạng xã hội.
- **Trang chủ** (`frontend/src/pages/HomePage.jsx`): ảnh banner hero, đoạn giới thiệu trung tâm + ảnh minh họa, mốc đếm ngược thi, danh sách slide khuyến mãi (`PROMO_SLIDES`), bảng vàng thành tích (`RED_CARD_STUDENTS`), feedback học viên, khối "Giáo viên giảng dạy" nổi bật (tên, ảnh cutout, bullet thành tích, phong cách giảng dạy).
- Mục "Khóa học nổi bật" trên trang chủ dùng mảng giả `FEATURED_COURSES` thay vì gọi API khóa học thật đã có sẵn (`GET /Home/Data` → `homeService.getFeaturedCourses`) — đây là lệch dữ liệu, sẽ sửa kèm.

Ngược lại, **thông tin giáo viên** (bio, chức danh, kinh nghiệm, đánh giá, môn dạy) và **khóa học** (ảnh, mô tả, giá, trạng thái) đã có model DB (`UserProfile`, `Course`) và form admin sẵn (`controller.updateTeacherInfo`, `controller.updateCourse` trong `backend/src/controllers/adminController.js`) — không cần xây lại, chỉ vá 1 lỗ hổng nhỏ: admin chưa upload được ảnh đại diện thay giáo viên (hiện chỉ giáo viên tự đổi qua `profileController`).

## 2. Mục tiêu

Admin (role `ADMIN`/`STAFF`) sửa được toàn bộ nội dung mô tả ở trên qua giao diện quản trị, không cần đụng code. Nếu admin chưa cấu hình gì, trang web hiển thị đúng y nội dung mặc định hiện tại (không vỡ giao diện khi mới triển khai).

## 3. Kiến trúc dữ liệu

Chọn cách tiếp cận **2 bảng tổng quát** thay vì tạo riêng 1 bảng cho mỗi loại nội dung (hero, contact, promo slide, testimonial...). Lý do: nội dung này chỉ là text + ảnh marketing đơn giản, tạo 6-7 bảng riêng là over-engineering không cần thiết; bảng tổng quát cho phép thêm field mới sau này (VD thêm 1 dòng liên hệ) mà không cần migrate schema.

### 3.1 Model `SiteSetting` (file `backend/src/models/SiteSetting.js`)

Lưu các giá trị đơn (không lặp lại), dạng key-value:

| Cột | Kiểu | Ghi chú |
|---|---|---|
| Key | STRING(100), PK | VD: `center_name`, `contact_address`, `contact_phone`, `contact_email`, `contact_zalo_url`, `social_facebook_url`, `logo_url`, `hero_banner_url`, `about_title`, `about_body`, `about_image_url`, `exam_countdown_date`, `spotlight_teacher_name`, `spotlight_image_url`, `spotlight_highlights` (JSON string, mỗi phần tử 1 dòng), `spotlight_teaching_style` (JSON string) |
| Value | TEXT, nullable | Giá trị dạng chuỗi; ảnh lưu URL (Cloudinary hoặc `/uploads/...`); danh sách bullet lưu JSON string mảng |
| UpdatedAt | DATE | tự cập nhật khi save |

Không cần cột `Type` — FE admin biết field nào là ảnh/text/json theo cấu hình form tĩnh, không cần suy diễn động.

### 3.2 Model `HomepageItem` (file `backend/src/models/HomepageItem.js`)

Lưu các danh sách lặp lại trên trang chủ:

| Cột | Kiểu | Ghi chú |
|---|---|---|
| Id | INTEGER, PK autoincrement | |
| Section | STRING(50) | `promo_slide` \| `honor_student` \| `testimonial` |
| SortOrder | INTEGER, default 0 | admin nhập số thứ tự hiển thị |
| Title | STRING(255), nullable | VD tên học sinh / tiêu đề slide |
| Subtitle | STRING(255), nullable | VD điểm số, badge |
| Body | TEXT, nullable | VD nội dung feedback, mô tả slide |
| ImageUrl | STRING(500), nullable | ảnh slide / avatar học sinh |
| ExtraData | TEXT, nullable | JSON string cho field phụ biến thiên theo section (VD `achievements: []` cho honor_student, `code` cho promo_slide) |
| IsActive | BOOLEAN, default true | ẩn/hiện không cần xóa |

Không tạo bảng riêng cho từng section vì admin UI sẽ tự lọc theo `Section` khi hiển thị — 1 bảng, 1 bộ CRUD dùng chung.

Đăng ký 2 model mới trong `backend/src/models/index.js` (không cần association, đứng độc lập). `sequelize.sync()` trong `server.js` sẽ tự tạo bảng khi khởi động lại — không cần script migrate riêng.

## 4. API Backend

### 4.1 Public (không cần đăng nhập)

`GET /Home/SiteContent` (thêm vào `homeRoutes.js` + `homeController.js`, đọc qua `homeService`):

```json
{
  "success": true,
  "data": {
    "settings": { "center_name": "...", "contact_address": "...", ... },
    "sections": {
      "promo_slide": [ { "id":1, "title":"...", "imageUrl":"...", "extraData": {...} }, ... ],
      "honor_student": [ ... ],
      "testimonial": [ ... ]
    }
  }
}
```
Chỉ trả `IsActive = true`, sắp theo `SortOrder ASC`. Trả object rỗng nếu chưa có dữ liệu — FE tự fallback default.

### 4.2 Admin (route mới trong `adminRoutes.js`, `requireAuth(['ADMIN','STAFF'])`)

- `GET /Admin/Settings` — trả toàn bộ `SiteSetting` (kể cả rỗng) + toàn bộ `HomepageItem` (kể cả `IsActive=false`) để admin xem/sửa.
- `POST /Admin/Settings/General` — nhận `multipart/form-data` (text fields + optional file `logo`, `heroBanner`, `aboutImage`, `spotlightImage`), dùng `adminController.upload` (multer) + `uploadToCloud` y hệt pattern `createCourse`, `upsert` từng key vào `SiteSetting`.
- `POST /Admin/Settings/Items` — tạo `HomepageItem` mới (`multipart/form-data`, có thể kèm ảnh qua `adminController.upload.single('image')`).
- `POST /Admin/Settings/Items/:id` — cập nhật (giữ pattern POST thay vì PUT như các route admin khác trong repo, ví dụ `/Course/Update/:id`).
- `POST /Admin/Settings/Items/:id/Delete` — xóa (xóa kèm file ảnh cũ qua `deleteUploadFile` nếu có).

Toàn bộ đặt trong `adminController.js` để nhất quán với các hàm quản trị khác (không tách file/service mới — file đã có sẵn multer/cloudinary/deleteUploadFile dùng chung).

### 4.3 Vá lỗ hổng teacher avatar

Sửa `controller.updateTeacherInfo` (dòng ~1037): thêm xử lý `req.file` (field `avatar`) upload qua `uploadToCloud(..., 'avatars')` rồi gán `teacher.AvatarUrl`, y hệt cách `createCourse` xử lý ảnh khóa học. Route tương ứng thêm `adminController.upload.single('avatar')` middleware.

## 5. Frontend Admin

Trang mới `frontend/src/pages/admin/SiteSettingsPage.jsx`, route `/Admin/Settings` khai báo trong `App.jsx` (theo đúng pattern `CourseClassesPage.jsx` đã có — **không** thêm tab vào `AdminDashboard.jsx`, file đó đã 1900+ dòng, thêm nữa sẽ càng khó bảo trì). Thêm link "Cài đặt Website" trong khu điều hướng admin hiện có.

Cấu trúc trang, 3 khối làm bằng React Tabs đơn giản (state `activeSection`, không cần thư viện tab mới — đã có Tailwind + pattern component sẵn trong `AdminDashboard.jsx` để tái dùng style):

1. **Thông tin liên hệ & thương hiệu** — form 1 cột: tên trung tâm, logo (upload ảnh), địa chỉ, hotline, email, Zalo URL, Facebook URL. Nút "Lưu" gọi `POST /Admin/Settings/General`.
2. **Nội dung trang chủ** — banner hero (upload ảnh), tiêu đề + nội dung giới thiệu trung tâm (textarea), ảnh giới thiệu (upload), ngày giờ đếm ngược thi (input `datetime-local`), khối giáo viên nổi bật (tên, ảnh, textarea bullet "mỗi dòng 1 ý" cho highlights và phong cách giảng dạy — parse thành JSON array khi submit). Cùng gọi `POST /Admin/Settings/General`.
3. **Danh sách marketing** — sub-tab con: Slide khuyến mãi / Bảng vàng thành tích / Feedback học viên. Mỗi sub-tab: bảng danh sách hiện có (ảnh nhỏ, tiêu đề, sort order, nút Sửa/Xóa/Ẩn-hiện) + nút "Thêm mới" mở modal form (tái dùng modal pattern đã có trong `AdminDashboard.jsx`). Không làm kéo-thả sắp xếp — admin gõ số `SortOrder` trực tiếp (đơn giản, đủ dùng).

Component dùng `axios` qua `frontend/src/services/api.js` sẵn có, không thêm thư viện.

## 6. Frontend công khai

- Thêm hook nhỏ `frontend/src/hooks/useSiteContent.js` (giống mẫu `useFetchData`), gọi `GET /Home/SiteContent` một lần, expose `{ settings, sections, loading }`.
- `MainLayout.jsx`: Footer đọc `settings.center_name/contact_*/social_*` qua hook, **fallback đúng giá trị hardcode hiện tại** nếu key rỗng/chưa cấu hình (không đổi giao diện mặc định).
- `HomePage.jsx`:
  - Banner hero: `settings.hero_banner_url` fallback ảnh hiện tại.
  - Khối "Giới thiệu trung tâm": `settings.about_title/about_body/about_image_url` fallback text hiện tại.
  - Đếm ngược: `settings.exam_countdown_date` fallback `2027-06-11T07:30:00`.
  - Khối "Giáo viên giảng dạy": `settings.spotlight_*` fallback nội dung "Anh giáo Kid" hiện tại.
  - `PROMO_SLIDES`, `RED_CARD_STUDENTS`, feedback học viên: đọc từ `sections.promo_slide/honor_student/testimonial`, nếu rỗng thì dùng đúng mảng hardcode hiện tại làm default (giống pattern `DEFAULT_TEACHERS` đã dùng ở `TeachersPage.jsx`).
  - "Khóa học nổi bật": đổi từ mảng `FEATURED_COURSES` giả sang gọi `useFetchData('/Home/Data')` lấy `courses` thật (đã có sẵn ở backend, chỉ là chưa được gọi) — sửa luôn nhân dịp này, không tạo thêm cơ chế mới.

## 7. Xử lý lỗi & fallback

- Mọi field nội dung công khai đều có giá trị fallback hardcode hiện tại — API lỗi hoặc rỗng không làm vỡ trang.
- Upload ảnh dùng lại toàn bộ pattern kiểm tra file/multer đã có (không thêm validation mới ngoài giới hạn kích thước multer mặc định của repo).
- Xóa `HomepageItem` xóa kèm file ảnh cũ bằng `deleteUploadFile` (best-effort, không throw nếu Cloudinary URL).

## 8. Kiểm thử

- 1 test nhỏ ở backend (`backend/tests/`) gọi `GET /Home/SiteContent` khi DB rỗng → phải trả `success:true`, `settings:{}`, `sections` với mảng rỗng cho cả 3 section (đảm bảo endpoint không lỗi khi chưa cấu hình).
- Kiểm thử thủ công qua trình duyệt: tạo 1 giá trị `SiteSetting` + 1 `HomepageItem` qua admin, xác nhận trang chủ hiển thị đúng nội dung mới; xóa hết, xác nhận trang chủ quay lại nội dung mặc định cũ.

## 9. Ngoài phạm vi (không làm)

- Không làm kéo-thả sắp xếp thứ tự (dùng input số).
- Không làm rich-text editor cho các đoạn mô tả (dùng textarea thường).
- Không làm versioning/lịch sử chỉnh sửa nội dung.
- Không đổi cách quản lý giáo viên/khóa học hiện có (đã đủ dùng), chỉ vá thêm avatar upload.
