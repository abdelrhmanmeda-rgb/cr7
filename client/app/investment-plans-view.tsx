import { isDesignPreview } from "./design-config";
import { LuxuryPhoto } from "./luxury-photo";
import { planTracks } from "./investment-plans";
import { PlanInterestDemo } from "./plan-interest-demo";
import { Heading } from "./universe-shell";

const designPreview = isDesignPreview;

export function Plans({ full = false }: { full?: boolean }) {
  return (
    <section id="plans" className="u-block u-plans" aria-label="الباقات الاستثمارية">
      <Heading over="الباقات والاشتراكات" title={full ? "قارن بين المسارات" : "الباقات الاستثمارية"}
        desc="تعرّف على الهدف والخلفية الاستثمارية لكل مسار، للأفراد والشركات."
        href={full ? undefined : "/plans"} link={full ? undefined : "كل الباقات"} />
      <p className="u-plans-notice">{designPreview
        ? "عرض تجريبي للمسارات وطريقة تسجيل الاهتمام. ما فيه اشتراك فعلي أو دفع."
        : "مسارات قيد الدراسة. الاشتراك مو مفتوح حاليًا."}</p>
      <div className="u-plan-grid">
        {planTracks.map(track => (
          <article key={track.id} id={`plan-${track.id}`} className="u-plan-card">
            <div className="u-plan-art"><LuxuryPhoto asset={track.asset}/><span>{track.category}</span></div>
            <div className="u-plan-copy">
              <h3>{track.name}</h3>
              <p>{track.intro}</p>
              {full ? <>
                <details>
                  <summary>الخلفية الاستثمارية</summary>
                  <dl>
                    <div><dt>الهدف</dt><dd>{track.objective}</dd></div>
                    <div><dt>كيف يشتغل المسار؟</dt><dd>{track.background}</dd></div>
                    <div><dt>المخاطر</dt><dd>{track.risk}</dd></div>
                    <div><dt>الرسوم والمدة والحد الأدنى</dt><dd>ما تحددت للنشر.</dd></div>
                  </dl>
                </details>
                {designPreview && <PlanInterestDemo name={track.name} />}
              </> : <a className="u-textlink" href={`/plans#plan-${track.id}`}>تفاصيل المسار</a>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
