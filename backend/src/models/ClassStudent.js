module.exports = (sequelize, DataTypes) => {
  const ClassStudent = sequelize.define('ClassStudents', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    ClassId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'ClassId'
    },
    StudentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'StudentId'
    },
    EnrolledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'EnrolledAt'
    },
    Status: {
      type: DataTypes.INTEGER, // 0 = LEARNING, 1 = DROPPED, 2 = SUSPENDED (bảo lưu), 3 = BLOCKED (chặn tạm), 4 = KICKED (loại khỏi lớp)
      allowNull: false,
      defaultValue: 0,
      field: 'Status'
    },
    Note: {
      type: DataTypes.TEXT, // Ghi chú nội bộ của giáo viên về học viên trong lớp này, chỉ giáo viên lớp xem được
      allowNull: true,
      field: 'Note'
    },
    StatusReason: {
      type: DataTypes.TEXT, // Lý do lần thay đổi trạng thái gần nhất (chặn/kick/bảo lưu)
      allowNull: true,
      field: 'StatusReason'
    },
    StatusChangedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'StatusChangedAt'
    }
  });

  ClassStudent.StatusMap = {
    LEARNING: 0,
    DROPPED: 1,
    SUSPENDED: 2,
    BLOCKED: 3,
    KICKED: 4
  };

  ClassStudent.StatusRevMap = {
    0: 'LEARNING',
    1: 'DROPPED',
    2: 'SUSPENDED',
    3: 'BLOCKED',
    4: 'KICKED'
  };

  return ClassStudent;
};
