import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useUks } from '../context/UksContext';

export const Toast: React.FC = () => {
  const { toast, dismissToast } = useUks();

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5">
      <div className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 ${
        toast.type === 'success'
          ? 'bg-emerald-900 text-white border-emerald-700'
          : toast.type === 'warning'
          ? 'bg-amber-900 text-white border-amber-700'
          : toast.type === 'error'
          ? 'bg-red-900 text-white border-red-700'
          : 'bg-slate-900 text-white border-slate-700'
      }`}>
        <div className="shrink-0 mt-0.5">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-300 animate-bounce" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-300" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-300" />}
        </div>

        <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
          {toast.message}
        </div>

        <button
          type="button"
          onClick={dismissToast}
          className="text-white/60 hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
