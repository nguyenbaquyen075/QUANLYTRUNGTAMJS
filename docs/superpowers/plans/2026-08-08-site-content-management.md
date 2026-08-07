# Quản lý nội dung website qua Admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép admin (role `ADMIN`/`STAFF`) sửa thông tin liên hệ, nội dung trang chủ (banner, giới thiệu, slide khuyến mãi, bảng vàng thành tích, feedback học viên) và ảnh đại diện giáo viên — hoàn toàn qua giao diện quản trị, không cần sửa code.

**Architecture:** Thêm 2 bảng Sequelize tổng quát ở backend (`SiteSetting` key-value cho nội dung đơn, `HomepageItem` cho danh sách lặp) + 1 API public (`GET /Home/SiteContent`) + bộ API admin CRUD. Frontend fetch nội dung qua hook mới, luôn có fallback về đúng nội dung hardcode hiện tại nếu admin chưa cấu hình gì. Trang admin mới `SiteSettingsPage.jsx` theo đúng pattern route riêng đã có (`CourseClassesPage.jsx`), không nhét vào `AdminDashboard.jsx`.

**Tech Stack:** Node.js/Express, Sequelize (SQLite/Postgres), multer + Cloudinary (upload ảnh, pattern có sẵn), React 19, axios, Tailwind (class inline theo pattern có sẵn, không thêm thư viện UI).

## Global Constraints

- Không tạo bảng riêng cho từng loại nội dung — chỉ 2 model mới (`SiteSetting`, `HomepageItem`), theo đúng quyết định trong spec `docs/superpowers/specs/2026-08-08-site-content-management-design.md`.
- Mọi nội dung công khai phải có fallback về đúng giá trị hardcode hiện tại khi chưa cấu hình — không được để trang trắng/vỡ giao diện.
- Tái dùng multer/Cloudinary pattern đã có trong `backend/src/controllers/adminController.js` (biến `upload`, hàm `uploadToCloud`, `deleteUploadFile`) — không tạo cơ chế upload mới.
- Route admin dùng `requireAuth(['ADMIN', 'STAFF'])`, giữ nguyên convention `POST` cho create/update (không dùng PUT/DELETE method thật, theo đúng style các route admin khác trong repo).
- Không thêm framework test mới (không jest/supertest) — repo hiện chưa có test nào; chỉ dùng `node:test` + `node:assert/strict` (built-in, có sẵn từ Node 18) cho phần logic thuần túy có thể tách khỏi DB/HTTP.
- Không làm kéo-thả sắp xếp, không rich-text editor, không lưu lịch sử chỉnh sửa — đúng theo mục "Ngoài phạm vi" của spec.

---

### Task 1: Backend models `SiteSetting` và `HomepageItem`

**Files:**
- Create: `backend/src/models/SiteSetting.js`
- Create: `backend/src/models/HomepageItem.js`
- Modify: `backend/src/models/index.js`

**Interfaces:**
- Produces: `db.SiteSetting` (Sequelize model, PK `Key` là string, có `Value` TEXT nullable) và `db.HomepageItem` (Sequelize model, PK `Id` autoincrement, có `Section`, `SortOrder`, `Title`, `Subtitle`, `Body`, `ImageUrl`, `ExtraData`, `IsActive`) — các task sau dùng trực tiếp `db.SiteSetting.upsert(...)`, `db.SiteSetting.findAll()`, `db.HomepageItem.findAll/create/findByPk/destroy`.

- [ ] **Step 1: Tạo model `SiteSetting`**

```js
// backend/src/models/SiteSetting.js
module.exports = (sequelize, DataTypes) => {
  const SiteSetting = sequelize.define('SiteSettings', {
    Key: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      field: 'Key'
    },
    Value: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Value'
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'UpdatedAt'
    }
  });

  return SiteSetting;
};
```

- [ ] **Step 2: Tạo model `HomepageItem`**

```js
// backend/src/models/HomepageItem.js
module.exports = (sequelize, DataTypes) => {
  const HomepageItem = sequelize.define('HomepageItems', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    Section: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'Section'
    },
    SortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'SortOrder'
    },
    Title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'Title'
    },
    Subtitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'Subtitle'
    },
    Body: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Body'
    },
    ImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'ImageUrl'
    },
    ExtraData: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'ExtraData'
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'IsActive'
    }
  });

  HomepageItem.SECTIONS = ['promo_slide', 'honor_student', 'testimonial'];

  return HomepageItem;
};
```

- [ ] **Step 3: Đăng ký 2 model trong `backend/src/models/index.js`**

Thêm sau dòng `db.TeacherEvaluation = require('./TeacherEvaluation')(sequelize, DataTypes);` (dòng 25):

```js
db.SiteSetting = require('./SiteSetting')(sequelize, DataTypes);
db.HomepageItem = require('./HomepageItem')(sequelize, DataTypes);
```

Không cần thêm association — 2 bảng này độc lập, không liên kết `belongsTo`/`hasMany` với bảng nào.

- [ ] **Step 4: Xác nhận bảng được tạo**

Run: `cd backend && npm run dev` (khởi động server, `sequelize.sync()` trong `server.js` tự tạo 2 bảng mới)
Expected: log console in ra `Database schema synced successfully.` không có lỗi. Dừng server bằng `Ctrl+C` sau khi xác nhận.

- [ ] **Step 5: Commit**

```bash
git add backend/src/models/SiteSetting.js backend/src/models/HomepageItem.js backend/src/models/index.js
git commit -m "feat: thêm model SiteSetting và HomepageItem cho nội dung website"
```

---

### Task 2: `formatSiteContent` — hàm thuần túy gom dữ liệu (TDD)

**Files:**
- Modify: `backend/src/services/homeService.js`
- Create: `backend/tests/formatSiteContent.test.js`
- Modify: `backend/package.json`

**Interfaces:**
- Consumes: mảng plain object hoặc Sequelize instance có thuộc tính `Key`/`Value` (cho settings) và `Id`/`Section`/`SortOrder`/`Title`/`Subtitle`/`Body`/`ImageUrl`/`ExtraData`/`IsActive` (cho items).
- Produces: `formatSiteContent(settingRows, itemRows)` trả về `{ settings: { [key]: value }, sections: { promo_slide: [], honor_student: [], testimonial: [] } }`, mỗi phần tử trong section có dạng `{ id, title, subtitle, body, imageUrl, extraData }`. Task 3 gọi hàm này.

- [ ] **Step 1: Viết test trước (sẽ fail vì hàm chưa tồn tại)**

```js
// backend/tests/formatSiteContent.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { formatSiteContent } = require('../src/services/homeService');

test('trả về settings rỗng và sections rỗng khi không có dữ liệu', () => {
  const result = formatSiteContent([], []);
  assert.deepEqual(result.settings, {});
  assert.deepEqual(result.sections, { promo_slide: [], honor_student: [], testimonial: [] });
});

test('gom settings theo Key/Value', () => {
  const result = formatSiteContent(
    [
      { Key: 'center_name', Value: 'Trung Tâm ABC' },
      { Key: 'contact_phone', Value: '0123456789' }
    ],
    []
  );
  assert.equal(result.settings.center_name, 'Trung Tâm ABC');
  assert.equal(result.settings.contact_phone, '0123456789');
});

test('lọc IsActive=false và sắp xếp theo SortOrder tăng dần', () => {
  const result = formatSiteContent([], [
    { Id: 1, Section: 'promo_slide', SortOrder: 2, Title: 'Slide 2', Subtitle: null, Body: null, ImageUrl: null, ExtraData: null, IsActive: true },
    { Id: 2, Section: 'promo_slide', SortOrder: 1, Title: 'Slide 1', Subtitle: null, Body: null, ImageUrl: null, ExtraData: null, IsActive: true },
    { Id: 3, Section: 'promo_slide', SortOrder: 0, Title: 'Slide ẩn', Subtitle: null, Body: null, ImageUrl: null, ExtraData: null, IsActive: false }
  ]);
  assert.equal(result.sections.promo_slide.length, 2);
  assert.equal(result.sections.promo_slide[0].title, 'Slide 1');
  assert.equal(result.sections.promo_slide[1].title, 'Slide 2');
});

test('parse ExtraData là JSON hợp lệ, trả null nếu JSON hỏng', () => {
  const result = formatSiteContent([], [
    { Id: 1, Section: 'promo_slide', SortOrder: 0, Title: 'A', Subtitle: null, Body: null, ImageUrl: null, ExtraData: '{"code":"ABC20"}', IsActive: true },
    { Id: 2, Section: 'promo_slide', SortOrder: 1, Title: 'B', Subtitle: null, Body: null, ImageUrl: null, ExtraData: 'not-json', IsActive: true }
  ]);
  assert.equal(result.sections.promo_slide[0].extraData.code, 'ABC20');
  assert.equal(result.sections.promo_slide[1].extraData, null);
});

test('bỏ qua Section không thuộc danh sách hợp lệ thay vì lỗi', () => {
  const result = formatSiteContent([], [
    { Id: 9, Section: 'unknown_section', SortOrder: 0, Title: 'x', Subtitle: null, Body: null, ImageUrl: null, ExtraData: null, IsActive: true }
  ]);
  assert.deepEqual(result.sections, { promo_slide: [], honor_student: [], testimonial: [] });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `cd backend && node --test tests/formatSiteContent.test.js`
Expected: FAIL — `formatSiteContent is not a function` (chưa export từ `homeService.js`).

- [ ] **Step 3: Thêm `formatSiteContent` và `getSiteContent` vào `homeService.js`**

Thêm vào cuối `backend/src/services/homeService.js` (giữ nguyên toàn bộ nội dung hiện có của file):

```js
function formatSiteContent(settingRows, itemRows) {
  const settings = {};
  settingRows.forEach(row => {
    settings[row.Key] = row.Value;
  });

  const sections = { promo_slide: [], honor_student: [], testimonial: [] };
  itemRows
    .filter(row => row.IsActive && sections[row.Section] !== undefined)
    .slice()
    .sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0))
    .forEach(row => {
      let extraData = null;
      if (row.ExtraData) {
        try {
          extraData = JSON.parse(row.ExtraData);
        } catch (e) {
          extraData = null;
        }
      }
      sections[row.Section].push({
        id: row.Id,
        title: row.Title,
        subtitle: row.Subtitle,
        body: row.Body,
        imageUrl: row.ImageUrl,
        extraData
      });
    });

  return { settings, sections };
}

exports.formatSiteContent = formatSiteContent;

exports.getSiteContent = async () => {
  const [settingRows, itemRows] = await Promise.all([
    db.SiteSetting.findAll(),
    db.HomepageItem.findAll({ where: { IsActive: true } })
  ]);
  return formatSiteContent(settingRows, itemRows);
};
```

- [ ] **Step 4: Chạy lại test, xác nhận pass**

Run: `cd backend && node --test tests/formatSiteContent.test.js`
Expected: PASS — 5/5 test pass.

- [ ] **Step 5: Thêm script `test` vào `backend/package.json`**

Trong `"scripts"` (sau `"dev": "nodemon server.js"`), thêm:

```json
"test": "node --test tests/"
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/services/homeService.js backend/tests/formatSiteContent.test.js backend/package.json
git commit -m "feat: thêm formatSiteContent + getSiteContent vào homeService, kèm test"
```

---

### Task 3: API public `GET /Home/SiteContent`

**Files:**
- Modify: `backend/src/controllers/homeController.js`
- Modify: `backend/src/routes/homeRoutes.js`

**Interfaces:**
- Consumes: `homeService.getSiteContent()` từ Task 2.
- Produces: endpoint `GET /Home/SiteContent` trả JSON `{ success: true, data: { settings, sections } }` — Task 7 (frontend hook) gọi endpoint này.

- [ ] **Step 1: Thêm handler vào `homeController.js`**

Thêm vào cuối `backend/src/controllers/homeController.js` (sau hàm `getMockTestData`):

```js
// GET: /Home/SiteContent (React public site content REST API)
exports.getSiteContent = async (req, res) => {
  try {
    const content = await homeService.getSiteContent();
    res.json({ success: true, data: content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi tải nội dung trang.' });
  }
};
```

- [ ] **Step 2: Thêm route trong `homeRoutes.js`**

Thêm sau dòng `router.get('/Home/MockTestData', homeController.getMockTestData);`:

```js
router.get('/Home/SiteContent', homeController.getSiteContent);
```

- [ ] **Step 3: Kiểm thử thủ công**

Run: `cd backend && npm run dev`, sau đó ở terminal khác: `curl -s http://localhost:3001/Home/SiteContent | head -c 300` (đổi cổng nếu `.env` khác)
Expected: JSON `{"success":true,"data":{"settings":{},"sections":{"promo_slide":[],"honor_student":[],"testimonial":[]}}}` (DB rỗng ban đầu). Dừng server.

- [ ] **Step 4: Commit**

```bash
git add backend/src/controllers/homeController.js backend/src/routes/homeRoutes.js
git commit -m "feat: thêm API public GET /Home/SiteContent"
```

---

### Task 4: API admin — cài đặt chung (`SiteSetting`)

**Files:**
- Modify: `backend/src/controllers/adminController.js`
- Modify: `backend/src/routes/adminRoutes.js`

**Interfaces:**
- Consumes: `db.SiteSetting` (Task 1), `upload` (multer instance có sẵn ở đầu `adminController.js`), `uploadToCloud` (đã import sẵn).
- Produces: `controller.getSettingsAdmin`, `controller.upsertGeneralSettings` — Task 11 (frontend admin page) gọi `GET /Admin/Settings` và `POST /Admin/Settings/General`.

- [ ] **Step 1: Thêm 2 handler vào `adminController.js`**

Thêm vào cuối file, ngay trước dòng `controller.upload = upload;` (dòng 1240):

```js
// GET: /Admin/Settings
controller.getSettingsAdmin = async (req, res) => {
  try {
    const settingRows = await db.SiteSetting.findAll();
    const itemRows = await db.HomepageItem.findAll({ order: [['Section', 'ASC'], ['SortOrder', 'ASC']] });
    const settings = {};
    settingRows.forEach(row => { settings[row.Key] = row.Value; });
    return res.json({ success: true, data: { settings, items: itemRows } });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: 'Lỗi tải cài đặt.' });
  }
};

const GENERAL_TEXT_FIELDS = [
  { body: 'centerName', key: 'center_name' },
  { body: 'contactAddress', key: 'contact_address' },
  { body: 'contactPhone', key: 'contact_phone' },
  { body: 'contactEmail', key: 'contact_email' },
  { body: 'contactZaloUrl', key: 'contact_zalo_url' },
  { body: 'socialFacebookUrl', key: 'social_facebook_url' },
  { body: 'aboutTitle', key: 'about_title' },
  { body: 'aboutBody', key: 'about_body' },
  { body: 'examCountdownDate', key: 'exam_countdown_date' },
  { body: 'spotlightTeacherName', key: 'spotlight_teacher_name' }
];

const GENERAL_BULLET_FIELDS = [
  { body: 'spotlightHighlights', key: 'spotlight_highlights' },
  { body: 'spotlightTeachingStyle', key: 'spotlight_teaching_style' }
];

const GENERAL_IMAGE_FIELDS = [
  { file: 'logo', key: 'logo_url' },
  { file: 'heroBanner', key: 'hero_banner_url' },
  { file: 'aboutImage', key: 'about_image_url' },
  { file: 'spotlightImage', key: 'spotlight_image_url' }
];

// POST: /Admin/Settings/General
controller.upsertGeneralSettings = async (req, res) => {
  try {
    for (const f of GENERAL_TEXT_FIELDS) {
      if (req.body[f.body] !== undefined) {
        await db.SiteSetting.upsert({ Key: f.key, Value: req.body[f.body], UpdatedAt: new Date() });
      }
    }

    for (const f of GENERAL_BULLET_FIELDS) {
      if (req.body[f.body] !== undefined) {
        const lines = req.body[f.body].split('\n').map(l => l.trim()).filter(Boolean);
        await db.SiteSetting.upsert({ Key: f.key, Value: JSON.stringify(lines), UpdatedAt: new Date() });
      }
    }

    const files = req.files || {};
    for (const f of GENERAL_IMAGE_FIELDS) {
      const uploaded = files[f.file] && files[f.file][0];
      if (uploaded) {
        const cloudinaryUrl = await uploadToCloud(uploaded.path, 'settings');
        const url = cloudinaryUrl || `/uploads/${uploaded.filename}`;
        await db.SiteSetting.upsert({ Key: f.key, Value: url, UpdatedAt: new Date() });
      }
    }

    return res.json({ success: true, message: 'Đã lưu cài đặt website.' });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: 'Lỗi hệ thống khi lưu cài đặt.' });
  }
};
```

- [ ] **Step 2: Thêm route trong `adminRoutes.js`**

Thêm sau dòng `router.get('/Admin/TeacherEvaluations/:teacherId', requireAuth(['ADMIN', 'STAFF']), adminController.getTeacherEvaluations);`:

```js
router.get('/Admin/Settings', requireAuth(['ADMIN', 'STAFF']), adminController.getSettingsAdmin);
router.post(
  '/Admin/Settings/General',
  requireAuth(['ADMIN', 'STAFF']),
  adminController.upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'heroBanner', maxCount: 1 },
    { name: 'aboutImage', maxCount: 1 },
    { name: 'spotlightImage', maxCount: 1 }
  ]),
  adminController.upsertGeneralSettings
);
```

- [ ] **Step 3: Kiểm thử thủ công**

Run backend (`npm run dev`), đăng nhập admin trên trình duyệt để có session cookie, rồi từ DevTools Console của trang admin gọi:
```js
fetch('/Admin/Settings/General', {
  method: 'POST',
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
  body: (() => { const f = new FormData(); f.append('centerName', 'Trung Tâm Test'); return f; })(),
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```
Expected: `{success: true, message: 'Đã lưu cài đặt website.'}`. Sau đó `curl http://localhost:3001/Home/SiteContent` phải thấy `"center_name":"Trung Tâm Test"`.

- [ ] **Step 4: Commit**

```bash
git add backend/src/controllers/adminController.js backend/src/routes/adminRoutes.js
git commit -m "feat: thêm API admin đọc/ghi cài đặt chung website"
```

---

### Task 5: API admin — CRUD danh sách nội dung (`HomepageItem`)

**Files:**
- Modify: `backend/src/controllers/adminController.js`
- Modify: `backend/src/routes/adminRoutes.js`

**Interfaces:**
- Consumes: `db.HomepageItem` (Task 1), `upload`, `uploadToCloud`, `deleteUploadFile` (đã có sẵn trong file).
- Produces: `controller.createHomepageItem`, `controller.updateHomepageItem`, `controller.deleteHomepageItem` — Task 11 gọi qua `POST /Admin/Settings/Items`, `POST /Admin/Settings/Items/:id`, `POST /Admin/Settings/Items/:id/Delete`.

- [ ] **Step 1: Thêm 3 handler vào `adminController.js`**

Thêm ngay sau các hàm ở Task 4 (trước `controller.upload = upload;`):

```js
// POST: /Admin/Settings/Items
controller.createHomepageItem = async (req, res) => {
  const { section, title, subtitle, body, sortOrder, extraData } = req.body;
  if (!db.HomepageItem.SECTIONS.includes(section)) {
    return res.json({ success: false, message: 'Loại nội dung không hợp lệ.' });
  }
  try {
    let imageUrl = null;
    if (req.file) {
      const cloudinaryUrl = await uploadToCloud(req.file.path, 'homepage');
      imageUrl = cloudinaryUrl || `/uploads/${req.file.filename}`;
    }
    const item = await db.HomepageItem.create({
      Section: section,
      SortOrder: parseInt(sortOrder) || 0,
      Title: title || null,
      Subtitle: subtitle || null,
      Body: body || null,
      ImageUrl: imageUrl,
      ExtraData: extraData || null,
      IsActive: true
    });
    return res.json({ success: true, message: 'Đã thêm mục nội dung.', item });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: 'Lỗi hệ thống khi thêm nội dung.' });
  }
};

// POST: /Admin/Settings/Items/:id
controller.updateHomepageItem = async (req, res) => {
  const itemId = parseInt(req.params.id);
  const { title, subtitle, body, sortOrder, extraData, isActive, removeImage } = req.body;
  try {
    const item = await db.HomepageItem.findByPk(itemId);
    if (!item) return res.json({ success: false, message: 'Không tìm thấy nội dung.' });

    if (title !== undefined) item.Title = title || null;
    if (subtitle !== undefined) item.Subtitle = subtitle || null;
    if (body !== undefined) item.Body = body || null;
    if (sortOrder !== undefined) item.SortOrder = parseInt(sortOrder) || 0;
    if (extraData !== undefined) item.ExtraData = extraData || null;
    if (isActive !== undefined) item.IsActive = isActive === 'true' || isActive === true;

    if (removeImage === 'true') {
      deleteUploadFile(item.ImageUrl);
      item.ImageUrl = null;
    } else if (req.file) {
      const cloudinaryUrl = await uploadToCloud(req.file.path, 'homepage');
      const newImageUrl = cloudinaryUrl || `/uploads/${req.file.filename}`;
      deleteUploadFile(item.ImageUrl);
      item.ImageUrl = newImageUrl;
    }

    await item.save();
    return res.json({ success: true, message: 'Đã cập nhật nội dung.' });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: 'Lỗi hệ thống khi cập nhật nội dung.' });
  }
};

// POST: /Admin/Settings/Items/:id/Delete
controller.deleteHomepageItem = async (req, res) => {
  const itemId = parseInt(req.params.id);
  try {
    const item = await db.HomepageItem.findByPk(itemId);
    if (!item) return res.json({ success: false, message: 'Không tìm thấy nội dung.' });
    deleteUploadFile(item.ImageUrl);
    await item.destroy();
    return res.json({ success: true, message: 'Đã xóa nội dung.' });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: 'Lỗi hệ thống khi xóa nội dung.' });
  }
};
```

- [ ] **Step 2: Thêm route trong `adminRoutes.js`**

Thêm sau các route của Task 4:

```js
router.post('/Admin/Settings/Items', requireAuth(['ADMIN', 'STAFF']), adminController.upload.single('image'), adminController.createHomepageItem);
router.post('/Admin/Settings/Items/:id', requireAuth(['ADMIN', 'STAFF']), adminController.upload.single('image'), adminController.updateHomepageItem);
router.post('/Admin/Settings/Items/:id/Delete', requireAuth(['ADMIN', 'STAFF']), adminController.deleteHomepageItem);
```

- [ ] **Step 3: Kiểm thử thủ công**

Với session admin đã đăng nhập (DevTools Console trên trang admin):
```js
const f = new FormData();
f.append('section', 'testimonial');
f.append('title', 'Học viên Test');
f.append('body', 'Nội dung feedback test.');
f.append('sortOrder', '0');
fetch('/Admin/Settings/Items', { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest' }, body: f, credentials: 'include' })
  .then(r => r.json()).then(console.log);
```
Expected: `{success:true, message:'Đã thêm mục nội dung.', item:{...}}`. Sau đó `curl http://localhost:3001/Home/SiteContent` phải thấy phần tử trong `sections.testimonial`.

- [ ] **Step 4: Commit**

```bash
git add backend/src/controllers/adminController.js backend/src/routes/adminRoutes.js
git commit -m "feat: thêm API admin CRUD danh sách nội dung trang chủ (HomepageItem)"
```

---

### Task 6: Vá lỗ hổng — admin upload ảnh đại diện giáo viên

**Files:**
- Modify: `backend/src/controllers/adminController.js:1037-1083` (hàm `updateTeacherInfo`)
- Modify: `backend/src/routes/adminRoutes.js`
- Modify: `frontend/src/pages/dashboard/AdminDashboard.jsx` (state `editTeacherForm`, hàm `openEditTeacherModal`, `handleEditTeacherSubmit`, modal JSX dòng ~1689-1744)

**Interfaces:**
- Consumes: `uploadToCloud` (đã import trong `adminController.js`), `api` (`frontend/src/services/api.js`).
- Produces: route `POST /Admin/UpdateTeacherInfo` giờ nhận `multipart/form-data` thay vì JSON — không ảnh hưởng task khác vì chỉ frontend `AdminDashboard.jsx` gọi route này.

- [ ] **Step 1: Sửa `controller.updateTeacherInfo` để nhận avatar**

Trong `backend/src/controllers/adminController.js`, tìm đoạn (dòng ~1059-1062):

```js
    // Update User
    if (fullName) teacher.FullName = fullName;
    if (phone) teacher.Phone = phone;
    await teacher.save();
```

Thay bằng:

```js
    // Update User
    if (fullName) teacher.FullName = fullName;
    if (phone) teacher.Phone = phone;
    if (req.file) {
      const cloudinaryUrl = await uploadToCloud(req.file.path, 'avatars');
      teacher.AvatarUrl = cloudinaryUrl || `/uploads/${req.file.filename}`;
    }
    await teacher.save();
```

- [ ] **Step 2: Thêm multer middleware vào route**

Trong `backend/src/routes/adminRoutes.js`, tìm dòng:

```js
router.post('/Admin/UpdateTeacherInfo', requireAuth(['ADMIN', 'STAFF']), adminController.updateTeacherInfo);
```

Thay bằng:

```js
router.post('/Admin/UpdateTeacherInfo', requireAuth(['ADMIN', 'STAFF']), adminController.upload.single('avatar'), adminController.updateTeacherInfo);
```

- [ ] **Step 3: Frontend — thêm `avatarFile` vào state form**

Trong `frontend/src/pages/dashboard/AdminDashboard.jsx`, sửa `openEditTeacherModal` (dòng ~577-590):

```js
  const openEditTeacherModal = (t) => {
    setOpenTeacherMenuId(null);
    const p = t.Profile || {};
    setEditTeacherForm({
      teacherId: t.Id,
      fullName: t.FullName || '',
      phone: t.Phone || '',
      teacherTitle: p.TeacherTitle || '',
      subject: p.Subject || '',
      teacherExperience: p.TeacherExperience ?? '',
      teacherStudents: p.TeacherStudents ?? '',
      teacherRating: p.TeacherRating ?? '',
      teacherBio: p.TeacherBio || '',
      avatarUrl: t.AvatarUrl || '',
      avatarFile: null,
    });
  };
```

- [ ] **Step 4: Frontend — thêm handler chọn file**

Ngay sau `handleEditTeacherChange` (dòng ~592-594), thêm:

```js
  const handleEditTeacherAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setEditTeacherForm((prev) => ({ ...prev, avatarFile: file || null }));
  };
```

- [ ] **Step 5: Frontend — đổi `handleEditTeacherSubmit` sang gửi `FormData`**

Thay toàn bộ hàm `handleEditTeacherSubmit` (dòng ~596-611) bằng:

```js
  const handleEditTeacherSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(editTeacherForm).forEach(([key, value]) => {
        if (key === 'avatarFile' || key === 'avatarUrl') return;
        formData.append(key, value ?? '');
      });
      if (editTeacherForm.avatarFile) {
        formData.append('avatar', editTeacherForm.avatarFile);
      }
      const res = await api.post('/Admin/UpdateTeacherInfo', formData, { headers: { 'Content-Type': undefined } });
      if (res.data?.success) {
        setEditTeacherForm(null);
        refetch();
      } else {
        alert(res.data?.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };
```

- [ ] **Step 6: Frontend — thêm input file vào modal**

Trong modal sửa giảng viên (dòng ~1698-1699), ngay sau dòng `<form onSubmit={handleEditTeacherSubmit} className="space-y-4">`, thêm khối:

```jsx
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {editTeacherForm.avatarFile ? (
                    <img src={URL.createObjectURL(editTeacherForm.avatarFile)} alt="Xem trước" className="w-full h-full object-cover" />
                  ) : editTeacherForm.avatarUrl ? (
                    <img src={editTeacherForm.avatarUrl} alt="Ảnh đại diện" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-slate-300 text-3xl">person</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ảnh đại diện</label>
                  <input type="file" accept="image/*" onChange={handleEditTeacherAvatarChange} className="text-sm" />
                </div>
              </div>
```

- [ ] **Step 7: Kiểm thử thủ công**

`cd frontend && npm run dev` + `cd backend && npm run dev`, đăng nhập admin, mở "Quản lý Giáo viên" → sửa 1 giảng viên → chọn ảnh đại diện mới → Lưu.
Expected: không lỗi, danh sách giáo viên refetch xong hiển thị avatar mới; trang `/Home/Teachers` cũng đổi ảnh tương ứng.

- [ ] **Step 8: Commit**

```bash
git add backend/src/controllers/adminController.js backend/src/routes/adminRoutes.js frontend/src/pages/dashboard/AdminDashboard.jsx
git commit -m "fix: cho phép admin upload ảnh đại diện thay giáo viên"
```

---

### Task 7: Frontend hook `useSiteContent`

**Files:**
- Create: `frontend/src/hooks/useSiteContent.js`

**Interfaces:**
- Consumes: `api` (`frontend/src/services/api.js`), endpoint `GET /Home/SiteContent` (Task 3).
- Produces: `useSiteContent()` → `{ settings: object, sections: { promo_slide: [], honor_student: [], testimonial: [] }, loading: boolean }` — Task 8, 9, 10 dùng hook này.

- [ ] **Step 1: Viết hook**

```js
// frontend/src/hooks/useSiteContent.js
import { useState, useEffect } from 'react';
import api from '../services/api';

const EMPTY_CONTENT = { settings: {}, sections: { promo_slide: [], honor_student: [], testimonial: [] } };

export function useSiteContent() {
  const [content, setContent] = useState(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.get('/Home/SiteContent')
      .then((res) => {
        if (isMounted && res.data && res.data.success) {
          setContent(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  return { ...content, loading };
}
```

- [ ] **Step 2: Kiểm thử thủ công**

Không có UI dùng hook này ở task này — sẽ kiểm thử gián tiếp khi Task 8 chạy được. Xác nhận file không có lỗi cú pháp: `cd frontend && npx vite build --mode development 2>&1 | grep -i "useSiteContent" || echo "no errors referencing file"`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useSiteContent.js
git commit -m "feat: thêm hook useSiteContent đọc nội dung website từ API"
```

---

### Task 8: Wire Footer & nút liên hệ (`MainLayout.jsx`)

**Files:**
- Modify: `frontend/src/components/Layout/MainLayout.jsx`

**Interfaces:**
- Consumes: `useSiteContent()` (Task 7).

- [ ] **Step 1: Thêm import và lấy dữ liệu**

Thay dòng đầu file:

```js
import React, { useState } from 'react';
import Navbar from './Navbar';
import AIChatbot from './AIChatbot';
import ProfileModal from './ProfileModal';
import { Link } from 'react-router-dom';
```

bằng:

```js
import React, { useState } from 'react';
import Navbar from './Navbar';
import AIChatbot from './AIChatbot';
import ProfileModal from './ProfileModal';
import { Link } from 'react-router-dom';
import { useSiteContent } from '../../hooks/useSiteContent';
```

Trong hàm `MainLayout`, ngay sau `const [isProfileOpen, setIsProfileOpen] = useState(false);`, thêm:

```js
  const { settings } = useSiteContent();
  const centerName = settings.center_name || 'Anh Tê - Tri Thức Lịch Sử';
  const contactEmail = settings.contact_email || 'lienhe@anhte.vn';
  const contactPhone = settings.contact_phone || '+84 123 456 789';
  const contactAddress = settings.contact_address || 'Hà Nội, Việt Nam';
  const zaloUrl = settings.contact_zalo_url || '#';
  const facebookUrl = settings.social_facebook_url || '#';
  const telHref = `tel:${(settings.contact_phone || '0123456789').replace(/[^\d+]/g, '')}`;
```

- [ ] **Step 2: Thay nội dung tĩnh trong Footer bằng biến động**

Thay dòng `<h3 className="text-2xl font-bold text-white">Anh Tê - Tri Thức Lịch Sử</h3>` bằng:

```jsx
                <h3 className="text-2xl font-bold text-white">{centerName}</h3>
```

Thay khối:

```jsx
                <ul className="space-y-4 text-white/90 text-sm">
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-xl text-white">mail</span> lienhe@anhte.vn</li>
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-xl text-white">call</span> +84 123 456 789</li>
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-xl text-white">location_on</span> Hà Nội, Việt Nam</li>
                </ul>
```

bằng:

```jsx
                <ul className="space-y-4 text-white/90 text-sm">
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-xl text-white">mail</span> {contactEmail}</li>
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-xl text-white">call</span> {contactPhone}</li>
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-xl text-white">location_on</span> {contactAddress}</li>
                </ul>
```

Thay dòng `<span>© 2026 Tri Thức Lịch Sử Anh Tê. All rights reserved.</span>` bằng:

```jsx
              <span>© 2026 {centerName}. All rights reserved.</span>
```

- [ ] **Step 3: Wire link mạng xã hội và nút liên hệ nổi**

Thay 2 thẻ `<a ... href="#">` trong khối "Theo dõi" — thẻ đầu (icon `public`) thêm `href={facebookUrl}` thay `href="#"`.

Thay khối "Sticky Contact Buttons":

```jsx
            <a className="w-12 h-12 bg-[#0068ff] text-white rounded-full flex items-center justify-center shadow-2xl group transition-all hover:scale-110 active:scale-95" href="#">
```

bằng:

```jsx
            <a className="w-12 h-12 bg-[#0068ff] text-white rounded-full flex items-center justify-center shadow-2xl group transition-all hover:scale-110 active:scale-95" href={zaloUrl} target="_blank" rel="noopener noreferrer">
```

Thay `href="tel:0123456789"` bằng `href={telHref}`.

- [ ] **Step 4: Kiểm thử thủ công**

`cd frontend && npm run dev`, mở trang chủ — footer vẫn hiển thị đúng nội dung mặc định hiện tại (vì DB rỗng, fallback chạy). Vào admin, gọi `POST /Admin/Settings/General` với `contactPhone=0909999999` (dùng lại đoạn `fetch` ở Task 4 Step 3, đổi field), reload trang chủ, xác nhận số điện thoại footer đổi theo.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Layout/MainLayout.jsx
git commit -m "feat: Footer đọc thông tin liên hệ từ SiteSetting, fallback nội dung cũ"
```

---

### Task 9: Wire "Giới thiệu trung tâm" (`TeachersPage.jsx`)

**Files:**
- Modify: `frontend/src/pages/TeachersPage.jsx`

**Interfaces:**
- Consumes: `useSiteContent()` (Task 7).

> Lưu ý: khối "Giới thiệu trung tâm" nằm ở `TeachersPage.jsx` (mục "6. About Center Section", dòng 430-498), không phải `HomePage.jsx`.

- [ ] **Step 1: Thêm import và lấy dữ liệu**

Thay dòng đầu file:

```js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useFetchData } from '../hooks/useFetchData';
```

bằng:

```js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useFetchData } from '../hooks/useFetchData';
import { useSiteContent } from '../hooks/useSiteContent';
```

Trong hàm `TeachersPage`, sau dòng `const { data, loading } = useFetchData('/Home/Teachers');`, thêm:

```js
  const { settings } = useSiteContent();
  const aboutTitle = settings.about_title || 'TRUNG TÂM';
  const aboutBody1 = settings.about_body
    ? settings.about_body.split('\n')[0]
    : 'Trung tâm Tri Thức Lịch Sử được sáng lập bởi Thầy Anh Tê với khát vọng thay đổi cách tiếp cận môn Lịch sử. Chúng tôi không chỉ dạy kiến thức, mà còn truyền cảm hứng về cội nguồn dân tộc.';
  const aboutBody2 = settings.about_body && settings.about_body.split('\n')[1]
    ? settings.about_body.split('\n')[1]
    : 'Với hệ sinh thái học tập hiện đại, kết hợp công nghệ hình ảnh hóa kiến thức, Anh Tê đã giúp hàng ngàn học sinh tự tin chinh phục những điểm số cao nhất.';
  const aboutImageUrl = settings.about_image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOrbu4zKru3YWOvUeOlXeQnHRlviJBAYCVenaR7gtKQ18cOXRwQOD0hb5sklmPwz_XSCz7lDhMip7dN4F1MvUAKjvrJVGJk7aFkH6GyxESuMV9aBBOV05XICMKZ1rXF7BaZu7AREsU06DBR3ya5T82FYo4-hJ3EiVCAAtKL6PO5uKplmA_EKdbuGW4GMbkJuLDeJX_xDsM5uiowEjK4L0hrn-2drS0mr6vzh5xFfRGJmm8HYq8JQWUBGJXLSysru9Z75o';
```

- [ ] **Step 2: Thay tiêu đề "About Center Section"**

Thay:

```jsx
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-on-surface uppercase tracking-tight">
                  GIỚI THIỆU <span className="text-primary">TRUNG TÂM</span>
                </h2>
```

bằng:

```jsx
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-on-surface uppercase tracking-tight">
                  GIỚI THIỆU <span className="text-primary">{aboutTitle}</span>
                </h2>
```

- [ ] **Step 3: Thay 2 đoạn văn giới thiệu**

Thay:

```jsx
              <div className="space-y-5 text-on-surface-variant text-base leading-relaxed">
                <p>
                  Trung tâm <strong>Tri Thức Lịch Sử</strong> được sáng lập bởi Thầy Anh Tê với khát vọng thay đổi cách tiếp cận môn Lịch sử. Chúng tôi không chỉ dạy kiến thức, mà còn truyền cảm hứng về cội nguồn dân tộc.
                </p>
                <p>
                  Với hệ sinh thái học tập hiện đại, kết hợp công nghệ hình ảnh hóa kiến thức, Anh Tê đã giúp hàng ngàn học sinh tự tin chinh phục những điểm số cao nhất.
                </p>
              </div>
```

bằng:

```jsx
              <div className="space-y-5 text-on-surface-variant text-base leading-relaxed">
                <p>{aboutBody1}</p>
                <p>{aboutBody2}</p>
              </div>
```

- [ ] **Step 4: Thay ảnh minh họa**

Thay `src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOrbu4zKru3YWOvUeOlXeQnHRlviJBAYCVenaR7gtKQ18cOXRwQOD0hb5sklmPwz_XSCz7lDhMip7dN4F1MvUAKjvrJVGJk7aFkH6GyxESuMV9aBBOV05XICMKZ1rXF7BaZu7AREsU06DBR3ya5T82FYo4-hJ3EiVCAAtKL6PO5uKplmA_EKdbuGW4GMbkJuLDeJX_xDsM5uiowEjK4L0hrn-2drS0mr6vzh5xFfRGJmm8HYq8JQWUBGJXLSysru9Z75o"` (trong khối `<img alt="Trung tâm Tri Thức Lịch Sử" ...>`) bằng `src={aboutImageUrl}`.

- [ ] **Step 5: Kiểm thử thủ công**

`cd frontend && npm run dev`, mở `/Home/Teachers` — nội dung hiển thị đúng như cũ (fallback). Cập nhật `aboutTitle`/`aboutBody` qua `POST /Admin/Settings/General` (Task 4), reload, xác nhận đổi theo (lưu ý `aboutBody` cần có ký tự xuống dòng `\n` để tách thành 2 đoạn — nếu chỉ 1 dòng, đoạn 2 giữ nguyên fallback).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/TeachersPage.jsx
git commit -m "feat: khối Giới thiệu trung tâm đọc từ SiteSetting, fallback nội dung cũ"
```

---

### Task 10: Wire trang chủ (`HomePage.jsx`) — banner, đếm ngược, giáo viên nổi bật, danh sách marketing, khóa học thật

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx`

**Interfaces:**
- Consumes: `useSiteContent()` (Task 7), `api.get('/Home/Data')` (endpoint có sẵn, trả `{success, data:{courses,...}}`).

- [ ] **Step 1: Thêm import**

Thay dòng đầu file:

```js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import api from '../services/api';
```

bằng:

```js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import api from '../services/api';
import { useSiteContent } from '../hooks/useSiteContent';
```

- [ ] **Step 2: Trích các bullet mặc định thành hằng số (để dùng làm fallback)**

Thêm ngay trước `export default function HomePage() {` (sau khai báo `CHAT_PROOF_IMAGES`):

```js
const DEFAULT_SPOTLIGHT_HIGHLIGHTS = [
  'Có hơn <strong>40.000 học sinh</strong> 2K7, <strong>15.000 học sinh</strong> 2K6 và <strong>7000 học sinh</strong> 2K6 đã đăng ký khóa học.',
  'Trong kỳ thi THPTQG 2025, anh Kid có học sinh đạt điểm <strong>10 Toán</strong> và hàng trăm học sinh đạt điểm <strong>9+</strong>, hàng nghìn học sinh đạt điểm <strong>8+</strong>.',
  'Giáo viên có lượt xem <strong>livestream đạt TOP ĐẦU</strong> trên các nền tảng Facebook và Tiktok trong 3 năm liên tiếp 2023, 2024, 2025.',
  '<strong>Trao quỹ học bổng 800.000.000 Vnd</strong> dành cho học sinh 2K7 đạt thành tích cao trong kỳ thi THPTQG 2025.',
  '2 Năm liền trao <strong>tặng quỹ học bổng trị giá 20.000.000 Vnd</strong> cho học sinh trường THPT Xuân Đỉnh.'
];

const DEFAULT_SPOTLIGHT_TEACHING_STYLE = [
  'Dạy <strong>đúng trọng tâm</strong> và chuẩn cấu trúc chương trình mới.',
  'Năng động, sáng tạo, chi tiết, chậm rãi, phù hợp với tất cả các học sinh, đặc biệt là học sinh <strong>mất gốc</strong>.',
  'Đi sâu vào bản chất, rèn luyện <strong>tư duy</strong> để có thể xử lý bài toán linh hoạt, không máy móc.',
  'Kết hợp dạy Casio để bổ trợ đa dạng kiến thức và cách làm các bài toán.'
];

const DEFAULT_TESTIMONIALS = [
  { name: 'Học viên Flashstudy', text: 'Bản thân mình là đứa siêu ghét Toán lại còn mất gốc nữa nên lúc đki thi cũng sợ này kia. Mà ai dè mình nhận được kết quả hơn mong đợi lun ó. A dạy dễ hiểu mà cũng tận tâm, lộ trình khoá khá kì càng chi tiết, các ac trợ giảng thì vô cùng nhiệt tình. Mình thi điểm so với lứa 2k7 không cao, nhưng mà cũng gọi là tạm nên là siêu rcm cho 2kB nếu mà đang muốn học a Kid nhen' },
  { name: 'Học viên Flashstudy', text: 'Biết học khối C mà điểm toán vượt mức pickleball là như nào k? Biết, tại được 8.5 toán cơ đấy. Nói chung là biết anh Kid hơi muộn xíu nhưng bằng niềm tin k lung lay và sự đồng hành đầy sát sao, lộ trình trình học chi tiết của a thì sếp đã có thể tự tin điền thêm vài nguyện vọng khi có thêm tổ hợp xét tuyển đhoc đó. Mấy nhỏ 2k8 mà đang phân vân chọn giáo viên học thì học anh Kid đi cmay ơi, cmay sẽ khóc đó, khóc vì k học a sớm hơn' },
  { name: 'Học viên Flashstudy', text: 'Em biết anh Kid khi xem live trên tiktok và ấn tượng vì anh dạy kì và siêu vui tính, vì vậy nên em quyết định đăng kí học. Sau khi vào khoá em còn bất ngờ hơn nữa vì bài giảng trong khoá siêu chi tiết, có lộ trình các buổi cụ thể thể biết xem bản thân đã học đến đâu. Anh Kid thì siêu tận tâm, anh giảng kì nên một đứa học ở mức trung bình khá như em cảm thấy rất dễ hiểu, bên cạnh đó còn có các anh chị trợ giảng hỗ trợ em học rất nhiệt tình.' }
];
```

- [ ] **Step 3: Trong component, lấy dữ liệu động + tính toán các biến hiển thị**

Ngay sau khai báo `export default function HomePage() {` và các `useState` hiện có (trước dòng `const displayList = [...CHAT_PROOF_IMAGES, ...CHAT_PROOF_IMAGES];`), thêm:

```js
  const { settings, sections } = useSiteContent();
  const [realCourses, setRealCourses] = useState([]);

  useEffect(() => {
    let isMounted = true;
    api.get('/Home/Data')
      .then((res) => {
        const courses = res.data && res.data.data && res.data.data.courses;
        if (isMounted && Array.isArray(courses)) setRealCourses(courses);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const heroBannerUrl = settings.hero_banner_url || '/images/history_center_official_banner_hd.jpg';
  const examCountdownDate = settings.exam_countdown_date || '2027-06-11T07:30:00';

  const spotlightTeacherName = settings.spotlight_teacher_name || 'Anh giáo Kid';
  const spotlightImageUrl = settings.spotlight_image_url || '/images/anhte_teacher_cutout_clean.png?v=6';
  let spotlightHighlights = DEFAULT_SPOTLIGHT_HIGHLIGHTS;
  let spotlightTeachingStyle = DEFAULT_SPOTLIGHT_TEACHING_STYLE;
  try {
    if (settings.spotlight_highlights) spotlightHighlights = JSON.parse(settings.spotlight_highlights);
    if (settings.spotlight_teaching_style) spotlightTeachingStyle = JSON.parse(settings.spotlight_teaching_style);
  } catch (e) {
    // giữ nguyên fallback nếu JSON hỏng
  }

  const promoSlides = sections.promo_slide.length > 0
    ? sections.promo_slide.map((item) => ({
        title: item.title,
        image: item.imageUrl
      }))
    : PROMO_SLIDES;

  const honorStudents = sections.honor_student.length > 0
    ? sections.honor_student.map((item) => ({
        name: item.title,
        avatar: item.imageUrl,
        achievements: (item.body || '').split('\n').map((s) => s.trim()).filter(Boolean)
      }))
    : RED_CARD_STUDENTS;

  const testimonials = sections.testimonial.length > 0
    ? sections.testimonial.map((item) => ({ name: item.title || 'Học viên Flashstudy', text: item.body || '' }))
    : DEFAULT_TESTIMONIALS;
```

- [ ] **Step 4: Thay mọi chỗ dùng `PROMO_SLIDES` bằng `promoSlides`**

Trong `useEffect` auto-play (dòng gốc ~520-527):

```js
  useEffect(() => {
    if (isPromoHovered) return;
    const slideInterval = setInterval(() => {
      setActivePromoSlide((prev) => (prev + 1) % promoSlides.length);
    }, 2000);
    return () => clearInterval(slideInterval);
  }, [isPromoHovered, promoSlides.length]);
```

Trong render slide (đoạn `{PROMO_SLIDES.map((slide, idx) => (`), đổi thành `{promoSlides.map((slide, idx) => (`.

- [ ] **Step 5: Thay mọi chỗ dùng `RED_CARD_STUDENTS` bằng `honorStudents`**

Dòng khai báo `const redCardDisplayList = [...RED_CARD_STUDENTS, ...RED_CARD_STUDENTS];` đổi thành `const redCardDisplayList = [...honorStudents, ...honorStudents];`.

Trong `useEffect` reset vòng lặp (đoạn kiểm tra `honorCardIndex >= RED_CARD_STUDENTS.length`), đổi `RED_CARD_STUDENTS.length` thành `honorStudents.length`, và thêm `honorStudents.length` vào dependency array của `useEffect` tương ứng.

Trong nút prev (`onClick={() => setHonorCardIndex((prev) => (prev === 0 ? RED_CARD_STUDENTS.length - 1 : prev - 1))}`), đổi `RED_CARD_STUDENTS.length` thành `honorStudents.length`.

- [ ] **Step 6: Sửa đếm ngược dùng `examCountdownDate`**

Thay:

```js
  useEffect(() => {
    const targetDate = new Date('2027-06-11T07:30:00').getTime();
```

bằng:

```js
  useEffect(() => {
    const targetDate = new Date(examCountdownDate).getTime();
```

Và đổi dependency array của `useEffect` đó (dòng cuối `}, []);` ngay sau khối `if (difference > 0) {...}`) thành `}, [examCountdownDate]);`.

- [ ] **Step 7: Sửa banner hero**

Thay `src="/images/history_center_official_banner_hd.jpg"` (trong SECTION 1) bằng `src={heroBannerUrl}`.

- [ ] **Step 8: Sửa khối "GIÁO VIÊN GIẢNG DẠY" (SECTION 8)**

Thay `src="/images/anhte_teacher_cutout_clean.png?v=6"` và `alt="Anh giáo Kid"` bằng `src={spotlightImageUrl}` và `alt={spotlightTeacherName}`.

Thay khối `<ul>` đầu tiên (5 bullet "Thông tin giáo viên", dòng ~1025-1046):

```jsx
                <ul className="space-y-3 text-sm sm:text-base text-slate-700 font-normal">
                  {spotlightHighlights.map((html, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#047857] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">✓</span>
                      <span dangerouslySetInnerHTML={{ __html: html }} />
                    </li>
                  ))}
                </ul>
```

Thay khối `<ul>` thứ hai (4 bullet "Phong cách giảng dạy", dòng ~1052-1069) tương tự:

```jsx
                <ul className="space-y-3 text-sm sm:text-base text-slate-700 font-normal">
                  {spotlightTeachingStyle.map((html, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#047857] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">✓</span>
                      <span dangerouslySetInnerHTML={{ __html: html }} />
                    </li>
                  ))}
                </ul>
```

- [ ] **Step 9: Sửa khối "FEEDBACK CỦA HỌC VIÊN" (SECTION 9)**

Thay:

```jsx
            {[
              "Bản thân mình là đứa siêu ghét Toán lại còn mất gốc nữa nên lúc đki thi cũng sợ này kia. ...",
              "Biết học khối C mà điểm toán vượt mức pickleball là như nào k? ...",
              "Em biết anh Kid khi xem live trên tiktok và ấn tượng vì anh dạy kì và siêu vui tính, ..."
            ].map((reviewText, idx) => (
              <AnimatedBlock key={idx} delay={idx * 150}>
              <div
                key={idx}
                className="bg-[#eaeff5] rounded-2xl p-6 border border-slate-300/60 shadow-sm relative flex flex-col justify-between hover:bg-white hover:border-[#047857]/40 hover:shadow-md transition-all duration-300"
              >
                <svg className="w-7 h-7 text-[#047857] mb-3 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {reviewText}
                </p>
                <div className="mt-5 pt-3 border-t border-slate-300/50 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Học viên Flashstudy</span>
                  <span className="text-amber-500 font-bold">⭐⭐⭐⭐⭐</span>
                </div>
              </div>
              </AnimatedBlock>
            ))}
```

bằng:

```jsx
            {testimonials.map((review, idx) => (
              <AnimatedBlock key={idx} delay={idx * 150}>
              <div
                className="bg-[#eaeff5] rounded-2xl p-6 border border-slate-300/60 shadow-sm relative flex flex-col justify-between hover:bg-white hover:border-[#047857]/40 hover:shadow-md transition-all duration-300"
              >
                <svg className="w-7 h-7 text-[#047857] mb-3 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {review.text}
                </p>
                <div className="mt-5 pt-3 border-t border-slate-300/50 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>{review.name}</span>
                  <span className="text-amber-500 font-bold">⭐⭐⭐⭐⭐</span>
                </div>
              </div>
              </AnimatedBlock>
            ))}
```

- [ ] **Step 10: Sửa khối "KHÓA HỌC NỔI BẬT" (SECTION 5) dùng khóa học thật khi có**

Thay dòng mở đầu khối render:

```jsx
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_COURSES.map((course, idx) => (
```

và toàn bộ card bên trong, bằng đoạn có 2 nhánh (khóa thật ưu tiên, fallback khi DB rỗng):

```jsx
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {realCourses.length > 0 ? realCourses.slice(0, 4).map((course, idx) => (
              <AnimatedBlock key={course.Id} delay={idx * 180}>
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-100/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
                  {course.ImageUrl ? (
                    <img src={course.ImageUrl} alt={course.Title} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-emerald-500 via-teal-600 to-blue-700 p-4 flex flex-col justify-center items-center text-center text-white rounded-xl">
                      <span className="text-[10px] font-extrabold uppercase bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm mb-1">FLASHSTUDY</span>
                      <h4 className="font-black text-base sm:text-lg leading-tight drop-shadow-md">{course.Title}</h4>
                    </div>
                  )}
                </div>
                <div className="pt-3 px-1 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-[#047857] transition-colors">
                      {course.Title}
                    </h3>
                    <div className="grid grid-cols-2 gap-y-1 text-[11px] text-gray-600 mt-3 pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1">📚 {course.TotalLessons} buổi học</span>
                      <span className="flex items-center gap-1">👥 {course.EnrolledStudentsCount || 0} học viên</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-black text-gray-900">
                        {Number(course.BasePrice).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <Link
                      to={`/Home/Courses/${course.Id}`}
                      className="w-full bg-white hover:bg-blue-50 text-[#047857] border-2 border-[#047857] py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1"
                    >
                      Học thử ngay
                    </Link>
                  </div>
                </div>
              </div>
              </AnimatedBlock>
            )) : FEATURED_COURSES.map((course, idx) => (
```

Ngay sau dòng vừa thêm, giữ nguyên **y nguyên không đổi** toàn bộ phần JSX card cũ đang có sẵn trong file (từ `<AnimatedBlock key={course.id} delay={idx * 180}>` cho đến hết card, tức đúng nội dung gốc dòng 738-819 hiện tại) — chỉ xóa dấu `{` thừa ở đầu dòng gốc `{FEATURED_COURSES.map((course, idx) => (` vì dấu `{` mở JSX expression giờ đã chuyển lên đầu ternary ở bước trên. Dòng đóng gốc `))}` ở cuối khối (kết thúc `.map`, đóng `{...}`) **giữ nguyên không đổi** — nó vừa đóng nhánh `else` vừa đóng toán tử ba ngôi, không cần thêm bớt ký tự nào.

- [ ] **Step 11: Kiểm thử thủ công**

`cd frontend && npm run dev`, mở trang chủ:
1. DB rỗng → toàn bộ nội dung hiển thị đúng y hiện tại (banner, đếm ngược, giáo viên, slide, bảng vàng, feedback, khóa học fallback).
2. Dùng `fetch` (Task 4/5 Step 3) thêm 1 `SiteSetting` (`heroBannerUrl`... thực ra field tên `heroBanner` dạng file — dùng `examCountdownDate=2030-01-01T00:00:00` để test nhanh không cần upload file) và 1 `HomepageItem` section `testimonial` — reload trang chủ, xác nhận đếm ngược và feedback đổi theo, các phần chưa cấu hình vẫn giữ nguyên fallback.
3. Xác nhận mục "Khóa học nổi bật" hiển thị khóa học thật lấy từ `/Home/Data` (nếu DB có khóa học `Status=OPEN`), không còn dùng list giả khi có dữ liệu thật.

- [ ] **Step 12: Commit**

```bash
git add frontend/src/pages/HomePage.jsx
git commit -m "feat: trang chủ đọc nội dung động (banner, đếm ngược, giáo viên, slide, feedback, khóa học), fallback nội dung cũ"
```

---

### Task 11: Trang admin `SiteSettingsPage.jsx`

**Files:**
- Create: `frontend/src/pages/admin/SiteSettingsPage.jsx`
- Create: `frontend/src/pages/admin/HomepageItemModal.jsx`
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/components/Layout/AdminLayout.jsx`

**Interfaces:**
- Consumes: `GET /Admin/Settings`, `POST /Admin/Settings/General`, `POST /Admin/Settings/Items`, `POST /Admin/Settings/Items/:id`, `POST /Admin/Settings/Items/:id/Delete` (Task 4, 5).
- Produces: route `/Admin/Settings` trong React Router — không có task nào khác phụ thuộc file này.

- [ ] **Step 1: Tạo modal dùng chung cho 3 loại danh sách (`HomepageItemModal.jsx`)**

```jsx
// frontend/src/pages/admin/HomepageItemModal.jsx
import React, { useState, useEffect } from 'react';

const SECTION_FIELDS = {
  promo_slide: { titleLabel: 'Tiêu đề slide', subtitleLabel: 'Badge (VD: 🔥 GIẢM 20%)', bodyLabel: 'Ghi chú ngắn', hasExtra: true },
  honor_student: { titleLabel: 'Tên học sinh', subtitleLabel: null, bodyLabel: 'Thành tích (mỗi dòng 1 ý)', hasExtra: false },
  testimonial: { titleLabel: 'Tên học viên (để trống dùng mặc định)', subtitleLabel: null, bodyLabel: 'Nội dung feedback', hasExtra: false }
};

export default function HomepageItemModal({ section, item, onClose, onSaved }) {
  const fields = SECTION_FIELDS[section];
  const isEdit = !!item;

  const [form, setForm] = useState({
    title: item?.Title || '',
    subtitle: item?.Subtitle || '',
    body: item?.Body || '',
    sortOrder: item?.SortOrder ?? 0,
    price: '',
    oldPrice: '',
    code: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item?.ExtraData) {
      try {
        const extra = JSON.parse(item.ExtraData);
        setForm((prev) => ({ ...prev, price: extra.price || '', oldPrice: extra.oldPrice || '', code: extra.code || '' }));
      } catch (e) {
        // giữ nguyên nếu JSON hỏng
      }
    }
  }, [item]);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const api = (await import('../../services/api')).default;
      const formData = new FormData();
      formData.append('section', section);
      formData.append('title', form.title);
      formData.append('subtitle', form.subtitle);
      formData.append('body', form.body);
      formData.append('sortOrder', form.sortOrder);
      if (fields.hasExtra) {
        formData.append('extraData', JSON.stringify({ price: form.price, oldPrice: form.oldPrice, code: form.code }));
      }
      if (imageFile) formData.append('image', imageFile);

      const url = isEdit ? `/Admin/Settings/Items/${item.Id}` : '/Admin/Settings/Items';
      const res = await api.post(url, formData, { headers: { 'Content-Type': undefined } });
      if (res.data?.success) {
        onSaved();
      } else {
        alert(res.data?.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-xl text-slate-900">{isEdit ? 'Sửa nội dung' : 'Thêm nội dung mới'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">{fields.titleLabel}</label>
            <input type="text" value={form.title} onChange={handleChange('title')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
          </div>
          {fields.subtitleLabel && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">{fields.subtitleLabel}</label>
              <input type="text" value={form.subtitle} onChange={handleChange('subtitle')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">{fields.bodyLabel}</label>
            <textarea rows={4} value={form.body} onChange={handleChange('body')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none resize-y" />
          </div>
          {fields.hasExtra && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Giá</label>
                <input type="text" value={form.price} onChange={handleChange('price')} placeholder="Giảm 20%" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Giá cũ</label>
                <input type="text" value={form.oldPrice} onChange={handleChange('oldPrice')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã giảm giá</label>
                <input type="text" value={form.code} onChange={handleChange('code')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Thứ tự hiển thị</label>
              <input type="number" value={form.sortOrder} onChange={handleChange('sortOrder')} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Ảnh</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-sm" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">Hủy</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Tạo trang chính `SiteSettingsPage.jsx`**

```jsx
// frontend/src/pages/admin/SiteSettingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import HomepageItemModal from './HomepageItemModal';

const SECTION_LABELS = {
  promo_slide: 'Slide khuyến mãi',
  honor_student: 'Bảng vàng thành tích',
  testimonial: 'Feedback học viên'
};

const inputClass = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-primary outline-none';
const labelClass = 'block text-sm font-bold text-slate-700 mb-1.5';

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState({});
  const [items, setItems] = useState([]);
  const [activeSection, setActiveSection] = useState('general');
  const [generalForm, setGeneralForm] = useState(null);
  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState(false);
  const [modalState, setModalState] = useState(null); // { section, item }

  const load = useCallback(async () => {
    const res = await api.get('/Admin/Settings');
    if (res.data?.success) {
      setSettings(res.data.data.settings);
      setItems(res.data.data.items);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!settings) return;
    const parseBullets = (key) => {
      try {
        return settings[key] ? JSON.parse(settings[key]).join('\n') : '';
      } catch (e) {
        return '';
      }
    };
    setGeneralForm({
      centerName: settings.center_name || '',
      contactAddress: settings.contact_address || '',
      contactPhone: settings.contact_phone || '',
      contactEmail: settings.contact_email || '',
      contactZaloUrl: settings.contact_zalo_url || '',
      socialFacebookUrl: settings.social_facebook_url || '',
      aboutTitle: settings.about_title || '',
      aboutBody: settings.about_body || '',
      examCountdownDate: settings.exam_countdown_date || '',
      spotlightTeacherName: settings.spotlight_teacher_name || '',
      spotlightHighlights: parseBullets('spotlight_highlights'),
      spotlightTeachingStyle: parseBullets('spotlight_teaching_style')
    });
  }, [settings]);

  const handleGeneralChange = (key) => (e) => setGeneralForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleFileChange = (key) => (e) => setFiles((prev) => ({ ...prev, [key]: e.target.files?.[0] || null }));

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(generalForm).forEach(([key, value]) => formData.append(key, value ?? ''));
      Object.entries(files).forEach(([key, file]) => { if (file) formData.append(key, file); });
      const res = await api.post('/Admin/Settings/General', formData, { headers: { 'Content-Type': undefined } });
      if (res.data?.success) {
        setFiles({});
        load();
        alert('Đã lưu cài đặt.');
      } else {
        alert(res.data?.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Xóa "${item.Title || 'mục này'}"?`)) return;
    const res = await api.post(`/Admin/Settings/Items/${item.Id}/Delete`, {});
    if (res.data?.success) load();
  };

  if (!generalForm) {
    return <div className="p-9 text-slate-500">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-9">
      <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">Cài đặt Website</h1>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {['general', 'homepage', 'lists'].map((key) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors ${activeSection === key ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {key === 'general' ? 'Liên hệ & Thương hiệu' : key === 'homepage' ? 'Nội dung trang chủ' : 'Danh sách marketing'}
          </button>
        ))}
      </div>

      {(activeSection === 'general' || activeSection === 'homepage') && (
        <form onSubmit={handleGeneralSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 max-w-2xl">
          {activeSection === 'general' && (
            <>
              <div>
                <label className={labelClass}>Tên trung tâm</label>
                <input type="text" value={generalForm.centerName} onChange={handleGeneralChange('centerName')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Logo</label>
                <input type="file" accept="image/*" onChange={handleFileChange('logo')} className="text-sm" />
                {settings.logo_url && <img src={settings.logo_url} alt="Logo hiện tại" className="h-12 mt-2 rounded" />}
              </div>
              <div>
                <label className={labelClass}>Địa chỉ</label>
                <input type="text" value={generalForm.contactAddress} onChange={handleGeneralChange('contactAddress')} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Hotline</label>
                  <input type="text" value={generalForm.contactPhone} onChange={handleGeneralChange('contactPhone')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={generalForm.contactEmail} onChange={handleGeneralChange('contactEmail')} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Link Zalo</label>
                  <input type="text" value={generalForm.contactZaloUrl} onChange={handleGeneralChange('contactZaloUrl')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Link Facebook</label>
                  <input type="text" value={generalForm.socialFacebookUrl} onChange={handleGeneralChange('socialFacebookUrl')} className={inputClass} />
                </div>
              </div>
            </>
          )}

          {activeSection === 'homepage' && (
            <>
              <div>
                <label className={labelClass}>Ảnh banner trang chủ</label>
                <input type="file" accept="image/*" onChange={handleFileChange('heroBanner')} className="text-sm" />
                {settings.hero_banner_url && <img src={settings.hero_banner_url} alt="Banner hiện tại" className="h-24 mt-2 rounded" />}
              </div>
              <div>
                <label className={labelClass}>Tiêu đề giới thiệu trung tâm</label>
                <input type="text" value={generalForm.aboutTitle} onChange={handleGeneralChange('aboutTitle')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nội dung giới thiệu (mỗi dòng 1 đoạn)</label>
                <textarea rows={4} value={generalForm.aboutBody} onChange={handleGeneralChange('aboutBody')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ảnh giới thiệu</label>
                <input type="file" accept="image/*" onChange={handleFileChange('aboutImage')} className="text-sm" />
                {settings.about_image_url && <img src={settings.about_image_url} alt="Ảnh giới thiệu hiện tại" className="h-24 mt-2 rounded" />}
              </div>
              <div>
                <label className={labelClass}>Thời điểm đếm ngược thi (VD: 2027-06-11T07:30:00)</label>
                <input type="text" value={generalForm.examCountdownDate} onChange={handleGeneralChange('examCountdownDate')} placeholder="2027-06-11T07:30:00" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tên giáo viên nổi bật</label>
                <input type="text" value={generalForm.spotlightTeacherName} onChange={handleGeneralChange('spotlightTeacherName')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ảnh giáo viên nổi bật</label>
                <input type="file" accept="image/*" onChange={handleFileChange('spotlightImage')} className="text-sm" />
                {settings.spotlight_image_url && <img src={settings.spotlight_image_url} alt="Ảnh giáo viên hiện tại" className="h-24 mt-2 rounded" />}
              </div>
              <div>
                <label className={labelClass}>Điểm nổi bật (mỗi dòng 1 ý)</label>
                <textarea rows={4} value={generalForm.spotlightHighlights} onChange={handleGeneralChange('spotlightHighlights')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phong cách giảng dạy (mỗi dòng 1 ý)</label>
                <textarea rows={4} value={generalForm.spotlightTeachingStyle} onChange={handleGeneralChange('spotlightTeachingStyle')} className={inputClass} />
              </div>
            </>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all">
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </form>
      )}

      {activeSection === 'lists' && (
        <div className="space-y-8 max-w-3xl">
          {Object.keys(SECTION_LABELS).map((section) => (
            <div key={section} className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-900">{SECTION_LABELS[section]}</h3>
                <button
                  onClick={() => setModalState({ section, item: null })}
                  className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm"
                >
                  + Thêm mới
                </button>
              </div>
              <div className="space-y-2">
                {items.filter((it) => it.Section === section).length === 0 && (
                  <p className="text-sm text-slate-400">Chưa có nội dung — trang chủ đang dùng nội dung mặc định.</p>
                )}
                {items.filter((it) => it.Section === section).map((it) => (
                  <div key={it.Id} className="flex items-center gap-3 border border-slate-100 rounded-xl p-3">
                    {it.ImageUrl && <img src={it.ImageUrl} alt={it.Title} className="w-12 h-12 object-cover rounded-lg" />}
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-slate-800">{it.Title || '(Không tiêu đề)'}</div>
                      <div className="text-xs text-slate-400">Thứ tự: {it.SortOrder}</div>
                    </div>
                    <button onClick={() => setModalState({ section, item: it })} className="text-primary text-sm font-semibold">Sửa</button>
                    <button onClick={() => handleDeleteItem(it)} className="text-red-500 text-sm font-semibold">Xóa</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalState && (
        <HomepageItemModal
          section={modalState.section}
          item={modalState.item}
          onClose={() => setModalState(null)}
          onSaved={() => { setModalState(null); load(); }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Thêm route trong `App.jsx`**

Thêm import (sau dòng `const CourseClassesPage = lazy(() => import('./pages/admin/CourseClassesPage'));`):

```js
const SiteSettingsPage = lazy(() => import('./pages/admin/SiteSettingsPage'));
```

Thêm route (sau dòng `<Route path="/Admin/Courses/:courseId/Classes" element={<CourseClassesPage />} />`):

```jsx
          <Route path="/Admin/Settings" element={<SiteSettingsPage />} />
```

- [ ] **Step 4: Wire link điều hướng trong `AdminLayout.jsx`**

Thay dòng đầu file:

```js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
```

bằng:

```js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
```

Thay nút:

```jsx
                  <button
                    onClick={() => alert('Tính năng cài đặt đang phát triển')}
                    className="w-full px-4 py-2.5 text-left text-base font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <span className="material-symbols-outlined text-[21px] text-slate-400">settings</span> Cài đặt tài khoản
                  </button>
```

bằng:

```jsx
                  <Link
                    to="/Admin/Settings"
                    className="w-full px-4 py-2.5 text-left text-base font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <span className="material-symbols-outlined text-[21px] text-slate-400">settings</span> Cài đặt Website
                  </Link>
```

- [ ] **Step 5: Kiểm thử thủ công**

`cd frontend && npm run dev` + `cd backend && npm run dev`, đăng nhập admin → menu góc phải → "Cài đặt Website" → điền form "Liên hệ & Thương hiệu" → Lưu → xác nhận alert thành công. Chuyển tab "Danh sách marketing" → "Feedback học viên" → "+ Thêm mới" → điền + Lưu → xác nhận mục mới hiện trong danh sách, có nút Sửa/Xóa hoạt động. Mở `/` và `/Home/Teachers` ở tab khác, xác nhận nội dung vừa sửa hiển thị đúng.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/admin/SiteSettingsPage.jsx frontend/src/pages/admin/HomepageItemModal.jsx frontend/src/App.jsx frontend/src/components/Layout/AdminLayout.jsx
git commit -m "feat: thêm trang admin Cài đặt Website (SiteSettingsPage)"
```

---

## Kiểm thử tổng thể sau khi hoàn thành toàn bộ plan

1. `cd backend && npm test` — toàn bộ test `formatSiteContent` pass.
2. Khởi động cả 2 server (`npm run dev` ở root, hoặc riêng từng thư mục), luồng thủ công:
   - Trang chủ + `/Home/Teachers` hiển thị đúng nội dung mặc định khi DB rỗng.
   - Đăng nhập admin, vào "Cài đặt Website", sửa từng khối, xác nhận trang công khai cập nhật theo.
   - Sửa 1 giáo viên, đổi ảnh đại diện, xác nhận `/Home/Teachers` và modal chi tiết giáo viên hiển thị ảnh mới.
   - Xóa hết `HomepageItem` vừa tạo qua admin, xác nhận trang chủ quay lại đúng nội dung mặc định ban đầu (không vỡ giao diện).
