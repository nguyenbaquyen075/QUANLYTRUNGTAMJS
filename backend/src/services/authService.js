const bcrypt = require('bcryptjs');
const db = require('../models');

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
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

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

  return { course, classes, isAlreadyEnrolled: enrolledClasses.length > 0, unpaidInvoice };
};

exports.processCheckout = async (courseId, classId, userId) => {
  const targetClass = await db.Class.findOne({
    where: { Id: classId, CourseId: courseId, Status: 1 }
  });
  if (!targetClass) {
    throw new Error('Lớp học không tồn tại hoặc đã bị khóa.');
  }

  if (!userId) {
    const [guestUser] = await db.User.findOrCreate({
      where: { Email: 'hocvien_guest@flashstudy.edu.vn' },
      defaults: {
        FullName: 'Học Viên Mới',
        PasswordHash: bcrypt.hashSync('123', bcrypt.genSaltSync(10)),
        Phone: '0900000000',
        Role: db.User.RoleMap['STUDENT'],
        Status: db.User.StatusMap.ACTIVE
      }
    });
    userId = guestUser.Id;
  }
  
  const course = await db.Course.findByPk(courseId);
  if (!course || !targetClass || targetClass.CourseId !== course.Id) {
    throw new Error('Khóa học hoặc lớp học không tồn tại.');
  }

  // Check if class is full
  const enrolledCount = await db.ClassStudent.count({ where: { ClassId: classId } });
  if (targetClass.MaxStudents && enrolledCount >= targetClass.MaxStudents) {
    throw new Error('Lớp học đã đạt số lượng học viên tối đa.');
  }

  // Create Invoice and Enroll in Transaction
  const invoice = await db.sequelize.transaction(async (t) => {
    // 1. Create Invoice
    // InvoiceCode và DueDate là NOT NULL không có default — thiếu là create ném
    // SequelizeValidationError. Mã theo đúng quy ước ở adminController.
    const formattedDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const studentPad = String(userId).padStart(4, '0');
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // hạn nộp mặc định 7 ngày

    const newInvoice = await db.Invoice.create({
      InvoiceCode: `INV-${formattedDate}-${studentPad}`,
      StudentId: userId,
      ClassId: classId,
      Amount: course.BasePrice, // cột thật là BasePrice; course.Price là undefined -> Amount null
      DueDate: dueDate,
      Status: db.Invoice.StatusMap.UNPAID,
      CreatedAt: new Date()
    }, { transaction: t });

    // 2. Enroll student into class
    await db.ClassStudent.create({
      ClassId: classId,
      StudentId: userId,
      EnrolledAt: new Date()
    }, { transaction: t });

    return newInvoice;
  });

  return { course, targetClass, invoice };
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

exports.confirmGatewayPayment = async (invoiceId, gateway, userId) => {
  const invoice = await db.Invoice.findOne({
    include: [{ model: db.Class, as: 'Class' }],
    where: { Id: invoiceId, StudentId: userId }
  });

  if (!invoice) return null;

  await db.sequelize.transaction(async (t) => {
    // Update Invoice status to PAID
    invoice.Status = db.Invoice.StatusMap.PAID;
    await invoice.save({ transaction: t });

    // Create Payment record
    const formattedDateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/[-:]/g, '');
    await db.Payment.create({
      InvoiceId: invoice.Id,
      TransactionCode: `${gateway.toUpperCase()}-${formattedDateTime}-${userId}`,
      Amount: invoice.Amount,
      PaymentMethod: db.Payment.MethodMap.GATEWAY,
      PaymentTime: new Date()
    }, { transaction: t });
  });

  return invoice;
};
