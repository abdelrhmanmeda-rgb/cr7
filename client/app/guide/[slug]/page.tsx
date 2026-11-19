import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, fieldQuestions, guideUrl, icons, topics } from "../../guide-content";

type Props = { params: Promise<{ slug: string }> };

const siteName = "صناديق الخليج الذكية";
const bookIcon = "M5 4h5a3 3 0 0 1 2 1 3 3 0 0 1 2-1h5v15h-5a3 3 0 0 0-2 1 3 3 0 0 0-2-1H5V4Zm7 1v15";
const entries = [
  ...topics.map((topic) => ({
    slug: topic.slug,
    title: topic.title,
    intro: topic.intro,
    label: topic.tag,
    icon: icons[topic.icon],
    paragraphs: [topic.body],
    questions: fieldQuestions[topic.slug],
    section: "sectors",
    sectionTitle: "مجالات الاستثمار",
  })),
  ...articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    intro: article.intro,
    label: article.label,
    icon: bookIcon,
    paragraphs: article.paragraphs,
    questions: [],
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
  const related = entries.filter((item) => item.section === entry.section && item.slug !== slug).slice(0, 2);

  return (
    <div className="sgf-guide">
      <style>{styles}</style>
      <header className="sgf-guide-wrap sgf-guide-top">
        <a className="sgf-guide-brand" href="/">{siteName}</a>
        <nav aria-label="أقسام الموقع">
          <a href="/#sectors">المجالات</a>
          <a href="/#knowledge">مركز المعرفة</a>
        </nav>
      </header>

      <main className="sgf-guide-wrap">
        <nav className="sgf-guide-crumb" aria-label="أنت هنا">
          <a href="/">الرئيسية</a><span aria-hidden="true">/</span>
          <a href={sectionLink}>{entry.sectionTitle}</a>
        </nav>
        <article aria-labelledby="guide-title">
          <div className="sgf-guide-hero">
            <div>
              <p className="sgf-guide-label">{entry.label}</p>
              <h1 id="guide-title">{entry.title}</h1>
              <p className="sgf-guide-intro">{entry.intro}</p>
            </div>
            <div className="sgf-guide-art" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="66" height="66" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
                <path d={entry.icon} />
              </svg>
            </div>
          </div>

          <div className="sgf-guide-copy">
            <h2>{entry.section === "sectors" ? "وش تحتاج تعرف؟" : "الفكرة باختصار"}</h2>
            {entry.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {entry.questions.length > 0 && (
              <section className="sgf-guide-questions" aria-labelledby="guide-questions">
                <h2 id="guide-questions">أسئلة تبدأ فيها</h2>
                <ul>{entry.questions.map((question) => <li key={question}>{question}</li>)}</ul>
              </section>
            )}
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
.sgf-guide {--guide-gold:#dfbe82;--guide-text:#f8f4ec;--guide-muted:#c2cbd1;--guide-line:#dfbe8239;
  min-height:100vh;color:var(--guide-text);background:radial-gradient(ellipse at top right,#1d1b16,#090e14 46%);overflow-wrap:anywhere}
.sgf-guide a {color:inherit;text-decoration:none}
.sgf-guide a:hover {color:var(--guide-gold)}
.sgf-guide-wrap {width:min(920px,calc(100% - 36px));margin-inline:auto}
.sgf-guide-top,.sgf-guide-top nav,.sgf-guide-crumb {display:flex;align-items:center;flex-wrap:wrap;gap:clamp(12px,3vw,24px)}
.sgf-guide-top {justify-content:space-between;padding-block:18px;border-bottom:1px solid var(--guide-line)}
.sgf-guide-top a {padding-block:6px}
.sgf-guide-brand {font-size:1.08rem;font-weight:850}
.sgf-guide-top nav,.sgf-guide-crumb {color:var(--guide-muted);font-size:.9rem}
.sgf-guide-crumb {padding-block:20px;gap:10px}
.sgf-guide h1,.sgf-guide h2,.sgf-guide p {margin:0}
.sgf-guide-hero {display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:clamp(15px,5vw,40px);
  padding:clamp(22px,6vw,58px);border:1px solid var(--guide-line);border-radius:22px;
  background:linear-gradient(150deg,#19232e,#141919)}
.sgf-guide-label {color:var(--guide-gold);font-size:.9rem;font-weight:750}
.sgf-guide-hero h1 {font-size:clamp(1.9rem,5vw,3.7rem);line-height:1.32;font-weight:900;margin-block:6px 13px}
.sgf-guide-intro,.sgf-guide-copy p,.sgf-guide-questions li {color:var(--guide-muted);font-size:1rem;line-height:1.95}
.sgf-guide-art {width:clamp(108px,17vw,158px);aspect-ratio:1;display:grid;place-items:center;border-radius:50%;
  color:var(--guide-gold);border:1px solid var(--guide-line);background:radial-gradient(circle,#dfbe8227,#dfbe8205 67%);
  box-shadow:inset 0 0 0 8px #dfbe820d}
.sgf-guide-copy {max-width:720px;padding-block:clamp(28px,6vw,50px)}
.sgf-guide h2 {font-size:clamp(1.2rem,2.5vw,1.53rem);margin-bottom:9px;font-weight:850}
.sgf-guide-copy p+p {margin-top:12px}
.sgf-guide-questions {margin-top:20px;padding:18px 22px;border-inline-start:2px solid var(--guide-gold);background:#121a23;border-radius:10px}
.sgf-guide-questions ul {padding-inline-start:20px;list-style:disc}
.sgf-guide-questions li::marker {color:var(--guide-gold)}
.sgf-guide-related>div {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.sgf-guide-related a {display:grid;gap:5px;padding:16px;border:1px solid var(--guide-line);border-radius:12px;background:#121a23}
.sgf-guide-related a:hover {border-color:var(--guide-gold)}
.sgf-guide-related a>span:last-child {color:var(--guide-muted);line-height:1.7;font-size:.95rem}
.sgf-guide-footer {margin-top:24px;padding-block:20px;border-top:1px solid var(--guide-line)}
.sgf-guide-footer a {display:inline-block;padding:6px 0;color:var(--guide-gold)}
@media(max-width:575px){.sgf-guide-hero,.sgf-guide-related>div {grid-template-columns:minmax(0,1fr)}.sgf-guide-art{grid-row:1;width:66px}.sgf-guide-art svg{width:36px;height:36px}}
`;
