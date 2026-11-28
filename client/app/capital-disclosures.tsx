import { guideUrl } from "./guide-content";
const documentGuides = [
  { title:"ملخص معلومات الصندوق", chip:"دليل قراءة", detail:"ابدأ بهدف الصندوق، ونوع الأصول، والعملة، ومؤشر المقارنة إن وجد. بعدها شوف طريقة التقييم وتاريخ البيانات عشان تعرف وش تقارن بالضبط.", href:guideUrl("read-fund-documents"), link:"شرح مستندات الصندوق" },
  { title:"الرسوم والاشتراك والاسترداد", chip:"دليل قراءة", detail:"فرّق بين الرسوم اللي تُخصم مرة وحدة والرسوم الدورية. راجع الحد الأدنى، ومواعيد تقديم الطلب، ووقت التسوية، وأي شروط توقف أو تؤخر الاسترداد.", href:guideUrl("investment-fees"), link:"شرح أثر الرسوم" },
  { title:"التقارير والأداء والتوزيعات", chip:"دليل قراءة", detail:"التقرير يوضح الفترة والعملة وصافي قيمة الأصول والتوزيعات إذا وجدت. قارن فترتين بنفس طريقة الحساب. ارتفاع سعر الوحدة ما يكفي لحساب العائد الكلي إذا كان فيه توزيع أو رسوم.", href:guideUrl("liquidity-and-returns"), link:"شرح العائد والسيولة" },
  { title:"المخاطر والسيولة", chip:"دليل قراءة", detail:"شوف المخاطر الخاصة بالأصل، مثل تذبذب الأسعار أو تركّز الأصول أو صعوبة البيع. إذا كانت المحفظة تشمل أدوات دخل، افهم مخاطر الجهة المصدرة وتأثير تغيّر الأسعار قبل الاستحقاق.", href:guideUrl("income"), link:"شرح الصكوك والسندات" },
  { title:"بيانات الحساب والخصوصية", chip:"معلومات المنصة", detail:"الحساب مخصص لإدارة بياناتك. تقدر تطّلع على شروط التسجيل والخصوصية من صفحة الحساب. إذا عندك سؤال عن بياناتك، تواصل مع إدارة المنصة من صفحة التواصل.", href:"/register/", link:"شروط الحساب والخصوصية" },
] as const;

export function DisclosureLibrary() {
  return <section className="cc-document-library" aria-labelledby="cc-docs-title">
    <header className="u-heading"><div><span className="u-kicker">مكتبة المستثمر</span><h2 id="cc-docs-title">كيف تقرأ الوثائق الاستثمارية؟</h2><p>أدلة تعليمية توضّح وش تدور عليه عند قراءة المستندات. ما تعتبر وثائق طرح للمنصة.</p></div></header>
    <div className="cc-document-list">{documentGuides.map(item=><details key={item.title}>
      <summary><span className="cc-document-title">{item.title}</span><span className="cc-document-badge">{item.chip}</span></summary>
      <div><p>{item.detail}</p><a className="cc-inline" href={item.href}>{item.link}</a></div>
    </details>)}</div>
    <div className="cc-disclosure-support"><strong>استفسار عن وثيقة أو عن حسابك؟</strong><a className="u-btn" href="/contact/">تواصل مع إدارة المنصة</a></div>
  </section>;
}
