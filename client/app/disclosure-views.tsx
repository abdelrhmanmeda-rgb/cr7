import type { ReactNode } from "react";
import { CxIcon } from "./cinematic-icons";
import { fields,type FieldId } from "./four-sectors";
import { disclosureDate,disclosureNumber,documentTypes,documentUrl,offerLabel,type FundDisclosure } from "./disclosure-data";
import {getPublication} from "./universe-data";

const pending="غير منشور";
type Details = NonNullable<FundDisclosure["entity"]>;
const entityRows:ReadonlyArray<readonly [keyof Details,string]>=[
  ["name","اسم الكيان"],["form","الشكل القانوني"],["jurisdiction","نطاق التسجيل"],["regulator","الجهة الرقابية"],
  ["registration","رقم السجل"],["license","رقم الترخيص"],["activity","النشاط المعلن"],
];

export function DisclosureFacts({rows}:{rows:ReadonlyArray<readonly [string,ReactNode]>}) {
  return <dl className="cc-capital-facts">{rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||pending}</dd></div>)}</dl>;
}
export function DisclosureProof({source,asOf}:{source:string;asOf:string}) {
  return <p className="cc-disclosure-proof">{source} · <time dateTime={asOf}>{disclosureDate(asOf)}</time></p>;
}
export function DocumentLinks({id,data,current}:{id:FieldId;data:FundDisclosure;current?:string}) {
  return <ul className="cc-capital-document-links">{documentTypes.map(kind=>{
    const doc=data.documents[id]?.[kind.id];
    return <li key={kind.id}>{doc?<a href={documentUrl(id,kind.id)} aria-current={current===kind.id?"page":undefined}>
      <strong>{kind.title}</strong><small>{kind.description}</small>
    </a>:<div><strong>{kind.title}</strong><small>{pending}</small></div>}</li>;
  })}</ul>;
}

export function CapitalDisclosures({data,available}:{data:FundDisclosure;available:boolean}) {
  const {entity,offer,documents}=data;
  const hasDocuments=Object.keys(documents).length>0;
  return <section className="cc-disclosures" id="disclosures" aria-labelledby="cc-disclosures-heading">
    <header className="cc-disclosures-head"><div><span className="u-kicker">معلومات المستثمر</span><h2 id="cc-disclosures-heading">مركز الإفصاحات</h2><p>حالة الطرح، وبيانات الكيان، ومستندات الصناديق المنشورة.</p></div><a className="u-btn" href="/disclosures/">افتح مركز الإفصاحات</a></header>
    <div className="cc-disclosure-grid cc-capital-disclosure-grid">
      <article><span className="cc-symbol"><CxIcon name="calendar"/></span><span className="cc-eyebrow">حالة الطرح</span>
        <h3>{offerLabel(offer)}</h3><span className="cc-capital-tag">{offer?"إفصاح منشور":pending}</span>
        <p>{offer?`${disclosureDate(offer.start)} إلى ${disclosureDate(offer.end)}.`:"تظهر حالة الطرح بعد نشر الإفصاح."}</p>
        <a className="cc-inline" href="/disclosures/#offering">شوف تفاصيل الطرح</a></article>
      <article><span className="cc-symbol"><CxIcon name="shield"/></span><span className="cc-eyebrow">بيانات الكيان والترخيص</span>
        <h3>بطاقة الكيان والترخيص</h3><span className="cc-capital-tag">{entity?"بيانات منشورة":pending}</span>
        <p>{entity?`${entity.name} · ${entity.jurisdiction}`:"تظهر بيانات الكيان والترخيص بعد نشرها."}</p>
        <a className="cc-inline" href="/disclosures/#entity">شوف بطاقة الكيان</a></article>
      <article><span className="cc-symbol"><CxIcon name="stack"/></span><span className="cc-eyebrow">مستندات الصناديق</span>
        <h3>مكتبة المستندات</h3><span className="cc-capital-tag">{hasDocuments?"مستندات منشورة":pending}</span>
        <p>ملخص المعلومات، والشروط والأحكام، وتقارير الأداء لكل صندوق عند توفرها.</p>
        <a className="cc-inline" href="/disclosures/#documents">افتح المكتبة</a></article>
    </div>
    {!available&&<p className="cc-disclosure-proof" role="status">ما قدرنا نحمّل البيانات المنشورة الحين.</p>}
  </section>;
}

export function FullDisclosures({data,names}:{data:FundDisclosure;names:Partial<Record<FieldId,string>>}) {
  const {offer,entity}=data;
  return <>
    <nav className="cc-capital-jump" aria-label="أقسام الإفصاحات">
      <a href="#offering">حالة الطرح</a><a href="#entity">الكيان والترخيص</a><a href="#documents">مستندات الصناديق</a>
    </nav>
    <div className="cc-capital-disclosure-details">
      <section id="offering" className="cc-capital-detail" aria-labelledby="offer-title">
        <header><span className="cc-symbol"><CxIcon name="calendar"/></span><div><span className="cc-capital-tag">{offer?"إفصاح منشور":pending}</span><h2 id="offer-title">حالة الطرح</h2></div></header>
        <DisclosureFacts rows={[
          ["الحالة",offerLabel(offer)],["بداية الطرح",offer&&disclosureDate(offer.start)],
          ["نهاية الطرح",offer&&disclosureDate(offer.end)],["الفئة المؤهلة",offer?.eligibility],
          ["عملة الطرح",offer&&"دولار أمريكي"],["سعر الوحدة",offer?.unitPrice!==undefined?`${disclosureNumber(offer.unitPrice)} دولار`:undefined],
          ["الحد الأدنى","شوف القيمة المنشورة في بطاقة كل صندوق."],
        ]}/>
        {offer&&<DisclosureProof source={offer.source} asOf={offer.asOf}/>}
        <a className="cc-inline" href="/plans/?view=compare#featured-opportunities">قارن بيانات الصناديق</a>
      </section>
      <section id="entity" className="cc-capital-detail" aria-labelledby="entity-title">
        <header><span className="cc-symbol"><CxIcon name="shield"/></span><div><span className="cc-capital-tag">{entity?"بيانات منشورة":pending}</span><h2 id="entity-title">الكيان والترخيص</h2></div></header>
        <DisclosureFacts rows={entityRows.map(([key,label])=>[label,entity?.[key]&&<bdi>{entity[key]}</bdi>] as const)}/>
        {entity&&<DisclosureProof source={entity.source} asOf={entity.asOf}/>}
      </section>
    </div>
    <section className="cc-capital-documents" id="documents" aria-labelledby="documents-title">
      <header className="u-heading"><div><span className="u-kicker">وثائق المستثمر</span><h2 id="documents-title">مستندات الصناديق</h2><p>تقدر تفتح كل مستند بعد نشره للصندوق.</p></div></header>
      <div className="cc-capital-document-grid">{fields.map(fund=><article key={fund.id}>
        <span className="cc-capital-tag">{data.documents[fund.id]?"مستندات منشورة":pending}</span><h3>{names[fund.id]||fund.name}</h3><DocumentLinks id={fund.id} data={data}/>
      </article>)}</div>
    </section>
  </>;
}

export async function FundDocuments({id}:{id:FieldId}) {
  const {content}=await getPublication();
  return <section className="cc-capital-detail cc-fund-documents" id="fund-documents" aria-labelledby="fund-documents-title">
    <header><span className="cc-symbol"><CxIcon name="stack"/></span><div><h2 id="fund-documents-title">مستندات الصندوق</h2></div></header>
    <DocumentLinks id={id} data={content.disclosure}/>
  </section>;
}
