const db = require('../models');

const ACTIVE_COURSE_STATUSES = [db.Course.StatusMap.OPEN, db.Course.StatusMap.FULL];

// Gắn thêm số lớp đang mở + số học viên đang học cho mỗi khoá (dữ liệu thật, không suy diễn)
async function attachCourseStats(courses) {
  const courseIds = courses.map(c => c.Id);
  if (courseIds.length === 0) return courses;

  const classes = await db.Class.findAll({
    attributes: ['Id', 'CourseId', 'Status'],
    where: { CourseId: courseIds }
  });
  const classIds = classes.map(c => c.Id);

  const enrollmentCounts = classIds.length > 0 ? await db.ClassStudent.findAll({
    attributes: ['ClassId', [db.Sequelize.fn('COUNT', db.Sequelize.col('Id')), 'count']],
    where: { ClassId: classIds, Status: db.ClassStudent.StatusMap.LEARNING },
    group: ['ClassId']
  }) : [];

  const studentsByClass = {};
  enrollmentCounts.forEach(row => {
    studentsByClass[row.ClassId] = parseInt(row.get('count')) || 0;
  });

  const openClassesByCourse = {};
  const studentsByCourse = {};
  classes.forEach(cls => {
    if (cls.Status === db.Class.StatusMap.ONGOING || cls.Status === db.Class.StatusMap.UPCOMING) {
      openClassesByCourse[cls.CourseId] = (openClassesByCourse[cls.CourseId] || 0) + 1;
    }
    studentsByCourse[cls.CourseId] = (studentsByCourse[cls.CourseId] || 0) + (studentsByClass[cls.Id] || 0);
  });

  return courses.map(course => {
    const plain = course.toJSON ? course.toJSON() : course;
    return {
      ...plain,
      OpenClassesCount: openClassesByCourse[course.Id] || 0,
      EnrolledStudentsCount: studentsByCourse[course.Id] || 0
    };
  });
}

exports.getFeaturedCourses = async (limit = 4) => {
  const courses = await db.Course.findAll({
    where: { Status: { [db.Sequelize.Op.in]: ACTIVE_COURSE_STATUSES } },
    order: [['CreatedAt', 'DESC']],
    limit
  });
  return attachCourseStats(courses);
};

exports.getAllActiveCourses = async () => {
  const courses = await db.Course.findAll({
    where: { Status: { [db.Sequelize.Op.in]: ACTIVE_COURSE_STATUSES } },
    order: [['CreatedAt', 'DESC']]
  });
  return attachCourseStats(courses);
};

exports.getActiveTeachers = async (limit = 5) => {
  return await db.User.findAll({
    where: {
      Role: db.User.RoleMap.TEACHER,
      Status: db.User.StatusMap.ACTIVE
    },
    include: [{ model: db.UserProfile, as: 'Profile' }],
    limit,
    order: [['Id', 'ASC']]
  });
};

exports.getAllActiveTeachers = async () => {
  return await db.User.findAll({
    where: {
      Role: db.User.RoleMap.TEACHER,
      Status: db.User.StatusMap.ACTIVE
    },
    include: [{ model: db.UserProfile, as: 'Profile' }],
    order: [['Id', 'ASC']]
  });
};

// Các buổi học sắp diễn ra gần nhất (dữ liệu thật), dùng cho khối "Lịch khai giảng sắp tới"
exports.getUpcomingSchedule = async (limit = 4) => {
  return await db.Lesson.findAll({
    where: {
      Status: db.Lesson.StatusMap.SCHEDULED,
      LessonDate: { [db.Sequelize.Op.gte]: new Date() }
    },
    include: [{
      model: db.Class,
      as: 'Class',
      attributes: ['Id', 'ClassName'],
      include: [{ model: db.Course, as: 'Course', attributes: ['Id', 'Title'] }]
    }],
    order: [['LessonDate', 'ASC']],
    limit
  });
};

// Số liệu tổng quan thật của trung tâm, dùng cho các badge thống kê trên trang chủ
exports.getHomeStats = async () => {
  const [totalStudents, totalCourses, totalTeachers, totalLessonsTaught] = await Promise.all([
    db.User.count({ where: { Role: db.User.RoleMap.STUDENT, Status: db.User.StatusMap.ACTIVE } }),
    db.Course.count({ where: { Status: { [db.Sequelize.Op.in]: ACTIVE_COURSE_STATUSES } } }),
    db.User.count({ where: { Role: db.User.RoleMap.TEACHER, Status: db.User.StatusMap.ACTIVE } }),
    db.Lesson.count({ where: { Status: db.Lesson.StatusMap.FINISHED } })
  ]);

  return { totalStudents, totalCourses, totalTeachers, totalLessonsTaught };
};
