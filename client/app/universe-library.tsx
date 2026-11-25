import { getPublication } from "./universe-data";
import type { PublishedContent } from "./published-content";
import {articles,topics} from "./guide-content";
import {articlePhoto} from "./luxury-photo";
import {questions,site,telegramUrl} from "./universe-copy";
import {Catalog,type Tile} from "./universe-catalog";
import {Heading} from "./universe-shell";
const order=["property","gold","market","energy","funds","stocks","income","portfolio","compare"];
export const sectorTiles:Tile[]=topics.map(t=>({slug:t.slug,title:t.title,label:t.tag,intro:t.intro,art:t.icon,family:["property","gold","energy"].includes(t.slug)?"أصول عينية":["market","stocks","income"].includes(t.slug)?"الأسواق":"المحافظ"})).sort((a,b)=>order.indexOf(a.slug)-order.indexOf(b.slug));
export const articleTiles:Tile[]=articles.map((t,i)=>({slug:t.slug,title:t.title,label:t.label,intro:t.intro,art:articlePhoto(t.slug),family:["الخطط","المحافظ","المحافظ","الخطط","الأسواق","الأسواق"][i]}));
export function World({all=false}:{all?:boolean}){return <section id="sectors" className="u-block"><Heading over="دليل الأصول" title="عالم استثماراتك" desc="من ذهب تقدر تلمسه، إلى أسهم تمثّل حصّة في شركة. تعرّف على دور كل أصل داخل المحفظة." href={all?undefined:"/world"} link="كل المجالات"/><Catalog tiles={all?sectorTiles:sectorTiles.slice(0,4)} search={all} compact={!all}/></section>}
export function Knowledge({all=false}:{all?:boolean}){return <section id="knowledge" className="u-block"><Heading over="المكتبة" title="مركز المعرفة" desc="قراءات تساعدك تفهم التنويع والسيولة والتكاليف قبل ما تقارن بين الخيارات." href={all?undefined:"/knowledge"} link="كل المقالات"/><Catalog tiles={all?articleTiles:articleTiles.slice(0,3)} search={all}/></section>}
export function Faq(){return <section id="faq" className="u-block u-split"><Heading over="دليل الزائر" title="الأسئلة الشائعة" desc="كل اللي تحتاج تعرفه عن استخدام المنصة وحسابك."/><div className="u-faq">{questions(site.registrationUrl).map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>}
export function Journey(){return <div className="u-steps">{[["تعرّف على المجالات","خذ فكرة عن طبيعة الأصل وش دوره في المحفظة.","/world"],["قارن الخيارات","اطّلع على الشروط والإفصاحات قبل أي قرار.","/opportunities"],["جهّز حسابك","إذا التسجيل متاح، أكّد بريدك واحفظ بيانات دخولك.",site.registrationUrl||"/contact"],["تابع حسابك","ارجع لبيانات حسابك أو تواصل مع إدارة المنصة.",site.registrationUrl||"/contact"]].map(([t,d,h],i)=><a key={t} href={h}><small>{["٠١","٠٢","٠٣","٠٤"][i]}</small><h3>{t}</h3><p>{d}</p></a>)}</div>}
export function Values(){return <div className="u-values">{[["رؤيتنا","نسعى إلى تجربة استثمارية رقمية تجمع وضوح المعلومة وسهولة الوصول وتنوّع الخيارات."],["رسالتنا","نجمع تفاصيل الأصول ونرتّبها لك على أساس واحد: الهدف والمدّة والسيولة والتكاليف."],["قيمنا","كل معلومة لها سياق، وكل رقم منشور له مصدر وتاريخ. نفرّق بين العائد المستهدف والنتيجة اللي تحققت."]].map(([h,t])=><article key={h}><span className="u-diamond" aria-hidden="true">◇</span><h3>{h}</h3><p>{t}</p></article>)}</div>}
export function ContactLinks({contact,compact=false}:{contact:PublishedContent["contact"];compact?:boolean}){
  const chat=contact.hideChat?"":contact.telegramChat||telegramUrl;
  return <>{chat&&<a className={compact?undefined:"u-btn gold"} href={chat} target="_blank" rel="noopener noreferrer">راسلنا على تيليجرام</a>}{contact.telegramChannel&&<a className={compact?undefined:"u-btn"} href={contact.telegramChannel} target="_blank" rel="noopener noreferrer">قناة تيليجرام</a>}</>;
}
export async function Contact(){
  const {content:{contact}}=await getPublication();
  return <div className="u-contact" id="contact"><div><span className="u-kicker">إدارة صناديق الخليج الذكية</span><h2>{contact.title||"خلّنا على تواصل"}</h2><p>{contact.message||"للاستفسار عن المنصة أو حسابك، تواصل مع إدارة صناديق الخليج الذكية."}</p></div><div className="u-actions"><ContactLinks contact={contact}/></div></div>;
}
