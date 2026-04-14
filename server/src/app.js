const express = require('express');
const app = express();

try {
  const express = require('express');

const cors = require('cors');

require('dotenv').config();



// التأكد من عمل الاتصالات بفايربيز وكلاوديناري

require('./config/firebase');

require('./config/cloudinary');



const app = express();



// مسار الاختبار (لكي نتأكد أن السيرفر حي يرزق!)

app.get('/', (req, res) => {

  res.status(200).send('🔥 CR7 Backend Server is working 100% on Vercel!');

});



// إعدادات الـ Middlewares

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));



// ==========================================

// 🚀 ربط المسارات بالسيرفر

// ==========================================

const resultsRoutes = require('./routes/resultsRoutes');

const botsRoutes = require('./routes/botsRoutes'); 

const subscriptionsRoutes = require('./routes/subscriptionsRoutes'); 

const settingsRoutes = require('./routes/settingsRoutes');

const statisticsRoutes = require('./routes/statisticsRoutes'); // ✨ مسار الإحصائيات

const blogRoutes = require('./routes/blogRoutes'); // ✨ مسار المدونة (مهم جداً للايكات والتعليقات)



app.use('/api/results', resultsRoutes);

app.use('/api/bots', botsRoutes); 

app.use('/api/subscriptions', subscriptionsRoutes); 

app.use('/api/settings', settingsRoutes);

app.use('/api/statistics', statisticsRoutes);

app.use('/api/blog', blogRoutes); // ✨ تفعيل مسار المدونة في السيرفر

// ==========================================



// مسار تجريبي للتأكد من عمل السيرفر

app.get('/', (req, res) => {

  res.json({ 

    success: true, 

    message: '🚀 CR7 Bot Backend is running smoothly!' 

  });

});



// آخر أسطر في ملف app.js لديك ستكون هكذا:

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(`Server running on http://localhost:${PORT}`);

});



// 👉 أضف هذا السطر السحري هنا لكي يقرأه Vercel:

module.exports = app;

} catch (error) {
  // ==========================================
  // 🚨 إذا كان هناك أي خطأ في ملفاتك، هذا الكود سيصطاده ويعرضه لك!
  // ==========================================
  app.get('*', (req, res) => {
    res.status(500).send(`
      <div style="font-family: sans-serif; padding: 20px;" dir="rtl">
        <h1 style="color: red;">🚨 تم اصطياد الخطأ!</h1>
        <h2>المشكلة في الكود الخاص بك هي:</h2>
        <p style="background: #f4f4f4; padding: 15px; font-size: 18px; direction: ltr; text-align: left; border: 1px solid #ccc;">
          ${error.message}
        </p>
        <h3>نصائح للحل:</h3>
        <ul>
          <li>إذا كانت الرسالة <b>Cannot find module</b>: تأكد أن اسم الملف مطابق 100% (الحروف الكبيرة والصغيرة).</li>
          <li>تأكد أنك قمت بتثبيت المكتبة المذكورة.</li>
        </ul>
      </div>
    `);
  });
}

// السطر الأهم لـ Vercel
module.exports = app;