const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models');
const { requireAuth } = require('../middleware/auth');
const { sendNotificationToUser } = require('../sockets/signalRCompat');

// Multer Config for Homework uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../../quanlytrungtam/wwwroot/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Math.random().toString(36).substring(2) + '_' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// GET: /Student/Dashboard
router.get('/Student/Dashboard', requireAuth(['STUDENT']), async (req, res) => {
  const studentId = req.session.userId;

  try {
    // Get class enrollments
    const enrollments = await db.ClassStudent.findAll({
      include: [{
        model: db.Class,
        as: 'Class',
        include: [{ model: db.Course, as: 'Course' }, { model: db.User, as: 'Teacher' }]
      }],
      where: { StudentId: studentId, Status: db.ClassStudent.StatusMap.LEARNING }
    });

    const classIds = enrollments.map(e => e.ClassId);

    // Get lessons of classes
    const lessons = await db.Lesson.findAll({
      include: [{ model: db.Class, as: 'Class' }],
      where: { ClassId: classIds },
      order: [['LessonDate', 'ASC'], ['StartTime', 'ASC']]
    });

    // Get assignments
    const assignments = await db.Assignment.findAll({
      include: [{ model: db.Lesson, as: 'Lesson', include: [{ model: db.Class, as: 'Class' }] }],
      where: {
        '$Lesson.ClassId$': classIds
      }
    });

    // Get submissions
    const submissions = await db.Submission.findAll({
      include: [{ model: db.Assignment, as: 'Assignment', include: [{ model: db.Lesson, as: 'Lesson' }] }],
      where: { StudentId: studentId }
    });

    const submittedIds = submissions.map(s => s.AssignmentId);

    // All active courses for manual registration links
    const allCourses = await db.Course.findAll({
      where: { Status: db.Course.StatusMap.ACTIVE }
    });

    // Get attendances
    const attendances = await db.Attendance.findAll({
      include: [{ model: db.Lesson, as: 'Lesson' }],
      where: { StudentId: studentId }
    });

    // AI learning profile and recommendations
    const userProfile = await db.UserLearningProfile.findOne({
      where: { StudentId: studentId }
    });

    let recommendations = [];
    if (userProfile && userProfile.WeakAreas) {
      // Find courses that are active and not currently enrolled in
      recommendations = await db.Course.findAll({
        where: {
          Status: db.Course.StatusMap.ACTIVE,
          Id: {
            [db.Sequelize.Op.notIn]: db.sequelize.literal(`(
              SELECT "Classes"."CourseId"
              FROM "ClassStudents"
              INNER JOIN "Classes" ON "ClassStudents"."ClassId" = "Classes"."Id"
              WHERE "ClassStudents"."StudentId" = ${studentId} AND "ClassStudents"."Status" = ${db.ClassStudent.StatusMap.LEARNING}
            )`)
          }
        },
        limit: 2
      });
    } else {
      recommendations = await db.Course.findAll({
        where: { Status: db.Course.StatusMap.ACTIVE },
        limit: 1
      });
    }

    res.render('student/dashboard', {
      enrollments,
      lessons,
      assignments,
      submissions,
      submittedIds,
      allCourses,
      attendances,
      userProfile,
      aiRecommendations: recommendations
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang dashboard của học sinh.' });
  }
});

// GET: /Student/Classroom/:id
router.get('/Student/Classroom/:id', requireAuth(['STUDENT']), async (req, res) => {
  const classId = parseInt(req.params.id);
  const studentId = req.session.userId;

  try {
    const enrollment = await db.ClassStudent.findOne({
      where: { ClassId: classId, StudentId: studentId }
    });

    if (!enrollment) {
      return res.redirect('/Student/Dashboard');
    }

    const cls = await db.Class.findByPk(classId, {
      include: [
        { model: db.Course, as: 'Course' },
        { model: db.User, as: 'Teacher' }
      ]
    });

    const lessons = await db.Lesson.findAll({
      where: { ClassId: classId },
      order: [['LessonDate', 'ASC']]
    });

    const lessonIds = lessons.map(l => l.Id);
    const assignments = await db.Assignment.findAll({
      where: { LessonId: lessonIds }
    });

    const submissionList = await db.Submission.findAll({
      where: { StudentId: studentId, AssignmentId: assignments.map(a => a.Id) }
    });

    const submissions = {};
    submissionList.forEach(s => {
      submissions[s.AssignmentId] = s;
    });

    res.render('student/classroom', {
      Class: cls,
      lessons,
      assignments,
      submissions
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải lớp học.' });
  }
});

// GET: /Student/DoAssignment/:id
router.get('/Student/DoAssignment/:id', requireAuth(['STUDENT']), async (req, res) => {
  const assignmentId = parseInt(req.params.id);
  const studentId = req.session.userId;

  try {
    const assignment = await db.Assignment.findByPk(assignmentId, {
      include: [{ model: db.Lesson, as: 'Lesson' }]
    });

    if (!assignment) {
      return res.status(404).render('error', { message: 'Không tìm thấy bài tập.' });
    }

    const existingSubmission = await db.Submission.findOne({
      where: { AssignmentId: assignmentId, StudentId: studentId }
    });

    if (existingSubmission) {
      req.session.errorMessage = 'Bạn đã nộp bài tập này rồi!';
      return res.redirect(`/Student/Classroom/${assignment.Lesson.ClassId}`);
    }

    res.render('student/doAssignment', { assignment });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang làm bài.' });
  }
});

// POST: /Student/SubmitAssignment
router.post('/Student/SubmitAssignment', requireAuth(['STUDENT']), async (req, res) => {
  const { assignmentId, content, fileUrl } = req.body;
  const studentId = req.session.userId;

  try {
    const assignment = await db.Assignment.findByPk(assignmentId, {
      include: [{ model: db.Lesson, as: 'Lesson' }]
    });

    if (!assignment) {
      req.session.errorMessage = 'Không tìm thấy bài tập.';
      return res.redirect('/Student/Dashboard');
    }

    const existingSubmission = await db.Submission.findOne({
      where: { AssignmentId: assignmentId, StudentId: studentId }
    });

    if (existingSubmission) {
      req.session.errorMessage = 'Bạn đã nộp bài tập này rồi!';
      return res.redirect(`/Student/Classroom/${assignment.Lesson.ClassId}`);
    }

    let grade = null;
    let comment = null;

    // Check if QUIZ assignment - AI Automatic Grading
    if (assignment.AssignmentType === db.Assignment.TypeMap.QUIZ) {
      try {
        const studentAnswers = JSON.parse(content || '[]');
        const quizData = JSON.parse(assignment.QuizData || '[]');
        let correctCount = 0;

        quizData.forEach((q, idx) => {
          if (studentAnswers[idx] === q.correct_index) {
            correctCount++;
          }
        });

        grade = quizData.length > 0 ? (correctCount / quizData.length) * 10.0 : 0.0;
        comment = `[Hệ thống AI tự động chấm]: Đúng ${correctCount}/${quizData.length} câu hỏi trắc nghiệm.`;
      } catch (err) {
        console.error('Quiz grading error:', err);
        grade = 0.0;
        comment = 'Lỗi hệ thống chấm điểm tự động.';
      }
    }

    const submission = await db.Submission.create({
      AssignmentId: assignmentId,
      StudentId: studentId,
      SubmittedAt: new Date(),
      Content: content || '',
      FileUrl: fileUrl || null,
      Grade: grade,
      TeacherComment: comment,
      GradedAt: grade !== null ? new Date() : null
    });

    // Notify Student if auto-graded
    if (grade !== null) {
      const notifStudent = await db.Notification.create({
        UserId: studentId,
        Title: 'Bài tập đã được chấm điểm',
        Content: `Bài tập trắc nghiệm '${assignment.Title}' của bạn đã được hệ thống AI chấm điểm tự động. Điểm số: ${grade.toFixed(1)}.`,
        LinkUrl: '/Student/Dashboard',
        CreatedAt: new Date()
      });

      const createdAtStr = new Date(notifStudent.CreatedAt).toLocaleDateString('vi-VN') + ' ' + new Date(notifStudent.CreatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      sendNotificationToUser(studentId, {
        title: notifStudent.Title,
        content: notifStudent.Content,
        linkUrl: notifStudent.LinkUrl,
        createdAt: createdAtStr
      });
    }

    req.session.successMessage = 'Đã nộp bài tập thành công!';
    res.redirect(`/Student/Classroom/${assignment.Lesson.ClassId}`);
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Lỗi khi nộp bài tập.';
    res.redirect('/Student/Dashboard');
  }
});

// POST: /Student/UploadFile
router.post('/Student/UploadFile', requireAuth(['STUDENT']), upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.json({ success: false, message: 'File không hợp lệ hoặc trống.' });
  }
  const fileUrl = '/uploads/' + req.file.filename;
  res.json({ success: true, fileUrl: fileUrl });
});

// GET: /Student/Report
router.get('/Student/Report', requireAuth(['STUDENT']), async (req, res) => {
  // Simple view redirect to student dashboard overview
  res.redirect('/Student/Dashboard');
});

module.exports = router;
