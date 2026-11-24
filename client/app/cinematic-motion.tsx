"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

export function HeroMotion({ children, interior = false }: { children: ReactNode; interior?: boolean }) {
  function track(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const {left, top, width, height} = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - left) / width - 0.5;
    const y = (event.clientY - top) / height - 0.5;
    event.currentTarget.style.setProperty("--move-x", `${x * 18}px`);
    event.currentTarget.style.setProperty("--move-y", `${y * 13}px`);
  }
  return <section className={interior ? "cx-hero ci-hero" : "cx-hero"} aria-labelledby={interior ? "cx-interior-title" : "cx-title"} onPointerMove={track} onPointerLeave={(event) => {
    event.currentTarget.style.removeProperty("--move-x");
    event.currentTarget.style.removeProperty("--move-y");
  }}>{children}</section>;
}

export function PlatformTour() {
  const tour = useRef<HTMLDialogElement>(null);
  return <>
    <button className="cx-btn cx-outline" type="button" aria-haspopup="dialog" onClick={() => tour.current?.showModal()}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/></svg>
      جولة في المنصة
    </button>
    <dialog className="cx-tour" ref={tour} aria-labelledby="cx-tour-title" onClick={(event) => {
      if (event.target === event.currentTarget) tour.current?.close();
    }}>
      <div className="cx-tour-content">
        <button type="button" className="cx-close" aria-label="إغلاق الجولة" onClick={() => tour.current?.close()}>×</button>
        <span className="cx-eyebrow">صناديق الخليج الذكية</span>
        <h2 id="cx-tour-title">خذ لك جولة في المنصة</h2>
        <p>تعرّف على القطاعات، واطّلع على طرق الاستثمار ووثائقه، وخذ قرارك على بيّنة.</p>
        <div className="cx-tour-links">
          <a href="#sectors" onClick={() => tour.current?.close()}>استكشف القطاعات</a>
          <a href="/explorer">جرّب المستكشف</a>
          <a href="#disclosures" onClick={() => tour.current?.close()}>اطّلع على الإفصاحات</a>
        </div>
      </div>
    </dialog>
  </>;
}
