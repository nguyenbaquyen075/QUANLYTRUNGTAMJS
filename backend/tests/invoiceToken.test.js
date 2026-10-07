const test = require('node:test');
const assert = require('node:assert/strict');
const { sign, verify } = require('../src/utils/invoiceToken');

test('token đúng cho đúng hóa đơn', () => {
  assert.equal(verify(12, sign(12)), true);
});

test('token của hóa đơn này không dùng được cho hóa đơn khác', () => {
  assert.equal(verify(13, sign(12)), false);
});

test('mã của đơn sách không dùng được cho hóa đơn khóa học', () => {
  assert.equal(verify(5, sign(5, 'book'), 'book'), true);
  assert.equal(verify(5, sign(5, 'book')), false);
  assert.equal(verify(5, sign(5), 'book'), false);
});

test('từ chối token rỗng, sai độ dài hoặc không phải chuỗi', () => {
  assert.equal(verify(12, ''), false);
  assert.equal(verify(12, undefined), false);
  assert.equal(verify(12, 'abc'), false);
  assert.equal(verify(12, 123), false);
});

test('json replacer loại PasswordHash ở mọi độ sâu', () => {
  const body = { user: { Id: 1, PasswordHash: 'x' }, classes: [{ Teacher: { PasswordHash: 'y', FullName: 'T' } }] };
  const out = JSON.parse(JSON.stringify(body, require('../src/utils/jsonReplacer')));
  assert.equal(JSON.stringify(out).includes('PasswordHash'), false);
  assert.equal(out.classes[0].Teacher.FullName, 'T');
});
