const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');
const verifyAdmin = require('../middlewares/verifyAdmin');

const {
  uploadResult,
  getResults,
  deleteResult
} = require('../controllers/resultsController');

// ==========================================
// 🛡️ معالجة أخطاء Multer
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

// ==========================================
// 📥 جلب النتائج
// ==========================================
router.get('/', getResults);

// ==========================================
// 🚀 رفع نتيجة جديدة
// ==========================================
router.post('/upload', verifyAdmin, handleUploadError, uploadResult);

// ==========================================
// 🗑️ حذف نتيجة
// ==========================================
router.delete('/:id', verifyAdmin, deleteResult);

module.exports = router;
