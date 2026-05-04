const cloudinary = require('../config/cloudinary');
const { db } = require('../config/firebase');

// ==========================================
// 🚀 حفظ نتيجة من رابط مباشر (Direct Upload)
// ==========================================
const saveResultFromUrl = async (req, res) => {
  try {
    const {
      mediaUrl,
      mediaType,
      profitAmount,
      notes,
      publicId
    } = req.body;

    if (!mediaUrl) {
      return res.status(400).json({
        success: false,
        message: 'الرابط غير موجود'
      });
    }

    const now = new Date();

    const data = {
      mediaUrl,
      imageUrl: mediaUrl,
      mediaType: mediaType || 'image',
      profitAmount: profitAmount || 0,
      notes: notes || '',
      cloudinaryPublicId: publicId || '',
      cloudinaryResourceType: mediaType || 'image',
      createdAt: now,
      updatedAt: now
    };

    const doc = await db.collection('daily_results').add(data);

    res.status(201).json({
      success: true,
      message: 'تم حفظ النتيجة بنجاح',
      data: { id: doc.id, ...data }
    });

  } catch (error) {
    console.error('❌ saveResultFromUrl Error:', error);

    res.status(500).json({
      success: false,
      message: 'فشل حفظ النتيجة'
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
  saveResultFromUrl,
  getResults,
  deleteResult
};
