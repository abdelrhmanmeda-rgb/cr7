"use client";

import { AccountScreen, type AccountView as View, type AccountPhase as Phase, type AccountProfile as Profile, type AccountNotice as Notice } from "./account-screen";
import {parseLedger,type LedgerState} from "./account-ledger";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { authForSite,enabled,officialOrigin } from "../investor-auth";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

const brand = "صناديق الخليج الذكية";
const operator = process.env.NEXT_PUBLIC_SGF_OPERATOR?.trim() || "إدارة صناديق الخليج الذكية";
const telegramHandle = (process.env.NEXT_PUBLIC_SGF_PRIVACY_TELEGRAM?.trim() || "Khaled_AlAlya")
  .replace(/^(?:https:\/\/)?t\.me\//i, "").replace(/^@|\/$/g, "");
const hasPrivacyContact = /^[a-zA-Z0-9_]{3,32}$/.test(telegramHandle);
const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const actions = { url: officialOrigin + "/register", handleCodeInApp: false };

function profileOf(user: User | null): Profile | null {
  return user ? { uid: user.uid, email: user.email ?? "", name: user.displayName?.trim() ?? "", verified: user.emailVerified } : null;
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
      const mode = new URLSearchParams(window.location.search).get("mode");
      if (mode === "login" || mode === "create") setView(mode);
      if (window.location.origin !== officialOrigin) {
        setPhase("closed");
        return;
      }
      try {
        unsubscribe = onAuthStateChanged(authForSite(), (user) => {
          setBook(previous=>user?.emailVerified && previous?.owner===user.uid ? previous : null);
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

  const owner = phase === "available" && profile?.verified ? profile.uid : "";
  const [book, setBook] = useState<{owner:string;version:number;state:LedgerState} | null>(null);
  const [version, refreshVersion] = useState(0);
  useEffect(() => {
    if (!owner) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);
    let mounted = true;
    const current = () => authForSite().currentUser;
    const load = async () => {
      const user = current();
      if (!user?.emailVerified || user.uid !== owner) return;
      const base=(process.env.NEXT_PUBLIC_SGF_LEDGER_API || "https://cr7-kappa.vercel.app").replace(/\/+$/,"");
      const request=async (fresh:boolean) => {
        const token=await user.getIdToken(fresh);
        if(current()?.uid!==owner||!mounted) throw Error();
        return fetch(base+"/api/universe/me",{headers:{Authorization:"Bearer "+token},cache:"no-store",redirect:"error",signal:controller.signal});
      };
      let response=await request(false);
      if(response.status===401||response.status===403) response=await request(true);
      if(!response.ok) throw Error();
      const data=parseLedger(await response.json());
      if (mounted && current()?.uid===owner) setBook({owner,version,state:{status:"ready",data}});
    };
    load().catch(()=>{if(mounted && current()?.uid===owner) setBook({owner,version,state:{status:"failed"}});}).finally(()=>window.clearTimeout(timer));
    return () => {mounted=false;controller.abort();window.clearTimeout(timer);};
  },[owner,version]);

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

  return <AccountScreen ledger={owner && book?.owner===owner && book.version===version ? book.state : {status:"loading"}} refreshLedger={()=>refreshVersion(v=>v+1)} brand={brand} operator={operator}
    telegram={hasPrivacyContact ? `https://t.me/${telegramHandle}` : null}
    phase={phase} profile={profile} notice={notice} busy={busy} view={view}
    changeView={(mode) => { setView(mode); setNotice(null); }}
    submit={submit} checkEmail={checkEmail}
    resend={() => run(async () => {
      const user = authForSite().currentUser;
      if (user && !user.emailVerified) await verify(user);
    })}
    signOut={() => run(async () => {
      await signOut(authForSite()); setBook(null); setProfile(null); setView("login");
    })}
  />;
}
