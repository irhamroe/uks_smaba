import * as XLSX from 'xlsx';
import { Medicine, VisitRecord, SchoolInfo } from '../types';
import { SCHOOL_INFO } from '../data/initialData';

// Download template Excel for importing medicines
export function downloadMedicineExcelTemplate(): void {
  const templateData = [
    {
      'Nama Obat': 'Paracetamol 500mg',
      'Kategori': 'Analgesik & Antipiretik',
      'Tipe Pemakaian': 'Dosis Tunggal',
      'Satuan': 'Tablet',
      'Jumlah Stok': 50,
      'Batas Minimum': 15,
      'No. Batch / Kloter': 'LOT-2026-01',
      'Tanggal Kedaluwarsa (YYYY-MM-DD)': '2027-12-31',
      'Keterangan / Indikasi': 'Pereda demam & sakit kepala'
    },
    {
      'Nama Obat': 'Promag',
      'Kategori': 'Saluran Pencernaan',
      'Tipe Pemakaian': 'Dosis Tunggal',
      'Satuan': 'Tablet',
      'Jumlah Stok': 30,
      'Batas Minimum': 10,
      'No. Batch / Kloter': 'LOT-2026-02',
      'Tanggal Kedaluwarsa (YYYY-MM-DD)': '2026-11-15',
      'Keterangan / Indikasi': 'Pereda asam lambung & maag'
    },
    {
      'Nama Obat': 'Minyak Kayu Putih 60ml',
      'Kategori': 'Obat Luar & Terapi',
      'Tipe Pemakaian': 'Multi-Dose',
      'Satuan': 'Botol',
      'Jumlah Stok': 12,
      'Batas Minimum': 5,
      'No. Batch / Kloter': 'LOT-2026-03',
      'Tanggal Kedaluwarsa (YYYY-MM-DD)': '2028-06-30',
      'Keterangan / Indikasi': 'Pereda pusing, kembung dan mual'
    },
    {
      'Nama Obat': 'Hansaplast Plester Luka',
      'Kategori': 'Alat Medis P3K',
      'Tipe Pemakaian': 'Dosis Tunggal',
      'Satuan': 'Pcs',
      'Jumlah Stok': 100,
      'Batas Minimum': 25,
      'No. Batch / Kloter': 'LOT-2026-04',
      'Tanggal Kedaluwarsa (YYYY-MM-DD)': '2028-01-01',
      'Keterangan / Indikasi': 'Plester penutup luka steril'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 30 }, // Nama Obat
    { wch: 25 }, // Kategori
    { wch: 18 }, // Tipe Pemakaian
    { wch: 12 }, // Satuan
    { wch: 14 }, // Jumlah Stok
    { wch: 16 }, // Batas Minimum
    { wch: 22 }, // No. Batch / Kloter
    { wch: 32 }, // Tanggal Kedaluwarsa
    { wch: 35 }  // Keterangan / Indikasi
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Obat');

  // Trigger download
  XLSX.writeFile(workbook, `Template_Input_Stok_Obat_UKS_SMAN1_Batu.xlsx`);
}

// Parse uploaded Excel file into Medicine items
export function parseMedicineExcelFile(file: File): Promise<{
  success: boolean;
  medicines: Omit<Medicine, 'id' | 'lastUpdated'>[];
  error?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          resolve({ success: false, medicines: [], error: 'File Excel tidak memiliki lembar kerja (sheet).' });
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rawJson || rawJson.length === 0) {
          resolve({ success: false, medicines: [], error: 'File Excel kosong atau tidak memiliki data.' });
          return;
        }

        const parsedList: Omit<Medicine, 'id' | 'lastUpdated'>[] = [];

        for (let i = 0; i < rawJson.length; i++) {
          const row = rawJson[i];
          const name = String(row['Nama Obat'] || row['nama_obat'] || row['Nama'] || '').trim();
          
          if (!name) continue; // skip empty name rows

          const category = String(row['Kategori'] || row['kategori'] || 'Umum').trim();
          const unit = String(row['Satuan'] || row['satuan'] || 'Tablet').trim();
          
          // Determine usageType
          const rawUsage = String(row['Tipe Pemakaian'] || row['Tipe Obat'] || row['usageType'] || '').toLowerCase();
          const isMultiDose = rawUsage.includes('multi') || rawUsage.includes('bersama') || 
            (unit.toLowerCase().includes('botol') && !rawUsage.includes('single')) ||
            unit.toLowerCase().includes('tube') || unit.toLowerCase().includes('salep');
          const usageType = isMultiDose ? 'multi_dose' : 'single_dose';

          const rawStock = row['Jumlah Stok'] ?? row['Total Stok'] ?? row['stok'] ?? row['Stok'] ?? 0;
          const stock = Number.isFinite(Number(rawStock)) ? Math.max(0, Math.floor(Number(rawStock))) : 0;
          const rawMinStock = row['Batas Minimum'] ?? row['Batas Minimum Peringatan'] ?? row['min_stock'] ?? 10;
          const minStock = Number.isFinite(Number(rawMinStock)) ? Math.max(1, Math.floor(Number(rawMinStock))) : 10;
          
          const batchNumber = String(
            row['No. Batch / Kloter'] || row['Nomor Batch'] || row['No Batch'] || row['Batch'] || row['batchNumber'] || `LOT-${new Date().getFullYear()}-${String(i + 1).padStart(2, '0')}`
          ).trim();

          let expiryDate = String(
            row['Tanggal Kedaluwarsa (YYYY-MM-DD)'] || row['Tanggal Kedaluwarsa'] || row['expired'] || row['Expired'] || ''
          ).trim();
          if (!expiryDate || expiryDate === 'undefined' || expiryDate === 'null') {
            const defaultDate = new Date();
            defaultDate.setFullYear(defaultDate.getFullYear() + 2);
            expiryDate = defaultDate.toISOString().split('T')[0];
          }

          const description = String(row['Keterangan / Indikasi'] || row['Keterangan'] || row['deskripsi'] || '').trim();

          const batches = stock > 0 ? [{
            id: `batch-import-${Date.now()}-${i}`,
            batchNumber,
            quantity: stock,
            expiryDate,
            receivedDate: new Date().toISOString().split('T')[0],
            note: 'Impor dari Excel'
          }] : [];

          parsedList.push({
            name,
            category,
            unit,
            usageType,
            stock,
            minStock,
            expiryDate,
            batches,
            description
          });
        }

        if (parsedList.length === 0) {
          resolve({ 
            success: false, 
            medicines: [], 
            error: 'Tidak ditemukan data obat yang valid. Pastikan nama kolom sesuai format template ("Nama Obat", "Jumlah Stok", dll).' 
          });
          return;
        }

        resolve({ success: true, medicines: parsedList });
      } catch (err) {
        resolve({ 
          success: false, 
          medicines: [], 
          error: 'Gagal memproses file Excel: ' + (err instanceof Error ? err.message : 'Format file tidak didukung') 
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, medicines: [], error: 'Gagal membaca file.' });
    };

    reader.readAsArrayBuffer(file);
  });
}

// Export Visits Data to Excel (.xlsx)
export function exportVisitsReportToExcel(
  periodLabel: string,
  visits: VisitRecord[],
  customSchoolInfo?: SchoolInfo
): void {
  const visitRows = visits.map((v, idx) => ({
    'No': idx + 1,
    'Tanggal': v.date,
    'Waktu': v.time,
    'Nama Pengunjung': v.visitorName,
    'Peran': v.role === 'siswa' ? 'Siswa' : v.role === 'guru' ? 'Guru' : 'Staf',
    'Kelas / Jabatan': v.classOrPosition,
    'Jenis Kelamin': v.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    'Riwayat Alergi Obat': v.hasDrugAllergy ? `ADA (${v.drugAllergyDescription || 'Alergi'})` : 'Tidak Ada',
    'Keluhan / Gejala': v.complaint,
    'Tindakan Diberikan': v.actionTaken,
    'Obat Yang Diberikan': v.medicinesGiven.length > 0 
      ? v.medicinesGiven.map(m => `${m.medicineName} (${m.quantity} ${m.unit})`).join('; ')
      : 'Tanpa obat',
    'Suhu (°C)': v.temperature || '-',
    'Tensi Darah': v.bloodPressure || '-',
    'Status Akhir': v.finalStatus,
    'Petugas Penangan': v.approvedBy || v.handledBy || 'Petugas UKS',
    'Catatan Tambahan': v.notes || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(visitRows);
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // Tanggal
    { wch: 8 },  // Waktu
    { wch: 26 }, // Nama
    { wch: 10 }, // Peran
    { wch: 18 }, // Kelas
    { wch: 14 }, // L/P
    { wch: 25 }, // Alergi Obat
    { wch: 32 }, // Keluhan
    { wch: 35 }, // Tindakan
    { wch: 35 }, // Obat
    { wch: 10 }, // Suhu
    { wch: 12 }, // Tensi
    { wch: 26 }, // Status
    { wch: 25 }, // Petugas
    { wch: 25 }  // Catatan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Kunjungan');

  const safeSchoolName = (customSchoolInfo?.shortName || SCHOOL_INFO.shortName || 'SMAN1_Batu').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safePeriod = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Laporan_Kunjungan_UKS_${safeSchoolName}_${safePeriod}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

// Export Medicine Usage & Stock Data to Excel (.xlsx)
export function exportMedicineUsageReportToExcel(
  periodLabel: string,
  visits: VisitRecord[],
  medicines: Medicine[],
  customSchoolInfo?: SchoolInfo
): void {
  // 1. Sheet Rekapitulasi Pemakaian & Sisa Stok
  const medicineRows = medicines.map((m, idx) => {
    const totalUsed = visits.reduce((acc, v) => {
      const found = v.medicinesGiven.find(item => 
        item.medicineId === m.id || item.medicineName.toLowerCase() === m.name.toLowerCase()
      );
      return acc + (found ? found.quantity : 0);
    }, 0);

    return {
      'No': idx + 1,
      'Nama Obat': m.name,
      'Kategori': m.category,
      'Satuan': m.unit,
      'Terpakai Periode Ini': totalUsed,
      'Sisa Stok Saat Ini': m.stock,
      'Batas Minimum Stok': m.minStock,
      'Status Stok': m.stock === 0 ? 'HABIS' : m.stock <= m.minStock ? 'MENIPIS' : 'AMAN',
      'Tanggal Kedaluwarsa': m.expiryDate || '-',
      'Keterangan Obat': m.description || '-'
    };
  });

  const worksheetMeds = XLSX.utils.json_to_sheet(medicineRows);
  worksheetMeds['!cols'] = [
    { wch: 5 },  // No
    { wch: 30 }, // Nama Obat
    { wch: 24 }, // Kategori
    { wch: 12 }, // Satuan
    { wch: 22 }, // Terpakai
    { wch: 18 }, // Sisa Stok
    { wch: 20 }, // Batas Minimum
    { wch: 14 }, // Status
    { wch: 18 }, // Expired
    { wch: 30 }  // Keterangan
  ];

  // 2. Sheet Rincian Pasien Penerima Obat
  const patientMedRows: any[] = [];
  let pIdx = 1;
  visits.forEach(v => {
    if (v.needsMedicine && v.medicinesGiven.length > 0) {
      v.medicinesGiven.forEach(m => {
        patientMedRows.push({
          'No': pIdx++,
          'Tanggal': v.date,
          'Waktu': v.time,
          'Nama Pasien': v.visitorName,
          'Kelas / Jabatan': v.classOrPosition,
          'Peran': v.role.toUpperCase(),
          'Nama Obat Diberikan': m.medicineName,
          'Jumlah Diberikan': `${m.quantity} ${m.unit}`,
          'Aturan / Anjuran Pakai': m.dosageNotes || '-',
          'Keluhan Medis': v.complaint,
          'Petugas Penyerah': v.approvedBy || v.handledBy || 'Petugas UKS'
        });
      });
    }
  });

  const worksheetPatients = XLSX.utils.json_to_sheet(patientMedRows.length > 0 ? patientMedRows : [{ 'Keterangan': 'Tidak ada pemakaian obat pada periode ini' }]);
  worksheetPatients['!cols'] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 8 },
    { wch: 26 },
    { wch: 18 },
    { wch: 10 },
    { wch: 30 },
    { wch: 18 },
    { wch: 30 },
    { wch: 30 },
    { wch: 22 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheetMeds, 'Rekap Stok & Penggunaan');
  XLSX.utils.book_append_sheet(workbook, worksheetPatients, 'Rincian Pasien Penerima Obat');

  const safeSchoolName = (customSchoolInfo?.shortName || SCHOOL_INFO.shortName || 'SMAN1_Batu').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safePeriod = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Laporan_Penggunaan_Obat_UKS_${safeSchoolName}_${safePeriod}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
