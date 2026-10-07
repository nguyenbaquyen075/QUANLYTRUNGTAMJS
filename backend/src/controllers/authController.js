const bcrypt = require('bcryptjs');
const authService = require('../services/authService');
const db = require('../models');
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
exports.getLogin = (req, res) => {
  if (req.session.userId) {
    return redirectToDashboard(req.session.userRole, res);
  }
  const returnUrl = req.query.returnUrl || '';
  res.render('auth/login', { selectedRole: 'STUDENT', returnUrl, layout: false });
};

// POST: /Auth/Login
exports.postLogin = async (req, res) => {
  const { username, password, selectedRole, returnUrl } = req.body;

  if (!username || !password) {
    return res.render('auth/login', {
      selectedRole,
      returnUrl,
      errorMessage: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.',
      layout: false
    });
  }

  try {
    const user = await authService.findUserByUsername(username);
    const isPasswordValid = user ? await bcrypt.compare(password, user.PasswordHash) : false;

    if (!user || !isPasswordValid) {
      return res.render('auth/login', {
        selectedRole,
        returnUrl,
        errorMessage: 'Tài khoản hoặc mật khẩu không chính xác.',
        layout: false
      });
    }

    const statusStr = db.User.StatusRevMap[user.Status];
    if (statusStr !== 'ACTIVE') {
      return res.render('auth/login', {
        selectedRole,
        returnUrl,
        errorMessage: 'Tài khoản của bạn đã bị khóa hoặc đang chờ duyệt.',
        layout: false
      });
    }

    const roleStr = db.User.RoleRevMap[user.Role];

    // Auto-detect role and proceed to login


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
    return res.render('auth/login', {
      selectedRole,
      returnUrl,
      errorMessage: 'Đã xảy ra lỗi trong quá trình xử lý đăng nhập.',
      layout: false
    });
  }
};

// GET: /Auth/Register
exports.getRegister = (req, res) => {
  if (req.session.userId) {
    return redirectToDashboard(req.session.userRole, res);
  }
  res.render('auth/register', { layout: false });
};

// POST: /Auth/Register
exports.postRegister = async (req, res) => {
  const { fullName, email, phone, password, confirmPassword, role } = req.body;

  // Validation
  if (!fullName || !email || !phone || !password || !confirmPassword || !role) {
    return res.render('auth/register', {
      errorMessage: 'Vui lòng điền đầy đủ các thông tin bắt buộc.',
      formData: req.body,
      layout: false
    });
  }

  if (password !== confirmPassword) {
    return res.render('auth/register', {
      errorMessage: 'Mật khẩu xác nhận không khớp.',
      formData: req.body,
      layout: false
    });
  }

  if (role !== 'STUDENT' && role !== 'TEACHER') {
    return res.render('auth/register', {
      errorMessage: 'Vai trò đăng ký không hợp lệ.',
      formData: req.body,
      layout: false
    });
  }

  try {
    // Check if email or phone already exists
    const existingUser = await authService.findUserByUsername(email);
    const existingPhone = await authService.findUserByUsername(phone);

    if (existingUser || existingPhone) {
      return res.render('auth/register', {
        errorMessage: 'Email hoặc số điện thoại đã được đăng ký trên hệ thống.',
        formData: req.body,
        layout: false
      });
    }

    // Register User via Service
    const newUser = await authService.createUser({ fullName, email, phone, password, role });

    // Send real-time notification to Administrators via Sockets
    const adminNotificationMessage = `Tài khoản ${role === 'TEACHER' ? 'Giáo viên' : 'Học sinh'} mới '${fullName}' vừa đăng ký thành công và đang chờ duyệt.`;
    await sendNotificationToUser('ADMIN', adminNotificationMessage);

    return res.render('auth/login', {
      selectedRole: role,
      successMessage: 'Đăng ký tài khoản thành công! Vui lòng chờ Ban quản trị duyệt tài khoản trước khi đăng nhập.',
      layout: false
    });

  } catch (err) {
    console.error(err);
    return res.render('auth/register', {
      errorMessage: 'Lỗi máy chủ trong quá trình xử lý đăng ký.',
      formData: req.body,
      layout: false
    });
  }
};

// GET: /Auth/Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/');
  });
};

// GET: /Auth/Checkout
exports.getCheckout = async (req, res) => {
  const courseId = parseInt(req.query.courseId);
  if (isNaN(courseId)) {
    return res.status(404).render('error', { message: 'Khóa học không hợp lệ.' });
  }

  try {
    const userId = req.session ? req.session.userId : null;
    const details = await authService.getCheckoutDetails(courseId, userId);
    if (!details) {
      return res.status(404).render('error', { message: 'Không tìm thấy khóa học.' });
    }

    const { course, classes, classStudentCounts, isAlreadyEnrolled, unpaidInvoice } = details;

    if (isAlreadyEnrolled) {
      req.session.errorMessage = `Bạn đã tham gia một lớp học thuộc khóa '${course.Title}' rồi!`;
      return res.redirect('/Student/Dashboard');
    }

    if (unpaidInvoice) {
      req.session.infoMessage = `Bạn đang có hóa đơn chưa thanh toán cho khóa học '${course.Title}'. Vui lòng thanh toán để tham gia lớp học.`;
      return res.redirect(`/Auth/GatewayPayment?invoiceId=${unpaidInvoice.Id}`);
    }

    res.render('auth/checkout', { course, classes, classStudentCounts, layout: false });

  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang thanh toán.' });
  }
};

// POST: /Auth/Checkout — tạo hóa đơn chờ thanh toán. Chưa xếp lớp: admin xác nhận đã nhận tiền thì mới vào lớp.
exports.postCheckout = async (req, res) => {
  const { courseId, classId } = req.body;
  const fail = (status, message) => (req.isJsonAPI
    ? res.status(status).json({ success: false, message })
    : (req.session.errorMessage = message, res.redirect(`/Auth/Checkout?courseId=${courseId}`)));

  if (!courseId || !classId) return fail(400, 'Thiếu thông tin khóa học hoặc lớp học cần đăng ký.');
  if (!req.session || !req.session.userId) return fail(401, 'Vui lòng đăng nhập bằng tài khoản học viên để đăng ký khóa học.');
  if (req.session.userRole !== 'STUDENT') return fail(403, 'Chỉ tài khoản học viên mới đăng ký khóa học được.');

  try {
    const { invoice } = await authService.processCheckout(parseInt(courseId), parseInt(classId), req.session.userId);
    return res.redirect(`/Auth/GatewayPayment?invoiceId=${invoice.Id}`);
  } catch (err) {
    console.error(err);
    return fail(400, err.message || 'Có lỗi xảy ra khi tạo hóa đơn.');
  }
};

// GET: /Auth/GatewayPayment
exports.getGatewayPayment = async (req, res) => {
  const invoiceId = parseInt(req.query.invoiceId);
  if (isNaN(invoiceId)) {
    return res.status(404).render('error', { message: 'Hóa đơn không hợp lệ.' });
  }

  try {
    const invoice = await authService.getGatewayPaymentDetails(invoiceId, req.session.userId);
    if (!invoice) {
      return res.status(404).render('error', { message: 'Không tìm thấy hóa đơn.' });
    }

    const bank = await authService.getBankInfo();
    res.render('auth/gatewayPayment', { invoice, bank, layout: false });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi hệ thống.' });
  }
};

// POST: /Auth/ReportTransfer — học viên báo đã chuyển khoản, chỉ nhắc admin kiểm tra (không tự đánh dấu đã thanh toán)
exports.reportTransfer = async (req, res) => {
  try {
    const result = await authService.reportTransfer(parseInt(req.body.invoiceId), req.session.userId);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn chờ thanh toán.' });
    return res.json({ success: true, notified: result.notified });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống.' });
  }
};
