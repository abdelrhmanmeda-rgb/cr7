const multer = require('multer');
const path = require('path');

// ==========================================
// 📦 تحديد أنواع الملفات المسموح بها
// صور + صوت + فيديو
// ==========================================
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const isImage =
    ['.jpeg', '.jpg', '.png', '.webp'].includes(ext) &&
    file.mimetype.startsWith('image/');

  const isAudio =
    ['.mp3', '.wav', '.m4a'].includes(ext) &&
    file.mimetype.startsWith('audio/');

  const isVideo =
    ['.mp4', '.mov', '.webm'].includes(ext) &&
    file.mimetype.startsWith('video/');

  if (isImage || isAudio || isVideo) {
    return cb(null, true);
  }

  return cb(
    new Error('❌ نوع الملف غير مدعوم! مسموح: صور + صوت + فيديو')
  );
};

// ==========================================
// 📁 مكان الحفظ المؤقت على Vercel
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
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

module.exports = upload;
