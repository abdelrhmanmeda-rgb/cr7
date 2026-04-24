const { db } = require('../config/firebase');

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

const defaultSettings = {
  contact: { telegram: '', whatsapp: '', email: '' },
  faqs: [],
  terms: '',
  aboutUs: '',
  heroPhrases: ['يعمل لأجلك', 'يحقق أحلامك', 'يصنع ثروتك'],
  viewerAccount: defaultViewerAccount,
  liveStats: defaultLiveStats
};

const normalizeLiveStatsItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    id: item?.id || Date.now().toString(),
    title: item?.title || '',
    count: Number(item?.count) || 0,
    note: item?.note || '',
    isVisible: item?.isVisible === false ? false : true
  }));
};

// جلب الإعدادات الحالية
const getSettings = async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('general').get();

    if (!doc.exists) {
      return res.status(200).json({
        success: true,
        data: defaultSettings
      });
    }

    const data = doc.data() || {};

    return res.status(200).json({
      success: true,
      data: {
        contact: data.contact || defaultSettings.contact,
        faqs: Array.isArray(data.faqs) ? data.faqs : [],
        terms: data.terms || '',
        aboutUs: data.aboutUs || '',
        heroPhrases: Array.isArray(data.heroPhrases) && data.heroPhrases.length
          ? data.heroPhrases
          : defaultSettings.heroPhrases,
        viewerAccount: {
          accountNumber: data.viewerAccount?.accountNumber || '',
          broker: data.viewerAccount?.broker || '',
          server: data.viewerAccount?.server || '',
          password: data.viewerAccount?.password || '',
          platform: data.viewerAccount?.platform || '',
          note: data.viewerAccount?.note || ''
        },
        liveStats: {
          headline: data.liveStats?.headline || defaultLiveStats.headline,
          description: data.liveStats?.description || defaultLiveStats.description,
          subscriptions: normalizeLiveStatsItems(data.liveStats?.subscriptions),
          management: normalizeLiveStatsItems(data.liveStats?.management),
          bots: normalizeLiveStatsItems(data.liveStats?.bots)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// حفظ وتحديث الإعدادات
const updateSettings = async (req, res) => {
  try {
    const {
      contact,
      faqs,
      terms,
      aboutUs,
      heroPhrases,
      viewerAccount,
      liveStats
    } = req.body;

    const dataToSave = {
      contact: {
        telegram: contact?.telegram || '',
        whatsapp: contact?.whatsapp || '',
        email: contact?.email || ''
      },
      faqs: Array.isArray(faqs) ? faqs : [],
      terms: terms || '',
      aboutUs: aboutUs || '',
      heroPhrases: Array.isArray(heroPhrases) && heroPhrases.length
        ? heroPhrases
        : defaultSettings.heroPhrases,
      viewerAccount: {
        accountNumber: viewerAccount?.accountNumber || '',
        broker: viewerAccount?.broker || '',
        server: viewerAccount?.server || '',
        password: viewerAccount?.password || '',
        platform: viewerAccount?.platform || '',
        note: viewerAccount?.note || ''
      },
      liveStats: {
        headline: liveStats?.headline || defaultLiveStats.headline,
        description: liveStats?.description || defaultLiveStats.description,
        subscriptions: normalizeLiveStatsItems(liveStats?.subscriptions),
        management: normalizeLiveStatsItems(liveStats?.management),
        bots: normalizeLiveStatsItems(liveStats?.bots)
      }
    };

    await db.collection('settings').doc('general').set(dataToSave, { merge: true });

    return res.status(200).json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
