const express = require('express');
const router = express.Router();

const verifyAdmin = require('../middlewares/verifyAdmin');

const {
  saveResultFromUrl,
  getResults,
  deleteResult
} = require('../controllers/resultsController');

// ==========================================
// 📥 جلب النتائج
// ==========================================
router.get('/', getResults);

// ==========================================
// 🚀 حفظ نتيجة (Direct Upload)
// ==========================================
router.post('/save', verifyAdmin, saveResultFromUrl);

// ==========================================
// 🗑️ حذف نتيجة
// ==========================================
router.delete('/:id', verifyAdmin, deleteResult);

module.exports = router;
