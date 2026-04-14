const express = require('express');
const router = express.Router();

// استدعاء الـ Middlewares
const upload = require('../middlewares/upload');
const verifyAdmin = require('../middlewares/verifyAdmin');

// استدعاء الدوال من الكنترولر
const { 
    addPost, 
    getPosts, 
    deletePost, 
    likePost, 
    commentPost, 
    deleteComment 
} = require('../controllers/blogController');

// ==========================================
// 📝 مسارات إدارة البوستات 
// ==========================================
router.get('/', getPosts); // جلب البوستات (للزوار)
router.post('/add', verifyAdmin, upload.single('image'), addPost); // إضافة بوست (للأدمن)
router.delete('/:id', verifyAdmin, deletePost); // حذف بوست (للأدمن)

// ==========================================
// ✨ مسارات التفاعل (اللايكات والتعليقات)
// ==========================================
router.post('/:id/like', likePost); // إضافة لايك
router.post('/:id/comment', commentPost); // إضافة تعليق

// مسار حذف التعليق (للأدمن)
router.delete('/:postId/comment/:commentId', verifyAdmin, deleteComment);

module.exports = router;