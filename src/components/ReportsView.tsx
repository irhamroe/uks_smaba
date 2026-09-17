import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Download, 
  Printer, 
  Users, 
  Pill, 
  CheckCircle2, 
  Building2, 
  ChevronRight,
  Sparkles,
  UserCheck,
  ClipboardList,
  AlertTriangle,
  Clock,
  ArrowRight,
  CalendarRange,
  Filter
} from 'lucide-react';
import { useUks } from '../context/UksContext';
import { 
  exportVisitsReportToExcel, 
  exportMedicineUsageReportToExcel 
} from '../utils/excelHelper';
import { 
  exportVisitsReportToPdf, 
  printVisitsReport,
  exportMedicineUsageReportToPdf,
  printMedicineUsageReport
} from '../utils/pdfHelper';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

type ReportTab = 'visits' | 'medicines';
type FilterMode = 'month' | 'range';

export const ReportsView: React.FC = () => {
  const { records, medicines, schoolInfo, koordinatorUks, showToast } = useUks();

  // Active Report Tab: 'visits' vs 'medicines'
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('visits');

  // Filter Mode: 'month' vs 'range'
  const [filterMode, setFilterMode] = useState<FilterMode>('month');

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0 - 11
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  // Date Range state (default: current month start to today)
  const defaultStartDate = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }, []);

  const defaultEndDate = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);

  // Human readable period label
  const periodLabel = useMemo(() => {
    if (filterMode === 'month') {
      return `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    }

    if (!startDate && !endDate) return 'Semua Waktu';
    if (startDate === endDate) {
      return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(startDate));
    }
    const s = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(startDate));
    const e = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(endDate));
    return `${s} s/d ${e}`;
  }, [filterMode, selectedMonth, selectedYear, startDate, endDate]);

  // Filter approved records according to selected period
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const isApproved = r.approvalStatus === 'approved' || !r.approvalStatus;
      if (!isApproved) return false;

      if (filterMode === 'month') {
        const d = new Date(r.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      }

      // Date Range Mode
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;
      return true;
    });
  }, [records, filterMode, selectedMonth, selectedYear, startDate, endDate]);

  // Statistics for filtered visits
  const visitStats = useMemo(() => {
    const totalVisits = filteredRecords.length;
    const siswaCount = filteredRecords.filter(r => r.role === 'siswa').length;
    const guruCount = filteredRecords.filter(r => r.role !== 'siswa').length;
    const withMedsCount = filteredRecords.filter(r => r.needsMedicine && r.medicinesGiven.length > 0).length;
    const restingCount = filteredRecords.filter(r => r.finalStatus === 'Istirahat di UKS' || r.finalStatus === 'Sedang Istirahat di UKS').length;
    const allergyCount = filteredRecords.filter(r => r.hasDrugAllergy).length;

    return {
      totalVisits,
      siswaCount,
      guruCount,
      withMedsCount,
      restingCount,
      allergyCount
    };
  }, [filteredRecords]);

  // Statistics for medicine usages during period
  const medicineStats = useMemo(() => {
    const totalDosesGiven = filteredRecords.reduce((acc, v) => 
      acc + v.medicinesGiven.reduce((sub, m) => sub + m.quantity, 0), 0
    );

    const distinctMedsUsed = new Set(
      filteredRecords.flatMap(v => v.medicinesGiven.map(m => m.medicineName.toLowerCase()))
    ).size;

    const criticalStockCount = medicines.filter(m => m.stock <= m.minStock).length;
    const outOfStockCount = medicines.filter(m => m.stock === 0).length;

    // Calculate usage per medicine in this period
    const usagePerMedicine = medicines.map(m => {
      const totalUsed = filteredRecords.reduce((acc, v) => {
        const found = v.medicinesGiven.find(item => 
          item.medicineId === m.id || item.medicineName.toLowerCase() === m.name.toLowerCase()
        );
        return acc + (found ? found.quantity : 0);
      }, 0);
      return {
        ...m,
        totalUsedPeriod: totalUsed
      };
    });

    return {
      totalDosesGiven,
      distinctMedsUsed,
      criticalStockCount,
      outOfStockCount,
      usagePerMedicine
    };
  }, [filteredRecords, medicines]);

  // Print & Export Handlers
  const handlePrint = () => {
    if (activeReportTab === 'visits') {
      printVisitsReport(periodLabel, filteredRecords, schoolInfo, koordinatorUks);
    } else {
      printMedicineUsageReport(periodLabel, filteredRecords, medicines, schoolInfo, koordinatorUks);
    }
  };

  const handleExportPdf = () => {
    if (activeReportTab === 'visits') {
      exportVisitsReportToPdf(periodLabel, filteredRecords, schoolInfo, koordinatorUks);
    } else {
      exportMedicineUsageReportToPdf(periodLabel, filteredRecords, medicines, schoolInfo, koordinatorUks);
    }
  };

  const handleExportExcel = () => {
    if (activeReportTab === 'visits') {
      exportVisitsReportToExcel(periodLabel, filteredRecords, schoolInfo);
    } else {
      exportMedicineUsageReportToExcel(periodLabel, filteredRecords, medicines, schoolInfo);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-5 sm:py-8 px-3 sm:px-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              Pusat Pelaporan & Rekapitulasi Resmi UKS
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Laporan & Rekapitulasi UKS {schoolInfo.shortName}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
              Pilih jenis laporan yang diinginkan, tentukan rentang tanggal atau bulan, lalu cetak ber-kop surat resmi atau unduh berkas Excel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-quick-print"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-white text-emerald-950 hover:bg-emerald-50 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              Cetak Dokumen
            </button>
            <button
              type="button"
              id="btn-quick-pdf"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Unduh PDF
            </button>
            <button
              type="button"
              id="btn-quick-excel"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Unduh Excel
            </button>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS CARD (Rentang Tanggal & Pilihan Bulan) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              1. Pilih Tipe Laporan
            </span>
            {/* Segmented Control for Report Type */}
            <div className="grid grid-cols-2 gap-2 mt-2 max-w-md">
              <button
                type="button"
                id="tab-report-visits"
                onClick={() => setActiveReportTab('visits')}
                className={`flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  activeReportTab === 'visits'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Rekap Daftar Kunjungan
              </button>

              <button
                type="button"
                id="tab-report-medicines"
                onClick={() => setActiveReportTab('medicines')}
                className={`flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  activeReportTab === 'medicines'
                    ? 'bg-teal-700 border-teal-700 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Pill className="w-4 h-4" />
                Rekap Penggunaan Obat
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              2. Metode Pemilihan Periode
            </span>
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 mt-2">
              <button
                type="button"
                onClick={() => setFilterMode('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterMode === 'month'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Pilihan Bulan
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('range')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterMode === 'range'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5 inline mr-1" />
                Rentang Tanggal (Kustom)
              </button>
            </div>
          </div>
        </div>

        {/* Date Filters Form Inputs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
          {filterMode === 'month' ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-600">Pilih Bulan & Tahun:</span>
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={idx}>
                      Bulan {name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {[2024, 2025, 2026, 2027].map(yr => (
                    <option key={yr} value={yr}>
                      Tahun {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 shrink-0">Tanggal Awal:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 shrink-0">Tanggal Akhir:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          )}

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Periode Terpilih:</span>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg inline-block mt-0.5">
              {periodLabel}
            </span>
          </div>
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      {activeReportTab === 'visits' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Kunjungan
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {visitStats.totalVisits} <span className="text-xs font-normal text-slate-500">pasien</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Pengunjung Siswa
            </span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              {visitStats.siswaCount} <span className="text-xs font-normal text-slate-500">siswa</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Pengunjung Guru/Staf
            </span>
            <div className="text-2xl font-extrabold text-blue-700 mt-1">
              {visitStats.guruCount} <span className="text-xs font-normal text-slate-500">orang</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Mendapatkan Obat
            </span>
            <div className="text-2xl font-extrabold text-teal-700 mt-1">
              {visitStats.withMedsCount} <span className="text-xs font-normal text-slate-500">pasien</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Dosis Obat Diberikan
            </span>
            <div className="text-2xl font-extrabold text-teal-700 mt-1">
              {medicineStats.totalDosesGiven} <span className="text-xs font-normal text-slate-500">unit</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Varian Obat Terpakai
            </span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              {medicineStats.distinctMedsUsed} <span className="text-xs font-normal text-slate-500">macam</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Stok Obat Menipis
            </span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {medicineStats.criticalStockCount} <span className="text-xs font-normal text-slate-500">item</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Jenis Obat UKS
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {medicines.length} <span className="text-xs font-normal text-slate-500">item</span>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Document Sub-Header Bar */}
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Pratinjau {activeReportTab === 'visits' ? 'Laporan Rekap Daftar Kunjungan' : 'Laporan Rekap Penggunaan & Stok Obat'}
              </span>
              <span className="text-[11px] text-slate-500">
                {schoolInfo.shortName} • Periode: {periodLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-print-preview"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak
            </button>
            <button
              type="button"
              id="btn-pdf-preview"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
          </div>
        </div>

        {/* The Paper Document */}
        <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6 text-slate-800 font-sans">
          {/* Header Kop Surat Resmi */}
          <div className="text-center pb-4 border-b-2 border-slate-800 relative">
            {schoolInfo.logoUrl && (
              <img 
                src={schoolInfo.logoUrl} 
                alt="Logo Sekolah" 
                className="w-16 h-16 object-contain absolute left-2 top-0 hidden sm:block" 
              />
            )}
            <div className="text-xs font-bold uppercase tracking-wide text-slate-700">
              {schoolInfo.governmentHeader || 'PEMERINTAH PROVINSI • DINAS PENDIDIKAN'}
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              {schoolInfo.name || 'SEKOLAH MENENGAH ATAS'}
            </div>
            <div className="text-sm font-bold text-emerald-800 tracking-wide mt-0.5">
              {schoolInfo.division || 'UNIT KESEHATAN SEKOLAH (UKS)'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {schoolInfo.address} {schoolInfo.phone ? `| Telepon: ${schoolInfo.phone}` : ''} {schoolInfo.email ? `| Email: ${schoolInfo.email}` : ''}
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 underline uppercase tracking-wide">
              {activeReportTab === 'visits' 
                ? 'Laporan Rekapitulasi Daftar Kunjungan Pasien UKS' 
                : 'Laporan Rekapitulasi Penggunaan & Persediaan Obat UKS'}
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Periode: <strong>{periodLabel}</strong>
            </p>
          </div>

          {/* 1. TABEL PRATINJAU KUNJUNGAN */}
          {activeReportTab === 'visits' ? (
            <div>
              <div className="text-xs font-bold text-slate-800 mb-2">
                Daftar Kunjungan Pasien UKS ({filteredRecords.length} data):
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Tgl/Waktu</th>
                      <th className="py-2.5 px-3">Nama Pengunjung</th>
                      <th className="py-2.5 px-3">Kelas/Jabatan</th>
                      <th className="py-2.5 px-3">Alergi Obat</th>
                      <th className="py-2.5 px-3">Keluhan</th>
                      <th className="py-2.5 px-3">Tindakan</th>
                      <th className="py-2.5 px-3">Obat Diberikan</th>
                      <th className="py-2.5 px-3">Status Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          Belum ada data kunjungan yang tercatat pada periode {periodLabel}.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.slice(0, 15).map((r, i) => (
                        <tr key={r.id}>
                          <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{r.date} {r.time}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{r.visitorName} ({r.gender})</td>
                          <td className="py-2 px-3">{r.classOrPosition}</td>
                          <td className="py-2 px-3">
                            {r.hasDrugAllergy ? (
                              <span className="text-rose-700 font-bold">Ada ({r.drugAllergyDescription || 'Ya'})</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3 max-w-xs truncate">{r.complaint}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{r.actionTaken || '-'}</td>
                          <td className="py-2 px-3 text-emerald-700 font-medium">
                            {r.medicinesGiven.length > 0 
                              ? r.medicinesGiven.map(m => `${m.medicineName} (${m.quantity} ${m.unit})`).join(', ')
                              : '-'}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-700">
                            {r.finalStatus}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {filteredRecords.length > 15 && (
                  <div className="py-2 px-3 bg-slate-50 text-slate-500 text-[11px] text-center border-t border-slate-200">
                    ... dan {filteredRecords.length - 15} data lainnya termuat lengkap di dokumen cetak PDF & Excel.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 2. TABEL PRATINJAU PENGGUNAAN & STOK OBAT */
            <div className="space-y-6">
              <div>
                <div className="text-xs font-bold text-slate-800 mb-2">
                  A. Rekapitulasi Pemakaian & Sisa Persediaan Obat:
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Nama Obat</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3 text-center">Satuan</th>
                        <th className="py-2.5 px-3 text-center">Terpakai Periode Ini</th>
                        <th className="py-2.5 px-3 text-center">Sisa Stok</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {medicineStats.usagePerMedicine.map((m, i) => (
                        <tr key={m.id}>
                          <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{m.name}</td>
                          <td className="py-2 px-3 text-slate-600">{m.category}</td>
                          <td className="py-2 px-3 text-center">{m.unit}</td>
                          <td className="py-2 px-3 text-center font-bold text-emerald-800">
                            {m.totalUsedPeriod} {m.unit}
                          </td>
                          <td className="py-2 px-3 text-center font-semibold text-slate-800">
                            {m.stock} {m.unit}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.stock === 0 
                                ? 'bg-red-100 text-red-800' 
                                : m.stock <= m.minStock 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {m.stock === 0 ? 'HABIS' : m.stock <= m.minStock ? 'MENIPIS' : 'AMAN'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rincian Pasien Penerima Obat */}
              <div>
                <div className="text-xs font-bold text-slate-800 mb-2">
                  B. Rincian Distribusi Obat kepada Pasien ({filteredRecords.filter(v => v.needsMedicine && v.medicinesGiven.length > 0).length} pasien):
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Tgl/Waktu</th>
                        <th className="py-2.5 px-3">Nama Pasien</th>
                        <th className="py-2.5 px-3">Obat Diberikan</th>
                        <th className="py-2.5 px-3">Aturan / Anjuran</th>
                        <th className="py-2.5 px-3">Petugas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {filteredRecords.filter(v => v.needsMedicine && v.medicinesGiven.length > 0).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400">
                            Tidak ada pemberian obat pada periode ini.
                          </td>
                        </tr>
                      ) : (
                        filteredRecords
                          .filter(v => v.needsMedicine && v.medicinesGiven.length > 0)
                          .slice(0, 10)
                          .map((r, i) => (
                            <tr key={r.id}>
                              <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                              <td className="py-2 px-3 whitespace-nowrap">{r.date} {r.time}</td>
                              <td className="py-2 px-3 font-semibold text-slate-900">{r.visitorName} ({r.classOrPosition})</td>
                              <td className="py-2 px-3 text-emerald-800 font-semibold">
                                {r.medicinesGiven.map(m => `${m.medicineName} (${m.quantity} ${m.unit})`).join(', ')}
                              </td>
                              <td className="py-2 px-3 text-slate-600">
                                {r.medicinesGiven.map(m => m.dosageNotes || '-').join('; ')}
                              </td>
                              <td className="py-2 px-3 text-slate-700 font-medium">
                                {r.approvedBy || r.handledBy || 'Petugas UKS'}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Single Signature Footer Preview (Koordinator UKS only) */}
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <div className="w-72 p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs">
              <p className="text-slate-600">
                {schoolInfo.city || 'Kota Batu'}, {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
              </p>
              <p className="font-semibold text-slate-800 mt-0.5">
                {koordinatorUks?.role || 'Koordinator UKS'} {schoolInfo.shortName}
              </p>
              <div className="h-16 flex items-center justify-center text-[10px] text-slate-300 italic">
                (Tanda Tangan)
              </div>
              <p className="font-bold text-slate-900">{koordinatorUks?.name || 'Koordinator UKS'}</p>
              <p className="text-[11px] text-slate-500">
                NIP. {koordinatorUks?.nip && koordinatorUks.nip !== '-' ? koordinatorUks.nip : '-'}
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
