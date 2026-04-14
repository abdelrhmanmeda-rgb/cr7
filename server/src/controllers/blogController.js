const cloudinary = require('../config/cloudinary');
const { db } = require('../config/firebase');
const fs = require('fs');

const addPost = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'يرجى إرفاق صورة للبوست' });
    const { title, content } = req.body;
    
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'cr7_blog' });
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    const postData = {
      title, content, imageUrl: result.secure_url,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };
    const doc = await db.collection('blog').add(postData);
    res.status(201).json({ success: true, data: { id: doc.id, ...postData } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const snapshot = await db.collection('blog').orderBy('createdAt', 'desc').get();
    const posts = [];
    snapshot.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'فشل جلب البوستات' });
  }
};

const deletePost = async (req, res) => {
  try {
    await db.collection('blog').doc(req.params.id).delete();
    res.status(200).json({ success: true, message: 'تم الحذف' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'فشل الحذف' });
  }
};

// ==========================================
// ✨ اللايك - مبسط ومضمون 100% ✨
// ==========================================
const likePost = async (req, res) => {
  try {
    console.log("👍 تم استلام طلب لايك للبوست:", req.params.id);
    const { userId } = req.body; 
    
    if (!userId) {
      console.log("❌ خطأ: الـ userId مفقود!");
      return res.status(400).json({ success: false, message: "بيانات المستخدم مفقودة" });
    }

    const postRef = db.collection('blog').doc(req.params.id);
    const doc = await postRef.get();
    
    if (!doc.exists) {
      console.log("❌ خطأ: البوست غير موجود!");
      return res.status(404).json({ success: false, message: "البوست غير موجود" });
    }

    let likes = doc.data().likes || [];
    if (likes.includes(userId)) {
      likes = likes.filter(id => id !== userId); // إزالة اللايك
    } else {
      likes.push(userId); // إضافة اللايك
    }
    
    await postRef.update({ likes: likes }); // تحديث قاعدة البيانات
    console.log("✅ تم حفظ اللايك بنجاح!");
    
    res.status(200).json({ success: true, likes });
  } catch (error) { 
    console.error("❌ خطأ داخلي في السيرفر أثناء اللايك:", error);
    res.status(500).json({ success: false, message: error.message }); 
  }
};

// ==========================================
// ✨ التعليق - مبسط ومضمون 100% ✨
// ==========================================
const commentPost = async (req, res) => {
  try {
    console.log("💬 تم استلام طلب تعليق للبوست:", req.params.id);
    const newComment = req.body; 
    
    if (!newComment || !newComment.userId) {
       console.log("❌ خطأ: بيانات التعليق مفقودة!");
       return res.status(400).json({ success: false, message: "بيانات التعليق مفقودة" });
    }

    const postRef = db.collection('blog').doc(req.params.id);
    const doc = await postRef.get();
    
    if (!doc.exists) {
      console.log("❌ خطأ: البوست غير موجود!");
      return res.status(404).json({ success: false, message: "البوست غير موجود" });
    }

    const comments = doc.data().comments || [];
    comments.push(newComment);
    
    await postRef.update({ comments: comments }); // تحديث قاعدة البيانات
    console.log("✅ تم حفظ التعليق بنجاح!");

    res.status(200).json({ success: true });
  } catch (error) { 
    console.error("❌ خطأ داخلي في السيرفر أثناء التعليق:", error);
    res.status(500).json({ success: false, message: error.message }); 
  }
};

const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const postRef = db.collection('blog').doc(postId);
    const doc = await postRef.get();
    
    if (!doc.exists) return res.status(404).json({ success: false });
    
    let comments = doc.data().comments || [];
    comments = comments.filter(c => c.id !== commentId);
    
    await postRef.update({ comments: comments });
    res.status(200).json({ success: true });
  } catch (error) { 
    res.status(500).json({ success: false, message: error.message }); 
  }
};

module.exports = { addPost, getPosts, deletePost, likePost, commentPost, deleteComment };