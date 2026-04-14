const express = require('express');
const router = express.Router();

// استدعاء الأدوات المساعدة (Middlewares)
const upload = require('../middlewares/upload');
const verifyAdmin = require('../middlewares/verifyAdmin'); // ✨ إضافة الحماية

// استدعاء المتحكم (Controller)
const { 
    uploadResult, 
    getResults, 
    deleteResult 
} = require('../controllers/resultsController');

// ==========================================
// 🏆 مسارات إدارة النتائج (لعبة عجنك وخبزك)
// ==========================================

/**
 * 1. مسار الرفع (POST)
 * (مفتوح بدون verifyAdmin لأن اللاعبين هم من يرفعون النتائج)
 */
router.post('/upload', upload.single('media'), uploadResult);

/**
 * 2. مسار جلب البيانات (GET)
 */
router.get('/', getResults); 

/**
 * 3. مسار حذف النتيجة (DELETE)
 * (محمي بـ verifyAdmin لكي لا يحذف النتائج سوى الأدمن من لوحة التحكم)
 */
router.delete('/:id', verifyAdmin, deleteResult);

module.exports = router;