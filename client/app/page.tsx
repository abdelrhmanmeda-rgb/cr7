import type { Metadata } from "next";

// إعدادات الصفحة. خلّ رابط التسجيل فاضي إلى أن تتفعّل خدمة الحسابات.
const site = {
  name: "صناديق الخليج الذكية",
  tagline: "دليلك لفهم الاستثمار",
  headline: ["الاستثمار", "بصورة أوضح"],
  description: "تعرّف على الصناديق والأسواق، وافهم كيف تشتغل أدوات الاستثمار عشان تقارن الخيارات على بيّنة.",
  registrationUrl: "",
  telegramUrl: "https://t.me/CR7_B3",
};

export const metadata: Metadata = {
  title: `${site.name} | دليلك لفهم الاستثمار`,
  description: site.description,
  openGraph: { title: `${site.name} | ${site.headline.join(" ")}`, description: site.description, locale: "ar", type: "website" },
};

const topics = [
  { title: "الصناديق الاستثمارية", tag: "استثمار جماعي", icon: "funds", intro: "وش الفرق بين الصناديق في الهدف والرسوم وطريقة التداول؟", body: "بعض الصناديق تتبع مؤشر، وبعضها يديره فريق يختار الأصول. راجع مستندات الصندوق عشان تعرف وش يملك، وكيف يُحسب سعر الوحدة، ومتى تقدر تستردها وبأي تكلفة." },
  { title: "الذهب والمعادن", tag: "الأصول الملموسة", icon: "gold", intro: "تعرّف على الفرق بين شراء الذهب والاستثمار في أداة تتبع سعره.", body: "شراء الذهب مباشرة يختلف عن شراء وحدة في صندوق أو التداول بعقد. قبل تقارن الأسعار، خلك منتبه لطريقة الحفظ والتكاليف وسهولة البيع." },
  { title: "الأسواق المالية", tag: "حركة السوق", icon: "market", intro: "تعرّف على العوامل اللي تحرّك الأسعار، من الأخبار إلى السيولة.", body: "السعر يتأثر بالأخبار والسيولة وتوقعات المتداولين. لو تبي تفهم سوق معيّن، ابدأ بنوعه وساعات التداول فيه وتكلفة التنفيذ، لأن حركة السعر ما تعطيك الصورة كاملة." },
  { title: "الأسهم العالمية والخليجية", tag: "ملكية الشركات", icon: "stocks", intro: "تعرّف على الشركة وراء السهم وكيف يؤثر القطاع والعملة على المقارنة.", body: "السهم يمثّل حصة في شركة. إذا تبي تقارن سهمين، اطلع على نتائج كل شركة ومصادر دخلها وديونها، وراجع قواعد السوق والعملة اللي يتسعّر فيها السهم." },
  { title: "الاستثمار العقاري", tag: "أصول وعقود", icon: "property", intro: "وش يختلف لما تشتري عقار مباشرة أو تستثمر عن طريق صندوق عقاري؟", body: "ملكية العقار مباشرة تختلف عن شراء وحدة في صندوق في طريقة الإدارة والسيولة والتكلفة. قبل تقارن الدخل، شوف عقود الإيجار والمصروفات، واعرف كيف ومتى تقدر تبيع." },
  { title: "الصكوك وأدوات الدخل", tag: "آجال وتوزيعات", icon: "income", intro: "افهم متى تصير التوزيعات، ومتى يحين موعد الاستحقاق.", body: "راجع طبيعة الأداة، ومن الجهة اللي أصدرتها، وشروط التوزيع والاسترداد. وقبل الاختيار، تأكّد إنك تعرف هل تقدر تبيع قبل الاستحقاق، وكيف تتأثر النتيجة لو بعت مبكر." },
  { title: "بناء المحافظ", tag: "أهداف وتوزيع", icon: "portfolio", intro: "رتّب أولوياتك قبل ما توزّع الأصول والسيولة.", body: "حدّد هدفك والمدة اللي تناسبك، وكم تحتاج سيولة. التنويع يساعد يخفّف التركّز، لكنه ما يلغي احتمال الخسارة. وقت الأزمات ممكن تتحرك أدوات مختلفة بالطريقة نفسها." },
  { title: "مقارنة الفرص", tag: "مقارنة أوضح", icon: "compare", intro: "أسئلة بسيطة ترجع لها كل ما تبي تقارن بين خيارين.", body: "اسأل من وين يجي العائد، ومتى تقدر تطلع، وكم عليك رسوم، وش يصير لو مشت الأمور عكس المتوقع. إذا فيه نقطة مؤثرة مو واضحة، افهمها قبل لا تقرّر." },
] as const;

const icons: Record<(typeof topics)[number]["icon"], string> = {
  gold: "M3 17h18l-4-8H7l-4 8Zm5-5h8M8 21h8",
  market: "M3 4v16h18M6 15l5-5 4 3 5-6M17 7h3v3",
  stocks: "M4 20h16M6 16v-4h3v4m2 0V8h3v8m2 0V5h3v11",
  funds: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  property: "m3 10 5-4 5 4v10H3V10Zm10-4h8v14h-8m3-11h2m-2 4h2m-11 7v-5h3v5",
  income: "M6 3h9l3 3v15H6V3Zm9 0v4h3M9 11h6m-6 4h6m-6 3h3",
  portfolio: "M10 3a8 8 0 1 0 11 11h-9V3h-2ZM14 3v9h9a9 9 0 0 0-9-9Z",
  compare: "M4 7h16M4 12h16M4 17h16M8 5v4m8 1v4m-5 1v4",
};

const articles = [
  {
    number: "01",
    label: "أساسيات",
    title: "كيف تقرأ شروط الفرصة الاستثمارية؟",
    intro: "النسبة جزء من الصورة. اسأل عن مصدر العائد ومدته والرسوم وموعد الخروج.",
    paragraphs: [
      "ابدأ بوصف الأداة ومن يديرها. هل الرقم اللي شفته عائد مستهدف، نتيجة سابقة، أو مجرد مثال؟ إذا بتقارن أكثر من خيار، خلّ المدة وطريقة الحساب نفسها عشان تكون المقارنة عادلة.",
      "احسب أثر الرسوم، وشيّك على شروط البيع والاسترداد. فكّر كيف تتغيّر النتيجة لو احتجت تطلع بدري أو تغيّرت ظروف السوق.",
    ],
  },
  {
    number: "02",
    label: "إدارة المحفظة",
    title: "التنويع يبدأ من فهم اللي تملكه",
    intro: "إذا زاد عدد الأصول، مو شرط إن المخاطر تتوزّع.",
    paragraphs: [
      "ممكن تملك أكثر من أداة، وكلها مرتبطة بنفس السوق أو العملة. شوف وين يتركّز استثمارك: في قطاع، منطقة، أو نوع أصل معيّن؟",
      "راجع توزيعك بين فترة وفترة حسب أهدافك واحتياجك للسيولة. وزن كل أصل ممكن يتغيّر حتى لو ما أضفت استثمار جديد، لأن أداء الأصول يختلف.",
    ],
  },
  {
    number: "03",
    label: "مصطلحات",
    title: "وش الفرق بين السيولة والعائد؟",
    intro: "السيولة توضّح متى تقدر تبيع وبأي تكلفة، والعائد يوضّح نتيجة الاستثمار.",
    paragraphs: [
      "إذا فيه سوق نشط للأداة، ممكن تبيعها بسهولة أكثر من أداة لازم تنتظر فيها موعد استرداد أو موافقة. تأكّد إنك تعرف وقت التنفيذ والرسوم قبل البيع.",
      "قارن العائد بعد التكاليف وعلى مدد متقاربة. حطّ شروط الخروج في بالك، لأن رقم العائد لحاله ما يكفي للمقارنة.",
    ],
  },
] as const;

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
  const registrationUrl = safeExternalUrl(site.registrationUrl);
  const telegramUrl = safeExternalUrl(site.telegramUrl);
  const faqs = [
    ["هل أقدر أستثمر أو أودع من الموقع؟", "الموقع يقدّم محتوى معرفي عن الاستثمار. ما فيه إيداع أو سحب أو دفع من هالصفحة."],
    ["متى أقدر أسجّل حساب؟", registrationUrl ? "اضغط على «أنشئ حسابك» واتبع خطوات تأكيد بريدك في صفحة التسجيل." : "التسجيل مو متاح حاليًا. إذا فتح التسجيل، بتلقى رابطه هنا."],
    ["هل كل المجالات المعروضة خدمات متاحة؟", "المجالات معروضة للتعرّف عليها. وجود مجال في الدليل ما يعني إنك تقدر تستثمر فيه من خلال الموقع."],
    ["هل المقالات توصيات بالشراء أو البيع؟", "المقالات تشرح مفاهيم وأدوات عامة. ما فيها توصيات شخصية ولا وعود بعائد."],
  ];

  return (
    <div id="top" className="afq" lang="ar" dir="rtl">
      <style>{styles}</style>
      <a className="afq-skip" href="#content">انتقل للمحتوى</a>

      <header className="afq-header">
        <div className="afq-wrap afq-nav">
          <Brand />
          <nav className="afq-nav-links" aria-label="أقسام الموقع">
            {links.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
          </nav>
          <a className="afq-button afq-button-small" href={registrationUrl ?? "#contact"}>{registrationUrl ? "أنشئ حسابك" : "تواصل معنا"}</a>
        </div>
      </header>

      <main id="content">
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
              <span>٨ مجالات استثمارية</span><span>شرح عربي مبسّط</span><span>تصفّح بدون حساب</span>
            </div>
          </div>
          <HeroArt />
        </section>

        <section id="about" className="afq-section afq-section-band">
          <div className="afq-wrap afq-about">
            <SectionTitle label={`عن ${site.name}`} title="افهم الفرصة قبل لا تقارن الأرقام" text="فكرتنا بسيطة: إذا وضحت لك المعلومة، سهلت عليك المقارنة. هنا بتلقى شرح للأدوات والأسواق، وأسئلة تساعدك تفهم الخيارات اللي قدّامك." />
            <div className="afq-about-card">
              <span className="afq-eyebrow">طريقتنا</span>
              <ol>
                <li><span>١</span><div><strong>اعرف الأداة</strong><small>افهم كيف تشتغل ووش اللي ممكن يأثّر عليها.</small></div></li>
                <li><span>٢</span><div><strong>اقرأ الشروط</strong><small>راجع المدة والتكاليف والسيولة بكل وضوح.</small></div></li>
                <li><span>٣</span><div><strong>قارن على أساس واحد</strong><small>خلّ الهدف والمدة أساس المقارنة.</small></div></li>
              </ol>
            </div>
          </div>
        </section>

        <section id="sectors" className="afq-wrap afq-section">
          <SectionTitle label="دليل المجالات" title="مجالات الاستثمار" text="اختر المجال اللي يهمك وافتح بطاقته. بتلقى الفرق بين الأدوات والأسئلة اللي تساعدك تبدأ." />
          <div className="afq-grid afq-topic-grid">
            {topics.map((topic, index) => (
              <details className="afq-topic" key={topic.icon}>
                <summary>
                  <span className="afq-card-top">
                    <span className="afq-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d={icons[topic.icon]} /></svg></span>
                    <span className="afq-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="afq-card-tag">{topic.tag}</span>
                  <strong className="afq-card-title">{topic.title}</strong>
                  <span className="afq-card-intro">{topic.intro}</span>
                  <span className="afq-card-action">التفاصيل <span aria-hidden="true" className="afq-plus" /></span>
                </summary>
                <p className="afq-details-copy">{topic.body}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="plans" className="afq-wrap afq-section afq-plans">
          <div className="afq-plans-panel">
            <div>
              <span className="afq-eyebrow">وش المتاح؟</span>
              <h2>الخطط الاستثمارية</h2>
              <p>ما فيه خطط متاحة للاشتراك حاليًا. تقدر تبدأ بدليل المجالات أو تطّلع على مقالات مركز المعرفة.</p>
            </div>
            <a className="afq-button" href="#knowledge">استكشف مركز المعرفة <span aria-hidden="true">←</span></a>
          </div>
        </section>

        <section id="knowledge" className="afq-wrap afq-section">
          <SectionTitle label="اقرأ وتعرّف" title="مركز المعرفة" text="مقالات قصيرة تجاوب على أسئلة ممكن تمرّ عليك وأنت تقرأ عن الاستثمار." />
          <div className="afq-grid afq-article-grid">
            {articles.map((article) => (
              <details className="afq-article" key={article.number}>
                <summary>
                  <span className="afq-card-top"><span className="afq-card-tag">{article.label}</span><span className="afq-card-index" aria-hidden="true">{article.number}</span></span>
                  <strong className="afq-card-title">{article.title}</strong>
                  <span className="afq-card-intro">{article.intro}</span>
                  <span className="afq-card-action">اقرأ المقال <span aria-hidden="true" className="afq-plus" /></span>
                </summary>
                <div className="afq-details-copy">{article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
              </details>
            ))}
          </div>
        </section>

        <section id="faq" className="afq-section afq-section-band">
          <div className="afq-wrap afq-faq-grid">
            <SectionTitle label="إجابات واضحة" title="الأسئلة الشائعة" text="بتلقى هنا تفاصيل التسجيل والخطط، ووش المتاح لك على الموقع حاليًا." />
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
          <SectionTitle label="حسابك في المنصة" title={registrationUrl ? "أنشئ حسابك" : "التسجيل مو متاح حاليًا"} text={registrationUrl ? "سجّل بياناتك وأكّد بريدك من صفحة التسجيل." : "تقدر تتصفّح المحتوى بدون حساب. وإذا فتح التسجيل، بتلقى رابط إنشاء الحساب هنا."} />
          <a className="afq-button afq-button-gold" href={registrationUrl ?? "#knowledge"}>{registrationUrl ? "سجّل حسابك" : "ابدأ القراءة"} <span aria-hidden="true">←</span></a>
        </section>

        <section id="contact" className="afq-wrap afq-section afq-contact">
          <div className="afq-contact-panel">
            <div><span className="afq-eyebrow">التواصل</span><h2>عندك استفسار؟</h2><p>تقدر ترجع للأسئلة الشائعة، وإذا تبي تتابع التحديثات، افتح القناة الحالية على تيليجرام.</p></div>
            <div className="afq-actions">
              {telegramUrl && <a className="afq-button afq-button-gold" href={telegramUrl} target="_blank" rel="noopener noreferrer">تابع القناة على تيليجرام <span aria-hidden="true">↗</span></a>}
              <a href="#faq" className="afq-button">الأسئلة الشائعة</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="afq-footer">
        <div className="afq-wrap afq-foot-inner">
          <div><Brand /><p>دليل عربي يقرّب لك الصناديق والأسواق وأدوات الاستثمار.</p></div>
          <nav aria-label="روابط أسفل الموقع"><a href="#about">عن المنصة</a><a href="#knowledge">المعرفة</a><a href="#contact">التواصل</a></nav>
        </div>
        <div className="afq-wrap afq-foot-bottom"><span>© {site.name}</span><span>الموقع للتعرّف على الاستثمار، وما يستقبل أي مدفوعات.</span></div>
      </footer>
    </div>
  );
}

const styles = `
.afq {
  --afq-bg:#090e14; --afq-surface:#111a23; --afq-paper:#f8f4ec; --afq-muted:#b6c0c9;
  --afq-gold:#dfbe82; --afq-dark-gold:#a9854b; --afq-line:rgba(223,190,130,.19);
  position:relative; isolation:isolate; min-height:100vh; background:var(--afq-bg); color:var(--afq-paper);
  font-family:"Noto Sans Arabic","Segoe UI",Tahoma,Arial,sans-serif; line-height:1.7; overflow-wrap:break-word;
}
.afq *, .afq *::before, .afq *::after {box-sizing:border-box}
.afq h1,.afq h2,.afq h3,.afq p,.afq ol {margin:0}
.afq a {color:inherit;text-decoration:none}
.afq a:focus-visible,.afq summary:focus-visible {outline:2px solid var(--afq-gold);outline-offset:4px}
.afq section[id], .afq main[id] {scroll-margin-top:9rem}
.afq-wrap {width:min(1184px, calc(100% - 64px));margin-inline:auto}
.afq-skip {position:absolute;right:14px;top:14px;transform:translateY(-160%);z-index:9;background:#efcf90;color:#161309!important;padding:10px;border-radius:7px}
.afq-skip:focus {transform:none}
.afq-header {position:sticky;top:0;z-index:5;background:rgba(9,14,20,.94);border-bottom:1px solid var(--afq-line);backdrop-filter:blur(14px)}
.afq-nav {display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:22px;min-height:76px}
.afq-brand {display:inline-flex;align-items:center;gap:11px;width:max-content;max-width:100%}
.afq-brand strong {display:block;font-size:1.16rem;color:var(--afq-paper);font-weight:800;line-height:1.35}
.afq-brand small {display:block;font-size:.68rem;color:var(--afq-gold);margin-top:3px}
.afq-mark {display:grid;place-items:center;flex:none;width:47px;height:47px;border:1px solid rgba(223,190,130,.53);border-radius:14px;background:linear-gradient(145deg,#251d16,#13191f);color:var(--afq-gold)}
.afq-nav-links {display:flex;align-items:center;justify-content:center;gap:clamp(12px,2vw,26px);font-size:.85rem;font-weight:650}
.afq-nav-links a {color:var(--afq-muted);white-space:nowrap}
.afq-nav-links a:hover,.afq-footer nav a:hover {color:var(--afq-gold)}
.afq-button {min-height:46px;display:inline-flex;justify-content:center;align-items:center;gap:9px;padding:9px 17px;
  color:var(--afq-gold)!important;border:1px solid rgba(223,190,130,.42);background:#0f161e;border-radius:10px;
  font-size:.9rem;font-weight:750;line-height:1.55;text-align:center;transition:background .18s,border-color .18s,transform .18s}
.afq-button:hover {background:#1b2229;border-color:var(--afq-gold);transform:translateY(-1px)}
.afq-button-gold {background:linear-gradient(112deg,#f3d8a3,#d9b476);border-color:transparent;color:#211709!important}
.afq-button-gold:hover {background:#f3d8a3}
.afq-button-small {min-height:40px;padding:7px 13px;white-space:nowrap;font-size:.82rem}
.afq-hero {display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:clamp(25px,5vw,65px);
  padding-block:clamp(45px,8vw,105px);min-height:580px}
.afq-eyebrow {display:inline-flex;align-items:center;gap:10px;color:var(--afq-gold);font-size:.77rem;font-weight:750}
.afq-eyebrow::before {content:"";width:23px;height:1px;background:var(--afq-gold);opacity:.66}
.afq-hero h1 {font-size:clamp(3rem,6vw,5.4rem);line-height:1.12;font-weight:900;margin-block:21px;letter-spacing:-.022em}
.afq-hero h1 em {font-style:normal;color:var(--afq-gold)}
.afq-hero-text>p {max-width:35ch;font-size:clamp(1rem,1.8vw,1.2rem);color:var(--afq-muted);line-height:1.95}
.afq-actions {display:flex;flex-wrap:wrap;gap:9px}
.afq-hero .afq-actions {margin-top:26px}
.afq-hero-foot {display:flex;flex-wrap:wrap;gap:9px 16px;margin-top:25px;color:var(--afq-muted);font-size:.78rem}
.afq-hero-foot span {display:inline-flex;align-items:center;gap:7px}
.afq-hero-foot span::before {content:"";display:inline-block;width:4px;height:4px;transform:rotate(45deg);background:var(--afq-gold)}
.afq-hero-art {position:relative;overflow:hidden;min-width:0;border:1px solid var(--afq-line);border-radius:26px;
  background:radial-gradient(ellipse at 56% 46%,#29221c 0%,#111923 58%,#0b131c 100%);
  box-shadow:0 26px 65px #0005;aspect-ratio:1.15}
.afq-art-svg {display:block;width:100%;height:100%}
.afq-art-label {position:absolute;top:17px;right:17px;display:flex;align-items:center;gap:7px;
  border:1px solid var(--afq-line);padding:5px 10px;border-radius:30px;color:var(--afq-gold);background:#131921db;font-size:.67rem}
.afq-art-label span {width:6px;height:6px;background:var(--afq-gold);border-radius:50%}
.afq-art-caption {position:absolute;bottom:0;inset-inline:0;display:flex;justify-content:space-between;gap:8px;
  padding:9px 17px;background:#101820d9;border-top:1px solid var(--afq-line);font-size:.68rem;color:var(--afq-muted)}
.afq-section {padding-block:clamp(46px,7vw,85px)}
.afq-section-band {border-block:1px solid var(--afq-line);background:#0c131b}
.afq-section-title {margin-bottom:25px}
.afq-section h2 {font-size:clamp(1.8rem,3.7vw,3rem);font-weight:800;line-height:1.3;margin-block:11px 10px}
.afq-section-title p,.afq-plans-panel p,.afq-contact-panel p {color:var(--afq-muted);max-width:69ch;line-height:1.9}
.afq-about,.afq-faq-grid {display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(24px,6vw,76px);align-items:start}
.afq-about {align-items:center}
.afq-about .afq-section-title,.afq-faq-grid .afq-section-title {margin-bottom:0}
.afq-about-card {border-radius:18px;border:1px solid var(--afq-line);padding:clamp(20px,4vw,36px);background:var(--afq-surface)}
.afq-about-card ol {padding:0;list-style:none;display:grid;gap:14px;margin-top:16px}
.afq-about-card li {display:flex;gap:11px;align-items:flex-start}
.afq-about-card li>span {width:30px;height:30px;display:grid;place-items:center;border-radius:7px;flex:none;color:var(--afq-gold);background:#251f1c;font-weight:800}
.afq-about-card li small {display:block;color:var(--afq-muted);font-size:.82rem;line-height:1.7}
.afq-grid {display:grid;gap:13px;align-items:start;grid-auto-rows:auto}
.afq-topic-grid {grid-template-columns:repeat(4,minmax(0,1fr))}
.afq-article-grid {grid-template-columns:repeat(3,minmax(0,1fr))}
.afq-topic,.afq-article {border:1px solid var(--afq-line);border-radius:16px;background:linear-gradient(155deg,#141f2a,#0f161e);overflow:hidden}
.afq-topic:hover,.afq-article:hover,.afq-topic[open],.afq-article[open] {border-color:rgba(223,190,130,.48)}
.afq-topic>summary,.afq-article>summary {cursor:pointer;list-style:none;display:flex;min-height:228px;flex-direction:column;padding:18px}
.afq-article>summary {min-height:215px}
.afq summary::-webkit-details-marker {display:none}
.afq-card-top {display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:14px}
.afq-card-index {font-size:.69rem;color:#a2adb6;letter-spacing:.09em;direction:ltr;font-variant-numeric:tabular-nums}
.afq-icon {display:grid;place-items:center;width:43px;height:43px;border:1px solid var(--afq-line);border-radius:11px;color:var(--afq-gold);background:#1c201f}
.afq-card-tag {color:var(--afq-gold);font-size:.72rem;font-weight:650}
.afq-card-title {display:block;font-size:1.03rem;font-weight:800;line-height:1.5;margin-block:4px 7px}
.afq-card-intro,.afq-details-copy {color:var(--afq-muted);font-size:.82rem;line-height:1.9}
.afq-card-action {display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:12px;margin-top:auto;color:var(--afq-gold);font-size:.76rem}
.afq-plus {position:relative;width:14px;height:14px;flex:none;color:var(--afq-gold)}
.afq-plus::before,.afq-plus::after {content:"";position:absolute;top:6px;left:1px;width:12px;height:1px;background:currentColor}
.afq-plus::after {transform:rotate(90deg);transition:transform .15s}
.afq details[open]>summary .afq-plus::after {transform:rotate(0)}
.afq-details-copy,.afq .afq-details-copy {margin:0;padding:14px 18px;border-top:1px solid var(--afq-line)}
.afq-details-copy p+p {margin-top:9px}
.afq-plans {padding-block:0}
.afq-plans-panel,.afq-contact-panel {display:flex;align-items:center;justify-content:space-between;gap:20px;padding:clamp(21px,5vw,46px);
  border:1px solid var(--afq-line);border-radius:19px;background:radial-gradient(ellipse at top right,#27221b,#121a23 68%)}
.afq-plans-panel .afq-button {flex-shrink:0}
.afq-plans-panel h2,.afq-contact-panel h2 {font-size:clamp(1.6rem,3vw,2.45rem)}
.afq-faq {display:grid;gap:8px}
.afq-faq details {border:1px solid var(--afq-line);border-radius:12px;background:#121b24;padding:0 16px}
.afq-faq summary {display:flex;justify-content:space-between;align-items:center;gap:10px;cursor:pointer;list-style:none;
  font-weight:700;font-size:.89rem;padding-block:12px;color:var(--afq-paper)}
.afq-faq p {color:var(--afq-muted);font-size:.82rem;line-height:1.8;padding:0 0 13px}
.afq-registration {display:flex;align-items:center;justify-content:space-between;gap:18px;padding-bottom:0}
.afq-registration .afq-section-title {margin-bottom:0}
.afq-registration>.afq-button {flex-shrink:0}
.afq-footer {border-top:1px solid var(--afq-line);background:#0b1118}
.afq-foot-inner,.afq-foot-bottom {display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:17px;padding-block:24px}
.afq-foot-inner p,.afq-foot-bottom {font-size:.79rem;color:var(--afq-muted)}
.afq-foot-inner p {margin-top:10px}
.afq-footer nav {display:flex;flex-wrap:wrap;gap:17px;font-size:.82rem;color:var(--afq-muted)}
.afq-foot-bottom {border-top:1px solid var(--afq-line);padding-block:14px}
@media (max-width:930px) {
  .afq-nav {gap:10px;min-height:auto;padding-top:11px;grid-template-columns:minmax(0,1fr) auto}
  .afq-nav-links {grid-column:1/-1;grid-row:2;justify-content:flex-start;gap:18px;overflow-x:auto;padding:0 1px 9px}
  .afq-nav-links a {min-height:30px;display:flex;align-items:center}
  .afq-nav>.afq-button {grid-column:2;grid-row:1}
  .afq-topic-grid {grid-template-columns:repeat(2,minmax(0,1fr))}
  .afq-hero {min-height:0}
}
@media (max-width:680px) {
  .afq-wrap {width:calc(100% - 32px)}
  .afq-brand {gap:7px}
  .afq-brand strong {font-size:clamp(.87rem,3.55vw,1.12rem)}
  .afq-mark {width:40px;height:40px}
  .afq-mark svg {width:29px;height:29px}
  .afq-hero,.afq-about,.afq-faq-grid,.afq-article-grid {grid-template-columns:minmax(0,1fr)}
  .afq-hero {padding-top:30px;gap:22px}
  .afq-hero h1 {margin-block:15px;font-size:clamp(2.7rem,12vw,4.1rem)}
  .afq-hero .afq-actions {margin-top:18px}
  .afq-hero-foot {margin-top:14px}
  .afq-art-label {top:12px;right:12px}
  .afq-hero-art {border-radius:17px}
  .afq-topic>summary,.afq-article>summary {min-height:0;padding:13px}
  .afq-topic .afq-card-top {margin-bottom:9px}
  .afq-card-title {font-size:.95rem}
  .afq-card-intro,.afq-details-copy {font-size:.79rem}
  .afq-plans-panel,.afq-contact-panel,.afq-registration {flex-direction:column;align-items:flex-start}
  .afq-foot-bottom {gap:5px}
}
@media (max-width:360px) {
  .afq-wrap {width:calc(100% - 24px)}
  .afq-topic-grid {grid-template-columns:minmax(0,1fr)}
  .afq-button {font-size:.8rem;padding-inline:11px}
}
@media (prefers-reduced-motion:reduce) {
  .afq *, .afq *::before,.afq *::after {transition:none!important}
}
`;
