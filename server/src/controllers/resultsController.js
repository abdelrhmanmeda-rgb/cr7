const cloudinary = require('../config/cloudinary');
const { db } = require('../config/firebase');
const fs = require('fs');

/**
 * 1. وظيفة رفع نتيجة جديدة (POST)
 * الرابط المستخدم: http://localhost:5000/api/results/upload
 */
const uploadResult = async (req, res) => {
  console.log("\n============== 🚀 بدء عملية رفع نتيجة جديدة ==============");
  
  try {
    // 1. التأكد من أن أداة Multer استلمت الملف بنجاح
    if (!req.file) {
      console.log("❌ السيرفر: لم يتم إرفاق أي ملف في الطلب.");
      return res.status(400).json({ success: false, message: 'الرجاء إرفاق صورة أو فيديو' });
    }

    const { profitAmount, notes } = req.body;
    console.log("📥 البيانات المستلمة:", { profitAmount, notes, file: req.file.path });

    // 2. رفع الملف إلى Cloudinary
    console.log("☁️ جاري الرفع إلى سحابة Cloudinary...");
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: 'cr7_bot_results',
      resource_type: 'auto', // يكتشف نوع الملف تلقائياً (صورة أو فيديو)
    });
    console.log("✅ تم الرفع لـ Cloudinary بنجاح! الرابط:", cloudinaryResponse.secure_url);

    // 3. حذف الملف المؤقت من جهاز السيرفر لتوفير المساحة
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log("🗑️ تم تنظيف الملف المؤقت من السيرفر.");
    }

    // 4. تجهيز كائن البيانات للحفظ في Firebase
    const resultData = {
      mediaUrl: cloudinaryResponse.secure_url,
      mediaType: cloudinaryResponse.resource_type, // 'image' أو 'video'
      profitAmount: profitAmount || 0,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    // 5. حفظ البيانات في Firestore داخل مجموعة daily_results
    console.log("🔥 جاري الحفظ في قاعدة بيانات Firebase...");
    const docRef = await db.collection('daily_results').add(resultData);
    console.log("✅ تم الحفظ في فايربيز بنجاح! رقم العملية:", docRef.id);
    console.log("========================================================\n");

    // إرسال رد النجاح للوحة التحكم
    res.status(201).json({
      success: true,
      message: 'تم رفع نتيجة CR7 Bot بنجاح!',
      data: { id: docRef.id, ...resultData }
    });

  } catch (error) {
    console.error('\n❌❌❌ خطأ كارثي أثناء عملية الرفع ❌❌❌');
    console.error(error); // طباعة الخطأ الحقيقي بالتفصيل في التيرمنال
    
    // محاولة تنظيف الملف إذا فشلت العملية في المنتصف
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      success: false, 
      message: error.message || 'حدث خطأ داخلي في السيرفر أثناء الرفع'
    });
  }
};

/**
 * 2. وظيفة جلب جميع النتائج (GET)
 * الرابط المستخدم: http://localhost:5000/api/results
 */
const getResults = async (req, res) => {
  try {
    // جلب البيانات من Firestore مرتبة من الأحدث للأقدم
    const snapshot = await db.collection('daily_results').orderBy('createdAt', 'desc').get();
    
    const results = [];
    snapshot.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('❌ خطأ أثناء جلب البيانات من Firebase:', error);
    res.status(500).json({ 
      success: false, 
      message: 'فشل جلب النتائج من قاعدة البيانات'
    });
  }
};

/**
 * 3. وظيفة حذف نتيجة (DELETE) - ✨ إضافة جديدة ✨
 * الرابط المستخدم: http://localhost:5000/api/results/:id
 */
const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    
    // حذف النتيجة من Firebase باستخدام مجموعة 'daily_results'
    await db.collection('daily_results').doc(id).delete();
    
    res.status(200).json({ success: true, message: 'تم حذف النتيجة بنجاح' });
  } catch (error) {
    console.error('❌ خطأ أثناء حذف النتيجة:', error);
    res.status(500).json({ success: false, message: 'فشل حذف النتيجة' });
  }
};

module.exports = {
  uploadResult,
  getResults,
  deleteResult // تم تصدير الدالة هنا بنجاح
};