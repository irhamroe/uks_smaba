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
    <header className="sticky top-0 z-30 bg-white border-b-2 border-gray-200">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* School Brand & Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group transition-transform duration-200 hover:scale-102" 
            onClick={() => navigateToTab('guestbook')}
          >
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <img 
                src="/logo-sman1-batu.png" 
                alt="Logo SMA Negeri 1 Batu" 
                className="w-10 h-10 object-contain" 
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight tracking-tight">
                  UKS SMAN 1 BATU
                </h1>
              </div>
              <p className="text-xs text-gray-500 font-semibold truncate max-w-[200px] sm:max-w-none uppercase tracking-wider">
                Buku Kontrol Pengunjung & Farmasi Digital
              </p>
            </div>
          </div>

          {/* Center / Desktop Info - Bold Flat Pill */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>PORTAL LAYANAN KESEHATAN DIGITAL</span>
          </div>

          {/* Right Action: Live Clock & Admin Login Button */}
          <div className="flex items-center gap-3">
            {/* Live Clock Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-md bg-gray-100 text-gray-800 text-xs font-bold" title="Waktu Sistem Real-time">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{currentTime}</span>
            </div>

            {/* Login Admin Button (hidden when on login page) */}
            {activeTab !== 'login' && (
              <button
                type="button"
                id="btn-nav-login-admin"
                onClick={() => navigateToTab('login')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold transition-all duration-200 hover:scale-105 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
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

