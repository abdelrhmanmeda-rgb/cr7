const cloudinary = require('../config/cloudinary');
const { db } = require('../config/firebase');
const fs = require('fs');

/**
 * إضافة بوت جديد
 */
const addBot = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'يرجى إرفاق صورة غلاف' });

    // استلام حقل isBestSeller من الـ body
    const { name, description, accuracy, features, price, isBestSeller } = req.body;

    // رفع الصورة لـ Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'cr7_bots' });
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    // تحويل المميزات لمصفوفة
    let parsedFeatures = [];
    try { parsedFeatures = JSON.parse(features); } catch (e) { parsedFeatures = []; }

    const botData = {
      name, 
      description, 
      accuracy, 
      price,
      isBestSeller: isBestSeller === 'true' || isBestSeller === true, // تحويلها لقيمة منطقية وحفظها في قاعدة البيانات
      features: parsedFeatures,
      imageUrl: result.secure_url,
      createdAt: new Date().toISOString()
    };

    const doc = await db.collection('bots').add(botData);
    res.status(201).json({ success: true, data: { id: doc.id, ...botData } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * جلب البوتات
 */
const getBots = async (req, res) => {
  try {
    const snapshot = await db.collection('bots').orderBy('createdAt', 'desc').get();
    const bots = [];
    snapshot.forEach(doc => bots.push({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, data: bots });
  } catch (error) {
    res.status(500).json({ success: false, message: 'فشل جلب البيانات' });
  }
};

/**
 * حذف بوت
 */
const deleteBot = async (req, res) => {
  try {
    await db.collection('bots').doc(req.params.id).delete();
    res.status(200).json({ success: true, message: 'تم الحذف' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'فشل الحذف' });
  }
};

/**
 * تعديل بوت موجود - ✨ إضافة جديدة مخصصة لـ Firebase و Cloudinary ✨
 */
const updateBot = async (req, res) => {
  try {
    const { id } = req.params;
    
    // استلام الحقول، وتأكدنا من إضافة isBestSeller
    const { name, description, accuracy, features, price, isBestSeller } = req.body;

    // تجهيز كائن التحديث
    let updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (accuracy) updateData.accuracy = accuracy;
    if (price) updateData.price = price;
    
    // تحديث حقل "الأكثر مبيعاً"
    if (isBestSeller !== undefined) {
      updateData.isBestSeller = isBestSeller === 'true' || isBestSeller === true;
    }

    // تحديث المميزات إذا تم إرسالها
    if (features) {
      try { 
        updateData.features = JSON.parse(features); 
      } catch (e) { 
        console.error("Error parsing features:", e); 
      }
    }

    // إذا تم رفع صورة جديدة، نقوم برفعها على Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'cr7_bots' });
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      updateData.imageUrl = result.secure_url; // تحديث رابط الصورة الجديد
    }

    // تحديث الوثيقة في Firebase Firestore
    await db.collection('bots').doc(id).update(updateData);

    res.status(200).json({ success: true, message: 'تم تعديل البوت بنجاح' });
  } catch (error) {
    console.error("Error updating bot:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// لا تنسَ تصدير دالة updateBot مع باقي الدوال
module.exports = { addBot, getBots, deleteBot, updateBot };