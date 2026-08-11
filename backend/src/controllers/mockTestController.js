const controller = {};
const db = require('../models');

function validateOptions(options, correctIndex) {
  if (!Array.isArray(options) || options.length < 2) {
    return 'Đề thi cần ít nhất 2 đáp án cho mỗi câu hỏi.';
  }
  const idx = parseInt(correctIndex);
  if (Number.isNaN(idx) || idx < 0 || idx >= options.length) {
    return 'Đáp án đúng không hợp lệ.';
  }
  return null;
}

// GET: /Admin/MockTests
controller.listMockTests = async (req, res) => {
  try {
    const tests = await db.MockTest.findAll({
      include: [{ model: db.MockTestQuestion, as: 'Questions', attributes: ['Id'] }],
      order: [['Id', 'DESC']]
    });
    res.json({
      success: true,
      data: tests.map((t) => ({
        id: t.Id,
        grade: t.Grade,
        subject: t.Subject,
        subjectCode: t.SubjectCode,
        title: t.Title,
        code: t.Code,
        duration: t.Duration,
        status: t.Status,
        totalQuestions: t.Questions.length
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách đề thi.' });
  }
};

// POST: /Admin/MockTests
controller.createMockTest = async (req, res) => {
  const { grade, subject, subjectCode, coverBg, title, code, duration, status } = req.body;
  if (!grade || !subject || !subjectCode || !title || !duration) {
    return res.json({ success: false, message: 'Vui lòng nhập đủ Khối lớp, Môn học, Tên đề và Thời gian làm bài.' });
  }
  try {
    const test = await db.MockTest.create({
      Grade: grade,
      Subject: subject,
      SubjectCode: subjectCode,
      CoverBg: coverBg || null,
      Title: title,
      Code: code || null,
      Duration: parseInt(duration),
      Status: status !== undefined ? parseInt(status) : db.MockTest.StatusMap.DRAFT,
      CreatedBy: req.session.userId
    });
    res.json({ success: true, message: 'Đã tạo đề thi.', data: { id: test.Id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo đề thi.' });
  }
};

// POST: /Admin/MockTests/:id
controller.updateMockTest = async (req, res) => {
  try {
    const test = await db.MockTest.findByPk(req.params.id);
    if (!test) return res.json({ success: false, message: 'Không tìm thấy đề thi.' });

    const { grade, subject, subjectCode, coverBg, title, code, duration, status } = req.body;
    await test.update({
      Grade: grade ?? test.Grade,
      Subject: subject ?? test.Subject,
      SubjectCode: subjectCode ?? test.SubjectCode,
      CoverBg: coverBg ?? test.CoverBg,
      Title: title ?? test.Title,
      Code: code ?? test.Code,
      Duration: duration !== undefined ? parseInt(duration) : test.Duration,
      Status: status !== undefined ? parseInt(status) : test.Status
    });
    res.json({ success: true, message: 'Đã cập nhật đề thi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật đề thi.' });
  }
};

// POST: /Admin/MockTests/:id/Delete
controller.deleteMockTest = async (req, res) => {
  try {
    const test = await db.MockTest.findByPk(req.params.id);
    if (!test) return res.json({ success: false, message: 'Không tìm thấy đề thi.' });
    await db.MockTestQuestion.destroy({ where: { MockTestId: test.Id } });
    await db.MockTestSubmission.destroy({ where: { MockTestId: test.Id } });
    await test.destroy();
    res.json({ success: true, message: 'Đã xoá đề thi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi xoá đề thi.' });
  }
};

// POST: /Admin/MockTests/:id/Questions
controller.createQuestion = async (req, res) => {
  const { content, options, correctIndex, explanation, points, sortOrder } = req.body;
  try {
    const parsedOptions = Array.isArray(options) ? options : JSON.parse(options || '[]');
    const validationError = validateOptions(parsedOptions, correctIndex);
    if (validationError) return res.json({ success: false, message: validationError });

    const test = await db.MockTest.findByPk(req.params.id);
    if (!test) return res.json({ success: false, message: 'Không tìm thấy đề thi.' });

    const question = await db.MockTestQuestion.create({
      MockTestId: test.Id,
      Content: content,
      Options: JSON.stringify(parsedOptions),
      CorrectIndex: parseInt(correctIndex),
      Explanation: explanation || null,
      Points: points !== undefined ? parseFloat(points) : 1,
      SortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0
    });
    res.json({ success: true, message: 'Đã thêm câu hỏi.', data: { id: question.Id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi thêm câu hỏi.' });
  }
};

// POST: /Admin/MockTests/:id/Questions/:qId
controller.updateQuestion = async (req, res) => {
  const { content, options, correctIndex, explanation, points, sortOrder } = req.body;
  try {
    const question = await db.MockTestQuestion.findOne({
      where: { Id: req.params.qId, MockTestId: req.params.id }
    });
    if (!question) return res.json({ success: false, message: 'Không tìm thấy câu hỏi.' });

    let parsedOptions = question.Options ? JSON.parse(question.Options) : [];
    if (options !== undefined) {
      parsedOptions = Array.isArray(options) ? options : JSON.parse(options || '[]');
    }
    const effectiveCorrectIndex = correctIndex !== undefined ? correctIndex : question.CorrectIndex;
    const validationError = validateOptions(parsedOptions, effectiveCorrectIndex);
    if (validationError) return res.json({ success: false, message: validationError });

    await question.update({
      Content: content ?? question.Content,
      Options: JSON.stringify(parsedOptions),
      CorrectIndex: parseInt(effectiveCorrectIndex),
      Explanation: explanation ?? question.Explanation,
      Points: points !== undefined ? parseFloat(points) : question.Points,
      SortOrder: sortOrder !== undefined ? parseInt(sortOrder) : question.SortOrder
    });
    res.json({ success: true, message: 'Đã cập nhật câu hỏi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật câu hỏi.' });
  }
};

// POST: /Admin/MockTests/:id/Questions/:qId/Delete
controller.deleteQuestion = async (req, res) => {
  try {
    const question = await db.MockTestQuestion.findOne({
      where: { Id: req.params.qId, MockTestId: req.params.id }
    });
    if (!question) return res.json({ success: false, message: 'Không tìm thấy câu hỏi.' });
    await question.destroy();
    res.json({ success: true, message: 'Đã xoá câu hỏi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi xoá câu hỏi.' });
  }
};

module.exports = controller;
