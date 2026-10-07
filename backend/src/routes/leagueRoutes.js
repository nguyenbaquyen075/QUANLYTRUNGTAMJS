const express = require('express');
const router = express.Router();
const league = require('../services/leagueService');

// Công khai: chỉ trả số liệu tổng hợp và tên rút gọn của đấu sĩ.
router.get('/api/League/Overview', async (req, res) => {
  try {
    res.json({ success: true, ...(await league.getOverview()) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Không tải được số liệu.' });
  }
});

router.get('/api/League/Ranking', async (req, res) => {
  try {
    const grade = parseInt(req.query.grade, 10) || null;
    const subject = league.SUBJECTS[String(req.query.subject || '').toUpperCase()] ? String(req.query.subject).toUpperCase() : null;
    res.json({ success: true, ranking: await league.getRanking({ grade, subject, limit: 50 }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Không tải được bảng xếp hạng.' });
  }
});

module.exports = router;
