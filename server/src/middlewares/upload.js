const multer = require('multer');
const path = require('path');

// ==========================================
// 📦 تحديد أنواع الملفات المسموح بها
// ==========================================
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    return cb(null, true);
  } else {
    cb(new Error('❌ نوع الملف غير مدعوم! (مسموح فقط: jpg, jpeg, png, webp)'));
  }
};

// ==========================================
// 📁 إعداد مكان حفظ الملفات مؤقتاً في Vercel
// ==========================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp'); // مهم جداً لـ Vercel
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, Date.now() + '-' + safeName);
  }
});

// ==========================================
// ⚙️ إعداد multer النهائي
// ==========================================
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

module.exports = upload;
