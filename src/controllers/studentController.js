const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models');
const { requireAuth } = require('../middleware/auth');
const { sendNotificationToUser } = require('../sockets/signalRCompat');
const { uploadToCloud } = require('../utils/cloudinary');

// Multer Config for Homework uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../../public/uploads');
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
    // Get class enrollments first, because we need classIds for lessons and assignments
    const enrollments = await db.ClassStudent.findAll({
      include: [{
        model: db.Class,
        as: 'Class',
        include: [{ model: db.Course, as: 'Course' }, { model: db.User, as: 'Teacher' }]
      }],
      where: { StudentId: studentId, Status: db.ClassStudent.StatusMap.LEARNING }
    });

    const classIds = enrollments.map(e => e.ClassId);

    // Fetch all other student data in parallel
    const [
      lessons,
      assignments,
      submissions,
      allCourses,
      attendances,
      userProfile
    ] = await Promise.all([
      db.Lesson.findAll({
        include: [{ model: db.Class, as: 'Class' }],
        where: { ClassId: classIds },
        order: [['LessonDate', 'ASC'], ['StartTime', 'ASC']]
      }),
      db.Assignment.findAll({
        include: [{ model: db.Lesson, as: 'Lesson', include: [{ model: db.Class, as: 'Class' }] }],
        where: { '$Lesson.ClassId$': classIds }
      }),
      db.Submission.findAll({
        include: [{ model: db.Assignment, as: 'Assignment', include: [{ model: db.Lesson, as: 'Lesson' }] }],
        where: { StudentId: studentId }
      }),
      db.Course.findAll({
        where: { Status: db.Course.StatusMap.ACTIVE }
      }),
      db.Attendance.findAll({
        include: [{ model: db.Lesson, as: 'Lesson' }],
        where: { StudentId: studentId }
      }),
      db.UserLearningProfile.findOne({
        where: { StudentId: studentId }
      })
    ]);

    const submittedIds = submissions.map(s => s.AssignmentId);

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

    // Build a Set of lessonIds where this student has VideoAccess (Present, Late, or manually granted)
    const attendedLessonIds = new Set(
      attendances
        .filter(a => a.VideoAccess === true)
        .map(a => a.LessonId)
    );

    // Annotate each lesson with IsAttended
    lessons.forEach(l => {
      l.IsAttended = attendedLessonIds.has(l.Id);
    });

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

    // Parallelize core loading of classroom, lessons, assignments, and studentCount
    const [cls, lessons, assignments, studentCount] = await Promise.all([
      db.Class.findByPk(classId, {
        include: [
          { model: db.Course, as: 'Course' },
          { model: db.User, as: 'Teacher' }
        ]
      }),
      db.Lesson.findAll({
        where: { ClassId: classId },
        order: [['LessonDate', 'ASC']]
      }),
      db.Assignment.findAll({
        include: [{ model: db.Lesson, as: 'Lesson' }],
        where: { '$Lesson.ClassId$': classId }
      }),
      db.ClassStudent.count({
        where: { ClassId: classId }
      })
    ]);

    // Query submissions based on the loaded assignments
    const submissionList = await db.Submission.findAll({
      where: { StudentId: studentId, AssignmentId: assignments.map(a => a.Id) }
    });

    const submissions = {};
    submissionList.forEach(s => {
      submissions[s.AssignmentId] = s;
    });

    // Fetch attendance records for this student in this class
    const lessonIds = lessons.map(l => l.Id);
    const classroomAttendances = lessonIds.length > 0 ? await db.Attendance.findAll({
      where: {
        StudentId: studentId,
        LessonId: lessonIds
      }
    }) : [];

    const attendedLessonIds = new Set(
      classroomAttendances.filter(a => a.VideoAccess === true).map(a => a.LessonId)
    );

    // Annotate each lesson with IsAttended flag
    lessons.forEach(l => {
      l.IsAttended = attendedLessonIds.has(l.Id);
    });

    res.render('student/classroom', {
      Class: cls,
      lessons,
      assignments,
      submissions,
      studentCount
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

    let grade = null;
    let comment = null;

    // Check if QUIZ assignment - AI Automatic Grading
    if (assignment.AssignmentType === db.Assignment.TypeMap.QUIZ) {
      try {
        const studentAnswers = JSON.parse(content || '[]');
        const quizData = JSON.parse(assignment.QuizData || '[]');
        let totalMaxPoints = 0;
        let totalCorrectPoints = 0;
        let correctCount = 0;

        quizData.forEach((q, idx) => {
          const pt = parseFloat(q.points) || 1;
          totalMaxPoints += pt;
          if (studentAnswers[idx] === q.correct_index) {
            correctCount++;
            totalCorrectPoints += pt;
          }
        });

        grade = totalMaxPoints > 0 ? (totalCorrectPoints / totalMaxPoints) * 10.0 : 0.0;
        comment = `[Hệ thống AI tự động chấm]: Đúng ${correctCount}/${quizData.length} câu hỏi trắc nghiệm. Điểm số: ${grade.toFixed(1)}/10.`;
      } catch (err) {
        console.error('Quiz grading error:', err);
        grade = 0.0;
        comment = 'Lỗi hệ thống chấm điểm tự động.';
      }
    } else if (assignment.AssignmentType === db.Assignment.TypeMap.TRUE_FALSE) {
      try {
        const studentAnswers = JSON.parse(content || '[]');
        const tfData = JSON.parse(assignment.QuizData || '[]');
        let totalMaxPoints = 0;
        let totalCorrectPoints = 0;
        let correctSubItems = 0;
        let totalSubItems = 0;

        tfData.forEach((q, idx) => {
          if (q.items) {
            ['a', 'b', 'c', 'd'].forEach((letter, ii) => {
              if (q.items[ii]) {
                const subPt = parseFloat(q.items[ii].points !== undefined ? q.items[ii].points : 0.25);
                totalMaxPoints += subPt;
                totalSubItems++;
                const studentAns = studentAnswers[idx] ? studentAnswers[idx][letter] : null;
                if (studentAns === q.items[ii].answer) {
                  correctSubItems++;
                  totalCorrectPoints += subPt;
                }
              }
            });
          }
        });

        grade = totalMaxPoints > 0 ? (totalCorrectPoints / totalMaxPoints) * 10.0 : 0.0;
        comment = `[Hệ thống AI tự động chấm]: Đúng ${correctSubItems}/${totalSubItems} ý Đúng/Sai. Điểm số: ${grade.toFixed(1)}/10.`;
      } catch (err) {
        console.error('TF grading error:', err);
        grade = 0.0;
        comment = 'Lỗi hệ thống chấm điểm tự động.';
      }
    } else if (assignment.AssignmentType === db.Assignment.TypeMap.EXAM) {
      try {
        const studentAnswers = JSON.parse(content || '{}');
        const examData = JSON.parse(assignment.QuizData || '{}');
        const hasEssay = (examData.essay && examData.essay.length > 0);

        if (!hasEssay) {
          let totalMaxPoints = 0;
          let totalCorrectPoints = 0;
          let correctQuiz = 0;
          let totalQuiz = 0;
          let correctTF = 0;
          let totalTF = 0;

          if (examData.quiz) {
            examData.quiz.forEach((q, idx) => {
              const pt = parseFloat(q.points) || 1;
              totalMaxPoints += pt;
              totalQuiz++;
              const studentAns = studentAnswers.quiz ? studentAnswers.quiz[idx] : null;
              if (studentAns === q.correct_index) {
                correctQuiz++;
                totalCorrectPoints += pt;
              }
            });
          }

          if (examData.tf) {
            examData.tf.forEach((q, idx) => {
              if (q.items) {
                ['a', 'b', 'c', 'd'].forEach((letter, ii) => {
                  if (q.items[ii]) {
                    const subPt = parseFloat(q.items[ii].points !== undefined ? q.items[ii].points : 0.25);
                    totalMaxPoints += subPt;
                    totalTF++;
                    const studentAns = (studentAnswers.tf && studentAnswers.tf[idx]) ? studentAnswers.tf[idx][letter] : null;
                    if (studentAns === q.items[ii].answer) {
                      correctTF++;
                      totalCorrectPoints += subPt;
                    }
                  }
                });
              }
            });
          }

          grade = totalMaxPoints > 0 ? (totalCorrectPoints / totalMaxPoints) * 10.0 : 0.0;
          comment = `[Hệ thống tự động chấm]: Đúng ${correctQuiz}/${totalQuiz} câu trắc nghiệm, ${correctTF}/${totalTF} ý Đúng/Sai. Điểm số: ${grade.toFixed(1)}/10.`;
        } else {
          grade = null;
          comment = null;
        }
      } catch (err) {
        console.error('Exam auto grading error:', err);
        grade = null;
        comment = null;
      }
    }

    if (existingSubmission) {
      // Redo: Update content/fileUrl and submitted timestamp.
      // Keeping the first attempt's grade as per requirements.
      const updateData = {
        Content: content || '',
        FileUrl: fileUrl || null,
        SubmittedAt: new Date()
      };

      // Do NOT update Grade, TeacherComment, or GradedAt. This ensures the grade 
      // of the first attempt (whether auto-graded or graded by the teacher) is preserved.
      await existingSubmission.update(updateData);
    } else {
      // First submission: Create submission with grade
      await db.Submission.create({
        AssignmentId: assignmentId,
        StudentId: studentId,
        SubmittedAt: new Date(),
        Content: content || '',
        FileUrl: fileUrl || null,
        Grade: grade,
        TeacherComment: comment,
        GradedAt: grade !== null ? new Date() : null
      });

      // Simple success notification
      const notifStudent = await db.Notification.create({
        UserId: studentId,
        Title: 'Nộp bài tập thành công',
        Content: `Bạn đã nộp bài tập '${assignment.Title}' thành công.`,
        LinkUrl: assignment.AssignmentType === db.Assignment.TypeMap.QUIZ
          ? '/Student/Dashboard#quizzes'
          : '/Student/Dashboard#assignments',
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

    req.session.successMessage = 'Nộp bài tập thành công!';
    res.redirect(`/Student/Classroom/${assignment.Lesson.ClassId}`);
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Lỗi khi nộp bài tập.';
    res.redirect('/Student/Dashboard');
  }
});

// POST: /Student/UploadFile
router.post('/Student/UploadFile', requireAuth(['STUDENT']), upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.json({ success: false, message: 'File không hợp lệ hoặc trống.' });
  }
  try {
    const cloudinaryUrl = await uploadToCloud(req.file.path, 'submissions');
    const fileUrl = cloudinaryUrl || '/uploads/' + req.file.filename;
    res.json({ success: true, fileUrl: fileUrl });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Lỗi hệ thống khi tải file lên.' });
  }
});

// GET: /Student/Report
router.get('/Student/Report', requireAuth(['STUDENT']), async (req, res) => {
  // Simple view redirect to student dashboard overview
  res.redirect('/Student/Dashboard');
});

// GET: /Student/AssignmentLeaderboard/:id
router.get('/Student/AssignmentLeaderboard/:id', requireAuth(['STUDENT']), async (req, res) => {
  const assignmentId = parseInt(req.params.id);
  const studentId = req.session.userId;

  try {
    const assignment = await db.Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    }

    // Fetch all submissions for this assignment
    const allSubmissions = await db.Submission.findAll({
      where: { AssignmentId: assignmentId },
      include: [{ model: db.User, as: 'Student', attributes: ['FullName'] }],
      order: [
        ['Grade', 'DESC'],
        ['SubmittedAt', 'ASC']
      ]
    });

    let studentRank = -1;
    let studentScore = null;

    // Find if student has already submitted
    const existing = allSubmissions.find(s => s.StudentId === studentId);

    let simulatedScore = req.query.simulatedScore ? parseFloat(req.query.simulatedScore) : null;
    let scoreToCompare = existing ? existing.Grade : simulatedScore;

    // Create rank list
    let listForRanking = allSubmissions.map(s => ({
      studentId: s.StudentId,
      fullName: s.Student.FullName,
      grade: s.Grade,
      submittedAt: s.SubmittedAt
    }));

    if (!existing && scoreToCompare !== null) {
      const studentUser = await db.User.findByPk(studentId);
      listForRanking.push({
        studentId: studentId,
        fullName: studentUser ? studentUser.FullName : 'Bạn',
        grade: scoreToCompare,
        submittedAt: new Date()
      });
    }

    // Sort listForRanking by grade DESC, then submittedAt ASC
    listForRanking.sort((a, b) => {
      if (b.grade !== a.grade) return b.grade - a.grade;
      return new Date(a.submittedAt) - new Date(b.submittedAt);
    });

    listForRanking.forEach((item, idx) => {
      if (item.studentId === studentId) {
        studentRank = idx + 1;
        studentScore = item.grade;
      }
    });

    const top3 = listForRanking.slice(0, 3);

    res.json({
      success: true,
      rank: studentRank,
      total: listForRanking.length,
      myScore: studentScore,
      top3: top3
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
