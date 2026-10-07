/**
 * Sinh ~3 tháng đơn hàng MẪU (học viên, hóa đơn, thanh toán) để trang "Doanh thu & Báo cáo" có dữ liệu khi demo.
 *   node src/utils/seedDemoRevenue.js           tạo (không làm gì nếu đã có)
 *   node src/utils/seedDemoRevenue.js --reset   xóa dữ liệu mẫu cũ rồi tạo lại
 *   node src/utils/seedDemoRevenue.js --clear   chỉ xóa dữ liệu mẫu
 * Mọi bản ghi mẫu có dấu DEMO (mã hóa đơn DEMO..., mã giao dịch DEMO-..., email @lumiedu.demo) nên xóa sạch được.
 * Từ chối chạy khi có DATABASE_URL (tức là Postgres/Render) để không bao giờ trộn dữ liệu giả vào dữ liệu thật.
 */
const bcrypt = require('bcryptjs');

if (process.env.DATABASE_URL) {
  console.error('Từ chối: đang trỏ tới cơ sở dữ liệu thật (DATABASE_URL). Công cụ này chỉ chạy trên SQLite ở máy local.');
  process.exit(1);
}
const db = require('../models');
const { Op } = db.Sequelize;
const args = process.argv.slice(2);

// Bộ sinh số ngẫu nhiên cố định: chạy lại ra đúng cùng một dữ liệu.
let seed = 20261007;
const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const pickWeighted = (items, w) => { let r = rnd() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; };

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const DEM = ['Văn', 'Thị', 'Minh', 'Ngọc', 'Gia', 'Anh', 'Thu', 'Hoàng', 'Quốc', 'Thanh', 'Bảo', 'Khánh', 'Phương', 'Đức', 'Mai'];
const TEN = ['An', 'Bình', 'Chi', 'Dung', 'Đạt', 'Giang', 'Hà', 'Hiếu', 'Hùng', 'Khoa', 'Lan', 'Linh', 'Long', 'Mai', 'Nam', 'Nhi', 'Phát', 'Quân', 'Sơn', 'Thảo', 'Trang', 'Tuấn', 'Uyên', 'Vy', 'Yến', 'Hân', 'Kiên', 'Ngân'];

async function clear() {
  const demoUsers = await db.User.findAll({ where: { Email: { [Op.like]: '%@lumiedu.demo' } }, attributes: ['Id'] });
  const ids = demoUsers.map((u) => u.Id);
  const invs = await db.Invoice.findAll({ where: { InvoiceCode: { [Op.like]: 'DEMO%' } }, attributes: ['Id'] });
  const out = {
    payments: await db.Payment.destroy({ where: { TransactionCode: { [Op.like]: 'DEMO-%' } } }),
    invoices: await db.Invoice.destroy({ where: { InvoiceCode: { [Op.like]: 'DEMO%' } } }),
    enrollments: ids.length ? await db.ClassStudent.destroy({ where: { StudentId: ids } }) : 0,
    profiles: ids.length ? await db.UserProfile.destroy({ where: { UserId: ids } }) : 0,
    users: ids.length ? await db.User.destroy({ where: { Id: ids } }) : 0
  };
  void invs;
  return out;
}

async function create() {
  if (await db.Invoice.count({ where: { InvoiceCode: { [Op.like]: 'DEMO%' } } })) {
    console.log('Đã có dữ liệu mẫu. Dùng --reset để tạo lại hoặc --clear để xóa.');
    return;
  }
  const classes = await db.Class.findAll({ where: { Status: 1 }, include: [{ model: db.Course, as: 'Course' }] });
  if (!classes.length) throw new Error('Chưa có lớp học nào để gắn đơn hàng.');
  // Môn học "hút" nhiều đơn hơn: ôn thi lớp 12 > còn lại.
  const weightOf = (c) => { const code = c.Course.CourseCode; return /12$/.test(code) ? 3.2 : /^TOAN/.test(code) ? 2 : /^ANH/.test(code) ? 1.8 : /^VAN/.test(code) ? 1.2 : 1; };
  const weights = classes.map(weightOf);

  const hash = await bcrypt.hash('DemoOnly#2026', 8);
  const students = [];
  for (let i = 0; i < 200; i++) {
    const name = `${pick(HO)} ${pick(DEM)} ${pick(TEN)}`;
    const u = await db.User.create({ FullName: name, Email: `demo${String(i).padStart(3, '0')}@lumiedu.demo`, Phone: `0970${String(100000 + i)}`, PasswordHash: hash, Role: db.User.RoleMap.STUDENT, Status: db.User.StatusMap.ACTIVE });
    await db.UserProfile.create({ UserId: u.Id });
    students.push(u);
  }

  const now = Date.now(), DAY = 86400000;
  const seatsUsed = {};
  let seq = 0, invoices = 0, paid = 0, revenue = 0;
  for (let dAgo = 89; dAgo >= 0; dAgo--) {
    const day = new Date(now - dAgo * DAY);
    const weekday = day.getDay();
    const growth = 0.6 + (89 - dAgo) / 89 * 0.9;               // đà tăng dần theo thời gian
    const seasonal = weekday === 0 || weekday === 6 ? 1.35 : 0.9; // cuối tuần nhiều đơn hơn
    const spike = dAgo % 23 === 4 ? 2.2 : 1;                      // vài đợt khuyến mãi
    const count = Math.round(rnd() * 2 * (0.55 + growth) * seasonal * spike);
    for (let k = 0; k < count; k++) {
      const cls = pickWeighted(classes, weights);
      const stu = pick(students);
      const created = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 7 + Math.floor(rnd() * 15), Math.floor(rnd() * 60));
      if (created.getTime() > now) continue;
      const exists = await db.Invoice.count({ where: { StudentId: stu.Id, ClassId: cls.Id } });
      if (exists) continue;
      const code = `DEMO${created.toISOString().slice(0, 10).replace(/-/g, '')}${String(++seq).padStart(3, '0')}`;
      const r = rnd();
      // Đơn càng mới càng có khả năng còn "chờ"; đơn cũ chưa trả thì là "quá hạn".
      const status = r < 0.03 ? 3 : (r < (dAgo <= 5 ? 0.30 : 0.16)) ? 0 : 1;
      const inv = await db.Invoice.create({ InvoiceCode: code, StudentId: stu.Id, ClassId: cls.Id, Amount: cls.Course.BasePrice, DueDate: new Date(created.getTime() + 7 * DAY), Status: status === 3 ? 3 : status, CreatedAt: created });
      invoices++;
      if (status !== 1) continue;
      const payTime = new Date(created.getTime() + (1 + Math.floor(rnd() * 30)) * 3600000);
      if (payTime.getTime() > now) { await inv.update({ Status: 0 }); continue; }
      const cash = rnd() < 0.18;
      await db.Payment.create({ InvoiceId: inv.Id, TransactionCode: `DEMO-${cash ? 'CASH' : 'BANK'}-${code}`, Amount: inv.Amount, PaymentMethod: cash ? db.Payment.MethodMap.CASH : db.Payment.MethodMap.BANK_TRANSFER, PaymentTime: payTime });
      seatsUsed[cls.Id] = (seatsUsed[cls.Id] || 0) + 1;
      if (!cls.MaxStudents || seatsUsed[cls.Id] + 5 < cls.MaxStudents) {
        await db.ClassStudent.findOrCreate({ where: { ClassId: cls.Id, StudentId: stu.Id }, defaults: { EnrolledAt: payTime } });
      }
      paid++; revenue += Number(inv.Amount);
    }
  }
  console.log(`Đã tạo ${students.length} học viên mẫu, ${invoices} hóa đơn (${paid} đã thu), doanh thu ${revenue.toLocaleString('vi-VN')}đ.`);
}

(async () => {
  if (args.includes('--reset') || args.includes('--clear')) console.log('Đã xóa:', await clear());
  if (!args.includes('--clear')) await create();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
