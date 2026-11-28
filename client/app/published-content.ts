import {readDisclosure} from "./disclosure-data";
import {fields,type FieldId,type FieldSettings} from "./four-sectors";
import {readFundSettings} from "./fund-publication";

const asObject=(v:unknown):Record<string,unknown>=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
const text=(v:unknown,max:number)=>typeof v==="string"&&v.length<=max?v.trim():"";
const count=(v:unknown,max:number)=>typeof v==="number"&&Number.isFinite(v)&&v>=0&&v<=max?v:undefined;
const images=["property","gold","market","energy","hero","portfolio","income","stocks","editorial"];
function telegram(v:unknown,invite=false){
  const link=text(v,160);
  return /^https:\/\/t\.me\/[a-z][a-z0-9_]{3,31}$/i.test(link)||(invite&&/^https:\/\/t\.me\/\+[a-z0-9_-]{8,80}$/i.test(link))?link:"";
}
function reviewDate(value:unknown){
  const date=text(value,10);
  const parsed=new Date(date+"T00:00:00Z");
  return /^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(+parsed)&&parsed.toISOString().slice(0,10)===date&&+parsed<=Date.now()?date:"";
}
export function readContent(input:unknown){
  const c=asObject(input),f=asObject(c.funds),h=asObject(c.home),e=asObject(c.explorer),t=asObject(c.contact);
  const funds=Object.fromEntries(fields.filter(field=>Object.hasOwn(f,field.id)).map(({id})=>{
    const x=asObject(f[id]),photo=text(x.photo,30),source=text(x.source,140),asOf=reviewDate(x.asOf);
    const show=x.publishTerms===true&&!!source&&!!asOf;
    return [id,{name:text(x.name,100),intro:text(x.intro,380),photo:images.includes(photo)?photo:"",keywords:text(x.keywords,250),inExplorer:x.inExplorer!==false,rate:show?count(x.rate,100):undefined,minimum:show?count(x.minimum,1e9):undefined,source,asOf}];
  })) as Partial<Record<FieldId,{name:string;intro:string;photo:string;keywords:string;inExplorer:boolean;rate?:number;minimum?:number;source:string;asOf:string}>>;
  return {funds,disclosure:readDisclosure(c.disclosure),home:{headline:text(h.headline,130),intro:text(h.intro,350)},
    explorer:{title:text(e.title,100),intro:text(e.intro,280),placeholder:text(e.placeholder,120),quickSearch:text(e.quickSearch,160).split(/[,،]+/).map(s=>s.trim()).filter(Boolean).slice(0,8),byRate:e.byRate!==false},
    contact:{title:text(t.title,100),message:text(t.message,350),telegramChat:telegram(t.telegramChat),telegramChannel:telegram(t.telegramChannel,true),hideChat:t.hideChat===true}};
}
export type PublishedContent = ReturnType<typeof readContent>;
export function publishedFundSettings(content:PublishedContent, opportunities:Parameters<typeof readFundSettings>[0]):FieldSettings{
  const result=readFundSettings(opportunities);
  for(const {id} of fields){
    const item=content.funds[id];
    if(!item)continue;
    delete result[id];
    if(item.source&&item.asOf&&(item.rate!==undefined||item.minimum!==undefined))
      result[id]={rate:item.rate,minimum:item.minimum,source:item.source,asOf:item.asOf};
  }
  return result;
}
