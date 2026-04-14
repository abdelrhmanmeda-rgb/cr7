const express = require('express');
const router = express.Router();

// استدعاء الأدوات المساعدة (Middlewares)
const upload = require('../middlewares/upload');
const verifyAdmin = require('../middlewares/verifyAdmin');

// استدعاء المتحكم (Controller) الذي يحتوي على منطق العمل
// أضفنا دالة updateBot هنا
const { addBot, getBots, deleteBot, updateBot } = require('../controllers/botsController');

/**
 * 1. مسار جلب جميع البوتات (GET)
 * الرابط: http://localhost:5000/api/bots
 */
router.get('/', getBots);

/**
 * 2. مسار إضافة بوت جديد (POST)
 * الرابط: http://localhost:5000/api/bots/add
 */
router.post('/add', verifyAdmin, upload.single('image'), addBot);

/**
 * 3. مسار تعديل بوت موجود (PUT) - الجديد
 * الرابط: http://localhost:5000/api/bots/:id
 * نستخدم upload.single('image') لأن الأدمن قد يرفع صورة جديدة، أو قد يتركها فارغة
 */
router.put('/:id', verifyAdmin, upload.single('image'), updateBot);

/**
 * 4. مسار حذف بوت معين (DELETE)
 * الرابط: http://localhost:5000/api/bots/:id
 */
router.delete('/:id', verifyAdmin, deleteBot);

module.exports = router;