const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/auth');

router.get('/Auth/Login', authController.getLogin);
router.get('/auth/login', authController.getLogin);
router.post('/Auth/Login', authController.postLogin);
router.post('/auth/login', authController.postLogin);
router.get('/Auth/Register', authController.getRegister);
router.get('/auth/register', authController.getRegister);
router.post('/Auth/Register', authController.postRegister);
router.post('/auth/register', authController.postRegister);
router.get('/Auth/Logout', authController.logout);
router.get('/Auth/AccessDenied', (req, res) => {
  res.status(403).render('error', { message: 'Bạn không có quyền truy cập trang này.' });
});
router.get('/Auth/Checkout', authController.getCheckout);
router.post('/Auth/Checkout', authController.postCheckout);
router.get('/Auth/GatewayPayment', authController.getGatewayPayment);
router.post('/Auth/ConfirmGatewayPayment', authController.confirmGatewayPayment);

module.exports = router;
