// One-off migration: adds columns for the "Quản lý lớp học được giao" feature set.
// AuditLogs is a brand-new table — sequelize.sync() on server startup creates it automatically.
// This script only needs to ALTER existing tables (Classes, ClassStudents, Lessons), since
// sync() without {alter:true} never adds columns to tables that already exist.
//   node backend/scripts/migrate-class-management.js
// Safe to re-run (checks column existence first).
const db = require('../src/models');

async function addColumnIfMissing(qi, table, column, ddl) {
  const desc = await qi.describeTable(table);
  if (!desc[column]) {
    await db.sequelize.query(`ALTER TABLE "${table}" ADD COLUMN ${ddl}`);
    console.log(`Added ${table}.${column}`);
  } else {
    console.log(`${table}.${column} already exists, skipping`);
  }
}

async function run() {
  const qi = db.sequelize.getQueryInterface();

  await addColumnIfMissing(qi, 'Classes', 'Description', '"Description" TEXT NULL');
  await addColumnIfMissing(qi, 'Classes', 'MeetingUrl', '"MeetingUrl" VARCHAR(500) NULL');

  await addColumnIfMissing(qi, 'ClassStudents', 'Note', '"Note" TEXT NULL');
  await addColumnIfMissing(qi, 'ClassStudents', 'StatusReason', '"StatusReason" TEXT NULL');
  await addColumnIfMissing(qi, 'ClassStudents', 'StatusChangedAt', '"StatusChangedAt" TIMESTAMPTZ NULL');

  await addColumnIfMissing(qi, 'Lessons', 'CancelReason', '"CancelReason" VARCHAR(255) NULL');
  await addColumnIfMissing(qi, 'Lessons', 'MakeupOfLessonId', '"MakeupOfLessonId" INTEGER NULL');
  await addColumnIfMissing(qi, 'Lessons', 'ReminderSentAt', '"ReminderSentAt" TIMESTAMPTZ NULL');

  console.log('Migration complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
