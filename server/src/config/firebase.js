const admin = require('firebase-admin');
require('dotenv').config();

try {
  // معالجة مفتاح Vercel المعقد
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '') 
    : undefined;

  // فحص هل المفاتيح موجودة فعلاً أم لا؟
  if (!process.env.FIREBASE_PROJECT_ID || !privateKey) {
    console.error("🚨 [تنبيه خطير]: مفاتيح الفايربيز غير موجودة في إعدادات Vercel (Environment Variables)!");
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey
  };

  // تهيئة الفايربيز
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ تم الاتصال بقاعدة بيانات الفايربيز بنجاح!");
  }
} catch (error) {
  // التقاط الخطأ بدلاً من انهيار السيرفر
  console.error("🚨 [خطأ في تهيئة الفايربيز]:", error.message);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };