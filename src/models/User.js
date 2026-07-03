module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('Users', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    Email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      field: 'Email'
    },
    Phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
      field: 'Phone'
    },
    PasswordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'PasswordHash'
    },
    FullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'FullName'
    },
    AvatarUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'AvatarUrl'
    },
    Role: {
      type: DataTypes.INTEGER, // 0 = ADMIN, 1 = STAFF, 2 = TEACHER, 3 = STUDENT, 4 = PARENT
      allowNull: false,
      field: 'Role'
    },
    Status: {
      type: DataTypes.INTEGER, // 0 = ACTIVE, 1 = INACTIVE, 2 = PENDING
      allowNull: false,
      defaultValue: 0,
      field: 'Status'
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CreatedAt'
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'UpdatedAt'
    }
  });

  // Role map helpers
  User.RoleMap = {
    ADMIN: 0,
    STAFF: 1,
    TEACHER: 2,
    STUDENT: 3,
    PARENT: 4
  };

  User.RoleRevMap = {
    0: 'ADMIN',
    1: 'STAFF',
    2: 'TEACHER',
    3: 'STUDENT',
    4: 'PARENT'
  };

  User.StatusMap = {
    ACTIVE: 0,
    INACTIVE: 1,
    PENDING: 2
  };

  User.StatusRevMap = {
    0: 'ACTIVE',
    1: 'INACTIVE',
    2: 'PENDING'
  };

  return User;
};
