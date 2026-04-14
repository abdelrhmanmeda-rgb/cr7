const app = express();

// 👇 هذا هو الكود السحري الذي سيسمح للوحة التحكم والموقع بالاتصال بالسيرفر
app.use(cors({
  origin: true, // يسمح باستقبال الطلبات من أي رابط (لوحة التحكم والموقع)
  credentials: true, // ضروري جداً إذا كنت تستخدم نظام تسجيل دخول (Tokens/Cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json()); // تأكد أن هذا السطر موجود أيضاً

// مساراتك هنا
// app.use('/api/posts', postRoutes);
const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin'); // ميدل وير الحماية

// استدعاء الكنترولر بالكامل ككائن (Object)
const subController = require('../controllers/subscriptionsController');

// 🚀 [نظام الحماية لمنع توقف السيرفر]
// إذا نسيت تصدير دالة من الكنترولر، لن يتوقف السيرفر (لن يظهر خطأ TypeError)، 
// بل سيعرض رسالة خطأ واضحة في المتصفح توضح الدالة المفقودة.
const getSubscriptions = subController.getSubscriptions || ((req, res) => res.status(500).json({success: false, message: "الدالة getSubscriptions غير مُصدرة في الكنترولر"}));
const addSubscription = subController.addSubscription || ((req, res) => res.status(500).json({success: false, message: "الدالة addSubscription غير مُصدرة في الكنترولر"}));
const updateSubscription = subController.updateSubscription || ((req, res) => res.status(500).json({success: false, message: "الدالة updateSubscription غير مُصدرة في الكنترولر"}));
const deleteSubscription = subController.deleteSubscription || ((req, res) => res.status(500).json({success: false, message: "الدالة deleteSubscription غير مُصدرة في الكنترولر"}));

// ==========================================
// المسارات (Routes)
// ==========================================
router.get('/', getSubscriptions); // جلب البيانات (مفتوح للزوار)
router.post('/add', verifyAdmin, addSubscription); // إضافة (للأدمن فقط)
router.put('/:id', verifyAdmin, updateSubscription); // تعديل (للأدمن فقط)
router.delete('/:id', verifyAdmin, deleteSubscription); // حذف (للأدمن فقط)

module.exports = router;