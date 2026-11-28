import { GlassLogo } from "./glass-logo";
import { site } from "./universe-copy";

export function BrandMark({ className }: { className: string }) {
  return <a className={className + " sgf-brand-link"} href="/" aria-label={site.name + " · الرئيسية"}><GlassLogo/></a>;
}
