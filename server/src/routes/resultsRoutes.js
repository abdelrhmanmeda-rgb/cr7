const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');

// تأكد من إضافة deleteResult هنا بجانب باقي الدوال
const { uploadResult, getResults, deleteResult } = require('../controllers/resultsController');

// 1. مسار الرفع (POST)
// الرابط: http://localhost:5000/api/results/upload
router.post('/upload', upload.single('media'), uploadResult);

// 2. مسار جلب البيانات (GET) 🔥 هـذا هو السطر الذي كان ينقصك
// الرابط: http://localhost:5000/api/results
router.get('/', getResults); 

// 3. مسار حذف النتيجة (DELETE) - ✨ إضافة جديدة ✨
// الرابط: http://localhost:5000/api/results/:id
router.delete('/:id', deleteResult);

module.exports = router;