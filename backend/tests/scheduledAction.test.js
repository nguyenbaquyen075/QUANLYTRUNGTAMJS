const test = require('node:test');
const assert = require('node:assert/strict');
const { validateAction, canManage } = require('../src/services/scheduledActionService');
const { isAssignmentSubmittable } = require('../src/utils/assignmentAccess');

const now = new Date('2026-10-07T08:00:00Z');
const later = '2026-10-08T08:00:00Z';

test('validateAction chấp nhận việc hợp lệ', () => {
  assert.equal(validateAction('EXTEND_DUE', { assignmentId: 1, addHours: 24, minNotSubmittedPercent: 30 }, later, now), null);
  assert.equal(validateAction('TOGGLE_SECTION', { key: 'sec02_active', value: false }, later, now), null);
});

test('validateAction từ chối đầu vào xấu', () => {
  assert.match(validateAction('DROP_TABLE', {}, later, now), /Loại việc/);
  assert.match(validateAction('EXTEND_DUE', { assignmentId: 1, addHours: 99999 }, later, now), /gia hạn/);
  assert.match(validateAction('EXTEND_DUE', { addHours: 1 }, later, now), /bài tập/);
  assert.match(validateAction('TOGGLE_SECTION', { key: 'sec99_active', value: true }, later, now), /Mục trang chủ/);
  assert.match(validateAction('CLOSE_ASSIGNMENT', { assignmentId: 1 }, '2020-01-01T00:00:00Z', now), /đã qua/);
  assert.match(validateAction('CLOSE_ASSIGNMENT', { assignmentId: 1 }, 'không phải ngày', now), /không hợp lệ/);
});

test('canManage: giáo viên chỉ quản lý bài của lớp mình, trang chủ chỉ admin', () => {
  const a = { Lesson: { Class: { TeacherId: 7 } } };
  assert.equal(canManage({ id: 7, role: 'TEACHER' }, 'EXTEND_DUE', a), true);
  assert.equal(canManage({ id: 8, role: 'TEACHER' }, 'EXTEND_DUE', a), false);
  assert.equal(canManage({ id: 7, role: 'TEACHER' }, 'TOGGLE_SECTION', null), false);
  assert.equal(canManage({ id: 1, role: 'ADMIN' }, 'TOGGLE_SECTION', null), true);
  assert.equal(canManage({ id: 9, role: 'STUDENT' }, 'EXTEND_DUE', a), false);
});

test('isAssignmentSubmittable: chỉ nộp trong [OpenAt, DueDate]', () => {
  const due = new Date('2026-10-07T12:00:00Z');
  assert.equal(isAssignmentSubmittable({ OpenAt: null, DueDate: due }, now), true);
  assert.equal(isAssignmentSubmittable({ OpenAt: null, DueDate: new Date('2026-10-07T07:59:59Z') }, now), false);
  assert.equal(isAssignmentSubmittable({ OpenAt: new Date('2026-10-07T09:00:00Z'), DueDate: due }, now), false);
});
