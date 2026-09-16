import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Calendar,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  Trash2,
  Eye,
  Activity,
  Pill,
  TrendingUp,
  UserCheck,
  GraduationCap,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  X,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { useUks } from '../context/UksContext';
import { VisitRecord, VisitorRole, VisitStatus } from '../types';
import { STUDENT_CLASSES } from '../data/initialData';
import { ConfirmModal } from './ConfirmModal';

interface AdminDashboardProps {
  onOpenRestockModal: (medicineId?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenRestockModal }) => {
  const {
    records,
    medicines,
    lowStockMedicines,
    outOfStockMedicines,
    deleteVisitRecord,
    updateVisitStatus,
    navigateToTab,
    adminUser
  } = useUks();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | VisitorRole>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selected visit for detail modal
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null);

  // Selected visit for delete confirmation modal
  const [deletingVisit, setDeletingVisit] = useState<VisitRecord | null>(null);

  // Today ISO string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, roleFilter, statusFilter, classFilter]);

  // Filtered visits
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Search query (name or class)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = record.visitorName.toLowerCase().includes(q);
        const matchesClass = record.classOrPosition.toLowerCase().includes(q);
        const matchesComplaint = record.complaint.toLowerCase().includes(q);
        if (!matchesName && !matchesClass && !matchesComplaint) return false;
      }

      // Role filter
      if (roleFilter !== 'all' && record.role !== roleFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && record.finalStatus !== statusFilter) {
        return false;
      }

      // Class filter
      if (classFilter !== 'all') {
        if (classFilter === 'tingkat-X' && !record.classOrPosition.startsWith('X-')) return false;
        if (classFilter === 'tingkat-XI' && !record.classOrPosition.startsWith('XI-')) return false;
        if (classFilter === 'tingkat-XII' && !record.classOrPosition.startsWith('XII-')) return false;
        if (!classFilter.startsWith('tingkat-') && record.classOrPosition !== classFilter) return false;
      }

      // Date range filter
      if (dateFilter === 'today') {
        return record.date === todayStr;
      } else if (dateFilter === 'week') {
        const recordDate = new Date(record.date).getTime();
        const oneWeekAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
        return recordDate >= oneWeekAgo;
      } else if (dateFilter === 'month') {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const rDate = new Date(record.date);
        return rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear;
      }

      return true;
    });
  }, [records, searchQuery, roleFilter, statusFilter, classFilter, dateFilter, todayStr]);

  // Paginated records
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (validCurrentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, validCurrentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const todayCount = records.filter(r => r.date === todayStr).length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthCount = records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    const activeRestingCount = records.filter(r => r.finalStatus === 'Sedang Istirahat di UKS').length;
    const totalMedicinesDosed = records.reduce((acc, r) =>
      acc + r.medicinesGiven.reduce((sub, m) => sub + m.quantity, 0), 0
    );

    return {
      todayCount,
      monthCount,
      activeRestingCount,
      totalMedicinesDosed
    };
  }, [records, todayStr]);

  // Complaint breakdown (Top 5)
  const topComplaints = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      // Split multiple complaints if comma separated or use standard categories
      const clean = r.complaint.split(',')[0].trim();
      counts[clean] = (counts[clean] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [records]);

  // Role Breakdown
  const roleBreakdown = useMemo(() => {
    const siswa = records.filter(r => r.role === 'siswa').length;
    const guru = records.filter(r => r.role === 'guru').length;
    const staf = records.filter(r => r.role === 'staf').length;
    const total = records.length || 1;
    return {
      siswa,
      guru,
      staf,
      siswaPct: Math.round((siswa / total) * 100),
      guruPct: Math.round((guru / total) * 100),
      stafPct: Math.round((staf / total) * 100)
    };
  }, [records]);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">

      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Dashboard
        </h2>
      </div>

      {/* NOTIFIKASI PERINGATAN STOK MENIPIS (CRITICAL BANNER) */}
      {lowStockMedicines.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-amber-950">
                    Peringatan Stok Obat Menipis / Habis!
                  </h3>
                  <span className="bg-amber-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {lowStockMedicines.length} Obat Perlu Restock
                  </span>
                </div>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  Terdapat obat dengan stok di bawah batas aman minimum. Segera lakukan penambahan stok agar pelayanan UKS tidak terhambat.
                </p>

                {/* List of low stock pills */}
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {lowStockMedicines.map(m => (
                    <div
                      key={m.id}
                      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold border ${m.stock === 0
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : 'bg-white border-amber-300 text-amber-900 shadow-2xs'
                        }`}
                    >
                      <span>{m.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[11px] ${m.stock === 0 ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800 font-bold'}`}>
                        {m.stock === 0 ? 'HABIS (0)' : `Sisa: ${m.stock} ${m.unit}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenRestockModal(m.id)}
                        className="text-emerald-700 hover:text-emerald-900 underline text-[11px] font-bold"
                      >
                        Restock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigateToTab('inventory')}
              className="whitespace-nowrap px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
            >
              Buka Inventaris Obat &rarr;
            </button>
          </div>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hari ini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kunjungan Hari Ini
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {stats.todayCount} <span className="text-sm font-normal text-slate-500">orang</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Tercatat real-time
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Bulan Ini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Bulan Ini
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {stats.monthCount} <span className="text-sm font-normal text-slate-500">pasien</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Siswa: {roleBreakdown.siswa} • Guru: {roleBreakdown.guru}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Sedang Istirahat */}
        <div
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Istirahat di UKS
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {stats.activeRestingCount} <span className="text-sm font-normal text-slate-500">pasien</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {stats.activeRestingCount > 0 ? 'Sedang dalam penanganan' : 'Tidak ada pasien istirahat'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Obat Perlu Restock */}
        <div className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between ${lowStockMedicines.length > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'
          }`}>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Stok Obat Menipis
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {lowStockMedicines.length} <span className="text-sm font-normal text-slate-500">item</span>
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">
              {outOfStockMedicines.length > 0 ? `${outOfStockMedicines.length} obat habis total!` : 'Semua stok tersedia'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
            <Pill className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ANALYTICAL RECAP SECTION (Charts & Distributions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Complaints */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Keluhan Terbanyak
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Top 5 Kasus</span>
          </div>

          <div className="space-y-3">
            {topComplaints.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data keluhan</p>
            ) : (
              topComplaints.map(([name, count], idx) => {
                const pct = Math.round((count / (records.length || 1)) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 truncate max-w-[200px]">{name}</span>
                      <span className="text-slate-500 font-semibold">{count} kasus ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.max(8, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Demographics: Siswa vs Guru */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Demografi Pengunjung UKS
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Kategori Pengguna</span>
          </div>

          <div className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Siswa / Siswi</div>
                  <div className="text-[11px] text-slate-500">Pelajar SMAN 1 Batu</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-slate-900">{roleBreakdown.siswa}</div>
                <div className="text-[10px] text-emerald-700 font-semibold">{roleBreakdown.siswaPct}%</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Guru / Tenaga Pendidik</div>
                  <div className="text-[11px] text-slate-500">Dewan Guru Pengajar</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-slate-900">{roleBreakdown.guru}</div>
                <div className="text-[10px] text-blue-700 font-semibold">{roleBreakdown.guruPct}%</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Staf & Karyawan TU</div>
                  <div className="text-[11px] text-slate-500">Tenaga Kependidikan</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-slate-900">{roleBreakdown.staf}</div>
                <div className="text-[10px] text-purple-700 font-semibold">{roleBreakdown.stafPct}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live UKS Resting Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Pasien Sedang Istirahat di UKS
              </h3>
            </div>

            {records.filter(r => r.finalStatus === 'Sedang Istirahat di UKS').length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium">Tidak ada pasien yang sedang istirahat di UKS saat ini.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Semua pengunjung telah kembali atau dijemput.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {records
                  .filter(r => r.finalStatus === 'Sedang Istirahat di UKS')
                  .slice(0, 3)
                  .map(patient => (
                    <div key={patient.id} className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">{patient.visitorName}</span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-1.5 py-0.5 rounded">
                          Sedang Istirahat
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px] truncate">
                        {patient.classOrPosition} • {patient.complaint}
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500">Masuk: {patient.time}</span>
                        <button
                          type="button"
                          onClick={() => updateVisitStatus(patient.id, 'Kembali ke Kelas / Mengajar')}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300 cursor-pointer"
                        >
                          Selesai Istirahat &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Dosis Obat Terpakai:</span>
            <span className="font-bold text-slate-800">{stats.totalMedicinesDosed} butir / sachet</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, kelas, atau keluhan..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>

          {/* Quick Date Filters */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs text-slate-500 mr-1 flex items-center gap-1 font-medium">
              <Filter className="w-3.5 h-3.5" /> Rentang:
            </span>
            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${dateFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('today')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${dateFilter === 'today'
                ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('week')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${dateFilter === 'week'
                ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              7 Hari Terakhir
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('month')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${dateFilter === 'month'
                ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              Bulan Ini
            </button>
          </div>

          {/* Role, Status & Class Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="all">Semua Peran (Siswa & Guru)</option>
              <option value="siswa">Hanya Siswa</option>
              <option value="guru">Hanya Guru</option>
              <option value="staf">Hanya Staf</option>
            </select>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="all">Semua Kelas / Rombel</option>
              <option value="tingkat-X">Semua Kelas X (X-1 s/d X-12)</option>
              <option value="tingkat-XI">Semua Kelas XI (XI-1 s/d XI-12)</option>
              <option value="tingkat-XII">Semua Kelas XII (XII-1 s/d XII-12)</option>
              <optgroup label="── KELAS X ──">
                {STUDENT_CLASSES.X.map(cls => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </optgroup>
              <optgroup label="── KELAS XI ──">
                {STUDENT_CLASSES.XI.map(cls => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </optgroup>
              <optgroup label="── KELAS XII ──">
                {STUDENT_CLASSES.XII.map(cls => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </optgroup>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="all">Semua Status</option>
              <option value="Kembali ke Kelas / Mengajar">Kembali ke Kelas</option>
              <option value="Sedang Istirahat di UKS">Sedang Istirahat</option>
              <option value="Izin Pulang / Dijemput">Izin Pulang</option>
              <option value="Rujukan ke Puskesmas/RS">Rujukan</option>
            </select>
          </div>
        </div>
      </div>

      {/* REKAPITULASI TABEL DATA KUNJUNGAN */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">
            Riwayat Kunjungan UKS
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Waktu / Tanggal</th>
                <th className="py-3 px-4">Nama & Peran</th>
                <th className="py-3 px-4">Kelas / Jabatan</th>
                <th className="py-3 px-4">Keluhan & Gejala</th>
                <th className="py-3 px-4">Tindakan UKS</th>
                <th className="py-3 px-4">Obat Diberikan</th>
                <th className="py-3 px-4">Status Akhir</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-sm">Tidak ada data kunjungan yang cocok.</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter rentang waktu.</p>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition">
                    {/* Waktu */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{record.time}</div>
                      <div className="text-slate-400 text-[11px]">{record.date}</div>
                    </td>

                    {/* Nama & Peran */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{record.visitorName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${record.role === 'siswa'
                          ? 'bg-emerald-100 text-emerald-800'
                          : record.role === 'guru'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                          }`}>
                          {record.role === 'siswa' ? 'Siswa' : record.role === 'guru' ? 'Guru' : 'Staf'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">({record.gender})</span>
                      </div>
                    </td>

                    {/* Kelas / Jabatan */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{record.classOrPosition}</span>
                      {record.bedNumber && (
                        <div className="text-[10px] text-indigo-600 font-medium mt-0.5">
                          {record.bedNumber}
                        </div>
                      )}
                    </td>

                    {/* Keluhan */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-800">{record.complaint}</p>
                      {(record.temperature || record.bloodPressure) && (
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                          {record.temperature && <span>Suhu: {record.temperature}°C</span>}
                          {record.bloodPressure && <span>Tensi: {record.bloodPressure}</span>}
                        </div>
                      )}
                    </td>

                    {/* Tindakan */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-700">{record.actionTaken}</p>
                    </td>

                    {/* Obat Diberikan */}
                    <td className="py-3.5 px-4">
                      {record.medicinesGiven.length > 0 ? (
                        <div className="space-y-1">
                          {record.medicinesGiven.map((m, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold px-2 py-0.5 rounded-md mr-1"
                            >
                              {m.medicineName} ({m.quantity} {m.unit})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Tanpa obat</span>
                      )}
                    </td>

                    {/* Status Akhir */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${record.finalStatus === 'Kembali ke Kelas / Mengajar'
                        ? 'bg-emerald-100 text-emerald-800'
                        : record.finalStatus === 'Sedang Istirahat di UKS'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : record.finalStatus === 'Izin Pulang / Dijemput'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {record.finalStatus}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedVisit(record)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Lihat Detail Kartu Kunjungan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingVisit(record)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Hapus Catatan Kunjungan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Menampilkan <strong className="text-slate-900">{filteredRecords.length === 0 ? 0 : (validCurrentPage - 1) * itemsPerPage + 1}</strong> - <strong className="text-slate-900">{Math.min(validCurrentPage * itemsPerPage, filteredRecords.length)}</strong> dari <strong className="text-slate-900">{filteredRecords.length}</strong> catatan
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

      {/* DETAIL MODAL KARTU KUNJUNGAN UKS */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Kartu Rekam Medis UKS</h4>
                  <span className="text-[11px] text-slate-500">ID: {selectedVisit.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisit(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Nama Pasien</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedVisit.visitorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status & Kelas</span>
                  <span className="font-semibold text-slate-800">
                    {selectedVisit.role.toUpperCase()} — {selectedVisit.classOrPosition} ({selectedVisit.gender})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Waktu Kunjungan</span>
                  <span className="font-medium text-slate-700">{selectedVisit.date} pukul {selectedVisit.time} WIB</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Tanda Vital (Pemeriksaan Awal):</span>
                <div className="flex gap-4">
                  <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg font-medium">
                    Suhu Tubuh: <strong>{selectedVisit.temperature ? `${selectedVisit.temperature}°C` : 'Tidak Diukur'}</strong>
                  </div>
                  <div className="bg-indigo-50 text-indigo-800 px-3 py-1.5 rounded-lg font-medium">
                    Tekanan Darah: <strong>{selectedVisit.bloodPressure || 'Tidak Diukur'}</strong>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Keluhan / Alasan ke UKS:</span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                  {selectedVisit.complaint}
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Tindakan Penanganan UKS:</span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                  {selectedVisit.actionTaken}
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Obat Yang Diberikan:</span>
                {selectedVisit.medicinesGiven.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedVisit.medicinesGiven.map((med, i) => (
                      <div key={i} className="flex justify-between items-center bg-teal-50 border border-teal-200 p-2.5 rounded-xl">
                        <div>
                          <div className="font-bold text-teal-900">{med.medicineName}</div>
                          {med.dosageNotes && (
                            <div className="text-[11px] text-teal-700">{med.dosageNotes}</div>
                          )}
                        </div>
                        <span className="bg-teal-600 text-white font-bold px-2 py-0.5 rounded text-xs">
                          {med.quantity} {med.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">Tidak membutuhkan / diberikan obat.</p>
                )}
              </div>

              {selectedVisit.notes && (
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Catatan Tambahan Petugas:</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {selectedVisit.notes}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Status Akhir:</span>
                <span className="font-bold text-sm bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg">
                  {selectedVisit.finalStatus}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedVisit(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Confirmation Modal for Delete Visit */}
      <ConfirmModal
        isOpen={!!deletingVisit}
        title={`Hapus Catatan Kunjungan ${deletingVisit?.visitorName || ''}?`}
        message="Data riwayat kunjungan ini akan dihapus secara permanen dari sistem dan cloud database UKS."
        details={deletingVisit ? [
          { label: 'Nama Pengunjung', value: deletingVisit.visitorName },
          { label: 'Status / Kelas', value: `${deletingVisit.role.toUpperCase()} - ${deletingVisit.classOrPosition}` },
          { label: 'Waktu Kunjungan', value: `${deletingVisit.date} (${deletingVisit.time})` },
          { label: 'Keluhan', value: deletingVisit.complaint }
        ] : []}
        confirmLabel="Hapus Kunjungan"
        cancelLabel="Batal"
        type="danger"
        onConfirm={() => {
          if (deletingVisit) {
            deleteVisitRecord(deletingVisit.id);
            setDeletingVisit(null);
          }
        }}
        onCancel={() => setDeletingVisit(null)}
      />
    </div>
  );
};
