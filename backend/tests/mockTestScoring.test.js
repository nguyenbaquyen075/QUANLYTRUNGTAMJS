// backend/tests/mockTestScoring.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { computeMockTestScore } = require('../src/services/mockTestService');

test('chấm điểm 10 khi trả lời đúng hết', () => {
  const questions = [
    { Id: 1, CorrectIndex: 0, Points: 1 },
    { Id: 2, CorrectIndex: 2, Points: 1 }
  ];
  const answers = { '1': 0, '2': 2 };
  const result = computeMockTestScore(questions, answers);
  assert.equal(result.score, 10);
  assert.equal(result.correctCount, 2);
  assert.equal(result.totalQuestions, 2);
});

test('chấm điểm theo tỉ lệ khi đúng một phần, có trọng số Points khác nhau', () => {
  const questions = [
    { Id: 1, CorrectIndex: 0, Points: 3 },
    { Id: 2, CorrectIndex: 1, Points: 1 }
  ];
  const answers = { '1': 0, '2': 0 }; // câu 2 sai
  const result = computeMockTestScore(questions, answers);
  // 3/4 tổng điểm = 7.5/10
  assert.equal(result.score, 7.5);
  assert.equal(result.correctCount, 1);
  assert.equal(result.totalQuestions, 2);
});

test('câu trả lời thiếu hoặc null không tính là đúng, không throw', () => {
  const questions = [
    { Id: 1, CorrectIndex: 0, Points: 1 },
    { Id: 2, CorrectIndex: 1, Points: 1 }
  ];
  const answers = { '1': null };
  const result = computeMockTestScore(questions, answers);
  assert.equal(result.score, 0);
  assert.equal(result.correctCount, 0);
});

test('mảng câu hỏi rỗng trả điểm 0, không chia cho 0', () => {
  const result = computeMockTestScore([], {});
  assert.equal(result.score, 0);
  assert.equal(result.correctCount, 0);
  assert.equal(result.totalQuestions, 0);
});
