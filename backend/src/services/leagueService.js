// Dữ liệu cho trang "Thách đấu": tháp theo khối, số liệu theo môn và bảng xếp hạng đấu sĩ.
// Khối + môn suy ra từ mã khóa học (TOAN10 -> Toán, khối 10). Điểm xếp hạng chỉ tính bài nộp lần đầu đã có điểm
// (cùng quy tắc "điểm chính thức" của hệ thống), nên làm lại để luyện tập không đổi thứ hạng.
const db = require('../models');

const SUBJECTS = {
  TOAN: 'Toán học', ANH: 'Tiếng Anh', VAN: 'Ngữ văn', LY: 'Vật lý', HOA: 'Hóa học', SINH: 'Sinh học', SU: 'Lịch sử', DIA: 'Địa lý', TIN: 'Tin học'
};
const SUBJECT_ORDER = Object.keys(SUBJECTS);

// 'TOAN12' -> { subject: 'TOAN', name: 'Toán học', grade: 12 }; mã lạ -> null
function parseCourseCode(code) {
  const m = /^([A-Z]+)\s*-?(\d{1,2})$/.exec(String(code || '').toUpperCase().trim());
  if (!m || !SUBJECTS[m[1]]) return null;
  const grade = parseInt(m[2], 10);
  return grade >= 6 && grade <= 12 ? { subject: m[1], name: SUBJECTS[m[1]], grade } : null;
}

// Công khai tên đấu sĩ ở dạng rút gọn: "Nguyễn Bá Quyền" -> "Nguyễn B. Quyền".
function maskName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return parts.join(' ') || 'Ẩn danh';
  return [parts[0], ...parts.slice(1, -1).map((p) => `${p[0].toUpperCase()}.`), parts[parts.length - 1]].join(' ');
}

// Đếm số câu hỏi trong QuizData (trắc nghiệm / đúng-sai là mảng; đề tổng hợp là {quiz,tf,essay}).
function countQuestions(quizData) {
  try {
    const d = JSON.parse(quizData || '[]');
    if (Array.isArray(d)) return d.length;
    return ['quiz', 'tf', 'essay'].reduce((n, k) => n + (Array.isArray(d[k]) ? d[k].length : 0), 0);
  } catch (e) {
    return 0;
  }
}

// rows: [{ studentId, name, grade (điểm), course: {subject, grade} }] -> xếp hạng theo tổng điểm
function aggregateRanking(rows, { grade, subject, limit = 50 } = {}) {
  const by = new Map();
  rows.forEach((r) => {
    if (!r.course || r.points == null) return;
    if (grade && r.course.grade !== grade) return;
    if (subject && r.course.subject !== subject) return;
    const cur = by.get(r.studentId) || { studentId: r.studentId, name: r.name, points: 0, attempts: 0 };
    cur.points += Number(r.points);
    cur.attempts += 1;
    by.set(r.studentId, cur);
  });
  return [...by.values()]
    .map((s) => ({ ...s, points: Math.round(s.points * 10) / 10, avg: Math.round((s.points / s.attempts) * 10) / 10 }))
    .sort((a, b) => b.points - a.points || b.avg - a.avg || a.name.localeCompare(b.name, 'vi'))
    .slice(0, limit)
    .map((s, i) => ({ rank: i + 1, name: maskName(s.name), points: s.points, attempts: s.attempts, avg: s.avg }));
}

const cache = new Map();
async function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.data;
  const data = await fn();
  cache.set(key, { data, exp: Date.now() + ttlMs });
  return data;
}

const loadAssignments = () => db.Assignment.findAll({
  where: { Status: db.Assignment.StatusMap.PUBLISHED },
  attributes: ['Id', 'QuizData'],
  include: [{ model: db.Lesson, as: 'Lesson', attributes: ['Id'], include: [{ model: db.Class, as: 'Class', attributes: ['Id'], include: [{ model: db.Course, as: 'Course', attributes: ['CourseCode'] }] }] }]
});

const loadScored = () => db.Submission.findAll({
  where: { AttemptNumber: 1, Grade: { [db.Sequelize.Op.ne]: null } },
  attributes: ['StudentId', 'Grade'],
  include: [
    { model: db.User, as: 'Student', attributes: ['FullName'] },
    { model: db.Assignment, as: 'Assignment', attributes: ['Id'], include: [{ model: db.Lesson, as: 'Lesson', attributes: ['Id'], include: [{ model: db.Class, as: 'Class', attributes: ['Id'], include: [{ model: db.Course, as: 'Course', attributes: ['CourseCode'] }] }] }] }
  ]
});

const courseOf = (assignment) => parseCourseCode(assignment && assignment.Lesson && assignment.Lesson.Class && assignment.Lesson.Class.Course && assignment.Lesson.Class.Course.CourseCode);

exports.getOverview = () => cached('overview', 60 * 1000, async () => {
  const [assignments, scored] = await Promise.all([loadAssignments(), loadScored()]);
  const grades = {}; const subjects = {};
  let totalQuestions = 0;
  assignments.forEach((a) => {
    const c = courseOf(a);
    if (!c) return;
    const q = countQuestions(a.QuizData);
    totalQuestions += q;
    const g = (grades[c.grade] = grades[c.grade] || { grade: c.grade, subjects: new Set(), questions: 0, exams: 0, players: new Set() });
    g.subjects.add(c.subject); g.questions += q; g.exams += 1;
    const s = (subjects[c.subject] = subjects[c.subject] || { key: c.subject, name: c.name, questions: 0, exams: 0 });
    s.questions += q; s.exams += 1;
  });
  const players = new Set();
  scored.forEach((r) => {
    const c = courseOf(r.Assignment);
    if (!c) return;
    players.add(r.StudentId);
    if (grades[c.grade]) grades[c.grade].players.add(r.StudentId);
  });
  return {
    totalQuestions,
    totalExams: assignments.length,
    totalPlayers: players.size,
    towers: Object.values(grades).sort((a, b) => b.grade - a.grade).map((g) => ({
      grade: g.grade,
      subjects: [...g.subjects].sort((a, b) => SUBJECT_ORDER.indexOf(a) - SUBJECT_ORDER.indexOf(b)).map((k) => ({ key: k, name: SUBJECTS[k] })),
      questions: g.questions, exams: g.exams, players: g.players.size
    })),
    subjects: Object.values(subjects).sort((a, b) => SUBJECT_ORDER.indexOf(a.key) - SUBJECT_ORDER.indexOf(b.key))
  };
});

exports.getRanking = ({ grade, subject, limit = 50 }) => cached(`ranking:${grade || ''}:${subject || ''}:${limit}`, 30 * 1000, async () => {
  const scored = await loadScored();
  const rows = scored.map((r) => ({ studentId: r.StudentId, name: r.Student && r.Student.FullName, points: r.Grade, course: courseOf(r.Assignment) }));
  return aggregateRanking(rows, { grade, subject, limit });
});

exports.parseCourseCode = parseCourseCode;
exports.maskName = maskName;
exports.countQuestions = countQuestions;
exports.aggregateRanking = aggregateRanking;
exports.SUBJECTS = SUBJECTS;
