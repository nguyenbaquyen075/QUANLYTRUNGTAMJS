// Việc hẹn giờ do giáo viên/admin tạo (mở/đóng bài, gia hạn, nhắc nộp, bật/tắt mục trang chủ).
// Job quét bảng này mỗi phút (xem jobs/scheduledActionJob.js).
module.exports = (sequelize, DataTypes) => {
  const ScheduledAction = sequelize.define('ScheduledActions', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'Id' },
    Type: { type: DataTypes.STRING(30), allowNull: false, field: 'Type' },
    RunAt: { type: DataTypes.DATE, allowNull: false, field: 'RunAt' },
    Payload: { type: DataTypes.TEXT, allowNull: false, field: 'Payload' }, // JSON
    Status: { type: DataTypes.STRING(12), allowNull: false, defaultValue: 'PENDING', field: 'Status' }, // PENDING|RUNNING|DONE|SKIPPED|FAILED|CANCELLED
    CreatedBy: { type: DataTypes.INTEGER, allowNull: false, field: 'CreatedBy' },
    CreatedByRole: { type: DataTypes.STRING(20), allowNull: false, field: 'CreatedByRole' },
    CreatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'CreatedAt' },
    ExecutedAt: { type: DataTypes.DATE, allowNull: true, field: 'ExecutedAt' },
    Result: { type: DataTypes.TEXT, allowNull: true, field: 'Result' }
  }, {
    indexes: [{ fields: ['Status', 'RunAt'] }]
  });

  return ScheduledAction;
};
