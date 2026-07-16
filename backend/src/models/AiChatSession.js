module.exports = (sequelize, DataTypes) => {
  const AiChatSession = sequelize.define('AiChatSessions', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'UserId'
    },
    SessionToken: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'SessionToken'
    },
    LeadName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'LeadName'
    },
    LeadPhone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      field: 'LeadPhone'
    },
    Summary: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Summary'
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CreatedAt'
    }
  });

  return AiChatSession;
};
