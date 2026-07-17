const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const compression = require('compression');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('================================================================');
  console.error('❌ ERROR: DATABASE_URL environment variable is missing!');
  console.error('👉 Please configure DATABASE_URL in your Render Web Service Environment settings.');
  console.error('================================================================');
  process.exit(1);
}

const db = require('./models');
const { populateLocals } = require('./middlewares/auth');
const { initSignalRCompat, negotiateSignalR } = require('./sockets/signalRCompat');

const cors = require('cors');

const expressLayouts = require('express-ejs-layouts');

const app = express();
const server = http.createServer(app);

// Port
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend clients
app.use(cors({
  origin: true, // Cho phép phản hồi động theo origin yêu cầu
  credentials: true, // Cho phép truyền cookie qua CORS
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Set EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express EJS Layouts
app.use(expressLayouts);
app.set('layout', 'layout'); // Use views/layout.ejs as default layout
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Gzip/Brotli Compression — giảm ~70% bandwidth cho text responses
app.use(compression({
  level: 6,        // Mức nén tốt nhất (1-9), 6 là cân bằng tốc độ/dung lượng
  threshold: 1024  // Chỉ nén nếu response > 1KB
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session Middleware — dùng PostgreSQL store thay vì RAM
const sessionStore = new pgSession({
  conString: process.env.DATABASE_URL,
  tableName: 'session',
  createTableIfMissing: true, // Tự động tạo bảng nếu chưa có
  ssl: { require: true, rejectUnauthorized: false }
});

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'quanlytrungtam_secret_key_123',
  resave: false,
  saveUninitialized: false, // false = không tạo session thừa cho guest
  cookie: {
    maxAge: 60 * 60 * 1000, // 60 minutes
    httpOnly: true,
    secure: false, // Set to true if using HTTPS in production
    sameSite: 'lax' // Hỗ trợ chia sẻ session qua các tab cùng domain
  }
}));

// Serve Static Assets từ public của backend (nếu có lưu trữ file tải lên)
const staticOptions = {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : '0',
  etag: true,
  lastModified: true
};
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), staticOptions));
app.use(express.static(path.join(__dirname, '../public'), staticOptions));
app.use(express.static(path.join(__dirname, '../../frontend/dist'), staticOptions));

// Populate local variables for EJS templates (sessions, flash messages)
app.use(populateLocals);

// Middleware to adapt EJS rendering to REST API responses for React Client
app.use((req, res, next) => {
  const isJson = req.xhr ||
                 req.path.startsWith('/api/') ||
                 (req.headers.accept && req.headers.accept.includes('application/json'));

  if (isJson) {
    req.isJsonAPI = true;
  }

  const originalRender = res.render;
  res.render = function (view, options, callback) {
    if (isJson) {
      const data = Object.assign({}, res.locals, options);
      // Clean up circular or internal options that shouldn't be serialized
      delete data.settings;
      delete data._locals;
      delete data.cache;
      return res.json({
        success: true,
        type: 'render',
        view: view,
        data: data
      });
    }
    return originalRender.call(this, view, options, callback);
  };

  const originalRedirect = res.redirect;
  res.redirect = function (status, url) {
    let redirectUrl = url;
    let redirectStatus = status;
    if (typeof status === 'string') {
      redirectUrl = status;
      redirectStatus = 302;
    }
    if (isJson) {
      return res.json({
        success: true,
        type: 'redirect',
        url: redirectUrl,
        status: redirectStatus
      });
    }
    return originalRedirect.call(this, redirectStatus, redirectUrl);
  };

  next();
});

// SignalR Compatibility Negotiate Route
app.post('/notificationHub/negotiate', negotiateSignalR);

// Temporary Database Diagnostic Route
app.get('/test-db', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL || '';
    const parsedUrl = dbUrl.split('@')[1] || 'no-host-found';
    const usersCount = await db.User.count();
    const users = await db.User.findAll({ limit: 15 });
    const usersList = users.map(u => `${u.FullName} (${u.Email}) - Role: ${db.User.RoleRevMap[u.Role] || u.Role}`).join('<br>');
    res.send(`
      <h1>Database Diagnosis Page</h1>
      <p><strong>DB Connection Host:</strong> ${parsedUrl}</p>
      <p><strong>Total Users Count:</strong> ${usersCount}</p>
      <p><strong>List of Users (Limit 15):</strong></p>
      <div>${usersList}</div>
    `);
  } catch (err) {
    res.status(500).send(`<h1>Error</h1><pre>${err.stack}</pre>`);
  }
});

// Serve React SPA index.html for all browser page requests (accepts HTML and not API/uploads/JSON)
app.get('*', (req, res, next) => {
  const isBackendRoute = req.path.startsWith('/Student/') ||
                         req.path.startsWith('/Teacher/') ||
                         req.path.startsWith('/Parent/') ||
                         req.path.startsWith('/Admin/') ||
                         req.path.startsWith('/Notification') ||
                         req.path === '/Auth/Logout' ||
                         req.path.startsWith('/Auth/Checkout') ||
                         req.path.startsWith('/Auth/GatewayPayment') ||
                         req.path.startsWith('/Auth/ConfirmGatewayPayment') ||
                         req.path.startsWith('/test-db');

  const isHtml = req.accepts('html') &&
                 !req.xhr &&
                 !isBackendRoute &&
                 !req.path.startsWith('/api/') &&
                 !req.path.startsWith('/uploads/') &&
                 !(req.headers.accept && req.headers.accept.includes('application/json'));

  if (isHtml) {
    const indexPath = path.join(__dirname, '../../frontend/dist/index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// Routes / Controllers
app.use('/', require('./routes/homeRoutes'));
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/adminRoutes'));
app.use('/', require('./routes/teacherRoutes'));
app.use('/', require('./routes/studentRoutes'));
app.use('/', require('./routes/parentRoutes'));
app.use('/api/v1/ai', require('./routes/aiRoutes')); // namespace AI under /api/v1/ai
app.use('/', require('./routes/notificationRoutes'));
app.use('/', require('./routes/profileRoutes'));

// Error page handler for 404
app.use((req, res, next) => {
  res.status(404).render('error', { message: 'Không tìm thấy trang yêu cầu.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).render('error', { message: 'Đã xảy ra lỗi máy chủ nội bộ.' });
});

// Initialize WebSocket SignalR compatibility layer
initSignalRCompat(server);

// Export app, server, and PORT for server.js
module.exports = { app, server, PORT };
