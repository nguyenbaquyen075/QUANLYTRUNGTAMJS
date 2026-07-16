const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/chat/message', aiController.chatMessage);
router.post('/payments/webhook', aiController.paymentsWebhook);

module.exports = router;
