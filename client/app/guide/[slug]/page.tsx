import {UHeader,UFooter} from "../../universe-shell";
import {AmbientHero} from "../../ambient-hero";
import {OpportunityList} from "../../universe-public";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, guideUrl, icons, topics } from "../../guide-content";
import { articlePhoto, LuxuryPhoto } from "../../luxury-photo";

import { CinematicHeader } from "../../cinematic-home";
import { CinematicInterior } from "../../cinematic-interior";
import { fieldOf } from "../../four-sectors";
import { cinematicDesign,isDesignPreview } from "../../design-config";
import { SectorTerms } from "../../sector-catalog";
import { site } from "../../universe-copy";

type Props = { params: Promise<{ slug: string }> };

const siteName = "صناديق الخليج الذكية";
const bookIcon = "M5 4h5a3 3 0 0 1 2 1 3 3 0 0 1 2-1h5v15h-5a3 3 0 0 0-2 1 3 3 0 0 0-2-1H5V4Zm7 1v15";
const entries = [
  ...topics.filter(topic=>!cinematicDesign||fieldOf(topic.slug)).map((topic) => ({
    ...topic,
    title: (cinematicDesign && fieldOf(topic.slug)?.name) || topic.title,
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
  const field=cinematicDesign?fieldOf(slug):undefined;
  const sectionLink = `/#${entry.section}`;
  const related = entry.related.flatMap((key) => {
    const item = entries.find((candidate) => candidate.slug === key);
    return item ? [item] : [];
  });
  const sectionId = (index: number) => `guide-part-${index + 1}`;

  return (
    <div className={`uv sgf-universe sgf-editorial-lux${cinematicDesign?" cx-home ci-page":""}`}>
      {cinematicDesign?<CinematicHeader account={site.registrationUrl||null} active={field?"/world":"/knowledge"}/>:<UHeader/>}
      <main className={cinematicDesign?"cx-wrap":"u-container"}>
        <nav className="u-crumb"><a href="/">الرئيسية</a><span>/</span><a href={entry.section==="knowledge"?"/knowledge":"/world"}>{entry.sectionTitle}</a></nav>
        <article aria-labelledby={cinematicDesign?"cx-interior-title":"guide-title"}>
          {cinematicDesign?<CinematicInterior art={field?field.id+"-scene":"knowledge-scene"} title={entry.title} kicker={entry.sectionTitle+" · "+entry.label} desc={entry.intro}><a className="cx-btn cx-gold" href="#guide-part-1">اقرأ التفاصيل</a></CinematicInterior>:<AmbientHero asset={entry.art}>
            <span className="u-kicker">{entry.sectionTitle} · {entry.label}</span>
            <h1 id="guide-title">{entry.title}</h1><p>{entry.intro}</p>
            <a className="u-btn gold" href="#guide-part-1">اقرأ التفاصيل</a>
          </AmbientHero>}
          {field&&<SectorTerms id={field.id} sample={isDesignPreview}/>}
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

        {!isDesignPreview&&entry.section==="sectors"&&<section className="u-block"><OpportunityList sector={slug}/></section>}
        {related.length>0&&<section className="sgf-guide-related" aria-labelledby="guide-related">
          <h2 id="guide-related">كمّل القراءة</h2>
          <div>
            {related.map((item) => (
              <a key={item.slug} href={guideUrl(item.slug)}>
                <div className="sgf-guide-related-image">{cinematicDesign?<img src={`/cinematic/${fieldOf(item.slug)?item.slug:"knowledge"}-scene.webp`} alt="" loading="lazy"/>:<LuxuryPhoto asset={item.art}/>}</div>
                <div className="sgf-guide-related-copy">
                <span className="sgf-guide-label">{item.label}</span>
                <strong>{item.title}</strong>
                <span>{item.intro}</span>
                </div>
              </a>
            ))}
          </div>
        </section>}
        <footer className="sgf-guide-footer"><a href={sectionLink}>ارجع لـ{entry.sectionTitle}</a></footer>
      </main><UFooter/>
    </div>
  );
}
