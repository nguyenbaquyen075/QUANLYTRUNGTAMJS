module.exports = (sequelize, DataTypes) => {
  const AiChatMessage = sequelize.define('AiChatMessages', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    SessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'SessionId'
    },
    SenderType: {
      type: DataTypes.INTEGER, // 0 = USER, 1 = AI
      allowNull: false,
      field: 'SenderType'
    },
    MessageContent: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'MessageContent'
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CreatedAt'
    }
  });

  AiChatMessage.SenderMap = {
    USER: 0,
    AI: 1
  };

  AiChatMessage.SenderRevMap = {
    0: 'USER',
    1: 'AI'
  };

  return AiChatMessage;
};
