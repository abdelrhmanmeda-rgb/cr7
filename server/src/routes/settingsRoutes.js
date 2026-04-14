const express = require('express');
const router = express.Router();

// استدعاء الأدوات المساعدة
const verifyAdmin = require('../middlewares/verifyAdmin'); // نظام حماية الأدمن

// استدعاء المتحكم
const settingsController = require('../controllers/settingsController');

// ==========================================
// ⚙️ مسارات إدارة إعدادات الموقع
// ==========================================

// حماية المسارات (Fallback logic) لمنع تعطل السيرفر
const getSettings = settingsController.getSettings || ((req, res) => res.status(500).json({success: false, message: "Missing getSettings"}));
const updateSettings = settingsController.updateSettings || ((req, res) => res.status(500).json({success: false, message: "Missing updateSettings"}));

/**
 * 1. مسار جلب الإعدادات (GET)
 * (مفتوح للجميع ليظهر في الموقع الرئيسي)
 */
router.get('/', getSettings);

/**
 * 2. مسار حفظ/تعديل الإعدادات (POST)
 * (محمي للأدمن فقط عبر لوحة التحكم)
 */
router.post('/', verifyAdmin, updateSettings);

module.exports = router;