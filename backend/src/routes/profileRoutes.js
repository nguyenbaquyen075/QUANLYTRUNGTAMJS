const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middlewares/auth');

router.get('/Profile/GetDetails', profileController.getDetails);
router.post('/Profile/UpdateDetails', requireAuth(), (req, res, next) => {
  profileController.avatarUpload.single('avatarFile')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.json({ success: false, message: 'Lỗi tải ảnh: ' + err.message });
    }
    next();
  });
}, profileController.updateDetails);
router.post('/Profile/ChangePassword', requireAuth(), profileController.avatarUpload.none(), profileController.changePassword);

module.exports = router;
