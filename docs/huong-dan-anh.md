# Hướng dẫn ảnh cho LumiEdu (bán khóa học các môn THPT)

Mọi kích thước dưới đây tính theo **khung thật trong code**, đã nhân 2 cho màn hình
retina. Làm đúng tỉ lệ thì ảnh không bị méo hay cắt mất nội dung. Khung rộng tối đa
là 1308px (container 1340px trừ lề 16px mỗi bên).

## Quy ước chung

**Bảng màu** (đưa vào mọi prompt):
- Xanh chính `#1467E8`, xanh sáng `#4A8DEE`, xanh nhạt `#EAF3FF`, nền `#F6F9FD`
- Điểm nhấn cam `#FF9F1C` (dùng ít), chữ đậm `#172B4D`, trắng `#FFFFFF`

**Đối tượng và nội dung:** LumiEdu bán khóa học online cho học sinh **THPT (lớp 10–12)**,
ôn thi tốt nghiệp và đại học. Các môn: Toán, Ngữ văn, Tiếng Anh, Vật lý, Hóa học, Sinh học,
Lịch sử, Địa lý, GDKT&PL, Tin học. Không thiên về riêng môn nào. Học sinh trong ảnh nên ở độ tuổi 15–18,
mặc đồng phục hoặc áo thường ngày. Ảnh cần gợi cảm giác "học online, có lộ trình, có kết quả".

**Phong cách chung:** hiện đại, sáng, sạch, nền trắng hoặc xanh nhạt, ánh sáng mềm,
bo góc, không rối.

**Mẹo quan trọng:**
- **Không bắt AI vẽ chữ tiếng Việt** (hay sai dấu). Cứ để trống chỗ cho chữ, chữ sẽ do web hiển thị.
- Thêm vào cuối mọi prompt: `no text, no watermark, no logo, clean composition`.
- **Vùng an toàn:** đặt chủ thể chính ở giữa. Khung trên điện thoại hẹp hơn nên sẽ cắt hai bên.
- Lưu JPG/PNG/WebP đều được, nên ≤ 500 KB. Chạy `node backend/src/utils/convertImages.js` để tự tạo bản WebP nhẹ.
- Đặt ảnh vào `frontend/public/images/` (và `backend/public/images/`), hoặc đổi qua trang Admin → Nội dung trang chủ.

---

## 1. Banner đầu trang (hero)

| | |
|---|---|
| **Kích thước** | **2400 × 800 px** (tỉ lệ 3:1) |
| Khung hiển thị | cao 380 / 480 / 580 px (điện thoại / tablet / máy tính), rộng full màn hình |
| Cách hiển thị | `object-cover`, căn giữa. Màn hình hẹp sẽ cắt hai bên |
| Vùng an toàn | **Giữa 1000 × 800 px** chứa chủ thể + khoảng trống cho chữ |
| Cài đặt | Admin → `hero_banner_url` |

**Bố cục:** nửa trái để trống (nền xanh nhạt) cho tiêu đề, nửa phải là học sinh và đồ vật các môn.

**Prompt:**
> Wide 3:1 banner illustration for LumiEdu, an online course platform for Vietnamese high school (grade 10-12) subjects. Bright clean background with soft gradient from #EAF3FF to white. On the right: three smiling Vietnamese high school students (age 15-18) with a laptop, a globe, a chemistry flask, and open books, flat modern semi-realistic style. Floating subtle icons for math, science, literature, languages. Left 45% intentionally empty for headline text. Palette: blue #1467E8, light blue #4A8DEE, background #F6F9FD, small orange #FF9F1C accents. Soft light, no text, no watermark, no logo, clean composition. 2400x800.

## 2. Slide khuyến mãi (carousel dưới hero)

| | |
|---|---|
| **Kích thước** | **2600 × 1040 px** (tỉ lệ 2.5:1) |
| Khung hiển thị | rộng 1308 × cao 380 / 460 / 530 / 560 px |
| Lưu ý | **Dải chữ chạy phía trên che 36 px đầu ảnh.** Chừa 90 px trên cùng, đừng đặt nội dung ở đó |
| Vùng an toàn | Cách mép mỗi bên 120 px, cách đáy 80 px |
| Số lượng | 3 ảnh, cùng kích thước |
| Cài đặt | Admin → `promo_slide` |

**Prompt (lặp 3 lần, đổi chủ đề: Khóa học nền tảng / Luyện đề / Tăng tốc):**
> Promotional banner 2.5:1 for LumiEdu, an online course store for Vietnamese high school subjects (grade 10-12, exam prep). Left half: empty rounded white panel area reserved for headline and discount badge. Right half: confident Vietnamese high school student (age 16-17) holding books, surrounded by floating subject icons (math symbols, atom, book, ABC, globe) in 3D soft style. Background gradient from #1467E8 to #4A8DEE with light bokeh and subtle geometric shapes. Top 90px kept visually empty. Orange #FF9F1C accent star burst for the discount. No text, no watermark, no logo. 2600x1040.

## 3. Ảnh thành tích / tin nhắn phụ huynh (cuộn ngang)

| | |
|---|---|
| **Kích thước** | **800 × 800 px** (1:1) |
| Khung hiển thị | 260 × 260 / 290 × 290 px, bo góc 16px |
| Số lượng | 4 ảnh (web lặp lại để cuộn vô hạn) |

Thường là ảnh chụp màn hình thật (tin nhắn, bảng điểm), nên **dùng ảnh thật** thì tốt hơn. Nếu cần ảnh minh họa:
> Square 1:1 mockup of a smartphone chat screen with a parent's happy message and a report card with high scores, clean UI in light blue #EAF3FF and white, rounded bubbles, subtle shadow, no readable personal data, no text, no watermark. 800x800.

## 4. Ảnh khóa học (thẻ "Khóa học nổi bật" + trang Khóa học)

| | |
|---|---|
| **Kích thước** | **960 × 540 px** (16:9) |
| Khung hiển thị | tỉ lệ 16:9 (trên điện thoại 16:10), rộng ~300 px (4 cột) |
| Vùng an toàn | Chủ thể ở giữa. **Góc trên trái và trên phải bị che** bởi nhãn "Khóa học nổi bật" và nút giỏ hàng, góc dưới trái có nhãn lớp |
| Số lượng | 1 ảnh cho mỗi khóa học. Cùng phong cách cho đồng bộ |

**Prompt mẫu** (đổi `[MÔN]`: Toán / Ngữ văn / Tiếng Anh / Vật lý / Hóa học / Sinh học / Lịch sử / Địa lý / Tin học), grade 10-12 exam prep:
> 16:9 course cover for [SUBJECT], modern flat-3D illustration. Central object that represents [SUBJECT] (e.g. geometry tools and formulas for math, test tubes for chemistry, DNA and leaf for biology, world map and compass for geography, ancient scroll and temple for history, speech bubbles and ABC for English). Soft gradient background #EAF3FF to #4A8DEE, rounded shapes, gentle shadow, small orange #FF9F1C accent. Keep the top-left, top-right and bottom-left corners uncluttered. No text, no watermark. 960x540.

## 5. Slide lộ trình khóa học

| | |
|---|---|
| **Kích thước** | **2600 × 1080 px** (khoảng 2.4:1) |
| Khung hiển thị | rộng 1308 × cao 280 / 380 / 460 / 510 / 540 px |
| Vùng an toàn | Cách mép 100 px mọi phía (khung cao 280 trên điện thoại cắt nhiều) |
| Số lượng | 3 ảnh (Nền tảng, Luyện đề, Tăng tốc) |
| Cài đặt | Admin → `roadmap_slide` |

**Prompt:**
> Wide course roadmap infographic background, 2.4:1. A winding path from bottom-left to top-right with three milestone nodes, each node with a glowing circle and a simple subject icon (book, pencil, trophy). Light clean background #F6F9FD, path in #1467E8 and #4A8DEE, small orange #FF9F1C flags. Large empty zones beside each node for captions. No text, no watermark. 2600x1080.

## 6. Ảnh giáo viên nổi bật (nền trong suốt)

| | |
|---|---|
| **Kích thước** | **1000 × 1080 px**, PNG hoặc WebP **nền trong suốt** |
| Khung hiển thị | rộng ~500 × cao 420 / 500 / 540 px |
| Vùng an toàn | Người chiếm 80% chiều cao, đầu cách mép trên 5%, cắt ngang ngực |
| Cài đặt | Admin → `spotlight_image_url` |

Nên dùng **ảnh thật** của giáo viên rồi tách nền. Nếu dùng AI:
> Half-body portrait of a friendly Vietnamese teacher in smart casual shirt, looking at the camera, soft studio lighting, isolated on a transparent or plain white background for easy cutout, crisp edges, 1000x1080, no text, no watermark.

## 7. Ảnh giới thiệu LumiEdu (phòng thu bài giảng / lớp học)

| | |
|---|---|
| **Kích thước** | **1024 × 760 px** (khoảng 4:3) |
| Khung hiển thị | rộng tối đa 512 × cao 320 / 380 px |
| Lưu ý | Có lớp tối ở đáy và chữ "Hệ thống cơ sở vật chất…" đè lên. Đừng đặt chi tiết quan trọng ở 25% đáy |
| Cài đặt | Admin → `about_image_url` |

**Prompt:**
> Modern bright online-learning studio of a high-school course platform: a teacher recording a lesson in front of a camera and whiteboard, high school students at light-wood desks with laptops, large windows, blue accent wall #1467E8, whiteboard with abstract diagrams, soft daylight, wide angle, realistic photo style. Important elements in the upper 70% of the image. No text, no watermark. 1024x760.

## 8. Avatar học sinh trong bảng vàng

| | |
|---|---|
| **Kích thước** | **400 × 400 px** (1:1), mặt ở giữa |
| Khung hiển thị | tròn, 96–112 px |

Dùng ảnh thật chân dung học sinh, cắt vuông, mặt chiếm 60% khung.

## 9. Biểu tượng tiêu đề mục (5 cái)

| | |
|---|---|
| **Kích thước** | **128 × 128 px**, PNG nền trong suốt |
| Khung hiển thị | 28–32 px |
| Cần | Huy hiệu sao, hộp quà, bản đồ lộ trình, thành tích, giáo viên |

> Set of 5 flat rounded icons on transparent background: star badge, gift box, route map pin, trophy, teacher with a pointer. Single color family #1467E8 with light #4A8DEE highlights and one small orange #FF9F1C accent, thick simple shapes readable at 32px. 128x128 each.

## 10. Logo và ảnh nền đăng nhập

- **Logo:** `512 × 512 px` vuông, hiển thị 40 × 40 px (bo `rounded-xl`). Thiết kế chữ cái đơn giản, đọc được ở cỡ nhỏ.
- **Nền trang đăng nhập:** `1920 × 1080 px` (16:9), có lớp phủ xanh `#1467E8` 65–85% bên trên, nên ảnh gốc chỉ cần tối giản.

> Abstract 16:9 background: soft blue gradient, faint outlines of books, atoms, formulas and a globe, very low contrast so a blue overlay and a login form remain readable. No text. 1920x1080.

---

## Bố cục đề xuất (đã áp dụng một phần)

1. **Hero** trước đây bị kéo giãn (`object-fit: fill`), ảnh nào khác tỉ lệ cũng méo. Đã đổi sang `object-cover` căn giữa, nên ảnh 3:1 ở trên sẽ không méo.
2. Các ảnh còn lại (slide, thẻ khóa học, lộ trình) đã dùng `object-cover` nên làm đúng tỉ lệ ở trên là khít.
3. Nội dung chữ trên trang (dải chạy, tiêu đề hero, mã giảm giá, trang giáo viên) hiện vẫn viết riêng cho môn Lịch sử. Cần sửa lại thành bản bán khóa học THPT đa môn.
