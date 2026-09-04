const express = require('express');
const controller = {};
const db = require('../models');
const { requireAuth } = require('../middlewares/auth');

// GET: /Notification
controller.getNotificationPage = async (req, res) => {
  const userId = req.session.userId;

  try {
    const notifications = await db.Notification.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { UserId: userId },
          { UserId: null } // System-wide
        ]
      },
      order: [['CreatedAt', 'DESC']]
    });

    res.render('notification/index', { notifications });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang thông báo.' });
  }
};

// GET: /Notification/List (JSON API)
controller.getNotificationList = async (req, res) => {
  const userId = req.session.userId;
  try {
    const notifications = await db.Notification.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { UserId: userId },
          { UserId: null }
        ]
      },
      order: [['CreatedAt', 'DESC']],
      limit: 50
    });
    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Lỗi tải danh sách thông báo.' });
  }
};

// POST: /Notification/MarkAsRead
controller.markAsRead = async (req, res) => {
  const id = req.body.id || req.body.notificationId;
  const userId = req.session.userId;

  try {
    const notification = await db.Notification.findOne({
      where: {
        Id: id,
        [db.Sequelize.Op.or]: [
          { UserId: userId },
          { UserId: null }
        ]
      }
    });

    if (!notification) {
      return res.json({ success: false, message: 'Không tìm thấy thông báo.' });
    }

    notification.IsRead = true;
    await notification.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Lỗi hệ thống.' });
  }
};

// POST: /Notification/MarkAllAsRead
controller.markAllAsRead = async (req, res) => {
  const userId = req.session.userId;

  try {
    await db.Notification.update(
      { IsRead: true },
      {
        where: {
          IsRead: false,
          [db.Sequelize.Op.or]: [
            { UserId: userId },
            { UserId: null }
          ]
        }
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Lỗi hệ thống.' });
  }
};

// GET: /Notification/GetUnreadCount
controller.getUnreadCount = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.json({ count: 0 });
  }

  try {
    const count = await db.Notification.count({
      where: {
        IsRead: false,
        [db.Sequelize.Op.or]: [
          { UserId: userId },
          { UserId: null }
        ]
      }
    });

    res.json({ count });
  } catch (err) {
    console.error(err);
    res.json({ count: 0 });
  }
};

// POST: /Notification/Create (Admin & Teachers)
controller.createNotification = async (req, res) => {
  const { title, content, targetType, targetId, linkUrl } = req.body;
  const currentUserRole = req.session.role;

  if (!title || !content) {
    return res.json({ success: false, message: 'Vui lòng điền đầy đủ tiêu đề và nội dung.' });
  }

  try {
    const notificationService = require('../services/notificationService');

    if (targetType === 'ALL') {
      // Broadcast system-wide
      await db.Notification.create({
        UserId: null,
        Title: title,
        Content: content,
        LinkUrl: linkUrl || null,
        CreatedAt: new Date()
      });
    } else if (targetType === 'STUDENTS') {
      const students = await db.User.findAll({ where: { Role: 'STUDENT' }, attributes: ['Id'] });
      await notificationService.notifyUsers(students.map(s => s.Id), { title, content, linkUrl });
    } else if (targetType === 'TEACHERS') {
      const teachers = await db.User.findAll({ where: { Role: 'TEACHER' }, attributes: ['Id'] });
      await notificationService.notifyUsers(teachers.map(t => t.Id), { title, content, linkUrl });
    } else if (targetType === 'CLASS' && targetId) {
      const enrollments = await db.ClassEnrollment.findAll({ where: { ClassId: targetId }, attributes: ['StudentId'] });
      await notificationService.notifyUsers(enrollments.map(e => e.StudentId), { title, content, linkUrl });
    } else if (targetType === 'USER' && targetId) {
      await notificationService.notifyUser(targetId, { title, content, linkUrl });
    } else {
      await db.Notification.create({
        UserId: null,
        Title: title,
        Content: content,
        LinkUrl: linkUrl || null,
        CreatedAt: new Date()
      });
    }

    res.json({ success: true, message: 'Đã gửi thông báo thành công!' });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.json({ success: false, message: 'Lỗi khi gửi thông báo.' });
  }
};

// POST: /Notification/Delete
controller.deleteNotification = async (req, res) => {
  const id = req.body.id || req.body.notificationId;
  const userId = req.session.userId;
  const role = req.session.role;

  try {
    const condition = role === 'ADMIN' ? { Id: id } : { Id: id, UserId: userId };
    const notif = await db.Notification.findOne({ where: condition });
    if (!notif) {
      return res.json({ success: false, message: 'Không tìm thấy thông báo.' });
    }
    await notif.destroy();
    res.json({ success: true, message: 'Đã xóa thông báo thành công.' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.json({ success: false, message: 'Lỗi hệ thống.' });
  }
};

module.exports = controller;

