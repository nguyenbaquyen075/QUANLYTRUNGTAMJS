module.exports = (sequelize, DataTypes) => {
  const Lesson = sequelize.define('Lessons', {
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
    Title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'Title'
    },
    LessonDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'LessonDate'
    },
    StartTime: {
      type: DataTypes.STRING, // mapped as interval from Postgres, read/written as string (e.g. '18:00:00')
      allowNull: false,
      field: 'StartTime'
    },
    EndTime: {
      type: DataTypes.STRING, // mapped as interval from Postgres, read/written as string (e.g. '19:30:00')
      allowNull: false,
      field: 'EndTime'
    },
    MeetingUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'MeetingUrl'
    },
    MeetingId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'MeetingId'
    },
    MeetingPassword: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'MeetingPassword'
    },
    Status: {
      type: DataTypes.INTEGER, // 0 = SCHEDULED, 1 = IN_PROGRESS, 2 = FINISHED, 3 = CANCELLED
      allowNull: false,
      defaultValue: 0,
      field: 'Status'
    }
  });

  Lesson.StatusMap = {
    SCHEDULED: 0,
    IN_PROGRESS: 1,
    FINISHED: 2,
    CANCELLED: 3
  };

  Lesson.StatusRevMap = {
    0: 'SCHEDULED',
    1: 'IN_PROGRESS',
    2: 'FINISHED',
    3: 'CANCELLED'
  };

  return Lesson;
};
