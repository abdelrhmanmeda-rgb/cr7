const multer = require('multer');
const path = require('path');
const fs = require('fs');

// إنشاء مجلد مؤقت باسم uploads إذا لم يكن موجوداً
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// إعداد مكان حفظ الملفات مؤقتاً
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;