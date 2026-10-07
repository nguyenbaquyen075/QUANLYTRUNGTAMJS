const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCourseCode, maskName, countQuestions, aggregateRanking } = require('../src/services/leagueService');

test('parseCourseCode suy ra môn và khối từ mã khóa học', () => {
  assert.deepEqual(parseCourseCode('TOAN12'), { subject: 'TOAN', name: 'Toán học', grade: 12 });
  assert.equal(parseCourseCode('ly10').grade, 10);
  assert.equal(parseCourseCode('XYZ12'), null);
  assert.equal(parseCourseCode('TOAN99'), null);
  assert.equal(parseCourseCode(null), null);
});

test('maskName rút gọn tên đệm', () => {
  assert.equal(maskName('Nguyễn Bá Quyền'), 'Nguyễn B. Quyền');
  assert.equal(maskName('Trần Văn Anh Tuấn'), 'Trần V. A. Tuấn');
  assert.equal(maskName('Hoa'), 'Hoa');
  assert.equal(maskName(''), 'Ẩn danh');
});

test('countQuestions đếm cả mảng lẫn đề tổng hợp, JSON hỏng thì 0', () => {
  assert.equal(countQuestions('[1,2,3]'), 3);
  assert.equal(countQuestions('{"quiz":[1,2],"tf":[1],"essay":[1,2,3]}'), 6);
  assert.equal(countQuestions('{không phải json'), 0);
  assert.equal(countQuestions(null), 0);
});

test('aggregateRanking cộng điểm, lọc khối/môn, xếp hạng và rút gọn tên', () => {
  const T12 = { subject: 'TOAN', grade: 12 }, L12 = { subject: 'LY', grade: 12 }, T11 = { subject: 'TOAN', grade: 11 };
  const rows = [
    { studentId: 1, name: 'Nguyễn Bá Quyền', points: 8, course: T12 }, { studentId: 1, name: 'Nguyễn Bá Quyền', points: 9, course: T12 },
    { studentId: 2, name: 'Lê Hoa', points: 10, course: T12 }, { studentId: 2, name: 'Lê Hoa', points: 6, course: L12 },
    { studentId: 3, name: 'Phạm Văn Nam', points: 9.5, course: T11 }, { studentId: 4, name: 'Chưa chấm', points: null, course: T12 }
  ];
  const all = aggregateRanking(rows);
  assert.equal(all.length, 3); // người chưa có điểm bị loại
  assert.deepEqual(all[0], { rank: 1, name: 'Nguyễn B. Quyền', points: 17, attempts: 2, avg: 8.5 });
  assert.equal(aggregateRanking(rows, { grade: 12, subject: 'TOAN' }).map((r) => r.name).join('|'), 'Nguyễn B. Quyền|Lê Hoa');
  assert.equal(aggregateRanking(rows, { grade: 11 }).length, 1);
  assert.equal(aggregateRanking(rows, { subject: 'LY' })[0].points, 6);
});
