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
const verifyAdmin = require('../middlewares/verifyAdmin'); // نظام حماية الأدمن

const settingsController = require('../controllers/settingsController');

// حماية المسارات (Fallback logic) لمنع تعطل السيرفر
const getSettings = settingsController.getSettings || ((req, res) => res.status(500).json({success: false, message: "Missing getSettings"}));
const updateSettings = settingsController.updateSettings || ((req, res) => res.status(500).json({success: false, message: "Missing updateSettings"}));

// مسار جلب الإعدادات (مفتوح לلجميع ليظهر في الموقع الرئيسي)
router.get('/', getSettings);

// مسار حفظ الإعدادات (للأدمن فقط عبر لوحة التحكم)
router.post('/', verifyAdmin, updateSettings);

module.exports = router;