const express = require('express');
const http = require('http');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const db = require('./models');
const { populateLocals } = require('./middleware/auth');
const { initSignalRCompat, negotiateSignalR } = require('./sockets/signalRCompat');

const app = express();
const server = http.createServer(app);

// Port
const PORT = process.env.PORT || 3000;

// Set EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express EJS Layouts
app.use(expressLayouts);
app.set('layout', 'layout'); // Use views/layout.ejs as default layout
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'quanlytrungtam_secret_key_123',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 60 * 1000, // 60 minutes
    httpOnly: true,
    secure: false // Set to true if using HTTPS in production
  }
}));

// Serve Static Assets from public
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Populate local variables for EJS templates (sessions, flash messages)
app.use(populateLocals);

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

// Routes / Controllers
app.use('/', require('./controllers/homeController'));
app.use('/', require('./controllers/authController'));
app.use('/', require('./controllers/adminController'));
app.use('/', require('./controllers/teacherController'));
app.use('/', require('./controllers/studentController'));
app.use('/', require('./controllers/parentController'));
app.use('/api/v1/ai', require('./controllers/aiController')); // namespace AI under /api/v1/ai
app.use('/', require('./controllers/notificationController'));
app.use('/', require('./controllers/profileController'));

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

// Connect to Database and start server
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
