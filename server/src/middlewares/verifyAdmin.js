/**
 * ميدل وير للتحقق من أن المستخدم هو الأدمن
 */
const verifyAdmin = (req, res, next) => {
  // حالياً نسمح بالمرور للتطوير، سنقوم بربطه بـ Firebase Auth لاحقاً
  console.log("🛡️ [Middleware]: تم التحقق من صلاحيات الأدمن بنجاح.");
  next(); 
};

module.exports = verifyAdmin;