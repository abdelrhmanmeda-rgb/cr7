const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');
const verifyAdmin = require('../middlewares/verifyAdmin');

const {
  uploadTestimonial,
  getTestimonials,
  updateTestimonial,
  deleteTestimonial
} = require('../controllers/testimonialsController');

// جلب آراء العملاء للموقع
router.get('/', getTestimonials);

// رفع Screenshot جديد من الداشبورد
router.post('/upload', verifyAdmin, upload.single('image'), uploadTestimonial);

// تعديل بيانات الرأي
router.put('/:id', verifyAdmin, updateTestimonial);

// حذف الرأي
router.delete('/:id', verifyAdmin, deleteTestimonial);

module.exports = router;
