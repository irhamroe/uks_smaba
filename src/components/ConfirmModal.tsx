import React from 'react';
import { AlertTriangle, Trash2, X, AlertCircle, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: { label: string; value: string }[];
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  details,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  type = 'danger',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const getTypeStyle = () => {
    switch (type) {
      case 'danger':
        return {
          icon: Trash2,
          iconBg: 'bg-rose-100 text-rose-600 ring-4 ring-rose-50',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-rose-600/20',
          badgeText: 'Konfirmasi Hapus'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-amber-100 text-amber-600 ring-4 ring-amber-50',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-amber-600/20',
          badgeText: 'Peringatan'
        };
      case 'info':
      default:
        return {
          icon: HelpCircle,
          iconBg: 'bg-sky-100 text-sky-600 ring-4 ring-sky-50',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/20',
          badgeText: 'Konfirmasi Tindakan'
        };
    }
  };

  const style = getTypeStyle();
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header with Icon */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${style.iconBg}`}>
              <Icon className="w-6 h-6" />
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            {style.badgeText}
          </span>
          <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
            {title}
          </h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            {message}
          </p>

          {/* Optional Details Box */}
          {details && details.length > 0 && (
            <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
              {details.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">{item.label}:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${style.confirmBtn}`}
          >
            {type === 'danger' && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
