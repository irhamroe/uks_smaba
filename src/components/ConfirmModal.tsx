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
          iconBg: 'bg-rose-600 text-white',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
          badgeText: 'Konfirmasi Hapus'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-amber-500 text-white',
          confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white',
          badgeText: 'Peringatan'
        };
      case 'info':
      default:
        return {
          icon: HelpCircle,
          iconBg: 'bg-blue-600 text-white',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
          badgeText: 'Konfirmasi Tindakan'
        };
    }
  };

  const style = getTypeStyle();
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full border-2 border-gray-200 overflow-hidden">
        
        {/* Header with Icon */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 ${style.iconBg}`}>
              <Icon className="w-6 h-6" />
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1">
            {style.badgeText}
          </span>
          <h3 className="text-lg font-black text-gray-900 leading-snug">
            {title}
          </h3>
          <p className="text-xs text-gray-600 mt-1.5 leading-relaxed font-medium">
            {message}
          </p>

          {/* Optional Details Box */}
          {details && details.length > 0 && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md text-xs space-y-1.5">
              {details.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold">{item.label}:</span>
                  <span className="font-extrabold text-gray-900 truncate max-w-[200px]">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 border-t-2 border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-md text-xs font-bold text-gray-700 hover:bg-gray-200 transition cursor-pointer uppercase tracking-wider"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all duration-150 hover:scale-105 cursor-pointer flex items-center gap-2 ${style.confirmBtn}`}
          >
            {type === 'danger' && <Trash2 className="w-4 h-4" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
