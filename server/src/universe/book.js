'use strict';
const {createHash}=require('node:crypto');
class Problem extends Error{constructor(status,message){super(message);this.status=status}}
const fail=(s,m)=>{throw new Problem(s,m)};
function textField(x,n,optional=false){if(typeof x!=='string'||x.trim().length>n||(!optional&&!x.trim())||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(x))fail(400,'راجع الحقول المدخلة.');return x.trim()}
const hash=(x)=>createHash('sha256').update(x).digest('hex');
const empty=()=>({currency:'USD',capitalMinor:0,resultMinor:0,balanceMinor:0,sequence:0});
function entryInput(b){
 if(!b||!['deposit','withdrawal','gain','loss'].includes(b.kind)||typeof b.amount!=='string'||!/^\d{1,11}(\.\d{1,2})?$/.test(b.amount))fail(400,'اكتب مبلغ موجب بحد أقصى منزلتين عشريتين.');
 const [h,d='']=b.amount.split('.'),amountMinor=Number(h)*100+Number(d.padEnd(2,'0'));
 if(!amountMinor)fail(400,'المبلغ لازم يكون أكبر من صفر.');
 const uid=textField(b.uid,128),reference=textField(b.reference,180).normalize('NFKC').trim();
 if(reference.length<3||reference.length>180||!/^([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i.test(b.requestId||''))fail(400,'مرجع العملية أو رقم الطلب غير صالح.');
 return {uid,kind:b.kind,amountMinor,reference,requestId:b.requestId.toLowerCase()};
}
function change(prev,e){const p=prev||empty(),sign=['deposit','gain'].includes(e.kind)?1:-1,delta=sign*e.amountMinor;
 const capitalMinor=p.capitalMinor+(['deposit','withdrawal'].includes(e.kind)?delta:0);
 const resultMinor=p.resultMinor+(['gain','loss'].includes(e.kind)?delta:0);
 const balanceMinor=capitalMinor+resultMinor,sequence=p.sequence+1;
 if(![capitalMinor,resultMinor,balanceMinor,sequence].every(Number.isSafeInteger)||balanceMinor<0)fail(409,'الرصيد لا يسمح بتسجيل هذا القيد.');
 return {currency:'USD',capitalMinor,resultMinor,balanceMinor,sequence};}
async function post(db,e,actor){
 const book=db.collection('books').doc(hash(e.uid)), ref=book.collection('evidence').doc(hash(e.reference.toLowerCase())), item=book.collection('entries').doc(e.requestId), audit=db.collection('audit').doc(hash(e.uid+'\0'+e.requestId));
 return db.runTransaction(async tx=>{
 const [snapshot,prior,reference]=await Promise.all([tx.get(book),tx.get(item),tx.get(ref)]);
 if(prior.exists){const v=prior.data();if(v.kind===e.kind&&v.amountMinor===e.amountMinor&&v.reference===e.reference&&v.actor===actor)return {id:item.id,duplicate:true};fail(409,'رقم الطلب مستخدم لقيد مختلف.');}
 if(reference.exists)fail(409,'مرجع الإثبات اتسجّل قبل كده.');
 const next=change(snapshot.data(),e), entry={...e,...next,actor,at:new Date().toISOString()};
 tx.set(book,next);tx.create(item,entry);tx.create(ref,{entryId:item.id});tx.create(audit,{...entry,entryId:item.id});
 return {id:item.id,duplicate:false};
 });
}
async function statement(db,uid){
 const book=db.collection('books').doc(hash(uid));
 return db.runTransaction(async tx=>{const [summary,rows]=await Promise.all([tx.get(book),tx.get(book.collection('entries').orderBy('sequence','desc').limit(366))]);const s=summary.data()||empty();
 return {currency:'USD',balanceMinor:s.balanceMinor,capitalMinor:s.capitalMinor,resultMinor:s.resultMinor,entries:rows.docs.reverse().map(doc=>{const {kind,amountMinor,at,balanceMinor}=doc.data();return {id:doc.id,kind,amountMinor,at,balanceMinor};}),historyTruncated:s.sequence>366};
 },{readOnly:true});
}
const sectors=['property','gold','market','energy','funds','income','stocks','portfolio','compare'];
function publication(b){
 if(!b||b.version!==1||!Number.isSafeInteger(b.revision)||b.revision<0||!Array.isArray(b.metrics)||b.metrics.length>4||!Array.isArray(b.opportunities)||b.opportunities.length>60)fail(400,'البيانات غير صالحة.');
 const seen=new Set();
 function common(v){if(!v||v.published!==true||v.verified!==true||typeof v.id!=='string'||!/^[a-z0-9][a-z0-9-]{1,64}$/.test(v.id)||seen.has(v.id))fail(400,'حدد بيانات موثقة ومعرّف فريد.');seen.add(v.id);
 const asOf=textField(v.asOf,10),dt=new Date(asOf+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(asOf)||!Number.isFinite(+dt)||dt.toISOString().slice(0,10)!==asOf||+dt>Date.now())fail(400,'راجع تاريخ التوثيق.');
 return {id:v.id,source:textField(v.source,140),asOf,published:true,verified:true};}
 const metrics=b.metrics.map(m=>{const base=common(m);if(typeof m.value!=='number'||!Number.isFinite(m.value)||Math.abs(m.value)>Number.MAX_SAFE_INTEGER)fail(400,'راجع قيمة المؤشر.');return {...base,label:textField(m.label,80),value:m.value,unit:textField(m.unit??'',28,true)}});
 const opportunities=b.opportunities.map(m=>{const base=common(m);if(!sectors.includes(m.sector))fail(400,'راجع المجال.');
 return {...base,sector:m.sector,name:textField(m.name,100),location:textField(m.location??'',90,true),intro:textField(m.intro,380),strategy:textField(m.strategy,2000),risks:textField(m.risks,1500),liquidity:textField(m.liquidity,1000),featured:m.featured===true};});
 const result={version:1,revision:b.revision,metrics,opportunities};
 if(Buffer.byteLength(JSON.stringify(result))>700000)fail(400,'حجم المحتوى أكبر من الحد المتاح.');
 return result;
}
module.exports={Problem,fail,empty,entryInput,change,post,statement,publication};
