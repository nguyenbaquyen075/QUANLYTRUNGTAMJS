const express = require('express');
const router = express.Router();
const c = require('../controllers/bookController');
const { requireAuth } = require('../middlewares/auth');

// Công khai
router.get('/api/Books', c.listBooks);
router.post('/api/BookOrders', c.createOrder);
router.get('/api/BookOrders/:id', c.getOrder);
router.post('/api/BookOrders/:id/ReportTransfer', c.reportTransfer);

// Admin / nhân viên
const staff = requireAuth(['ADMIN', 'STAFF']);
const withCover = (req, res, next) => c.upload(req, res, (err) => (err ? res.status(400).json({ success: false, message: err.message }) : next()));
router.get('/api/Admin/Books', staff, c.adminListBooks);
router.post('/api/Admin/Books', staff, withCover, c.adminCreateBook);
router.post('/api/Admin/Books/:id', staff, withCover, c.adminUpdateBook);
router.post('/api/Admin/Books/:id/Delete', staff, c.adminDeleteBook);
router.get('/api/Admin/BookOrders', staff, c.adminListOrders);
router.post('/api/Admin/BookOrders/:id/Confirm', staff, c.adminConfirm);
router.post('/api/Admin/BookOrders/:id/Ship', staff, c.adminShip);
router.post('/api/Admin/BookOrders/:id/Cancel', staff, c.adminCancel);

module.exports = router;
