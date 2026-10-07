// Quét bảng ScheduledActions mỗi phút. Chạy ngay lúc khởi động nên các việc đến hạn lúc server ngủ được chạy bù.
const { runDueActions, failInterruptedActions } = require('../services/scheduledActionService');

const POLL_INTERVAL_MS = 60 * 1000;

async function tick() {
  try {
    await runDueActions();
  } catch (err) {
    console.error('[scheduledActionJob] Lỗi:', err);
  }
}

async function startScheduledActionJob() {
  await failInterruptedActions().catch((err) => console.error('[scheduledActionJob]', err));
  tick();
  setInterval(tick, POLL_INTERVAL_MS);
  console.log('[scheduledActionJob] Đã khởi động — quét việc hẹn giờ mỗi 60 giây.');
}

module.exports = { startScheduledActionJob };
