import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
const endpoint=(import.meta.env.VITE_SGF_UNIVERSE_API?.replace(/\/+$/,"") || "https://cr7-kappa.vercel.app")+"/api/universe/admin/publication";
type Base={id:string;source:string;asOf:string;published:boolean;verified:boolean};
type Indicator=Base&{label:string;value:string;unit:string};
type Offer=Base&{name:string;sector:string;location:string;intro:string;strategy:string;liquidity:string;risks:string;featured:boolean};
type State={metrics:Indicator[];opportunities:Offer[]};
const names:Record<string,string>={property:"العقارات",gold:"الذهب والمعادن",market:"الأسواق المالية",energy:"الطاقة والمشروعات",funds:"الصناديق",stocks:"الأسهم",income:"أدوات الدخل",portfolio:"المحافظ",compare:"فرص متنوعة"};
const empty:State={metrics:[],opportunities:[]};
const base=():Base=>({id:crypto.randomUUID(),source:"",asOf:"",published:false,verified:false});
const today=()=>new Date().toISOString().slice(0,10);
const validDate=(v:string)=>{const d=new Date(v+"T00:00:00Z");return /^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(+d)&&d.toISOString().slice(0,10)===v&&v<=today();};
const text=(x:unknown)=>typeof x==="string"?x:"";
function parse(data:any):State{
  if(!data || data.version!==1)return empty;
  const common=(v:any):Base=>({id:text(v.id),source:text(v.source),asOf:text(v.asOf),published:v.published===true,verified:v.verified===true});
  const list=(x:any):any[]=>Array.isArray(x)?x.filter(v=>v && typeof v==="object").slice(0,60):[];
  return {metrics:list(data.metrics).map(v=>({...common(v),label:text(v.label),value:typeof v.value==="number"?String(v.value):"",unit:text(v.unit)})),opportunities:list(data.opportunities).map(v=>({...common(v),name:text(v.name),sector:text(v.sector),location:text(v.location),intro:text(v.intro),strategy:text(v.strategy),liquidity:text(v.liquidity),risks:text(v.risks),featured:v.featured===true}))};
}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="un-field"><span>{label}</span>{children}</label>;}
function Move({i,n,fn}:{i:number;n:number;fn:(to:number)=>void}){return <div className="un-move"><button type="button" disabled={!i} onClick={()=>fn(i-1)}>تقديم</button><button type="button" disabled={i===n-1} onClick={()=>fn(i+1)}>تأخير</button></div>;}
export default function UniverseEditor({getToken}:{getToken:()=>Promise<string|undefined>}){
  const [state,setState]=useState<State>(empty),[tab,setTab]=useState<'metrics'|'opportunities'>('metrics'),[phase,setPhase]=useState<'loading'|'ready'|'saving'|'failed'>('loading'),[msg,note]=useState(''),[version,retry]=useState(0),[dirty,setDirty]=useState(false);
  const lock=useRef(false), revision=useRef(0);
  const tokenRef=useRef(getToken);useEffect(()=>{tokenRef.current=getToken;},[getToken]);
  useEffect(()=>{const ctr=new AbortController();let alive=true;setPhase('loading');
    tokenRef.current().then(token=>{if(!token)throw Error();return fetch(endpoint,{headers:{Authorization:"Bearer "+token},cache:"no-store",signal:ctr.signal});}).then(async r=>{if(!r.ok)throw Error();const b=await r.json();if(!b.success||!b.data)throw Error();const feed=b.data;
      if(feed && feed.version!==1)throw Error();if(alive){setState(parse(feed));if(!Number.isSafeInteger(feed?.revision))throw Error();revision.current=feed.revision;setDirty(false);note("");setPhase("ready");}
    }).catch(()=>{if(alive){setPhase("failed");note("ما قدرنا نحمّل النسخة المنشورة. ما حفظنا أي تغيير.");}});
    return()=>{alive=false;ctr.abort();};
  },[version]);
  useEffect(()=>{if(!dirty)return;const fn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue="";};window.addEventListener("beforeunload",fn);return()=>window.removeEventListener("beforeunload",fn);},[dirty]);
  function change(next:State){setState(next);setDirty(true);note("");}
  function patch(section:keyof State,index:number,p:Partial<Indicator&Offer>){change({...state,[section]:state[section].map((x,i)=>i===index?{...x,...p}:x)});}
  function move(section:keyof State,from:number,to:number){const records=[...state[section]];[records[from],records[to]]=[records[to],records[from]];change({...state,[section]:records});}
  async function save(event:FormEvent){
    event.preventDefault();if(phase!=="ready"||lock.current||!dirty)return;
    const metrics=state.metrics.filter(x=>x.published),opportunities=state.opportunities.filter(x=>x.published);
    if(metrics.length>4){note("اختر أربعة مؤشرات للنشر كحد أقصى.");return;}
    const required=(v:Base)=>v.verified&&v.source.trim()&&validDate(v.asOf)&&/^[a-z0-9][a-z0-9-]{1,64}$/.test(v.id);
    if(metrics.some(m=>!required(m)||!m.label.trim()||m.value.trim()===""||!Number.isFinite(Number(m.value))||Math.abs(Number(m.value))>Number.MAX_SAFE_INTEGER)){
      setTab("metrics");note("كل مؤشر منشور يحتاج اسم، قيمة رقمية صالحة، مصدر علني، تاريخ صحيح وتأكيد المراجعة.");return;}
    if(opportunities.some(o=>!required(o)||!Object.hasOwn(names,o.sector)||![o.name,o.intro,o.strategy,o.risks,o.liquidity].every(s=>s.trim()))){
      setTab("opportunities");note("كمّل الاسم والملخّص والاستراتيجية والمخاطر والسيولة والمصدر والتاريخ وأكّد المراجعة لكل فرصة منشورة.");return;}
    lock.current=true;setPhase("saving");note("");
    try{
      const token=await getToken();if(!token)throw Error("سجّل دخولك من جديد.");
      const check=await fetch(endpoint,{cache:"no-store",headers:{Authorization:"Bearer "+token}});if(!check.ok)throw Error("تعذّر التأكّد من آخر تحديث.");
      const existing=await check.json();if(!existing?.success || !existing?.data)throw Error("تعذّرت قراءة النسخة المنشورة.");
      const current=existing.data;if((current&&current.version!==1)||current?.revision!==revision.current)throw Error("فيه نسخة أحدث. حدّث الصفحة وراجع تعديلاتك قبل النشر.");
      const previous=revision.current;
      const publication={version:1,revision:previous,metrics:metrics.map(m=>({...m,value:Number(m.value)})),opportunities};
      const r=await fetch(endpoint,{method:"PUT",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify(publication)});
      if(r.status===409)throw Error("فيه نسخة أحدث. حدّث الصفحة وراجع تعديلاتك قبل النشر.");
      if(!r.ok)throw Error("ما تم النشر. تأكد من صلاحية الحساب.");
      const b=await r.json();if(!b.success||!Number.isSafeInteger(b.data?.revision)||b.data.revision<=previous)throw Error("تعذّر تأكيد الحفظ. حدّث الصفحة قبل المحاولة مرة ثانية.");
      revision.current=b.data.revision;setDirty(false);note("تم حفظ بيانات العرض. قد تحتاج الواجهة نحو دقيقة لعرض آخر تحديث.");
    }catch(err){note(err instanceof Error?err.message:"ما قدرنا نحفظ التعديلات.");}finally{lock.current=false;setPhase("ready");}
  }
  function common(section:keyof State,i:number,v:Base){
    return <><Field label="اسم المصدر العلني"><input maxLength={140} value={v.source} onChange={e=>patch(section,i,{source:e.target.value})}/></Field>
      <Field label="تاريخ توثيق البيانات"><input type="date" dir="ltr" max={today()} value={v.asOf} onChange={e=>patch(section,i,{asOf:e.target.value})}/></Field>
      <label className="un-check"><input type="checkbox" checked={v.verified} onChange={e=>patch(section,i,{verified:e.target.checked})}/>راجعت المصدر والبيانات</label>
      <label className="un-check"><input type="checkbox" checked={v.published} onChange={e=>patch(section,i,{published:e.target.checked})}/>عرض للزوّار بعد الحفظ</label></>;
  }
  return <form className="un-editor" onSubmit={save}>
    <div className="un-banner"><div><small>مكتب النشر</small><h3>المحتوى المرئي</h3><p>تحكّم بالأرقام والفرص اللي تظهر للزوّار، من غير تعديل أي خطة أو حساب.</p></div><span className="un-seal" aria-hidden="true">◇</span></div>
    <div className="un-tabs" aria-label="نوع المحتوى"><button type="button" aria-pressed={tab==="metrics"} onClick={()=>setTab("metrics")}>مؤشرات الثقة</button><button type="button" aria-pressed={tab==="opportunities"} onClick={()=>setTab("opportunities")}>دليل الفرص</button></div>
    {phase==="loading"?<p role="status">قاعدين نحمّل بيانات العرض…</p>:phase==="failed"?<button type="button" onClick={()=>retry(v=>v+1)}>إعادة المحاولة</button>:<fieldset disabled={phase==="saving"}>
      <legend>{tab==="metrics"?"أرقام تعكس قوة وثقة استثماراتنا":"بطاقات الفرص وتفاصيلها"}</legend>
      <p>أدخل معلومات صالحة للنشر فقط. اسم المصدر والتاريخ يطلعان للزوّار. العناصر غير المحددة للعرض ما تنحفظ في الخدمة العامة.</p>
      {(tab==="metrics"?state.metrics:state.opportunities).length===0&&<div className="un-blank">ما أضفت محتوى لهالقسم للحين.</div>}
      {tab==="metrics"?state.metrics.map((m,i)=><article className="un-row" key={m.id}><header><strong>{m.label||"مؤشر جديد"}</strong><Move i={i} n={state.metrics.length} fn={to=>move('metrics',i,to)}/></header><div className="un-grid">
        <Field label="اسم المؤشر"><input maxLength={80} value={m.label} onChange={e=>patch("metrics",i,{label:e.target.value})}/></Field>
        <Field label="القيمة المعتمدة"><input type="number" step="any" dir="ltr" value={m.value} onChange={e=>patch("metrics",i,{value:e.target.value})}/></Field>
        <Field label="الوحدة"><input maxLength={28} value={m.unit} onChange={e=>patch("metrics",i,{unit:e.target.value})}/></Field>{common("metrics",i,m)}</div>
        <button type="button" onClick={()=>change({...state,metrics:state.metrics.filter(x=>x.id!==m.id)})}>إزالة من القائمة</button></article>):
       state.opportunities.map((o,i)=><article className="un-row" key={o.id}><header><strong>{o.name||"فرصة جديدة"}</strong><Move i={i} n={state.opportunities.length} fn={to=>move("opportunities",i,to)}/></header><div className="un-grid">
       <Field label="اسم الفرصة"><input maxLength={100} value={o.name} onChange={e=>patch("opportunities",i,{name:e.target.value})}/></Field>
       <Field label="المجال"><select value={o.sector} onChange={e=>patch("opportunities",i,{sector:e.target.value})}>{Object.entries(names).map(([k,n])=><option key={k} value={k}>{n}</option>)}</select></Field>
       <Field label="الموقع (اختياري)"><input maxLength={90} value={o.location} onChange={e=>patch("opportunities",i,{location:e.target.value})}/></Field>
       {([["intro","ملخّص الفرصة",380],["strategy","الاستراتيجية",2000],["risks","المخاطر",1500],["liquidity","شروط السيولة",1000]] as const).map(([k,title,length])=><Field key={k} label={title}><textarea maxLength={length} value={o[k]} onChange={e=>patch("opportunities",i,{[k]:e.target.value})}/></Field>)}
       {common("opportunities",i,o)}<label className="un-check"><input type="checkbox" checked={o.featured} onChange={e=>patch("opportunities",i,{featured:e.target.checked})}/>ضمّها للفرص المختارة في الرئيسية</label></div>
       <button type="button" onClick={()=>change({...state,opportunities:state.opportunities.filter(x=>x.id!==o.id)})}>إزالة من القائمة</button></article>)}
       <aside className="un-preview" aria-label="معاينة قبل الحفظ"><small>معاينة قبل الحفظ</small><div>{tab==="metrics" ? state.metrics.filter(m=>m.published&&m.verified&&m.label&&m.value.trim()&&m.source&&validDate(m.asOf)).map(m=><article key={m.id}><span>{m.label}</span><strong>{Number(m.value).toLocaleString("ar")} {m.unit}</strong><small>{m.source} · {m.asOf}</small></article>):state.opportunities.filter(o=>o.published&&o.verified&&o.name&&o.source&&validDate(o.asOf)).map(o=><article key={o.id}><span>{names[o.sector]}</span><strong>{o.name}</strong><small>{o.intro}</small></article>)}</div><p>المعاينة تعرض اختياراتك للنشر. الحفظ يتأكد من اكتمال كل البيانات.</p></aside>
       <div className="un-foot"><button type="button" disabled={tab==="metrics"?state.metrics.length>=4:state.opportunities.length>=60} onClick={()=>tab==="metrics"?change({...state,metrics:[...state.metrics,{...base(),label:"",value:"",unit:""}]}):change({...state,opportunities:[...state.opportunities,{...base(),name:"",sector:"property",location:"",intro:"",strategy:"",liquidity:"",risks:"",featured:false}]})}>{tab==="metrics"?"إضافة مؤشر":"إضافة فرصة"}</button><button type="submit" disabled={!dirty||phase==="saving"}>{phase==="saving"?"جاري الحفظ…":"حفظ المحتوى المنشور"}</button></div>
    </fieldset>}{msg&&<p role="status" className="un-notice">{msg}</p>}
  </form>;
}
