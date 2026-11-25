import type { CSSProperties } from "react";
import type { Metric } from "./universe-data";
import { CxIcon } from "./cinematic-icons";

const formatter = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 4 });
const date = new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeZone: "UTC", calendar: "gregory" });
const icons = ["coins","growth","stack","person"] as const;

export function HomeMetrics({metrics,available}:{metrics:Metric[];available:boolean}){
  const rows=metrics.slice(0,4);
  return <section id="trust-numbers" className="u-home-metrics sc-metrics" aria-labelledby="home-metrics-title">
    <header className="metric-header"><div><span className="u-kicker">مؤشرات المنصة</span><h2 id="home-metrics-title">المنصة بالأرقام</h2></div></header>
    {rows.length>0?<dl className={`metric-grid metric-count-${rows.length}`} style={{"--metric-columns":rows.length} as CSSProperties}>
      {rows.map((metric,i)=>{
        const digits=formatter.format(metric.value),percent=/^[٪%]$/.test(metric.unit);
        const size=digits.length>17?" metric-digits-compact":digits.length>12?" metric-digits-medium":"";
        return <div className="metric-card" key={metric.id}>
          <CxIcon name={icons[i]}/><dt>{metric.label}</dt>
          <dd className={`metric-value${size}`}><bdi dir="ltr">{digits}{percent?"٪":""}</bdi>{metric.unit&&!percent&&<span>{metric.unit}</span>}</dd>
          <dd className="metric-source">{metric.source} · <time dateTime={metric.asOf}>{date.format(new Date(metric.asOf+"T00:00:00Z"))}</time></dd>
        </div>;
      })}
    </dl>:<p className="sc-note">{available?"ما فيه مؤشرات منشورة الحين.":"المؤشرات مو متاحة الحين."} <a className="u-textlink" href="/#disclosures">مركز الإفصاحات</a></p>}
  </section>;
}
