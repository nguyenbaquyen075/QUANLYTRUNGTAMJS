// Dòng hàng của đơn: lưu sẵn tên + đơn giá lúc mua nên sửa/ẩn sách sau này không làm sai đơn cũ.
module.exports = (sequelize, DataTypes) => sequelize.define('BookOrderItems', {
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'Id' },
  OrderId: { type: DataTypes.INTEGER, allowNull: false, field: 'OrderId' },
  BookId: { type: DataTypes.INTEGER, allowNull: false, field: 'BookId' },
  Title: { type: DataTypes.STRING(200), allowNull: false, field: 'Title' },
  UnitPrice: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: 'UnitPrice' },
  Quantity: { type: DataTypes.INTEGER, allowNull: false, field: 'Quantity' }
}, { indexes: [{ fields: ['OrderId'] }] });
