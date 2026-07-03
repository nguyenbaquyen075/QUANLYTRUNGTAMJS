module.exports = (sequelize, DataTypes) => {
  const Submission = sequelize.define('Submissions', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    AssignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'AssignmentId'
    },
    StudentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'StudentId'
    },
    SubmittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'SubmittedAt'
    },
    Content: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Content'
    },
    FileUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'FileUrl'
    },
    Grade: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'Grade'
    },
    TeacherComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'TeacherComment'
    },
    GradedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'GradedAt'
    }
  });

  return Submission;
};
