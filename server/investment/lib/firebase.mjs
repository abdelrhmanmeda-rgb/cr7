// Firebase production-host adapter, deliberately restricted to an independent test project.
export async function firebaseSandbox(env=process.env) {
  if(env.INVESTMENT_MODE!=='sandbox' || !env.INVESTMENT_FIREBASE_CREDENTIALS || !env.INVESTMENT_SANDBOX_PROJECT || !env.INVESTMENT_FIREBASE_WEB_KEY || !env.INVESTMENT_LEGACY_FIREBASE_PROJECT || env.INVESTMENT_LEGACY_FIREBASE_PROJECT===env.INVESTMENT_SANDBOX_PROJECT || env.INVESTMENT_SANDBOX_PROJECT==='cr7bot-85133') throw Error('Independent Firebase sandbox configuration is required');
  const config=JSON.parse(env.INVESTMENT_FIREBASE_CREDENTIALS);
  if(config.project_id!==env.INVESTMENT_SANDBOX_PROJECT) throw Error('Firebase credential project mismatch');
  const { initializeApp,cert,getApps }=await import('firebase-admin/app');
  const { getAuth }=await import('firebase-admin/auth');
  const { getFirestore }=await import('firebase-admin/firestore');
  const app=getApps().find(p=>p.name==='cr7-investment-sandbox')??initializeApp({credential:cert(config),projectId:config.project_id},'cr7-investment-sandbox');
  const db=getFirestore(app), auth=getAuth(app);
  const col=k=>db.collection('cr7_investment_sandbox__'+k);
  const store={run:fn=>db.runTransaction(async t=>{
    const writes=[];
    const transaction={
      get:async(k,id)=>(await t.get(col(k).doc(id))).data()??null,
      list:async(k,uid)=>(await t.get(uid ? col(k).where('uid','==',uid) : col(k))).docs.map(d=>d.data()),
      add:(k,id,v)=>writes.push(()=>t.create(col(k).doc(id),v)),
      put:(k,id,v)=>{ if(['audit','ledger','refs','keys'].includes(k)) throw Error('Immutable collection'); writes.push(()=>t.set(col(k).doc(id),v)); },
      del:(k,id)=>{ if(['audit','ledger','refs','keys'].includes(k)) throw Error('Immutable collection'); writes.push(()=>t.delete(col(k).doc(id))); }
    };
    const result=await fn(transaction); writes.forEach(w=>w()); return result;
  })};
  const external={
    async login(email,password) {
      const res=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+encodeURIComponent(env.INVESTMENT_FIREBASE_WEB_KEY),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true}),signal:AbortSignal.timeout(8000)});
      if(!res.ok) return null;
      const {idToken}=await res.json();
      const decoded=await auth.verifyIdToken(idToken,true);
      if(decoded.email?.toLowerCase()!==email) return null;
      return {uid:decoded.uid,admin:decoded.investmentSandboxAdmin===true,name:decoded.name??''};
    },
    async register(email,password,name){
      const created=await auth.createUser({email,password,displayName:name});
      return {uid:created.uid,admin:false,name};
    },
    async active(uid){try{return !(await auth.getUser(uid)).disabled;}catch{return false;}},
    async isAdmin(uid){try{const u=await auth.getUser(uid);return !u.disabled&&u.customClaims?.investmentSandboxAdmin===true;}catch{return false;}}
  };
  return {store,external};
}
