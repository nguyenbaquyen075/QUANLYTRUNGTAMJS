module.exports = (sequelize, DataTypes) => {
  const ClassStudent = sequelize.define('ClassStudents', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    ClassId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'ClassId'
    },
    StudentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'StudentId'
    },
    EnrolledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'EnrolledAt'
    },
    Status: {
      type: DataTypes.INTEGER, // 0 = LEARNING, 1 = DROPPED, 2 = SUSPENDED
      allowNull: false,
      defaultValue: 0,
      field: 'Status'
    }
  });

  ClassStudent.StatusMap = {
    LEARNING: 0,
    DROPPED: 1,
    SUSPENDED: 2
  };

  ClassStudent.StatusRevMap = {
    0: 'LEARNING',
    1: 'DROPPED',
    2: 'SUSPENDED'
  };

  return ClassStudent;
};
