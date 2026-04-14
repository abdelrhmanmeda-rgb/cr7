const express = require('express');
const router = express.Router();

// استدعاء الحماية
const verifyAdmin = require('../middlewares/verifyAdmin');

// استدعاء الدوال من الكنترولر
const { 
    trackAction, 
    getStatistics, 
    resetStatistics 
} = require('../controllers/statisticsController');

// ==========================================
// 📊 مسارات الإحصائيات (تتبع الزيارات والنقرات)
// ==========================================

/**
 * 1. مسار تسجيل الأفعال (POST)
 * (مفتوح للجميع ليتمكن المتصفح من تسجيل الزيارات والنقرات تلقائياً)
 */
router.post('/track', trackAction);

/**
 * 2. مسار جلب الإحصائيات (GET)
 * (محمي للأدمن فقط ليراها في لوحة التحكم)
 */
router.get('/', verifyAdmin, getStatistics);

/**
 * 3. مسار تصفير الإحصائيات (POST)
 * (محمي للأدمن فقط)
 */
router.post('/reset', verifyAdmin, resetStatistics);

module.exports = router;