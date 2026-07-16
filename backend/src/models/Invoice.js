module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoices', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    InvoiceCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'InvoiceCode'
    },
    StudentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'StudentId'
    },
    ClassId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'ClassId'
    },
    Amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      field: 'Amount'
    },
    DueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'DueDate'
    },
    Status: {
      type: DataTypes.INTEGER, // 0 = UNPAID, 1 = PAID, 2 = OVERDUE, 3 = CANCELLED
      allowNull: false,
      defaultValue: 0,
      field: 'Status'
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CreatedAt'
    }
  });

  Invoice.StatusMap = {
    UNPAID: 0,
    PAID: 1,
    OVERDUE: 2,
    CANCELLED: 3
  };

  Invoice.StatusRevMap = {
    0: 'UNPAID',
    1: 'PAID',
    2: 'OVERDUE',
    3: 'CANCELLED'
  };

  return Invoice;
};
