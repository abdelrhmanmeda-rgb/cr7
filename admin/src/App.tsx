'use client';
import React, { useState, useEffect } from 'react';
import UniverseEditor from './UniverseEditor';
import UniverseLedger from './UniverseLedger';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, type User } from 'firebase/auth';


import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
interface IconProps {size?:number;className?:string;fill?:string}
const Icons = {
  LogOut: ({ size = 20, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Activity: ({ size = 20, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  Star: ({ size = 20, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
  ShieldAlert: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  Menu: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>,
  X: ({ size = 20, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
};

const firebaseConfig = {
  apiKey: "AIzaSyC2oPdDjR-0sOrMVcveOXnmQJ4b1QFvJho",
  authDomain: "cr7bot-85133.firebaseapp.com",
  projectId: "cr7bot-85133",
  storageBucket: "cr7bot-85133.appspot.com",
  messagingSenderId: "532213195017",
  appId: "1:532213195017:web:035e6ce336c9aebce3f3d8"
};

const app = initializeApp(firebaseConfig);

// الخدمات
const auth = getAuth(app);

const LoginScreen = ({ setAuthError, authError }: { setAuthError: (err: string) => void, authError: string }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      setAuthError('بيانات الدخول غير صحيحة. يرجى مراجعة فايربيز.');
    }
    setLoading(false);
  };

  return (
    <div className="cr7-admin-theme cr7-admin-login min-h-screen bg-[#020408] flex items-center justify-center p-6 font-sans relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
      </div>

      <div className="cr7-admin-login-card bg-[#080a0f] border border-white/10 p-10 md:p-14 rounded-[40px] shadow-2xl w-full max-w-lg z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/10 overflow-hidden bg-white/5">
            <img src="/sgf-mark.svg" alt="" width="36" height="36"/>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">إدارة صناديق الخليج الذكية</h1>
          <p className="text-gray-500 text-sm mt-2 font-bold uppercase tracking-widest">بوابة فريق الإدارة</p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold">
            <Icons.ShieldAlert /> <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-widest pr-1">البريد الإلكتروني</label>
            <input aria-label="البريد الإلكتروني" autoComplete="username" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-all placeholder:text-gray-700" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-widest pr-1">كلمة المرور</label>
            <input aria-label="كلمة المرور" autoComplete="current-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-all placeholder:text-gray-700" placeholder="••••••••" />
          </div>
          <button disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50">
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'universe'|'ledger'>('universe');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      #root { max-width: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
      body { margin: 0 !important; padding: 0 !important; }
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f650; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
    `;
    document.head.appendChild(style);

    const unsub = onAuthStateChanged(auth, u => { setUser(u); setAuthChecking(false); });
    return () => {unsub();style.remove();};
  }, []);

  if (authChecking) return <div className="cr7-admin-theme cr7-admin-loading min-h-screen bg-[#020408] text-white flex items-center justify-center font-black animate-pulse tracking-widest uppercase">جاري التحقق من الجلسة…</div>;

  if (!user) return <LoginScreen setAuthError={setAuthError} authError={authError} />;

  return (
    <div className="cr7-admin-theme cr7-admin-shell flex min-h-screen w-full bg-[#020408] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden" dir="rtl">

      <aside id="cr7-admin-navigation" className={`cr7-admin-sidebar fixed lg:sticky top-0 right-0 z-50 h-screen w-[280px] bg-[#05070a] border-l border-white/5 flex flex-col transition-all duration-300 transform shrink-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl border border-white/5 overflow-hidden bg-white/5">
              <img src="/sgf-mark.svg" alt="" width="36" height="36"/>
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter uppercase leading-none text-white">صناديق الخليج الذكية</h1>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">مكتب الإدارة</p>
            </div>
          </div>
          <button aria-label="إغلاق القائمة" className="lg:hidden p-3 bg-white/5 rounded-2xl text-white" onClick={() => setIsSidebarOpen(false)}><Icons.X /></button>
        </div>

        <nav className="flex-1 px-6 space-y-4">
          <button aria-pressed={activeTab==='universe'} onClick={()=>{setActiveTab('universe');setIsSidebarOpen(false);}} className="w-full flex items-center gap-4 p-4 font-black"><Icons.Star/> إدارة الواجهة</button>
          <button aria-pressed={activeTab==='ledger'} onClick={()=>{setActiveTab('ledger');setIsSidebarOpen(false);}} className="w-full flex items-center gap-4 p-4 font-black"><Icons.Activity/> سجل المستثمرين</button>
        </nav>

        <div className="p-8 border-t border-white/5">
          <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-3 p-4 rounded-[24px] text-red-400 bg-red-500/5 hover:bg-red-500 hover:text-white font-black transition-all shadow-lg active:scale-95">
            <Icons.LogOut /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {isSidebarOpen && <button type="button" className="cr7-admin-mask" aria-label="إغلاق القائمة" onClick={() => setIsSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col w-full min-w-0 relative">
        <header className="cr7-admin-topbar lg:hidden flex items-center justify-between p-6 bg-[#05070a]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
           <div className="font-black text-xl tracking-tight text-blue-500">إدارة صناديق الخليج الذكية</div>
           <button aria-label="القائمة" aria-controls="cr7-admin-navigation" aria-expanded={isSidebarOpen} onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white/5 rounded-2xl active:bg-white/10 transition-colors"><Icons.Menu /></button>
        </header>

        <main className="cr7-admin-main flex-1 p-4 md:p-6 lg:p-8 xl:p-10 relative w-full h-full">
          <div className="w-full pb-20">
            <div className="cr7-admin-heading mb-10 lg:mb-12 flex flex-col items-center justify-center text-center mx-auto">
              <h2 className="text-3xl lg:text-5xl font-black mb-3 tracking-tighter">
                {activeTab === 'universe' ? 'إدارة محتوى المنصة' : 'سجل المستثمرين'}
              </h2>
              <p className="text-gray-500 text-base lg:text-lg max-w-2xl leading-relaxed text-center mx-auto">
                حدّث محتوى صناديق الخليج أو راجع سجل المستثمرين.
              </p>
            </div>

            <div className="w-full">
              {activeTab === 'ledger' ? <UniverseLedger getToken={async()=>{if(!auth.currentUser)throw Error('سجّل دخولك من جديد.');return auth.currentUser.getIdToken();}}/> : <UniverseEditor uid={user.uid} getToken={async()=>user.getIdToken()}/>}
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}
