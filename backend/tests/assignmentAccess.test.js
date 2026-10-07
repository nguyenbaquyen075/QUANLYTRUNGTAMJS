const test = require('node:test');
const assert = require('node:assert/strict');
const { isAssignmentOpen } = require('../src/utils/assignmentAccess');

const now = new Date('2026-10-07T08:00:00Z');

test('không đặt OpenAt thì luôn mở', () => {
  assert.equal(isAssignmentOpen({ OpenAt: null }, now), true);
});

test('chưa tới OpenAt thì đóng', () => {
  assert.equal(isAssignmentOpen({ OpenAt: new Date('2026-10-07T08:00:01Z') }, now), false);
});

test('đúng hoặc sau OpenAt thì mở', () => {
  assert.equal(isAssignmentOpen({ OpenAt: new Date('2026-10-07T08:00:00Z') }, now), true);
  assert.equal(isAssignmentOpen({ OpenAt: '2026-10-01T00:00:00Z' }, now), true);
});
