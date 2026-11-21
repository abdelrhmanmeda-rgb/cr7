import Image from "next/image";

const articlePhotos: Record<string, string> = {
  "read-investment-terms": "editorial",
  "understand-diversification": "portfolio",
  "liquidity-and-returns": "market",
  "read-fund-documents": "funds",
  "investment-fees": "compare",
  "reading-company-disclosures": "stocks",
};

export function articlePhoto(slug: string) {
  return articlePhotos[slug] ?? "editorial";
}

export function LuxuryPhoto({ asset, leading = false }: { asset: string; leading?: boolean }) {
  const mobileHero = asset === "hero";
  return (
    <picture className="sgf-photo" aria-hidden="true">
      {mobileHero && <source media="(max-width: 700px)" srcSet="/hero-mobile.webp" />}
      <Image src={asset === "energy" ? "/energy.svg" : `/${asset}.webp`} alt="" fill unoptimized
        loading={leading ? "eager" : "lazy"} fetchPriority={leading ? "high" : undefined} />
    </picture>
  );
}
