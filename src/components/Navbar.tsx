import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  ClipboardList, 
  LayoutDashboard, 
  Pill, 
  FileSpreadsheet, 
  AlertTriangle, 
  Clock, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Lock,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useUks } from '../context/UksContext';
import { SCHOOL_INFO } from '../data/initialData';

interface NavbarProps {
  onOpenLowStockModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLowStockModal }) => {
  const { 
    activeTab, 
    navigateToTab, 
    isAdminLoggedIn, 
    adminUser, 
    logoutAdmin, 
    lowStockMedicines 
  } = useUks();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(now)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalAlerts = lowStockMedicines.length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* School Brand & Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateToTab('guestbook')}>
            <img 
              src="/logo-sman1-batu.png" 
              alt="Logo SMA Negeri 1 Batu" 
              className="w-11 h-11 sm:w-12 sm:h-12 object-contain shrink-0 drop-shadow-xs" 
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight tracking-tight">
                  UKS SMAN 1 BATU
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-none">
                Buku Tamu Siswa & Farmasi Sekolah
              </p>
            </div>
          </div>

          {/* Center / Desktop Info - Clean branding */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Buku Tamu & Pelayanan Kesehatan Digital UKS</span>
          </div>

          {/* Right Action: Live Clock & Admin Login Button */}
          <div className="flex items-center gap-2.5">
            {/* Live Clock Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 text-slate-700 border border-slate-200/80 text-xs font-medium shadow-2xs" title="Waktu Sistem Real-time">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800">{currentTime}</span>
            </div>

            {/* Login Admin Button (hidden when on login page) */}
            {activeTab !== 'login' && (
              <button
                type="button"
                id="btn-nav-login-admin"
                onClick={() => navigateToTab('login')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300"
              >
                <LogIn className="w-4 h-4 text-emerald-700" />
                <span>Login Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

