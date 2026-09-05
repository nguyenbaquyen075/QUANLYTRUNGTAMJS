const express = require('express');
const router = Router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middlewares/auth');

router.get('/Notification', requireAuth(), notificationController.getNotificationPage);
router.get('/Notification/List', requireAuth(), notificationController.getNotificationList);
router.post('/Notification/MarkAsRead', requireAuth(), notificationController.markAsRead);
router.post('/Notification/MarkAllAsRead', requireAuth(), notificationController.markAllAsRead);
router.get('/Notification/GetUnreadCount', notificationController.getUnreadCount);
router.post('/Notification/Create', requireAuth(['ADMIN', 'STAFF', 'TEACHER']), notificationController.createNotification);
router.post('/Notification/Delete', requireAuth(), notificationController.deleteNotification);

module.exports = router;
