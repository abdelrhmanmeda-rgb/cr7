import { site } from "./universe-copy";

export function BrandMark({ className }: { className: string }) {
  return <a className={className + " sgf-brand-link"} href="/" aria-label={site.name + " · الرئيسية"}>
    <img className="sgf-brand-image" src="/brand/sgf-mark.svg" alt="" width={152} height={145}/>
    <span className="sgf-brand-type"><b>صناديق الخليج</b><small>الذكية</small></span>
  </a>;
}
