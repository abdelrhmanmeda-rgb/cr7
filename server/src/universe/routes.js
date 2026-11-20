'use strict';
const express=require('express');
const {initializeApp,cert,getApps}=require('firebase-admin/app');
const {getAuth}=require('firebase-admin/auth');
const {getFirestore}=require('firebase-admin/firestore');

const {Problem,fail,entryInput,post,statement,publication}=require('./book');
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
function makeRouter(configure=config, legacy=()=>require('../config/firebase').auth){
const router=express.Router();
async function identity(req,admin){
 const ctx=configure(), auth=admin?legacy():ctx.ownerAuth, raw=req.headers.authorization||'';
 if(typeof raw!=='string'||!/^Bearer [^\s]+$/.test(raw)||raw.length>12000)fail(401,'سجّل دخولك.');
 let token;try{token=await auth.verifyIdToken(raw.slice(7),true)}catch{fail(401,'انتهت جلسة الدخول.');}
 if(admin){const allowed=(process.env.SGF_UNIVERSE_ADMIN_UIDS||'').split(',').map(x=>x.trim()).filter(Boolean);if(!allowed.includes(token.uid))fail(403,'ما عندك صلاحية الإدارة.');}
 else if(token.email_verified!==true)fail(403,'أكّد بريدك الإلكتروني.');
 return token.uid;
}
async function target(q){
 const keys=['uid','email'].filter(k=>typeof q[k]==='string'&&q[k].trim());if(keys.length!==1)fail(400,'أدخل بريد أو معرّف واحد.');
 const key=keys[0],v=q[key].trim();if(v.length>(key==='uid'?128:254))fail(400,'معرّف غير صالح.');
 try{const auth=configure().ownerAuth; const u=await (key==='uid'?auth.getUser(v):auth.getUserByEmail(v));if(u.disabled||!u.emailVerified)fail(409,'الحساب غير مفعّل أو بريده غير مؤكّد.');return u;}catch(err){if(err instanceof Problem)throw err;if(err.code==='auth/user-not-found')fail(404,'ما لقينا الحساب.');if(['auth/invalid-email','auth/invalid-uid'].includes(err.code))fail(400,'معرّف غير صالح.');throw err;}
}
const handler=fn=>async(req,res)=>{res.set('Cache-Control','private, no-store');try{await fn(req,res)}catch(err){const status=err instanceof Problem?err.status:503;res.status(status).json({success:false,message:err instanceof Problem?err.message:'الخدمة غير متوفرة الحين.'});}};
const pub=db=>db.collection('publication').doc('approved');
router.get('/public',handler(async(req,res)=>{if(process.env.SGF_UNIVERSE_ENABLED!=='1')return res.json({success:true,data:initial});const s=await pub(configure().db).get();const data=s.exists?publication(s.data()):initial;res.set('Cache-Control','public, max-age=0, s-maxage=30').json({success:true,data});}));
router.get('/admin/publication',handler(async(req,res)=>{await identity(req,true);const s=await pub(configure().db).get();res.json({success:true,data:s.exists?publication(s.data()):initial});}));
router.put('/admin/publication',handler(async(req,res)=>{const actor=await identity(req,true);const next=publication(req.body);const db=configure().db,ref=pub(db);const data=await db.runTransaction(async tx=>{const old=(await tx.get(ref)).data()||initial;if(old.revision!==next.revision)fail(409,'فيه نسخة أحدث.');const fresh={...next,revision:old.revision+1};tx.set(ref,fresh);tx.create(db.collection('publicationAudit').doc(String(fresh.revision)),{actor,at:new Date().toISOString(),snapshot:fresh});return fresh;});res.json({success:true,data});}));
router.get('/me',handler(async(req,res)=>{const uid=await identity(req,false);res.json(await statement(configure().db,uid));}));
router.get('/admin/account',handler(async(req,res)=>{await identity(req,true);const u=await target(req.query);res.json({uid:u.uid,email:u.email,...await statement(configure().db,u.uid)});}));
router.post('/admin/entries',handler(async(req,res)=>{const actor=await identity(req,true),e=entryInput(req.body);await target({uid:e.uid});const result=await post(configure().db,e,actor);res.status(result.duplicate?200:201).json({success:true,...result});}));
return router;
}
module.exports=makeRouter();
module.exports.makeRouter=makeRouter;
