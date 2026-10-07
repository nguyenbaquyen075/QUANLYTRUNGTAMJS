// Thực thi các việc hẹn giờ (bảng ScheduledActions). Mọi quyết định (điều kiện, quyền) do code quyết định,
// không có AI trong vòng này. Mở/đóng bài đúng giờ không phụ thuộc file này: OpenAt/DueDate được kiểm tra
// lúc học viên truy cập (xem utils/assignmentAccess.js), nên server ngủ cũng không lệch giờ.
const db = require('../models');
const notificationService = require('./notificationService');
const auditLogService = require('./auditLogService');
const { invalidateHomeCache } = require('./homeService');

const { Op } = db.Sequelize;
const ASSIGNMENT_TYPES = ['OPEN_ASSIGNMENT', 'CLOSE_ASSIGNMENT', 'EXTEND_DUE', 'NOTIFY_NOT_SUBMITTED'];
const TYPES = [...ASSIGNMENT_TYPES, 'TOGGLE_SECTION'];
const SECTION_KEY = /^sec(0[1-9]|1[0-2])_active$/;
const MAX_EXTEND_HOURS = 24 * 30;

// Trả về chuỗi lỗi, hoặc null nếu hợp lệ.
function validateAction(type, payload, runAt, now = new Date()) {
  if (!TYPES.includes(type)) return 'Loại việc không hợp lệ.';
  const p = payload || {};
  const when = new Date(runAt);
  if (Number.isNaN(when.getTime())) return 'Thời điểm chạy không hợp lệ.';
  if (when.getTime() < now.getTime() - 5 * 60 * 1000) return 'Thời điểm chạy đã qua.';
  if (when.getTime() > now.getTime() + 365 * 24 * 3600 * 1000) return 'Thời điểm chạy quá xa (tối đa 1 năm).';
  if (ASSIGNMENT_TYPES.includes(type) && !Number.isInteger(p.assignmentId)) return 'Thiếu bài tập.';
  if (type === 'EXTEND_DUE') {
    if (typeof p.addHours !== 'number' || !(p.addHours > 0) || p.addHours > MAX_EXTEND_HOURS) return `Số giờ gia hạn phải từ 1 đến ${MAX_EXTEND_HOURS}.`;
    if (p.minNotSubmittedPercent !== undefined && !(p.minNotSubmittedPercent >= 0 && p.minNotSubmittedPercent <= 100)) return 'Tỉ lệ chưa nộp phải từ 0 đến 100.';
  }
  if (type === 'NOTIFY_NOT_SUBMITTED' && p.message !== undefined && String(p.message).length > 300) return 'Nội dung nhắc tối đa 300 ký tự.';
  if (type === 'TOGGLE_SECTION') {
    if (!SECTION_KEY.test(p.key || '')) return 'Mục trang chủ không hợp lệ.';
    if (typeof p.value !== 'boolean') return 'Thiếu giá trị bật/tắt.';
  }
  return null;
}

// ADMIN quản lý mọi bài; TEACHER chỉ bài thuộc lớp mình dạy; việc trang chủ chỉ ADMIN.
function canManage(user, type, assignment) {
  if (user.role === 'ADMIN') return true;
  if (user.role !== 'TEACHER' || type === 'TOGGLE_SECTION') return false;
  return !!assignment && assignment.Lesson && assignment.Lesson.Class && assignment.Lesson.Class.TeacherId === user.id;
}

const loadAssignment = (id) => db.Assignment.findByPk(id, {
  include: [{ model: db.Lesson, as: 'Lesson', include: [{ model: db.Class, as: 'Class' }] }]
});

async function notSubmittedStudentIds(assignment) {
  const classId = assignment.Lesson.ClassId;
  const [enrolled, submitted] = await Promise.all([
    db.ClassStudent.findAll({ where: { ClassId: classId, Status: db.ClassStudent.StatusMap.LEARNING } }),
    db.Submission.findAll({ where: { AssignmentId: assignment.Id }, attributes: ['StudentId'] })
  ]);
  const done = new Set(submitted.map((s) => s.StudentId));
  return { total: enrolled.length, pending: enrolled.map((e) => e.StudentId).filter((id) => !done.has(id)) };
}

const fmt = (d) => new Date(d).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

async function setSection(key, value) {
  const existing = await db.SiteSetting.findOne({ where: { Key: key } });
  if (existing) { existing.Value = String(value); existing.UpdatedAt = new Date(); await existing.save(); }
  else await db.SiteSetting.create({ Key: key, Value: String(value), UpdatedAt: new Date() });
  invalidateHomeCache();
}

// Trả về { status: 'DONE' | 'SKIPPED', result, entityType, entityId }. Ném lỗi nếu hỏng.
async function executeAction(action, now = new Date()) {
  const p = JSON.parse(action.Payload);
  const creator = { id: action.CreatedBy, role: action.CreatedByRole };

  if (action.Type === 'TOGGLE_SECTION') {
    if (!canManage(creator, action.Type, null)) return { status: 'SKIPPED', result: 'Người tạo không còn quyền.', entityType: 'SiteSetting', entityId: 0 };
    await setSection(p.key, p.value);
    return { status: 'DONE', result: `${p.key} = ${p.value}`, entityType: 'SiteSetting', entityId: 0 };
  }

  const assignment = await loadAssignment(p.assignmentId);
  if (!assignment) return { status: 'SKIPPED', result: 'Bài tập không còn tồn tại.', entityType: 'Assignment', entityId: p.assignmentId };
  const base = { entityType: 'Assignment', entityId: assignment.Id };
  if (!canManage(creator, action.Type, assignment)) return { ...base, status: 'SKIPPED', result: 'Người tạo không còn quyền với bài này.' };

  if (action.Type === 'OPEN_ASSIGNMENT') {
    assignment.Status = db.Assignment.StatusMap.PUBLISHED;
    assignment.OpenAt = now;
    await assignment.save();
    return { ...base, status: 'DONE', result: 'Đã mở bài cho học viên.' };
  }

  if (action.Type === 'CLOSE_ASSIGNMENT') {
    if (new Date(assignment.DueDate) <= now) return { ...base, status: 'SKIPPED', result: 'Bài đã hết hạn từ trước.' };
    assignment.DueDate = now;
    await assignment.save();
    return { ...base, status: 'DONE', result: 'Đã đóng bài.' };
  }

  const { total, pending } = await notSubmittedStudentIds(assignment);

  if (action.Type === 'EXTEND_DUE') {
    const pct = total ? (pending.length / total) * 100 : 0;
    if (p.minNotSubmittedPercent !== undefined && pct < p.minNotSubmittedPercent) {
      return { ...base, status: 'SKIPPED', result: `Chỉ ${pct.toFixed(0)}% chưa nộp (< ${p.minNotSubmittedPercent}%), không gia hạn.` };
    }
    const from = Math.max(new Date(assignment.DueDate).getTime(), now.getTime());
    assignment.DueDate = new Date(from + p.addHours * 3600 * 1000);
    await assignment.save();
    if (pending.length) {
      await notificationService.notifyUsers(pending, {
        title: 'Bài tập được gia hạn',
        content: `Bài "${assignment.Title}" được gia hạn đến ${fmt(assignment.DueDate)}.`,
        linkUrl: `/Student/DoAssignment/${assignment.Id}`
      });
    }
    return { ...base, status: 'DONE', result: `Gia hạn đến ${fmt(assignment.DueDate)} (${pending.length}/${total} chưa nộp).` };
  }

  // NOTIFY_NOT_SUBMITTED
  if (pending.length) {
    await notificationService.notifyUsers(pending, {
      title: 'Nhắc nộp bài',
      content: p.message || `Bài "${assignment.Title}" hạn nộp ${fmt(assignment.DueDate)}. Bạn chưa nộp bài.`,
      linkUrl: `/Student/DoAssignment/${assignment.Id}`
    });
  }
  return { ...base, status: 'DONE', result: `Đã nhắc ${pending.length} học viên chưa nộp.` };
}

// Mỗi việc được "chiếm" bằng UPDATE có điều kiện Status = PENDING nên chạy 2 job song song cũng không làm đôi.
async function runDueActions(now = new Date()) {
  const due = await db.ScheduledAction.findAll({
    where: { Status: 'PENDING', RunAt: { [Op.lte]: now } }, order: [['RunAt', 'ASC']], limit: 50
  });
  let ran = 0;
  for (const action of due) {
    const [claimed] = await db.ScheduledAction.update({ Status: 'RUNNING' }, { where: { Id: action.Id, Status: 'PENDING' } });
    if (!claimed) continue;
    try {
      const r = await executeAction(action, now);
      await action.update({ Status: r.status, ExecutedAt: new Date(), Result: r.result });
      if (r.status === 'DONE') {
        await auditLogService.logAction({
          actorUserId: action.CreatedBy, actorRole: action.CreatedByRole, action: `SCHEDULED_${action.Type}`,
          entityType: r.entityType, entityId: r.entityId, description: r.result
        });
      }
      ran++;
    } catch (err) {
      console.error('[scheduledActionService] Lỗi việc', action.Id, err);
      await action.update({ Status: 'FAILED', ExecutedAt: new Date(), Result: String(err.message || err).slice(0, 500) });
    }
  }
  return ran;
}

// Khởi động lại giữa lúc đang chạy dở thì việc kẹt ở RUNNING: đánh FAILED thay vì chạy lại (tránh gửi thông báo 2 lần).
async function failInterruptedActions() {
  await db.ScheduledAction.update(
    { Status: 'FAILED', ExecutedAt: new Date(), Result: 'Bị gián đoạn do server khởi động lại.' },
    { where: { Status: 'RUNNING' } }
  );
}

module.exports = { TYPES, validateAction, canManage, executeAction, runDueActions, failInterruptedActions, loadAssignment };
