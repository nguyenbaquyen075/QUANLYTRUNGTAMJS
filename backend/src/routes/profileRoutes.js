const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middlewares/auth');

router.get('/Profile/GetDetails', profileController.getDetails);
router.post('/Profile/UpdateDetails', requireAuth(), profileController.avatarUpload.single('avatarFile'), profileController.updateDetails);
router.post('/Profile/ChangePassword', requireAuth(), profileController.avatarUpload.none(), profileController.changePassword);

module.exports = router;
