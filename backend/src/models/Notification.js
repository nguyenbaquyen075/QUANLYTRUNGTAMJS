module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notifications', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Null means system-wide notification
      field: 'UserId'
    },
    Title: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'Title'
    },
    Content: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'Content'
    },
    LinkUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'LinkUrl'
    },
    IsRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'IsRead'
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CreatedAt'
    }
  });

  return Notification;
};
