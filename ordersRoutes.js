const router = require('express').Router();
const multer = require('multer');
const admin = require('firebase-admin');
const verifyAdmin = require('../middlewares/verifyAdmin');
const {createOrder,getOrders,updateOrder} = require('../controllers/ordersController');
const upload = multer({storage:multer.memoryStorage(),limits:{fileSize:2*1024*1024,files:1,fields:5,fieldSize:1024},fileFilter:(req,file,cb) => {
  if (!['image/jpeg','image/png','image/webp'].includes(file.mimetype)) return cb(new Error('مسموح بصور JPG وPNG وWEBP فقط'));
  cb(null,true);
}});
const verifyCustomer = async (req,res,next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({success:false,message:'سجّل دخول الأول'});
  try { req.customer = await admin.auth().verifyIdToken(header.slice(7)); next(); }
  catch { res.status(401).json({success:false,message:'سجّل دخول تاني وحاول'}); }
};
router.post('/',verifyCustomer,(req,res,next) => upload.single('proof')(req,res,error => {
  if (error) return res.status(400).json({success:false,message:error.code === 'LIMIT_FILE_SIZE' ? 'حجم الصورة أقصى 2 ميجا' : 'راجع الصورة وبيانات الطلب'});
  next();
}),createOrder);
router.get('/',verifyAdmin,getOrders);
router.put('/:id/status',verifyAdmin,updateOrder);
module.exports=router;
