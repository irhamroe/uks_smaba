import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Users, 
  Pill, 
  Sparkles,
  ClipboardList,
  AlertTriangle,
  Clock,
  CalendarRange,
  Building2,
  CheckCircle2
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

interface ReportsViewProps {
  type?: 'visits' | 'medicines';
}

export const ReportsView: React.FC<ReportsViewProps> = ({ type = 'visits' }) => {
  const { records, medicines, schoolInfo, koordinatorUks } = useUks();

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
    if (!startDate && !endDate) return 'Semua Waktu';
    if (startDate && !endDate) {
      return `Mulai ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(startDate))}`;
    }
    if (!startDate && endDate) {
      return `Sampai ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(endDate))}`;
    }
    if (startDate === endDate) {
      return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(startDate));
    }
    const s = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(startDate));
    const e = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(endDate));
    return `${s} s/d ${e}`;
  }, [startDate, endDate]);

  // Filter approved records according to selected date range
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const isApproved = r.approvalStatus === 'approved' || !r.approvalStatus;
      if (!isApproved) return false;

      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;
      return true;
    });
  }, [records, startDate, endDate]);

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
    if (type === 'visits') {
      printVisitsReport(periodLabel, filteredRecords, schoolInfo, koordinatorUks);
    } else {
      printMedicineUsageReport(periodLabel, filteredRecords, medicines, schoolInfo, koordinatorUks);
    }
  };

  const handleExportPdf = () => {
    if (type === 'visits') {
      exportVisitsReportToPdf(periodLabel, filteredRecords, schoolInfo, koordinatorUks);
    } else {
      exportMedicineUsageReportToPdf(periodLabel, filteredRecords, medicines, schoolInfo, koordinatorUks);
    }
  };

  const handleExportExcel = () => {
    if (type === 'visits') {
      exportVisitsReportToExcel(periodLabel, filteredRecords, schoolInfo);
    } else {
      exportMedicineUsageReportToExcel(periodLabel, filteredRecords, medicines, schoolInfo);
    }
  };

  const isVisitReport = type === 'visits';

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              {isVisitReport ? 'Submenu Laporan Rekap Pengunjung' : 'Submenu Laporan Rekap Penggunaan Obat'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {isVisitReport 
                ? `Laporan Rekap Kunjungan UKS ${schoolInfo.shortName}` 
                : `Laporan Rekap Penggunaan & Stok Obat UKS ${schoolInfo.shortName}`}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
              {isVisitReport
                ? 'Rekapitulasi resmi kunjungan pasien UKS ber-kop surat resmi, keluhan, tindakan, alergi obat, dan petugas pemeriksa.'
                : 'Rekapitulasi resmi pemakaian persediaan farmasi UKS, sisa stok obat, dan rincian penerima obat.'}
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

      {/* FILTER CONTROLS CARD (Hanya Tanggal Awal & Tanggal Akhir) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
              <CalendarRange className="w-4 h-4 text-emerald-600" />
              <span>Pilihan Rentang Tanggal:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="input-start-date" className="text-xs font-semibold text-slate-600 shrink-0">
                  Tanggal Awal:
                </label>
                <input
                  id="input-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="input-end-date" className="text-xs font-semibold text-slate-600 shrink-0">
                  Tanggal Akhir:
                </label>
                <input
                  id="input-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          <div className="text-left md:text-right pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <span className="text-[11px] text-slate-400 block font-medium">Periode Terpilih:</span>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg inline-block mt-0.5">
              {periodLabel}
            </span>
          </div>

        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      {isVisitReport ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-slate-400 text-xs font-bold flex items-center justify-between">
              Total Pasien
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {visitStats.totalVisits}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {visitStats.siswaCount} Siswa • {visitStats.guruCount} Guru/Staf
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-slate-400 text-xs font-bold flex items-center justify-between">
              Diberi Obat
              <Pill className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-800 mt-1">
              {visitStats.withMedsCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Pasien menerima obat UKS
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-slate-400 text-xs font-bold flex items-center justify-between">
              Istirahat UKS
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-800 mt-1">
              {visitStats.restingCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Perawatan di ruang UKS
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-slate-400 text-xs font-bold flex items-center justify-between">
              Alergi Obat
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {visitStats.allergyCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Pasien memiliki riwayat alergi
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-slate-400 text-xs font-bold flex items-center justify-between">
              Dosis Obat Terpakai
              <Pill className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {medicineStats.totalDosesGiven}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Total kuantitas obat periode ini
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-slate-400 text-xs font-bold flex items-center justify-between">
              Jenis Obat Terpakai
              <ClipboardList className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-800 mt-1">
              {medicineStats.distinctMedsUsed}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Variasi obat yang dikonsumsi
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-slate-400 text-xs font-bold flex items-center justify-between">
              Stok Kritis / Menipis
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {medicineStats.criticalStockCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Perlu segera restock
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-slate-400 text-xs font-bold flex items-center justify-between">
              Stok Habis (Kosong)
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-black text-red-700 mt-1">
              {medicineStats.outOfStockCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Obat tidak tersedia
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PAPER PREVIEW (Ber-Kop Surat Resmi & 1 Tanda Tangan Koordinator UKS) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Paper Header Toolbar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Pratinjau Dokumen Cetak Laporan Resmi ({periodLabel})
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Total data tercatat:</span>
            <span className="font-bold text-slate-900 bg-slate-200/80 px-2 py-0.5 rounded-md">
              {isVisitReport ? `${filteredRecords.length} Kunjungan` : `${medicineStats.usagePerMedicine.length} Jenis Obat`}
            </span>
          </div>
        </div>

        {/* Paper Body */}
        <div className="p-6 sm:p-10 space-y-6 max-w-5xl mx-auto font-sans">
          
          {/* KOP SURAT RESMI */}
          <div className="border-b-2 border-slate-900 pb-4 text-center relative">
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <img 
                src="/logo-sman1-batu.png" 
                alt="Logo Sekolah" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0" 
              />
              <div className="text-center">
                <div className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-slate-700">
                  {schoolInfo.governmentHeader || 'PEMERINTAH PROVINSI JAWA TIMUR DINAS PENDIDIKAN'}
                </div>
                <div className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase">
                  {schoolInfo.name || 'SEKOLAH MENENGAH ATAS NEGERI 1 BATU'}
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-emerald-800 uppercase tracking-wide">
                  UNIT KESEHATAN SEKOLAH (UKS) {schoolInfo.shortName}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5">
                  {schoolInfo.address} • Telp: {schoolInfo.phone} • Email: {schoolInfo.email}
                </div>
              </div>
            </div>
          </div>

          {/* DOCUMENT TITLE */}
          <div className="text-center space-y-1">
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide underline underline-offset-4">
              {isVisitReport 
                ? 'LAPORAN REKAPITULASI DAFTAR KUNJUNGAN PASIEN UKS' 
                : 'LAPORAN REKAPITULASI PENGGUNAAN & STOK OBAT UKS'}
            </h3>
            <p className="text-xs font-semibold text-slate-600">
              Periode: <span className="text-slate-900 font-bold">{periodLabel}</span>
            </p>
          </div>

          {/* TABLE PREVIEW */}
          {isVisitReport ? (
            /* Table 1: Rekap Kunjungan */
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Nama Pasien</th>
                    <th className="py-2.5 px-3">Kelas/Jabatan</th>
                    <th className="py-2.5 px-3">Keluhan</th>
                    <th className="py-2.5 px-3">Alergi Obat</th>
                    <th className="py-2.5 px-3">Obat / Tindakan</th>
                    <th className="py-2.5 px-3">Petugas</th>
                    <th className="py-2.5 px-3">Status Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        Tidak ada catatan kunjungan pada rentang tanggal terpilih.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.slice(0, 15).map((r, i) => (
                      <tr key={r.id} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                        <td className="py-2 px-3 whitespace-nowrap text-slate-600">
                          {r.date} {r.time}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{r.visitorName}</td>
                        <td className="py-2 px-3 text-slate-600">{r.classOrPosition}</td>
                        <td className="py-2 px-3 text-slate-800">{r.complaint}</td>
                        <td className="py-2 px-3">
                          {r.hasDrugAllergy ? (
                            <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded text-[10px]">
                              {r.drugAllergyDescription || 'Ada Alergi'}
                            </span>
                          ) : (
                            <span className="text-slate-400">Tidak Ada</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {r.needsMedicine && r.medicinesGiven.length > 0 
                            ? r.medicinesGiven.map(m => `${m.medicineName} (${m.quantity} ${m.unit})`).join(', ')
                            : r.actionTaken || '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {r.approvedBy || r.handledBy || 'Petugas UKS'}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {r.finalStatus || 'Kembali ke Kelas'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {filteredRecords.length > 15 && (
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-medium">
                  Menampilkan 15 dari total {filteredRecords.length} data kunjungan. Gunakan <b>Cetak Dokumen</b> atau <b>Unduh PDF / Excel</b> untuk melihat seluruh data lengkap.
                </div>
              )}
            </div>
          ) : (
            /* Table 2: Rekapitulasi Penggunaan Obat & Stok */
            <div className="space-y-6">
              
              {/* Rekap Stok & Terpakai */}
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
                            Tidak ada pemberian obat pada rentang tanggal ini.
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
