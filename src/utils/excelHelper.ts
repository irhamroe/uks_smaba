import * as XLSX from 'xlsx';
import { Medicine, VisitRecord, SchoolInfo } from '../types';
import { SCHOOL_INFO } from '../data/initialData';

// Download template Excel for importing medicines
export function downloadMedicineExcelTemplate(): void {
  const templateData = [
    {
      'Nama Obat': 'Paracetamol 500mg',
      'Kategori': 'Analgesik & Antipiretik',
      'Satuan': 'Tablet',
      'Jumlah Stok': 50,
      'Batas Minimum Peringatan': 15,
      'Tanggal Kedaluwarsa (YYYY-MM-DD)': '2027-12-31',
      'Lokasi Simpan': 'Lemari A - Rak 1',
      'Keterangan': 'Pereda demam & sakit kepala'
    },
    {
      'Nama Obat': 'Promag',
      'Kategori': 'Saluran Pencernaan',
      'Satuan': 'Tablet',
      'Jumlah Stok': 30,
      'Batas Minimum Peringatan': 10,
      'Tanggal Kedaluwarsa (YYYY-MM-DD)': '2026-11-15',
      'Lokasi Simpan': 'Lemari A - Rak 2',
      'Keterangan': 'Pereda asam lambung'
    },
    {
      'Nama Obat': 'Minyak Kayu Putih 60ml',
      'Kategori': 'Obat Luar & Terapi',
      'Satuan': 'Botol',
      'Jumlah Stok': 12,
      'Batas Minimum Peringatan': 5,
      'Tanggal Kedaluwarsa (YYYY-MM-DD)': '2028-06-30',
      'Lokasi Simpan': 'Meja Periksa',
      'Keterangan': 'Pereda mual dan pusing'
    },
    {
      'Nama Obat': 'Hansaplast Plester Luka',
      'Kategori': 'Alat Medis P3K',
      'Satuan': 'Pcs',
      'Jumlah Stok': 100,
      'Batas Minimum Peringatan': 25,
      'Tanggal Kedaluwarsa (YYYY-MM-DD)': '2028-01-01',
      'Lokasi Simpan': 'Kotak P3K Utama',
      'Keterangan': 'Plester luka elastis steril'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 30 }, // Nama Obat
    { wch: 25 }, // Kategori
    { wch: 12 }, // Satuan
    { wch: 14 }, // Jumlah Stok
    { wch: 24 }, // Batas Minimum Peringatan
    { wch: 32 }, // Tanggal Kedaluwarsa
    { wch: 22 }, // Lokasi Simpan
    { wch: 35 }  // Keterangan
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
          const rawStock = row['Jumlah Stok'] ?? row['stok'] ?? row['Stok'] ?? 0;
          const stock = Number.isFinite(Number(rawStock)) ? Math.max(0, Math.floor(Number(rawStock))) : 0;
          const rawMinStock = row['Batas Minimum Peringatan'] ?? row['min_stock'] ?? row['Batas Minimum'] ?? 10;
          const minStock = Number.isFinite(Number(rawMinStock)) ? Math.max(1, Math.floor(Number(rawMinStock))) : 10;
          
          let expiryDate = String(row['Tanggal Kedaluwarsa (YYYY-MM-DD)'] || row['expired'] || row['Expired'] || '').trim();
          if (!expiryDate || expiryDate === 'undefined' || expiryDate === 'null') {
            expiryDate = '';
          }

          const location = String(row['Lokasi Simpan'] || row['lokasi'] || 'Lemari UKS').trim();
          const description = String(row['Keterangan'] || row['deskripsi'] || '').trim();

          parsedList.push({
            name,
            category,
            unit,
            stock,
            minStock,
            expiryDate,
            location,
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

// Export Monthly Data to Excel
export function exportMonthlyReportToExcel(
  monthName: string,
  year: number,
  visits: VisitRecord[],
  medicines: Medicine[],
  customSchoolInfo?: SchoolInfo
): void {
  // 1. Sheet Kunjungan
  const visitRows = visits.map((v, idx) => ({
    'No': idx + 1,
    'Tanggal': v.date,
    'Waktu': v.time,
    'Nama Pengunjung': v.visitorName,
    'Peran': v.role === 'siswa' ? 'Siswa' : v.role === 'guru' ? 'Guru' : 'Staf',
    'Kelas / Jabatan': v.classOrPosition,
    'L/P': v.gender,
    'Keluhan / Gejala': v.complaint,
    'Tindakan Diberikan': v.actionTaken,
    'Obat Yang Diberikan': v.medicinesGiven.length > 0 
      ? v.medicinesGiven.map(m => `${m.medicineName} (${m.quantity} ${m.unit})`).join('; ')
      : 'Tidak butuh obat',
    'Suhu (°C)': v.temperature || '-',
    'Tensi Darah': v.bloodPressure || '-',
    'Status Akhir': v.finalStatus,
    'Catatan UKS': v.notes || '-'
  }));

  const worksheetVisits = XLSX.utils.json_to_sheet(visitRows);
  worksheetVisits['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // Tanggal
    { wch: 8 },  // Waktu
    { wch: 26 }, // Nama
    { wch: 10 }, // Peran
    { wch: 18 }, // Kelas
    { wch: 6 },  // L/P
    { wch: 32 }, // Keluhan
    { wch: 35 }, // Tindakan
    { wch: 35 }, // Obat
    { wch: 10 }, // Suhu
    { wch: 12 }, // Tensi
    { wch: 25 }, // Status
    { wch: 25 }  // Catatan
  ];

  // 2. Sheet Stok Obat
  const medicineRows = medicines.map((m, idx) => ({
    'No': idx + 1,
    'Nama Obat': m.name,
    'Kategori': m.category,
    'Sisa Stok': m.stock,
    'Satuan': m.unit,
    'Ambang Batas Minimum': m.minStock,
    'Status': m.stock === 0 ? 'HABIS' : m.stock <= m.minStock ? 'MENIPIS' : 'AMAN',
    'Tanggal Kedaluwarsa': m.expiryDate || '-',
    'Lokasi Simpan': m.location || 'Lemari UKS',
    'Keterangan': m.description || '-'
  }));

  const worksheetMedicines = XLSX.utils.json_to_sheet(medicineRows);
  worksheetMedicines['!cols'] = [
    { wch: 5 },  // No
    { wch: 30 }, // Nama Obat
    { wch: 24 }, // Kategori
    { wch: 12 }, // Sisa Stok
    { wch: 12 }, // Satuan
    { wch: 22 }, // Ambang Batas
    { wch: 12 }, // Status
    { wch: 18 }, // Expired
    { wch: 22 }, // Lokasi
    { wch: 30 }  // Keterangan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheetVisits, 'Rekap Kunjungan');
  XLSX.utils.book_append_sheet(workbook, worksheetMedicines, 'Stok Obat UKS');

  const safeSchoolName = (customSchoolInfo?.shortName || SCHOOL_INFO.shortName || 'SMAN1_Batu').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Laporan_UKS_${safeSchoolName}_${monthName}_${year}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
