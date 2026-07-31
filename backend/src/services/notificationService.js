const db = require('../models');
const { sendNotificationToUser } = require('../sockets/signalRCompat');

exports.notifyUser = async (userId, { title, content, linkUrl }) => {
  const notif = await db.Notification.create({
    UserId: userId,
    Title: title,
    Content: content,
    LinkUrl: linkUrl || null,
    CreatedAt: new Date()
  });
  const createdAtStr = new Date(notif.CreatedAt).toLocaleDateString('vi-VN') + ' ' + new Date(notif.CreatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  sendNotificationToUser(userId, {
    title: notif.Title,
    content: notif.Content,
    linkUrl: notif.LinkUrl,
    createdAt: createdAtStr
  });
  return notif;
};

exports.notifyUsers = async (userIds, { title, content, linkUrl }) => {
  return Promise.all(userIds.map((userId) => exports.notifyUser(userId, { title, content, linkUrl })));
};
