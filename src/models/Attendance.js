module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendances', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    LessonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'LessonId'
    },
    StudentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'StudentId'
    },
    Status: {
      type: DataTypes.INTEGER, // 0 = PRESENT, 1 = LATE, 2 = ABSENT_REQUESTED, 3 = ABSENT_UNEXCUSED
      allowNull: false,
      defaultValue: 0,
      field: 'Status'
    },
    Remark: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'Remark'
    },
    VideoAccess: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'VideoAccess'
    },
    UpdatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'UpdatedBy'
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'UpdatedAt'
    }
  });

  Attendance.StatusMap = {
    PRESENT: 0,
    LATE: 1,
    ABSENT_REQUESTED: 2,
    ABSENT_UNEXCUSED: 3
  };

  Attendance.StatusRevMap = {
    0: 'PRESENT',
    1: 'LATE',
    2: 'ABSENT_REQUESTED',
    3: 'ABSENT_UNEXCUSED'
  };

  return Attendance;
};
