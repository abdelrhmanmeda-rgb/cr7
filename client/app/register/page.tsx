"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { getApps, initializeApp } from "firebase/app";
import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
  type User,
} from "firebase/auth";

const brand = "صناديق الخليج الذكية";
const officialOrigin = "https://www.cr7botai.com";
const name = "smart-gulf-funds-registration";
const config = {
  apiKey: process.env.NEXT_PUBLIC_SGF_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_SGF_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_SGF_FIREBASE_APP_ID,
};
const operator = process.env.NEXT_PUBLIC_SGF_OPERATOR?.trim();
const privacyEmail = process.env.NEXT_PUBLIC_SGF_PRIVACY_EMAIL?.trim();
const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const enabled = process.env.NEXT_PUBLIC_SGF_SIGNUP_ENABLED === "1" &&
  !!config.apiKey && /^1:\d+:web:[a-f0-9]+$/i.test(config.appId ?? "") &&
  /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(config.projectId ?? "") &&
  config.projectId !== "cr7bot-85133" &&
  !!operator && !!privacyEmail && /^[a-zA-Z0-9._+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(privacyEmail);
const actions = { url: officialOrigin + "/register", handleCodeInApp: false };
let sharedAuth: Auth | undefined;

type View = "create" | "login" | "reset";
type Phase = "checking" | "available" | "closed" | "unavailable";
type Profile = { email: string; name: string; verified: boolean };
type Notice = { text: string; kind: "success" | "error" };

const titles: Record<View, string> = {
  create: "أنشئ حسابك",
  login: "سجّل دخولك",
  reset: "استرجع كلمة المرور",
};

function authForSite() {
  if (!enabled || window.location.origin !== officialOrigin) throw Error("registration disabled");
  if (!sharedAuth) {
    const existing = getApps().find((app) => app.name === name);
    sharedAuth = existing
      ? getAuth(existing)
      : initializeAuth(initializeApp({ ...config, authDomain: config.projectId + ".firebaseapp.com" }, name), {
          persistence: browserSessionPersistence,
        });
  }
  return sharedAuth;
}

function profileOf(user: User | null): Profile | null {
  return user ? { email: user.email ?? "", name: user.displayName?.trim() ?? "", verified: user.emailVerified } : null;
}

function codeOf(error: unknown): string {
  return error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : "";
}

function messageFor(error: unknown) {
  switch (codeOf(error)) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/user-disabled":
      return "ما قدرنا نسجّل دخولك. تأكّد من البريد وكلمة المرور أو جرّب الاسترجاع.";
    case "auth/invalid-email":
      return "تأكّد من كتابة بريد إلكتروني صحيح.";
    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements":
      return "كلمة المرور ما تطابق الشروط. اختر ١٢ حرفًا على الأقل، واخلط بين الحروف والأرقام والرموز.";
    case "auth/too-many-requests":
    case "auth/quota-exceeded":
      return "المحاولات كثيرة حاليًا. انتظر شوي، وبعدها جرّب مرة ثانية.";
    case "auth/network-request-failed":
      return "تعذّر الاتصال. تأكّد من اتصالك بالإنترنت وجرّب مرة ثانية.";
    default:
      return "ما قدرنا نكمّل الطلب. جرّب مرة ثانية بعد شوي.";
  }
}

export default function AccountPage() {
  const [view, setView] = useState<View>("create");
  const [phase, setPhase] = useState<Phase>(enabled ? "checking" : "closed");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const nextDelivery = useRef(0);
  const inProgress = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    let unsubscribe: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      if (window.location.origin !== officialOrigin) {
        setPhase("closed");
        return;
      }
      try {
        unsubscribe = onAuthStateChanged(authForSite(), (user) => {
          setProfile(profileOf(user));
          setPhase("available");
        }, () => setPhase("unavailable"));
      } catch {
        setPhase("unavailable");
      }
    }, 0);
    return () => {
      window.clearTimeout(timer);
      unsubscribe?.();
    };
  }, []);

  async function run(operation: () => Promise<void>) {
    if (inProgress.current || phase !== "available") return;
    inProgress.current = true;
    setBusy(true);
    setNotice(null);
    try {
      await operation();
    } catch (error) {
      setNotice({ text: messageFor(error), kind: "error" });
    } finally {
      inProgress.current = false;
      setBusy(false);
    }
  }

  async function verify(user: User) {
    if (Date.now() < nextDelivery.current) {
      setNotice({ text: "انتظر دقيقة قبل طلب رسالة تأكيد ثانية.", kind: "error" });
      return;
    }
    await sendEmailVerification(user, actions);
    nextDelivery.current = Date.now() + 60_000;
    setNotice({ text: "أرسلنا لك رابط التأكيد. شيّك على الوارد والبريد غير المرغوب فيه.", kind: "success" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const displayName = String(data.get("name") ?? "").trim();
    if (!emailFormat.test(email) || /\.(test|example|invalid|localhost)$/i.test(email)) {
      setNotice({ text: "اكتب بريد فعلي تقدر تستقبل عليه رسالة التأكيد.", kind: "error" });
      return;
    }
    if (view === "create" && (displayName.length < 2 || displayName.length > 90 ||
         /[\u0000-\u001f\u007f]/.test(displayName) || password.length < 12 || password.length > 128 || data.get("terms") !== "yes")) {
      setNotice({ text: "اكتب اسمك، واختر كلمة مرور من ١٢ حرفًا على الأقل، ووافق على شروط التسجيل.", kind: "error" });
      return;
    }
    await run(async () => {
      const auth = authForSite();
      if (view === "reset") {
        try {
          await sendPasswordResetEmail(auth, email, actions);
        } catch (error) {
          if (codeOf(error) !== "auth/user-not-found") throw error;
        }
        setNotice({ text: "إذا البريد مرتبط بحساب، بتوصلك رسالة لإعادة تعيين كلمة المرور.", kind: "success" });
        return;
      }
      if (view === "login") {
        const result = await signInWithEmailAndPassword(auth, email, password);
        setProfile(profileOf(result.user));
        return;
      }
      try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        try {
          await updateProfile(user, { displayName });
        } catch {
          // The account exists; verification can continue if saving the name is temporarily unavailable.
        }
        setProfile(profileOf(user));
        await verify(user);
      } catch (error) {
        if (codeOf(error) !== "auth/email-already-in-use") throw error;
        setNotice({ text: "ما قدرنا ننشئ الحساب. جرّب تسجيل الدخول أو استرجاع كلمة المرور.", kind: "error" });
      }
    });
  }

  async function checkEmail() {
    await run(async () => {
      const user = authForSite().currentUser;
      if (!user) return;
      await reload(user);
      setProfile(profileOf(user));
      if (!user.emailVerified) setNotice({ text: "بريدك ما تأكّد للحين. افتح الرابط اللي وصلك وبعدها جرّب مرة ثانية.", kind: "error" });
    });
  }

  return (
    <main className="sgf-account" dir="rtl" lang="ar">
      <style>{styles}</style>
      <header className="sgf-account-shell sgf-account-head">
        <Link href="/" className="sgf-account-brand">
          <span aria-hidden="true"><svg width="25" height="25" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M3 21 14 4l11 17H3Zm6 0 5-8 5 8m-5-8v8M7 25h14" strokeLinejoin="round" /></svg></span>
          {brand}
        </Link>
        <Link href="/" className="sgf-account-back">الرئيسية</Link>
      </header>

      <div className="sgf-account-shell sgf-account-grid">
        <aside className="sgf-account-intro">
          <span className="sgf-account-eyebrow">حسابك في المنصة</span>
          <h1>كل شي يبدأ من بريد مؤكّد.</h1>
          <p>تقدر تتصفّح محتوى المنصة بدون حساب. إذا تبي تسجّل، استخدم بريد تقدر توصله، وأكّده قبل دخولك للحساب.</p>
          <div className="sgf-account-note">الحساب للمحتوى المعرفي. ما فيه إيداع أو سحب أو اشتراك في صندوق من هالصفحة.</div>
        </aside>

        <section className="sgf-account-panel" aria-label="إدارة الحساب" aria-busy={busy}>
          {phase === "checking" ? <><h2>لحظة من فضلك</h2><p>نتأكّد من حالة الحساب…</p></> :
           phase !== "available" ? (
             <>
               <span className="sgf-account-eyebrow">حالة التسجيل</span>
               <h2>{phase === "closed" ? "التسجيل مو متاح حاليًا" : "خدمة الحسابات مو متاحة الحين"}</h2>
               <p>تقدر ترجع للرئيسية وتطّلع على دليل الصناديق ومقالات مركز المعرفة.</p>
               <Link href="/#knowledge" className="sgf-account-button">تصفّح مركز المعرفة</Link>
             </>
           ) : profile?.verified ? (
             <><span className="sgf-account-eyebrow">البريد مؤكّد</span>
               <h2>{profile.name ? `حيّاك، ${profile.name}` : "حيّاك في حسابك"}</h2>
               <p>تم تأكيد بريدك وتقدر تستخدم حسابك.</p>
               <p><bdi>{profile.email}</bdi></p>
               <Link href="/#knowledge" className="sgf-account-button">روح لمركز المعرفة</Link>
             </>
           ) : profile ? (
             <>
               <span className="sgf-account-eyebrow">خطوة التأكيد</span>
               <h2>أكّد بريدك أول</h2>
               <p>افتح رسالة التأكيد على <bdi>{profile.email}</bdi> وبعدها اضغط «تأكدت من بريدي».</p>
               <div className="sgf-account-actions">
                 <button type="button" disabled={busy} onClick={checkEmail} className="sgf-account-button">تأكدت من بريدي</button>
                 <button type="button" disabled={busy} onClick={() => run(async () => {
                   const user = authForSite().currentUser;
                   if (user && !user.emailVerified) await verify(user);
                 })}>إعادة إرسال الرابط</button>
               </div>
             </>
           ) : (
             <>
               <span className="sgf-account-eyebrow">حساب {brand}</span>
               <h2>{titles[view]}</h2>
               <p>{view === "create" ? "بنرسل لك رابط لتأكيد بريدك." : "استخدم بريدك المرتبط بالحساب."}</p>
               <form method="post" onSubmit={submit} key={view}>
                 {view === "create" && <label>اسمك<input name="name" autoComplete="name" required minLength={2} maxLength={90} /></label>}
                 <label>البريد الإلكتروني<input type="email" name="email" autoComplete="email" dir="ltr" required maxLength={200} /></label>
                 {view !== "reset" && <label>كلمة المرور<input type="password" name="password" autoComplete={view === "create" ? "new-password" : "current-password"} required minLength={view === "create" ? 12 : undefined} maxLength={128} dir="ltr" /></label>}
                 {view === "create" && <>
                   <small>اختر ١٢ حرفًا على الأقل ولا تستخدم كلمة مرور حساب ثاني.</small>
                   <label className="sgf-account-consent"><input name="terms" type="checkbox" value="yes" required /> قرأت شروط التسجيل والخصوصية أدناه وأوافق عليها.</label>
                 </>}
                 <button type="submit" className="sgf-account-button" disabled={busy}>{busy ? "جاري التنفيذ…" : titles[view]}</button>
               </form>
               <div className="sgf-account-actions">
                 {(["login","create","reset"] as const).filter((mode) => mode !== view).map((mode) => <button key={mode} type="button" disabled={busy} onClick={() => { setView(mode); setNotice(null); }}>{titles[mode]}</button>)}
               </div>
             </>
           )}
          {phase === "available" && profile && <div className="sgf-account-actions"><button type="button" disabled={busy} onClick={() => run(async () => { await signOut(authForSite()); setProfile(null); setView("login"); })}>تسجيل الخروج</button></div>}
          {notice && <p className="sgf-account-message" data-kind={notice.kind} role="status">{notice.text}</p>}
          {phase === "available" && <details className="sgf-account-privacy"><summary>شروط التسجيل والخصوصية</summary>
            <p>حسابك يتيح لك الوصول للمحتوى المعرفي. التسجيل ما يعني إنك اشتركت في صندوق، وما يطلب منك أي دفع.</p>
            <p>نستخدم اسمك وبريدك لإدارة الحساب، وتُدار بيانات الدخول في Firebase. إذا تبي تستفسر عن الخصوصية أو تطلب حذف حسابك، تواصل مع مشغّل الموقع: {operator}، على <a href={"mailto:" + privacyEmail}><bdi>{privacyEmail}</bdi></a>.</p>
          </details>}
        </section>
      </div>
    </main>
  );
}

const styles = `
.sgf-account{--gold:#dfbe82;--text:#f8f4ec;--muted:#b6c0c9;--line:#dfbe8235;min-height:100vh;background:#090e14;color:var(--text);overflow-wrap:anywhere}
.sgf-account *{box-sizing:border-box}
.sgf-account a{color:var(--gold);text-decoration:none}
.sgf-account h1,.sgf-account h2,.sgf-account p{margin:0}
.sgf-account-shell{width:min(1060px,calc(100% - 36px));margin-inline:auto}
.sgf-account-head{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:76px;border-bottom:1px solid var(--line)}
.sgf-account-brand{display:flex;gap:9px;align-items:center;font-weight:850}
.sgf-account-brand>span{width:42px;height:42px;display:grid;place-items:center;border:1px solid var(--line);border-radius:11px;background:#23201b;flex:none}
.sgf-account-back{font-size:.85rem}
.sgf-account-grid{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1fr);gap:clamp(22px,6vw,76px);align-items:center;padding-block:clamp(35px,9vw,105px);min-height:calc(100vh - 76px)}
.sgf-account-intro h1{font-size:clamp(2.6rem,5.2vw,4rem);font-weight:900;line-height:1.16;margin:13px 0 17px}
.sgf-account-intro p,.sgf-account-panel p{color:var(--muted);line-height:1.8}
.sgf-account-eyebrow{color:var(--gold);font-weight:750;font-size:.81rem}
.sgf-account-note{margin-top:25px;border-inline-start:2px solid var(--gold);padding-inline:12px;font-size:.85rem;color:var(--muted)}
.sgf-account-panel{border:1px solid var(--line);border-radius:20px;background:linear-gradient(145deg,#182430,#101720 75%);padding:clamp(19px,4.8vw,42px);box-shadow:0 25px 65px #0006}
.sgf-account-panel h2{font-size:clamp(1.65rem,3vw,2.3rem);font-weight:850;margin:4px 0 9px}
.sgf-account-panel form{display:grid;gap:12px;margin:18px 0 0}
.sgf-account-panel label{font-size:.9rem}
.sgf-account-panel input:not([type="checkbox"]){display:block;width:100%;margin-top:4px;padding:.6rem .7rem;border:1px solid #5f6573;border-radius:8px;color:var(--text);background:#0d151d;font:inherit;min-height:43px}
.sgf-account-panel input[type="checkbox"]{accent-color:var(--gold)}
.sgf-account-consent{display:flex;align-items:flex-start;gap:8px}
.sgf-account-consent input{margin-top:5px}
.sgf-account-panel button,.sgf-account-button{cursor:pointer;font:inherit;border:1px solid var(--line);color:var(--gold);padding:8px 14px;border-radius:9px;background:#121b25}
.sgf-account-panel button:disabled{opacity:.6;cursor:wait}
.sgf-account-panel .sgf-account-button{display:inline-flex;align-items:center;justify-content:center;min-height:43px;color:#231909;background:#dfbe82;border-color:transparent;font-weight:850;margin-top:9px}
.sgf-account-panel .sgf-account-button:hover{background:#f1d59e}
.sgf-account-actions{display:flex;flex-wrap:wrap;gap:7px;align-items:center;margin-top:13px}
.sgf-account-actions .sgf-account-button{margin-top:0}
.sgf-account-panel .sgf-account-message{margin-top:14px;padding:9px 11px;color:#cce2c8;background:#142521;border-radius:8px;font-size:.87rem}
.sgf-account-panel .sgf-account-message[data-kind="error"]{color:#ffd5ce;background:#2e1c24}
.sgf-account-privacy{color:var(--muted);border-top:1px solid var(--line);padding-top:11px;margin-top:17px;font-size:.82rem}
.sgf-account-privacy summary{cursor:pointer;color:var(--gold)}
.sgf-account-privacy p{margin-top:7px}
.sgf-account :is(a,button,input,summary):focus-visible{outline:2px solid var(--gold);outline-offset:3px}
@media(max-width:730px){.sgf-account-grid{grid-template-columns:minmax(0,1fr);min-height:0}.sgf-account-note{margin-top:12px}}
`;
