import type { Metadata } from "next";
import { guideUrl } from "./guide-content";
import UniverseScene from "./universe-scene";
import AssetObservatory from "./observatory";
import {site,telegramUrl} from "./universe-copy";
import {UHeader,UFooter,Heading} from "./universe-shell";
import {World,Knowledge,Faq,Journey,Values,Contact} from "./universe-library";
import {TrustNumbers,OpportunityList} from "./universe-public";
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

export default function Page() {
 const registrationUrl=site.registrationUrl||null;
 return <div className="uv sgf-universe" id="top"><a href="#content" className="afq-skip">روح للمحتوى</a><UHeader/>
 <main id="content"><section className="u-hero"><div className="u-container u-stage"><div className="u-herocopy">
 <span className="u-kicker">من الخليج إلى عالم الاستثمار</span><h1>{site.headline[0]}<br/><em>{site.headline[1]}</em></h1><p>{site.description}</p><div className="u-actions"><a className="u-btn gold" href="/world">استكشف عالم الاستثمار</a><a className="u-btn" href={registrationUrl||"/contact"}>{registrationUrl?"أنشئ حسابك":"تواصل معنا"}</a></div>
 <div className="u-quick"><a href="#disclosures">مركز الإفصاحات</a>{telegramUrl&&<a href={telegramUrl} target="_blank" rel="noopener noreferrer">تليجرام المنصة</a>}</div>
 </div><div className="u-stage-art"><UniverseScene kind="city" label="جزيرة الخليج المعمارية"/></div></div></section>
 <div className="u-container"><nav className="u-ribbon" aria-label="وجهات سريعة">{[["◇","دليل الأصول","/world"],["◎","مستكشف الاستثمار","/explorer"],["▤","الوثائق والإفصاحات","#disclosures"],["◈","رحلة المستثمر","/journey"]].map(([i,t,h])=><a key={h} href={h}><i aria-hidden="true">{i}</i>{t}</a>)}</nav>
 <TrustNumbers/><World/>
 <section id="explorer" className="u-promo"><div><span className="u-kicker">بوصلتك في الأسواق</span><h2>مستكشف الاستثمار الذكي</h2><p>اختَر المجال اللي يهمّك، وضيّق بحثك بين الأدلة والفرص المنشورة.</p><a className="u-btn gold" href="/explorer">افتح المستكشف</a></div><UniverseScene kind="globe" label="كرة مسارات الاستثمار"/></section>
 <section className="u-block"><OpportunityList featured/></section>
 <section id="why" className="u-block"><Heading over="منهج المنصة" title="ليش صناديق الخليج الذكية؟"/><Values/></section>
 </div>        <section id="about" className="afq-section afq-section-band">
          <div className="afq-wrap afq-about">
            <SectionTitle label={`عن ${site.name}`} title="كل استثمار له دور في المحفظة" text="في صناديق الخليج الذكية نركّز على فايدة كل استثمار، وش يضيف للمحفظة، وكيف تحدد سياسة الاستثمار اختيار الأصول بحسب الهدف والمدّة والسيولة." />
            <div className="afq-about-visual" aria-hidden="true"><LuxuryPhoto asset="property" /></div>
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

<div className="u-container"><section className="u-block"><Heading over="خطوة بخطوة" title="رحلة المستثمر" href="/journey" link="شوف الرحلة كاملة"/><Journey/></section></div>        <section id="plans" className="afq-wrap afq-section afq-plans" aria-labelledby="afq-plans-title">
          <div className="afq-plans-panel">
            <div className="afq-plans-head">
              <div>
                <span className="afq-eyebrow">تفاصيل الاشتراك</span>
                <h2 id="afq-plans-title">الخطط الاستثمارية</h2>
              </div>
              <span className="afq-plan-status">ما فيه خطط مفتوحة للاشتراك الحين</span>
            </div>
            <p>إذا توفّرت خطة، تلقى هنا هدفها ومدّتها وشروطها وطريقة احتساب النتيجة.</p>
            <dl className="afq-plan-criteria">
              <div><dt>الاستراتيجية ورأس المال</dt><dd>نوع الأصول اللي تخدم الخطة وحدود الاشتراك فيها.</dd></div>
              <div><dt>المدة والسيولة</dt><dd>مدة بقاء الاستثمار ووقت الاسترداد وشروطه.</dd></div>
              <div><dt>النتائج والتكاليف</dt><dd>كيف ينحسب العائد بعد الرسوم، والفرق بين الهدف والنتيجة اللي تحققت.</dd></div>
            </dl>
            <a className="afq-button" href={guideUrl("read-investment-terms")}>اقرأ عن فائدة وضوح الخطة</a>
          </div>
        </section>

        <Disclosures />

<div className="u-container"><Knowledge/><Faq/><details className="u-ob"><summary>مرصد الأصول · النمو والدخل والسيولة</summary><AssetObservatory/></details>        <section id="registration" className="afq-section afq-registration">
          <SectionTitle label="حسابك في المنصة" title={registrationUrl ? "أنشئ حسابك" : "التسجيل مو متاح الحين"} text={registrationUrl ? "أكّد بريدك عشان تكمل فتح الحساب. وإذا عندك حساب من قبل، تقدر تسجّل دخولك من نفس الصفحة." : "تقدر تطّلع على المقالات في مركز المعرفة لين يتاح التسجيل."} />
          <a className="afq-button afq-button-gold" href={registrationUrl ?? "#knowledge"}>{registrationUrl ? "افتح صفحة الحساب" : "ابدأ القراءة"}</a>
        </section>

<Contact/></div></main><UFooter/></div>;
}
