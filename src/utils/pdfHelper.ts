import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Medicine, VisitRecord, SchoolInfo, AdminUser } from '../types';
import { SCHOOL_INFO as DEFAULT_SCHOOL_INFO } from '../data/initialData';

export function generateMonthlyReportPdfDoc(
  monthName: string,
  year: number,
  visits: VisitRecord[],
  medicines: Medicine[],
  customSchoolInfo?: SchoolInfo,
  customKoordinator?: AdminUser | null
): jsPDF {
  const school = customSchoolInfo || DEFAULT_SCHOOL_INFO;
  const koordinator = customKoordinator || {
    name: 'Koordinator UKS',
    nip: '-',
    role: 'Koordinator UKS'
  };

  // Create PDF in portrait A4
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Draw Logo if available
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

  // 2. Judul Laporan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN REKAPITULASI PELAYANAN & STOK OBAT', pageWidth / 2, dividerY + 9, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Periode: ${monthName} ${year}`, pageWidth / 2, dividerY + 14, { align: 'center' });

  // 3. Ringkasan Singkat (Stats box)
  const totalVisits = visits.length;
  const siswaVisits = visits.filter(v => v.role === 'siswa').length;
  const guruVisits = visits.filter(v => v.role !== 'siswa').length;
  const totalMedDoses = visits.reduce((acc, v) => 
    acc + v.medicinesGiven.reduce((sub, m) => sub + m.quantity, 0), 0
  );
  const lowStockCount = medicines.filter(m => m.stock <= m.minStock).length;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 61, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Kunjungan: ${totalVisits} orang`, 18, 67);
  doc.text(`Siswa: ${siswaVisits} | Guru/Staf: ${guruVisits}`, 18, 72);

  doc.text(`Obat Terpakai: ${totalMedDoses} unit/butir`, 105, 67);
  doc.text(`Obat Perlu Restock: ${lowStockCount} item`, 105, 72);

  // 4. Tabel Kunjungan Pasien
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('A. Rincian Data Kunjungan UKS', 14, 82);

  const visitRows = visits.map((v, i) => [
    (i + 1).toString(),
    `${v.date}\n${v.time}`,
    `${v.visitorName}\n(${v.classOrPosition})`,
    v.complaint,
    v.medicinesGiven.length > 0
      ? v.medicinesGiven.map(m => `${m.medicineName} (${m.quantity} ${m.unit})`).join('\n')
      : 'Tanpa obat',
    v.actionTaken
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['No', 'Tgl / Jam', 'Nama & Kelas/Jabatan', 'Keluhan', 'Obat Diberikan', 'Tindakan']],
    body: visitRows.length > 0 ? visitRows : [['-', '-', 'Belum ada kunjungan tercatat pada periode ini', '-', '-', '-']],
    headStyles: {
      fillColor: [16, 149, 120], // Teal 600
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      valign: 'top',
      cellPadding: 2.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 38, fontStyle: 'bold' },
      3: { cellWidth: 38 },
      4: { cellWidth: 36 },
      5: { cellWidth: 40 }
    },
    theme: 'grid',
    margin: { left: 14, right: 14 }
  });

  // 5. Tabel Rekap Stok Obat
  const afterVisitY = (doc as any).lastAutoTable?.finalY || 160;
  let startMedY = afterVisitY + 8;

  // Check if we need a new page for medicines
  if (startMedY > 230) {
    doc.addPage();
    startMedY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('B. Rekapitulasi Stok & Penggunaan Obat', 14, startMedY);

  const medRows = medicines.map((m, i) => {
    // Calculate total used this month
    const totalUsed = visits.reduce((acc, v) => {
      const found = v.medicinesGiven.find(item => item.medicineId === m.id || item.medicineName.toLowerCase() === m.name.toLowerCase());
      return acc + (found ? found.quantity : 0);
    }, 0);

    const isLow = m.stock <= m.minStock;
    const statusText = isLow ? `KRITIS (Sisa ${m.stock} ${m.unit})` : 'Aman';

    return [
      (i + 1).toString(),
      m.name,
      m.category,
      `${m.stock} ${m.unit}`,
      `${m.minStock} ${m.unit}`,
      `${totalUsed} ${m.unit}`,
      statusText,
      m.expiryDate || '-'
    ];
  });

  autoTable(doc, {
    startY: startMedY + 3,
    head: [['No', 'Nama Obat', 'Kategori', 'Sisa Stok', 'Batas Min', 'Terpakai Bln Ini', 'Status Stok', 'Kedaluwarsa']],
    body: medRows.length > 0 ? medRows : [['-', '-', '-', '-', '-', '-', '-', '-']],
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      valign: 'middle',
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 38 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 22, halign: 'center' },
      7: { cellWidth: 22, halign: 'center' }
    },
    theme: 'grid',
    margin: { left: 14, right: 14 }
  });

  // 6. Tanda Tangan
  const afterMedY = (doc as any).lastAutoTable?.finalY || 220;
  let signY = afterMedY + 12;

  // If near bottom of page, add page for signatures
  if (signY > 245) {
    doc.addPage();
    signY = 25;
  }

  const currentDateStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Right signature: Koordinator UKS
  const city = school.city || 'Kota Batu';
  doc.text(`${city}, ${currentDateStr}`, pageWidth - 70, signY);
  doc.text(`${koordinator.role || 'Koordinator UKS'},`, pageWidth - 70, signY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(koordinator.name || 'Koordinator UKS', pageWidth - 70, signY + 26);
  doc.setFont('helvetica', 'normal');
  doc.text(koordinator.nip && koordinator.nip !== '-' ? `NIP. ${koordinator.nip}` : 'NIP. -', pageWidth - 70, signY + 30);

  // Left signature: Kepala Sekolah
  doc.text('Mengetahui,', 20, signY + 5);
  doc.text(`Kepala ${school.shortName || 'SMAN 1 Batu'}`, 20, signY + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(school.schoolPrincipal || 'Kepala Sekolah', 20, signY + 26);
  doc.setFont('helvetica', 'normal');
  doc.text(school.schoolPrincipalNip && school.schoolPrincipalNip !== '-' ? `NIP. ${school.schoolPrincipalNip}` : 'NIP. -', 20, signY + 30);

  return doc;
}

export function exportMonthlyReportToPdf(
  monthName: string,
  year: number,
  visits: VisitRecord[],
  medicines: Medicine[],
  customSchoolInfo?: SchoolInfo,
  customKoordinator?: AdminUser | null
): void {
  const school = customSchoolInfo || DEFAULT_SCHOOL_INFO;
  const doc = generateMonthlyReportPdfDoc(monthName, year, visits, medicines, customSchoolInfo, customKoordinator);
  const safeFilename = (school.shortName || 'UKS').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Laporan_UKS_${safeFilename}_${monthName}_${year}.pdf`);
}

export function printMonthlyReport(
  monthName: string,
  year: number,
  visits: VisitRecord[],
  medicines: Medicine[],
  customSchoolInfo?: SchoolInfo,
  customKoordinator?: AdminUser | null
): void {
  const school = customSchoolInfo || DEFAULT_SCHOOL_INFO;
  const doc = generateMonthlyReportPdfDoc(monthName, year, visits, medicines, customSchoolInfo, customKoordinator);
  
  // Trigger auto print and open PDF viewer window
  doc.autoPrint();
  const blobUrl = doc.output('bloburl');
  const printWindow = window.open(blobUrl, '_blank');
  
  // If popup blocker intervened, fallback to saving the PDF file
  if (!printWindow) {
    const safeFilename = (school.shortName || 'UKS').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Laporan_UKS_${safeFilename}_${monthName}_${year}.pdf`);
  }
}
