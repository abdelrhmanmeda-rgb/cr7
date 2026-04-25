const multer = require('multer');
const path = require('path');

// ==========================================
// 📦 تحديد أنواع الملفات المسموح بها (صور + صوت)
// ==========================================
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp/;
  const allowedAudioTypes = /mp3|wav|m4a/;

  const ext = path.extname(file.originalname).toLowerCase();
  const isImage = allowedImageTypes.test(ext) && file.mimetype.startsWith('image/');
  const isAudio = allowedAudioTypes.test(ext) && file.mimetype.startsWith('audio/');

  if (isImage || isAudio) {
    return cb(null, true);
  } else {
    cb(new Error('❌ نوع الملف غير مدعوم! (مسموح: صور + mp3 + wav + m4a)'));
  }
};

// ==========================================
// 📁 مكان الحفظ المؤقت (Vercel)
// ==========================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp');
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, Date.now() + '-' + safeName);
  }
});

// ==========================================
// ⚙️ إعداد multer
// ==========================================
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB علشان الصوت
  }
});

module.exports = upload;
