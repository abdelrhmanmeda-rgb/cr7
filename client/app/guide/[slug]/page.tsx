import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, guideUrl, icons, topics } from "../../guide-content";

type Props = { params: Promise<{ slug: string }> };

const siteName = "صناديق الخليج الذكية";
const bookIcon = "M5 4h5a3 3 0 0 1 2 1 3 3 0 0 1 2-1h5v15h-5a3 3 0 0 0-2 1 3 3 0 0 0-2-1H5V4Zm7 1v15";
const entries = [
  ...topics.map((topic) => ({
    ...topic,
    label: topic.tag,
    art: topic.icon,
    icon: icons[topic.icon],
    section: "sectors",
    sectionTitle: "مجالات الاستثمار",
  })),
  ...articles.map((article) => ({
    ...article,
    art: "article",
    icon: bookIcon,
    facts: [],
    section: "knowledge",
    sectionTitle: "مركز المعرفة",
  })),
];

export const dynamicParams = false;

export function generateStaticParams() {
  return entries.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = entries.find((item) => item.slug === slug);
  if (!entry) notFound();
  return {
    title: entry.title,
    description: entry.intro,
    openGraph: {
      title: entry.title,
      description: entry.intro,
      locale: "ar",
      siteName,
      type: entry.section === "knowledge" ? "article" : "website",
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const entry = entries.find((item) => item.slug === slug);
  if (!entry) notFound();
  const sectionLink = `/#${entry.section}`;
  const related = entry.related.flatMap((key) => {
    const item = entries.find((candidate) => candidate.slug === key);
    return item ? [item] : [];
  });
  const sectionId = (index: number) => `guide-part-${index + 1}`;

  return (
    <div className="sgf-guide">
      <style>{styles}</style>
      <header className="sgf-guide-wrap sgf-guide-top">
        <a className="sgf-guide-brand" href="/">{siteName}</a>
        <nav aria-label="أقسام الموقع">
          <a href="/#sectors">مجالات الاستثمار</a>
          <a href="/#knowledge">مركز المعرفة</a>
        </nav>
      </header>

      <main className="sgf-guide-wrap">
        <nav className="sgf-guide-crumb" aria-label="أنت هنا">
          <a href="/">الرئيسية</a><span aria-hidden="true">/</span>
          <a href={sectionLink}>{entry.sectionTitle}</a>
        </nav>
        <article aria-labelledby="guide-title">
          <div className="sgf-guide-hero" data-art={entry.art}>
            <div>
              <p className="sgf-guide-label">{entry.sectionTitle} · {entry.label}</p>
              <h1 id="guide-title">{entry.title}</h1>
              <p className="sgf-guide-intro">{entry.intro}</p>
            </div>
            <div className="sgf-guide-art" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
                <path d={entry.icon} />
              </svg>
            </div>
          </div>

          {entry.facts.length > 0 && (
            <dl className="sgf-guide-facts" aria-label="ملامح المجال">
              {entry.facts.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
          )}

          <div className="sgf-guide-body">
            <aside className="sgf-guide-jump">
              <nav aria-label="محاور الصفحة">
                <p className="sgf-guide-label">في هذه الصفحة</p>
                <ul>
                  {entry.sections.map((section, index) => <li key={section.title}><a href={`#${sectionId(index)}`}>{section.title}</a></li>)}
                  <li><a href="#guide-example">مثال توضيحي</a></li>
                </ul>
              </nav>
            </aside>
            <div className="sgf-guide-copy">
              {entry.sections.map((section, index) => (
                <section key={section.title} id={sectionId(index)} className="sgf-guide-part">
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </section>
              ))}
              <section className="sgf-guide-example" id="guide-example" aria-labelledby="guide-example-title">
                <p className="sgf-guide-label">مثال توضيحي</p>
                <h2 id="guide-example-title">{entry.example.title}</h2>
                <p>{entry.example.text}</p>
              </section>
              <p className="sgf-guide-source">للقراءة المتعمقة: <a href={entry.reference.href} target="_blank" rel="noreferrer">{entry.reference.label}</a></p>
            </div>
          </div>
        </article>

        <section className="sgf-guide-related" aria-labelledby="guide-related">
          <h2 id="guide-related">تابع القراءة</h2>
          <div>
            {related.map((item) => (
              <a key={item.slug} href={guideUrl(item.slug)}>
                <span className="sgf-guide-label">{item.label}</span>
                <strong>{item.title}</strong>
                <span>{item.intro}</span>
              </a>
            ))}
          </div>
        </section>
        <footer className="sgf-guide-footer"><a href={sectionLink}>ارجع إلى {entry.sectionTitle}</a></footer>
      </main>
    </div>
  );
}

const styles = `
.sgf-guide {--guide-gold:#e3c38a;--guide-text:#f8f4ec;--guide-muted:#c2cbd1;--guide-line:#dfbe8239;
  min-height:100vh;color:var(--guide-text);background:radial-gradient(ellipse at 80% 0,#1d1b16,#090e14 42rem);overflow-wrap:anywhere}
.sgf-guide a {color:inherit;text-decoration:none}
.sgf-guide a:hover {color:var(--guide-gold)}
.sgf-guide-wrap {width:min(1080px,calc(100% - 36px));margin-inline:auto}
.sgf-guide-top,.sgf-guide-top nav,.sgf-guide-crumb {display:flex;align-items:center;flex-wrap:wrap;gap:clamp(12px,3vw,24px)}
.sgf-guide-top {justify-content:space-between;padding-block:18px;border-bottom:1px solid var(--guide-line)}
.sgf-guide-top a {padding-block:6px}
.sgf-guide-brand {font-size:1.08rem;font-weight:850}
.sgf-guide-top nav,.sgf-guide-crumb {color:var(--guide-muted);font-size:.9rem}
.sgf-guide-crumb {padding-block:20px;gap:10px}
.sgf-guide h1,.sgf-guide h2,.sgf-guide p {margin:0}
.sgf-guide-hero {--guide-accent:#d5b06c;display:grid;grid-template-columns:minmax(0,1fr) minmax(108px,24%);align-items:center;gap:clamp(18px,5vw,47px);
  padding:clamp(24px,6vw,65px);border:1px solid var(--guide-line);border-radius:21px;
  background:linear-gradient(120deg,#172027,#181915 68%);position:relative;isolation:isolate;overflow:hidden}
.sgf-guide-hero::after {content:"";position:absolute;inset:0;z-index:-1;
  background:linear-gradient(115deg,transparent 0%,#101518 65%),repeating-linear-gradient(90deg,#dfbe8210 0 1px,transparent 1px 34px),repeating-linear-gradient(0deg,#dfbe8210 0 1px,transparent 1px 34px);
  opacity:.65;pointer-events:none}
.sgf-guide-hero[data-art="market"],.sgf-guide-hero[data-art="stocks"] {--guide-accent:#98b8c4}
.sgf-guide-hero[data-art="property"],.sgf-guide-hero[data-art="portfolio"] {--guide-accent:#aab5a1}
.sgf-guide-label {color:var(--guide-gold);font-size:.9rem;font-weight:750}
.sgf-guide-hero h1 {font-size:clamp(1.9rem,5vw,3.7rem);line-height:1.32;font-weight:900;margin-block:6px 13px}
.sgf-guide-intro,.sgf-guide-copy p {color:var(--guide-muted);font-size:1rem;line-height:2}
.sgf-guide-intro {max-width:62ch;font-size:clamp(1rem,2.1vw,1.17rem)}
.sgf-guide-art {width:min(100%,178px);aspect-ratio:1;position:relative;display:grid;place-items:center;justify-self:center;border-radius:50%;
  color:var(--guide-accent);border:1px solid var(--guide-line);background:radial-gradient(circle,#e3c38a29,transparent 73%);
  box-shadow:0 0 42px #e3c38a0e,inset 0 0 0 13px #e3c38a0a}
.sgf-guide-art::before {content:"";position:absolute;inset:-10px;border:1px dashed var(--guide-line);border-radius:50%;pointer-events:none}
.sgf-guide-facts {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:16px 0 0;
  border:1px solid var(--guide-line);border-radius:13px;background:#121a23}
.sgf-guide-facts>div {padding:17px 19px}
.sgf-guide-facts>div+div {border-inline-start:1px solid var(--guide-line)}
.sgf-guide-facts dt {color:var(--guide-gold);font-size:.88rem;font-weight:750;margin-bottom:3px}
.sgf-guide-facts dd {margin:0;line-height:1.7}
.sgf-guide-body {display:grid;grid-template-columns:minmax(165px,.35fr) minmax(0,1fr);align-items:start;
  gap:clamp(24px,5vw,58px);padding-block:clamp(30px,6vw,57px)}
.sgf-guide-jump {position:sticky;top:18px;padding:15px 16px;border:1px solid var(--guide-line);border-radius:12px;background:#121a23}
.sgf-guide-jump ul {list-style:none;padding:0;margin:8px 0 0}
.sgf-guide-jump a {display:block;padding:8px 0;border-top:1px solid var(--guide-line);font-size:.93rem;line-height:1.6;color:var(--guide-muted)}
.sgf-guide-copy {max-width:730px}
.sgf-guide-part {scroll-margin-top:20px}
.sgf-guide-part+.sgf-guide-part {margin-top:24px}
.sgf-guide h2 {font-size:clamp(1.25rem,2.5vw,1.65rem);margin-bottom:9px;font-weight:850;line-height:1.55}
.sgf-guide-copy p+p {margin-top:12px}
.sgf-guide-example {margin-top:28px;padding:20px 23px;border-inline-start:2px solid var(--guide-gold);background:#151f27;border-radius:12px;scroll-margin-top:20px}
.sgf-guide-copy .sgf-guide-label {color:var(--guide-gold);font-size:.9rem;margin-bottom:6px}
.sgf-guide-copy .sgf-guide-source {margin-top:14px;font-size:.9rem}
.sgf-guide-source a {color:var(--guide-gold);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px}
.sgf-guide-related>div {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.sgf-guide-related a {display:grid;gap:5px;padding:16px;border:1px solid var(--guide-line);border-radius:12px;background:#121a23}
.sgf-guide-related a:hover {border-color:var(--guide-gold)}
.sgf-guide-related a>span:last-child {color:var(--guide-muted);line-height:1.7;font-size:.95rem}
.sgf-guide-footer {margin-top:24px;padding-block:20px;border-top:1px solid var(--guide-line)}
.sgf-guide-footer a {display:inline-block;padding:6px 0;color:var(--guide-gold)}
@media(max-width:720px){
  .sgf-guide-body,.sgf-guide-related>div {grid-template-columns:minmax(0,1fr)}
  .sgf-guide-jump {position:static}
  .sgf-guide-jump ul {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 12px}
}
@media(max-width:520px){
  .sgf-guide-hero,.sgf-guide-facts {grid-template-columns:minmax(0,1fr)}
  .sgf-guide-art{grid-row:1;width:66px;justify-self:start;margin:6px}
  .sgf-guide-art svg{width:36px;height:36px}
  .sgf-guide-facts>div+div {border-inline-start:0;border-top:1px solid var(--guide-line)}
  .sgf-guide-facts>div {padding:12px 15px}
}
`;
