const express = require('express');
const router = express.Router();
const db = require('../models');
const { requireAuth } = require('../middleware/auth');

// GET: /Profile/GetDetails
router.get('/Profile/GetDetails', requireAuth(), async (req, res) => {
  const userId = req.session.userId;

  try {
    const user = await db.User.findByPk(userId, {
      include: [{ model: db.UserProfile, as: 'Profile' }]
    });

    if (!user) {
      return res.json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    let profile = user.Profile;
    if (!profile) {
      profile = await db.UserProfile.create({ UserId: userId });
    }

    const roleName = db.User.RoleRevMap[user.Role] === 'ADMIN' ? 'Quản Trị Viên'
      : db.User.RoleRevMap[user.Role] === 'STAFF' ? 'Nhân Viên'
      : db.User.RoleRevMap[user.Role] === 'TEACHER' ? 'Giáo Viên'
      : db.User.RoleRevMap[user.Role] === 'STUDENT' ? 'Học Viên'
      : db.User.RoleRevMap[user.Role] === 'PARENT' ? 'Phụ Huynh'
      : db.User.RoleRevMap[user.Role];

    const dobStr = profile.Dob ? new Date(profile.Dob).toISOString().slice(0, 10) : '';
    const genderStr = db.UserProfile.GenderRevMap[profile.Gender] || '';

    res.json({
      success: true,
      data: {
        id: user.Id,
        fullName: user.FullName,
        email: user.Email,
        phone: user.Phone,
        role: db.User.RoleRevMap[user.Role],
        roleName: roleName,
        status: db.User.StatusRevMap[user.Status],
        createdAt: new Date(user.CreatedAt).toLocaleDateString('vi-VN'),
        avatarUrl: user.AvatarUrl || '',
        dob: dobStr,
        gender: genderStr,
        address: profile.Address || '',
        teacherBio: profile.TeacherBio || '',
        teacherBankName: profile.TeacherBankName || '',
        teacherBankAccount: profile.TeacherBankAccount || '',
        teacherBankHolder: profile.TeacherBankHolder || ''
      }
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Lỗi tải thông tin cá nhân.' });
  }
});

// POST: /Profile/UpdateDetails
router.post('/Profile/UpdateDetails', requireAuth(), async (req, res) => {
  const {
    fullName,
    phone,
    dob,
    gender,
    address,
    teacherBio,
    teacherBankName,
    teacherBankAccount,
    teacherBankHolder
  } = req.body;

  const userId = req.session.userId;

  if (!fullName || !phone) {
    return res.json({ success: false, message: 'Họ tên và Số điện thoại không được để trống.' });
  }

  try {
    const user = await db.User.findByPk(userId, {
      include: [{ model: db.UserProfile, as: 'Profile' }]
    });

    if (!user) {
      return res.json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    let profile = user.Profile;
    if (!profile) {
      profile = await db.UserProfile.create({ UserId: userId });
    }

    // Update User attributes
    user.FullName = fullName;
    user.Phone = phone;
    await user.save();

    // Update session values
    req.session.userFullName = fullName;
    req.session.userPhone = phone;

    // Update Profile attributes
    profile.Dob = dob ? new Date(dob) : null;
    profile.Gender = db.UserProfile.GenderMap[gender] !== undefined ? db.UserProfile.GenderMap[gender] : null;
    profile.Address = address || null;

    if (db.User.RoleRevMap[user.Role] === 'TEACHER') {
      profile.TeacherBio = teacherBio || null;
      profile.TeacherBankName = teacherBankName || null;
      profile.TeacherBankAccount = teacherBankAccount || null;
      profile.TeacherBankHolder = teacherBankHolder || null;
    }

    await profile.save();

    res.json({ success: true, message: 'Cập nhật thông tin cá nhân thành công!' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Lỗi hệ thống khi cập nhật hồ sơ.' });
  }
});

module.exports = router;
