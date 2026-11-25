import type { Metadata } from "next";
import { guideUrl } from "./guide-content";
import {AmbientHero} from "./ambient-hero";
import { FundCatalog,TrustNumbers } from "./universe-public";
import {site} from "./universe-copy";
import {getPublication} from "./universe-data";
import {ContactLinks} from "./universe-library";
import { InvestorSignupLink,HomeAccount } from "./investor-actions";
import {UHeader,UFooter,Heading} from "./universe-shell";
import {Knowledge,Faq,Journey,Values,Contact} from "./universe-library";
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
          <a href="/plans">شوف الصناديق</a>
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
 const {content}=await getPublication();
 return <div className="uv sgf-universe" id="top"><a href="#content" className="afq-skip">روح للمحتوى</a><UHeader/>
 <main id="content"><AmbientHero asset="hero" home><div className="u-herocopy">
 <span className="u-kicker">من الخليج إلى عالم الاستثمار</span><h1>{content.home.headline||<>{site.headline[0]}<br/><em>{site.headline[1]}</em></>}</h1><p>{content.home.intro||site.description}</p><div className="u-actions"><a className="u-btn gold" href="/plans">استكشف الصناديق</a><InvestorSignupLink className="u-btn"/></div>
 <div className="u-quick"><a href="#disclosures">مركز الإفصاحات</a><ContactLinks contact={content.contact} compact/></div>
 </div></AmbientHero>
 <div className="u-container"><nav className="u-ribbon" aria-label="وجهات سريعة">{[["◇","دليل الصناديق","/world"],["◎","مستكشف الاستثمار","/explorer"],["▤","الوثائق والإفصاحات","#disclosures"],["◈","رحلة المستثمر","/journey"]].map(([i,t,h])=><a key={h} href={h}><i aria-hidden="true">{i}</i>{t}</a>)}</nav>
 <TrustNumbers/>
 <FundCatalog compact/>
 <section id="explorer" className="u-promo"><div><span className="u-kicker">بوصلتك في الأسواق</span><h2>{content.explorer.title||"مستكشف الاستثمار الذكي"}</h2><p>{content.explorer.intro||(content.explorer.byRate?"ابحث باسم الصندوق أو بالعائد الأسبوعي المنشور.":"ابحث باسم الصندوق أو مجال الاستثمار.")}</p><a className="u-btn gold" href="/explorer">افتح المستكشف</a></div><div className="u-promo-photo"><LuxuryPhoto asset="market"/></div></section>
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

<div className="u-container"><section className="u-block"><Heading over="خطوة بخطوة" title="رحلة المستثمر" href="/journey" link="شوف الرحلة كاملة"/><Journey/></section></div>        <Disclosures />

<div className="u-container"><Knowledge/><Faq/>        <HomeAccount/>

<Contact/></div></main><UFooter/></div>;
}
