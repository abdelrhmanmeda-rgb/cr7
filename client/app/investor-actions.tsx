"use client";

import { createContext,useContext,useEffect,useState,type ReactNode } from "react";
import { site } from "./universe-copy";

type Session = "checking" | "guest" | "signed-in" | "unavailable";
const SessionContext = createContext<Session>("checking");
const accountUrl = "/register?mode=login";
const createUrl = "/register?mode=create";

export function InvestorSession({children}:{children:ReactNode}) {
  const [session,setSession]=useState<Session>("checking");
  useEffect(()=>{
    // Other origins never initialize the production investor's Firebase session.
    if(!site.registrationUrl||window.location.origin!=="https://www.cr7botai.com") return;
    let cancelled=false;
    let unsubscribe:(()=>void)|undefined;
    Promise.all([import("./investor-auth"),import("firebase/auth")]).then(([{authForSite,enabled},{onAuthStateChanged}])=>{
      if(cancelled)return;
      if(!enabled){setSession("unavailable");return;}
      unsubscribe=onAuthStateChanged(authForSite(),user=>setSession(user?"signed-in":"guest"),()=>setSession("unavailable"));
    }).catch(()=>{if(!cancelled)setSession("unavailable");});
    return ()=>{cancelled=true;unsubscribe?.();};
  },[]);
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function InvestorSignupLink({className="u-btn gold",onClick}:{className?:string;onClick?:()=>void}) {
  const session=useContext(SessionContext);
  return site.registrationUrl&&session==="guest"?<a className={className} href={createUrl} onClick={onClick}>أنشئ حسابك</a>:null;
}

export function HeaderInvestorActions() {
  return <div className="u-account-actions">
    <a className="u-btn u-investor-link" href={site.registrationUrl?accountUrl:"/contact"}>{site.registrationUrl?"حساب المستثمر":"تواصل معنا"}</a>
    <InvestorSignupLink/>
  </div>;
}

export function HomeAccount() {
  const session=useContext(SessionContext);
  if(!site.registrationUrl)return null;
  return <section id="registration" className="afq-section afq-registration">
    <div className="afq-section-title">
      <span className="afq-eyebrow">حسابك في المنصة</span><h2>حساب المستثمر</h2>
      <p>{session==="signed-in"?"ارجع لحسابك لمتابعة بياناتك.":"إذا عندك حساب، سجّل دخولك. وإذا أول مرة، تقدر تنشئ حساب وتأكد بريدك."}</p>
    </div>
    <div className="u-account-actions u-account-center"><a className="u-btn" href={accountUrl}>حساب المستثمر</a><InvestorSignupLink/></div>
  </section>;
}
