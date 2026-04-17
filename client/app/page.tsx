'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC2oPdDjR-0sOrMVcveOXnmQJ4b1QFvJho",
  authDomain: "cr7bot-85133.firebaseapp.com",
  projectId: "cr7bot-85133",
  storageBucket: "cr7bot-85133.appspot.com",
  messagingSenderId: "532213195017",
  appId: "1:532213195017:web:035e6ce336c9aebce3f3d8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ==========================================
// Interfaces
// ==========================================
interface IconProps { size?: number; className?: string; fill?: string; }
interface Bot { id?: string; _id?: string; name: string; description: string; accuracy: string; price: string; imageUrl: string; features: string[]; isBestSeller?: boolean | string; }
interface Plan { id?: string; _id?: string; type: string; title: string; capital: string; fee: string; features: string[]; isBestSeller?: boolean | string; }
interface Result { id?: string; _id?: string; mediaType: string; mediaUrl: string; profitAmount: string | number; notes?: string; createdAt: string; }
interface Activity { action: string; date: string; }
interface Settings { contact: { telegram: string; whatsapp: string; email: string }; faqs: { question: string; answer: string }[]; terms: string; aboutUs: string; heroPhrases?: string[]; }
interface CommentData { id: string; userId: string; userName: string; userImage: string; text: string; date: string; }
interface PostData { id?: string; _id?: string; title: string; content: string; imageUrl: string; createdAt: string; likes?: string[]; comments?: CommentData[]; }

// ==========================================
// Icons SVG
// ==========================================
const Icons = {
  Menu: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  X: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  TrendingUp: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  ShieldCheck: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>,
  Zap: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m13 2-2 10h3l-2 10 2-10h-3z"/></svg>,
  BarChart3: ({ className = "", size = 24 }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
  BookOpen: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>,
  Heart: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  MessageCircle: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
  ChevronRight: ({ className = "", size = 24 }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>,
  Globe: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/><path d="M2 12h20"/></svg>,
  RefreshCw: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>,
  ArrowUpRight: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>,
  Cpu: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="24" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  CheckCircle: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  CreditCard: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Check: ({ size = 20, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>,
  Info: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Telegram: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13v8l4-5"/></svg>,
  Facebook: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  Instagram: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>,
  TikTok: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v11a4 4 0 1 1-4-4z"/></svg>,
  Phone: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  HelpCircle: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  FileText: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  LogOut: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Google: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
};

// ==========================================
// Background Luxury Animation
// ==========================================
const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#030303]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a150a_0%,#030303_100%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-[#bf953f]/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-[#8B6E36]/10 rounded-full blur-[150px] animate-pulse"></div>
    </div>
  );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [results, setResults] = useState<Result[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [settings, setSettings] = useState<Settings>({ contact: { telegram: '', whatsapp: '', email: '' }, faqs: [], terms: '', aboutUs: '' });
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [userActivity, setUserActivity] = useState<Activity[]>([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(0);

  const heroPhrases = settings.heroPhrases || ['يعمل لأجلك', 'يحقق أحلامك', 'يصنع ثروتك', 'يؤمن مستقبلك'];

  // --- Constants for Styled Classes ---
  const goldTextClass = "text-transparent bg-clip-text bg-gradient-to-b from-[#bf953f] via-[#fcf6ba] to-[#b38728] drop-shadow-sm font-black";
  const goldCardClass = "bg-[#0a0a0a]/80 backdrop-blur-xl border border-[#bf953f]/20 rounded-[40px] hover:border-[#bf953f]/60 transition-all duration-500 shadow-2xl";
  const goldBtnClass = "bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] text-black font-black transition-all hover:scale-105 active:scale-95 shadow-xl";

  // Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserActivity(JSON.parse(localStorage.getItem(`activity_${currentUser.uid}`) || "[]"));
      }
    });
    return () => unsubscribe();
  }, []);

  // API Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const urls = [
        'https://cr7-kappa.vercel.app/api/results',
        'https://cr7-kappa.vercel.app/api/bots',
        'https://cr7-kappa.vercel.app/api/subscriptions',
        'https://cr7-kappa.vercel.app/api/settings',
        'https://cr7-kappa.vercel.app/api/blog'
      ];
      const [resR, botR, planR, setR, blogR] = await Promise.all(urls.map(u => fetch(u).then(r => r.json())));
      if (resR.success) setResults(resR.data);
      if (botR.success) setBots(botR.data);
      if (planR.success) setPlans(planR.data);
      if (setR.success) setSettings(setR.data);
      if (blogR.success) setPosts(blogR.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentPhraseIndex(p => (p + 1) % heroPhrases.length), 3000);
    return () => clearInterval(interval);
  }, [heroPhrases.length]);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoogleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); setShowLoginModal(false); } catch (e) { alert('خطأ في الدخول'); }
  };

  const handleLogout = async () => { await signOut(auth); setCurrentPage('home'); };

  const handleLike = async (postId: string) => {
    if (!user) { setShowLoginModal(true); return; }
    setPosts(prev => prev.map(post => {
      const pid = post.id || post._id;
      if (pid === postId) {
        const likes = post.likes || [];
        const hasLiked = likes.includes(user.uid);
        return { ...post, likes: hasLiked ? likes.filter(u => u !== user.uid) : [...likes, user.uid] };
      }
      return post;
    }));
    try {
      await fetch(`https://cr7-kappa.vercel.app/api/blog/${postId}/like`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.uid })
      });
    } catch (e) {}
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !commentText.trim()) return;
    const newComment = { id: Date.now().toString(), userId: user.uid, userName: user.displayName || 'مستخدم', userImage: user.photoURL || '', text: commentText, date: new Date().toISOString() };
    setPosts(prev => prev.map(p => ((p.id || p._id) === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p)));
    setCommentText('');
    try {
      await fetch(`https://cr7-kappa.vercel.app/api/blog/${postId}/comment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newComment)
      });
    } catch (e) {}
  };

  return (
    <div className="min-h-screen text-white selection:bg-[#bf953f]/30 font-sans overflow-x-hidden flex flex-col relative bg-[#030303]" dir="rtl">
      <BackgroundAnimation />

      {/* --- Navbar الفاخر --- */}
      <nav className="sticky top-0 z-50 backdrop-blur-3xl border-b border-[#bf953f]/20 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
            <div className="w-12 h-12 bg-[#bf953f]/10 rounded-2xl flex items-center justify-center border border-[#bf953f]/30 overflow-hidden shadow-inner">
              <img src="https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl uppercase tracking-tighter leading-none ${goldTextClass}`}>CR7 VIP</span>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Smart Gold Algo</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold">
            {['home', 'about', 'bots', 'results', 'subscribe', 'blog'].map((page) => (
              <button key={page} onClick={() => navigateTo(page)} className={`transition-all hover:text-[#fcf6ba] ${currentPage === page ? 'text-[#bf953f]' : 'text-gray-400'}`}>
                {page === 'home' ? 'الرئيسية' : page === 'about' ? 'من نحن' : page === 'bots' ? 'البوتات' : page === 'results' ? 'النتائج' : page === 'subscribe' ? 'الاشتراكات' : 'المدونة'}
              </button>
            ))}
            <div className="h-6 w-[1px] bg-[#bf953f]/20"></div>
            {user ? (
              <button onClick={() => navigateTo('profile')} className="flex items-center gap-3 bg-white/5 border border-[#bf953f]/30 px-5 py-2 rounded-full font-bold">
                <img src={user.photoURL || ""} alt="User" className="w-7 h-7 rounded-full border border-[#bf953f]/50" />
                <span className="text-sm">{user.displayName?.split(' ')[0]}</span>
              </button>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className={`px-8 py-2.5 rounded-full ${goldBtnClass}`}>دخول</button>
            )}
          </div>

          <button className="lg:hidden p-2 text-[#bf953f]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#05070a]/95 backdrop-blur-3xl border-b border-[#bf953f]/30 p-8 flex flex-col gap-6 animate-in slide-in-from-top-4">
             {['home', 'about', 'bots', 'results', 'subscribe', 'blog'].map((page) => (
                <button key={page} onClick={() => navigateTo(page)} className="text-xl font-bold text-right text-gray-300 hover:text-[#bf953f]">
                   {page === 'home' ? 'الرئيسية' : page === 'about' ? 'من نحن' : page === 'bots' ? 'البوتات' : page === 'results' ? 'النتائج' : page === 'subscribe' ? 'الاشتراكات' : 'المدونة'}
                </button>
             ))}
          </div>
        )}
      </nav>

      <main className="flex-grow relative z-10">
        
        {/* 1. الرئيسية - مُعدلة بالستايل الجولد */}
        {currentPage === 'home' && (
          <section className="relative pt-16 pb-32 px-6">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-16">
              <div className="text-center lg:text-right space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#bf953f]/10 border border-[#bf953f]/20 text-[#fcf6ba] text-xs font-black uppercase tracking-widest">
                  خوارزمية تداول الذهب الأكثر دقة
                </div>
                <h1 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tight">
                  اجعل التداول <br />
                  <span className={`block mt-4 ${goldTextClass} animate-pulse`}>
                    {heroPhrases[currentPhraseIndex]}
                  </span>
                </h1>
                <p className="text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-bold">
                  نظام تداول آلي بالكامل صُمم ليكون الأقوى في سوق الفوركس والذهب. دقة تتخطى 94%، إدارة مخاطر ذكية.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center lg:justify-start">
                  <button onClick={() => navigateTo('subscribe')} className={`px-12 py-5 rounded-2xl text-xl ${goldBtnClass}`}>ابدأ الآن <Icons.ChevronRight className="inline-block mr-2" size={24}/></button>
                  <button onClick={() => navigateTo('results')} className="px-12 py-5 rounded-2xl text-xl border border-[#bf953f]/30 bg-white/5 hover:bg-[#bf953f]/10 transition-all font-black">شاهد النتائج</button>
                </div>
              </div>

              {/* بطاقة الإحصائيات الفخمة */}
              <div className={`p-10 md:p-14 ${goldCardClass}`}>
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Live Profit Tracking</p>
                      <h3 className={`text-2xl italic ${goldTextClass}`}>CR7 GOLD ALGO</h3>
                   </div>
                   <Icons.TrendingUp className="text-[#bf953f]" size={32} />
                </div>
                <div className="space-y-10">
                  <div className="h-40 flex items-end gap-2 border-b border-[#bf953f]/10 pb-2">
                    {[30, 60, 45, 85, 55, 100, 75, 110].map((h, i) => (
                      <div key={i} style={{height: `${h}%`}} className="flex-1 bg-gradient-to-t from-[#8B6E36] to-[#fcf6ba] rounded-t-lg opacity-80 hover:opacity-100 transition-all"></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-black/40 border border-[#bf953f]/10">
                      <p className="text-xs text-gray-500 font-black uppercase mb-2">إجمالي العائد</p>
                      <p className={`text-4xl tracking-tighter ${goldTextClass}`}>+342%</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-black/40 border border-[#bf953f]/10">
                      <p className="text-xs text-gray-500 font-black uppercase mb-2">عدد الصفقات</p>
                      <p className="text-4xl font-black text-white tracking-tighter">1,250+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. البوتات - موجودة كاملة بالستايل الجديد */}
        {currentPage === 'bots' && (
          <section className="py-24 px-6 max-w-7xl mx-auto">
            <h2 className={`text-4xl md:text-6xl text-center mb-20 uppercase ${goldTextClass}`}>البوتات والخوارزميات</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {bots.map((bot) => (
                <div key={bot.id || bot._id} className={`${goldCardClass} overflow-hidden group`}>
                  <div className="h-64 relative overflow-hidden">
                    <img src={bot.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={bot.name} />
                    <div className="absolute top-6 right-6 bg-black/60 border border-[#bf953f]/40 px-3 py-1 rounded-full text-xs font-bold text-[#fcf6ba]">دقة {bot.accuracy}</div>
                  </div>
                  <div className="p-8 space-y-6 text-right">
                    <h3 className="text-2xl font-black text-white">{bot.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">{bot.description}</p>
                    <ul className="space-y-3">
                      {bot.features?.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-300 justify-start">
                          <Icons.CheckCircle size={16} className="text-[#bf953f]" /> {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between items-center pt-8 border-t border-[#bf953f]/10">
                      <span className={`text-3xl ${goldTextClass}`}>${bot.price}</span>
                      <button className={`px-8 py-3 rounded-xl ${goldBtnClass}`}>شراء الآن</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. النتائج - كاملة */}
        {currentPage === 'results' && (
          <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-20">
              <div className="text-right">
                <h2 className={`text-4xl md:text-6xl uppercase ${goldTextClass}`}>النتائج الموثقة</h2>
                <p className="text-gray-500 mt-4 text-lg font-bold">بكل شفافية.. شاهد أحدث الصفقات من السيرفر المباشر.</p>
              </div>
              <button onClick={() => fetchData()} className="p-4 rounded-2xl border border-[#bf953f]/30 bg-[#bf953f]/10 text-[#fcf6ba]">
                <Icons.RefreshCw size={28} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {results.map((res) => (
                <div key={res.id || res._id} className={`${goldCardClass} overflow-hidden`}>
                  <div className="h-80 bg-black">
                    {res.mediaType === 'video' ? <video src={res.mediaUrl} controls className="w-full h-full object-cover" /> : <img src={res.mediaUrl} className="w-full h-full object-cover" alt="Profit" />}
                  </div>
                  <div className="p-10 flex justify-between items-center text-right">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-black uppercase">ربح اليوم الصافي</p>
                      <p className="text-4xl font-black text-green-400 tracking-tighter">+${res.profitAmount}</p>
                    </div>
                    <div className="bg-[#bf953f]/10 p-3 rounded-2xl border border-[#bf953f]/30 text-[#fcf6ba]"><Icons.ArrowUpRight size={32}/></div>
                  </div>
                  <div className="px-10 pb-10 text-right text-gray-400 text-sm italic font-bold">{res.notes || 'تم تحقيق الهدف المالي لليوم بنجاح.'}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. الاشتراكات والإدارة - كاملة */}
        {currentPage === 'subscribe' && (
          <section className="py-24 px-6 max-w-7xl mx-auto space-y-32">
            <div className="text-center">
              <h2 className={`text-4xl md:text-6xl mb-6 uppercase ${goldTextClass}`}>الاشتراكات والإدارة</h2>
              <p className="text-gray-500 text-lg font-bold">اختر بين باقات الاشتراك الشهري أو نظام إدارة المحافظ بالكامل.</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12">
              {plans.filter(p => p.type === 'الاشتراكات').map((plan) => (
                <div key={plan.id || plan._id} className={`${goldCardClass} p-12 relative group`}>
                   {plan.isBestSeller && <div className="absolute top-8 left-[-40px] bg-[#bf953f] text-black font-black py-2 px-12 -rotate-45 text-xs shadow-xl">MOST POPULAR</div>}
                   <h4 className="text-3xl font-black text-white mb-6 text-right">{plan.title}</h4>
                   <p className={`text-5xl mb-10 text-right ${goldTextClass}`}>{plan.fee}</p>
                   <ul className="space-y-4 mb-12 text-right">
                     <li className="flex items-center gap-3 text-gray-300 font-bold justify-start"><Icons.Check size={20} className="text-[#bf953f]"/> رأس المال: {plan.capital}</li>
                     {plan.features?.map((f, i) => <li key={i} className="flex items-center gap-3 text-gray-400 font-bold justify-start"><Icons.Check size={20} className="text-white/20"/> {f}</li>)}
                   </ul>
                   <button className={`w-full py-5 rounded-2xl text-xl ${goldBtnClass}`}>اشترك الآن</button>
                </div>
              ))}
            </div>

            <div className="space-y-12">
               <h3 className={`text-3xl text-right flex items-center gap-4 flex-row-reverse ${goldTextClass}`}><Icons.BarChart3 size={36}/> نظام إدارة المحافظ</h3>
               {plans.filter(p => p.type === 'الإدارة').map((plan) => (
                 <div key={plan.id || plan._id} className={`${goldCardClass} p-12 flex flex-col md:flex-row items-center gap-12 text-right`}>
                    <div className="flex-1 space-y-6">
                       <h4 className="text-4xl font-black text-white">{plan.title}</h4>
                       <p className="text-gray-400 text-lg leading-relaxed font-bold">{plan.features?.join('. ')}</p>
                       <div className="flex gap-6 justify-end">
                          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-[#bf953f]/20">
                             <p className="text-xs text-gray-500 font-bold mb-1">أقل رأس مال</p>
                             <p className={`text-xl ${goldTextClass}`}>{plan.capital}</p>
                          </div>
                          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-[#bf953f]/20">
                             <p className="text-xs text-gray-500 font-bold mb-1">الرسوم</p>
                             <p className={`text-xl ${goldTextClass}`}>{plan.fee}</p>
                          </div>
                       </div>
                    </div>
                    <button className={`px-12 py-6 rounded-3xl text-2xl ${goldBtnClass}`}>ابدأ الإدارة الآن 🚀</button>
                 </div>
               ))}
            </div>
          </section>
        )}

        {/* 5. من نحن - كاملة */}
        {currentPage === 'about' && (
          <section className="py-24 px-6 max-w-4xl mx-auto text-center">
             <Icons.Info size={64} className="mx-auto text-[#bf953f] mb-8" />
             <h2 className={`text-4xl md:text-6xl mb-12 uppercase ${goldTextClass}`}>من نحن</h2>
             <div className={`${goldCardClass} p-12 md:p-16 text-right text-gray-300 text-xl leading-relaxed font-bold whitespace-pre-wrap`}>
               {settings.aboutUs || 'جاري تحميل المعلومات...'}
             </div>
          </section>
        )}

        {/* 6. المدونة - كاملة بكل تفاصيل التعليقات واللايكات */}
        {currentPage === 'blog' && (
          <section className="py-24 px-6 max-w-3xl mx-auto space-y-16">
            <h2 className={`text-4xl md:text-6xl text-center mb-16 uppercase ${goldTextClass}`}>مدونة النخبة</h2>
            {posts.map((post) => {
               const pid = post.id || post._id || '';
               const isExp = expandedPostId === pid;
               return (
                 <div key={pid} className={`${goldCardClass} overflow-hidden`}>
                    <div className="p-8 flex items-center gap-4 border-b border-[#bf953f]/10 flex-row-reverse text-right">
                       <img src="https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg" className="w-12 h-12 rounded-full border border-[#bf953f]/40" alt="Admin" />
                       <div>
                          <h4 className="font-black text-white">مدير CR7 <Icons.CheckCircle className="inline text-[#bf953f]" size={14}/></h4>
                          <p className="text-xs text-gray-500 font-bold">{new Date(post.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })}</p>
                       </div>
                    </div>
                    <div className="p-10 space-y-6 text-right">
                       <h3 className={`text-3xl font-black ${goldTextClass}`}>{post.title}</h3>
                       <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap font-bold">{post.content}</p>
                    </div>
                    {post.imageUrl && <img src={post.imageUrl} className="w-full border-y border-[#bf953f]/10" alt="Blog" />}
                    <div className="p-6 flex gap-10 text-gray-400 font-bold border-t border-[#bf953f]/10 flex-row-reverse">
                       <button onClick={() => handleLike(pid)} className={`flex items-center gap-2 transition-all ${user && post.likes?.includes(user.uid) ? 'text-red-500' : 'hover:text-red-500'}`}>
                          <Icons.Heart size={24} fill={user && post.likes?.includes(user.uid) ? "currentColor" : "none"}/> {post.likes?.length || 0}
                       </button>
                       <button onClick={() => setExpandedPostId(isExp ? null : pid)} className="flex items-center gap-2 hover:text-[#bf953f]">
                          <Icons.MessageCircle size={24}/> {post.comments?.length || 0}
                       </button>
                    </div>
                    {/* نظام التعليقات الكامل */}
                    {isExp && (
                      <div className="p-8 bg-black/40 space-y-8 animate-in slide-in-from-top-4">
                         <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pl-4">
                            {post.comments?.map((c, i) => (
                              <div key={i} className="flex gap-4 flex-row-reverse text-right">
                                 <img src={c.userImage || ""} className="w-10 h-10 rounded-full border border-[#bf953f]/20" />
                                 <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none flex-1 border border-white/5">
                                    <p className={`font-black text-sm mb-1 ${goldTextClass}`}>{c.userName}</p>
                                    <p className="text-gray-300 text-sm font-bold">{c.text}</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                         {user ? (
                           <div className="flex gap-4 pt-4 border-t border-[#bf953f]/10 flex-row-reverse">
                              <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="أضف تعليقاً..." className="flex-1 bg-white/5 border border-[#bf953f]/20 rounded-xl px-6 py-3 outline-none focus:border-[#bf953f] text-right" />
                              <button onClick={() => handleAddComment(pid)} className={`px-8 rounded-xl ${goldBtnClass}`}>إرسال</button>
                           </div>
                         ) : <p className="text-center text-gray-500 font-bold">سجل دخولك للتعليق</p>}
                      </div>
                    )}
                 </div>
               );
            })}
          </section>
        )}

        {/* 7. تواصل معنا - كاملة */}
        {currentPage === 'contact' && (
          <section className="py-24 px-6 max-w-5xl mx-auto text-center space-y-16">
             <Icons.Phone size={64} className="mx-auto text-[#bf953f]" />
             <h2 className={`text-4xl md:text-6xl uppercase ${goldTextClass}`}>تواصل معنا</h2>
             <div className="grid md:grid-cols-3 gap-8">
                <a href={settings.contact.telegram} target="_blank" className={`${goldCardClass} p-10 flex flex-col items-center gap-4 group`}>
                   <div className="w-16 h-16 bg-[#bf953f]/10 rounded-full flex items-center justify-center text-[#bf953f] group-hover:bg-[#bf953f] group-hover:text-black transition-all"><Icons.Telegram size={32}/></div>
                   <h3 className="font-black text-xl text-white">تليجرام</h3>
                   <p className="text-sm text-gray-500 font-bold">تواصل مباشر وسريع</p>
                </a>
                <a href={`https://wa.me/${settings.contact.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" className={`${goldCardClass} p-10 flex flex-col items-center gap-4 group`}>
                   <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all"><Icons.Phone size={32}/></div>
                   <h3 className="font-black text-xl text-white">واتساب</h3>
                   <p className="text-sm text-gray-500 font-bold">دعم فني واستفسارات</p>
                </a>
                <a href={`mailto:${settings.contact.email}`} className={`${goldCardClass} p-10 flex flex-col items-center gap-4 group`}>
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white group-hover:bg-[#bf953f] group-hover:text-black transition-all"><Icons.FileText size={32}/></div>
                   <h3 className="font-black text-xl text-white">إيميل</h3>
                   <p className="text-sm text-gray-500 font-bold">للشراكات الرسمية</p>
                </a>
             </div>
          </section>
        )}

        {/* 8. الملف الشخصي - كاملة */}
        {currentPage === 'profile' && user && (
          <section className="py-24 px-6 max-w-5xl mx-auto space-y-12 text-right">
             <div className={`${goldCardClass} p-10 flex flex-col md:flex-row items-center gap-8`}>
                <img src={user.photoURL || ""} className="w-32 h-32 rounded-full border-4 border-[#bf953f]/30 shadow-2xl" />
                <div className="flex-1 space-y-2">
                   <div className="inline-flex gap-2 px-4 py-1 rounded-full bg-[#bf953f]/10 text-[#fcf6ba] text-xs font-black uppercase tracking-widest mb-2 border border-[#bf953f]/20">حساب موثق VIP</div>
                   <h2 className="text-4xl font-black text-white">{user.displayName}</h2>
                   <p className="text-gray-500 font-bold italic">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="px-8 py-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-black transition-all border border-red-500/20">خروج</button>
             </div>
             <div className={`${goldCardClass} p-10`}>
                <div className="flex items-center gap-4 mb-10 border-b border-[#bf953f]/10 pb-6 flex-row-reverse">
                   <Icons.BarChart3 size={32} className="text-[#bf953f]" />
                   <h3 className={`text-2xl ${goldTextClass}`}>سجل النشاط الحديث</h3>
                </div>
                <div className="space-y-4">
                   {userActivity.length > 0 ? userActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 flex-row-reverse">
                         <p className="text-gray-200 font-bold">{activity.action}</p>
                         <p className="text-xs text-gray-500 font-bold">{new Date(activity.date).toLocaleString('ar-EG')}</p>
                      </div>
                   )) : <p className="text-center py-10 text-gray-500 font-bold">لا يوجد نشاط مسجل حالياً</p>}
                </div>
             </div>
          </section>
        )}

        {/* 9. الأسئلة الشائعة & الشروط - كاملة */}
        {currentPage === 'faqs' && (
           <section className="py-24 px-6 max-w-4xl mx-auto space-y-12">
              <h2 className={`text-4xl md:text-6xl text-center mb-16 uppercase ${goldTextClass}`}>الأسئلة الشائعة</h2>
              <div className="space-y-6">
                {settings.faqs?.map((faq, i) => (
                  <div key={i} className={`${goldCardClass} p-8 text-right`}>
                    <h3 className={`text-xl mb-4 flex items-start gap-4 flex-row-reverse ${goldTextClass}`}><Icons.HelpCircle size={24}/> {faq.question}</h3>
                    <p className="text-gray-400 leading-relaxed font-bold pr-10">{faq.answer}</p>
                  </div>
                ))}
              </div>
           </section>
        )}

        {currentPage === 'terms' && (
           <section className="py-24 px-6 max-w-4xl mx-auto text-center">
              <h2 className={`text-4xl md:text-6xl mb-12 uppercase ${goldTextClass}`}>الشروط والأحكام</h2>
              <div className={`${goldCardClass} p-12 md:p-16 text-right text-gray-300 text-lg leading-relaxed whitespace-pre-wrap font-bold`}>
                {settings.terms}
              </div>
           </section>
        )}

      </main>

      {/* --- Footer الفاخر --- */}
      <footer className="py-24 px-6 border-t border-[#bf953f]/20 bg-black mt-auto relative z-10 text-right">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
           <div className="col-span-2 space-y-8">
              <h3 className={`text-3xl italic ${goldTextClass}`}>CR7 PLATINUM GOLD</h3>
              <p className="text-gray-500 text-lg leading-relaxed font-bold max-w-md">نحن لا نقدم مجرد بوتات تداول، نحن نقدم منظومة ذكاء اصطناعي متكاملة لإدارة ونمو ثروتك في سوق الذهب.</p>
              <div className="flex gap-4 justify-end">
                {[Icons.Telegram, Icons.Facebook, Icons.Instagram, Icons.TikTok].map((Icn, i) => (
                  <a key={i} href="#" className="w-12 h-12 rounded-xl bg-white/5 border border-[#bf953f]/20 flex items-center justify-center text-[#bf953f] hover:bg-[#bf953f] hover:text-black transition-all"><Icn size={20}/></a>
                ))}
              </div>
           </div>
           <div className="space-y-6">
              <h4 className="font-black text-sm uppercase tracking-widest text-[#bf953f]">الروابط</h4>
              <ul className="space-y-4 text-gray-500 font-bold text-sm">
                 <li><button onClick={() => navigateTo('about')} className="hover:text-white transition">من نحن</button></li>
                 <li><button onClick={() => navigateTo('bots')} className="hover:text-white transition">البوتات</button></li>
                 <li><button onClick={() => navigateTo('results')} className="hover:text-white transition">النتائج</button></li>
                 <li><button onClick={() => navigateTo('subscribe')} className="hover:text-white transition">الاشتراكات</button></li>
              </ul>
           </div>
           <div className="space-y-6">
              <h4 className="font-black text-sm uppercase tracking-widest text-[#bf953f]">الدعم</h4>
              <ul className="space-y-4 text-gray-500 font-bold text-sm">
                 <li><button onClick={() => navigateTo('contact')} className="hover:text-white transition">تواصل معنا</button></li>
                 <li><button onClick={() => navigateTo('faqs')} className="hover:text-white transition">الأسئلة الشائعة</button></li>
                 <li><button onClick={() => navigateTo('terms')} className="hover:text-white transition">الشروط</button></li>
              </ul>
           </div>
        </div>
        <div className={`mt-24 pt-10 border-t border-[#bf953f]/10 text-center text-[10px] font-black uppercase tracking-[0.5em] ${goldTextClass}`}>
          © 2026 CR7 TRADING SYSTEMS VIP - ALL RIGHTS RESERVED
        </div>
      </footer>

      {/* --- Login Modal الفاخر --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowLoginModal(false)}></div>
          <div className="bg-[#0a0a0a] border border-[#bf953f]/40 w-full max-w-md rounded-[45px] p-12 relative z-10 text-center shadow-3xl">
            <h2 className={`text-3xl font-black mb-10 uppercase ${goldTextClass}`}>دخول النخبة</h2>
            <button onClick={handleGoogleLogin} className={`w-full flex items-center justify-center gap-4 py-5 rounded-2xl text-xl ${goldBtnClass}`}>
              <Icons.Google size={24} /> المتابعة بحساب Google
            </button>
            <p className="text-[10px] text-gray-600 font-bold mt-10 uppercase tracking-widest">بتسجيل الدخول أنت توافق على الشروط والأحكام</p>
          </div>
        </div>
      )}

    </div>
  );
}
