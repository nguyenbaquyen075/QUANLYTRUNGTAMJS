module.exports = (sequelize, DataTypes) => {
  const SiteSetting = sequelize.define('SiteSettings', {
    Key: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      field: 'Key'
    },
    Value: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Value'
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'UpdatedAt'
    }
  });

  return SiteSetting;
};
