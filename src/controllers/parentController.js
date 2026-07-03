const express = require('express');
const router = express.Router();
const db = require('../models');
const { requireAuth } = require('../middleware/auth');

// GET: /Parent/Dashboard
router.get('/Parent/Dashboard', requireAuth(['PARENT']), async (req, res) => {
  const parentId = req.session.userId;

  try {
    // Get profiles linked to this parent
    const profiles = await db.UserProfile.findAll({
      where: { ParentId: parentId }
    });

    const childrenIds = profiles.map(p => p.UserId);

    const children = await db.User.findAll({
      where: { Id: childrenIds }
    });

    // Fetch invoices for these children
    const invoices = await db.Invoice.findAll({
      include: [
        { model: db.User, as: 'Student' },
        { model: db.Class, as: 'Class' }
      ],
      where: { StudentId: childrenIds }
    });

    // Fetch attendance records for these children
    const attendanceRecords = await db.Attendance.findAll({
      include: [
        {
          model: db.Lesson,
          as: 'Lesson',
          include: [{ model: db.Class, as: 'Class' }]
        }
      ],
      where: { StudentId: childrenIds },
      order: [['UpdatedAt', 'DESC']]
    });

    // Fetch submissions for these children
    const submissions = await db.Submission.findAll({
      include: [{ model: db.Assignment, as: 'Assignment' }],
      where: {
        StudentId: childrenIds,
        Grade: { [db.Sequelize.Op.ne]: null }
      },
      order: [['GradedAt', 'DESC']]
    });

    res.render('parent/dashboard', {
      Children: children,
      Invoices: invoices,
      AttendanceRecords: attendanceRecords,
      Submissions: submissions
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang phụ huynh.' });
  }
});

// GET: /Parent/PayInvoice/:id
router.get('/Parent/PayInvoice/:id', requireAuth(['PARENT']), async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const invoice = await db.Invoice.findOne({
      include: [
        { model: db.User, as: 'Student' },
        { model: db.Class, as: 'Class' }
      ],
      where: { Id: id }
    });

    if (!invoice) {
      return res.status(404).render('error', { message: 'Không tìm thấy hóa đơn.' });
    }

    // Generate VietQR link
    const amountStr = parseFloat(invoice.Amount).toFixed(0);
    const qrUrl = `https://api.vietqr.io/image/MB/0999888777666/vietqr_net_2.jpg?amount=${amountStr}&addInfo=CKHP%20${invoice.InvoiceCode}`;

    res.render('parent/payInvoice', {
      invoice,
      QrCodeUrl: qrUrl,
      BankName: 'MB Bank (Ngân hàng Quân Đội)',
      BankAccount: '0999888777666',
      AccountHolder: 'TRUNG TAM HOC THEM ONL'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang thanh toán.' });
  }
});

module.exports = router;
