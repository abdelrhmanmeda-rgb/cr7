const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');

const { uploadResult, getResults, deleteResult } = require('../controllers/resultsController');

// 1. مسار الرفع (POST)
router.post('/upload', upload.single('media'), uploadResult);

// 2. مسار جلب البيانات (GET)
router.get('/', getResults); 

// 3. مسار حذف النتيجة (DELETE)
router.delete('/:id', deleteResult);

module.exports = router;