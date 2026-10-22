const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeEmail } = require('../src/services/authService');

test('email rỗng thì bỏ qua', () => {
  assert.equal(normalizeEmail(''), '');
  assert.equal(normalizeEmail('   '), '');
  assert.equal(normalizeEmail(undefined), '');
});

test('chuẩn hóa chữ hoa và khoảng trắng', () => {
  assert.equal(normalizeEmail('  Quyen@Gmail.COM '), 'quyen@gmail.com');
});

test('từ chối email sai định dạng', () => {
  assert.equal(normalizeEmail('quyen'), null);
  assert.equal(normalizeEmail('quyen@gmail'), null);
  assert.equal(normalizeEmail('quy en@gmail.com'), null);
  assert.equal(normalizeEmail(`${'a'.repeat(150)}@gmail.com`), null);
});
