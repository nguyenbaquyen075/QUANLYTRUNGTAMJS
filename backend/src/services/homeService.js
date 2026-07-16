const db = require('../models');

exports.getFeaturedCourses = async (limit = 4) => {
  return await db.Course.findAll({
    where: { Status: 1 }, // ACTIVE
    limit
  });
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

exports.getAllActiveCourses = async () => {
  return await db.Course.findAll({
    where: { Status: 1 } // ACTIVE
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
