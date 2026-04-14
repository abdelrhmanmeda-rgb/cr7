const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.status(200).send('🔥 Vercel is working perfectly! المشكلة في أحد ملفات المشروع وليس في الاستضافة');
});

module.exports = app;