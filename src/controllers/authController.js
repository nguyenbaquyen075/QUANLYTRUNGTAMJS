const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models');
const { requireAuth } = require('../middleware/auth');
const { sendNotificationToUser } = require('../sockets/signalRCompat');

// Helper redirect based on role
function redirectToDashboard(role, res) {
  if (role === 'ADMIN' || role === 'STAFF') {
    return res.redirect('/Admin/Dashboard');
  } else if (role === 'TEACHER') {
    return res.redirect('/Teacher/Dashboard');
  } else if (role === 'STUDENT') {
    return res.redirect('/Student/Dashboard');
  } else if (role === 'PARENT') {
    return res.redirect('/Parent/Dashboard');
  }
  return res.redirect('/');
}

// GET: /Auth/Login
router.get('/Auth/Login', (req, res) => {
  if (req.session.userId) {
    return redirectToDashboard(req.session.userRole, res);
  }
  const returnUrl = req.query.returnUrl || '';
  res.render('auth/login', { selectedRole: 'STUDENT', returnUrl , layout: false });
});

// POST: /Auth/Login
router.post('/Auth/Login', async (req, res) => {
  const { username, password, selectedRole, returnUrl } = req.body;

  if (!username || !password) {
    res.locals.errorMessage = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.';
    return res.render('auth/login', { selectedRole, returnUrl , layout: false });
  }

  try {
    const trimmedUsername = username.trim();
    const normalizedEmail = trimmedUsername.toLowerCase();

    // Query user by email or phone
    const user = await db.User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          db.sequelize.where(db.sequelize.fn('LOWER', db.sequelize.col('Email')), normalizedEmail),
          { Phone: trimmedUsername }
        ]
      }
    });

    if (!user || !bcrypt.compareSync(password, user.PasswordHash)) {
      res.locals.errorMessage = 'Tài khoản hoặc mật khẩu không chính xác.';
      return res.render('auth/login', { selectedRole, returnUrl , layout: false });
    }

    const statusStr = db.User.StatusRevMap[user.Status];
    if (statusStr !== 'ACTIVE') {
      res.locals.errorMessage = 'Tài khoản của bạn đã bị khóa hoặc đang chờ duyệt.';
      return res.render('auth/login', { selectedRole, returnUrl , layout: false });
    }

    const roleStr = db.User.RoleRevMap[user.Role];

    // Validate role group mismatch
    if (selectedRole) {
      let isRoleValid = false;
      if (selectedRole === 'ADMIN' && (roleStr === 'ADMIN' || roleStr === 'STAFF')) {
        isRoleValid = true;
      } else if (selectedRole === 'TEACHER' && roleStr === 'TEACHER') {
        isRoleValid = true;
      } else if (selectedRole === 'STUDENT' && (roleStr === 'STUDENT' || roleStr === 'PARENT')) {
        isRoleValid = true;
      }

      if (!isRoleValid) {
        let targetGroupName = selectedRole;
        if (selectedRole === 'ADMIN') targetGroupName = 'Quản trị viên / Nhân viên';
        else if (selectedRole === 'TEACHER') targetGroupName = 'Giáo viên';
        else if (selectedRole === 'STUDENT') targetGroupName = 'Học sinh / Phụ huynh';

        res.locals.errorMessage = `Tài khoản này không thuộc nhóm vai trò '${targetGroupName}'. Vui lòng chọn đúng khối đăng nhập.`;
        return res.render('auth/login', { selectedRole, returnUrl , layout: false });
      }
    }

    // Set Session
    req.session.userId = user.Id;
    req.session.userRole = roleStr;
    req.session.userFullName = user.FullName;
    req.session.userEmail = user.Email;
    req.session.userPhone = user.Phone;
    req.session.userAvatarUrl = user.AvatarUrl || null;

    if (returnUrl) {
      return res.redirect(returnUrl);
    }

    return redirectToDashboard(roleStr, res);
  } catch (err) {
    console.error(err);
    res.locals.errorMessage = 'Có lỗi xảy ra khi xử lý đăng nhập.';
    return res.render('auth/login', { selectedRole, returnUrl , layout: false });
  }
});

// GET: /Auth/Register
router.get('/Auth/Register', (req, res) => {
  if (req.session.userId) {
    const courseId = req.query.courseId;
    if (courseId) {
      return res.redirect(`/Auth/Checkout?courseId=${courseId}`);
    }
    return redirectToDashboard(req.session.userRole, res);
  }

  const preSelectedCourseId = req.query.courseId || null;
  res.render('auth/register', { preSelectedCourseId , layout: false });
});

// POST: /Auth/Register
router.post('/Auth/Register', async (req, res) => {
  const { fullName, email, phone, password, courseId } = req.body;
  const preSelectedCourseId = courseId || null;

  if (!fullName || !email || !phone || !password) {
    res.locals.errorMessage = 'Vui lòng điền đầy đủ thông tin cá nhân.';
    return res.render('auth/register', { preSelectedCourseId , layout: false });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    // Check unique
    const existingEmail = await db.User.findOne({
      where: db.sequelize.where(db.sequelize.fn('LOWER', db.sequelize.col('Email')), normalizedEmail)
    });
    if (existingEmail) {
      res.locals.errorMessage = 'Email này đã được sử dụng.';
      return res.render('auth/register', { preSelectedCourseId , layout: false });
    }

    const existingPhone = await db.User.findOne({ where: { Phone: trimmedPhone } });
    if (existingPhone) {
      res.locals.errorMessage = 'Số điện thoại này đã được sử dụng.';
      return res.render('auth/register', { preSelectedCourseId , layout: false });
    }

    // Hash Password
    const hashedPassword = bcrypt.hashSync(password, 11);

    // Create User
    const newUser = await db.User.create({
      FullName: fullName.trim(),
      Email: normalizedEmail,
      Phone: trimmedPhone,
      PasswordHash: hashedPassword,
      Role: db.User.RoleMap.STUDENT,
      Status: db.User.StatusMap.ACTIVE
    });

    // Create UserProfile
    await db.UserProfile.create({
      UserId: newUser.Id
    });

    // Welcome Notification
    await db.Notification.create({
      UserId: newUser.Id,
      Title: 'Chào mừng thành viên mới',
      Content: 'Tài khoản của bạn đã được đăng ký thành công! Hãy bắt đầu hành trình học tập cùng TrungTâm Online nhé.',
      LinkUrl: '/',
      CreatedAt: new Date()
    });

    // Auto Login
    req.session.userId = newUser.Id;
    req.session.userRole = 'STUDENT';
    req.session.userFullName = newUser.FullName;
    req.session.userEmail = newUser.Email;
    req.session.userPhone = newUser.Phone;
    req.session.userAvatarUrl = null;

    if (courseId) {
      req.session.successMessage = 'Đăng ký tài khoản thành công! Hãy tiếp tục chọn lớp và thanh toán khóa học.';
      return res.redirect(`/Auth/Checkout?courseId=${courseId}`);
    }

    req.session.successMessage = 'Đăng ký tài khoản thành công!';
    return res.redirect('/Student/Dashboard');
  } catch (err) {
    console.error(err);
    res.locals.errorMessage = 'Lỗi hệ thống khi đăng ký.';
    return res.render('auth/register', { preSelectedCourseId , layout: false });
  }
});

// GET: /Auth/Logout
router.get('/Auth/Logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// GET: /Auth/Checkout
router.get('/Auth/Checkout', requireAuth(), async (req, res) => {
  const courseId = parseInt(req.query.courseId);
  if (isNaN(courseId)) {
    return res.status(404).render('error', { message: 'Mã khóa học không hợp lệ.' });
  }

  try {
    const course = await db.Course.findByPk(courseId);
    if (!course) {
      return res.status(404).render('error', { message: 'Không tìm thấy khóa học.' });
    }

    const currentUserId = req.session.userId;

    // Check if enrolled
    const isEnrolled = await db.ClassStudent.findOne({
      include: [{
        model: db.Class,
        as: 'Class',
        where: { CourseId: courseId }
      }],
      where: {
        StudentId: currentUserId,
        Status: db.ClassStudent.StatusMap.LEARNING
      }
    });

    if (isEnrolled) {
      req.session.errorMessage = 'Bạn đã đăng ký khóa học này rồi!';
      return redirectToDashboard(req.session.userRole, res);
    }

    // Get active classes
    const classes = await db.Class.findAll({
      include: [{ model: db.User, as: 'Teacher' }],
      where: {
        CourseId: courseId,
        Status: {
          [db.Sequelize.Op.or]: [
            db.Class.StatusMap.UPCOMING,
            db.Class.StatusMap.ONGOING
          ]
        }
      }
    });

    const classIds = classes.map(c => c.Id);
    const studentCountsList = await db.ClassStudent.findAll({
      attributes: ['ClassId', [db.Sequelize.fn('COUNT', db.Sequelize.col('Id')), 'count']],
      where: {
        ClassId: classIds,
        Status: db.ClassStudent.StatusMap.LEARNING
      },
      group: ['ClassId']
    });

    const classStudentCounts = {};
    studentCountsList.forEach(item => {
      classStudentCounts[item.ClassId] = parseInt(item.get('count')) || 0;
    });

    res.render('auth/checkout', {
      course,
      classes,
      classStudentCounts,
      studentName: req.session.userFullName,
      studentEmail: req.session.userEmail,
      studentPhone: req.session.userPhone
    });
  } catch (err) {
    console.error(err);
    return res.status(500).render('error', { message: 'Lỗi hệ thống.' });
  }
});

// POST: /Auth/Checkout
router.post('/Auth/Checkout', requireAuth(), async (req, res) => {
  const { courseId, classId, paymentMethod } = req.body;
  const currentUserId = req.session.userId;

  try {
    const course = await db.Course.findByPk(courseId);
    const cls = await db.Class.findOne({ where: { Id: classId, CourseId: courseId } });

    if (!course || !cls) {
      req.session.errorMessage = 'Khóa học hoặc lớp học không hợp lệ.';
      return res.redirect(`/Auth/Checkout?courseId=${courseId}`);
    }

    // Check if class is full
    const currentStudentCount = await db.ClassStudent.count({
      where: { ClassId: classId, Status: db.ClassStudent.StatusMap.LEARNING }
    });

    if (currentStudentCount >= cls.MaxStudents) {
      req.session.errorMessage = 'Lớp học đã đầy, vui lòng chọn lớp khác.';
      return res.redirect(`/Auth/Checkout?courseId=${courseId}`);
    }

    // Check if already enrolled
    const isEnrolled = await db.ClassStudent.findOne({
      include: [{
        model: db.Class,
        as: 'Class',
        where: { CourseId: courseId }
      }],
      where: {
        StudentId: currentUserId,
        Status: db.ClassStudent.StatusMap.LEARNING
      }
    });

    if (isEnrolled) {
      req.session.errorMessage = 'Bạn đã đăng ký khóa học này rồi!';
      return redirectToDashboard(req.session.userRole, res);
    }

    let paymentMethodVal = db.Payment.MethodMap.BANK_TRANSFER;
    if (paymentMethod === 'CASH') paymentMethodVal = db.Payment.MethodMap.CASH;
    else if (paymentMethod === 'GATEWAY') paymentMethodVal = db.Payment.MethodMap.GATEWAY;

    const formattedDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const userPad = String(currentUserId).padStart(4, '0');

    // Create Invoice
    const invoice = await db.Invoice.create({
      InvoiceCode: `INV-${formattedDate}-${userPad}`,
      StudentId: currentUserId,
      ClassId: classId,
      Amount: course.BasePrice,
      DueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      Status: paymentMethod === 'CASH' ? db.Invoice.StatusMap.UNPAID : db.Invoice.StatusMap.PAID,
      CreatedAt: new Date()
    });

    // Create Payment record
    const formattedDateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/[-:]/g, '');
    await db.Payment.create({
      InvoiceId: invoice.Id,
      TransactionCode: `TXN-${formattedDateTime}-${currentUserId}`,
      Amount: course.BasePrice,
      PaymentMethod: paymentMethodVal,
      PaymentTime: new Date()
    });

    // Enroll student
    await db.ClassStudent.create({
      ClassId: classId,
      StudentId: currentUserId,
      Status: db.ClassStudent.StatusMap.LEARNING,
      EnrolledAt: new Date()
    });

    // Notifications
    const studentName = req.session.userFullName || 'Học sinh';
    const teacherId = cls.TeacherId;
    const isPaid = invoice.Status === db.Invoice.StatusMap.PAID;

    const notifStudent = await db.Notification.create({
      UserId: currentUserId,
      Title: isPaid ? 'Đăng ký khóa học thành công' : 'Hóa đơn học phí chưa thanh toán',
      Content: isPaid
        ? `Đăng ký thành công lớp học '${cls.ClassName}' và thanh toán thành công ${Number(course.BasePrice).toLocaleString('vi-VN')} đ.`
        : `Đăng ký thành công lớp học '${cls.ClassName}'. Vui lòng thanh toán số tiền ${Number(course.BasePrice).toLocaleString('vi-VN')} đ trước ngày ${new Date(invoice.DueDate).toLocaleDateString('vi-VN')}.`,
      LinkUrl: '/Student/Dashboard#my-courses',
      CreatedAt: new Date()
    });

    const notifTeacher = await db.Notification.create({
      UserId: teacherId,
      Title: 'Học sinh đăng ký lớp mới',
      Content: `Học sinh ${studentName} đã đăng ký vào lớp '${cls.ClassName}' của bạn.`,
      LinkUrl: '/Teacher/Dashboard',
      CreatedAt: new Date()
    });

    // Real-time broadcasts
    const createdAtStr = new Date(notifStudent.CreatedAt).toLocaleDateString('vi-VN') + ' ' + new Date(notifStudent.CreatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    sendNotificationToUser(currentUserId, {
      title: notifStudent.Title,
      content: notifStudent.Content,
      linkUrl: notifStudent.LinkUrl,
      createdAt: createdAtStr
    });

    sendNotificationToUser(teacherId, {
      title: notifTeacher.Title,
      content: notifTeacher.Content,
      linkUrl: notifTeacher.LinkUrl,
      createdAt: createdAtStr
    });

    req.session.successMessage = `Đăng ký và thanh toán thành công khóa học '${course.Title}'!`;
    return res.redirect('/Student/Dashboard');
  } catch (err) {
    console.error(err);
    req.session.errorMessage = 'Có lỗi xảy ra trong quá trình thanh toán.';
    return res.redirect(`/Auth/Checkout?courseId=${courseId}`);
  }
});

// GET: /Auth/GatewayPayment
router.get('/Auth/GatewayPayment', requireAuth(), async (req, res) => {
  const invoiceId = parseInt(req.query.invoiceId);
  if (isNaN(invoiceId)) {
    return res.status(404).render('error', { message: 'Hóa đơn không hợp lệ.' });
  }

  try {
    const invoice = await db.Invoice.findOne({
      include: [
        { model: db.User, as: 'Student' },
        {
          model: db.Class,
          as: 'Class',
          include: [{ model: db.Course, as: 'Course' }]
        }
      ],
      where: { Id: invoiceId, StudentId: req.session.userId }
    });

    if (!invoice) {
      return res.status(404).render('error', { message: 'Không tìm thấy hóa đơn.' });
    }

    res.render('auth/gatewayPayment', { invoice });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi hệ thống.' });
  }
});

// POST: /Auth/ConfirmGatewayPayment
router.post('/Auth/ConfirmGatewayPayment', requireAuth(), async (req, res) => {
  const { invoiceId, gateway } = req.body;

  try {
    const invoice = await db.Invoice.findOne({
      include: [{ model: db.Class, as: 'Class' }],
      where: { Id: invoiceId, StudentId: req.session.userId }
    });

    if (!invoice) {
      return res.status(404).render('error', { message: 'Không tìm thấy hóa đơn.' });
    }

    invoice.Status = db.Invoice.StatusMap.PAID;
    await invoice.save();

    const formattedDateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/[-:]/g, '');
    await db.Payment.create({
      InvoiceId: invoice.Id,
      TransactionCode: `${gateway.toUpperCase()}-${formattedDateTime}-${req.session.userId}`,
      Amount: invoice.Amount,
      PaymentMethod: db.Payment.MethodMap.GATEWAY,
      PaymentTime: new Date()
    });

    req.session.successMessage = 'Thanh toán học phí trực tuyến thành công!';
    return res.redirect('/Student/Dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi hệ thống khi xác nhận thanh toán.' });
  }
});

module.exports = router;
