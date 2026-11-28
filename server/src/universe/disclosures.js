'use strict';

const fundIds=['property','gold','market','energy'];
const documentKinds=['factsheet','terms','performance'];
const entityKeys={name:160,form:100,jurisdiction:100,regulator:140,registration:80,license:80,activity:200};
const offerStates=['scheduled','open','closed'];
const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);

function disclosure(input,{fail,textField,dateField}){
 const group=v=>{if(v===undefined)return {};if(!record(v))fail(400,'راجع حقول الإفصاحات.');return v;};
 const optional=(v,n)=>textField(v??'',n,true);
 const date=v=>{
  const day=textField(v,10),d=new Date(day+'T00:00:00Z');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(+d)||d.toISOString().slice(0,10)!==day)fail(400,'راجع تواريخ فترة الطرح.');
  return day;
 };
 const proof=v=>({published:true,source:textField(v.source,140),asOf:dateField(v.asOf)});
 const raw=group(input),entity=group(raw.entity),offer=group(raw.offer),result={};
 if(entity.published===true){
  const values=Object.fromEntries(Object.entries(entityKeys).map(([key,max])=>[key,optional(entity[key],max)]));
  if(!values.name||!values.jurisdiction||Boolean(values.license)!==Boolean(values.regulator)||
     [values.license,values.registration].some(v=>/^(demo|test|sample)(\b|[-_\d])/iu.test(v)))fail(400,'أدخل اسم الكيان ونطاق التسجيل وبيانات ترخيص فعلية؛ رقم الترخيص والجهة الرقابية يُنشران معًا.');
  result.entity={...values,...proof(entity)};
 }
 if(offer.published===true){
  const start=date(offer.start),end=date(offer.end),price=offer.unitPrice??null;
  if(!offerStates.includes(offer.status)||start>end||price!==null&&(typeof price!=='number'||!Number.isFinite(price)||price<=0||price>1e9||Math.abs(price*100-Math.round(price*100))>1e-4))fail(400,'راجع حالة الطرح وتواريخه وسعر الوحدة.');
  result.offer={status:offer.status,start,end,unitPrice:price,eligibility:optional(offer.eligibility,250),...proof(offer)};
 }
 const docs=group(raw.documents),published={};
 for(const fund of fundIds){
  const files=group(docs[fund]),entries={};
  for(const kind of documentKinds){
   const doc=group(files[kind]);
   if(doc.published===true)entries[kind]={body:textField(doc.body,4000),...proof(doc)};
  }
  if(Object.keys(entries).length)published[fund]=entries;
 }
 if(Object.keys(published).length)result.documents=published;
 return result;
}
module.exports={disclosure};
