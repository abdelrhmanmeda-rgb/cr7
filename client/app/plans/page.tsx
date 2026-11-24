import type { Metadata } from "next";
import { AmbientHero } from "../ambient-hero";
import { Plans } from "../investment-plans-view";
import { UHeader, UFooter } from "../universe-shell";

import { CinematicHeader } from "../cinematic-home";
import { CinematicInterior } from "../cinematic-interior";
import { SectorCatalog } from "../sector-catalog";
import { cinematicDesign,isDesignPreview } from "../design-config";
import { site } from "../universe-copy";

export const metadata: Metadata = { title: "الباقات الاستثمارية", description: "مسارات استثمار للأفراد والشركات وخلفية كل مسار." };

export default function PlansPage() {
  if(cinematicDesign)return <div className="uv sgf-universe cx-home ci-page"><CinematicHeader account={site.registrationUrl||null} active="/plans"/>
    <main className="cx-wrap"><nav className="u-crumb"><a href="/">الرئيسية</a><span>/</span>الصناديق الاستثمارية</nav>
    <CinematicInterior art="world-scene" kicker="مجالات الاستثمار" title="الصناديق الاستثمارية" desc="أربع مجالات في مكان واحد. شوف بطاقة كل مجال وتعرّف على تفاصيله."><a className="cx-btn cx-gold" href="#featured-opportunities">شوف المجالات</a></CinematicInterior>
    <div className="ci-content"><SectorCatalog sample={isDesignPreview} heading="بطاقات الاستثمار"/></div></main><UFooter/></div>;
  return <div className="uv sgf-universe"><UHeader/>
    <main id="content">
      <AmbientHero asset="hero">
        <span className="u-kicker">للأفراد والشركات</span>
        <h1>الباقات الاستثمارية</h1>
        <p>كل مسار له هدف مختلف. اطّلع على طبيعته والأصول اللي يدرسها قبل اختيار اللي يهمّك.</p>
        <a className="u-btn gold" href="#plans">شوف الباقات</a>
      </AmbientHero>
      <div className="u-container"><Plans full/></div>
    </main><UFooter/>
  </div>;
}
