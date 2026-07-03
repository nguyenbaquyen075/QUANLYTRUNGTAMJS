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
    }
  });

  Assignment.TypeMap = {
    QUIZ: 0,
    ESSAY: 1
  };

  Assignment.TypeRevMap = {
    0: 'QUIZ',
    1: 'ESSAY'
  };

  return Assignment;
};
