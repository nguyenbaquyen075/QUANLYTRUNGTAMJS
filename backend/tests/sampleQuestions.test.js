const test = require('node:test');
const assert = require('node:assert/strict');
const { BANKS, bankKey, quizFor, essayFor } = require('../src/utils/sampleQuestions');

test('chọn đúng ngân hàng theo tên khóa', () => {
  assert.equal(bankKey('Toán Học Lớp 10 - Đại Số & Hình Học Nâng Cao'), 'toan10');
  assert.equal(bankKey('Toán Học Lớp 11 - Lượng Giác & Hình Không Gian'), 'toan11');
  assert.equal(bankKey('Luyện Thi THPT Quốc Gia Môn Toán 12 (Target 8.5+)'), 'toan12');
  assert.equal(bankKey('Vật Lý Lớp 10 - Cơ Học & Chuyển Động Học'), 'ly10');
  assert.equal(bankKey('Hóa Học Lớp 11 - Sự Điện Li & Hóa Học Hữu Cơ'), 'hoa11');
  assert.equal(bankKey('Luyện Thi THPT Quốc Gia Môn Tiếng Anh & IELTS 7.0+'), 'anh');
  assert.equal(bankKey('Ngữ Văn Lớp 11 - Nghị Luận Văn Học & Tác Phẩm'), 'van11');
});

test('đáp án đúng nằm đúng vị trí correct_index sau khi xoay', () => {
  for (const key of Object.keys(BANKS)) {
    const bank = BANKS[key].quiz;
    const quiz = quizFor(key === 'anh' ? 'Tiếng Anh' : key === 'van11' ? 'Ngữ Văn' : `${key.startsWith('ly') ? 'Vật Lý' : key.startsWith('hoa') ? 'Hóa' : 'Toán'} Lớp ${key.slice(-2)}`);
    quiz.forEach((q, i) => {
      assert.equal(q.options.length, 4);
      assert.equal(q.options[q.correct_index], bank[i][1], `${key} câu ${i + 1}`);
      assert.equal(new Set(q.options).size, 4, `${key} câu ${i + 1} trùng đáp án`);
    });
  }
});

test('đề tự luận đánh số câu', () => {
  assert.match(essayFor('Toán Học Lớp 10'), /^Làm các câu sau[^\n]*\nCâu 1: /);
});
