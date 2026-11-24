import type { ReactNode } from "react";
import { HeroMotion } from "./cinematic-motion";

export function CinematicInterior({ art,title,kicker,desc,children }: {art:string;title:string;kicker:string;desc:string;children?:ReactNode}){
  return <HeroMotion interior>
    <div className={`cx-artwork ci-artwork${art.startsWith("property")||art.startsWith("gold")||art.startsWith("market")||art.startsWith("energy")?"":" ci-square"}`} aria-hidden="true">
      <img className="cx-hero-image" src={`/cinematic/${art}.webp`} alt="" fetchPriority="high" decoding="async"/>
      <div className="cx-halo cx-halo-a"/><div className="cx-halo cx-halo-b"/>
    </div>
    <div className="ci-copy"><span className="cx-eyebrow">{kicker}</span><h1 id="cx-interior-title">{title}</h1><p>{desc}</p>
    {children&&<div className="cx-actions">{children}</div>}</div>
  </HeroMotion>;
}
