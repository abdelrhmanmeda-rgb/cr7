require('dotenv').config();

const isInvestmentPreview = process.env.VERCEL_ENV === 'preview' &&
  (process.env.INVESTMENT_MODE === 'sandbox' || process.env.VERCEL_GIT_COMMIT_REF === 'feat/investment-preview');

if (!isInvestmentPreview) {
  module.exports = require('./legacyApp');
} else {
  // The investment preview branch never initializes CR7's customer database or routes.
  module.exports = require('../investment/preview-entry.cjs').createPreview(process.env);
}
