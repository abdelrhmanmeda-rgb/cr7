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