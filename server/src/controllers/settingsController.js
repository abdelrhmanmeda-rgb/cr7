const { db } = require('../config/firebase');

const defaultViewerAccount = {
  accountNumber: '',
  broker: '',
  server: '',
  password: '',
  platform: '',
  note: ''
};

const defaultSettings = {
  contact: { telegram: '', whatsapp: '', email: '' },
  faqs: [],
  terms: '',
  aboutUs: '',
  heroPhrases: ['يعمل لأجلك', 'يحقق أحلامك', 'يصنع ثروتك'],
  viewerAccount: defaultViewerAccount
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
    const { contact, faqs, terms, aboutUs, heroPhrases, viewerAccount } = req.body;

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
