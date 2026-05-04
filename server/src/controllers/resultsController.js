const cloudinary = require('../config/cloudinary');
const { db } = require('../config/firebase');
const fs = require('fs');

const cleanupTempFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑️ تم تنظيف الملف المؤقت من السيرفر.");
    }
  } catch (err) {
    console.error("⚠️ فشل تنظيف الملف المؤقت:", err.message);
  }
};

const uploadToCloudinaryWithRetry = async (filePath, retries = 2) => {
  try {
    return await cloudinary.uploader.upload(filePath, {
      folder: 'cr7_bot_results',
      resource_type: 'auto',
      timeout: 120000
    });
  } catch (error) {
    console.error("⚠️ فشل رفع Cloudinary:", error.message);

    if (retries > 0) {
      console.log(`🔁 إعادة محاولة الرفع... المتبقي: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return uploadToCloudinaryWithRetry(filePath, retries - 1);
    }

    throw error;
  }
};

/**
 * 1. وظيفة رفع نتيجة جديدة (POST)
 * الرابط المستخدم: http://localhost:5000/api/results/upload
 */
const uploadResult = async (req, res) => {
  console.log("\n============== 🚀 بدء عملية رفع نتيجة جديدة ==============");

  try {
    if (!req.file) {
      console.log("❌ السيرفر: لم يتم إرفاق أي ملف في الطلب.");
      return res.status(400).json({
        success: false,
        message: 'الرجاء إرفاق صورة أو فيديو'
      });
    }

    const { profitAmount, notes } = req.body;

    console.log("📥 البيانات المستلمة:", {
      profitAmount,
      notes,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    if (!req.file.path) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم تجهيز الملف المؤقت للرفع'
      });
    }

    console.log("☁️ جاري الرفع إلى Cloudinary...");
    const cloudinaryResponse = await uploadToCloudinaryWithRetry(req.file.path);

    console.log("✅ تم الرفع لـ Cloudinary بنجاح! الرابط:", cloudinaryResponse.secure_url);

    cleanupTempFile(req.file.path);

    const safeProfitAmount = profitAmount || 0;
    const detectedMediaType =
      cloudinaryResponse.resource_type === 'video' ? 'video' : 'image';

    const resultData = {
      mediaUrl: cloudinaryResponse.secure_url,
      mediaType: detectedMediaType,
      profitAmount: safeProfitAmount,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      cloudinaryPublicId: cloudinaryResponse.public_id || '',
      cloudinaryResourceType: cloudinaryResponse.resource_type || detectedMediaType
    };

    console.log("🔥 جاري الحفظ في Firebase...");
    const docRef = await db.collection('daily_results').add(resultData);

    console.log("✅ تم الحفظ في فايربيز بنجاح! رقم العملية:", docRef.id);
    console.log("========================================================\n");

    return res.status(201).json({
      success: true,
      message: 'تم رفع نتيجة CR7 Bot بنجاح!',
      data: { id: docRef.id, ...resultData }
    });

  } catch (error) {
    console.error('\n❌❌❌ خطأ أثناء عملية رفع النتيجة ❌❌❌');
    console.error(error);

    if (req.file && req.file.path) {
      cleanupTempFile(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ داخلي في السيرفر أثناء الرفع',
      errorName: error.name || 'UnknownError'
    });
  }
};

/**
 * 2. وظيفة جلب جميع النتائج (GET)
 * الرابط المستخدم: http://localhost:5000/api/results
 */
const getResults = async (req, res) => {
  try {
    const snapshot = await db.collection('daily_results').orderBy('createdAt', 'desc').get();

    const results = [];
    snapshot.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('❌ خطأ أثناء جلب البيانات من Firebase:', error);

    return res.status(500).json({
      success: false,
      message: 'فشل جلب النتائج من قاعدة البيانات',
      errorName: error.name || 'UnknownError'
    });
  }
};

/**
 * 3. وظيفة حذف نتيجة (DELETE)
 * الرابط المستخدم: http://localhost:5000/api/results/:id
 */
const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'رقم النتيجة غير موجود'
      });
    }

    const docRef = db.collection('daily_results').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'هذه النتيجة غير موجودة'
      });
    }

    const data = doc.data();

    if (data?.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(data.cloudinaryPublicId, {
          resource_type: data.cloudinaryResourceType || data.mediaType || 'image'
        });
        console.log("🗑️ تم حذف الملف من Cloudinary:", data.cloudinaryPublicId);
      } catch (cloudErr) {
        console.error("⚠️ فشل حذف الملف من Cloudinary:", cloudErr.message);
      }
    }

    await docRef.delete();

    return res.status(200).json({
      success: true,
      message: 'تم حذف النتيجة بنجاح'
    });

  } catch (error) {
    console.error('❌ خطأ أثناء حذف النتيجة:', error);

    return res.status(500).json({
      success: false,
      message: 'فشل حذف النتيجة',
      errorName: error.name || 'UnknownError'
    });
  }
};

module.exports = {
  uploadResult,
  getResults,
  deleteResult
};
