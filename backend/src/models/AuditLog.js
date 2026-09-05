module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLogs', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    ActorUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'ActorUserId'
    },
    ActorRole: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'ActorRole'
    },
    Action: {
      type: DataTypes.STRING(50), // e.g. UPDATE_CLASS_INFO, CANCEL_LESSON, BLOCK_STUDENT, KICK_STUDENT, TRANSFER_STUDENT...
      allowNull: false,
      field: 'Action'
    },
    EntityType: {
      type: DataTypes.STRING(30), // e.g. Class, Lesson, ClassStudent
      allowNull: false,
      field: 'EntityType'
    },
    EntityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'EntityId'
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'Description'
    },
    Reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Reason'
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CreatedAt'
    }
  }, {
    indexes: [
      { fields: ['EntityType', 'EntityId'] }
    ]
  });

  return AuditLog;
};
