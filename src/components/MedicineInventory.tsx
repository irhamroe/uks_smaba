import { 
  Pill, 
  Plus, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  X, 
  FileSpreadsheet, 
  Calendar, 
  MapPin, 
  Info,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Droplets,
  PackageOpen
} from 'lucide-react';
import { useUks } from '../context/UksContext';
import { Medicine, MedicineUsageType } from '../types';
import { downloadMedicineExcelTemplate, parseMedicineExcelFile } from '../utils/excelHelper';
import { ConfirmModal } from './ConfirmModal';

interface MedicineInventoryProps {
  restockTargetId?: string | null;
  onClearRestockTarget?: () => void;
}

export const MedicineInventory: React.FC<MedicineInventoryProps> = ({ 
  restockTargetId,
  onClearRestockTarget
}) => {
  const { 
    medicines, 
    addMedicine, 
    updateMedicine, 
    deleteMedicine, 
    restockMedicine,
    consumeMultiDoseBottle,
    importMedicinesFromExcel,
    lowStockMedicines,
    outOfStockMedicines
  } = useUks();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'safe' | 'expired'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(null);
  const [finishingBottleItem, setFinishingBottleItem] = useState<Medicine | null>(null);
  const [quickRestockItem, setQuickRestockItem] = useState<Medicine | null>(() => {
    if (restockTargetId) {
      return medicines.find(m => m.id === restockTargetId) || null;
    }
    return null;
  });
  const [showImportModal, setShowImportModal] = useState(false);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Analgesik & Antipiretik');
  const [formUnit, setFormUnit] = useState('Tablet');
  const [formUsageType, setFormUsageType] = useState<MedicineUsageType>('single_dose');
  const [formStock, setFormStock] = useState<number>(20);
  const [formMinStock, setFormMinStock] = useState<number>(10);
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formLocation, setFormLocation] = useState('Lemari A - Rak 1');
  const [formDescription, setFormDescription] = useState('');

  // Quick Restock State
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockNote, setRestockNote] = useState('Pengadaan rutin UKS SMAN 1 Batu');

  // Excel Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedImportList, setParsedImportList] = useState<Omit<Medicine, 'id' | 'lastUpdated'>[]>([]);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importError, setImportError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If restock target changes from parent
  React.useEffect(() => {
    if (restockTargetId) {
      const target = medicines.find(m => m.id === restockTargetId);
      if (target) setQuickRestockItem(target);
    }
  }, [restockTargetId, medicines]);

  // Categories available
  const categories = useMemo(() => {
    const set = new Set<string>();
    medicines.forEach(m => set.add(m.category));
    return Array.from(set).sort();
  }, [medicines]);

  // Filtered Medicines
  const filteredMedicines = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return medicines.filter(m => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesCat = m.category.toLowerCase().includes(q);
        const matchesLoc = (m.location || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesLoc) return false;
      }

      // Category
      if (categoryFilter !== 'all' && m.category !== categoryFilter) {
        return false;
      }

      // Status
      if (statusFilter === 'low') {
        return m.stock <= m.minStock;
      } else if (statusFilter === 'safe') {
        return m.stock > m.minStock;
      } else if (statusFilter === 'expired') {
        return m.expiryDate && m.expiryDate < todayStr;
      }

      return true;
    });
  }, [medicines, searchQuery, categoryFilter, statusFilter]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedMedicines = useMemo(() => {
    const start = (validCurrentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(start, start + itemsPerPage);
  }, [filteredMedicines, validCurrentPage, itemsPerPage]);

  // Open Edit
  const handleOpenEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setFormName(med.name);
    setFormCategory(med.category);
    setFormUnit(med.unit);
    setFormUsageType(
      med.usageType || 
      (med.unit === 'Botol' || med.unit === 'Tube' || med.category.toLowerCase().includes('luar') ? 'multi_dose' : 'single_dose')
    );
    setFormStock(med.stock);
    setFormMinStock(med.minStock);
    setFormExpiryDate(med.expiryDate || '');
    setFormLocation(med.location || '');
    setFormDescription(med.description || '');
  };

  // Open Add
  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setFormName('');
    setFormCategory('Analgesik & Antipiretik');
    setFormUnit('Tablet');
    setFormUsageType('single_dose');
    setFormStock(20);
    setFormMinStock(10);
    setFormExpiryDate('2027-12-31');
    setFormLocation('Lemari A - Rak 1');
    setFormDescription('');
    setShowAddModal(true);
  };

  // Save Add or Edit
  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingMedicine) {
      updateMedicine(editingMedicine.id, {
        name: formName.trim(),
        category: formCategory.trim(),
        unit: formUnit.trim(),
        usageType: formUsageType,
        stock: formStock,
        minStock: formMinStock,
        expiryDate: formExpiryDate.trim(),
        location: formLocation.trim(),
        description: formDescription.trim()
      });
      setEditingMedicine(null);
    } else {
      addMedicine({
        name: formName.trim(),
        category: formCategory.trim(),
        unit: formUnit.trim(),
        usageType: formUsageType,
        stock: formStock,
        minStock: formMinStock,
        expiryDate: formExpiryDate.trim(),
        location: formLocation.trim(),
        description: formDescription.trim()
      });
      setShowAddModal(false);
    }
  };

  // Quick Restock Submit
  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRestockItem || restockQty <= 0) return;

    restockMedicine(quickRestockItem.id, restockQty, restockNote);
    setQuickRestockItem(null);
    if (onClearRestockTarget) onClearRestockTarget();
  };

  // Handle Excel File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError(null);
    setIsProcessingFile(true);

    const result = await parseMedicineExcelFile(file);
    setIsProcessingFile(false);

    if (!result.success) {
      setImportError(result.error || 'Format file Excel tidak sesuai.');
      setParsedImportList([]);
    } else {
      setParsedImportList(result.medicines);
    }
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (parsedImportList.length === 0) return;
    importMedicinesFromExcel(parsedImportList, importMode);
    setShowImportModal(false);
    setImportFile(null);
    setParsedImportList([]);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Manajemen Stok Obat & Farmasi UKS
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {medicines.length} Jenis Obat
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pengelolaan persediaan obat, peringatan stok kritis, dan import massal via template Excel.
          </p>
        </div>

        {/* Action Buttons: Add, Download Template, Import Excel */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            id="btn-download-excel-template"
            onClick={downloadMedicineExcelTemplate}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="Download file template Excel untuk pengisian data obat secara massal"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Unduh Template Excel
          </button>

          <button
            type="button"
            id="btn-import-excel"
            onClick={() => {
              setImportFile(null);
              setParsedImportList([]);
              setImportError(null);
              setShowImportModal(true);
            }}
            className="inline-flex items-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="Upload file Excel yang sudah diisi untuk menambahkan/memperbarui stok"
          >
            <Upload className="w-4 h-4 text-teal-700" />
            Impor dari Excel
          </button>

          <button
            type="button"
            id="btn-add-medicine"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Obat Baru
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Jenis Obat
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {medicines.length} <span className="text-xs font-normal text-slate-500">item</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Stok Aman
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {medicines.filter(m => m.stock > m.minStock).length} <span className="text-xs font-normal text-slate-500">item</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border shadow-2xs ${
          lowStockMedicines.length > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
            Stok Menipis
          </span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">
            {lowStockMedicines.length} <span className="text-xs font-normal text-slate-500">item</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border shadow-2xs ${
          outOfStockMedicines.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
        }`}>
          <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider block">
            Stok Habis (0)
          </span>
          <div className="text-2xl font-extrabold text-red-700 mt-1">
            {outOfStockMedicines.length} <span className="text-xs font-normal text-slate-500">item</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama obat, kategori, rak..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({medicines.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('low')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              statusFilter === 'low'
                ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            Menipis / Habis ({lowStockMedicines.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('safe')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              statusFilter === 'safe'
                ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Stok Aman
          </button>
        </div>

        {/* Category Select */}
        <div className="w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* MEDICINES DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Nama Obat</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Sisa Stok</th>
                <th className="py-3 px-4 text-center">Batas Aman</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Expired Date</th>
                <th className="py-3 px-4">Lokasi Simpan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-sm">Tidak ada daftar obat yang sesuai filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedMedicines.map(med => {
                  const isOutOfStock = med.stock === 0;
                  const isLow = med.stock <= med.minStock;
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isExpired = med.expiryDate && med.expiryDate < todayStr;

                  const isMultiDose = med.usageType === 'multi_dose' || ((med.unit === 'Botol' || med.unit === 'Tube') && med.usageType !== 'single_dose');

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/70 transition">
                      {/* Nama Obat */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-slate-900 text-sm">{med.name}</div>
                          {isMultiDose ? (
                            <span className="bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 flex items-center gap-1" title="Pemakaian bersama di UKS (botol tidak berkurang per pasien)">
                              <Droplets className="w-3 h-3 text-sky-500" />
                              Multi-Pakai
                            </span>
                          ) : (
                            <span className="bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0" title="Stok berkurang otomatis tiap pasien">
                              Per Dosis
                            </span>
                          )}
                        </div>
                        {med.description && (
                          <div className="text-slate-400 text-[11px] max-w-xs truncate">{med.description}</div>
                        )}
                      </td>

                      {/* Kategori */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {med.category}
                        </span>
                      </td>

                      {/* Sisa Stok */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-extrabold text-sm text-slate-900">
                          <span className={isOutOfStock ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-700'}>
                            {med.stock}
                          </span>
                          <span className="text-slate-400 text-xs font-normal">{med.unit}</span>
                        </div>
                        {isMultiDose && (
                          <div className="text-[10px] text-sky-600 font-medium">Botol/Tube UKS</div>
                        )}
                      </td>

                      {/* Batas Aman */}
                      <td className="py-3 px-4 text-center whitespace-nowrap text-slate-500 font-medium">
                        Min. {med.minStock} {med.unit}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            HABIS
                          </span>
                        ) : isLow ? (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                            MENIPIS
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full text-[11px]">
                            Aman
                          </span>
                        )}
                      </td>

                      {/* Expired Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {med.expiryDate ? (
                          <span className={`text-[11px] font-medium ${isExpired ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                            {med.expiryDate} {isExpired && '(Kedaluwarsa)'}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* Lokasi */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                        {med.location || 'Lemari UKS'}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {isMultiDose && (
                            <button
                              type="button"
                              onClick={() => setFinishingBottleItem(med)}
                              disabled={med.stock <= 0}
                              className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 disabled:opacity-40 disabled:hover:bg-sky-50 rounded-lg text-[11px] font-bold border border-sky-200 transition flex items-center gap-1"
                              title="Tandai 1 botol/tube habis terpakai di UKS"
                            >
                              <Droplets className="w-3 h-3 text-sky-600" />
                              -1 Botol Habis
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setQuickRestockItem(med)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold border border-emerald-200 transition"
                            title="Tambah stok cepat"
                          >
                            + Restock
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(med)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit data obat"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingMedicine(med)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Hapus obat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Menampilkan <strong className="text-slate-900">{filteredMedicines.length === 0 ? 0 : (validCurrentPage - 1) * itemsPerPage + 1}</strong> - <strong className="text-slate-900">{Math.min(validCurrentPage * itemsPerPage, filteredMedicines.length)}</strong> dari <strong className="text-slate-900">{filteredMedicines.length}</strong> obat
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5">
              <span>Baris:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Sebelumnya
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                if (
                  totalPages > 7 &&
                  page !== 1 &&
                  page !== totalPages &&
                  Math.abs(page - validCurrentPage) > 1
                ) {
                  if (page === 2 || page === totalPages - 1) {
                    return <span key={page} className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                      page === validCurrentPage
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: TAMBAH / EDIT OBAT */}
      {(showAddModal || editingMedicine) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingMedicine ? 'Edit Data Obat' : 'Tambah Obat Baru ke UKS'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMedicine(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Obat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Paracetamol 500mg"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Kategori Obat
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Analgesik, Antasida, dll"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Satuan
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormUnit(val);
                      if (val === 'Botol' || val === 'Tube') {
                        setFormUsageType('multi_dose');
                      } else {
                        setFormUsageType('single_dose');
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-sm bg-white"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Kapsul">Kapsul</option>
                    <option value="Botol">Botol</option>
                    <option value="Sachet">Sachet</option>
                    <option value="Strip">Strip</option>
                    <option value="Tube">Tube</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Roll">Roll</option>
                  </select>
                </div>
              </div>

              {/* Tipe Penggunaan Obat (Opsi A & C) */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Tipe Pemakaian Obat di UKS <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label 
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition ${
                      formUsageType === 'single_dose' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500/30' 
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="formUsageType"
                      value="single_dose"
                      checked={formUsageType === 'single_dose'}
                      onChange={() => setFormUsageType('single_dose')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1">
                        <span>💊 Habis Sekali Pakai</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                        Tablet, Kapsul, Sachet, Plester. Stok berkurang otomatis tiap pasien.
                      </div>
                    </div>
                  </label>

                  <label 
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition ${
                      formUsageType === 'multi_dose' 
                        ? 'bg-sky-50 border-sky-500 text-sky-950 ring-1 ring-sky-500/30' 
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="formUsageType"
                      value="multi_dose"
                      checked={formUsageType === 'multi_dose'}
                      onChange={() => setFormUsageType('multi_dose')}
                      className="mt-0.5 text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1 text-sky-950">
                        <span>🧴 Pemakaian Ruangan</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                        Minyak, Betadine, Rivanol, Salep. Stok botol dikurangi manual saat habis.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Jumlah Stok Sekarang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Batas Peringatan (Min) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tanggal Kedaluwarsa (Exp)
                  </label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Lokasi / Rak Simpan
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Lemari A - Rak 1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Keterangan / Indikasi Singkat
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Kegunaan obat (misal: Pereda pusing dan demam)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMedicine(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  {editingMedicine ? 'Simpan Perubahan' : 'Tambah Obat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESTOCK CEPAT */}
      {quickRestockItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Restock Tambah Stok Obat
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuickRestockItem(null);
                  if (onClearRestockTarget) onClearRestockTarget();
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Nama Obat:</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{quickRestockItem.name}</div>
                <div className="text-slate-500 text-[11px] mt-1 flex justify-between">
                  <span>Stok Saat Ini:</span>
                  <strong className="text-slate-800">{quickRestockItem.stock} {quickRestockItem.unit}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Jumlah Penambahan ({quickRestockItem.unit})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockQty}
                    onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-base font-bold text-slate-800"
                  />
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[5, 10, 20, 50].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRestockQty(val)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Catatan Pengadaan / Sumber Stok
                </label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder="Misal: Drop Puskesmas Batu, Pengadaan APBD Sekolah"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="pt-2 text-right">
                <span className="text-[11px] text-slate-500 block mb-3">
                  Setelah restock: Total akan menjadi <strong className="text-emerald-700">{quickRestockItem.stock + restockQty} {quickRestockItem.unit}</strong>
                </span>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickRestockItem(null);
                      if (onClearRestockTarget) onClearRestockTarget();
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                  >
                    Simpan Tambah Stok
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPOR OBAT DARI EXCEL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Impor Stok Obat dari File Excel
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Gunakan template Excel resmi agar format kolom terbaca sempurna.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Template Download Prompt */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-950">Belum punya template Excel?</div>
                  <div className="text-[11px] text-emerald-800">Unduh format template resmi dengan contoh data.</div>
                </div>
                <button
                  type="button"
                  onClick={downloadMedicineExcelTemplate}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shrink-0 inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Template
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 p-6 rounded-2xl text-center cursor-pointer transition"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="font-bold text-slate-800 text-sm">
                  {importFile ? importFile.name : 'Klik untuk memilih file Excel (.xlsx / .xls)'}
                </p>
                <p className="text-slate-400 text-[11px] mt-1">
                  {importFile
                    ? `Ukuran file: ${(importFile.size / 1024).toFixed(1)} KB`
                    : 'Format standar: Nama Obat, Kategori, Satuan, Jumlah Stok, Batas Minimum'}
                </p>
              </div>

              {/* Loading Indicator */}
              {isProcessingFile && (
                <div className="py-2 text-center text-slate-500 font-medium animate-pulse">
                  Sedang membaca dan memvalidasi file Excel...
                </div>
              )}

              {/* Error Alert */}
              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Preview Parsed Items */}
              {parsedImportList.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Pratinjau Data ({parsedImportList.length} obat ditemukan):
                    </span>
                    <span className="text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded text-[11px]">
                      Valid & Siap Diimpor
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                    {parsedImportList.map((item, idx) => (
                      <div key={idx} className="p-2.5 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {item.category} • Min: {item.minStock} • Exp: {item.expiryDate || '-'}
                          </div>
                        </div>
                        <div className="text-right font-bold text-emerald-700">
                          {item.stock} {item.unit}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Import Mode Options */}
                  <div className="pt-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Metode Penyimpanan Impor:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 ${
                        importMode === 'merge' ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold' : 'border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="importMode"
                          value="merge"
                          checked={importMode === 'merge'}
                          onChange={() => setImportMode('merge')}
                          className="text-emerald-600"
                        />
                        <div>
                          <div>Gabungkan (Merge)</div>
                          <div className="text-[10px] text-slate-500 font-normal">Update stok yang sama & tambah yang baru</div>
                        </div>
                      </label>

                      <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 ${
                        importMode === 'replace' ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold' : 'border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="text-amber-600"
                        />
                        <div>
                          <div>Ganti Semua</div>
                          <div className="text-[10px] text-slate-500 font-normal">Timpa seluruh inventaris saat ini</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={parsedImportList.length === 0}
                  onClick={handleConfirmImport}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Impor Sekarang ({parsedImportList.length} Obat)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Delete Medicine Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingMedicine}
        title={`Hapus Obat "${deletingMedicine?.name || ''}"?`}
        message="Obat ini akan dihapus permanen dari master inventaris UKS SMAN 1 Batu."
        details={deletingMedicine ? [
          { label: 'Nama Obat', value: deletingMedicine.name },
          { label: 'Kategori', value: deletingMedicine.category },
          { label: 'Stok Saat Ini', value: `${deletingMedicine.stock} ${deletingMedicine.unit}` },
          { label: 'Batas Minimum', value: `${deletingMedicine.minStock} ${deletingMedicine.unit}` },
          { label: 'Lokasi', value: deletingMedicine.location || 'Lemari Obat' }
        ] : []}
        confirmLabel="Hapus Obat"
        cancelLabel="Batal"
        type="danger"
        onConfirm={() => {
          if (deletingMedicine) {
            deleteMedicine(deletingMedicine.id);
            setDeletingMedicine(null);
          }
        }}
        onCancel={() => setDeletingMedicine(null)}
      />

      {/* Konfirmasi 1 Botol Habis (Multi-Dose Medicine) */}
      <ConfirmModal
        isOpen={!!finishingBottleItem}
        title={`Tandai 1 ${finishingBottleItem?.unit || 'Botol'} Habis?`}
        message={`Apakah 1 ${finishingBottleItem?.unit || 'botol'} "${finishingBottleItem?.name || ''}" sudah habis terpakai di ruang UKS dan ingin mengurangi stoknya sebanyak 1 ${finishingBottleItem?.unit || 'botol'}?`}
        details={finishingBottleItem ? [
          { label: 'Nama Obat', value: finishingBottleItem.name },
          { label: 'Stok Saat Ini', value: `${finishingBottleItem.stock} ${finishingBottleItem.unit}` },
          { label: 'Stok Setelah Dikurangi', value: `${Math.max(0, finishingBottleItem.stock - 1)} ${finishingBottleItem.unit}` },
          { label: 'Tipe Obat', value: 'Pemakaian Ruangan (Multi-Pakai)' }
        ] : []}
        confirmLabel={`Ya, Kurangi 1 ${finishingBottleItem?.unit || 'Botol'}`}
        cancelLabel="Batal"
        type="warning"
        onConfirm={() => {
          if (finishingBottleItem) {
            consumeMultiDoseBottle(finishingBottleItem.id);
            setFinishingBottleItem(null);
          }
        }}
        onCancel={() => setFinishingBottleItem(null)}
      />
    </div>
  );
};
