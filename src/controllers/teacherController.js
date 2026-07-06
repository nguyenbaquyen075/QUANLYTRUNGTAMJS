const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models');
const { requireAuth } = require('../middleware/auth');
const { sendNotificationToUser } = require('../sockets/signalRCompat');

// Multer storage setup for teacher homework/assignment attachments
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

// GET: /Teacher/Dashboard
router.get('/Teacher/Dashboard', requireAuth(['TEACHER']), async (req, res) => {
  const teacherId = req.session.userId;

  try {
    // Get teacher classes
    const classes = await db.Class.findAll({
      include: [{ model: db.Course, as: 'Course' }],
      where: { TeacherId: teacherId }
    });

    const classIds = classes.map(c => c.Id);

    // Get lessons count and student count for each class
    const lessonsCount = await db.Lesson.findAll({
      attributes: ['ClassId', [db.Sequelize.fn('COUNT', db.Sequelize.col('Id')), 'count']],
      where: { ClassId: classIds },
      group: ['ClassId']
    });

    const studentCounts = await db.ClassStudent.findAll({
      attributes: ['ClassId', [db.Sequelize.fn('COUNT', db.Sequelize.col('Id')), 'count']],
      where: { ClassId: classIds, Status: db.ClassStudent.StatusMap.LEARNING },
      group: ['ClassId']
    });

    const classLessonsMap = {};
    lessonsCount.forEach(item => {
      classLessonsMap[item.ClassId] = parseInt(item.get('count')) || 0;
    });

    const classStudentsMap = {};
    studentCounts.forEach(item => {
      classStudentsMap[item.ClassId] = parseInt(item.get('count')) || 0;
    });

    // Get all lessons for these classes to display on scheduler
    const lessons = await db.Lesson.findAll({
      include: [{ model: db.Class, as: 'Class' }],
      where: { ClassId: classIds },
      order: [['LessonDate', 'ASC'], ['StartTime', 'ASC']]
    });

    // Get all assignments for these classes
    const assignments = await db.Assignment.findAll({
      include: [{
        model: db.Lesson,
        as: 'Lesson',
        include: [{ model: db.Class, as: 'Class' }]
      }],
      where: { '$Lesson.ClassId$': classIds },
      order: [['DueDate', 'DESC']]
    });

    // Get students enrolled in teacher's classes
    const classStudents = await db.ClassStudent.findAll({
      include: [{ model: db.User, as: 'Student' }, { model: db.Class, as: 'Class' }],
      where: { ClassId: classIds, Status: db.ClassStudent.StatusMap.LEARNING }
    });

    // Calculate submission counts
    const submissionsGroup = await db.Submission.findAll({
      attributes: ['AssignmentId', [db.Sequelize.fn('COUNT', db.Sequelize.col('Id')), 'count']],
      group: ['AssignmentId']
    });
    const submissionCounts = {};
    submissionsGroup.forEach(g => {
      submissionCounts[g.AssignmentId] = parseInt(g.get('count')) || 0;
    });

    // Calculate Student KPIs
    const uniqueStudentsMap = {};
    classStudents.forEach(cs => {
      if (cs.Student) {
        uniqueStudentsMap[cs.Student.Id] = cs.Student;
      }
    });
    const uniqueStudents = Object.values(uniqueStudentsMap);

    const teacherFinishedLessons = lessons.filter(l => l.Status === 2).map(l => l.Id); // FINISHED = 2
    const studentKpis = [];

    // Bulk fetch attendances & submissions to avoid N+1 queries in loops
    const [allAttendances, allSubmissions, lessonAttendanceGroup] = await Promise.all([
      teacherFinishedLessons.length > 0 ? db.Attendance.findAll({
        where: {
          LessonId: teacherFinishedLessons,
          Status: {
            [db.Sequelize.Op.or]: [
              db.Attendance.StatusMap.PRESENT,
              db.Attendance.StatusMap.LATE
            ]
          }
        }
      }) : Promise.resolve([]),
      uniqueStudents.length > 0 ? db.Submission.findAll({
        where: {
          StudentId: uniqueStudents.map(s => s.Id),
          Grade: { [db.Sequelize.Op.ne]: null }
        }
      }) : Promise.resolve([]),
      teacherFinishedLessons.length > 0 ? db.Attendance.findAll({
        attributes: ['LessonId', [db.Sequelize.fn('COUNT', db.Sequelize.col('Id')), 'count']],
        where: {
          LessonId: teacherFinishedLessons,
          Status: {
            [db.Sequelize.Op.or]: [
              db.Attendance.StatusMap.PRESENT,
              db.Attendance.StatusMap.LATE
            ]
          }
        },
        group: ['LessonId']
      }) : Promise.resolve([])
    ]);

    // Group attendances by StudentId
    const studentAttendanceCountMap = {};
    allAttendances.forEach(a => {
      studentAttendanceCountMap[a.StudentId] = (studentAttendanceCountMap[a.StudentId] || 0) + 1;
    });

    // Group graded submissions by StudentId
    const studentSubmissionsMap = {};
    allSubmissions.forEach(s => {
      if (!studentSubmissionsMap[s.StudentId]) {
        studentSubmissionsMap[s.StudentId] = [];
      }
      studentSubmissionsMap[s.StudentId].push(s);
    });

    // Group lesson attendances count by LessonId
    const lessonAttendanceMap = {};
    lessonAttendanceGroup.forEach(g => {
      lessonAttendanceMap[g.LessonId] = parseInt(g.get('count')) || 0;
    });

    const totalAssignments = assignments.length;

    for (const stud of uniqueStudents) {
      let attendanceRate = 1.0;
      if (teacherFinishedLessons.length > 0) {
        const presentCount = studentAttendanceCountMap[stud.Id] || 0;
        attendanceRate = presentCount / teacherFinishedLessons.length;
      }

      const studentSubmissions = studentSubmissionsMap[stud.Id] || [];

      let avgGrade = 0.0;
      if (studentSubmissions.length > 0) {
        const sum = studentSubmissions.reduce((acc, s) => acc + parseFloat(s.Grade), 0);
        avgGrade = sum / studentSubmissions.length;
      }

      let completionRate = 0.0;
      if (totalAssignments > 0) {
        completionRate = studentSubmissions.length / totalAssignments;
      }

      let status = 'Ổn định';
      if (avgGrade < 5.0 || completionRate < 0.70 || attendanceRate < 0.80) {
        status = 'Chậm tiến độ';
      } else if (avgGrade > 8.5 && completionRate >= 0.95 && attendanceRate >= 0.95) {
        status = 'Hoàn thành tốt';
      }

      studentKpis.push({
        StudentId: stud.Id,
        FullName: stud.FullName,
        AverageGrade: avgGrade,
        AssignmentCompletionRate: completionRate,
        AttendanceRate: attendanceRate,
        Status: status
      });
    }

    // Calculate Teacher KPIs
    const teacherTaughtLessons = teacherFinishedLessons.length;
    let teacherAvgAttendance = 1.0;

    if (teacherFinishedLessons.length > 0) {
      let totalPresents = 0;
      let totalPossible = 0;

      for (const lid of teacherFinishedLessons) {
        const lesson = lessons.find(l => l.Id === lid);
        if (lesson) {
          const enrolledCount = classStudentsMap[lesson.ClassId] || 0;
          if (enrolledCount > 0) {
            const presents = lessonAttendanceMap[lid] || 0;
            totalPresents += presents;
            totalPossible += enrolledCount;
          }
        }
      }

      if (totalPossible > 0) {
        teacherAvgAttendance = totalPresents / totalPossible;
      }
    }

    // Get pending submissions
    const submissions = await db.Submission.findAll({
      include: [
        {
          model: db.Assignment,
          as: 'Assignment',
          include: [{
            model: db.Lesson,
            as: 'Lesson',
            where: { ClassId: classIds }
          }]
        },
        { model: db.User, as: 'Student' }
      ],
      where: { Grade: null },
      order: [['SubmittedAt', 'ASC']]
    });

    res.render('teacher/dashboard', {
      classes,
      classLessonsMap,
      classStudentsMap,
      lessons,
      assignments,
      submissionCounts,
      studentKpis,
      teacherLessonsTaught: teacherTaughtLessons,
      teacherAvgAttendance,
      submissions
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang dashboard của giáo viên.' });
  }
});

// GET: /Teacher/Attendance/:id
router.get('/Teacher/Attendance/:id', requireAuth(['TEACHER']), async (req, res) => {
  const lessonId = parseInt(req.params.id);

  try {
    const lesson = await db.Lesson.findByPk(lessonId, {
      include: [{ model: db.Class, as: 'Class', include: [{ model: db.Course, as: 'Course' }] }]
    });

    if (!lesson) {
      return res.status(404).render('error', { message: 'Không tìm thấy buổi học.' });
    }

    const classId = lesson.ClassId;

    // Get students in class
    const enrollments = await db.ClassStudent.findAll({
      include: [{ model: db.User, as: 'Student' }],
      where: { ClassId: classId, Status: db.ClassStudent.StatusMap.LEARNING }
    });

    const students = enrollments.map(e => e.Student);

    // Get current attendance list for this lesson
    const currentAttendances = await db.Attendance.findAll({
      where: { LessonId: lessonId }
    });

    const attendanceMap = {};
    currentAttendances.forEach(a => {
      attendanceMap[a.StudentId] = a;
    });

    res.render('teacher/attendance', {
      lesson,
      students,
      attendanceMap
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi hệ thống.' });
  }
});

// POST: /Teacher/SaveAttendance
router.post('/Teacher/SaveAttendance', requireAuth(['TEACHER']), async (req, res) => {
  const { lessonId, studentIds, statuses, remarks } = req.body;
  const teacherId = req.session.userId;

  try {
    const lesson = await db.Lesson.findByPk(lessonId);
    if (!lesson) {
      req.session.errorMessage = 'Không tìm thấy buổi học.';
      return res.redirect('/Teacher/Dashboard');
    }

    const ids = Array.isArray(studentIds) ? studentIds.map(Number) : [Number(studentIds)];
    const stats = Array.isArray(statuses) ? statuses : [statuses];
    const rems = Array.isArray(remarks) ? remarks : [remarks];

    for (let i = 0; i < ids.length; i++) {
      const studentId = ids[i];
      const statusStr = stats[i];
      const remark = rems[i] || '';

      const statusVal = db.Attendance.StatusMap[statusStr] !== undefined
        ? db.Attendance.StatusMap[statusStr]
        : db.Attendance.StatusMap.PRESENT;

      // Update or Create
      const [attendance, created] = await db.Attendance.findOrCreate({
        where: { LessonId: lessonId, StudentId: studentId },
        defaults: {
          Status: statusVal,
          Remark: remark,
          UpdatedBy: teacherId,
          UpdatedAt: new Date()
        }
      });

      if (!created) {
        attendance.Status = statusVal;
        attendance.Remark = remark;
        attendance.UpdatedBy = teacherId;
        attendance.UpdatedAt = new Date();
        await attendance.save();
      }
    }

    // Set lesson finished
    lesson.Status = db.Lesson.StatusMap.FINISHED;
    await lesson.save();

    req.session.successMessage = 'Ghi nhận điểm danh lớp học thành công!';
    res.redirect(`/Teacher/Dashboard`);
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra khi lưu điểm danh.';
    res.redirect('/Teacher/Dashboard');
  }
});

// GET: /Teacher/ClassReport/:id
router.get('/Teacher/ClassReport/:id', requireAuth(['TEACHER']), async (req, res) => {
  const classId = parseInt(req.params.id);

  try {
    const cls = await db.Class.findByPk(classId, {
      include: [{ model: db.Course, as: 'Course' }]
    });

    if (!cls) {
      return res.status(404).render('error', { message: 'Không tìm thấy lớp học.' });
    }

    // Get learning students
    const enrollments = await db.ClassStudent.findAll({
      include: [{ model: db.User, as: 'Student' }],
      where: { ClassId: classId, Status: db.ClassStudent.StatusMap.LEARNING }
    });
    const students = enrollments.map(e => e.Student);

    // Get finished lessons
    const finishedLessons = await db.Lesson.findAll({
      where: { ClassId: classId, Status: db.Lesson.StatusMap.FINISHED }
    });
    const finishedLessonIds = finishedLessons.map(l => l.Id);

    const studentReports = [];

    for (const student of students) {
      // Calculate attendance rate
      let attendanceRate = 1.0;
      if (finishedLessons.length > 0) {
        const presentCount = await db.Attendance.count({
          where: {
            LessonId: finishedLessonIds,
            StudentId: student.Id,
            Status: {
              [db.Sequelize.Op.or]: [
                db.Attendance.StatusMap.PRESENT,
                db.Attendance.StatusMap.LATE
              ]
            }
          }
        });
        attendanceRate = presentCount / finishedLessons.length;
      }

      // Calculate average grade
      const studentSubmissions = await db.Submission.findAll({
        where: {
          StudentId: student.Id,
          Grade: { [db.Sequelize.Op.ne]: null }
        }
      });

      let avgGrade = 0.0;
      if (studentSubmissions.length > 0) {
        const sum = studentSubmissions.reduce((acc, s) => acc + parseFloat(s.Grade), 0);
        avgGrade = sum / studentSubmissions.length;
      }

      // Calculate assignment completion rate
      let completionRate = 0.0;
      const totalAssignments = await db.Assignment.count({
        where: { LessonId: finishedLessonIds }
      });
      if (totalAssignments > 0) {
        completionRate = studentSubmissions.length / totalAssignments;
      }

      // AI Progress Analysis Classifier
      let status = 'Ổn định';
      let alertReason = 'Các chỉ số học tập ở mức bình thường.';
      let recommendation = 'Tiếp tục duy trì phong độ hiện tại.';

      if (avgGrade < 5.0 || completionRate < 0.70 || attendanceRate < 0.80) {
        status = 'Chậm tiến độ';
        alertReason = `Điểm trung bình thấp (${avgGrade.toFixed(1)}/10), tỷ lệ làm bài tập đạt ${(completionRate * 100).toFixed(0)}%, chuyên cần ${(attendanceRate * 100).toFixed(0)}%`;
        recommendation = 'Gửi tin nhắn nhắc nhở cho phụ huynh và tổ chức bài tập phụ đạo trực tuyến củng cố căn bản.';
      } else if (avgGrade > 8.5 && completionRate >= 0.95 && attendanceRate >= 0.95) {
        status = 'Hoàn thành tốt';
        alertReason = `Thành tích học tập xuất sắc! Điểm trung bình đạt ${avgGrade.toFixed(1)}/10, chuyên cần và làm bài tập đầy đủ tuyệt đối.`;
        recommendation = 'Vinh danh học sinh xuất sắc và đề xuất các khóa học nâng cao cấp độ tiếp theo.';
      }

      studentReports.push({
        StudentId: student.Id,
        FullName: student.FullName,
        AverageGrade: avgGrade,
        AssignmentCompletionRate: completionRate,
        AttendanceRate: attendanceRate,
        Status: status,
        AlertReason: alertReason,
        RecommendedAction: recommendation
      });
    }

    res.render('teacher/classReport', {
      Class: cls,
      studentReports
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang báo cáo tiến độ.' });
  }
});

// GET: /Teacher/CreateAssignment/:lessonId
router.get('/Teacher/CreateAssignment/:lessonId', requireAuth(['TEACHER']), async (req, res) => {
  const lessonId = parseInt(req.params.lessonId);

  try {
    const lesson = await db.Lesson.findByPk(lessonId, {
      include: [{ model: db.Class, as: 'Class' }]
    });

    if (!lesson) {
      return res.status(404).render('error', { message: 'Không tìm thấy buổi học.' });
    }

    res.render('teacher/createAssignment', { lesson });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi hệ thống.' });
  }
});

// POST: /Teacher/CreateAssignment/:lessonId
router.post('/Teacher/CreateAssignment/:lessonId', requireAuth(['TEACHER']), upload.single('attachment'), async (req, res) => {
  const lessonId = parseInt(req.params.lessonId);
  const { title, instruction, assignmentType, dueDate, quizQuestions, trueFalseQuestions, examData } = req.body;

  try {
    const lesson = await db.Lesson.findByPk(lessonId, {
      include: [{ model: db.Class, as: 'Class' }]
    });

    if (!lesson) {
      req.session.errorMessage = 'Không tìm thấy buổi học.';
      return res.redirect('/Teacher/Dashboard');
    }

    const typeVal = db.Assignment.TypeMap[assignmentType] !== undefined
      ? db.Assignment.TypeMap[assignmentType]
      : db.Assignment.TypeMap.ESSAY;

    let attachmentUrl = null;
    if (req.file) {
      attachmentUrl = '/uploads/' + req.file.filename;
    }

    // Determine QuizData based on type
    let quizDataToSave = null;
    if (typeVal === db.Assignment.TypeMap.QUIZ) {
      quizDataToSave = quizQuestions || null;
    } else if (typeVal === db.Assignment.TypeMap.TRUE_FALSE) {
      quizDataToSave = trueFalseQuestions || null;
    } else if (typeVal === db.Assignment.TypeMap.EXAM) {
      quizDataToSave = examData || null;
    }

    const assignment = await db.Assignment.create({
      LessonId: lessonId,
      Title: title,
      Instruction: instruction || '',
      AssignmentType: typeVal,
      DueDate: new Date(dueDate),
      QuizData: quizDataToSave,
      AttachmentUrl: attachmentUrl
    });

    // Notify students in class
    const enrollments = await db.ClassStudent.findAll({
      where: { ClassId: lesson.ClassId, Status: db.ClassStudent.StatusMap.LEARNING }
    });

    const typeLabel = typeVal === db.Assignment.TypeMap.QUIZ ? 'Trắc nghiệm'
      : typeVal === db.Assignment.TypeMap.TRUE_FALSE ? 'Đúng/Sai'
      : typeVal === db.Assignment.TypeMap.EXAM ? 'Bài kiểm tra'
      : 'Tự luận';

    const notifPromises = enrollments.map(e => {
      return db.Notification.create({
        UserId: e.StudentId,
        Title: 'Bài tập mới được giao',
        Content: `Giáo viên đã giao bài tập [${typeLabel}]: '${title}' cho buổi học '${lesson.Title}'. Hạn nộp: ${new Date(dueDate).toLocaleDateString('vi-VN')}.`,
        LinkUrl: '/Student/Dashboard',
        CreatedAt: new Date()
      }).then(notif => {
        const createdAtStr = new Date(notif.CreatedAt).toLocaleDateString('vi-VN') + ' ' + new Date(notif.CreatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        sendNotificationToUser(e.StudentId, {
          title: notif.Title,
          content: notif.Content,
          linkUrl: notif.LinkUrl,
          createdAt: createdAtStr
        });
      });
    });

    await Promise.all(notifPromises);

    req.session.successMessage = `Đã giao bài tập thành công cho lớp học!`;
    res.redirect(`/Teacher/Dashboard`);
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra khi tạo bài tập.';
    res.redirect('/Teacher/Dashboard');
  }
});

// GET: /Teacher/Submissions/:id
router.get('/Teacher/Submissions/:id', requireAuth(['TEACHER']), async (req, res) => {
  const assignmentId = parseInt(req.params.id);

  try {
    const assignment = await db.Assignment.findByPk(assignmentId, {
      include: [{ model: db.Lesson, as: 'Lesson', include: [{ model: db.Class, as: 'Class' }] }]
    });

    if (!assignment) {
      return res.status(404).render('error', { message: 'Không tìm thấy bài tập.' });
    }

    const submissions = await db.Submission.findAll({
      include: [{ model: db.User, as: 'Student' }],
      where: { AssignmentId: assignmentId },
      order: [['SubmittedAt', 'ASC']]
    });

    res.render('teacher/submissions', {
      assignment,
      submissions
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải danh sách bài làm.' });
  }
});

// POST: /Teacher/GradeSubmission
router.post('/Teacher/GradeSubmission', requireAuth(['TEACHER']), async (req, res) => {
  const { submissionId, grade, comment } = req.body;

  try {
    const submission = await db.Submission.findByPk(submissionId, {
      include: [{ model: db.Assignment, as: 'Assignment' }]
    });

    if (!submission) {
      req.session.errorMessage = 'Không tìm thấy bài làm.';
      return res.redirect('/Teacher/Dashboard');
    }

    submission.Grade = parseFloat(grade);
    submission.TeacherComment = comment;
    submission.GradedAt = new Date();
    await submission.save();

    // Notify student
    const notifStudent = await db.Notification.create({
      UserId: submission.StudentId,
      Title: 'Đã chấm điểm bài tập',
      Content: `Bài tập tự luận '${submission.Assignment.Title}' của bạn đã được giáo viên chấm điểm. Điểm số: ${submission.Grade}. Nhận xét: ${comment}`,
      LinkUrl: '/Student/Dashboard',
      CreatedAt: new Date()
    });

    const createdAtStr = new Date(notifStudent.CreatedAt).toLocaleDateString('vi-VN') + ' ' + new Date(notifStudent.CreatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    sendNotificationToUser(submission.StudentId, {
      title: notifStudent.Title,
      content: notifStudent.Content,
      linkUrl: notifStudent.LinkUrl,
      createdAt: createdAtStr
    });

    req.session.successMessage = `Đã chấm điểm thành công: ${submission.Grade} điểm!`;
    res.redirect(`/Teacher/Submissions/${submission.AssignmentId}`);
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra khi chấm điểm.';
    res.redirect('/Teacher/Dashboard');
  }
});

// POST: /Teacher/UpdateLesson
router.post('/Teacher/UpdateLesson', requireAuth(['TEACHER']), async (req, res) => {
  const id = parseInt(req.body.id);
  const { title, meetingUrl, meetingId, meetingPassword, statusStr, videoUrl } = req.body;

  try {
    const lesson = await db.Lesson.findByPk(id);
    if (!lesson) {
      req.session.errorMessage = 'Không tìm thấy buổi học.';
      return res.redirect('/Teacher/Dashboard');
    }

    lesson.Title = title;
    lesson.MeetingUrl = meetingUrl || null;
    lesson.MeetingId = meetingId || null;
    lesson.MeetingPassword = meetingPassword || null;
    lesson.VideoUrl = videoUrl || null;

    if (statusStr) {
      const statusVal = db.Lesson.StatusMap[statusStr] !== undefined
        ? db.Lesson.StatusMap[statusStr]
        : db.Lesson.StatusMap.SCHEDULED;
      lesson.Status = statusVal;
    }

    await lesson.save();
    req.session.successMessage = 'Cập nhật thông tin buổi học thành công!';
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Lỗi hệ thống khi cập nhật buổi học.';
  }
  res.redirect('/Teacher/Dashboard');
});

// POST: /Teacher/CreateLesson
router.post('/Teacher/CreateLesson', requireAuth(['TEACHER']), async (req, res) => {
  const { classId, title, lessonDate, startTimeStr, endTimeStr, meetingUrl, meetingId, meetingPassword } = req.body;

  try {
    await db.Lesson.create({
      ClassId: parseInt(classId),
      Title: title,
      LessonDate: new Date(lessonDate),
      StartTime: startTimeStr + ':00',
      EndTime: endTimeStr + ':00',
      MeetingUrl: meetingUrl || null,
      MeetingId: meetingId || null,
      MeetingPassword: meetingPassword || null,
      Status: db.Lesson.StatusMap.SCHEDULED
    });

    req.session.successMessage = 'Tạo buổi học mới thành công!';
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra khi thêm buổi học mới.';
  }
  res.redirect('/Teacher/Dashboard');
});

// GET: /Teacher/CreateExam/:classId — Trang tạo bài kiểm tra lớn (gắn với lớp, không cần buổi học)
router.get('/Teacher/CreateExam/:classId', requireAuth(['TEACHER']), async (req, res) => {
  const classId = parseInt(req.params.classId);
  try {
    const cls = await db.Class.findByPk(classId, {
      include: [{ model: db.Course, as: 'Course' }]
    });
    if (!cls) {
      req.session.errorMessage = 'Không tìm thấy lớp học.';
      return res.redirect('/Teacher/Dashboard');
    }
    res.render('teacher/createExam', { cls });
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra.';
    res.redirect('/Teacher/Dashboard');
  }
});

// POST: /Teacher/CreateExam/:classId — Lưu bài kiểm tra lớn
router.post('/Teacher/CreateExam/:classId', requireAuth(['TEACHER']), upload.single('attachment'), async (req, res) => {
  const classId = parseInt(req.params.classId);
  const { title, instruction, examType, dueDate, quizQuestions, trueFalseQuestions, examData, assignmentType } = req.body;
  const teacherId = req.session.userId;

  try {
    const cls = await db.Class.findByPk(classId);
    if (!cls || cls.TeacherId !== teacherId) {
      req.session.errorMessage = 'Bạn không có quyền tạo bài kiểm tra cho lớp này.';
      return res.redirect('/Teacher/Dashboard');
    }

    const typeVal = db.Assignment.TypeMap[assignmentType] !== undefined
      ? db.Assignment.TypeMap[assignmentType]
      : db.Assignment.TypeMap.EXAM;

    let quizDataToSave = null;
    if (typeVal === db.Assignment.TypeMap.QUIZ) quizDataToSave = quizQuestions || null;
    else if (typeVal === db.Assignment.TypeMap.TRUE_FALSE) quizDataToSave = trueFalseQuestions || null;
    else if (typeVal === db.Assignment.TypeMap.EXAM) {
      const parsed = examData ? JSON.parse(examData) : {};
      parsed.examType = examType || 'OTHER';
      quizDataToSave = JSON.stringify(parsed);
    }

    let attachmentUrl = null;
    if (req.file) attachmentUrl = '/uploads/' + req.file.filename;

    // Create a virtual lesson placeholder for exam (LessonId = first lesson of class or null-safe)
    // We store ClassId-based exams by linking to LessonId = 0 workaround:
    // Better: find any lesson in class as anchor, or use first lesson
    const anyLesson = await db.Lesson.findOne({ where: { ClassId: classId }, order: [['LessonDate', 'ASC']] });
    if (!anyLesson) {
      req.session.errorMessage = 'Lớp học chưa có buổi học nào. Vui lòng tạo ít nhất một buổi học trước.';
      return res.redirect('/Teacher/Dashboard');
    }

    const assignment = await db.Assignment.create({
      LessonId: anyLesson.Id,
      Title: title,
      Instruction: instruction || '',
      AssignmentType: typeVal,
      DueDate: new Date(dueDate),
      QuizData: quizDataToSave,
      AttachmentUrl: attachmentUrl
    });

    // Notify all students in class
    const enrollments = await db.ClassStudent.findAll({
      where: { ClassId: classId, Status: db.ClassStudent.StatusMap.LEARNING }
    });

    const examTypeLabel = examType === '15MIN' ? 'Kiểm tra 15 phút'
      : examType === '45MIN' ? 'Kiểm tra 1 tiết'
      : examType === 'SEMESTER' ? 'Thi học kỳ' : 'Bài kiểm tra';

    const notifPromises = enrollments.map(e => {
      return db.Notification.create({
        UserId: e.StudentId,
        Title: `📋 ${examTypeLabel} mới`,
        Content: `Giáo viên đã tạo ${examTypeLabel}: '${title}'. Thời gian: ${new Date(dueDate).toLocaleDateString('vi-VN')}.`,
        LinkUrl: '/Student/Dashboard',
        CreatedAt: new Date()
      }).then(notif => {
        const createdAtStr = new Date(notif.CreatedAt).toLocaleDateString('vi-VN') + ' ' + new Date(notif.CreatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        sendNotificationToUser(e.StudentId, {
          title: notif.Title, content: notif.Content,
          linkUrl: notif.LinkUrl, createdAt: createdAtStr
        });
      });
    });
    await Promise.all(notifPromises);

    req.session.successMessage = `Đã tạo bài kiểm tra '${title}' thành công!`;
    res.redirect('/Teacher/Dashboard');
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra khi tạo bài kiểm tra.';
    res.redirect('/Teacher/Dashboard');
  }
});

module.exports = router;
