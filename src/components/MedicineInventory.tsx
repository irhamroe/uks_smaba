import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Info,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Droplets,
  PackageOpen,
  CalendarClock,
  Flame
} from 'lucide-react';
import { useUks } from '../context/UksContext';
import { Medicine, MedicineUsageType, MedicineBatch } from '../types';
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
    disposeExpiredBatch,
    consumeMultiDoseBottle,
    importMedicinesFromExcel,
    lowStockMedicines,
    outOfStockMedicines,
    expiringSoonMedicines,
    expiredMedicines
  } = useUks();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'safe' | 'expiring_soon' | 'expired'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(null);
  const [finishingBottleItem, setFinishingBottleItem] = useState<Medicine | null>(null);
  const [viewingBatchesMedicine, setViewingBatchesMedicine] = useState<Medicine | null>(null);
  const [disposingBatch, setDisposingBatch] = useState<{ medicine: Medicine; batch: MedicineBatch } | null>(null);

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
  const [formExpiryDate, setFormExpiryDate] = useState('2027-12-31');
  const [formBatchNumber, setFormBatchNumber] = useState('KLOTER-AWAL');
  const [formDescription, setFormDescription] = useState('');

  // Quick Restock State
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockExpiryDate, setRestockExpiryDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().split('T')[0];
  });
  const [restockBatchNumber, setRestockBatchNumber] = useState<string>('');
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
      if (target) {
        setQuickRestockItem(target);
        setRestockBatchNumber(`LOT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
      }
    }
  }, [restockTargetId, medicines]);

  // Keep viewingBatchesMedicine in sync with medicines updates
  useEffect(() => {
    if (viewingBatchesMedicine) {
      const updated = medicines.find(m => m.id === viewingBatchesMedicine.id);
      if (updated) {
        setViewingBatchesMedicine(updated);
      }
    }
  }, [medicines]);

  // Categories available
  const categories = useMemo(() => {
    const set = new Set<string>();
    medicines.forEach(m => set.add(m.category));
    return Array.from(set).sort();
  }, [medicines]);

  // Filtered Medicines
  const filteredMedicines = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + 90);
    const thresholdStr = thresholdDate.toISOString().split('T')[0];

    return medicines.filter(m => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesCat = m.category.toLowerCase().includes(q);
        if (!matchesName && !matchesCat) return false;
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
      } else if (statusFilter === 'expiring_soon') {
        if (m.stock <= 0) return false;
        const batches = m.batches && m.batches.length > 0 ? m.batches : [];
        if (batches.length > 0) {
          return batches.some(b => b.quantity > 0 && b.expiryDate <= thresholdStr && b.expiryDate >= todayStr);
        }
        return m.expiryDate ? (m.expiryDate <= thresholdStr && m.expiryDate >= todayStr) : false;
      } else if (statusFilter === 'expired') {
        if (m.stock <= 0) return false;
        const batches = m.batches && m.batches.length > 0 ? m.batches : [];
        if (batches.length > 0) {
          return batches.some(b => b.quantity > 0 && b.expiryDate < todayStr);
        }
        return m.expiryDate ? (m.expiryDate < todayStr) : false;
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
    setFormBatchNumber('KLOTER-AWAL');
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
    
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    setFormExpiryDate(d.toISOString().split('T')[0]);
    setFormBatchNumber(`LOT-${new Date().getFullYear()}-01`);
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
        minStock: formMinStock,
        description: formDescription.trim()
      });
      setEditingMedicine(null);
    } else {
      const initialBatch: MedicineBatch = {
        id: `batch-${Date.now()}-init`,
        batchNumber: formBatchNumber.trim() || 'KLOTER-AWAL',
        quantity: formStock,
        expiryDate: formExpiryDate.trim() || '2027-12-31',
        receivedDate: new Date().toISOString().split('T')[0],
        note: 'Stok awal penambahan obat'
      };

      addMedicine({
        name: formName.trim(),
        category: formCategory.trim(),
        unit: formUnit.trim(),
        usageType: formUsageType,
        stock: formStock,
        minStock: formMinStock,
        expiryDate: formExpiryDate.trim(),
        batches: formStock > 0 ? [initialBatch] : [],
        description: formDescription.trim()
      });
      setShowAddModal(false);
    }
  };

  // Open Restock Modal
  const handleOpenRestockModal = (med: Medicine) => {
    setQuickRestockItem(med);
    setRestockQty(10);
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    setRestockExpiryDate(d.toISOString().split('T')[0]);
    setRestockBatchNumber(`LOT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
    setRestockNote('Pengadaan rutin UKS SMAN 1 Batu');
  };

  // Quick Restock Submit (FEFO Multi-Batch)
  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRestockItem || restockQty <= 0) return;

    restockMedicine(
      quickRestockItem.id, 
      restockQty, 
      restockExpiryDate, 
      restockBatchNumber, 
      restockNote
    );
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

  // Helper for batch expiry status
  const getBatchExpiryStatus = (expDateStr?: string) => {
    if (!expDateStr) return { status: 'safe', label: 'Aman', color: 'text-slate-600', badge: 'bg-slate-100 text-slate-700', days: 999 };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expDateStr);
    exp.setHours(0, 0, 0, 0);

    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', label: `Kedaluwarsa (${Math.abs(diffDays)} hari lalu)`, color: 'text-red-700', badge: 'bg-red-100 text-red-800 border-red-200', days: diffDays };
    } else if (diffDays <= 90) {
      return { status: 'warning', label: `Mendekati Expired (${diffDays} hari lagi)`, color: 'text-amber-700', badge: 'bg-amber-100 text-amber-800 border-amber-200', days: diffDays };
    } else {
      return { status: 'safe', label: `Aman (${diffDays} hari lagi)`, color: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', days: diffDays };
    }
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
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {medicines.length} Jenis Obat
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pengelolaan stok obat multi-batch dengan otomatisasi <strong>FEFO (First Expired, First Out)</strong> dan peringatan kedaluwarsa dini.
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Jenis Obat
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {medicines.length} <span className="text-xs font-normal text-slate-500">item</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border shadow-2xs ${
          lowStockMedicines.length > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
            Stok Kritis / Menipis
          </span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">
            {lowStockMedicines.length} <span className="text-xs font-normal text-slate-500">item</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border shadow-2xs ${
          expiringSoonMedicines.length > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            Mendekati Expired (&le; 3 Bln)
          </span>
          <div className="text-2xl font-extrabold text-amber-800 mt-1">
            {expiringSoonMedicines.length} <span className="text-xs font-normal text-slate-500">item</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border shadow-2xs ${
          expiredMedicines.length > 0 ? 'bg-red-50/70 border-red-200' : 'bg-white border-slate-200'
        }`}>
          <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wider block">
            Sudah Kedaluwarsa
          </span>
          <div className="text-2xl font-extrabold text-red-700 mt-1">
            {expiredMedicines.length} <span className="text-xs font-normal text-slate-500">item</span>
          </div>
        </div>
      </div>

      {/* SEARCH, FILTER & STATUS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="input-search-medicine"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari obat berdasarkan nama, kategori, atau nomor rak..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              id="select-filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500"
            >
              <option value="all">Semua Kategori ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] mr-1">Filter Status:</span>
          
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Semua ({medicines.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('low')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              statusFilter === 'low'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
            }`}
          >
            Stok Menipis ({lowStockMedicines.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('safe')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              statusFilter === 'safe'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
            }`}
          >
            Stok Aman ({medicines.filter(m => m.stock > m.minStock).length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('expiring_soon')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              statusFilter === 'expiring_soon'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900'
            }`}
          >
            Mendekati Expired ({expiringSoonMedicines.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              statusFilter === 'expired'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 hover:bg-red-100 text-red-800'
            }`}
          >
            Kedaluwarsa ({expiredMedicines.length})
          </button>
        </div>
      </div>

      {/* MEDICINE TABLE VIEW */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama Obat</th>
                <th className="py-3 px-4">Kategori & Tipe</th>
                <th className="py-3 px-4 text-center">Total Stok</th>
                <th className="py-3 px-4 text-center">Batas Minimum</th>
                <th className="py-3 px-4">Expired Terdekat (FEFO)</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <PackageOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Tidak ada data obat yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedMedicines.map((med) => {
                  const isLow = med.stock <= med.minStock && med.stock > 0;
                  const isOutOfStock = med.stock === 0;
                  const expInfo = getBatchExpiryStatus(med.expiryDate);
                  const isMultiDose = med.usageType === 'multi_dose' || (med.unit?.toLowerCase().includes('botol') && med.usageType !== 'single_dose');
                  const batchCount = med.batches?.length || (med.stock > 0 ? 1 : 0);

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Nama Obat */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{med.name}</div>
                        {med.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {med.description}
                          </div>
                        )}
                      </td>

                      {/* Kategori & Tipe */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-700 block">{med.category}</span>
                        <span className="text-[10px] text-slate-400">
                          {isMultiDose ? 'Pemakaian Bersama (Multi-Dose)' : 'Dosis Tunggal (Per Tablet)'}
                        </span>
                      </td>

                      {/* Total Stok & Kloter Badge */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className={`text-base font-black ${
                          isOutOfStock ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-800'
                        }`}>
                          {med.stock} <span className="text-xs font-normal text-slate-500">{med.unit}</span>
                        </div>

                        {/* Batch Info Button */}
                        <button
                          type="button"
                          onClick={() => setViewingBatchesMedicine(med)}
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer"
                          title="Klik untuk melihat rincian kloter dan masa kedaluwarsa per batch"
                        >
                          <Layers className="w-3 h-3 text-emerald-600" />
                          <span>{batchCount} Kloter (FEFO)</span>
                        </button>
                      </td>

                      {/* Batas Minimum */}
                      <td className="py-3 px-4 text-center whitespace-nowrap text-slate-500 font-medium">
                        Min. {med.minStock} {med.unit}
                      </td>

                      {/* Expired Terdekat (FEFO) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {med.expiryDate ? (
                          <div>
                            <div className={`font-bold text-xs ${expInfo.color}`}>
                              {med.expiryDate}
                            </div>
                            <span className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.2 rounded-full border ${expInfo.badge}`}>
                              {expInfo.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
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
                            onClick={() => handleOpenRestockModal(med)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold border border-emerald-200 transition cursor-pointer"
                            title="Tambah stok kloter baru"
                          >
                            + Restock
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(med)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
              ))}
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

      {/* MODAL 1: TAMBAH / EDIT MASTER OBAT */}
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
                    <option value="Tablet Kunyah">Tablet Kunyah</option>
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

              {/* Tipe Penggunaan Obat */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Tipe Penggunaan Obat:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 ${
                    formUsageType === 'single_dose' ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold' : 'border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="formUsageType"
                      value="single_dose"
                      checked={formUsageType === 'single_dose'}
                      onChange={() => setFormUsageType('single_dose')}
                      className="text-emerald-600"
                    />
                    <div>
                      <div>Dosis Tunggal</div>
                      <div className="text-[10px] text-slate-500 font-normal">Tablet/Kapsul per pasien</div>
                    </div>
                  </label>

                  <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 ${
                    formUsageType === 'multi_dose' ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold' : 'border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="formUsageType"
                      value="multi_dose"
                      checked={formUsageType === 'multi_dose'}
                      onChange={() => setFormUsageType('multi_dose')}
                      className="text-emerald-600"
                    />
                    <div>
                      <div>Multi-Pakai</div>
                      <div className="text-[10px] text-slate-500 font-normal">Minyak/Salep/Betadine</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Stock Fields (Only for new medicine creation) */}
              {!editingMedicine && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Inisialisasi Kloter Stok Awal</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Jumlah Stok Awal ({formUnit})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formStock}
                        onChange={(e) => setFormStock(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-sm font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Batas Minimum (Alert)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formMinStock}
                        onChange={(e) => setFormMinStock(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-sm font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Nomor Batch / Kloter
                      </label>
                      <input
                        type="text"
                        value={formBatchNumber}
                        onChange={(e) => setFormBatchNumber(e.target.value)}
                        placeholder="LOT-2026-01"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Tgl. Kedaluwarsa
                      </label>
                      <input
                        type="date"
                        value={formExpiryDate}
                        onChange={(e) => setFormExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editingMedicine && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Batas Minimum Stok (Alert Pengingat)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-sm font-bold text-slate-800"
                  />
                </div>
              )}

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
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingMedicine ? 'Simpan Perubahan' : 'Tambah Obat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESTOCK MULTI-BATCH OBAT (FEFO) */}
      {quickRestockItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Restock Kloter Baru (FEFO)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tambah stok dengan nomor batch & expired date spesifik
                  </p>
                </div>
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
                  <span>Total Stok Saat Ini:</span>
                  <strong className="text-slate-800">{quickRestockItem.stock} {quickRestockItem.unit}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Jumlah Penambahan ({quickRestockItem.unit}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-base font-bold text-slate-800"
                />
                <div className="flex gap-1.5 mt-2">
                  {[5, 10, 20, 50, 100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRestockQty(val)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tgl. Expired Kloter Ini <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={restockExpiryDate}
                    onChange={(e) => setRestockExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    No. Batch / Kloter
                  </label>
                  <input
                    type="text"
                    value={restockBatchNumber}
                    onChange={(e) => setRestockBatchNumber(e.target.value)}
                    placeholder="LOT-2026-02"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 text-xs"
                  />
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
                  placeholder="Misal: Drop Puskesmas Batu, Pembelian Dana UKS"
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
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                  >
                    Simpan Tambah Kloter
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RINCIAN KLOTER / BATCH EXPIRED (FEFO MANAGEMENT) */}
      {viewingBatchesMedicine && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Rincian Kloter & Kedaluwarsa (FEFO)
                  </h3>
                  <div className="text-xs text-slate-500">
                    {viewingBatchesMedicine.name} • Total: <strong className="text-emerald-800">{viewingBatchesMedicine.stock} {viewingBatchesMedicine.unit}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingBatchesMedicine(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Table of Batches */}
            <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-emerald-950 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Sistem menerapkan <strong>FEFO (First Expired, First Out)</strong>: Saat pasien diberi obat, stok otomatis dipotong dari kloter dengan masa kedaluwarsa terdekat (diurutkan dari paling atas).
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">No. Batch / Kloter</th>
                      <th className="py-2.5 px-3">Tgl. Expired</th>
                      <th className="py-2.5 px-3 text-center">Sisa Stok</th>
                      <th className="py-2.5 px-3">Status Kloter</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {(!viewingBatchesMedicine.batches || viewingBatchesMedicine.batches.length === 0) ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          Tidak ada data kloter tercatat untuk obat ini.
                        </td>
                      </tr>
                    ) : (
                      viewingBatchesMedicine.batches.map((b, idx) => {
                        const batchExp = getBatchExpiryStatus(b.expiryDate);
                        const isExpired = batchExp.status === 'expired';

                        return (
                          <tr key={b.id || idx} className={`hover:bg-slate-50 ${isExpired ? 'bg-red-50/30' : ''}`}>
                            <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900">{b.batchNumber || `LOT-${idx + 1}`}</span>
                              {b.note && <div className="text-[10px] text-slate-400">{b.note}</div>}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className={`font-bold ${batchExp.color}`}>{b.expiryDate || '-'}</div>
                              <div className="text-[10px] text-slate-400">
                                Diterima: {b.receivedDate || '-'}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-black text-slate-800">
                              {b.quantity} {viewingBatchesMedicine.unit}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${batchExp.badge}`}>
                                {batchExp.label}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setDisposingBatch({ medicine: viewingBatchesMedicine, batch: b })}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                title="Musnahkan atau hapus kloter ini dari inventaris"
                              >
                                Buang / Hapus
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  const target = viewingBatchesMedicine;
                  setViewingBatchesMedicine(null);
                  handleOpenRestockModal(target);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Kloter Baru</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingBatchesMedicine(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: IMPOR OBAT DARI EXCEL */}
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
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
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
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
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
                    : 'Format standar: Nama Obat, Kategori, Tipe Pemakaian, Satuan, Jumlah Stok, Batas Minimum, No. Batch, Tgl. Kedaluwarsa'}
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
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
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
          { label: 'Batas Minimum', value: `${deletingMedicine.minStock} ${deletingMedicine.unit}` }
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

      {/* Konfirmasi Pemusnahan / Hapus Kloter Expired */}
      <ConfirmModal
        isOpen={!!disposingBatch}
        title={`Musnahkan / Hapus Kloter "${disposingBatch?.batch.batchNumber || 'Batch'}"?`}
        message={`Apakah Anda yakin ingin memusnahkan dan menghapus stok dari kloter ini (${disposingBatch?.batch.quantity} ${disposingBatch?.medicine.unit}) dari stok aktif UKS?`}
        details={disposingBatch ? [
          { label: 'Nama Obat', value: disposingBatch.medicine.name },
          { label: 'No. Batch', value: disposingBatch.batch.batchNumber || '-' },
          { label: 'Tgl. Kedaluwarsa', value: disposingBatch.batch.expiryDate },
          { label: 'Jumlah yang Dihapus', value: `${disposingBatch.batch.quantity} ${disposingBatch.medicine.unit}` }
        ] : []}
        confirmLabel="Musnahkan / Hapus Stok"
        cancelLabel="Batal"
        type="danger"
        onConfirm={() => {
          if (disposingBatch) {
            disposeExpiredBatch(disposingBatch.medicine.id, disposingBatch.batch.id);
            setDisposingBatch(null);
          }
        }}
        onCancel={() => setDisposingBatch(null)}
      />
    </div>
  );
};
