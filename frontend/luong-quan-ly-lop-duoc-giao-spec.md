# Đặc tả: Luồng Quản Lý Lớp Học Được Giao (Giảng Viên)

## Mục tiêu
Giảng viên vào xem 1 lớp học được giao, có thể chỉnh sửa thông tin, quản lý buổi học (thêm buổi bù, huỷ buổi), xem/quản lý học viên (bao gồm chặn/kick), và theo dõi nhanh tình hình lớp.

---

## 1. Luồng chính (Flow)

### Bước 1 — Chọn lớp được giao
- Danh sách các lớp giảng viên đang phụ trách (do admin gán)
- Mỗi item hiển thị: tên lớp, khoá học gốc, sĩ số, buổi học kế tiếp

### Bước 2 — Trang chi tiết lớp học
- Trang tổng quan (hub), chia tab hoặc section cho các nhóm chức năng bên dưới
- Header hiển thị nhanh: sĩ số, tỷ lệ đi học trung bình, tỷ lệ nộp bài đúng hạn (xem mục 4)

### Bước 3 — Chỉnh sửa thông tin lớp
- Các trường được sửa: mô tả lớp, lịch học định kỳ, link phòng học online
- **Không được sửa**: học phí, khoá học (Course) gốc — thuộc quyền admin
- Mọi thay đổi ghi vào audit log (ai sửa, sửa gì, lúc nào)

### Bước 4 — Quản lý buổi học
- **Thêm buổi học bù**:
  - Trường: ngày giờ, link phòng/phòng học, buổi này bù cho buổi nào (optional, liên kết buổi đã nghỉ)
  - Hỏi rõ: áp dụng cho toàn bộ học viên hay chỉ nhóm học viên đã xin nghỉ buổi gốc
  - Tự động gửi thông báo cho học viên liên quan
  - Quyết định rõ: buổi bù có tính vào mẫu số công thức % chuyên cần hay không (ảnh hưởng logic đã đặc tả ở file điểm danh)
- **Huỷ buổi học** (khác thêm buổi bù — dùng khi giảng viên bận đột xuất):
  - Chọn buổi cần huỷ → nhập lý do huỷ → hệ thống gợi ý tạo ngay 1 buổi bù thay thế → gửi thông báo học viên
- **Đổi giờ/link phòng của 1 buổi cụ thể** mà không cần sửa lịch định kỳ của cả lớp
- **Nhắc lịch tự động**: gửi thông báo cho giảng viên và học viên trước mỗi buổi học X giờ (X có thể cấu hình)

### Bước 5 — Xem & quản lý học viên
- Danh sách học viên trong lớp, filter theo trạng thái: Đang học / Bảo lưu / Bị chặn
- Với mỗi học viên hiển thị nhanh: tỷ lệ đi học, số bài trễ hạn, ghi chú nội bộ (nếu có)
- **Ghi chú riêng cho từng học viên**: giảng viên nhập note tự do (VD: "hay quên bài"), chỉ giảng viên lớp đó xem được, không hiển thị cho học viên/admin khác
- **Lịch sử tương tác nhanh**: click vào học viên xem số buổi vắng, số lần nộp trễ, không cần rời trang
- **Chuyển lớp (transfer)**: cho học viên đổi từ lớp này sang lớp khác cùng Course (VD: đổi ca học) — không huỷ đăng ký/đăng ký lại từ đầu

### Bước 6 — Chặn / Kick học viên
Phân biệt rõ 2 hành động, có xác nhận trước khi thực hiện:

| Hành động | Ý nghĩa | Ảnh hưởng |
|---|---|---|
| Chặn (tạm khoá) | Học viên mất quyền truy cập bài tập/video, vẫn còn trong danh sách lớp | Có thể mở lại bất kỳ lúc nào |
| Kick (loại khỏi lớp) | Xoá hẳn khỏi lớp | Không hoàn học phí (theo chính sách hiện có); yêu cầu xác nhận 2 lần + bắt buộc nhập lý do, ghi log |

- Khi kick: khoá quyền truy cập nhưng **giữ lại toàn bộ lịch sử điểm số/bài làm** (không xoá dữ liệu) để đối chiếu khi có tranh chấp học phí

---

## 2. Quyền hạn & an toàn dữ liệu
- Giảng viên chỉ thao tác được trên lớp được **admin gán trực tiếp** — không xem/sửa được lớp của giảng viên khác
- Mọi hành động chỉnh sửa thông tin, huỷ buổi, chặn/kick học viên đều ghi audit log (người thực hiện, thời điểm, nội dung thay đổi, lý do nếu có)

---

## 3. Tính năng tiện ích bổ sung
- **Gửi thông báo nhanh cho cả lớp** ngay từ trang chi tiết (VD: "Buổi mai nghỉ", "Nhớ nộp bài trước 22h")
- **Xuất danh sách lớp** ra Excel/PDF
- **Thẻ cảnh báo** ở đầu trang nếu lớp có học viên vắng nhiều hoặc điểm thấp bất thường
- **Nhân bản lớp**: tạo nhanh 1 lớp mới cùng cấu trúc (khi mở thêm ca học mới cho cùng khoá)

---

## 4. Theo dõi & báo cáo nhanh (hiển thị ngay ở trang chi tiết lớp)
- Biểu đồ mini: tỷ lệ đi học trung bình cả lớp theo thời gian
- Biểu đồ mini: tỷ lệ nộp bài đúng hạn
- Nếu giảng viên dạy nhiều ca của cùng 1 khoá học: bảng so sánh nhanh giữa các lớp (ca nào học tốt hơn)

---

## 5. Các điểm cần xác nhận thêm trước khi code
1. Buổi học bù có tính vào mẫu số công thức % chuyên cần không?
2. X giờ nhắc lịch tự động trước buổi học là bao nhiêu (cấu hình được hay cố định)?
3. Ghi chú nội bộ về học viên có giới hạn độ dài hay lưu vô thời hạn không?
4. Chuyển lớp (transfer) có cần admin duyệt lại hay giảng viên tự xử lý được?
