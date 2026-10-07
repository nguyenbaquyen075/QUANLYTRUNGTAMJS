// Đơn mua sách. Status: PENDING (chờ chuyển khoản) -> PAID (admin đã nhận tiền) -> SHIPPED (đã giao); CANCELLED chỉ khi còn PENDING.
module.exports = (sequelize, DataTypes) => sequelize.define('BookOrders', {
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'Id' },
  OrderCode: { type: DataTypes.STRING(30), allowNull: false, unique: true, field: 'OrderCode' },
  BuyerName: { type: DataTypes.STRING(100), allowNull: false, field: 'BuyerName' },
  Phone: { type: DataTypes.STRING(20), allowNull: false, field: 'Phone' },
  Address: { type: DataTypes.TEXT, allowNull: false, field: 'Address' },
  Note: { type: DataTypes.TEXT, allowNull: true, field: 'Note' },
  UserId: { type: DataTypes.INTEGER, allowNull: true, field: 'UserId' }, // có khi người mua đã đăng nhập
  Status: { type: DataTypes.STRING(12), allowNull: false, defaultValue: 'PENDING', field: 'Status' },
  TotalAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: 'TotalAmount' },
  PaymentMethod: { type: DataTypes.STRING(10), allowNull: true, field: 'PaymentMethod' }, // BANK | CASH
  CreatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'CreatedAt' },
  PaidAt: { type: DataTypes.DATE, allowNull: true, field: 'PaidAt' },
  ShippedAt: { type: DataTypes.DATE, allowNull: true, field: 'ShippedAt' }
}, { indexes: [{ fields: ['Status'] }, { fields: ['CreatedAt'] }] });
