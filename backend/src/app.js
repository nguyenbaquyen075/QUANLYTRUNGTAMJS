const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const compression = require('compression');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();

const db = require('./models');
const { populateLocals } = require('./middlewares/auth');
const { initSignalRCompat, negotiateSignalR } = require('./sockets/signalRCompat');

const cors = require('cors');

const expressLayouts = require('express-ejs-layouts');

const app = express();
const server = http.createServer(app);

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.path}`);
    next();
  });
}

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

// Express Session Middleware
const isProd = process.env.NODE_ENV === 'production';
// Postgres-backed session store in production; MemoryStore leaks and drops
// every session on restart. Falls back to MemoryStore only for local sqlite dev.
const sessionStore = process.env.DATABASE_URL
  ? new pgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'session',
      createTableIfMissing: true
    })
  : undefined;

const sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'quanlytrungtam_secret_key_123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  }
});
app.use(sessionMiddleware);



// Serve Static Assets từ public của backend & frontend dist
const staticOptions = {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.includes('/dist/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
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

// System Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    dbDialectEnv: process.env.DB_DIALECT || 'not-set',
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    sequelizeDialect: db.sequelize.options.dialect
  });
});

// Temporary Database Diagnostic Route — dev only, it dumps real user emails.
app.get('/test-db', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).send('Not found');
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

// Serve React SPA index.html for any browser page request that no backend route matched
// (must come after all real routes above, so backend EJS pages always take priority)
// Resolved once at boot instead of an fs.existsSync() on every page request.
const spaIndexCandidate = path.join(__dirname, '../../frontend/dist/index.html');
const spaIndexPath = fs.existsSync(spaIndexCandidate) ? spaIndexCandidate : null;

app.get('*', (req, res, next) => {
  const isHtml = req.accepts('html') &&
    !req.xhr &&
    !req.path.startsWith('/api/') &&
    !req.path.startsWith('/uploads/') &&
    !(req.headers.accept && req.headers.accept.includes('application/json'));

  if (isHtml && spaIndexPath) {
    return res.sendFile(spaIndexPath);
  }
  next();
});

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
initSignalRCompat(server, sessionMiddleware);

// Export app, server, and PORT for server.js
module.exports = { app, server, PORT };
