module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define('Assignments', {
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
    Title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'Title'
    },
    Instruction: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'Instruction'
    },
    AttachmentUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'AttachmentUrl'
    },
    DueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'DueDate'
    },
    AssignmentType: {
      type: DataTypes.INTEGER, // 0 = QUIZ, 1 = ESSAY
      allowNull: false,
      defaultValue: 1,
      field: 'AssignmentType'
    },
    QuizData: {
      type: DataTypes.TEXT, // Store JSON as text
      allowNull: true,
      field: 'QuizData'
    },
    Status: {
      type: DataTypes.INTEGER, // 0 = DRAFT (không hiện với học viên), 1 = PUBLISHED
      allowNull: false,
      defaultValue: 1,
      field: 'Status'
    },
    AllowMultipleAttempts: {
      type: DataTypes.BOOLEAN, // Cho phép nộp lại nhiều lần để luyện tập; điểm chính thức luôn tính theo lần nộp đầu tiên
      allowNull: false,
      defaultValue: false,
      field: 'AllowMultipleAttempts'
    },
    OpenAt: {
      type: DataTypes.DATE, // Thời điểm mở bài — học viên không thấy/làm được bài trước mốc này
      allowNull: true,
      field: 'OpenAt'
    },
    TimeLimitMinutes: {
      type: DataTypes.INTEGER, // Thời gian làm bài tính bằng phút (hiển thị cho học viên, không tự động nộp bài)
      allowNull: true,
      field: 'TimeLimitMinutes'
    }
  }, {
    indexes: [
      { fields: ['LessonId'] }
    ]
  });

  Assignment.TypeMap = {
    QUIZ: 0,
    ESSAY: 1,
    TRUE_FALSE: 2,
    EXAM: 3
  };

  Assignment.TypeRevMap = {
    0: 'QUIZ',
    1: 'ESSAY',
    2: 'TRUE_FALSE',
    3: 'EXAM'
  };

  Assignment.StatusMap = {
    DRAFT: 0,
    PUBLISHED: 1
  };

  Assignment.StatusRevMap = {
    0: 'DRAFT',
    1: 'PUBLISHED'
  };

  return Assignment;
};
