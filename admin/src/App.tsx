'use client';
import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, type User } from 'firebase/auth';

// ==========================================
// تعريف الأنواع (Interfaces) لـ TypeScript
// ==========================================
interface IconProps {
  size?: number;
  className?: string;
  fill?: string;
}

interface ResultData {
  id?: string;
  _id?: string;
  mediaType: string;
  mediaUrl: string;
  profitAmount: string | number;
  createdAt: string;
}

interface BotData {
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

interface PlanData {
  id?: string;
  _id?: string;
  type: string;
  title: string;
  capital: string;
  fee: string;
  features: string[];
  isBestSeller?: boolean | string;
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

interface FaqItem {
  question: string;
  answer: string;
}

interface TestimonialData {
  id?: string;
  _id?: string;
  imageUrl: string;
  title: string;
  clientName?: string;
  service?: string;
  serviceType?: string;
  order?: number | string;
  isVisible?: boolean | string;
  createdAt?: string;
}

interface ViewerAccountData {
  accountNumber: string;
  broker: string;
  server: string;
  password: string;
  platform: string;
  note: string;
}

interface LiveStatsItem {
  id: string;
  title: string;
  count: number;
  note?: string;
  isVisible?: boolean;
}

interface LiveStatsData {
  headline: string;
  subscriptions: LiveStatsItem[];
  management: LiveStatsItem[];
  bots: LiveStatsItem[];
}

interface SmartNotificationItem {
  id: string;
  title: string;
  text: string;
  type: 'sale' | 'subscribe' | 'management' | 'copy' | 'telegram' | 'custom';
  icon: string;
  country: string;
  isVisible: boolean;
}

interface SmartNotificationsData {
  enabled: boolean;
  startDelayMs: number;
  minDelayMs: number;
  maxDelayMs: number;
  displayDurationMs: number;
  items: SmartNotificationItem[];
}

interface SettingsData {
  contact: { telegram: string; whatsapp: string; email: string };
  faqs: FaqItem[];
  terms: string;
  aboutUs: string;
  heroPhrases: string[];
  viewerAccount: ViewerAccountData;
  liveStats: LiveStatsData;
  smartNotifications: SmartNotificationsData;
}

// ==========================================
// أيقونات SVG مدمجة فائقة الجودة
// ==========================================
const Icons = {
  Lock: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  LogOut: ({ size = 20, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Activity: ({ size = 20, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  Cpu: ({ size = 20, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="24" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>,
  Trash: ({ size = 16, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Edit: ({ size = 16, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Plus: ({ size = 20, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Star: ({ size = 20, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
  ShieldCheck: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m9 12 2 2 4-4"></path></svg>,
  Image: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
  ShieldAlert: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  Menu: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>,
  X: ({ size = 20, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Settings: ({ size = 20, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Phone: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  HelpCircle: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  FileText: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Info: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
  PieChart: ({ size = 20, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>,
  Users: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Telegram: ({ size = 24, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13v8l4-5"/></svg>,
  Globe: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/><path d="M2 12h20"/></svg>,
  TrendingUp: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  BookOpen: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>,
  Heart: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  MessageCircle: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
  CheckCircle: ({ size = 24, className = "", fill = "none" }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
};

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// إعدادات Firebase الجديدة
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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ---------------------------------------------------------
// 1. شاشة تسجيل الدخول للوحة التحكم
// ---------------------------------------------------------
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
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6 font-sans relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
      </div>
      
      <div className="bg-[#080a0f] border border-white/10 p-10 md:p-14 rounded-[40px] shadow-2xl w-full max-w-lg z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/10 overflow-hidden bg-white/5">
            <img src="https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg" alt="CR7 Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">CR7 ADMIN V2</h1>
          <p className="text-gray-500 text-sm mt-2 font-bold uppercase tracking-widest">بوابة الإدارة المشفرة</p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold">
            <Icons.ShieldAlert /> <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-widest pr-1">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-all placeholder:text-gray-700" placeholder="admin@cr7.com" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-widest pr-1">كلمة المرور</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-all placeholder:text-gray-700" placeholder="••••••••" />
          </div>
          <button disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50">
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// 2. قسم الإحصائيات (Statistics Manager)
// ---------------------------------------------------------
const StatisticsManager = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    visits: { daily: 0, monthly: 0, total: 0 },
    telegramClicks: 0,
    managementSubs: 0,
    botsSales: [],
    plansSales: [],
    chartData: [
      { label: 'قبل 5 أيام', value: 0 }, { label: 'قبل 4 أيام', value: 0 }, { label: 'قبل 3 أيام', value: 0 },
      { label: 'قبل يومين', value: 0 }, { label: 'أمس', value: 0 }, { label: 'اليوم', value: 0 }
    ]
  });

  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('https://cr7-kappa.vercel.app/api/statistics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          setStats((prev: any) => ({ ...prev, ...data.data }));
        }
      } catch (err) {
        console.error('لم يتم العثور على مسار الإحصائيات في السيرفر بعد. يتم عرض القيم الصفرية.');
      } finally {
        setLoading(false);
      }
    };
    fetchRealStats();
  }, []);

  const maxChartValue = Math.max(...stats.chartData.map((d: any) => d.value), 10);

  const handleResetStats = async () => {
    if (!confirm('⚠️ تحذير: هل أنت متأكد من تصفير جميع الإحصائيات والمبيعات؟ لا يمكن التراجع!')) return;
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('https://cr7-kappa.vercel.app/api/statistics/reset', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('تم تصفير الإحصائيات بنجاح!');
        window.location.reload(); 
      } else {
        alert('حدث خطأ أثناء التصفير.');
      }
    } catch (err) {
      alert('فشل الاتصال بالسيرفر.');
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="py-20 text-center text-blue-500 font-bold animate-pulse">جاري تحميل الإحصائيات الحية...</div>;
  }

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-500">
      
      {/* ✨ العنوان وزر التصفير ✨ */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[#080a0f] p-6 rounded-[30px] border border-white/5 shadow-2xl gap-4">
         <h2 className="text-2xl font-black text-white">نظرة عامة</h2>
         <button onClick={handleResetStats} className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-red-500/20 flex items-center gap-2">
           <Icons.Trash size={16} /> تصفير الإحصائيات والمبيعات
         </button>
      </div>

      {/* 1. الكروت العلوية (نظرة عامة حقيقية) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#080a0f] border border-white/5 rounded-[30px] p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Icons.Activity size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1 relative z-10">زيارات اليوم</p>
          <h3 className="text-4xl font-black text-white relative z-10">{stats.visits.daily}</h3>
        </div>

        <div className="bg-[#080a0f] border border-white/5 rounded-[30px] p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Icons.Users size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1 relative z-10">زيارات الشهر</p>
          <h3 className="text-4xl font-black text-white relative z-10">{stats.visits.monthly.toLocaleString()}</h3>
        </div>

        <div className="bg-[#080a0f] border border-white/5 rounded-[30px] p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Icons.Globe size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1 relative z-10">إجمالي الزيارات</p>
          <h3 className="text-4xl font-black text-white relative z-10">{stats.visits.total.toLocaleString()}</h3>
        </div>

        <div className="bg-[#080a0f] border border-white/5 rounded-[30px] p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-400/10 rounded-full blur-xl group-hover:bg-blue-400/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Icons.Telegram size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1 relative z-10">زوار قناة تليجرام</p>
          <h3 className="text-4xl font-black text-white relative z-10">{stats.telegramClicks.toLocaleString()}</h3>
        </div>
      </div>

      {/* 2. الرسم البياني الاحترافي */}
      <div className="bg-[#080a0f] border border-white/5 rounded-[40px] p-8 shadow-2xl">
        <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
          <Icons.TrendingUp className="text-blue-500" /> نشاط التفاعلات في الأيام الماضية
        </h3>
        
        <div className="relative h-64 w-full flex items-end justify-between gap-2 pt-6 border-b border-white/10 pb-4">
          <div className="absolute inset-0 flex flex-col justify-between pb-4 pointer-events-none opacity-20">
             <div className="w-full border-b border-dashed border-gray-500"></div>
             <div className="w-full border-b border-dashed border-gray-500"></div>
             <div className="w-full border-b border-dashed border-gray-500"></div>
          </div>

          {stats.chartData.map((dataPoint: any, idx: number) => {
            const heightPercentage = (dataPoint.value / maxChartValue) * 100;
            return (
              <div key={idx} className="relative flex flex-col items-center flex-1 group h-full justify-end z-10">
                <div className="absolute -top-10 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                  {dataPoint.value} تفاعل
                </div>
                <div 
                  style={{ height: `${heightPercentage}%` }} 
                  className="w-full max-w-[40px] bg-gradient-to-t from-blue-600/20 to-blue-500 rounded-t-xl transition-all duration-700 ease-out group-hover:to-blue-400 min-h-[4px]"
                ></div>
                <span className="text-[10px] sm:text-xs text-gray-400 font-bold mt-3 text-center truncate w-full">
                  {dataPoint.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. الجداول والتفاصيل */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* مبيعات البوتات */}
        <div className="bg-[#080a0f] border border-white/5 rounded-[40px] p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <Icons.Cpu className="text-blue-500" /> مبيعات البوتات
            </h3>
          </div>
          <div className="space-y-4">
            {stats.botsSales.length > 0 ? stats.botsSales.map((bot: any, idx: number) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-sm">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2">
                      {bot.name} {bot.isBestSeller && <Icons.Star size={14} className="text-yellow-500" fill="currentColor" />}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{bot.count} نقرة شراء</p>
                  </div>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">الإيرادات</p>
                  <p className="text-lg font-black text-green-400">{bot.revenue}</p>
                </div>
              </div>
            )) : <p className="text-gray-500 text-center py-6 text-sm">لا توجد مبيعات مسجلة حتى الآن.</p>}
          </div>
        </div>

        {/* مبيعات الاشتراكات والإدارة */}
        <div className="bg-[#080a0f] border border-white/5 rounded-[40px] p-8 shadow-2xl flex flex-col gap-8">
          
          <div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <Icons.ShieldCheck className="text-indigo-500" /> الاشتراكات المفعلة
              </h3>
            </div>
            <div className="space-y-4">
              {stats.plansSales.length > 0 ? stats.plansSales.map((plan: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-sm">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2">
                        {plan.name} {plan.isBestSeller && <Icons.Star size={14} className="text-yellow-500" fill="currentColor" />}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{plan.count} نقرة اشتراك</p>
                    </div>
                  </div>
                  <div className="text-right sm:text-left">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">الإيرادات المتوقعة</p>
                    <p className="text-lg font-black text-green-400">{plan.revenue}</p>
                  </div>
                </div>
              )) : <p className="text-gray-500 text-center py-6 text-sm">لا توجد اشتراكات مسجلة حتى الآن.</p>}
            </div>
          </div>

          {/* قسم الإدارة */}
          <div className="mt-auto bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 rounded-3xl p-6 flex justify-between items-center">
            <div>
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mb-1">قسم إدارة المحافظ</p>
              <h4 className="text-xl font-black text-white">نقرات الإدارة</h4>
            </div>
            <div className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              {stats.managementSubs}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

// ---------------------------------------------------------
// 3. إدارة النتائج (Results Manager)
// ---------------------------------------------------------
const ResultsManager = () => {
  const [file, setFile] = useState<File | null>(null);
  const [profit, setProfit] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultData[]>([]);

  const fetchResults = async () => {
    try {
      const res = await fetch('https://cr7-kappa.vercel.app/api/results');
      const data = await res.json();
      if (data.success) setResults(data.data);
    } catch (err) { console.error("Error fetching results"); }
  };

  useEffect(() => { fetchResults(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('يرجى اختيار ملف!');
    setLoading(true);
    const formData = new FormData();
    formData.append('media', file);
    formData.append('profitAmount', profit);
    formData.append('notes', notes);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('https://cr7-kappa.vercel.app/api/results/upload', { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData 
      });
      const data = await res.json();
      if (data.success) {
        alert('تم رفع النتيجة بنجاح! ✅');
        fetchResults();
        setFile(null); setProfit(''); setNotes('');
      } else { alert('خطأ من السيرفر: ' + data.message); }
    } catch (err) { alert('فشل الاتصال بالسيرفر! تأكد من تشغيل الباك إند.'); }
    setLoading(false);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('هل أنت متأكد من حذف هذه النتيجة نهائياً؟')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`https://cr7-kappa.vercel.app/api/results/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success || res.ok) {
        fetchResults();
      } else {
        alert('حدث خطأ أثناء الحذف: ' + (data.message || ''));
      }
    } catch (err) {
      alert('فشل الاتصال بالسيرفر أثناء الحذف.');
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start w-full animate-in fade-in duration-500">
      <div className="w-full xl:w-[350px] 2xl:w-[400px] bg-[#080a0f] border border-white/5 p-6 md:p-8 rounded-[40px] shadow-2xl shrink-0">
        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3"><Icons.Activity /> رفع أرباح اليوم</h2>
        <form onSubmit={handleUpload} className="space-y-5">
          <div className="border-2 border-dashed border-white/10 p-8 rounded-3xl text-center relative hover:bg-white/5 transition-colors cursor-pointer group">
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="flex justify-center mb-3 text-gray-500 group-hover:text-blue-500 transition-colors"><Icons.Image /></div>
            <p className="text-xs text-gray-400 truncate">{file ? file.name : 'اسحب ملف الصورة أو الفيديو هنا'}</p>
          </div>
          <input type="number" placeholder="مبلغ الربح ($)" value={profit} onChange={e => setProfit(e.target.value)} required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" />
          <textarea placeholder="ملاحظات (اختياري)..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none h-28 focus:border-blue-500 transition-all" />
          <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95">
            {loading ? 'جاري النشر...' : 'نشر النتيجة الآن'}
          </button>
        </form>
      </div>
      
      <div className="flex-1 min-w-0 w-full bg-[#080a0f] border border-white/5 p-6 md:p-8 rounded-[40px] shadow-2xl overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-8">السجل التاريخي</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-gray-400 text-sm min-w-[600px]">
            <thead className="border-b border-white/10">
              <tr>
                <th className="pb-5 font-bold">المحتوى</th>
                <th className="pb-5 font-bold">الربح</th>
                <th className="pb-5 font-bold">التاريخ</th>
                <th className="pb-5 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {results.map((r) => (
                <tr key={r.id || r._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-5">
                     {r.mediaType === 'video' ? <div className="w-20 h-20 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500 font-bold text-[10px]">VIDEO</div> : <img src={r.mediaUrl} className="w-20 h-20 rounded-xl object-cover border border-white/5" />}
                  </td>
                  <td className="py-5 text-green-400 font-black text-xl">+${r.profitAmount}</td>
                  <td className="py-5 font-medium">{new Date(r.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td className="py-5 text-center">
                    <button onClick={() => handleDelete(r.id || r._id)} className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all inline-flex items-center justify-center">
                      <Icons.Trash />
                    </button>
                  </td>
                </tr>
              ))}
              {results.length === 0 && <tr><td colSpan={4} className="py-20 text-center text-gray-600 font-bold italic">لا توجد نتائج مسجلة حتى الآن.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// 4. إدارة البوتات (Bots Manager)
// ---------------------------------------------------------
const BotsManager = () => {
  const [bots, setBots] = useState<BotData[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', accuracy: '', price: '', isBestSeller: false });
  const [features, setFeatures] = useState<string[]>(['']); 
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBots = async () => {
    try {
      const res = await fetch('https://cr7-kappa.vercel.app/api/bots');
      const data = await res.json();
      if (data.success) setBots(data.data);
    } catch (err) { console.error("Bots fetch error"); }
  };

  useEffect(() => { fetchBots(); }, []);

  const handleAddOrEditBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !file) return alert('الرجاء اختيار صورة الغلاف!');
    
    setLoading(true);
    
    const form = new FormData();
    if (file) form.append('image', file); 
    Object.entries(formData).forEach(([key, val]) => form.append(key, String(val)));
    form.append('features', JSON.stringify(features.filter(f => f.trim() !== '')));

    const url = editingId 
      ? `https://cr7-kappa.vercel.app/api/bots/${editingId}` 
      : 'https://cr7-kappa.vercel.app/api/bots/add';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(url, { 
        method: method, 
        headers: { 'Authorization': `Bearer ${token}` },
        body: form 
      });
      const data = await res.json();
      if (data.success || res.ok) {
        alert(editingId ? 'تم تعديل البوت بنجاح! ✏️' : 'تم إضافة البوت بنجاح! 🎉');
        fetchBots();
        cancelEdit();
      } else { alert('خطأ: ' + (data.message || '')); }
    } catch (err) {
      alert('خطأ في الاتصال! تأكد من تشغيل السيرفر ودعمه لمسارات التعديل والحذف.');
    }
    setLoading(false);
  };

  const handleEditClick = (bot: BotData) => {
    setEditingId(bot.id || bot._id || null);
    setFormData({ 
      name: bot.name || '', 
      description: bot.description || '', 
      accuracy: bot.accuracy || '', 
      price: bot.price || '',
      isBestSeller: bot.isBestSeller === 'true' || bot.isBestSeller === true
    });
    setFeatures(bot.features && bot.features.length > 0 ? bot.features : ['']);
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', accuracy: '', price: '', isBestSeller: false });
    setFeatures(['']);
    setFile(null);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('هل أنت متأكد من الحذف النهائي لهذا البوت؟')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`https://cr7-kappa.vercel.app/api/bots/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchBots();
      else alert('حدث خطأ أثناء الحذف من قاعدة البيانات');
    } catch(err) {
      alert('فشل الاتصال بخادم قاعدة البيانات.');
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start w-full animate-in fade-in duration-500">
      <div className="w-full xl:w-[350px] 2xl:w-[400px] bg-[#080a0f] border border-white/5 p-6 md:p-8 rounded-[40px] shadow-2xl shrink-0">
        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
          <Icons.Cpu /> {editingId ? 'تعديل بيانات الباقة' : 'إضافة باقة جديدة'}
        </h2>
        <form onSubmit={handleAddOrEditBot} className="space-y-5">
          <input type="text" placeholder="اسم البوت" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="الدقة (مثال: 94%)" value={formData.accuracy} onChange={e => setFormData({...formData, accuracy: e.target.value})} required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500" />
            <input type="number" placeholder="سعر الاشتراك $" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none" />
          </div>
          <textarea placeholder="وصف البوت..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none h-24 focus:border-blue-500" />
          
          <label className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl cursor-pointer hover:bg-blue-500/20 transition-all">
            <input type="checkbox" checked={formData.isBestSeller} onChange={e => setFormData({...formData, isBestSeller: e.target.checked})} className="w-5 h-5 accent-blue-500 rounded" />
            <span className="text-white font-bold flex items-center gap-2"><Icons.Star /> تفعيل علامة "الأكثر مبيعاً"</span>
          </label>

          <div className="space-y-3 bg-black/30 p-5 rounded-3xl border border-white/5">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">المميزات (منفصلة)</label>
            {features.map((feat, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" placeholder={`الميزة ${i+1}`} value={feat} onChange={e => {const f = [...features]; f[i]=e.target.value; setFeatures(f)}} required className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
                {features.length > 1 && <button type="button" onClick={() => setFeatures(features.filter((_, idx)=>idx!==i))} className="bg-red-500/10 text-red-400 p-2 rounded-xl"><Icons.X /></button>}
              </div>
            ))}
            <button type="button" onClick={() => setFeatures([...features, ''])} className="text-sm text-blue-400 font-bold flex items-center gap-1 mt-1 hover:text-blue-300 transition-colors">+ إضافة ميزة أخرى</button>
          </div>

          <div className="border-2 border-dashed border-white/10 p-6 rounded-3xl text-center relative hover:bg-white/5 cursor-pointer transition-colors">
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} required={!editingId} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            <div className="flex justify-center mb-2 text-gray-500"><Icons.Image /></div>
            <p className="text-xs text-gray-400 truncate">{file ? file.name : (editingId ? 'اختر صورة جديدة (اختياري)' : 'اختر صورة غلاف البوت')}</p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95">
              {loading ? 'جاري المعالجة...' : (editingId ? 'حفظ التعديلات' : 'نشر البوت')}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all">إلغاء</button>
            )}
          </div>
        </form>
      </div>

      <div className="flex-1 min-w-0 w-full grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {bots.map((b) => (
          <div key={b.id || b._id} className={`relative bg-[#080a0f] border ${(editingId === (b.id || b._id) || b.isBestSeller === 'true' || b.isBestSeller === true) ? 'border-blue-500 shadow-blue-500/20' : 'border-white/5'} rounded-[40px] p-6 flex flex-col gap-5 shadow-2xl hover:border-blue-500/30 transition-all group`}>
            
            {(b.isBestSeller === 'true' || b.isBestSeller === true) && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg z-20 flex items-center gap-1">
                <Icons.Star /> الأكثر مبيعاً
              </div>
            )}

            <div className="relative h-48 rounded-3xl overflow-hidden shadow-inner bg-black/50">
               <img src={b.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" alt={b.name} />
            </div>
            <div className="flex-1 flex flex-col px-2">
              <h3 className="font-black text-2xl text-white mb-2">{b.name}</h3>
              <div className="flex gap-2 mb-6">
                <span className="text-[10px] bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full font-black uppercase">دقة {b.accuracy}</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full font-black uppercase">${b.price}/MO</span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {b.features && b.features.map((f, i) => <li key={i} className="text-xs text-gray-400 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> {f}</li>)}
              </ul>
              
              <div className="flex gap-2 mt-auto">
                <button onClick={() => handleEditClick(b)} className="flex-1 text-blue-400 bg-blue-500/5 hover:bg-blue-500 hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-blue-500/10">
                  <Icons.Edit /> تعديل
                </button>
                <button onClick={() => handleDelete(b.id || b._id)} className="flex-1 text-red-400 bg-red-500/5 hover:bg-red-500 hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-red-500/10">
                  <Icons.Trash /> حذف
                </button>
              </div>
            </div>
          </div>
        ))}
        {bots.length === 0 && <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[40px] text-gray-500 font-bold text-center">لا توجد باقات معروضة حالياً.</div>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// 5. إدارة الاشتراكات والإدارة (Subscriptions Manager)
// ---------------------------------------------------------
const SubscriptionsManager = () => {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [formData, setFormData] = useState({ type: 'الاشتراكات', title: '', capital: '', fee: '', isBestSeller: false });
  const [features, setFeatures] = useState<string[]>(['']); 
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      const res = await fetch('https://cr7-kappa.vercel.app/api/subscriptions');
      const data = await res.json();
      if (data.success) setPlans(data.data);
    } catch (err) { console.error("Plans fetch error"); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleAddOrEditPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = { ...formData, features: features.filter(f => f.trim() !== '') };
    const url = editingId ? `https://cr7-kappa.vercel.app/api/subscriptions/${editingId}` : 'https://cr7-kappa.vercel.app/api/subscriptions/add';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success || res.ok) {
        alert(editingId ? 'تم التعديل بنجاح! ✏️' : 'تم الإضافة بنجاح! 🎉');
        fetchPlans();
        cancelEdit();
      } else { alert('خطأ: ' + (data.message || '')); }
    } catch (err) {
      alert('خطأ في الاتصال! تأكد من برمجة مسارات الاشتراكات (api/subscriptions) في السيرفر.');
    }
    setLoading(false);
  };

  const handleEditClick = (plan: PlanData) => {
    setEditingId(plan.id || plan._id || null);
    setFormData({ 
      type: plan.type || 'الاشتراكات', 
      title: plan.title || '', 
      capital: plan.capital || '', 
      fee: plan.fee || '',
      isBestSeller: plan.isBestSeller === 'true' || plan.isBestSeller === true
    });
    setFeatures(plan.features && plan.features.length > 0 ? plan.features : ['']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ type: 'الاشتراكات', title: '', capital: '', fee: '', isBestSeller: false });
    setFeatures(['']);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('هل أنت متأكد من الحذف النهائي لهذه الباقة؟')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`https://cr7-kappa.vercel.app/api/subscriptions/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchPlans();
    } catch(err) { alert('فشل الاتصال.'); }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start w-full animate-in fade-in duration-500">
      <div className="w-full xl:w-[350px] 2xl:w-[400px] bg-[#080a0f] border border-white/5 p-6 md:p-8 rounded-[40px] shadow-2xl shrink-0">
        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
          <Icons.ShieldCheck /> {editingId ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
        </h2>
        <form onSubmit={handleAddOrEditPlan} className="space-y-5">
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-indigo-500">
            <option value="الاشتراكات" className="bg-[#080a0f]">قسم الاشتراكات</option>
            <option value="الإدارة" className="bg-[#080a0f]">قسم الإدارة</option>
          </select>
          <input type="text" placeholder="اسم الباقة (مثال: الباقة الأولى)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-indigo-500" />
          <input type="text" placeholder="رأس المال المطلوب (مثال: 250$)" value={formData.capital} onChange={e => setFormData({...formData, capital: e.target.value})} required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-indigo-500" />
          <input type="text" placeholder={formData.type === 'الاشتراكات' ? "الاشتراك الشهري (مثال: 100$)" : "نسبة الأرباح (مثال: 50% لك و 50% لنا)"} value={formData.fee} onChange={e => setFormData({...formData, fee: e.target.value})} required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-indigo-500" />
          
          <label className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl cursor-pointer hover:bg-indigo-500/20 transition-all">
            <input type="checkbox" checked={formData.isBestSeller} onChange={e => setFormData({...formData, isBestSeller: e.target.checked})} className="w-5 h-5 accent-indigo-500 rounded" />
            <span className="text-white font-bold flex items-center gap-2"><Icons.Star /> تفعيل علامة "الأكثر مبيعاً"</span>
          </label>

          <div className="space-y-3 bg-black/30 p-5 rounded-3xl border border-white/5">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">المميزات (التارجت وغيرها)</label>
            {features.map((feat, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" placeholder={`الميزة ${i+1}`} value={feat} onChange={e => {const f = [...features]; f[i]=e.target.value; setFeatures(f)}} required className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl text-white text-sm outline-none focus:border-indigo-500" />
                {features.length > 1 && <button type="button" onClick={() => setFeatures(features.filter((_, idx)=>idx!==i))} className="bg-red-500/10 text-red-400 p-2 rounded-xl"><Icons.X /></button>}
              </div>
            ))}
            <button type="button" onClick={() => setFeatures([...features, ''])} className="text-sm text-indigo-400 font-bold flex items-center gap-1 mt-1 hover:text-indigo-300 transition-colors">+ إضافة ميزة أخرى</button>
          </div>

          <div className="flex gap-3 pt-2">
            <button disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95">
              {loading ? 'جاري المعالجة...' : (editingId ? 'حفظ التعديلات' : 'نشر الباقة')}
            </button>
            {editingId && <button type="button" onClick={cancelEdit} className="px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all">إلغاء</button>}
          </div>
        </form>
      </div>

      <div className="flex-1 min-w-0 w-full grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {plans.map((p) => (
          <div key={p.id || p._id} className={`relative bg-[#080a0f] border ${(editingId === (p.id || p._id) || p.isBestSeller === 'true' || p.isBestSeller === true) ? 'border-indigo-500 shadow-indigo-500/20' : 'border-white/5'} rounded-[40px] p-6 flex flex-col gap-5 shadow-2xl hover:border-indigo-500/30 transition-all group`}>
            
            {(p.isBestSeller === 'true' || p.isBestSeller === true) && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg z-20 flex items-center gap-1">
                <Icons.Star /> الأكثر طلباً
              </div>
            )}
            
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase ${p.type === 'الاشتراكات' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                  {p.type}
                </span>
                <h3 className="font-black text-2xl text-white mt-3">{p.title}</h3>
              </div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-2xl space-y-2 border border-white/5">
              <p className="text-sm text-gray-300 font-bold">رأس المال: <span className="text-white">{p.capital}</span></p>
              <p className="text-sm text-gray-300 font-bold">{p.type === 'الاشتراكات' ? 'الرسوم:' : 'النسبة:'} <span className="text-green-400">{p.fee}</span></p>
            </div>

            <ul className="space-y-2 mb-4 flex-1">
              {p.features && p.features.map((f, i) => <li key={i} className="text-xs text-gray-400 flex items-start gap-2"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-1.5"></span> <span>{f}</span></li>)}
            </ul>
            
            <div className="flex gap-2 mt-auto">
              <button onClick={() => handleEditClick(p)} className="flex-1 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500 hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-indigo-500/10">
                <Icons.Edit /> تعديل
              </button>
              <button onClick={() => handleDelete(p.id || p._id)} className="flex-1 text-red-400 bg-red-500/5 hover:bg-red-500 hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-red-500/10">
                <Icons.Trash /> حذف
              </button>
            </div>
          </div>
        ))}
        {plans.length === 0 && <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[40px] text-gray-500 font-bold text-center">لا توجد باقات اشتراكات أو إدارة معروضة حالياً.</div>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// 5.5 إدارة المدونة (Blog Manager) - ✨ المحدث ✨
// ---------------------------------------------------------
const BlogManager = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch('https://cr7-kappa.vercel.app/api/blog');
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch (err) { console.error("Blog fetch error"); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('الرجاء اختيار صورة للبوست!');
    setLoading(true);
    
    const form = new FormData();
    form.append('image', file); 
    form.append('title', formData.title);
    form.append('content', formData.content);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('https://cr7-kappa.vercel.app/api/blog/add', { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${token}` },
        body: form 
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error('السيرفر لم يُرجع استجابة صحيحة، قد يكون هناك خطأ داخلي. تأكد من تشغيل السيرفر.');
      }

      if (data.success || res.ok) {
        alert('تم نشر البوست بنجاح! 🎉');
        fetchPosts();
        setFormData({ title: '', content: '' });
        setFile(null);
      } else { 
        alert('خطأ من السيرفر: ' + (data.message || 'غير معروف')); 
      }
    } catch (err: any) { 
      alert('خطأ في الاتصال: ' + err.message); 
    }
    setLoading(false);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('هل أنت متأكد من حذف هذا البوست نهائياً؟')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`https://cr7-kappa.vercel.app/api/blog/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchPosts();
    } catch(err) { alert('فشل الاتصال بخادم قاعدة البيانات.'); }
  };

  // ✨ دالة حذف التعليقات من لوحة التحكم
  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق نهائياً؟')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`https://cr7-kappa.vercel.app/api/blog/${postId}/comment/${commentId}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPosts(); // جلب التحديثات فوراً
      } else {
        alert('حدث خطأ أثناء حذف التعليق.');
      }
    } catch(err) { 
      alert('فشل الاتصال بخادم قاعدة البيانات.'); 
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start w-full animate-in fade-in duration-500">
      <div className="w-full xl:w-[350px] 2xl:w-[400px] bg-[#080a0f] border border-white/5 p-6 md:p-8 rounded-[40px] shadow-2xl shrink-0">
        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
          <Icons.BookOpen /> إضافة بوست جديد
        </h2>
        <form onSubmit={handleAddPost} className="space-y-5">
          <input type="text" placeholder="عنوان البوست" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" />
          <textarea placeholder="محتوى البوست أو الخبر..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none h-40 focus:border-blue-500 custom-scrollbar" />
          
          <div className="border-2 border-dashed border-white/10 p-6 rounded-3xl text-center relative hover:bg-white/5 cursor-pointer transition-colors">
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} required className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            <div className="flex justify-center mb-2 text-gray-500"><Icons.Image /></div>
            <p className="text-xs text-gray-400 truncate">{file ? file.name : 'اختر صورة للبوست'}</p>
          </div>
          
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50">
            {loading ? 'جاري النشر...' : 'نشر في المدونة'}
          </button>
        </form>
      </div>

      <div className="flex-1 min-w-0 w-full grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {posts.map((p) => (
          <div key={p.id || p._id} className="relative bg-[#080a0f] border border-white/5 rounded-[40px] p-6 flex flex-col gap-5 shadow-2xl hover:border-blue-500/30 transition-all group">
            <div className="relative h-48 rounded-3xl overflow-hidden shadow-inner bg-black/50">
              <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" alt={p.title} />
            </div>
            <div className="flex-1 flex flex-col px-2">
              <span className="text-[10px] text-gray-500 mb-2 font-bold">{new Date(p.createdAt).toLocaleDateString('ar-EG')}</span>
              <h3 className="font-black text-xl text-white mb-2 line-clamp-2">{p.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-3 mb-6">{p.content}</p>
              
              {/* ✨ التفاعلات والتعليقات ✨ */}
              <div className="flex items-center gap-4 mb-4 text-sm font-bold text-gray-400 border-t border-white/5 pt-4">
                <span className="flex items-center gap-1"><Icons.Heart size={16} className="text-red-500" fill="currentColor" /> {p.likes?.length || 0}</span>
                <span className="flex items-center gap-1"><Icons.MessageCircle size={16} className="text-blue-400" /> {p.comments?.length || 0}</span>
              </div>

              {/* قائمة التعليقات مع زر الحذف */}
              {p.comments && p.comments.length > 0 && (
                <div className="bg-black/30 rounded-2xl p-4 mb-6 space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
                  {p.comments.map(comment => (
                    <div key={comment.id} className="flex justify-between items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex gap-3">
                         <img src={comment.userImage || "https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg"} className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10" alt="user" />
                         <div>
                           <p className="text-xs font-bold text-white">{comment.userName}</p>
                           <p className="text-xs text-gray-400 mt-1 leading-relaxed">{comment.text}</p>
                         </div>
                      </div>
                      <button onClick={() => handleDeleteComment(p.id || p._id!, comment.id)} className="text-red-400 hover:bg-red-500/20 rounded-lg p-2 transition-colors shrink-0" title="حذف التعليق">
                        <Icons.Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-white/5">
                <button onClick={() => handleDelete(p.id || p._id)} className="w-full text-red-400 bg-red-500/5 hover:bg-red-500 hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-red-500/10">
                  <Icons.Trash /> حذف البوست بالكامل
                </button>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[40px] text-gray-500 font-bold text-center">لا توجد بوستات منشورة في المدونة حالياً.</div>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// 6. قسم الإعدادات العامة (Settings Manager)
// ---------------------------------------------------------
const SettingsManager = () => {
  const defaultViewerAccount: ViewerAccountData = {
    accountNumber: '',
    broker: '',
    server: '',
    password: '',
    platform: '',
    note: ''
  };

  const defaultLiveStats: LiveStatsData = {
    headline: 'الأعداد المباشرة الحالية يتم تحديثها تلقائياً مع كل اشتراك أو إدارة أو شراء جديد',
    subscriptions: [
      { id: 'sub-100', title: 'باقة اشتراك 100$', count: 0, note: 'مشترك حالي', isVisible: true },
      { id: 'sub-200', title: 'باقة اشتراك 200$', count: 0, note: 'مشترك حالي', isVisible: true }
    ],
    management: [
      { id: 'mgmt-500', title: 'نظام إدارة 500$', count: 0, note: 'عميل إدارة', isVisible: true }
    ],
    bots: [
      { id: 'bot-main', title: 'مبيعات البوتات', count: 0, note: 'عملية شراء', isVisible: true }
    ]
  };

  const defaultSmartNotifications: SmartNotificationsData = {
    enabled: true,
    startDelayMs: 1400,
    minDelayMs: 6500,
    maxDelayMs: 15000,
    displayDurationMs: 5200,
    items: [
      { id: 'notify-1', title: 'اشتراك جديد', text: 'A**** اشترك في باقة 100$', type: 'subscribe', icon: '💳', country: 'السعودية', isVisible: true },
      { id: 'notify-2', title: 'عملية شراء جديدة', text: 'M**** اشترى بوت CR7 BOT', type: 'sale', icon: '🤖', country: 'الإمارات', isVisible: true },
      { id: 'notify-3', title: 'تفعيل إدارة حساب', text: 'K**** فعّل نظام إدارة 500$', type: 'management', icon: '🛡️', country: 'مصر', isVisible: true },
      { id: 'notify-4', title: 'نشاط مباشر', text: 'S**** نسخ بيانات حساب المشاهدة', type: 'copy', icon: '👁️', country: 'الكويت', isVisible: true }
    ]
  };

  const [settings, setSettings] = useState<SettingsData>({
    contact: { telegram: '', whatsapp: '', email: '' },
    faqs: [],
    terms: '',
    aboutUs: '',
    heroPhrases: ['يعمل لأجلك', 'يحقق أحلامك', 'يصنع ثروتك'],
    viewerAccount: defaultViewerAccount,
    liveStats: defaultLiveStats,
    smartNotifications: defaultSmartNotifications
  });
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch('https://cr7-kappa.vercel.app/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings({
          contact: data.data.contact || { telegram: '', whatsapp: '', email: '' },
          faqs: data.data.faqs || [],
          terms: data.data.terms || '',
          aboutUs: data.data.aboutUs || '',
          heroPhrases: data.data.heroPhrases || ['يعمل لأجلك', 'يحقق أحلامك', 'يصنع ثروتك'],
          viewerAccount: {
            accountNumber: data.data.viewerAccount?.accountNumber || '',
            broker: data.data.viewerAccount?.broker || '',
            server: data.data.viewerAccount?.server || '',
            password: data.data.viewerAccount?.password || '',
            platform: data.data.viewerAccount?.platform || '',
            note: data.data.viewerAccount?.note || ''
          },
          liveStats: {
            headline: data.data.liveStats?.headline || defaultLiveStats.headline,
            subscriptions: Array.isArray(data.data.liveStats?.subscriptions) ? data.data.liveStats.subscriptions : defaultLiveStats.subscriptions,
            management: Array.isArray(data.data.liveStats?.management) ? data.data.liveStats.management : defaultLiveStats.management,
            bots: Array.isArray(data.data.liveStats?.bots) ? data.data.liveStats.bots : defaultLiveStats.bots
          },
          smartNotifications: {
            enabled: data.data.smartNotifications?.enabled !== false,
            startDelayMs: Number(data.data.smartNotifications?.startDelayMs || defaultSmartNotifications.startDelayMs),
            minDelayMs: Number(data.data.smartNotifications?.minDelayMs || defaultSmartNotifications.minDelayMs),
            maxDelayMs: Number(data.data.smartNotifications?.maxDelayMs || defaultSmartNotifications.maxDelayMs),
            displayDurationMs: Number(data.data.smartNotifications?.displayDurationMs || defaultSmartNotifications.displayDurationMs),
            items: Array.isArray(data.data.smartNotifications?.items) ? data.data.smartNotifications.items : defaultSmartNotifications.items
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings');
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('https://cr7-kappa.vercel.app/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success || res.ok) {
        alert('تم حفظ الإعدادات بنجاح! ✅');
      } else {
        alert('حدث خطأ: ' + (data.message || ''));
      }
    } catch (error) {
      alert('خطأ في الاتصال بالسيرفر! يرجى إضافة مسارات الإعدادات في ملف app.js وإعادة تشغيل السيرفر.');
    }
    setLoading(false);
  };

  // دوال تعديل الأسئلة الشائعة
  const handleFaqChange = (index: number, field: keyof FaqItem, value: string) => {
    const newFaqs = [...settings.faqs];
    newFaqs[index][field] = value;
    setSettings({ ...settings, faqs: newFaqs });
  };

  const addFaq = () => setSettings({ ...settings, faqs: [...settings.faqs, { question: '', answer: '' }] });
  const removeFaq = (index: number) => setSettings({ ...settings, faqs: settings.faqs.filter((_, i) => i !== index) });

  // دوال تعديل الجمل المتحركة في الرئيسية
  const handlePhraseChange = (index: number, value: string) => {
    const newPhrases = [...(settings.heroPhrases || [])];
    newPhrases[index] = value;
    setSettings({ ...settings, heroPhrases: newPhrases });
  };

  const addPhrase = () => setSettings({ ...settings, heroPhrases: [...(settings.heroPhrases || []), ''] });
  const removePhrase = (index: number) => setSettings({ ...settings, heroPhrases: (settings.heroPhrases || []).filter((_, i) => i !== index) });

  const handleViewerAccountChange = (field: keyof ViewerAccountData, value: string) => {
    setSettings({
      ...settings,
      viewerAccount: {
        ...(settings.viewerAccount || defaultViewerAccount),
        [field]: value
      }
    });
  };

  const handleLiveStatsHeadlineChange = (value: string) => {
    setSettings({
      ...settings,
      liveStats: {
        ...(settings.liveStats || defaultLiveStats),
        headline: value
      }
    });
  };

  const handleLiveStatsItemChange = (
    section: keyof Omit<LiveStatsData, 'headline'>,
    index: number,
    field: keyof LiveStatsItem,
    value: string | number | boolean
  ) => {
    const currentLiveStats = settings.liveStats || defaultLiveStats;
    const updatedSection = [...(currentLiveStats[section] || [])];

    updatedSection[index] = {
      ...updatedSection[index],
      [field]: field === 'count' ? Number(value) || 0 : value
    };

    setSettings({
      ...settings,
      liveStats: {
        ...currentLiveStats,
        [section]: updatedSection
      }
    });
  };

  const addLiveStatsItem = (section: keyof Omit<LiveStatsData, 'headline'>) => {
    const currentLiveStats = settings.liveStats || defaultLiveStats;
    const newItem: LiveStatsItem = {
      id: `${section}-${Date.now()}`,
      title: section === 'subscriptions' ? 'باقة جديدة' : section === 'management' ? 'نظام إدارة جديد' : 'بوت جديد',
      count: 0,
      note: section === 'subscriptions' ? 'مشترك حالي' : section === 'management' ? 'عميل إدارة' : 'عملية شراء',
      isVisible: true
    };

    setSettings({
      ...settings,
      liveStats: {
        ...currentLiveStats,
        [section]: [...(currentLiveStats[section] || []), newItem]
      }
    });
  };

  const removeLiveStatsItem = (section: keyof Omit<LiveStatsData, 'headline'>, index: number) => {
    const currentLiveStats = settings.liveStats || defaultLiveStats;
    const updatedSection = (currentLiveStats[section] || []).filter((_, i) => i !== index);

    setSettings({
      ...settings,
      liveStats: {
        ...currentLiveStats,
        [section]: updatedSection
      }
    });
  };

  const handleSmartNotificationSettingChange = (field: keyof Omit<SmartNotificationsData, 'items'>, value: number | boolean) => {
    setSettings({
      ...settings,
      smartNotifications: {
        ...(settings.smartNotifications || defaultSmartNotifications),
        [field]: value
      }
    });
  };

  const handleSmartNotificationItemChange = (
    index: number,
    field: keyof SmartNotificationItem,
    value: string | boolean
  ) => {
    const current = settings.smartNotifications || defaultSmartNotifications;
    const updatedItems = [...(current.items || [])];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setSettings({
      ...settings,
      smartNotifications: {
        ...current,
        items: updatedItems
      }
    });
  };

  const addSmartNotificationItem = () => {
    const current = settings.smartNotifications || defaultSmartNotifications;
    const newItem: SmartNotificationItem = {
      id: `notify-${Date.now()}`,
      title: 'نشاط جديد',
      text: 'A**** اشترك في CR7 BOT',
      type: 'custom',
      icon: '⚡',
      country: 'السعودية',
      isVisible: true
    };

    setSettings({
      ...settings,
      smartNotifications: {
        ...current,
        items: [...(current.items || []), newItem]
      }
    });
  };

  const removeSmartNotificationItem = (index: number) => {
    const current = settings.smartNotifications || defaultSmartNotifications;
    setSettings({
      ...settings,
      smartNotifications: {
        ...current,
        items: (current.items || []).filter((_, i) => i !== index)
      }
    });
  };

  const SmartNotificationsEditor = () => {
    const current = settings.smartNotifications || defaultSmartNotifications;
    const items = current.items || [];

    return (
      <div className="lg:col-span-2 bg-black/30 p-8 rounded-3xl border border-[#bf953f]/20 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#fcf6ba] flex items-center gap-2">
              <Icons.MessageCircle /> الإشعارات الذكية داخل الموقع
            </h3>
            <p className="text-xs text-gray-500 mt-2 leading-6 max-w-3xl">
              إشعارات صغيرة تظهر أعلى الموقع بعد دخول الزائر ثم تتكرر بفواصل عشوائية. اكتب النصوص التي تريدها، واختر مدة الظهور والفاصل الزمني.
            </p>
          </div>

          <label className={`flex items-center gap-3 px-5 py-3 rounded-2xl border cursor-pointer transition-all ${current.enabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
            <input
              type="checkbox"
              checked={current.enabled !== false}
              onChange={(e) => handleSmartNotificationSettingChange('enabled', e.target.checked)}
              className="w-5 h-5 accent-emerald-500"
            />
            <span className="font-black text-sm">{current.enabled !== false ? 'الإشعارات مفعلة' : 'الإشعارات متوقفة'}</span>
          </label>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">أول ظهور بعد كام ثانية</label>
            <input
              type="number"
              min={0}
              value={Math.round((current.startDelayMs || 1400) / 1000)}
              onChange={(e) => handleSmartNotificationSettingChange('startDelayMs', Math.max(0, Number(e.target.value) * 1000))}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#bf953f]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">أقل فاصل بالثواني</label>
            <input
              type="number"
              min={3}
              value={Math.round((current.minDelayMs || 6500) / 1000)}
              onChange={(e) => handleSmartNotificationSettingChange('minDelayMs', Math.max(3, Number(e.target.value)) * 1000)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#bf953f]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">أكبر فاصل بالثواني</label>
            <input
              type="number"
              min={5}
              value={Math.round((current.maxDelayMs || 15000) / 1000)}
              onChange={(e) => handleSmartNotificationSettingChange('maxDelayMs', Math.max(5, Number(e.target.value)) * 1000)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#bf953f]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">مدة ظهور الإشعار بالثواني</label>
            <input
              type="number"
              min={2}
              value={Math.round((current.displayDurationMs || 5200) / 1000)}
              onChange={(e) => handleSmartNotificationSettingChange('displayDurationMs', Math.max(2, Number(e.target.value)) * 1000)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#bf953f]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <h4 className="text-white font-black">نصوص الإشعارات</h4>
          <button
            type="button"
            onClick={addSmartNotificationItem}
            className="bg-[#bf953f]/10 hover:bg-[#bf953f] hover:text-black border border-[#bf953f]/30 text-[#fcf6ba] px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2"
          >
            <Icons.Plus /> إضافة إشعار
          </button>
        </div>

        <div className="grid xl:grid-cols-2 gap-4">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="bg-[#05070a] border border-white/5 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <label className={`flex items-center gap-2 text-xs font-black px-3 py-2 rounded-xl cursor-pointer ${item.isVisible !== false ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                  <input
                    type="checkbox"
                    checked={item.isVisible !== false}
                    onChange={(e) => handleSmartNotificationItemChange(idx, 'isVisible', e.target.checked)}
                    className="accent-emerald-500"
                  />
                  ظاهر
                </label>
                <button
                  type="button"
                  onClick={() => removeSmartNotificationItem(idx)}
                  className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2"
                >
                  <Icons.Trash /> حذف
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => handleSmartNotificationItemChange(idx, 'title', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#bf953f]"
                  placeholder="عنوان الإشعار"
                />
                <select
                  value={item.type || 'custom'}
                  onChange={(e) => handleSmartNotificationItemChange(idx, 'type', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#bf953f]"
                >
                  <option value="subscribe" className="bg-[#080a0f]">اشتراك</option>
                  <option value="sale" className="bg-[#080a0f]">شراء بوت</option>
                  <option value="management" className="bg-[#080a0f]">إدارة</option>
                  <option value="copy" className="bg-[#080a0f]">نسخ حساب مشاهدة</option>
                  <option value="telegram" className="bg-[#080a0f]">تليجرام</option>
                  <option value="custom" className="bg-[#080a0f]">مخصص</option>
                </select>
              </div>

              <textarea
                value={item.text || ''}
                onChange={(e) => handleSmartNotificationItemChange(idx, 'text', e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#bf953f] min-h-[80px]"
                placeholder="مثال: A**** اشترك في باقة 100$"
              />

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={item.icon || ''}
                  onChange={(e) => handleSmartNotificationItemChange(idx, 'icon', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#bf953f]"
                  placeholder="أيقونة مثل 💳"
                />
                <input
                  type="text"
                  value={item.country || ''}
                  onChange={(e) => handleSmartNotificationItemChange(idx, 'country', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#bf953f]"
                  placeholder="الدولة"
                />
              </div>

              <div className="rounded-2xl border border-[#bf953f]/20 bg-black/40 p-4">
                <p className="text-[10px] text-gray-500 font-black mb-2">معاينة سريعة</p>
                <div className="rounded-2xl border border-[#bf953f]/30 bg-[#080808] p-3 flex items-center gap-3 flex-row-reverse">
                  <div className="w-9 h-9 rounded-xl bg-[#bf953f]/15 flex items-center justify-center">{item.icon || '⚡'}</div>
                  <div className="text-right min-w-0">
                    <p className="text-[11px] text-[#fcf6ba] font-black">{item.title || 'نشاط جديد'}</p>
                    <p className="text-xs text-white font-bold line-clamp-1">{item.text || 'A**** اشترك في CR7 BOT'}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{item.country || 'السعودية'} • منذ لحظات</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="xl:col-span-2 border-2 border-dashed border-white/10 rounded-3xl p-10 text-center text-gray-500 font-bold">
              لا توجد إشعارات. اضغط إضافة إشعار.
            </div>
          )}
        </div>
      </div>
    );
  };

  const LiveStatsEditor = ({
    section,
    title,
    description,
    accentClass
  }: {
    section: keyof Omit<LiveStatsData, 'headline'>;
    title: string;
    description: string;
    accentClass: string;
  }) => {
    const items = (settings.liveStats || defaultLiveStats)[section] || [];

    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className={`text-base font-black ${accentClass}`}>{title}</h4>
            <p className="text-xs text-gray-500 mt-1 leading-6">{description}</p>
          </div>
          <button
            type="button"
            onClick={() => addLiveStatsItem(section)}
            className="w-fit bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
          >
            <Icons.Plus /> إضافة عنصر
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="grid grid-cols-1 lg:grid-cols-[1.4fr_120px_1fr_120px_44px] gap-3 bg-black/30 border border-white/5 p-4 rounded-2xl items-center">
              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">اسم العنصر</label>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => handleLiveStatsItemChange(section, idx, 'title', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-blue-500 text-sm"
                  placeholder="مثال: باقة 100$"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">العدد</label>
                <input
                  type="number"
                  min="0"
                  value={item.count || 0}
                  onChange={(e) => handleLiveStatsItemChange(section, idx, 'count', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block">وصف صغير</label>
                <input
                  type="text"
                  value={item.note || ''}
                  onChange={(e) => handleLiveStatsItemChange(section, idx, 'note', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-blue-500 text-sm"
                  placeholder="مثال: مشترك حالي"
                />
              </div>

              <label className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 p-3 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.isVisible !== false}
                  onChange={(e) => handleLiveStatsItemChange(section, idx, 'isVisible', e.target.checked)}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-xs text-gray-300 font-bold">ظاهر</span>
              </label>

              <button
                type="button"
                onClick={() => removeLiveStatsItem(section, idx)}
                className="bg-red-500/10 text-red-400 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                title="حذف العنصر"
              >
                <Icons.Trash />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="py-8 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
              لا توجد عناصر في هذا القسم. اضغط إضافة عنصر.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-[#080a0f] border border-white/5 p-6 md:p-10 rounded-[40px] shadow-2xl animate-in fade-in duration-500">
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          <Icons.Settings /> الإعدادات العامة للموقع
        </h2>
        <button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black shadow-lg transition-all active:scale-95">
          {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        
        {/* قسم التحكم في الجمل المتحركة */}
        <div className="lg:col-span-2 bg-black/30 p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2"><Icons.Activity /> الجمل المتحركة في الرئيسية (Hero Phrases)</h3>
            <button type="button" onClick={addPhrase} className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all">
              <Icons.Plus /> إضافة جملة جديدة
            </button>
          </div>
          <div className="space-y-4 grid md:grid-cols-2 gap-4">
            {settings.heroPhrases && settings.heroPhrases.map((phrase, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 relative mt-0">
                <input type="text" value={phrase} onChange={(e) => handlePhraseChange(idx, e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-blue-500 text-sm font-bold" placeholder="مثال: يعمل لأجلك" />
                {(settings.heroPhrases || []).length > 1 && (
                  <button type="button" onClick={() => removePhrase(idx)} className="bg-red-500/10 text-red-400 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all shrink-0">
                    <Icons.Trash />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* قسم الأعداد المباشرة الحالية */}
        <div className="lg:col-span-2 bg-black/30 p-8 rounded-3xl border border-emerald-500/20 space-y-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div>
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Icons.Users /> الأعداد المباشرة الحالية
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-6 max-w-3xl">
                هذه البيانات تظهر في الصفحة الرئيسية مكان كارت الرسم البياني القديم. أضف أو عدل عدد المشتركين في كل باقة، عملاء الإدارة، وعدد شراء كل بوت.
              </p>
            </div>
            <div className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-4 py-2 rounded-full text-xs font-black w-fit">
              LIVE WEBSITE COUNTERS
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">الجملة التي تظهر فوق الأعداد في الموقع</label>
            <textarea
              value={settings.liveStats?.headline || ''}
              onChange={(e) => handleLiveStatsHeadlineChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-emerald-500 min-h-[90px]"
              placeholder="مثال: الأعداد المباشرة الحالية يتم تحديثها تلقائياً مع كل اشتراك أو إدارة أو شراء جديد"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#05070a] border border-emerald-500/10 rounded-3xl p-5 text-center">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">إجمالي الاشتراكات</p>
              <p className="text-4xl font-black text-emerald-400">
                {(settings.liveStats?.subscriptions || []).filter((item) => item.isVisible !== false).reduce((sum, item) => sum + (Number(item.count) || 0), 0)}
              </p>
            </div>
            <div className="bg-[#05070a] border border-indigo-500/10 rounded-3xl p-5 text-center">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">إجمالي الإدارة</p>
              <p className="text-4xl font-black text-indigo-400">
                {(settings.liveStats?.management || []).filter((item) => item.isVisible !== false).reduce((sum, item) => sum + (Number(item.count) || 0), 0)}
              </p>
            </div>
            <div className="bg-[#05070a] border border-blue-500/10 rounded-3xl p-5 text-center">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">إجمالي شراء البوتات</p>
              <p className="text-4xl font-black text-blue-400">
                {(settings.liveStats?.bots || []).filter((item) => item.isVisible !== false).reduce((sum, item) => sum + (Number(item.count) || 0), 0)}
              </p>
            </div>
          </div>

          <LiveStatsEditor
            section="subscriptions"
            title="باقات الاشتراك"
            description="مثال: باقة اشتراك 100$، باقة اشتراك 200$، وأي باقة جديدة تضيفها لاحقاً."
            accentClass="text-emerald-400"
          />

          <LiveStatsEditor
            section="management"
            title="أنظمة الإدارة"
            description="مثال: نظام إدارة 500$، ويمكن إضافة أي نظام إدارة جديد وعدد عملائه."
            accentClass="text-indigo-400"
          />

          <LiveStatsEditor
            section="bots"
            title="مبيعات البوتات"
            description="اكتب اسم كل بوت وعدد عمليات الشراء الحالية التي تريد عرضها للزوار."
            accentClass="text-blue-400"
          />
        </div>

        <SmartNotificationsEditor />

        {/* قسم حساب المشاهدة */}
        <div className="lg:col-span-2 bg-black/30 p-8 rounded-3xl border border-blue-500/20 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            <div>
              <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                <Icons.ShieldCheck /> حساب المشاهدة المباشر
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-6">
                البيانات التي تظهر للعميل في قسم النتائج. اكتب رقم الحساب والبروكر والسيرفر والباسورد والمنصة، وسيقدر العميل ينسخها من الموقع.
              </p>
            </div>
            <span className="w-fit bg-blue-500/10 text-blue-300 border border-blue-500/20 px-4 py-2 rounded-full text-xs font-black">
              View Only / Investor
            </span>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">رقم الحساب</label>
              <input
                type="text"
                value={settings.viewerAccount?.accountNumber || ''}
                onChange={(e) => handleViewerAccountChange('accountNumber', e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500"
                placeholder="مثال: 12345678"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">البروكر</label>
              <input
                type="text"
                value={settings.viewerAccount?.broker || ''}
                onChange={(e) => handleViewerAccountChange('broker', e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500"
                placeholder="مثال: Exness / IC Markets"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">السيرفر</label>
              <input
                type="text"
                value={settings.viewerAccount?.server || ''}
                onChange={(e) => handleViewerAccountChange('server', e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500"
                placeholder="مثال: Exness-MT5Real"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">باسورد المشاهدة</label>
              <input
                type="text"
                value={settings.viewerAccount?.password || ''}
                onChange={(e) => handleViewerAccountChange('password', e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500"
                placeholder="Investor / View Password"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">المنصة</label>
              <select
                value={settings.viewerAccount?.platform || ''}
                onChange={(e) => handleViewerAccountChange('platform', e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500"
              >
                <option value="" className="bg-[#080a0f]">اختار المنصة</option>
                <option value="MT4" className="bg-[#080a0f]">MT4</option>
                <option value="MT5" className="bg-[#080a0f]">MT5</option>
                <option value="cTrader" className="bg-[#080a0f]">cTrader</option>
                <option value="Other" className="bg-[#080a0f]">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">ملاحظة قصيرة</label>
              <input
                type="text"
                value={settings.viewerAccount?.note || ''}
                onChange={(e) => handleViewerAccountChange('note', e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500"
                placeholder="مثال: حساب Real للمشاهدة فقط"
              />
            </div>
          </div>
        </div>

        {/* قسم من نحن */}
        <div className="lg:col-span-2 bg-black/30 p-8 rounded-3xl border border-white/5 space-y-6">
          <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2"><Icons.Info /> من نحن (About Us)</h3>
          <textarea value={settings.aboutUs} onChange={(e) => setSettings({...settings, aboutUs: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500 min-h-[150px]" placeholder="اكتب معلومات عن الشركة والموقع هنا لتعريف الزوار بخدماتك..." />
        </div>

        {/* قسم معلومات التواصل */}
        <div className="bg-black/30 p-8 rounded-3xl border border-white/5 space-y-6">
          <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2"><Icons.Phone /> معلومات التواصل</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">رابط تليجرام (Telegram)</label>
              <input type="text" value={settings.contact.telegram} onChange={(e) => setSettings({...settings, contact: {...settings.contact, telegram: e.target.value}})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500" placeholder="https://t.me/..." />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">رقم واتساب (WhatsApp)</label>
              <input type="text" value={settings.contact.whatsapp} onChange={(e) => setSettings({...settings, contact: {...settings.contact, whatsapp: e.target.value}})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500" placeholder="+123456789..." />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">البريد الإلكتروني (Email)</label>
              <input type="email" value={settings.contact.email} onChange={(e) => setSettings({...settings, contact: {...settings.contact, email: e.target.value}})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500" placeholder="support@cr7bot.com" />
            </div>
          </div>
        </div>

        {/* قسم الشروط والأحكام */}
        <div className="bg-black/30 p-8 rounded-3xl border border-white/5 flex flex-col h-full">
          <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2 mb-6"><Icons.FileText /> الشروط والأحكام (Terms & Conditions)</h3>
          <textarea value={settings.terms} onChange={(e) => setSettings({...settings, terms: e.target.value})} className="w-full flex-grow bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500 min-h-[250px]" placeholder="اكتب الشروط والأحكام هنا..." />
        </div>

        {/* قسم الأسئلة الشائعة */}
        <div className="lg:col-span-2 bg-black/30 p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2"><Icons.HelpCircle /> الأسئلة الشائعة (FAQs)</h3>
            <button onClick={addFaq} className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all">
              <Icons.Plus /> إضافة سؤال جديد
            </button>
          </div>
          
          <div className="space-y-4">
            {settings.faqs.map((faq, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 relative">
                <div className="flex-1 space-y-3">
                  <input type="text" value={faq.question} onChange={(e) => handleFaqChange(idx, 'question', e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-blue-500 text-sm font-bold" placeholder="السؤال..." />
                  <textarea value={faq.answer} onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-blue-500 text-sm h-20" placeholder="الإجابة..." />
                </div>
                <button onClick={() => removeFaq(idx)} className="md:self-start bg-red-500/10 text-red-400 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all shrink-0">
                  <Icons.Trash />
                </button>
              </div>
            ))}
            {settings.faqs.length === 0 && <p className="text-gray-500 text-center py-6">لا توجد أسئلة شائعة مضافة.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

// ---------------------------------------------------------
// ---------------------------------------------------------
// 5.75 إدارة آراء العملاء (Testimonials Manager)
// ---------------------------------------------------------
const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    serviceType: 'اشتراك',
    order: '1',
    isVisible: true
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('https://cr7-kappa.vercel.app/api/testimonials');
      const data = await res.json();
      if (data.success) setTestimonials(data.data || []);
    } catch (err) {
      console.error('Testimonials fetch error');
    }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setFile(null);
    setFormData({
      title: '',
      clientName: '',
      serviceType: 'اشتراك',
      order: '1',
      isVisible: true
    });
  };

  const handleEditClick = (item: TestimonialData) => {
    setEditingId(item.id || item._id || null);
    setFormData({
      title: item.title || '',
      clientName: item.clientName || '',
      serviceType: item.serviceType || 'اشتراك',
      order: String(item.order || '1'),
      isVisible: item.isVisible === false || item.isVisible === 'false' ? false : true
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !file) return alert('الرجاء اختيار اسكرين شات من محادثة العميل!');

    setLoading(true);
    const form = new FormData();
    if (file) form.append('image', file);
    form.append('title', formData.title);
    form.append('clientName', formData.clientName);
    form.append('serviceType', formData.serviceType);
    form.append('service', formData.serviceType);
    form.append('order', String(formData.order || 1));
    form.append('isVisible', String(formData.isVisible));

    const url = editingId
      ? 'https://cr7-kappa.vercel.app/api/testimonials/' + editingId
      : 'https://cr7-kappa.vercel.app/api/testimonials/upload';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': 'Bearer ' + token },
        body: form
      });
      const data = await res.json();
      if (data.success || res.ok) {
        alert(editingId ? 'تم تعديل رأي العميل بنجاح! ✏️' : 'تم إضافة رأي العميل بنجاح! ✅');
        await fetchTestimonials();
        resetForm();
      } else {
        alert('خطأ من السيرفر: ' + (data.message || 'غير معروف'));
      }
    } catch (err) {
      alert('فشل الاتصال بالسيرفر. تأكد من إضافة مسارات api/testimonials في الباك إند.');
    }
    setLoading(false);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('هل أنت متأكد من حذف رأي العميل نهائياً؟')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('https://cr7-kappa.vercel.app/api/testimonials/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) fetchTestimonials();
      else alert('حدث خطأ أثناء الحذف.');
    } catch (err) {
      alert('فشل الاتصال بالسيرفر أثناء الحذف.');
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start w-full animate-in fade-in duration-500">
      <div className="w-full xl:w-[380px] 2xl:w-[430px] bg-[#080a0f] border border-white/5 p-6 md:p-8 rounded-[40px] shadow-2xl shrink-0">
        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
          <Icons.MessageCircle /> {editingId ? 'تعديل رأي عميل' : 'إضافة رأي عميل'}
        </h2>
        <p className="text-gray-500 text-sm leading-7 mb-8">
          ارفع اسكرين شات من محادثات تيليجرام، وسيظهر في قسم آراء العملاء بتصميم احترافي داخل الموقع.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="border-2 border-dashed border-white/10 p-8 rounded-3xl text-center relative hover:bg-white/5 transition-colors cursor-pointer group">
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} required={!editingId} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="flex justify-center mb-3 text-gray-500 group-hover:text-blue-500 transition-colors"><Icons.Image /></div>
            <p className="text-xs text-gray-400 truncate">{file ? file.name : (editingId ? 'اختر اسكرين جديد (اختياري)' : 'اختر اسكرين شات العميل')}</p>
          </div>

          <input type="text" placeholder="عنوان قصير للرأي (مثال: تجربة ممتازة مع البوت)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="اسم مختصر للعميل (مثال: Ahmed M.)" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500" />
            <select value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500">
              <option value="اشتراك" className="bg-[#080a0f]">اشتراك</option>
              <option value="إدارة" className="bg-[#080a0f]">إدارة</option>
              <option value="بوت" className="bg-[#080a0f]">بوت</option>
              <option value="نتائج" className="bg-[#080a0f]">نتائج</option>
              <option value="دعم" className="bg-[#080a0f]">دعم</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="number" placeholder="ترتيب الظهور" value={formData.order} onChange={e => setFormData({...formData, order: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500" />
            <label className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 p-4 rounded-2xl cursor-pointer hover:bg-green-500/20 transition-all">
              <input type="checkbox" checked={formData.isVisible} onChange={e => setFormData({...formData, isVisible: e.target.checked})} className="w-5 h-5 accent-green-500 rounded" />
              <span className="text-white font-bold flex items-center gap-2"><Icons.CheckCircle /> ظاهر في الموقع</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50">
              {loading ? 'جاري الحفظ...' : (editingId ? 'حفظ التعديل' : 'نشر الرأي')}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all">إلغاء</button>
            )}
          </div>
        </form>
      </div>

      <div className="flex-1 min-w-0 w-full bg-[#080a0f] border border-white/5 p-6 md:p-8 rounded-[40px] shadow-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3"><Icons.MessageCircle /> مكتبة آراء العملاء</h2>
            <p className="text-gray-500 text-sm mt-2">كل الاسكرينات المضافة هنا تظهر في موقع العميل حسب حالة الظهور والترتيب.</p>
          </div>
          <button onClick={fetchTestimonials} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-3 rounded-2xl font-bold transition-all">
            تحديث القائمة
          </button>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
          {testimonials.map((item) => {
            const id = item.id || item._id;
            const visible = item.isVisible === false || item.isVisible === 'false' ? false : true;
            return (
              <div key={id} className={'relative bg-black/30 border ' + (visible ? 'border-white/10' : 'border-red-500/30 opacity-60') + ' rounded-[32px] overflow-hidden shadow-xl group'}>
                <div className="relative h-72 bg-black overflow-hidden">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-full text-[10px] font-black">
                    #{item.order || 1}
                  </div>
                  <div className={(visible ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white') + ' absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-black'}>
                    {visible ? 'ظاهر' : 'مخفي'}
                  </div>
                </div>

                <div className="p-5 text-right space-y-3">
                  <div>
                    <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black mb-3">
                      <Icons.Telegram size={13} /> {item.serviceType || 'Telegram'}
                    </span>
                    <h3 className="font-black text-white line-clamp-2">{item.title || 'رأي عميل'}</h3>
                    <p className="text-xs text-gray-500 mt-1">{item.clientName || 'عميل CR7'}</p>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-white/5">
                    <button onClick={() => handleEditClick(item)} className="flex-1 text-blue-400 bg-blue-500/5 hover:bg-blue-500 hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-blue-500/10">
                      <Icons.Edit /> تعديل
                    </button>
                    <button onClick={() => handleDelete(id)} className="flex-1 text-red-400 bg-red-500/5 hover:bg-red-500 hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-red-500/10">
                      <Icons.Trash /> حذف
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {testimonials.length === 0 && (
            <div className="col-span-full py-24 border-2 border-dashed border-white/5 rounded-[40px] text-center">
              <Icons.MessageCircle size={42} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-500 font-bold">لا توجد آراء عملاء مضافة حتى الآن.</p>
              <p className="text-gray-600 text-sm mt-2">ابدأ برفع أول اسكرين شات من محادثات تيليجرام.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// التطبيق الرئيسي (Root Component)
// ---------------------------------------------------------
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('blog'); 
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

    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setAuthChecking(false); });
    return () => unsub();
  }, []);

  if (authChecking) return <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center font-black animate-pulse tracking-widest uppercase">SECURE CONNECTION...</div>;
  
  if (!user) return <LoginScreen setAuthError={setAuthError} authError={authError} />;

  return (
    <div className="flex min-h-screen w-full bg-[#020408] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden" dir="rtl">
      
      <aside className={`fixed lg:sticky top-0 right-0 z-50 h-screen w-[280px] bg-[#05070a] border-l border-white/5 flex flex-col transition-all duration-300 transform shrink-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl border border-white/5 overflow-hidden bg-white/5">
              <img src="https://res.cloudinary.com/dazvddyzm/image/upload/v1776084289/IMG-20260313-WA0015.jpg_koyn4d.jpg" alt="CR7 Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter uppercase leading-none text-white">CR7</h1>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">Admin Panel</p>
            </div>
          </div>
          <button className="lg:hidden p-3 bg-white/5 rounded-2xl text-white" onClick={() => setIsSidebarOpen(false)}><Icons.X /></button>
        </div>
        
        <nav className="flex-1 px-6 space-y-4">
          <button onClick={() => { setActiveTab('statistics'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-[28px] font-black text-sm transition-all ${activeTab === 'statistics' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 border border-white/10' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
            <Icons.PieChart /> الإحصائيات
          </button>
          <button onClick={() => { setActiveTab('bots'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-[28px] font-black text-sm transition-all ${activeTab === 'bots' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 border border-white/10' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
            <Icons.Cpu /> إدارة البوتات
          </button>
          <button onClick={() => { setActiveTab('subscriptions'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-[28px] font-black text-sm transition-all ${activeTab === 'subscriptions' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 border border-white/10' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
            <Icons.ShieldCheck /> الاشتراكات والإدارة
          </button>
          <button onClick={() => { setActiveTab('results'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-[28px] font-black text-sm transition-all ${activeTab === 'results' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 border border-white/10' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
            <Icons.Activity /> إدارة نتائج التداول
          </button>
          <button onClick={() => { setActiveTab('blog'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-[28px] font-black text-sm transition-all ${activeTab === 'blog' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 border border-white/10' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
            <Icons.BookOpen /> إدارة المدونة
          </button>
          <button onClick={() => { setActiveTab('testimonials'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-[28px] font-black text-sm transition-all ${activeTab === 'testimonials' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 border border-white/10' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
            <Icons.MessageCircle /> آراء العملاء
          </button>
          <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-[28px] font-black text-sm transition-all ${activeTab === 'settings' ? 'bg-gray-700 text-white shadow-2xl border border-white/10' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
            <Icons.Settings /> الإعدادات العامة
          </button>
        </nav>

        <div className="p-8 border-t border-white/5">
          <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-3 p-4 rounded-[24px] text-red-400 bg-red-500/5 hover:bg-red-500 hover:text-white font-black transition-all shadow-lg active:scale-95">
            <Icons.LogOut /> تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col w-full min-w-0 relative">
        <header className="lg:hidden flex items-center justify-between p-6 bg-[#05070a]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
           <div className="font-black text-xl tracking-tight text-blue-500">CR7 ADMIN V2</div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white/5 rounded-2xl active:bg-white/10 transition-colors"><Icons.Menu /></button>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 relative w-full h-full">
          <div className="w-full pb-20">
            <div className="mb-10 lg:mb-12 flex flex-col items-center justify-center text-center mx-auto">
              <h2 className="text-3xl lg:text-5xl font-black mb-3 tracking-tighter">
                {activeTab === 'results' ? 'النتائج والأرباح 📈' : activeTab === 'subscriptions' ? 'الاشتراكات والإدارة 🤝' : activeTab === 'settings' ? 'الإعدادات العامة ⚙️' : activeTab === 'statistics' ? 'الإحصائيات والتحليلات 📊' : activeTab === 'testimonials' ? 'آراء العملاء 💬' : activeTab === 'blog' ? 'إدارة المدونة 📝' : 'منظومة البوتات 🤖'}
              </h2>
              <p className="text-gray-500 text-base lg:text-lg max-w-2xl leading-relaxed text-center mx-auto">
                تحكم في محتوى الموقع المباشر وقم بتحديث البيانات فوراً.
              </p>
            </div>
            
            <div className="w-full">
              {activeTab === 'results' ? <ResultsManager /> : activeTab === 'subscriptions' ? <SubscriptionsManager /> : activeTab === 'settings' ? <SettingsManager /> : activeTab === 'statistics' ? <StatisticsManager /> : activeTab === 'testimonials' ? <TestimonialsManager /> : activeTab === 'blog' ? <BlogManager /> : <BotsManager />}
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}
