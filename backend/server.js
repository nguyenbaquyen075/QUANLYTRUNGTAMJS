const ensureDatabaseUrl = require('./src/config/ensureDatabaseUrl');

async function main() {
  // Phải chạy trước khi nạp models: src/config/database.js chọn dialect ngay lúc require.
  await ensureDatabaseUrl();

  const { server, PORT } = require('./src/app');
  const sequelize = require('./src/config/database');
  const { startLessonReminderJob } = require('./src/jobs/lessonReminderJob');

  await sequelize.authenticate();
  console.log(`Database connected successfully (${sequelize.options.dialect}).`);
  await sequelize.sync();
  console.log('Database schema synced successfully.');

  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  startLessonReminderJob();
}

main().catch(err => {
  console.error('Unable to start server:', err);
  process.exit(1);
});
