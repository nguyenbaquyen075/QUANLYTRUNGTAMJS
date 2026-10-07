const bcrypt = require('bcryptjs');
const db = require('../models');
const notificationService = require('./notificationService');

exports.findUserByUsername = async (username) => {
  const trimmed = username.trim();
  const normalizedEmail = trimmed.toLowerCase();
  
  return await db.User.findOne({
    where: {
      [db.Sequelize.Op.or]: [
        db.sequelize.where(db.sequelize.fn('LOWER', db.sequelize.col('Email')), normalizedEmail),
        { Phone: trimmed }
      ]
    }
  });
};

exports.createUser = async ({ fullName, email, phone, password, role }) => {
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Giáo viên phải được admin duyệt mới đăng nhập được; học sinh dùng được ngay.
  // (Trước đây dùng StatusMap.WAITING_APPROVE — hằng số này không tồn tại nên trả
  //  undefined, cột lấy default 0 = ACTIVE, tức bước duyệt chưa bao giờ chạy.)
  const status = role === 'TEACHER'
    ? db.User.StatusMap.PENDING
    : db.User.StatusMap.ACTIVE;

  // Create User Transaction
  const result = await db.sequelize.transaction(async (t) => {
    const newUser = await db.User.create({
      FullName: fullName,
      Email: email.toLowerCase(),
      Phone: phone,
      PasswordHash: passwordHash,
      Role: db.User.RoleMap[role],
      Status: status
    }, { transaction: t });

    // Create UserProfile
    // Chỉ set UserId — Bio/Experience/Qualification/AvatarUrl không phải cột của
    // UserProfile (cột thật là TeacherBio/TeacherExperience..., AvatarUrl nằm ở Users).
    await db.UserProfile.create({
      UserId: newUser.Id
    }, { transaction: t });

    return newUser;
  });

  return result;
};

exports.getCheckoutDetails = async (courseId, userId) => {
  const course = await db.Course.findByPk(courseId);
  if (!course) return null;

  // Find active classes for this course
  const classes = await db.Class.findAll({
    where: { CourseId: courseId, Status: 1 } // ACTIVE
  });

  let enrolledClasses = [];
  let unpaidInvoice = null;

  if (userId) {
    const enrollments = await db.ClassStudent.findAll({
      where: { StudentId: userId, Status: 0 },
      include: [{
        model: db.Class,
        as: 'Class',
        where: { CourseId: courseId }
      }]
    });
    enrolledClasses = enrollments.map(e => e.Class).filter(Boolean);

    const classIds = classes.map(c => c.Id);
    if (classIds.length > 0) {
      unpaidInvoice = await db.Invoice.findOne({
        where: {
          StudentId: userId,
          ClassId: { [db.Sequelize.Op.in]: classIds },
          Status: 0 // UNPAID
        },
        include: [{ model: db.Class, as: 'Class' }]
      });
    }
  }

  const classStudentCounts = {};
  await Promise.all(classes.map(async (c) => {
    classStudentCounts[c.Id] = await db.ClassStudent.count({ where: { ClassId: c.Id, Status: db.ClassStudent.StatusMap.LEARNING } });
  }));

  return { course, classes, classStudentCounts, isAlreadyEnrolled: enrolledClasses.length > 0, unpaidInvoice };
};

// Tạo hóa đơn CHỜ THANH TOÁN. Học viên chỉ được xếp vào lớp khi admin xác nhận đã nhận tiền
// (adminController.markInvoicePaid), nên đăng ký xong chưa vào lớp được.
exports.processCheckout = async (courseId, classId, userId) => {
  if (!userId) throw new Error('Vui lòng đăng nhập bằng tài khoản học viên để đăng ký khóa học.');

  const targetClass = await db.Class.findOne({
    where: { Id: classId, CourseId: courseId, Status: 1 }
  });
  if (!targetClass) {
    throw new Error('Lớp học không tồn tại hoặc đã bị khóa.');
  }

  const course = await db.Course.findByPk(courseId);
  if (!course) throw new Error('Khóa học không tồn tại.');

  const alreadyIn = await db.ClassStudent.findOne({
    where: { ClassId: classId, StudentId: userId, Status: db.ClassStudent.StatusMap.LEARNING }
  });
  if (alreadyIn) throw new Error('Bạn đã ở trong lớp này rồi.');

  // Đã có hóa đơn chờ cho đúng lớp này thì dùng lại, không tạo thêm.
  const existing = await db.Invoice.findOne({
    where: { StudentId: userId, ClassId: classId, Status: db.Invoice.StatusMap.UNPAID }
  });
  if (existing) return { course, targetClass, invoice: existing };

  const enrolledCount = await db.ClassStudent.count({
    where: { ClassId: classId, Status: db.ClassStudent.StatusMap.LEARNING }
  });
  if (targetClass.MaxStudents && enrolledCount >= targetClass.MaxStudents) {
    throw new Error('Lớp học đã đạt số lượng học viên tối đa.');
  }

  const formattedDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7); // hạn chuyển khoản mặc định 7 ngày

  const invoice = await db.Invoice.create({
    // Mã ngắn, chỉ chữ + số, dùng luôn làm nội dung chuyển khoản.
    InvoiceCode: `LUMI${formattedDate}${String(userId).padStart(4, '0')}${String(classId).padStart(3, '0')}`,
    StudentId: userId,
    ClassId: classId,
    Amount: course.BasePrice,
    DueDate: dueDate,
    Status: db.Invoice.StatusMap.UNPAID,
    CreatedAt: new Date()
  });

  return { course, targetClass, invoice };
};

const BANK_KEYS = { bank_code: 'bankCode', bank_account_number: 'accountNumber', bank_account_name: 'accountName' };

// Thông tin tài khoản nhận tiền do admin nhập ở Cài đặt Website.
exports.getBankInfo = async () => {
  const rows = await db.SiteSetting.findAll({ where: { Key: Object.keys(BANK_KEYS) } });
  const info = { bankCode: '', accountNumber: '', accountName: '' };
  rows.forEach((r) => { info[BANK_KEYS[r.Key]] = (r.Value || '').trim(); });
  info.configured = !!(info.bankCode && info.accountNumber);
  return info;
};

exports.getGatewayPaymentDetails = async (invoiceId, userId) => {
  return await db.Invoice.findOne({
    include: [
      { model: db.User, as: 'Student' },
      {
        model: db.Class,
        as: 'Class',
        include: [{ model: db.Course, as: 'Course' }]
      }
    ],
    where: { Id: invoiceId, StudentId: userId }
  });
};

// Học viên báo "đã chuyển khoản": chỉ nhắc admin kiểm tra, KHÔNG tự đánh dấu đã thanh toán.
const lastReport = new Map(); // invoiceId -> thời điểm báo gần nhất (chống bấm liên tục)
exports.reportTransfer = async (invoiceId, userId) => {
  const invoice = await db.Invoice.findOne({
    include: [{ model: db.User, as: 'Student' }, { model: db.Class, as: 'Class' }],
    where: { Id: invoiceId, StudentId: userId, Status: db.Invoice.StatusMap.UNPAID }
  });
  if (!invoice) return null;

  const last = lastReport.get(invoice.Id) || 0;
  if (Date.now() - last < 10 * 60 * 1000) return { invoice, notified: false };
  lastReport.set(invoice.Id, Date.now());

  const admins = await db.User.findAll({ where: { Role: db.User.RoleMap.ADMIN, Status: db.User.StatusMap.ACTIVE } });
  await notificationService.notifyUsers(admins.map((a) => a.Id), {
    title: 'Học viên báo đã chuyển khoản',
    content: `${invoice.Student ? invoice.Student.FullName : 'Học viên'} báo đã chuyển ${Number(invoice.Amount).toLocaleString('vi-VN')} đ cho hóa đơn ${invoice.InvoiceCode} (lớp ${invoice.Class ? invoice.Class.ClassName : ''}). Vui lòng kiểm tra tài khoản và xác nhận.`,
    linkUrl: '/Admin/Dashboard?tab=tabPayments'
  });
  return { invoice, notified: true };
};
