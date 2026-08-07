const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middlewares/auth');

router.get('/Admin/Dashboard', adminController.getDashboard);
router.get('/dashboard/admin', adminController.getDashboard);
router.post('/Admin/CreateCourse', requireAuth(['ADMIN', 'STAFF']), adminController.upload.single('courseImage'), adminController.createCourse);
router.post('/Course/Update/:id', requireAuth(['ADMIN', 'STAFF', 'TEACHER']), adminController.upload.single('courseImage'), adminController.updateCourse);
router.post('/Admin/CreateClass', requireAuth(['ADMIN', 'STAFF']), adminController.createClass);
router.post('/Admin/CreateUser', requireAuth(['ADMIN', 'STAFF']), adminController.createUser);
router.post('/Admin/ToggleUserStatus/:id', requireAuth(['ADMIN', 'STAFF']), adminController.toggleUserStatus);
router.post('/Admin/DeleteUser/:id', requireAuth(['ADMIN', 'STAFF']), adminController.deleteUser);
router.post('/Admin/CreateInvoice', requireAuth(['ADMIN', 'STAFF']), adminController.createInvoice);
router.post('/Admin/MarkInvoicePaid/:id', requireAuth(['ADMIN', 'STAFF']), adminController.markInvoicePaid);
router.post('/Admin/DeleteClass/:id', requireAuth(['ADMIN', 'STAFF']), adminController.deleteClass);
router.post('/Admin/DeleteCourse/:id', requireAuth(['ADMIN', 'STAFF']), adminController.deleteCourse);
router.post('/Admin/CreateLead', requireAuth(['ADMIN', 'STAFF']), adminController.createLead);
router.get('/Admin/Courses/:courseId/Classes', requireAuth(['ADMIN', 'STAFF']), adminController.getCourseClasses);
router.post('/Admin/AssignTeacher/:id', requireAuth(['ADMIN', 'STAFF']), adminController.assignTeacher);
router.post('/Admin/EditClass/:id', requireAuth(['ADMIN', 'STAFF']), adminController.editClass);
router.post('/Admin/UpdateTeacherInfo', requireAuth(['ADMIN', 'STAFF']), adminController.updateTeacherInfo);
router.post('/Admin/UpdateStudentInfo', requireAuth(['ADMIN', 'STAFF']), adminController.updateStudentInfo);
router.post('/Admin/AddStudentToClass', requireAuth(['ADMIN', 'STAFF']), adminController.addStudentToClass);
router.post('/Admin/CreateTeacherEvaluation', requireAuth(['ADMIN', 'STAFF']), adminController.createTeacherEvaluation);
router.get('/Admin/TeacherEvaluations/:teacherId', requireAuth(['ADMIN', 'STAFF']), adminController.getTeacherEvaluations);
router.get('/Admin/Settings', requireAuth(['ADMIN', 'STAFF']), adminController.getSettingsAdmin);
router.post(
  '/Admin/Settings/General',
  requireAuth(['ADMIN', 'STAFF']),
  adminController.upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'heroBanner', maxCount: 1 },
    { name: 'aboutImage', maxCount: 1 },
    { name: 'spotlightImage', maxCount: 1 }
  ]),
  adminController.upsertGeneralSettings
);

module.exports = router;
