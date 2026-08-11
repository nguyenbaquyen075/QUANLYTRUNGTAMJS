const homeService = require('../services/homeService');
const db = require('../models');
const { computeMockTestScore } = require('../services/mockTestService');

// GET: / (Home Page)
exports.getHome = async (req, res) => {
  try {
    const courses = await homeService.getFeaturedCourses(4);
    const teachers = await homeService.getActiveTeachers(5);
    res.render('home/index', { courses, teachers, layout: false });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi máy chủ.' });
  }
};

// GET: /Home/Courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await homeService.getAllActiveCourses();
    res.render('home/courses', { courses, layout: false });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi máy chủ.' });
  }
};

// GET: /Home/Teachers
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await homeService.getAllActiveTeachers();
    res.render('home/teachers', { teachers, layout: false });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang đội ngũ giáo viên.' });
  }
};

// GET: /Home/News
exports.getNews = (req, res) => {
  res.render('home/news', { layout: false });
};

// GET: /Home/Documents
exports.getDocuments = (req, res) => {
  res.render('home/documents', { layout: false });
};

// GET: /Home/Privacy
exports.getPrivacy = (req, res) => {
  res.render('home/privacy');
};

// GET: /Home/Data (React homepage REST API)
exports.getHomeData = async (req, res) => {
  try {
    const [courses, teachers, stats, upcomingSchedule] = await Promise.all([
      homeService.getAllActiveCourses(),
      homeService.getActiveTeachers(5),
      homeService.getHomeStats(),
      homeService.getUpcomingSchedule(4)
    ]);
    res.json({
      success: true,
      data: {
        courses,
        teachers,
        stats,
        upcomingSchedule
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải dữ liệu trang chủ.' });
  }
};

// GET: /Home/MockTestData (React mock test platform REST API)
exports.getMockTestData = async (req, res) => {
  try {
    const subjects = [
      { id: 'all', name: 'Tất cả các môn', icon: '📚' },
      { id: 'toan', name: 'Toán Học', icon: '📐' },
      { id: 'ly', name: 'Vật Lý', icon: '⚡' },
      { id: 'hoa', name: 'Hóa Học', icon: '🧪' },
      { id: 'anh', name: 'Tiếng Anh', icon: '🌐' },
      { id: 'dgnl', name: 'Đánh Giá Năng Lực', icon: '🎯' },
      { id: 'van', name: 'Ngữ Văn', icon: '✍️' }
    ];

    res.json({
      success: true,
      data: {
        subjects,
        stats: {
          totalTests: 1250,
          totalSubmissions: 154200,
          averageScore: 7.8,
          activeContests: 3
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải dữ liệu thi thử.' });
  }
};

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
      totalQuestions: test.Questions.length,
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

// ponytail: không chống spam nộp bài ẩn danh (IP throttle) — thêm nếu bảng xếp hạng bị lạm dụng
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

// GET: /Home/SiteContent (React public site content REST API)
exports.getSiteContent = async (req, res) => {
  try {
    const content = await homeService.getSiteContent();
    res.json({ success: true, data: content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải nội dung trang.' });
  }
};

