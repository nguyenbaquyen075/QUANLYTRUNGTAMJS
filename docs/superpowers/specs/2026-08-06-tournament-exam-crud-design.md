# Đề thi Đại hội & Admin CRUD — Design

## Bối cảnh

"Đại hội thi thử" (`/Home/BigMockTest`, hiện chỉ là alias của trang Thi thử thường) sẽ được làm lại thành một trang game hoá kiểu "leo rank": bục vinh danh top 3 theo mùa giải, thẻ hạng cá nhân (rank tier + XP), bảng xếp hạng thật dựa trên điểm học viên đã làm bài thi.

Việc này quá lớn cho một spec/plan duy nhất nên được chia thành 4 dự án con, làm tuần tự vì mỗi phần phụ thuộc phần trước:

1. **Đề thi & Admin CRUD** ← spec này
2. Làm bài & chấm điểm thật (thay cơ chế tính điểm phía frontend bằng dữ liệu cứng hiện tại)
3. Xếp hạng / Leaderboard engine (tier, XP, mùa giải)
4. Giao diện "Đại hội thi thử" leo rank (dùng dữ liệu thật từ 2 và 3)

Hướng giao diện cho sub-project 4 đã chốt qua visual companion: **Bục vinh danh + Mùa giải** — banner top 3 đầu trang, thẻ hạng cá nhân (gem theo tier: Đồng/Bạc/Vàng/Bạch Kim/Kim Cương/Cao Thủ + thanh điểm rank), danh sách đề thi bên dưới có tag 🔥 HOT / số lượt thi / điểm rank thưởng. Ghi lại ở đây để sub-project 3 và 4 dùng làm tham chiếu, **không thuộc phạm vi thực thi của spec này**.

## Phạm vi spec này

Chỉ làm phần nền móng: đề thi đại hội có thật trong database, và Admin/Giáo viên tạo—sửa—xoá được qua giao diện. **Học viên vẫn làm bài theo cơ chế cũ (frontend tính điểm bằng dữ liệu cứng)** — sub-project 2 mới nối học viên vào dữ liệu thật này.

## Data model

`backend/src/models/TournamentExam.js` — theo đúng convention của `Assignment.js`/`Course.js` (PascalCase field khớp cột DB, enum số + `StatusMap`/`StatusRevMap` tĩnh):

| Field | Type | Ghi chú |
|---|---|---|
| `Id` | INTEGER PK autoincrement | |
| `Title` | STRING(200) | |
| `Subject` | STRING(50) | vd "Toán" |
| `SubjectCode` | STRING(20) | vd "toan" — frontend dùng để tô màu/icon |
| `Grade` | STRING(20) | vd "Lớp 12" |
| `DurationMinutes` | INTEGER | |
| `QuestionsData` | TEXT | JSON string, mảng câu hỏi (xem shape bên dưới) |
| `Status` | INTEGER | 0=DRAFT, 1=PUBLISHED (`StatusMap`/`StatusRevMap` như Assignment) |
| `CreatedByUserId` | INTEGER, nullable | Id user tạo đề |

Không lưu `TotalQuestions` riêng — tính bằng `JSON.parse(QuestionsData).length` khi trả về, tránh lệch dữ liệu giữa 2 nguồn.

**Shape của `QuestionsData`** (mảng object, giữ nguyên field name kiểu snake_case như `Assignment.QuizData` đang dùng, cộng thêm `explanation` mà MOCK_TESTS_DATA hiện có nhưng `QuizData` chưa có):

```json
[
  {
    "question_text": "Cho hàm số y = f(x)...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correct_index": 2,
    "explanation": "Dựa vào bảng biến thiên..."
  }
]
```

**Association** trong `backend/src/models/index.js`, theo đúng cặp `hasMany`/`belongsTo` sẵn có:
```js
User.hasMany(TournamentExam, { foreignKey: 'CreatedByUserId', as: 'CreatedTournamentExams' });
TournamentExam.belongsTo(User, { foreignKey: 'CreatedByUserId', as: 'CreatedBy' });
```

## Backend API

Thêm vào `backend/src/routes/adminRoutes.js`, theo đúng pattern POST-style hiện có (kể cả edit/delete), gate `requireAuth(['ADMIN', 'STAFF', 'TEACHER'])`:

```
GET  /Admin/TournamentExams              — danh sách (kèm questionCount tính từ QuestionsData.length)
POST /Admin/TournamentExams/Create
POST /Admin/TournamentExams/Edit/:id
POST /Admin/TournamentExams/Delete/:id
```

Controller: thêm các hàm `listTournamentExams`, `createTournamentExam`, `editTournamentExam`, `deleteTournamentExam` vào `backend/src/controllers/adminController.js`. Validate `QuestionsData` gửi lên là JSON hợp lệ, mỗi câu hỏi có đủ `question_text`/`options` (đúng 4 phần tử)/`correct_index` (0-3) trước khi lưu — đây là trust boundary vì dữ liệu từ form Admin. `CreatedByUserId` lấy từ `req.session.userId` phía server khi tạo mới, không nhận từ body client gửi lên.

## Seed dữ liệu cũ

Script chạy tay một lần: `backend/scripts/seedTournamentExams.js` — đọc đúng 6 đề trong `frontend/src/pages/MockTestPage.jsx` (`MOCK_TESTS_DATA`), map:
- `test.questions[].content` → `question_text`
- `test.questions[].options` → `options`
- `test.questions[].correctIndex` → `correct_index`
- `test.questions[].explanation` → `explanation`

Insert thành `TournamentExam` với `Status = PUBLISHED`. Chạy 1 lần bằng `node backend/scripts/seedTournamentExams.js`, không tự chạy lúc app khởi động.

## Frontend

`frontend/src/pages/admin/TournamentExamsPage.jsx` — rập khuôn `CourseClassesPage.jsx`:
- Fetch danh sách qua `useFetchData('/Admin/TournamentExams')`.
- Bảng liệt kê: Title, Subject, Grade, số câu hỏi, Status, nút Sửa/Xoá.
- Modal Create/Edit: form Title/Subject/SubjectCode/Grade/DurationMinutes/Status + danh sách câu hỏi thêm/xoá được (mỗi câu: ô nội dung, 4 ô đáp án, radio chọn đáp án đúng, ô giải thích).
- Xoá: `confirm()` rồi `api.post('/Admin/TournamentExams/Delete/:id')`.
- Bọc trong `AdminLayout`; thêm mục "Đề thi đại hội" vào sidebar, trỏ tới route `/Admin/TournamentExams` (đăng ký trong `App.jsx`).

## Ngoài phạm vi

Học viên làm đề & chấm điểm thật, ranking/leaderboard, giao diện leo rank — thuộc sub-project 2/3/4, chưa làm ở đây.

## Kiểm tra

Không có test harness sẵn cho backend/frontend project này. Verify bằng cách chạy dev server, đăng nhập Admin, tạo/sửa/xoá 1 đề thi qua UI, xác nhận dữ liệu đúng trong DB; chạy seed script và xác nhận 6 đề cũ xuất hiện trong danh sách.
