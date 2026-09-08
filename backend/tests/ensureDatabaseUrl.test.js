const test = require('node:test');
const assert = require('node:assert/strict');
const ensureDatabaseUrl = require('../src/config/ensureDatabaseUrl');

test('vô hiệu hoá DATABASE_URL khi host không tồn tại', async () => {
  process.env.DATABASE_URL = 'postgres://u:p@dpg-khong-ton-tai-abc123.invalid:5432/db';
  await ensureDatabaseUrl();
  assert.equal(process.env.DATABASE_URL, '');
});

test('vô hiệu hoá DATABASE_URL sai định dạng', async () => {
  process.env.DATABASE_URL = 'khong-phai-url';
  await ensureDatabaseUrl();
  assert.equal(process.env.DATABASE_URL, '');
});

test('giữ nguyên DATABASE_URL khi host phân giải được', async () => {
  const url = 'postgres://u:p@localhost:5432/db';
  process.env.DATABASE_URL = url;
  await ensureDatabaseUrl();
  assert.equal(process.env.DATABASE_URL, url);
});

test('không làm gì khi DATABASE_URL trống', async () => {
  process.env.DATABASE_URL = '';
  await ensureDatabaseUrl();
  assert.equal(process.env.DATABASE_URL, '');
});
