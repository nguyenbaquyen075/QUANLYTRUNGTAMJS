const express = require('express');
const controller = {};
const db = require('../models');
const { requireAuth } = require('../middlewares/auth');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { uploadToCloud } = require('../utils/cloudinary');

// Multer for avatar file uploads (up to 5MB)
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = 'avatar_' + Date.now() + '_' + Math.random().toString(36).substring(2) + ext;
    cb(null, uniqueName);
  }
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
    }
  }
});

// GET: /Profile/GetDetails
controller.getDetails = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.json({ success: false, message: 'Chưa đăng nhập.' });
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
        teacherTitle: profile.TeacherTitle || '',
        teacherExperience: profile.TeacherExperience !== null ? profile.TeacherExperience : 5,
        teacherStudents: profile.TeacherStudents !== null ? profile.TeacherStudents : 100,
        teacherRating: profile.TeacherRating !== null ? parseFloat(profile.TeacherRating) : 4.8,
        subject: profile.Subject || '',
        teacherBankName: profile.TeacherBankName || '',
        teacherBankAccount: profile.TeacherBankAccount || '',
        teacherBankHolder: profile.TeacherBankHolder || ''
      }
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Lỗi tải thông tin cá nhân.' });
  }
};

// POST: /Profile/UpdateDetails
controller.updateDetails = async (req, res) => {
  const {
    fullName,
    phone,
    dob,
    gender,
    address,
    teacherBio,
    teacherTitle,
    teacherExperience,
    teacherStudents,
    teacherRating,
    subject,
    teacherBankName,
    teacherBankAccount,
    teacherBankHolder
  } = req.body;

  const userId = req.session.userId;

  if (!fullName) {
    return res.json({ success: false, message: 'Họ tên không được để trống.' });
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

    // Update User attributes (only update if values provided)
    user.FullName = fullName;
    if (phone) user.Phone = phone;

    // Update AvatarUrl if new file is uploaded
    if (req.file) {
      const cloudinaryUrl = await uploadToCloud(req.file.path, 'avatars');
      user.AvatarUrl = cloudinaryUrl || '/uploads/' + req.file.filename;
      req.session.userAvatarUrl = user.AvatarUrl;
    } else if (req.body.removeAvatar === 'true') {
      // Teacher explicitly removed the avatar
      user.AvatarUrl = null;
      req.session.userAvatarUrl = null;
    }

    await user.save();

    // Update session values
    req.session.userFullName = fullName;
    if (phone) req.session.userPhone = phone;

    // Update Profile attributes
    profile.Dob = dob ? new Date(dob) : null;
    profile.Gender = db.UserProfile.GenderMap[gender] !== undefined ? db.UserProfile.GenderMap[gender] : null;
    profile.Address = address || null;

    if (db.User.RoleRevMap[user.Role] === 'TEACHER') {
      profile.TeacherBio = teacherBio || null;
      profile.TeacherTitle = teacherTitle || null;
      profile.TeacherExperience = teacherExperience !== undefined && teacherExperience !== '' ? parseInt(teacherExperience) : null;
      profile.TeacherStudents = teacherStudents !== undefined && teacherStudents !== '' ? parseInt(teacherStudents) : null;
      // Allow saving rating if provided, else keep existing or default
      if (teacherRating !== undefined) {
        profile.TeacherRating = teacherRating !== '' ? parseFloat(teacherRating) : null;
      }
      profile.Subject = subject || null;
      profile.TeacherBankName = teacherBankName || null;
      profile.TeacherBankAccount = teacherBankAccount || null;
      profile.TeacherBankHolder = teacherBankHolder || null;
    }

    await profile.save();

    res.json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công!',
      avatarUrl: user.AvatarUrl
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Lỗi hệ thống khi cập nhật hồ sơ.' });
  }
};

const bcrypt = require('bcryptjs');

// POST: /Profile/ChangePassword
controller.changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const userId = req.session.userId;

  if (!oldPassword || !newPassword || !confirmNewPassword) {
    return res.json({ success: false, message: 'Vui lòng điền đầy đủ tất cả các trường.' });
  }

  if (newPassword !== confirmNewPassword) {
    return res.json({ success: false, message: 'Mật khẩu mới và mật khẩu xác nhận không khớp.' });
  }

  try {
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    if (!bcrypt.compareSync(oldPassword, user.PasswordHash)) {
      return res.json({ success: false, message: 'Mật khẩu cũ không chính xác.' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 11);
    user.PasswordHash = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Lỗi hệ thống khi đổi mật khẩu.' });
  }
};

controller.avatarUpload = avatarUpload;
module.exports = controller;
