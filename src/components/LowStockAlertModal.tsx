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
    <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-lg max-w-xl w-full border-2 border-gray-200 flex flex-col max-h-[88vh] overflow-hidden">
        
        {/* Flat Header with Amber Solid Block */}
        <div className="px-6 py-5 bg-amber-500 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-md bg-amber-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-lg uppercase tracking-tight">
                  Peringatan Stok Obat UKS
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white text-amber-800">
                  {totalCritical} Item Kritis
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5 font-medium">
                {zeroCount > 0 
                  ? `${zeroCount} obat habis total & ${totalCritical - zeroCount} obat di bawah batas aman minimum`
                  : `${totalCritical} obat membutuhkan penambahan stok segera`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition cursor-pointer shrink-0"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Medicine List Body */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1 bg-white">
          {lowStockMedicines.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
              </div>
              <h4 className="font-black text-gray-900 text-base uppercase">Semua Stok Obat Aman!</h4>
              <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto font-medium">
                Seluruh obat dalam inventaris UKS SMAN 1 Batu berada di atas batas minimum persediaan.
              </p>
            </div>
          ) : (
            lowStockMedicines.map(med => {
              const isZero = med.stock === 0;

              return (
                <div
                  key={med.id}
                  className={`p-4 rounded-md border-2 transition-all duration-150 ${
                    isZero 
                      ? 'bg-rose-50 border-rose-300' 
                      : 'bg-amber-50 border-amber-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-extrabold text-gray-900 text-sm tracking-tight">
                          {med.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider ${
                          isZero 
                            ? 'bg-rose-600 text-white' 
                            : 'bg-amber-500 text-white'
                        }`}>
                          {isZero ? 'Habis (0)' : 'Stok Menipis'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 mb-2">
                        <span className="flex items-center gap-1 font-medium">
                          <Layers className="w-3.5 h-3.5 text-gray-500" />
                          {med.category}
                        </span>
                        {med.location && (
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-gray-500" />
                            {med.location}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-800">
                          Tersedia: <strong className={isZero ? 'text-rose-600 font-black' : 'text-amber-700 font-black'}>{med.stock} {med.unit}</strong>
                        </span>
                        <span className="text-gray-600 font-medium">
                          Batas Aman: <strong className="text-gray-900 font-bold">{med.minStock} {med.unit}</strong>
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
                        className="w-full sm:w-auto px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-wider rounded-md transition-all duration-150 hover:scale-105 flex items-center justify-center gap-1.5 cursor-pointer"
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
        <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigateToTab('inventory');
            }}
            className="w-full sm:w-auto text-sky-600 hover:text-sky-800 font-bold flex items-center justify-center sm:justify-start gap-1.5 py-1.5 transition cursor-pointer uppercase tracking-wider"
          >
            <span>Buka Manajemen Farmasi</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-900 font-extrabold uppercase tracking-wider transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
