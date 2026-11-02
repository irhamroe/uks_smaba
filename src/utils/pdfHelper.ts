import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Medicine, VisitRecord, SchoolInfo, AdminUser } from '../types';
import { SCHOOL_INFO as DEFAULT_SCHOOL_INFO } from '../data/initialData';

// Helper to draw official letterhead (Kop Surat)
function drawLetterhead(doc: jsPDF, school: SchoolInfo, pageWidth: number): number {
  if (school.logoUrl) {
    try {
      doc.addImage(school.logoUrl, 'PNG', 14, 12, 20, 20);
    } catch (e) {
      console.warn('Could not render logo in PDF:', e);
    }
  }

  // 1. Kop Surat Resmi
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(school.governmentHeader || 'PEMERINTAH PROVINSI • DINAS PENDIDIKAN', pageWidth / 2, 14, { align: 'center' });
  
  doc.setFontSize(12.5);
  doc.setTextColor(15, 23, 42);
  doc.text(school.name || 'SEKOLAH MENENGAH ATAS NEGERI 1 BATU', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10.5);
  doc.setTextColor(16, 149, 120); // Emerald brand tone
  doc.text(school.division || 'UNIT KESEHATAN SEKOLAH (UKS)', pageWidth / 2, 26, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(school.address || '', pageWidth / 2, 32, { align: 'center' });
  
  const contactText = [
    school.phone ? `Telepon: ${school.phone}` : '',
    school.email ? `Surel: ${school.email}` : ''
  ].filter(Boolean).join(' | ');
  if (contactText) {
    doc.text(contactText, pageWidth / 2, 36, { align: 'center' });
  }

  // Double Divider line
  const dividerY = contactText ? 39 : 36;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.8);
  doc.line(14, dividerY, pageWidth - 14, dividerY);
  doc.setLineWidth(0.2);
  doc.line(14, dividerY + 1, pageWidth - 14, dividerY + 1);

  return dividerY + 3;
}

// Helper to draw single official signature (Koordinator UKS only)
function drawKoordinatorSignature(
  doc: jsPDF,
  startY: number,
  pageWidth: number,
  school: SchoolInfo,
  koordinator?: AdminUser | null
): void {
  let signY = startY + 10;
  if (signY > 245) {
    doc.addPage();
    signY = 25;
  }

  const currentDateStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const user = koordinator || {
    name: 'Koordinator UKS',
    nip: '-',
    role: 'Koordinator UKS'
  };

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const city = school.city || 'Kota Batu';
  doc.text(`${city}, ${currentDateStr}`, pageWidth - 70, signY);
  doc.text(`${user.role || 'Koordinator UKS'},`, pageWidth - 70, signY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(user.name || 'Koordinator UKS', pageWidth - 70, signY + 26);
  doc.setFont('helvetica', 'normal');
  doc.text(user.nip && user.nip !== '-' ? `NIP. ${user.nip}` : 'NIP. -', pageWidth - 70, signY + 30);
}

// =========================================================================
// 1. LAPORAN REKAP DAFTAR KUNJUNGAN
// =========================================================================
export function generateVisitsReportPdfDoc(
  periodLabel: string,
  visits: VisitRecord[],
  customSchoolInfo?: SchoolInfo,
  customKoordinator?: AdminUser | null
): jsPDF {
  const school = customSchoolInfo || DEFAULT_SCHOOL_INFO;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth();

  const headerEndY = drawLetterhead(doc, school, pageWidth);

  // Judul Laporan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN REKAPITULASI DAFTAR KUNJUNGAN PASIEN UKS', pageWidth / 2, headerEndY + 6, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Periode: ${periodLabel}`, pageWidth / 2, headerEndY + 11, { align: 'center' });

  // Stats Box
  const totalVisits = visits.length;
  const siswaVisits = visits.filter(v => v.role === 'siswa').length;
  const guruVisits = visits.filter(v => v.role !== 'siswa').length;
  const withMeds = visits.filter(v => v.needsMedicine && v.medicinesGiven.length > 0).length;
  const restInUks = visits.filter(v => v.finalStatus === 'Istirahat di UKS' || v.finalStatus === 'Sedang Istirahat di UKS').length;

  const statsBoxY = headerEndY + 15;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, statsBoxY, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Kunjungan: ${totalVisits} orang`, 18, statsBoxY + 5.5);
  doc.text(`Siswa: ${siswaVisits} | Guru/Staf: ${guruVisits}`, 18, statsBoxY + 10.5);

  doc.text(`Diberikan Obat: ${withMeds} orang`, 110, statsBoxY + 5.5);
  doc.text(`Istirahat di UKS: ${restInUks} orang`, 110, statsBoxY + 10.5);

  // Table Kunjungan
  const visitRows = visits.map((v, i) => [
    (i + 1).toString(),
    `${v.date}\n${v.time}`,
    `${v.visitorName}\n(${v.classOrPosition}) [${v.gender}]`,
    v.hasDrugAllergy ? `ADA ALERGI:\n${v.drugAllergyDescription || 'Ya'}` : 'Tidak Ada',
    v.complaint,
    v.actionTaken || '-',
    v.medicinesGiven.length > 0
      ? v.medicinesGiven.map(m => `${m.medicineName} (${m.quantity} ${m.unit})`).join('\n')
      : 'Tanpa obat',
    v.finalStatus
  ]);

  autoTable(doc, {
    startY: statsBoxY + 18,
    head: [['No', 'Tgl / Jam', 'Nama & Kelas', 'Alergi Obat', 'Keluhan / Gejala', 'Tindakan UKS', 'Obat Diberikan', 'Status Akhir']],
    body: visitRows.length > 0 ? visitRows : [['-', '-', 'Belum ada data kunjungan pada periode ini', '-', '-', '-', '-', '-']],
    theme: 'grid',
    styles: {
      lineColor: [71, 85, 105],
      lineWidth: 0.25,
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2
    },
    headStyles: {
      fillColor: [16, 149, 120], // Teal/Emerald
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineColor: [15, 23, 42],
      lineWidth: 0.35
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      valign: 'top',
      cellPadding: 2,
      lineColor: [100, 116, 139],
      lineWidth: 0.25
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
      lineColor: [100, 116, 139],
      lineWidth: 0.25
    },
    tableLineWidth: 0.35,
    tableLineColor: [30, 41, 59],
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 20 },
      2: { cellWidth: 32, fontStyle: 'bold' },
      3: { cellWidth: 22 },
      4: { cellWidth: 30 },
      5: { cellWidth: 26 },
      6: { cellWidth: 25 },
      7: { cellWidth: 20 }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  drawKoordinatorSignature(doc, finalY, pageWidth, school, customKoordinator);

  return doc;
}

export function exportVisitsReportToPdf(
  periodLabel: string,
  visits: VisitRecord[],
  customSchoolInfo?: SchoolInfo,
  customKoordinator?: AdminUser | null
): void {
  const school = customSchoolInfo || DEFAULT_SCHOOL_INFO;
  const doc = generateVisitsReportPdfDoc(periodLabel, visits, customSchoolInfo, customKoordinator);
  const safeFilename = (school.shortName || 'UKS').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safePeriod = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Laporan_Kunjungan_UKS_${safeFilename}_${safePeriod}.pdf`);
}

export function printVisitsReport(
  periodLabel: string,
  visits: VisitRecord[],
  customSchoolInfo?: SchoolInfo,
  customKoordinator?: AdminUser | null
): void {
  const school = customSchoolInfo || DEFAULT_SCHOOL_INFO;
  const doc = generateVisitsReportPdfDoc(periodLabel, visits, customSchoolInfo, customKoordinator);
  doc.autoPrint();
  const blobUrl = doc.output('bloburl');
  const printWindow = window.open(blobUrl, '_blank');
  if (!printWindow) {
    const safeFilename = (school.shortName || 'UKS').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safePeriod = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Laporan_Kunjungan_UKS_${safeFilename}_${safePeriod}.pdf`);
  }
}

// =========================================================================
// 2. LAPORAN REKAP PENGGUNAAN & STOK OBAT
// =========================================================================
export function generateMedicineUsageReportPdfDoc(
  periodLabel: string,
  visits: VisitRecord[],
  medicines: Medicine[],
  customSchoolInfo?: SchoolInfo,
  customKoordinator?: AdminUser | null
): jsPDF {
  const school = customSchoolInfo || DEFAULT_SCHOOL_INFO;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth();

  const headerEndY = drawLetterhead(doc, school, pageWidth);

  // Judul Laporan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN REKAPITULASI PENGGUNAAN & STOK OBAT UKS', pageWidth / 2, headerEndY + 6, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Periode: ${periodLabel}`, pageWidth / 2, headerEndY + 11, { align: 'center' });

  // Stats Box
  const totalDosesGiven = visits.reduce((acc, v) => 
    acc + v.medicinesGiven.reduce((sub, m) => sub + m.quantity, 0), 0
  );
  const distinctMedsUsed = new Set(
    visits.flatMap(v => v.medicinesGiven.map(m => m.medicineName.toLowerCase()))
  ).size;
  const criticalStockCount = medicines.filter(m => m.stock <= m.minStock).length;
  const totalMedTypes = medicines.length;

  const statsBoxY = headerEndY + 15;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, statsBoxY, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Dosis Diberikan: ${totalDosesGiven} unit`, 18, statsBoxY + 5.5);
  doc.text(`Jenis Obat Digunakan: ${distinctMedsUsed} macam`, 18, statsBoxY + 10.5);

  doc.text(`Total Stok Obat di UKS: ${totalMedTypes} item`, 110, statsBoxY + 5.5);
  doc.text(`Obat Kritis / Menipis: ${criticalStockCount} item`, 110, statsBoxY + 10.5);

  // Table Rekap Obat
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('A. Rekapitulasi Pemakaian & Sisa Persediaan Obat', 14, statsBoxY + 20);

  const medRows = medicines.map((m, i) => {
    const totalUsed = visits.reduce((acc, v) => {
      const found = v.medicinesGiven.find(item => 
        item.medicineId === m.id || item.medicineName.toLowerCase() === m.name.toLowerCase()
      );
      return acc + (found ? found.quantity : 0);
    }, 0);

    const isLow = m.stock <= m.minStock;
    const isOut = m.stock === 0;
    const statusText = isOut ? 'HABIS' : isLow ? 'MENIPIS' : 'AMAN';

    return [
      (i + 1).toString(),
      m.name,
      m.category,
      m.unit,
      `${totalUsed} ${m.unit}`,
      `${m.stock} ${m.unit}`,
      `${m.minStock} ${m.unit}`,
      statusText,
      m.expiryDate || '-'
    ];
  });

  autoTable(doc, {
    startY: statsBoxY + 23,
    head: [['No', 'Nama Obat', 'Kategori', 'Satuan', 'Terpakai Periode Ini', 'Sisa Stok', 'Batas Min', 'Status', 'Kedaluwarsa']],
    body: medRows.length > 0 ? medRows : [['-', '-', '-', '-', '-', '-', '-', '-', '-']],
    theme: 'grid',
    styles: {
      lineColor: [71, 85, 105],
      lineWidth: 0.25,
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2
    },
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineColor: [15, 23, 42],
      lineWidth: 0.35
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      valign: 'middle',
      cellPadding: 2,
      lineColor: [100, 116, 139],
      lineWidth: 0.25
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
      lineColor: [100, 116, 139],
      lineWidth: 0.25
    },
    tableLineWidth: 0.35,
    tableLineColor: [30, 41, 59],
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 38, fontStyle: 'bold' },
      2: { cellWidth: 28 },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 16, halign: 'center' },
      7: { cellWidth: 16, halign: 'center' },
      8: { cellWidth: 17, halign: 'center' }
    },
    margin: { left: 14, right: 14 }
  });

  let afterMedTableY = (doc as any).lastAutoTable?.finalY || 160;

  // Table 2: Rincian Pasien Penerima Obat pada Periode Ini
  const patientsWithMeds = visits.filter(v => v.needsMedicine && v.medicinesGiven.length > 0);
  if (patientsWithMeds.length > 0) {
    let table2StartY = afterMedTableY + 8;
    if (table2StartY > 220) {
      doc.addPage();
      table2StartY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('B. Rincian Distribusi Obat kepada Pasien / Pengunjung', 14, table2StartY);

    const distRows = patientsWithMeds.map((v, i) => [
      (i + 1).toString(),
      `${v.date} ${v.time}`,
      `${v.visitorName} (${v.classOrPosition})`,
      v.complaint,
      v.medicinesGiven.map(m => `${m.medicineName}: ${m.quantity} ${m.unit} ${m.dosageNotes ? `(${m.dosageNotes})` : ''}`).join('\n'),
      v.approvedBy || v.handledBy || 'Petugas UKS'
    ]);

    autoTable(doc, {
      startY: table2StartY + 3,
      head: [['No', 'Tgl / Jam', 'Nama Pasien & Kelas', 'Keluhan', 'Obat & Aturan Pakai', 'Petugas']],
      body: distRows,
      theme: 'grid',
      styles: {
        lineColor: [71, 85, 105],
        lineWidth: 0.25,
        fontSize: 7,
        textColor: [30, 41, 59],
        cellPadding: 2
      },
      headStyles: {
        fillColor: [16, 149, 120], // Teal/Emerald
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        lineColor: [15, 23, 42],
        lineWidth: 0.35
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59],
        valign: 'top',
        cellPadding: 2,
        lineColor: [100, 116, 139],
        lineWidth: 0.25
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
        lineColor: [100, 116, 139],
        lineWidth: 0.25
      },
      tableLineWidth: 0.35,
      tableLineColor: [30, 41, 59],
      columnStyles: {
        0: { cellWidth: 7, halign: 'center' },
        1: { cellWidth: 22 },
        2: { cellWidth: 38, fontStyle: 'bold' },
        3: { cellWidth: 35 },
        4: { cellWidth: 50 },
        5: { cellWidth: 30 }
      },
      margin: { left: 14, right: 14 }
    });

    afterMedTableY = (doc as any).lastAutoTable?.finalY || afterMedTableY;
  }

  drawKoordinatorSignature(doc, afterMedTableY, pageWidth, school, customKoordinator);

  return doc;
}

export function exportMedicineUsageReportToPdf(
  periodLabel: string,
  visits: VisitRecord[],
  medicines: Medicine[],
  customSchoolInfo?: SchoolInfo,
  customKoordinator?: AdminUser | null
): void {
  const school = customSchoolInfo || DEFAULT_SCHOOL_INFO;
  const doc = generateMedicineUsageReportPdfDoc(periodLabel, visits, medicines, customSchoolInfo, customKoordinator);
  const safeFilename = (school.shortName || 'UKS').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safePeriod = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Laporan_Penggunaan_Obat_UKS_${safeFilename}_${safePeriod}.pdf`);
}

export function printMedicineUsageReport(
  periodLabel: string,
  visits: VisitRecord[],
  medicines: Medicine[],
  customSchoolInfo?: SchoolInfo,
  customKoordinator?: AdminUser | null
): void {
  const school = customSchoolInfo || DEFAULT_SCHOOL_INFO;
  const doc = generateMedicineUsageReportPdfDoc(periodLabel, visits, medicines, customSchoolInfo, customKoordinator);
  doc.autoPrint();
  const blobUrl = doc.output('bloburl');
  const printWindow = window.open(blobUrl, '_blank');
  if (!printWindow) {
    const safeFilename = (school.shortName || 'UKS').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safePeriod = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Laporan_Penggunaan_Obat_UKS_${safeFilename}_${safePeriod}.pdf`);
  }
}

// =========================================================================
// 3. SURAT KETERANGAN SAKIT DIGITAL RESMI (ISTIRAHAT DI UKS / IZIN PULANG)
// =========================================================================

export function formatIndonesianDateFull(dateStr: string, timeStr?: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const dateText = `${day} ${monthNames[month]} ${year}`;
      return timeStr ? `${dateText}, Pukul ${timeStr} WIB` : dateText;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function isEligibleForSickLetter(record?: VisitRecord | null): boolean {
  if (!record) return false;
  if (record.role !== 'siswa') return false;

  const isApproved = record.approvalStatus === 'approved' || (!record.approvalStatus && Boolean(record.approvedBy));
  if (!isApproved) return false;

  const status = record.finalStatus;
  const action = record.actionTaken?.toLowerCase() || '';

  const isResting = status === 'Istirahat di UKS' ||
                    status === 'Sedang Istirahat di UKS' ||
                    action.includes('istirahat di uks');

  const isGoingHome = status === 'Izin Pulang / Dijemput' ||
                      action.includes('pulang') ||
                      action.includes('dijemput');

  return isResting || isGoingHome;
}

export function generateSickLeaveLetterPdfDoc(
  record: VisitRecord,
  customSchoolInfo?: SchoolInfo,
  customKoordinator?: AdminUser | null
): jsPDF {
  const school = customSchoolInfo || DEFAULT_SCHOOL_INFO;
  const koordinator = customKoordinator || {
    name: 'Koordinator UKS',
    nip: '-',
    role: 'Koordinator UKS'
  };

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth();

  const isGoingHome = record.finalStatus === 'Izin Pulang / Dijemput' ||
                      record.actionTaken?.toLowerCase().includes('pulang') ||
                      record.actionTaken?.toLowerCase().includes('dijemput');

  const cleanDate = (record.date || '').replace(/[^0-9]/g, '');
  const shortId = (record.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || 'UKS1';
  const verificationCode = `VERIF-UKS-${cleanDate || '2026'}-${shortId}-${(school.shortName || 'SMAN1BATU').replace(/[^a-zA-Z0-9]/g, '')}`;

  // 1. Frame Luar Dokumen
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.4);
  doc.roundedRect(12, 10, pageWidth - 24, 275, 4, 4, 'S');

  // 2. Kop Surat Resmi SMAN 1 Batu
  if (school.logoUrl) {
    try {
      doc.addImage(school.logoUrl, 'PNG', 16, 14, 20, 20);
    } catch {
      // ignore logo error
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(school.governmentHeader || 'PEMERINTAH PROVINSI JAWA TIMUR • DINAS PENDIDIKAN', pageWidth / 2, 17, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(school.name || 'SMAN 1 BATU', pageWidth / 2, 24, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(13, 148, 136); // Teal-600
  doc.text(school.division || 'UNIT KESEHATAN SEKOLAH (UKS)', pageWidth / 2, 30, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const contactLine = `${school.address || 'Jl. Ngaglik No. 1, Kota Batu'} • Telp: ${school.phone || '(0341) 591310'} • Surel: ${school.email || 'uks@sman1batu.sch.id'}`;
  doc.text(contactLine, pageWidth / 2, 35, { align: 'center' });

  // Garis Pembatas Kop Ganda
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.7);
  doc.line(16, 38, pageWidth - 16, 38);
  doc.setLineWidth(0.2);
  doc.line(16, 39, pageWidth - 16, 39);

  // 3. Status Pill Badge (Tengah)
  const badgeTitle = isGoingHome
    ? 'SURAT IZIN: PULANG DIJEMPUT (DISETUJUI)'
    : 'SURAT IZIN: ISTIRAHAT DI UKS (DISETUJUI)';

  const pillWidth = 114;
  const pillHeight = 8;
  const pillX = (pageWidth - pillWidth) / 2;
  const pillY = 44;

  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(110, 231, 183); // emerald-300
  doc.setLineWidth(0.35);
  doc.roundedRect(pillX, pillY, pillWidth, pillHeight, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text(badgeTitle, pageWidth / 2, pillY + 5.5, { align: 'center' });

  // 4. Kartu Rincian Data Siswa
  const cardY = 56;
  const cardHeight = 86;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(16, cardY, pageWidth - 32, cardHeight, 3, 3, 'FD');

  const approvedTimeFormatted = formatIndonesianDateFull(record.date, record.time);

  const detailRows: { label: string; value: string; isBold?: boolean; isHighlight?: boolean }[] = [
    { label: 'Nama Siswa', value: record.visitorName.toUpperCase(), isBold: true },
    { label: 'Kelas', value: record.classOrPosition, isBold: true },
    { label: 'Waktu Disetujui', value: approvedTimeFormatted },
    {
      label: 'Keluhan / Gejala',
      value: `${record.complaint}${record.temperature ? ` (Suhu: ${record.temperature}°C)` : ''}${record.bloodPressure ? ` (Tensi: ${record.bloodPressure})` : ''}`
    },
    {
      label: 'Riwayat Alergi Obat',
      value: record.hasDrugAllergy ? `Ada (${record.drugAllergyDescription || 'Perlu konfirmasi'})` : 'Tidak Ada Riwayat Alergi'
    },
    { label: 'Tindakan UKS', value: record.actionTaken || 'Penanganan pertama di ruang UKS' },
    {
      label: 'Terapi Obat',
      value: record.medicinesGiven.length > 0
        ? record.medicinesGiven.map(m => `${m.medicineName} (${m.quantity} ${m.unit}${m.dosageNotes ? ` - ${m.dosageNotes}` : ''})`).join(', ')
        : 'Tanpa obat (Istirahat & observasi)'
    },
    {
      label: 'Status Kepulangan',
      value: isGoingHome ? 'Diizinkan Pulang Dijemput Orang Tua' : 'Istirahat di Ruang UKS',
      isBold: true,
      isHighlight: true
    },
    {
      label: 'Keperluan / Alasan',
      value: `"${record.notes || (isGoingHome ? 'Kondisi kesehatan menurun dan perlu istirahat/rawat jalan di rumah.' : 'Pemulihan kondisi fisik di ruang UKS hingga jam pelajaran berakhir.')}"`
    }
  ];

  let currentDetailY = cardY + 7;
  const labelX = 22;
  const colonX = 58;
  const valueX = 61;
  const maxValueWidth = pageWidth - 32 - 50;

  detailRows.forEach(row => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(row.label, labelX, currentDetailY);
    doc.text(':', colonX, currentDetailY);

    if (row.isHighlight) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(13, 148, 136); // Teal-600
    } else if (row.isBold) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
    }

    // Split text if it wraps
    const lines = doc.splitTextToSize(row.value, maxValueWidth);
    doc.text(lines[0] || '', valueX, currentDetailY);
    currentDetailY += 8.6;
  });

  // 5. Header Lembar Pengesahan 1 Tahap (Petugas UKS)
  const signHeaderY = 150;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.35);
  doc.line(16, signHeaderY, pageWidth - 16, signHeaderY);

  const signTitle = 'LEMBAR PENGESAHAN (PETUGAS UKS)';
  const signTitleWidth = 86;
  const signTitleX = (pageWidth - signTitleWidth) / 2;

  doc.setFillColor(255, 255, 255);
  doc.rect(signTitleX - 2, signHeaderY - 2.5, signTitleWidth + 4, 5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(signTitle, pageWidth / 2, signHeaderY + 1.2, { align: 'center' });

  // 6. 1 Kotak Pengesahan Petugas UKS
  const officerName = record.approvedBy || record.handledBy || 'Petugas UKS';
  const boxY = 157;
  const boxHeight = 36;
  const boxWidth = 104;
  const boxX = (pageWidth - boxWidth) / 2;

  doc.setFillColor(240, 253, 250); // teal-50
  doc.setDrawColor(153, 246, 228); // teal-200
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PETUGAS PEMERIKSA UKS', pageWidth / 2, boxY + 7.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 148, 136); // Teal-600
  doc.text('✓ Telah Diverifikasi & Disetujui', pageWidth / 2, boxY + 14.5, { align: 'center' });

  // Divider inside box
  doc.setDrawColor(204, 251, 241);
  doc.setLineWidth(0.2);
  doc.line(boxX + 6, boxY + 18, boxX + boxWidth - 6, boxY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(officerName, pageWidth / 2, boxY + 25, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Waktu: ${record.time} WIB (${record.date})`, pageWidth / 2, boxY + 31, { align: 'center' });

  // 7. Area Footer Validasi Digital & QR Code
  const footerY = 208;

  // Render QR Code Box
  const qrX = 18;
  const qrY = footerY;
  const qrSize = 22;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.roundedRect(qrX, qrY, qrSize, qrSize, 2, 2, 'FD');

  // Draw QR corner markers
  doc.setFillColor(30, 41, 59);
  doc.rect(qrX + 2, qrY + 2, 5, 5, 'F');
  doc.rect(qrX + qrSize - 7, qrY + 2, 5, 5, 'F');
  doc.rect(qrX + 2, qrY + qrSize - 7, 5, 5, 'F');

  // Inner squares
  doc.setFillColor(255, 255, 255);
  doc.rect(qrX + 3.2, qrY + 3.2, 2.6, 2.6, 'F');
  doc.rect(qrX + qrSize - 5.8, qrY + 3.2, 2.6, 2.6, 'F');
  doc.rect(qrX + 3.2, qrY + qrSize - 5.8, 2.6, 2.6, 'F');

  // Center pixels
  doc.setFillColor(30, 41, 59);
  doc.rect(qrX + 4, qrY + 4, 1, 1, 'F');
  doc.rect(qrX + qrSize - 5, qrY + 4, 1, 1, 'F');
  doc.rect(qrX + 4, qrY + qrSize - 5, 1, 1, 'F');
  doc.rect(qrX + 9, qrY + 9, 4, 4, 'F');
  doc.rect(qrX + 15, qrY + 11, 2, 2, 'F');
  doc.rect(qrX + 10, qrY + 15, 3, 2, 'F');

  // QR Text
  const qrTextX = qrX + qrSize + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('VERIFIKASI UKS DIGITAL', qrTextX, qrY + 6);

  doc.setFontSize(7.5);
  doc.setTextColor(13, 148, 136); // Teal-600
  doc.text('DIGITAL VALIDATED', qrTextX, qrY + 11);

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(verificationCode, qrTextX, qrY + 17);

  // Kanan: Validasi Petugas UKS
  const signRightX = pageWidth - 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Petugas UKS', signRightX, footerY + 3, { align: 'right' });

  // Verified Badge
  const vbWidth = 22;
  const vbHeight = 4.5;
  const vbX = signRightX - vbWidth;
  const vbY = footerY + 5.5;

  doc.setFillColor(209, 250, 229); // emerald-100
  doc.setDrawColor(110, 231, 183); // emerald-300
  doc.setLineWidth(0.3);
  doc.roundedRect(vbX, vbY, vbWidth, vbHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(6, 95, 70);
  doc.text('VERIFIED', vbX + vbWidth / 2, vbY + 3.2, { align: 'center' });

  // Petugas Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(officerName, signRightX, footerY + 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Unit Kesehatan Sekolah (UKS)', signRightX, footerY + 20, { align: 'right' });

  return doc;
}

export function exportSickLeaveLetterToPdf(
  record: VisitRecord,
  customSchoolInfo?: SchoolInfo,
  customKoordinator?: AdminUser | null
): void {
  const school = customSchoolInfo || DEFAULT_SCHOOL_INFO;
  const doc = generateSickLeaveLetterPdfDoc(record, customSchoolInfo, customKoordinator);
  const safeName = record.visitorName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeClass = record.classOrPosition.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeDate = (record.date || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Surat_Keterangan_Sakit_UKS_${safeName}_${safeClass}_${safeDate}.pdf`);
}

export function printSickLeaveLetter(
  record: VisitRecord,
  customSchoolInfo?: SchoolInfo,
  customKoordinator?: AdminUser | null
): void {
  const school = customSchoolInfo || DEFAULT_SCHOOL_INFO;
  const doc = generateSickLeaveLetterPdfDoc(record, customSchoolInfo, customKoordinator);
  doc.autoPrint();
  const blobUrl = doc.output('bloburl');
  const printWindow = window.open(blobUrl, '_blank');
  if (!printWindow) {
    const safeName = record.visitorName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeClass = record.classOrPosition.replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Surat_Keterangan_Sakit_UKS_${safeName}_${safeClass}.pdf`);
  }
}

