const express = require('express');
const cors = require('cors');
require('dotenv').config();

// التأكد من عمل الاتصالات بفايربيز وكلاوديناري
require('./config/firebase');
require('./config/cloudinary');

const app = express();

// ==========================================
// 🚨 إعدادات CORS
// ==========================================
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// ==========================================
// 🔥 حل مشكلة التعليق (Timeout)
// ==========================================
app.use((req, res, next) => {
  req.setTimeout(300000);   // 5 دقايق
  res.setTimeout(300000);   // 5 دقايق
  next();
});

// ==========================================
// 🔥 زيادة حجم الطلبات (مهم للصور)
// ==========================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==========================================
// 🧪 مسار اختبار
// ==========================================
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: '🔥 CR7 Backend Server is working 100% on Vercel!' 
  });
});

// ==========================================
// 🚀 ربط المسارات
// ==========================================
const resultsRoutes = require('./routes/resultsRoutes');
const botsRoutes = require('./routes/botsRoutes'); 
const subscriptionsRoutes = require('./routes/subscriptionsRoutes'); 
const settingsRoutes = require('./routes/settingsRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes'); 
const blogRoutes = require('./routes/blogRoutes'); 
const testimonialsRoutes = require('./routes/testimonialsRoutes');

app.use('/api/results', resultsRoutes);
app.use('/api/bots', botsRoutes); 
app.use('/api/subscriptions', subscriptionsRoutes); 
app.use('/api/settings', settingsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/blog', blogRoutes); 
app.use('/api/testimonials', testimonialsRoutes);

// ==========================================
// ❌ Global Error Handler (مهم)
// ==========================================
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err);

  res.status(500).json({
    success: false,
    message: err.message || 'حدث خطأ في السيرفر'
  });
});

// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 👉 لـ Vercel
module.exports = app;
