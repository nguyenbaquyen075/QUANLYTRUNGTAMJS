const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models');
const { requireAuth } = require('../middleware/auth');
const { sendNotificationToUser } = require('../sockets/signalRCompat');
const { uploadToCloud } = require('../utils/cloudinary');

// Multer config for Course images and general admin uploads
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

function deleteUploadFile(relativeUrl) {
  if (!relativeUrl) return;
  const filename = relativeUrl.replace('/uploads/', '');
  const filePath = path.join(__dirname, '../../public/uploads', filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    } catch (err) {
      console.error(`Error deleting file: ${filePath}`, err);
    }
  }
}

function parseScheduleDays(scheduleDays) {
  const days = [];
  if (!scheduleDays) return days;

  const parts = scheduleDays.split(/[,;| -]+/).filter(Boolean);
  parts.forEach(part => {
    const clean = part.trim().toLowerCase();
    if (clean === 'cn' || clean === 'chủ nhật' || clean === 'chunhat' || clean === '8' || clean === '0' || clean === 'sunday' || clean === 'sun') {
      days.push(0);
    } else if (clean === '2' || clean === 't2' || clean === 'hai' || clean === 'thứ hai' || clean === 'thứ 2' || clean === 'monday' || clean === 'mon') {
      days.push(1);
    } else if (clean === '3' || clean === 't3' || clean === 'ba' || clean === 'thứ ba' || clean === 'thứ 3' || clean === 'tuesday' || clean === 'tue') {
      days.push(2);
    } else if (clean === '4' || clean === 't4' || clean === 'tư' || clean === 'thứ tư' || clean === 'thứ 4' || clean === 'wednesday' || clean === 'wed') {
      days.push(3);
    } else if (clean === '5' || clean === 't5' || clean === 'năm' || clean === 'thứ năm' || clean === 'thứ 5' || clean === 'thursday' || clean === 'thu') {
      days.push(4);
    } else if (clean === '6' || clean === 't6' || clean === 'sáu' || clean === 'thứ sáu' || clean === 'thứ 6' || clean === 'friday' || clean === 'fri') {
      days.push(5);
    } else if (clean === '7' || clean === 't7' || clean === 'bảy' || clean === 'thứ bảy' || clean === 'thứ 7' || clean === 'saturday' || clean === 'sat') {
      days.push(6);
    } else {
      const parsed = parseInt(clean);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 7) {
        days.push(parsed === 8 ? 0 : parsed);
      }
    }
  });

  return [...new Set(days)];
}

// GET: /Admin/Dashboard
router.get('/Admin/Dashboard', requireAuth(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const activeTab = req.query.tab || 'tabCourses';

    // Fetch stats
    const totalUsers = await db.User.count();
    const totalCourses = await db.Course.count();
    const totalClasses = await db.Class.count();
    const totalInvoices = await db.Invoice.count();
    const totalPayments = await db.Payment.sum('Amount') || 0;
    const totalLeads = await db.AiChatSession.count({
      where: {
        [db.Sequelize.Op.or]: [
          { LeadName: { [db.Sequelize.Op.ne]: null } },
          { LeadPhone: { [db.Sequelize.Op.ne]: null } }
        ]
      }
    });

    // Fetch collections
    const courses = await db.Course.findAll({ order: [['Id', 'DESC']] });
    
    const classes = await db.Class.findAll({
      include: [
        { model: db.Course, as: 'Course' },
        { model: db.User, as: 'Teacher' }
      ],
      order: [['Id', 'DESC']]
    });

    const teachers = await db.User.findAll({
      where: { Role: db.User.RoleMap.TEACHER },
      include: [{ model: db.UserProfile, as: 'Profile' }]
    });

    const students = await db.User.findAll({
      where: { Role: db.User.RoleMap.STUDENT }
    });

    const users = await db.User.findAll({ order: [['Id', 'DESC']] });

    const invoices = await db.Invoice.findAll({
      include: [
        { model: db.User, as: 'Student' },
        { model: db.Class, as: 'Class' }
      ],
      order: [['Id', 'DESC']]
    });

    const leads = await db.AiChatSession.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { LeadName: { [db.Sequelize.Op.ne]: null } },
          { LeadPhone: { [db.Sequelize.Op.ne]: null } }
        ]
      },
      order: [['Id', 'DESC']]
    });

    const payments = await db.Payment.findAll({
      include: [
        {
          model: db.Invoice,
          as: 'Invoice',
          include: [{ model: db.User, as: 'Student' }]
        }
      ],
      order: [['PaymentTime', 'DESC']]
    });

    const classProgress = [];
    for (const c of classes) {
      const totalLessons = c.Course ? c.Course.TotalLessons : 12;
      const taughtLessons = await db.Lesson.count({
        where: { ClassId: c.Id, Status: 2 } // FINISHED = 2
      });
      classProgress.push({
        ClassId: c.Id,
        ClassName: c.ClassName,
        CourseTitle: c.Course ? c.Course.Title : 'N/A',
        TeacherName: c.Teacher ? c.Teacher.FullName : 'Chưa phân công',
        TotalLessons: totalLessons,
        TaughtLessons: taughtLessons
      });
    }

    const studentKpiList = [];
    const finishedLessonsList = await db.Lesson.findAll({
      where: { Status: 2 }, // FINISHED = 2
      attributes: ['Id']
    });
    const finishedLessonIds = finishedLessonsList.map(l => l.Id);

    const totalAssignmentsGlobal = await db.Assignment.count();

    for (const stud of students) {
      let attendanceRate = 1.0;
      if (finishedLessonIds.length > 0) {
        const presentCount = await db.Attendance.count({
          where: {
            LessonId: finishedLessonIds,
            StudentId: stud.Id,
            Status: {
              [db.Sequelize.Op.or]: [
                db.Attendance.StatusMap.PRESENT,
                db.Attendance.StatusMap.LATE
              ]
            }
          }
        });
        attendanceRate = presentCount / finishedLessonIds.length;
      }

      const studentSubmissions = await db.Submission.findAll({
        where: { StudentId: stud.Id }
      });

      let avgGrade = 0.0;
      const gradedCount = studentSubmissions.filter(s => s.Grade !== null).length;
      if (gradedCount > 0) {
        const sum = studentSubmissions.filter(s => s.Grade !== null).reduce((acc, s) => acc + parseFloat(s.Grade), 0);
        avgGrade = sum / gradedCount;
      }

      let completionRate = 0.0;
      if (totalAssignmentsGlobal > 0) {
        completionRate = studentSubmissions.length / totalAssignmentsGlobal;
      }

      let rating = 'Đạt';
      if (avgGrade >= 8.5 && completionRate >= 0.9 && attendanceRate >= 0.9) rating = 'Xuất sắc';
      else if (avgGrade >= 7.0 && completionRate >= 0.75 && attendanceRate >= 0.8) rating = 'Khá';
      else if (avgGrade < 5.0 || completionRate < 0.5 || attendanceRate < 0.6) rating = 'Yếu - Cần phụ đạo';

      studentKpiList.push({
        StudentId: stud.Id,
        FullName: stud.FullName,
        AvgGrade: avgGrade,
        CompletionRate: completionRate,
        AttendanceRate: attendanceRate,
        RatingClass: rating
      });
    }

    const teacherKpiList = [];
    for (const t of teachers) {
      const activeClasses = await db.Class.count({
        where: { TeacherId: t.Id, Status: { [db.Sequelize.Op.ne]: 2 } } // Not COMPLETED = 2
      });

      const teacherLessons = await db.Lesson.findAll({
        include: [{
          model: db.Class,
          as: 'Class',
          where: { TeacherId: t.Id }
        }],
        where: { Status: 2 } // FINISHED = 2
      });

      const taughtLessons = teacherLessons.length;
      const teacherFinishedLessonIds = teacherLessons.map(l => l.Id);

      let avgAttendance = 1.0;
      if (teacherFinishedLessonIds.length > 0) {
        let totalPresents = 0;
        let totalPossible = 0;

        for (const lid of teacherFinishedLessonIds) {
          const lesson = teacherLessons.find(l => l.Id === lid);
          if (lesson) {
            const enrolledStudents = await db.ClassStudent.count({
              where: { ClassId: lesson.ClassId, Status: db.ClassStudent.StatusMap.LEARNING }
            });
            if (enrolledStudents > 0) {
              const presents = await db.Attendance.count({
                where: {
                  LessonId: lid,
                  Status: {
                    [db.Sequelize.Op.or]: [
                      db.Attendance.StatusMap.PRESENT,
                      db.Attendance.StatusMap.LATE
                    ]
                  }
                }
              });
              totalPresents += presents;
              totalPossible += enrolledStudents;
            }
          }
        }

        if (totalPossible > 0) {
          avgAttendance = totalPresents / totalPossible;
        }
      }

      let rating = 'Đạt';
      if (taughtLessons >= 15 && avgAttendance >= 0.9) rating = 'Xuất sắc';
      else if (taughtLessons >= 8 && avgAttendance >= 0.8) rating = 'Tốt';
      else if (taughtLessons < 4 || avgAttendance < 0.6) rating = 'Cần cải tiến';

      teacherKpiList.push({
        TeacherId: t.Id,
        FullName: t.FullName,
        ActiveClassesCount: activeClasses,
        LessonsTaughtCount: taughtLessons,
        AvgClassAttendance: avgAttendance,
        PerformanceRating: rating
      });
    }

    const activeStudents = students.filter(s => s.Status === db.User.StatusMap.ACTIVE);

    res.render('admin/dashboard', {
      activeTab,
      stats: { totalUsers, totalCourses, totalClasses, totalInvoices, totalPayments: Number(totalPayments), totalLeads },
      courses,
      classes,
      teachers,
      students,
      users,
      invoices,
      leads,
      payments,
      classProgress,
      studentKpis: studentKpiList,
      teacherKpis: teacherKpiList,
      activeStudents
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang dashboard.' });
  }
});

// POST: /Admin/CreateCourse
router.post('/Admin/CreateCourse', requireAuth(['ADMIN', 'STAFF']), upload.single('courseImage'), async (req, res) => {
  const { courseCode, title, description, basePrice, totalLessons, tags } = req.body;
  
  try {
    let imageUrl = null;
    if (req.file) {
      const cloudinaryUrl = await uploadToCloud(req.file.path, 'courses');
      imageUrl = cloudinaryUrl || `/uploads/${req.file.filename}`;
    }

    await db.Course.create({
      CourseCode: courseCode,
      Title: title,
      Description: description,
      BasePrice: parseFloat(basePrice) || 0,
      TotalLessons: parseInt(totalLessons) || 12,
      MetadataTags: tags,
      ImageUrl: imageUrl,
      EmbeddingVector: '',
      Status: db.Course.StatusMap.ACTIVE,
      CreatedAt: new Date()
    });

    req.session.successMessage = `Tạo khóa học '${title}' thành công!`;
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Lỗi hệ thống khi tạo khóa học.';
  }
  res.redirect('/Admin/Dashboard?tab=tabCourses');
});

// POST: /Course/Update/:id
router.post('/Course/Update/:id', requireAuth(['ADMIN', 'STAFF', 'TEACHER']), upload.single('courseImage'), async (req, res) => {
  const courseId = parseInt(req.params.id);
  const { title, description, basePrice, totalLessons, tags, removeImage } = req.body;

  try {
    const course = await db.Course.findByPk(courseId);
    if (!course) {
      req.session.errorMessage = 'Không tìm thấy khóa học.';
      return res.redirect(req.session.role === 'TEACHER' ? '/Teacher/Dashboard' : '/Admin/Dashboard?tab=tabCourses');
    }

    course.Title = title || course.Title;
    course.Description = description || course.Description;
    if (basePrice !== undefined) course.BasePrice = parseFloat(basePrice) || 0;
    if (totalLessons !== undefined) course.TotalLessons = parseInt(totalLessons) || 12;
    if (tags !== undefined) course.MetadataTags = tags;
    
    if (removeImage === 'true') {
      deleteUploadFile(course.ImageUrl);
      course.ImageUrl = null;
    } else if (req.file) {
      const cloudinaryUrl = await uploadToCloud(req.file.path, 'courses');
      const newImageUrl = cloudinaryUrl || `/uploads/${req.file.filename}`;
      deleteUploadFile(course.ImageUrl);
      course.ImageUrl = newImageUrl;
    }

    await course.save();
    req.session.successMessage = `Cập nhật khóa học '${course.Title}' thành công!`;
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Lỗi hệ thống khi cập nhật khóa học.';
  }

  res.redirect(req.session.role === 'TEACHER' ? '/Teacher/Dashboard' : '/Admin/Dashboard?tab=tabCourses');
});

// POST: /Admin/CreateClass
router.post('/Admin/CreateClass', requireAuth(['ADMIN', 'STAFF']), async (req, res) => {
  const { courseId, teacherId, className, maxStudents, startDate, endDate, scheduleDays, scheduleTimes } = req.body;

  const days = parseScheduleDays(scheduleDays);
  if (days.length === 0) {
    req.session.errorMessage = 'Lịch học hàng tuần (Thứ) không đúng định dạng. Ví dụ: 2,5';
    return res.redirect(courseId ? `/Admin/Courses/${courseId}/Classes` : '/Admin/Dashboard?tab=tabCourses');
  }

  const times = scheduleTimes.split('-');
  if (times.length !== 2) {
    req.session.errorMessage = 'Thời gian học không đúng định dạng HH:mm-HH:mm';
    return res.redirect(courseId ? `/Admin/Courses/${courseId}/Classes` : '/Admin/Dashboard?tab=tabCourses');
  }

  try {
    const startT = times[0] + ':00';
    const endT = times[1] + ':00';

    const scheduleList = days.map(d => ({
      day_of_week: d,
      start_time: startT,
      end_time: endT
    }));
    const scheduleJson = JSON.stringify(scheduleList);

    // Conflict Check
    const conflictingClasses = await db.Class.findAll({
      where: {
        TeacherId: teacherId,
        Status: { [db.Sequelize.Op.ne]: db.Class.StatusMap.COMPLETED }
      }
    });

    const startD = new Date(startDate);
    const endD = new Date(endDate);

    for (const cc of conflictingClasses) {
      const ccStartD = new Date(cc.StartDate);
      const ccEndD = new Date(cc.EndDate);

      // Date overlap check
      if (startD <= ccEndD && endD >= ccStartD) {
        try {
          const ccSchedule = JSON.parse(cc.Schedule);
          if (Array.isArray(ccSchedule)) {
            for (const s of ccSchedule) {
              const ccDay = parseInt(s.day_of_week);
              const ccStart = s.start_time;
              const ccEnd = s.end_time;

              if (days.includes(ccDay)) {
                // Time overlap check: max(start1, start2) < min(end1, end2)
                const maxStart = startT > ccStart ? startT : ccStart;
                const minEnd = endT < ccEnd ? endT : ccEnd;

                if (maxStart < minEnd) {
                  req.session.errorMessage = `Xung đột lịch! Giáo viên đã có lịch dạy ở lớp '${cc.ClassName}' vào thứ ${ccDay} lúc ${ccStart}-${ccEnd}.`;
                  return res.redirect(courseId ? `/Admin/Courses/${courseId}/Classes` : '/Admin/Dashboard?tab=tabCourses');
                }
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Create Class
    const newClass = await db.Class.create({
      CourseId: courseId,
      TeacherId: teacherId,
      ClassName: className,
      MaxStudents: parseInt(maxStudents) || 30,
      StartDate: startD,
      EndDate: endD,
      Schedule: scheduleJson,
      Status: db.Class.StatusMap.UPCOMING
    });

    // Generate Lessons
    const lessons = [];
    const course = await db.Course.findByPk(courseId);
    const targetLessonsCount = course ? course.TotalLessons : 12;
    let lessonCount = 0;
    let currentDate = new Date(startD);

    while (lessonCount < targetLessonsCount && currentDate <= endD) {
      const dayOfWeek = currentDate.getDay(); // Sunday = 0, Monday = 1...
      if (days.includes(dayOfWeek)) {
        lessonCount++;
        lessons.push({
          ClassId: newClass.Id,
          Title: `Buổi ${lessonCount}: Bài học chuyên đề số ${lessonCount}`,
          LessonDate: new Date(currentDate),
          StartTime: startT,
          EndTime: endT,
          MeetingUrl: 'https://zoom.us/j/99988877766',
          MeetingId: '999 8887 7766',
          MeetingPassword: '123',
          Status: db.Lesson.StatusMap.SCHEDULED
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    await db.Lesson.bulkCreate(lessons);

    // Notify Teacher
    const notifTeacher = await db.Notification.create({
      UserId: teacherId,
      Title: 'Phân công lớp học mới',
      Content: `Bạn được phân công phụ trách lớp học mới '${className}' thuộc khóa học '${course ? course.Title : ''}'. Tổng số: ${lessons.length} buổi học.`,
      LinkUrl: '/Teacher/Dashboard',
      CreatedAt: new Date()
    });

    const createdAtStr = new Date(notifTeacher.CreatedAt).toLocaleDateString('vi-VN') + ' ' + new Date(notifTeacher.CreatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    sendNotificationToUser(teacherId, {
      title: notifTeacher.Title,
      content: notifTeacher.Content,
      linkUrl: notifTeacher.LinkUrl,
      createdAt: createdAtStr
    });

    // Notify Admin
    const adminId = req.session.userId;
    const notifAdmin = await db.Notification.create({
      UserId: adminId,
      Title: 'Tạo lớp học thành công',
      Content: `Bạn đã tạo thành công lớp học '${className}' và hệ thống đã sinh ${lessons.length} buổi học tự động.`,
      LinkUrl: '/Admin/Dashboard',
      CreatedAt: new Date()
    });

    sendNotificationToUser(adminId, {
      title: notifAdmin.Title,
      content: notifAdmin.Content,
      linkUrl: notifAdmin.LinkUrl,
      createdAt: createdAtStr
    });

    req.session.successMessage = `Tạo lớp '${className}' thành công và tự động tạo ${lessons.length} buổi học!`;
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra khi tạo lớp học.';
  }
  res.redirect(courseId ? `/Admin/Courses/${courseId}/Classes` : '/Admin/Dashboard?tab=tabCourses');
});

// POST: /Admin/CreateUser
router.post('/Admin/CreateUser', requireAuth(['ADMIN', 'STAFF']), async (req, res) => {
  const { fullName, email, phone, password, role } = req.body;

  if (!fullName || !email || !phone || !password) {
    req.session.errorMessage = 'Vui lòng điền đầy đủ thông tin.';
    return res.redirect('/Admin/Dashboard?tab=tabTeachers');
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    const existingEmail = await db.User.findOne({
      where: db.sequelize.where(db.sequelize.fn('LOWER', db.sequelize.col('Email')), normalizedEmail)
    });
    if (existingEmail) {
      req.session.errorMessage = 'Email này đã được sử dụng.';
      return res.redirect('/Admin/Dashboard?tab=tabTeachers');
    }

    const existingPhone = await db.User.findOne({ where: { Phone: trimmedPhone } });
    if (existingPhone) {
      req.session.errorMessage = 'Số điện thoại này đã được sử dụng.';
      return res.redirect('/Admin/Dashboard?tab=tabTeachers');
    }

    const roleVal = db.User.RoleMap[role] !== undefined ? db.User.RoleMap[role] : db.User.RoleMap.STUDENT;

    const newUser = await db.User.create({
      FullName: fullName.trim(),
      Email: normalizedEmail,
      Phone: trimmedPhone,
      PasswordHash: bcrypt.hashSync(password, 11),
      Role: roleVal,
      Status: db.User.StatusMap.ACTIVE,
      CreatedAt: new Date()
    });

    await db.UserProfile.create({ UserId: newUser.Id });

    req.session.successMessage = `Tạo tài khoản người dùng '${fullName}' thành công!`;
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra khi tạo tài khoản.';
  }
  res.redirect('/Admin/Dashboard?tab=tabTeachers');
});

// POST: /Admin/ToggleUserStatus
router.post('/Admin/ToggleUserStatus/:id', requireAuth(['ADMIN', 'STAFF']), async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const user = await db.User.findByPk(id);
    if (!user) {
      req.session.errorMessage = 'Không tìm thấy người dùng.';
      return res.redirect('/Admin/Dashboard?tab=tabTeachers');
    }

    if (user.Id === req.session.userId) {
      req.session.errorMessage = 'Bạn không thể tự khóa tài khoản của chính mình.';
      return res.redirect('/Admin/Dashboard?tab=tabTeachers');
    }

    user.Status = user.Status === db.User.StatusMap.ACTIVE ? db.User.StatusMap.INACTIVE : db.User.StatusMap.ACTIVE;
    await user.save();

    req.session.successMessage = `Đã cập nhật trạng thái hoạt động cho tài khoản ${user.FullName}!`;
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra khi cập nhật trạng thái.';
  }
  res.redirect('/Admin/Dashboard?tab=tabTeachers');
});

// POST: /Admin/DeleteUser/:id
router.post('/Admin/DeleteUser/:id', requireAuth(['ADMIN', 'STAFF']), async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const user = await db.User.findByPk(id);
    if (!user) {
      req.session.errorMessage = 'Không tìm thấy người dùng cần xóa.';
      return res.redirect('/Admin/Dashboard?tab=tabTeachers');
    }

    if (user.Id === req.session.userId) {
      req.session.errorMessage = 'Bạn không thể tự xóa tài khoản của chính mình.';
      return res.redirect('/Admin/Dashboard?tab=tabTeachers');
    }

    // Set TeacherId to null for any classes currently taught by this teacher
    await db.Class.update({ TeacherId: null }, { where: { TeacherId: id } });

    // 1. Delete associated Notifications
    await db.Notification.destroy({ where: { UserId: id } });

    // 2. Delete associated AiChatSessions and AiChatMessages
    const sessions = await db.AiChatSession.findAll({ where: { UserId: id } });
    const sessionIds = sessions.map(s => s.Id);
    if (sessionIds.length > 0) {
      await db.AiChatMessage.destroy({ where: { SessionId: sessionIds } });
      await db.AiChatSession.destroy({ where: { Id: sessionIds } });
    }

    // 3. Delete associated UserProfile
    await db.UserProfile.destroy({ where: { UserId: id } });

    // 4. Delete the User
    const name = user.FullName;
    await user.destroy();

    req.session.successMessage = `Đã xóa tài khoản giáo viên '${name}' thành công!`;
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra khi xóa tài khoản. Vui lòng kiểm tra lại liên kết dữ liệu.';
  }
  res.redirect('/Admin/Dashboard?tab=tabTeachers');
});

// POST: /Admin/CreateInvoice
router.post('/Admin/CreateInvoice', requireAuth(['ADMIN', 'STAFF']), async (req, res) => {
  const { studentId, classId, amount, dueDate } = req.body;

  try {
    const student = await db.User.findByPk(studentId);
    const cls = await db.Class.findByPk(classId);

    if (!student || !cls) {
      req.session.errorMessage = 'Học sinh hoặc lớp học không hợp lệ.';
      return res.redirect('/Admin/Dashboard?tab=tabInvoices');
    }

    const formattedDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const studentPad = String(studentId).padStart(4, '0');

    const invoice = await db.Invoice.create({
      InvoiceCode: `INV-${formattedDate}-${studentPad}`,
      StudentId: studentId,
      ClassId: classId,
      Amount: parseFloat(amount) || 0,
      DueDate: new Date(dueDate),
      Status: db.Invoice.StatusMap.UNPAID,
      CreatedAt: new Date()
    });

    // Notify Student
    await db.Notification.create({
      UserId: studentId,
      Title: 'Hóa đơn học phí mới',
      Content: `Bạn có hóa đơn học phí mới mã '${invoice.InvoiceCode}' trị giá ${Number(amount).toLocaleString('vi-VN')} đ cho lớp học '${cls.ClassName}'. Hạn nộp: ${new Date(dueDate).toLocaleDateString('vi-VN')}.`,
      LinkUrl: '/Student/Dashboard#progress',
      CreatedAt: new Date()
    });

    req.session.successMessage = `Phát hành hóa đơn học phí thành công cho học sinh ${student.FullName}!`;
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra khi phát hành hóa đơn.';
  }
  res.redirect('/Admin/Dashboard?tab=tabInvoices');
});

// POST: /Admin/MarkInvoicePaid/:id
router.post('/Admin/MarkInvoicePaid/:id', requireAuth(['ADMIN', 'STAFF']), async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const invoice = await db.Invoice.findByPk(id, {
      include: [{ model: db.Class, as: 'Class' }]
    });

    if (!invoice) {
      req.session.errorMessage = 'Không tìm thấy hóa đơn.';
      return res.redirect('/Admin/Dashboard?tab=tabInvoices');
    }

    if (invoice.Status === db.Invoice.StatusMap.PAID) {
      req.session.errorMessage = 'Hóa đơn này đã được thanh toán.';
      return res.redirect('/Admin/Dashboard?tab=tabInvoices');
    }

    invoice.Status = db.Invoice.StatusMap.PAID;
    await invoice.save();

    // Create Payment
    const formattedDateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/[-:]/g, '');
    await db.Payment.create({
      InvoiceId: invoice.Id,
      TransactionCode: `CASH-${formattedDateTime}-${req.session.userId}`,
      Amount: invoice.Amount,
      PaymentMethod: db.Payment.MethodMap.CASH,
      PaymentTime: new Date()
    });

    // Notify student
    await db.Notification.create({
      UserId: invoice.StudentId,
      Title: 'Xác nhận thanh toán học phí',
      Content: `Hóa đơn '${invoice.InvoiceCode}' lớp '${invoice.Class ? invoice.Class.ClassName : ''}' trị giá ${Number(invoice.Amount).toLocaleString('vi-VN')} đ đã được nhân viên ghi nhận thanh toán tiền mặt.`,
      LinkUrl: '/Student/Dashboard#progress',
      CreatedAt: new Date()
    });

    req.session.successMessage = `Ghi nhận thanh toán tiền mặt thành công cho hóa đơn ${invoice.InvoiceCode}!`;
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra khi cập nhật hóa đơn.';
  }
  res.redirect('/Admin/Dashboard?tab=tabInvoices');
});

// POST: /Admin/DeleteClass/:id
router.post('/Admin/DeleteClass/:id', requireAuth(['ADMIN', 'STAFF']), async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const cls = await db.Class.findByPk(id);
    if (!cls) {
      req.session.errorMessage = 'Không tìm thấy lớp học.';
      return res.redirect('/Admin/Dashboard?tab=tabCourses');
    }

    const courseId = cls.CourseId;

    // Delete class (lessons will be deleted cascadingly if defined in migrations, or let's clean them up manually)
    await db.Lesson.destroy({ where: { ClassId: id } });
    await db.ClassStudent.destroy({ where: { ClassId: id } });
    await cls.destroy();

    req.session.successMessage = `Đã xóa lớp học thành công!`;
    return res.redirect(courseId ? `/Admin/Courses/${courseId}/Classes` : '/Admin/Dashboard?tab=tabCourses');
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Lỗi hệ thống khi xóa lớp.';
  }
  res.redirect('/Admin/Dashboard?tab=tabCourses');
});

// POST: /Admin/DeleteCourse/:id
router.post('/Admin/DeleteCourse/:id', requireAuth(['ADMIN', 'STAFF']), async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const course = await db.Course.findByPk(id);
    if (!course) {
      req.session.errorMessage = 'Không tìm thấy khóa học.';
      return res.redirect('/Admin/Dashboard?tab=tabCourses');
    }

    // Check if classes are linked
    const linkedClasses = await db.Class.count({ where: { CourseId: id } });
    if (linkedClasses > 0) {
      req.session.errorMessage = 'Không thể xóa khóa học đã có lớp liên kết.';
      return res.redirect('/Admin/Dashboard?tab=tabCourses');
    }

    if (course.ImageUrl) {
      deleteUploadFile(course.ImageUrl);
    }

    await course.destroy();
    req.session.successMessage = `Đã xóa khóa học thành công!`;
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Lỗi hệ thống khi xóa khóa học.';
  }
  res.redirect('/Admin/Dashboard?tab=tabCourses');
});

// POST: /Admin/CreateLead
router.post('/Admin/CreateLead', requireAuth(['ADMIN', 'STAFF']), async (req, res) => {
  const { leadName, leadPhone, summary } = req.body;

  if (!leadName || !leadPhone) {
    req.session.errorMessage = 'Vui lòng nhập Tên và Số điện thoại Lead.';
    return res.redirect('/Admin/Dashboard?tab=tabLeads');
  }

  try {
    const sessionToken = `manual_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await db.AiChatSession.create({
      SessionToken: sessionToken,
      LeadName: leadName,
      LeadPhone: leadPhone,
      Summary: summary || 'Lead được thêm thủ công bởi nhân viên tuyển sinh.',
      CreatedAt: new Date()
    });

    req.session.successMessage = `Thêm lead tiềm năng '${leadName}' thành công!`;
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Lỗi hệ thống khi tạo Lead.';
  }
  res.redirect('/Admin/Dashboard?tab=tabLeads');
});

// GET: /Admin/Courses/:courseId/Classes
router.get('/Admin/Courses/:courseId/Classes', requireAuth(['ADMIN', 'STAFF']), async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  try {
    const course = await db.Course.findByPk(courseId);
    if (!course) {
      req.session.errorMessage = 'Không tìm thấy khóa học.';
      return res.redirect('/Admin/Dashboard?tab=tabCourses');
    }

    const classes = await db.Class.findAll({
      where: { CourseId: courseId },
      include: [
        { model: db.Course, as: 'Course' },
        { model: db.User, as: 'Teacher' }
      ],
      order: [['Id', 'DESC']]
    });

    const teachers = await db.User.findAll({
      where: { Role: db.User.RoleMap.TEACHER }
    });

    const courses = await db.Course.findAll({ order: [['Id', 'DESC']] });

    res.render('admin/courseClasses', {
      course,
      classes,
      teachers,
      courses,
      errorMessage: req.session.errorMessage || null,
      successMessage: req.session.successMessage || null
    });
    // Clear flash session messages
    req.session.errorMessage = null;
    req.session.successMessage = null;
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải danh sách lớp học.' });
  }
});

// POST: /Admin/AssignTeacher/:id
router.post('/Admin/AssignTeacher/:id', requireAuth(['ADMIN', 'STAFF']), async (req, res) => {
  const classId = parseInt(req.params.id);
  const { teacherId } = req.body;
  let redirectUrl = '/Admin/Dashboard?tab=tabCourses';

  try {
    const cls = await db.Class.findByPk(classId);
    if (!cls) {
      req.session.errorMessage = 'Không tìm thấy lớp học.';
      return res.redirect(redirectUrl);
    }
    
    redirectUrl = `/Admin/Courses/${cls.CourseId}/Classes`;

    const teacher = await db.User.findByPk(teacherId);
    if (!teacher || teacher.Role !== db.User.RoleMap.TEACHER) {
      req.session.errorMessage = 'Giáo viên được chọn không hợp lệ.';
      return res.redirect(redirectUrl);
    }

    cls.TeacherId = teacherId;
    await cls.save();

    // Send a notification to the new teacher
    await db.Notification.create({
      UserId: teacherId,
      Title: 'Phân công lớp học mới',
      Content: `Bạn đã được phân công phụ trách lớp học '${cls.ClassName}'. Vui lòng kiểm tra lịch dạy.`,
      IsRead: false,
      CreatedAt: new Date()
    });

    req.session.successMessage = `Đã phân công giáo viên ${teacher.FullName} phụ trách lớp ${cls.ClassName}!`;
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Lỗi hệ thống khi phân công giáo viên.';
  }
  res.redirect(redirectUrl);
});

// POST: /Admin/EditClass/:id
router.post('/Admin/EditClass/:id', requireAuth(['ADMIN', 'STAFF']), async (req, res) => {
  const classId = parseInt(req.params.id);
  const { courseId, teacherId, className, maxStudents, startDate } = req.body;

  try {
    const cls = await db.Class.findByPk(classId);
    if (!cls) {
      req.session.errorMessage = 'Không tìm thấy lớp học.';
      return res.redirect('/Admin/Dashboard?tab=tabCourses');
    }

    cls.CourseId = courseId ? parseInt(courseId) : null;
    cls.TeacherId = teacherId ? parseInt(teacherId) : null;
    cls.ClassName = className;
    cls.MaxStudents = parseInt(maxStudents) || 30;
    if (startDate) {
      cls.StartDate = new Date(startDate);
    }

    await cls.save();
    req.session.successMessage = `Cập nhật thông tin lớp học '${className}' thành công!`;
    return res.redirect(`/Admin/Courses/${cls.CourseId}/Classes`);
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Lỗi hệ thống khi cập nhật lớp học.';
  }
  res.redirect('/Admin/Dashboard?tab=tabCourses');
});

// POST: /Admin/UpdateTeacherInfo
// Allow admin/staff to update a teacher's profile details
router.post('/Admin/UpdateTeacherInfo', requireAuth(['ADMIN', 'STAFF']), async (req, res) => {
  const {
    teacherId,
    fullName,
    phone,
    teacherTitle,
    subject,
    teacherExperience,
    teacherStudents,
    teacherRating,
    teacherBio
  } = req.body;

  try {
    const teacher = await db.User.findByPk(teacherId, {
      include: [{ model: db.UserProfile, as: 'Profile' }]
    });

    if (!teacher || db.User.RoleRevMap[teacher.Role] !== 'TEACHER') {
      return res.json({ success: false, message: 'Không tìm thấy giảng viên.' });
    }

    // Update User
    if (fullName) teacher.FullName = fullName;
    if (phone) teacher.Phone = phone;
    await teacher.save();

    // Update or Create UserProfile
    let profile = teacher.Profile;
    if (!profile) {
      profile = await db.UserProfile.create({ UserId: teacherId });
    }

    profile.TeacherTitle = teacherTitle || null;
    profile.Subject = subject || null;
    profile.TeacherExperience = teacherExperience !== undefined && teacherExperience !== '' ? parseInt(teacherExperience) : null;
    profile.TeacherStudents = teacherStudents !== undefined && teacherStudents !== '' ? parseInt(teacherStudents) : null;
    profile.TeacherRating = teacherRating !== undefined && teacherRating !== '' ? parseFloat(teacherRating) : null;
    profile.TeacherBio = teacherBio || null;
    await profile.save();

    return res.json({ success: true, message: 'Cập nhật thông tin giảng viên thành công!' });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: 'Lỗi hệ thống khi cập nhật.' });
  }
});

module.exports = router;

