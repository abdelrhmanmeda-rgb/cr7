import type { Metadata } from "next";
import { articles, guideUrl, icons, topics } from "./guide-content";
import { articlePhoto, LuxuryPhoto } from "./luxury-photo";
import MobileNav from "./mobile-nav";

const site = {
  name: "صناديق الخليج الذكية",
  tagline: "الصناديق والأسواق والأصول",
  headline: ["استثمارات", "برؤية أوسع"],
  description: "تعرّف على فئات الأصول واستراتيجياتها، واكتشف كيف تؤثر المدة والسيولة والتكلفة في قراءة الخيارات الاستثمارية.",
  registrationUrl: (process.env.NEXT_PUBLIC_SGF_SIGNUP_ENABLED ?? "1") === "1" &&
    (process.env.NEXT_PUBLIC_SGF_SIGNUP_VISIBLE ?? "1") === "1" ? "/register" : "",
  telegramUrl: "https://t.me/Khaled_AlAlya",
};

export const metadata: Metadata = {
  title: `${site.name} | الصناديق والأسواق والأصول`,
  description: site.description,
  openGraph: { title: `${site.name} | ${site.headline.join(" ")}`, description: site.description, locale: "ar", type: "website" },
};

const links = [
  ["about", "عن المنصة"],
  ["sectors", "المجالات"],
  ["plans", "الخطط"],
  ["knowledge", "مركز المعرفة"],
  ["faq", "الأسئلة الشائعة"],
] as const;

function safeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function Brand() {
  return (
    <a className="afq-brand" href="#top" aria-label={site.name + " — الرئيسية"}>
      <span className="afq-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none" width="35" height="35">
          <path d="M7 27 20 8l13 19H7Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
          <path d="M12 28.5 20 16l8 12.5M20 16v12.5M8.5 32h23" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
          <path d="M20 3.5v3M32 11h3M5 11h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".65" />
        </svg>
      </span>
      <span><strong>{site.name}</strong><small>{site.tagline}</small></span>
    </a>
  );
}

function SectionTitle({ label, title, text }: { label: string; title: string; text?: string }) {
  return (
    <div className="afq-section-title">
      <span className="afq-eyebrow">{label}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function HeroArt() {
  return (
    <div className="afq-hero-art" aria-hidden="true">
      <LuxuryPhoto asset="hero" leading />
      <span className="afq-art-label"><span /> نظرة على عالم الاستثمار</span>
      <svg viewBox="0 0 560 440" preserveAspectRatio="xMidYMid meet" fill="none" className="afq-art-svg">
        <defs>
          <pattern id="afq-grid" width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M34 0H0V34" stroke="#d0b278" strokeOpacity=".105" />
          </pattern>
          <radialGradient id="afq-glow" cx=".54" cy=".46" r=".51">
            <stop stopColor="#a6814b" stopOpacity=".25" />
            <stop offset="1" stopColor="#080d14" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="afq-gold" x1="0" x2="1" y1="1" y2="0">
            <stop stopColor="#91683b" stopOpacity=".55" />
            <stop offset="1" stopColor="#f4d9a3" />
          </linearGradient>
          <linearGradient id="afq-fill" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#dfb66a" stopOpacity=".24" />
            <stop offset="1" stopColor="#dfb66a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="25" y="46" width="510" height="346" rx="22" fill="url(#afq-grid)" />
        <rect x="12" y="36" width="536" height="369" fill="url(#afq-glow)" />
        <circle cx="301" cy="191" r="132" stroke="#c5a76f" strokeOpacity=".14" />
        <circle cx="301" cy="191" r="105" stroke="#c5a76f" strokeOpacity=".2" strokeDasharray="3 7" />
        <circle cx="301" cy="191" r="73" stroke="#c5a76f" strokeOpacity=".24" />
        <path d="M301 71v240M181 191h240M215 105l172 172m0-172L215 277" stroke="#c5a76f" strokeOpacity=".15" />
        <path d="m301 126 33 65-33 64-34-64 34-65Z" fill="#dbb274" fillOpacity=".10" stroke="#e4bc77" strokeOpacity=".65" />
        <path d="m301 126-1 65 34 0m-67 0h33l1 64" stroke="#e4bc77" strokeOpacity=".55" />
        <path d="M29 354 101 311 154 326 213 265 262 279 335 211 399 231 459 153 531 177V393H29Z" fill="url(#afq-fill)" />
        <path d="M29 354 101 311 154 326 213 265 262 279 335 211 399 231 459 153 531 177" stroke="url(#afq-gold)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m30 375 74-17 50 6 60-37 72 9 60-45 50 10 63-39 72 18" stroke="#8aa6af" strokeOpacity=".55" strokeWidth="1.2" />
        <circle cx="459" cy="153" r="13" fill="#f2cb86" fillOpacity=".17" />
        <circle cx="459" cy="153" r="4.5" fill="#f2cb86" />
        <circle cx="213" cy="265" r="3.5" fill="#f2cb86" />
        <path d="M67 101h13m-6.5-6.5v13m404 233h13m-6.5-6.5v13" stroke="#c5a76f" strokeOpacity=".55" />
      </svg>
      <div className="afq-art-caption"><span>نظرة أوضح للأسواق</span><span>رسم توضيحي</span></div>
    </div>
  );
}

export default function Page() {
  const registrationUrl = site.registrationUrl || null;
  const telegramUrl = safeExternalUrl(site.telegramUrl);
  const faqs = [
    ["كيف أنشئ حسابًا؟", registrationUrl ? "اختر «أنشئ حسابك»، ثم أدخل اسمك وبريدك الإلكتروني وكلمة المرور. افتح رسالة التأكيد لإكمال إعداد الحساب." : "إنشاء الحساب غير متاح حاليًا. سيظهر رابط إنشاء الحساب في هذه الصفحة عند إتاحته."],
    ["كيف أستعيد كلمة المرور؟", "اختر «استرجع كلمة المرور» في صفحة الدخول، وأدخل بريد حسابك. ستتمكن من تعيين كلمة مرور جديدة باستخدام رابط الاستعادة."],
    ["أين أجد تفاصيل مجال استثماري معيّن؟", "اختر المجال من بطاقات مجالات الاستثمار. ستجد شرحًا لطريقة عمله، والفرق بين أدواته، ومثالًا يساعدك على فهمه."],
    ["أين أجد مراجع المقالات؟", "ستجد رابط القراءة المتعمقة في نهاية كل مقال، مع روابط لموضوعات مرتبطة به داخل مركز المعرفة."],
    ["كيف أتواصل بشأن بيانات حسابي؟", "افتح «شروط التسجيل والخصوصية» في صفحة الحساب، واستخدم رابط تليجرام للتواصل مع إدارة صناديق الخليج الذكية."],
  ];

  return (
    <div id="top" className="afq sgf-universe" lang="ar" dir="rtl">
      <a className="afq-skip" href="#content">انتقل للمحتوى</a>

      <header className="afq-header">
        <div className="afq-wrap afq-nav">
          <Brand />
          <nav className="afq-nav-links" aria-label="أقسام الموقع">
            {links.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
          </nav>
          <a className="afq-button afq-button-small" href={registrationUrl ?? "#contact"}>{registrationUrl ? "أنشئ حسابك" : "تواصل معنا"}</a>
          <MobileNav links={links} brand={site.name} action={{ href: registrationUrl ?? "#contact", text: registrationUrl ? "أنشئ حسابك" : "تواصل معنا" }} />
        </div>
      </header>

      <main id="content">
        <div className="afq-hero-stage">
        <section className="afq-wrap afq-hero" aria-labelledby="afq-main-title">
          <div className="afq-hero-text">
            <span className="afq-eyebrow">الصناديق والأسواق</span>
            <h1 id="afq-main-title">{site.headline[0]}<br /><em>{site.headline[1]}</em></h1>
            <p>{site.description}</p>
            <div className="afq-actions">
              <a href="#sectors" className="afq-button afq-button-gold">استكشف مجالات الاستثمار <span aria-hidden="true">←</span></a>
              <a href={registrationUrl ?? "#registration"} className="afq-button">{registrationUrl ? "أنشئ حسابك" : "عن التسجيل"}</a>
            </div>
            <div className="afq-hero-foot">
              <span>فئات الأصول</span><span>تحليل الخيارات</span><span>مركز المعرفة</span>
            </div>
          </div>
          <HeroArt />
        </section>
        </div>

        <section id="about" className="afq-section afq-section-band">
          <div className="afq-wrap afq-about">
            <SectionTitle label={`عن ${site.name}`} title="صورة متكاملة عن الاستثمار" text="نجمع قراءة فئات الأصول مع شرح أساليب إدارتها وعناصر المقارنة بينها. هدفنا تقديم تجربة رقمية ترتكز على وضوح المعلومات وتنوع الموضوعات وسهولة الوصول إليها." />
            <div className="afq-about-visual" aria-hidden="true"><LuxuryPhoto asset="property" /></div>
            <div className="afq-about-card">
              <span className="afq-eyebrow">منهجية العرض</span>
              <ol>
                <li><span>١</span><div><strong>فهم هيكل الأداة</strong><small>تحديد الأصل وطريقة إدارة الاستثمار.</small></div></li>
                <li><span>٢</span><div><strong>قراءة الشروط</strong><small>توضيح المدة والتكاليف والسيولة.</small></div></li>
                <li><span>٣</span><div><strong>المقارنة بمعايير واضحة</strong><small>استخدام الفترة والعملة وطريقة الحساب نفسها.</small></div></li>
              </ol>
            </div>
          </div>
        </section>

        <section id="sectors" className="afq-wrap afq-section">
          <SectionTitle label="الأسواق والأصول" title="مجالات الاستثمار" text="تعرّف على طرق الاستثمار في كل فئة، واطّلع على هيكل الأدوات ومصادر الدخل والعوامل التي تؤثر في نتائجها." />
          <div className="afq-grid afq-topic-grid">
            {topics.map((topic, index) => (
              <a className="afq-topic" key={topic.slug} href={guideUrl(topic.slug)}>
                  <LuxuryPhoto asset={topic.icon} />
                  <span className="afq-card-top">
                    <span className="afq-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d={icons[topic.icon]} /></svg></span>
                    <span className="afq-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="afq-card-tag">{topic.tag}</span>
                  <strong className="afq-card-title">{topic.title}</strong>
                  <span className="afq-card-intro">{topic.intro}</span>
                  <span className="afq-card-action">عرض التفاصيل</span>
              </a>
            ))}
          </div>
        </section>

        <section id="plans" className="afq-wrap afq-section afq-plans" aria-labelledby="afq-plans-title">
          <div className="afq-plans-panel">
            <div className="afq-plans-head">
              <div>
                <span className="afq-eyebrow">تفاصيل الاشتراك</span>
                <h2 id="afq-plans-title">الخطط الاستثمارية</h2>
              </div>
              <span className="afq-plan-status">لا توجد خطط مفتوحة للاشتراك حاليًا</span>
            </div>
            <p>عند الاطّلاع على تفاصيل أي خطة، هذه المعايير تساعدك على مقارنة شروطها وما تعنيه لك.</p>
            <dl className="afq-plan-criteria">
              <div><dt>الاستراتيجية ورأس المال</dt><dd>نوع الأصول، هدف الخطة، والحد الأدنى والأقصى للاشتراك.</dd></div>
              <div><dt>المدة والسيولة</dt><dd>فترة الاستثمار، مواعيد الاسترداد، وشروط الخروج المبكر.</dd></div>
              <div><dt>النتائج والتكاليف</dt><dd>طريقة احتساب العائد، الرسوم، والفصل بين الأهداف والنتائج المحققة.</dd></div>
            </dl>
            <a className="afq-button" href={guideUrl("read-investment-terms")}>اقرأ دليل شروط الاستثمار</a>
          </div>
        </section>

        <section id="knowledge" className="afq-wrap afq-section">
          <SectionTitle label="مقالات وأدلة" title="مركز المعرفة" text="أدلة لقراءة مستندات الصناديق، وفهم رسوم الاستثمار وسيولته، وتحليل إفصاحات الشركات." />
          <div className="afq-grid afq-article-grid">
            {articles.map((article) => (
              <a className="afq-article" key={article.slug} href={guideUrl(article.slug)}>
                  <div className="afq-article-visual"><LuxuryPhoto asset={articlePhoto(article.slug)} /></div>
                  <div className="afq-article-copy">
                  <span className="afq-card-top"><span className="afq-card-tag">{article.label}</span><span className="afq-card-index" aria-hidden="true">{article.number}</span></span>
                  <strong className="afq-card-title">{article.title}</strong>
                  <span className="afq-card-intro">{article.intro}</span>
                  <span className="afq-card-action">اقرأ المقال</span>
                  </div>
              </a>
            ))}
          </div>
        </section>

        <section id="faq" className="afq-section afq-section-band">
          <div className="afq-wrap afq-faq-grid">
            <SectionTitle label="مساعدة الزوّار" title="الأسئلة الشائعة" text="إجابات سريعة عن حسابك، واستعادة كلمة المرور، والوصول إلى صفحات المجالات والمقالات." />
            <div className="afq-faq">
              {faqs.map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}<span className="afq-plus" aria-hidden="true" /></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="registration" className="afq-wrap afq-section afq-registration">
          <SectionTitle label="حسابك في المنصة" title={registrationUrl ? "أنشئ حسابك" : "التسجيل غير متاح حاليًا"} text={registrationUrl ? "أكمل إنشاء حسابك بتأكيد بريدك الإلكتروني. إذا كان عندك حساب، تقدر تسجّل الدخول من الصفحة نفسها." : "يمكنك الاطّلاع على مقالات مركز المعرفة أثناء انتظار إتاحة التسجيل."} />
          <a className="afq-button afq-button-gold" href={registrationUrl ?? "#knowledge"}>{registrationUrl ? "انتقل إلى صفحة الحساب" : "ابدأ القراءة"}</a>
        </section>

        <section id="contact" className="afq-wrap afq-section afq-contact">
          <div className="afq-contact-panel">
            <div><span className="afq-eyebrow">التواصل</span><h2>مساعدة الحساب</h2><p>تواصل مع إدارة صناديق الخليج الذكية إذا احتجت مساعدة في تسجيل الدخول أو إدارة بيانات حسابك.</p></div>
            <div className="afq-actions">
              {telegramUrl && <a className="afq-button afq-button-gold" href={telegramUrl} target="_blank" rel="noopener noreferrer">تواصل عبر تليجرام</a>}
              <a href="#faq" className="afq-button">الأسئلة الشائعة</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="afq-footer">
        <div className="afq-wrap afq-foot-inner">
          <div><Brand /><p>قراءة متكاملة للصناديق والأسواق وفئات الأصول.</p></div>
          <nav aria-label="روابط أسفل الموقع"><a href="#about">عن المنصة</a><a href="#knowledge">المعرفة</a><a href="#contact">التواصل</a></nav>
        </div>
        <div className="afq-wrap afq-foot-bottom"><span>© {site.name}</span><a href="#plans">حالة الاشتراك في الخطط</a></div>
      </footer>
    </div>
  );
}
