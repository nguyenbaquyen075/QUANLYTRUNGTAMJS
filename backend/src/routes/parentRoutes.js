const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { requireAuth } = require('../middlewares/auth');

router.get('/Parent/Dashboard', requireAuth(['PARENT']), parentController.getDashboard);
router.get('/Parent/PayInvoice/:id', requireAuth(['PARENT']), parentController.getPayInvoice);

module.exports = router;
