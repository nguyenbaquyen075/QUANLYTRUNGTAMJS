// One-off migration for dac-ta-sieu-chi-tiet-trang-giang-vien.md additions:
// draft/publish assignments, multi-attempt submissions.
// TeacherEvaluations is a brand-new table — sequelize.sync() on server startup creates it automatically.
//   node backend/scripts/migrate-teacher-page-v2.js
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

  await addColumnIfMissing(qi, 'Assignments', 'Status', '"Status" INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing(qi, 'Assignments', 'AllowMultipleAttempts', '"AllowMultipleAttempts" BOOLEAN NOT NULL DEFAULT false');
  await addColumnIfMissing(qi, 'Assignments', 'OpenAt', '"OpenAt" TIMESTAMPTZ NULL');
  await addColumnIfMissing(qi, 'Assignments', 'TimeLimitMinutes', '"TimeLimitMinutes" INTEGER NULL');
  await addColumnIfMissing(qi, 'Submissions', 'AttemptNumber', '"AttemptNumber" INTEGER NOT NULL DEFAULT 1');

  console.log('Migration complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
