module.exports = (sequelize, DataTypes) => {
  const MockTest = sequelize.define('MockTests', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    Grade: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'Grade'
    },
    Subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'Subject'
    },
    SubjectCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'SubjectCode'
    },
    CoverBg: {
      type: DataTypes.STRING(100), // class Tailwind gradient, ví dụ "from-blue-600 to-indigo-700"
      allowNull: true,
      field: 'CoverBg'
    },
    Title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'Title'
    },
    Code: {
      type: DataTypes.STRING(50), // mã đề, ví dụ "TOAN-01" — dùng để BigMockTestPage khớp entry trong GAME_SESSIONS_DATA.examinations[].code
      allowNull: true,
      field: 'Code'
    },
    Duration: {
      type: DataTypes.INTEGER, // phút
      allowNull: false,
      field: 'Duration'
    },
    Status: {
      type: DataTypes.INTEGER, // 0 = DRAFT (chưa có câu hỏi/chưa công bố), 1 = PUBLISHED
      allowNull: false,
      defaultValue: 0,
      field: 'Status'
    },
    CreatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'CreatedBy'
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CreatedAt'
    }
  });

  MockTest.StatusMap = {
    DRAFT: 0,
    PUBLISHED: 1
  };

  MockTest.StatusRevMap = {
    0: 'DRAFT',
    1: 'PUBLISHED'
  };

  return MockTest;
};
