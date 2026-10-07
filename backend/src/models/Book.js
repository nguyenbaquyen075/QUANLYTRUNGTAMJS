// Sách do trung tâm bán. Quản lý trong admin (Admin -> Sách & đơn sách).
module.exports = (sequelize, DataTypes) => sequelize.define('Books', {
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'Id' },
  Title: { type: DataTypes.STRING(200), allowNull: false, field: 'Title' },
  Author: { type: DataTypes.STRING(150), allowNull: true, field: 'Author' },
  Subject: { type: DataTypes.STRING(40), allowNull: true, field: 'Subject' },   // Toán học, Vật lý, ...
  Grade: { type: DataTypes.STRING(30), allowNull: true, field: 'Grade' },        // "Lớp 12", "Lớp 11-12", "THPT"
  Price: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: 'Price' },
  OriginalPrice: { type: DataTypes.DECIMAL(18, 2), allowNull: true, field: 'OriginalPrice' }, // giá gốc để gạch ngang
  Description: { type: DataTypes.TEXT, allowNull: true, field: 'Description' },
  CoverUrl: { type: DataTypes.STRING(300), allowNull: true, field: 'CoverUrl' },
  Badge: { type: DataTypes.STRING(30), allowNull: true, field: 'Badge' },        // "Bán chạy", "Mới"
  InStock: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'InStock' },
  IsActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'IsActive' }, // false = ẩn khỏi trang bán
  SortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'SortOrder' },
  CreatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'CreatedAt' }
}, { indexes: [{ fields: ['IsActive', 'SortOrder'] }] });
