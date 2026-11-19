import type { Metadata } from "next";
import { articles, guideUrl, icons, topics } from "./guide-content";
import { articlePhoto, LuxuryPhoto } from "./luxury-photo";
import MobileNav from "./mobile-nav";

const site = {
  name: "صناديق الخليج الذكية",
  tagline: "الصناديق والأسواق والأصول",
  headline: ["استثمارات", "برؤية أوسع"],
  description: "من الأسهم والصناديق إلى الذهب والعقار، خلك على بيّنة من دور كل استثمار وكيف يشتغل المزيج داخل المحفظة.",
  registrationUrl: (process.env.NEXT_PUBLIC_SGF_SIGNUP_ENABLED ?? "1") === "1" &&
    (process.env.NEXT_PUBLIC_SGF_SIGNUP_VISIBLE ?? "1") === "1" ? "/register" : "",
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
      <span className="afq-art-label">رؤية خليجية للاستثمار</span>
      <div className="sgf-orbit-art">
        <i className="sgf-orbit sgf-orbit-outer" />
        <i className="sgf-orbit sgf-orbit-middle" />
        <i className="sgf-orbit sgf-orbit-inner" />
        <svg className="sgf-orbit-mark" viewBox="0 0 88 88" fill="none">
          <defs>
            <linearGradient id="sgf-orbit-metal" x1="7" y1="15" x2="81" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#785122" /><stop offset=".34" stopColor="#fff1c4" />
              <stop offset=".72" stopColor="#b58a50" /><stop offset="1" stopColor="#f5ce8b" />
            </linearGradient>
          </defs>
          <path d="M44 12 77 65H11L44 12Z" stroke="url(#sgf-orbit-metal)" strokeWidth="3" strokeLinejoin="round" />
          <path d="M24 65 44 33l20 32M44 33v32M15 75h58" stroke="url(#sgf-orbit-metal)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
      <div className="afq-art-caption"><span>صناديق الخليج الذكية</span><span>نظرة أوسع للأصول</span></div>
    </div>
  );
}

export default function Page() {
  const registrationUrl = site.registrationUrl || null;
  const faqs = [
    ["وش تقدّم صناديق الخليج الذكية؟", "المنصة تجمع لك مجالات الاستثمار في مكان واحد، من الأسهم والصناديق إلى العقار والذهب والصكوك. نوضّح فايدة كل فئة والدور اللي ممكن تؤديه داخل المحفظة، وكيف تُقاس النتيجة بعد الرسوم. ما فيه خطط مفتوحة للاشتراك حاليًا، وفتح الحساب يخلّيك تستخدم صفحة الحساب من غير ما تدفع أو تشترك في منتج."],
    ["مين يختار الأصول داخل الصندوق؟", "إذا طُرح صندوق، تتولى إدارته اختيار الأصول ومتابعة أوزانها بحسب سياسة الصندوق ومدّته وهدفه. تقدر الإدارة توازن بين أصول تخدم النمو، وأصول تضيف دخل، وجزء يوفّر سيولة. الاختيار يخدم هدف المحفظة ككل، ويختلف حسب الخطة؛ ما هو توصية استثمار شخصية لكل زائر."],
    ["وش المقصود بتراكم العائد؟", "إذا تحقّق عائد وبقي مستثمر بدل ما يطلع من المحفظة، يصير جزء من المبلغ اللي يشارك في أداء الفترات الجاية. بعض الخطط تعيد استثمار التوزيعات، وبعضها يصرفها نقدًا إذا أُقرّت. التراكم يشرح طريقة الحساب، والنتيجة الفعلية تعتمد على أداء الأصول والتكاليف، وقد ترتفع أو تنخفض."],
    ["هل أقدر أشترك في خطة الحين؟", "الحين ما فيه خطط مفتوحة للاشتراك. إذا توفرت خطة، تفاصيلها تبين نوع الأصول، المدة، الرسوم، طريقة التعامل مع العائد وشروط الاسترداد. التسجيل في الموقع يفتح لك حساب فقط؛ ما يفتح خطة ولا ينشئ إيداع أو التزام مالي."],
    ["كيف أفتح حسابي في المنصة؟", registrationUrl ? "اضغط «أنشئ حسابك»، واكتب اسمك وبريد تقدر تفتحه، واختر كلمة مرور من ١٢ حرف على الأقل. بعد الموافقة على شروط التسجيل، شيّك على البريد وافتح رابط التأكيد، ثم ارجع لصفحة الحساب. إذا ما حصلت الرسالة في الوارد، شيّك على البريد غير المرغوب فيه." : "فتح حساب جديد مو متاح حاليًا. إذا تفعّل التسجيل، بيظهر رابط صفحة الحساب هنا. لين يفتح التسجيل، تقدر تقرأ كل المجالات والمقالات بدون حساب."],
    ["كيف أرجع لحسابي إذا نسيت كلمة المرور؟", "من صفحة الحساب اختر «استرجع كلمة المرور» واكتب نفس البريد اللي سجّلت به. إذا البريد مرتبط بحساب، بتوصلك رسالة فيها رابط تعيين كلمة مرور جديدة. بعدها ارجع لخيار «سجّل دخولك» واستخدم الكلمة الجديدة. إذا تأخرت الرسالة، شيّك على الوارد والبريد غير المرغوب فيه."],
    ["وين ألقى شرح المجال اللي يهمّني؟", "قسم «مجالات الاستثمار» يقسّم الخيارات حسب نوع الأصل، ويشرح وظيفة كل واحد ومصادر العائد المحتملة. وإذا تبي تكمل، «مركز المعرفة» فيه مقالات أطول عن التنويع والسيولة والتراكم والتكاليف. من آخر كل مقال تقدر تنتقل لمواضيع مرتبطة داخل الموقع."],
    ["كيف أتابع موضوع يخص بيانات حسابي؟", "تلقى اسم إدارة المنصة وبيانات التواصل مكتوبة ضمن «شروط التسجيل والخصوصية» في صفحة حسابك. نفس القسم يوضّح كيف تُستخدم بيانات الحساب وطريقة التواصل بخصوص طلب الخصوصية. لاسترجاع الدخول، ابدأ بخيار استرجاع كلمة المرور داخل صفحة الحساب."],
  ];

  return (
    <div id="top" className="afq sgf-universe" lang="ar" dir="rtl">
      <a className="afq-skip" href="#content">روح للمحتوى</a>

      <header className="afq-header">
        <div className="afq-wrap afq-nav">
          <Brand />
          <nav className="afq-nav-links" aria-label="أقسام الموقع">
            {links.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
          </nav>
          <a className="afq-button afq-button-small" href={registrationUrl ?? "#contact"}>{registrationUrl ? "أنشئ حسابك" : "مساعدة الحساب"}</a>
          <MobileNav links={links} brand={site.name} action={{ href: registrationUrl ?? "#contact", text: registrationUrl ? "أنشئ حسابك" : "مساعدة الحساب" }} />
        </div>
      </header>

      <main id="content">
        <div className="afq-hero-stage">
          <div className="sgf-depth-scene" aria-hidden="true"><i /><i /><i /></div>
        <section className="afq-wrap afq-hero" aria-labelledby="afq-main-title">
          <div className="afq-hero-text">
            <span className="afq-eyebrow">الصناديق والأسواق</span>
            <h1 id="afq-main-title">{site.headline[0]}<br /><em>{site.headline[1]}</em></h1>
            <p>{site.description}</p>
            <div className="afq-actions">
              <a href="#sectors" className="afq-button afq-button-gold">تصفّح مجالات الاستثمار</a>
              <a href={registrationUrl ?? "#registration"} className="afq-button">{registrationUrl ? "أنشئ حسابك" : "عن التسجيل"}</a>
            </div>
            <div className="afq-hero-foot">
              <span>فئات الأصول</span><span>اختيار الأصول</span><span>مركز المعرفة</span>
            </div>
          </div>
          <HeroArt />
        </section>
        </div>

        <section id="about" className="afq-section afq-section-band">
          <div className="afq-wrap afq-about">
            <SectionTitle label={`عن ${site.name}`} title="كل استثمار له دور في المحفظة" text="في صناديق الخليج الذكية نركّز على فايدة كل استثمار، وش يضيف للمحفظة، وكيف تكون اختيارات إدارة الصندوق مبنية على هدف ومدّة وسيولة واضحة." />
            <div className="afq-about-visual" aria-hidden="true"><LuxuryPhoto asset="property" /></div>
            <div className="afq-about-card">
              <span className="afq-eyebrow">طريقتنا في عرض الاستثمار</span>
              <ol>
                <li><span>١</span><div><strong>نحدّد الهدف</strong><small>نبيّن وظيفة الأصل: نمو، دخل أو سيولة.</small></div></li>
                <li><span>٢</span><div><strong>نوضّح الاختيار</strong><small>نربط بين طبيعة الأصل ومدّة الخطة وتكاليفها.</small></div></li>
                <li><span>٣</span><div><strong>نقيس النتيجة بالصافي</strong><small>نشرح أثر الرسوم والتوزيعات والتراكم.</small></div></li>
              </ol>
            </div>
          </div>
        </section>

        <section id="sectors" className="afq-wrap afq-section">
          <SectionTitle label="الأسواق والأصول" title="مجالات الاستثمار" text="كل فئة تعطي المحفظة فايدة مختلفة. شوف دور الذهب والأسهم والعقار والصكوك، وكيف تكمل هالأصول بعض." />
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
                  <span className="afq-card-action">شوف التفاصيل</span>
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
              <span className="afq-plan-status">ما فيه خطط مفتوحة للاشتراك الحين</span>
            </div>
            <p>إذا توفّرت خطة، تلقى هنا هدفها ومدّتها وشروطها وطريقة احتساب النتيجة.</p>
            <dl className="afq-plan-criteria">
              <div><dt>الاستراتيجية ورأس المال</dt><dd>نوع الأصول اللي تخدم الخطة وحدود الاشتراك فيها.</dd></div>
              <div><dt>المدة والسيولة</dt><dd>مدة بقاء الاستثمار ووقت الاسترداد وشروطه.</dd></div>
              <div><dt>النتائج والتكاليف</dt><dd>كيف ينحسب العائد بعد الرسوم، والفرق بين الهدف والنتيجة اللي تحققت.</dd></div>
            </dl>
            <a className="afq-button" href={guideUrl("read-investment-terms")}>اقرأ عن فائدة وضوح الخطة</a>
          </div>
        </section>

        <section id="knowledge" className="afq-wrap afq-section">
          <SectionTitle label="مقالات وأدلة" title="مركز المعرفة" text="مقالات توضّح لك فايدة التنويع، ودور مدير الصندوق، وشلون التكاليف وإعادة الاستثمار تأثر على النتيجة." />
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
            <SectionTitle label="مساعدة الزوّار" title="الأسئلة الشائعة" text="إجابات عن دور الصندوق، وتراكم العائد، وكيف تستخدم حسابك في المنصة." />
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
          <SectionTitle label="حسابك في المنصة" title={registrationUrl ? "أنشئ حسابك" : "التسجيل مو متاح الحين"} text={registrationUrl ? "أكّد بريدك عشان تكمل فتح الحساب. وإذا عندك حساب من قبل، تقدر تسجّل دخولك من نفس الصفحة." : "تقدر تطّلع على المقالات في مركز المعرفة لين يتاح التسجيل."} />
          <a className="afq-button afq-button-gold" href={registrationUrl ?? "#knowledge"}>{registrationUrl ? "افتح صفحة الحساب" : "ابدأ القراءة"}</a>
        </section>

        <section id="contact" className="afq-wrap afq-section afq-contact">
          <div className="afq-contact-panel">
            <div><span className="afq-eyebrow">الدعم</span><h2>مساعدة الحساب</h2><p>إذا احتجت مساعدة بالدخول أو ببيانات حسابك، تلقى الخطوات هنا. وبيانات إدارة المنصة مكتوبة في قسم الخصوصية بصفحة الحساب.</p></div>
            <div className="afq-actions">
              {registrationUrl && <a className="afq-button afq-button-gold" href={registrationUrl}>افتح صفحة الحساب</a>}
              <a href="#faq" className="afq-button">الأسئلة الشائعة</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="afq-footer">
        <div className="afq-wrap afq-foot-inner">
          <div><Brand /><p>نظرة أوضح على الصناديق والأسواق ودور كل أصل.</p></div>
          <nav aria-label="روابط أسفل الموقع"><a href="#about">عن المنصة</a><a href="#knowledge">المعرفة</a><a href="#contact">مساعدة الحساب</a></nav>
        </div>
        <div className="afq-wrap afq-foot-bottom"><span>© {site.name}</span><a href="#plans">حالة الاشتراك في الخطط</a></div>
      </footer>
    </div>
  );
}
