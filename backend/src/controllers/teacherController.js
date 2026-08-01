const express = require('express');
const controller = {};
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models');
const { requireAuth } = require('../middlewares/auth');
const { sendNotificationToUser } = require('../sockets/signalRCompat');
const { uploadToCloud } = require('../utils/cloudinary');
const auditLogService = require('../services/auditLogService');
const notificationService = require('../services/notificationService');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const VIETNAMESE_FONT_PATH = path.join(__dirname, '../../public/fonts/Roboto-Regular.woff');

// Multer storage setup for teacher homework/assignment attachments
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

// Multer for video file uploads (up to 500MB)
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const videosDir = path.join(__dirname, '../../public/uploads/videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }
    cb(null, videosDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = 'video_' + Date.now() + '_' + Math.random().toString(36).substring(2) + ext;
    cb(null, uniqueName);
  }
});
const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file video!'), false);
    }
  }
});

// GET: /Teacher/Dashboard
controller.getDashboard = async (req, res) => {
  const teacherId = req.session.userId;

  try {
    // Fetch classes + lessons + students song song
    const classes = await db.Class.findAll({
      include: [{ model: db.Course, as: 'Course' }],
      where: { TeacherId: teacherId }
    });

    const classIds = classes.map(c => c.Id);

    // Fetch lessons count, student counts, lessons, assignments, classStudents, submissions song song
    const [
      lessonsCount,
      studentCounts,
      lessons,
      assignments,
      classStudents,
      submissionsGroup
    ] = await Promise.all([
      db.Lesson.findAll({
        attributes: ['ClassId', [db.Sequelize.fn('COUNT', db.Sequelize.col('Id')), 'count']],
        where: { ClassId: classIds },
        group: ['ClassId']
      }),
      db.ClassStudent.findAll({
        attributes: ['ClassId', [db.Sequelize.fn('COUNT', db.Sequelize.col('Id')), 'count']],
        where: { ClassId: classIds, Status: db.ClassStudent.StatusMap.LEARNING },
        group: ['ClassId']
      }),
      db.Lesson.findAll({
        include: [{ model: db.Class, as: 'Class' }],
        where: { ClassId: classIds },
        order: [['LessonDate', 'ASC'], ['StartTime', 'ASC']]
      }),
      db.Assignment.findAll({
        include: [{
          model: db.Lesson,
          as: 'Lesson',
          include: [{ model: db.Class, as: 'Class' }]
        }],
        where: { '$Lesson.ClassId$': classIds },
        order: [['DueDate', 'DESC']]
      }),
      db.ClassStudent.findAll({
        include: [{ model: db.User, as: 'Student' }, { model: db.Class, as: 'Class' }],
        where: { ClassId: classIds, Status: db.ClassStudent.StatusMap.LEARNING }
      }),
      db.Submission.findAll({
        attributes: ['AssignmentId', [db.Sequelize.fn('COUNT', db.Sequelize.col('Id')), 'count']],
        where: { AttemptNumber: 1 }, // Chỉ đếm lần nộp chính thức, không tính các lần luyện tập thêm
        group: ['AssignmentId']
      })
    ]);

    const classLessonsMap = {};
    lessonsCount.forEach(item => {
      classLessonsMap[item.ClassId] = parseInt(item.get('count')) || 0;
    });

    const classStudentsMap = {};
    studentCounts.forEach(item => {
      classStudentsMap[item.ClassId] = parseInt(item.get('count')) || 0;
    });

    const submissionCounts = {};
    submissionsGroup.forEach(g => {
      submissionCounts[g.AssignmentId] = parseInt(g.get('count')) || 0;
    });

    // Calculate Student KPIs
    const uniqueStudentsMap = {};
    const studentClassIdsMap = {};
    classStudents.forEach(cs => {
      if (cs.Student) {
        uniqueStudentsMap[cs.Student.Id] = cs.Student;
        if (!studentClassIdsMap[cs.Student.Id]) studentClassIdsMap[cs.Student.Id] = new Set();
        studentClassIdsMap[cs.Student.Id].add(cs.ClassId);
      }
    });
    const uniqueStudents = Object.values(uniqueStudentsMap);

    // Bài tập chỉ nên tính vào mẫu số của học viên nếu thuộc lớp mà học viên đó đang học
    // (1 giảng viên có thể dạy nhiều lớp, mỗi học viên chỉ học 1 hoặc vài lớp trong số đó)
    const assignmentIdsByClass = {};
    assignments.forEach(a => {
      const clsId = a.Lesson && a.Lesson.Class ? a.Lesson.Class.Id : (a.Lesson ? a.Lesson.ClassId : null);
      if (clsId == null) return;
      if (!assignmentIdsByClass[clsId]) assignmentIdsByClass[clsId] = [];
      assignmentIdsByClass[clsId].push(a.Id);
    });

    const teacherFinishedLessons = lessons.filter(l => l.Status === 2).map(l => l.Id); // FINISHED = 2
    // % chuyên cần chỉ tính trên các buổi đã KHOÁ điểm danh (state machine riêng với lịch dạy)
    const teacherClosedLessons = lessons.filter(l => l.AttendanceStatus === db.Lesson.AttendanceStatusMap.CLOSED).map(l => l.Id);
    const studentKpis = [];

    // Bulk fetch attendances & submissions to avoid N+1 queries in loops
    const [allAttendances, allExcusedAttendances, allSubmissions, lessonAttendanceGroup] = await Promise.all([
      teacherClosedLessons.length > 0 ? db.Attendance.findAll({
        where: {
          LessonId: teacherClosedLessons,
          Status: {
            [db.Sequelize.Op.or]: [
              db.Attendance.StatusMap.PRESENT,
              db.Attendance.StatusMap.LATE
            ]
          }
        }
      }) : Promise.resolve([]),
      // Vắng có phép (ABSENT_REQUESTED) bị loại khỏi mẫu số, khác với vắng không phép
      teacherClosedLessons.length > 0 ? db.Attendance.findAll({
        where: {
          LessonId: teacherClosedLessons,
          Status: db.Attendance.StatusMap.ABSENT_REQUESTED
        }
      }) : Promise.resolve([]),
      uniqueStudents.length > 0 ? db.Submission.findAll({
        where: {
          StudentId: uniqueStudents.map(s => s.Id),
          AttemptNumber: 1 // Chỉ tính điểm chính thức, không tính các lần luyện tập thêm
        }
      }) : Promise.resolve([]),
      teacherClosedLessons.length > 0 ? db.Attendance.findAll({
        attributes: ['LessonId', [db.Sequelize.fn('COUNT', db.Sequelize.col('Id')), 'count']],
        where: {
          LessonId: teacherClosedLessons,
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

    // Group excused absences by StudentId & by LessonId (excluded from the attendance-rate denominator)
    const studentExcusedCountMap = {};
    const lessonExcusedCountMap = {};
    allExcusedAttendances.forEach(a => {
      studentExcusedCountMap[a.StudentId] = (studentExcusedCountMap[a.StudentId] || 0) + 1;
      lessonExcusedCountMap[a.LessonId] = (lessonExcusedCountMap[a.LessonId] || 0) + 1;
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

    for (const stud of uniqueStudents) {
      let attendanceRate = 1.0;
      const excusedCount = studentExcusedCountMap[stud.Id] || 0;
      const attendanceDenominator = teacherClosedLessons.length - excusedCount;
      if (attendanceDenominator > 0) {
        const presentCount = studentAttendanceCountMap[stud.Id] || 0;
        attendanceRate = presentCount / attendanceDenominator;
      }

      // Chỉ tính trên các bài tập thuộc (các) lớp mà chính học viên này đang học,
      // không phải tổng số bài tập của toàn bộ các lớp giảng viên đang dạy
      const studentAssignmentIds = new Set();
      (studentClassIdsMap[stud.Id] || []).forEach((clsId) => {
        (assignmentIdsByClass[clsId] || []).forEach((id) => studentAssignmentIds.add(id));
      });
      const studentTotalAssignments = studentAssignmentIds.size;

      const studentSubmissions = (studentSubmissionsMap[stud.Id] || []).filter(s => studentAssignmentIds.has(s.AssignmentId));
      const gradedSubmissions = studentSubmissions.filter(s => s.Grade !== null);

      let avgGrade = 0.0;
      if (gradedSubmissions.length > 0) {
        const sum = gradedSubmissions.reduce((acc, s) => acc + parseFloat(s.Grade), 0);
        avgGrade = sum / gradedSubmissions.length;
      }

      let completionRate = 0.0;
      if (studentTotalAssignments > 0) {
        completionRate = studentSubmissions.length / studentTotalAssignments;
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

    if (teacherClosedLessons.length > 0) {
      let totalPresents = 0;
      let totalPossible = 0;

      for (const lid of teacherClosedLessons) {
        const lesson = lessons.find(l => l.Id === lid);
        if (lesson) {
          const enrolledCount = classStudentsMap[lesson.ClassId] || 0;
          const excusedCount = lessonExcusedCountMap[lid] || 0;
          const possible = Math.max(enrolledCount - excusedCount, 0);
          if (possible > 0) {
            const presents = lessonAttendanceMap[lid] || 0;
            totalPresents += presents;
            totalPossible += possible;
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
      where: { Grade: null, AttemptNumber: 1 }, // Chỉ chấm lần nộp chính thức, không hiện các lần luyện tập thêm
      order: [['SubmittedAt', 'ASC']]
    });

    // Get teacher's own profile for the profile edit tab
    const teacherUser = await db.User.findByPk(teacherId, {
      include: [{ model: db.UserProfile, as: 'Profile' }]
    });
    const teacherProfile = teacherUser ? teacherUser.Profile : null;

    // Đánh giá KPI giảng viên — do Admin nhập, giáo viên chỉ xem (chỉ đọc)
    const teacherEvaluationsRaw = await db.TeacherEvaluation.findAll({
      where: { TeacherId: teacherId },
      order: [['PeriodDate', 'ASC']]
    });
    const teacherEvaluations = teacherEvaluationsRaw.map(e => ({
      Id: e.Id,
      Period: e.Period,
      PeriodDate: e.PeriodDate,
      Criteria: JSON.parse(e.CriteriaData || '[]'),
      OverallComment: e.OverallComment,
      CreatedAt: e.CreatedAt
    }));

    res.render('teacher/dashboard', {
      classes,
      teacherEvaluations,
      classLessonsMap,
      classStudentsMap,
      lessons,
      assignments,
      submissionCounts,
      studentKpis,
      teacherLessonsTaught: teacherTaughtLessons,
      teacherAvgAttendance,
      submissions,
      teacherProfile,
      teacherUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang dashboard của giáo viên.' });
  }
};

// GET: /Teacher/Attendance/:id
controller.getAttendance = async (req, res) => {
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
};

// POST: /Teacher/OpenAttendance — Bước 3: mở khoá điểm danh cho 1 buổi học
controller.openAttendance = async (req, res) => {
  const lessonId = parseInt(req.body.lessonId);
  const teacherId = req.session.userId;

  try {
    const lesson = await db.Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy buổi học.' });
    }

    const cls = await db.Class.findOne({ where: { Id: lesson.ClassId, TeacherId: teacherId } });
    if (!cls) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền mở điểm danh buổi học này.' });
    }

    if (lesson.AttendanceStatus === db.Lesson.AttendanceStatusMap.NOT_OPENED) {
      lesson.AttendanceStatus = db.Lesson.AttendanceStatusMap.OPEN;
      lesson.AttendanceOpenedAt = new Date();
      await lesson.save();
    }

    res.json({ success: true, attendanceStatus: lesson.AttendanceStatus, attendanceOpenedAt: lesson.AttendanceOpenedAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi mở điểm danh.' });
  }
};

// POST: /Teacher/CloseAttendance — Bước 5: khoá lại buổi học (không dùng khi khoá qua nút Lưu & Khoá)
controller.closeAttendance = async (req, res) => {
  const lessonId = parseInt(req.body.lessonId);
  const teacherId = req.session.userId;

  try {
    const lesson = await db.Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy buổi học.' });
    }

    const cls = await db.Class.findOne({ where: { Id: lesson.ClassId, TeacherId: teacherId } });
    if (!cls) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền khoá điểm danh buổi học này.' });
    }

    lesson.AttendanceStatus = db.Lesson.AttendanceStatusMap.CLOSED;
    lesson.AttendanceClosedAt = new Date();
    await lesson.save();

    res.json({ success: true, attendanceStatus: lesson.AttendanceStatus, attendanceClosedAt: lesson.AttendanceClosedAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi khoá điểm danh.' });
  }
};

// POST: /Teacher/SaveAttendance
controller.saveAttendance = async (req, res) => {
  const { lessonId, studentIds, statuses, remarks, videoAccesses } = req.body;
  const teacherId = req.session.userId;

  try {
    const lesson = await db.Lesson.findByPk(lessonId);
    if (!lesson) {
      req.session.errorMessage = 'Không tìm thấy buổi học.';
      return res.redirect('/Teacher/Dashboard');
    }

    // Editing an already-closed lesson is allowed, but every touched row is flagged for audit (không khoá cứng)
    const wasAlreadyClosed = lesson.AttendanceStatus === db.Lesson.AttendanceStatusMap.CLOSED;

    const ids = Array.isArray(studentIds) ? studentIds.map(Number) : [Number(studentIds)];
    const stats = Array.isArray(statuses) ? statuses : [statuses];
    const rems = Array.isArray(remarks) ? remarks : [remarks];
    // videoAccesses is a Set of studentIds that have been checked
    const videoAccessSet = new Set(
      Array.isArray(videoAccesses) ? videoAccesses.map(String) : (videoAccesses ? [String(videoAccesses)] : [])
    );

    for (let i = 0; i < ids.length; i++) {
      const studentId = ids[i];
      const statusStr = stats[i];
      const remark = rems[i] || '';

      const statusVal = db.Attendance.StatusMap[statusStr] !== undefined
        ? db.Attendance.StatusMap[statusStr]
        : db.Attendance.StatusMap.PRESENT;

      // Grant video access if: Present/Late OR teacher manually ticked checkbox
      const videoAccess = statusVal === db.Attendance.StatusMap.PRESENT
        || statusVal === db.Attendance.StatusMap.LATE
        || videoAccessSet.has(String(studentId));

      // Update or Create
      const [attendance, created] = await db.Attendance.findOrCreate({
        where: { LessonId: lessonId, StudentId: studentId },
        defaults: {
          Status: statusVal,
          Remark: remark,
          VideoAccess: videoAccess,
          UpdatedBy: teacherId,
          UpdatedAt: new Date(),
          EditedAfterClose: wasAlreadyClosed
        }
      });

      if (!created) {
        attendance.Status = statusVal;
        attendance.Remark = remark;
        attendance.VideoAccess = videoAccess;
        attendance.UpdatedBy = teacherId;
        attendance.UpdatedAt = new Date();
        if (wasAlreadyClosed) attendance.EditedAfterClose = true;
        await attendance.save();
      }
    }

    // Set lesson finished + khoá điểm danh (nút "Lưu & Khoá buổi học" gộp luôn Bước 5)
    lesson.Status = db.Lesson.StatusMap.FINISHED;
    if (!wasAlreadyClosed) {
      lesson.AttendanceStatus = db.Lesson.AttendanceStatusMap.CLOSED;
      lesson.AttendanceClosedAt = new Date();
    }
    await lesson.save();

    req.session.successMessage = 'Ghi nhận điểm danh lớp học thành công!';
    res.redirect(`/Teacher/Dashboard`);
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra khi lưu điểm danh.';
    res.redirect('/Teacher/Dashboard');
  }
};


// GET: /Teacher/ClassReport/:id
controller.getClassReport = async (req, res) => {
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

    // % chuyên cần chỉ tính trên các buổi đã KHOÁ điểm danh
    const closedLessons = await db.Lesson.findAll({
      where: { ClassId: classId, AttendanceStatus: db.Lesson.AttendanceStatusMap.CLOSED }
    });
    const closedLessonIds = closedLessons.map(l => l.Id);

    const studentIds = students.map(s => s.Id);

    // Bulk-fetch attendance counts, submissions & total assignments (avoids N+1 queries in the loop below)
    const [attendanceCounts, excusedCounts, allSubmissions, totalAssignments] = await Promise.all([
      (closedLessonIds.length > 0 && studentIds.length > 0) ? db.Attendance.findAll({
        attributes: ['StudentId', [db.Sequelize.fn('COUNT', db.Sequelize.col('Id')), 'count']],
        where: {
          LessonId: closedLessonIds,
          StudentId: studentIds,
          Status: {
            [db.Sequelize.Op.or]: [
              db.Attendance.StatusMap.PRESENT,
              db.Attendance.StatusMap.LATE
            ]
          }
        },
        group: ['StudentId']
      }) : Promise.resolve([]),
      // Vắng có phép bị loại khỏi mẫu số, khác với vắng không phép
      (closedLessonIds.length > 0 && studentIds.length > 0) ? db.Attendance.findAll({
        attributes: ['StudentId', [db.Sequelize.fn('COUNT', db.Sequelize.col('Id')), 'count']],
        where: {
          LessonId: closedLessonIds,
          StudentId: studentIds,
          Status: db.Attendance.StatusMap.ABSENT_REQUESTED
        },
        group: ['StudentId']
      }) : Promise.resolve([]),
      studentIds.length > 0 ? db.Submission.findAll({
        where: {
          StudentId: studentIds,
          AttemptNumber: 1 // Chỉ tính điểm chính thức, không tính các lần luyện tập thêm
        }
      }) : Promise.resolve([]),
      db.Assignment.count({ where: { LessonId: finishedLessonIds } })
    ]);

    const attendanceCountMap = {};
    attendanceCounts.forEach(item => { attendanceCountMap[item.StudentId] = parseInt(item.get('count')) || 0; });

    const excusedCountMap = {};
    excusedCounts.forEach(item => { excusedCountMap[item.StudentId] = parseInt(item.get('count')) || 0; });

    const submissionsMap = {};
    allSubmissions.forEach(s => {
      if (!submissionsMap[s.StudentId]) submissionsMap[s.StudentId] = [];
      submissionsMap[s.StudentId].push(s);
    });

    const studentReports = students.map(student => {
      // Calculate attendance rate — mẫu số là số buổi đã khoá, trừ đi các buổi vắng có phép của chính học viên đó
      let attendanceRate = 1.0;
      const excusedCount = excusedCountMap[student.Id] || 0;
      const attendanceDenominator = closedLessonIds.length - excusedCount;
      if (attendanceDenominator > 0) {
        const presentCount = attendanceCountMap[student.Id] || 0;
        attendanceRate = presentCount / attendanceDenominator;
      }

      // Calculate average grade
      const studentSubmissions = submissionsMap[student.Id] || [];
      const gradedSubmissions = studentSubmissions.filter(s => s.Grade !== null);

      let avgGrade = 0.0;
      if (gradedSubmissions.length > 0) {
        const sum = gradedSubmissions.reduce((acc, s) => acc + parseFloat(s.Grade), 0);
        avgGrade = sum / gradedSubmissions.length;
      }

      // Calculate assignment completion rate
      let completionRate = 0.0;
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

      return {
        StudentId: student.Id,
        FullName: student.FullName,
        AverageGrade: avgGrade,
        AssignmentCompletionRate: completionRate,
        AttendanceRate: attendanceRate,
        Status: status,
        AlertReason: alertReason,
        RecommendedAction: recommendation
      };
    });

    res.render('teacher/classReport', {
      Class: cls,
      studentReports
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang báo cáo tiến độ.' });
  }
};

// GET: /Teacher/CreateAssignment/:lessonId
controller.getCreateAssignment = async (req, res) => {
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
};

// POST: /Teacher/CreateAssignment/:lessonId
controller.createAssignment = async (req, res) => {
  const lessonId = parseInt(req.params.lessonId);
  const { title, instruction, assignmentType, dueDate, quizQuestions, trueFalseQuestions, examData, status, allowMultipleAttempts } = req.body;

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
      const cloudinaryUrl = await uploadToCloud(req.file.path, 'assignments');
      attachmentUrl = cloudinaryUrl || '/uploads/' + req.file.filename;
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

    const statusVal = status === 'draft' ? db.Assignment.StatusMap.DRAFT : db.Assignment.StatusMap.PUBLISHED;

    const assignment = await db.Assignment.create({
      LessonId: lessonId,
      Title: title,
      Instruction: instruction || '',
      AssignmentType: typeVal,
      DueDate: new Date(dueDate),
      QuizData: quizDataToSave,
      AttachmentUrl: attachmentUrl,
      Status: statusVal,
      AllowMultipleAttempts: !!allowMultipleAttempts && allowMultipleAttempts !== 'false'
    });

    // Bài nháp không hiện với học viên, không gửi thông báo
    if (statusVal === db.Assignment.StatusMap.DRAFT) {
      req.session.successMessage = `Đã lưu nháp bài tập '${title}'.`;
      return res.redirect('/Teacher/Dashboard');
    }

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
        LinkUrl: (typeVal === db.Assignment.TypeMap.QUIZ || typeVal === db.Assignment.TypeMap.EXAM || typeVal === db.Assignment.TypeMap.TRUE_FALSE)
          ? '/Student/Dashboard#quizzes'
          : '/Student/Dashboard#assignments',
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
};

// GET: /Teacher/Submissions/:id
controller.getSubmissions = async (req, res) => {
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

    // Fetch other assignments from the same class for performance comparison
    let otherAssignments = [];
    if (assignment.Lesson && assignment.Lesson.ClassId) {
      const classLessons = await db.Lesson.findAll({
        where: { ClassId: assignment.Lesson.ClassId }
      });
      const lessonIds = classLessons.map(l => l.Id);
      otherAssignments = await db.Assignment.findAll({
        where: {
          LessonId: lessonIds,
          Id: { [db.Sequelize.Op.ne]: assignmentId }
        },
        include: [{
          model: db.Submission,
          as: 'Submissions',
          where: { Grade: { [db.Sequelize.Op.ne]: null } },
          required: false
        }],
        order: [['Id', 'DESC']]
      });
    }

    res.render('teacher/submissions', {
      assignment,
      submissions,
      otherAssignments
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải danh sách bài làm.' });
  }
};

// POST: /Teacher/GradeSubmission
controller.gradeSubmission = async (req, res) => {
  const { submissionId, grade, comment } = req.body;

  try {
    const submission = await db.Submission.findByPk(submissionId, {
      include: [{ model: db.Assignment, as: 'Assignment' }]
    });

    if (!submission) {
      req.session.errorMessage = 'Không tìm thấy bài làm.';
      return res.redirect('/Teacher/Dashboard');
    }

    if (submission.AttemptNumber !== 1) {
      req.session.errorMessage = 'Chỉ có thể chấm điểm lần nộp chính thức (lần đầu tiên), không chấm các lần luyện tập thêm.';
      return res.redirect(`/Teacher/Submissions/${submission.AssignmentId}`);
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
      LinkUrl: '/Student/Dashboard#assignments',
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
};

// GET: /Teacher/Grading/:id — trang chấm bài chi tiết cho 1 lần nộp chính thức
controller.getGrading = async (req, res) => {
  const submissionId = parseInt(req.params.id);
  const teacherId = req.session.userId;

  try {
    const submission = await db.Submission.findByPk(submissionId, {
      include: [
        { model: db.User, as: 'Student' },
        {
          model: db.Assignment,
          as: 'Assignment',
          include: [{ model: db.Lesson, as: 'Lesson', include: [{ model: db.Class, as: 'Class' }] }]
        }
      ]
    });

    if (!submission) {
      return res.status(404).render('error', { message: 'Không tìm thấy bài làm.' });
    }

    const cls = submission.Assignment && submission.Assignment.Lesson ? submission.Assignment.Lesson.Class : null;
    if (!cls || cls.TeacherId !== teacherId) {
      return res.status(403).render('error', { message: 'Bạn không có quyền chấm bài làm này.' });
    }

    const practiceAttempts = submission.AttemptNumber === 1 ? await db.Submission.findAll({
      where: { AssignmentId: submission.AssignmentId, StudentId: submission.StudentId, AttemptNumber: { [db.Sequelize.Op.gt]: 1 } },
      order: [['AttemptNumber', 'ASC']]
    }) : [];

    res.render('teacher/grading', { submission, assignment: submission.Assignment, practiceAttempts });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang chấm bài.' });
  }
};

// POST: /Teacher/UpdateLesson
controller.updateLesson = async (req, res) => {
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

    if (req.file) {
      const cloudinaryUrl = await uploadToCloud(req.file.path, 'lessons');
      lesson.DocumentUrl = cloudinaryUrl || '/uploads/' + req.file.filename;
      lesson.DocumentName = req.file.originalname;
    } else if (req.body.removeDocument === 'true') {
      lesson.DocumentUrl = null;
      lesson.DocumentName = null;
    }

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
};

// POST: /Teacher/UpdateLessonVideo
controller.updateLessonVideo = async (req, res) => {
  const lessonId = parseInt(req.body.lessonId);
  const videoUrl = (req.body.videoUrl || '').trim();

  try {
    const lesson = await db.Lesson.findByPk(lessonId);
    if (!lesson) {
      req.session.errorMessage = 'Không tìm thấy buổi học.';
      return res.redirect('/Teacher/Dashboard');
    }

    // Verify the lesson belongs to this teacher
    const cls = await db.Class.findOne({
      where: { Id: lesson.ClassId, TeacherId: req.session.userId }
    });
    if (!cls) {
      req.session.errorMessage = 'Bạn không có quyền cập nhật buổi học này.';
      return res.redirect('/Teacher/Dashboard');
    }

    lesson.VideoUrl = videoUrl || null;
    await lesson.save();

    req.session.successMessage = videoUrl
      ? 'Đã cập nhật video xem lại cho buổi học thành công!'
      : 'Đã xóa link video xem lại.';
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Lỗi hệ thống khi cập nhật video.';
  }
  res.redirect('/Teacher/Dashboard');
};

// POST: /Teacher/UploadLessonVideo — upload file video, return JSON
controller.uploadLessonVideo = async (req, res) => {
  const lessonId = parseInt(req.body.lessonId);

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file video được gửi lên.' });
    }

    const lesson = await db.Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy buổi học.' });
    }

    // Verify the lesson belongs to this teacher
    const cls = await db.Class.findOne({
      where: { Id: lesson.ClassId, TeacherId: req.session.userId }
    });
    if (!cls) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền cập nhật buổi học này.' });
    }

    // Delete old video file if it was a local upload
    if (lesson.VideoUrl && lesson.VideoUrl.startsWith('/uploads/videos/')) {
      const oldPath = path.join(__dirname, '../../public/uploads/videos', lesson.VideoUrl.replace('/uploads/videos/', ''));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const cloudinaryUrl = await uploadToCloud(req.file.path, 'videos');
    lesson.VideoUrl = cloudinaryUrl || '/uploads/videos/' + req.file.filename;
    await lesson.save();

    return res.json({ success: true, videoUrl: lesson.VideoUrl, message: 'Upload video thành công!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi upload video.' });
  }
};


controller.createLesson = async (req, res) => {
  const { classId, title, lessonDate, startTimeStr, endTimeStr, meetingUrl, meetingId, meetingPassword } = req.body;

  try {
    let documentUrl = null;
    let documentName = null;
    if (req.file) {
      const cloudinaryUrl = await uploadToCloud(req.file.path, 'lessons');
      documentUrl = cloudinaryUrl || '/uploads/' + req.file.filename;
      documentName = req.file.originalname;
    }

    await db.Lesson.create({
      ClassId: parseInt(classId),
      Title: title,
      LessonDate: new Date(lessonDate),
      StartTime: startTimeStr + ':00',
      EndTime: endTimeStr + ':00',
      MeetingUrl: meetingUrl || null,
      MeetingId: meetingId || null,
      MeetingPassword: meetingPassword || null,
      DocumentUrl: documentUrl,
      DocumentName: documentName,
      Status: db.Lesson.StatusMap.SCHEDULED
    });

    req.session.successMessage = 'Tạo buổi học mới thành công!';
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra khi thêm buổi học mới.';
  }
  res.redirect('/Teacher/Dashboard');
};

// GET: /Teacher/CreateExam/:classId — Trang tạo bài kiểm tra lớn (gắn với lớp, không cần buổi học)
controller.getCreateExam = async (req, res) => {
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
};

// POST: /Teacher/CreateExam/:classId — Lưu bài kiểm tra lớn
controller.createExam = async (req, res) => {
  const classId = parseInt(req.params.classId);
  const { title, instruction, examType, dueDate, openAt, timeLimitMinutes, quizQuestions, trueFalseQuestions, examData, assignmentType, status, allowMultipleAttempts } = req.body;
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
    if (req.file) {
      const cloudinaryUrl = await uploadToCloud(req.file.path, 'exams');
      attachmentUrl = cloudinaryUrl || '/uploads/' + req.file.filename;
    }

    // Create a virtual lesson placeholder for exam (LessonId = first lesson of class or null-safe)
    // We store ClassId-based exams by linking to LessonId = 0 workaround:
    // Better: find any lesson in class as anchor, or use first lesson
    const anyLesson = await db.Lesson.findOne({ where: { ClassId: classId }, order: [['LessonDate', 'ASC']] });
    if (!anyLesson) {
      req.session.errorMessage = 'Lớp học chưa có buổi học nào. Vui lòng tạo ít nhất một buổi học trước.';
      return res.redirect('/Teacher/Dashboard');
    }

    const statusVal = status === 'draft' ? db.Assignment.StatusMap.DRAFT : db.Assignment.StatusMap.PUBLISHED;

    const assignment = await db.Assignment.create({
      LessonId: anyLesson.Id,
      Title: title,
      Instruction: instruction || '',
      AssignmentType: typeVal,
      DueDate: new Date(dueDate),
      OpenAt: openAt ? new Date(openAt) : null,
      TimeLimitMinutes: timeLimitMinutes ? parseInt(timeLimitMinutes) : null,
      QuizData: quizDataToSave,
      AttachmentUrl: attachmentUrl,
      Status: statusVal,
      AllowMultipleAttempts: !!allowMultipleAttempts && allowMultipleAttempts !== 'false'
    });

    // Bài nháp không hiện với học viên, không gửi thông báo
    if (statusVal === db.Assignment.StatusMap.DRAFT) {
      req.session.successMessage = `Đã lưu nháp bài kiểm tra '${title}'.`;
      return res.redirect('/Teacher/Dashboard');
    }

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
        LinkUrl: '/Student/Dashboard#quizzes',
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
};

// POST: /Teacher/GrantVideoAccess
// AJAX endpoint: grant or revoke video replay access for a single student in a finished lesson
controller.grantVideoAccess = async (req, res) => {
  const { lessonId, studentId, grant } = req.body;
  const teacherId = req.session.userId;

  try {
    const lesson = await db.Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy buổi học.' });
    }

    // Verify teacher owns this class
    const cls = await db.Class.findOne({ where: { Id: lesson.ClassId, TeacherId: teacherId } });
    if (!cls) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập lớp học này.' });
    }

    // Verify student is enrolled
    const enrollment = await db.ClassStudent.findOne({
      where: { ClassId: lesson.ClassId, StudentId: studentId }
    });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Học viên không thuộc lớp học này.' });
    }

    const grantAccess = grant === true || grant === 'true' || grant === 1 || grant === '1';

    // Find or create attendance record
    const [attendance, created] = await db.Attendance.findOrCreate({
      where: { LessonId: lessonId, StudentId: studentId },
      defaults: {
        Status: db.Attendance.StatusMap.ABSENT_REQUESTED, // default: vắng phép nếu chưa có record
        VideoAccess: grantAccess,
        UpdatedBy: teacherId,
        UpdatedAt: new Date()
      }
    });

    if (!created) {
      attendance.VideoAccess = grantAccess;
      attendance.UpdatedBy = teacherId;
      attendance.UpdatedAt = new Date();
      await attendance.save();
    }

    return res.json({
      success: true,
      videoAccess: grantAccess,
      message: grantAccess
        ? 'Đã cấp quyền xem video bài giảng cho học viên.'
        : 'Đã thu hồi quyền xem video bài giảng.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Có lỗi xảy ra. Vui lòng thử lại.' });
  }
};

// ============================================================
// Luồng Quản Lý Lớp Học Được Giao
// ============================================================
const STUDENT_STATUS_LABEL = {
  0: 'Đang học',
  1: 'Đã rời lớp',
  2: 'Bảo lưu',
  3: 'Bị chặn',
  4: 'Đã loại khỏi lớp'
};

// GET: /Teacher/ClassDetail/:id
controller.getClassDetail = async (req, res) => {
  const classId = parseInt(req.params.id);
  const teacherId = req.session.userId;

  try {
    const cls = await db.Class.findOne({
      where: { Id: classId, TeacherId: teacherId },
      include: [{ model: db.Course, as: 'Course' }]
    });
    if (!cls) {
      return res.status(404).render('error', { message: 'Không tìm thấy lớp học hoặc bạn không có quyền truy cập.' });
    }

    const [enrollments, lessons] = await Promise.all([
      db.ClassStudent.findAll({
        include: [{ model: db.User, as: 'Student' }],
        where: { ClassId: classId },
        order: [['EnrolledAt', 'ASC']]
      }),
      db.Lesson.findAll({
        where: { ClassId: classId },
        order: [['LessonDate', 'ASC'], ['StartTime', 'ASC']]
      })
    ]);

    const activeEnrollments = enrollments.filter(e => e.Status === db.ClassStudent.StatusMap.LEARNING);
    const studentIds = enrollments.map(e => e.StudentId);
    const closedLessons = lessons.filter(l => l.AttendanceStatus === db.Lesson.AttendanceStatusMap.CLOSED);
    const closedLessonIds = closedLessons.map(l => l.Id);
    const lessonIds = lessons.map(l => l.Id);

    const [attendanceRows, assignments] = await Promise.all([
      (closedLessonIds.length > 0 && studentIds.length > 0) ? db.Attendance.findAll({
        where: { LessonId: closedLessonIds, StudentId: studentIds }
      }) : Promise.resolve([]),
      lessonIds.length > 0 ? db.Assignment.findAll({ where: { LessonId: lessonIds } }) : Promise.resolve([])
    ]);

    const assignmentIds = assignments.map(a => a.Id);
    const submissions = assignmentIds.length > 0 ? await db.Submission.findAll({ where: { AssignmentId: assignmentIds, AttemptNumber: 1 } }) : [];

    // Per-student attendance rate (chỉ tính buổi đã khoá, loại trừ vắng có phép khỏi mẫu số)
    const studentPresentMap = {};
    const studentExcusedMap = {};
    attendanceRows.forEach(a => {
      if (a.Status === db.Attendance.StatusMap.PRESENT || a.Status === db.Attendance.StatusMap.LATE) {
        studentPresentMap[a.StudentId] = (studentPresentMap[a.StudentId] || 0) + 1;
      } else if (a.Status === db.Attendance.StatusMap.ABSENT_REQUESTED) {
        studentExcusedMap[a.StudentId] = (studentExcusedMap[a.StudentId] || 0) + 1;
      }
    });

    const studentLateSubmissionMap = {};
    const studentSubmissionsMap = {};
    submissions.forEach(s => {
      if (!studentSubmissionsMap[s.StudentId]) studentSubmissionsMap[s.StudentId] = [];
      studentSubmissionsMap[s.StudentId].push(s);
      const assignment = assignments.find(a => a.Id === s.AssignmentId);
      if (assignment && new Date(s.SubmittedAt) > new Date(assignment.DueDate)) {
        studentLateSubmissionMap[s.StudentId] = (studentLateSubmissionMap[s.StudentId] || 0) + 1;
      }
    });

    const students = enrollments.map(e => {
      const excused = studentExcusedMap[e.StudentId] || 0;
      const denom = closedLessonIds.length - excused;
      const present = studentPresentMap[e.StudentId] || 0;
      const attendanceRate = denom > 0 ? present / denom : 1.0;
      return {
        EnrollmentId: e.Id,
        StudentId: e.StudentId,
        FullName: e.Student ? e.Student.FullName : '',
        Email: e.Student ? e.Student.Email : '',
        AvatarUrl: e.Student ? e.Student.AvatarUrl : null,
        Status: e.Status,
        StatusLabel: STUDENT_STATUS_LABEL[e.Status] || '',
        Note: e.Note,
        StatusReason: e.StatusReason,
        StatusChangedAt: e.StatusChangedAt,
        EnrolledAt: e.EnrolledAt,
        AttendanceRate: attendanceRate,
        LateSubmissionCount: studentLateSubmissionMap[e.StudentId] || 0
      };
    });

    // Thống kê chung của lớp
    const totalPresent = Object.values(studentPresentMap).reduce((a, b) => a + b, 0);
    const totalExcused = Object.values(studentExcusedMap).reduce((a, b) => a + b, 0);
    const possibleSlots = (closedLessonIds.length * activeEnrollments.length) - totalExcused;
    const avgAttendanceRate = possibleSlots > 0 ? totalPresent / possibleSlots : 1.0;

    const onTimeCount = submissions.filter(s => {
      const a = assignments.find(x => x.Id === s.AssignmentId);
      return a && new Date(s.SubmittedAt) <= new Date(a.DueDate);
    }).length;
    const onTimeSubmissionRate = submissions.length > 0 ? onTimeCount / submissions.length : 1.0;

    // Biểu đồ mini: % chuyên cần theo từng buổi đã khoá
    const attendanceTrend = closedLessons.map(l => {
      const rows = attendanceRows.filter(a => a.LessonId === l.Id);
      const present = rows.filter(a => a.Status === db.Attendance.StatusMap.PRESENT || a.Status === db.Attendance.StatusMap.LATE).length;
      const excused = rows.filter(a => a.Status === db.Attendance.StatusMap.ABSENT_REQUESTED).length;
      const denom = activeEnrollments.length - excused;
      return {
        LessonId: l.Id,
        Title: l.Title,
        LessonDate: l.LessonDate,
        Rate: denom > 0 ? present / denom : 1.0
      };
    });

    // Biểu đồ mini: tỉ lệ nộp bài đúng hạn theo từng bài tập
    const submissionTrend = assignments.map(a => {
      const subs = submissions.filter(s => s.AssignmentId === a.Id);
      const onTime = subs.filter(s => new Date(s.SubmittedAt) <= new Date(a.DueDate)).length;
      return {
        AssignmentId: a.Id,
        Title: a.Title,
        OnTimeRate: subs.length > 0 ? onTime / subs.length : null
      };
    });

    // Thẻ cảnh báo: vắng nhiều hoặc điểm thấp bất thường
    const warnings = [];
    students.forEach(s => {
      if (s.Status !== db.ClassStudent.StatusMap.LEARNING) return;
      if (closedLessonIds.length >= 2 && s.AttendanceRate < 0.7) {
        warnings.push({ Type: 'low_attendance', StudentId: s.StudentId, StudentName: s.FullName, Detail: `Tỉ lệ chuyên cần chỉ đạt ${(s.AttendanceRate * 100).toFixed(0)}%` });
      }
      const subs = studentSubmissionsMap[s.StudentId] || [];
      const graded = subs.filter(x => x.Grade !== null && x.Grade !== undefined);
      if (graded.length > 0) {
        const avg = graded.reduce((acc, x) => acc + parseFloat(x.Grade), 0) / graded.length;
        if (avg < 5.0) {
          warnings.push({ Type: 'low_grade', StudentId: s.StudentId, StudentName: s.FullName, Detail: `Điểm trung bình chỉ đạt ${avg.toFixed(1)}/10` });
        }
      }
    });

    // Bảng so sánh nhanh giữa các lớp cùng khoá học do giáo viên này phụ trách
    const siblingClassesRaw = await db.Class.findAll({
      where: { CourseId: cls.CourseId, TeacherId: teacherId, Id: { [db.Sequelize.Op.ne]: classId } }
    });
    const siblingClasses = await Promise.all(siblingClassesRaw.map(async (sib) => {
      const [sibEnrollCount, sibClosedLessons] = await Promise.all([
        db.ClassStudent.count({ where: { ClassId: sib.Id, Status: db.ClassStudent.StatusMap.LEARNING } }),
        db.Lesson.findAll({ where: { ClassId: sib.Id, AttendanceStatus: db.Lesson.AttendanceStatusMap.CLOSED } })
      ]);
      const sibClosedIds = sibClosedLessons.map(l => l.Id);
      let sibAvgAttendance = 1.0;
      if (sibClosedIds.length > 0 && sibEnrollCount > 0) {
        const sibAttendance = await db.Attendance.findAll({ where: { LessonId: sibClosedIds } });
        const sibPresent = sibAttendance.filter(a => a.Status === db.Attendance.StatusMap.PRESENT || a.Status === db.Attendance.StatusMap.LATE).length;
        const sibExcused = sibAttendance.filter(a => a.Status === db.Attendance.StatusMap.ABSENT_REQUESTED).length;
        const sibPossible = (sibClosedIds.length * sibEnrollCount) - sibExcused;
        sibAvgAttendance = sibPossible > 0 ? sibPresent / sibPossible : 1.0;
      }
      return {
        Id: sib.Id,
        ClassName: sib.ClassName,
        StudentCount: sibEnrollCount,
        AvgAttendanceRate: sibAvgAttendance
      };
    }));

    // Audit log gần đây liên quan đến lớp này (Class, các Lesson, các ClassStudent thuộc lớp)
    const enrollmentIds = enrollments.map(e => e.Id);
    const auditLogsRaw = await db.AuditLog.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { EntityType: 'Class', EntityId: classId },
          { EntityType: 'Lesson', EntityId: lessonIds.length > 0 ? lessonIds : [-1] },
          { EntityType: 'ClassStudent', EntityId: enrollmentIds.length > 0 ? enrollmentIds : [-1] }
        ]
      },
      include: [{ model: db.User, as: 'Actor' }],
      order: [['CreatedAt', 'DESC']],
      limit: 30
    });
    const auditLog = auditLogsRaw.map(l => ({
      Id: l.Id,
      Action: l.Action,
      Description: l.Description,
      Reason: l.Reason,
      ActorName: l.Actor ? l.Actor.FullName : 'Hệ thống',
      CreatedAt: l.CreatedAt
    }));

    // Video ghi hình: buổi nào có VideoUrl, học viên nào được xem (đã điểm danh) / bị khoá (chưa điểm danh)
    const lessonsWithVideo = lessons.filter(l => l.VideoUrl);
    const videoLessonIds = lessonsWithVideo.map(l => l.Id);
    const videoAttendance = videoLessonIds.length > 0 ? await db.Attendance.findAll({
      where: { LessonId: videoLessonIds },
      include: [{ model: db.User, as: 'Student' }]
    }) : [];
    const videoAccessByLesson = {};
    videoAttendance.forEach(a => {
      if (!videoAccessByLesson[a.LessonId]) videoAccessByLesson[a.LessonId] = { granted: [], blocked: [] };
      const entry = { StudentId: a.StudentId, FullName: a.Student ? a.Student.FullName : '' };
      if (a.VideoAccess) videoAccessByLesson[a.LessonId].granted.push(entry);
      else videoAccessByLesson[a.LessonId].blocked.push(entry);
    });
    const videoLessons = lessonsWithVideo.map(l => ({
      Id: l.Id,
      Title: l.Title,
      LessonDate: l.LessonDate,
      VideoUrl: l.VideoUrl,
      Granted: (videoAccessByLesson[l.Id] && videoAccessByLesson[l.Id].granted) || [],
      Blocked: (videoAccessByLesson[l.Id] && videoAccessByLesson[l.Id].blocked) || []
    }));

    res.render('teacher/classDetail', {
      Class: cls,
      students,
      lessons,
      videoLessons,
      stats: {
        studentCount: activeEnrollments.length,
        avgAttendanceRate,
        onTimeSubmissionRate,
        attendanceTrend,
        submissionTrend
      },
      warnings,
      siblingClasses,
      auditLog
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang chi tiết lớp học.' });
  }
};

// POST: /Teacher/UpdateClassInfo — Bước 3: sửa mô tả, lịch định kỳ, link phòng học (không sửa học phí/Course gốc)
controller.updateClassInfo = async (req, res) => {
  const { classId, description, schedule, meetingUrl } = req.body;
  const teacherId = req.session.userId;

  try {
    const cls = await db.Class.findOne({ where: { Id: classId, TeacherId: teacherId } });
    if (!cls) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa lớp học này.' });
    }

    const changes = [];
    if (description !== undefined && (description || null) !== (cls.Description || null)) {
      changes.push('Cập nhật mô tả lớp học');
      cls.Description = description || null;
    }
    if (schedule !== undefined && schedule !== cls.Schedule) {
      changes.push('Cập nhật lịch học định kỳ');
      cls.Schedule = schedule;
    }
    if (meetingUrl !== undefined && (meetingUrl || null) !== (cls.MeetingUrl || null)) {
      changes.push('Cập nhật link phòng học online');
      cls.MeetingUrl = meetingUrl || null;
    }

    if (changes.length > 0) {
      await cls.save();
      await auditLogService.logAction({
        actorUserId: teacherId,
        actorRole: 'TEACHER',
        action: 'UPDATE_CLASS_INFO',
        entityType: 'Class',
        entityId: cls.Id,
        description: changes.join('; ')
      });
    }

    res.json({ success: true, message: 'Cập nhật thông tin lớp học thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi cập nhật lớp học.' });
  }
};

// POST: /Teacher/AddMakeupLesson — Bước 4: thêm buổi học bù
controller.addMakeupLesson = async (req, res) => {
  const { classId, title, lessonDate, startTime, endTime, meetingUrl, makeupOfLessonId, applyTo } = req.body;
  const teacherId = req.session.userId;

  try {
    const cls = await db.Class.findOne({ where: { Id: classId, TeacherId: teacherId } });
    if (!cls) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thêm buổi học cho lớp này.' });
    }

    const lesson = await db.Lesson.create({
      ClassId: classId,
      Title: title || 'Buổi học bù',
      LessonDate: new Date(lessonDate),
      StartTime: startTime,
      EndTime: endTime,
      MeetingUrl: meetingUrl || null,
      Status: db.Lesson.StatusMap.SCHEDULED,
      MakeupOfLessonId: makeupOfLessonId ? parseInt(makeupOfLessonId) : null
    });

    await auditLogService.logAction({
      actorUserId: teacherId,
      actorRole: 'TEACHER',
      action: 'ADD_MAKEUP_LESSON',
      entityType: 'Lesson',
      entityId: lesson.Id,
      description: `Thêm buổi học bù "${lesson.Title}" ngày ${new Date(lessonDate).toLocaleDateString('vi-VN')}${makeupOfLessonId ? ` (bù cho buổi #${makeupOfLessonId})` : ''}`
    });

    const enrollments = await db.ClassStudent.findAll({ where: { ClassId: classId, Status: db.ClassStudent.StatusMap.LEARNING } });
    let recipientIds = enrollments.map(e => e.StudentId);
    if (applyTo === 'absent_only' && makeupOfLessonId) {
      const absences = await db.Attendance.findAll({
        where: { LessonId: parseInt(makeupOfLessonId), Status: db.Attendance.StatusMap.ABSENT_REQUESTED }
      });
      const absentIds = new Set(absences.map(a => a.StudentId));
      recipientIds = enrollments.filter(e => absentIds.has(e.StudentId)).map(e => e.StudentId);
    }

    if (recipientIds.length > 0) {
      await notificationService.notifyUsers(recipientIds, {
        title: 'Lịch học bù mới',
        content: `Lớp "${cls.ClassName}" có buổi học bù "${lesson.Title}" vào ${new Date(lessonDate).toLocaleDateString('vi-VN')} (${startTime} - ${endTime}).`,
        linkUrl: '/Student/Dashboard'
      });
    }

    res.json({ success: true, lesson, message: 'Đã thêm buổi học bù và gửi thông báo cho học viên liên quan.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi thêm buổi học bù.' });
  }
};

// POST: /Teacher/CancelLesson — Bước 4: huỷ buổi học (giáo viên bận đột xuất)
controller.cancelLesson = async (req, res) => {
  const { lessonId, reason } = req.body;
  const teacherId = req.session.userId;

  try {
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do huỷ buổi học.' });
    }

    const lesson = await db.Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy buổi học.' });
    }
    const cls = await db.Class.findOne({ where: { Id: lesson.ClassId, TeacherId: teacherId } });
    if (!cls) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền huỷ buổi học này.' });
    }

    lesson.Status = db.Lesson.StatusMap.CANCELLED;
    lesson.CancelReason = reason.trim();
    await lesson.save();

    await auditLogService.logAction({
      actorUserId: teacherId,
      actorRole: 'TEACHER',
      action: 'CANCEL_LESSON',
      entityType: 'Lesson',
      entityId: lesson.Id,
      description: `Huỷ buổi học "${lesson.Title}"`,
      reason: reason.trim()
    });

    const enrollments = await db.ClassStudent.findAll({ where: { ClassId: lesson.ClassId, Status: db.ClassStudent.StatusMap.LEARNING } });
    if (enrollments.length > 0) {
      await notificationService.notifyUsers(enrollments.map(e => e.StudentId), {
        title: 'Buổi học đã bị huỷ',
        content: `Buổi học "${lesson.Title}" (lớp "${cls.ClassName}") đã bị huỷ. Lý do: ${reason.trim()}`,
        linkUrl: '/Student/Dashboard'
      });
    }

    res.json({ success: true, message: 'Đã huỷ buổi học. Bạn có thể thêm ngay một buổi học bù thay thế.', suggestMakeup: true, cancelledLessonId: lesson.Id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi huỷ buổi học.' });
  }
};

// POST: /Teacher/RescheduleLesson — Bước 4: đổi giờ/link phòng của 1 buổi cụ thể, không sửa lịch định kỳ cả lớp
controller.rescheduleLesson = async (req, res) => {
  const { lessonId, lessonDate, startTime, endTime, meetingUrl } = req.body;
  const teacherId = req.session.userId;

  try {
    const lesson = await db.Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy buổi học.' });
    }
    const cls = await db.Class.findOne({ where: { Id: lesson.ClassId, TeacherId: teacherId } });
    if (!cls) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền đổi lịch buổi học này.' });
    }

    const oldInfo = `${new Date(lesson.LessonDate).toLocaleDateString('vi-VN')} ${lesson.StartTime}-${lesson.EndTime}`;
    if (lessonDate) lesson.LessonDate = new Date(lessonDate);
    if (startTime) lesson.StartTime = startTime;
    if (endTime) lesson.EndTime = endTime;
    if (meetingUrl !== undefined) lesson.MeetingUrl = meetingUrl || null;
    lesson.ReminderSentAt = null; // reset để job nhắc lịch gửi lại đúng theo giờ mới
    await lesson.save();
    const newInfo = `${new Date(lesson.LessonDate).toLocaleDateString('vi-VN')} ${lesson.StartTime}-${lesson.EndTime}`;

    await auditLogService.logAction({
      actorUserId: teacherId,
      actorRole: 'TEACHER',
      action: 'RESCHEDULE_LESSON',
      entityType: 'Lesson',
      entityId: lesson.Id,
      description: `Đổi lịch buổi "${lesson.Title}": ${oldInfo} → ${newInfo}`
    });

    const enrollments = await db.ClassStudent.findAll({ where: { ClassId: lesson.ClassId, Status: db.ClassStudent.StatusMap.LEARNING } });
    if (enrollments.length > 0) {
      await notificationService.notifyUsers(enrollments.map(e => e.StudentId), {
        title: 'Buổi học đã đổi lịch',
        content: `Buổi học "${lesson.Title}" (lớp "${cls.ClassName}") đã đổi từ ${oldInfo} sang ${newInfo}.`,
        linkUrl: '/Student/Dashboard'
      });
    }

    res.json({ success: true, lesson, message: 'Đã cập nhật lịch buổi học.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi đổi lịch buổi học.' });
  }
};

// POST: /Teacher/AddStudentNote — Bước 5: ghi chú nội bộ, chỉ giáo viên lớp xem được
controller.addStudentNote = async (req, res) => {
  const { enrollmentId, note } = req.body;
  const teacherId = req.session.userId;

  try {
    const enrollment = await db.ClassStudent.findByPk(enrollmentId, { include: [{ model: db.Class, as: 'Class' }] });
    if (!enrollment || !enrollment.Class || enrollment.Class.TeacherId !== teacherId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền ghi chú học viên này.' });
    }

    enrollment.Note = note || null;
    await enrollment.save();

    res.json({ success: true, message: 'Đã lưu ghi chú.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu ghi chú.' });
  }
};

// POST: /Teacher/TransferStudent — Bước 5: chuyển học viên sang lớp khác cùng Course, không huỷ đăng ký/đăng ký lại
controller.transferStudent = async (req, res) => {
  const { enrollmentId, targetClassId } = req.body;
  const teacherId = req.session.userId;

  try {
    const enrollment = await db.ClassStudent.findByPk(enrollmentId, {
      include: [{ model: db.Class, as: 'Class' }, { model: db.User, as: 'Student' }]
    });
    if (!enrollment || !enrollment.Class || enrollment.Class.TeacherId !== teacherId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chuyển học viên này.' });
    }

    const targetClass = await db.Class.findOne({
      where: { Id: targetClassId, TeacherId: teacherId, CourseId: enrollment.Class.CourseId }
    });
    if (!targetClass) {
      return res.status(400).json({ success: false, message: 'Lớp đích không hợp lệ (phải cùng khoá học và do bạn phụ trách).' });
    }

    const existing = await db.ClassStudent.findOne({ where: { ClassId: targetClassId, StudentId: enrollment.StudentId } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Học viên đã có mặt trong lớp đích.' });
    }

    const oldClassName = enrollment.Class.ClassName;
    enrollment.ClassId = targetClassId;
    enrollment.StatusReason = `Chuyển từ lớp "${oldClassName}"`;
    enrollment.StatusChangedAt = new Date();
    await enrollment.save();

    await auditLogService.logAction({
      actorUserId: teacherId,
      actorRole: 'TEACHER',
      action: 'TRANSFER_STUDENT',
      entityType: 'ClassStudent',
      entityId: enrollment.Id,
      description: `Chuyển học viên "${enrollment.Student ? enrollment.Student.FullName : ''}" từ lớp "${oldClassName}" sang lớp "${targetClass.ClassName}"`
    });

    await notificationService.notifyUser(enrollment.StudentId, {
      title: 'Bạn đã được chuyển lớp',
      content: `Bạn đã được chuyển từ lớp "${oldClassName}" sang lớp "${targetClass.ClassName}".`,
      linkUrl: '/Student/Dashboard'
    });

    res.json({ success: true, message: 'Đã chuyển học viên sang lớp mới.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi chuyển lớp.' });
  }
};

// POST: /Teacher/BlockStudent — Bước 6: chặn tạm khoá (còn trong danh sách lớp, mất quyền truy cập bài tập/video)
controller.blockStudent = async (req, res) => {
  const { enrollmentId, reason } = req.body;
  const teacherId = req.session.userId;

  try {
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do chặn học viên.' });
    }

    const enrollment = await db.ClassStudent.findByPk(enrollmentId, {
      include: [{ model: db.Class, as: 'Class' }, { model: db.User, as: 'Student' }]
    });
    if (!enrollment || !enrollment.Class || enrollment.Class.TeacherId !== teacherId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thao tác với học viên này.' });
    }

    enrollment.Status = db.ClassStudent.StatusMap.BLOCKED;
    enrollment.StatusReason = reason.trim();
    enrollment.StatusChangedAt = new Date();
    await enrollment.save();

    await auditLogService.logAction({
      actorUserId: teacherId,
      actorRole: 'TEACHER',
      action: 'BLOCK_STUDENT',
      entityType: 'ClassStudent',
      entityId: enrollment.Id,
      description: `Chặn học viên "${enrollment.Student ? enrollment.Student.FullName : ''}" trong lớp "${enrollment.Class.ClassName}"`,
      reason: reason.trim()
    });

    res.json({ success: true, message: 'Đã chặn học viên. Học viên mất quyền truy cập bài tập/video cho đến khi được mở lại.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi chặn học viên.' });
  }
};

// POST: /Teacher/UnblockStudent — mở lại quyền truy cập bất kỳ lúc nào
controller.unblockStudent = async (req, res) => {
  const { enrollmentId } = req.body;
  const teacherId = req.session.userId;

  try {
    const enrollment = await db.ClassStudent.findByPk(enrollmentId, {
      include: [{ model: db.Class, as: 'Class' }, { model: db.User, as: 'Student' }]
    });
    if (!enrollment || !enrollment.Class || enrollment.Class.TeacherId !== teacherId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thao tác với học viên này.' });
    }

    enrollment.Status = db.ClassStudent.StatusMap.LEARNING;
    enrollment.StatusReason = null;
    enrollment.StatusChangedAt = new Date();
    await enrollment.save();

    await auditLogService.logAction({
      actorUserId: teacherId,
      actorRole: 'TEACHER',
      action: 'UNBLOCK_STUDENT',
      entityType: 'ClassStudent',
      entityId: enrollment.Id,
      description: `Mở lại quyền truy cập cho học viên "${enrollment.Student ? enrollment.Student.FullName : ''}" trong lớp "${enrollment.Class.ClassName}"`
    });

    res.json({ success: true, message: 'Đã mở lại quyền truy cập cho học viên.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi mở lại quyền truy cập.' });
  }
};

// POST: /Teacher/KickStudent — Bước 6: loại hẳn khỏi lớp, giữ lại toàn bộ lịch sử điểm số/bài làm
controller.kickStudent = async (req, res) => {
  const { enrollmentId, reason } = req.body;
  const teacherId = req.session.userId;

  try {
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do loại học viên khỏi lớp.' });
    }

    const enrollment = await db.ClassStudent.findByPk(enrollmentId, {
      include: [{ model: db.Class, as: 'Class' }, { model: db.User, as: 'Student' }]
    });
    if (!enrollment || !enrollment.Class || enrollment.Class.TeacherId !== teacherId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thao tác với học viên này.' });
    }

    enrollment.Status = db.ClassStudent.StatusMap.KICKED;
    enrollment.StatusReason = reason.trim();
    enrollment.StatusChangedAt = new Date();
    await enrollment.save(); // Không xoá Submission/Attendance — chỉ đổi trạng thái ClassStudent

    await auditLogService.logAction({
      actorUserId: teacherId,
      actorRole: 'TEACHER',
      action: 'KICK_STUDENT',
      entityType: 'ClassStudent',
      entityId: enrollment.Id,
      description: `Loại học viên "${enrollment.Student ? enrollment.Student.FullName : ''}" khỏi lớp "${enrollment.Class.ClassName}"`,
      reason: reason.trim()
    });

    res.json({ success: true, message: 'Đã loại học viên khỏi lớp. Lịch sử điểm số/bài làm được giữ nguyên.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi loại học viên khỏi lớp.' });
  }
};

// POST: /Teacher/NotifyClass — gửi thông báo nhanh cho cả lớp
controller.notifyClass = async (req, res) => {
  const { classId, title, content } = req.body;
  const teacherId = req.session.userId;

  try {
    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.' });
    }

    const cls = await db.Class.findOne({ where: { Id: classId, TeacherId: teacherId } });
    if (!cls) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền gửi thông báo cho lớp này.' });
    }

    const enrollments = await db.ClassStudent.findAll({ where: { ClassId: classId, Status: db.ClassStudent.StatusMap.LEARNING } });
    if (enrollments.length > 0) {
      await notificationService.notifyUsers(enrollments.map(e => e.StudentId), {
        title: title.trim(),
        content: content.trim(),
        linkUrl: '/Student/Dashboard'
      });
    }

    res.json({ success: true, message: `Đã gửi thông báo cho ${enrollments.length} học viên trong lớp.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi gửi thông báo.' });
  }
};

// POST: /Teacher/CloneClass — nhân bản cấu trúc lớp (không sao chép học viên/buổi học)
controller.cloneClass = async (req, res) => {
  const { classId, className, startDate, endDate } = req.body;
  const teacherId = req.session.userId;

  try {
    const cls = await db.Class.findOne({ where: { Id: classId, TeacherId: teacherId } });
    if (!cls) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền nhân bản lớp học này.' });
    }
    if (!className || !className.trim() || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên lớp mới, ngày bắt đầu và ngày kết thúc.' });
    }

    const newClass = await db.Class.create({
      CourseId: cls.CourseId,
      TeacherId: teacherId,
      ClassName: className.trim(),
      MaxStudents: cls.MaxStudents,
      StartDate: new Date(startDate),
      EndDate: new Date(endDate),
      Schedule: cls.Schedule,
      Status: db.Class.StatusMap.UPCOMING,
      Description: cls.Description,
      MeetingUrl: cls.MeetingUrl
    });

    await auditLogService.logAction({
      actorUserId: teacherId,
      actorRole: 'TEACHER',
      action: 'CLONE_CLASS',
      entityType: 'Class',
      entityId: newClass.Id,
      description: `Nhân bản lớp "${cls.ClassName}" thành lớp mới "${newClass.ClassName}"`
    });

    res.json({ success: true, classId: newClass.Id, message: 'Đã tạo lớp mới cùng cấu trúc. Bạn cần tự thêm buổi học và học viên cho lớp mới.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi nhân bản lớp học.' });
  }
};

// GET: /Teacher/ExportClassExcel/:id
controller.exportClassExcel = async (req, res) => {
  const classId = parseInt(req.params.id);
  const teacherId = req.session.userId;

  try {
    const cls = await db.Class.findOne({ where: { Id: classId, TeacherId: teacherId } });
    if (!cls) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xuất danh sách lớp này.' });
    }

    const enrollments = await db.ClassStudent.findAll({
      include: [{ model: db.User, as: 'Student' }],
      where: { ClassId: classId },
      order: [['EnrolledAt', 'ASC']]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Danh sách lớp');
    sheet.columns = [
      { header: 'Họ tên', key: 'name', width: 28 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Trạng thái', key: 'status', width: 16 },
      { header: 'Ngày vào lớp', key: 'enrolledAt', width: 16 },
      { header: 'Ghi chú', key: 'note', width: 32 }
    ];
    enrollments.forEach((e) => {
      sheet.addRow({
        name: e.Student ? e.Student.FullName : '',
        email: e.Student ? e.Student.Email : '',
        status: STUDENT_STATUS_LABEL[e.Status] || '',
        enrolledAt: new Date(e.EnrolledAt).toLocaleDateString('vi-VN'),
        note: e.Note || ''
      });
    });
    sheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="danh-sach-${cls.ClassName.replace(/\s+/g, '-')}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi xuất Excel.' });
  }
};

// GET: /Teacher/ExportClassPdf/:id
controller.exportClassPdf = async (req, res) => {
  const classId = parseInt(req.params.id);
  const teacherId = req.session.userId;

  try {
    const cls = await db.Class.findOne({ where: { Id: classId, TeacherId: teacherId } });
    if (!cls) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xuất danh sách lớp này.' });
    }

    const enrollments = await db.ClassStudent.findAll({
      include: [{ model: db.User, as: 'Student' }],
      where: { ClassId: classId },
      order: [['EnrolledAt', 'ASC']]
    });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="danh-sach-${cls.ClassName.replace(/\s+/g, '-')}.pdf"`);
    doc.pipe(res);

    doc.font(VIETNAMESE_FONT_PATH);
    doc.fontSize(16).text(`Danh sách lớp: ${cls.ClassName}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10);
    enrollments.forEach((e, idx) => {
      doc.text(`${idx + 1}. ${e.Student ? e.Student.FullName : ''} - ${e.Student ? e.Student.Email : ''} - ${STUDENT_STATUS_LABEL[e.Status] || ''}`);
    });
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi xuất PDF.' });
  }
};

controller.upload = upload;
controller.videoUpload = videoUpload;
module.exports = controller;

