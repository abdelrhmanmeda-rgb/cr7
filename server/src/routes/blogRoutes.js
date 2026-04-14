const app = express();

// 👇 هذا هو الكود السحري الذي سيسمح للوحة التحكم والموقع بالاتصال بالسيرفر
app.use(cors({
  origin: true, // يسمح باستقبال الطلبات من أي رابط (لوحة التحكم والموقع)
  credentials: true, // ضروري جداً إذا كنت تستخدم نظام تسجيل دخول (Tokens/Cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json()); // تأكد أن هذا السطر موجود أيضاً

// مساراتك هنا
// app.use('/api/posts', postRoutes);
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const verifyAdmin = require('../middlewares/verifyAdmin');

// استدعاء الدوال من الكنترولر
const { addPost, getPosts, deletePost, likePost, commentPost, deleteComment } = require('../controllers/blogController');

// مسارات إدارة البوستات (للأدمن والزوار)
router.get('/', getPosts);
router.post('/add', verifyAdmin, upload.single('image'), addPost);
router.delete('/:id', verifyAdmin, deletePost);

// ==========================================
// ✨ المسارات المفقودة (اللايكات والتعليقات) ✨
// ==========================================
router.post('/:id/like', likePost);
router.post('/:id/comment', commentPost);

// مسار حذف التعليق (للأدمن)
router.delete('/:postId/comment/:commentId', verifyAdmin, deleteComment);

module.exports = router;