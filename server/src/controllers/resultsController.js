const cloudinary = require('../config/cloudinary');
const { db } = require('../config/firebase');
const fs = require('fs');

// ==========================================
// 🧹 تنظيف الملفات المؤقتة
// ==========================================
const cleanupTempFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🧹 تم حذف الملف المؤقت");
    }
  } catch (err) {
    console.error("⚠️ فشل حذف الملف:", err.message);
  }
};

// ==========================================
// 🎯 تحديد نوع الملف (مهم للسرعة)
// ==========================================
const getResourceType = (file) => {
  if (!file || !file.mimetype) return 'image';

  if (file.mimetype.startsWith('image/')) return 'image';
  if (file.mimetype.startsWith('video/')) return 'video';

  return 'auto';
};

// ==========================================
// ☁️ رفع Cloudinary مع Retry
// ==========================================
const uploadToCloudinaryWithRetry = async (filePath, file, retries = 3) => {
  const resourceType = getResourceType(file);

  try {
    console.log("☁️ رفع إلى Cloudinary...", {
      resourceType,
      retries
    });

    return await cloudinary.uploader.upload(filePath, {
      folder: 'cr7_bot_results',
      resource_type: resourceType,
      timeout: 300000 // 🔥 مهم جدًا
    });

  } catch (error) {
    console.error("❌ فشل Cloudinary:", error.message);

    if (retries > 0) {
      console.log(`🔁 إعادة المحاولة... المتبقي: ${retries}`);
      await new Promise(r => setTimeout(r, 2000));
      return uploadToCloudinaryWithRetry(filePath, file, retries - 1);
    }

    throw error;
  }
};

// ==========================================
// 🚀 رفع نتيجة
// ==========================================
const uploadResult = async (req, res) => {
  let tempPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'ارفع صورة النتيجة'
      });
    }

    tempPath = req.file.path;

    const result = await uploadToCloudinaryWithRetry(
      req.file.path,
      req.file,
      3
    );

    cleanupTempFile(tempPath);
    tempPath = null;

    const now = new Date();

    const data = {
      mediaUrl: result.secure_url,
      imageUrl: result.secure_url,

      mediaType: result.resource_type === 'video' ? 'video' : 'image',

      profitAmount: req.body.profitAmount || 0,
      notes: req.body.notes || '',

      cloudinaryPublicId: result.public_id,
      cloudinaryResourceType: result.resource_type,

      createdAt: now,        // 🔥 FIX مهم
      updatedAt: now
    };

    const doc = await db.collection('daily_results').add(data);

    return res.status(201).json({
      success: true,
      message: 'تم رفع النتيجة بنجاح',
      data: { id: doc.id, ...data }
    });

  } catch (error) {
    console.error("❌ خطأ رفع:", error);

    cleanupTempFile(tempPath);

    return res.status(500).json({
      success: false,
      message: error.message || 'فشل رفع النتيجة'
    });
  }
};

// ==========================================
// 📥 جلب النتائج
// ==========================================
const getResults = async (req, res) => {
  try {
    const snapshot = await db
      .collection('daily_results')
      .orderBy('createdAt', 'desc')
      .get();

    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error("❌ جلب النتائج:", error);

    res.status(500).json({
      success: false,
      message: 'فشل جلب النتائج'
    });
  }
};

// ==========================================
// 🗑️ حذف نتيجة
// ==========================================
const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = db.collection('daily_results').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'غير موجود'
      });
    }

    const data = doc.data();

    if (data.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(data.cloudinaryPublicId, {
          resource_type: data.cloudinaryResourceType || 'image'
        });
      } catch (err) {
        console.error("⚠️ حذف Cloudinary فشل:", err.message);
      }
    }

    await docRef.delete();

    res.json({
      success: true,
      message: 'تم الحذف'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل الحذف'
    });
  }
};

module.exports = {
  uploadResult,
  getResults,
  deleteResult
};
