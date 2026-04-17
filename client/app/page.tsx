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

// ✨ الأنواع الخاصة بالمدونة والتعليقات
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
  Menu: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  X: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  TrendingUp: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  ShieldCheck: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>,
  Zap: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m13 2-2 10h3l-2 10 2-10h-3z"/></svg>,
  BarChart3: ({ className = "", size = 24, fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
  BookOpen: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>,
  Heart: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  MessageCircle: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
  ChevronRight: ({ className = "", size = 24, fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>,
  Globe: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/><path d="M2 12h20"/></svg>,
  AlertCircle: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>,
  RefreshCw: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>,
  ArrowUpRight: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>,
  Cpu: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="24" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  CheckCircle: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  CreditCard: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Check: ({ size = 20, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>,
  Info: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Star: ({ size = 20, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Telegram: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13v8l4-5"/></svg>,
  Facebook: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  Instagram: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>,
  TikTok: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v11a4 4 0 1 1-4-4z"/></svg>,
  Phone: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  HelpCircle: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  FileText: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  User: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  LogOut: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Google: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill={fill}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
};

// ==========================================
// مكون الخلفية المتحركة الملكي (Luxury Gold)
// ==========================================
const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020408]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-[#C5A059]/5 rounded-full blur-[120px] animate-[pulse_6s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-[#8B6E36]/10 rounded-full blur-[150px] animate-[pulse_8s_ease-in-out_infinite_alternate]"></div>
      <div className="absolute inset-0 opacity-20 flex items-center justify-center mix-blend-screen">
        <style>{`@keyframes drawLine { 0% { stroke-dashoffset: 2000; } 100% { stroke-dashoffset: 0; } }`}</style>
        <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M-100,600 C100,500 200,700 350,450 C500,200 650,550 800,300 C950,50 1100,350 1300,150" fill="none" stroke="url(#goldGradient)" strokeWidth="3" strokeDasharray="2000" style={{ animation: 'drawLine 20s linear infinite' }} />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B6E36" stopOpacity="0" />
              <stop offset="50%" stopColor="#C5A059" stopOpacity="1" />
              <stop offset="100%" stopColor="#8B6E36" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

// ==========================================
// التطبيق الرئيسي للموقع
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
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #C5A05950; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C5A059; }
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
    <div className="min-h-screen text-white selection:bg-[#C5A059]/30 font-sans overflow-x-hidden flex flex-col relative" dir="rtl">
      
      <BackgroundAnimation />

      {/* --- الهيدر الفخم --- */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl border-b border-[#C5A059]/10 bg-[#020408]/60">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
          
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigateTo('home')}>
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-[#C5A059]/20 overflow-hidden">
               <img src="https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black uppercase tracking-tighter leading-none">CR7 <span className="text-[#C5A059]">VIP</span></span>
              <span className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest mt-1">Smart Gold Trading</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 xl:gap-10 text-sm font-bold">
            <button onClick={() => navigateTo('home')} className={`transition-colors ${currentPage === 'home' ? 'text-[#C5A059]' : 'text-gray-400 hover:text-white'}`}>الرئيسية</button>
            <button onClick={() => navigateTo('about')} className={`transition-colors ${currentPage === 'about' ? 'text-[#C5A059]' : 'text-gray-400 hover:text-white'}`}>من نحن</button>
            <button onClick={() => navigateTo('bots')} className={`transition-colors ${currentPage === 'bots' ? 'text-[#C5A059]' : 'text-gray-400 hover:text-white'}`}>البوتات</button>
            <button onClick={() => navigateTo('results')} className={`transition-colors ${currentPage === 'results' ? 'text-[#C5A059]' : 'text-gray-400 hover:text-white'}`}>النتائج</button>
            <button onClick={() => navigateTo('subscribe')} className={`transition-colors ${currentPage === 'subscribe' ? 'text-[#C5A059]' : 'text-gray-400 hover:text-white'}`}>الاشتراكات والإدارة</button>
            <button onClick={() => navigateTo('blog')} className={`transition-colors ${currentPage === 'blog' ? 'text-[#C5A059]' : 'text-gray-400 hover:text-white'}`}>المدونة</button>
            
            <div className="h-6 w-[1px] bg-white/10"></div>
            
            <a href="https://t.me/CR7_B3" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-5 py-2.5 rounded-full font-bold hover:bg-[#C5A059] hover:text-black transition-all">
              <Icons.Telegram size={18} /> مجتمعنا
            </a>

            {user ? (
              <button onClick={() => navigateTo('profile')} className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full font-bold transition-all shadow-xl">
                <img src={user.photoURL || ""} alt={user.displayName || "User"} className="w-7 h-7 rounded-full" />
                <span className="truncate max-w-[100px]">{user.displayName?.split(' ')[0]}</span>
              </button>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="bg-white text-black hover:bg-[#C5A059] px-6 xl:px-8 py-2.5 rounded-full font-black transition-all">
                دخول
              </button>
            )}
          </div>

          <button className="lg:hidden p-3 bg-white/5 rounded-xl border border-white/10" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#05070a]/95 backdrop-blur-3xl border-b border-[#C5A059]/20 p-8 flex flex-col gap-6 animate-in slide-in-from-top-4">
            <button onClick={() => navigateTo('home')} className="text-xl font-bold flex items-center gap-4 text-gray-400 hover:text-[#C5A059]"><Icons.Zap size={20}/> الرئيسية</button>
            <button onClick={() => navigateTo('about')} className="text-xl font-bold flex items-center gap-4 text-gray-400 hover:text-[#C5A059]"><Icons.Info size={20}/> من نحن</button>
            <button onClick={() => navigateTo('bots')} className="text-xl font-bold flex items-center gap-4 text-gray-400 hover:text-[#C5A059]"><Icons.Cpu size={20}/> البوتات</button>
            <button onClick={() => navigateTo('results')} className="text-xl font-bold flex items-center gap-4 text-gray-400 hover:text-[#C5A059]"><Icons.BarChart3 size={20}/> النتائج المباشرة</button>
            <button onClick={() => navigateTo('subscribe')} className="text-xl font-bold flex items-center gap-4 text-gray-400 hover:text-[#C5A059]"><Icons.ShieldCheck size={20}/> الاشتراكات والإدارة</button>
            <button onClick={() => navigateTo('blog')} className="text-xl font-bold flex items-center gap-4 text-gray-400 hover:text-[#C5A059]"><Icons.BookOpen size={20}/> المدونة</button>
          </div>
        )}
      </nav>

      <main className="flex-grow relative z-10">

        {/* 1. الرئيسية */}
        {currentPage === 'home' && (
          <section className="relative pt-12 md:pt-24 pb-32 px-4 md:px-8 animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-10 lg:gap-16">
              
              <div className="text-center lg:text-right space-y-8 flex flex-col items-center lg:items-start w-full">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059] text-xs font-black uppercase tracking-widest">
                  خوارزمية تداول الذهب الأكثر دقة
                </div>
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-[1.1] tracking-tight w-full">
                  اجعل التداول <br className="hidden md:block"/>
                  <span key={currentPhraseIndex} className="block text-transparent bg-clip-text bg-gradient-to-l from-[#8B6E36] via-[#C5A059] to-[#F3D193] transition-opacity duration-500 animate-pulse">
                    {heroPhrases[currentPhraseIndex]}
                  </span>
                </h1>
                <p className="text-lg md:text-2xl text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  نظام تداول آلي بالكامل صُمم ليكون الأقوى في سوق الفوركس والذهب. دقة تتخطى 94%، إدارة مخاطر ذكية.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4 w-full sm:w-auto">
                  <button onClick={() => navigateTo('subscribe')} className="w-full sm:w-auto bg-[#C5A059] text-black px-10 py-5 rounded-2xl font-black text-lg md:text-xl hover:bg-white transition-all shadow-xl shadow-[#C5A059]/20">
                    ابدأ الآن <Icons.ChevronRight size={24} className="inline-block mr-2" />
                  </button>
                  <button onClick={() => navigateTo('results')} className="w-full sm:w-auto border border-white/10 bg-white/5 text-white px-10 py-5 rounded-2xl font-black text-lg md:text-xl transition-all">
                    شاهد النتائج
                  </button>
                </div>

                <div className="pt-2 flex justify-center lg:justify-start w-full">
                  <a href="https://t.me/CR7_B3" target="_blank" rel="noreferrer" className="group relative flex items-center gap-5 bg-gradient-to-r from-[#C5A059]/20 to-black/40 border border-[#C5A059]/30 p-2 pr-2 pl-6 rounded-full transition-all duration-300 active:scale-95 w-full sm:w-auto">
                     <div className="w-12 h-12 bg-[#C5A059] rounded-full flex items-center justify-center text-black shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Icons.Telegram size={24} />
                     </div>
                     <div className="flex flex-col text-right py-1">
                        <span className="text-white font-black text-sm uppercase tracking-widest leading-none">انضم لقناتنا المفتوحة</span>
                        <span className="text-[#C5A059]/80 text-xs font-bold mt-1.5">توصيات وتحليلات ذهبية مجانية يومياً</span>
                     </div>
                  </a>
                </div>
              </div>

              <div className="relative group mt-12 lg:mt-0 w-full max-w-lg mx-auto lg:max-w-none">
                <div className="absolute -inset-1 bg-[#C5A059]/20 rounded-[45px] blur-2xl opacity-40"></div>
                <div className="relative border border-[#C5A059]/30 bg-[#080a0f]/90 backdrop-blur-3xl rounded-[40px] p-8 md:p-12 shadow-3xl">
                   <div className="flex justify-between items-center mb-8 md:mb-10">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1 text-right">Live Profit Tracking</span>
                        <span className="text-xl md:text-2xl font-black italic text-[#C5A059] text-right">CR7 GOLD ALGO</span>
                      </div>
                      <Icons.TrendingUp size={24} className="text-[#C5A059]" />
                   </div>
                   <div className="space-y-8">
                      <div className="h-32 md:h-40 border-b border-[#C5A059]/10 relative rounded-2xl overflow-hidden flex items-end gap-1.5 px-4">
                        {[30,50,45,85,60,95,70,100,80,105,90,110].map((h, i) => (
                          <div key={i} style={{height: `${h}%`}} className="flex-1 bg-gradient-to-t from-[#8B6E36] to-[#C5A059]/60 rounded-t-lg transition-all hover:scale-y-110"></div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="p-4 md:p-6 rounded-3xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-gray-500 mb-2 font-black uppercase">إجمالي العائد</p>
                          <p className="text-2xl md:text-4xl font-black text-[#C5A059] tracking-tighter">+{dynamicReturn}%</p>
                        </div>
                        <div className="p-4 md:p-6 rounded-3xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-gray-500 mb-2 font-black uppercase">عدد الصفقات</p>
                          <p className="text-2xl md:text-4xl font-black text-white tracking-tighter">{dynamicTrades.toLocaleString()}</p>
                        </div>
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
              <h2 className="text-4xl md:text-6xl font-black uppercase">البوتات <span className="text-[#C5A059]">والخوارزميات</span></h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">تعرف على منظومة الذكاء الاصطناعي التي تدير رأس مالك بأمان.</p>
            </div>
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bots.map((bot) => (
                <div key={bot.id || bot._id} className="group flex flex-col bg-[#161617] border border-white/5 rounded-[40px] overflow-hidden hover:border-[#C5A059]/50 transition-all shadow-2xl">
                  <div className="relative h-60 overflow-hidden">
                    <img src={bot.imageUrl} alt={bot.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute top-6 right-6 bg-black/60 px-3 py-1 rounded-full text-xs font-bold text-[#C5A059] border border-[#C5A059]/30">دقة {bot.accuracy}</div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-black text-white mb-3">{bot.name}</h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-3">{bot.description}</p>
                    <ul className="space-y-3 mb-8 flex-grow">
                      {bot.features?.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                          <Icons.CheckCircle className="text-[#C5A059]" size={16} /> {feat}
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-6">
                      <span className="text-3xl font-black text-[#C5A059]">${bot.price}</span>
                      <button onClick={() => handleBotPurchaseClick(bot)} className="bg-white text-black px-8 py-3 rounded-xl font-black hover:bg-[#C5A059] transition-all">شراء الآن</button>
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
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">النتائج <span className="text-[#C5A059]">الموثقة</span></h2>
                <p className="text-gray-500 mt-4 text-lg">بكل شفافية.. شاهد أحدث الصفقات والأرباح الموثقة من السيرفر المباشر.</p>
              </div>
              <button onClick={() => fetchResults()} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-[#C5A059] transition-all active:scale-95">
                 <Icons.RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {results.map((res) => (
                <div key={res.id || res._id} className="bg-[#161617] border border-white/5 rounded-[45px] overflow-hidden shadow-2xl hover:border-[#C5A059]/30 transition-all">
                   <div className="h-80 overflow-hidden bg-black">
                     {res.mediaType === 'video' ? <video src={res.mediaUrl} className="w-full h-full object-cover" controls /> : <img src={res.mediaUrl} className="w-full h-full object-cover" alt="Result" />}
                   </div>
                   <div className="p-10 flex justify-between items-center">
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">ربح اليوم الصافي</p>
                        <p className="text-4xl font-black text-green-400 tracking-tighter">+${res.profitAmount}</p>
                      </div>
                      <div className="bg-[#C5A059]/10 p-3 rounded-2xl border border-[#C5A059]/20 text-[#C5A059]"><Icons.ArrowUpRight size={32}/></div>
                   </div>
                   <div className="px-10 pb-10 text-right"><p className="text-gray-500 text-sm font-bold italic">{res.notes || 'تم تحقيق الهدف المالي لليوم بنجاح.'}</p></div>
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
                <h2 className="text-4xl md:text-6xl font-black uppercase text-white">الاشتراكات <span className="text-[#C5A059]">والإدارة</span></h2>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg">اختر بين باقات الاشتراك الشهري أو نظام إدارة المحافظ بالكامل.</p>
              </div>
              
              <div className="mb-32">
                <h3 className="text-3xl font-black text-white mb-10 flex items-center gap-4 text-right justify-start"><Icons.CreditCard size={36} className="text-[#C5A059]"/> باقات الاشتراك الشهري</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.id || plan._id} className="bg-[#161617] border border-[#C5A059]/20 rounded-[40px] p-10 shadow-2xl relative transition-all hover:scale-[1.02]">
                      {(plan.isBestSeller === 'true' || plan.isBestSeller === true) && <div className="absolute -top-4 left-10 bg-[#C5A059] text-black px-6 py-1 rounded-full text-xs font-black uppercase">الأكثر طلباً</div>}
                      <h4 className="text-3xl font-black text-white mb-6 text-right">{plan.title}</h4>
                      <p className="text-5xl font-black text-[#C5A059] mb-10 text-right">{plan.fee}</p>
                      <ul className="space-y-4 mb-10 text-right">
                        <li className="flex items-center gap-3 text-gray-300 font-bold"><Icons.Check size={20} className="text-[#C5A059]"/> رأس المال: {plan.capital}</li>
                        {plan.features?.map((f, i) => <li key={i} className="flex items-center gap-3 text-gray-400 font-bold"><Icons.Check size={20} className="text-white/20"/> {f}</li>)}
                      </ul>
                      <button onClick={() => handlePlanClick('الاشتراكات', plan.title, plan.capital, plan.fee)} className="w-full bg-[#C5A059] text-black py-5 rounded-2xl font-black text-xl shadow-lg shadow-[#C5A059]/20 hover:bg-white transition-all">اشترك الآن</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black text-white mb-10 flex items-center gap-4 text-right justify-start"><Icons.BarChart3 size={36} className="text-[#C5A059]"/> نظام إدارة المحافظ</h3>
                {managementPlans.map((plan) => (
                  <div key={plan.id || plan._id} className="bg-[#161617] border border-white/5 p-12 rounded-[50px] flex flex-col md:flex-row items-center gap-12 hover:border-[#C5A059]/30 transition-all shadow-3xl">
                     <div className="flex-1 space-y-6 text-right">
                        <h4 className="text-4xl font-black text-white">{plan.title}</h4>
                        <p className="text-gray-400 text-lg leading-relaxed">{plan.features?.join('. ')}</p>
                        <div className="flex gap-6 justify-start">
                           <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
                             <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-widest">أقل رأس مال</p>
                             <p className="text-xl font-black text-[#C5A059]">{plan.capital}</p>
                           </div>
                           <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
                             <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-widest">الرسوم</p>
                             <p className="text-xl font-black text-[#C5A059]">{plan.fee}</p>
                           </div>
                        </div>
                     </div>
                     <button onClick={() => handlePlanClick('الإدارة', plan.title, plan.capital, plan.fee)} className="bg-white text-black px-12 py-6 rounded-[25px] font-black text-2xl hover:bg-[#C5A059] transition-all shadow-2xl">ابدأ الإدارة الآن 🚀</button>
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
              <Icons.Info size={64} className="mx-auto text-[#C5A059] mb-8" />
              <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tight text-white uppercase">من <span className="text-[#C5A059]">نحن</span></h2>
              <div className="bg-[#161617] p-10 md:p-14 rounded-[50px] border border-[#C5A059]/20 shadow-2xl leading-relaxed text-gray-300 text-lg md:text-xl whitespace-pre-wrap text-right">
                {settings.aboutUs || 'جاري تحميل المعلومات...'}
              </div>
            </div>
          </section>
        )}

        {/* 6. تواصل معنا */}
        {currentPage === 'contact' && (
          <section className="py-20 px-4 md:px-8 min-h-[70vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-4xl mx-auto text-center">
              <Icons.Phone size={64} className="mx-auto text-[#C5A059] mb-8" />
              <h2 className="text-4xl md:text-6xl font-black mb-14 tracking-tight text-white uppercase">تواصل <span className="text-[#C5A059]">معنا</span></h2>
              <div className="grid md:grid-cols-3 gap-8">
                <a href={settings.contact.telegram || 'https://t.me/CR7_B3'} target="_blank" rel="noreferrer" className="bg-[#161617] p-10 rounded-[40px] border border-white/5 hover:border-[#C5A059] transition-all flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-[#C5A059]/10 rounded-full flex items-center justify-center text-[#C5A059]"><Icons.Telegram size={32}/></div>
                  <h3 className="font-bold text-xl text-white">تليجرام</h3>
                  <p className="text-sm text-gray-500 font-bold">تواصل مباشر وسريع</p>
                </a>
                <a href={`https://wa.me/${settings.contact.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="bg-[#161617] p-10 rounded-[40px] border border-white/5 hover:border-green-500 transition-all flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-400"><Icons.Phone size={32}/></div>
                  <h3 className="font-bold text-xl text-white">واتساب</h3>
                  <p className="text-sm text-gray-500 font-bold">دعم فني واستفسارات</p>
                </a>
                <a href={`mailto:${settings.contact.email}`} className="bg-[#161617] p-10 rounded-[40px] border border-white/5 hover:border-[#C5A059] transition-all flex flex-col items-center gap-4">
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
                <Icons.HelpCircle size={64} className="mx-auto text-[#C5A059] mb-8" />
                <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white uppercase">الأسئلة <span className="text-[#C5A059]">الشائعة</span></h2>
              </div>
              <div className="space-y-6">
                {settings.faqs?.map((faq, idx) => (
                  <div key={idx} className="bg-[#161617] p-8 rounded-[35px] border border-white/5 hover:border-[#C5A059]/30 transition-all shadow-xl text-right">
                    <h3 className="text-xl font-black text-[#C5A059] mb-4 flex items-start gap-4 flex-row-reverse">
                      <Icons.HelpCircle size={24} className="shrink-0 mt-1" /> {faq.question}
                    </h3>
                    <p className="text-gray-400 leading-relaxed pr-10">{faq.answer}</p>
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
              <Icons.FileText size={64} className="mx-auto text-[#C5A059] mb-8" />
              <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tight text-white uppercase">الشروط <span className="text-[#C5A059]">والأحكام</span></h2>
              <div className="bg-[#161617] p-10 md:p-14 rounded-[50px] border border-white/5 shadow-2xl leading-relaxed text-gray-300 text-lg whitespace-pre-wrap text-right">
                {settings.terms || 'جاري تحميل المعلومات...'}
              </div>
            </div>
          </section>
        )}

        {/* 9. الملف الشخصي */}
        {currentPage === 'profile' && user && (
          <section className="py-20 px-4 md:px-8 min-h-[70vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="bg-[#161617] border border-[#C5A059]/30 rounded-[45px] p-10 flex flex-col md:flex-row items-center gap-8 shadow-3xl text-right">
                <img src={user.photoURL || ""} alt="User" className="w-32 h-32 rounded-full border-4 border-[#C5A059]/30 shadow-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-xs font-black uppercase tracking-widest mb-2">حساب موثق</div>
                  <h2 className="text-4xl font-black text-white">{user.displayName}</h2>
                  <p className="text-gray-500 font-bold">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-black transition-all border border-red-500/20">
                  <Icons.LogOut size={20} /> تسجيل الخروج
                </button>
              </div>

              <div className="bg-[#161617] border border-white/5 rounded-[45px] p-10 shadow-2xl text-right">
                <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6 flex-row-reverse">
                  <Icons.BarChart3 size={32} className="text-[#C5A059]" />
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">سجل النشاط الحديث</h3>
                </div>
                <div className="space-y-4">
                  {userActivity.length > 0 ? userActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#C5A059]/30 transition-all flex-row-reverse">
                      <p className="text-gray-200 font-bold text-right">{activity.action}</p>
                      <p className="text-xs text-gray-500 font-bold uppercase">{new Date(activity.date).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                  )) : <p className="text-center py-10 text-gray-600 font-black">لا يوجد نشاط مسجل.</p>}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 10. المدونة (الكاملة) */}
        {currentPage === 'blog' && (
          <section className="py-20 px-4 md:px-8 min-h-[80vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-3xl mx-auto space-y-12">
              <div className="text-center mb-20 space-y-4">
                <h2 className="text-4xl md:text-6xl font-black uppercase text-white">مدونة <span className="text-[#C5A059]">النخبة</span></h2>
                <p className="text-gray-500">أحدث الأخبار والتوصيات من مجتمع CR7.</p>
              </div>
              
              <div className="space-y-16">
                {posts.map((post) => {
                  const pid = post.id || post._id || '';
                  const isExp = expandedPostId === pid;
                  return (
                    <div key={pid} className="bg-[#161617] border border-[#C5A059]/20 rounded-[40px] overflow-hidden shadow-3xl">
                      <div className="p-8 flex items-center gap-4 border-b border-white/5 flex-row-reverse">
                         <img src="https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg" className="w-12 h-12 rounded-full border border-[#C5A059]/40" alt="Admin" />
                         <div className="text-right">
                           <h4 className="font-black text-white">مدير CR7 <Icons.CheckCircle className="inline text-[#C5A059]" size={14}/></h4>
                           <p className="text-xs text-gray-500 font-bold">{new Date(post.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })}</p>
                         </div>
                      </div>
                      <div className="p-10 space-y-6 text-right">
                        <h3 className="text-3xl font-black text-white">{post.title}</h3>
                        <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      </div>
                      {post.imageUrl && <img src={post.imageUrl} className="w-full border-y border-white/5" alt="Blog" />}
                      <div className="p-6 flex gap-10 text-gray-400 font-bold border-t border-white/5 flex-row-reverse">
                         <button onClick={() => handleLike(pid)} className={`flex items-center gap-2 hover:text-red-500 transition-all ${user && post.likes?.includes(user.uid) ? 'text-red-500' : ''}`}><Icons.Heart size={24} fill={user && post.likes?.includes(user.uid) ? "currentColor" : "none"}/> {post.likes?.length || 0}</button>
                         <button onClick={() => setExpandedPostId(isExp ? null : pid)} className="flex items-center gap-2 hover:text-[#C5A059] transition-all"><Icons.MessageCircle size={24}/> {post.comments?.length || 0}</button>
                      </div>

                      {isExp && (
                        <div className="p-8 bg-black/40 space-y-8 animate-in slide-in-from-top-4 duration-300">
                           <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pl-4">
                             {post.comments?.map((c, i) => (
                               <div key={i} className="flex gap-4 flex-row-reverse text-right">
                                 <img src={c.userImage || "https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg"} className="w-10 h-10 rounded-full" />
                                 <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none flex-1">
                                   <p className="font-black text-[#C5A059] text-sm mb-1">{c.userName}</p>
                                   <p className="text-gray-300 text-sm">{c.text}</p>
                                 </div>
                               </div>
                             ))}
                           </div>
                           {user ? (
                             <div className="flex gap-4 pt-4 border-t border-white/5 flex-row-reverse">
                                <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="أضف تعليقاً..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-3 outline-none focus:border-[#C5A059] transition-all text-right" />
                                <button onClick={() => handleAddComment(pid)} className="bg-[#C5A059] text-black px-8 rounded-xl font-black">إرسال</button>
                             </div>
                           ) : <p className="text-center text-gray-500 font-bold">سجل دخولك لتتمكن من التعليق.</p>}
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

      <footer className="py-24 px-4 border-t border-[#C5A059]/10 bg-[#020408] mt-auto relative z-10 text-right">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-5 space-y-8">
            <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">CR7 <span className="text-[#C5A059]">PLATINUM</span> GOLD</h3>
            <p className="text-gray-500 text-lg leading-relaxed max-w-sm">شريكك الذكي في رحلتك المالية وتداول الذهب بنجاح تام.</p>
            <div className="flex gap-4 justify-start">
               {[Icons.Telegram, Icons.Facebook, Icons.Instagram, Icons.TikTok].map((Icn, i) => (
                 <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#C5A059] hover:text-black transition-all"><Icn size={20}/></a>
               ))}
            </div>
          </div>
          <div className="md:col-span-2 space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest text-[#C5A059]">الروابط</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li><button onClick={() => navigateTo('about')} className="hover:text-white transition">من نحن</button></li>
              <li><button onClick={() => navigateTo('bots')} className="hover:text-white transition">البوتات</button></li>
              <li><button onClick={() => navigateTo('results')} className="hover:text-white transition">النتائج</button></li>
            </ul>
          </div>
          <div className="md:col-span-2 space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest text-[#C5A059]">الدعم</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li><button onClick={() => navigateTo('contact')} className="hover:text-white transition">تواصل معنا</button></li>
              <li><button onClick={() => navigateTo('faqs')} className="hover:text-white transition">الأسئلة الشائعة</button></li>
              <li><button onClick={() => navigateTo('terms')} className="hover:text-white transition">الشروط</button></li>
            </ul>
          </div>
          <div className="md:col-span-3 space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest text-[#C5A059]">النشرة الإخبارية</h4>
            <div className="flex gap-2 flex-row-reverse">
              <input type="text" placeholder="بريدك الإلكتروني" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm flex-1 outline-none focus:border-[#C5A059] text-right" />
              <button className="bg-[#C5A059] text-black px-5 rounded-xl font-bold transition-all">✓</button>
            </div>
          </div>
        </div>
        <div className="mt-24 pt-10 border-t border-white/5 text-center text-gray-700 text-[10px] font-black uppercase tracking-[0.5em]">
          © 2026 CR7 TRADING SYSTEMS VIP - جميع الحقوق محفوظة
        </div>
      </footer>

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLoginModal(false)}></div>
          <div className="bg-[#080a0f] border border-[#C5A059]/30 w-full max-w-md rounded-[45px] p-12 relative z-10 text-center shadow-3xl">
            <h2 className="text-3xl font-black mb-8 text-white uppercase">دخول <span className="text-[#C5A059]">النخبة</span></h2>
            <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-4 bg-white text-black py-5 rounded-2xl font-black text-xl transition-all hover:bg-[#C5A059] active:scale-95 shadow-xl">
              <Icons.Google size={24} /> المتابعة بحساب Google
            </button>
            <p className="text-[10px] text-gray-500 font-bold mt-10 uppercase tracking-widest">بتسجيل الدخول أنت توافق على <button onClick={() => navigateTo('terms')} className="text-[#C5A059] underline">الشروط والأحكام</button></p>
          </div>
        </div>
      )}

    </div>
  );
}
