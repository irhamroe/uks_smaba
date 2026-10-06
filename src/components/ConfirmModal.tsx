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
          iconBg: 'bg-[#F9DEDC] text-[#B3261E]',
          confirmBtn: 'bg-[#B3261E] hover:bg-[#B3261E]/90 text-white',
          badgeText: 'Konfirmasi Hapus'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-[#FFD8E4] text-[#7D5260]',
          confirmBtn: 'bg-[#7D5260] hover:bg-[#7D5260]/90 text-white',
          badgeText: 'Peringatan'
        };
      case 'info':
      default:
        return {
          icon: HelpCircle,
          iconBg: 'bg-[#EADDFF] text-[#6750A4]',
          confirmBtn: 'bg-[#6750A4] hover:bg-[#6750A4]/90 text-white',
          badgeText: 'Konfirmasi Tindakan'
        };
    }
  };

  const style = getTypeStyle();
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1B1F]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFBFE] rounded-[28px] max-w-md w-full border border-[#E7E0EC] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Icon */}
        <div className="p-6 sm:p-7 pb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-xs ${style.iconBg}`}>
              <Icon className="w-6 h-6" />
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-full text-[#79747E] hover:text-[#1C1B1F] hover:bg-[#E7E0EC] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-[#79747E] block mb-1">
            {style.badgeText}
          </span>
          <h3 className="text-lg font-bold text-[#1C1B1F] leading-snug">
            {title}
          </h3>
          <p className="text-xs text-[#49454F] mt-1.5 leading-relaxed font-normal">
            {message}
          </p>

          {/* Optional Details Box */}
          {details && details.length > 0 && (
            <div className="mt-4 p-4 bg-[#F3EDF7] rounded-2xl text-xs space-y-1.5 border border-[#E7E0EC]">
              {details.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-[#49454F] font-medium">{item.label}:</span>
                  <span className="font-bold text-[#1C1B1F] truncate max-w-[200px]">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-6 pt-3 bg-[#F3EDF7]/50 border-t border-[#E7E0EC] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full text-xs font-medium text-[#49454F] hover:bg-[#E7E0EC] active:scale-95 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2 ${style.confirmBtn}`}
          >
            {type === 'danger' && <Trash2 className="w-4 h-4" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
