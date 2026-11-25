import {useEffect,useRef,useState,type FormEvent} from 'react';
import {PublicationContent,parseContent,serializeContent,type ContentTab} from './PublicationContent';
const endpoint=(import.meta.env.VITE_SGF_UNIVERSE_API?.replace(/\/+$/,'')||'https://cr7-kappa.vercel.app')+'/api/universe/admin/publication';
type Indicator={id:string;label:string;value:string;unit:string;asOf:string;source:string;published:boolean;verified:boolean};
type Feed={version:1;revision:number;metrics:Array<Omit<Indicator,'value'>&{value:number}>;opportunities:unknown[];content?:unknown};
type Tab=ContentTab|'metrics';
const tabs:ReadonlyArray<[Tab,string]>=[['funds','الصناديق'],['explorer','المستكشف'],['metrics','مؤشرات المنصة'],['contact','التواصل وتيليجرام'],['home','الصفحة الرئيسية']];
const date=()=>new Date().toISOString().slice(0,10);
const list=(f:Feed)=>f.metrics.map(m=>({...m,value:String(m.value)}));
const numberInput=(input:string)=>input.trim().replace(/[٠-٩۰-۹]/g,c=>String(c.charCodeAt(0)&15)).replace(/٫/g,'.');
async function api(token:string, init:RequestInit={}):Promise<Feed>{
  const r=await fetch(endpoint,{...init,cache:'no-store',headers:{Authorization:'Bearer '+token,...(init.body?{'Content-Type':'application/json'}:{})}});
  const res=await r.json().catch(()=>null);
  if(r.status===401)throw Error('جلسة الدخول انتهت. سجّل خروج وادخل من جديد.');
  if(r.status===403)throw Error('الحساب ده مسجّل دخول، لكن مش ضمن الحسابات المصرّح لها بالنشر.');
  if(r.status===409)throw Error('فيه نسخة أحدث. تعديلاتك الحالية لسه موجودة. راجع النسخة المنشورة قبل ما تعيد الحفظ.');
  if(!r.ok||res?.success!==true)throw Error(r.status===503?'خدمة النشر غير متاحة: '+(res?.message||'راجع اتصال خادم النشر.'):res?.message||'تعذّر الاتصال بخدمة النشر.');
  const f=res.data as Feed;
  if(f?.version!==1||!Number.isSafeInteger(f.revision)||!Array.isArray(f.metrics)||!Array.isArray(f.opportunities))throw Error('خدمة النشر رجّعت بيانات غير صالحة.');
  return f;
}
export default function UniverseEditor({getToken,uid}:{getToken:()=>Promise<string|undefined>;uid:string}){
  const [tab,setTab]=useState<Tab>('funds'), [feed,setFeed]=useState<Feed|null>(null),[metrics,setMetrics]=useState<Indicator[]>([]);
  const [draft,setDraft]=useState(()=>parseContent(null,[])),[reload,setReload]=useState(0),[busy,setBusy]=useState(true),[dirty,setDirty]=useState(false);
  const [status,setStatus]=useState('');
  const get=useRef(getToken),saving=useRef(false);
  useEffect(()=>{get.current=getToken;},[getToken]);
  useEffect(()=>{
    const controller=new AbortController();
    (async()=>{
      try{
        const token=await get.current();if(!token)throw Error('سجّل الدخول بحساب الإدارة.');
        const current=await api(token,{signal:controller.signal});
        if(controller.signal.aborted)return;
        setFeed(current);setDraft(parseContent(current.content,current.opportunities));setMetrics(list(current));setStatus('');
      }catch(e){if(!controller.signal.aborted)setStatus(e instanceof Error?e.message:'تعذّر تحميل النسخة المنشورة.');}
      finally{if(!controller.signal.aborted)setBusy(false);}
    })();
    return ()=>controller.abort();
  },[reload]);
  useEffect(()=>{
    if(!dirty)return;
    const warn=(e:BeforeUnloadEvent)=>e.preventDefault();
    window.addEventListener('beforeunload',warn);return ()=>window.removeEventListener('beforeunload',warn);
  },[dirty]);
  function editMetrics(items:Indicator[]){setMetrics(items);setDirty(true);setStatus('');}
  function patch(id:string,p:Partial<Indicator>){editMetrics(metrics.map(m=>m.id===id?{...m,...p}:m));}
  async function save(e:FormEvent){
    e.preventDefault();
    if(!feed||!dirty||busy||saving.current)return;
    saving.current=true;setBusy(true);setStatus('');
    try{
      const items=metrics.filter(m=>m.published).map(m=>{
        const normalized=numberInput(m.value),value=Number(normalized);
        if(!normalized||!Number.isFinite(value)||!m.label.trim()||!m.source.trim()||!m.asOf||!m.verified)throw Error('كمّل قيمة المؤشر واسمه ومصدره وتاريخ المراجعة، وبعدها أكّد المراجعة.');
        return {...m,value};
      });
      const content=serializeContent(draft);
      const token=await get.current();if(!token)throw Error('سجّل دخولك من جديد.');
      const saved=await api(token,{method:'PUT',body:JSON.stringify({...feed,metrics:items,content})});
      setFeed(saved);setDraft(parseContent(saved.content,saved.opportunities));setMetrics(list(saved));setDirty(false);
      setStatus('اتحفظ المحتوى. ظهور التعديل للزوّار ممكن ياخد حوالي دقيقة.');
    }catch(err){setStatus(err instanceof Error?err.message:'ما تمش الحفظ.');}
    finally{saving.current=false;setBusy(false);}
  }
  return <form className="un-editor" onSubmit={save} dir="rtl">
    <div className="un-banner"><div><small>صناديق الخليج الذكية</small><h3>مكتب نشر المحتوى</h3><p>عدّل اللي بيظهر للزوّار على الموقع. التغييرات تتنشر بعد الحفظ.</p></div></div>
    {!feed?<div className="un-row">{busy?<p role="status">جاري تحميل المحتوى المنشور…</p>:<>
      <p role="alert">{status}</p><p>ما اتحفظش أي تغيير. لو المشكلة في صلاحية النشر، المعرّف الخاص بحسابك الحالي:</p>
      <code dir="ltr" style={{overflowWrap:'anywhere'}}>{uid}</code>
      <div className="un-actions"><button type="button" onClick={()=>{setBusy(true);setReload(n=>n+1);}}>إعادة المحاولة</button></div>
    </>}</div>:<>
      <div className="un-tabs" aria-label="محتوى الموقع">{tabs.map(([key,label])=><button key={key} type="button" aria-pressed={tab===key} onClick={()=>setTab(key)}>{label}</button>)}</div>
      <fieldset disabled={busy}><legend>{tabs.find(([key])=>key===tab)?.[1]}</legend>
        {tab==='metrics'?<>
          <p>انشر لحد أربعة مؤشرات موثّقة. لما تزيل مؤشر أو توقف عرضه، يختفي من الموقع بعد الحفظ.</p>
          {metrics.map(m=><section className="un-row un-grid" key={m.id}>
            <label className="un-field"><span>اسم المؤشر</span><input value={m.label} maxLength={80} onChange={e=>patch(m.id,{label:e.target.value})}/></label>
            <label className="un-field"><span>القيمة</span><input dir="ltr" inputMode="decimal" value={m.value} onChange={e=>patch(m.id,{value:e.target.value})}/></label>
            <label className="un-field"><span>الوحدة</span><input value={m.unit} maxLength={28} onChange={e=>patch(m.id,{unit:e.target.value})}/></label>
            <label className="un-field"><span>المصدر العلني</span><input value={m.source} maxLength={140} onChange={e=>patch(m.id,{source:e.target.value})}/></label>
            <label className="un-field"><span>تاريخ مراجعة المؤشر</span><input dir="ltr" type="date" max={date()} value={m.asOf} onChange={e=>patch(m.id,{asOf:e.target.value})}/></label>
            <label className="un-check"><input type="checkbox" checked={m.verified} onChange={e=>patch(m.id,{verified:e.target.checked})}/>راجعت الرقم والمصدر</label>
            <label className="un-check"><input type="checkbox" checked={m.published} onChange={e=>patch(m.id,{published:e.target.checked})}/>عرض المؤشر</label>
            <div><button type="button" onClick={()=>editMetrics(metrics.filter(x=>x.id!==m.id))}>إزالة المؤشر من العرض</button></div>
          </section>)}
          <button type="button" disabled={metrics.length>=4} onClick={()=>editMetrics([...metrics,{id:crypto.randomUUID(),label:'',value:'',unit:'',source:'',asOf:'',published:false,verified:false}])}>إضافة مؤشر</button>
        </>:<PublicationContent tab={tab} draft={draft} onChange={d=>{setDraft(d);setDirty(true);setStatus('');}}/>}
        <div className="un-foot"><span>{dirty?'فيه تغييرات لسه ما اتحفظتش.':'أنت بتشوف آخر نسخة حمّلتها.'}</span><button type="submit" disabled={!dirty||busy}>{busy?'جاري الحفظ…':'حفظ ونشر التعديلات'}</button></div>
      </fieldset>{status&&<p className="un-notice" role="status">{status}</p>}
    </>}
  </form>;
}
