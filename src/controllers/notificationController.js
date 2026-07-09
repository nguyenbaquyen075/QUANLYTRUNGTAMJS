const express = require('express');
const router = express.Router();
const db = require('../models');
const { requireAuth } = require('../middleware/auth');

// GET: /Notification
router.get('/Notification', requireAuth(), async (req, res) => {
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
});

// GET: /Notification/List (JSON API)
router.get('/Notification/List', requireAuth(), async (req, res) => {
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
});

// POST: /Notification/MarkAsRead
router.post('/Notification/MarkAsRead', requireAuth(), async (req, res) => {
  const { id } = req.body;
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
});

// POST: /Notification/MarkAllAsRead
router.post('/Notification/MarkAllAsRead', requireAuth(), async (req, res) => {
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
});

// GET: /Notification/GetUnreadCount
router.get('/Notification/GetUnreadCount', async (req, res) => {
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
});

module.exports = router;
