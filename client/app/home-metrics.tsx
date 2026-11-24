"use client";

import { useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import type { Metric } from "./universe-data";
import { CxIcon } from "./cinematic-icons";

const formatter = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 4 });
const date = new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeZone: "UTC", calendar: "gregory" });
type Example = Pick<Metric, "label" | "value" | "unit">;
const usdUnit = "دولار أمريكي";
const choices = ["", "%", usdUnit] as const;
const example: Example = { label: "قيمة توضيحية", value: 250000, unit: "" };
const storageKey = "sgf.home-metric.design-preview.v1";
const cinemaKey = "sgf.home-metric.cinema-design-preview.v1";
const iconSequence = ["coins", "growth", "stack", "person"] as const;
const cinemaExamples: Example[] = [
  { label: "مقياس القيمة", value: 250000, unit: usdUnit },
  { label: "مقياس نسبي", value: 14.6, unit: "%" },
  { label: "مقياس العدد", value: 120, unit: "" },
  { label: "مقياس الوصول", value: 78000, unit: "" },
];

function MetricValue({ value, unit }: Pick<Metric, "value" | "unit">) {
  const digits = formatter.format(value);
  const size = digits.length > 17 ? " metric-digits-compact" : digits.length > 12 ? " metric-digits-medium" : "";
  return <dd className={`metric-value${size}`}><bdi dir="ltr">{digits}</bdi>{unit && <span>{unit}</span>}</dd>;
}

function MetricsFrame({ children, preview = false, cinematic = false }: { children: React.ReactNode; preview?: boolean; cinematic?: boolean }) {
  return <section id="trust-numbers" className="u-home-metrics" aria-labelledby="home-metrics-title">
    <header className="metric-header">
      <div><span className="u-kicker">مؤشرات المنصة</span><h2 id="home-metrics-title">المنصة بالأرقام</h2></div>
      {preview ? <span className="metric-sample-badge">{cinematic ? "أرقام توضيحية للمعاينة" : "رقم تجريبي · للمعاينة فقط"}</span> :
        <a className="u-textlink" href="/#disclosures">مركز الإفصاحات</a>}
    </header>
    {children}
  </section>;
}

export function HomeMetrics({ metrics, cinematic = false }: { metrics: Metric[]; cinematic?: boolean }) {
  if (!metrics.length) return null;
  return <MetricsFrame cinematic={cinematic}>
    <dl className={`metric-grid metric-count-${Math.min(metrics.length, 4)}`}>
      {metrics.slice(0, 4).map((m, i) => <div className="metric-card" key={m.id}>
        {cinematic && <CxIcon name={iconSequence[i]}/>}
        <dt>{m.label}</dt><MetricValue value={m.value} unit={m.unit}/>
        <dd className="metric-source">{m.source} · <time dateTime={m.asOf}>{date.format(new Date(m.asOf + "T00:00:00Z"))}</time></dd>
      </div>)}
    </dl>
  </MetricsFrame>;
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}
function storedSample(key: string) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function validExample(saved: unknown): saved is Example {
  return saved !== null && typeof saved === "object" && "label" in saved && typeof saved.label === "string" &&
    saved.label.trim().length > 0 && saved.label.length <= 80 && "value" in saved && typeof saved.value === "number" &&
    Number.isFinite(saved.value) && Math.abs(saved.value) <= Number.MAX_SAFE_INTEGER &&
    "unit" in saved && typeof saved.unit === "string" && saved.unit.length <= 28;
}
function normalizeExampleUnit(item: Example): Example {
  const unit = item.unit.trim();
  if (unit === "%" || unit === "٪") return { ...item, unit: "%" };
  if (unit === usdUnit || /[\$€£]|ريال|ر(?:\s*\.\s*)س|دولار|درهم|جنيه|دينار|(?:usd|sar|aed|egp|kwd|bhd|qar|omr|eur|gbp)\b/i.test(unit)) {
    return { ...item, unit: usdUnit };
  }
  return { ...item, unit: "" };
}
function useExamples(key: string, cinematic: boolean): Example[] {
  const raw = useSyncExternalStore(subscribe, () => storedSample(key), () => null);
  const previous = useSyncExternalStore(subscribe, () => cinematic ? storedSample(storageKey) : null, () => null);
  if (raw) {
    try {
      const saved: unknown = JSON.parse(raw);
      if (cinematic && Array.isArray(saved) && saved.length === cinemaExamples.length && saved.every(validExample)) return saved.map(normalizeExampleUnit);
      if (!cinematic && validExample(saved)) return [normalizeExampleUnit(saved)];
    } catch { /* Ignore an invalid sample. */ }
  }
  if (cinematic && previous) {
    try {
      const first: unknown = JSON.parse(previous);
      if (validExample(first)) return [normalizeExampleUnit(first), ...cinemaExamples.slice(1)];
    } catch { /* Previous preview can be unavailable. */ }
  }
  return cinematic ? cinemaExamples : [example];
}

function readValue(input: string) {
  const value = input.trim().replace(/[٠-٩۰-۹]/g, d => String(d.charCodeAt(0) & 15))
    .replace(/[٬,\s]/g, "").replace(/٫/g, ".").replace(/^−/, "-");
  if (!/^-?\d+(\.\d{1,4})?$/.test(value)) return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= Number.MAX_SAFE_INTEGER ? number : null;
}

export function PreviewHomeMetric({ cinematic = false }: { cinematic?: boolean }) {
  const [updated, setUpdated] = useState<Example[] | null>(null);
  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState("");
  const key = cinematic ? cinemaKey : storageKey;
  const raw = useExamples(key, cinematic);
  const metrics = updated ?? raw;
  const metric = metrics[selected];

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = readValue(String(form.get("value") ?? ""));
    const label = String(form.get("label") ?? "").trim();
    const unit = choices.find((option) => option === form.get("unit")) ?? "";
    if (value === null || !label || label.length > 80 || unit.length > 28) {
      setStatus("اكتب اسم المؤشر وقيمة رقمية صحيحة، مثل ٢٥٠٬٠٠٠.");
      return;
    }
    const data = { label, value, unit };
    const next = metrics.map((item, i) => i === selected ? data : item);
    setUpdated(next);
    try { window.localStorage.setItem(key, JSON.stringify(cinematic ? next : data)); setStatus("تحدّث المؤشر في المعاينة على هالمتصفح."); }
    catch { setStatus("تحدّث المؤشر في المعاينة الحالية."); }
  }

  function reset() {
    try {
      if (cinematic) window.localStorage.setItem(key, JSON.stringify(cinemaExamples));
      else window.localStorage.removeItem(key);
    } catch { /* Preview still resets in memory. */ }
    setUpdated(cinematic ? cinemaExamples : [example]);
    setStatus("رجعنا المثال الأصلي.");
  }

  return <MetricsFrame preview cinematic={cinematic}>
    <dl className={`metric-grid metric-count-${metrics.length}`}>
      {metrics.map((item, i) => <div className="metric-card" key={i}>
        {cinematic && <CxIcon name={iconSequence[i]}/>}
        <dt>{item.label}</dt><MetricValue value={item.value} unit={item.unit}/>
        {!cinematic && <dd className="metric-source">مثال للشكل، ولا يمثّل نتائج أو أرصدة المنصة.</dd>}
      </div>)}
    </dl>
    <details className="metric-demo-editor">
      <summary>{cinematic ? "جرّب تعديل الأرقام" : "جرّب تعديل الرقم"}</summary>
      <p>الأرقام التوضيحية ما تمثّل نتائج أو أرصدة المنصة. تقدر تعدّلها هنا للمعاينة على جهازك.</p>
      {cinematic && <label>اختر المؤشر <select value={selected} onChange={(event) => {
        setSelected(Number(event.target.value)); setStatus("");
      }}>{metrics.map((item, i) => <option value={i} key={i}>{item.label}</option>)}</select></label>}
      <form key={selected + JSON.stringify(metric)} onSubmit={save}>
        <label>اسم المؤشر<input required maxLength={80} name="label" defaultValue={metric.label}/></label>
        <label>الرقم<input required name="value" maxLength={32} inputMode="decimal" dir="ltr" defaultValue={String(metric.value)}/></label>
        <label>الوحدة<select name="unit" defaultValue={metric.unit}><option value="">بدون وحدة</option><option value="%">نسبة مئوية</option><option value={usdUnit}>{usdUnit}</option></select></label>
        <div className="metric-editor-actions"><button className="u-btn gold">حفظ في المعاينة</button><button className="u-btn" type="button" onClick={reset}>رجّع المثال</button></div>
      </form>
    </details>
    <p aria-live="polite" className="metric-status">{status}</p>
  </MetricsFrame>;
}
