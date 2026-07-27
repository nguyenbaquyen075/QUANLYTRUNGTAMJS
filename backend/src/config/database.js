const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const isSqlite = process.env.DB_DIALECT === 'sqlite' || !process.env.DATABASE_URL;

const sequelize = isSqlite
  ? new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../database.sqlite'),
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
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
      pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000
      },
      logging: false,
      define: {
        timestamps: false,
        freezeTableName: true
      }
    });

// Enable SQLite WAL (Write-Ahead Logging) mode for 3-5x faster query performance
if (isSqlite) {
  sequelize.beforeConnect(async (config) => {
    // SQLite optimizations
  });
  sequelize.authenticate().then(async () => {
    try {
      await sequelize.query('PRAGMA journal_mode = WAL;');
      await sequelize.query('PRAGMA synchronous = NORMAL;');
      await sequelize.query('PRAGMA cache_size = 10000;');
    } catch (e) {
      // ignore
    }
  }).catch(() => {});
}

module.exports = sequelize;
