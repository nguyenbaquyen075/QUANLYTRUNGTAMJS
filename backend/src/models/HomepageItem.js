module.exports = (sequelize, DataTypes) => {
  const HomepageItem = sequelize.define('HomepageItems', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    Section: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'Section'
    },
    SortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'SortOrder'
    },
    Title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'Title'
    },
    Subtitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'Subtitle'
    },
    Body: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Body'
    },
    ImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'ImageUrl'
    },
    ExtraData: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'ExtraData'
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'IsActive'
    }
  });

  HomepageItem.SECTIONS = ['promo_slide', 'honor_student', 'testimonial', 'roadmap_slide', 'chat_proof'];

  return HomepageItem;
};
