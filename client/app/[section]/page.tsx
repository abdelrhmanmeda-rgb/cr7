import {notFound} from "next/navigation";
import {UHeader,UFooter,Heading} from "../universe-shell";
import {World,Knowledge,Faq,Values,Journey,Contact,sectorTiles} from "../universe-library";
import UniverseScene from "../universe-scene";
import Explorer from "../universe-explorer";
import {OpportunityList} from "../universe-public";
import {getPublication} from "../universe-data";
import {site} from "../universe-copy";
const pages={
world:["عالم استثماراتك","الأصول في مشهد واحد","العقارات والذهب والأسواق والطاقة، ومعها باقي المجالات. اختَر فئة وادخل في تفاصيلها.","city"],
explorer:["مستكشف الاستثمار الذكي","البحث والمقارنة","تنقّل بين المجالات والفرص، وحدّد اللي تبي تشوفه بنفسك.","globe"],
opportunities:["الفرص الاستثمارية","دليل الفرص المنشورة","كل فرصة منشورة لها صفحة تعرض المعلومات اللي اعتمدتها إدارة المنصة. حالة الاشتراك في الخطط تلقاها في قسم الخطط.","city"],
about:["من نحن ورؤيتنا للمستقبل","عن صناديق الخليج الذكية","نجمع لك الأصول والأسواق في تجربة رقمية واضحة، ونشرح كيف تخدم الخيارات المختلفة هدف المحفظة ومدّتها.","city"],
journey:["رحلة استثمار واضحة","رحلة المستثمر","من أول قراءة للمجال إلى متابعة حسابك، كل خطوة لها وجهة واضحة.","globe"],
knowledge:["مركز المعرفة","قراءات من المنصة","مقالات عن السيولة والتنويع والتكاليف، وإجابات عن استخدام المنصة. اختَر الموضوع اللي تحتاجه.","market"],
contact:["تواصل معنا","خدمة المستثمر","عندك استفسار عن حسابك أو تحتاج توصل للإدارة؟ هذي قنوات التواصل المعتمدة في الموقع.","city"]
} as const;
type Key=keyof typeof pages; type Props={params:Promise<{section:string}>};
function valid(k:string):k is Key{return Object.hasOwn(pages,k)}
export const dynamicParams=false;
export function generateStaticParams(){return Object.keys(pages).map(section=>({section}))}
export async function generateMetadata({params}:Props){const {section}=await params;if(!valid(section))notFound();return {title:pages[section][0],description:pages[section][2]}}
export default async function Section({params}:Props){const {section}=await params;if(!valid(section))notFound();const [title,over,desc,kind]=pages[section];
 const data=section==="explorer"?await getPublication():null;
 return <div className="uv sgf-universe"><UHeader/><main className="u-container"><nav className="u-crumb"><a href="/">الرئيسية</a><span>/</span>{over}</nav>
 <section className="u-inner-hero"><div><span className="u-kicker">{over}</span><h1>{title}</h1><p>{desc}</p><a href="#inside" className="u-btn gold">{section==="explorer"?"خصّص بحثك":"استكشف التفاصيل"}</a></div><UniverseScene kind={kind} label={over}/></section>
 <div id="inside">{section==="world"?<World all/>:section==="knowledge"?<><Knowledge all/><Faq/></>:section==="explorer"?<section className="u-block"><Explorer tiles={sectorTiles} listings={data?.opportunities.map(o=>({id:o.id,title:o.name,sector:o.sector,summary:o.intro}))}/></section>:section==="opportunities"?<section className="u-block"><OpportunityList/></section>:section==="about"?<><section className="u-block"><Heading over="هويتنا" title="وضوح في كل خطوة"/><Values/></section><section className="u-block u-panel"><h2>أهدافنا ومنهجية العمل</h2><p>نشرح طبيعة الأصول، نبيّن اختلافها في السيولة والدخل، ونربط كل معلومة بالشروط اللي تنطبق عليها. تقدر ترجع إلى مركز الإفصاحات لمعرفة حالة الطرح والمستندات المتوفرة.</p><a className="u-textlink" href="/#disclosures">افتح مركز الإفصاحات</a></section></>:section==="journey"?<section className="u-block"><Heading over="خطواتك" title="من الاستكشاف إلى المتابعة"/><Journey/></section>:<><Contact/><section className="u-block"><Heading over="مساعدة الحساب" title="إدارة الدخول"/><div className="u-actions">{site.registrationUrl&&<a className="u-btn" href={site.registrationUrl}>افتح صفحة الحساب</a>}<a className="u-btn" href="/knowledge#faq">الأسئلة الشائعة</a></div></section></>}</div></main><UFooter/></div>
}
