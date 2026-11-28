import type { Metric } from "./universe-data";
import { CxIcon } from "./cinematic-icons";
import { disclosureDate } from "./disclosure-data";

const slots = [
  {label:"العملاء", icon:"person"},
  {label:"المستثمرون", icon:"growth"},
  {label:"طلبات الاستفسار", icon:"stack"},
  {label:"زيارات دليل الصناديق", icon:"globe"},
] as const;
const number = new Intl.NumberFormat("ar-EG", {maximumFractionDigits:4});

export function CapitalMetrics({metrics,available}:{metrics:Metric[];available:boolean}) {
  const pending="غير منشور";
  return <section className="cc-capital-metrics" id="trust-numbers" aria-labelledby="cc-metrics-title">
    <header><div><h2 id="cc-metrics-title">المنصة بالأرقام</h2><p>{!available?"المؤشرات مو متاحة حاليًا.":metrics.length?"المؤشرات المنشورة موضّحة بمصدرها وتاريخها.":"تظهر المؤشرات هنا بعد نشرها وتوثيقها."}</p></div></header>
    <dl>{slots.map((slot,index)=>{
      const metric=metrics[index],unit=metric?.unit==="%"?"٪":metric?.unit;
      return <div key={slot.icon}><span className="cc-symbol"><CxIcon name={slot.icon}/></span><dt>{metric?.label||slot.label}</dt>
        <dd className={metric?"":"cc-metric-pending"}>{metric?<><bdi>{number.format(metric.value)}{unit==="٪"?unit:""}</bdi>{unit&&unit!=="٪"&&<> {unit}</>}</>:pending}</dd>
        {metric&&<dd className="cc-metric-proof">{metric.source} · <time dateTime={metric.asOf}>{disclosureDate(metric.asOf)}</time></dd>}
      </div>;
    })}</dl>
  </section>;
}
