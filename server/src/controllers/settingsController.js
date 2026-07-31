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
  contact: {
    telegram: '',
    whatsapp: '',
    email: ''
  },
  faqs: [],
  terms: '',
  aboutUs: '',
  heroPhrases: [
    'يعمل لأجلك',
    'يحقق أحلامك',
    'يصنع ثروتك'
  ],
  viewerAccount: defaultViewerAccount,
  liveStats: defaultLiveStats,
  smartNotifications: defaultSmartNotifications,
  welcomeAudio: defaultWelcomeAudio
};

// =============================
// 🔧 Normalizers
// =============================
const normalizeLiveStatsItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

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
    firstDelaySeconds:
      Number(smartNotifications?.firstDelaySeconds) || 3,
    intervalMinSeconds:
      Number(smartNotifications?.intervalMinSeconds) || 10,
    intervalMaxSeconds:
      Number(smartNotifications?.intervalMaxSeconds) || 20,
    displaySeconds:
      Number(smartNotifications?.displaySeconds) || 5,
    position:
      smartNotifications?.position || 'top',
    items: Array.isArray(smartNotifications?.items)
      ? smartNotifications.items.map((item, index) => ({
          id: item?.id || `${Date.now()}-${index}`,
          text: item?.text || '',
          type: item?.type || 'general',
          isVisible: item?.isVisible !== false
        }))
      : []
  };
};

const normalizeWelcomeAudio = (welcomeAudio) => {
  const parsedVolume = Number(welcomeAudio?.volume);

  return {
    enabled: welcomeAudio?.enabled === true,
    audioUrl:
      typeof welcomeAudio?.audioUrl === 'string'
        ? welcomeAudio.audioUrl.trim()
        : '',
    volume: Number.isFinite(parsedVolume)
      ? Math.min(1, Math.max(0, parsedVolume))
      : 0.5,
    loop: welcomeAudio?.loop !== false
  };
};

// =============================
// 📥 GET SETTINGS
// =============================
const getSettings = async (req, res) => {
  try {
    const doc = await db
      .collection('settings')
      .doc('general')
      .get();

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
        ...defaultSettings,
        ...data,

        contact: {
          ...defaultSettings.contact,
          ...(data.contact || {})
        },

        viewerAccount: {
          ...defaultViewerAccount,
          ...(data.viewerAccount || {})
        },

        liveStats: {
          headline:
            data.liveStats?.headline ||
            defaultLiveStats.headline,

          description:
            data.liveStats?.description ||
            defaultLiveStats.description,

          subscriptions: normalizeLiveStatsItems(
            data.liveStats?.subscriptions
          ),

          management: normalizeLiveStatsItems(
            data.liveStats?.management
          ),

          bots: normalizeLiveStatsItems(
            data.liveStats?.bots
          )
        },

        smartNotifications:
          normalizeSmartNotifications(
            data.smartNotifications
          ),

        welcomeAudio:
          normalizeWelcomeAudio(
            data.welcomeAudio
          )
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ أثناء تحميل الإعدادات'
    });
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
    } = req.body || {};

    const dataToSave = {};

    if (contact !== undefined) {
      dataToSave.contact = contact;
    }

    if (faqs !== undefined) {
      dataToSave.faqs = faqs;
    }

    if (terms !== undefined) {
      dataToSave.terms = terms;
    }

    if (aboutUs !== undefined) {
      dataToSave.aboutUs = aboutUs;
    }

    if (heroPhrases !== undefined) {
      dataToSave.heroPhrases = heroPhrases;
    }

    if (viewerAccount !== undefined) {
      dataToSave.viewerAccount = {
        ...defaultViewerAccount,
        ...(viewerAccount || {})
      };
    }

    if (liveStats !== undefined) {
      dataToSave.liveStats = {
        headline:
          liveStats?.headline ||
          defaultLiveStats.headline,

        description:
          liveStats?.description ||
          defaultLiveStats.description,

        subscriptions: normalizeLiveStatsItems(
          liveStats?.subscriptions
        ),

        management: normalizeLiveStatsItems(
          liveStats?.management
        ),

        bots: normalizeLiveStatsItems(
          liveStats?.bots
        )
      };
    }

    if (smartNotifications !== undefined) {
      dataToSave.smartNotifications =
        normalizeSmartNotifications(
          smartNotifications
        );
    }

    if (welcomeAudio !== undefined) {
      dataToSave.welcomeAudio =
        normalizeWelcomeAudio(
          welcomeAudio
        );
    }

    await db
      .collection('settings')
      .doc('general')
      .set(dataToSave, { merge: true });

    const updatedDoc = await db
      .collection('settings')
      .doc('general')
      .get();

    const updatedData = updatedDoc.data() || {};

    return res.status(200).json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح',
      data: {
        ...updatedData,
        welcomeAudio:
          normalizeWelcomeAudio(
            updatedData.welcomeAudio
          )
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ أثناء حفظ الإعدادات'
    });
  }
};

// =============================
// 🎧 UPLOAD AUDIO
// =============================
const uploadWelcomeAudio = async (req, res) => {
  let localFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لا يوجد ملف صوت مرفوع'
      });
    }

    localFilePath = req.file.path;

    const result = await cloudinary.uploader.upload(
      localFilePath,
      {
        resource_type: 'video',
        folder: 'cr7/welcome-audio',
        use_filename: true,
        unique_filename: true,
        overwrite: false
      }
    );

    if (!result?.secure_url) {
      throw new Error(
        'لم يتم استلام رابط ملف الصوت من Cloudinary'
      );
    }

    const audioUrl = result.secure_url;

    const currentDoc = await db
      .collection('settings')
      .doc('general')
      .get();

    const currentData = currentDoc.exists
      ? currentDoc.data()
      : {};

    const currentWelcomeAudio =
      currentData?.welcomeAudio || {};

    const parsedCurrentVolume = Number(
      currentWelcomeAudio.volume
    );

    const welcomeAudioToSave = {
      enabled: true,
      audioUrl,
      volume: Number.isFinite(parsedCurrentVolume)
        ? Math.min(
            1,
            Math.max(0, parsedCurrentVolume)
          )
        : 0.5,
      loop: currentWelcomeAudio.loop !== false
    };

    await db
      .collection('settings')
      .doc('general')
      .set(
        {
          welcomeAudio: welcomeAudioToSave
        },
        {
          merge: true
        }
      );

    if (
      localFilePath &&
      fs.existsSync(localFilePath)
    ) {
      fs.unlinkSync(localFilePath);
      localFilePath = null;
    }

    return res.status(200).json({
      success: true,
      message:
        'تم رفع صوت الترحيب وتفعيله بنجاح',
      audioUrl,
      welcomeAudio: welcomeAudioToSave
    });
  } catch (error) {
    console.error(
      'Upload welcome audio error:',
      error
    );

    if (
      localFilePath &&
      fs.existsSync(localFilePath)
    ) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (unlinkError) {
        console.error(
          'Delete temporary audio error:',
          unlinkError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'حدث خطأ أثناء رفع ملف الصوت'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  uploadWelcomeAudio
};
