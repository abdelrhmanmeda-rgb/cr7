const express = require('express');
const router = express.Router();

// استدعاء الميدل وير
const verifyAdmin = require('../middlewares/verifyAdmin'); 

// استدعاء الكنترولر 
const subController = require('../controllers/subscriptionsController');

// ==========================================
// 🚀 [نظام الحماية لمنع توقف السيرفر]
// ==========================================
const getSubscriptions = subController.getSubscriptions || ((req, res) => res.status(500).json({success: false, message: "الدالة getSubscriptions غير مُصدرة"}));
const addSubscription = subController.addSubscription || ((req, res) => res.status(500).json({success: false, message: "الدالة addSubscription غير مُصدرة"}));
const updateSubscription = subController.updateSubscription || ((req, res) => res.status(500).json({success: false, message: "الدالة updateSubscription غير مُصدرة"}));
const deleteSubscription = subController.deleteSubscription || ((req, res) => res.status(500).json({success: false, message: "الدالة deleteSubscription غير مُصدرة"}));

// ==========================================
// 📅 مسارات المشتركين
// ==========================================

router.get('/', getSubscriptions); // جلب البيانات (مفتوح للزوار)
router.post('/add', verifyAdmin, addSubscription); // إضافة (للأدمن فقط)
router.put('/:id', verifyAdmin, updateSubscription); // تعديل (للأدمن فقط)
router.delete('/:id', verifyAdmin, deleteSubscription); // حذف (للأدمن فقط)

module.exports = router;