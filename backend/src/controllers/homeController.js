const homeService = require('../services/homeService');

// GET: / (Home Page)
exports.getHome = async (req, res) => {
  try {
    const courses = await homeService.getFeaturedCourses(4);
    const teachers = await homeService.getActiveTeachers(5);
    res.render('home/index', { courses, teachers, layout: false });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi máy chủ.' });
  }
};

// GET: /Home/Courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await homeService.getAllActiveCourses();
    res.render('home/courses', { courses, layout: false });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi máy chủ.' });
  }
};

// GET: /Home/Teachers
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await homeService.getAllActiveTeachers();
    res.render('home/teachers', { teachers, layout: false });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Lỗi tải trang đội ngũ giáo viên.' });
  }
};

// GET: /Home/News
exports.getNews = (req, res) => {
  res.render('home/news', { layout: false });
};

// GET: /Home/Documents
exports.getDocuments = (req, res) => {
  res.render('home/documents', { layout: false });
};

// GET: /Home/Privacy
exports.getPrivacy = (req, res) => {
  res.render('home/privacy');
};

// GET: /Home/Data (React homepage REST API)
exports.getHomeData = async (req, res) => {
  try {
    const courses = await homeService.getFeaturedCourses(4);
    const teachers = await homeService.getActiveTeachers(5);
    res.json({
      success: true,
      data: {
        courses,
        teachers
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải dữ liệu trang chủ.' });
  }
};
