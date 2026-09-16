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
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          iconColor: 'text-emerald-400',
          glowColor: 'shadow-emerald-500/20',
          barColor: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300',
          borderHighlight: 'border-emerald-500/30 ring-emerald-500/20'
        };
      case 'warning':
        return {
          title: 'Peringatan',
          icon: AlertTriangle,
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          iconColor: 'text-amber-400',
          glowColor: 'shadow-amber-500/20',
          barColor: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300',
          borderHighlight: 'border-amber-500/30 ring-amber-500/20'
        };
      case 'error':
        return {
          title: 'Perhatian / Gagal',
          icon: XCircle,
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          iconColor: 'text-rose-400',
          glowColor: 'shadow-rose-500/20',
          barColor: 'bg-gradient-to-r from-rose-500 via-pink-400 to-rose-300',
          borderHighlight: 'border-rose-500/30 ring-rose-500/20'
        };
      case 'info':
      default:
        return {
          title: 'Informasi UKS',
          icon: Info,
          badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
          iconColor: 'text-sky-400',
          glowColor: 'shadow-sky-500/20',
          barColor: 'bg-gradient-to-r from-sky-500 via-indigo-400 to-sky-300',
          borderHighlight: 'border-sky-500/30 ring-sky-500/20'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] sm:w-full animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div 
        className={`relative overflow-hidden bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl border ${config.borderHighlight} shadow-2xl ${config.glowColor} ring-1 p-4 sm:p-4.5 transition-all duration-300`}
      >
        {/* Glow effect in background */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5 relative z-10">
          {/* Glowing Icon Badge */}
          <div className="relative shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center shadow-inner">
              <Icon className={`w-5 h-5 ${config.iconColor} ${toast.type === 'warning' ? 'animate-pulse' : ''}`} />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                toast.type === 'success' ? 'bg-emerald-400' :
                toast.type === 'warning' ? 'bg-amber-400' :
                toast.type === 'error' ? 'bg-rose-400' : 'bg-sky-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 border-2 border-slate-900 ${
                toast.type === 'success' ? 'bg-emerald-500' :
                toast.type === 'warning' ? 'bg-amber-500' :
                toast.type === 'error' ? 'bg-rose-500' : 'bg-sky-500'
              }`} />
            </span>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md border tracking-wider ${config.badgeBg}`}>
                {config.title}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed break-words">
              {toast.message}
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={dismissToast}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer shrink-0"
            title="Tutup Notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80 overflow-hidden">
          <div 
            className={`h-full ${config.barColor} transition-all ease-linear shadow-xs`}
            style={{ width: `${progress}%`, transitionDuration: '40ms' }}
          />
        </div>
      </div>
    </div>
  );
};
