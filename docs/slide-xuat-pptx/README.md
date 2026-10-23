# Xuất slide báo cáo ra .pptx

Dựng file .pptx từ bản xem trước HTML (artifact "Báo cáo thực tập LumiEdu"), giữ đúng vị trí, chữ sửa được, font Arial.

1. Lưu HTML mới nhất của artifact (đã gồm chữ anh sửa) và tải các ảnh trong kho ảnh của artifact vào một thư mục `assets/` (tên file = mã ảnh).
2. `npm install pptxgenjs@3.12.0`
3. `node measure.mjs <slide.html> <assets/> slides.json <thư-mục-profile-chrome>` — mở trang trong Chrome chạy ngầm, đo từng slide 1280×720.
4. `node build.js slides.json <assets/> out.pptx`
