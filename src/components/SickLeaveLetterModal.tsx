import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Check, 
  Share2, 
  Building2, 
  FileText,
  ShieldCheck,
  QrCode as QrCodeIcon
} from 'lucide-react';
import { VisitRecord, SchoolInfo, AdminUser } from '../types';
import { 
  formatIndonesianDateFull, 
  exportSickLeaveLetterToPdf 
} from '../utils/pdfHelper';

interface SickLeaveLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: VisitRecord | null;
  schoolInfo?: SchoolInfo;
  koordinator?: AdminUser | null;
}

export const SickLeaveLetterModal: React.FC<SickLeaveLetterModalProps> = ({
  isOpen,
  onClose,
  record,
  schoolInfo,
  koordinator
}) => {
  if (!isOpen || !record) return null;

  const isGoingHome = 
    record.finalStatus === 'Izin Pulang / Dijemput' || 
    record.actionTaken?.toLowerCase().includes('pulang') ||
    record.actionTaken?.toLowerCase().includes('dijemput');

  const badgeText = isGoingHome 
    ? 'SURAT IZIN: PULANG DIJEMPUT (DISETUJUI)' 
    : 'SURAT IZIN: ISTIRAHAT DI UKS (DISETUJUI)';

  const cleanDate = (record.date || '').replace(/[^0-9]/g, '');
  const shortId = (record.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || 'UKS1';
  const schoolCode = (schoolInfo?.shortName || 'SMAN1BATU').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const verificationCode = `VERIF-UKS-${cleanDate || '2026'}-${shortId}-${schoolCode}`;

  const officerName = record.approvedBy || record.handledBy || 'Petugas UKS';
  const coordName = koordinator?.name || 'Koordinator UKS';
  const formattedApprovedDate = formatIndonesianDateFull(record.date, record.time);

  const logoSrc = schoolInfo?.logoUrl || '/logo-sman1-batu.png';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    exportSickLeaveLetterToPdf(record, schoolInfo, koordinator);
  };

  const handleShareWhatsApp = () => {
    const statusText = isGoingHome 
      ? 'diizinkan pulang dijemput orang tua karena kondisi sakit' 
      : 'sedang beristirahat dan dalam penanganan di Ruang UKS';
    
    const text = `*SURAT KETERANGAN SAKIT RESMI - UKS ${schoolInfo?.shortName || 'SMAN 1 BATU'}*\n` +
      `No. Validasi: ${verificationCode}\n\n` +
      `Menerangkan bahwa siswa:\n` +
      `*Nama:* ${record.visitorName.toUpperCase()}\n` +
      `*Kelas:* ${record.classOrPosition}\n` +
      `*Waktu:* ${formattedApprovedDate}\n` +
      `*Keluhan:* ${record.complaint}\n` +
      `*Tindakan UKS:* ${record.actionTaken}\n` +
      `*Status:* ${statusText}\n` +
      `*Disetujui Oleh:* ${officerName} (Petugas UKS)\n\n` +
      `_Surat ini diterbitkan secara digital & sah melalui Sistem Informasi UKS Digital._`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Print-specific style */}
      <style>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-sick-letter, #printable-sick-letter * {
            visibility: visible;
          }
          #printable-sick-letter {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 12mm 15mm !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 12px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none">
        
        {/* Top Control Bar (Screen only, hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold">Surat Keterangan Sakit Digital</h4>
              <p className="text-[10px] text-slate-400">Terbit resmi & tervalidasi 3-tahap</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Cetak Surat (Print)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              title="Unduh Berkas PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Bagikan ke WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-1"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container on screen, fully visible on print */}
        <div className="p-2.5 sm:p-7 max-h-[88vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible">
          
          {/* THE OFFICIAL CERTIFICATE / LETTER (Matches user reference image) */}
          <div 
            id="printable-sick-letter"
            className="bg-white rounded-xl sm:rounded-2xl border-2 border-slate-200 p-3.5 sm:p-7 shadow-xs relative"
          >
            {/* 1. KOP SURAT RESMI */}
            <div className="flex items-center gap-2.5 sm:gap-4 pb-2.5 sm:pb-3 border-b-2 border-slate-900">
              <img 
                src={logoSrc} 
                alt="Logo SMAN 1 Batu" 
                className="w-11 h-11 sm:w-18 sm:h-18 object-contain shrink-0"
                onError={(e) => {
                  // Fallback icon if image cannot be loaded
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex-1 text-center">
                <div className="text-[9px] sm:text-xs font-bold tracking-wider text-slate-700 uppercase leading-tight">
                  {schoolInfo?.governmentHeader || 'PEMERINTAH PROVINSI JAWA TIMUR • DINAS PENDIDIKAN'}
                </div>
                <div className="text-sm sm:text-xl font-black text-slate-900 tracking-tight mt-0.5 leading-tight">
                  {schoolInfo?.name || 'SMAN 1 BATU'}
                </div>
                <div className="text-[11px] sm:text-sm font-bold text-teal-700 tracking-wide mt-0.5">
                  {schoolInfo?.division || 'UNIT KESEHATAN SEKOLAH (UKS)'}
                </div>
                <div className="text-[8px] sm:text-[10px] text-slate-500 mt-0.5 sm:mt-1 leading-snug">
                  {schoolInfo?.address || 'Jl. Ngaglik No. 1, Kota Batu'} • Telp: {schoolInfo?.phone || '(0341) 591310'} • Surel: {schoolInfo?.email || 'uks@sman1batu.sch.id'}
                </div>
              </div>
            </div>
            {/* Secondary thin divider line */}
            <div className="w-full border-b border-slate-400 mt-0.5 mb-3 sm:mb-4"></div>

            {/* 2. PILL BADGE TITLE (CENTERED) */}
            <div className="flex justify-center my-2.5 sm:my-3.5">
              <span className="inline-flex items-center px-3 sm:px-6 py-1 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] sm:text-xs font-black tracking-wide uppercase shadow-xs text-center">
                {badgeText}
              </span>
            </div>

            {/* 3. DETAILS CARD (KARTU DATA SISWA) */}
            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 text-xs sm:text-sm space-y-2 mb-3 sm:mb-4">
              {/* Row 1: Nama Siswa */}
              <div className="flex items-start">
                <span className="w-28 sm:w-40 text-slate-500 font-medium text-[11px] sm:text-xs shrink-0">Nama Siswa</span>
                <span className="text-slate-500 mx-1 shrink-0">:</span>
                <span className="font-black text-slate-900 tracking-wide uppercase text-xs sm:text-sm">
                  {record.visitorName}
                </span>
              </div>

              {/* Row 2: Kelas */}
              <div className="flex items-start">
                <span className="w-28 sm:w-40 text-slate-500 font-medium text-[11px] sm:text-xs shrink-0">Kelas</span>
                <span className="text-slate-500 mx-1 shrink-0">:</span>
                <span className="font-bold text-slate-800 text-xs sm:text-sm">
                  {record.classOrPosition}
                </span>
              </div>

              {/* Row 3: Waktu Disetujui */}
              <div className="flex items-start">
                <span className="w-28 sm:w-40 text-slate-500 font-medium text-[11px] sm:text-xs shrink-0">Waktu Disetujui</span>
                <span className="text-slate-500 mx-1 shrink-0">:</span>
                <span className="font-semibold text-slate-700 text-xs sm:text-sm">
                  {formattedApprovedDate}
                </span>
              </div>

              {/* Row 4: Keluhan / Gejala */}
              <div className="flex items-start">
                <span className="w-28 sm:w-40 text-slate-500 font-medium text-[11px] sm:text-xs shrink-0">Keluhan / Gejala</span>
                <span className="text-slate-500 mx-1 shrink-0">:</span>
                <span className="font-medium text-slate-800 text-xs sm:text-sm">
                  {record.complaint}
                  {(record.temperature || record.bloodPressure) && (
                    <span className="ml-1 text-slate-500 font-normal">
                      ({record.temperature ? `Suhu: ${record.temperature}°C` : ''}
                      {record.temperature && record.bloodPressure ? ', ' : ''}
                      {record.bloodPressure ? `Tensi: ${record.bloodPressure}` : ''})
                    </span>
                  )}
                </span>
              </div>

              {/* Row 5: Riwayat Alergi */}
              <div className="flex items-start">
                <span className="w-28 sm:w-40 text-slate-500 font-medium text-[11px] sm:text-xs shrink-0">Riwayat Alergi Obat</span>
                <span className="text-slate-500 mx-1 shrink-0">:</span>
                <span className={record.hasDrugAllergy ? "font-bold text-rose-700 text-xs sm:text-sm" : "font-normal text-slate-600 text-xs sm:text-sm"}>
                  {record.hasDrugAllergy ? `Ada (${record.drugAllergyDescription || 'Perlu konfirmasi'})` : 'Tidak Ada Riwayat Alergi'}
                </span>
              </div>

              {/* Row 6: Tindakan UKS */}
              <div className="flex items-start">
                <span className="w-28 sm:w-40 text-slate-500 font-medium text-[11px] sm:text-xs shrink-0">Tindakan UKS</span>
                <span className="text-slate-500 mx-1 shrink-0">:</span>
                <span className="font-medium text-slate-800 text-xs sm:text-sm">
                  {record.actionTaken || 'Penanganan pertama di ruang UKS'}
                </span>
              </div>

              {/* Row 7: Terapi Obat */}
              <div className="flex items-start">
                <span className="w-28 sm:w-40 text-slate-500 font-medium text-[11px] sm:text-xs shrink-0">Terapi Obat</span>
                <span className="text-slate-500 mx-1 shrink-0">:</span>
                <span className="font-medium text-slate-800 text-xs sm:text-sm">
                  {record.medicinesGiven.length > 0 ? (
                    record.medicinesGiven.map(m => `${m.medicineName} (${m.quantity} ${m.unit}${m.dosageNotes ? ` - ${m.dosageNotes}` : ''})`).join(', ')
                  ) : (
                    <span className="text-slate-400 italic">Tanpa obat (Istirahat & observasi)</span>
                  )}
                </span>
              </div>

              {/* Row 8: Status Kepulangan */}
              <div className="flex items-start">
                <span className="w-28 sm:w-40 text-slate-500 font-medium text-[11px] sm:text-xs shrink-0">Status Akhir</span>
                <span className="text-slate-500 mx-1 shrink-0">:</span>
                <span className="font-black text-emerald-700 text-xs sm:text-sm">
                  {isGoingHome ? 'Diizinkan Pulang Dijemput Orang Tua' : 'Istirahat di Ruang UKS'}
                </span>
              </div>

              {/* Row 9: Catatan / Anjuran */}
              <div className="flex items-start">
                <span className="w-28 sm:w-40 text-slate-500 font-medium text-[11px] sm:text-xs shrink-0">Keperluan / Alasan</span>
                <span className="text-slate-500 mx-1 shrink-0">:</span>
                <span className="font-medium text-slate-600 italic text-xs sm:text-sm">
                  "{record.notes || (isGoingHome 
                    ? 'Kondisi kesehatan menurun dan perlu istirahat/rawat jalan di rumah.' 
                    : 'Pemulihan kondisi fisik di ruang UKS hingga jam pelajaran berakhir.')}"
                </span>
              </div>
            </div>

            {/* 4. LEMBAR PENGESAHAN HEADER */}
            <div className="relative my-3.5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative">
                <span className="bg-white px-3 text-[10px] sm:text-[11px] font-black tracking-wider text-slate-700 uppercase">
                  LEMBAR PENGESAHAN (PETUGAS UKS)
                </span>
              </div>
            </div>

            {/* 5. 1 APPROVAL BOX (PETUGAS UKS) */}
            <div className="max-w-md mx-auto mb-5">
              <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 text-center shadow-2xs">
                <div className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  PETUGAS PEMERIKSA UKS
                </div>
                <div className="text-[11px] font-bold text-teal-700 mt-1 flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
                  Telah Diverifikasi & Disetujui
                </div>
                <div className="mt-3 pt-2.5 border-t border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-1 px-3 text-xs">
                  <div className="text-slate-600 font-medium">
                    Petugas: <span className="font-black text-slate-900">{officerName}</span>
                  </div>
                  <div className="text-slate-500 font-medium">
                    Waktu: <span className="font-bold text-slate-800">{record.time} WIB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. FOOTER VALIDATION & QR CODE */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
              
              {/* Left: QR Code Badge */}
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-xl border border-slate-300 bg-slate-50 flex items-center justify-center shrink-0">
                  <QrCodeIcon className="w-8 h-8 text-slate-800" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-900 leading-tight">
                    VERIFIKASI UKS DIGITAL
                  </div>
                  <div className="text-[9px] font-extrabold text-teal-700 tracking-wider">
                    DIGITAL VALIDATED
                  </div>
                  <div className="text-[9px] font-mono text-slate-500">
                    {verificationCode}
                  </div>
                </div>
              </div>

              {/* Right: Signature & Verified Stamp */}
              <div className="text-center sm:text-right">
                <div className="text-[10px] text-slate-500 font-medium">Petugas UKS</div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 my-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  VERIFIED
                </div>
                <div className="text-xs font-black text-slate-900 underline underline-offset-2">
                  {officerName}
                </div>
                <div className="text-[9px] text-slate-400">
                  Unit Kesehatan Sekolah (UKS)
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="no-print bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>Kode Surat:</span>
            <code className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">{verificationCode}</code>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak Surat
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

