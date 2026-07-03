module.exports = (sequelize, DataTypes) => {
  const UserProfile = sequelize.define('UserProfiles', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'UserId'
    },
    Dob: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'Dob'
    },
    Gender: {
      type: DataTypes.INTEGER, // 0 = MALE, 1 = FEMALE, 2 = OTHER
      allowNull: true,
      field: 'Gender'
    },
    Address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'Address'
    },
    ParentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'ParentId'
    },
    TeacherBio: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'TeacherBio'
    },
    TeacherBankName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'TeacherBankName'
    },
    TeacherBankAccount: {
      type: DataTypes.STRING(30),
      allowNull: true,
      field: 'TeacherBankAccount'
    },
    TeacherBankHolder: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'TeacherBankHolder'
    }
  });

  UserProfile.GenderMap = {
    MALE: 0,
    FEMALE: 1,
    OTHER: 2
  };

  UserProfile.GenderRevMap = {
    0: 'MALE',
    1: 'FEMALE',
    2: 'OTHER'
  };

  return UserProfile;
};
