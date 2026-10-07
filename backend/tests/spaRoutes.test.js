const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { isSpaRoute } = require('../src/utils/spaRoutes');

const app = fs.readFileSync(path.join(__dirname, '../../frontend/src/App.jsx'), 'utf8');
const reactRoutes = [...app.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]).filter((p) => p !== '*' && p !== '/');

test('mọi route trong App.jsx đều được server trả về index.html', () => {
  assert.ok(reactRoutes.length > 20);
  for (const r of reactRoutes) {
    assert.equal(isSpaRoute(r.replace(/:[A-Za-z]+/g, '123')), true, `thiếu route: ${r}`);
  }
});

test('không bắt nhầm endpoint dữ liệu hay file', () => {
  assert.equal(isSpaRoute('/Teacher/ExportAttendance/5'), false);
  assert.equal(isSpaRoute('/api/Schedules'), false);
  assert.equal(isSpaRoute('/Student/SubmitAssignment'), false);
});

test('không phân biệt hoa thường và dấu / cuối', () => {
  assert.equal(isSpaRoute('/home/courses/'), true);
});
