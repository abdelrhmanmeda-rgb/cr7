import { site } from "./universe-copy";
import MobileNav from "./mobile-nav";
import { BrandMark } from "./brand-mark";
import { HeroMotion, PlatformTour } from "./cinematic-motion";
import { fields } from "./four-sectors";
import { CxIcon } from "./cinematic-icons";
import "./cinematic-home.css";

const links = [["/","الرئيسية"],["/plans","الصناديق الاستثمارية"],["/opportunities","الفرص الاستثمارية"],["/world","القطاعات"],["/explorer","المستكشف"],["/about","عن المنصة"],["/knowledge","مركز المعرفة"]] as const;

export function CinematicHeader({ account, active = "/" }: {account: string | null;active?:string}) {
  return <header className="cx-header"><div className="cx-wrap cx-header-inner">
    <BrandMark className="cx-brand"/>
    <nav className="cx-nav" aria-label="القائمة الرئيسية">{links.map(([href, label]) => <a key={href} href={href} aria-current={href === active ? "page" : undefined}>{label}</a>)}</nav>
    <div className="cx-account">
      <a className="cx-btn cx-outline cx-signin" href={account || "/contact"}><CxIcon name="person"/>{account ? "تسجيل الدخول" : "تواصل معنا"}</a>
      {account && <a className="cx-btn cx-gold" href={account}><CxIcon name="person"/>فتح حساب</a>}
    </div>
    <div className="cx-menu"><MobileNav links={links} brand={site.name} action={{href: account || "/contact", text: account ? "فتح حساب" : "تواصل معنا"}}/></div>
  </div></header>;
}

const sticks = [14, 23, 18, 33, 28, 48, 40, 58, 53, 69, 64, 87];
const heroVisual = "/cinematic/hero-city.webp";
export function CinematicHero() {
  return <HeroMotion>
    <div className="cx-artwork" aria-hidden="true">
      {/* The composition is decorative. Headlines and controls are real page elements. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cx-hero-image" src={heroVisual} srcSet={`/cinematic/hero-city-small.webp 780w, ${heroVisual} 1440w`} sizes="(max-width: 760px) 100vw, 67vw" alt="" fetchPriority="high" />
      <div className="cx-halo cx-halo-a"/><div className="cx-halo cx-halo-b"/>
      <div className="cx-glass cx-glass-market"><div className="cx-glass-bars">{sticks.map((v, i) => <i style={{height: v + "%"}} key={i}/>)}</div></div>
      <div className="cx-glass cx-glass-chart"><div className="cx-glass-bars">{[22,35,29,49,66,88].map((v, i) => <i key={i} style={{height: v + "%"}}/>)}</div></div>
      <div className="cx-glass cx-glass-ring"><i/></div>
    </div>
    <div className="cx-wrap cx-hero-inner"><div className="cx-hero-copy">
      <span className="cx-eyebrow">استثمار أذكى لمستقبل أكثر ازدهارًا</span>
      <h1 id="cx-title"><span>نصنع فرصًا استثمارية</span> <em>تتجاوز الحدود</em></h1>
      <p>من الخليج للعالم، استكشف القطاعات والصناديق، وتعرّف على دور كل أصل في تنويع المحفظة وتحقيق أهدافها على المدى الطويل.</p>
      <div className="cx-actions"><a className="cx-btn cx-gold" href="/plans">استكشف الصناديق</a><PlatformTour/></div>
      <div className="cx-principles">{([["shield","إدارة المخاطر"],["bars","تنوّع عالمي"],["leaf","نظرة طويلة الأجل"]] as const).map(([icon,label]) => <span key={icon}><CxIcon name={icon}/>{label}</span>)}</div>
    </div></div>
    <svg className="cx-hero-edge" viewBox="0 0 1500 95" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="cx-edge" x2="1" y2="0"><stop stopColor="#167781" stopOpacity=".15"/><stop offset=".33" stopColor="#61d2ea"/><stop offset=".68" stopColor="#2f8297"/><stop offset="1" stopColor="#168995" stopOpacity=".16"/></linearGradient></defs><path fill="#041821" fillOpacity=".76" d="M0 19C476 173 803 40 1500 5V95H0Z"/><path stroke="url(#cx-edge)" fill="none" d="M0 19C476 173 803 40 1500 5"/></svg>
  </HeroMotion>;
}

export function CinematicSectors() {
  return <section className="cx-wrap cx-section" id="sectors" aria-labelledby="cx-sector-title">
    <div className="cx-section-heading"><div><span className="cx-eyebrow">قطاعات الاستثمار</span><h2 id="cx-sector-title">قطاعات استراتيجية تصنع النمو</h2><p>تعرّف على قطاعات حيوية لها آفاق طويلة الأجل، وش يضيف كل قطاع للمحفظة.</p></div></div>
    <div className="cx-grid sc-grid">{fields.map(f=>({title:f.name,detail:f.intro,href:"/guide/"+f.id,icon:f.icon,image:f.id+"-card"})).map((sector) => <a key={sector.href} className="cx-sector" href={sector.href}>
      <Picture file={sector.image}/><div className="cx-sector-content">
        <span className="cx-sector-icon"><CxIcon name={sector.icon}/></span><h3>{sector.title}</h3><p>{sector.detail}</p><span className="cx-sector-link">استكشف القطاع</span>
      </div>
    </a>)}</div>
  </section>;
}

function Picture({file}: {file:string}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="cx-card-image" src={`/cinematic/${file}.webp`} alt="" loading="lazy" decoding="async" />;
}

export function MetricWave() {
  const lines = Array.from({length: 15}, (_, i) => {
    const start = 6 + i * 3;
    const end = 71 + i * 2;
    return `M-36 ${58 + i * 2} C 133 ${start - 151}, 292 ${start + 303}, 514 ${64 + i * 2} S 866 ${start - 23}, 1039 ${142 + i * 2} S 1330 ${end - 60}, 1480 ${end}`;
  });
  return <svg className="cx-metric-wave" viewBox="0 0 1440 185" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="cx-wave-gradient"><stop stopColor="#dda342"/><stop offset=".27" stopColor="#1dcbdc"/><stop offset=".56" stopColor="#c48930"/><stop offset=".79" stopColor="#21a9c0"/><stop offset="1" stopColor="#dd9b2f"/></linearGradient></defs>
    {lines.map((line, i) => <path key={i} d={line} stroke="url(#cx-wave-gradient)" strokeOpacity={1 - i * .046} strokeWidth={i === 10 ? 1.25 : .64} strokeDasharray={i === 10 ? undefined : "1.3 4.4"} fill="none"/>)}
  </svg>;
}
