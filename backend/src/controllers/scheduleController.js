const db = require('../models');
const svc = require('../services/scheduledActionService');

const controller = {};
const actor = (req) => ({ id: req.session.userId, role: req.session.userRole });

const SECTION_LABELS = {
  sec01_active: 'Banner đầu trang', sec02_active: 'Slide khuyến mãi', sec03_active: 'Ảnh báo điểm',
  sec04_active: 'Khóa học nổi bật', sec05_active: 'Lộ trình khóa học', sec06_active: 'Thành tích nổi bật',
  sec07_active: 'Giáo viên', sec08_active: 'Feedback học viên', sec09_active: 'Giới thiệu trung tâm',
  sec10_active: 'Địa chỉ (chân trang)', sec11_active: 'Liên hệ (chân trang)'
};

// GET /api/Schedules/Options — bài tập người dùng được phép hẹn giờ + danh sách mục trang chủ (admin)
controller.options = async (req, res) => {
  try {
    const me = actor(req);
    const classWhere = me.role === 'ADMIN' ? {} : { TeacherId: me.id };
    const assignments = await db.Assignment.findAll({
      include: [{ model: db.Lesson, as: 'Lesson', required: true, include: [{ model: db.Class, as: 'Class', required: true, where: classWhere }] }],
      order: [['Id', 'DESC']], limit: 300
    });
    res.json({
      success: true,
      assignments: assignments.map((a) => ({
        id: a.Id, title: a.Title, className: a.Lesson.Class.ClassName, dueDate: a.DueDate, openAt: a.OpenAt,
        published: a.Status === db.Assignment.StatusMap.PUBLISHED
      })),
      sections: me.role === 'ADMIN' ? Object.entries(SECTION_LABELS).map(([key, label]) => ({ key, label })) : []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải dữ liệu.' });
  }
};

// GET /api/Schedules
controller.list = async (req, res) => {
  try {
    const me = actor(req);
    const rows = await db.ScheduledAction.findAll({
      where: me.role === 'ADMIN' ? {} : { CreatedBy: me.id }, order: [['RunAt', 'DESC']], limit: 200
    });
    const ids = [...new Set(rows.map((r) => JSON.parse(r.Payload).assignmentId).filter(Boolean))];
    const titles = Object.fromEntries((await db.Assignment.findAll({ where: { Id: ids }, attributes: ['Id', 'Title'] })).map((a) => [a.Id, a.Title]));
    res.json({
      success: true,
      actions: rows.map((r) => {
        const payload = JSON.parse(r.Payload);
        return { id: r.Id, type: r.Type, runAt: r.RunAt, status: r.Status, result: r.Result, executedAt: r.ExecutedAt, payload, assignmentTitle: titles[payload.assignmentId] || null };
      })
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách.' });
  }
};

// POST /api/Schedules { type, runAt, payload }
controller.create = async (req, res) => {
  try {
    const me = actor(req);
    const { type, runAt, payload } = req.body || {};
    const error = svc.validateAction(type, payload, runAt);
    if (error) return res.status(400).json({ success: false, message: error });

    const assignment = payload.assignmentId ? await svc.loadAssignment(payload.assignmentId) : null;
    if (payload.assignmentId && !assignment) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập.' });
    if (!svc.canManage(me, type, assignment)) return res.status(403).json({ success: false, message: 'Bạn không có quyền với việc này.' });

    // Chỉ giữ các trường đã biết, không lưu nguyên body người dùng gửi.
    const clean = type === 'TOGGLE_SECTION'
      ? { key: payload.key, value: payload.value }
      : { assignmentId: payload.assignmentId, ...(type === 'EXTEND_DUE' && { addHours: payload.addHours, ...(payload.minNotSubmittedPercent !== undefined && { minNotSubmittedPercent: payload.minNotSubmittedPercent }) }), ...(type === 'NOTIFY_NOT_SUBMITTED' && payload.message && { message: String(payload.message) }) };

    const action = await db.ScheduledAction.create({
      Type: type, RunAt: new Date(runAt), Payload: JSON.stringify(clean), CreatedBy: me.id, CreatedByRole: me.role
    });
    res.json({ success: true, id: action.Id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tạo lịch hẹn.' });
  }
};

// POST /api/Schedules/:id/Cancel
controller.cancel = async (req, res) => {
  try {
    const me = actor(req);
    const action = await db.ScheduledAction.findByPk(parseInt(req.params.id));
    if (!action || (me.role !== 'ADMIN' && action.CreatedBy !== me.id)) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn.' });
    const [changed] = await db.ScheduledAction.update({ Status: 'CANCELLED' }, { where: { Id: action.Id, Status: 'PENDING' } });
    if (!changed) return res.status(409).json({ success: false, message: 'Chỉ hủy được việc đang chờ.' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hủy lịch hẹn.' });
  }
};

module.exports = controller;
