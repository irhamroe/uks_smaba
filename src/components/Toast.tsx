import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  XCircle, 
  X,
  Sparkles,
  ShieldAlert,
  BellRing
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
          bgColor: 'bg-emerald-600',
          textColor: 'text-white',
          iconBg: 'bg-emerald-700',
          barColor: 'bg-emerald-300'
        };
      case 'warning':
        return {
          title: 'Peringatan',
          icon: AlertTriangle,
          bgColor: 'bg-amber-500',
          textColor: 'text-white',
          iconBg: 'bg-amber-600',
          barColor: 'bg-amber-200'
        };
      case 'error':
        return {
          title: 'Perhatian / Gagal',
          icon: XCircle,
          bgColor: 'bg-rose-600',
          textColor: 'text-white',
          iconBg: 'bg-rose-700',
          barColor: 'bg-rose-300'
        };
      case 'info':
      default:
        return {
          title: 'Informasi UKS',
          icon: Info,
          bgColor: 'bg-sky-600',
          textColor: 'text-white',
          iconBg: 'bg-sky-700',
          barColor: 'bg-sky-300'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] sm:w-full">
      <div 
        className={`relative overflow-hidden ${config.bgColor} ${config.textColor} rounded-lg border-2 border-gray-900 p-4 sm:p-5`}
      >
        <div className="flex items-start gap-3.5 relative z-10">
          {/* Icon Badge */}
          <div className="relative shrink-0 mt-0.5">
            <div className={`w-10 h-10 rounded-md ${config.iconBg} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-sm bg-black/20 tracking-wider">
                {config.title}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold leading-relaxed break-words">
              {toast.message}
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={dismissToast}
            className="p-1.5 rounded-md hover:bg-black/20 transition cursor-pointer shrink-0 text-white"
            title="Tutup Notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20 overflow-hidden">
          <div 
            className={`h-full ${config.barColor} transition-all ease-linear`}
            style={{ width: `${progress}%`, transitionDuration: '40ms' }}
          />
        </div>
      </div>
    </div>
  );
};
