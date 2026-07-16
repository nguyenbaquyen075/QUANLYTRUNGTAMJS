const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { requireAuth } = require('../middlewares/auth');

router.get('/Student/Dashboard', requireAuth(['STUDENT']), studentController.getDashboard);
router.get('/Student/Classroom/:id', requireAuth(['STUDENT']), studentController.getClassroom);
router.get('/Student/DoAssignment/:id', requireAuth(['STUDENT']), studentController.getDoAssignment);
router.post('/Student/SubmitAssignment', requireAuth(['STUDENT']), studentController.submitAssignment);
router.post('/Student/UploadFile', requireAuth(['STUDENT']), studentController.upload.single('file'), studentController.uploadFile);
router.get('/Student/Report', requireAuth(['STUDENT']), studentController.getReport);
router.get('/Student/AssignmentLeaderboard/:id', requireAuth(['STUDENT']), studentController.getAssignmentLeaderboard);

module.exports = router;
