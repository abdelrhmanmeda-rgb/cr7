'use strict';
const express=require('express');
const {createHash}=require('node:crypto');
const {initializeApp,cert,getApps}=require('firebase-admin/app');
const {getAuth}=require('firebase-admin/auth');
const {getFirestore}=require('firebase-admin/firestore');

const {Problem,fail,entryInput,post,statement,publication}=require('./book');
const {seal,open}=require('./publication-seal');
const initial={version:1,revision:0,metrics:[],opportunities:[]};
let ctx;
function config(){
 if(process.env.SGF_UNIVERSE_ENABLED!=='1')fail(503,'الخدمة غير مفعّلة.');
 if(ctx)return ctx;
 try{const svc=JSON.parse(process.env.SGF_UNIVERSE_FIREBASE_SERVICE_ACCOUNT||'null');
 if(svc?.project_id!=='smart-gulf-funds'||process.env.FIREBASE_PROJECT_ID!=='cr7bot-85133')throw Error();
 const app=getApps().find(x=>x.name==='sgf-private-book')||initializeApp({credential:cert(svc),projectId:svc.project_id},'sgf-private-book');
 ctx={db:getFirestore(app,'sgf-universe'),ownerAuth:getAuth(app)};return ctx;
 }catch{fail(503,'إعداد الخدمة غير مكتمل.');}
}
function publicationStore(configure){
 const store=process.env.SGF_PUBLICATION_STORE;
 // Existing ledger deployments keep their publication collection unless explicitly migrated.
 if(store==='ledger'||(!store&&process.env.SGF_UNIVERSE_ENABLED==='1'))return {db:configure().db};
 if(store&&store!=='legacy')fail(503,'مصدر نشر المحتوى غير صالح.');
 const signingKey=process.env.SGF_PUBLICATION_SIGNING_KEY?.trim()||process.env.FIREBASE_PRIVATE_KEY?.trim();
 if(!signingKey||signingKey.length<32)fail(503,'مفتاح توقيع محتوى الموقع ناقص.');
 return {db:require('../config/firebase').db,signingKey};
}
// A server-side account fingerprint, limited to publication. Explicit env configuration overrides it.
const defaultPublisherFingerprint='e4faa4497c770da159fb73be321e320f63276f15c1c119bbebbe3ad15436d918';
const fingerprint=uid=>createHash('sha256').update(uid,'utf8').digest('hex');
function makeRouter(configure=config, legacy=()=>require('../config/firebase').auth, publicDb=()=>publicationStore(configure), publisherFingerprint=defaultPublisherFingerprint){

const router=express.Router();
async function identity(req,admin){
 const raw=req.headers.authorization||'';
 if(typeof raw!=='string'||!/^Bearer [^\s]+$/.test(raw)||raw.length>12000)fail(401,'سجّل دخولك.');
 const auth=admin?legacy():configure().ownerAuth;
 let token;try{token=await auth.verifyIdToken(raw.slice(7),true)}catch{fail(401,'انتهت جلسة الدخول.');}
 if(admin){
  const allowed=(process.env.SGF_UNIVERSE_ADMIN_UIDS||'').split(',').map(x=>x.trim()).filter(Boolean);
  const fallback=admin==='publication'&&!allowed.length?publisherFingerprint:null;
  if(!allowed.length&&!fallback)fail(503,admin==='publication'?'قائمة حسابات الإدارة المصرّح لها بالنشر لسه مش متضبطة.':'قائمة حسابات إدارة السجل لسه مش متضبطة.');
  if(typeof token.uid!=='string'||!(allowed.includes(token.uid)||(fallback&&fingerprint(token.uid)===fallback)))fail(403,'ما عندك صلاحية الإدارة.');
 }
 else if(token.email_verified!==true)fail(403,'أكّد بريدك الإلكتروني.');
 return token.uid;
}
async function target(q){
 const keys=['uid','email'].filter(k=>typeof q[k]==='string'&&q[k].trim());if(keys.length!==1)fail(400,'أدخل بريد أو معرّف واحد.');
 const key=keys[0],v=q[key].trim();if(v.length>(key==='uid'?128:254))fail(400,'معرّف غير صالح.');
 try{const auth=configure().ownerAuth; const u=await (key==='uid'?auth.getUser(v):auth.getUserByEmail(v));if(u.disabled||!u.emailVerified)fail(409,'الحساب غير مفعّل أو بريده غير مؤكّد.');return u;}catch(err){if(err instanceof Problem)throw err;if(err.code==='auth/user-not-found')fail(404,'ما لقينا الحساب.');if(['auth/invalid-email','auth/invalid-uid'].includes(err.code))fail(400,'معرّف غير صالح.');throw err;}
}
const handler=fn=>async(req,res)=>{res.set('Cache-Control','private, no-store');try{await fn(req,res)}catch(err){const status=err instanceof Problem?err.status:503;res.status(status).json({success:false,message:err instanceof Problem?err.message:'الخدمة غير متوفرة الحين.'});}};
function published(snapshot,signingKey){
 if(!snapshot.exists)return initial;
 const stored=snapshot.data(),data=signingKey?open(stored,signingKey):stored;
 if(!data)fail(503,'تعذّر التحقق من سلامة النسخة المنشورة.');
 return publication(data);
}
const pub=(db,signingKey)=>db.collection(signingKey?'sgf_publication':'publication').doc('approved');
router.get('/public',handler(async(req,res)=>{
 const {db,signingKey}=publicDb(),data=published(await pub(db,signingKey).get(),signingKey);
 res.set('Cache-Control','public, max-age=0, s-maxage=30').json({success:true,data});
}));
router.get('/admin/publication',handler(async(req,res)=>{
 await identity(req,'publication');
 const {db,signingKey}=publicDb();
 res.json({success:true,data:published(await pub(db,signingKey).get(),signingKey)});
}));
router.put('/admin/publication',handler(async(req,res)=>{
 const actor=await identity(req,'publication'),next=publication(req.body),{db,signingKey}=publicDb(),ref=pub(db,signingKey);
 const data=await db.runTransaction(async tx=>{
  const old=published(await tx.get(ref),signingKey);
  if(old.revision!==next.revision)fail(409,'فيه نسخة أحدث.');
  // An older dashboard doesn't send the disclosure field; keep the published version in that case.
  const content=next.content===undefined?old.content:
   next.content.disclosure===undefined&&old.content?.disclosure!==undefined?
   {...next.content,disclosure:old.content.disclosure}:next.content;
  const fresh=publication({...next,revision:old.revision+1,...(content===undefined?{}:{content})});
  const stored=signingKey?seal(fresh,signingKey):fresh;
  tx.set(ref,stored);tx.create(db.collection(signingKey?'sgf_publicationAudit':'publicationAudit').doc(String(fresh.revision)),{actor,at:new Date().toISOString(),snapshot:stored});
  return fresh;
 });
 res.json({success:true,data});
}));
router.get('/me',handler(async(req,res)=>{const uid=await identity(req,false);res.json(await statement(configure().db,uid));}));
router.get('/admin/account',handler(async(req,res)=>{await identity(req,true);const u=await target(req.query);res.json({uid:u.uid,email:u.email,...await statement(configure().db,u.uid)});}));
router.post('/admin/entries',handler(async(req,res)=>{const actor=await identity(req,true),e=entryInput(req.body);await target({uid:e.uid});const result=await post(configure().db,e,actor);res.status(result.duplicate?200:201).json({success:true,...result});}));
return router;
}
module.exports=makeRouter();
module.exports.makeRouter=makeRouter;
