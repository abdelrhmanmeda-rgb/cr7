const express = require('express');
const router = express.Router();

const verifyAdmin = require('../middlewares/verifyAdmin');
const upload = require('../middlewares/upload');
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

const uploadWelcomeAudio = settingsController.uploadWelcomeAudio || ((req, res) =>
  res.status(500).json({ success: false, message: "Missing uploadWelcomeAudio" })
);

/**
 * جلب إعدادات الموقع
 * مفتوح للموقع الرئيسي عشان يعرض:
 * - بيانات التواصل
 * - من نحن
 * - الشروط
 * - الأسئلة الشائعة
 * - بيانات حساب المشاهدة
 * - الأعداد المباشرة liveStats
 * - الإشعارات الذكية smartNotifications
 * - صوت الترحيب welcomeAudio
 */
router.get('/', getSettings);

/**
 * حفظ إعدادات الموقع
 * محمي للأدمن فقط
 */
router.post('/', verifyAdmin, updateSettings);

/**
 * رفع ملف صوت الترحيب
 * محمي للأدمن فقط
 */
router.post('/welcome-audio/upload', verifyAdmin, upload.single('audio'), uploadWelcomeAudio);

module.exports = router;
