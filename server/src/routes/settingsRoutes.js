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

/**
 * جلب إعدادات الموقع
 * مفتوح للموقع الرئيسي عشان يعرض:
 * - بيانات التواصل
 * - من نحن
 * - الشروط
 * - الأسئلة الشائعة
 * - بيانات حساب المشاهدة
 * - الأعداد المباشرة liveStats
 */
router.get('/', getSettings);

/**
 * حفظ إعدادات الموقع
 * محمي للأدمن فقط
 */
router.post('/', verifyAdmin, updateSettings);

module.exports = router;
