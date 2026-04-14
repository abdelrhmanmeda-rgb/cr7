const multer = require('multer');

// إعداد مكان حفظ الملفات مؤقتاً في مجلد /tmp المسموح به في Vercel
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp'); // التعديل الأهم: التوجيه لمجلد tmp
  },
  filename: function (req, file, cb) {
    // إزالة المسافات من اسم الملف لتفادي أي مشاكل
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, Date.now() + '-' + safeName);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;