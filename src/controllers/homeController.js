const express = require('express');
const router = express.Router();
const db = require('../models');

// GET: / (Home Page)
router.get('/', async (req, res) => {
  try {
    const courses = await db.Course.findAll({
      where: { Status: 1 }, // ACTIVE
      limit: 4
    });
    const teachers = await db.User.findAll({
      where: {
        Role: db.User.RoleMap.TEACHER,
        Status: db.User.StatusMap.ACTIVE
      },
      include: [{ model: db.UserProfile, as: 'Profile' }],
      limit: 5,
      order: [['Id', 'ASC']]
    });
    res.render('home/index', { courses, teachers, layout: false });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi máy chủ.' });
  }
});

// GET: /Home/Courses
router.get('/Home/Courses', async (req, res) => {
  try {
    const courses = await db.Course.findAll({
      where: { Status: 1 } // ACTIVE
    });
    res.render('home/courses', { courses, layout: false });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi máy chủ.' });
  }
});

// GET: /Home/Teachers
router.get('/Home/Teachers', async (req, res) => {
  try {
    const teachers = await db.User.findAll({
      where: {
        Role: db.User.RoleMap.TEACHER,
        Status: db.User.StatusMap.ACTIVE
      },
      include: [{ model: db.UserProfile, as: 'Profile' }],
      order: [['Id', 'ASC']]
    });
    res.render('home/teachers', { teachers, layout: false });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang đội ngũ giáo viên.' });
  }
});

// GET: /Home/News
router.get('/Home/News', (req, res) => {
  res.render('home/news', { layout: false });
});

// GET: /Home/Documents
router.get('/Home/Documents', (req, res) => {
  res.render('home/documents', { layout: false });
});

// GET: /Home/Privacy
router.get('/Home/Privacy', (req, res) => {
  res.render('home/privacy');
});

module.exports = router;
