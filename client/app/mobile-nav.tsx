"use client";

import { useEffect, useRef, useState } from "react";
import { InvestorSignupLink } from "./investor-actions";

type Props = { links: readonly (readonly [string, string])[]; brand: string; action: { href: string; text: string } };

export default function MobileNav({ links, brand, action }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1081px)");
    const closeOnDesktop = () => { if (media.matches) ref.current?.close(); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);
  function show() {
    if (ref.current && !ref.current.open) {
      ref.current.showModal();
      setOpen(true);
    }
  }
  const close = () => ref.current?.close();

  return (
    <div className="sgf-mobile-nav">
      <button type="button" className="sgf-nav-toggle" aria-label="أقسام الموقع" aria-haspopup="dialog"
        aria-expanded={open} aria-controls="sgf-mobile-drawer" onClick={show}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
      </button>
      <dialog id="sgf-mobile-drawer" ref={ref} className="sgf-drawer" aria-labelledby="sgf-drawer-title"
        onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className="sgf-drawer-panel">
          <div className="sgf-drawer-head">
            <strong id="sgf-drawer-title">{brand}</strong>
            <button type="button" className="sgf-nav-toggle" aria-label="إغلاق القائمة" autoFocus onClick={close}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
            </button>
          </div>
          <nav aria-label="أقسام الموقع">
            {links.map(([id, label]) => <a key={id} href={id.startsWith("/") ? id : `#${id}`} onClick={close}>{label}</a>)}
          </nav>
          <div className="u-drawer-accounts"><a className="u-btn" href={action.href} onClick={close}>{action.text}</a><InvestorSignupLink onClick={close}/></div>
        </div>
      </dialog>
    </div>
  );
}
