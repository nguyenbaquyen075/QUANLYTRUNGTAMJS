const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false,
  define: {
    timestamps: false, // In our DB, we define fields like CreatedAt, UpdatedAt manually.
    freezeTableName: true // Do not pluralize table names automatically
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import Models
db.User = require('./User')(sequelize, DataTypes);
db.UserProfile = require('./UserProfile')(sequelize, DataTypes);
db.Course = require('./Course')(sequelize, DataTypes);
db.Class = require('./Class')(sequelize, DataTypes);
db.ClassStudent = require('./ClassStudent')(sequelize, DataTypes);
db.Lesson = require('./Lesson')(sequelize, DataTypes);
db.Attendance = require('./Attendance')(sequelize, DataTypes);
db.Assignment = require('./Assignment')(sequelize, DataTypes);
db.Submission = require('./Submission')(sequelize, DataTypes);
db.Invoice = require('./Invoice')(sequelize, DataTypes);
db.Payment = require('./Payment')(sequelize, DataTypes);
db.AiChatSession = require('./AiChatSession')(sequelize, DataTypes);
db.AiChatMessage = require('./AiChatMessage')(sequelize, DataTypes);
db.UserLearningProfile = require('./UserLearningProfile')(sequelize, DataTypes);
db.Notification = require('./Notification')(sequelize, DataTypes);

// Setup Associations
// User <-> UserProfile (One-to-One)
db.User.hasOne(db.UserProfile, { foreignKey: 'UserId', as: 'Profile' });
db.UserProfile.belongsTo(db.User, { foreignKey: 'UserId', as: 'User' });

// UserProfile -> Parent (User)
db.UserProfile.belongsTo(db.User, { foreignKey: 'ParentId', as: 'Parent' });

// Course <-> Class (One-to-Many)
db.Course.hasMany(db.Class, { foreignKey: 'CourseId', as: 'Classes' });
db.Class.belongsTo(db.Course, { foreignKey: 'CourseId', as: 'Course' });

// Class <-> Teacher (User)
db.Class.belongsTo(db.User, { foreignKey: 'TeacherId', as: 'Teacher' });

// Class <-> ClassStudent (One-to-Many)
db.Class.hasMany(db.ClassStudent, { foreignKey: 'ClassId', as: 'StudentEnrollments' });
db.ClassStudent.belongsTo(db.Class, { foreignKey: 'ClassId', as: 'Class' });
db.ClassStudent.belongsTo(db.User, { foreignKey: 'StudentId', as: 'Student' });
db.User.hasMany(db.ClassStudent, { foreignKey: 'StudentId', as: 'ClassEnrollments' });

// Class <-> Lesson (One-to-Many)
db.Class.hasMany(db.Lesson, { foreignKey: 'ClassId', as: 'Lessons' });
db.Lesson.belongsTo(db.Class, { foreignKey: 'ClassId', as: 'Class' });

// Lesson <-> Attendance (One-to-Many)
db.Lesson.hasMany(db.Attendance, { foreignKey: 'LessonId', as: 'Attendances' });
db.Attendance.belongsTo(db.Lesson, { foreignKey: 'LessonId', as: 'Lesson' });
db.Attendance.belongsTo(db.User, { foreignKey: 'StudentId', as: 'Student' });

// Lesson <-> Assignment (One-to-Many)
db.Lesson.hasMany(db.Assignment, { foreignKey: 'LessonId', as: 'Assignments' });
db.Assignment.belongsTo(db.Lesson, { foreignKey: 'LessonId', as: 'Lesson' });

// Assignment <-> Submission (One-to-Many)
db.Assignment.hasMany(db.Submission, { foreignKey: 'AssignmentId', as: 'Submissions' });
db.Submission.belongsTo(db.Assignment, { foreignKey: 'AssignmentId', as: 'Assignment' });
db.Submission.belongsTo(db.User, { foreignKey: 'StudentId', as: 'Student' });

// Invoice relations
db.Invoice.belongsTo(db.User, { foreignKey: 'StudentId', as: 'Student' });
db.Invoice.belongsTo(db.Class, { foreignKey: 'ClassId', as: 'Class' });
db.Invoice.hasMany(db.Payment, { foreignKey: 'InvoiceId', as: 'Payments' });

// Payment relations
db.Payment.belongsTo(db.Invoice, { foreignKey: 'InvoiceId', as: 'Invoice' });

// AiChatSession & Messages
db.AiChatSession.belongsTo(db.User, { foreignKey: 'UserId', as: 'User' });
db.AiChatSession.hasMany(db.AiChatMessage, { foreignKey: 'SessionId', as: 'Messages' });
db.AiChatMessage.belongsTo(db.AiChatSession, { foreignKey: 'SessionId', as: 'Session' });

// UserLearningProfile
db.UserLearningProfile.belongsTo(db.User, { foreignKey: 'StudentId', as: 'Student' });

// Notification
db.Notification.belongsTo(db.User, { foreignKey: 'UserId', as: 'User' });

module.exports = db;
