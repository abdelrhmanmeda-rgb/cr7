const cloudinary = require('../config/cloudinary');
const { db } = require('../config/firebase');
const crypto = require('crypto');

const payment = { address: 'TKw4wpm7EB9BERFhvMVnK2GZ5Sqnc2gtBC', binanceId: '112375457', currency: 'USDT', network: 'TRC20' };
const imageKind = buffer => {
  if (buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return 'image/jpeg';
  if (buffer.length >= 8 && buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'image/png';
  if (buffer.length >= 12 && buffer.toString('ascii',0,4) === 'RIFF' && buffer.toString('ascii',8,12) === 'WEBP') return 'image/webp';
  return '';
};
const createOrder = async (req, res) => {
  let uploaded;
  let saved = false;
  try {
    const { botId, contact, method, requestId } = req.body;
    if (typeof botId !== 'string' || !botId || botId.length > 200 || botId.includes('/') || typeof contact !== 'string' || !contact.trim() || contact.length > 120 || !['trc20','binance'].includes(method) || !/^[a-f0-9-]{36}$/i.test(requestId || '')) return res.status(400).json({success:false,message:'راجع بيانات الطلب ووسيلة التواصل'});
    if (!req.file || imageKind(req.file.buffer) !== req.file.mimetype) return res.status(400).json({success:false,message:'ارفع صورة إثبات دفع صحيحة'});
    const id = crypto.createHash('sha256').update(req.customer.uid + ':' + requestId).digest('hex');
    const ref = db.collection('purchase_orders').doc(id);
    const existing = await ref.get();
    if (existing.exists) return res.json({success:true,data:{id,status:existing.data().status}});
    const botDoc = await db.collection('bots').doc(botId).get();
    if (!botDoc.exists) return res.status(404).json({success:false,message:'البوت غير موجود'});
    const bot = botDoc.data();
    const rawPrice = String(bot.price || '').trim();
    const amount = /^\d+(\.\d{1,2})?$/.test(rawPrice) ? Number(rawPrice) : NaN;
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({success:false,message:'سعر البوت غير متاح للدفع، تواصل مع الإدارة'});
    uploaded = await new Promise((resolve,reject) => {
      const stream = cloudinary.uploader.upload_stream({folder:'cr7_payment_proofs',type:'authenticated',resource_type:'image'},(error,result) => error ? reject(error) : resolve(result));
      stream.end(req.file.buffer);
    });
    const record = {
      userId:req.customer.uid, email:req.customer.email || '', botId, botName:bot.name || 'بوت', amount,
      contact:contact.trim(), method, payment, status:'pending', createdAt:new Date().toISOString(),
      proofPublicId:uploaded.public_id, proofVersion:uploaded.version, proofFormat:uploaded.format
    };
    try { await ref.create(record); saved = true; }
    catch (error) {
      if (error.code !== 6 && error.code !== 'already-exists') throw error;
      await cloudinary.uploader.destroy(uploaded.public_id,{type:'authenticated',resource_type:'image'}); uploaded = null;
      return res.json({success:true,data:{id,status:'pending'}});
    }
    return res.status(201).json({success:true,data:{id,status:'pending'}});
  } catch(error) {
    if (uploaded && !saved) { try { await cloudinary.uploader.destroy(uploaded.public_id,{type:'authenticated',resource_type:'image'}); } catch {} }
    console.error('Order creation failed:',error.message);
    return res.status(500).json({success:false,message:'تعذر حفظ الطلب، حاول تاني'});
  }
};
const getOrders = async (req,res) => {
  res.set('Cache-Control','no-store');
  try {
    const snapshot = await db.collection('purchase_orders').orderBy('createdAt','desc').limit(200).get();
    const data = snapshot.docs.map(doc => {
      const order = doc.data();
      const proofUrl = cloudinary.url(order.proofPublicId,{type:'authenticated',resource_type:'image',secure:true,sign_url:true,version:order.proofVersion,format:order.proofFormat});
      const {proofPublicId,proofVersion,proofFormat,...details}=order;
      return {id:doc.id,...details,proofUrl};
    });
    res.json({success:true,data});
  } catch(error) { res.status(500).json({success:false,message:'تعذر تحميل الطلبات'}); }
};
const updateOrder = async (req,res) => {
  const {status} = req.body;
  if (!['approved','rejected'].includes(status) || !/^[a-f0-9]{64}$/.test(req.params.id)) return res.status(400).json({success:false,message:'بيانات غير صحيحة'});
  try {
    await db.runTransaction(async tx => {
      const ref = db.collection('purchase_orders').doc(req.params.id);
      const doc = await tx.get(ref);
      if (!doc.exists) { const e=new Error('الطلب غير موجود'); e.status=404; throw e; }
      if (doc.data().status !== 'pending') { const e=new Error('الطلب تمت مراجعته بالفعل، حدّث القائمة'); e.status=409; throw e; }
      tx.update(ref,{status,reviewedAt:new Date().toISOString()});
    });
    res.json({success:true});
  } catch(error) { res.status(error.status || 500).json({success:false,message:error.status ? error.message : 'تعذر تحديث الطلب'}); }
};
module.exports={createOrder,getOrders,updateOrder};
