# Mock Test Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 100%-hardcoded "Thi thử" (Mock Test) data in `MockTestPage.jsx`/`BigMockTestPage.jsx` with a real Sequelize-backed model, public REST API, Admin+Teacher CRUD, and real result/leaderboard persistence.

**Architecture:** Three new Sequelize models (`MockTest`, `MockTestQuestion`, `MockTestSubmission`) following the exact field/association conventions already used by `Assignment`/`Submission`. A pure scoring function in a new `mockTestService.js` (server always recomputes score — never trusts client input). Public read/submit endpoints added to the existing `homeRoutes.js`/`homeController.js` (same file that already serves `/Home/MockTestData`). Admin/Teacher CRUD gets its own route+controller pair, reusing the `requireAuth(['ADMIN','STAFF','TEACHER'])` pattern already used for `/Course/Update/:id`. FE wiring replaces the hardcoded arrays with real fetches; grading/UX logic in `MockTestPage.jsx` is otherwise untouched.

**Tech Stack:** Node.js + Express + Sequelize (SQLite dev / Postgres prod, `sequelize.sync()` — no migrations), React + Vite + axios, `node:test` for backend tests.

## Global Constraints

- All Sequelize model definitions use `field: 'ExactColumnName'` mapping and manual timestamp fields — the DB config sets `timestamps: false, freezeTableName: true` globally (`backend/src/config/database.js`), so every model must declare its own `CreatedAt`/etc. fields exactly like `Assignment.js`/`Submission.js` do.
- Controllers use the `const controller = {}; ... module.exports = controller;` pattern (see `studentController.js`, `teacherController.js`, `parentController.js`) for the new admin/teacher CRUD controller. `homeController.js` uses `exports.fnName = ...` — match whichever file you're editing.
- JSON API responses use plain `res.json({ success, ... })` for routes with no EJS view counterpart — exactly like `homeController.getMockTestData`/`getSiteContent` already do. Do not use `res.render`/`res.redirect` for these new endpoints.
- Server always recomputes the score from DB data on submit — never trust a client-sent score (this is the one security-relevant rule from the spec; the mock test itself is not proctored, but score integrity for the leaderboard matters).
- No new npm dependencies — everything needed (Express, Sequelize, bcryptjs is unrelated) is already installed.
- Vietnamese user-facing strings (error messages, labels) — match the existing files' tone (see `studentController.js` error messages).

Spec: `docs/superpowers/specs/2026-08-11-mock-test-backend-design.md`

---

### Task 1: `MockTest` and `MockTestQuestion` models

**Files:**
- Create: `backend/src/models/MockTest.js`
- Create: `backend/src/models/MockTestQuestion.js`
- Modify: `backend/src/models/index.js`

**Interfaces:**
- Produces: `db.MockTest` (fields: `Id, Grade, Subject, SubjectCode, CoverBg, Title, Code, Duration, Status, CreatedBy, CreatedAt`), `db.MockTest.StatusMap = {DRAFT:0, PUBLISHED:1}`, `db.MockTest.StatusRevMap`, association `db.MockTest.Questions` (hasMany `MockTestQuestion`, ordered by `SortOrder` at query time — no default scope).
- Produces: `db.MockTestQuestion` (fields: `Id, MockTestId, Content, Options, CorrectIndex, Explanation, Points, SortOrder`), association `db.MockTestQuestion.MockTest` (belongsTo).

- [ ] **Step 1: Create the `MockTest` model**

```js
// backend/src/models/MockTest.js
module.exports = (sequelize, DataTypes) => {
  const MockTest = sequelize.define('MockTests', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    Grade: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'Grade'
    },
    Subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'Subject'
    },
    SubjectCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'SubjectCode'
    },
    CoverBg: {
      type: DataTypes.STRING(100), // class Tailwind gradient, ví dụ "from-blue-600 to-indigo-700"
      allowNull: true,
      field: 'CoverBg'
    },
    Title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'Title'
    },
    Code: {
      type: DataTypes.STRING(50), // mã đề, ví dụ "TOAN-01" — dùng để BigMockTestPage khớp entry trong GAME_SESSIONS_DATA.examinations[].code
      allowNull: true,
      field: 'Code'
    },
    Duration: {
      type: DataTypes.INTEGER, // phút
      allowNull: false,
      field: 'Duration'
    },
    Status: {
      type: DataTypes.INTEGER, // 0 = DRAFT (chưa có câu hỏi/chưa công bố), 1 = PUBLISHED
      allowNull: false,
      defaultValue: 0,
      field: 'Status'
    },
    CreatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'CreatedBy'
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CreatedAt'
    }
  });

  MockTest.StatusMap = {
    DRAFT: 0,
    PUBLISHED: 1
  };

  MockTest.StatusRevMap = {
    0: 'DRAFT',
    1: 'PUBLISHED'
  };

  return MockTest;
};
```

- [ ] **Step 2: Create the `MockTestQuestion` model**

```js
// backend/src/models/MockTestQuestion.js
module.exports = (sequelize, DataTypes) => {
  const MockTestQuestion = sequelize.define('MockTestQuestions', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    MockTestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'MockTestId'
    },
    Content: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'Content'
    },
    Options: {
      type: DataTypes.TEXT, // JSON array of string, ví dụ ["A. ...","B. ..."]
      allowNull: false,
      field: 'Options'
    },
    CorrectIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'CorrectIndex'
    },
    Explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Explanation'
    },
    Points: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1,
      field: 'Points'
    },
    SortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'SortOrder'
    }
  });

  return MockTestQuestion;
};
```

- [ ] **Step 3: Register models and associations in `models/index.js`**

Add near the top with the other `db.X = require(...)` lines (after `db.HomepageItem = ...`):

```js
db.MockTest = require('./MockTest')(sequelize, DataTypes);
db.MockTestQuestion = require('./MockTestQuestion')(sequelize, DataTypes);
```

Add at the end, right before `module.exports = db;`:

```js
// MockTest <-> MockTestQuestion (One-to-Many)
db.MockTest.hasMany(db.MockTestQuestion, { foreignKey: 'MockTestId', as: 'Questions' });
db.MockTestQuestion.belongsTo(db.MockTest, { foreignKey: 'MockTestId', as: 'MockTest' });

// MockTest -> Creator (User)
db.MockTest.belongsTo(db.User, { foreignKey: 'CreatedBy', as: 'Creator' });
```

- [ ] **Step 4: Verify the schema syncs**

Run: `cd backend && node -e "require('./src/models').sequelize.sync().then(() => { console.log('OK'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); })"`
Expected: prints `OK` with no errors (creates `MockTests`/`MockTestQuestions` tables in `database.sqlite`).

- [ ] **Step 5: Commit**

```bash
git add backend/src/models/MockTest.js backend/src/models/MockTestQuestion.js backend/src/models/index.js
git commit -m "feat: thêm model MockTest và MockTestQuestion"
```

---

### Task 2: `MockTestSubmission` model

**Files:**
- Create: `backend/src/models/MockTestSubmission.js`
- Modify: `backend/src/models/index.js`

**Interfaces:**
- Consumes: `db.MockTest`, `db.User` (from Task 1 / existing).
- Produces: `db.MockTestSubmission` (fields: `Id, MockTestId, UserId, GuestName, Score, CorrectCount, TotalQuestions, AnswersData, SubmittedAt`), associations `db.MockTestSubmission.MockTest`, `db.MockTestSubmission.User`, `db.MockTest.Submissions`.

- [ ] **Step 1: Create the model**

```js
// backend/src/models/MockTestSubmission.js
module.exports = (sequelize, DataTypes) => {
  const MockTestSubmission = sequelize.define('MockTestSubmissions', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    MockTestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'MockTestId'
    },
    UserId: {
      type: DataTypes.INTEGER, // null nếu khách vãng lai nộp bài
      allowNull: true,
      field: 'UserId'
    },
    GuestName: {
      type: DataTypes.STRING(100), // bắt buộc khi UserId null
      allowNull: true,
      field: 'GuestName'
    },
    Score: {
      type: DataTypes.FLOAT, // /10, luôn tính lại ở server
      allowNull: false,
      field: 'Score'
    },
    CorrectCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'CorrectCount'
    },
    TotalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'TotalQuestions'
    },
    AnswersData: {
      type: DataTypes.TEXT, // JSON: { [questionId]: chosenOptionIndex }
      allowNull: true,
      field: 'AnswersData'
    },
    SubmittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'SubmittedAt'
    }
  });

  return MockTestSubmission;
};
```

- [ ] **Step 2: Register model and associations in `models/index.js`**

Add with the other requires:

```js
db.MockTestSubmission = require('./MockTestSubmission')(sequelize, DataTypes);
```

Add with the other associations:

```js
// MockTest <-> MockTestSubmission (One-to-Many)
db.MockTest.hasMany(db.MockTestSubmission, { foreignKey: 'MockTestId', as: 'Submissions' });
db.MockTestSubmission.belongsTo(db.MockTest, { foreignKey: 'MockTestId', as: 'MockTest' });
db.MockTestSubmission.belongsTo(db.User, { foreignKey: 'UserId', as: 'User' });
```

- [ ] **Step 3: Verify the schema syncs**

Run: `cd backend && node -e "require('./src/models').sequelize.sync().then(() => { console.log('OK'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); })"`
Expected: prints `OK`, no errors (creates `MockTestSubmissions` table).

- [ ] **Step 4: Commit**

```bash
git add backend/src/models/MockTestSubmission.js backend/src/models/index.js
git commit -m "feat: thêm model MockTestSubmission"
```

---

### Task 3: Scoring service (TDD)

**Files:**
- Create: `backend/src/services/mockTestService.js`
- Test: `backend/tests/mockTestScoring.test.js`

**Interfaces:**
- Produces: `computeMockTestScore(questions, answers)` — `questions`: array of `{ Id, CorrectIndex, Points }` (plain objects or Sequelize instances, both work since only property access is used); `answers`: plain object `{ [questionId: string]: number }`. Returns `{ score: number /* 0-10, 1 decimal */, correctCount: number, totalQuestions: number }`.

- [ ] **Step 1: Write the failing tests**

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && node --test tests/mockTestScoring.test.js`
Expected: FAIL — `Cannot find module '../src/services/mockTestService'`

- [ ] **Step 3: Implement the service**

```js
// backend/src/services/mockTestService.js
function computeMockTestScore(questions, answers) {
  const safeAnswers = answers || {};
  let totalMaxPoints = 0;
  let totalCorrectPoints = 0;
  let correctCount = 0;

  questions.forEach((q) => {
    const points = typeof q.Points === 'number' ? q.Points : parseFloat(q.Points) || 1;
    totalMaxPoints += points;
    const chosen = safeAnswers[String(q.Id)];
    if (chosen !== undefined && chosen !== null && chosen === q.CorrectIndex) {
      correctCount++;
      totalCorrectPoints += points;
    }
  });

  const score = totalMaxPoints > 0 ? Number(((totalCorrectPoints / totalMaxPoints) * 10).toFixed(1)) : 0;

  return {
    score,
    correctCount,
    totalQuestions: questions.length
  };
}

module.exports = { computeMockTestScore };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && node --test tests/mockTestScoring.test.js`
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/mockTestService.js backend/tests/mockTestScoring.test.js
git commit -m "feat: thêm hàm chấm điểm mock test (server-side, có test)"
```

---

### Task 4: Public API — list, detail, submit, leaderboard

**Files:**
- Modify: `backend/src/controllers/homeController.js`
- Modify: `backend/src/routes/homeRoutes.js`

**Interfaces:**
- Consumes: `db.MockTest`, `db.MockTestQuestion`, `db.MockTestSubmission`, `db.User` (Tasks 1-2), `computeMockTestScore` (Task 3, `require('../services/mockTestService')`).
- Produces: `exports.getMockTests`, `exports.getMockTestDetail`, `exports.submitMockTest`, `exports.getMockTestLeaderboard` on `homeController.js`. Routes `GET /Home/MockTests`, `GET /Home/MockTests/:id`, `POST /Home/MockTests/:id/Submit`, `GET /Home/MockTests/:id/Leaderboard`.

- [ ] **Step 1: Add `const db = require('../models');` and the scoring import to the top of `homeController.js`**

`homeController.js` currently only imports `homeService`. Add right after the existing `require`:

```js
const db = require('../models');
const { computeMockTestScore } = require('../services/mockTestService');
```

- [ ] **Step 2: Add `getMockTests` (list, published only, metadata + question count)**

Add after `exports.getMockTestData` (the existing subjects/stats endpoint):

```js
// GET: /Home/MockTests?grade=&subject= (React mock test list — real data)
exports.getMockTests = async (req, res) => {
  try {
    const where = { Status: db.MockTest.StatusMap.PUBLISHED };
    if (req.query.grade) where.Grade = req.query.grade;
    if (req.query.subject) where.SubjectCode = req.query.subject;

    const tests = await db.MockTest.findAll({
      where,
      include: [{ model: db.MockTestQuestion, as: 'Questions', attributes: ['Id'] }],
      order: [['Id', 'ASC']]
    });

    const data = tests.map((t) => ({
      id: t.Id,
      grade: t.Grade,
      subject: t.Subject,
      subjectCode: t.SubjectCode,
      coverBg: t.CoverBg,
      title: t.Title,
      code: t.Code,
      duration: t.Duration,
      totalQuestions: t.Questions.length
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách đề thi.' });
  }
};
```

- [ ] **Step 3: Add `getMockTestDetail` (full questions, including answers — public practice tool, not a proctored exam)**

```js
// GET: /Home/MockTests/:id (React mock test detail — questions + đáp án cho tự chấm ngay)
exports.getMockTestDetail = async (req, res) => {
  try {
    const test = await db.MockTest.findOne({
      where: { Id: req.params.id, Status: db.MockTest.StatusMap.PUBLISHED },
      include: [{ model: db.MockTestQuestion, as: 'Questions' }],
      order: [[{ model: db.MockTestQuestion, as: 'Questions' }, 'SortOrder', 'ASC']]
    });

    if (!test) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đề thi.' });
    }

    const data = {
      id: test.Id,
      grade: test.Grade,
      subject: test.Subject,
      subjectCode: test.SubjectCode,
      coverBg: test.CoverBg,
      title: test.Title,
      code: test.Code,
      duration: test.Duration,
      questions: test.Questions.map((q) => ({
        id: q.Id,
        content: q.Content,
        options: JSON.parse(q.Options || '[]'),
        correctIndex: q.CorrectIndex,
        explanation: q.Explanation
      }))
    };

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải đề thi.' });
  }
};
```

- [ ] **Step 4: Add `submitMockTest` (server-authoritative scoring + guest support)**

```js
// POST: /Home/MockTests/:id/Submit
exports.submitMockTest = async (req, res) => {
  const { answers, guestName } = req.body;
  const userId = req.session.userId || null;

  if (!userId && !guestName) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập tên hoặc đăng nhập trước khi nộp bài.' });
  }

  try {
    const test = await db.MockTest.findOne({
      where: { Id: req.params.id, Status: db.MockTest.StatusMap.PUBLISHED },
      include: [{ model: db.MockTestQuestion, as: 'Questions' }]
    });

    if (!test) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đề thi.' });
    }

    const { score, correctCount, totalQuestions } = computeMockTestScore(test.Questions, answers || {});

    const submission = await db.MockTestSubmission.create({
      MockTestId: test.Id,
      UserId: userId,
      GuestName: userId ? null : guestName,
      Score: score,
      CorrectCount: correctCount,
      TotalQuestions: totalQuestions,
      AnswersData: JSON.stringify(answers || {}),
      SubmittedAt: new Date()
    });

    res.json({
      success: true,
      data: { id: submission.Id, score, correctCount, totalQuestions, submittedAt: submission.SubmittedAt }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi nộp bài.' });
  }
};
```

- [ ] **Step 5: Add `getMockTestLeaderboard`**

```js
// GET: /Home/MockTests/:id/Leaderboard
exports.getMockTestLeaderboard = async (req, res) => {
  try {
    const submissions = await db.MockTestSubmission.findAll({
      where: { MockTestId: req.params.id },
      include: [{ model: db.User, as: 'User', attributes: ['FullName'] }],
      order: [['Score', 'DESC'], ['SubmittedAt', 'ASC']],
      limit: 20
    });

    const data = submissions.map((s, idx) => ({
      rank: idx + 1,
      name: s.User ? s.User.FullName : s.GuestName,
      score: s.Score,
      submittedAt: s.SubmittedAt
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải bảng xếp hạng.' });
  }
};
```

- [ ] **Step 6: Add the routes**

In `backend/src/routes/homeRoutes.js`, add after the existing `router.get('/Home/MockTestData', ...)` line:

```js
router.get('/Home/MockTests', homeController.getMockTests);
router.get('/Home/MockTests/:id', homeController.getMockTestDetail);
router.post('/Home/MockTests/:id/Submit', homeController.submitMockTest);
router.get('/Home/MockTests/:id/Leaderboard', homeController.getMockTestLeaderboard);
```

- [ ] **Step 7: Manual verification against the running server**

Run: `cd backend && npm run dev` (leave running), then in another shell:

```bash
curl -s http://localhost:5000/Home/MockTests | head -c 300
```

Expected: `{"success":true,"data":[]}` (empty — no tests seeded yet, that's Task 6). No 500 error, no stack trace.

- [ ] **Step 8: Commit**

```bash
git add backend/src/controllers/homeController.js backend/src/routes/homeRoutes.js
git commit -m "feat: thêm API công khai cho đề thi thử (list/detail/submit/leaderboard)"
```

---

### Task 5: Admin + Teacher CRUD for mock tests

**Files:**
- Create: `backend/src/controllers/mockTestController.js`
- Create: `backend/src/routes/mockTestRoutes.js`
- Modify: `backend/src/app.js`

**Interfaces:**
- Consumes: `db.MockTest`, `db.MockTestQuestion` (Task 1), `requireAuth` from `../middlewares/auth`.
- Produces: routes `GET /Admin/MockTests`, `POST /Admin/MockTests`, `POST /Admin/MockTests/:id`, `POST /Admin/MockTests/:id/Delete`, `POST /Admin/MockTests/:id/Questions`, `POST /Admin/MockTests/:id/Questions/:qId`, `POST /Admin/MockTests/:id/Questions/:qId/Delete` — all `requireAuth(['ADMIN','STAFF','TEACHER'])`.

- [ ] **Step 1: Create the controller**

```js
// backend/src/controllers/mockTestController.js
const controller = {};
const db = require('../models');

function validateOptions(options, correctIndex) {
  if (!Array.isArray(options) || options.length < 2) {
    return 'Đề thi cần ít nhất 2 đáp án cho mỗi câu hỏi.';
  }
  const idx = parseInt(correctIndex);
  if (Number.isNaN(idx) || idx < 0 || idx >= options.length) {
    return 'Đáp án đúng không hợp lệ.';
  }
  return null;
}

// GET: /Admin/MockTests
controller.listMockTests = async (req, res) => {
  try {
    const tests = await db.MockTest.findAll({
      include: [{ model: db.MockTestQuestion, as: 'Questions', attributes: ['Id'] }],
      order: [['Id', 'DESC']]
    });
    res.json({
      success: true,
      data: tests.map((t) => ({
        id: t.Id,
        grade: t.Grade,
        subject: t.Subject,
        subjectCode: t.SubjectCode,
        title: t.Title,
        code: t.Code,
        duration: t.Duration,
        status: t.Status,
        totalQuestions: t.Questions.length
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách đề thi.' });
  }
};

// POST: /Admin/MockTests
controller.createMockTest = async (req, res) => {
  const { grade, subject, subjectCode, coverBg, title, code, duration, status } = req.body;
  if (!grade || !subject || !subjectCode || !title || !duration) {
    return res.json({ success: false, message: 'Vui lòng nhập đủ Khối lớp, Môn học, Tên đề và Thời gian làm bài.' });
  }
  try {
    const test = await db.MockTest.create({
      Grade: grade,
      Subject: subject,
      SubjectCode: subjectCode,
      CoverBg: coverBg || null,
      Title: title,
      Code: code || null,
      Duration: parseInt(duration),
      Status: status !== undefined ? parseInt(status) : db.MockTest.StatusMap.DRAFT,
      CreatedBy: req.session.userId
    });
    res.json({ success: true, message: 'Đã tạo đề thi.', data: { id: test.Id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo đề thi.' });
  }
};

// POST: /Admin/MockTests/:id
controller.updateMockTest = async (req, res) => {
  try {
    const test = await db.MockTest.findByPk(req.params.id);
    if (!test) return res.json({ success: false, message: 'Không tìm thấy đề thi.' });

    const { grade, subject, subjectCode, coverBg, title, code, duration, status } = req.body;
    await test.update({
      Grade: grade ?? test.Grade,
      Subject: subject ?? test.Subject,
      SubjectCode: subjectCode ?? test.SubjectCode,
      CoverBg: coverBg ?? test.CoverBg,
      Title: title ?? test.Title,
      Code: code ?? test.Code,
      Duration: duration !== undefined ? parseInt(duration) : test.Duration,
      Status: status !== undefined ? parseInt(status) : test.Status
    });
    res.json({ success: true, message: 'Đã cập nhật đề thi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật đề thi.' });
  }
};

// POST: /Admin/MockTests/:id/Delete
controller.deleteMockTest = async (req, res) => {
  try {
    const test = await db.MockTest.findByPk(req.params.id);
    if (!test) return res.json({ success: false, message: 'Không tìm thấy đề thi.' });
    await db.MockTestQuestion.destroy({ where: { MockTestId: test.Id } });
    await db.MockTestSubmission.destroy({ where: { MockTestId: test.Id } });
    await test.destroy();
    res.json({ success: true, message: 'Đã xoá đề thi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi xoá đề thi.' });
  }
};

// POST: /Admin/MockTests/:id/Questions
controller.createQuestion = async (req, res) => {
  const { content, options, correctIndex, explanation, points, sortOrder } = req.body;
  const parsedOptions = Array.isArray(options) ? options : JSON.parse(options || '[]');
  const validationError = validateOptions(parsedOptions, correctIndex);
  if (validationError) return res.json({ success: false, message: validationError });

  try {
    const test = await db.MockTest.findByPk(req.params.id);
    if (!test) return res.json({ success: false, message: 'Không tìm thấy đề thi.' });

    const question = await db.MockTestQuestion.create({
      MockTestId: test.Id,
      Content: content,
      Options: JSON.stringify(parsedOptions),
      CorrectIndex: parseInt(correctIndex),
      Explanation: explanation || null,
      Points: points !== undefined ? parseFloat(points) : 1,
      SortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0
    });
    res.json({ success: true, message: 'Đã thêm câu hỏi.', data: { id: question.Id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi thêm câu hỏi.' });
  }
};

// POST: /Admin/MockTests/:id/Questions/:qId
controller.updateQuestion = async (req, res) => {
  const { content, options, correctIndex, explanation, points, sortOrder } = req.body;
  try {
    const question = await db.MockTestQuestion.findOne({
      where: { Id: req.params.qId, MockTestId: req.params.id }
    });
    if (!question) return res.json({ success: false, message: 'Không tìm thấy câu hỏi.' });

    let parsedOptions = question.Options ? JSON.parse(question.Options) : [];
    if (options !== undefined) {
      parsedOptions = Array.isArray(options) ? options : JSON.parse(options || '[]');
    }
    const effectiveCorrectIndex = correctIndex !== undefined ? correctIndex : question.CorrectIndex;
    const validationError = validateOptions(parsedOptions, effectiveCorrectIndex);
    if (validationError) return res.json({ success: false, message: validationError });

    await question.update({
      Content: content ?? question.Content,
      Options: JSON.stringify(parsedOptions),
      CorrectIndex: parseInt(effectiveCorrectIndex),
      Explanation: explanation ?? question.Explanation,
      Points: points !== undefined ? parseFloat(points) : question.Points,
      SortOrder: sortOrder !== undefined ? parseInt(sortOrder) : question.SortOrder
    });
    res.json({ success: true, message: 'Đã cập nhật câu hỏi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật câu hỏi.' });
  }
};

// POST: /Admin/MockTests/:id/Questions/:qId/Delete
controller.deleteQuestion = async (req, res) => {
  try {
    const question = await db.MockTestQuestion.findOne({
      where: { Id: req.params.qId, MockTestId: req.params.id }
    });
    if (!question) return res.json({ success: false, message: 'Không tìm thấy câu hỏi.' });
    await question.destroy();
    res.json({ success: true, message: 'Đã xoá câu hỏi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi xoá câu hỏi.' });
  }
};

module.exports = controller;
```

- [ ] **Step 2: Create the route file**

```js
// backend/src/routes/mockTestRoutes.js
const express = require('express');
const router = express.Router();
const mockTestController = require('../controllers/mockTestController');
const { requireAuth } = require('../middlewares/auth');

const MANAGE_ROLES = ['ADMIN', 'STAFF', 'TEACHER'];

router.get('/Admin/MockTests', requireAuth(MANAGE_ROLES), mockTestController.listMockTests);
router.post('/Admin/MockTests', requireAuth(MANAGE_ROLES), mockTestController.createMockTest);
router.post('/Admin/MockTests/:id', requireAuth(MANAGE_ROLES), mockTestController.updateMockTest);
router.post('/Admin/MockTests/:id/Delete', requireAuth(MANAGE_ROLES), mockTestController.deleteMockTest);
router.post('/Admin/MockTests/:id/Questions', requireAuth(MANAGE_ROLES), mockTestController.createQuestion);
router.post('/Admin/MockTests/:id/Questions/:qId', requireAuth(MANAGE_ROLES), mockTestController.updateQuestion);
router.post('/Admin/MockTests/:id/Questions/:qId/Delete', requireAuth(MANAGE_ROLES), mockTestController.deleteQuestion);

module.exports = router;
```

- [ ] **Step 3: Mount the route in `app.js`**

In `backend/src/app.js`, add next to the other route mounts (after the `notificationRoutes`/`profileRoutes` lines, before the SPA catch-all):

```js
app.use('/', require('./routes/mockTestRoutes'));
```

- [ ] **Step 4: Manual verification**

Run: `cd backend && npm run dev` (leave running), then:

```bash
curl -s -X POST http://localhost:5000/Admin/MockTests -H "Content-Type: application/json" -H "X-Requested-With: XMLHttpRequest" -d '{"grade":"Lớp 12","subject":"Toán","subjectCode":"toan","title":"Test tạm","duration":30}'
```

Expected: JSON response with `{"success":true,...}` if a valid ADMIN/TEACHER session cookie is sent, or a redirect-to-login JSON (`{"success":true,"type":"redirect",...}`) if unauthenticated — either way, no 500/stack trace. (Full auth-flow testing happens manually through the browser once FE is wired in Task 7; this step only confirms the route doesn't crash.)

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/mockTestController.js backend/src/routes/mockTestRoutes.js backend/src/app.js
git commit -m "feat: thêm API quản trị đề thi thử cho Admin/Giảng viên"
```

---

### Task 6: Seed real mock test data

**Files:**
- Modify: `backend/seed.js`

**Interfaces:**
- Consumes: `db.MockTest`, `db.MockTestQuestion` (Task 1).

- [ ] **Step 1: Add the seeding block**

Inside `seedComprehensiveData()` in `backend/seed.js`, add a new numbered section right before the final `console.log('✅ ALL 10 COURSES...')` line (after the `// 10. NOTIFICATIONS` block):

```js
    // 11. MOCK TESTS (Thi thử) — nội dung thật lấy từ MockTestPage.jsx MOCK_TESTS_DATA
    const mockTestsWithQuestions = [
      {
        grade: 'Lớp 12', subject: 'Toán', subjectCode: 'toan', coverBg: 'from-blue-600 to-indigo-700',
        title: 'Đề Kiểm Tra Toàn Diện - Đề Số 02 - Lớp 12 - Môn Toán', duration: 90,
        questions: [
          {
            content: 'Cho hàm số y = f(x) có bảng biến thiên trên đoạn [-2; 3]. Giá trị lớn nhất của hàm số f(x) trên đoạn [-2; 3] bằng bao nhiêu?',
            options: ['A. Max f(x) = 5 tại x = 1', 'B. Max f(x) = 3 tại x = 2', 'C. Max f(x) = 7 tại x = 3', 'D. Max f(x) = -1 tại x = -2'],
            correctIndex: 2,
            explanation: 'Dựa vào bảng biến thiên trên đoạn [-2; 3], ta thấy f(-2) = 1, f(1) = 5, f(3) = 7. Vậy giá trị lớn nhất của f(x) trên [-2; 3] là 7 tại x = 3.'
          },
          {
            content: 'Tích phân I = ∫[0 đến 1] (3x² + 2x + 1) dx có giá trị bằng:',
            options: ['A. 2', 'B. 3', 'C. 4', 'D. 5'],
            correctIndex: 1,
            explanation: 'Ta có F(x) = x³ + x² + x. Do đó I = F(1) - F(0) = (1 + 1 + 1) - 0 = 3.'
          },
          {
            content: 'Trong không gian Oxyz, mặt phẳng (P): 2x - y + 3z - 5 = 0 có một vectơ pháp tuyến là:',
            options: ['A. n = (2; -1; 3)', 'B. n = (2; 1; 3)', 'C. n = (2; -1; -5)', 'D. n = (-2; 1; 3)'],
            correctIndex: 0,
            explanation: 'Phương trình mặt phẳng Ax + By + Cz + D = 0 có VTPT n = (A; B; C) = (2; -1; 3).'
          }
        ]
      },
      {
        grade: 'Lớp 12', subject: 'Vật Lý', subjectCode: 'ly', coverBg: 'from-blue-600 to-indigo-700',
        title: 'Đề Kiểm Tra Toàn Diện - Đề Số 01 - Lớp 12 - Môn Vật Lý', duration: 50,
        questions: [
          {
            content: 'Một con lắc đơn có chiều dài l = 1m dao động điều hòa tại nơi có g = π² m/s². Chu kỳ dao động T của con lắc là:',
            options: ['A. 1 s', 'B. 2 s', 'C. 1.5 s', 'D. 0.5 s'],
            correctIndex: 1,
            explanation: 'Công thức T = 2π√(l/g) = 2π√(1/π²) = 2 giây.'
          }
        ]
      },
      {
        grade: 'Lớp 12', subject: 'Hóa Học', subjectCode: 'hoa', coverBg: 'from-blue-600 to-indigo-700',
        title: 'Đề Kiểm Tra Toàn Diện - Đề Số 01 - Lớp 12 - Môn Hóa Học', duration: 50,
        questions: [
          {
            content: 'Chất nào sau đây là este no, đơn chức, mạch hở?',
            options: ['A. HCOOCH₃', 'B. CH₂=CH-COOCH₃', 'C. C₆H₅COOCH₃', 'D. (HCOO)₂C₂H₄'],
            correctIndex: 0,
            explanation: 'HCOOCH₃ (Metyl fomat) có công thức C₂H₄O₂ thuộc dãy đồng đẳng este no, đơn chức, mạch hở.'
          }
        ]
      },
      {
        grade: 'Lớp 12', subject: 'Tiếng Anh', subjectCode: 'anh', coverBg: 'from-blue-600 to-indigo-700',
        title: 'Đề Kiểm Tra Toàn Diện - Lớp 12 - Đề số 01 - Môn Tiếng Anh', duration: 60,
        questions: [
          {
            content: 'Mark the letter A, B, C, or D to indicate the word whose underlined part differs from the other three in pronunciation:',
            options: ['A. published', 'B. ordered', 'C. adopted', 'D. started'],
            correctIndex: 1,
            explanation: '"ordered" kết thúc bằng âm hữu thanh nên đuôi -ed được phát âm là /d/.'
          }
        ]
      },
      {
        grade: 'Lớp 9', subject: 'Toán', subjectCode: 'toan', coverBg: 'from-blue-600 to-indigo-700',
        title: 'Tỉ Số Lượng Giác', duration: 30,
        questions: [
          {
            content: 'Trong tam giác ABC vuông tại A có AB = 3, AC = 4, BC = 5. Giá trị sin B bằng:',
            options: ['A. 4/5', 'B. 3/5', 'C. 4/3', 'D. 3/4'],
            correctIndex: 0,
            explanation: 'sin B = đối / huyền = AC / BC = 4/5.'
          }
        ]
      }
    ];

    for (const t of mockTestsWithQuestions) {
      const created = await db.MockTest.create({
        Grade: t.grade,
        Subject: t.subject,
        SubjectCode: t.subjectCode,
        CoverBg: t.coverBg,
        Title: t.title,
        Duration: t.duration,
        Status: db.MockTest.StatusMap.PUBLISHED,
        CreatedBy: admin1.Id
      });
      for (let qi = 0; qi < t.questions.length; qi++) {
        const q = t.questions[qi];
        await db.MockTestQuestion.create({
          MockTestId: created.Id,
          Content: q.content,
          Options: JSON.stringify(q.options),
          CorrectIndex: q.correctIndex,
          Explanation: q.explanation,
          Points: 1,
          SortOrder: qi
        });
      }
    }

    // Đề thuộc "mùa giải" BigMockTestPage.jsx (GAME_SESSIONS_DATA.examinations) — chỉ có metadata,
    // chưa có câu hỏi thật trong code hiện tại. Seed dạng DRAFT để Admin/Giảng viên bổ sung sau,
    // không tự bịa nội dung câu hỏi.
    const draftSeasonTests = [
      { code: 'TOAN-01', grade: 'Lớp 12', subject: 'Toán', subjectCode: 'toan', title: 'Đề số 01 - Đợt 1 - Mùa 1 (Môn Toán)', duration: 90 },
      { code: 'LY-01', grade: 'Lớp 12', subject: 'Vật Lý', subjectCode: 'ly', title: 'Đề số 01 - Đợt 1 - Mùa 1 (Môn Vật Lý)', duration: 50 },
      { code: 'HOA-01', grade: 'Lớp 12', subject: 'Hóa Học', subjectCode: 'hoa', title: 'Đề số 01 - Đợt 1 - Mùa 1 (Môn Hóa Học)', duration: 50 },
      { code: 'TOAN-02', grade: 'Lớp 12', subject: 'Toán', subjectCode: 'toan', title: 'Đề số 02 - Đợt 2 - Mùa 1 (Môn Toán)', duration: 90 },
      { code: 'LY-02', grade: 'Lớp 12', subject: 'Vật Lý', subjectCode: 'ly', title: 'Đề số 02 - Đợt 2 - Mùa 1 (Môn Vật Lý)', duration: 50 },
      { code: 'TOAN-03', grade: 'Lớp 12', subject: 'Toán', subjectCode: 'toan', title: 'Đề số 03 - Đợt 3 - Mùa 1 (Môn Toán)', duration: 90 },
      { code: 'TOAN-04', grade: 'Lớp 12', subject: 'Toán', subjectCode: 'toan', title: 'Đề số 04 - Đợt 4 - Mùa 1 (Môn Toán)', duration: 90 }
    ];
    for (const t of draftSeasonTests) {
      await db.MockTest.create({
        Grade: t.grade,
        Subject: t.subject,
        SubjectCode: t.subjectCode,
        CoverBg: 'from-blue-600 to-indigo-700',
        Title: t.title,
        Code: t.code,
        Duration: t.duration,
        Status: db.MockTest.StatusMap.DRAFT,
        CreatedBy: admin1.Id
      });
    }
```

`admin1` is the existing variable holding the first admin user created earlier in `seedComprehensiveData()` (`backend/seed.js:98`, `const admin1 = await db.User.create({...})`) — reuse it directly, it's already in scope at this point in the function.

- [ ] **Step 2: Run the seed script**

Run: `cd backend && node seed.js`
Expected: Ends with the existing `✅ ALL 10 COURSES...` success line, no errors, process exits 0.

- [ ] **Step 3: Verify via curl**

Run (with `npm run dev` running in another shell): `curl -s http://localhost:5000/Home/MockTests`
Expected: JSON array with 5 published tests (Toán/Vật Lý/Hóa/Tiếng Anh/Toán lớp 9), each with a non-zero `totalQuestions`.

- [ ] **Step 4: Commit**

```bash
git add backend/seed.js
git commit -m "feat: seed dữ liệu đề thi thử thật vào MockTest/MockTestQuestion"
```

---

### Task 7: FE wiring — `MockTestPage.jsx`

**Files:**
- Modify: `frontend/src/pages/MockTestPage.jsx`

**Interfaces:**
- Consumes: `GET /Home/MockTests`, `GET /Home/MockTests/:id`, `POST /Home/MockTests/:id/Submit`, `GET /Home/MockTests/:id/Leaderboard` (Task 4), via `frontend/src/services/api.js` (`api.get`/`api.post`, already used elsewhere in the codebase — see `DoAssignmentPage.jsx`).

- [ ] **Step 1: Replace the hardcoded `MOCK_TESTS_DATA` constant with fetched state**

Delete the `const MOCK_TESTS_DATA = [ ... ]` block (`MockTestPage.jsx:7-217`). Add near the top of `MockTestView` (after the existing `useState` declarations around line 222-237):

```js
import api from '../services/api';
// ...
const [mockTestsData, setMockTestsData] = useState([]);

useEffect(() => {
  api.get('/Home/MockTests')
    .then((res) => setMockTestsData(res.data?.data || []))
    .catch((err) => console.error('Lỗi tải danh sách đề thi:', err));
}, []);
```

- [ ] **Step 2: Update `filteredTests` and the testId-reopen effect to use `mockTestsData`, and fetch full detail on open**

Replace (around line 260):
```js
  const filteredTests = MOCK_TESTS_DATA.filter((test) => {
```
with:
```js
  const filteredTests = mockTestsData.filter((test) => {
```

Replace the reopen-after-login effect (around line 269-274):
```js
  useEffect(() => {
    const testId = new URLSearchParams(window.location.search).get('testId');
    if (testId) {
      const match = MOCK_TESTS_DATA.find((t) => String(t.id) === testId);
      if (match) setSelectedTestDetail(match);
    }
  }, []);
```
with:
```js
  useEffect(() => {
    const testId = new URLSearchParams(window.location.search).get('testId');
    if (testId) {
      api.get(`/Home/MockTests/${testId}`)
        .then((res) => { if (res.data?.data) setSelectedTestDetail(res.data.data); })
        .catch((err) => console.error('Lỗi tải đề thi:', err));
    }
  }, []);
```

And `handleOpenTestDetail` (around line 276-278) — the list item only has metadata, so fetch full detail (with questions) when opened:
```js
  const handleOpenTestDetail = (test) => {
    setSelectedTestDetail(test); // hiện ngay khung metadata trong lúc chờ tải câu hỏi
    api.get(`/Home/MockTests/${test.id}`)
      .then((res) => { if (res.data?.data) setSelectedTestDetail(res.data.data); })
      .catch((err) => console.error('Lỗi tải đề thi:', err));
  };
```

- [ ] **Step 3: Save the real result after scoring**

In `calculateAndShowResult` (around line 415-438), after `setExamResult(...)` add a fire-and-forget save (don't block the results screen on network latency; grading UX stays 100% client-side as before):

```js
  const calculateAndShowResult = () => {
    if (!activeExam) return;
    let correctCount = 0;
    activeExam.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const totalQ = activeExam.questions.length;
    const score = Number(((correctCount / totalQ) * 10).toFixed(1));
    const accuracy = Math.round((correctCount / totalQ) * 100);
    const timeSpentSeconds = activeExam.duration * 60 - timeLeft;

    setExamResult({
      score,
      correctCount,
      totalQ,
      accuracy,
      timeSpentSeconds,
      submittedAt: new Date().toLocaleTimeString('vi-VN')
    });
    setShowSubmitConfirm(false);

    const guestName = isLoggedIn ? undefined : (window.prompt('Nhập tên của bạn để lưu vào bảng xếp hạng:') || 'Khách');
    api.post(`/Home/MockTests/${activeExam.id}/Submit`, { answers: userAnswers, guestName })
      .catch((err) => console.error('Lỗi khi lưu kết quả:', err));
  };
```

- [ ] **Step 4: Wire the leaderboard to real data**

Add state near the other `useState` declarations:

```js
  const [leaderboard, setLeaderboard] = useState([]);
```

Add an effect that fetches it whenever a test detail is opened:

```js
  useEffect(() => {
    if (!selectedTestDetail?.id) { setLeaderboard([]); return; }
    api.get(`/Home/MockTests/${selectedTestDetail.id}/Leaderboard`)
      .then((res) => setLeaderboard(res.data?.data || []))
      .catch((err) => console.error('Lỗi tải bảng xếp hạng:', err));
  }, [selectedTestDetail?.id]);
```

Replace the Top-3 podium block (`MockTestPage.jsx:494-533`, the three hardcoded `<div>` blocks for rank 2/1/3) with a map over `leaderboard.slice(0, 3)`, keeping the exact existing markup/classes for each position but reading `name`/`score` from data and falling back to `'—'` when a slot is empty:

```jsx
              {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, slot) => {
                const rank = [2, 1, 3][slot];
                const sizeClass = rank === 1 ? 'w-36 -translate-y-4' : rank === 2 ? 'w-32' : 'w-32';
                const medal = rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉';
                return (
                  <div key={rank} className={`flex flex-col items-center text-center ${sizeClass}`}>
                    <div className="relative mb-2">
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl drop-shadow-sm">{medal}</span>
                      <div className="w-16 h-16 rounded-full border-2 border-slate-300 p-0.5 bg-white shadow-md overflow-hidden">
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-400 to-emerald-600 flex items-center justify-center text-white font-extrabold text-lg">
                          {entry ? entry.name.charAt(0) : '—'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 truncate w-full">{entry ? entry.name : 'Chưa có bài nộp'}</div>
                    <div className="text-xs font-black text-slate-700 mt-1.5">Tổng: <span className="text-emerald-600 font-extrabold text-sm">{entry ? `${entry.score} điểm` : '—'}</span></div>
                  </div>
                );
              })}
```

Replace the ranks-4-8 list source (`MockTestPage.jsx:537-542`):
```js
              {[
                { rank: 4, name: 'Tian Nhật Hoàng', gender: '♂', score: '10 Điểm' },
                { rank: 5, name: 'Thủyy Trangg', gender: '♀', score: '10 Điểm' },
                { rank: 6, name: 'Trần Thị Như Quỳnh', gender: '♀', score: '10 Điểm' },
                { rank: 7, name: 'Khưu Bảo', gender: '♂', score: '10 Điểm' },
                { rank: 8, name: 'Thu Huyền', gender: '♀', score: '10 Điểm' }
              ].map((user) => (
```
with:
```js
              {leaderboard.slice(3, 8).map((user) => (
```
and inside the `.map`, drop the `<span className={user.gender === ...}>` gender-icon line (no such field in real data) and change `Tổng: <strong ...>{user.score}</strong>` to `Tổng: <strong ...>{user.score} điểm</strong>`.

- [ ] **Step 5: Manual browser verification**

Run: `cd frontend && npm run dev`, then open `http://localhost:5173/Home/MockTest` (adjust port if different).
Expected: the 5 seeded tests appear (not the old 10 hardcoded ones), opening one shows its real questions, submitting shows the score screen, and reopening the same test shows the just-submitted result at the top of the leaderboard (best-effort — leaderboard sorts by score desc so a perfect score always appears; a low score may not appear in the top-8 slice if many rows exist, which is fine).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/MockTestPage.jsx
git commit -m "feat: MockTestPage lấy đề thi và bảng xếp hạng thật từ API"
```

---

### Task 8: FE wiring — `BigMockTestPage.jsx` (questions only; scoring/leaderboard descoped)

**Note on scope:** `BigMockTestPage.jsx` currently has no working scoring logic at all — `INTERACTIVE_QUESTIONS` is a fixed 2-question array shown identically for every "đợt"/exam, and there is no `correctCount`/score computation anywhere in the file (verified: no `q.correct` comparison exists). Its Top-3 podium leaderboard (`TOP3_PODIUM_USERS`) uses fields (`avatar` photo URL, `school`, `parts: [3,4,3]` a 3-part score breakdown) that don't exist in `MockTestSubmission`. Building real scoring + a parts-based leaderboard for this page would mean inventing new product behavior, not "wiring existing UI to real data" — out of scope for this plan. This task only replaces the placeholder question bank with real questions when a matching `MockTest` exists (via `Code`), so at least the exam content shown is real instead of fabricated. Fast-follow if the parts-based leaderboard is wanted later.

**Files:**
- Modify: `frontend/src/pages/BigMockTestPage.jsx`

**Interfaces:**
- Consumes: `GET /Home/MockTests` (Task 4), `frontend/src/services/api.js`.

- [ ] **Step 1: Fetch the real test list and look up by `code` when an exam is selected**

Add near the top of the component (after existing `useState` declarations around line 365-375):

```js
import api from '../services/api';
// ...
const [mockTestsByCode, setMockTestsByCode] = useState({});

useEffect(() => {
  api.get('/Home/MockTests')
    .then((res) => {
      const byCode = {};
      (res.data?.data || []).forEach((t) => { if (t.code) byCode[t.code] = t; });
      setMockTestsByCode(byCode);
    })
    .catch((err) => console.error('Lỗi tải danh sách đề thi:', err));
}, []);

const [activeQuestions, setActiveQuestions] = useState(INTERACTIVE_QUESTIONS);

useEffect(() => {
  if (!selectedExam?.code || !mockTestsByCode[selectedExam.code] || mockTestsByCode[selectedExam.code].totalQuestions === 0) {
    setActiveQuestions(INTERACTIVE_QUESTIONS); // đề DRAFT chưa có câu hỏi thật -> giữ placeholder cũ
    return;
  }
  api.get(`/Home/MockTests/${mockTestsByCode[selectedExam.code].id}`)
    .then((res) => {
      const questions = (res.data?.data?.questions || []).map((q) => ({ id: q.id, content: q.content, options: q.options, correct: q.correctIndex }));
      setActiveQuestions(questions.length > 0 ? questions : INTERACTIVE_QUESTIONS);
    })
    .catch((err) => console.error('Lỗi tải câu hỏi:', err));
}, [selectedExam, mockTestsByCode]);
```

- [ ] **Step 2: Replace the 4 `INTERACTIVE_QUESTIONS` usages with `activeQuestions`**

Lines `641`, `893`, `951`, `955`, `979` (per the earlier grep) all reference `INTERACTIVE_QUESTIONS` directly for rendering/progress-counting during an active exam session — replace each with `activeQuestions`. Leave the top-level `const INTERACTIVE_QUESTIONS = [...]` array declaration in place (it's now only the fallback default, referenced from Step 1's effect).

- [ ] **Step 3: Manual browser verification**

Run: `cd frontend && npm run dev`, open `/Home/BigMockTest` (or `/thi-thu-thpt`), select "Đợt 1" → "Đề số 01 (Môn Toán)" (`code: 'TOAN-01'`).
Expected: since `TOAN-01` was seeded as DRAFT with 0 questions (Task 6), the exam still shows the original 2 `INTERACTIVE_QUESTIONS` fallback — confirms the fallback path works without crashing. (There is no seeded code with real questions to spot-check the non-fallback path yet; that will naturally start working once an Admin/Teacher publishes real questions for one of these codes through the Task 5 API.)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/BigMockTestPage.jsx
git commit -m "feat: BigMockTestPage lấy câu hỏi thật theo mã đề khi có, giữ fallback cũ"
```

---

## Self-Review Notes

- **Spec coverage:** Data model (Task 1-2) ✓, public API (Task 4) ✓, admin/teacher CRUD (Task 5) ✓, seed (Task 6) ✓, FE wiring MockTestPage (Task 7) ✓, FE wiring BigMockTestPage questions (Task 8, explicitly descoped: podium leaderboard) ✓, test (Task 3) ✓, `ponytail:` known-limitation comment for anonymous-submit spam — added below.
- **Known limitation to flag in code:** anonymous submissions have no rate limiting. Add this one-line comment above the `submitMockTest` handler when implementing Task 4 Step 4:
  ```js
  // ponytail: không chống spam nộp bài ẩn danh (IP throttle) — thêm nếu bảng xếp hạng bị lạm dụng
  ```
