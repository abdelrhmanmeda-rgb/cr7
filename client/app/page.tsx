'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA0wuxv9RL14sC1Jal8wWOxLSFC7A29uuc",
  authDomain: "cr7-bot.firebaseapp.com",
  projectId: "cr7-bot",
  storageBucket: "cr7-bot.firebasestorage.app",
  messagingSenderId: "201142155421",
  appId: "1:201142155421:web:b7dd8765afd27e62ac3c74"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

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
// مكون الخلفية المتحركة
// ==========================================
const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020408]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-blue-600/10 rounded-full blur-[120px] animate-[pulse_6s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[150px] animate-[pulse_8s_ease-in-out_infinite_alternate]"></div>
      <div className="absolute top-[40%] right-[30%] w-[20vw] h-[20vw] bg-blue-400/5 rounded-full blur-[100px] animate-[ping_12s_ease-in-out_infinite]"></div>
      <div className="absolute inset-0 opacity-20 flex items-center justify-center mix-blend-screen">
        <style>{`@keyframes drawLine { 0% { stroke-dashoffset: 2000; } 100% { stroke-dashoffset: 0; } }`}</style>
        <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M-100,600 C100,500 200,700 350,450 C500,200 650,550 800,300 C950,50 1100,350 1300,150" fill="none" stroke="url(#chartGradient)" strokeWidth="3" strokeDasharray="2000" style={{ animation: 'drawLine 15s linear infinite' }} />
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
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
  const [posts, setPosts] = useState<PostData[]>([]); // ✨ حالة المدونة
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null); // للتعليقات
  const [commentText, setCommentText] = useState('');
  const [settings, setSettings] = useState<Settings>({ contact: { telegram: '', whatsapp: '', email: '' }, faqs: [], terms: '', aboutUs: '' });
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- متغيرات وحالات المصادقة والملف الشخصي ---
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [userActivity, setUserActivity] = useState<Activity[]>([]);

  // --- متغيرات وحالات الإحصائيات والجمل المتحركة ---
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(0);
  const heroPhrases = settings.heroPhrases || ['يعمل لأجلك', 'يحقق أحلامك', 'يصنع ثروتك', 'يؤمن مستقبلك'];

  const launchDate = new Date('2024-01-01').getTime();
  const now = new Date().getTime();
  const daysPassed = Math.floor((now - launchDate) / (1000 * 60 * 60 * 24));
  const dynamicReturn = 284 + Math.floor(daysPassed * 0.5);
  const dynamicTrades = 1250 + Math.floor(daysPassed * 3);

  // مراقبة حالة تسجيل الدخول واسترجاع النشاط السابق
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
      if (error.code === 'auth/unauthorized-domain') {
        alert('هذا النطاق غير مصرح له بتسجيل الدخول. يرجى إضافته في إعدادات Firebase.');
      } else {
        alert('حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى.');
      }
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

  // ====================================================
  // ✨ دالة تتبع الإحصائيات (ترسل البيانات للسيرفر بصمت)
  // ====================================================
  const trackUserAction = async (actionType: string, itemName?: string, price?: string | number) => {
    try {
      await fetch('https://cr7-hnvjlq6lb-abdelrhmanmeda-rgbs-projects.vercel.app//api/statistics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType, itemName, price: price ? String(price).replace(/[^0-9.]/g, '') : 0 })
      });
    } catch (e) {
      console.log('Tracking error', e);
    }
  };

  // تسجيل زيارة جديدة للموقع بمجرد فتحه
  useEffect(() => { trackUserAction('visit'); }, []);
  // ====================================================

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
    document.title = "CR7 BOT";
    setTimeout(() => { document.title = "CR7 BOT"; }, 500);

    const existingIcons = document.querySelectorAll("link[rel*='icon']");
    existingIcons.forEach(icon => {
      if (icon.parentNode) icon.parentNode.removeChild(icon);
    });
    
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/jpeg';
    favicon.href = "https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg";
    document.head.appendChild(favicon);

    const hideNextStyle = document.createElement('style');
    hideNextStyle.innerHTML = `
      nextjs-portal, 
      #nextjs-build-indicator, 
      [data-nextjs-toast] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f650; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
    `;
    document.head.appendChild(hideNextStyle);
  }, []);

  const fetchResults = useCallback(async (retries = 5, delay = 1000) => {
    try {
      const response = await fetch('https://cr7-hnvjlq6lb-abdelrhmanmeda-rgbs-projects.vercel.app//api/results');
      if (!response.ok) throw new Error('فشل الاتصال بالسيرفر');
      const data = await response.json();
      if (data.success) {
        setResults(data.data);
        setError(null);
      }
    } catch (err: any) {
      if (retries > 0) setTimeout(() => fetchResults(retries - 1, delay * 2), delay);
      else setError('لا يمكن الاتصال بالسيرفر حالياً. تأكد من تشغيل الباك إند.');
    } finally {
      if (retries === 5) setLoading(false);
    }
  }, []);

  const fetchBots = useCallback(async (retries = 3, delay = 1000) => {
    try {
      const response = await fetch('https://cr7-hnvjlq6lb-abdelrhmanmeda-rgbs-projects.vercel.app//api/bots');
      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) setBots(data.data);
    } catch (err) {
      if (retries > 0) setTimeout(() => fetchBots(retries - 1, delay * 2), delay);
    }
  }, []);

  const fetchPlans = useCallback(async (retries = 3, delay = 1000) => {
    try {
      const response = await fetch('https://cr7-hnvjlq6lb-abdelrhmanmeda-rgbs-projects.vercel.app//api/subscriptions');
      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) setPlans(data.data);
    } catch (err) {
      if (retries > 0) setTimeout(() => fetchPlans(retries - 1, delay * 2), delay);
    }
  }, []);

  const fetchSettings = useCallback(async (retries = 3, delay = 1000) => {
    try {
      const response = await fetch('https://cr7-hnvjlq6lb-abdelrhmanmeda-rgbs-projects.vercel.app//api/settings');
      const data = await response.json();
      if (data.success && data.data) setSettings(data.data);
    } catch (err) {
      if (retries > 0) setTimeout(() => fetchSettings(retries - 1, delay * 2), delay);
    }
  }, []);

  // ✨ دالة جلب بوستات المدونة
  const fetchPosts = useCallback(async (retries = 3, delay = 1000) => {
    try {
      const response = await fetch('https://cr7-hnvjlq6lb-abdelrhmanmeda-rgbs-projects.vercel.app//api/blog');
      const data = await response.json();
      if (data.success && data.data) setPosts(data.data);
    } catch (err) {
      if (retries > 0) setTimeout(() => fetchPosts(retries - 1, delay * 2), delay);
    }
  }, []);

  useEffect(() => {
    fetchResults();
    fetchBots();
    fetchPlans();
    fetchSettings();
    fetchPosts(); // ✨ استدعاء البوستات
  }, [fetchResults, fetchBots, fetchPlans, fetchSettings, fetchPosts]);

  // ==========================================
  // ✨ دالة الإعجاب (Like) المحصنة ✨
  // ==========================================
  const handleLike = async (postId: string) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // التحديث الوهمي السريع
    setPosts(prevPosts => prevPosts.map(post => {
      const id = post.id || post._id;
      if (id === postId) {
        const likes = post.likes || [];
        const hasLiked = likes.includes(user.uid);
        return {
          ...post,
          likes: hasLiked ? likes.filter(uid => uid !== user.uid) : [...likes, user.uid]
        };
      }
      return post;
    }));

    try {
      const res = await fetch(`https://cr7-hnvjlq6lb-abdelrhmanmeda-rgbs-projects.vercel.app//api/blog/${postId}/like`, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ userId: user.uid }) 
      });
      
      // 🚨 قراءة الرد كنص أولاً لمنع انهيار الموقع
      const text = await res.text();
      try {
        const data = JSON.parse(text); // تحويل النص إلى JSON
        if (!data.success) {
           alert('خطأ من السيرفر: ' + data.message);
        } else {
           trackUserAction('like_post', postId);
        }
      } catch (parseError) {
        console.error("رد السيرفر غير متوقع (HTML):", text);
        alert("السيرفر لا يتعرف على مسار اللايك! تأكد من تحديث ملف blogRoutes.js وإعادة تشغيل السيرفر.");
      }
      
    } catch (e) {
      console.error("Fetch Error:", e);
      alert("تعذر الاتصال بالسيرفر. تأكد من تشغيله.");
    }
  };

  // ==========================================
  // ✨ دالة التعليق (Comment) المحصنة ✨
  // ==========================================
  const handleAddComment = async (postId: string) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      userId: user.uid,
      userName: user.displayName || 'مستخدم',
      userImage: user.photoURL || 'https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg',
      text: commentText,
      date: new Date().toISOString()
    };

    setPosts(prevPosts => prevPosts.map(post => {
      const id = post.id || post._id;
      if (id === postId) {
        return { ...post, comments: [...(post.comments || []), newComment] };
      }
      return post;
    }));
    setCommentText('');

    try {
      const res = await fetch(`https://cr7-hnvjlq6lb-abdelrhmanmeda-rgbs-projects.vercel.app//api/blog/${postId}/comment`, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(newComment) 
      });
      
      // 🚨 قراءة الرد كنص أولاً لمنع انهيار الموقع
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (!data.success) {
           alert('خطأ من السيرفر: ' + data.message);
        } else {
           trackUserAction('comment_post', postId);
        }
      } catch (parseError) {
        console.error("رد السيرفر غير متوقع (HTML):", text);
        alert("السيرفر لا يتعرف على مسار التعليقات! تأكد من تحديث ملف blogRoutes.js وإعادة تشغيل السيرفر.");
      }

    } catch (e) {
      console.error("Fetch Error:", e);
      alert("تعذر الاتصال بالسيرفر. تأكد من تشغيله.");
    }
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackActivity(page); 
  };

  const handleBotPurchaseClick = (bot: Bot) => {
    trackUserAction('buy_bot', bot.name, bot.price);
    const text = `مرحباً، أود شراء بوت التداول بالكامل:%0A%0A🤖 البوت: ${bot.name}%0A💰 السعر: $${bot.price}%0A🎯 الدقة: ${bot.accuracy}%0A%0Aأرجو تزويدي بتفاصيل ووسائل الدفع لاستلام البوت.`;
    window.open(`https://t.me/CR7bot0?text=${text}`, '_blank');
  };

  const handlePlanClick = (type: string, title: string, capital: string, fee: string) => {
    if (type === 'الإدارة') trackUserAction('management', title);
    else trackUserAction('subscribe', title, fee);

    const text = `مرحباً، أود الانضمام لقسم (${type}):%0A%0A📌 التفاصيل: ${title}%0A💰 رأس المال: ${capital}%0A💳 الرسوم/النسبة: ${fee}%0A%0Aأرجو تزويدي بخطوات البدء فوراً.`;
    window.open(`https://t.me/CR7BOT01?text=${text}`, '_blank');
  };

  const subscriptionPlans = plans.filter(p => p.type === 'الاشتراكات');
  const managementPlans = plans.filter(p => p.type === 'الإدارة');

  return (
    <div className="min-h-screen text-white selection:bg-blue-500/30 font-sans overflow-x-hidden flex flex-col relative" dir="rtl">
      
      <BackgroundAnimation />

      <nav className="sticky top-0 z-50 backdrop-blur-2xl border-b border-white/5 bg-[#020408]/60">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
          
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigateTo('home')}>
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden">
               <img src="https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black uppercase tracking-tighter leading-none">CR7 BOT</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Smart Trading</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 xl:gap-10 text-sm font-bold">
            <button onClick={() => navigateTo('home')} className={`transition-colors ${currentPage === 'home' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>الرئيسية</button>
            <button onClick={() => navigateTo('about')} className={`transition-colors ${currentPage === 'about' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>من نحن</button>
            <button onClick={() => navigateTo('bots')} className={`transition-colors ${currentPage === 'bots' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>البوتات</button>
            <button onClick={() => navigateTo('results')} className={`transition-colors ${currentPage === 'results' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>النتائج</button>
            <button onClick={() => navigateTo('subscribe')} className={`transition-colors ${currentPage === 'subscribe' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>الاشتراكات والإدارة</button>
            <button onClick={() => navigateTo('blog')} className={`transition-colors ${currentPage === 'blog' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>المدونة</button>
            
            <div className="h-6 w-[1px] bg-white/10"></div>
            
            {/* ✨ زر تليجرام في الهيدر (ديسكتوب) */}
            <a href="https://t.me/CR7_B3" target="_blank" rel="noreferrer" onClick={() => trackUserAction('telegram')} className="flex items-center gap-2 bg-[#0088cc]/10 text-[#0088cc] border border-[#0088cc]/20 px-5 py-2.5 rounded-full font-bold hover:bg-[#0088cc] hover:text-white transition-all shadow-[0_0_15px_rgba(0,136,204,0.15)] hover:shadow-[0_0_20px_rgba(0,136,204,0.3)]">
              <Icons.Telegram size={18} /> مجتمعنا
            </a>

            {user ? (
              <button onClick={() => navigateTo('profile')} className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-xl">
                <img src={user.photoURL || ""} alt={user.displayName || "User"} className="w-7 h-7 rounded-full" />
                <span className="truncate max-w-[100px]">{user.displayName?.split(' ')[0]}</span>
              </button>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="bg-white text-black hover:bg-blue-600 hover:text-white px-6 xl:px-8 py-2.5 xl:py-3 rounded-full font-black transition-all shadow-xl shadow-white/5 active:scale-95">
                دخول
              </button>
            )}
          </div>

          <button className="lg:hidden p-3 bg-white/5 rounded-xl border border-white/10 active:bg-white/10 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#05070a]/95 backdrop-blur-3xl border-b border-white/10 p-8 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
            <button onClick={() => navigateTo('home')} className={`text-xl font-bold flex items-center gap-4 ${currentPage === 'home' ? 'text-white' : 'text-gray-400'}`}><Icons.Zap size={20} className="text-blue-500"/> الرئيسية</button>
            <button onClick={() => navigateTo('about')} className={`text-xl font-bold flex items-center gap-4 ${currentPage === 'about' ? 'text-white' : 'text-gray-400'}`}><Icons.Info size={20} className="text-blue-500"/> من نحن</button>
            <button onClick={() => navigateTo('bots')} className={`text-xl font-bold flex items-center gap-4 ${currentPage === 'bots' ? 'text-white' : 'text-gray-400'}`}><Icons.Cpu size={20} className="text-blue-500"/> البوتات</button>
            <button onClick={() => navigateTo('results')} className={`text-xl font-bold flex items-center gap-4 ${currentPage === 'results' ? 'text-white' : 'text-gray-400'}`}><Icons.BarChart3 size={20} className="text-blue-500"/> النتائج المباشرة</button>
            <button onClick={() => navigateTo('subscribe')} className={`text-xl font-bold flex items-center gap-4 ${currentPage === 'subscribe' ? 'text-white' : 'text-gray-400'}`}><Icons.ShieldCheck size={20} className="text-blue-500"/> الاشتراكات والإدارة</button>
            <button onClick={() => navigateTo('blog')} className={`text-xl font-bold flex items-center gap-4 ${currentPage === 'blog' ? 'text-white' : 'text-gray-400'}`}><Icons.BookOpen size={20} className="text-blue-500"/> المدونة</button>
            
            {/* ✨ زر تليجرام في الموبايل */}
            <a href="https://t.me/CR7_B3" target="_blank" rel="noreferrer" onClick={() => trackUserAction('telegram')} className="flex items-center justify-center gap-3 bg-[#0088cc]/10 text-[#0088cc] border border-[#0088cc]/20 w-full py-4 rounded-2xl font-black text-lg hover:bg-[#0088cc] hover:text-white transition-all mt-2">
              <Icons.Telegram size={24} /> انضم لمجتمعنا على تليجرام
            </a>

            {user ? (
              <button onClick={() => navigateTo('profile')} className="bg-white/5 border border-white/10 w-full py-4 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-3 mt-2">
                <img src={user.photoURL || ""} alt="Profile" className="w-8 h-8 rounded-full" /> حسابي الشخصي
              </button>
            ) : (
              <button onClick={() => { setIsMenuOpen(false); setShowLoginModal(true); }} className="bg-blue-600 w-full py-5 rounded-2xl font-black text-xl text-white shadow-2xl shadow-blue-600/30 mt-2">تسجيل الدخول 🚀</button>
            )}
          </div>
        )}
      </nav>

      <main className="flex-grow relative z-10">

        {/* 1. الرئيسية */}
        {currentPage === 'home' && (
          <section className="relative pt-12 md:pt-24 pb-32 px-4 md:px-8 animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-10 lg:gap-16">
              
              <div className="text-center lg:text-right space-y-8 flex flex-col items-center lg:items-start w-full">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  خوارزمية تداول الجيل القادم
                </div>
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-[1.1] tracking-tight w-full">
                  اجعل المال <br className="hidden md:block"/>
                  <span key={currentPhraseIndex} className="block lg:inline-block mt-3 lg:mt-0 text-transparent bg-clip-text bg-gradient-to-l from-blue-400 via-indigo-500 to-blue-600 transition-opacity duration-500 animate-pulse">
                    {heroPhrases[currentPhraseIndex]}
                  </span>
                </h1>
                <p className="text-lg md:text-2xl text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  نظام تداول آلي بالكامل صُمم ليكون الأقوى في سوق الفوركس. دقة تتخطى 94%، إدارة مخاطر ذكية، ونمو مستمر لمحفظتك المالية.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4 w-full sm:w-auto">
                  <button onClick={() => navigateTo('subscribe')} className="w-full sm:w-auto bg-white text-black px-10 py-5 rounded-2xl font-black text-lg md:text-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-white/5">
                    الاشتراكات والإدارة <Icons.ChevronRight size={24} className="group-hover:translate-x-[-8px] transition-transform" />
                  </button>
                  <button onClick={() => navigateTo('results')} className="w-full sm:w-auto border border-white/10 bg-[#080a0f]/50 backdrop-blur-md hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-black text-lg md:text-xl transition-all">
                    شاهد النتائج
                  </button>
                </div>

                {/* ✨ زر تليجرام الفخم في الرئيسية */}
                <div className="pt-2 flex justify-center lg:justify-start w-full">
                  <a href="https://t.me/CR7_B3" target="_blank" rel="noreferrer" onClick={() => trackUserAction('telegram')} className="group relative flex items-center gap-5 bg-gradient-to-r from-[#0088cc]/80 to-[#005580]/80 backdrop-blur-md border border-[#0088cc]/50 p-2 pr-2 pl-6 rounded-full shadow-[0_0_30px_rgba(0,136,204,0.3)] hover:shadow-[0_0_40px_rgba(0,136,204,0.5)] hover:from-[#0088cc] hover:to-[#0077b5] transition-all duration-300 active:scale-95 w-full sm:w-auto">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#0088cc] shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Icons.Telegram size={24} />
                     </div>
                     <div className="flex flex-col text-right py-1">
                        <span className="text-white font-black text-sm uppercase tracking-widest leading-none">انضم لقناتنا المفتوحة</span>
                        <span className="text-blue-100/80 text-xs font-bold mt-1.5">توصيات وتحليلات مجانية يومياً</span>
                     </div>
                  </a>
                </div>

              </div>

              <div className="relative group mt-12 lg:mt-0 w-full max-w-lg mx-auto lg:max-w-none">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[45px] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative border border-white/10 bg-[#080a0f]/80 backdrop-blur-3xl rounded-[40px] p-8 md:p-12 shadow-3xl overflow-hidden">
                   <div className="flex justify-between items-center mb-8 md:mb-10">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Live Performance</span>
                        <span className="text-xl md:text-2xl font-black italic">تحليل مباشر</span>
                      </div>
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                        <Icons.TrendingUp size={24} className="text-blue-500" />
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="h-32 md:h-40 bg-blue-500/5 border-b border-blue-500/10 relative rounded-2xl overflow-hidden flex items-end gap-1 md:gap-1.5 px-2 md:px-4">
                        {[30,50,45,85,60,95,70,100,80,105,90,110].map((h, i) => (
                          <div key={i} style={{height: `${h}%`}} className="flex-1 bg-gradient-to-t from-blue-600/50 to-blue-400/10 rounded-t-lg transition-all hover:scale-y-110"></div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="p-4 md:p-6 rounded-3xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-gray-500 mb-1 md:mb-2 font-black uppercase">إجمالي العائد</p>
                          <p className="text-2xl md:text-4xl font-black text-green-400 tracking-tighter">+{dynamicReturn}%</p>
                        </div>
                        <div className="p-4 md:p-6 rounded-3xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-gray-500 mb-1 md:mb-2 font-black uppercase">عدد الصفقات</p>
                          <p className="text-2xl md:text-4xl font-black text-blue-400 tracking-tighter">{dynamicTrades.toLocaleString()}</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto mt-32 md:mt-40 space-y-24 md:space-y-32">
              {bots.filter((b: Bot) => b.isBestSeller === 'true' || b.isBestSeller === true).length > 0 && (
                <div>
                  <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-2">البوتات الأكثر مبيعاً 🔥</h2>
                      <p className="text-gray-400">الروبوتات التي يعتمد عليها كبار المتداولين.</p>
                    </div>
                    <button onClick={() => navigateTo('bots')} className="text-blue-400 hover:text-white font-bold hidden md:block transition-colors">عرض كل البوتات &larr;</button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bots.filter((b: Bot) => b.isBestSeller === 'true' || b.isBestSeller === true).slice(0, 3).map((bot: Bot) => (
                      <div key={bot.id || bot._id} className="group flex flex-col relative bg-[#080a0f]/80 backdrop-blur-xl border border-blue-500 shadow-blue-500/20 rounded-[40px] overflow-hidden hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
                        <div className="absolute top-6 left-6 z-30 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg flex items-center gap-1">
                          <Icons.Star fill="currentColor" size={12} /> الأكثر مبيعاً
                        </div>
                        <div className="relative h-48 overflow-hidden shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-transparent to-transparent z-10"></div>
                          <img src={bot.imageUrl} alt={bot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                        </div>
                        <div className="p-8 flex flex-col flex-grow relative z-20 -mt-10">
                          <h3 className="text-xl font-black mb-2 bg-gradient-to-l from-white to-gray-400 bg-clip-text text-transparent">{bot.name}</h3>
                          <div className="flex items-baseline gap-2 mb-6"><span className="text-3xl font-black text-white">${bot.price}</span><span className="text-gray-500 font-bold text-sm">/ شهرياً</span></div>
                          <button onClick={() => handleBotPurchaseClick(bot)} className="w-full bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-600 text-white px-6 py-4 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 mt-auto">
                            شراء الآن <Icons.ChevronRight size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigateTo('bots')} className="text-blue-400 font-bold block md:hidden mt-6 text-center w-full">عرض كل البوتات &larr;</button>
                </div>
              )}

              {subscriptionPlans.filter((p: Plan) => p.isBestSeller === 'true' || p.isBestSeller === true).length > 0 && (
                <div>
                  <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-2">أفضل باقات الاشتراك 🌟</h2>
                      <p className="text-gray-400">أكثر الباقات طلباً لتحقيق دخل مستمر.</p>
                    </div>
                    <button onClick={() => navigateTo('subscribe')} className="text-indigo-400 hover:text-white font-bold hidden md:block transition-colors">عرض كل الباقات &larr;</button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    {subscriptionPlans.filter((p: Plan) => p.isBestSeller === 'true' || p.isBestSeller === true).slice(0, 2).map((plan: Plan) => (
                      <div key={plan.id || plan._id} className="relative flex flex-col bg-[#080a0f]/90 backdrop-blur-xl rounded-[40px] p-8 md:p-10 border-2 border-blue-500 shadow-2xl shadow-blue-600/20">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg">الأكثر طلباً</div>
                        <div className="mb-8"><h4 className="text-2xl font-black mb-2 text-white">{plan.title}</h4></div>
                        <div className="mb-8 flex items-baseline gap-2"><span className="text-5xl font-black text-white">{plan.fee.replace(/[^\d$]/g, '') || plan.fee}</span><span className="text-gray-500 font-bold">/ شهرياً</span></div>
                        <div className="mt-auto">
                          <button onClick={() => handlePlanClick('الاشتراكات', plan.title, plan.capital, plan.fee)} className="w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30">
                            اشترك الآن <Icons.Zap size={22} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigateTo('subscribe')} className="text-indigo-400 font-bold block md:hidden mt-6 text-center w-full">عرض كل الباقات &larr;</button>
                </div>
              )}

              {results.length > 0 && (
                <div>
                  <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-2">أحدث النتائج 📊</h2>
                      <p className="text-gray-400">شاهد أرباح اليوم الموثقة من السيرفر المباشر.</p>
                    </div>
                    <button onClick={() => navigateTo('results')} className="text-green-400 hover:text-white font-bold hidden md:block transition-colors">عرض سجل النتائج &larr;</button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {results.slice(0, 3).map((res: Result) => (
                      <div key={res.id || res._id} className="group bg-[#080a0f]/80 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden hover:border-blue-500/40 transition-all duration-700 shadow-2xl">
                        <div className="relative h-60 overflow-hidden">
                          {res.mediaType === 'video' ? (
                            <video src={res.mediaUrl} className="w-full h-full object-cover" muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                          ) : (
                            <img src={res.mediaUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Result" />
                          )}
                        </div>
                        <div className="p-8">
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                               <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">صافي الربح اليوم</p>
                               <p className="text-3xl font-black text-green-400 tracking-tighter">+${res.profitAmount}</p>
                            </div>
                            <Icons.ArrowUpRight className="text-green-500" size={32} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigateTo('results')} className="text-green-400 font-bold block md:hidden mt-6 text-center w-full">عرض سجل النتائج &larr;</button>
                </div>
              )}

              {/* ✨ اختصار المدونة في الصفحة الرئيسية ✨ */}
              {posts.length > 0 && (
                <div>
                  <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-2">أحدث المقالات والأخبار 📝</h2>
                      <p className="text-gray-400">تابع أحدث التحديثات والتوصيات من مجتمعنا.</p>
                    </div>
                    <button onClick={() => navigateTo('blog')} className="text-blue-400 hover:text-white font-bold hidden md:block transition-colors">عرض المدونة &larr;</button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    {posts.slice(0, 2).map((post) => (
                      <div key={post.id || post._id} onClick={() => navigateTo('blog')} className="group flex flex-col bg-[#080a0f]/80 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden hover:border-blue-500/40 transition-all duration-700 shadow-2xl cursor-pointer">
                        {post.imageUrl && (
                          <div className="relative h-48 overflow-hidden shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-transparent to-transparent z-10"></div>
                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                          </div>
                        )}
                        <div className="p-8 flex flex-col flex-grow relative z-20 mt-auto">
                          <p className="text-xs text-gray-500 font-bold mb-3">{new Date(post.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })}</p>
                          <h3 className="text-xl font-black mb-3 text-white group-hover:text-blue-400 transition-colors line-clamp-2">{post.title}</h3>
                          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6">{post.content}</p>
                          <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center text-sm font-bold text-gray-400">
                             <span className="flex items-center gap-2"><Icons.Heart size={16} /> {post.likes?.length || 0}</span>
                             <span className="flex items-center gap-2 text-blue-400 group-hover:translate-x-[-5px] transition-transform">قراءة المزيد <Icons.ChevronRight size={16} /></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigateTo('blog')} className="text-blue-400 font-bold block md:hidden mt-6 text-center w-full">عرض المدونة &larr;</button>
                </div>
              )}

            </div>
          </section>
        )}

        {/* 2. البوتات */}
        {currentPage === 'bots' && (
          <section className="py-20 px-4 md:px-8 bg-black/20 min-h-[70vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-7xl mx-auto text-center mb-16 space-y-4">
              <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-4 border border-blue-500/20">
                <Icons.Cpu className="text-blue-500" size={32} />
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">البوتات والخوارزميات</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">تعرف على منظومة الذكاء الاصطناعي التي تدير رأس مالك بأمان.</p>
            </div>

            <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bots.map((bot: Bot) => {
                const isVIP = bot.isBestSeller === 'true' || bot.isBestSeller === true;
                return (
                <div key={bot.id || bot._id} className={`group flex flex-col relative bg-[#080a0f]/80 backdrop-blur-xl border ${isVIP ? 'border-blue-500 shadow-blue-500/20' : 'border-white/5'} rounded-[40px] overflow-hidden hover:border-blue-500/30 transition-all duration-500 shadow-2xl`}>
                  
                  {isVIP && (
                    <div className="absolute top-6 left-6 z-30 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg flex items-center gap-1">
                      <Icons.Star fill="currentColor" size={12} /> الأكثر مبيعاً
                    </div>
                  )}

                  <div className="relative h-60 overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-transparent to-transparent z-10"></div>
                    <img src={bot.imageUrl} alt={bot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                    <div className="absolute top-6 right-6 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1 text-xs font-bold text-green-400">
                      <Icons.TrendingUp size={14} /> دقة {bot.accuracy}
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-grow relative z-20 -mt-10">
                    <h3 className="text-2xl font-black mb-3 bg-gradient-to-l from-white to-gray-400 bg-clip-text text-transparent">
                      {bot.name}
                    </h3>
                    
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-4xl font-black text-white">${bot.price}</span>
                      <span className="text-gray-500 font-bold text-sm">/ شهرياً</span>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-xs text-blue-400 uppercase tracking-widest font-bold mb-2">التفاصيل:</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{bot.description}</p>
                    </div>
                    <div className="mb-8 flex-grow">
                      <h4 className="text-xs text-blue-400 uppercase tracking-widest font-bold mb-3">المميزات:</h4>
                      <ul className="space-y-3">
                        {bot.features && bot.features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                            <Icons.CheckCircle className="text-blue-500" size={16} /> {typeof feature === 'string' ? feature : String(feature)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-auto pt-6 border-t border-white/5">
                      <button onClick={() => handleBotPurchaseClick(bot)} className="w-full bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-600 text-white px-6 py-4 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                        شراء البوت الآن <Icons.ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )})}
              {bots.length === 0 && <p className="text-gray-500 col-span-full text-center py-20 font-bold">لا توجد بوتات مضافة حتى الآن.</p>}
            </div>
          </section>
        )}

        {/* 3. النتائج */}
        {currentPage === 'results' && (
          <section className="py-20 px-4 md:px-8 bg-black/20 min-h-[70vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8">
                <div className="text-center md:text-right space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight">النتائج اليومية 📊</h2>
                  <p className="text-gray-500 max-w-lg text-lg">بكل شفافية.. شاهد أحدث الصفقات والأرباح الموثقة من السيرفر.</p>
                </div>
                <button onClick={() => fetchResults()} className="flex items-center gap-3 bg-[#080a0f]/80 backdrop-blur-md hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl font-bold transition-all active:scale-95">
                  <Icons.RefreshCw size={20} className={loading ? 'animate-spin' : ''} /> تحديث النتائج
                </button>
              </div>

              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {[1,2,3].map(i => <div key={i} className="h-[500px] bg-white/5 rounded-[45px] animate-pulse"></div>)}
                </div>
              )}

              {error && (
                <div className="p-16 text-center bg-red-500/5 border border-red-500/10 rounded-[50px] backdrop-blur-xl">
                  <Icons.AlertCircle size={64} className="mx-auto text-red-500 mb-6 opacity-50" />
                  <p className="text-red-400 font-bold text-xl mb-8">{error}</p>
                  <button onClick={() => fetchResults()} className="bg-red-500 text-white px-12 py-4 rounded-2xl font-black shadow-2xl shadow-red-500/20">إعادة محاولة الاتصال</button>
                </div>
              )}

              {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {results.map((res: Result) => (
                    <div key={res.id || res._id} className="group bg-[#080a0f]/80 backdrop-blur-xl border border-white/5 rounded-[50px] overflow-hidden hover:border-blue-500/40 transition-all duration-700 shadow-2xl">
                      <div className="relative h-80 overflow-hidden">
                        {res.mediaType === 'video' ? (
                          <video src={res.mediaUrl} className="w-full h-full object-cover" muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                        ) : (
                          <img src={res.mediaUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Result" />
                        )}
                        <div className="absolute top-8 right-8 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10">
                          <span className="text-white text-[11px] font-black tracking-widest uppercase">
                            {new Date(res.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                          </span>
                        </div>
                      </div>

                      <div className="p-10">
                        <div className="flex justify-between items-center mb-8">
                          <div className="space-y-1">
                             <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">صافي الربح اليوم</p>
                             <p className="text-4xl font-black text-green-400 tracking-tighter">+${res.profitAmount}</p>
                          </div>
                          <div className="w-16 h-16 rounded-[24px] bg-green-500/10 flex items-center justify-center border border-green-500/10">
                             <Icons.ArrowUpRight className="text-green-500" size={32} />
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-10 h-12 line-clamp-2 italic">
                          " {res.notes || 'تم تحقيق الأرباح المستهدفة لهذا اليوم بدقة.' } "
                        </p>
                      </div>
                    </div>
                  ))}

                  {results.length === 0 && !loading && !error && (
                    <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-[60px] backdrop-blur-sm">
                       <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                          <Icons.Globe size={48} className="text-gray-700" />
                       </div>
                       <p className="text-gray-500 font-black text-2xl tracking-tight">جاري مزامنة أحدث صفقات البوت من السيرفر...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 4. صفحة الاشتراكات والإدارة */}
        {currentPage === 'subscribe' && (
          <section className="py-20 px-4 md:px-8 bg-black/20 min-h-[80vh] animate-in zoom-in-95 duration-500">
            <div className="max-w-7xl mx-auto">
              
              <div className="text-center mb-20 space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20">
                  <Icons.ShieldCheck className="text-indigo-400" size={32} />
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight">الاشتراكات والإدارة</h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">اختر بين باقات الاشتراك الشهري أو نظام إدارة المحافظ بالكامل حسب رأس مالك.</p>
              </div>

              <div className="mb-24">
                <h3 className="text-3xl font-black text-white mb-10 flex items-center gap-4">
                  <Icons.CreditCard className="text-blue-500" size={36} /> قسم الاشتراكات
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {subscriptionPlans.length > 0 ? subscriptionPlans.map((plan: Plan) => {
                    const isVIP = plan.isBestSeller === 'true' || plan.isBestSeller === true;
                    return (
                      <div key={plan.id || plan._id} className={`relative flex flex-col bg-[#080a0f]/90 backdrop-blur-xl rounded-[40px] p-8 md:p-10 transition-all duration-500 shadow-2xl ${isVIP ? 'border-2 border-blue-500 md:scale-105 shadow-blue-600/20 z-10' : 'border border-white/10 hover:border-blue-500/50'}`}>
                        {isVIP && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg">
                            الأكثر طلباً
                          </div>
                        )}
                        <div className="mb-8">
                          <h4 className="text-2xl font-black mb-2 text-white">{plan.title}</h4>
                          <p className="text-gray-400 text-sm">باقة مخصصة لتحقيق دخل مستمر بإدارة احترافية.</p>
                        </div>
                        <div className="mb-8 flex items-baseline gap-2">
                          <span className="text-5xl font-black text-white">{plan.fee.replace(/[^\d$]/g, '') || plan.fee}</span>
                          <span className="text-gray-500 font-bold">/ شهرياً</span>
                        </div>
                        <div className="flex-grow mb-10">
                          <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-sm font-bold text-gray-300">
                              <div className={`p-1 rounded-full ${isVIP ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white'}`}><Icons.Check size={14} /></div>
                              رأس المال المطلوب: {plan.capital}
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-green-400">
                              <div className="p-1 rounded-full bg-green-500/20 text-green-400"><Icons.TrendingUp size={14} /></div>
                              الرسوم والتارجت: {plan.fee}
                            </li>
                            {plan.features && plan.features.map((feat: string, i: number) => (
                              <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-400">
                                <div className={`p-1 rounded-full ${isVIP ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white'}`}><Icons.Check size={14} /></div>
                                {typeof feat === 'string' ? feat : String(feat)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-auto">
                          <button onClick={() => handlePlanClick('الاشتراكات', plan.title, plan.capital, plan.fee)} className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${isVIP ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30' : 'bg-white/5 hover:bg-blue-600 text-white border border-white/10 hover:border-blue-600'}`}>
                            اشترك الآن <Icons.Zap size={22} />
                          </button>
                        </div>
                      </div>
                    );
                  }) : <p className="text-gray-500 col-span-2 text-center py-10 font-bold">لا توجد باقات اشتراك مضافة حالياً.</p>}
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black text-white mb-10 flex items-center gap-4">
                  <Icons.BarChart3 className="text-indigo-500" size={36} /> قسم الإدارة
                </h3>
                <div className="grid md:grid-cols-1 gap-8">
                  {managementPlans.length > 0 ? managementPlans.map((plan: Plan) => (
                    <div key={plan.id || plan._id} className="relative flex flex-col lg:flex-row bg-[#080a0f]/90 backdrop-blur-xl rounded-[40px] p-8 md:p-12 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 shadow-2xl items-center gap-10">
                      
                      {(plan.isBestSeller === 'true' || plan.isBestSeller === true) && (
                        <div className="absolute -top-4 right-10 bg-indigo-600 text-white px-6 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg z-20">
                          شراكة مميزة
                        </div>
                      )}

                      <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest">
                          نظام الشراكة
                        </div>
                        <h4 className="text-4xl font-black text-white tracking-tight">{plan.title}</h4>
                        <p className="text-gray-400 text-lg leading-relaxed">
                          نحن ندير محفظتك بالكامل باستخدام أحدث تقنيات الذكاء الاصطناعي وأفضل الروبوتات. نقتسم الأرباح معك بشفافية تامة دون رسوم شهرية ثابتة.
                        </p>
                        <ul className="space-y-4 pt-4">
                          <li className="flex items-center gap-4 text-base font-bold text-gray-300">
                            <div className="p-2 rounded-xl bg-white/5 text-indigo-400 border border-white/5"><Icons.Check size={18} /></div>
                            أقل رأس مال للبدء: <span className="text-white">{plan.capital}</span>
                          </li>
                          <li className="flex items-center gap-4 text-base font-bold text-gray-300">
                            <div className="p-2 rounded-xl bg-white/5 text-indigo-400 border border-white/5"><Icons.Check size={18} /></div>
                            النسبة: <span className="text-white">{plan.fee}</span>
                          </li>
                          {plan.features && plan.features.map((feat: string, i: number) => (
                            <li key={i} className="flex items-center gap-4 text-base font-bold text-gray-300">
                              <div className="p-2 rounded-xl bg-white/5 text-indigo-400 border border-white/5"><Icons.Check size={18} /></div>
                              <span className="text-gray-400">{typeof feat === 'string' ? feat : String(feat)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="w-full lg:w-1/3 flex flex-col gap-4">
                        <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-3xl text-center mb-4">
                          <Icons.Globe className="mx-auto text-indigo-500 mb-4" size={48} />
                          <p className="text-indigo-300 font-bold">لا توجد رسوم خفية. اربح معنا لنربح معك.</p>
                        </div>
                        <button onClick={() => handlePlanClick('الإدارة', plan.title, plan.capital, plan.fee)} className="w-full py-5 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 active:scale-95">
                          ابدأ الإدارة الآن <Icons.TrendingUp size={24} />
                        </button>
                      </div>
                    </div>
                  )) : <p className="text-gray-500 text-center py-10 font-bold">لا توجد خطط إدارة مضافة حالياً.</p>}
                </div>
              </div>

            </div>
          </section>
        )}

        {/* 5. صفحة من نحن */}
        {currentPage === 'about' && (
          <section className="py-20 px-4 md:px-8 bg-black/20 min-h-[70vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-4xl mx-auto text-center">
              <Icons.Info size={64} className="mx-auto text-blue-500 mb-8" />
              <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tight">من نحن</h2>
              <div className="bg-[#080a0f]/80 backdrop-blur-xl p-8 md:p-12 rounded-[40px] border border-white/5 shadow-2xl leading-relaxed text-gray-300 text-lg md:text-xl whitespace-pre-wrap text-right">
                {settings.aboutUs || 'جاري تحميل المعلومات...'}
              </div>
            </div>
          </section>
        )}

        {/* 6. صفحة تواصل معنا */}
        {currentPage === 'contact' && (
          <section className="py-20 px-4 md:px-8 bg-black/20 min-h-[70vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-4xl mx-auto text-center">
              <Icons.Phone size={64} className="mx-auto text-blue-500 mb-8" />
              <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tight">تواصل معنا</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <a href={settings.contact.telegram || 'https://t.me/CR7_B3'} target="_blank" rel="noreferrer" onClick={() => trackUserAction('telegram')} className="bg-[#080a0f]/80 backdrop-blur-xl p-8 rounded-[30px] border border-white/5 shadow-2xl hover:border-blue-500/50 transition-all flex flex-col items-center gap-4 group">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Icons.Telegram size={28} />
                  </div>
                  <h3 className="font-bold text-xl">تليجرام</h3>
                  <p className="text-sm text-gray-500">تواصل مباشر وسريع</p>
                </a>
                <a href={`https://wa.me/${settings.contact.whatsapp?.replace(/[^0-9]/g, '') || ''}`} target="_blank" rel="noreferrer" className="bg-[#080a0f]/80 backdrop-blur-xl p-8 rounded-[30px] border border-white/5 shadow-2xl hover:border-green-500/50 transition-all flex flex-col items-center gap-4 group">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                    <Icons.Phone size={28} />
                  </div>
                  <h3 className="font-bold text-xl">واتساب</h3>
                  <p className="text-sm text-gray-500">رسائل ودعم فني</p>
                </a>
                <a href={`mailto:${settings.contact.email || ''}`} className="bg-[#080a0f]/80 backdrop-blur-xl p-8 rounded-[30px] border border-white/5 shadow-2xl hover:border-purple-500/50 transition-all flex flex-col items-center gap-4 group">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <Icons.FileText size={28} />
                  </div>
                  <h3 className="font-bold text-xl">البريد الإلكتروني</h3>
                  <p className="text-sm text-gray-500">للشراكات والاستفسارات</p>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* 7. صفحة الأسئلة الشائعة */}
        {currentPage === 'faqs' && (
          <section className="py-20 px-4 md:px-8 bg-black/20 min-h-[70vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <Icons.HelpCircle size={64} className="mx-auto text-blue-500 mb-8" />
                <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">الأسئلة الشائعة</h2>
              </div>
              <div className="space-y-4">
                {settings.faqs && settings.faqs.length > 0 ? settings.faqs.map((faq: any, idx: number) => (
                  <div key={idx} className="bg-[#080a0f]/80 backdrop-blur-xl p-6 md:p-8 rounded-[30px] border border-white/5 shadow-xl hover:border-white/10 transition-all">
                    <h3 className="text-xl font-bold text-blue-400 mb-3 flex items-start gap-3">
                      <Icons.HelpCircle size={24} className="shrink-0 mt-0.5" /> {faq.question}
                    </h3>
                    <p className="text-gray-300 leading-relaxed pl-9">{faq.answer}</p>
                  </div>
                )) : <p className="text-center text-gray-500 font-bold">لم يتم إضافة أسئلة شائعة بعد.</p>}
              </div>
            </div>
          </section>
        )}

        {/* 8. صفحة الشروط والأحكام */}
        {currentPage === 'terms' && (
          <section className="py-20 px-4 md:px-8 bg-black/20 min-h-[70vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-4xl mx-auto text-center">
              <Icons.FileText size={64} className="mx-auto text-blue-500 mb-8" />
              <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tight">الشروط والأحكام</h2>
              <div className="bg-[#080a0f]/80 backdrop-blur-xl p-8 md:p-12 rounded-[40px] border border-white/5 shadow-2xl leading-relaxed text-gray-300 text-lg whitespace-pre-wrap text-right">
                {settings.terms || 'جاري تحميل المعلومات...'}
              </div>
            </div>
          </section>
        )}

        {/* 9. صفحة الملف الشخصي */}
        {currentPage === 'profile' && user && (
          <section className="py-20 px-4 md:px-8 min-h-[70vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-5xl mx-auto">
              
              <div className="bg-[#080a0f]/90 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl mb-12 flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
                <img src={user.photoURL || ""} alt={user.displayName || "User"} className="w-32 h-32 rounded-full border-4 border-blue-500/30 shadow-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-black uppercase tracking-widest mb-2">
                    حساب موثق
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black">{user.displayName}</h2>
                  <p className="text-gray-400 font-bold">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-bold transition-all border border-red-500/20">
                  <Icons.LogOut size={20} /> تسجيل الخروج
                </button>
              </div>

              <div className="bg-[#080a0f]/90 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <Icons.BarChart3 size={32} className="text-blue-500" />
                  <h3 className="text-2xl font-black">سجل نشاطك الحديث</h3>
                </div>
                
                {userActivity.length > 0 ? (
                  <div className="space-y-4">
                    {userActivity.map((activity: Activity, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                        <p className="text-gray-300 font-bold text-sm md:text-base">{activity.action}</p>
                        <p className="text-xs text-gray-500 font-bold" dir="ltr">
                          {new Date(activity.date).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500 font-bold">لا يوجد نشاط مسجل حتى الآن.</p>
                  </div>
                )}
              </div>

            </div>
          </section>
        )}

        {/* 10. صفحة المدونة (Blog) - ✨ الجديد ✨ */}
        {currentPage === 'blog' && (
          <section className="py-20 px-4 md:px-8 min-h-[80vh] animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-3xl mx-auto">
              
              <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-4 border border-blue-500/20">
                  <Icons.BookOpen className="text-blue-500" size={32} />
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight">مدونة المتداولين</h2>
                <p className="text-gray-400 max-w-xl mx-auto text-lg">أحدث الأخبار، التحديثات، والتوصيات لعملائنا في مجتمع CR7.</p>
              </div>

              <div className="space-y-10">
                {posts.map((post) => {
                  const postId = post.id || post._id;
                  const isExpanded = expandedPostId === postId;
                  const likesCount = post.likes?.length || 0;
                  const commentsCount = post.comments?.length || 0;
                  const hasLiked = user && post.likes?.includes(user.uid);

                  return (
                    <div key={postId} className="bg-[#080a0f]/90 backdrop-blur-xl border border-white/10 rounded-[30px] overflow-hidden shadow-2xl transition-all hover:border-white/20">
                      {/* رأس البوست (الكاتب) */}
                      <div className="p-6 flex items-center gap-4 border-b border-white/5">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 p-0.5">
                           <div className="w-full h-full bg-[#080a0f] rounded-full flex items-center justify-center overflow-hidden">
                             <img src="https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg" alt="CR7" className="w-8 h-8 object-contain" />
                           </div>
                        </div>
                        <div>
                          <h3 className="font-black text-white flex items-center gap-2">CR7 Admin <Icons.CheckCircle size={14} className="text-blue-400" /></h3>
                          <p className="text-xs text-gray-500 font-bold">{new Date(post.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })}</p>
                        </div>
                      </div>

                      {/* محتوى البوست */}
                      <div className="p-6 space-y-4">
                        <h4 className="text-xl font-black text-white">{post.title}</h4>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{post.content}</p>
                      </div>

                      {/* صورة البوست إن وجدت */}
                      {post.imageUrl && (
                        <div className="w-full max-h-[400px] overflow-hidden bg-black/50 border-y border-white/5 flex justify-center">
                          <img src={post.imageUrl} alt={post.title} className="max-w-full max-h-[400px] object-contain" />
                        </div>
                      )}

                      {/* شريط التفاعل */}
                      <div className="p-4 px-6 border-b border-white/5 flex items-center gap-6 text-gray-400 font-bold text-sm">
                        <button onClick={() => handleLike(postId!)} className={`flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${hasLiked ? 'text-red-500' : 'hover:text-red-400'}`}>
                          <Icons.Heart size={22} fill={hasLiked ? "currentColor" : "none"} className={hasLiked ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" : ""} /> 
                          {likesCount > 0 ? likesCount : 'إعجاب'}
                        </button>
                        <button onClick={() => setExpandedPostId(isExpanded ? null : postId!)} className="flex items-center gap-2 hover:text-blue-400 transition-all hover:scale-105 active:scale-95">
                          <Icons.MessageCircle size={22} /> 
                          {commentsCount > 0 ? commentsCount : 'تعليق'}
                        </button>
                      </div>

                      {/* قسم التعليقات (يظهر عند الضغط) */}
                      {isExpanded && (
                        <div className="bg-black/30 p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                          {/* قائمة التعليقات */}
                          <div className="space-y-5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {post.comments && post.comments.length > 0 ? post.comments.map(comment => (
                              <div key={comment.id} className="flex gap-4">
                                <img src={comment.userImage || "https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg"} alt="User" className="w-10 h-10 rounded-full border border-white/10 shrink-0" />
                                <div className="bg-white/5 rounded-2xl rounded-tr-sm p-4 border border-white/10 flex-1">
                                  <div className="flex justify-between items-start mb-1">
                                    <h5 className="font-bold text-white text-sm">{comment.userName}</h5>
                                    <span className="text-[10px] text-gray-500">{new Date(comment.date).toLocaleDateString('ar-EG')}</span>
                                  </div>
                                  <p className="text-gray-300 text-sm leading-relaxed">{comment.text}</p>
                                </div>
                              </div>
                            )) : (
                              <p className="text-center text-gray-500 text-sm font-bold py-4">كن أول من يعلق على هذا المنشور!</p>
                            )}
                          </div>
                          
                          {/* مربع كتابة تعليق */}
                          {user ? (
                            <div className="flex gap-3 pt-2">
                              <img src={user.photoURL || "https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg"} alt={user.displayName || ""} className="w-10 h-10 rounded-full border border-white/10 shrink-0" />
                              <div className="flex-1 flex bg-white/5 border border-white/10 rounded-full overflow-hidden focus-within:border-blue-500 transition-colors pl-1">
                                <input 
                                  type="text" 
                                  value={commentText} 
                                  onChange={(e) => setCommentText(e.target.value)} 
                                  placeholder="اكتب تعليقاً..." 
                                  className="w-full bg-transparent border-none outline-none text-white text-sm px-4 py-3"
                                  onKeyPress={(e) => {
                                    if(e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddComment(postId!);
                                    }
                                  }}
                                />
                                <button onClick={() => handleAddComment(postId!)} disabled={!commentText.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full p-2 m-1 aspect-square flex items-center justify-center transition-all">
                                  <Icons.ChevronRight size={18} className="rotate-180" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/10">
                              <p className="text-gray-400 text-sm mb-3">يجب تسجيل الدخول لتتمكن من التعليق والإعجاب</p>
                              <button onClick={() => setShowLoginModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95">
                                تسجيل الدخول الآن
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {posts.length === 0 && !loading && (
                  <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-[40px] bg-[#080a0f]/50">
                    <Icons.BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-500 font-bold text-xl">لا توجد منشورات في المدونة حالياً.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

      </main>

      <footer className="py-24 px-4 md:px-8 border-t border-white/5 bg-[#020408]/80 backdrop-blur-xl mt-auto relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-5 space-y-8">
            <h3 className="text-3xl font-black italic tracking-tighter">CR7 BOT PLATFORM</h3>
            <p className="text-gray-500 text-lg leading-relaxed max-w-sm">نحن لا نبيع مجرد أداة، نحن نقدم لك شريكاً ذكياً في رحلتك المالية. انضم لآلاف المتداولين الناجحين اليوم.</p>
            
            <div className="flex gap-4">
               {/* تحديث رابط تليجرام وإضافة تتبع النقرة */}
               <a href="https://t.me/CR7_B3" target="_blank" rel="noreferrer" onClick={() => trackUserAction('telegram')} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#0088cc] hover:scale-110 transition-all cursor-pointer group">
                  <Icons.Telegram size={20} className="text-gray-400 group-hover:text-white" />
               </a>
               <a href="https://www.facebook.com/share/1KSu6cEJVS/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all cursor-pointer group">
                  <Icons.Facebook size={20} className="text-gray-400 group-hover:text-white" />
               </a>
               <a href="ضع_رابط_انستجرام_هنا" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-pink-600 hover:scale-110 transition-all cursor-pointer group">
                  <Icons.Instagram size={20} className="text-gray-400 group-hover:text-white" />
               </a>
               <a href="https://www.tiktok.com/@cr7_bot1?_r=1&_t=ZS-95Wt05atyFE" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#ff0050] hover:scale-110 transition-all cursor-pointer group">
                  <Icons.TikTok size={20} className="text-gray-400 group-hover:text-white" />
               </a>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest text-blue-500">الروابط</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li><button onClick={() => navigateTo('about')} className="hover:text-white transition">من نحن</button></li>
              <li><button onClick={() => navigateTo('bots')} className="hover:text-white transition">البوتات</button></li>
              <li><button onClick={() => navigateTo('results')} className="hover:text-white transition">النتائج المباشرة</button></li>
              <li><button onClick={() => navigateTo('subscribe')} className="hover:text-white transition">الاشتراكات والإدارة</button></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest text-blue-500">الدعم</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li><button onClick={() => navigateTo('contact')} className="hover:text-white transition">تواصل معنا</button></li>
              <li><button onClick={() => navigateTo('faqs')} className="hover:text-white transition">الأسئلة الشائعة</button></li>
              <li><button onClick={() => navigateTo('terms')} className="hover:text-white transition">الشروط والأحكام</button></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest text-blue-500">النشرة الإخبارية</h4>
            <div className="flex gap-2">
              <input type="text" placeholder="بريدك الإلكتروني" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm flex-1 outline-none focus:border-blue-500 transition-colors" />
              <button className="bg-blue-600 px-5 rounded-xl font-bold">✓</button>
            </div>
          </div>
        </div>
        <div className="mt-24 pt-10 border-t border-white/5 text-center text-gray-600 text-[10px] font-bold uppercase tracking-[0.5em]">
          © 2026 CR7 TRADING SYSTEMS - All Rights Reserved
        </div>
      </footer>

      {/* نافذة تسجيل الدخول */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowLoginModal(false)}></div>
          <div className="bg-[#080a0f] border border-white/10 w-full max-w-md rounded-[40px] p-10 relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl text-center">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
              <Icons.X size={20} />
            </button>
            
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/10 text-white">
              <Icons.User size={40} />
            </div>
            
            <h2 className="text-3xl font-black mb-2 text-white">مرحباً بك مجدداً</h2>
            <p className="text-gray-400 font-bold text-sm mb-10 leading-relaxed">
              سجل دخولك الآن للوصول إلى ملفك الشخصي وتتبع نشاطك وإدارة خدماتك بكل سهولة.
            </p>

            <button 
              onClick={handleGoogleLogin} 
              className="w-full flex items-center justify-center gap-4 bg-white hover:bg-gray-100 text-black py-4 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95"
            >
              <Icons.Google size={24} /> المتابعة بحساب Google
            </button>

            <p className="text-[10px] text-gray-500 font-bold mt-8 uppercase tracking-widest">
              باستخدامك للخدمة فأنت توافق على <button onClick={() => {setShowLoginModal(false); navigateTo('terms');}} className="text-blue-500 hover:underline">الشروط والأحكام</button>
            </p>
          </div>
        </div>
      )}

    </div>
  );
}