import Image from "next/image";
import type { ReactNode } from "react";

export function AmbientHero({ asset, children, home = false, sectionId }: {
  asset: string;
  children: ReactNode;
  home?: boolean;
  sectionId?: string;
}) {
  return (
    <section id={sectionId} className={home ? "u-ambient-hero u-ambient-home" : "u-ambient-hero u-ambient-inner"}>
      <picture className="u-ambient-photo" aria-hidden="true">
        {home && <source media="(max-width: 700px)" srcSet="/hero-mobile.webp" />}
        <Image unoptimized alt="" fill src={asset === "energy" ? "/energy.svg" : `/${asset}.webp`}
          sizes="100vw" loading="eager" fetchPriority="high" />
      </picture>
      <div className="u-ambient-light" aria-hidden="true" />
      <div className="u-container u-ambient-content">{children}</div>
    </section>
  );
}
