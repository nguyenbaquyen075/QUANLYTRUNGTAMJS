const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/auth');

router.get('/Auth/Login', authController.getLogin);
router.post('/Auth/Login', authController.postLogin);
router.get('/Auth/Register', authController.getRegister);
router.post('/Auth/Register', authController.postRegister);
router.get('/Auth/Logout', authController.logout);
router.get('/Auth/Checkout', requireAuth(), authController.getCheckout);
router.post('/Auth/Checkout', requireAuth(), authController.postCheckout);
router.get('/Auth/GatewayPayment', requireAuth(), authController.getGatewayPayment);
router.post('/Auth/ConfirmGatewayPayment', requireAuth(), authController.confirmGatewayPayment);

module.exports = router;
