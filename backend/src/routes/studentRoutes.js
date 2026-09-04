const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { requireAuth } = require('../middlewares/auth');

router.get('/Student/Dashboard', requireAuth(['STUDENT', 'ADMIN']), studentController.getDashboard);
router.get('/dashboard/student', requireAuth(['STUDENT', 'ADMIN']), studentController.getDashboard);
router.get('/Student/Classroom/:id', requireAuth(['STUDENT', 'ADMIN']), studentController.getClassroom);
router.get('/Student/DoAssignment/:id', requireAuth(['STUDENT', 'ADMIN']), studentController.getDoAssignment);
router.post('/Student/SubmitAssignment', requireAuth(['STUDENT', 'ADMIN']), studentController.submitAssignment);
router.post('/Student/UploadFile', requireAuth(['STUDENT']), studentController.upload.single('file'), studentController.uploadFile);
router.get('/Student/Report', requireAuth(['STUDENT']), studentController.getReport);
router.get('/Student/AssignmentLeaderboard/:id', requireAuth(['STUDENT']), studentController.getAssignmentLeaderboard);

module.exports = router;
