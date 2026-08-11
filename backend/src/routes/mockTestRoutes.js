const express = require('express');
const router = express.Router();
const mockTestController = require('../controllers/mockTestController');
const { requireAuth } = require('../middlewares/auth');

const MANAGE_ROLES = ['ADMIN', 'STAFF', 'TEACHER'];

router.get('/Admin/MockTests', requireAuth(MANAGE_ROLES), mockTestController.listMockTests);
router.post('/Admin/MockTests', requireAuth(MANAGE_ROLES), mockTestController.createMockTest);
router.post('/Admin/MockTests/:id', requireAuth(MANAGE_ROLES), mockTestController.updateMockTest);
router.post('/Admin/MockTests/:id/Delete', requireAuth(MANAGE_ROLES), mockTestController.deleteMockTest);
router.post('/Admin/MockTests/:id/Questions', requireAuth(MANAGE_ROLES), mockTestController.createQuestion);
router.post('/Admin/MockTests/:id/Questions/:qId', requireAuth(MANAGE_ROLES), mockTestController.updateQuestion);
router.post('/Admin/MockTests/:id/Questions/:qId/Delete', requireAuth(MANAGE_ROLES), mockTestController.deleteQuestion);

module.exports = router;
