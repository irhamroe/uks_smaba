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
    <header className="sticky top-0 z-30 bg-[#FFFBFE]/90 backdrop-blur-md border-b border-[#E7E0EC] transition-all duration-300">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* School Brand & Logo */}
          <div 
            className="flex items-center gap-3.5 cursor-pointer group active:scale-95 transition-transform duration-300" 
            onClick={() => navigateToTab('guestbook')}
          >
            <div className="w-12 h-12 bg-[#E8DEF8] rounded-2xl flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/logo-sman1-batu.png" 
                alt="Logo SMA Negeri 1 Batu" 
                className="w-10 h-10 object-contain" 
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold text-[#1C1B1F] leading-tight tracking-tight">
                  UKS SMAN 1 BATU
                </h1>
              </div>
              <p className="text-xs text-[#49454F] font-normal truncate max-w-[200px] sm:max-w-none">
                Buku Kontrol Pengunjung & Farmasi Digital
              </p>
            </div>
          </div>

          {/* Center / Desktop Info - MD3 Pill */}
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8DEF8] text-[#1D192B] text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#6750A4]"></span>
            <span>Portal Layanan Kesehatan Digital</span>
          </div>

          {/* Right Action: Live Clock & Admin Login Button */}
          <div className="flex items-center gap-3">
            {/* Live Clock Badge */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3EDF7] text-[#49454F] text-xs font-medium shadow-2xs" title="Waktu Sistem Real-time">
              <Clock className="w-4 h-4 text-[#6750A4] shrink-0" />
              <span>{currentTime}</span>
            </div>

            {/* Login Admin Button (hidden when on login page) */}
            {activeTab !== 'login' && (
              <button
                type="button"
                id="btn-nav-login-admin"
                onClick={() => navigateToTab('login')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 bg-[#6750A4] hover:bg-[#6750A4]/90 text-white shadow-sm hover:shadow-md cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Login Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
