import React, { useState, useMemo } from 'react';
import { useUks } from '../context/UksContext';
import { UksBed } from '../types';
import {
  Bed,
  Plus,
  Search,
  CheckCircle2,
  Wrench,
  User,
  Clock,
  Activity,
  Edit2,
  Trash2,
  X,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';

export const BedManagement: React.FC = () => {
  const {
    beds,
    records,
    addBed,
    updateBed,
    deleteBed,
    setBedStatus,
    releaseBed
  } = useUks();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UksBed['status']>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | UksBed['genderCategory']>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBed, setEditingBed] = useState<UksBed | null>(null);
  const [deletingBed, setDeletingBed] = useState<UksBed | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    location: string;
    status: UksBed['status'];
    genderCategory: UksBed['genderCategory'];
    description: string;
  }>({
    name: '',
    location: 'Ruang Utama UKS',
    status: 'Tersedia',
    genderCategory: 'Semua',
    description: ''
  });

  // Calculate dynamic active patients resting on each bed
  const restingPatientsMap = useMemo(() => {
    const map: Record<string, typeof records[0]> = {};
    records
      .filter(r => (r.finalStatus === 'Istirahat di UKS' || r.finalStatus === 'Sedang Istirahat di UKS') && r.bedNumber)
      .forEach(r => {
        if (r.bedNumber) {
          map[r.bedNumber] = r;
        }
      });
    return map;
  }, [records]);

  // Statistics
  const stats = useMemo(() => {
    const total = beds.length;
    const occupied = beds.filter(b => b.status === 'Terisi' || restingPatientsMap[b.name]).length;
    const maintenance = beds.filter(b => b.status === 'Perbaikan / Pembersihan').length;
    const available = total - occupied - maintenance;
    return {
      total,
      available: Math.max(0, available),
      occupied,
      maintenance
    };
  }, [beds, restingPatientsMap]);

  // Filtered beds
  const filteredBeds = useMemo(() => {
    return beds.filter(b => {
      const isOccupiedByRecord = !!restingPatientsMap[b.name];
      const effectiveStatus: UksBed['status'] = isOccupiedByRecord ? 'Terisi' : b.status;

      const matchesSearch =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || effectiveStatus === statusFilter;

      const matchesGender =
        genderFilter === 'all' || b.genderCategory === genderFilter;

      return matchesSearch && matchesStatus && matchesGender;
    });
  }, [beds, searchTerm, statusFilter, genderFilter, restingPatientsMap]);

  const handleOpenAddModal = () => {
    setFormData({
      name: `Ranjang ${beds.length + 1}`,
      location: 'Ruang Utama UKS',
      status: 'Tersedia',
      genderCategory: 'Semua',
      description: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (bed: UksBed) => {
    setEditingBed(bed);
    setFormData({
      name: bed.name,
      location: bed.location,
      status: bed.status,
      genderCategory: bed.genderCategory || 'Semua',
      description: bed.description || ''
    });
  };

  const handleSaveBed = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingBed) {
      const res = updateBed(editingBed.id, {
        name: formData.name,
        location: formData.location,
        status: formData.status,
        genderCategory: formData.genderCategory,
        description: formData.description
      });
      if (res.success) {
        setEditingBed(null);
      }
    } else {
      const res = addBed({
        name: formData.name,
        location: formData.location,
        status: formData.status,
        genderCategory: formData.genderCategory,
        description: formData.description
      });
      if (res.success) {
        setIsAddModalOpen(false);
      }
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingBed) return;
    const res = deleteBed(deletingBed.id);
    if (res.success) {
      setDeletingBed(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-6 md:p-8 text-white shadow-xl shadow-emerald-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold border border-white/20">
              <Bed className="w-3.5 h-3.5" />
              <span>Fasilitas Rawat & Istirahat UKS</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Manajemen Ranjang UKS
            </h1>
            <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
              Pantau ketersediaan ranjang, kelola alokasi pasien yang sedang istirahat, serta atur kapasitas fasilitas UKS secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-800 font-bold shadow-lg hover:bg-emerald-50 hover:shadow-xl active:scale-95 transition-all duration-200"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Tambah Ranjang Baru</span>
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-10 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Total Beds */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Ranjang</span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Bed className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800">{stats.total}</span>
            <span className="text-xs text-slate-500 font-medium">Unit</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Kapasitas total fasilitas UKS</p>
        </div>

        {/* Available Beds */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-b from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Ranjang Tersedia</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{stats.available}</span>
            <span className="text-xs text-emerald-600 font-medium">Unit Siap</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.available / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Occupied Beds */}
        <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-b from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Sedang Digunakan</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{stats.occupied}</span>
            <span className="text-xs text-amber-600 font-medium">Pasien Istirahat</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Maintenance Beds */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Perbaikan / Steril</span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-700">{stats.maintenance}</span>
            <span className="text-xs text-slate-500 font-medium">Unit</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Pembersihan & perapian</p>
        </div>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari ranjang, lokasi, fasilitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/60">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({beds.length})
            </button>
            <button
              onClick={() => setStatusFilter('Tersedia')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'Tersedia'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tersedia ({stats.available})
            </button>
            <button
              onClick={() => setStatusFilter('Terisi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'Terisi'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terisi ({stats.occupied})
            </button>
            <button
              onClick={() => setStatusFilter('Perbaikan / Pembersihan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'Perbaikan / Pembersihan'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Perbaikan ({stats.maintenance})
            </button>
          </div>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">Semua Peruntukan</option>
            <option value="Semua">Campuran / Umum</option>
            <option value="Siswa Laki-laki">Khusus Siswa (L)</option>
            <option value="Siswi Perempuan">Khusus Siswi (P)</option>
          </select>
        </div>
      </div>

      {/* Bed Cards Grid */}
      {filteredBeds.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Bed className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak ada ranjang yang sesuai</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau sesuaikan filter status ranjang.
          </p>
          {(searchTerm || statusFilter !== 'all' || genderFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setGenderFilter('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBeds.map((bed) => {
            const currentPatient = restingPatientsMap[bed.name];
            const isOccupied = !!currentPatient || bed.status === 'Terisi';
            const isMaintenance = bed.status === 'Perbaikan / Pembersihan';

            return (
              <div
                key={bed.id}
                className={`rounded-2xl bg-white border transition-all duration-200 hover:shadow-lg flex flex-col justify-between overflow-hidden ${
                  isOccupied
                    ? 'border-amber-200 ring-1 ring-amber-100'
                    : isMaintenance
                    ? 'border-slate-300 opacity-90'
                    : 'border-emerald-200/80 hover:border-emerald-300'
                }`}
              >
                {/* Top Status Header */}
                <div
                  className={`px-5 py-3.5 border-b flex items-center justify-between ${
                    isOccupied
                      ? 'bg-amber-50/80 border-amber-100 text-amber-900'
                      : isMaintenance
                      ? 'bg-slate-100 border-slate-200 text-slate-700'
                      : 'bg-emerald-50/80 border-emerald-100 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOccupied
                          ? 'bg-amber-500 animate-pulse'
                          : isMaintenance
                          ? 'bg-slate-400'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isOccupied ? 'Sedang Terisi Pasien' : isMaintenance ? 'Perbaikan / Steril' : 'Tersedia'}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      bed.genderCategory === 'Siswi Perempuan'
                        ? 'bg-pink-100 text-pink-700'
                        : bed.genderCategory === 'Siswa Laki-laki'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {bed.genderCategory || 'Semua'}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 space-y-4">
                  {/* Bed Title & Room */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                        <Bed className="w-5 h-5 text-emerald-700" />
                        <span>{bed.name}</span>
                      </h3>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                        {bed.location}
                      </span>
                    </div>

                    {bed.description && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                        {bed.description}
                      </p>
                    )}
                  </div>

                  {/* Occupied Patient Detail Card */}
                  {isOccupied && (
                    <div className="rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-3.5 border border-amber-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-tight">
                              {currentPatient ? currentPatient.visitorName : 'Pasien UKS'}
                            </p>
                            <p className="text-[11px] text-amber-800 font-medium">
                              {currentPatient ? `${currentPatient.classOrPosition} (${currentPatient.role})` : 'Status Terisi'}
                            </p>
                          </div>
                        </div>

                        {currentPatient && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{currentPatient.time} WIB</span>
                          </div>
                        )}
                      </div>

                      {currentPatient && (
                        <div className="text-xs bg-white/90 p-2 rounded-lg border border-amber-100 text-slate-600">
                          <span className="font-semibold text-slate-700">Keluhan:</span> {currentPatient.complaint}
                        </div>
                      )}

                      {/* Quick Vacate Bed Action */}
                      <button
                        onClick={() => releaseBed(bed.name)}
                        className="w-full mt-2 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Selesaikan Istirahat / Kosongkan Ranjang</span>
                      </button>
                    </div>
                  )}

                  {/* Available Bed Placeholder State */}
                  {!isOccupied && !isMaintenance && (
                    <div className="rounded-xl bg-emerald-50/50 p-3.5 border border-emerald-100 text-center space-y-1">
                      <p className="text-xs font-semibold text-emerald-800">Ranjang Bersih & Siap Digunakan</p>
                      <p className="text-[11px] text-emerald-600">
                        Dapat langsung dialokasikan saat pencatatan tamu UKS
                      </p>
                    </div>
                  )}

                  {/* Maintenance State */}
                  {isMaintenance && (
                    <div className="rounded-xl bg-slate-100 p-3.5 border border-slate-200 text-center space-y-1">
                      <p className="text-xs font-semibold text-slate-700">Sedang Dalam Pembersihan / Sterilisasi</p>
                      <p className="text-[11px] text-slate-500">
                        Tidak dialokasikan untuk pasien baru sampai selesai dibersihkan
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Quick status dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-500">Ubah:</span>
                    <select
                      value={bed.status}
                      onChange={(e) => setBedStatus(bed.id, e.target.value as any)}
                      className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Tersedia">Tersedia</option>
                      <option value="Terisi">Terisi</option>
                      <option value="Perbaikan / Pembersihan">Perbaikan / Steril</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(bed)}
                      title="Edit Info Ranjang"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingBed(bed)}
                      title="Hapus Ranjang"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingBed) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingBed ? 'Edit Informasi Ranjang' : 'Tambah Ranjang UKS Baru'}
                  </h3>
                  <p className="text-xs text-emerald-100">
                    {editingBed ? `Perbarui data untuk ${editingBed.name}` : 'Masukkan data identitas ranjang baru'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingBed(null);
                }}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBed} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama / Label Ranjang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ranjang 4, Ranjang Isolasi B"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lokasi / Ruangan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ruang Utama UKS"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Peruntukan Gender
                  </label>
                  <select
                    value={formData.genderCategory}
                    onChange={(e) => setFormData({ ...formData, genderCategory: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm outline-none bg-white font-medium"
                  >
                    <option value="Semua">Semua / Campuran</option>
                    <option value="Siswa Laki-laki">Khusus Siswa (L)</option>
                    <option value="Siswi Perempuan">Khusus Siswi (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status Ranjang
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm outline-none bg-white font-medium"
                >
                  <option value="Tersedia">Tersedia (Siap Digunakan)</option>
                  <option value="Terisi">Terisi Pasien</option>
                  <option value="Perbaikan / Pembersihan">Perbaikan / Sterilisasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fasilitas & Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Dilengkapi tiang infus, tabung O2 portable, dekat dengan jendela ventilasi"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm outline-none resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingBed(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  {editingBed ? 'Simpan Perubahan' : 'Tambah Ranjang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Hapus Ranjang?</h3>
              <p className="text-sm text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus <span className="font-semibold text-slate-800">"{deletingBed.name}"</span> ({deletingBed.location}) dari inventaris UKS?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingBed(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all"
              >
                Ya, Hapus Ranjang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
