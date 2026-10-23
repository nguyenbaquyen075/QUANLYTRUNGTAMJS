// Thay câu hỏi mẫu cũ (sinh tự động, vô nghĩa, đáp án lưu sai dạng) bằng ngân hàng câu hỏi thật ở src/utils/sampleQuestions.js.
// Chỉ đụng tới các bài do seed tạo ("Bài kiểm tra 15 câu trắc nghiệm - …", "Bài tập tự luận 15 câu - …"), bài giáo viên tự giao giữ nguyên.
// Chỉ chạy với cơ sở dữ liệu ở máy:  node backend/scripts/refresh-sample-questions.js
if (process.env.DATABASE_URL) {
  console.error('Từ chối: đang trỏ tới cơ sở dữ liệu thật (DATABASE_URL).');
  process.exit(1);
}
const db = require('../src/models');
const { quizFor, essayFor } = require('../src/utils/sampleQuestions');
const { Op } = db.Sequelize;

async function run() {
  const rows = await db.Assignment.findAll({
    where: { [Op.or]: [{ Title: { [Op.like]: 'Bài kiểm tra 15 câu trắc nghiệm - %' } }, { Title: { [Op.like]: 'Bài tập tự luận 15 câu - %' } }] },
    include: [{ model: db.Lesson, as: 'Lesson', include: [{ model: db.Class, as: 'Class', include: [{ model: db.Course, as: 'Course' }] }] }]
  });
  let quiz = 0; let essay = 0;
  for (const a of rows) {
    const course = a.Lesson && a.Lesson.Class && a.Lesson.Class.Course;
    if (!course) continue;
    if (a.AssignmentType === db.Assignment.TypeMap.QUIZ) {
      const questions = quizFor(course.Title);
      a.Title = a.Title.replace('Bài kiểm tra 15 câu trắc nghiệm - ', 'Bài kiểm tra trắc nghiệm - ');
      a.Instruction = `Bài kiểm tra gồm ${questions.length} câu trắc nghiệm. Học sinh làm trực tiếp trên giao diện và nộp bài để xem điểm tức thì.`;
      a.QuizData = JSON.stringify(questions);
      quiz++;
    } else {
      a.Title = a.Title.replace('Bài tập tự luận 15 câu - ', 'Bài tập tự luận - ');
      a.Instruction = essayFor(course.Title);
      essay++;
    }
    await a.save();
  }
  console.log(`Đã cập nhật ${quiz} bài trắc nghiệm và ${essay} bài tự luận mẫu.`);
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
