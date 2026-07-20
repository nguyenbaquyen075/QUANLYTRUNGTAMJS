const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const isSqlite = process.env.DB_DIALECT === 'sqlite' || !process.env.DATABASE_URL;

const sequelize = isSqlite
  ? new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../database.sqlite'),
      logging: false,
      define: {
        timestamps: false,
        freezeTableName: true
      }
    })
  : new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false,
      define: {
        timestamps: false,
        freezeTableName: true
      }
    });

module.exports = sequelize;

