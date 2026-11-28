import {useState} from 'react';

const funds={property:'الاستثمارات العقارية',gold:'الذهب والمعادن الثمينة',market:'الأسواق المالية والتداول',energy:'الطاقة والمشروعات'} as const;
const kinds={factsheet:'ملخص معلومات الصندوق',terms:'الشروط والأحكام',performance:'تقرير الأداء'} as const;
type Fund=keyof typeof funds;
type Kind=keyof typeof kinds;
type Proof={source:string;asOf:string;published:boolean};
type Entity=Proof&{name:string;form:string;jurisdiction:string;regulator:string;registration:string;license:string;activity:string};
type Offer=Proof&{status:string;start:string;end:string;unitPrice:string;eligibility:string};
type Doc=Proof&{body:string};
export type DisclosureDraft={entity:Entity;offer:Offer;documents:Partial<Record<Fund,Partial<Record<Kind,Doc>>>>};
const ids=Object.keys(funds) as Fund[],types=Object.keys(kinds) as Kind[];
const rec=(x:unknown):Record<string,unknown>=>x&&typeof x==='object'&&!Array.isArray(x)?x as Record<string,unknown>:{};
const str=(x:unknown)=>typeof x==='string'?x:'';
const proof=(x:Record<string,unknown>):Proof=>({source:str(x.source),asOf:str(x.asOf),published:x.published===true});
const docFrom=(x:Record<string,unknown>):Doc=>({...proof(x),body:str(x.body)});
const entityFields=[['name','اسم الكيان',160],['form','الشكل القانوني',100],['jurisdiction','نطاق التسجيل',100],['regulator','الجهة الرقابية',140],['registration','رقم السجل',80],['license','رقم الترخيص',80],['activity','النشاط المعلن',200]] as const;

export function readDisclosureDraft(x:unknown):DisclosureDraft{
 const d=rec(x),e=rec(d.entity),o=rec(d.offer),files=rec(d.documents);
 const documents:DisclosureDraft['documents']={};
 for(const key of ids){
  const saved=rec(files[key]),entries:Partial<Record<Kind,Doc>>={};
  for(const kind of types)if(Object.hasOwn(saved,kind))entries[kind]=docFrom(rec(saved[kind]));
  if(Object.keys(entries).length)documents[key]=entries;
 }
 return {documents,
  entity:{...proof(e),name:str(e.name),form:str(e.form),jurisdiction:str(e.jurisdiction),regulator:str(e.regulator),registration:str(e.registration),license:str(e.license),activity:str(e.activity)},
  offer:{...proof(o),status:str(o.status)||'scheduled',start:str(o.start),end:str(o.end),unitPrice:typeof o.unitPrice==='number'?String(o.unitPrice):'',eligibility:str(o.eligibility)}};
}

export function serializeDisclosure(d:DisclosureDraft,amount:(input:string,max:number)=>number|null){
 const check=(value:Proof)=>{if(!value.source.trim()||!value.asOf)throw Error('أضف مصدر الإفصاح وتاريخ المراجعة لكل بند تختار نشره.');};
 const {entity,offer,documents}=d;
 if(entity.published)check(entity);
 if(offer.published)check(offer);
 const published:DisclosureDraft['documents']={};
 for(const fund of ids)for(const kind of types){
  const doc=documents[fund]?.[kind];
  if(!doc?.published)continue;
  check(doc);
  if(!doc.body.trim())throw Error('أدخل نص '+kinds[kind]+' قبل النشر.');
  published[fund]={...published[fund],[kind]:doc};
 }
 return {...(entity.published?{entity}:{}),...(offer.published?{offer:{...offer,unitPrice:amount(offer.unitPrice,1e9)}}:{}),documents:published};
}

function Input({label,value,set,max=140,type='text'}:{label:string;value:string;set:(s:string)=>void;max?:number;type?:'date'|'text'}){
 return <label className="un-field"><span>{label}</span><input type={type} dir={type==='date'?'ltr':undefined} value={value} maxLength={max} onChange={e=>set(e.target.value)}/></label>;
}
function Evidence({value,change}:{value:Proof;change:(p:Partial<Proof>)=>void}){
 return <>
  <Input label="مصدر الإفصاح (اسم المرجع)" value={value.source} set={source=>change({source})}/>
  <Input label="تاريخ المراجعة" type="date" value={value.asOf} set={asOf=>change({asOf})}/>
  <label className="un-check"><input type="checkbox" checked={value.published} onChange={e=>change({published:e.target.checked})}/>انشر بعد التحقق من البيانات واعتمادها</label>
 </>;
}
export function DisclosureEditor({value,onChange}:{value:DisclosureDraft;onChange:(next:DisclosureDraft)=>void}){
 const [fund,setFund]=useState<Fund>('property'),[kind,setKind]=useState<Kind>('factsheet');
 const e=value.entity,o=value.offer,doc=value.documents[fund]?.[kind]??docFrom({});
 const entity=(p:Partial<Entity>)=>onChange({...value,entity:{...e,...p}});
 const offer=(p:Partial<Offer>)=>onChange({...value,offer:{...o,...p}});
 const document=(p:Partial<Doc>)=>onChange({...value,documents:{...value.documents,[fund]:{...value.documents[fund],[kind]:{...doc,...p}}}});
 return <>
  <p className="un-notice">استخدم البيانات والوثائق المعتمدة فقط. إزالة علامة النشر مع الحفظ تسحب البند من العرض العام، والحقول غير المنشورة لا تُحفظ كمسودات.</p>
  <fieldset className="un-row un-grid"><legend>بيانات الكيان والترخيص</legend>
   {entityFields.map(([key,label,max])=><Input key={key} label={label} value={e[key]} set={v=>entity({[key]:v})} max={max}/>)}
   <Evidence value={e} change={entity}/>
  </fieldset>
  <fieldset className="un-row un-grid"><legend>حالة الطرح</legend>
   <label className="un-field"><span>حالة الطرح</span><select value={o.status} onChange={e=>offer({status:e.target.value})}><option value="scheduled">مجدول</option><option value="open">الفترة معلنة</option><option value="closed">مغلق</option></select></label>
   <Input label="بداية الفترة" type="date" value={o.start} set={start=>offer({start})}/>
   <Input label="نهاية الفترة" type="date" value={o.end} set={end=>offer({end})}/>
   <Input label="الفئة المؤهلة" value={o.eligibility} set={eligibility=>offer({eligibility})} max={250}/>
   <label className="un-field"><span>سعر الوحدة بالدولار (اختياري)</span><input inputMode="decimal" dir="ltr" value={o.unitPrice} maxLength={16} onChange={e=>offer({unitPrice:e.target.value})}/></label>
   <Evidence value={o} change={offer}/>
  </fieldset>
  <fieldset className="un-row un-grid"><legend>مستندات الصناديق</legend>
   <label className="un-field"><span>الصندوق</span><select value={fund} onChange={e=>setFund(e.target.value as Fund)}>{ids.map(id=><option key={id} value={id}>{funds[id]}</option>)}</select></label>
   <label className="un-field"><span>نوع المستند</span><select value={kind} onChange={e=>setKind(e.target.value as Kind)}>{types.map(id=><option key={id} value={id}>{kinds[id]}</option>)}</select></label>
   <label className="un-field"><span>نص المستند المعتمد</span><textarea value={doc.body} rows={7} maxLength={4000} onChange={e=>document({body:e.target.value})}/></label>
   <Evidence value={doc} change={document}/>
  </fieldset>
 </>;
}
