import type { Metadata } from "next";
import { guideUrl } from "./guide-content";
import {AmbientHero} from "./ambient-hero";
import {Plans} from "./investment-plans-view";
import {site,telegramUrl} from "./universe-copy";
import {UHeader,UFooter,Heading} from "./universe-shell";
import {World,Knowledge,Faq,Journey,Values,Contact} from "./universe-library";
import {TrustNumbers,OpportunityList} from "./universe-public";
import { CinematicHeader, CinematicHero, CinematicSectors, MetricWave } from "./cinematic-home";
import { cinematicDesign,isDesignPreview } from "./design-config";
import { SectorCatalog } from "./sector-catalog";
import {LuxuryPhoto} from "./luxury-photo";
export const metadata: Metadata = {
  title: `${site.name} | الصناديق والأسواق والأصول`,
  description: site.description,
  openGraph: { title: `${site.name} | ${site.headline.join(" ")}`, description: site.description, locale: "ar", type: "website" },
};

function SectionTitle({ label, title, text }: { label: string; title: string; text?: string }) {
  return (
    <div className="afq-section-title">
      <span className="afq-eyebrow">{label}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function Disclosures() {
  return (
    <section id="disclosures" className="afq-section afq-wrap sgf-disclosures">
      <SectionTitle label="وثائق وبيانات" title="مركز الإفصاحات" text="مكان واحد يوضّح حالة الطرح وش المستندات المتوفرة." />
      <div className="sgf-disclosure-grid">
        <article>
          <span className="sgf-disclosure-label">حالة الطرح</span>
          <h3>ما فيه اشتراك حاليًا</h3>
          <p>حساب المنصة لتسجيل الدخول وإدارة بياناتك. فتح الحساب ما ينشئ استثمار أو إيداع.</p>
          <a href="#plans">شوف حالة الخطط</a>
        </article>
        <article>
          <span className="sgf-disclosure-label">بيانات الكيان والترخيص</span>
          <h3>ما فيه بيانات ترخيص منشورة</h3>
          <p>الموقع ما يعرض رقم ترخيص مالي أو موافقة طرح. إذا توثقت البيانات للنشر، تُعرض باسم الكيان القانوني والنشاط المرخّص له.</p>
        </article>
        <article>
          <span className="sgf-disclosure-label">مستندات الاستثمار</span>
          <h3>ما فيه مستندات طرح أو أداء منشورة</h3>
          <p>شروط الاشتراك والاسترداد والرسوم والمخاطر، وسعر الوحدة وتاريخ التقييم عند توفر منتج وصافي قيمة أصول موثق.</p>
          <a href={guideUrl("read-fund-documents")}>تعرّف على مستندات الصندوق</a>
        </article>
      </div>
    </section>
  );
}

export default async function Page() {
 const cinematic = cinematicDesign;
 const preview = isDesignPreview;

 const registrationUrl=site.registrationUrl||null;
 return <div className={`uv sgf-universe${cinematic ? " cx-home" : ""}`} id="top"><a href="#content" className="afq-skip">روح للمحتوى</a>{cinematic ? <CinematicHeader account={registrationUrl}/> : <UHeader/>}
 <main id="content">{cinematic ? <>
 <CinematicHero/><CinematicSectors/>
 <div className="cx-metric-zone"><MetricWave/><div className="cx-wrap"><TrustNumbers cinematic/></div></div>
 <div className="cx-wrap"><SectorCatalog compact sample={preview}/></div>
 </> : <AmbientHero asset="hero" home><div className="u-herocopy">
 <span className="u-kicker">من الخليج إلى عالم الاستثمار</span><h1>{site.headline[0]}<br/><em>{site.headline[1]}</em></h1><p>{site.description}</p><div className="u-actions"><a className="u-btn gold" href="/plans">استكشف الباقات</a><a className="u-btn" href={registrationUrl||"/contact"}>{registrationUrl?"أنشئ حسابك":"تواصل معنا"}</a></div>
 <div className="u-quick"><a href="#disclosures">مركز الإفصاحات</a>{telegramUrl&&<a href={telegramUrl} target="_blank" rel="noopener noreferrer">تليجرام المنصة</a>}</div>
 </div></AmbientHero>}
 <div className="u-container"><nav className="u-ribbon" aria-label="وجهات سريعة">{[["◇","دليل الأصول","/world"],["◎","مستكشف الاستثمار","/explorer"],["▤","الوثائق والإفصاحات","#disclosures"],["◈","رحلة المستثمر","/journey"]].map(([i,t,h])=><a key={h} href={h}><i aria-hidden="true">{i}</i>{t}</a>)}</nav>
 {!cinematic&&<Plans/>}{!cinematic && <><TrustNumbers/><World/></>}
 <section id="explorer" className="u-promo"><div><span className="u-kicker">بوصلتك في الأسواق</span><h2>مستكشف الاستثمار الذكي</h2><p>اختَر المجال اللي يهمّك، وضيّق بحثك بين الأدلة والفرص المنشورة.</p><a className="u-btn gold" href="/explorer">افتح المستكشف</a></div><div className="u-promo-photo">{cinematic?<img src="/cinematic/explorer-scene.webp" alt="" loading="lazy" decoding="async"/>:<LuxuryPhoto asset="market"/>}</div></section>
 {!cinematic && <section className="u-block"><OpportunityList featured/></section>}
 <section id="why" className="u-block"><Heading over="منهج المنصة" title="ليش صناديق الخليج الذكية؟"/><Values/></section>
 </div>        <section id="about" className="afq-section afq-section-band">
          <div className="afq-wrap afq-about">
            <SectionTitle label={`عن ${site.name}`} title="كل استثمار له دور في المحفظة" text="في صناديق الخليج الذكية نركّز على فايدة كل استثمار، وش يضيف للمحفظة، وكيف تحدد سياسة الاستثمار اختيار الأصول بحسب الهدف والمدّة والسيولة." />
            <div className="afq-about-visual" aria-hidden="true">{cinematic?<img src="/cinematic/about-scene.webp" alt="" loading="lazy" decoding="async"/>:<LuxuryPhoto asset="property" />}</div>
            <div className="afq-about-card">
              <span className="afq-eyebrow">طريقتنا في عرض الاستثمار</span>
              <ol>
                <li><span>١</span><div><strong>نحدّد الهدف</strong><small>نبيّن وظيفة الأصل: نمو، دخل أو سيولة.</small></div></li>
                <li><span>٢</span><div><strong>نوضّح الاختيار</strong><small>نربط بين طبيعة الأصل ومدّة الخطة وتكاليفها.</small></div></li>
                <li><span>٣</span><div><strong>نقيس النتيجة بالصافي</strong><small>نشرح أثر الرسوم والتوزيعات والتراكم.</small></div></li>
              </ol>
            </div>
          </div>
        </section>

<div className="u-container"><section className="u-block"><Heading over="خطوة بخطوة" title="رحلة المستثمر" href="/journey" link="شوف الرحلة كاملة"/><Journey/></section></div>        <Disclosures />

<div className="u-container"><Knowledge/><Faq/>        <section id="registration" className="afq-section afq-registration">
          <SectionTitle label="حسابك في المنصة" title={registrationUrl ? "أنشئ حسابك" : "التسجيل مو متاح الحين"} text={registrationUrl ? "أكّد بريدك عشان تكمل فتح الحساب. وإذا عندك حساب من قبل، تقدر تسجّل دخولك من نفس الصفحة." : "تقدر تطّلع على المقالات في مركز المعرفة لين يتاح التسجيل."} />
          <a className="afq-button afq-button-gold" href={registrationUrl ?? "#knowledge"}>{registrationUrl ? "افتح صفحة الحساب" : "ابدأ القراءة"}</a>
        </section>

<Contact/></div></main><UFooter/></div>;
}
