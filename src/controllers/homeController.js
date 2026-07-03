const express = require('express');
const router = express.Router();
const db = require('../models');

// GET: / (Home Page)
router.get('/', async (req, res) => {
  try {
    const courses = await db.Course.findAll({
      where: { Status: 1 }, // ACTIVE
      limit: 3
    });
    res.render('home/index', { courses, layout: false });
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
router.get('/Home/Teachers', (req, res) => {
  res.render('home/teachers', { layout: false });
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
