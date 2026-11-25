'use strict';

const {createHmac,timingSafeEqual}=require('node:crypto');
function canonical(value){
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(value!==null&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function digest(data,key){
  return createHmac('sha256',key).update('sgf-publication-v1\0').update(canonical(data)).digest('hex');
}
function seal(data,key){return {data,seal:digest(data,key)};}
function open(value,key){
  if(!value?.data||typeof value.seal!=='string'||!/^[0-9a-f]{64}$/.test(value.seal))return null;
  return timingSafeEqual(Buffer.from(value.seal,'hex'),Buffer.from(digest(value.data,key),'hex'))?value.data:null;
}
module.exports={seal,open};
