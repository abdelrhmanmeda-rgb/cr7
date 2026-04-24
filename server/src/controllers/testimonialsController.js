const { db } = require('../config/firebase');
const cloudinary = require('cloudinary').v2;

// ==========================================
// 📤 رفع رأي عميل (Screenshot)
// ==========================================
const uploadTestimonial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'لم يتم رفع صورة' });
    }

    const { title, service, isVisible } = req.body;

    // رفع الصورة على Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'testimonials'
    });

    const newTestimonial = {
      imageUrl: result.secure_url,
      title: title || '',
      service: service || '',
      isVisible: isVisible !== 'false',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('testimonials').add(newTestimonial);

    return res.status(200).json({
      success: true,
      data: { id: docRef.id, ...newTestimonial }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 📥 جلب كل الآراء
// ==========================================
const getTestimonials = async (req, res) => {
  try {
    const snapshot = await db.collection('testimonials')
      .orderBy('createdAt', 'desc')
      .get();

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ success: true, data });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ✏️ تعديل رأي
// ==========================================
const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, service, isVisible } = req.body;

    await db.collection('testimonials').doc(id).update({
      title: title || '',
      service: service || '',
      isVisible: isVisible !== 'false'
    });

    return res.status(200).json({ success: true, message: 'تم التعديل' });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 🗑️ حذف رأي
// ==========================================
const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection('testimonials').doc(id).delete();

    return res.status(200).json({ success: true, message: 'تم الحذف' });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadTestimonial,
  getTestimonials,
  updateTestimonial,
  deleteTestimonial
};
