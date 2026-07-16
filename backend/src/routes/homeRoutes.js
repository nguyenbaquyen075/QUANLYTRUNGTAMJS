const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/', homeController.getHome);
router.get('/Home/Courses', homeController.getCourses);
router.get('/Home/Teachers', homeController.getTeachers);
router.get('/Home/News', homeController.getNews);
router.get('/Home/Documents', homeController.getDocuments);
router.get('/Home/Privacy', homeController.getPrivacy);
router.get('/Home/Data', homeController.getHomeData);

module.exports = router;
