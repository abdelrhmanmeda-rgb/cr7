import { useState } from 'react';
import { DisclosureEditor,readDisclosureDraft,serializeDisclosure,type DisclosureDraft } from './DisclosureEditor';

export const fundIds=['property','gold','market','energy'] as const;
type FundId=typeof fundIds[number];
const funds:Record<FundId,string>={property:'العقارات',gold:'الذهب والمعادن الثمينة',market:'الأسواق المالية والتداول',energy:'الطاقة والمشروعات'};
const pictures={property:'العقارات',gold:'الذهب',market:'الأسواق',energy:'الطاقة',hero:'الرئيسية',portfolio:'المحافظ',income:'الدخل',stocks:'الأسهم',editorial:'مركز المعرفة'};
export type FundDraft={name:string;intro:string;photo:string;keywords:string;inExplorer:boolean;rate:string;minimum:string;source:string;asOf:string;publishTerms:boolean};
export type Draft={disclosure:DisclosureDraft;funds:Record<FundId,FundDraft>;home:{headline:string;intro:string};explorer:{title:string;intro:string;placeholder:string;quickSearch:string;byRate:boolean};contact:{title:string;message:string;telegramChat:string;telegramChannel:string;hideChat:boolean}};
export type ContentTab='funds'|'explorer'|'contact'|'home'|'disclosure';
const txt=(x:unknown)=>typeof x==='string'?x:'';
const numeric=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)?String(x):'';
const record=(x:unknown):Record<string,unknown>=>x&&typeof x==='object'&&!Array.isArray(x)?x as Record<string,unknown>:{};
const rateLine=/^العائد الأسبوعي المستهدف: ([0-9]{1,3}(?:\.[0-9]{1,2})?)%$/u;
const minLine=/^الحد الأدنى للاشتراك: ([0-9]{1,10}(?:\.[0-9]{1,2})?) دولار أمريكي$/u;
function legacyValue(value:unknown,pattern:RegExp){
  const found=txt(value).split(/\r?\n/u).flatMap(line=>pattern.exec(line.trim())?.[1]??[]);
  return found.length===1?found[0]:'';
}
export function parseContent(content:unknown, legacy:unknown):Draft{
  const c=record(content),f=record(c.funds),h=record(c.home),e=record(c.explorer),t=record(c.contact);
  const rows=Array.isArray(legacy)?legacy.map(record):[];
  const parsed=Object.fromEntries(fundIds.map(id=>{
    const old=rows.filter(o=>o.sector===id&&o.published===true&&o.verified===true).flatMap(o=>{
      const rate=legacyValue(o.strategy,rateLine),minimum=legacyValue(o.liquidity,minLine);
      return rate||minimum?[{rate,minimum,source:txt(o.source),asOf:txt(o.asOf),publishTerms:true}]:[];
    });
    const v=record(f[id]);
    const base={name:txt(v.name),intro:txt(v.intro),photo:txt(v.photo),keywords:txt(v.keywords),inExplorer:v.inExplorer!==false,rate:numeric(v.rate),minimum:numeric(v.minimum),source:txt(v.source),asOf:txt(v.asOf),publishTerms:v.publishTerms===true};
    return [id,{...base,...(!Object.hasOwn(f,id)&&old.length===1?old[0]:{})}];
  })) as Record<FundId,FundDraft>;
  return {disclosure:readDisclosureDraft(c.disclosure),funds:parsed,home:{headline:txt(h.headline),intro:txt(h.intro)},explorer:{title:txt(e.title),intro:txt(e.intro),placeholder:txt(e.placeholder),quickSearch:txt(e.quickSearch),byRate:e.byRate!==false},contact:{title:txt(t.title),message:txt(t.message),telegramChat:txt(t.telegramChat),telegramChannel:txt(t.telegramChannel),hideChat:t.hideChat===true}};
}
function amount(input:string,max:number){
  if(!input.trim())return null;
  const s=input.trim().replace(/[٠-٩۰-۹]/g,c=>String(c.charCodeAt(0)&15)).replace(/٫/g,'.');
  if(!/^\d{1,10}(?:\.\d{1,2})?$/.test(s)||Number(s)>max)throw Error('راجع العائد والحد الأدنى: اكتب أرقامًا بحد أقصى منزلتين عشريتين.');
  return Number(s);
}
export function serializeContent(draft:Draft){
  const funds=Object.fromEntries(fundIds.map(id=>{
    const f=draft.funds[id],rate=amount(f.rate,100),minimum=amount(f.minimum,1e9);
    if((rate!==null||minimum!==null)&&!f.publishTerms)throw Error('فعّل «عرض الأرقام بعد المراجعة» أو امسح الأرقام في صندوق '+fundsName(id)+'.');
    if((rate!==null||minimum!==null)&&(!f.source.trim()||!f.asOf))throw Error('أضف المصدر وتاريخ المراجعة لصندوق '+fundsName(id)+'.');
    return [id,{...f,rate,minimum}];
  }));
  return {...draft,funds,disclosure:serializeDisclosure(draft.disclosure,amount)};
}
function fundsName(id:FundId){return funds[id];}
const today=()=>new Date().toISOString().slice(0,10);
function Input({label,value,set,max=120,area=false,placeholder,dir}:{label:string;value:string;set:(s:string)=>void;max?:number;area?:boolean;placeholder?:string;dir?:'ltr'}){
  return <label className="un-field"><span>{label}</span>{area?<textarea value={value} maxLength={max} onChange={e=>set(e.target.value)} placeholder={placeholder}/>:<input dir={dir} value={value} maxLength={max} onChange={e=>set(e.target.value)} placeholder={placeholder}/>}</label>;
}
export function PublicationContent({tab,draft,onChange}:{tab:ContentTab;draft:Draft;onChange:(d:Draft)=>void}){
  const [id,setId]=useState<FundId>('property');
  const f=draft.funds[id];
  function updateFund(p:Partial<FundDraft>,key=id){onChange({...draft,funds:{...draft.funds,[key]:{...draft.funds[key],...p}}});}
  function update<K extends 'home'|'explorer'|'contact'>(key:K,p:Partial<Draft[K]>){onChange({...draft,[key]:{...draft[key],...p}});}
  if(tab==='disclosure')return <DisclosureEditor value={draft.disclosure} onChange={disclosure=>onChange({...draft,disclosure})}/>;
  if(tab==='home')return <section className="un-row un-grid">
    <Input label="عنوان الرئيسية" max={130} value={draft.home.headline} set={headline=>update('home',{headline})} placeholder="اتركه فاضي للإبقاء على العنوان الحالي"/>
    <Input label="الوصف تحت العنوان" area max={350} value={draft.home.intro} set={intro=>update('home',{intro})}/>
  </section>;
  if(tab==='contact')return <section className="un-row un-grid">
    <Input label="عنوان قسم التواصل" max={100} value={draft.contact.title} set={title=>update('contact',{title})} placeholder="خلّنا على تواصل"/>
    <Input label="الرسالة اللي تظهر للزوّار في قسم التواصل" max={350} area value={draft.contact.message} set={message=>update('contact',{message})}/>
    <Input label="تيليجرام الرسائل المباشرة" max={160} dir="ltr" value={draft.contact.telegramChat} set={telegramChat=>update('contact',{telegramChat})} placeholder="@username أو https://t.me/username"/>
    <Input label="رابط قناة تيليجرام" max={160} dir="ltr" value={draft.contact.telegramChannel} set={telegramChannel=>update('contact',{telegramChannel})} placeholder="https://t.me/channel"/>
    <label className="un-check"><input type="checkbox" checked={draft.contact.hideChat} onChange={e=>update('contact',{hideChat:e.target.checked})}/>إخفاء زر الرسائل المباشرة من قسم التواصل والرئيسية</label>
  </section>;
  if(tab==='explorer')return <>
    <div className="un-row un-grid">
      <Input label="عنوان المستكشف" max={100} value={draft.explorer.title} set={title=>update('explorer',{title})}/>
      <Input label="الشرح فوق البحث" max={280} area value={draft.explorer.intro} set={intro=>update('explorer',{intro})}/>
      <Input label="مثال داخل خانة البحث" max={120} value={draft.explorer.placeholder} set={placeholder=>update('explorer',{placeholder})} placeholder="مثل: ذهب، عقار، أو تداول"/>
      <Input label="أزرار البحث السريع (افصل بينها بفاصلة)" max={160} value={draft.explorer.quickSearch} set={quickSearch=>update('explorer',{quickSearch})} placeholder="ذهب، عقار، تداول"/>
      <label className="un-check"><input type="checkbox" checked={draft.explorer.byRate} onChange={e=>update('explorer',{byRate:e.target.checked})}/>السماح بالبحث بالعائد الأسبوعي المنشور</label>
    </div>
    <p>النتائج بتتحدّث من الصناديق دي. تقدر تحدد ظهور كل صندوق وتضيف كلمات يبحث بها الزوّار.</p>
    {fundIds.map(key=><div className="un-row un-grid" key={key}>
      <label className="un-check"><input type="checkbox" checked={draft.funds[key].inExplorer} onChange={e=>updateFund({inExplorer:e.target.checked},key)}/>إظهار {funds[key]} في المستكشف</label>
      <Input label={'كلمات بحث: '+funds[key]} max={250} value={draft.funds[key].keywords} set={keywords=>updateFund({keywords},key)}/>
    </div>)}
  </>;
  return <>
    <div className="un-tabs" aria-label="اختيار الصندوق">{fundIds.map(key=><button key={key} type="button" aria-pressed={id===key} onClick={()=>setId(key)}>{funds[key]}</button>)}</div>
    <section className="un-row un-grid">
      <Input label="اسم البطاقة" max={100} value={f.name} set={name=>updateFund({name})} placeholder={funds[id]}/>
      <label className="un-field"><span>صورة البطاقة</span><select value={f.photo} onChange={e=>updateFund({photo:e.target.value})}><option value="">الصورة الحالية</option>{Object.entries(pictures).map(([key,name])=><option value={key} key={key}>{name}</option>)}</select></label>
      <Input label="وصف الصندوق" area max={380} value={f.intro} set={intro=>updateFund({intro})}/>
      <label className="un-field"><span>العائد الأسبوعي المستهدف (%)</span><input inputMode="decimal" dir="ltr" maxLength={12} value={f.rate} onChange={e=>updateFund({rate:e.target.value})}/></label>
      <label className="un-field"><span>الحد الأدنى بالدولار الأمريكي</span><input inputMode="decimal" dir="ltr" maxLength={15} value={f.minimum} onChange={e=>updateFund({minimum:e.target.value})}/></label>
      <Input label="المصدر المعلن للأرقام" max={140} value={f.source} set={source=>updateFund({source})}/>
      <label className="un-field"><span>تاريخ مراجعة الأرقام</span><input type="date" dir="ltr" max={today()} value={f.asOf} onChange={e=>updateFund({asOf:e.target.value})}/></label>
      <label className="un-check"><input type="checkbox" checked={f.publishTerms} onChange={e=>updateFund(e.target.checked?{publishTerms:true}:{publishTerms:false,rate:'',minimum:''})}/>عرض الأرقام بعد المراجعة</label>
    </section>
  </>;
}
