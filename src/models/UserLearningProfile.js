module.exports = (sequelize, DataTypes) => {
  const UserLearningProfile = sequelize.define('UserLearningProfiles', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    StudentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'StudentId'
    },
    WeakAreas: {
      type: DataTypes.TEXT, // Store JSON string (e.g. ["Phép Toán Tập Hợp"])
      allowNull: true,
      field: 'WeakAreas'
    },
    PreferredLearningStyle: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'PreferredLearningStyle'
    },
    LastAnalyzedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'LastAnalyzedAt'
    }
  });

  return UserLearningProfile;
};
