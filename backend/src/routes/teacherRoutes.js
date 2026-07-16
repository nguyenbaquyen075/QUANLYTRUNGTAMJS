const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { requireAuth } = require('../middlewares/auth');

router.get('/Teacher/Dashboard', requireAuth(['TEACHER']), teacherController.getDashboard);
router.get('/Teacher/Attendance/:id', requireAuth(['TEACHER']), teacherController.getAttendance);
router.post('/Teacher/SaveAttendance', requireAuth(['TEACHER']), teacherController.saveAttendance);
router.get('/Teacher/ClassReport/:id', requireAuth(['TEACHER']), teacherController.getClassReport);
router.get('/Teacher/CreateAssignment/:lessonId', requireAuth(['TEACHER']), teacherController.getCreateAssignment);
router.post('/Teacher/CreateAssignment/:lessonId', requireAuth(['TEACHER']), teacherController.upload.single('attachment'), teacherController.createAssignment);
router.get('/Teacher/Submissions/:id', requireAuth(['TEACHER']), teacherController.getSubmissions);
router.post('/Teacher/GradeSubmission', requireAuth(['TEACHER']), teacherController.gradeSubmission);
router.post('/Teacher/UpdateLesson', requireAuth(['TEACHER']), teacherController.upload.single('document'), teacherController.updateLesson);
router.post('/Teacher/UpdateLessonVideo', requireAuth(['TEACHER']), teacherController.updateLessonVideo);
router.post('/Teacher/UploadLessonVideo', requireAuth(['TEACHER']), teacherController.videoUpload.single('videoFile'), teacherController.uploadLessonVideo);
router.post('/Teacher/CreateLesson', requireAuth(['TEACHER']), teacherController.upload.single('document'), teacherController.createLesson);
router.get('/Teacher/CreateExam/:classId', requireAuth(['TEACHER']), teacherController.getCreateExam);
router.post('/Teacher/CreateExam/:classId', requireAuth(['TEACHER']), teacherController.upload.single('attachment'), teacherController.createExam);
router.post('/Teacher/GrantVideoAccess', requireAuth(['TEACHER']), teacherController.grantVideoAccess);

module.exports = router;
