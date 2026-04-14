const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // هذه الدالة مهمة جداً لإصلاح شكل المفتاح السري عند قراءته من الـ env
  privateKey: process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined,
};

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin Initialized Successfully');
  }
} catch (error) {
  console.error('❌ Firebase Initialization Error:', error);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth, admin };