'use strict';
const {disclosure}=require('./disclosures');

const ids=['property','gold','market','energy'];
const images=[...ids,'hero','portfolio','income','stocks','editorial'];
const isRecord=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
function telegram(value, invite, fail){
  const raw=value.trim();
  if(!raw)return '';
  const name=raw.replace(/^https:\/\/t\.me\//i,'').replace(/^@/,'').replace(/\/$/,'');
  if(!/^[a-z][a-z0-9_]{3,31}$/i.test(name) && !(invite && /^\+[a-z0-9_-]{8,80}$/i.test(name)))fail(400,'استخدم اسم مستخدم تيليجرام أو رابط https://t.me للقناة أو المحادثة.');
  return 'https://t.me/'+name;
}
function content(input, {fail,textField,dateField}){
  if(!isRecord(input))fail(400,'إعدادات الموقع غير صالحة.');
  const optional=(v,n)=>textField(v??'',n,true);
  const group=(v)=>{if(v===undefined)return {};if(!isRecord(v))fail(400,'إعدادات الموقع غير صالحة.');return v;};
  const f=group(input.funds), e=group(input.explorer), h=group(input.home), c=group(input.contact), funds={};
  const amount=(v,cap)=>{if(v===undefined||v===null)return null;if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>cap||Math.abs(v*100-Math.round(v*100))>1e-4)fail(400,'راجع العائد والحد الأدنى. استخدم رقمًا بمنزلتين عشريتين كحد أقصى.');return v;};
  for(const id of ids){
    if(!Object.hasOwn(f,id))continue;
    const v=group(f[id]),rate=amount(v.rate,100),minimum=amount(v.minimum,1e9),publish=v.publishTerms===true;
    const photo=optional(v.photo,30);
    if(photo&&!images.includes(photo))fail(400,'اختر صورة من الصور المتاحة.');
    const source=publish&&(rate!==null||minimum!==null)?textField(v.source,140):'';
    const asOf=source?dateField(v.asOf):'';
    funds[id]={name:optional(v.name,100),intro:optional(v.intro,380),photo, keywords:optional(v.keywords,250),
      inExplorer:v.inExplorer!==false, rate:publish?rate:null,minimum:publish?minimum:null,source,asOf,publishTerms:publish};
  }
  return {funds,...(input.disclosure===undefined?{}:{disclosure:disclosure(input.disclosure,{fail,textField,dateField})}),home:{headline:optional(h.headline,130),intro:optional(h.intro,350)},
    explorer:{title:optional(e.title,100),intro:optional(e.intro,280),placeholder:optional(e.placeholder,120),quickSearch:optional(e.quickSearch,160),byRate:e.byRate!==false},
    contact:{title:optional(c.title,100),message:optional(c.message,350),telegramChat:telegram(optional(c.telegramChat,160),false,fail),telegramChannel:telegram(optional(c.telegramChannel,160),true,fail),hideChat:c.hideChat===true}};
}
module.exports={content};
