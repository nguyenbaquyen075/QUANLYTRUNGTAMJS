# Đặc tả siêu chi tiết + Bố cục giao diện: Trang Giảng Viên
### Dự án: Anh Tê — Hệ thống quản lý trung tâm học thêm online

Tài liệu này viết cho AI code theo trực tiếp: mỗi trang có Layout (bố cục vùng), Component (thành phần + dữ liệu), Luồng thao tác từng bước nhỏ, và các trường hợp biên (edge case) cần xử lý.

---

## A. Quy ước chung cho toàn bộ hệ thống

### A.1 Thực thể dữ liệu (data model)
```
Course (Khoá học)
  id, name, subject, level, description, thumbnail,
  tuitionFee (trọn gói), totalSessions, sessionDuration,
  selfRegisterEnabled, requireApproval, status (open/full/closed/archived)

Class (Lớp học) — thuộc 1 Course, gắn 1 teacherId
  id, courseId, teacherId, name, roomLink, recurringSchedule,
  capacity, status (active/ended)

Session (Buổi học) — thuộc 1 Class
  id, classId, sessionNumber, scheduledDate, durationMinutes,
  status (not_opened/open/closed), openedAt, closedAt,
  recordingUrl, isMakeup (true/false), makeupForSessionId (nullable),
  countsTowardAttendanceRate (boolean)

Enrollment (Ghi danh) — học viên trong 1 Class
  id, classId, studentId, status (active/deferred/blocked/kicked),
  joinedAt, teacherNote (private), kickedReason (nullable)

Attendance (Điểm danh)
  id, sessionId, studentId, present (boolean), checkedAt,
  editedAfterClose (boolean)

Assignment (Bài tập/Bài kiểm tra) — thuộc 1 Class
  id, classId, type (homework/exam), title, timeLimitMinutes,
  openAt, closeAt, allowMultipleAttempts (boolean),
  status (draft/published)

Question (Câu hỏi) — thuộc 1 Assignment
  id, assignmentId, type (mcq/true_false/fill_blank/essay),
  content, options[], correctAnswer, points, order

Submission (Bài nộp)
  id, assignmentId, studentId, attemptNumber,
  autoGradedScore, manualGradedScore, isOfficial (attemptNumber==1),
  status (in_progress/submitted/grading/graded), submittedAt
```

### A.2 Nguyên tắc điều hướng
- Mọi trang danh sách → click 1 dòng → mở trang/chi tiết tương ứng (drill-down), có breadcrumb ở đầu trang: `Trang chủ > [Mục cha] > [Mục hiện tại]`
- Mọi hành động phá huỷ dữ liệu (kick học viên, huỷ buổi học) đều phải qua **modal xác nhận 2 bước**: bước 1 hiện cảnh báo, bước 2 yêu cầu gõ lại từ khoá xác nhận hoặc chọn lý do
- Mọi bảng dữ liệu dài đều có: ô tìm kiếm, filter theo trạng thái, phân trang

### A.3 Bố cục khung sườn (áp dụng mọi trang)
```
+-----------------------------------------------------------+
| Header: Logo | (trống) | Chuông thông báo | Avatar+tên     |
+-----------+-------------------------------------------------+
| Sidebar   | Breadcrumb                                     |
| (menu 8   | Tiêu đề trang + nút hành động chính (phải)     |
| mục)      | --------------------------------------------- |
|           | Nội dung chính (bảng / form / tab)             |
|           |                                                 |
+-----------+-------------------------------------------------+
```

---

## B. Trang chủ (Dashboard tổng quan)
**Route:** `/Teacher/Dashboard`

### Layout
```
[ 4 thẻ thống kê ngang hàng ]
[ Danh sách lớp dạy hôm nay/tuần này ]  [ Feed thông báo gần đây ]
```

### Component chi tiết
1. **StatCard x4**: "Số lớp đang dạy", "Bài chờ chấm" (tổng homework+exam), "Buổi dạy tuần này", "Học viên cảnh báo" — mỗi thẻ click vào dẫn thẳng tới trang liên quan (VD "Bài chờ chấm" → `/Teacher/Homework?filter=pending`)
2. **TodayClassList**: mỗi dòng = 1 buổi học hôm nay, hiển thị giờ, tên lớp, trạng thái buổi, nút "Vào điểm danh" nếu chưa mở
3. **NotificationFeed**: 5 thông báo gần nhất, mỗi item có icon theo loại (bài nộp/yêu cầu nghỉ/tin admin), link "Xem tất cả" → `/Teacher/Notifications` (trang mới cần bổ sung)

### Luồng
1. Giảng viên đăng nhập → hệ thống load Dashboard làm trang mặc định
2. Hệ thống gọi API lấy: danh sách lớp của teacherId, đếm bài chờ chấm, đếm buổi hôm nay, đếm học viên cảnh báo (rule: vắng >30% hoặc điểm TB <5)
3. Nếu không có lớp nào được gán → hiển thị empty state "Bạn chưa được gán lớp nào, liên hệ admin"

---

## C. Lịch dạy & Điểm danh
**Route:** `/Teacher/Attendance`

### C.1 Trang danh sách lớp
**Layout:**
```
[ Tiêu đề "Danh sách các buổi học được giao"  |  Nút "Thêm buổi học mới" ]
[ Card mỗi lớp: Tên lớp | Số buổi | Nút "Quản lý lớp" > ]
```

**Luồng bước 1 — Vào trang:**
1. Hệ thống query toàn bộ Class có `teacherId = current teacher`
2. Với mỗi Class, đếm tổng Session và hiển thị dạng card
3. Click "Quản lý lớp" → điều hướng `/Teacher/Attendance/:classId` (mở phần C.2)
4. Click "Thêm buổi học mới" (nút góc trên) → mở modal chọn Lớp trước, rồi mở form thêm buổi (dùng chung form ở mục C.2, tab Buổi học)

### C.2 Trang chi tiết quản lý lớp
**Layout (dùng Tab ngang dưới breadcrumb):**
```
Tabs: [ Buổi học ] [ Học viên ] [ Video ghi hình ] [ Thông tin lớp ]
```

#### Tab "Buổi học" — Layout
```
[ Bảng cảnh báo nếu có học viên vắng nhiều/điểm thấp ]
[ 2 biểu đồ mini: tỷ lệ đi học | tỷ lệ nộp bài đúng hạn ]
[ Nút: Thêm buổi bù | Huỷ buổi học | Gửi thông báo nhanh | Xuất DS | Nhân bản lớp ]
[ Bảng: Buổi # | Ngày giờ | Trạng thái | Link phòng | Hành động ]
```

**Luồng chi tiết — Mở điểm danh (từng bước nhỏ):**
1. Giảng viên thấy dòng buổi có trạng thái `not_opened`, bấm nút "Mở điểm danh"
2. Hệ thống hỏi xác nhận nhanh (không cần modal nặng): "Mở điểm danh cho buổi #X - [ngày]?" → OK
3. Backend cập nhật `session.status = open`, `session.openedAt = now()`
4. Frontend điều hướng sang màn hình điểm danh: danh sách toàn bộ học viên `active` trong lớp, mỗi dòng có toggle "Có mặt" (mặc định OFF — **không** mặc định present=true)
5. Giảng viên tick từng học viên hoặc bấm "Điểm danh nhanh" (tick tất cả) rồi bỏ tick những ai vắng
6. Mỗi lần tick, hệ thống lưu ngay (auto-save từng dòng, không cần nút "Lưu" tổng, tránh mất dữ liệu nếu thoát giữa chừng)
7. Cuối buổi, giảng viên bấm "Khoá buổi học" → modal xác nhận: "Khoá buổi #X? Sau khi khoá, điểm danh sẽ dùng để tính % chuyên cần." → OK
8. Backend: `session.status = closed`, `session.closedAt = now()` → trigger job tính lại `attendanceRate` cho từng học viên trong lớp:
   ```
   attendanceRate = (số Attendance.present=true) / (số Session.status=closed AND countsTowardAttendanceRate=true) × 100
   ```
9. Nếu giảng viên cần sửa điểm danh sau khi đã khoá: mở lại tab, bấm "Sửa điểm danh" trên buổi đã khoá → cho phép tick lại → mỗi thay đổi ghi `editedAfterClose = true` vào Attendance đó (phục vụ audit, không hiện cảnh báo chặn thao tác)

**Luồng chi tiết — Thêm buổi học bù:**
1. Bấm "Thêm buổi bù" → mở form modal
2. Form gồm: Ngày giờ (bắt buộc), Link phòng/phòng học (bắt buộc), "Bù cho buổi nào" (dropdown chọn Session cũ, optional), Toggle "Buổi này có tính vào % chuyên cần" (mặc định bật)
3. Chọn phạm vi áp dụng: (a) Toàn bộ học viên trong lớp, hoặc (b) Chỉ học viên đã vắng ở buổi được chọn để bù — nếu chọn (b), hệ thống tự lọc theo Attendance.present=false của buổi gốc
4. Bấm "Tạo buổi" → backend tạo Session mới với `isMakeup=true` → tự động gửi thông báo (in-app + email nếu có) cho nhóm học viên đã chọn ở bước 3
5. Buổi mới xuất hiện trong bảng buổi học với badge "Buổi bù"

**Luồng chi tiết — Huỷ buổi học:**
1. Bấm icon "..." trên 1 dòng buổi (chỉ hiện khi status = not_opened) → chọn "Huỷ buổi học"
2. Modal: chọn lý do (dropdown: giảng viên bận / sự kiện bất khả kháng / khác) + textarea ghi chú
3. Bấm "Xác nhận huỷ" → backend đánh dấu buổi này huỷ (thêm field `status=cancelled` nếu cần) → **ngay sau đó tự mở modal "Thêm buổi bù"** đã điền sẵn "Bù cho buổi vừa huỷ" để giảng viên xử lý luôn, tránh quên
4. Gửi thông báo cho học viên: "Buổi #X ngày [...] đã huỷ, buổi bù dự kiến ngày [...]"

**Luồng chi tiết — Đổi giờ/link phòng 1 buổi:**
1. Bấm icon "..." → "Sửa buổi học" (chỉ khi status = not_opened)
2. Form inline hoặc modal nhỏ: sửa `scheduledDate`, `roomLink` — không ảnh hưởng lịch định kỳ của cả lớp
3. Lưu → gửi thông báo học viên nếu giờ thay đổi

#### Tab "Học viên" — Layout
```
[ Ô tìm kiếm ]  [ Filter: Tất cả | Đang học | Bảo lưu | Bị chặn ]
[ Bảng: Tên | Trạng thái | % chuyên cần | Bài trễ hạn | Ghi chú | Hành động ]
```

**Luồng chi tiết — Ghi chú nội bộ:**
1. Click icon bút cạnh 1 học viên → mở popover nhỏ chứa textarea
2. Gõ nội dung → tự lưu khi blur khỏi ô (hoặc nút "Lưu" nhỏ trong popover)
3. Ghi chú chỉ hiển thị lại khi chính giảng viên này xem, không lộ cho học viên/admin/giảng viên khác

**Luồng chi tiết — Chuyển lớp (transfer):**
1. Click "..." trên 1 học viên → "Chuyển lớp"
2. Modal: dropdown chọn Class đích (chỉ hiện các Class khác cùng Course, còn chỗ trống)
3. Xác nhận → backend: đổi `Enrollment.classId` sang lớp mới, giữ nguyên lịch sử điểm/điểm danh cũ gắn với lớp cũ (không xoá)

**Luồng chi tiết — Chặn học viên:**
1. Click "..." → "Chặn học viên"
2. Modal xác nhận đơn giản (1 bước): "Chặn [Tên]? Học viên sẽ không truy cập được bài tập/video cho đến khi được mở lại." → Xác nhận
3. Backend: `Enrollment.status = blocked` → học viên đăng nhập vào lớp thấy thông báo "Tài khoản đang bị tạm khoá trong lớp này, liên hệ giảng viên"
4. Nút đổi thành "Mở chặn" để đảo ngược bất kỳ lúc nào

**Luồng chi tiết — Kick học viên:**
1. Click "..." → "Loại khỏi lớp"
2. Modal bước 1: cảnh báo rõ "Học viên sẽ bị xoá khỏi lớp, KHÔNG hoàn học phí theo chính sách. Lịch sử điểm/bài làm vẫn được giữ lại." + dropdown chọn lý do (bắt buộc)
3. Modal bước 2: yêu cầu gõ lại tên học viên để xác nhận (chống bấm nhầm)
4. Xác nhận → backend: `Enrollment.status = kicked`, `kickedReason` lưu lại, khoá quyền truy cập bài tập/video nhưng Submission/Attendance cũ giữ nguyên trong DB
5. Ghi audit log: ai kick, khi nào, lý do gì

#### Tab "Video ghi hình" — Layout
```
[ Bảng: Buổi # | Ngày | Link video | Học viên được xem (đã điểm danh) | Học viên bị khoá (chưa điểm danh) ]
```
**Luồng:** với học viên nằm trong danh sách "bị khoá" (vì Attendance.present=false ở buổi đó), có nút "Mở quyền xem" → backend thêm 1 bản ghi override quyền xem riêng cho học viên đó + buổi đó, không đổi Attendance gốc.

#### Tab "Thông tin lớp" — Layout
```
[ Form: Mô tả lớp | Lịch học định kỳ | Link phòng học online ]
[ Nút "Lưu thay đổi" ]
[ Bảng lịch sử chỉnh sửa (audit log) bên dưới ]
```
**Luồng:** Chỉ các trường trên được sửa. Học phí và Course gốc hiển thị read-only kèm ghi chú "Liên hệ admin để thay đổi". Mỗi lần lưu, ghi 1 dòng vào audit log: `[thời gian] [giảng viên] đã sửa [trường] từ [giá trị cũ] thành [giá trị mới]`.

---

## D. Bài tập về nhà & Bài kiểm tra
**Route:** `/Teacher/Homework`, `/Teacher/Exams` (2 route riêng, UI giống nhau, khác `type`)

### D.1 Trang danh sách
**Layout:**
```
[ Filter: Lớp | Trạng thái (Nháp/Đã xuất bản) ]  [ Nút "Tạo bài mới" ]
[ Bảng: Tên bài | Lớp | Thời gian làm bài | Hạn nộp | Đã nộp/Tổng | Trạng thái | Hành động ]
```
Số `(7)` trên sidebar = đếm số Submission có `status=grading` và `isOfficial=true` thuộc các Assignment của giảng viên này.

### D.2 Wizard tạo bài mới — 3 bước, có step indicator ở đầu

**Bước 1 — Thông tin chung:**
- Input: Tên bài (bắt buộc)
- Dropdown: Chọn lớp áp dụng (bắt buộc, chỉ hiện lớp giảng viên phụ trách)
- Input số: Thời gian làm bài (phút, bắt buộc, min 1)
- DateTimePicker: Ngày giờ mở bài, Ngày giờ đóng bài (validate: đóng phải sau mở)
- Toggle: "Cho phép làm lại nhiều lần" → khi bật, hiện dòng ghi chú nhỏ màu cam: "Điểm chính thức luôn tính theo lần nộp đầu tiên. Các lần sau chỉ để học viên luyện tập."
- Nút "Tiếp theo" (disable nếu chưa điền đủ trường bắt buộc)

**Bước 2 — Soạn câu hỏi:**
- Nút "+ Thêm câu hỏi" → dropdown chọn loại: Trắc nghiệm 1 đáp án / Đúng-sai từng ý / Điền chỗ trống / Tự luận-Upload file
- Mỗi câu hỏi hiện thành 1 card kéo-thả được (drag handle bên trái), trong card:
  - Textarea nội dung câu hỏi (hỗ trợ chèn ảnh, công thức)
  - Nếu trắc nghiệm: danh sách đáp án (nút "+ thêm đáp án"), radio để chọn đáp án đúng
  - Nếu tự luận: chỉ có ô "Điểm tối đa"
  - Input "Điểm" cho mọi loại
  - Icon xoá câu hỏi (có confirm nhỏ)
- Thanh tổng điểm hiển thị realtime ở góc, cập nhật mỗi khi điểm câu hỏi thay đổi
- Nút "Quay lại" / "Tiếp theo"

**Bước 3 — Xem lại & Xuất bản:**
- Preview toàn bộ bài đúng như giao diện học viên sẽ thấy (đọc-only)
- 2 nút: "Lưu nháp" (status=draft, không học viên nào thấy) / "Xuất bản" (status=published, học viên trong lớp thấy được ngay khi tới `openAt`)

### D.3 Trang chấm bài
**Layout:**
```
[ Filter: Lớp | Bài kiểm tra | Trạng thái chấm ]
[ Bảng: Học viên | Bài | Điểm TN (tự động) | Trạng thái tự luận | Lần nộp | Hành động ]
```
**Luồng lọc lần nộp:**
- Mặc định bảng chỉ hiện `Submission.attemptNumber == 1` (lần chính thức)
- Mỗi dòng có icon mở rộng (chevron) → click thấy list các lần nộp #2, #3... của học viên đó, nhãn "Luyện tập — không tính điểm", đọc-only

**Luồng chấm chi tiết (click vào 1 dòng lần nộp #1):**
1. Mở trang `/Teacher/Grading/:submissionId`
2. Phần trên: liệt kê câu trắc nghiệm, mỗi câu hiện đáp án học viên chọn + đúng/sai (màu xanh/đỏ) — đọc-only, điểm đã tự cộng sẵn
3. Phần dưới: từng câu tự luận hiện nội dung bài làm (text hoặc file đính kèm xem trực tiếp nếu là ảnh/PDF) + input điểm (giới hạn 0 → điểm tối đa câu đó) + textarea nhận xét
4. Thanh tổng điểm cố định ở trên cùng khi cuộn, tự cộng: điểm TN + tổng điểm tự luận đã nhập
5. Nút "Lưu & Hoàn tất chấm" → backend: `manualGradedScore` lưu lại, `status = graded`
6. Nếu học viên có nộp thêm lần luyện tập, hiện link nhỏ "Xem thêm 2 lần luyện tập khác" để tham khảo hỗ trợ học viên, không có ô chấm điểm ở đây

---

## E. Tiến độ các khoá học
**Route:** `/Teacher/CourseProgress`

### Layout
```
[ Dropdown chọn Lớp ]
[ Thanh tiến độ: đã dạy X/Y buổi theo kế hoạch ]
[ Bảng điểm tổng hợp: Học viên x Các bài kiểm tra/bài tập ]
[ Biểu đồ đường: tỷ lệ đi học theo tuần ]
[ Nút "Xuất bảng điểm" ]
```
**Luồng:** chọn lớp → hệ thống tính `số Session đã closed / tổng Session dự kiến theo lịch của Class` ra thanh tiến độ giảng dạy (khác hoàn toàn với % chuyên cần của từng học viên — 2 chỉ số độc lập, không gộp chung 1 con số).

---

## F. Khoá học của tôi
**Route:** `/Teacher/MyCourses`

### Layout
```
[ Bảng: Tên khoá học | Số lớp đang dạy | Mô tả ]
```
**Luồng:**
1. Query tất cả Course có ít nhất 1 Class với `teacherId = current teacher`
2. Click 1 dòng → trang chi tiết Course: mô tả chương trình, tài liệu/giáo án đính kèm (nếu có), danh sách các Class thuộc Course này
3. Trong danh sách Class đó, mỗi dòng có nút "Quản lý lớp" → dẫn thẳng sang mục C.2 (`/Teacher/Attendance/:classId`)

---

## G. Đánh giá KPI học viên
**Route:** `/Teacher/StudentKPI`

### Layout
```
[ Dropdown chọn Lớp ]  [ Khoảng thời gian ]
[ Bảng: Học viên | Điểm TB | % chuyên cần | Số bài trễ hạn | Xếp loại tự động ]
[ Nút "Xuất báo cáo" ]
```
**Luồng:** toàn bộ số liệu là **tính toán tự động** từ Attendance + Submission đã có — trang này không có form nhập tay điểm KPI riêng. Xếp loại tự động theo ngưỡng (VD: >=8 Tốt, 5-8 Khá, <5 Cần cải thiện) — ngưỡng nên cấu hình được ở phần admin, không hard-code.

---

## H. Đánh giá KPI giảng viên
**Route:** `/Teacher/TeacherKPI`

### Layout
```
[ Chọn kỳ đánh giá (dropdown) ]
[ Bảng tiêu chí: Tiêu chí | Điểm | Nhận xét từ admin ]
[ Biểu đồ xu hướng theo các kỳ trước ]
```
**Luồng:** toàn bộ **chỉ đọc** đối với giảng viên — dữ liệu do admin nhập ở trang admin riêng, giảng viên chỉ xem kết quả và lịch sử, không có nút sửa nào ở đây.

---

## I. Thông tin giới thiệu
**Route:** `/Teacher/Profile`

### Layout
```
[ Ảnh đại diện (upload) ]
[ Form: Họ tên hiển thị | Chuyên môn | Mô tả giới thiệu (rich text) ]
[ Nút "Lưu" ]
[ Preview: giao diện học viên sẽ thấy khi xem hồ sơ giảng viên trước khi đăng ký ]
```
**Luồng:** Đây là hồ sơ **công khai**, hiển thị cho học viên tiềm năng xem trước khi đăng ký khoá học của giảng viên này. Tách biệt hoàn toàn với cài đặt tài khoản (email/mật khẩu) — nếu có, nên để ở icon Avatar góc trên (dropdown "Cài đặt tài khoản"), không gộp vào đây.

---

## J. Trang còn thiếu — cần bổ sung
1. **`/Teacher/Notifications`** — trang danh sách đầy đủ thông báo (bài nộp mới, học viên xin nghỉ/bảo lưu — kèm nút duyệt/từ chối ngay tại đây, tin nhắn từ admin), phân trang, filter theo loại
2. **Trang chủ Dashboard** cần tách khỏi route Attendance như đã nêu — hiện `/Teacher/Dashboard` đang render trùng nội dung "Lịch dạy & Điểm danh"

---

## K. Bảng trạng thái màu sắc dùng chung (để AI code nhất quán toàn hệ thống)
| Trạng thái | Màu badge |
|---|---|
| Đang học / Đã xuất bản / Đã chấm | Xanh lá |
| Chưa mở / Nháp / Chờ xử lý | Xám |
| Đang điểm danh / Chờ chấm | Cam |
| Đã khoá / Bảo lưu | Xanh dương |
| Bị chặn / Cảnh báo | Vàng đậm |
| Đã kick / Lỗi / Huỷ | Đỏ |
