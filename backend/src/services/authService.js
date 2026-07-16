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

  // Default status: WAITING_APPROVE for TEACHER/STUDENT, ACTIVE for others
  let status = db.User.StatusMap.ACTIVE;
  if (role === 'TEACHER' || role === 'STUDENT') {
    status = db.User.StatusMap.WAITING_APPROVE;
  }

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
    await db.UserProfile.create({
      UserId: newUser.Id,
      Bio: '',
      Experience: '',
      Qualification: '',
      AvatarUrl: null
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

  // Check if student is already enrolled in any class of this course
  const enrolledClasses = await db.Class.findAll({
    where: { CourseId: courseId },
    include: [{
      model: db.User,
      as: 'Students',
      where: { Id: userId }
    }]
  });

  // Check if there is an unpaid invoice for this course classes
  const classIds = classes.map(c => c.Id);
  let unpaidInvoice = null;
  if (classIds.length > 0) {
    unpaidInvoice = await db.Invoice.findOne({
      where: {
        StudentId: userId,
        ClassId: { [db.Sequelize.Op.in]: classIds },
        Status: db.Invoice.StatusMap.UNPAID
      },
      include: [{ model: db.Class, as: 'Class' }]
    });
  }

  return { course, classes, isAlreadyEnrolled: enrolledClasses.length > 0, unpaidInvoice };
};

exports.processCheckout = async (courseId, classId, userId) => {
  const course = await db.Course.findByPk(courseId);
  const targetClass = await db.Class.findByPk(classId);

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
    const newInvoice = await db.Invoice.create({
      StudentId: userId,
      ClassId: classId,
      Amount: course.Price,
      InvoiceDate: new Date(),
      Status: db.Invoice.StatusMap.UNPAID
    }, { transaction: t });

    // 2. Enroll student into class
    await db.ClassStudent.create({
      ClassId: classId,
      StudentId: userId,
      EnrollDate: new Date()
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
