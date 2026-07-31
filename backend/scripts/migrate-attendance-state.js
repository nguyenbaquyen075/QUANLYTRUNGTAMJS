// One-off migration: adds attendance open/close state-machine columns.
// No migration framework exists in this codebase, so this is run manually:
//   node backend/scripts/migrate-attendance-state.js
// Safe to re-run (uses IF NOT EXISTS / conditional checks).
const db = require('../src/models');

async function run() {
  const qi = db.sequelize.getQueryInterface();

  const lessonsTable = await qi.describeTable('Lessons');
  if (!lessonsTable.AttendanceStatus) {
    await db.sequelize.query('ALTER TABLE "Lessons" ADD COLUMN "AttendanceStatus" INTEGER NOT NULL DEFAULT 0');
    console.log('Added Lessons.AttendanceStatus');
  } else {
    console.log('Lessons.AttendanceStatus already exists, skipping');
  }
  if (!lessonsTable.AttendanceOpenedAt) {
    await db.sequelize.query('ALTER TABLE "Lessons" ADD COLUMN "AttendanceOpenedAt" TIMESTAMPTZ NULL');
    console.log('Added Lessons.AttendanceOpenedAt');
  } else {
    console.log('Lessons.AttendanceOpenedAt already exists, skipping');
  }
  if (!lessonsTable.AttendanceClosedAt) {
    await db.sequelize.query('ALTER TABLE "Lessons" ADD COLUMN "AttendanceClosedAt" TIMESTAMPTZ NULL');
    console.log('Added Lessons.AttendanceClosedAt');
  } else {
    console.log('Lessons.AttendanceClosedAt already exists, skipping');
  }

  const attendancesTable = await qi.describeTable('Attendances');
  if (!attendancesTable.EditedAfterClose) {
    await db.sequelize.query('ALTER TABLE "Attendances" ADD COLUMN "EditedAfterClose" BOOLEAN NOT NULL DEFAULT false');
    console.log('Added Attendances.EditedAfterClose');
  } else {
    console.log('Attendances.EditedAfterClose already exists, skipping');
  }

  console.log('Migration complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
