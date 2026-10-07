const test = require('node:test');
const assert = require('node:assert/strict');
const { validateOrderInput, canTransition } = require('../src/services/bookService');

const ok = { buyerName: '  Nguyễn  Văn A ', phone: '0912 345 678', address: '12 Trần Phú, Hà Đông, Hà Nội', items: [{ bookId: 1, quantity: 2 }] };

test('đơn hợp lệ được chuẩn hóa (tên, số điện thoại, gộp dòng trùng)', () => {
  const { value, error } = validateOrderInput({ ...ok, items: [{ bookId: 1, quantity: 2 }, { bookId: 1, quantity: 3 }, { bookId: 2, quantity: 1 }] });
  assert.equal(error, undefined);
  assert.equal(value.name, 'Nguyễn Văn A');
  assert.equal(value.phone, '0912345678');
  assert.deepEqual(value.lines, [{ bookId: 1, quantity: 5 }, { bookId: 2, quantity: 1 }]);
});

test('từ chối thông tin thiếu hoặc sai', () => {
  assert.match(validateOrderInput({ ...ok, buyerName: 'A' }).error, /họ tên/);
  assert.match(validateOrderInput({ ...ok, phone: '12345' }).error, /điện thoại/);
  assert.match(validateOrderInput({ ...ok, address: 'abc' }).error, /địa chỉ/);
  assert.match(validateOrderInput({ ...ok, items: [] }).error, /trống/);
  assert.match(validateOrderInput({ ...ok, items: [{ bookId: 1, quantity: 0 }] }).error, /Số lượng/);
  assert.match(validateOrderInput({ ...ok, items: [{ bookId: 1, quantity: 99 }] }).error, /Số lượng/);
  assert.match(validateOrderInput({ ...ok, items: [{ bookId: 'x', quantity: 1 }] }).error, /Số lượng/);
  assert.match(validateOrderInput({ ...ok, items: [{ bookId: 1, quantity: 15 }, { bookId: 1, quantity: 15 }] }).error, /tối đa/);
  assert.ok(validateOrderInput(null).error);
});

test('không tin giá/tổng tiền do người dùng gửi', () => {
  const { value } = validateOrderInput({ ...ok, total: 1, items: [{ bookId: 1, quantity: 1, price: 1 }] });
  assert.deepEqual(Object.keys(value.lines[0]).sort(), ['bookId', 'quantity']);
  assert.equal('total' in value, false);
});

test('chỉ cho các bước trạng thái hợp lệ', () => {
  assert.equal(canTransition('PENDING', 'PAID'), true);
  assert.equal(canTransition('PAID', 'SHIPPED'), true);
  assert.equal(canTransition('PENDING', 'CANCELLED'), true);
  assert.equal(canTransition('PENDING', 'SHIPPED'), false); // chưa nhận tiền thì chưa giao
  assert.equal(canTransition('PAID', 'CANCELLED'), false);   // đã nhận tiền thì không hủy trơn
  assert.equal(canTransition('SHIPPED', 'PAID'), false);
  assert.equal(canTransition('CANCELLED', 'PAID'), false);
});
