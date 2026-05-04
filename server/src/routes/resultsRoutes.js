const express = require('express');
const router = express.Router();

// استدعاء الأدوات المساعدة (Middlewares)
const upload = require('../middlewares/upload');
const verifyAdmin = require('../middlewares/verifyAdmin');

// استدعاء المتحكم (Controller)
const {
  uploadResult,
  getResults,
  deleteResult
} = require('../controllers/resultsController');

// ==========================================
// 🏆 مسارات إدارة النتائج
// ==========================================

const handleUploadError = (req, res, next) => {
  upload.single('media')(req, res, function (err) {
    if (err) {
      console.error('❌ خطأ Multer أثناء رفع النتيجة:', err);

      return res.status(400).json({
        success: false,
        message: err.message || 'حدث خطأ أثناء تجهيز الملف للرفع'
      });
    }

    next();
  });
};

/**
 * 1. مسار الرفع (POST)
 * محمي للأدمن فقط لأن الرفع يتم من لوحة التحكم
 */
router.post('/upload', verifyAdmin, handleUploadError, uploadResult);

/**
 * 2. مسار جلب البيانات (GET)
 */
router.get('/', getResults);

/**
 * 3. مسار حذف النتيجة (DELETE)
 * محمي للأدمن فقط
 */
router.delete('/:id', verifyAdmin, deleteResult);

module.exports = router;
