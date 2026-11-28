import type { Metadata } from "next";
import { UHeader, UFooter } from "../universe-shell";
import { FundCatalog } from "../universe-public";

export const revalidate = 60;
export const metadata: Metadata = { title:"الصناديق الاستثمارية", description:"تصفّح مجالات الاستثمار الأربعة واعرض بياناتها في بطاقات أو جدول." };

export default function PlansPage() {
  return <div className="uv sgf-universe"><UHeader/><main className="u-container" id="content">
    <nav className="u-crumb" aria-label="مسار الصفحة"><a href="/">الرئيسية</a><span aria-hidden="true">/</span><span aria-current="page">الصناديق</span></nav>
    <header className="cc-pagehead"><span className="u-kicker">دليل الصناديق</span><h1>الصناديق الاستثمارية</h1><p>صفِّ الخيارات حسب المجال، أو اعرضها في جدول واحد عشان تقارن بين البيانات المنشورة.</p></header>
    <FundCatalog compare heading="دليل الصناديق"/>
  </main><UFooter/></div>;
}
