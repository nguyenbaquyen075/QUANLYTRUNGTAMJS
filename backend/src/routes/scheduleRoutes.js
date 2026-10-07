const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { requireAuth } = require('../middlewares/auth');

const staff = requireAuth(['TEACHER', 'ADMIN']);
router.get('/api/Schedules/Options', staff, scheduleController.options);
router.get('/api/Schedules', staff, scheduleController.list);
router.post('/api/Schedules', staff, scheduleController.create);
router.post('/api/Schedules/:id/Cancel', staff, scheduleController.cancel);

module.exports = router;
