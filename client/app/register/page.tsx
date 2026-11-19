"use client";

import Link from "next/link";
import { LuxuryPhoto } from "../luxury-photo";
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
  apiKey: process.env.NEXT_PUBLIC_SGF_FIREBASE_API_KEY?.trim() || "AIzaSyAjvTzEBmejj6AoOWx3qQAHQ2ITmdj1meU",
  projectId: process.env.NEXT_PUBLIC_SGF_FIREBASE_PROJECT_ID?.trim() || "smart-gulf-funds",
  appId: process.env.NEXT_PUBLIC_SGF_FIREBASE_APP_ID?.trim() || "1:677177948074:web:f4635a3e251ab4f7f8ddd3",
};
const operator = process.env.NEXT_PUBLIC_SGF_OPERATOR?.trim() || "إدارة صناديق الخليج الذكية";
const telegramHandle = (process.env.NEXT_PUBLIC_SGF_PRIVACY_TELEGRAM?.trim() || "Khaled_AlAlya")
  .replace(/^(?:https:\/\/)?t\.me\//i, "")
  .replace(/^@|\/$/g, "");
const hasPrivacyContact = /^[a-zA-Z0-9_]{3,32}$/.test(telegramHandle);
const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// The homepage link stays controlled by its separate visibility flag during testing.
const enabled = (process.env.NEXT_PUBLIC_SGF_SIGNUP_ENABLED ?? "1") === "1" &&
  /^AIza[A-Za-z0-9_-]{35}$/.test(config.apiKey) && /^1:\d+:web:[a-f0-9]+$/i.test(config.appId) &&
  /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(config.projectId) &&
  config.projectId !== "cr7bot-85133" && hasPrivacyContact;
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
      return "ما قدرنا نسجّل دخولك. شيّك على بريدك وكلمة المرور، أو جرّب استرجاعها.";
    case "auth/invalid-email":
      return "تأكّد إنك كاتب بريد إلكتروني صحيح.";
    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements":
      return "كلمة المرور ما تطابق الشروط. خلّها ١٢ حرف على الأقل، واخلط بين الحروف والأرقام والرموز.";
    case "auth/too-many-requests":
    case "auth/quota-exceeded":
      return "المحاولات كثيرة حاليًا. انتظر شوي، وبعدها جرّب مرة ثانية.";
    case "auth/network-request-failed":
      return "ما قدرنا نتصل. شيّك على الإنترنت وجرّب مرة ثانية.";
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
      setNotice({ text: "انتظر دقيقة قبل ما تطلب رسالة تأكيد ثانية.", kind: "error" });
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
      setNotice({ text: "اكتب اسمك، وخلّ كلمة المرور ١٢ حرف على الأقل، ووافق على شروط التسجيل.", kind: "error" });
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
        setNotice({ text: "ما قدرنا نفتح حسابك. جرّب تسجّل دخولك أو تسترجع كلمة المرور.", kind: "error" });
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
    <main className="sgf-account sgf-account-lux" dir="rtl" lang="ar">
      <header className="sgf-account-shell sgf-account-head">
        <Link href="/" className="sgf-account-brand">
          <span aria-hidden="true"><svg width="25" height="25" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M3 21 14 4l11 17H3Zm6 0 5-8 5 8m-5-8v8M7 25h14" strokeLinejoin="round" /></svg></span>
          {brand}
        </Link>
        <Link href="/" className="sgf-account-back">الرئيسية</Link>
      </header>

      <div className="sgf-account-shell sgf-account-grid">
        <aside className="sgf-account-intro">
          <LuxuryPhoto asset="hero" />
          <span className="sgf-account-eyebrow">صناديق الخليج الذكية</span>
          <h1>حسابك في المنصة</h1>
          <p>افتح حسابك ببريدك الإلكتروني، أو سجّل دخولك إذا عندك حساب من قبل.</p>
          <div className="sgf-account-note">أكّد بريدك عند التسجيل، واسترجع كلمة المرور إذا احتجت.</div>
        </aside>

        <section className="sgf-account-panel" aria-label="إدارة الحساب" aria-busy={busy}>
          {phase === "checking" ? <><h2>انتظر شوي</h2><p>قاعدين نتأكّد من حالة حسابك…</p></> :
           phase !== "available" ? (
             <>
               <span className="sgf-account-eyebrow">حالة التسجيل</span>
               <h2>{phase === "closed" ? "التسجيل مو متاح الحين" : "خدمة الحسابات مو متوفّرة الحين"}</h2>
               <p>تقدر ترجع للرئيسية أو تكمّل القراءة في مركز المعرفة.</p>
               <Link href="/#knowledge" className="sgf-account-button">تصفّح مركز المعرفة</Link>
             </>
           ) : profile?.verified ? (
             <><span className="sgf-account-eyebrow">البريد مؤكّد</span>
               <h2>{profile.name ? `يا هلا، ${profile.name}` : "يا هلا في حسابك"}</h2>
               <p>تأكّد بريدك الإلكتروني بنجاح.</p>
               <p><bdi>{profile.email}</bdi></p>
               <Link href="/#knowledge" className="sgf-account-button">روح لمركز المعرفة</Link>
             </>
           ) : profile ? (
             <>
               <span className="sgf-account-eyebrow">خطوة التأكيد</span>
               <h2>أكّد بريدك الإلكتروني</h2>
               <p>افتح رابط التأكيد اللي أرسلناه إلى <bdi>{profile.email}</bdi>، وبعدها اضغط «تأكدت من بريدي».</p>
               <div className="sgf-account-actions">
                 <button type="button" disabled={busy} onClick={checkEmail} className="sgf-account-button">تأكدت من بريدي</button>
                 <button type="button" disabled={busy} onClick={() => run(async () => {
                   const user = authForSite().currentUser;
                   if (user && !user.emailVerified) await verify(user);
                 })}>أرسل الرابط مرة ثانية</button>
               </div>
             </>
           ) : (
             <>
               <span className="sgf-account-eyebrow">حساب {brand}</span>
               <h2>{titles[view]}</h2>
               <p>{view === "create" ? "بنرسل لك رابط تأكيد الحساب على بريدك." : "استخدم نفس البريد اللي سجّلت به."}</p>
               <form method="post" onSubmit={submit} key={view}>
                 {view === "create" && <label>اسمك<input name="name" autoComplete="name" required minLength={2} maxLength={90} /></label>}
                 <label>البريد الإلكتروني<input type="email" name="email" autoComplete="email" dir="ltr" required maxLength={200} /></label>
                 {view !== "reset" && <label>كلمة المرور<input type="password" name="password" autoComplete={view === "create" ? "new-password" : "current-password"} required minLength={view === "create" ? 12 : undefined} maxLength={128} dir="ltr" /></label>}
                 {view === "create" && <>
                   <small>خلّها ١٢ حرف على الأقل، ولا تستخدم كلمة مرور حساب ثاني.</small>
                   <label className="sgf-account-consent"><input name="terms" type="checkbox" value="yes" required /> قريت شروط التسجيل والخصوصية وأوافق عليها.</label>
                 </>}
                 <button type="submit" className="sgf-account-button" disabled={busy}>{busy ? "لحظة، نكمّل طلبك…" : titles[view]}</button>
               </form>
               <div className="sgf-account-actions">
                 {(["login","create","reset"] as const).filter((mode) => mode !== view).map((mode) => <button key={mode} type="button" disabled={busy} onClick={() => { setView(mode); setNotice(null); }}>{titles[mode]}</button>)}
               </div>
             </>
           )}
          {phase === "available" && profile && <div className="sgf-account-actions"><button type="button" disabled={busy} onClick={() => run(async () => { await signOut(authForSite()); setProfile(null); setView("login"); })}>سجّل خروجك</button></div>}
          {notice && <p className="sgf-account-message" data-kind={notice.kind} role="status">{notice.text}</p>}
          {phase === "available" && hasPrivacyContact && <details className="sgf-account-privacy"><summary>شروط التسجيل والخصوصية</summary>
            <p>فتح الحساب يخلّيك تسجّل دخولك وتدير بياناتك. فتح الحساب ما يعني اشتراك في أي منتج استثماري.</p>
            <p>نستخدم اسمك وبريدك لإدارة حسابك، وبيانات الدخول تُدار في Firebase. إذا عندك استفسار عن بياناتك أو تبي تطلب حذف حسابك، هذي بيانات {operator}: <span>تليجرام <bdi>@{telegramHandle}</bdi></span>.</p>
          </details>}
        </section>
      </div>
    </main>
  );
}
