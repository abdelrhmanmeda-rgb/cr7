const express = require('express');
const router = express.Router();

// استدعاء الأدوات المساعدة (Middlewares)
const upload = require('../middlewares/upload');
const verifyAdmin = require('../middlewares/verifyAdmin');

// استدعاء المتحكم (Controller) الذي يحتوي على منطق العمل
const { 
    addBot, 
    getBots, 
    deleteBot, 
    updateBot 
} = require('../controllers/botsController');

// ==========================================
// 🤖 مسارات إدارة البوتات
// ==========================================

/**
 * 1. مسار جلب جميع البوتات (GET)
 */
router.get('/', getBots);

/**
 * 2. مسار إضافة بوت جديد (POST)
 */
router.post('/add', verifyAdmin, upload.single('image'), addBot);

/**
 * 3. مسار تعديل بوت موجود (PUT)
 * نستخدم upload.single('image') لأن الأدمن قد يرفع صورة جديدة، أو يتركها فارغة
 */
router.put('/:id', verifyAdmin, upload.single('image'), updateBot);

/**
 * 4. مسار حذف بوت معين (DELETE)
 */
router.delete('/:id', verifyAdmin, deleteBot);

module.exports = router;