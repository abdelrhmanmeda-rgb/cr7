import type { Metadata } from "next";
import { AmbientHero } from "../ambient-hero";
import { UHeader, UFooter } from "../universe-shell";
import { FundCatalog } from "../universe-public";

export const metadata: Metadata = { title: "الصناديق الاستثمارية", description: "تعرّف على صناديق الاستثمار الأربعة واطّلع على تفاصيل كل صندوق." };

export default function PlansPage() {
  return <div className="uv sgf-universe"><UHeader/>
    <main id="content">
      <AmbientHero asset="hero">
        <span className="u-kicker">للأفراد والشركات</span>
        <h1>الصناديق الاستثمارية</h1>
        <p>لكل صندوق مجال وطبيعة مختلفة. اختَر اللي يهمّك وشوف تفاصيله في المعاينة.</p>
        <a className="u-btn gold" href="#featured-opportunities">شوف الصناديق</a>
      </AmbientHero>
      <div className="u-container"><FundCatalog compact/></div>
    </main><UFooter/>
  </div>;
}
