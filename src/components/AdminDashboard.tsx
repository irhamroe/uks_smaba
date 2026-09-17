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
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  X,
  FileSpreadsheet,
  FileText,
  Check,
  ShieldCheck,
  Ban,
  Sparkles,
  ArrowRight
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
    pendingVisits,
    approvedVisits,
    approveVisitRecord,
    rejectVisitRecord,
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
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selected visit for detail modal
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null);

  // Selected visit for delete confirmation modal
  const [deletingVisit, setDeletingVisit] = useState<VisitRecord | null>(null);

  // Selected visit for reject confirmation modal
  const [rejectingVisit, setRejectingVisit] = useState<VisitRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Today ISO string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, roleFilter, statusFilter, classFilter, approvalFilter]);

  // Filtered visits
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Approval filter
      if (approvalFilter !== 'all') {
        const currentApproval = record.approvalStatus || 'approved';
        if (currentApproval !== approvalFilter) return false;
      }

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
  }, [records, searchQuery, roleFilter, statusFilter, classFilter, dateFilter, approvalFilter, todayStr]);

  // Paginated records
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (validCurrentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, validCurrentPage, itemsPerPage]);

  // Statistics (Calculated only on Approved visits)
  const stats = useMemo(() => {
    const approvedList = records.filter(r => r.approvalStatus === 'approved' || !r.approvalStatus);
    const todayCount = approvedList.filter(r => r.date === todayStr).length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthCount = approvedList.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    const activeRestingCount = approvedList.filter(r => r.finalStatus === 'Istirahat di UKS' || r.finalStatus === 'Sedang Istirahat di UKS').length;
    const totalMedicinesDosed = approvedList.reduce((acc, r) =>
      acc + r.medicinesGiven.reduce((sub, m) => sub + m.quantity, 0), 0
    );

    return {
      todayCount,
      monthCount,
      activeRestingCount,
      totalMedicinesDosed
    };
  }, [records, todayStr]);

  // Complaint breakdown (Top 5 Approved)
  const topComplaints = useMemo(() => {
    const approvedList = records.filter(r => r.approvalStatus === 'approved' || !r.approvalStatus);
    const counts: Record<string, number> = {};
    approvedList.forEach(r => {
      const clean = r.complaint.split(',')[0].trim();
      counts[clean] = (counts[clean] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [records]);

  // Role Breakdown
  const roleBreakdown = useMemo(() => {
    const approvedList = records.filter(r => r.approvalStatus === 'approved' || !r.approvalStatus);
    const siswa = approvedList.filter(r => r.role === 'siswa').length;
    const guru = approvedList.filter(r => r.role === 'guru').length;
    const staf = approvedList.filter(r => r.role === 'staf').length;
    const total = approvedList.length || 1;
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

      {/* PENDING APPROVAL QUEUE BANNER & CARDS */}
      {pendingVisits.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/80 to-orange-50 border border-amber-300/90 rounded-3xl p-5 sm:p-6 shadow-md shadow-amber-500/5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-amber-200/80">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-amber-950">
                    Antrean Verifikasi Formulir Buku Kontrol Pengunjung UKS
                  </h3>
                  <span className="bg-amber-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
                    {pendingVisits.length} Pengajuan Menunggu
                  </span>
                </div>
                <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                  Pengunjung mengisi buku kontrol publik. Data kunjungan & pemotongan stok obat baru akan diproses resmi setelah disetujui oleh Petugas UKS.
                </p>
              </div>
            </div>
          </div>

          {/* Grid of Pending Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {pendingVisits.map(visit => (
              <div
                key={visit.id}
                className="bg-white rounded-2xl p-4.5 border border-amber-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {visit.visitorName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          visit.role === 'siswa'
                            ? 'bg-emerald-100 text-emerald-800'
                            : visit.role === 'guru'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {visit.role.toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {visit.classOrPosition}
                        </span>
                        <span className="text-xs text-slate-400">({visit.gender})</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-800">{visit.time}</div>
                      <div className="text-[10px] text-slate-400">{visit.date}</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Keluhan:</span>
                      <span className="text-slate-800 font-semibold">{visit.complaint}</span>
                    </div>
                    {visit.actionTaken && (
                      <div>
                        <span className="text-slate-400 font-medium block text-[10px] uppercase">Tindakan:</span>
                        <span className="text-slate-700">{visit.actionTaken}</span>
                      </div>
                    )}
                  </div>

                  {/* Drug Allergy Alert */}
                  {visit.hasDrugAllergy ? (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2 rounded-xl text-xs flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[11px] block text-rose-900">Perhatian: Ada Alergi Obat!</span>
                        <span className="text-[11px] text-rose-700 font-medium">{visit.drugAllergyDescription || 'Alergi obat dilaporkan'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-700 bg-emerald-50/70 border border-emerald-200/80 px-2 py-1 rounded-lg flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Konfirmasi: Tidak ada alergi obat</span>
                    </div>
                  )}

                  {/* Medicines Requested */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Kebutuhan Obat:
                    </span>
                    {visit.needsMedicine && visit.medicinesGiven.length > 0 ? (
                      <div className="space-y-1">
                        {visit.medicinesGiven.map((m, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs bg-emerald-50/70 border border-emerald-200 text-emerald-900 px-2.5 py-1.5 rounded-lg"
                          >
                            <span className="font-bold">{m.medicineName}</span>
                            <span className="font-extrabold text-emerald-700">
                              {m.quantity} {m.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Tidak ada permintaan obat</span>
                    )}
                  </div>
                </div>

                {/* Approve / Reject Actions */}
                <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectReason('');
                      setRejectingVisit(visit);
                    }}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => approveVisitRecord(visit.id)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                        className="text-emerald-700 hover:text-emerald-900 underline text-[11px] font-bold cursor-pointer"
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
              Tercatat disetujui
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

        {/* Card 3: Pasien Istirahat Aktif */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pasien Istirahat di UKS
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {stats.activeRestingCount} <span className="text-sm font-normal text-slate-500">orang</span>
            </div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">
              {stats.activeRestingCount > 0 ? 'Sedang diobservasi di ranjang' : 'Semua ranjang kosong'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total Obat & Peringatan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Katalog Stok Obat
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {medicines.length} <span className="text-sm font-normal text-slate-500">jenis</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              <span className={lowStockMedicines.length > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-medium'}>
                {lowStockMedicines.length} obat kritis / habis
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Pill className="w-6 h-6" />
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

          {/* Role, Status & Approval Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="all">Semua Status Verifikasi</option>
              <option value="approved">Disetujui Saja</option>
              <option value="pending">Menunggu Verifikasi (Pending)</option>
              <option value="rejected">Ditolak Saja</option>
            </select>

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
                <th className="py-3 px-4">Status Kunjungan</th>
                <th className="py-3 px-4">Status Verifikasi</th>
                <th className="py-3 px-4">Petugas</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-sm">Tidak ada data kunjungan yang cocok.</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter status.</p>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map(record => {
                  const isPending = record.approvalStatus === 'pending';
                  const isRejected = record.approvalStatus === 'rejected';

                  return (
                    <tr key={record.id} className={`hover:bg-slate-50/70 transition ${isPending ? 'bg-amber-50/30' : isRejected ? 'bg-rose-50/20 opacity-70' : ''}`}>
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
                      </td>

                      {/* Keluhan & Alergi */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-800">{record.complaint}</p>
                        {record.hasDrugAllergy ? (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 bg-rose-100 border border-rose-200 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              Alergi: {record.drugAllergyDescription || 'Ada Riwayat Alergi'}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-0.5">
                            <span className="text-[10px] text-slate-400">
                              (Alergi Obat: -)
                            </span>
                          </div>
                        )}
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

                      {/* Status Kunjungan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${record.finalStatus === 'Kembali ke Kelas / Mengajar'
                          ? 'bg-emerald-100 text-emerald-800'
                          : (record.finalStatus === 'Istirahat di UKS' || record.finalStatus === 'Sedang Istirahat di UKS')
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : record.finalStatus === 'Izin Pulang / Dijemput'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                          {record.finalStatus === 'Sedang Istirahat di UKS' ? 'Istirahat di UKS' : record.finalStatus}
                        </span>
                      </td>

                      {/* Status Verifikasi (Approval) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Menunggu Verifikasi
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Ditolak
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Disetujui
                          </span>
                        )}
                      </td>

                      {/* Petugas Penangan / Penyetuju */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {(record.approvedBy || record.handledBy || (isPending ? '?' : 'P')).charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-xs">
                              {record.approvedBy || record.handledBy || (isPending ? 'Menunggu Verifikasi' : 'Petugas UKS')}
                            </div>
                            {record.approvedAt && (
                              <div className="text-[10px] text-slate-400">
                                {new Date(record.approvedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => approveVisitRecord(record.id)}
                                className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                title="Setujui Kunjungan & Potong Stok"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectReason('');
                                  setRejectingVisit(record);
                                }}
                                className="p-1.5 text-amber-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Tolak Kunjungan"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedVisit(record)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
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
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
            >
              &larr; Sebelumnya
            </button>
            <span className="px-3 py-1.5 text-slate-700 font-bold">
              {validCurrentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
            >
              Berikutnya &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL VISIT MODAL */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Kartu Rekam Kunjungan UKS
                  </h3>
                  <p className="text-[11px] text-slate-500">ID: {selectedVisit.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisit(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Nama Pengunjung:</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedVisit.visitorName}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Peran / Kelas:</span>
                  <div className="font-semibold text-slate-800">
                    {selectedVisit.role.toUpperCase()} — {selectedVisit.classOrPosition}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Waktu Kunjungan:</span>
                  <div className="font-semibold text-slate-800">
                    {selectedVisit.date} ({selectedVisit.time} WIB)
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Petugas Penangan:</span>
                  <div className="font-bold text-emerald-800">
                    {selectedVisit.approvedBy || selectedVisit.handledBy || (selectedVisit.approvalStatus === 'pending' ? 'Menunggu Petugas' : 'Petugas UKS')}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-medium">Status Verifikasi:</span>
                  <div className="font-bold">
                    {selectedVisit.approvalStatus === 'pending' ? (
                      <span className="text-amber-600">Menunggu Verifikasi</span>
                    ) : selectedVisit.approvalStatus === 'rejected' ? (
                      <span className="text-rose-600">Ditolak ({selectedVisit.rejectedReason || 'Oleh Petugas'})</span>
                    ) : (
                      <span className="text-emerald-600">Disetujui oleh {selectedVisit.approvedBy || selectedVisit.handledBy || 'Petugas UKS'}</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Keluhan / Gejala:</span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {selectedVisit.complaint}
                </p>
              </div>

              {/* Drug Allergy Status */}
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                selectedVisit.hasDrugAllergy ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                {selectedVisit.hasDrugAllergy ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className="font-bold text-xs block">
                    Riwayat Alergi Obat: {selectedVisit.hasDrugAllergy ? 'ADA ALERGI OBAT' : 'Tidak Ada Riwayat Alergi'}
                  </span>
                  {selectedVisit.hasDrugAllergy && (
                    <p className="text-xs text-rose-700 mt-0.5 font-semibold">
                      Nama Obat Alergi: {selectedVisit.drugAllergyDescription || 'Perlu konfirmasi dengan pasien'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Tindakan / Penanganan UKS:</span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {selectedVisit.actionTaken}
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Obat yang Diberikan:</span>
                {selectedVisit.medicinesGiven.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedVisit.medicinesGiven.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-teal-50 border border-teal-200 p-2 rounded-lg text-teal-900">
                        <span className="font-bold">{m.medicineName}</span>
                        <span className="font-semibold">{m.quantity} {m.unit} {m.dosageNotes ? `(${m.dosageNotes})` : ''}</span>
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

      {/* Modern Modal for Rejecting Visit */}
      {rejectingVisit && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 ring-4 ring-rose-50 flex items-center justify-center shrink-0">
                  <Ban className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={() => setRejectingVisit(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block mb-1">
                Tolak Pengajuan Kunjungan
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                Tolak Kunjungan {rejectingVisit.visitorName}?
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Pengajuan ini akan ditandai ditolak. Stok obat aman dan <strong>sama sekali tidak akan berkurang</strong>.
              </p>

              <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pengunjung:</span>
                  <span className="font-bold text-slate-800">{rejectingVisit.visitorName} ({rejectingVisit.classOrPosition})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Keluhan:</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[200px]">{rejectingVisit.complaint}</span>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alasan Penolakan (Opsional)
                </label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Misal: Data tidak valid / iseng / siswa tidak berada di UKS"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectingVisit(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  rejectVisitRecord(rejectingVisit.id, rejectReason.trim() || undefined);
                  setRejectingVisit(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Tolak Kunjungan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
