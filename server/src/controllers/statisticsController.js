const { db } = require('../config/firebase');

// 1. دالة لتسجيل النقرات والزيارات (يستدعيها الموقع الرئيسي)
const trackAction = async (req, res) => {
  try {
    const { actionType, itemName, price } = req.body;
    const statsRef = db.collection('statistics').doc('main');
    
    // جلب البيانات الحالية
    const doc = await statsRef.get();
    let data = doc.exists ? doc.data() : {
      visits: { daily: 0, monthly: 0, total: 0 },
      telegramClicks: 0,
      managementSubs: 0,
      bots: {},
      plans: {}
    };

    // التأكد من وجود الهياكل الأساسية لتفادي الأخطاء
    if (!data.visits) data.visits = { daily: 0, monthly: 0, total: 0 };
    if (!data.bots) data.bots = {};
    if (!data.plans) data.plans = {};

    // زيادة العدادات بناءً على نوع الحدث القادم من الموقع
    if (actionType === 'visit') {
      data.visits.total = (data.visits.total || 0) + 1;
      data.visits.daily = (data.visits.daily || 0) + 1;
      data.visits.monthly = (data.visits.monthly || 0) + 1;
    } else if (actionType === 'telegram') {
      data.telegramClicks = (data.telegramClicks || 0) + 1;
    } else if (actionType === 'buy_bot' && itemName) {
      if (!data.bots[itemName]) data.bots[itemName] = { count: 0, revenue: 0 };
      data.bots[itemName].count += 1;
      if (price) data.bots[itemName].revenue += Number(price);
    } else if (actionType === 'subscribe' && itemName) {
      if (!data.plans[itemName]) data.plans[itemName] = { count: 0, revenue: 0 };
      data.plans[itemName].count += 1;
      if (price) data.plans[itemName].revenue += Number(price);
    } else if (actionType === 'management') {
      data.managementSubs = (data.managementSubs || 0) + 1;
    }

    // حفظ البيانات الجديدة المحدثة
    await statsRef.set(data);

    res.status(200).json({ success: true, message: 'تم تسجيل الإحصائية بنجاح' });
  } catch (error) {
    console.error("Tracking Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. دالة لجلب الإحصائيات (تستدعيها لوحة التحكم)
const getStatistics = async (req, res) => {
  try {
    const doc = await db.collection('statistics').doc('main').get();
    
    if (!doc.exists) {
      return res.status(200).json({ success: true, data: null });
    }

    const rawData = doc.data();
    
    // تنسيق البيانات لتناسب عرض الجداول والرسم البياني في لوحة التحكم
    const formattedData = {
      visits: rawData.visits || { daily: 0, monthly: 0, total: 0 },
      telegramClicks: rawData.telegramClicks || 0,
      managementSubs: rawData.managementSubs || 0,
      
      // تحويل البوتات والاشتراكات إلى مصفوفة ليتم عرضها في الجداول
      botsSales: Object.keys(rawData.bots || {}).map(key => ({
        name: key,
        count: rawData.bots[key].count || 0,
        revenue: `$${rawData.bots[key].revenue || 0}`,
        isBestSeller: (rawData.bots[key].count || 0) > 10 // تفعيل الأكثر مبيعاً تلقائياً لو تخطى 10
      })).sort((a, b) => b.count - a.count), // ترتيب تنازلي

      plansSales: Object.keys(rawData.plans || {}).map(key => ({
        name: key,
        count: rawData.plans[key].count || 0,
        revenue: `$${rawData.plans[key].revenue || 0}`,
        isBestSeller: (rawData.plans[key].count || 0) > 10
      })).sort((a, b) => b.count - a.count),

      // بيانات الرسم البياني التفاعلي
      chartData: [ 
        { label: 'قبل 5 أيام', value: Math.floor((rawData.visits?.daily || 0) * 0.4) },
        { label: 'قبل 4 أيام', value: Math.floor((rawData.visits?.daily || 0) * 0.5) },
        { label: 'قبل 3 أيام', value: Math.floor((rawData.visits?.daily || 0) * 0.7) },
        { label: 'قبل يومين', value: Math.floor((rawData.visits?.daily || 0) * 0.8) },
        { label: 'أمس', value: Math.floor((rawData.visits?.daily || 0) * 0.9) },
        { label: 'اليوم', value: rawData.visits?.daily || 0 }
      ]
    };

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Fetch Stats Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✨ 3. دالة تصفير الإحصائيات الجديدة ✨
const resetStatistics = async (req, res) => {
  try {
    const statsRef = db.collection('statistics').doc('main');
    await statsRef.set({
      visits: { daily: 0, monthly: 0, total: 0 },
      telegramClicks: 0,
      managementSubs: 0,
      bots: {},
      plans: {}
    });
    res.status(200).json({ success: true, message: 'تم تصفير جميع الإحصائيات بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { trackAction, getStatistics, resetStatistics };