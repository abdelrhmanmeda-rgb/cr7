import {fields,type FieldId} from "./four-sectors";

export const documentTypes = [
  {id:"factsheet", title:"ملخص معلومات الصندوق", description:"الهدف وفئة الأصول والعملة والتقييم."},
  {id:"terms", title:"الشروط والأحكام", description:"الاشتراك والاسترداد وتسوية الطلبات والرسوم."},
  {id:"performance", title:"تقرير الأداء", description:"الفترة ونتائج الأداء وطريقة احتسابها."},
] as const;
type Kind = typeof documentTypes[number]["id"];
type Proof = {source:string;asOf:string};
type Entity = Proof & {name:string;form:string;jurisdiction:string;regulator:string;registration:string;license:string;activity:string};
type Offer = Proof & {status:"scheduled"|"open"|"closed";start:string;end:string;unitPrice?:number;eligibility:string};
type Doc = Proof & {body:string};
export type FundDisclosure = {entity?:Entity;offer?:Offer;documents:Partial<Record<FieldId,Partial<Record<Kind,Doc>>>>};

const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
const txt=(v:unknown,n:number)=>typeof v==="string"&&v.trim().length<=n?v.trim():"";
const day=(v:unknown)=>{
  const s=txt(v,10),d=new Date(s+"T00:00:00Z");
  return /^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(+d)&&d.toISOString().slice(0,10)===s?s:"";
};
const proof=(v:Record<string,unknown>)=>{
  const source=txt(v.source,140),asOf=day(v.asOf);
  return v.published===true&&source&&asOf&&Date.parse(asOf)<=Date.now()?{source,asOf}:undefined;
};
export function readDisclosure(input:unknown):FundDisclosure {
  const raw=obj(input),e=obj(raw.entity),o=obj(raw.offer),docs=obj(raw.documents);
  const ep=proof(e),op=proof(o),name=txt(e.name,160),jurisdiction=txt(e.jurisdiction,100);
  const license=txt(e.license,80),regulator=txt(e.regulator,140);
  const start=day(o.start),end=day(o.end),status=o.status;
  const entity=ep&&name&&jurisdiction&&Boolean(license)===Boolean(regulator)?{
    ...ep,name,jurisdiction,license,regulator,form:txt(e.form,100),registration:txt(e.registration,80),activity:txt(e.activity,200),
  }:undefined;
  const offer:Offer|undefined=op&&start&&end&&start<=end&&(status==="scheduled"||status==="open"||status==="closed")?{
    ...op,status,start,end,eligibility:txt(o.eligibility,250),unitPrice:typeof o.unitPrice==="number"&&o.unitPrice>0&&o.unitPrice<=1e9?o.unitPrice:undefined,
  }:undefined;
  const documents:FundDisclosure["documents"]={};
  for(const {id} of fields){
    const entries:Partial<Record<Kind,Doc>>={};
    for(const {id:kind} of documentTypes){
      const d=obj(obj(docs[id])[kind]),p=proof(d),body=txt(d.body,4000);
      if(p&&body)entries[kind]={...p,body};
    }
    if(Object.keys(entries).length)documents[id]=entries;
  }
  return {entity,offer,documents};
}

export const disclosureDate=(iso:string)=>new Intl.DateTimeFormat("ar-SA",{dateStyle:"long",timeZone:"UTC",calendar:"gregory"}).format(new Date(iso+"T00:00:00Z"));
export const disclosureNumber=(value:number)=>new Intl.NumberFormat("ar-EG",{maximumFractionDigits:2}).format(value);
export function offerLabel(offer:Offer|undefined,today=new Date().toISOString().slice(0,10)){
  if(!offer)return "لا يوجد طرح منشور";
  if(offer.status==="closed"||today>offer.end)return "الطرح مغلق";
  if(offer.status==="scheduled"||today<offer.start)return "طرح مُجدول";
  return "فترة الطرح المعلنة";
}

export const documentUrl=(id:FieldId,kind:Kind)=>`/disclosures/documents/${id}-${kind}/`;
export function disclosureDocument(data:FundDisclosure,slug:string){
  for(const fund of fields)for(const kind of documentTypes){
    const doc=data.documents[fund.id]?.[kind.id];
    if(doc&&slug===`${fund.id}-${kind.id}`)return {fund,kind,doc};
  }
  return undefined;
}
