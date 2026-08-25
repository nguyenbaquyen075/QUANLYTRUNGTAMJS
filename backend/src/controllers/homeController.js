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
    const [courses, teachers, stats, upcomingSchedule] = await Promise.all([
      homeService.getAllActiveCourses(),
      homeService.getActiveTeachers(5),
      homeService.getHomeStats(),
      homeService.getUpcomingSchedule(4)
    ]);
    res.json({
      success: true,
      data: {
        courses,
        teachers,
        stats,
        upcomingSchedule
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải dữ liệu trang chủ.' });
  }
};

// GET: /Home/CourseDetail/:id
exports.getCourseDetail = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, message: 'Id khóa học không hợp lệ' });
    }

    const detail = await homeService.getCourseDetail(courseId);
    if (!detail) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    res.json({ success: true, data: detail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải chi tiết khóa học' });
  }
};

// GET: /Home/MockTestData (React mock test platform REST API)
exports.getMockTestData = async (req, res) => {
  try {
    const subjects = [
      { id: 'all', name: 'Tất cả các môn', icon: '📚' },
      { id: 'toan', name: 'Toán Học', icon: '📐' },
      { id: 'ly', name: 'Vật Lý', icon: '⚡' },
      { id: 'hoa', name: 'Hóa Học', icon: '🧪' },
      { id: 'anh', name: 'Tiếng Anh', icon: '🌐' },
      { id: 'dgnl', name: 'Đánh Giá Năng Lực', icon: '🎯' },
      { id: 'van', name: 'Ngữ Văn', icon: '✍️' }
    ];

    res.json({
      success: true,
      data: {
        subjects,
        stats: {
          totalTests: 1250,
          totalSubmissions: 154200,
          averageScore: 7.8,
          activeContests: 3
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải dữ liệu thi thử.' });
  }
};

// GET: /Home/SiteContent (React public site content REST API)
exports.getSiteContent = async (req, res) => {
  try {
    const content = await homeService.getSiteContent();
    res.json({ success: true, data: content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải nội dung trang.' });
  }
};

