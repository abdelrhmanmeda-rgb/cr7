const { db } = require('../config/firebase');

// جلب الإعدادات الحالية
const getSettings = async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('general').get();
    
    // إذا لم تكن الإعدادات موجودة مسبقاً، نرسل بيانات فارغة مبدئية (بما فيها aboutUs و heroPhrases)
    if (!doc.exists) {
      return res.status(200).json({ 
        success: true, 
        data: { 
          contact: { telegram: '', whatsapp: '', email: '' }, 
          faqs: [], 
          terms: '', 
          aboutUs: '',
          heroPhrases: ['يعمل لأجلك', 'يحقق أحلامك', 'يصنع ثروتك'] 
        } 
      });
    }
    
    res.status(200).json({ success: true, data: doc.data() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// حفظ وتحديث الإعدادات (نستخدم وثيقة واحدة دائمًا اسمها "general")
const updateSettings = async (req, res) => {
  try {
    // نستلم الحقول صراحة من الـ body لضمان حفظها بشكل سليم
    const { contact, faqs, terms, aboutUs, heroPhrases } = req.body; 
    
    const dataToSave = {
        contact: contact || { telegram: '', whatsapp: '', email: '' },
        faqs: faqs || [],
        terms: terms || '',
        aboutUs: aboutUs || '', // ✅ تم تفعيل حفظ قسم "من نحن"
        heroPhrases: heroPhrases || ['يعمل لأجلك', 'يحقق أحلامك', 'يصنع ثروتك'] // ✨ تفعيل حفظ الجمل المتحركة
    };
    
    // استخدمنا set مع خيار merge لضمان دمج الإعدادات بدلاً من مسح شيء موجود
    await db.collection('settings').doc('general').set(dataToSave, { merge: true });
    
    res.status(200).json({ success: true, message: 'تم حفظ الإعدادات بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSettings, updateSettings };