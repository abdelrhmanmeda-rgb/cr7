import MobileNav from "./mobile-nav";
import { site } from "./universe-copy";
import { BrandMark } from "./brand-mark";

export const nav = [["/world","عالم الاستثمار"],["/explorer","المستكشف"],["/opportunities","الفرص"],["/plans","الباقات"],["/knowledge","مركز المعرفة"],["/about","عن المنصة"],["/contact","تواصل معنا"]] as const;
export function Brand(){return <BrandMark className="u-brand"/>}
export function UHeader(){return <header className="u-header"><div className="u-container"><Brand/><nav aria-label="القائمة الرئيسية">{nav.map(([url,label])=><a key={url} href={url}>{label}</a>)}</nav><a className="u-action" href={site.registrationUrl||"/contact"}>{site.registrationUrl?"حساب المستثمر":"تواصل معنا"}</a><MobileNav links={nav} brand={site.name} action={{href:site.registrationUrl||"/contact",text:site.registrationUrl?"حساب المستثمر":"تواصل معنا"}}/></div></header>}
export function UFooter(){return <footer className="u-footer"><div className="u-container"><Brand/><nav>{[...nav,["/journey","رحلة المستثمر"],["/#disclosures","مركز الإفصاحات"]].map(([u,t])=><a key={u} href={u}>{t}</a>)}</nav><small>© {site.name}</small></div></footer>}
export function Heading({over,title,desc,href,link}:{over:string;title:string;desc?:string;href?:string;link?:string}){return <header className="u-heading"><div><span className="u-kicker">{over}</span><h2>{title}</h2>{desc&&<p>{desc}</p>}</div>{href&&<a className="u-textlink" href={href}>{link}</a>}</header>}
