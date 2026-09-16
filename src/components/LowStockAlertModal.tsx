import React from 'react';
import { AlertTriangle, X, Plus, ShieldCheck, ArrowRight } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Peringatan Stok Obat UKS
              </h3>
              <p className="text-[11px] text-slate-500">
                {lowStockMedicines.length} obat membutuhkan penambahan stok segera
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          {lowStockMedicines.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">Semua Stok Obat Aman!</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Tidak ada obat yang berada di bawah batas minimum persediaan.
              </p>
            </div>
          ) : (
            lowStockMedicines.map(med => {
              const isZero = med.stock === 0;
              return (
                <div
                  key={med.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isZero ? 'bg-red-50/70 border-red-200' : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{med.name}</span>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isZero ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {isZero ? 'HABIS (0)' : 'MENIPIS'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Kategori: <strong className="text-slate-700">{med.category}</strong> • Batas Aman: {med.minStock} {med.unit}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                      Sisa saat ini: <span className={isZero ? 'text-red-700 font-bold' : 'text-amber-700 font-bold'}>
                        {med.stock} {med.unit}
                      </span>
                      {med.location && ` • Lokasi: ${med.location}`}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRestock(med.id);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Restock
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigateToTab('inventory');
            }}
            className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
          >
            Buka Halaman Stok Obat &rarr;
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
