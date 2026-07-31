const { server, PORT } = require('./src/app');
const sequelize = require('./src/config/database');
const { startLessonReminderJob } = require('./src/jobs/lessonReminderJob');

// Connect to Database and start server
sequelize.authenticate()
  .then(async () => {
    console.log(`Database connected successfully (${sequelize.options.dialect}).`);
    await sequelize.sync();
    console.log('Database schema synced successfully.');
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    startLessonReminderJob();
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

