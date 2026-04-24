
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  type User
} from 'firebase/auth';

// ==========================================
// Firebase
// ==========================================
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
// Types
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
  salesCount?: number | string;
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
  subscribersCount?: number | string;
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


interface LiveStatItem {
  title: string;
  count: number | string;
  note?: string;
  isVisible?: boolean | string;
}

interface LiveStatsData {
  headline?: string;
  subscriptions?: LiveStatItem[];
  management?: LiveStatItem[];
  bots?: LiveStatItem[];
}

interface Settings {
  contact: {
    telegram: string;
    whatsapp: string;
    email: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  faqs: { question: string; answer: string }[];
  terms: string;
  aboutUs: string;
  heroPhrases?: string[];
  liveStats?: LiveStatsData;
  viewerAccount?: {
    accountNumber?: string;
    broker?: string;
    server?: string;
    password?: string;
    platform?: string;
    note?: string;
  };
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
// Icons
// ==========================================
const Icons = {
  Menu: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  ),
  X: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  TrendingUp: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  ShieldCheck: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Zap: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m13 2-2 10h3l-2 10 2-10h-3z" />
    </svg>
  ),
  BarChart3: ({ className = "", size = 24, fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  ),
  BookOpen: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Heart: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  MessageCircle: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  ChevronRight: ({ className = "", size = 24, fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  Globe: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20" />
      <path d="M2 12h20" />
    </svg>
  ),
  AlertCircle: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  ),
  RefreshCw: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  ),
  ArrowUpRight: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  ),
  Cpu: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="24" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  ),
  CheckCircle: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  CreditCard: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Check: ({ size = 20, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Info: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Star: ({ size = 20, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Telegram: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13v8l4-5" />
    </svg>
  ),
  Facebook: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  Instagram: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  ),
  TikTok: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v11a4 4 0 1 1-4-4z" />
    </svg>
  ),
  Phone: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  HelpCircle: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  FileText: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  User: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  LogOut: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Google: ({ size = 24, className = "", fill = "none" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill={fill}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
};

// ==========================================
// Background
// ==========================================
const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#030303]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a150a_0%,#030303_100%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-[#bf953f]/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-[#8B6E36]/10 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute inset-0 opacity-20 flex items-center justify-center mix-blend-screen">
        <style>{`@keyframes drawLine { 0% { stroke-dashoffset: 2000; } 100% { stroke-dashoffset: 0; } }`}</style>
        <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path
            d="M-100,600 C100,500 200,700 350,450 C500,200 650,550 800,300 C950,50 1100,350 1300,150"
            fill="none"
            stroke="url(#chartGradient)"
            strokeWidth="3"
            strokeDasharray="2000"
            style={{ animation: 'drawLine 15s linear infinite' }}
          />
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#bf953f" stopOpacity="0" />
              <stop offset="50%" stopColor="#fcf6ba" stopOpacity="1" />
              <stop offset="100%" stopColor="#bf953f" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

// ==========================================
// App
// ==========================================
export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [results, setResults] = useState<Result[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [settings, setSettings] = useState<Settings>({
    contact: { telegram: '', whatsapp: '', email: '' },
    faqs: [],
    terms: '',
    aboutUs: '',
    liveStats: {
      headline: 'الأعداد المباشرة الحالية ويتم تحديثها تلقائياً من الموقع بمجرد اشتراك جديد أو إدارة أو بيع بوت',
      subscriptions: [],
      management: [],
      bots: []
    }
  });
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [userActivity, setUserActivity] = useState<Activity[]>([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(0);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const goldTextClass = "text-transparent bg-clip-text bg-gradient-to-b from-[#bf953f] via-[#fcf6ba] to-[#b38728] font-black";
  const goldCardClass = "bg-[#0a0a0a]/80 backdrop-blur-2xl border border-[#bf953f]/20 rounded-[40px] hover:border-[#bf953f]/60 transition-all duration-500 shadow-2xl";
  const goldBtnClass = "bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] text-black font-black transition-all hover:scale-105 active:scale-95 shadow-xl";

  const heroPhrases = settings.heroPhrases || ['يعمل لأجلك', 'يحقق أحلامك', 'يصنع ثروتك', 'يؤمن مستقبلك'];

  const launchDate = new Date('2024-01-01').getTime();
  const now = new Date().getTime();
  const daysPassed = Math.floor((now - launchDate) / (1000 * 60 * 60 * 24));
  const dynamicReturn = 284 + Math.floor(daysPassed * 0.5);
  const dynamicTrades = 1250 + Math.floor(daysPassed * 3);

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
      if (error?.code === 'auth/unauthorized-domain') {
        alert('هذا النطاق غير مصرح له بتسجيل الدخول. أضفه داخل Firebase Authorized Domains.');
      } else {
        alert('حدث خطأ أثناء تسجيل الدخول، حاول مرة تانية.');
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

  const trackUserAction = async (actionType: string, itemName?: string, price?: string | number) => {
    try {
      await fetch('https://cr7-kappa.vercel.app/api/statistics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          itemName,
          price: price ? String(price).replace(/[^0-9.]/g, '') : 0
        })
      });
    } catch (e) {
      console.log('Tracking error', e);
    }
  };

  useEffect(() => {
    trackUserAction('visit');
  }, []);

  const trackActivity = useCallback((pageName: string) => {
    if (!user) return;

    const pageLabels: Record<string, string> = {
      home: 'الرئيسية',
      about: 'من نحن',
      bots: 'البوتات',
      results: 'النتائج',
      subscribe: 'خدماتنا',
      blog: 'المدونة',
      faqs: 'الأسئلة الشائعة',
      terms: 'الشروط والأحكام',
      profile: 'الملف الشخصي',
      contact: 'تواصل معنا'
    };

    const newActivity: Activity = {
      action: `قام بزيارة قسم ${pageLabels[pageName] || pageName}`,
      date: new Date().toISOString()
    };

    setUserActivity((prev) => {
      const updated = [newActivity, ...prev].slice(0, 20);
      try {
        localStorage.setItem(`activity_${user.uid}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [user]);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackActivity(page);
  };

  useEffect(() => {
    document.title = "CR7 BOT";

    const existingIcons = document.querySelectorAll("link[rel*='icon']");
    existingIcons.forEach((icon) => {
      if (icon.parentNode) icon.parentNode.removeChild(icon);
    });

    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/jpeg';
    favicon.href = "https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg";
    document.head.appendChild(favicon);

    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      nextjs-portal,
      #nextjs-build-indicator,
      [data-nextjs-toast] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #bf953f70; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #bf953f; }
    `;
    document.head.appendChild(styleTag);

    return () => {
      if (styleTag.parentNode) styleTag.parentNode.removeChild(styleTag);
    };
  }, []);

  const fetchResults = useCallback(async (retries = 5, delay = 1000) => {
    try {
      const response = await fetch('https://cr7-kappa.vercel.app/api/results');
      if (!response.ok) throw new Error('فشل الاتصال بسيرفر النتائج');
      const data = await response.json();
      if (data.success) {
        setResults(data.data || []);
        setError(null);
      }
    } catch (err) {
      if (retries > 0) setTimeout(() => fetchResults(retries - 1, delay * 2), delay);
      else setError('لا يمكن الاتصال بالسيرفر حالياً. تأكد إن الباك إند شغال.');
    } finally {
      if (retries === 5) setLoading(false);
    }
  }, []);

  const fetchBots = useCallback(async (retries = 3, delay = 1000) => {
    try {
      const response = await fetch('https://cr7-kappa.vercel.app/api/bots');
      const data = await response.json();
      if (data.success && data.data) setBots(data.data);
    } catch (err) {
      if (retries > 0) setTimeout(() => fetchBots(retries - 1, delay * 2), delay);
    }
  }, []);

  const fetchPlans = useCallback(async (retries = 3, delay = 1000) => {
    try {
      const response = await fetch('https://cr7-kappa.vercel.app/api/subscriptions');
      const data = await response.json();
      if (data.success && data.data) setPlans(data.data);
    } catch (err) {
      if (retries > 0) setTimeout(() => fetchPlans(retries - 1, delay * 2), delay);
    }
  }, []);

  const fetchSettings = useCallback(async (retries = 3, delay = 1000) => {
    try {
      const response = await fetch('https://cr7-kappa.vercel.app/api/settings');
      const data = await response.json();
      if (data.success && data.data) setSettings(data.data);
    } catch (err) {
      if (retries > 0) setTimeout(() => fetchSettings(retries - 1, delay * 2), delay);
    }
  }, []);

  const fetchPosts = useCallback(async (retries = 3, delay = 1000) => {
    try {
      const response = await fetch('https://cr7-kappa.vercel.app/api/blog');
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
    fetchPosts();
  }, [fetchResults, fetchBots, fetchPlans, fetchSettings, fetchPosts]);

  const handleLike = async (postId: string) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        const id = post.id || post._id;
        if (id === postId) {
          const likes = post.likes || [];
          const hasLiked = likes.includes(user.uid);
          return {
            ...post,
            likes: hasLiked ? likes.filter((uid) => uid !== user.uid) : [...likes, user.uid]
          };
        }
        return post;
      })
    );

    try {
      const res = await fetch(`https://cr7-kappa.vercel.app/api/blog/${postId}/like`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.uid })
      });

      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (!data.success) {
          alert('خطأ من السيرفر: ' + data.message);
        } else {
          trackUserAction('like_post', postId);
        }
      } catch (parseError) {
        console.error("رد السيرفر غير متوقع:", text);
      }
    } catch (e) {
      console.error("Fetch Error:", e);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!commentText.trim()) return;

    const newComment: CommentData = {
      id: Date.now().toString(),
      userId: user.uid,
      userName: user.displayName || 'مستخدم',
      userImage: user.photoURL || 'https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg',
      text: commentText,
      date: new Date().toISOString()
    };

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        const id = post.id || post._id;
        if (id === postId) {
          return { ...post, comments: [...(post.comments || []), newComment] };
        }
        return post;
      })
    );
    setCommentText('');

    try {
      const res = await fetch(`https://cr7-kappa.vercel.app/api/blog/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComment)
      });

      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (!data.success) {
          alert('خطأ من السيرفر: ' + data.message);
        } else {
          trackUserAction('comment_post', postId);
        }
      } catch (parseError) {
        console.error("رد السيرفر غير متوقع:", text);
      }
    } catch (e) {
      console.error("Fetch Error:", e);
    }
  };

  const handleBotPurchaseClick = (bot: Bot) => {
    trackUserAction('buy_bot', bot.name, bot.price);
    const text = `مرحباً، أود شراء بوت التداول بالكامل:%0A%0A🤖 البوت: ${bot.name}%0A💰 السعر: $${bot.price}%0A🎯 الدقة: ${bot.accuracy}%0A%0Aأرجو تزويدي بتفاصيل ووسائل الدفع لاستلام البوت.`;
    window.open(`https://t.me/CR7bot0?text=${text}`, '_blank');
  };

  const handlePlanClick = (type: string, title: string, capital: string, fee: string) => {
    if (type === 'الإدارة') trackUserAction('management', title);
    else trackUserAction('subscribe', title, fee);

    const text = `مرحباً، أود الانضمام لقسم (${type}):%0A%0A📌 التفاصيل: ${title}%0A💰 رأس المال: ${capital}%0A💳 الرسوم: ${fee}%0A%0Aأرجو تزويدي بخطوات البدء فوراً.`;
    window.open(`https://t.me/CR7BOT01?text=${text}`, '_blank');
  };

  const viewerAccount = settings.viewerAccount || {};
  const hasViewerAccount = Boolean(
    viewerAccount.accountNumber ||
    viewerAccount.broker ||
    viewerAccount.server ||
    viewerAccount.password ||
    viewerAccount.platform ||
    viewerAccount.note
  );

  const copyToClipboard = async (text: string, fieldName: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 1800);
    } catch (e) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 1800);
      } catch (err) {
        alert('لم يتم النسخ تلقائياً، انسخ البيانات يدوياً.');
      }
      document.body.removeChild(textarea);
    }
  };

  const copyViewerAccount = () => {
    const details = [
      viewerAccount.platform ? `المنصة: ${viewerAccount.platform}` : '',
      viewerAccount.broker ? `البروكر: ${viewerAccount.broker}` : '',
      viewerAccount.server ? `السيرفر: ${viewerAccount.server}` : '',
      viewerAccount.accountNumber ? `رقم الحساب: ${viewerAccount.accountNumber}` : '',
      viewerAccount.password ? `باسورد المشاهدة: ${viewerAccount.password}` : '',
      viewerAccount.note ? `ملاحظة: ${viewerAccount.note}` : ''
    ].filter(Boolean).join('\n');

    copyToClipboard(details, 'all-viewer-account');
    trackUserAction('copy_viewer_account');
  };

  const subscriptionPlans = plans.filter((p) => p.type === 'الاشتراكات');
  const managementPlans = plans.filter((p) => p.type === 'الإدارة');
  const liveStats: LiveStatsData = settings.liveStats || {};
  const normalizeLiveStatItems = (items?: LiveStatItem[]) => (items || []).filter((item) => item && item.title && item.isVisible !== false && item.isVisible !== 'false');
  const liveSubscriptionStats = normalizeLiveStatItems(liveStats.subscriptions);
  const liveManagementStats = normalizeLiveStatItems(liveStats.management);
  const liveBotStats = normalizeLiveStatItems(liveStats.bots);
  const subscriptionStatsToShow = liveSubscriptionStats.length > 0
    ? liveSubscriptionStats
    : subscriptionPlans.map((plan) => ({ title: plan.title || plan.fee || 'باقة اشتراك', count: plan.subscribersCount || 0, note: plan.fee }));
  const managementStatsToShow = liveManagementStats.length > 0
    ? liveManagementStats
    : managementPlans.map((plan) => ({ title: plan.title || plan.fee || 'نظام إدارة', count: plan.subscribersCount || 0, note: plan.fee }));
  const botStatsToShow = liveBotStats.length > 0
    ? liveBotStats
    : bots.map((bot) => ({ title: bot.name || 'بوت تداول', count: bot.salesCount || 0, note: bot.price ? `$${bot.price}` : '' }));
  const liveStatsHeadline = liveStats.headline || 'الأعداد المباشرة الحالية ويتم تحديثها تلقائياً من الموقع بمجرد اشتراك جديد أو إدارة أو بيع بوت';
  const liveStatsTotal = [...subscriptionStatsToShow, ...managementStatsToShow, ...botStatsToShow].reduce((total, item) => total + (Number(item.count) || 0), 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % heroPhrases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [heroPhrases.length]);

  const StatCard = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-black/40 p-6 rounded-3xl border border-[#bf953f]/10 text-center">
      <p className="text-[10px] text-gray-500 font-black mb-2 uppercase tracking-widest">{label}</p>
      <p className={`text-3xl ${goldTextClass}`}>{value}</p>
      {sub ? <p className="text-xs text-gray-500 mt-2">{sub}</p> : null}
    </div>
  );

  const LiveStatMiniCard = ({ item, icon }: { item: LiveStatItem; icon: React.ReactNode }) => (
    <div className="relative overflow-hidden bg-black/45 border border-[#bf953f]/10 rounded-3xl p-4 hover:border-[#bf953f]/40 transition-all group">
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#bf953f]/10 rounded-full blur-2xl group-hover:bg-[#bf953f]/20 transition-all"></div>
      <div className="relative z-10 flex items-start justify-between gap-3 flex-row-reverse">
        <div className="text-right min-w-0">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest truncate">{item.note || 'LIVE'}</p>
          <h4 className="text-sm md:text-base text-white font-black truncate mt-1">{item.title}</h4>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-[#bf953f]/10 border border-[#bf953f]/20 flex items-center justify-center text-[#bf953f] shrink-0">
          {icon}
        </div>
      </div>
      <div className="relative z-10 mt-4 flex items-end justify-between gap-3 flex-row-reverse">
        <p className={`text-4xl md:text-5xl leading-none ${goldTextClass}`}>{Number(item.count || 0).toLocaleString()}</p>
        <span className="text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full font-black">نشط الآن</span>
      </div>
    </div>
  );

  const LiveStatsGroup = ({ title, items, icon, emptyText }: { title: string; items: LiveStatItem[]; icon: React.ReactNode; emptyText: string }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-row-reverse">
        <h4 className="text-[#fcf6ba] font-black text-sm flex items-center gap-2">
          {icon}
          {title}
        </h4>
        <span className="text-[10px] text-gray-500 font-black">{items.length} عنصر</span>
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.slice(0, 6).map((item, index) => (
            <LiveStatMiniCard key={`${title}-${index}-${item.title}`} item={item} icon={icon} />
          ))}
        </div>
      ) : (
        <div className="bg-black/40 border border-[#bf953f]/10 rounded-3xl p-5 text-center text-gray-500 font-bold text-sm">
          {emptyText}
        </div>
      )}
    </div>
  );

  const ViewerAccountField = ({ label, value, fieldKey }: { label: string; value?: string; fieldKey: string }) => (
    <div className="bg-black/40 border border-[#bf953f]/10 rounded-2xl p-4 flex items-center justify-between gap-3 flex-row-reverse">
      <div className="text-right min-w-0">
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-white font-black break-all">{value || 'غير متوفر حالياً'}</p>
      </div>
      <button
        onClick={() => copyToClipboard(value || '', fieldKey)}
        disabled={!value}
        className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black border transition-all ${value ? 'border-[#bf953f]/40 text-[#fcf6ba] hover:bg-[#bf953f] hover:text-black' : 'border-white/10 text-gray-600 cursor-not-allowed'}`}
      >
        {copiedField === fieldKey ? 'تم النسخ' : 'نسخ'}
      </button>
    </div>
  );

  const SectionTitle = ({ title, desc }: { title: string; desc?: string }) => (
    <div className="text-center mb-14">
      <h2 className={`text-4xl md:text-6xl mb-4 ${goldTextClass}`}>{title}</h2>
      {desc ? <p className="text-gray-400 max-w-2xl mx-auto">{desc}</p> : null}
    </div>
  );

  return (
    <div className="min-h-screen text-white selection:bg-[#bf953f]/30 font-sans overflow-x-hidden flex flex-col relative bg-[#030303]" dir="rtl">
      <BackgroundAnimation />

      <nav className="sticky top-0 z-50 nav-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
            <div className="w-12 h-12 bg-[#bf953f]/10 rounded-2xl flex items-center justify-center border border-[#bf953f]/30 overflow-hidden">
              <img
                src="https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl uppercase leading-none ${goldTextClass}`}>CR7 BOT</span>
              <span className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">SMART GOLD TRADING</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-7 text-sm font-bold">
            {[
              ['home', 'الرئيسية'],
              ['about', 'من نحن'],
              ['bots', 'البوتات'],
              ['results', 'النتائج'],
              ['subscribe', 'الاشتراكات والإدارة'],
              ['blog', 'المدونة'],
              ['contact', 'تواصل معنا']
            ].map(([page, label]) => (
              <button
                key={page}
                onClick={() => navigateTo(page)}
                className={`transition-colors ${currentPage === page ? 'text-[#fcf6ba]' : 'text-gray-400 hover:text-white'}`}
              >
                {label}
              </button>
            ))}

            <a
              href="https://t.me/CR7_B3"
              target="_blank"
              rel="noreferrer"
              onClick={() => trackUserAction('telegram')}
              className="bg-[#bf953f]/10 text-[#fcf6ba] border border-[#bf953f]/30 px-5 py-2 rounded-full hover:bg-[#bf953f] hover:text-black transition-all"
            >
              مجتمعنا
            </a>

            {user ? (
              <button onClick={() => navigateTo('profile')} className="flex items-center gap-2 bg-white/5 border border-[#bf953f]/30 px-4 py-2 rounded-full">
                <img src={user.photoURL || ""} alt="profile" className="w-6 h-6 rounded-full" />
                <span>{user.displayName?.split(' ')[0]}</span>
              </button>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className={`px-6 py-2 rounded-full ${goldBtnClass}`}>
                دخول
              </button>
            )}
          </div>

          <button className="lg:hidden p-3 text-[#bf953f]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-black/95 p-8 flex flex-col gap-5 text-right font-bold border-b border-[#bf953f]/20">
            {[
              ['home', 'الرئيسية'],
              ['about', 'من نحن'],
              ['bots', 'البوتات'],
              ['results', 'النتائج'],
              ['subscribe', 'الاشتراكات والإدارة'],
              ['blog', 'المدونة'],
              ['contact', 'تواصل معنا'],
              ['faqs', 'الأسئلة الشائعة'],
              ['terms', 'الشروط والأحكام']
            ].map(([page, label]) => (
              <button key={page} onClick={() => navigateTo(page)} className="text-gray-300 hover:text-[#fcf6ba]">
                {label}
              </button>
            ))}

            {user ? (
              <button onClick={() => navigateTo('profile')} className="text-gray-300 hover:text-[#fcf6ba]">
                الملف الشخصي
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowLoginModal(true);
                }}
                className={`mt-2 px-6 py-3 rounded-2xl ${goldBtnClass}`}
              >
                دخول
              </button>
            )}
          </div>
        )}
      </nav>

      <main className="flex-grow relative z-10">
        {loading && (
          <section className="py-24 px-4">
            <div className={`${goldCardClass} max-w-2xl mx-auto p-10 text-center`}>
              <Icons.RefreshCw className="mx-auto mb-5 animate-spin text-[#bf953f]" size={34} />
              <h3 className="text-2xl font-black mb-2">جاري تحميل البيانات</h3>
              <p className="text-gray-400">بنجهزلك أحدث البيانات والنتائج من السيرفر.</p>
            </div>
          </section>
        )}

        {!loading && error && (
          <section className="py-24 px-4">
            <div className={`${goldCardClass} max-w-2xl mx-auto p-10 text-center`}>
              <Icons.AlertCircle className="mx-auto mb-5 text-red-400" size={34} />
              <h3 className="text-2xl font-black mb-2">في مشكلة في الاتصال</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button onClick={() => fetchResults()} className={`px-8 py-3 rounded-2xl ${goldBtnClass}`}>
                إعادة المحاولة
              </button>
            </div>
          </section>
        )}

        {!loading && !error && currentPage === 'home' && (
          <>
            <section className="pt-20 pb-32 px-6 animate-in fade-in duration-700">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-10">
                <div className="text-center lg:text-right space-y-8">
                  <div className="inline-block px-4 py-2 rounded-full bg-[#bf953f]/10 border border-[#bf953f]/20 text-[#fcf6ba] text-xs font-black">
                    خوارزمية تداول الذهب الأكثر دقة
                  </div>

                  <h1 className="text-5xl md:text-7xl font-black leading-tight text-white">
                    اجعل التداول <br />
                    <span
                      key={currentPhraseIndex}
                      className="block text-7xl md:text-8xl font-black bg-gradient-to-b from-[#bf953f] via-                      [#fcf6ba] to-[#b38728] bg-clip-text text-transparent drop-                      shadow-[0_0_30px_rgba                      (191,149,63,0.3)] animate-pulse"
                    >
                      {heroPhrases[currentPhraseIndex]}
                    </span>
                  </h1>

                  <p className="text-lg md:text-2xl text-gray-300 font-bold max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    نظام تداول آلي بالكامل صُمم ليكون الأقوى في سوق الذهب والفوركس، بإدارة مخاطرة ذكية ونتائج مباشرة وتحديثات مستمرة.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button
                      onClick={() => navigateTo('subscribe')}
                      className="gold-btn px-10 py-4 rounded-xl text-lg"
                    >
                      ابدأ الآن
                    </button>

                    <button
                      onClick={() => navigateTo('results')}
                      className="px-10 py-5 rounded-2xl border border-[#bf953f]/30 bg-white/5 font-black hover:bg-white/10 transition-all"
                    >
                      شاهد النتائج
                    </button>
                  </div>

                  <div className="pt-2 flex justify-center lg:justify-start">
                    <a
                      href="https://t.me/CR7_B3"
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackUserAction('telegram')}
                      className="group relative flex items-center gap-5 bg-gradient-to-r from-[#7b5b17]/80 to-[#bf953f]/80 backdrop-blur-md border border-[#bf953f]/50 p-2 pr-2 pl-6 rounded-full shadow-[0_0_30px_rgba(191,149,63,0.25)] hover:shadow-[0_0_40px_rgba(191,149,63,0.4)] transition-all duration-300 active:scale-95"
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#8B6E36] shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Icons.Telegram size={24} />
                      </div>
                      <div className="flex flex-col text-right py-1">
                        <span className="text-white font-black text-sm uppercase tracking-widest leading-none">انضم للقناة العامة</span>
                        <span className="text-yellow-50/80 text-xs font-bold mt-1.5">تحديثات وتحليلات ونتائج يومية</span>
                      </div>
                    </a>
                  </div>
                </div>

                <div className="relative overflow-hidden bg-[#0a0a0a]/85 backdrop-blur-2xl border border-[#bf953f]/20 rounded-[40px] p-6 md:p-8 space-y-6 shadow-2xl">
                  <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#bf953f]/10 rounded-full blur-[90px]"></div>
                  <div className="absolute bottom-0 right-0 w-44 h-44 bg-[#fcf6ba]/5 rounded-full blur-[80px]"></div>

                  <div className="relative z-10 flex justify-between items-start gap-5 flex-row-reverse">
                    <div className="text-right">
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">LIVE COMMUNITY COUNTERS</p>
                      <h3 className={`text-2xl md:text-3xl mt-2 ${goldTextClass}`}>الأعداد المباشرة الحالية</h3>
                      <p className="text-gray-400 text-sm leading-7 mt-3 max-w-xl">{liveStatsHeadline}</p>
                    </div>
                    <div className="w-14 h-14 rounded-3xl bg-[#bf953f]/10 border border-[#bf953f]/30 flex items-center justify-center text-[#bf953f] shrink-0 shadow-[0_0_30px_rgba(191,149,63,0.18)]">
                      <Icons.Users size={28} />
                    </div>
                  </div>

                  <div className="relative z-10 grid grid-cols-3 gap-3">
                    <div className="bg-black/40 border border-[#bf953f]/10 rounded-3xl p-4 text-center">
                      <p className="text-[10px] text-gray-500 font-black mb-1">إجمالي النشاط</p>
                      <p className={`text-3xl ${goldTextClass}`}>{liveStatsTotal.toLocaleString()}</p>
                    </div>
                    <div className="bg-black/40 border border-[#bf953f]/10 rounded-3xl p-4 text-center">
                      <p className="text-[10px] text-gray-500 font-black mb-1">باقات نشطة</p>
                      <p className={`text-3xl ${goldTextClass}`}>{subscriptionStatsToShow.length + managementStatsToShow.length}</p>
                    </div>
                    <div className="bg-black/40 border border-[#bf953f]/10 rounded-3xl p-4 text-center">
                      <p className="text-[10px] text-gray-500 font-black mb-1">بوتات معروضة</p>
                      <p className={`text-3xl ${goldTextClass}`}>{botStatsToShow.length}</p>
                    </div>
                  </div>

                  <div className="relative z-10 space-y-6 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
                    <LiveStatsGroup
                      title="مشتركو باقات الاشتراك"
                      items={subscriptionStatsToShow}
                      icon={<Icons.CreditCard size={17} />}
                      emptyText="أضف باقات الاشتراك وعدد المشتركين من لوحة التحكم."
                    />

                    <LiveStatsGroup
                      title="مشتركو أنظمة الإدارة"
                      items={managementStatsToShow}
                      icon={<Icons.ShieldCheck size={17} />}
                      emptyText="أضف أنظمة الإدارة وعدد المشتركين من لوحة التحكم."
                    />

                    <LiveStatsGroup
                      title="عدد شراء البوتات"
                      items={botStatsToShow}
                      icon={<Icons.Cpu size={17} />}
                      emptyText="أضف البوتات وعدد المبيعات من لوحة التحكم."
                    />
                  </div>

                  <div className="relative z-10 flex items-center justify-between gap-4 flex-row-reverse border-t border-[#bf953f]/10 pt-5">
                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-black">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      تحديث تلقائي مباشر
                    </div>
                    <button onClick={() => navigateTo('subscribe')} className="text-xs font-black text-[#fcf6ba] hover:text-white transition-colors">
                      شاهد الخدمات ←
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="pb-28 px-4 md:px-8">
              <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                <div className={`${goldCardClass} p-8 text-center`}>
                  <Icons.ShieldCheck size={34} className="mx-auto text-[#bf953f] mb-4" />
                  <h3 className="text-xl font-black mb-3">إدارة مخاطرة ذكية</h3>
                  <p className="text-gray-400">تقسيم صفقات مدروس، وتحكم واضح في التوسع والخروج، مناسب للحسابات الممولة والحقيقية.</p>
                </div>
                <div className={`${goldCardClass} p-8 text-center`}>
                  <Icons.Cpu size={34} className="mx-auto text-[#bf953f] mb-4" />
                  <h3 className="text-xl font-black mb-3">خوارزميات متطورة</h3>
                  <p className="text-gray-400">بوتات شغالة بمنطق تداول احترافي وسريع مع تتبع أداء وتحديثات مستمرة من السيرفر.</p>
                </div>
                <div className={`${goldCardClass} p-8 text-center`}>
                  <Icons.BarChart3 size={34} className="mx-auto text-[#bf953f] mb-4" />
                  <h3 className="text-xl font-black mb-3">نتائج مباشرة</h3>
                  <p className="text-gray-400">صور وفيديوهات أرباح موثقة، وسجل نتائج يتحدث باستمرار لعرض الأداء الفعلي.</p>
                </div>
              </div>
            </section>

            {bots.length > 0 && (
              <section className="pb-28 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                  <SectionTitle title="أقوى البوتات" desc="أفضل الروبوتات المعروضة حالياً من CR7 BOT." />
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bots.slice(0, 3).map((bot) => (
                      <div key={bot.id || bot._id} className={`${goldCardClass} overflow-hidden flex flex-col`}>
                        <div className="h-56 relative">
                          <img src={bot.imageUrl} alt={bot.name} className="w-full h-full object-cover" />
                          {(bot.isBestSeller === 'true' || bot.isBestSeller === true) && (
                            <div className="absolute top-4 left-4 bg-[#bf953f] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">
                              الأكثر مبيعاً
                            </div>
                          )}
                        </div>
                        <div className="p-8 flex flex-col flex-grow text-right">
                          <h3 className="text-2xl font-black mb-3">{bot.name}</h3>
                          <p className="text-gray-400 mb-5">{bot.description}</p>
                          <div className="text-sm text-[#fcf6ba] font-bold mb-5">الدقة: {bot.accuracy}</div>
                          <button onClick={() => handleBotPurchaseClick(bot)} className={`mt-auto px-6 py-3 rounded-2xl ${goldBtnClass}`}>
                            شراء الآن
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {!loading && !error && currentPage === 'about' && (
          <section className="py-20 px-4 animate-in slide-in-from-bottom-10">
            <div className="max-w-6xl mx-auto">
              <SectionTitle title="من نحن" desc="نبذة مختصرة عن CR7 BOT وخدماتنا." />
              <div className={`${goldCardClass} p-8 md:p-12`}>
                <div className="grid lg:grid-cols-2 gap-10 items-start">
                  <div className="space-y-6 text-right">
                    <p className="text-lg text-gray-300 leading-8 whitespace-pre-wrap">
                      {settings.aboutUs || 'CR7 BOT هو نظام تداول آلي احترافي متخصص في تقديم بوتات تداول واشتراكات وإدارة حسابات مع واجهة احترافية، نتائج مباشرة، وتجربة استخدام واضحة وسريعة.'}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <StatCard label="دقة متوقعة" value="94%+" />
                      <StatCard label="تحديثات" value="مستمرة" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-black/40 border border-[#bf953f]/10 rounded-3xl p-6">
                      <h4 className="font-black mb-2 text-[#fcf6ba]">رؤيتنا</h4>
                      <p className="text-gray-400">نوفر بيئة احترافية تجمع بين البوتات، النتائج، الباقات، والدعم في مكان واحد.</p>
                    </div>
                    <div className="bg-black/40 border border-[#bf953f]/10 rounded-3xl p-6">
                      <h4 className="font-black mb-2 text-[#fcf6ba]">مهمتنا</h4>
                      <p className="text-gray-400">تقديم حلول تداول آلي قوية وسهلة، مع شفافية في عرض النتائج ووضوح في التواصل مع العميل.</p>
                    </div>
                    <div className="bg-black/40 border border-[#bf953f]/10 rounded-3xl p-6">
                      <h4 className="font-black mb-2 text-[#fcf6ba]">ما يميزنا</h4>
                      <p className="text-gray-400">تصميم سريع، مصادقة Google، مدونة تفاعلية، APIs مباشرة، وتجربة VIP متكاملة.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {!loading && !error && currentPage === 'bots' && (
          <section className="py-20 px-4 animate-in slide-in-from-bottom-10">
            <div className="max-w-7xl mx-auto">
              <SectionTitle title="البوتات والخوارزميات" desc="كل البوتات المتاحة حالياً للشراء." />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bots.map((bot) => (
                  <div key={bot.id || bot._id} className={`${goldCardClass} overflow-hidden flex flex-col`}>
                    <div className="h-60 relative">
                      <img src={bot.imageUrl} alt={bot.name} className="w-full h-full object-cover" />
                      {(bot.isBestSeller === 'true' || bot.isBestSeller === true) && (
                        <div className="absolute top-4 left-4 bg-[#bf953f] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">
                          الأكثر مبيعاً
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col flex-grow text-right">
                      <h3 className="text-2xl font-black mb-3">{bot.name}</h3>
                      <p className="text-gray-400 mb-5">{bot.description}</p>
                      <ul className="space-y-3 mb-8 flex-grow">
                        {(bot.features || []).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 justify-end text-sm text-gray-300">
                            <Icons.CheckCircle size={16} className="text-[#bf953f]" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between items-center border-t border-[#bf953f]/10 pt-6">
                        <span className={`text-3xl ${goldTextClass}`}>${bot.price}</span>
                        <button onClick={() => handleBotPurchaseClick(bot)} className={`px-6 py-2 rounded-xl ${goldBtnClass}`}>
                          شراء
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!loading && !error && currentPage === 'results' && (
          <section className="py-20 px-4 animate-in slide-in-from-bottom-10">
            <div className="max-w-7xl mx-auto">
              <SectionTitle title="النتائج المباشرة" desc="اضغط على أي صورة لعرضها كاملة، وبيانات حساب المشاهدة متاحة للنسخ مباشرة." />

              <div className={`${goldCardClass} p-6 md:p-8 mb-14`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-[#bf953f]/10 pb-6 mb-6">
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 bg-[#bf953f]/10 border border-[#bf953f]/30 text-[#fcf6ba] px-4 py-2 rounded-full text-xs font-black mb-4">
                      <Icons.ShieldCheck size={16} />
                      حساب مشاهدة مباشر
                    </div>
                    <h3 className={`text-3xl md:text-4xl mb-3 ${goldTextClass}`}>بيانات حساب المشاهدة</h3>
                    <p className="text-gray-400 max-w-2xl leading-7">
                      استخدم البيانات التالية للدخول بحساب مشاهدة فقط ومتابعة الحساب والصفقات من منصة التداول.
                    </p>
                  </div>

                  <button
                    onClick={copyViewerAccount}
                    disabled={!hasViewerAccount}
                    className={`px-7 py-4 rounded-2xl ${hasViewerAccount ? goldBtnClass : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'}`}
                  >
                    {copiedField === 'all-viewer-account' ? 'تم نسخ بيانات الحساب' : 'نسخ بيانات الحساب'}
                  </button>
                </div>

                {hasViewerAccount ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ViewerAccountField label="المنصة" value={viewerAccount.platform} fieldKey="viewer-platform" />
                    <ViewerAccountField label="البروكر" value={viewerAccount.broker} fieldKey="viewer-broker" />
                    <ViewerAccountField label="السيرفر" value={viewerAccount.server} fieldKey="viewer-server" />
                    <ViewerAccountField label="رقم الحساب" value={viewerAccount.accountNumber} fieldKey="viewer-account-number" />
                    <ViewerAccountField label="باسورد المشاهدة" value={viewerAccount.password} fieldKey="viewer-password" />
                    <ViewerAccountField label="ملاحظة" value={viewerAccount.note} fieldKey="viewer-note" />
                  </div>
                ) : (
                  <div className="bg-black/40 border border-[#bf953f]/10 rounded-3xl p-6 text-center">
                    <Icons.Info size={28} className="mx-auto text-[#bf953f] mb-3" />
                    <p className="text-gray-400 font-bold">لم يتم إضافة بيانات حساب المشاهدة بعد. سيتم عرضها هنا تلقائياً بعد إضافتها من لوحة التحكم.</p>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.map((res) => (
                  <div key={res.id || res._id} className={`${goldCardClass} overflow-hidden`}>
                    <div
                      className={`relative h-64 overflow-hidden ${res.mediaType === 'video' ? '' : 'cursor-zoom-in'}`}
                      onClick={() => {
                        if (res.mediaType !== 'video') setSelectedResult(res);
                      }}
                    >
                      {res.mediaType === 'video' ? (
                        <video
                          src={res.mediaUrl}
                          className="w-full h-full object-contain bg-black"
                          loop
                          controls
                        />
                      ) : (
                        <>
                          <img src={res.mediaUrl} alt="result" className="w-full h-full object-contain bg-white" />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/25 transition-all flex items-center justify-center">
                            <span className="opacity-0 hover:opacity-100 transition-all bg-black/80 border border-[#bf953f]/30 text-[#fcf6ba] px-4 py-2 rounded-full text-xs font-black">
                              اضغط لعرض الصورة كاملة
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="p-6 text-right">
                      <div className="flex justify-between items-center flex-row-reverse">
                        <div>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">صافي الربح</p>
                          <p className={`text-3xl ${goldTextClass}`}>+${res.profitAmount}</p>
                        </div>
                        <button
                          onClick={() => setSelectedResult(res)}
                          className="w-12 h-12 rounded-2xl bg-[#bf953f]/10 border border-[#bf953f]/30 flex items-center justify-center text-[#bf953f] hover:bg-[#bf953f] hover:text-black transition-all"
                          title="عرض النتيجة كاملة"
                        >
                          <Icons.ArrowUpRight size={24} />
                        </button>
                      </div>
                      {res.notes ? <p className="text-gray-400 mt-4">{res.notes}</p> : null}
                      <p className="text-xs text-gray-500 mt-4">{new Date(res.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!loading && !error && currentPage === 'subscribe' && (
          <section className="py-20 px-4 animate-in slide-in-from-bottom-10">
            <div className="max-w-7xl mx-auto">
              <SectionTitle title="خدماتنا" desc="بيع الروبوتات، الباقات الشهرية، وخدمات إدارة الحسابات في مكان واحد." />

              {bots.length > 0 && (
                <div className="mb-16">
                  <h3 className="text-2xl font-black mb-8 text-center text-[#fcf6ba]">بيع الروبوتات</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bots.map((bot) => (
                      <div key={bot.id || bot._id} className={`${goldCardClass} overflow-hidden flex flex-col`}>
                        <div className="h-60 relative">
                          <img src={bot.imageUrl} alt={bot.name} className="w-full h-full object-cover" />
                          {(bot.isBestSeller === 'true' || bot.isBestSeller === true) && (
                            <div className="absolute top-4 left-4 bg-[#bf953f] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">
                              الأكثر مبيعاً
                            </div>
                          )}
                        </div>
                        <div className="p-8 flex flex-col flex-grow text-right">
                          <h4 className="text-2xl font-black mb-3">{bot.name}</h4>
                          <p className="text-gray-400 mb-5">{bot.description}</p>
                          <ul className="space-y-3 mb-8 flex-grow">
                            {(bot.features || []).map((f, i) => (
                              <li key={i} className="flex items-center gap-2 justify-end text-sm text-gray-300">
                                <Icons.CheckCircle size={16} className="text-[#bf953f]" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <div className="flex justify-between items-center border-t border-[#bf953f]/10 pt-6">
                            <span className={`text-3xl ${goldTextClass}`}>${bot.price}</span>
                            <button onClick={() => handleBotPurchaseClick(bot)} className={`px-6 py-2 rounded-xl ${goldBtnClass}`}>
                              شراء الآن
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {subscriptionPlans.length > 0 && (
                <div className="mb-16">
                  <h3 className="text-2xl font-black mb-8 text-center text-[#fcf6ba]">باقات الاشتراك</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {subscriptionPlans.map((plan) => (
                      <div key={plan.id || plan._id} className={`${goldCardClass} p-8 flex flex-col text-right`}>
                        {(plan.isBestSeller === 'true' || plan.isBestSeller === true) && (
                          <div className="mb-5 w-fit bg-[#bf953f] text-black px-4 py-1 rounded-full text-[10px] font-black uppercase">
                            الأكثر طلباً
                          </div>
                        )}
                        <h4 className="text-2xl font-black mb-4">{plan.title}</h4>
                        <p className="text-gray-400 mb-3">رأس المال: {plan.capital}</p>
                        <p className={`text-4xl ${goldTextClass} mb-6`}>{plan.fee}</p>
                        <ul className="space-y-3 mb-8 flex-grow">
                          {(plan.features || []).map((f, i) => (
                            <li key={i} className="flex items-center gap-2 justify-end text-sm text-gray-300">
                              <Icons.Check size={16} className="text-[#bf953f]" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => handlePlanClick('الاشتراكات', plan.title, plan.capital, plan.fee)} className={`mt-auto px-6 py-3 rounded-2xl ${goldBtnClass}`}>
                          اشترك الآن
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {managementPlans.length > 0 && (
                <div>
                  <h3 className="text-2xl font-black mb-8 text-center text-[#fcf6ba]">إدارة الحسابات</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {managementPlans.map((plan) => (
                      <div key={plan.id || plan._id} className={`${goldCardClass} p-8 flex flex-col text-right`}>
                        <h4 className="text-2xl font-black mb-4">{plan.title}</h4>
                        <p className="text-gray-400 mb-3">رأس المال: {plan.capital}</p>
                        <p className={`text-4xl ${goldTextClass} mb-6`}>{plan.fee}</p>
                        <ul className="space-y-3 mb-8 flex-grow">
                          {(plan.features || []).map((f, i) => (
                            <li key={i} className="flex items-center gap-2 justify-end text-sm text-gray-300">
                              <Icons.Check size={16} className="text-[#bf953f]" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => handlePlanClick('الإدارة', plan.title, plan.capital, plan.fee)} className={`mt-auto px-6 py-3 rounded-2xl ${goldBtnClass}`}>
                          ابدأ الإدارة
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {!loading && !error && currentPage === 'blog' && (
          <section className="py-20 px-4 animate-in slide-in-from-bottom-10">
            <div className="max-w-4xl mx-auto">
              <SectionTitle title="المدونة" desc="آخر المقالات والأخبار والتحديثات." />
              <div className="space-y-12">
                {posts.map((post) => {
                  const pid = post.id || post._id || '';
                  const isExpanded = expandedPostId === pid;
                  return (
                    <div key={pid} className={`${goldCardClass} overflow-hidden`}>
                      <div className="p-6 flex items-center gap-4 border-b border-[#bf953f]/10 flex-row-reverse text-right">
                        <img
                          src="https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg"
                          alt="author"
                          className="w-10 h-10 rounded-full border border-[#bf953f]/30"
                        />
                        <div>
                          <h4 className="font-black text-white text-sm">CR7 ADMIN</h4>
                          <p className="text-[10px] text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="p-8 text-right space-y-4">
                        <h3 className={`text-2xl font-black ${goldTextClass}`}>{post.title}</h3>
                        <p className="text-gray-300 font-bold whitespace-pre-wrap leading-8">{post.content}</p>
                      </div>

                      {post.imageUrl ? <img src={post.imageUrl} alt={post.title} className="w-full border-y border-[#bf953f]/10" /> : null}

                      <div className="p-4 flex gap-8 flex-row-reverse border-t border-[#bf953f]/10 px-8">
                        <button onClick={() => handleLike(pid)} className={`flex items-center gap-2 ${user && post.likes?.includes(user.uid) ? 'text-red-500' : ''}`}>
                          <Icons.Heart size={20} />
                          {post.likes?.length || 0}
                        </button>
                        <button onClick={() => setExpandedPostId(isExpanded ? null : pid)} className="flex items-center gap-2 hover:text-[#bf953f]">
                          <Icons.MessageCircle size={20} />
                          {post.comments?.length || 0}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="p-6 bg-black/40 border-t border-[#bf953f]/10 space-y-6">
                          <div className="max-h-60 overflow-y-auto space-y-4 custom-scrollbar">
                            {(post.comments || []).map((c, i) => (
                              <div key={i} className="bg-white/5 p-3 rounded-xl text-right">
                                <div className="flex items-center gap-3 justify-end mb-2">
                                  <span className={`text-xs font-black ${goldTextClass}`}>{c.userName}</span>
                                  {c.userImage ? <img src={c.userImage} alt={c.userName} className="w-7 h-7 rounded-full" /> : null}
                                </div>
                                <p className="text-sm text-gray-300">{c.text}</p>
                              </div>
                            ))}
                          </div>

                          {user ? (
                            <div className="flex gap-2 flex-row-reverse">
                              <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="اكتب تعليقاً..."
                                className="flex-1 bg-white/5 border border-[#bf953f]/20 rounded-lg px-4 text-right text-sm outline-none h-12"
                              />
                              <button onClick={() => handleAddComment(pid)} className={`px-4 py-2 rounded-lg text-xs ${goldBtnClass}`}>
                                إرسال
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setShowLoginModal(true)} className={`px-4 py-3 rounded-xl text-sm ${goldBtnClass}`}>
                              سجّل دخول علشان تكتب تعليق
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {!loading && !error && currentPage === 'contact' && (
          <section className="py-20 px-4 animate-in slide-in-from-bottom-10">
            <div className="max-w-6xl mx-auto">
              <SectionTitle title="تواصل معنا" desc="كل طرق التواصل الرسمية الخاصة بينا." />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <a href={settings.contact.telegram || 'https://t.me/CR7_B3'} target="_blank" rel="noreferrer" className={`${goldCardClass} p-8 text-center`}>
                  <Icons.Telegram size={32} className="mx-auto text-[#bf953f] mb-4" />
                  <h3 className="text-xl font-black mb-2">Telegram</h3>
                  <p className="text-gray-400 break-all">{settings.contact.telegram || 'https://t.me/CR7_B3'}</p>
                </a>
                <a href={settings.contact.whatsapp ? `https://wa.me/${settings.contact.whatsapp.replace(/\D/g, '')}` : '#'} target="_blank" rel="noreferrer" className={`${goldCardClass} p-8 text-center`}>
                  <Icons.Phone size={32} className="mx-auto text-[#bf953f] mb-4" />
                  <h3 className="text-xl font-black mb-2">WhatsApp</h3>
                  <p className="text-gray-400 break-all">{settings.contact.whatsapp || 'غير متوفر'}</p>
                </a>
                <a href={settings.contact.email ? `mailto:${settings.contact.email}` : '#'} className={`${goldCardClass} p-8 text-center`}>
                  <Icons.Globe size={32} className="mx-auto text-[#bf953f] mb-4" />
                  <h3 className="text-xl font-black mb-2">Email</h3>
                  <p className="text-gray-400 break-all">{settings.contact.email || 'غير متوفر'}</p>
                </a>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-8">
                {settings.contact.facebook ? (
                  <a href={settings.contact.facebook} target="_blank" rel="noreferrer" className={`${goldCardClass} p-6 text-center`}>
                    <Icons.Facebook className="mx-auto text-[#bf953f] mb-3" />
                    <div className="font-black">Facebook</div>
                  </a>
                ) : null}
                {settings.contact.instagram ? (
                  <a href={settings.contact.instagram} target="_blank" rel="noreferrer" className={`${goldCardClass} p-6 text-center`}>
                    <Icons.Instagram className="mx-auto text-[#bf953f] mb-3" />
                    <div className="font-black">Instagram</div>
                  </a>
                ) : null}
                {settings.contact.tiktok ? (
                  <a href={settings.contact.tiktok} target="_blank" rel="noreferrer" className={`${goldCardClass} p-6 text-center`}>
                    <Icons.TikTok className="mx-auto text-[#bf953f] mb-3" />
                    <div className="font-black">TikTok</div>
                  </a>
                ) : null}
              </div>
            </div>
          </section>
        )}

        {!loading && !error && currentPage === 'faqs' && (
          <section className="py-20 px-4 animate-in slide-in-from-bottom-10">
            <div className="max-w-4xl mx-auto">
              <SectionTitle title="الأسئلة الشائعة" desc="إجابات مختصرة على أهم الأسئلة." />
              <div className="space-y-5">
                {(settings.faqs || []).length > 0 ? (
                  settings.faqs.map((faq, i) => (
                    <div key={i} className={`${goldCardClass} p-6`}>
                      <div className="flex items-start gap-3 flex-row-reverse">
                        <Icons.HelpCircle className="text-[#bf953f] shrink-0 mt-1" />
                        <div className="text-right">
                          <h4 className="font-black text-lg mb-2">{faq.question}</h4>
                          <p className="text-gray-400 leading-8">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`${goldCardClass} p-8 text-center text-gray-400`}>
                    لا يوجد أسئلة شائعة مضافة حالياً.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {!loading && !error && currentPage === 'terms' && (
          <section className="py-20 px-4 animate-in slide-in-from-bottom-10">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="الشروط والأحكام" desc="يرجى قراءة البنود بعناية." />
              <div className={`${goldCardClass} p-8 md:p-10`}>
                <div className="flex items-start gap-4 flex-row-reverse text-right">
                  <Icons.FileText className="text-[#bf953f] shrink-0 mt-1" />
                  <div className="text-gray-300 leading-8 whitespace-pre-wrap">
                    {settings.terms || 'لا توجد شروط وأحكام مضافة حالياً.'}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {!loading && !error && currentPage === 'profile' && (
          <section className="py-20 px-4 animate-in slide-in-from-bottom-10">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="الملف الشخصي" desc="بيانات حسابك ونشاطك الأخير." />

              {!user ? (
                <div className={`${goldCardClass} p-10 text-center`}>
                  <Icons.User size={34} className="mx-auto text-[#bf953f] mb-4" />
                  <h3 className="text-2xl font-black mb-3">أنت مش مسجل دخول</h3>
                  <p className="text-gray-400 mb-6">سجّل دخول بحساب Google علشان تشوف ملفك الشخصي ونشاطك.</p>
                  <button onClick={() => setShowLoginModal(true)} className={`px-8 py-3 rounded-2xl ${goldBtnClass}`}>
                    تسجيل الدخول
                  </button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className={`${goldCardClass} p-8 text-center`}>
                    <img src={user.photoURL || ""} alt={user.displayName || "User"} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-[#bf953f]/40" />
                    <h3 className="text-2xl font-black mb-2">{user.displayName}</h3>
                    <p className="text-gray-400 break-all mb-6">{user.email}</p>
                    <button onClick={handleLogout} className="w-full py-3 rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2">
                      <Icons.LogOut size={18} />
                      تسجيل الخروج
                    </button>
                  </div>

                  <div className={`${goldCardClass} p-8 lg:col-span-2`}>
                    <h3 className="text-2xl font-black mb-6 text-right">آخر نشاط</h3>
                    <div className="space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                      {userActivity.length > 0 ? (
                        userActivity.map((activity, index) => (
                          <div key={index} className="bg-black/40 border border-[#bf953f]/10 rounded-2xl p-4 text-right">
                            <p className="font-bold">{activity.action}</p>
                            <p className="text-xs text-gray-500 mt-2">{new Date(activity.date).toLocaleString()}</p>
                          </div>
                        ))
                      ) : (
                        <div className="bg-black/40 border border-[#bf953f]/10 rounded-2xl p-6 text-center text-gray-400">
                          لا يوجد نشاط محفوظ حتى الآن.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {selectedResult && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setSelectedResult(null)}></div>
          <div className="relative z-10 w-full max-w-6xl max-h-[92vh] bg-[#0a0a0a] border border-[#bf953f]/40 rounded-[28px] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 md:p-5 flex items-center justify-between gap-4 border-b border-[#bf953f]/20 flex-row-reverse">
              <div className="text-right">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">عرض النتيجة كاملة</p>
                <p className={`text-2xl ${goldTextClass}`}>+${selectedResult.profitAmount}</p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#bf953f] hover:text-black transition-all"
              >
                <Icons.X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-black flex items-center justify-center">
              {selectedResult.mediaType === 'video' ? (
                <video
                  src={selectedResult.mediaUrl}
                  className="w-full h-auto max-h-[75vh] object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={selectedResult.mediaUrl}
                  alt="result full"
                  className="w-auto h-auto max-w-full max-h-[75vh] object-contain"
                />
              )}
            </div>

            <div className="p-4 md:p-5 border-t border-[#bf953f]/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-right">
              <div>
                {selectedResult.notes ? <p className="text-gray-300 font-bold mb-1">{selectedResult.notes}</p> : null}
                <p className="text-xs text-gray-500">{new Date(selectedResult.createdAt).toLocaleString()}</p>
              </div>
              <a
                href={selectedResult.mediaUrl}
                target="_blank"
                rel="noreferrer"
                className={`px-6 py-3 rounded-2xl text-center ${goldBtnClass}`}
              >
                فتح الصورة الأصلية
              </a>
            </div>
          </div>
        </div>
      )}

      <footer className="py-20 border-t border-[#bf953f]/20 bg-black z-10 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className={`text-2xl italic mb-6 ${goldTextClass}`}>CR7 BOT GOLD TRADING</h3>
          <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
            <button onClick={() => navigateTo('about')} className="text-gray-400 hover:text-white">من نحن</button>
            <button onClick={() => navigateTo('results')} className="text-gray-400 hover:text-white">النتائج</button>
            <button onClick={() => navigateTo('subscribe')} className="text-gray-400 hover:text-white">الاشتراكات</button>
            <button onClick={() => navigateTo('faqs')} className="text-gray-400 hover:text-white">الأسئلة الشائعة</button>
            <button onClick={() => navigateTo('terms')} className="text-gray-400 hover:text-white">الشروط</button>
            <button onClick={() => navigateTo('contact')} className="text-gray-400 hover:text-white">تواصل معنا</button>
          </div>
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.5em]">© 2026 CR7 TRADING SYSTEMS - ALL RIGHTS RESERVED</p>
        </div>
      </footer>

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowLoginModal(false)}></div>
          <div className="bg-[#0a0a0a] border border-[#bf953f]/40 w-full max-w-md rounded-[40px] p-12 relative z-10 text-center">
            <h2 className={`text-3xl font-black mb-8 ${goldTextClass}`}>دخول النخبة</h2>
            <button onClick={handleGoogleLogin} className={`w-full flex items-center justify-center gap-4 py-5 rounded-2xl text-xl ${goldBtnClass}`}>
              <Icons.Google size={24} />
              المتابعة بحساب Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
 
