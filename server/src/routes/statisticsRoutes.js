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
const verifyAdmin = require('../middlewares/verifyAdmin');
const { trackAction, getStatistics, resetStatistics } = require('../controllers/statisticsController');

// مسار عام لتسجيل النقرات والزيارات (بدون حماية ليتمكن زوار الموقع من الضغط)
router.post('/track', trackAction);

// مسار محمي لجلب الإحصائيات (للأدمن فقط)
router.get('/', verifyAdmin, getStatistics);

// مسار محمي لتصفير الإحصائيات (للأدمن فقط) - ✨ المسار الجديد ✨
router.post('/reset', verifyAdmin, resetStatistics);

module.exports = router;