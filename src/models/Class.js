module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Classes', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    CourseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'CourseId'
    },
    TeacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'TeacherId'
    },
    ClassName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'ClassName'
    },
    MaxStudents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      field: 'MaxStudents'
    },
    StartDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'StartDate'
    },
    EndDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'EndDate'
    },
    Schedule: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      field: 'Schedule'
    },
    Status: {
      type: DataTypes.INTEGER, // 0 = UPCOMING, 1 = ONGOING, 2 = COMPLETED
      allowNull: false,
      defaultValue: 0,
      field: 'Status'
    }
  });

  Class.StatusMap = {
    UPCOMING: 0,
    ONGOING: 1,
    COMPLETED: 2
  };

  Class.StatusRevMap = {
    0: 'UPCOMING',
    1: 'ONGOING',
    2: 'COMPLETED'
  };

  return Class;
};
