import type { ReactNode } from "react";

type IconName = "chip" | "building" | "energy" | "bars" | "globe" | "leaf" | "shield" | "person" | "coins" | "stack" | "calendar" | "growth";
const marks: Record<IconName, ReactNode> = {
  chip: <><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3"/><rect x="9.5" y="9.5" width="5" height="5" rx=".5"/></>,
  building: <path d="M3 21h18M5 21V9h5m0 12V3h6v18m0-13h3v13M7 12v2m0 3v1m6-12v2m0 3v2m0 3v2"/>,
  energy: <path d="m13 2-8 12h6l-1 8 9-12h-6l1-8Zm-8 3L3 7m16 10 2 2"/>,
  bars: <path d="M2 21h20M5 18v-5h3v5m3 0V9h3v9m3 0V4h3v14"/>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c4 4 4 14 0 18-4-4-4-14 0-18Z"/></>,
  leaf: <path d="M12 21v-8m0 2C4 15 3 10 3 6c4 0 9 1 9 9Zm0-3c0-7 5-9 9-9 0 5-3 9-9 9Z"/>,
  shield: <path d="m12 2 8 4v6c0 5-5 8-8 10-3-2-8-5-8-10V6l8-4Zm-4 10 3 3 5-6"/>,
  person: <><circle cx="12" cy="7" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></>,
  coins: <><ellipse cx="14" cy="5.5" rx="6" ry="2.5"/><path d="M20 5.5V14c0 1.4-2.7 2.5-6 2.5M20 9.5c0 1.4-2.7 2.5-6 2.5M8 5.5v4"/><ellipse cx="8" cy="13" rx="5" ry="2.4"/><path d="M3 13v5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-5"/></>,
  stack: <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4m8-4v4M4 10h16m-11 5h2m3 0h2"/></>,
  growth: <path d="M3 21h18M5 19v-4m4 4v-7m4 7v-5m4 5V9M4 12l6-6 4 3 6-6m-4 0h4v4"/>,
};
export function CxIcon({name}: {name: IconName}) {
  return <svg className="cx-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{marks[name]}</svg>;
}
