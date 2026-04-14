const { db } = require('../config/firebase');

// إضافة باقة جديدة
const addSubscription = async (req, res) => {
  try {
    const { type, title, capital, fee, features, isBestSeller } = req.body;
    
    const subData = {
      type, 
      title, 
      capital, 
      fee, 
      features: features || [],
      isBestSeller: isBestSeller || false,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('subscriptions').add(subData);
    res.status(201).json({ success: true, data: { id: docRef.id, ...subData } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// جلب جميع الباقات
const getSubscriptions = async (req, res) => {
  try {
    // جلب الباقات مرتبة من الأقدم للأحدث
    const snapshot = await db.collection('subscriptions').orderBy('createdAt', 'asc').get();
    const subs = [];
    snapshot.forEach(doc => subs.push({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, data: subs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// تعديل باقة موجودة
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, capital, fee, features, isBestSeller } = req.body;
    
    const updateData = { type, title, capital, fee, features, isBestSeller };
    await db.collection('subscriptions').doc(id).update(updateData);
    
    res.status(200).json({ success: true, message: 'تم تعديل الباقة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// حذف باقة
const deleteSubscription = async (req, res) => {
  try {
    await db.collection('subscriptions').doc(req.params.id).delete();
    res.status(200).json({ success: true, message: 'تم الحذف بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addSubscription, getSubscriptions, updateSubscription, deleteSubscription };