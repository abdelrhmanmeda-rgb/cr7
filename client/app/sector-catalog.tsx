"use client";

import { useId,useState } from "react";
import { CxIcon } from "./cinematic-icons";
import { LuxuryPhoto } from "./luxury-photo";
import { fields,fieldOf,findFields, type Field,type FieldId,type FieldSettings } from "./four-sectors";

const format=new Intl.NumberFormat("ar-EG",{ maximumFractionDigits:2 });
function Terms({value}:{value?:FieldSettings[FieldId]}){
  return <dl className="sc-terms">
    <div><CxIcon name="growth"/><dt>العائد الأسبوعي المستهدف</dt><dd>{value?.rate!==undefined?<bdi dir="ltr">{format.format(value.rate)}٪</bdi>:<span className="sc-not-published">غير منشور</span>}</dd></div>
    <div><CxIcon name="coins"/><dt>الحد الأدنى</dt><dd>{value?.minimum!==undefined?<><bdi>{format.format(value.minimum)}</bdi> دولار</>:<span className="sc-not-published">غير منشور</span>}</dd></div>
  </dl>;
}
function Card({field,settings}:{field:Field;settings:FieldSettings}){
  return <article className={`sc-card sc-${field.id}`}>
    <div className="sc-card-photo"><LuxuryPhoto asset={field.id}/><span className="sc-category"><CxIcon name={field.icon}/>{field.category}</span></div>
    <div className="sc-card-body">
    <h3>{field.name}</h3><p className="sc-intro">{field.intro}</p><Terms value={settings[field.id]}/>
    <a className="u-btn gold sc-link" href={`/guide/${field.id}`} aria-label={`عرض التفاصيل — ${field.name}`}>عرض التفاصيل</a>
    </div>
  </article>;
}
export function SectorCatalog({search=false, heading="صناديق مختارة بعناية", eyebrow="صناديق الاستثمار الأربعة", compact=false,settings={}}:{
  search?:boolean;heading?:string;eyebrow?:string;compact?:boolean;settings?:FieldSettings;
}){
  const id=useId(),[query,setQuery]=useState(""),[mode,setMode]=useState<"all"|"atLeast">("all");
  const items=search?findFields(query,settings,mode):fields;
  return <section className="u-block sc-list" aria-labelledby={id} id={search?"search-fields":"featured-opportunities"}>
    <header className="u-heading"><div><span className="u-kicker">{eyebrow}</span><h2 id={id}>{heading}</h2><p className="sc-note">تعرّف على الصناديق واطّلع على التفاصيل المنشورة لكل صندوق.</p></div>{!search&&compact&&<a className="u-btn" href="/explorer">افتح المستكشف</a>}</header>
    {search&&<div className="sc-search">
      <div className="sc-search-controls"><label>ابحث باسم الصندوق أو بالعائد الأسبوعي<input type="search" placeholder="مثلاً: ذهب، عقار، أو تداول" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <label>مطابقة العائد<select value={mode} onChange={e=>setMode(e.target.value as "all"|"atLeast")}><option value="all">نفس النسبة</option><option value="atLeast">النسبة أو أعلى</option></select></label></div>
      <div className="sc-chips" aria-label="بحث سريع">{[["ذهب","ذهب"],["تداول","تداول"],["الكل",""]].map(([label,q])=><button key={label} aria-pressed={q===query} type="button" onClick={()=>{setMode("all");setQuery(q);}}>{label}</button>)}</div>
      <p className="sc-count" role="status">عدد الصناديق المطابقة: {format.format(items.length)}</p>
    </div>}
    {items.length?<div className="sc-grid">{items.map(item=><Card key={item.id} field={item} settings={settings}/>)}</div>:<p className="sc-empty">ما لقينا صندوق يطابق هالبحث. جرّب اسم الصندوق أو نسبة منشورة.</p>}
  </section>;
}
export function SectorTerms({id,settings}:{id:FieldId;settings:FieldSettings}){
  const value=settings[id];
  const stamp=value && new Intl.DateTimeFormat("ar-EG",{dateStyle:"medium",timeZone:"UTC",calendar:"gregory"}).format(new Date(value.asOf+"T00:00:00Z"));
  return <section className="sc-detail-terms" aria-label="لمحة عن الصندوق">
    <div><span className="u-kicker">بطاقة الصندوق</span><h2>بيانات الصندوق</h2></div><Terms value={value}/>
    <a className="u-btn" href="/#disclosures">مركز الإفصاحات</a>
    {value&&<p className="sc-terms-source sc-evidence">{value.source} · <time dateTime={value.asOf}>{stamp}</time>{value.rate!==undefined && " · العائد المستهدف مو مضمون."}</p>}
  </section>;
}
