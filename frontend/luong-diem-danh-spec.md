# Đặc tả: Trang Điểm Danh Học Sinh

## Mục tiêu
Cho phép giảng viên mở/khoá điểm danh theo từng buổi học cụ thể trong 1 lớp, và tự động tính phần trăm chuyên cần của học viên dựa trên kết quả điểm danh.

---

## 1. Cấu trúc dữ liệu liên quan

```
Course (Khoá học)
  └── Class (Lớp học) — nhiều Class có thể dùng chung 1 Course
        └── Session (Buổi học) — mỗi Class có nhiều buổi theo lịch
              └── Attendance (Điểm danh) — 1 bản ghi / học viên / buổi
```

### Session — các trường cần có
| Trường | Kiểu | Mô tả |
|---|---|---|
| id | string | Định danh buổi học |
| classId | string | Thuộc lớp nào |
| sessionNumber | number | Buổi thứ mấy trong lớp |
| scheduledDate | datetime | Ngày giờ học theo lịch |
| status | enum | `not_opened` \| `open` \| `closed` |
| openedAt | datetime \| null | Thời điểm giảng viên mở khoá |
| closedAt | datetime \| null | Thời điểm giảng viên khoá lại |
| recordingUrl | string \| null | Link video ghi hình (nếu có) |

### Attendance — các trường cần có
| Trường | Kiểu | Mô tả |
|---|---|---|
| sessionId | string | Thuộc buổi học nào |
| studentId | string | Học viên nào |
| present | boolean | Có mặt hay không |
| checkedAt | datetime | Thời điểm điểm danh |
| editedAfterClose | boolean | Đánh dấu nếu bị sửa sau khi buổi đã khoá (audit) |

---

## 2. Luồng hoạt động (Flow)

### Bước 1 — Chọn khoá học hoặc lớp
- Trang hiển thị danh sách các **Lớp** mà giảng viên đang phụ trách (không phải Course, vì điểm danh gắn với Class cụ thể)
- Mỗi item: tên lớp, khoá học gốc, sĩ số, buổi học gần nhất/sắp tới
- Click vào 1 lớp → chuyển sang Bước 2

### Bước 2 — Xem danh sách buổi học trong lớp
- Bảng danh sách các Session thuộc Class đã chọn, sắp xếp theo `sessionNumber`
- Mỗi dòng hiển thị: Buổi số mấy | Ngày giờ | Trạng thái (badge màu) | Hành động
- Badge trạng thái:
  - `not_opened` → xám, nhãn "Chưa mở"
  - `open` → xanh lá, nhãn "Đang điểm danh"
  - `closed` → xanh dương nhạt, nhãn "Đã khoá"

### Bước 3 — Mở khoá buổi học
- Giảng viên bấm nút **"Mở điểm danh"** trên 1 buổi có trạng thái `not_opened`
- Hệ thống chuyển `status → open`, ghi `openedAt = now()`
- **Giả định (cần xác nhận lại)**: cho phép mở bất kỳ lúc nào, không giới hạn phải trước giờ học X phút — có thể bổ sung ràng buộc thời gian sau nếu cần
- Sau khi mở, hệ thống điều hướng đến màn hình điểm danh (Bước 4)

### Bước 4 — Điểm danh học sinh
- Danh sách toàn bộ học viên trong lớp, mỗi dòng có checkbox/toggle "Có mặt"
- Mặc định tất cả ở trạng thái chưa điểm danh (không mặc định present=true, tránh sai sót)
- Ghi `checkedAt` khi giảng viên tick
- Cho phép tick lại nhiều lần trong lúc buổi đang `open` (chưa khoá)
- Nút "Điểm danh nhanh" (tick tất cả có mặt) để tiết kiệm thao tác

### Bước 5 — Khoá lại buổi học
- Giảng viên bấm nút **"Khoá buổi học"** khi kết thúc
- Hệ thống chuyển `status → closed`, ghi `closedAt = now()`
- **Giả định (cần xác nhận lại)**: sau khi khoá, giảng viên vẫn có thể sửa điểm danh nhưng hệ thống đánh dấu `editedAfterClose = true` để lưu vết (audit), không khoá cứng hoàn toàn
- Sau khi khoá, hệ thống trigger tính lại % chuyên cần (Bước 6)

### Bước 6 — Tính % chuyên cần
- Công thức đề xuất (giả định, cần xác nhận lại):
  ```
  % chuyên cần = (số buổi present = true) / (số buổi có status = closed) × 100
  ```
  Chỉ tính trên các buổi **đã khoá** — buổi chưa diễn ra hoặc chưa khoá không tính vào mẫu số, để tránh làm giảm oan % của học viên khi khoá học chưa kết thúc
- Cập nhật vào hồ sơ học viên trong lớp, hiển thị ở trang "Theo dõi tiến độ học viên" (đã đặc tả trước đó)

---

## 3. Quy tắc quan trọng
- Chỉ giảng viên phụ trách lớp mới được mở/khoá buổi học của lớp đó
- 1 buổi chỉ có thể ở 1 trong 3 trạng thái tại 1 thời điểm — không cho mở lại buổi đã khoá qua luồng thường (nếu cần mở lại, phải có action riêng "Yêu cầu mở lại" có ghi log)
- Việc mở quyền xem lại video ghi hình cho học viên vắng mặt là **hành động riêng biệt**, không liên quan trực tiếp đến điểm danh chuyên cần (đã đặc tả ở phần Quản lý lớp học)

---

## 4. Các điểm cần xác nhận thêm trước khi code
1. Có giới hạn thời gian được phép mở khoá buổi học (VD: chỉ mở trước giờ học 30 phút) hay không?
2. Sau khi khoá buổi học, có cho sửa điểm danh không, hay khoá là tuyệt đối?
3. Công thức % chuyên cần có tính cả buổi bảo lưu (học viên xin nghỉ có phép) khác với vắng không phép hay không?
