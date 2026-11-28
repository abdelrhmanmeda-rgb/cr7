import { GlassLogo } from "./glass-logo";
import MobileNav from "./mobile-nav";
import { HeaderInvestorActions } from "./investor-actions";
import { site } from "./universe-copy";

export const nav = [["/plans","الصناديق الاستثمارية"],["/explorer","المستكشف"],["/knowledge","مركز المعرفة"],["/disclosures/","الإفصاحات"],["/about","عن المنصة"]] as const;
export function Brand(){return <a className="u-brand" href="/" aria-label={site.name+" · الرئيسية"}><GlassLogo/></a>}
export function UHeader(){return <header className="u-header"><div className="u-container"><Brand/><nav aria-label="القائمة الرئيسية">{nav.map(([url,label])=><a key={url} href={url}>{label}</a>)}</nav><HeaderInvestorActions/><MobileNav links={nav} brand={site.name} action={{href:site.registrationUrl?"/register/?mode=login":"/contact",text:site.registrationUrl?"حساب المستثمر":"تواصل معنا"}}/></div></header>}
export function UFooter(){return <footer className="u-footer"><div className="u-container"><Brand/><nav>{[...nav,["/journey","رحلة المستثمر"],["/contact/","تواصل معنا"]].map(([u,t])=><a key={u} href={u}>{t}</a>)}</nav><small>© {site.name}</small></div></footer>}
export function Heading({over,title,desc,href,link}:{over:string;title:string;desc?:string;href?:string;link?:string}){return <header className="u-heading"><div><span className="u-kicker">{over}</span><h2>{title}</h2>{desc&&<p>{desc}</p>}</div>{href&&<a className="u-textlink" href={href}>{link}</a>}</header>}
