module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payments', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    InvoiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'InvoiceId'
    },
    TransactionCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'TransactionCode'
    },
    Amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      field: 'Amount'
    },
    PaymentMethod: {
      type: DataTypes.INTEGER, // 0 = BANK_TRANSFER, 1 = CASH, 2 = GATEWAY
      allowNull: false,
      defaultValue: 0,
      field: 'PaymentMethod'
    },
    PaymentTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'PaymentTime'
    },
    RawWebhookData: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'RawWebhookData'
    }
  });

  Payment.MethodMap = {
    BANK_TRANSFER: 0,
    CASH: 1,
    GATEWAY: 2
  };

  Payment.MethodRevMap = {
    0: 'BANK_TRANSFER',
    1: 'CASH',
    2: 'GATEWAY'
  };

  return Payment;
};
