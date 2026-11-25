import {notFound} from "next/navigation";
import {UHeader,UFooter,Heading} from "../universe-shell";
import {Knowledge,Faq,Values,Journey,Contact} from "../universe-library";
import {AmbientHero} from "../ambient-hero";
import { FundCatalog } from "../universe-public";
import {site} from "../universe-copy";
import {getPublication} from "../universe-data";
const pages={
world:["دليل الصناديق","صناديق الاستثمار الأربعة","العقارات والذهب والأسواق المالية والطاقة. اختَر الصندوق اللي يهمّك واطّلع على تفاصيله.","hero"],
explorer:["مستكشف الاستثمار الذكي","البحث والمقارنة","اكتب اسم الصندوق أو المجال للبحث.","market"],
opportunities:["صناديق مختارة","صناديق الاستثمار الأربعة","طالع بطاقة كل صندوق وشوف العائد الأسبوعي والحد الأدنى إذا كانت الأرقام منشورة.","hero"],
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
 const explorer=section==="explorer"?(await getPublication()).content.explorer:undefined;
 return <div className="uv sgf-universe"><UHeader/><main className="u-container"><nav className="u-crumb"><a href="/">الرئيسية</a><span>/</span>{over}</nav>
 <AmbientHero asset={asset}><span className="u-kicker">{over}</span><h1>{explorer?.title||title}</h1><p>{explorer?.intro||desc}</p><div className="u-actions"><a href="#inside" className="u-btn gold">{section==="explorer"?"خصّص بحثك":"استكشف التفاصيل"}</a>{section==="opportunities" && <a href="/plans" className="u-btn">شوف الصناديق</a>}</div></AmbientHero>
 <div id="inside">{section==="world"?<FundCatalog compact heading="تعرّف على الصناديق الأربعة"/>:section==="knowledge"?<><Knowledge all/><Faq/></>:section==="explorer"?<FundCatalog search heading="وش تبي تستكشف؟"/>:section==="opportunities"?<FundCatalog compact/>:section==="about"?<><section className="u-block"><Heading over="هويتنا" title="وضوح في كل خطوة"/><Values/></section><section className="u-block u-panel"><h2>أهدافنا ومنهجية العمل</h2><p>نشرح طبيعة الأصول، نبيّن اختلافها في السيولة والدخل، ونربط كل معلومة بالشروط اللي تنطبق عليها. تقدر ترجع إلى مركز الإفصاحات لمعرفة حالة الطرح والمستندات المتوفرة.</p><a className="u-textlink" href="/#disclosures">افتح مركز الإفصاحات</a></section></>:section==="journey"?<section className="u-block"><Heading over="خطواتك" title="من الاستكشاف إلى المتابعة"/><Journey/></section>:<><Contact/><section className="u-block"><Heading over="مساعدة الحساب" title="إدارة الدخول"/><div className="u-actions">{site.registrationUrl&&<a className="u-btn" href={site.registrationUrl}>افتح صفحة الحساب</a>}<a className="u-btn" href="/knowledge#faq">الأسئلة الشائعة</a></div></section></>}</div></main><UFooter/></div>
}
