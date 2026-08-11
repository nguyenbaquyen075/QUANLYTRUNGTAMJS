# Backend cho tính năng "Thi thử" (Mock Test)

Ngày: 2026-08-11

## Bối cảnh

Audit toàn bộ FE↔BE cho thấy mọi luồng admin/teacher/student/parent đã có BE khớp đầy đủ (route, controller, model). Ngoại lệ duy nhất: trang **Thi thử** (`frontend/src/pages/MockTestPage.jsx`, `frontend/src/pages/BigMockTestPage.jsx`, public tại `/Home/MockTest`, `/Home/BigMockTest`, `/thi-thu-thpt`) — 100% dữ liệu tĩnh hardcode trong JS: đề thi, câu hỏi, đáp án đúng, giải thích, và cả bảng xếp hạng giả. Chấm điểm hoàn toàn client-side, không có model DB, không lưu kết quả. Endpoint có sẵn `GET /Home/MockTestData` chỉ trả danh sách môn học + số liệu thống kê giả (không có câu hỏi).

`BigMockTestPage.jsx` còn có thêm lớp "mùa giải/đợt thi" (`GAME_SESSIONS_DATA`) trang trí nặng (gradient, SVG watermark theo từng mùa) — đây là lớp trình bày, giữ nguyên hardcode FE, không đưa vào BE.

## Phạm vi đã chốt (qua brainstorming với user)

1. Làm BE thật cho **cả hai trang** (MockTestPage + BigMockTestPage), dùng chung một nguồn đề thi.
2. **Lưu kết quả thật** vào DB (lịch sử làm bài, bảng xếp hạng thật) — không giữ chấm điểm giả như hiện tại.
3. Quản lý đề thi (tạo/sửa/xoá đề + câu hỏi) dành cho **cả Admin và Giảng viên**.
4. Trang vẫn public — cho phép **nộp bài ẩn danh** (nhập tên) với người chưa đăng nhập.
5. Kiến trúc dữ liệu: **chuẩn hoá quan hệ** (bảng câu hỏi riêng, FK tới đề thi) — không dùng kiểu JSON-blob như `Assignment.QuizData`, để sau này có thể thống kê/lọc theo từng câu hỏi.

## 1. Data model

```
MockTest
  Id            INTEGER PK
  Grade         STRING           -- "Lớp 12"
  Subject       STRING           -- "Toán"
  SubjectCode   STRING           -- "toan"
  CoverBg       STRING NULL      -- class Tailwind gradient cho card
  Title         STRING
  Code          STRING NULL      -- mã đề, ví dụ "TOAN-01" — dùng để BigMockTestPage khớp entry trong GAME_SESSIONS_DATA.examinations[].code
  Duration      INTEGER          -- phút
  Status        INTEGER          -- 0=DRAFT, 1=PUBLISHED
  CreatedBy     INTEGER FK -> Users.Id
  CreatedAt / UpdatedAt

MockTestQuestion
  Id            INTEGER PK
  MockTestId    INTEGER FK -> MockTest.Id
  Content       TEXT
  Options       TEXT             -- JSON array of string, ví dụ ["A. ...","B. ..."]
  CorrectIndex  INTEGER
  Explanation   TEXT NULL
  Points        FLOAT DEFAULT 1
  SortOrder     INTEGER DEFAULT 0

MockTestSubmission
  Id            INTEGER PK
  MockTestId    INTEGER FK -> MockTest.Id
  UserId        INTEGER FK -> Users.Id NULL   -- null nếu khách vãng lai
  GuestName     STRING NULL                    -- bắt buộc nếu UserId null
  Score         FLOAT            -- /10, tính lại ở server
  CorrectCount  INTEGER
  TotalQuestions INTEGER
  AnswersData   TEXT             -- JSON: mảng correctIndex học viên chọn theo thứ tự câu hỏi
  SubmittedAt   DATETIME
```

Associations (theo đúng convention `hasMany`/`belongsTo` đã dùng cho `Assignment`↔`Submission` trong `models/index.js`):

```js
db.MockTest.hasMany(db.MockTestQuestion, { foreignKey: 'MockTestId', as: 'Questions' });
db.MockTestQuestion.belongsTo(db.MockTest, { foreignKey: 'MockTestId', as: 'MockTest' });

db.MockTest.hasMany(db.MockTestSubmission, { foreignKey: 'MockTestId', as: 'Submissions' });
db.MockTestSubmission.belongsTo(db.MockTest, { foreignKey: 'MockTestId', as: 'MockTest' });
db.MockTestSubmission.belongsTo(db.User, { foreignKey: 'UserId', as: 'User' });

db.MockTest.belongsTo(db.User, { foreignKey: 'CreatedBy', as: 'Creator' });
```

Không có cột `TotalQuestions` lưu trữ trên `MockTest` — tính bằng `COUNT` khi list, tránh lệch dữ liệu (đúng tinh thần chuẩn hoá).

## 2. API & luồng dữ liệu

**Public** — thêm vào `backend/src/routes/homeRoutes.js`, xử lý trong `homeController.js`:

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/Home/MockTests?grade=&subject=` | Danh sách đề đã PUBLISHED. Trả `id, grade, subject, subjectCode, coverBg, title, duration, totalQuestions` (đếm từ Questions). |
| GET | `/Home/MockTests/:id` | Chi tiết + toàn bộ câu hỏi, **gồm cả `CorrectIndex`/`Explanation`** — giữ đúng UX tự-chấm-ngay hiện tại của FE (đây là công cụ luyện tập public, không phải kỳ thi coi thi; lộ đáp án phía client là thiết kế cũ, không phải lỗ hổng cần vá). |
| POST | `/Home/MockTests/:id/Submit` | Body `{ answers: number[], guestName? }`. Điểm **luôn tính lại ở server** từ `CorrectIndex`/`Points` lưu trong DB, không tin điểm/số câu đúng client gửi lên. Có session → `UserId`; không có session → bắt buộc `guestName` (400 nếu thiếu cả hai). |
| GET | `/Home/MockTests/:id/Leaderboard` | Top submissions, sort `Score DESC, SubmittedAt ASC`. |

**Quản trị** — route file mới `backend/src/routes/mockTestRoutes.js`, mount `app.use('/', require('./routes/mockTestRoutes'))` trong `app.js`. Toàn bộ dùng `requireAuth(['ADMIN', 'STAFF', 'TEACHER'])` (đúng pattern đã dùng ở `POST /Course/Update/:id`), controller mới `mockTestController.js`:

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/Admin/MockTests` | List tất cả kể cả DRAFT. |
| POST | `/Admin/MockTests` | Tạo đề (chưa có câu hỏi). |
| POST | `/Admin/MockTests/:id` | Sửa metadata đề (title, grade, subject, duration, status...). |
| POST | `/Admin/MockTests/:id/Delete` | Xoá đề (cascade câu hỏi + submissions). |
| POST | `/Admin/MockTests/:id/Questions` | Thêm câu hỏi. |
| POST | `/Admin/MockTests/:id/Questions/:qId` | Sửa câu hỏi. |
| POST | `/Admin/MockTests/:id/Questions/:qId/Delete` | Xoá câu hỏi. |

Validate ở BE (trả `{success:false, message}` theo đúng style controller hiện có, không throw): `Options` tối thiểu 2 phần tử; `CorrectIndex` phải nằm trong khoảng `[0, Options.length)`.

Các route này không có view EJS tương ứng (thuần API cho React), nên controller dùng `res.json(...)` trực tiếp — đúng cách `homeController.getMockTestData`/`getSiteContent` đang làm — thay vì `res.render`.

## 3. Seed dữ liệu & FE wiring

- **Seed** (`backend/seed.js`): 3 đề đã có câu hỏi thật trong `MOCK_TESTS_DATA` (`MockTestPage.jsx`: Toán, Vật Lý, Hóa Học) → chuyển thành `MockTest` (Status=PUBLISHED) + `MockTestQuestion` thật. Các đề trong `BigMockTestPage.jsx` (`examinations[]`: TOAN-01, LY-01, HOA-01, TOAN-02...) chỉ có metadata (không có câu hỏi thật trong code) → seed thành `MockTest` Status=DRAFT, `Code` = mã tương ứng (`TOAN-01`...), 0 câu hỏi, để Admin/Giảng viên bổ sung sau. Không tự bịa nội dung câu hỏi.
- **FE wiring** (đủ để BE được dùng thật, không để "mồ côi"):
  - `MockTestPage.jsx`: bỏ `MOCK_TESTS_DATA`, gọi `GET /Home/MockTests` cho danh sách và `GET /Home/MockTests/:id` khi mở đề. Khi nộp bài: giữ nguyên toàn bộ logic tính điểm/hiển thị client hiện tại, **thêm** gọi `POST /Home/MockTests/:id/Submit` để lưu kết quả.
  - `BigMockTestPage.jsx`: giữ nguyên `GAME_SESSIONS_DATA` (màu, SVG, tên mùa giải) không đổi. Chỉ map `examinations[].code` → `MockTest.Code` để lấy câu hỏi/nộp bài. Entry nào có `code` không khớp `MockTest` nào trong DB (đề DRAFT chưa nhập câu hỏi) → hiển thị trạng thái "Sắp mở" thay vì lỗi vỡ trang. Không đổi giao diện/layout.
  - Bảng xếp hạng giả (tên cứng "Tian Nhật Hoàng"...) trong cả 2 file → thay bằng gọi `GET /Home/MockTests/:id/Leaderboard`.
  - Không đổi CSS/animation/layout hiện có — chỉ đổi nguồn dữ liệu.

## 4. Test & giới hạn đã biết

- `backend/tests/mockTestScoring.test.js` (dùng `node:test` + `node:assert/strict`, đúng convention có sẵn ở `backend/tests/formatSiteContent.test.js`): kiểm tra hàm tính điểm server-side — đúng hết, đúng một phần, câu trả lời null/thiếu, `CorrectIndex` ngoài khoảng.
- Giới hạn cố ý, đánh dấu bằng comment `ponytail:` trong code: nộp bài ẩn danh **không có chống spam/IP throttle** — có thể bị lạm dụng để phá bảng xếp hạng. Nâng cấp khi thực sự thấy bị lạm dụng (thêm rate-limit theo IP hoặc yêu cầu đăng nhập).

## Ngoài phạm vi (không làm trong lần này)

- Không đưa lớp trang trí "mùa giải" (`GAME_SESSIONS_DATA`: màu, SVG watermark) vào BE — thuần trình bày, hardcode FE là hợp lý.
- Không xây UI riêng quản lý câu hỏi dạng kéo-thả/preview WYSIWYG — form CRUD cơ bản theo pattern `HomepageItem` hiện có là đủ.
- Không làm xác thực danh tính cho khách vãng lai (email/OTP) — chỉ nhập tên tự do.
