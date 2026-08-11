module.exports = (sequelize, DataTypes) => {
  const MockTestQuestion = sequelize.define('MockTestQuestions', {
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
    Content: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'Content'
    },
    Options: {
      type: DataTypes.TEXT, // JSON array of string, ví dụ ["A. ...","B. ..."]
      allowNull: false,
      field: 'Options'
    },
    CorrectIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'CorrectIndex'
    },
    Explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Explanation'
    },
    Points: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1,
      field: 'Points'
    },
    SortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'SortOrder'
    }
  });

  return MockTestQuestion;
};
