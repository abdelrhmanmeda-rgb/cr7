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
// تعريف Interfaces لحل مشاكل TypeScript
// ==========================================
interface IconProps {
  size?: number;
  className?: string;
  fill?: string;
}

interface Bot {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  accuracy: string;
  price: string;
  imageUrl: string;
  features: string[];
  isBestSeller?: boolean | string;
}

interface Plan {
  id?: string;
  _id?: string;
  type: string;
  title: string;
  capital: string;
  fee: string;
  features: string[];
  isBestSeller?: boolean | string;
}

interface Result {
  id?: string;
  _id?: string;
  mediaType: string;
  mediaUrl: string;
  profitAmount: string | number;
  notes?: string;
  createdAt: string;
}

interface Activity {
  action: string;
  date: string;
}

interface Settings {
  contact: { telegram: string; whatsapp: string; email: string };
  faqs: { question: string; answer: string }[];
  terms: string;
  aboutUs: string;
  heroPhrases?: string[];
}

interface CommentData {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  text: string;
  date: string;
}

interface PostData {
  id?: string;
  _id?: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  likes?: string[]; 
  comments?: CommentData[];
}

// ==========================================
// أيقونات SVG مدمجة بالكامل
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
  AlertCircle: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>,
  RefreshCw: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>,
  ArrowUpRight: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>,
  Cpu: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="24" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  CheckCircle: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  CreditCard: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Check: ({ size = 20, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>,
  Info: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  HelpCircle: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  FileText: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Telegram: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13v8l4-5"/></svg>,
  Facebook: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  Instagram: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>,
  TikTok: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v11a4 4 0 1 1-4-4z"/></svg>,
  Google: ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
};

// ==========================================
// مكون الخلفية المتحركة الملكي (Luxury Gold)
// ==========================================
const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#030303]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a150a_0%,#030303_100%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-[#bf953f]/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-[#8B6E36]/10 rounded-full blur-[150px] animate-pulse"></div>
    </div>
  );
};

// ==========================================
// التطبيق الرئيسي للموقع (النسخة الكاملة)
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
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [userActivity, setUserActivity] = useState<Activity[]>([]);

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(0);
  const heroPhrases = settings.heroPhrases || ['يعمل لأجلك', 'يحقق أحلامك', 'يصنع ثروتك', 'يؤمن مستقبلك'];

  const launchDate = new Date('2024-01-01').getTime();
  const now = new Date().getTime();
  const daysPassed = Math.floor((now - launchDate) / (1000 * 60 * 60 * 24));
  const dynamicReturn = 284 + Math.floor(daysPassed * 0.5);
  const dynamicTrades = 1250 + Math.floor(daysPassed * 3);

  // --- Constants for Styled Classes ---
  const goldTextClass = "text-transparent bg-clip-text bg-gradient-to-b from-[#bf953f] via-[#fcf6ba] to-[#b38728] font-black";
  const goldCardClass = "bg-[#0a0a0a]/80 backdrop-blur-2xl border border-[#bf953f]/20 rounded-[40px] hover:border-[#bf953f]/60 transition-all duration-500 shadow-2xl";
  const goldBtnClass = "bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] text-black font-black transition-all hover:scale-105 active:scale-95 shadow-xl";

  // مراقبة حالة تسجيل الدخول
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      if (currentUser) {
        const savedActivity = JSON.parse(localStorage.getItem(`activity_${currentUser.uid}`) || "[]");
        setUserActivity(savedActivity);
      } else {
        setUserActivity([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLoginModal(false);
    } catch (error: any) {
      console.error("خطأ في تسجيل الدخول:", error);
      alert('حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentPage('home');
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
    }
  };

  const trackUserAction = async (actionType: string, itemName?: string, price?: string | number) => {
    try {
      await fetch('https://cr7-kappa.vercel.app/api/statistics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType, itemName, price: price ? String(price).replace(/[^0-9.]/g, '') : 0 })
      });
    } catch (e) {
      console.log('Tracking error', e);
    }
  };

  useEffect(() => { trackUserAction('visit'); }, []);

  const trackActivity = useCallback((pageName: string) => {
    if (!user) return;
    const pageLabels: Record<string, string> = {
      'home': 'الرئيسية', 'about': 'من نحن', 'bots': 'البوتات', 
      'results': 'النتائج', 'subscribe': 'الاشتراكات والإدارة',
      'contact': 'تواصل معنا', 'faqs': 'الأسئلة الشائعة', 'terms': 'الشروط والأحكام', 'profile': 'الملف الشخصي', 'blog': 'المدونة'
    };
    const newActivity: Activity = {
      action: `قام بزيارة قسم ${pageLabels[pageName] || pageName}`,
      date: new Date().toISOString()
    };
    setUserActivity((prev) => {
      const updated = [newActivity, ...prev].slice(0, 20);
      try { localStorage.setItem(`activity_${user.uid}`, JSON.stringify(updated)); } catch(e) {}
      return updated;
    });
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % heroPhrases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [heroPhrases.length]);

  useEffect(() => {
    document.title = "CR7 BOT VIP";
    const favicon = document.createElement('link');
    favicon.rel = 'icon'; favicon.type = 'image/jpeg';
    favicon.href = "https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg";
    document.head.appendChild(favicon);

    const hideNextStyle = document.createElement('style');
    hideNextStyle.innerHTML = `
      nextjs-portal, #nextjs-build-indicator, [data-nextjs-toast] { display: none !important; }
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #bf953f50; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #bf953f; }
    `;
    document.head.appendChild(hideNextStyle);
  }, []);

  const fetchResults = useCallback(async (retries = 5, delay = 1000) => {
    try {
      const response = await fetch('https://cr7-kappa.vercel.app/api/results');
      if (!response.ok) throw new Error('فشل الاتصال بالسيرفر');
      const data = await response.json();
      if (data.success) { setResults(data.data); setError(null); }
    } catch (err: any) {
      if (retries > 0) setTimeout(() => fetchResults(retries - 1, delay * 2), delay);
      else setError('لا يمكن الاتصال بالسيرفر حالياً.');
    } finally { if (retries === 5) setLoading(false); }
  }, []);

  const fetchBots = useCallback(async () => {
    try {
      const r = await fetch('https://cr7-kappa.vercel.app/api/bots');
      const d = await r.json();
      if (d.success) setBots(d.data);
    } catch (e) {}
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const r = await fetch('https://cr7-kappa.vercel.app/api/subscriptions');
      const d = await r.json();
      if (d.success) setPlans(d.data);
    } catch (e) {}
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const r = await fetch('https://cr7-kappa.vercel.app/api/settings');
      const d = await r.json();
      if (d.success) setSettings(d.data);
    } catch (e) {}
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const r = await fetch('https://cr7-kappa.vercel.app/api/blog');
      const d = await r.json();
      if (d.success) setPosts(d.data);
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchResults(); fetchBots(); fetchPlans(); fetchSettings(); fetchPosts();
  }, [fetchResults, fetchBots, fetchPlans, fetchSettings, fetchPosts]);

  const handleLike = async (postId: string) => {
    if (!user) { setShowLoginModal(true); return; }
    setPosts(prev => prev.map(post => {
      const id = post.id || post._id;
      if (id === postId) {
        const likes = post.likes || [];
        const hasLiked = likes.includes(user.uid);
        return { ...post, likes: hasLiked ? likes.filter(uid => uid !== user.uid) : [...likes, user.uid] };
      }
      return post;
    }));
    try {
      await fetch(`https://cr7-kappa.vercel.app/api/blog/${postId}/like`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      trackUserAction('like_post', postId);
    } catch (e) {}
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !commentText.trim()) return;
    const newComment = {
      id: Date.now().toString(), userId: user.uid,
      userName: user.displayName || 'مستخدم',
      userImage: user.photoURL || '', text: commentText, date: new Date().toISOString()
    };
    setPosts(prev => prev.map(post => {
      if ((post.id || post._id) === postId) return { ...post, comments: [...(post.comments || []), newComment] };
      return post;
    }));
    setCommentText('');
    try {
      await fetch(`https://cr7-kappa.vercel.app/api/blog/${postId}/comment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment)
      });
      trackUserAction('comment_post', postId);
    } catch (e) {}
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackActivity(page); 
  };

  const handleBotPurchaseClick = (bot: Bot) => {
    trackUserAction('buy_bot', bot.name, bot.price);
    const text = `مرحباً، أود شراء بوت التداول بالكامل:%0A%0A🤖 البوت: ${bot.name}%0A💰 السعر: $${bot.price}`;
    window.open(`https://t.me/CR7bot0?text=${text}`, '_blank');
  };

  const handlePlanClick = (type: string, title: string, capital: string, fee: string) => {
    const action = type === 'الإدارة' ? 'management' : 'subscribe';
    trackUserAction(action, title, fee);
    const text = `مرحباً، أود الانضمام لقسم (${type}):%0A%0A📌 التفاصيل: ${title}`;
    window.open(`https://t.me/CR7BOT01?text=${text}`, '_blank');
  };

  const subscriptionPlans = plans.filter(p => p.type === 'الاشتراكات');
  const managementPlans = plans.filter(p => p.type === 'الإدارة');

  return (
    <div className="min-h-screen text-white selection:bg-[#bf953f]/30 font-sans overflow-x-hidden flex flex-col relative bg-[#030303]" dir="rtl">
      
      <BackgroundAnimation />

      {/* --- الهيدر الفخم --- */}
      <nav className="sticky top-0 z-50 backdrop-blur-3xl border-b border-[#bf953f]/20 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
          
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigateTo('home')}>
            <div className="w-12 h-12 bg-[#bf953f]/10 rounded-2xl flex items-center justify-center border border-[#bf953f]/30 overflow-hidden shadow-inner">
                <img src="https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl uppercase tracking-tighter leading-none ${goldTextClass}`}>CR7 VIP</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Smart Gold Trading</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 xl:gap-10 text-sm font-bold">
            <button onClick={() => navigateTo('home')} className={`transition-colors ${currentPage === 'home' ? 'text-[#bf953f]' : 'text-gray-400 hover:text-white'}`}>الرئيسية</button>
            <button onClick={() => navigateTo('about')} className={`transition-colors ${currentPage === 'about' ? 'text-[#bf953f]' : 'text-gray-400 hover:text-white'}`}>من نحن</button>
            <button onClick={() => navigateTo('bots')} className={`transition-colors ${currentPage === 'bots' ? 'text-[#bf953f]' : 'text-gray-400 hover:text-white'}`}>البوتات</button>
            <button onClick={() => navigateTo('results')} className={`transition-colors ${currentPage === 'results' ? 'text-[#bf953f]' : 'text-gray-400 hover:text-white'}`}>النتائج</button>
            <button onClick={() => navigateTo('subscribe')} className={`transition-colors ${currentPage === 'subscribe' ? 'text-[#bf953f]' : 'text-gray-400 hover:text-white'}`}>الاشتراكات والإدارة</button>
            <button onClick={() => navigateTo('blog')} className={`transition-colors ${currentPage === 'blog' ? 'text-[#bf953f]' : 'text-gray-400 hover:text-white'}`}>المدونة</button>
            
            <div className="h-6 w-[1px] bg-[#bf953f]/20"></div>
            
            <a href="https://t.me/CR7_B3" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#bf953f]/10 text-[#fcf6ba] border border-[#bf953f]/30 px-5 py-2.5 rounded-full font-bold hover:bg-[#bf953f] hover:text-black transition-all">
              <Icons.Telegram size={18} /> مجتمعنا
            </a>

            {user ? (
              <button onClick={() => navigateTo('profile')} className="flex items-center gap-2 bg-white/5 border border-[#bf953f]/30 px-5 py-2.5 rounded-full font-bold transition-all shadow-xl">
                <img src={user.photoURL || ""} alt={user.displayName || "User"} className="w-7 h-7 rounded-full border border-[#bf953f]/50" />
                <span className="truncate max-w-[100px]">{user.displayName?.split(' ')[0]}</span>
              </button>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className={`px-6 xl:px-8 py-2.5 rounded-full ${goldBtnClass}`}>
                دخول
              </button>
            )}
          </div>

          <button className="lg:hidden p-3 bg-[#bf953f]/10 rounded-xl border border-[#bf953f]/30 text-[#bf953f]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#05070a]/95 backdrop-blur-3xl border-b border-[#bf953f]/30 p-8 flex flex-col gap-6 animate-in slide-in-from-top-4">
            <button onClick={() => navigateTo('home')} className="text-xl font-bold flex items-center gap-4 flex-row-reverse text-gray-400 hover:text-[#bf953f]"><Icons.Zap size={20}/> الرئيسية</button>
            <button onClick={() => navigateTo('about')} className="text-xl font-bold flex items-center gap-4 flex-row-reverse text-gray-400 hover:text-[#bf953f]"><Icons.Info size={20}/> من نحن</button>
            <button onClick={() => navigateTo('bots')} className="text-xl font-bold flex items-center gap-4 flex-row-reverse text-gray-400 hover:text-[#bf953f]"><Icons.Cpu size={20}/> البوتات</button>
            <button onClick={() => navigateTo('results')} className="text-xl font-bold flex items-center gap-4 flex-row-reverse text-gray-400 hover:text-[#bf953f]"><Icons.BarChart3 size={20}/> النتائج المباشرة</button>
            <button onClick={() => navigateTo('subscribe')} className="text-xl font-bold flex items-center gap-4 flex-row-reverse text-gray-400 hover:text-[#bf953f]"><Icons.ShieldCheck size={20}/> الاشتراكات والإدارة</button>
            <button onClick={() => navigateTo('blog')} className="text-xl font-bold flex items-center gap-4 flex-row-reverse text-gray-400 hover:text-[#bf953f]"><Icons.BookOpen size={20}/> المدونة</button>
          </div>
        )}
      </nav>

      <main className="flex-grow relative z-10">

        {/* 1. الرئيسية */}
        {currentPage === 'home' && (
          <section className="relative pt-12 md:pt-24 pb-32 px-4 md:px-8 animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-10 lg:gap-16">
              
              <div className="text-center lg:text-right space-y-8 flex flex-col items-center lg:items-start w-full">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#bf953f]/10 border border-[#bf953f]/20 text-[#fcf6ba] text-xs font-black uppercase tracking-widest">
                  خوارزمية تداول الذهب الأكثر دقة
                </div>
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-[1.1] tracking-tight w-full">
                  اجعل التداول <br className="hidden md:block"/>
                  <span key={currentPhraseIndex} className={`block mt-4 animate-pulse ${goldTextClass}`}>
                    {heroPhrases[currentPhraseIndex]}
                  </span>
                </h1>
                <p className="text-lg md:text-2xl text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0 font-bold">
                  نظام تداول آلي بالكامل صُمم ليكون الأقوى في سوق الفوركس والذهب. دقة تتخطى 94%، إدارة مخاطر ذكية.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4 w-full sm:w-auto">
                  <button onClick={() => navigateTo('subscribe')} className={`w-full sm:w-auto px-10 py-5 rounded-2xl text-lg md:text-xl ${goldBtnClass}`}>
                    ابدأ الآن <Icons.ChevronRight size={24} className="inline-block mr-2" />
                  </button>
                  <button onClick={() => navigateTo('results')} className="w-full sm:w-auto border border-[#bf953f]/30 bg-white/5 text-white px-10 py-5 rounded-2xl font-black text-lg md:text-xl transition-all">
                    شاهد النتائج
                  </button>
                </div>

                <div className="pt-2 flex justify-center lg:justify-start w-full">
                  <a href="https://t.me/CR7_B3" target="_blank" rel="noreferrer" className="group relative flex items-center gap-5 bg-gradient-to-r from-[#bf953f]/20 to-black/40 border border-[#bf953f]/30 p-2 pr-2 pl-6 rounded-full transition-all duration-300 active:scale-95 w-full sm:w-auto">
                      <div className="w-12 h-12 bg-[#bf953f] rounded-full flex items-center justify-center text-black shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Icons.Telegram size={24} />
                      </div>
                      <div className="flex flex-col text-right py-1">
                        <span className="text-white font-black text-sm uppercase tracking-widest leading-none">انضم لقناتنا المفتوحة</span>
                        <span className="text-[#bf953f]/80 text-xs font-bold mt-1.5">توصيات وتحليلات ذهبية مجانية يومياً</span>
                      </div>
                  </a>
                </div>
              </div>

              <div className={`relative group mt-12 lg:mt-0 w-full max-w-lg mx-auto lg:max-w-none ${goldCardClass} p-8 md:p-12`}>
                   <div className="flex justify-between items-center mb-8 md:mb-10">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1 text-right">Live Profit Tracking</span>
                        <span className={`text-xl md:text-2xl italic ${goldTextClass} text-right`}>CR7 GOLD ALGO</span>
                      </div>
                      <Icons.TrendingUp size={24} className="text-[#bf953f]" />
                   </div>
                   <div className="space-y-8">
                      <div className="h-32 md:h-40 border-b border-[#bf953f]/10 relative rounded-2xl overflow-hidden flex items-end gap-1.5 px-4">
                        {[30,50,45,85,60,95,70,100,80,105,90,110].map((h, i) => (
                          <div key={i} style={{height: `${h}%`}} className="flex-1 bg-gradient-to-t from-[#8B6E36] to-[#fcf6ba] rounded-t-lg transition-all hover:scale-y-110 opacity-80 hover:opacity-100"></div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="p-4 md:p-6 rounded-3xl bg-black/40 border border-[#bf953f]/10">
                          <p className="text-[10px] text-gray-500 mb-2 font-black uppercase text-center">إجمالي العائد</p>
                          <p className={`text-2xl md:text-4xl text-center tracking-tighter ${goldTextClass}`}>+{dynamicReturn}%</p>
                        </div>
                        <div className="p-4 md:p-6 rounded-3xl bg-black/40 border border-[#bf953f]/10">
                          <p className="text-[10px] text-gray-500 mb-2 font-black uppercase text-center">عدد الصفقات</p>
                          <p className="text-2xl md:text-4xl font-black text-white tracking-tighter text-center">{dynamicTrades.toLocaleString()}</p>
                        </div>
                      </div>
                   </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. البوتات */}
        {currentPage === 'bots' && (
          <section className="py-20 px-4 md:px-8 animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-7xl mx-auto text-center mb-16 space-y-4">
              <h2 className={`text-4xl md:text-6xl uppercase ${goldTextClass}`}>البوتات والخوارزميات</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg font-bold">تعرف على منظومة الذكاء الاصطناعي التي تدير رأس مالك بأمان.</p>
            </div>
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bots.map((bot) => (
                <div key={bot.id || bot._id} className={`${goldCardClass} flex flex-col overflow-hidden group`}>
                  <div className="relative h-60 overflow-hidden">
                    <img src={bot.imageUrl} alt={bot.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                    {/* الأكثر مبيعاً للبوتات */}
                    {(bot.isBestSeller === 'true' || bot.isBestSeller === true) && (
                      <div className="absolute top-6 left-6 bg-[#bf953f] text-black px-4 py-1 rounded-full text-[10px] font-black uppercase shadow-xl">الأكثر مبيعاً 🔥</div>
                    )}
                    <div className="absolute top-6 right-6 bg-black/60 px-3 py-1 rounded-full text-xs font-bold text-[#fcf6ba] border border-[#bf953f]/30">دقة {bot.accuracy}</div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow text-right">
                    <h3 className="text-2xl font-black text-white mb-3">{bot.name}</h3>
                    <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed font-bold">{bot.description}</p>
                    <ul className="space-y-3 mb-8 flex-grow">
                      {bot.features?.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm font-bold text-gray-300 justify-start">
                          <Icons.CheckCircle className="text-[#bf953f]" size={16} /> {feat}
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between items-center mt-auto border-t border-[#bf953f]/10 pt-6">
                      <span className={`text-3xl ${goldTextClass}`}>${bot.price}</span>
                      <button onClick={() => handleBotPurchaseClick(bot)} className={`px-8 py-3 rounded-xl ${goldBtnClass}`}>شراء الآن</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. النتائج */}
        {currentPage === 'results' && (
          <section className="py-20 px-4 md:px-8 animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-7xl mx-auto flex justify-between items-end mb-20">
              <div className="text-right">
                <h2 className={`text-4xl md:text-6xl uppercase tracking-tight ${goldTextClass}`}>النتائج الموثقة</h2>
                <p className="text-gray-500 mt-4 text-lg font-bold">بكل شفافية.. شاهد أحدث الصفقات والأرباح الموثقة من السيرفر المباشر.</p>
              </div>
              <button onClick={() => fetchResults()} className="p-4 bg-[#bf953f]/10 rounded-2xl border border-[#bf953f]/30 text-[#fcf6ba] transition-all active:scale-95">
                 <Icons.RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {results.map((res) => (
                <div key={res.id || res._id} className={`${goldCardClass} overflow-hidden`}>
                   <div className="h-80 overflow-hidden bg-black">
                     {res.mediaType === 'video' ? <video src={res.mediaUrl} className="w-full h-full object-cover" controls /> : <img src={res.mediaUrl} className="w-full h-full object-cover" alt="Result" />}
                   </div>
                   <div className="p-10 flex justify-between items-center flex-row-reverse">
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">ربح اليوم الصافي</p>
                        <p className="text-4xl font-black text-green-400 tracking-tighter">+${res.profitAmount}</p>
                      </div>
                      <div className="bg-[#bf953f]/10 p-3 rounded-2xl border border-[#bf953f]/30 text-[#fcf6ba]"><Icons.ArrowUpRight size={32}/></div>
                   </div>
                   <div className="px-10 pb-10 text-right"><p className="text-gray-500 text-sm font-bold italic leading-relaxed">{res.notes || 'تم تحقيق الهدف المالي لليوم بنجاح.'}</p></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. الاشتراكات والإدارة */}
        {currentPage === 'subscribe' && (
          <section className="py-20 px-4 md:px-8 animate-in zoom-in-95 duration-700">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20 space-y-4">
                <h2 className={`text-4xl md:text-6xl uppercase ${goldTextClass}`}>الاشتراكات والإدارة</h2>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg font-bold">اختر بين باقات الاشتراك الشهري أو نظام إدارة المحافظ بالكامل.</p>
              </div>
              
              <div className="mb-32">
                <h3 className={`text-3xl mb-10 flex items-center gap-4 text-right justify-start flex-row-reverse ${goldTextClass}`}><Icons.CreditCard size={36} /> باقات الاشتراك الشهري</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.id || plan._id} className={`${goldCardClass} p-10 relative transition-all hover:scale-[1.02]`}>
                      {/* الأكثر طلباً للاشتراكات */}
                      {(plan.isBestSeller === 'true' || plan.isBestSeller === true) && (
                        <div className="absolute -top-4 left-10 bg-[#bf953f] text-black px-6 py-1 rounded-full text-[10px] font-black uppercase shadow-xl">الأكثر طلباً 🔥</div>
                      )}
                      <h4 className="text-3xl font-black text-white mb-6 text-right">{plan.title}</h4>
                      <p className={`text-5xl mb-10 text-right ${goldTextClass}`}>{plan.fee}</p>
                      <ul className="space-y-4 mb-10 text-right">
                        <li className="flex items-center gap-3 text-gray-300 font-bold justify-start"><Icons.Check size={20} className="text-[#bf953f]"/> رأس المال: {plan.capital}</li>
                        {plan.features?.map((f, i) => <li key={i} className="flex items-center gap-3 text-gray-400 font-bold justify-start"><Icons.Check size={20} className="text-white/20"/> {f}</li>)}
                      </ul>
                      <button onClick={() => handlePlanClick('الاشتراكات', plan.title, plan.capital, plan.fee)} className={`w-full py-5 rounded-2xl text-xl ${goldBtnClass}`}>اشترك الآن</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className={`text-3xl mb-10 flex items-center gap-4 text-right justify-start flex-row-reverse ${goldTextClass}`}><Icons.BarChart3 size={36} /> نظام إدارة المحافظ</h3>
                {managementPlans.map((plan) => (
                  <div key={plan.id || plan._id} className={`${goldCardClass} p-12 flex flex-col md:flex-row items-center gap-12 text-right`}>
                     <div className="flex-1 space-y-6">
                        <h4 className="text-4xl font-black text-white">{plan.title}</h4>
                        <p className="text-gray-400 text-lg leading-relaxed font-bold">{plan.features?.join('. ')}</p>
                        <div className="flex gap-6 justify-end">
                           <div className="bg-white/5 px-6 py-4 rounded-2xl border border-[#bf953f]/20 text-center">
                             <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-widest">أقل رأس مال</p>
                             <p className={`text-xl ${goldTextClass}`}>{plan.capital}</p>
                           </div>
                           <div className="bg-white/5 px-6 py-4 rounded-2xl border border-[#bf953f]/20 text-center">
                             <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-widest">الرسوم</p>
                             <p className={`text-xl ${goldTextClass}`}>{plan.fee}</p>
                           </div>
                        </div>
                     </div>
                     <button onClick={() => handlePlanClick('الإدارة', plan.title, plan.capital, plan.fee)} className={`px-12 py-6 rounded-[25px] text-2xl ${goldBtnClass}`}>ابدأ الإدارة الآن 🚀</button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5. من نحن */}
        {currentPage === 'about' && (
          <section className="py-20 px-4 md:px-8 min-h-[70vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-4xl mx-auto text-center">
              <Icons.Info size={64} className="mx-auto text-[#bf953f] mb-8" />
              <h2 className={`text-4xl md:text-6xl font-black mb-10 tracking-tight uppercase ${goldTextClass}`}>من نحن</h2>
              <div className={`${goldCardClass} p-10 md:p-14 shadow-2xl leading-relaxed text-gray-300 text-lg md:text-xl whitespace-pre-wrap text-right font-bold`}>
                {settings.aboutUs || 'جاري تحميل المعلومات...'}
              </div>
            </div>
          </section>
        )}

        {/* 6. تواصل معنا */}
        {currentPage === 'contact' && (
          <section className="py-20 px-4 md:px-8 min-h-[70vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-4xl mx-auto text-center">
              <Icons.Phone size={64} className="mx-auto text-[#bf953f] mb-8" />
              <h2 className={`text-4xl md:text-6xl font-black mb-14 tracking-tight uppercase ${goldTextClass}`}>تواصل معنا</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <a href={settings.contact.telegram || 'https://t.me/CR7_B3'} target="_blank" rel="noreferrer" className={`${goldCardClass} p-10 hover:scale-105 flex flex-col items-center gap-4`}>
                  <div className="w-16 h-16 bg-[#bf953f]/10 rounded-full flex items-center justify-center text-[#bf953f]"><Icons.Telegram size={32}/></div>
                  <h3 className="font-bold text-xl text-white">تليجرام</h3>
                  <p className="text-sm text-gray-500 font-bold">تواصل مباشر وسريع</p>
                </a>
                <a href={`https://wa.me/${settings.contact.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className={`${goldCardClass} p-10 hover:scale-105 flex flex-col items-center gap-4 border-green-500/20`}>
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-400"><Icons.Phone size={32}/></div>
                  <h3 className="font-bold text-xl text-white">واتساب</h3>
                  <p className="text-sm text-gray-500 font-bold">دعم فني واستفسارات</p>
                </a>
                <a href={`mailto:${settings.contact.email}`} className={`${goldCardClass} p-10 hover:scale-105 flex flex-col items-center gap-4`}>
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white"><Icons.FileText size={32}/></div>
                  <h3 className="font-bold text-xl text-white">إيميل</h3>
                  <p className="text-sm text-gray-500 font-bold">للشراكات والاستفسارات</p>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* 7. الأسئلة الشائعة */}
        {currentPage === 'faqs' && (
          <section className="py-20 px-4 md:px-8 min-h-[70vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <Icons.HelpCircle size={64} className="mx-auto text-[#bf953f] mb-8" />
                <h2 className={`text-4xl md:text-6xl font-black mb-6 tracking-tight uppercase ${goldTextClass}`}>الأسئلة الشائعة</h2>
              </div>
              <div className="space-y-6">
                {settings.faqs?.map((faq, idx) => (
                  <div key={idx} className={`${goldCardClass} p-8 shadow-xl text-right`}>
                    <h3 className={`text-xl font-black mb-4 flex items-start gap-4 flex-row-reverse ${goldTextClass}`}>
                      <Icons.HelpCircle size={24} className="shrink-0 mt-1" /> {faq.question}
                    </h3>
                    <p className="text-gray-400 leading-relaxed pr-10 font-bold">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 8. الشروط والأحكام */}
        {currentPage === 'terms' && (
          <section className="py-20 px-4 md:px-8 min-h-[70vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-4xl mx-auto text-center">
              <Icons.FileText size={64} className="mx-auto text-[#bf953f] mb-8" />
              <h2 className={`text-4xl md:text-6xl font-black mb-10 tracking-tight uppercase ${goldTextClass}`}>الشروط والأحكام</h2>
              <div className={`${goldCardClass} p-10 md:p-14 shadow-2xl leading-relaxed text-gray-300 text-lg whitespace-pre-wrap text-right font-bold`}>
                {settings.terms || 'جاري تحميل المعلومات...'}
              </div>
            </div>
          </section>
        )}

        {/* 9. الملف الشخصي */}
        {currentPage === 'profile' && user && (
          <section className="py-20 px-4 md:px-8 min-h-[70vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-5xl mx-auto space-y-12">
              <div className={`${goldCardClass} p-10 flex flex-col md:flex-row items-center gap-8 shadow-3xl text-right`}>
                <img src={user.photoURL || ""} alt="User" className="w-32 h-32 rounded-full border-4 border-[#bf953f]/30 shadow-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#bf953f]/10 text-[#fcf6ba] text-xs font-black uppercase tracking-widest mb-2 border border-[#bf953f]/30">حساب موثق VIP</div>
                  <h2 className="text-4xl font-black text-white">{user.displayName}</h2>
                  <p className="text-gray-500 font-bold">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-black transition-all border border-red-500/20">
                  <Icons.LogOut size={20} /> تسجيل الخروج
                </button>
              </div>

              <div className={`${goldCardClass} p-10 shadow-2xl text-right`}>
                <div className="flex items-center gap-4 mb-10 border-b border-[#bf953f]/10 pb-6 flex-row-reverse">
                  <Icons.BarChart3 size={32} className="text-[#bf953f]" />
                  <h3 className={`text-2xl font-black uppercase tracking-tighter ${goldTextClass}`}>سجل النشاط الحديث</h3>
                </div>
                <div className="space-y-4">
                  {userActivity.length > 0 ? userActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#bf953f]/40 transition-all flex-row-reverse">
                      <p className="text-gray-200 font-bold text-right">{activity.action}</p>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">{new Date(activity.date).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                  )) : <p className="text-center py-10 text-gray-600 font-black">لا يوجد نشاط مسجل.</p>}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 10. المدونة (الكاملة بكل تفاصيلها) */}
        {currentPage === 'blog' && (
          <section className="py-20 px-4 md:px-8 min-h-[80vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-3xl mx-auto space-y-12">
              <div className="text-center mb-20 space-y-4">
                <h2 className={`text-4xl md:text-6xl font-black uppercase ${goldTextClass}`}>مدونة النخبة</h2>
                <p className="text-gray-500 font-bold">أحدث الأخبار والتوصيات من مجتمع CR7 VIP.</p>
              </div>
              
              <div className="space-y-16">
                {posts.map((post) => {
                  const pid = post.id || post._id || '';
                  const isExp = expandedPostId === pid;
                  return (
                    <div key={pid} className={`${goldCardClass} overflow-hidden shadow-3xl`}>
                      <div className="p-8 flex items-center gap-4 border-b border-[#bf953f]/10 flex-row-reverse text-right">
                         <img src="https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg" className="w-12 h-12 rounded-full border border-[#bf953f]/40" alt="Admin" />
                         <div className="text-right">
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
                         <button onClick={() => handleLike(pid)} className={`flex items-center gap-2 hover:text-red-500 transition-all ${user && post.likes?.includes(user.uid) ? 'text-red-500' : ''}`}><Icons.Heart size={24} fill={user && post.likes?.includes(user.uid) ? "currentColor" : "none"}/> {post.likes?.length || 0}</button>
                         <button onClick={() => setExpandedPostId(isExp ? null : pid)} className="flex items-center gap-2 hover:text-[#bf953f] transition-all"><Icons.MessageCircle size={24}/> {post.comments?.length || 0}</button>
                      </div>

                      {isExp && (
                        <div className="p-8 bg-black/40 space-y-8 animate-in slide-in-from-top-4 duration-300">
                           <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
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
                                <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="أضف تعليقاً..." className="flex-1 bg-white/5 border border-[#bf953f]/20 rounded-xl px-6 py-3 outline-none focus:border-[#bf953f] transition-all text-right text-sm" />
                                <button onClick={() => handleAddComment(pid)} className={`px-8 rounded-xl ${goldBtnClass}`}>إرسال</button>
                             </div>
                           ) : <p className="text-center text-gray-500 font-bold text-xs">سجل دخولك لتتمكن من التعليق.</p>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* --- Footer الفاخر --- */}
      <footer className="py-24 px-4 border-t border-[#bf953f]/20 bg-black mt-auto relative z-10 text-right">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-5 space-y-8">
            <h3 className={`text-3xl italic uppercase tracking-tighter ${goldTextClass}`}>CR7 PLATINUM GOLD</h3>
            <p className="text-gray-500 text-lg leading-relaxed max-w-sm font-bold">شريكك الذكي في رحلتك المالية وتداول الذهب بنجاح تام عبر أقوى خوارزميات الذكاء الاصطناعي.</p>
            <div className="flex gap-4 justify-start">
               {[Icons.Telegram, Icons.Facebook, Icons.Instagram, Icons.TikTok].map((Icn, i) => (
                 <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-[#bf953f]/20 flex items-center justify-center text-[#bf953f] hover:bg-[#bf953f] hover:text-black transition-all"><Icn size={20}/></a>
               ))}
            </div>
          </div>
          <div className="md:col-span-2 space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest text-[#bf953f]">الروابط</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li><button onClick={() => navigateTo('about')} className="hover:text-white transition">من نحن</button></li>
              <li><button onClick={() => navigateTo('bots')} className="hover:text-white transition">البوتات</button></li>
              <li><button onClick={() => navigateTo('results')} className="hover:text-white transition">النتائج</button></li>
              <li><button onClick={() => navigateTo('subscribe')} className="hover:text-white transition">الاشتراكات</button></li>
            </ul>
          </div>
          <div className="md:col-span-2 space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest text-[#bf953f]">الدعم</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li><button onClick={() => navigateTo('contact')} className="hover:text-white transition">تواصل معنا</button></li>
              <li><button onClick={() => navigateTo('faqs')} className="hover:text-white transition">الأسئلة الشائعة</button></li>
              <li><button onClick={() => navigateTo('terms')} className="hover:text-white transition">الشروط</button></li>
            </ul>
          </div>
          <div className="md:col-span-3 space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest text-[#bf953f]">النشرة الإخبارية</h4>
            <div className="flex gap-2 flex-row-reverse">
              <input type="text" placeholder="بريدك الإلكتروني" className="bg-white/5 border border-[#bf953f]/20 rounded-xl px-4 py-3 text-sm flex-1 outline-none focus:border-[#bf953f] text-right" />
              <button className={`px-5 rounded-xl ${goldBtnClass}`}>✓</button>
            </div>
          </div>
        </div>
        <div className={`mt-24 pt-10 border-t border-[#bf953f]/10 text-center text-[10px] font-black uppercase tracking-[0.5em] ${goldTextClass}`}>
          © 2026 CR7 TRADING SYSTEMS VIP - جميع الحقوق محفوظة
        </div>
      </footer>

      {/* --- Login Modal --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowLoginModal(false)}></div>
          <div className="bg-[#0a0a0a] border border-[#bf953f]/40 w-full max-w-md rounded-[45px] p-12 relative z-10 text-center shadow-[0_0_50px_rgba(191,149,63,0.2)]">
            <h2 className={`text-3xl font-black mb-8 uppercase ${goldTextClass}`}>دخول النخبة</h2>
            <button onClick={handleGoogleLogin} className={`w-full flex items-center justify-center gap-4 py-5 rounded-2xl text-xl ${goldBtnClass}`}>
              <Icons.Google size={24} /> المتابعة بحساب Google
            </button>
            <p className="text-[10px] text-gray-500 font-bold mt-10 uppercase tracking-widest">بتسجيل الدخول أنت توافق على <button onClick={() => navigateTo('terms')} className="text-[#bf953f] underline">الشروط والأحكام</button></p>
          </div>
        </div>
      )}

    </div>
  );
}
