const { db } = require('../config/firebase');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// =============================
// 🎧 إعداد صوت الترحيب
// =============================
const defaultWelcomeAudio = {
  enabled: false,
  audioUrl: '',
  volume: 0.5,
  loop: true
};

const defaultViewerAccount = {
  accountNumber: '',
  broker: '',
  server: '',
  password: '',
  platform: '',
  note: ''
};

const defaultLiveStats = {
  headline: 'الأعداد المباشرة الحالية',
  description: 'يتم تحديث هذه الأرقام تلقائياً مع كل اشتراك أو إدارة أو شراء جديد من الموقع.',
  subscriptions: [],
  management: [],
  bots: []
};

const defaultSmartNotifications = {
  enabled: true,
  firstDelaySeconds: 3,
  intervalMinSeconds: 10,
  intervalMaxSeconds: 20,
  displaySeconds: 5,
  position: 'top',
  items: [
    {
      id: 'default-1',
      text: 'تم تفعيل اشتراك جديد في باقة CR7 BOT',
      type: 'subscription',
      isVisible: true
    },
    {
      id: 'default-2',
      text: 'عميل جديد اشترى بوت التداول بالكامل',
      type: 'bot',
      isVisible: true
    },
    {
      id: 'default-3',
      text: 'تم تفعيل إدارة حساب جديدة داخل CR7 BOT',
      type: 'management',
      isVisible: true
    }
  ]
};

const defaultSettings = {
  contact: { telegram: '', whatsapp: '', email: '' },
  faqs: [],
  terms: '',
  aboutUs: '',
  heroPhrases: ['يعمل لأجلك', 'يحقق أحلامك', 'يصنع ثروتك'],
  viewerAccount: defaultViewerAccount,
  liveStats: defaultLiveStats,
  smartNotifications: defaultSmartNotifications,
  welcomeAudio: defaultWelcomeAudio
};

// =============================
// 🔧 Normalizers
// =============================
const normalizeLiveStatsItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => ({
    id: item?.id || `${Date.now()}-${index}`,
    title: item?.title || '',
    count: Number(item?.count) || 0,
    note: item?.note || '',
    isVisible: item?.isVisible !== false,
    active: item?.active !== false
  }));
};

const normalizeSmartNotifications = (smartNotifications) => {
  return {
    enabled: smartNotifications?.enabled !== false,
    firstDelaySeconds: Number(smartNotifications?.firstDelaySeconds) || 3,
    intervalMinSeconds: Number(smartNotifications?.intervalMinSeconds) || 10,
    intervalMaxSeconds: Number(smartNotifications?.intervalMaxSeconds) || 20,
    displaySeconds: Number(smartNotifications?.displaySeconds) || 5,
    position: smartNotifications?.position || 'top',
    items: (smartNotifications?.items || []).map((item, index) => ({
      id: item?.id || `${Date.now()}-${index}`,
      text: item?.text || '',
      type: item?.type || 'general',
      isVisible: item?.isVisible !== false
    }))
  };
};

// =============================
// 📥 GET SETTINGS
// =============================
const getSettings = async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('general').get();

    if (!doc.exists) {
      return res.json({ success: true, data: defaultSettings });
    }

    const data = doc.data();

    res.json({
      success: true,
      data: {
        ...defaultSettings,
        ...data,
        liveStats: {
          headline: data.liveStats?.headline || defaultLiveStats.headline,
          description: data.liveStats?.description || defaultLiveStats.description,
          subscriptions: normalizeLiveStatsItems(data.liveStats?.subscriptions),
          management: normalizeLiveStatsItems(data.liveStats?.management),
          bots: normalizeLiveStatsItems(data.liveStats?.bots)
        },
        smartNotifications: normalizeSmartNotifications(data.smartNotifications),
        welcomeAudio: {
          enabled: data.welcomeAudio?.enabled || false,
          audioUrl: data.welcomeAudio?.audioUrl || '',
          volume: data.welcomeAudio?.volume ?? 0.5,
          loop: data.welcomeAudio?.loop !== false
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// 💾 UPDATE SETTINGS
// =============================
const updateSettings = async (req, res) => {
  try {
    const {
      contact,
      faqs,
      terms,
      aboutUs,
      heroPhrases,
      viewerAccount,
      liveStats,
      smartNotifications,
      welcomeAudio
    } = req.body;

    const dataToSave = {
      contact,
      faqs,
      terms,
      aboutUs,
      heroPhrases,
      viewerAccount,
      liveStats,
      smartNotifications,
      welcomeAudio: {
        enabled: welcomeAudio?.enabled || false,
        audioUrl: welcomeAudio?.audioUrl || '',
        volume: welcomeAudio?.volume ?? 0.5,
        loop: welcomeAudio?.loop !== false
      }
    };

    await db.collection('settings').doc('general').set(dataToSave, { merge: true });

    res.json({ success: true, message: 'تم الحفظ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// 🎧 UPLOAD AUDIO
// =============================
const uploadWelcomeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'لا يوجد ملف' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video'
    });

    fs.unlinkSync(req.file.path);

    await db.collection('settings').doc('general').set({
      welcomeAudio: {
        audioUrl: result.secure_url
      }
    }, { merge: true });

    res.json({
      success: true,
      audioUrl: result.secure_url
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  uploadWelcomeAudio
};
