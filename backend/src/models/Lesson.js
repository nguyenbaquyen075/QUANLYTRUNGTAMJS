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
    },
    VideoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'VideoUrl'
    },
    DocumentUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'DocumentUrl'
    },
    DocumentName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'DocumentName'
    },
    AttendanceStatus: {
      type: DataTypes.INTEGER, // 0 = NOT_OPENED, 1 = OPEN, 2 = CLOSED
      allowNull: false,
      defaultValue: 0,
      field: 'AttendanceStatus'
    },
    AttendanceOpenedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'AttendanceOpenedAt'
    },
    AttendanceClosedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'AttendanceClosedAt'
    },
    CancelReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'CancelReason'
    },
    MakeupOfLessonId: {
      type: DataTypes.INTEGER, // Buổi này bù cho buổi nào (nullable — không phải buổi nào cũng là buổi bù)
      allowNull: true,
      field: 'MakeupOfLessonId'
    },
    ReminderSentAt: {
      type: DataTypes.DATE, // Đánh dấu đã gửi nhắc lịch tự động, tránh gửi trùng
      allowNull: true,
      field: 'ReminderSentAt'
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

  Lesson.AttendanceStatusMap = {
    NOT_OPENED: 0,
    OPEN: 1,
    CLOSED: 2
  };

  Lesson.AttendanceStatusRevMap = {
    0: 'NOT_OPENED',
    1: 'OPEN',
    2: 'CLOSED'
  };

  return Lesson;
};
