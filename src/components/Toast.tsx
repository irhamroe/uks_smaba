import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  XCircle, 
  X
} from 'lucide-react';
import { useUks } from '../context/UksContext';

export const Toast: React.FC = () => {
  const { toast, dismissToast } = useUks();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const startTime = Date.now();
    const duration = 4000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [toast]);

  if (!toast) return null;

  const getTypeConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          title: 'Berhasil',
          icon: CheckCircle2,
          bgColor: 'bg-[#0C1E2E]',
          textColor: 'text-[#E0F2FE]',
          iconBg: 'bg-[#0284C7]',
          iconColor: 'text-white',
          barColor: 'bg-[#38BDF8]',
          badgeBg: 'bg-[#E0F2FE]',
          badgeText: 'text-[#0C4A6E]'
        };
      case 'warning':
        return {
          title: 'Peringatan',
          icon: AlertTriangle,
          bgColor: 'bg-[#451A03]',
          textColor: 'text-[#FEF3C7]',
          iconBg: 'bg-[#D97706]',
          iconColor: 'text-white',
          barColor: 'bg-[#FDE68A]',
          badgeBg: 'bg-[#FEF3C7]',
          badgeText: 'text-[#78350F]'
        };
      case 'error':
        return {
          title: 'Perhatian / Gagal',
          icon: XCircle,
          bgColor: 'bg-[#410E0B]',
          textColor: 'text-[#F9DEDC]',
          iconBg: 'bg-[#B3261E]',
          iconColor: 'text-white',
          barColor: 'bg-[#F9DEDC]',
          badgeBg: 'bg-[#F9DEDC]',
          badgeText: 'text-[#410E0B]'
        };
      case 'info':
      default:
        return {
          title: 'Informasi UKS',
          icon: Info,
          bgColor: 'bg-[#132A3E]',
          textColor: 'text-[#E0F2FE]',
          iconBg: 'bg-[#0284C7]',
          iconColor: 'text-white',
          barColor: 'bg-[#BAE6FD]',
          badgeBg: 'bg-[#E0F2FE]',
          badgeText: 'text-[#0C4A6E]'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] sm:w-full animate-in fade-in slide-in-from-top-4 duration-300">
      <div 
        className={`relative overflow-hidden ${config.bgColor} ${config.textColor} rounded-3xl border border-white/10 shadow-xl p-4 sm:p-5`}
      >
        <div className="flex items-start gap-3.5 relative z-10">
          {/* Icon Badge */}
          <div className="relative shrink-0 mt-0.5">
            <div className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center shadow-xs`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText}`}>
                {config.title}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium leading-relaxed break-words">
              {toast.message}
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={dismissToast}
            className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition cursor-pointer shrink-0 text-white/80 hover:text-white"
            title="Tutup Notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
          <div 
            className={`h-full ${config.barColor} transition-all ease-linear`}
            style={{ width: `${progress}%`, transitionDuration: '40ms' }}
          />
        </div>
      </div>
    </div>
  );
};
