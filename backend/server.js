const { server, PORT } = require('./src/app');
const sequelize = require('./src/config/database');

// Connect to Database and start server
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
