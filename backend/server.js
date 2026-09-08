const ensureDatabaseUrl = require('./src/config/ensureDatabaseUrl');

async function main() {
  // Phải chạy trước khi nạp models: src/config/database.js chọn dialect ngay lúc require.
  await ensureDatabaseUrl();

  const { server, PORT } = require('./src/app');
  const sequelize = require('./src/config/database');
  const db = require('./src/models');
  const { startLessonReminderJob } = require('./src/jobs/lessonReminderJob');

  await sequelize.authenticate();
  console.log(`Database connected successfully (${sequelize.options.dialect}).`);
  await sequelize.sync();
  console.log('Database schema synced successfully.');

  // Seed ngay trong lúc khởi động thay vì trong build command: host nào cũng
  // chạy được, không phụ thuộc việc người deploy có nhớ thêm `npm run seed` hay
  // không. Chỉ chạy khi chưa có user nào nên không đụng vào dữ liệu đã có.
  if ((await db.User.count()) === 0) {
    console.log('Database rỗng — seed dữ liệu demo...');
    await require('./seed')();
  }

  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  startLessonReminderJob();
}

main().catch(err => {
  console.error('Unable to start server:', err);
  process.exit(1);
});
