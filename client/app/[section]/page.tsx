import {notFound} from "next/navigation";
import {UHeader,UFooter,Heading} from "../universe-shell";
import {World,Knowledge,Faq,Values,Journey,Contact,sectorTiles} from "../universe-library";
import {AmbientHero} from "../ambient-hero";
import Explorer from "../universe-explorer";
import {OpportunityList} from "../universe-public";
import {getPublication} from "../universe-data";
import { CinematicHeader } from "../cinematic-home";
import { CinematicInterior } from "../cinematic-interior";
import { cinematicDesign,isDesignPreview } from "../design-config";
import { SectorCatalog } from "../sector-catalog";
import {site} from "../universe-copy";
const pages={
world:["عالم استثماراتك","الأصول في مشهد واحد","العقارات والذهب والأسواق والطاقة، ومعها باقي المجالات. اختَر فئة وادخل في تفاصيلها.","hero"],
explorer:["مستكشف الاستثمار الذكي","البحث والمقارنة","تنقّل بين المجالات والفرص، وحدّد اللي تبي تشوفه بنفسك.","market"],
opportunities:["الفرص الاستثمارية","دليل الفرص المنشورة","كل فرصة منشورة لها صفحة تعرض المعلومات اللي اعتمدتها إدارة المنصة. حالة الاشتراك في الخطط تلقاها في قسم الخطط.","hero"],
about:["من نحن ورؤيتنا للمستقبل","عن صناديق الخليج الذكية","نجمع لك الأصول والأسواق في تجربة رقمية واضحة، ونشرح كيف تخدم الخيارات المختلفة هدف المحفظة ومدّتها.","hero"],
journey:["رحلة استثمار واضحة","رحلة المستثمر","من أول قراءة للمجال إلى متابعة حسابك، كل خطوة لها وجهة واضحة.","market"],
knowledge:["مركز المعرفة","قراءات من المنصة","مقالات عن السيولة والتنويع والتكاليف، وإجابات عن استخدام المنصة. اختَر الموضوع اللي تحتاجه.","market"],
contact:["تواصل معنا","خدمة المستثمر","عندك استفسار عن حسابك أو تحتاج توصل للإدارة؟ هذي قنوات التواصل المعتمدة في الموقع.","hero"]
} as const;
type Key=keyof typeof pages; type Props={params:Promise<{section:string}>};
function valid(k:string):k is Key{return Object.hasOwn(pages,k)}
export const dynamicParams=false;
export function generateStaticParams(){return Object.keys(pages).map(section=>({section}))}
export async function generateMetadata({params}:Props){const {section}=await params;if(!valid(section))notFound();return {title:pages[section][0],description:pages[section][2]}}
export default async function Section({params}:Props){const {section}=await params;if(!valid(section))notFound();const [title,over,desc,asset]=pages[section];
 if(cinematicDesign) {
  const investmentSection=section==="world"||section==="explorer"||section==="opportunities";
  const copy=section==="world"?"العقار، الذهب والمعادن، الأسواق المالية والتداول، والطاقة. اختَر مجال واطّلع على تفاصيله.":section==="explorer"?"ابحث باسم الصندوق أو المجال، وشوف المعلومات المنشورة عنه.":section==="opportunities"?"تصفّح المجالات الأربعة، واطّلع على بطاقاتها وتفاصيلها.":desc;
  return <div className="uv sgf-universe cx-home ci-page"><CinematicHeader account={site.registrationUrl||null} active={"/"+section}/><main className="cx-wrap">
   <nav className="u-crumb"><a href="/">الرئيسية</a><span>/</span>{over}</nav>
   <CinematicInterior art={section+"-scene"} title={title} kicker={over} desc={copy}><a className="cx-btn cx-gold" href={section==="explorer"?"#search-fields":"#inside"}>{section==="explorer"?"ابدأ البحث":"استكشف التفاصيل"}</a></CinematicInterior>
   <div id="inside" className="ci-content">{investmentSection?<SectorCatalog sample={isDesignPreview} search={section==="explorer"} heading={section==="explorer"?"وش تبي تستكشف؟":section==="world"?"مجالات الاستثمار":"الفرص في المجالات الأربعة"}/>:section==="knowledge"?<><Knowledge all/><Faq/></>:section==="about"?<><section className="u-block"><Heading over="هويتنا" title="وضوح في كل خطوة"/><Values/></section><section className="u-panel"><h2>أهدافنا ومنهجية العمل</h2><p>نشرح طبيعة الأصول، ونبيّن اختلافها في السيولة والدخل. تقدر ترجع لمركز الإفصاحات لمعرفة حالة الطرح والمستندات.</p><a className="u-textlink" href="/#disclosures">افتح مركز الإفصاحات</a></section></>:section==="journey"?<section className="u-block"><Heading over="خطواتك" title="من الاستكشاف إلى المتابعة"/><Journey/></section>:<><Contact/><section className="u-block"><Heading over="مساعدة الحساب" title="إدارة الدخول"/><div className="u-actions">{site.registrationUrl&&<a className="u-btn" href={site.registrationUrl}>افتح صفحة الحساب</a>}<a className="u-btn" href="/knowledge#faq">الأسئلة الشائعة</a></div></section></>}</div>
  </main><UFooter/></div>;
 }
 const data=section==="explorer"?await getPublication():null;
 return <div className="uv sgf-universe"><UHeader/><main className="u-container"><nav className="u-crumb"><a href="/">الرئيسية</a><span>/</span>{over}</nav>
 <AmbientHero asset={asset}><span className="u-kicker">{over}</span><h1>{title}</h1><p>{desc}</p><div className="u-actions"><a href="#inside" className="u-btn gold">{section==="explorer"?"خصّص بحثك":"استكشف التفاصيل"}</a>{section==="opportunities" && <a href="/plans" className="u-btn">شوف الباقات</a>}</div></AmbientHero>
 <div id="inside">{section==="world"?<World all/>:section==="knowledge"?<><Knowledge all/><Faq/></>:section==="explorer"?<section className="u-block"><Explorer tiles={sectorTiles} listings={data?.opportunities.map(o=>({id:o.id,title:o.name,sector:o.sector,summary:o.intro}))}/></section>:section==="opportunities"?<section className="u-block"><OpportunityList/></section>:section==="about"?<><section className="u-block"><Heading over="هويتنا" title="وضوح في كل خطوة"/><Values/></section><section className="u-block u-panel"><h2>أهدافنا ومنهجية العمل</h2><p>نشرح طبيعة الأصول، نبيّن اختلافها في السيولة والدخل، ونربط كل معلومة بالشروط اللي تنطبق عليها. تقدر ترجع إلى مركز الإفصاحات لمعرفة حالة الطرح والمستندات المتوفرة.</p><a className="u-textlink" href="/#disclosures">افتح مركز الإفصاحات</a></section></>:section==="journey"?<section className="u-block"><Heading over="خطواتك" title="من الاستكشاف إلى المتابعة"/><Journey/></section>:<><Contact/><section className="u-block"><Heading over="مساعدة الحساب" title="إدارة الدخول"/><div className="u-actions">{site.registrationUrl&&<a className="u-btn" href={site.registrationUrl}>افتح صفحة الحساب</a>}<a className="u-btn" href="/knowledge#faq">الأسئلة الشائعة</a></div></section></>}</div></main><UFooter/></div>
}
