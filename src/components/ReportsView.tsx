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
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Edit3,
  UserCheck,
  X,
  Save
} from 'lucide-react';
import { useUks } from '../context/UksContext';
import { exportMonthlyReportToExcel } from '../utils/excelHelper';
import { exportMonthlyReportToPdf, printMonthlyReport } from '../utils/pdfHelper';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const ReportsView: React.FC = () => {
  const { records, medicines, schoolInfo, koordinatorUks, updateSchoolInfo, showToast } = useUks();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0 - 11
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  // Principal Edit Modal State
  const [isPrincipalModalOpen, setIsPrincipalModalOpen] = useState(false);
  const [principalName, setPrincipalName] = useState(schoolInfo.schoolPrincipal || '');
  const [principalNip, setPrincipalNip] = useState(schoolInfo.schoolPrincipalNip || '');

  const openPrincipalModal = () => {
    setPrincipalName(schoolInfo.schoolPrincipal || '');
    setPrincipalNip(schoolInfo.schoolPrincipalNip || '');
    setIsPrincipalModalOpen(true);
  };

  const handleSavePrincipal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!principalName.trim()) {
      showToast('Nama Kepala Sekolah tidak boleh kosong.', 'error');
      return;
    }
    updateSchoolInfo({
      schoolPrincipal: principalName.trim(),
      schoolPrincipalNip: principalNip.trim() || '-'
    });
    showToast('Data Kepala Sekolah berhasil diperbarui!', 'success');
    setIsPrincipalModalOpen(false);
  };

  const monthName = MONTH_NAMES[selectedMonth];

  // Filter records for selected month & year (only approved visits)
  const monthlyRecords = useMemo(() => {
    return records.filter(r => {
      const isApproved = r.approvalStatus === 'approved' || !r.approvalStatus;
      if (!isApproved) return false;
      const d = new Date(r.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [records, selectedMonth, selectedYear]);

  // Statistics for selected month
  const monthlyStats = useMemo(() => {
    const totalVisits = monthlyRecords.length;
    const siswaCount = monthlyRecords.filter(r => r.role === 'siswa').length;
    const guruCount = monthlyRecords.filter(r => r.role !== 'siswa').length;
    const totalMedDoses = monthlyRecords.reduce((acc, r) => 
      acc + r.medicinesGiven.reduce((sub, m) => sub + m.quantity, 0), 0
    );

    // Group complaints
    const complaintsMap: Record<string, number> = {};
    monthlyRecords.forEach(r => {
      const main = r.complaint.split(',')[0].trim();
      complaintsMap[main] = (complaintsMap[main] || 0) + 1;
    });
    const topComplaints = Object.entries(complaintsMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return {
      totalVisits,
      siswaCount,
      guruCount,
      totalMedDoses,
      topComplaints
    };
  }, [monthlyRecords]);

  // Print & Export handlers
  const handlePrintReport = () => {
    printMonthlyReport(monthName, selectedYear, monthlyRecords, medicines, schoolInfo, koordinatorUks);
  };

  const handleExportPdf = () => {
    exportMonthlyReportToPdf(monthName, selectedYear, monthlyRecords, medicines, schoolInfo, koordinatorUks);
  };

  const handleExportExcel = () => {
    exportMonthlyReportToExcel(monthName, selectedYear, monthlyRecords, medicines, schoolInfo);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Laporan & Arsip Bulanan UKS
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Format Resmi {schoolInfo.shortName}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Cetak rekapitulasi dokumen resmi UKS ber-kop surat atau ekspor data ke format Excel (.xlsx).
          </p>
        </div>

        {/* Month and Year Filter Selector */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <Calendar className="w-4 h-4 text-emerald-600 ml-1 shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
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
            className="bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
          >
            {[2024, 2025, 2026, 2027].map(yr => (
              <option key={yr} value={yr}>
                Tahun {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Print Report Card */}
        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
              <Printer className="w-5 h-5 text-emerald-300" />
            </div>
            <h3 className="text-lg font-bold tracking-tight">
              Cetak Laporan UKS
            </h3>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-sm">
              Cetak dokumen laporan resmi ber-kop surat {schoolInfo.name || schoolInfo.shortName}, nomor arsip, ringkasan statistik, tabel kunjungan, sisa stok, dan kolom tanda tangan {koordinatorUks?.role || 'Koordinator UKS'} & Kepala Sekolah.
            </p>
          </div>

          <div className="pt-6">
            <button
              type="button"
              id="btn-print-report"
              onClick={handlePrintReport}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              Cetak Laporan ({monthName} {selectedYear})
            </button>
          </div>
        </div>

        {/* Excel Export Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5 text-teal-300" />
            </div>
            <h3 className="text-lg font-bold tracking-tight">
              Ekspor Buku Rekap ke Excel (.xlsx)
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm">
              File Excel multi-sheet terstruktur lengkap dengan Sheet 1 (Rekap Kunjungan Pasien) dan Sheet 2 (Daftar Persediaan & Sisa Stok Obat). Cocok untuk arsip digital dan pelaporan dinas.
            </p>
          </div>

          <div className="pt-6">
            <button
              type="button"
              id="btn-export-excel"
              onClick={handleExportExcel}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              Unduh File Excel ({monthName} {selectedYear})
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI for Selected Month */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Kunjungan Bulan Ini
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {monthlyStats.totalVisits} <span className="text-xs font-normal text-slate-500">pasien</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Pengunjung Siswa
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {monthlyStats.siswaCount} <span className="text-xs font-normal text-slate-500">siswa</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Pengunjung Guru/Staf
          </span>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">
            {monthlyStats.guruCount} <span className="text-xs font-normal text-slate-500">orang</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Obat Diberikan
          </span>
          <div className="text-2xl font-extrabold text-teal-700 mt-1">
            {monthlyStats.totalMedDoses} <span className="text-xs font-normal text-slate-500">dosis</span>
          </div>
        </div>
      </div>

      {/* Action Bar: Ubah Kepala Sekolah (Tepat di bawah ringkasan statistik) */}
      <div className="bg-white rounded-2xl p-4 sm:px-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Pejabat Penandatangan Laporan (Kepala Sekolah)
            </div>
            <div className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-2 mt-0.5">
              <span>{schoolInfo.schoolPrincipal || 'Belum diatur'}</span>
              <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                NIP: {schoolInfo.schoolPrincipalNip && schoolInfo.schoolPrincipalNip !== '-' ? schoolInfo.schoolPrincipalNip : '-'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          id="btn-ubah-kepala-sekolah"
          onClick={openPrincipalModal}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition cursor-pointer shrink-0"
        >
          <Edit3 className="w-4 h-4" />
          Ubah Nama / NIP Kepala Sekolah
        </button>
      </div>

      {/* Official Letterhead Preview Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pratinjau Dokumen Laporan UKS {schoolInfo.shortName} — Periode {monthName} {selectedYear}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500">
              {monthlyRecords.length} kunjungan terdata
            </span>
            <button
              type="button"
              id="btn-print-preview-header"
              onClick={handlePrintReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Laporan
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6 text-slate-800 font-sans">
          {/* Header Kop Surat */}
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
              Rekapitulasi Pelayanan Pasien & Pemakaian Obat UKS
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Periode Bulan: <strong>{monthName} {selectedYear}</strong>
            </p>
          </div>

          {/* Preview Table: Visits */}
          <div>
            <div className="text-xs font-bold text-slate-800 mb-2">
              A. Daftar Kunjungan Siswa dan Guru ({monthlyRecords.length} data):
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Tgl/Waktu</th>
                    <th className="py-2.5 px-3">Nama Pengunjung</th>
                    <th className="py-2.5 px-3">Kelas/Jabatan</th>
                    <th className="py-2.5 px-3">Keluhan</th>
                    <th className="py-2.5 px-3">Obat Diberikan</th>
                    <th className="py-2.5 px-3">Petugas</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {monthlyRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        Belum ada data kunjungan yang tercatat pada bulan {monthName} {selectedYear}.
                      </td>
                    </tr>
                  ) : (
                    monthlyRecords.slice(0, 10).map((r, i) => (
                      <tr key={r.id}>
                        <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                        <td className="py-2 px-3 whitespace-nowrap">{r.date} {r.time}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{r.visitorName}</td>
                        <td className="py-2 px-3">{r.classOrPosition}</td>
                        <td className="py-2 px-3 max-w-xs truncate">{r.complaint}</td>
                        <td className="py-2 px-3 text-emerald-700 font-medium">
                          {r.medicinesGiven.length > 0 
                            ? r.medicinesGiven.map(m => `${m.medicineName} (${m.quantity})`).join(', ')
                            : '-'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-emerald-800">{r.approvedBy || r.handledBy || 'Petugas UKS'}</td>
                        <td className="py-2 px-3 font-medium">{r.finalStatus}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {monthlyRecords.length > 10 && (
                <div className="py-2 px-3 bg-slate-50 text-slate-500 text-[11px] text-center border-t border-slate-200">
                  ... dan {monthlyRecords.length - 10} data lainnya termuat di file unduhan PDF & Excel.
                </div>
              )}
            </div>
          </div>

          {/* Signatures Footer Preview */}
          <div className="pt-6 border-t border-slate-100">
            <div className="grid grid-cols-2 text-center text-xs">
              <div className="p-4 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-600">Mengetahui,</p>
                <p className="font-semibold text-slate-800">Kepala {schoolInfo.name || schoolInfo.shortName}</p>
                <div className="h-16 flex items-center justify-center text-[10px] text-slate-300 italic">
                  (Tanda Tangan & Stempel)
                </div>
                <p className="font-bold text-slate-900">{schoolInfo.schoolPrincipal || 'Kepala Sekolah'}</p>
                <p className="text-[11px] text-slate-500">NIP. {schoolInfo.schoolPrincipalNip || '-'}</p>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-600">{schoolInfo.city || 'Kota Batu'}, akhir {monthName} {selectedYear}</p>
                <p className="font-semibold text-slate-800">{koordinatorUks?.role || 'Koordinator UKS'} {schoolInfo.shortName}</p>
                <div className="h-16 flex items-center justify-center text-[10px] text-slate-300 italic">
                  (Tanda Tangan)
                </div>
                <p className="font-bold text-slate-900">{koordinatorUks?.name || 'Koordinator UKS'}</p>
                <p className="text-[11px] text-slate-500">NIP. {koordinatorUks?.nip && koordinatorUks.nip !== '-' ? koordinatorUks.nip : '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ubah Data Kepala Sekolah */}
      {isPrincipalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Ubah Data Kepala Sekolah</h3>
                  <p className="text-[11px] text-emerald-100">Penandatangan resmi untuk laporan PDF & arsip</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPrincipalModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrincipal} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Nama Lengkap Kepala Sekolah beserta Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  placeholder="Contoh : Drs. H. Supratikno, M.Pd"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={principalNip}
                  onChange={(e) => setPrincipalNip(e.target.value)}
                  placeholder="Contoh : 19680512 199403 1 004"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
                />
                <span className="text-[10px] text-slate-400">Isi tanda strip (-) jika belum memiliki NIP.</span>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  Perubahan nama dan NIP Kepala Sekolah akan <strong>langsung diterapkan otomatis</strong> ke seluruh dokumen laporan cetak PDF tanpa perlu mengubah baris koding.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPrincipalModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
