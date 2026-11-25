import Image from "next/image";
import MobileNav from "./mobile-nav";
import { HeaderInvestorActions } from "./investor-actions";
import { site } from "./universe-copy";

export const nav = [["/plans","الصناديق الاستثمارية"],["/explorer","المستكشف"],["/knowledge","مركز المعرفة"],["/about","عن المنصة"],["/contact","تواصل معنا"]] as const;
export function Brand(){return <a className="u-brand" href="/" aria-label={site.name+" · الرئيسية"}><Image src="/brand/sgf-mark.svg" alt="" width={42} height={40} priority unoptimized/><span><b>{site.name}</b><small lang="en">SMART GULF FUNDS</small></span></a>}
export function UHeader(){return <header className="u-header"><div className="u-container"><Brand/><nav aria-label="القائمة الرئيسية">{nav.map(([url,label])=><a key={url} href={url}>{label}</a>)}</nav><HeaderInvestorActions/><MobileNav links={nav} brand={site.name} action={{href:site.registrationUrl?"/register?mode=login":"/contact",text:site.registrationUrl?"حساب المستثمر":"تواصل معنا"}}/></div></header>}
export function UFooter(){return <footer className="u-footer"><div className="u-container"><Brand/><nav>{[...nav,["/journey","رحلة المستثمر"],["/#disclosures","مركز الإفصاحات"]].map(([u,t])=><a key={u} href={u}>{t}</a>)}</nav><small>© {site.name}</small></div></footer>}
export function Heading({over,title,desc,href,link}:{over:string;title:string;desc?:string;href?:string;link?:string}){return <header className="u-heading"><div><span className="u-kicker">{over}</span><h2>{title}</h2>{desc&&<p>{desc}</p>}</div>{href&&<a className="u-textlink" href={href}>{link}</a>}</header>}
