"use client";

import type { FormEvent } from "react";
import { GlassLogo } from "../glass-logo";
import AccountLedger, {type LedgerState} from "./account-ledger";
import "./account-universe.css";

export type AccountView = "create" | "login" | "reset";
export type AccountPhase = "checking" | "available" | "closed" | "unavailable";
export type AccountProfile = { uid: string; email: string; name: string; verified: boolean };
export type AccountNotice = { text: string; kind: "success" | "error" };
export const accountTitles: Record<AccountView, string> = {
  create: "أنشئ حسابك", login: "سجّل دخولك", reset: "استرجع كلمة المرور",
};
type Props = {
  brand: string; operator: string; telegram: string | null; view: AccountView;
  phase: AccountPhase; profile: AccountProfile | null; notice: AccountNotice | null; busy: boolean;
  ledger: LedgerState; refreshLedger: () => void;
  changeView: (v: AccountView) => void; submit: (e: FormEvent<HTMLFormElement>) => void;
  signOut: () => void; checkEmail: () => void; resend: () => void;
};

const symbols = {
  orbit: "M3 17 12 3l9 14H3Zm4 0 5-8 5 8m-5-8v8M5 21h14",
  account: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0",
  finance: "M3 20h18M5 17V9h3v8m3 0V5h3v12m3 0v-6h3v6",
  chart: "M4 4v16h16M7 15l4-5 4 2 5-7",
  log: "M6 3h12v18H6zM9 8h6m-6 4h6m-6 4h4",
  mail: "M2 5h20v14H2zM3 6l9 7 9-7",
  check: "m4 12 5 5L20 6",
  speak: "M3 4h18v13H9l-6 5V4Zm4 5h10M7 13h7",
  lock: "M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3",
  layers: "m12 3 10 5-10 5L2 8Zm-9 9 9 5 9-5m-18 4 9 5 9-5",
  book: "M3 4h5a5 5 0 0 1 4 2 5 5 0 0 1 4-2h5v15h-5a5 5 0 0 0-4 2 5 5 0 0 0-4-2H3zM12 6v15",
} as const;
function Icon({ name }: { name: keyof typeof symbols }) {
  return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d={symbols[name]} /></svg>;
}
function BrandBar({ brand }: { brand: string }) {
  return <header className="sa-head"><div className="sa-shell">
    <a className="sa-brand" href="/" aria-label={brand + " · الرئيسية"}><GlassLogo/></a>
    <nav aria-label="تنقّل الموقع"><a href="/#sectors">المجالات</a><a href="/#knowledge">مركز المعرفة</a><a className="sa-outline" href="/">الرئيسية</a></nav>
  </div></header>;
}
function Policy({ operator, telegram }: Pick<Props, "operator" | "telegram">) {
  return telegram ? <details className="sa-policy"><summary>شروط التسجيل والخصوصية</summary>
    <p>فتح الحساب يخلّيك تسجّل دخولك وتدير بياناتك. فتح الحساب ما يعني اشتراك في أي منتج استثماري.</p>
    <p>نستخدم اسمك وبريدك لإدارة حسابك، وبيانات الدخول تُدار في Firebase. إذا عندك استفسار عن بياناتك أو تبي تطلب حذف حسابك، راسل {operator} على <a href={telegram} target="_blank" rel="noopener noreferrer">تليجرام</a>.</p>
  </details> : null;
}
function Message({ notice }: Pick<Props, "notice">) {
  return notice ? <p className="sa-message" data-kind={notice.kind} role="status">{notice.text}</p> : null;
}
function ContactCard({ telegram }: Pick<Props, "telegram">) {
  return <aside className="sa-panel sa-contact" aria-labelledby="sa-contact-title">
    <span className="sa-caption"><Icon name="speak" />العناية بالمستثمر</span>
    <h2 id="sa-contact-title">تواصل معنا</h2>
    <figure className="sa-city"><span className="sa-halo" aria-hidden="true" /><figcaption>من الخليج، وبالقرب منك</figcaption></figure>
    <p>إذا عندك استفسار عن حسابك أو خصوصية بياناتك، فريق المنصة يتواصل معك على تليجرام.</p>
    {telegram && <a className="sa-outline" href={telegram} target="_blank" rel="noopener noreferrer"><Icon name="speak" /> تواصل على تليجرام</a>}
    <small>خلّ كلمة المرور ورموز التأكيد خاصة فيك.</small>
  </aside>;
}
function VerifiedDashboard({ p, user }: { p: Props; user: AccountProfile }) {
  const links = [
    ["overview","نظرة عامة","layers"],["portfolio","المحفظة والأداء","chart"],["activity","سجل العمليات","log"],["profile","بيانات الحساب","account"],
  ] as const;
  return <div className="sa-shell sa-dashboard">
    <aside className="sa-rail sa-panel"><span className="sa-caption">مساحـة الحساب</span>
      <nav aria-label="أقسام لوحة المستثمر">{links.map(([id,name,icon])=><a key={id} href={"#sa-"+(id==="activity"&&p.ledger.status!=="ready"?"portfolio":id)}><Icon name={icon} />{name}</a>)}</nav>
      <button className="sa-outline" type="button" disabled={p.busy} onClick={p.signOut}>سجّل خروجك</button>
    </aside>
    <div className="sa-content">
      <div id="sa-overview"><span className="sa-caption">حساب المستثمر</span><h1>لوحة المستثمر</h1><p>{user.name ? <>يا هلا، <bdi>{user.name}</bdi>.</> : "يا هلا في حسابك."} هنا تلقى بيانات حسابك وحالة محفظتك.</p></div>
      <AccountLedger state={p.ledger} refresh={p.refreshLedger} />
      <section id="sa-profile" className="sa-panel"><span className="sa-caption"><Icon name="mail" />بيانات الحساب</span><h2>{user.name || "حسابك في المنصة"}</h2><p><bdi>{user.email}</bdi> · تأكّد بريدك الإلكتروني بنجاح.</p>
        <a className="sa-outline" href="/#knowledge"><Icon name="book" /> روح لمركز المعرفة</a><Policy operator={p.operator} telegram={p.telegram} />
      </section><Message notice={p.notice} />
    </div>
  </div>;
}
export function AccountScreen(p: Props) {
  const { view, phase, profile, busy } = p;
  return <main className="sa-app" dir="rtl" lang="ar"><BrandBar brand={p.brand} />
    {phase === "available" && profile?.verified ? <VerifiedDashboard p={p} user={profile} /> :
      <div className="sa-shell sa-entry">
        <div className="sa-welcome"><span className="sa-caption">مساحتك في المنصة</span><h1>مرحبا بك في <em>عالم الاستثمار</em></h1><p>افتح حسابك ببريدك الإلكتروني، أو سجّل دخولك إذا عندك حساب من قبل.</p></div>
        <div className="sa-columns">
          <section className="sa-panel sa-form" aria-label="إدارة الحساب" aria-busy={busy || phase === "checking"}>
            {phase === "checking" ? <><span className="sa-caption"><Icon name="lock" />حساب المستثمر</span><h2>نتحقق من حالة حسابك</h2><p role="status">لحظة ونجهّز لك الصفحة…</p></> :
              phase !== "available" ? <><span className="sa-caption"><Icon name="lock" />حالة التسجيل</span><h2>{phase === "closed" ? "التسجيل مو متاح الحين" : "خدمة الحسابات مو متوفّرة الحين"}</h2><p>تقدر ترجع للرئيسية أو تكمّل القراءة في مركز المعرفة.</p><a href="/#knowledge" className="sa-gold"><Icon name="book" />تصفّح مركز المعرفة</a></> :
              profile ? <><span className="sa-caption"><Icon name="mail" />خطوة التأكيد</span><h2>أكّد بريدك الإلكتروني</h2><p>افتح رابط التأكيد اللي أرسلناه إلى <bdi>{profile.email}</bdi>، وبعدها اضغط «تأكدت من بريدي».</p>
                <div className="sa-actions"><button className="sa-gold" type="button" disabled={busy} onClick={p.checkEmail}>تأكدت من بريدي</button><button className="sa-outline" type="button" disabled={busy} onClick={p.resend}>أرسل الرابط مرة ثانية</button><button className="sa-plain" type="button" disabled={busy} onClick={p.signOut}>سجّل خروجك</button></div></> :
              <><span className="sa-caption"><Icon name="lock" />حساب المستثمر</span><h2>{accountTitles[view]}</h2><p>{view === "create" ? "بنرسل لك رابط تأكيد الحساب على بريدك." : "استخدم نفس البريد اللي سجّلت به."}</p>
                <form method="post" onSubmit={p.submit} key={view}>
                  {view === "create" && <label>اسمك<input name="name" autoComplete="name" required minLength={2} maxLength={90} /></label>}
                  <label>البريد الإلكتروني<input type="email" name="email" autoComplete="email" dir="ltr" required maxLength={200} /></label>
                  {view !== "reset" && <label>كلمة المرور<input type="password" name="password" autoComplete={view === "create" ? "new-password" : "current-password"} required minLength={view === "create" ? 12 : undefined} maxLength={128} dir="ltr" /></label>}
                  {view === "create" && <><small>خلّها ١٢ حرف على الأقل، ولا تستخدم كلمة مرور حساب ثاني.</small><label className="sa-consent"><input name="terms" type="checkbox" value="yes" required /> قريت شروط التسجيل والخصوصية وأوافق عليها.</label></>}
                  <button className="sa-gold" type="submit" disabled={busy}>{busy ? "لحظة، نكمّل طلبك…" : accountTitles[view]}</button>
                </form>
                <div className="sa-actions">{(["login","create","reset"] as const).filter(v=>v!==view).map(v=><button className="sa-plain" type="button" key={v} disabled={busy} onClick={()=>p.changeView(v)}>{accountTitles[v]}</button>)}</div>
              </>}
            <Message notice={p.notice} />{phase === "available" && <Policy operator={p.operator} telegram={p.telegram} />}
          </section>
          <ContactCard telegram={p.telegram} />
        </div>
      </div>}
  </main>;
}
