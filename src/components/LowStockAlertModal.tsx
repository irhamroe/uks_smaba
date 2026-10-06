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
    <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#F8FAFC] rounded-[32px] max-w-xl w-full border border-[#E0F2FE] shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Material You Gradient */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white flex items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-6 h-6 text-[#BAE6FD]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg tracking-tight">
                  Peringatan Stok Obat UKS
                </h3>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#BAE6FD] text-[#0C4A6E]">
                  {totalCritical} Item Kritis
                </span>
              </div>
              <p className="text-xs text-[#E0F2FE] mt-0.5 font-normal">
                {zeroCount > 0 
                  ? `${zeroCount} obat habis total & ${totalCritical - zeroCount} obat di bawah batas aman minimum`
                  : `${totalCritical} obat membutuhkan penambahan stok segera`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Medicine List Body */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1 bg-[#F8FAFC]">
          {lowStockMedicines.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mx-auto mb-3 shadow-xs">
                <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
              </div>
              <h4 className="font-bold text-[#0F172A] text-base">Semua Stok Obat Aman!</h4>
              <p className="text-xs text-[#334155] mt-1 max-w-sm mx-auto font-normal">
                Seluruh obat dalam inventaris UKS SMAN 1 Batu berada di atas batas minimum persediaan.
              </p>
            </div>
          ) : (
            lowStockMedicines.map(med => {
              const isZero = med.stock === 0;

              return (
                <div
                  key={med.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    isZero 
                      ? 'bg-[#F9DEDC] border-[#B3261E]/30' 
                      : 'bg-[#F0F9FF] border-[#E0F2FE]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-[#0F172A] text-sm tracking-tight">
                          {med.name}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isZero 
                            ? 'bg-[#B3261E] text-white' 
                            : 'bg-[#0284C7] text-white'
                        }`}>
                          {isZero ? 'Habis (0)' : 'Stok Menipis'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#334155] mb-2">
                        <span className="flex items-center gap-1 font-normal">
                          <Layers className="w-3.5 h-3.5 text-[#94A3B8]" />
                          {med.category}
                        </span>
                        {med.location && (
                          <span className="flex items-center gap-1 font-normal">
                            <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                            {med.location}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-[#0F172A]">
                          Tersedia: <strong className={isZero ? 'text-[#B3261E] font-bold' : 'text-[#0284C7] font-bold'}>{med.stock} {med.unit}</strong>
                        </span>
                        <span className="text-[#334155] font-normal">
                          Batas Aman: <strong className="text-[#0F172A] font-medium">{med.minStock} {med.unit}</strong>
                        </span>
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
                        className="w-full sm:w-auto px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-medium rounded-full active:scale-95 transition-all duration-300 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
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
        <div className="px-6 py-4 bg-[#F0F9FF] border-t border-[#E0F2FE] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigateToTab('inventory');
            }}
            className="w-full sm:w-auto text-[#0284C7] hover:underline font-medium flex items-center justify-center sm:justify-start gap-1.5 py-1.5 transition cursor-pointer"
          >
            <span>Buka Manajemen Farmasi</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0F172A] font-medium transition cursor-pointer active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
