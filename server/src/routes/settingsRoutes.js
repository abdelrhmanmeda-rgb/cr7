const express = require('express');
const router = express.Router();

const verifyAdmin = require('../middlewares/verifyAdmin');
const settingsController = require('../controllers/settingsController');

// ==========================================
// ⚙️ مسارات إدارة إعدادات الموقع
// ==========================================

const getSettings = settingsController.getSettings || ((req, res) =>
  res.status(500).json({ success: false, message: "Missing getSettings" })
);

const updateSettings = settingsController.updateSettings || ((req, res) =>
  res.status(500).json({ success: false, message: "Missing updateSettings" })
);

router.get('/', getSettings);

router.post('/', verifyAdmin, updateSettings);

module.exports = router;
