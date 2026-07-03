module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Courses', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    CourseCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'CourseCode'
    },
    Title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'Title'
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Description'
    },
    BasePrice: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      field: 'BasePrice'
    },
    TotalLessons: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'TotalLessons'
    },
    MetadataTags: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'MetadataTags'
    },
    ImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'ImageUrl'
    },
    EmbeddingVector: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'EmbeddingVector'
    },
    Status: {
      type: DataTypes.INTEGER, // 0 = DRAFT, 1 = ACTIVE, 2 = ARCHIVED
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

  Course.StatusMap = {
    DRAFT: 0,
    ACTIVE: 1,
    ARCHIVED: 2
  };

  Course.StatusRevMap = {
    0: 'DRAFT',
    1: 'ACTIVE',
    2: 'ARCHIVED'
  };

  return Course;
};
