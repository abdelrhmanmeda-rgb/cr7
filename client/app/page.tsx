import type { Metadata } from "next";
import { articles, guideUrl, icons, topics } from "./guide-content";
import { articlePhoto, LuxuryPhoto } from "./luxury-photo";
import MobileNav from "./mobile-nav";
import AssetObservatory from "./observatory";

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

const telegramHandle = (process.env.NEXT_PUBLIC_SGF_PRIVACY_TELEGRAM?.trim() || "Khaled_AlAlya")
  .replace(/^(?:https:\/\/)?t\.me\//i, "").replace(/^@|\/$/g, "");
const telegramUrl = /^[a-zA-Z0-9_]{3,32}$/.test(telegramHandle) ? `https://t.me/${telegramHandle}` : "";

const links = [
  ["about", "عن المنصة"],
  ["sectors", "المجالات"],
  ["plans", "الخطط"],
  ["disclosures", "الإفصاحات"],
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

function Disclosures() {
  return (
    <section id="disclosures" className="afq-section afq-wrap sgf-disclosures">
      <SectionTitle label="وثائق وبيانات" title="مركز الإفصاحات" text="مكان واحد يوضّح حالة الطرح وش المستندات المتوفرة." />
      <div className="sgf-disclosure-grid">
        <article>
          <span className="sgf-disclosure-label">حالة الطرح</span>
          <h3>ما فيه اشتراك حاليًا</h3>
          <p>حساب المنصة لتسجيل الدخول وإدارة بياناتك. فتح الحساب ما ينشئ استثمار أو إيداع.</p>
          <a href="#plans">شوف حالة الخطط</a>
        </article>
        <article>
          <span className="sgf-disclosure-label">بيانات الكيان والترخيص</span>
          <h3>ما فيه بيانات ترخيص منشورة</h3>
          <p>الموقع ما يعرض رقم ترخيص مالي أو موافقة طرح. إذا توثقت البيانات للنشر، تُعرض باسم الكيان القانوني والنشاط المرخّص له.</p>
        </article>
        <article>
          <span className="sgf-disclosure-label">مستندات الاستثمار</span>
          <h3>ما فيه مستندات طرح أو أداء منشورة</h3>
          <p>شروط الاشتراك والاسترداد والرسوم والمخاطر، وسعر الوحدة وتاريخ التقييم عند توفر منتج وصافي قيمة أصول موثق.</p>
          <a href={guideUrl("read-fund-documents")}>تعرّف على مستندات الصندوق</a>
        </article>
      </div>
    </section>
  );
}

export default function Page() {
  const registrationUrl = site.registrationUrl || null;
  const faqs = [
    ["وش تقدّم صناديق الخليج الذكية؟", "المنصة تجمع لك مجالات الاستثمار في مكان واحد، من الأسهم والصناديق إلى العقار والذهب والصكوك. نوضّح فايدة كل فئة والدور اللي ممكن تؤديه داخل المحفظة، وكيف تُقاس النتيجة بعد الرسوم. ما فيه خطط مفتوحة للاشتراك حاليًا، وفتح الحساب يخلّيك تستخدم صفحة الحساب من غير ما تدفع أو تشترك في منتج."],
    ["على أي أساس يتم اختيار الأصول؟", "في أي صندوق مطروح، سياسة الصندوق هي اللي تحدد الأصول المسموح فيها وتوزيعها والحدود اللي تنطبق عليها. الاختيار يراعي هدف المحفظة ومدّتها واحتياجها للسيولة، من دون توصية شخصية لكل زائر."],
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
              <a href="#disclosures">مركز الإفصاحات</a>
              {telegramUrl && <a href={telegramUrl} target="_blank" rel="noopener noreferrer">تواصل على تليجرام</a>}
            </div>
          </div>
          <AssetObservatory />
        </section>
        </div>

        <section id="about" className="afq-section afq-section-band">
          <div className="afq-wrap afq-about">
            <SectionTitle label={`عن ${site.name}`} title="كل استثمار له دور في المحفظة" text="في صناديق الخليج الذكية نركّز على فايدة كل استثمار، وش يضيف للمحفظة، وكيف تحدد سياسة الاستثمار اختيار الأصول بحسب الهدف والمدّة والسيولة." />
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

        <Disclosures />

        <section id="knowledge" className="afq-wrap afq-section">
          <SectionTitle label="مقالات وأدلة" title="مركز المعرفة" text="مقالات توضّح لك فايدة التنويع، وسياسة اختيار الأصول، وشلون التكاليف وإعادة الاستثمار تأثر على النتيجة." />
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
            <div><span className="afq-eyebrow">الدعم والشكاوى</span><h2>تواصل معنا</h2><p>إذا عندك استفسار أو شكوى عن الموقع أو حسابك، راسلنا على تليجرام. لا ترسل كلمة المرور أو رمز التحقق أو بيانات الدفع.</p></div>
            <div className="afq-actions">
              {telegramUrl && <a className="afq-button afq-button-gold" href={telegramUrl} target="_blank" rel="noopener noreferrer">تواصل على تليجرام</a>}
              <a href="#faq" className="afq-button">الأسئلة الشائعة</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="afq-footer">
        <div className="afq-wrap afq-foot-inner">
          <div><Brand /><p>نظرة أوضح على الصناديق والأسواق ودور كل أصل.</p></div>
          <nav aria-label="روابط أسفل الموقع"><a href="#about">عن المنصة</a><a href="#disclosures">الإفصاحات</a><a href="#contact">التواصل</a></nav>
        </div>
        <div className="afq-wrap afq-foot-bottom"><span>© {site.name}</span><a href="#plans">حالة الاشتراك في الخطط</a></div>
      </footer>
    </div>
  );
}
