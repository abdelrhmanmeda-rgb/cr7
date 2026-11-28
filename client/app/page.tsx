import type { Metadata } from "next";
import Image from "next/image";
import { CxIcon } from "./cinematic-icons";
import { CapitalMetrics } from "./capital-metrics";
import { CapitalDisclosures } from "./disclosure-views";
import { FundCatalog } from "./universe-public";
import { site } from "./universe-copy";
import { getPublication } from "./universe-data";
import { UHeader,UFooter,Heading } from "./universe-shell";
import { Knowledge,Faq,Journey,Contact } from "./universe-library";
import { HomeAccount } from "./investor-actions";

export const revalidate = 60;
export const metadata: Metadata = {
  title: `${site.name} | دليل الصناديق ومركز المعرفة`, description:site.description,
};
const shortcuts = [
  {href:"/explorer/", icon:"bars", label:"مستكشف الصناديق", text:"ابحث باسم الصندوق أو مجال الاستثمار."},
  {href:"/plans/?view=compare#featured-opportunities", icon:"stack", label:"مقارنة الصناديق", text:"قارن الخيارات في جدول واحد."},
  {href:"/disclosures/", icon:"shield", label:"الوثائق والإفصاحات", text:"تعرّف على حالة الطرح والمستندات."},
] as const;

export default async function Page() {
  const {content,metrics,available}=await getPublication();
  return <div className="uv sgf-universe cc-home" id="top">
    <a href="#content" className="afq-skip">روح للمحتوى</a><UHeader/>
    <main id="content">
      <section className="cc-hero" aria-labelledby="cc-title">
        <div className="u-container cc-hero-grid">
          <div className="cc-hero-copy">
            <span className="cc-overline">صناديق الخليج الذكية</span>
            <h1 id="cc-title">{content.home.headline||<>تعرّف على صناديق الاستثمار <em>على بيّنة.</em></>}</h1>
            <p>{content.home.intro||"من العقار والذهب إلى الأسواق المالية والطاقة. تعرّف على هدف كل صندوق، وقارن بين المجالات قبل ما تاخذ قرارك."}</p>
            <div className="u-actions"><a className="u-btn gold" href="/plans/">تصفّح الصناديق</a><a className="u-btn cc-hero-secondary" href="/disclosures/">الوثائق والإفصاحات</a></div>
          </div>
          <div className="cc-hero-art" aria-hidden="true">
            <div className="cc-hero-photo"><Image src="/property.webp" alt="" fill unoptimized sizes="(max-width:760px) 100vw, 48vw" fetchPriority="high"/></div>
            <span className="cc-arch cc-arch-one"/><span className="cc-arch cc-arch-two"/><span className="cc-art-dot"/>
          </div>
        </div>
      </section>
      <div className="u-container">
        <nav className="cc-shortcuts" aria-label="روابط سريعة">{shortcuts.map(({href,icon,label,text})=><a key={href} href={href}><span className="cc-symbol"><CxIcon name={icon}/></span><span><strong>{label}</strong><small>{text}</small></span></a>)}</nav>
        <FundCatalog compact heading="استكشف مجالات الاستثمار"/>
        <CapitalMetrics metrics={metrics} available={available}/>
      </div>
      <div className="cc-band"><div className="u-container"><CapitalDisclosures data={content.disclosure} available={available}/></div></div>
      <div className="u-container">
        <Knowledge/>
        <section className="u-block cc-journey"><Heading over="رحلة المستثمر" title="من تصفّح الصندوق إلى متابعة حسابك" href="/journey/" link="رحلة المستثمر"/><Journey/></section>
        <Faq/><HomeAccount/><Contact/>
      </div>
    </main><UFooter/>
  </div>;
}
