"use client";

import { useId,useState,useSyncExternalStore } from "react";
import { CxIcon } from "./cinematic-icons";
import { fields,fieldOf,findFields,numberInput, type Field,type FieldId,type FieldSettings } from "./four-sectors";

const key="sgf.preview.fields.v1";
const signal="sgf:preview-fields";
const format=new Intl.NumberFormat("ar-EG",{ maximumFractionDigits:2 });
function read(){try{return localStorage.getItem(key)||"";}catch{return "";}}
function subscribe(listener:()=>void){
  window.addEventListener("storage",listener); window.addEventListener(signal,listener);
  return ()=>{window.removeEventListener("storage",listener);window.removeEventListener(signal,listener);};
}
function useSettings():FieldSettings{
  const stored=useSyncExternalStore(subscribe,read,()=>"");
  if(!stored)return {};
  try {
    const values=JSON.parse(stored);
    const cleaned:FieldSettings={};
    for(const field of fields){
      const item=values?.[field.id];
      if(item&&Number.isFinite(item.rate)&&item.rate>=0&&item.rate<=100&&Number.isFinite(item.minimum)&&item.minimum>=0&&item.minimum<=1e9)cleaned[field.id]=item;
    }
    return cleaned;
  } catch{return {};}
}
function Terms({field,settings,sample}:{field:Field;settings:FieldSettings;sample:boolean}){
  if(!sample)return <p className="sc-unpublished">العائد والحد الأدنى: غير منشورين.</p>;
  const value=settings[field.id]??field;
  return <dl className="sc-terms"><div><CxIcon name="growth"/><dt>العائد الأسبوعي (مثال)</dt><dd><bdi dir="ltr">{format.format(value.rate)}٪</bdi></dd></div><div><CxIcon name="coins"/><dt>الحد الأدنى (مثال)</dt><dd><bdi>{format.format(value.minimum)}</bdi> دولار</dd></div></dl>;
}
function Card({field,settings,sample}:{field:Field;settings:FieldSettings;sample:boolean}){
  return <article className="cx-offer sc-card">
    <div className="cx-offer-art"><img className="cx-card-image" src={`/cinematic/${field.id}-card.webp`} alt="" loading="lazy" decoding="async"/><span className="cx-tag"><CxIcon name={field.icon}/>{field.category}</span></div>
    <div className="cx-offer-copy"><h3>{field.name}</h3><p>{field.intro}</p><Terms field={field} settings={settings} sample={sample}/>
    <a className="cx-btn cx-gold" href={`/guide/${field.id}`}>عرض التفاصيل<span className="cx-sr"> — {field.name}</span></a></div>
  </article>;
}
function PreviewEditor({settings}:{settings:FieldSettings}){
  const [selected,setSelected]=useState<FieldId>("gold"),[status,setStatus]=useState("");
  const current=fieldOf(selected)!;
  const value=settings[selected]??current;
  return <details className="sc-editor" id="preview-values">
    <summary>إعدادات المعاينة: عدّل العائد والحد الأدنى</summary>
    <p>هالقيم للتجربة. تظل على نفس المتصفح وتنعكس في كل البطاقات ونتائج البحث.</p>
    <label>المجال<select value={selected} onChange={e=>{setSelected(e.target.value as FieldId);setStatus("");}}>{fields.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
    <form key={selected+":"+value.rate+":"+value.minimum} onSubmit={e=>{
      e.preventDefault();
      const form=new FormData(e.currentTarget),rate=numberInput(String(form.get("rate"))),minimum=numberInput(String(form.get("minimum")));
      if(!(rate>=0&&rate<=100&&minimum>=0&&minimum<=1e9)){setStatus("تأكّد إن النسبة بين ٠ و١٠٠، وإن الحد الأدنى رقم صحيح ضمن النطاق.");return;}
      try{
        localStorage.setItem(key,JSON.stringify({...settings,[selected]:{rate,minimum}}));window.dispatchEvent(new Event(signal));setStatus("انحفظت القيم في المعاينة وتحدّثت البطاقات والبحث.");
      }catch{setStatus("ما قدرنا نحفظ على هالمتصفح.");}
    }}>
      <label>العائد الأسبوعي ٪<input name="rate" inputMode="decimal" defaultValue={value.rate} required maxLength={12}/></label>
      <label>الحد الأدنى بالدولار الأمريكي<input name="minimum" inputMode="decimal" defaultValue={value.minimum} required maxLength={18}/></label>
      <button className="cx-btn cx-gold">حفظ القيم</button>
    </form><p className="sc-status" aria-live="polite">{status}</p>
  </details>;
}
export function SectorCatalog({search=false, heading="فرص مختارة بعناية عالية", eyebrow="صناديق الاستثمار الأربعة", compact=false,sample=false}:{
  search?:boolean;heading?:string;eyebrow?:string;compact?:boolean;sample?:boolean;
}){
  const id=useId(),settings=useSettings(),[query,setQuery]=useState(""),[mode,setMode]=useState<"all"|"atLeast">("all");
  const items=search?findFields(query,sample?settings:{},mode,sample):fields;
  return <section className={`cx-section sc-list${compact?" sc-compact":""}`} aria-labelledby={id} id={search?"search-fields":"featured-opportunities"}>
    <header className="cx-section-heading"><div><span className="cx-eyebrow">{eyebrow}</span><h2 id={id}>{heading}</h2><p className="sc-note">{sample?"العوائد والمبالغ أرقام افتراضية للمعاينة. ما فيه طرح أو اشتراك فعلي.":"تعرّف على مجالات الاستثمار، واطّلع على التفاصيل والإفصاحات المنشورة."}</p></div>{!search&&compact&&<a className="cx-btn cx-outline" href="/explorer">افتح المستكشف</a>}</header>
    {search&&<div className="sc-search">
      <div className="sc-search-controls"><label>{sample?"ابحث باسم المجال أو العائد الأسبوعي":"ابحث باسم الصندوق أو المجال"}<input type="search" placeholder={sample?"مثلاً: ذهب، تداول، أو ٥٪":"مثلاً: ذهب، عقار، أو تداول"} value={query} onChange={e=>setQuery(e.target.value)}/></label>
      {sample&&<label>مطابقة العائد<select value={mode} onChange={e=>setMode(e.target.value as "all"|"atLeast")}><option value="all">نفس النسبة</option><option value="atLeast">النسبة أو أعلى</option></select></label>}</div>
      <div className="sc-chips" aria-label="بحث سريع">{[["ذهب","ذهب"],["تداول","تداول"],["٥٪ أسبوعي","٥٪"],["الكل",""]].filter(([label])=>sample||label!=="٥٪ أسبوعي").map(([label,q])=><button key={label} aria-pressed={q===query} type="button" onClick={()=>{setMode("all");setQuery(q);}}>{label}</button>)}</div>
      <p className="sc-count" role="status">عدد المجالات المطابقة: {format.format(items.length)}</p>
    </div>}
    {items.length?<div className="cx-grid sc-grid">{items.map(item=><Card key={item.id} field={item} settings={settings} sample={sample}/>)}</div>:<p className="sc-empty">{sample?"ما لقينا مجال يطابق هالبحث. جرّب اسم مختلف أو اختَر «النسبة أو أعلى».":"ما لقينا صندوق يطابق هالبحث. جرّب اسم الصندوق أو المجال."}</p>}
    {search&&sample&&<PreviewEditor settings={settings}/>}
  </section>;
}
export function SectorTerms({id,sample=false}:{id:FieldId;sample?:boolean}){
  const settings=useSettings(),field=fieldOf(id);
  if(!field)return null;
  return <section className="sc-detail-terms" aria-label="لمحة عن المجال"><div><span className="cx-eyebrow">بطاقة المجال</span><h2>{sample?"الأرقام في المعاينة":"بيانات الصندوق"}</h2>{sample&&<p className="sc-note">قيم افتراضية لتجربة التصميم والبحث.</p>}</div><Terms field={field} settings={settings} sample={sample}/><a className="cx-btn cx-outline" href={sample?"/explorer#preview-values":"/#disclosures"}>{sample?"عدّل قيم المعاينة":"مركز الإفصاحات"}</a></section>;
}
