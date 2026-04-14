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