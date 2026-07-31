module.exports = (sequelize, DataTypes) => {
  const TeacherEvaluation = sequelize.define('TeacherEvaluations', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    TeacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'TeacherId'
    },
    AdminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'AdminId'
    },
    Period: {
      type: DataTypes.STRING(50), // Nhãn hiển thị, VD: "Quý 1/2026"
      allowNull: false,
      field: 'Period'
    },
    PeriodDate: {
      type: DataTypes.DATE, // Ngày đại diện của kỳ, dùng để sắp xếp biểu đồ xu hướng
      allowNull: false,
      field: 'PeriodDate'
    },
    CriteriaData: {
      type: DataTypes.TEXT, // JSON: [{ Criterion, Score, Comment }]
      allowNull: false,
      field: 'CriteriaData'
    },
    OverallComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'OverallComment'
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CreatedAt'
    }
  });

  return TeacherEvaluation;
};
