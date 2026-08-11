module.exports = (sequelize, DataTypes) => {
  const MockTestSubmission = sequelize.define('MockTestSubmissions', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    MockTestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'MockTestId'
    },
    UserId: {
      type: DataTypes.INTEGER, // null nếu khách vãng lai nộp bài
      allowNull: true,
      field: 'UserId'
    },
    GuestName: {
      type: DataTypes.STRING(100), // bắt buộc khi UserId null
      allowNull: true,
      field: 'GuestName'
    },
    Score: {
      type: DataTypes.FLOAT, // /10, luôn tính lại ở server
      allowNull: false,
      field: 'Score'
    },
    CorrectCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'CorrectCount'
    },
    TotalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'TotalQuestions'
    },
    AnswersData: {
      type: DataTypes.TEXT, // JSON: { [questionId]: chosenOptionIndex }
      allowNull: true,
      field: 'AnswersData'
    },
    SubmittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'SubmittedAt'
    }
  });

  return MockTestSubmission;
};
