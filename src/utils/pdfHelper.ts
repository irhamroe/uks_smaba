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
