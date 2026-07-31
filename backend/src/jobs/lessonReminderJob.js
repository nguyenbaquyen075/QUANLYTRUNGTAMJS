// Nhắc lịch tự động trước buổi học 24 giờ (cố định, theo quyết định trong luong-quan-ly-lop-duoc-giao-spec.md).
// Không có hạ tầng cron trong dự án — dùng setInterval poll định kỳ thay vì thêm dependency mới (node-cron/agenda).
// ReminderSentAt trên Lesson đảm bảo idempotent: mỗi buổi chỉ gửi nhắc đúng 1 lần dù job chạy nhiều lần.
const db = require('../models');
const notificationService = require('../services/notificationService');

const REMINDER_HOURS_BEFORE = 24;
const POLL_INTERVAL_MS = 10 * 60 * 1000; // 10 phút/lần

function combineDateAndTime(lessonDate, timeStr) {
  const d = new Date(lessonDate);
  const [h, m, s] = (timeStr || '00:00:00').split(':').map((n) => parseInt(n, 10) || 0);
  d.setHours(h, m, s, 0);
  return d;
}

async function checkAndSendReminders() {
  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMINDER_HOURS_BEFORE * 60 * 60 * 1000);

    const candidateLessons = await db.Lesson.findAll({
      where: {
        Status: db.Lesson.StatusMap.SCHEDULED,
        ReminderSentAt: null,
        LessonDate: { [db.Sequelize.Op.lte]: windowEnd }
      },
      include: [{ model: db.Class, as: 'Class' }]
    });

    for (const lesson of candidateLessons) {
      const scheduledAt = combineDateAndTime(lesson.LessonDate, lesson.StartTime);
      if (scheduledAt <= now || scheduledAt > windowEnd) continue; // chưa tới mốc 24h, hoặc đã diễn ra

      const cls = lesson.Class;
      if (!cls) continue;

      const enrollments = await db.ClassStudent.findAll({
        where: { ClassId: cls.Id, Status: db.ClassStudent.StatusMap.LEARNING }
      });

      const recipientIds = enrollments.map((e) => e.StudentId);
      if (cls.TeacherId) recipientIds.push(cls.TeacherId);

      if (recipientIds.length > 0) {
        await notificationService.notifyUsers(recipientIds, {
          title: 'Nhắc lịch học sắp tới',
          content: `Buổi học "${lesson.Title}" (lớp "${cls.ClassName}") sẽ diễn ra vào ${scheduledAt.toLocaleDateString('vi-VN')} lúc ${lesson.StartTime}.`,
          linkUrl: '/Student/Dashboard'
        });
      }

      lesson.ReminderSentAt = now;
      await lesson.save();
    }
  } catch (err) {
    console.error('[lessonReminderJob] Lỗi khi gửi nhắc lịch:', err);
  }
}

function startLessonReminderJob() {
  checkAndSendReminders();
  setInterval(checkAndSendReminders, POLL_INTERVAL_MS);
  console.log(`[lessonReminderJob] Đã khởi động — nhắc lịch trước ${REMINDER_HOURS_BEFORE}h, poll mỗi ${POLL_INTERVAL_MS / 60000} phút.`);
}

module.exports = { startLessonReminderJob };
