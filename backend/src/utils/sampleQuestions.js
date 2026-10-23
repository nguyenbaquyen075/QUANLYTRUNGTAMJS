/**
 * Ngân hàng câu hỏi mẫu theo khóa học, dùng cho dữ liệu mẫu (seed.js) và scripts/refresh-sample-questions.js.
 * Câu trắc nghiệm lưu đúng dạng trang làm bài và phần chấm điểm đọc: { question_text, options[4], correct_index, points }.
 * Trong ngân hàng, đáp án đúng luôn viết ở vị trí đầu; quizFor() xoay vị trí để đáp án đúng không luôn là A.
 */

// [câu hỏi, đáp án đúng, ...3 đáp án nhiễu]
const BANKS = {
  toan10: {
    quiz: [
      ['Tập hợp A = {x ∈ ℕ | x < 4} có bao nhiêu phần tử?', '4', '3', '5', '2'],
      ['Đỉnh của parabol y = x² − 4x + 3 là điểm nào?', '(2; −1)', '(−2; 15)', '(2; 1)', '(4; 3)'],
      ['Tập nghiệm của bất phương trình x² − 5x + 6 < 0 là', '(2; 3)', '(−∞; 2)', '(3; +∞)', '[2; 3]'],
      ['Cho A(1; 2), B(3; 6). Tọa độ trung điểm của đoạn AB là', '(2; 4)', '(4; 8)', '(1; 2)', '(2; 3)'],
      ['Hàm số y = 2x − 3 đồng biến trên khoảng nào?', 'ℝ', '(−∞; 0)', '(0; +∞)', 'Không đồng biến trên khoảng nào'],
      ['Tam giác ABC có a = 7, b = 5, c = 3. Số đo góc A là', '120°', '60°', '90°', '45°'],
      ['Độ dài của vectơ u = (3; −4) là', '5', '7', '1', '25'],
      ['Phủ định của mệnh đề "∀x ∈ ℝ, x² ≥ 0" là', '∃x ∈ ℝ, x² < 0', '∀x ∈ ℝ, x² < 0', '∃x ∈ ℝ, x² ≥ 0', '∀x ∈ ℝ, x² ≤ 0']
    ],
    essay: [
      'Giải bất phương trình x² − 3x − 4 ≤ 0 và biểu diễn tập nghiệm trên trục số.',
      'Lập bảng biến thiên và vẽ đồ thị hàm số y = x² − 2x − 3.',
      'Cho tam giác ABC với A(1; 1), B(4; 5), C(5; 2). Tính độ dài các cạnh và chu vi tam giác.',
      'Tìm m để phương trình x² − 2x + m = 0 có hai nghiệm phân biệt.'
    ]
  },
  toan11: {
    quiz: [
      ['Với mọi x, sin²x + cos²x bằng', '1', '0', '2', 'tan x'],
      ['Nghiệm của phương trình sin x = 0 là', 'x = kπ', 'x = π/2 + kπ', 'x = k2π', 'x = π + k2π'],
      ['Chu kỳ tuần hoàn của hàm số y = tan x là', 'π', '2π', 'π/2', '4π'],
      ['Giá trị của cos 60° là', '1/2', '√3/2', '√2/2', '0'],
      ['Giá trị lớn nhất của hàm số y = 3sin x + 1 là', '4', '3', '1', '2'],
      ['Hình chóp tứ giác có bao nhiêu cạnh?', '8', '4', '5', '6'],
      ['Hai đường thẳng phân biệt cùng vuông góc với một mặt phẳng thì', 'song song với nhau', 'cắt nhau', 'chéo nhau', 'vuông góc với nhau'],
      ['Cấp số cộng có u₁ = 2, d = 3. Số hạng u₅ bằng', '14', '17', '11', '15']
    ],
    essay: [
      'Giải phương trình 2sin x − 1 = 0.',
      'Chứng minh đẳng thức (sin x + cos x)² = 1 + sin 2x.',
      'Cho hình chóp S.ABCD có đáy là hình vuông cạnh a, SA ⊥ (ABCD) và SA = a. Chứng minh BD ⊥ (SAC).',
      'Cho cấp số cộng có u₁ = 3, d = 2. Tìm số hạng tổng quát và tính tổng 10 số hạng đầu.'
    ]
  },
  toan12: {
    quiz: [
      ['Đạo hàm của hàm số y = x³ là', "y' = 3x²", "y' = x²", "y' = 3x", "y' = x³/3"],
      ['Nguyên hàm ∫ 2x dx bằng', 'x² + C', '2x² + C', 'x + C', '2 + C'],
      ['Giá trị của log₂ 8 là', '3', '4', '2', '8'],
      ['Hàm số y = x³ − 3x có bao nhiêu điểm cực trị?', '2', '1', '0', '3'],
      ['Tiệm cận ngang của đồ thị hàm số y = (2x + 1)/(x − 1) là', 'y = 2', 'y = 1', 'x = 1', 'y = −1'],
      ['Nghiệm của phương trình 2ˣ = 16 là', 'x = 4', 'x = 8', 'x = 3', 'x = 2'],
      ['Thể tích khối lập phương cạnh a là', 'a³', 'a²', '3a', '6a²'],
      ['Tích phân ∫₀¹ x dx bằng', '1/2', '1', '2', '0']
    ],
    essay: [
      'Khảo sát sự biến thiên và vẽ đồ thị hàm số y = x³ − 3x + 1.',
      'Tính tích phân I = ∫₀² (3x² − 2x) dx.',
      'Giải phương trình log₂(x − 1) + log₂(x + 1) = 3.',
      'Tính thể tích khối chóp tứ giác đều có cạnh đáy bằng a và cạnh bên bằng a√2.'
    ]
  },
  ly10: {
    quiz: [
      ['Đơn vị của gia tốc trong hệ SI là', 'm/s²', 'm/s', 'N', 'km/h'],
      ['Một vật rơi tự do không vận tốc đầu, sau 2 s có vận tốc bao nhiêu? (g = 10 m/s²)', '20 m/s', '10 m/s', '40 m/s', '5 m/s'],
      ['Biểu thức của định luật II Newton là', 'F = m·a', 'F = m/a', 'F = m·v', 'F = a/m'],
      ['Ô tô đi được 120 km trong 2 giờ. Tốc độ trung bình của ô tô là', '60 km/h', '240 km/h', '120 km/h', '30 km/h'],
      ['Trọng lượng của vật có khối lượng 5 kg là bao nhiêu? (g = 10 m/s²)', '50 N', '5 N', '0,5 N', '500 N'],
      ['Động năng của vật khối lượng 2 kg chuyển động với tốc độ 3 m/s là', '9 J', '6 J', '18 J', '3 J'],
      ['Lực ma sát trượt có chiều', 'ngược chiều chuyển động tương đối', 'cùng chiều chuyển động', 'vuông góc với mặt tiếp xúc', 'luôn hướng xuống dưới'],
      ['Công của lực F làm vật dịch chuyển quãng đường s, hợp với hướng dịch chuyển góc α, là', 'A = F·s·cos α', 'A = F/s', 'A = m·g', 'A = F·v']
    ],
    essay: [
      'Một ô tô tăng tốc đều từ 10 m/s lên 20 m/s trong 5 s. Tính gia tốc và quãng đường ô tô đi được trong thời gian đó.',
      'Phát biểu ba định luật Newton và lấy một ví dụ minh họa cho mỗi định luật.',
      'Một vật 2 kg được thả rơi từ độ cao 20 m. Tính vận tốc của vật khi chạm đất (g = 10 m/s², bỏ qua sức cản không khí).',
      'Tính công của lực kéo 50 N làm vật dịch chuyển 10 m, biết lực hợp với phương ngang một góc 60°.'
    ]
  },
  ly11: {
    quiz: [
      ['Đơn vị của điện tích là', 'Culông (C)', 'Vôn (V)', 'Ampe (A)', 'Ôm (Ω)'],
      ['Hai điện tích điểm cùng dấu thì', 'đẩy nhau', 'hút nhau', 'không tương tác', 'lúc hút lúc đẩy'],
      ['Lực Cu-lông giữa hai điện tích điểm tỉ lệ nghịch với', 'bình phương khoảng cách giữa chúng', 'khoảng cách giữa chúng', 'tích độ lớn hai điện tích', 'tổng độ lớn hai điện tích'],
      ['Đơn vị của cường độ điện trường là', 'V/m', 'N', 'C', 'J'],
      ['Định luật Ôm cho đoạn mạch chỉ có điện trở là', 'I = U/R', 'I = U·R', 'I = R/U', 'U = I/R'],
      ['Đặt hiệu điện thế 20 V vào điện trở 10 Ω. Cường độ dòng điện là', '2 A', '200 A', '0,5 A', '10 A'],
      ['Hai điện trở 4 Ω và 6 Ω mắc nối tiếp có điện trở tương đương là', '10 Ω', '2,4 Ω', '24 Ω', '2 Ω'],
      ['Một thiết bị dùng hiệu điện thế 220 V, dòng điện 2 A. Công suất tiêu thụ là', '440 W', '110 W', '222 W', '218 W']
    ],
    essay: [
      'Hai điện tích q₁ = 2·10⁻⁶ C và q₂ = −3·10⁻⁶ C đặt cách nhau 3 cm trong chân không. Tính lực tương tác giữa chúng và cho biết đó là lực hút hay đẩy.',
      'Phát biểu định luật Ôm đối với toàn mạch và giải thích các đại lượng trong công thức.',
      'Mạch điện gồm R₁ = 6 Ω mắc song song với R₂ = 3 Ω, nối vào nguồn 12 V (bỏ qua điện trở trong). Tính cường độ dòng điện trong mạch chính.',
      'Nêu đặc điểm của đường sức điện trong điện trường đều.'
    ]
  },
  hoa10: {
    quiz: [
      ['Hạt mang điện tích dương trong nguyên tử là', 'proton', 'electron', 'neutron', 'cả proton và neutron'],
      ['Nguyên tử Na (Z = 11) có số proton là', '11', '12', '23', '10'],
      ['Nguyên tử khối của oxygen xấp xỉ bằng', '16', '8', '32', '12'],
      ['Cấu hình electron của nguyên tử C (Z = 6) là', '1s²2s²2p²', '1s²2s²2p⁴', '1s²2s⁴', '1s²2p⁴'],
      ['Liên kết trong phân tử NaCl là liên kết', 'ion', 'cộng hóa trị không cực', 'cộng hóa trị có cực', 'kim loại'],
      ['Các nguyên tố halogen thuộc nhóm', 'VIIA', 'IA', 'IIA', 'VIIIA'],
      ['Số oxi hóa của S trong H₂SO₄ là', '+6', '+4', '−2', '+2'],
      ['Đồng vị là những nguyên tử có cùng', 'số proton nhưng khác số neutron', 'số neutron nhưng khác số proton', 'số khối', 'số electron lớp ngoài cùng nhưng khác số proton']
    ],
    essay: [
      'Viết cấu hình electron của Na (Z = 11) và Cl (Z = 17), từ đó xác định vị trí của chúng trong bảng tuần hoàn.',
      'Trình bày sự hình thành liên kết ion trong phân tử NaCl.',
      'Cân bằng phương trình phản ứng oxi hóa – khử: Fe + HNO₃ → Fe(NO₃)₃ + NO + H₂O, chỉ rõ chất khử và chất oxi hóa.',
      'Tính số mol và khối lượng của 6,72 lít khí O₂ ở điều kiện tiêu chuẩn.'
    ]
  },
  hoa11: {
    quiz: [
      ['Chất nào sau đây là chất điện li mạnh?', 'NaCl', 'CH₃COOH', 'H₂O', 'C₂H₅OH'],
      ['Dung dịch có [H⁺] = 10⁻³ M có pH bằng', '3', '11', '7', '1'],
      ['Dung dịch có pH = 7 có môi trường', 'trung tính', 'axit', 'bazơ', 'lưỡng tính'],
      ['Công thức chung của ankan là', 'CₙH₂ₙ₊₂', 'CₙH₂ₙ', 'CₙH₂ₙ₋₂', 'CₙH₂ₙ₋₆'],
      ['Dung dịch nào làm quỳ tím hóa đỏ?', 'HCl', 'NaOH', 'NaCl', 'NH₃'],
      ['Công thức phân tử của metan là', 'CH₄', 'C₂H₆', 'C₂H₄', 'C₂H₂'],
      ['Etilen (C₂H₄) làm mất màu dung dịch nào?', 'Dung dịch brom', 'Dung dịch NaCl', 'Dung dịch H₂SO₄ loãng', 'Nước vôi trong'],
      ['Phản ứng trao đổi ion trong dung dịch xảy ra khi sản phẩm có', 'chất kết tủa, chất khí hoặc chất điện li yếu', 'chỉ chất tan tốt', 'chất điện li mạnh', 'dung dịch trong suốt']
    ],
    essay: [
      'Viết phương trình điện li của H₂SO₄, NaOH và CH₃COOH.',
      'Tính pH của dung dịch HCl 0,01 M.',
      'Viết công thức cấu tạo các đồng phân của C₄H₁₀ và gọi tên.',
      'Trình bày tính chất hóa học của etilen và viết phương trình phản ứng minh họa.'
    ]
  },
  anh: {
    quiz: [
      ['She ___ to school every day.', 'goes', 'go', 'going', 'gone'],
      ['If I ___ rich, I would travel around the world.', 'were', 'am', 'will be', 'been'],
      ['They ___ football when it started to rain.', 'were playing', 'played', 'play', 'have played'],
      ['He said that he ___ tired.', 'was', 'is', 'be', 'will'],
      ['This book ___ by millions of people.', 'has been read', 'has read', 'reading', 'reads'],
      ['Choose the word closest in meaning to "happy".', 'glad', 'sad', 'angry', 'tired'],
      ["I'm looking forward to ___ you.", 'seeing', 'see', 'saw', 'seen'],
      ['She is the girl ___ won the prize.', 'who', 'which', 'whom', 'whose']
    ],
    essay: [
      'Write a paragraph (120–150 words) about your favourite hobby.',
      'Rewrite in the passive voice: (1) They built this school in 1990. (2) People speak English all over the world.',
      'Write an email (about 120 words) inviting a friend to your birthday party.',
      'Discuss the advantages and disadvantages of learning online (about 150 words).'
    ]
  },
  van11: {
    quiz: [
      ['Truyện ngắn "Chí Phèo" là sáng tác của', 'Nam Cao', 'Nguyễn Tuân', 'Thạch Lam', 'Vũ Trọng Phụng'],
      ['Truyện ngắn "Hai đứa trẻ" là của tác giả', 'Thạch Lam', 'Nam Cao', 'Kim Lân', 'Tô Hoài'],
      ['Thao tác lập luận dùng lí lẽ và dẫn chứng để làm sáng tỏ một vấn đề là', 'chứng minh', 'so sánh', 'bác bỏ', 'phân loại'],
      ['Bài thơ "Vội vàng" là của', 'Xuân Diệu', 'Huy Cận', 'Hàn Mặc Tử', 'Nguyễn Bính'],
      ['Bài thơ "Tràng giang" là của', 'Huy Cận', 'Xuân Diệu', 'Chế Lan Viên', 'Tố Hữu'],
      ['Truyện "Chữ người tử tù" in trong tập', 'Vang bóng một thời', 'Gió đầu mùa', 'Nắng trong vườn', 'Truyện Tây Bắc'],
      ['Bố cục thông thường của bài văn nghị luận gồm', 'mở bài, thân bài, kết bài', 'hai phần', 'bốn phần', 'không có bố cục cố định'],
      ['Đoạn trích "Hạnh phúc của một tang gia" trích từ tiểu thuyết', 'Số đỏ', 'Giông tố', 'Tắt đèn', 'Bỉ vỏ']
    ],
    essay: [
      'Phân tích nhân vật Chí Phèo trong truyện ngắn cùng tên của Nam Cao.',
      'Cảm nhận của anh/chị về khổ thơ đầu bài thơ "Tràng giang" (Huy Cận).',
      'Viết đoạn văn nghị luận (khoảng 200 chữ) về ý nghĩa của việc đọc sách đối với giới trẻ.',
      'Phân tích vẻ đẹp của nhân vật Huấn Cao trong "Chữ người tử tù" (Nguyễn Tuân).'
    ]
  }
};

// Chọn ngân hàng theo tên khóa học
function bankKey(courseTitle) {
  const t = String(courseTitle || '');
  if (/Tiếng Anh|IELTS/i.test(t)) return 'anh';
  if (/Ngữ Văn|Văn/i.test(t)) return 'van11';
  const grade = /Lớp 10/.test(t) ? 10 : /Lớp 11/.test(t) ? 11 : 12;
  if (/Vật Lý|Vật lý/i.test(t)) return grade === 10 ? 'ly10' : 'ly11';
  if (/Hóa/i.test(t)) return grade === 10 ? 'hoa10' : 'hoa11';
  return grade === 10 ? 'toan10' : grade === 11 ? 'toan11' : 'toan12';
}

// Câu trắc nghiệm của khóa; đáp án đúng được xoay vị trí theo số câu
function quizFor(courseTitle) {
  return BANKS[bankKey(courseTitle)].quiz.map(([question, correct, ...wrong], i) => {
    const shift = i % 4;
    const options = [correct, ...wrong];
    const rotated = options.slice(4 - shift).concat(options.slice(0, 4 - shift));
    return { question_text: question, options: rotated, correct_index: shift, points: 1 };
  });
}

// Đề bài tự luận của khóa (nội dung trường Instruction)
function essayFor(courseTitle) {
  const prompts = BANKS[bankKey(courseTitle)].essay;
  return `Làm các câu sau, trình bày lời giải chi tiết:\n${prompts.map((p, i) => `Câu ${i + 1}: ${p}`).join('\n')}`;
}

module.exports = { BANKS, bankKey, quizFor, essayFor };
