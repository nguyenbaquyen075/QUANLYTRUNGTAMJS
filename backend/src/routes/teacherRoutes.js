const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { requireAuth } = require('../middlewares/auth');

router.get('/Teacher/Dashboard', requireAuth(['TEACHER', 'ADMIN']), teacherController.getDashboard);
router.get('/dashboard/teacher', requireAuth(['TEACHER', 'ADMIN']), teacherController.getDashboard);
router.get('/Teacher/Attendance/:id', requireAuth(['TEACHER', 'ADMIN']), teacherController.getAttendance);
router.post('/Teacher/SaveAttendance', requireAuth(['TEACHER', 'ADMIN']), teacherController.saveAttendance);
router.post('/Teacher/OpenAttendance', requireAuth(['TEACHER', 'ADMIN']), teacherController.openAttendance);
router.post('/Teacher/CloseAttendance', requireAuth(['TEACHER']), teacherController.closeAttendance);
router.get('/Teacher/ClassReport/:id', requireAuth(['TEACHER']), teacherController.getClassReport);
router.get('/Teacher/CreateAssignment/:lessonId', requireAuth(['TEACHER']), teacherController.getCreateAssignment);
router.post('/Teacher/CreateAssignment/:lessonId', requireAuth(['TEACHER']), teacherController.upload.single('attachment'), teacherController.createAssignment);
router.get('/Teacher/Submissions/:id', requireAuth(['TEACHER']), teacherController.getSubmissions);
router.post('/Teacher/GradeSubmission', requireAuth(['TEACHER']), teacherController.gradeSubmission);
router.get('/Teacher/Grading/:id', requireAuth(['TEACHER']), teacherController.getGrading);
router.post('/Teacher/UpdateLesson', requireAuth(['TEACHER']), teacherController.upload.single('document'), teacherController.updateLesson);
router.post('/Teacher/UpdateLessonVideo', requireAuth(['TEACHER']), teacherController.updateLessonVideo);
router.post('/Teacher/UploadLessonVideo', requireAuth(['TEACHER']), teacherController.videoUpload.single('videoFile'), teacherController.uploadLessonVideo);
router.post('/Teacher/CreateLesson', requireAuth(['TEACHER']), teacherController.upload.single('document'), teacherController.createLesson);
router.get('/Teacher/CreateExam/:classId', requireAuth(['TEACHER']), teacherController.getCreateExam);
router.post('/Teacher/CreateExam/:classId', requireAuth(['TEACHER']), teacherController.upload.single('attachment'), teacherController.createExam);
router.post('/Teacher/GrantVideoAccess', requireAuth(['TEACHER']), teacherController.grantVideoAccess);

// Luồng Quản Lý Lớp Học Được Giao
router.get('/Teacher/ClassDetail/:id', requireAuth(['TEACHER']), teacherController.getClassDetail);
router.post('/Teacher/UpdateClassInfo', requireAuth(['TEACHER']), teacherController.updateClassInfo);
router.post('/Teacher/AddMakeupLesson', requireAuth(['TEACHER']), teacherController.addMakeupLesson);
router.post('/Teacher/CancelLesson', requireAuth(['TEACHER']), teacherController.cancelLesson);
router.post('/Teacher/RescheduleLesson', requireAuth(['TEACHER']), teacherController.rescheduleLesson);
router.post('/Teacher/AddStudentNote', requireAuth(['TEACHER']), teacherController.addStudentNote);
router.post('/Teacher/TransferStudent', requireAuth(['TEACHER']), teacherController.transferStudent);
router.post('/Teacher/BlockStudent', requireAuth(['TEACHER']), teacherController.blockStudent);
router.post('/Teacher/UnblockStudent', requireAuth(['TEACHER']), teacherController.unblockStudent);
router.post('/Teacher/KickStudent', requireAuth(['TEACHER']), teacherController.kickStudent);
router.post('/Teacher/NotifyClass', requireAuth(['TEACHER']), teacherController.notifyClass);
router.post('/Teacher/CloneClass', requireAuth(['TEACHER']), teacherController.cloneClass);
router.get('/Teacher/ExportClassExcel/:id', requireAuth(['TEACHER']), teacherController.exportClassExcel);
router.get('/Teacher/ExportClassPdf/:id', requireAuth(['TEACHER']), teacherController.exportClassPdf);

module.exports = router;
