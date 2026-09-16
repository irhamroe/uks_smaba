import React from 'react';
import { 
  AlertTriangle, 
  X, 
  Plus, 
  ShieldCheck, 
  ArrowRight,
  Pill,
  Sparkles,
  MapPin,
  TrendingDown,
  Layers
} from 'lucide-react';
import { useUks } from '../context/UksContext';

interface LowStockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRestock: (medicineId: string) => void;
}

export const LowStockAlertModal: React.FC<LowStockAlertModalProps> = ({
  isOpen,
  onClose,
  onOpenRestock
}) => {
  const { lowStockMedicines, outOfStockMedicines, navigateToTab } = useUks();

  if (!isOpen) return null;

  const totalCritical = lowStockMedicines.length;
  const zeroCount = outOfStockMedicines.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[88vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modern Header with Amber/Rose Gradient Accent */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              {zeroCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-white text-[9px] font-black items-center justify-center border-2 border-white">
                    !
                  </span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
                  Peringatan Stok Obat UKS
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                  {totalCritical} Item Kritis
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {zeroCount > 0 
                  ? `${zeroCount} obat habis total & ${totalCritical - zeroCount} obat di bawah batas aman minimum`
                  : `${totalCritical} obat membutuhkan pengadaan / penambahan stok segera`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Medicine List Body */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {lowStockMedicines.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Semua Stok Obat Aman!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Seluruh obat dalam inventaris UKS SMAN 1 Batu berada di atas batas minimum persediaan.
              </p>
            </div>
          ) : (
            lowStockMedicines.map(med => {
              const isZero = med.stock === 0;
              const ratio = Math.min(100, Math.round((med.stock / Math.max(1, med.minStock)) * 100));

              return (
                <div
                  key={med.id}
                  className={`group relative p-4 rounded-2xl border transition-all duration-200 ${
                    isZero 
                      ? 'bg-rose-50/40 hover:bg-rose-50/70 border-rose-200/80 hover:border-rose-300 shadow-xs' 
                      : 'bg-amber-50/30 hover:bg-amber-50/60 border-amber-200/80 hover:border-amber-300 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-slate-900 text-sm tracking-tight">
                          {med.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isZero 
                            ? 'bg-rose-600 text-white shadow-xs' 
                            : 'bg-amber-500 text-white shadow-xs'
                        }`}>
                          {isZero ? 'Habis (0)' : 'Stok Menipis'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mb-2.5">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {med.category}
                        </span>
                        {med.location && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {med.location}
                          </span>
                        )}
                      </div>

                      {/* Stock Level Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500 font-medium">
                            Tersedia: <strong className={isZero ? 'text-rose-700 font-bold' : 'text-amber-700 font-bold'}>{med.stock} {med.unit}</strong>
                          </span>
                          <span className="text-slate-400 font-medium">
                            Batas Aman: <strong className="text-slate-700">{med.minStock} {med.unit}</strong>
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isZero 
                                ? 'w-0' 
                                : ratio <= 30 
                                ? 'bg-rose-500' 
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${isZero ? 0 : Math.max(5, ratio)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Restock Action Button */}
                    <div className="sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenRestock(med.id);
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigateToTab('inventory');
            }}
            className="w-full sm:w-auto text-emerald-700 hover:text-emerald-800 font-bold flex items-center justify-center sm:justify-start gap-1.5 py-1.5 px-2 rounded-lg hover:bg-emerald-50 transition cursor-pointer"
          >
            <span>Buka Seluruh Manajemen Farmasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
