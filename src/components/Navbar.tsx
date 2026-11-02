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

  return (
    <header className="sticky top-0 z-30 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-[#E0F2FE] transition-all duration-300">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-3">
          
          {/* School Brand & Logo */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group active:scale-95 transition-transform duration-300 min-w-0" 
            onClick={() => navigateToTab('guestbook')}
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[#E0F2FE] rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/logo-sman1-batu.png" 
                alt="Logo SMA Negeri 1 Batu" 
                className="w-7 h-7 sm:w-10 sm:h-10 object-contain" 
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-lg font-bold text-[#0F172A] leading-tight tracking-tight truncate">
                  UKS SMAN 1 BATU
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs text-[#334155] font-normal truncate max-w-[160px] sm:max-w-none">
                Buku Kontrol Pengunjung & Farmasi Digital
              </p>
            </div>
          </div>

          {/* Center / Desktop Info - MD3 Pill */}
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E0F2FE] text-[#0C4A6E] text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
            <span>Portal Layanan Kesehatan Digital</span>
          </div>

          {/* Right Action: Live Clock & Admin Login Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Clock Badge */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0F9FF] text-[#334155] text-xs font-medium shadow-2xs" title="Waktu Sistem Real-time">
              <Clock className="w-4 h-4 text-[#0284C7] shrink-0" />
              <span>{currentTime}</span>
            </div>

            {/* Login Admin Button (hidden when on login page) */}
            {activeTab !== 'login' && (
              <button
                type="button"
                id="btn-nav-login-admin"
                onClick={() => navigateToTab('login')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-xs font-semibold active:scale-95 transition-all duration-300 bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-xs hover:shadow-md cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Login Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
