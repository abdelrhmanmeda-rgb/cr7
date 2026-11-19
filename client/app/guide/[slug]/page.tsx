import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, guideUrl, icons, topics } from "../../guide-content";
import { articlePhoto, LuxuryPhoto } from "../../luxury-photo";

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
    art: articlePhoto(article.slug),
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
    <div className="sgf-guide sgf-editorial-lux">
      <header className="sgf-guide-wrap sgf-guide-top">
        <a className="sgf-guide-brand" href="/">{siteName}</a>
        <nav aria-label="أقسام الموقع">
          <a href="/#sectors">مجالات الاستثمار</a>
          <a href="/#knowledge">مركز المعرفة</a>
        </nav>
      </header>

      <main className="sgf-guide-wrap">
        <nav className="sgf-guide-crumb" aria-label="مكانك في الموقع">
          <a href="/">الرئيسية</a><span aria-hidden="true">/</span>
          <a href={sectionLink}>{entry.sectionTitle}</a>
        </nav>
        <article aria-labelledby="guide-title">
          <div className="sgf-guide-hero" data-art={entry.art}>
            <LuxuryPhoto asset={entry.art} leading />
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
                <p className="sgf-guide-label">وش في الصفحة</p>
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
            </div>
          </div>
        </article>

        <section className="sgf-guide-related" aria-labelledby="guide-related">
          <h2 id="guide-related">كمّل القراءة</h2>
          <div>
            {related.map((item) => (
              <a key={item.slug} href={guideUrl(item.slug)}>
                <div className="sgf-guide-related-image"><LuxuryPhoto asset={item.art} /></div>
                <div className="sgf-guide-related-copy">
                <span className="sgf-guide-label">{item.label}</span>
                <strong>{item.title}</strong>
                <span>{item.intro}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
        <footer className="sgf-guide-footer"><a href={sectionLink}>ارجع لـ{entry.sectionTitle}</a></footer>
      </main>
    </div>
  );
}
