import { Medicine, VisitRecord, AdminUser, SchoolInfo } from '../types';

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-1',
    username: 'nita',
    password: 'smabasehat',
    name: 'Nita Rimayanti, S.Pd',
    role: 'Koordinator UKS',
    nip: '19860728 200903 2 005',
    phone: '081234567890',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-2',
    username: 'irham',
    password: 'smabasehat',
    name: 'Moh. Irham Rozaqi, S.Kom, Gr.',
    role: 'Pembina UKS',
    nip: '19891021 202221 1 017',
    phone: '085655306033',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-3',
    username: 'mitha',
    password: 'smabasehat',
    name: 'Amitha Mustika Damayanti, M.Pd',
    role: 'Pembina UKS',
    nip: '19920219 202321 2 039',
    phone: '082187271650',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-4',
    username: 'muhajir',
    password: 'smabasehat',
    name: 'Ahmad Muhajir R, S.Pd',
    role: 'Pembina UKS',
    nip: '19820826 202221 1 011',
    phone: '081931895675',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-5',
    username: 'ribkha',
    password: 'smabasehat',
    name: 'Ribkha Ayu Adiningtyas, S.Pd',
    role: 'Pembina UKS',
    nip: '19920322 202521 2 115',
    phone: '081283038032',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-6',
    username: 'panji',
    password: 'smabasehat',
    name: 'Panji Penatas, S.Pd',
    role: 'Pembina UKS',
    nip: '19900608 202521 1 127',
    phone: '0895337139132',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-7',
    username: 'rindy',
    password: 'smabasehat',
    name: 'Rindy Antika Sari',
    role: 'Staf Administrasi UKS',
    nip: '19880502 202521 2 111',
    phone: '081249903049',
    isActive: true,
    createdAt: '2025-01-01'
  }
];

export const INITIAL_MEDICINES: Medicine[] = [
  {
    "id": "med-01",
    "name": "Floxigra 500mg",
    "category": "Antibiotik & Resep Khusus",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 88,
    "minStock": 20,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Gabungan: Stok Dalam 7 strip (70 tablet) + Stok Luar 18 tablet. Antibiotik infeksi bakteri.",
    "batches": [
      {
        "id": "batch-med-01-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 88,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-02",
    "name": "Domperidone 10mg",
    "category": "Saluran Pencernaan",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 229,
    "minStock": 15,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 1 (49 tablet) + Kloter 2 (18 strip / 180 tablet). Meredakan mual, muntah, dan kembung.",
    "batches": [
      {
        "id": "batch-med-02-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 49,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1 (Stok Luar & Dalam)"
      },
      {
        "id": "batch-med-02-kloter-2",
        "batchNumber": "KLOTER-2",
        "quantity": 180,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 2 (18 strip)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-03",
    "name": "Ibuprofen 400mg",
    "category": "Analgesik & Antipiretik",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 196,
    "minStock": 20,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 1 (96 tablet) + Kloter 2 (10 strip / 100 tablet). Pereda nyeri, sakit gigi, kram, dan demam.",
    "batches": [
      {
        "id": "batch-med-03-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 96,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1 (Stok Luar & Dalam)"
      },
      {
        "id": "batch-med-03-kloter-2",
        "batchNumber": "KLOTER-2",
        "quantity": 100,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 2 (10 strip)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-04",
    "name": "Metamizole Sodium 500mg",
    "category": "Analgesik & Antipiretik",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 132,
    "minStock": 10,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 1 (32 tablet) + Kloter 3 (1 dus / 100 tablet). Analgesik antipiretik pereda nyeri sedang-berat.",
    "batches": [
      {
        "id": "batch-med-04-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 32,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS Kloter 1"
      },
      {
        "id": "batch-med-04-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 100,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (1 dus @100 tablet)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-05",
    "name": "Panadol Extra",
    "category": "Analgesik & Antipiretik",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 508,
    "minStock": 20,
    "expiryDate": "2028-12-31",
    "location": "Meja Tindakan & Lemari UKS",
    "description": "Kloter 1 (8 tablet) + Kloter 3 (5 dus / 500 tablet). Pereda sakit kepala mencengkeram & migrain.",
    "batches": [
      {
        "id": "batch-med-05-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 8,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1"
      },
      {
        "id": "batch-med-05-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 500,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (5 dus @100 tablet)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-06",
    "name": "Vitacimin 500mg",
    "category": "Vitamin & Suplemen",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 214,
    "minStock": 15,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 1 (14 tablet) + Kloter 2 (200 tablet hisap). Vitamin C daya tahan tubuh dan sariawan.",
    "batches": [
      {
        "id": "batch-med-06-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 14,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1"
      },
      {
        "id": "batch-med-06-kloter-2",
        "batchNumber": "KLOTER-2",
        "quantity": 200,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 2 (200 tablet)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-07",
    "name": "Diapet Herbal",
    "category": "Saluran Pencernaan",
    "unit": "Kapsul",
    "usageType": "single_dose",
    "stock": 30,
    "minStock": 10,
    "expiryDate": "2028-12-31",
    "location": "Meja Tindakan UKS",
    "description": "Stok Luar: 30 kapsul. Mengatasi diare, mencret, mulas, dan buang air berlebih.",
    "batches": [
      {
        "id": "batch-med-07-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 30,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-08",
    "name": "Paracetamol 500mg",
    "category": "Analgesik & Antipiretik",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 130,
    "minStock": 20,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Kloter 1 (0 tablet / habis) + Kloter 2 (13 strip / 130 tablet). Pereda demam dan sakit kepala ringan.",
    "batches": [
      {
        "id": "batch-med-08-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 0,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Kloter 1 (Stok Awal Habis)"
      },
      {
        "id": "batch-med-08-kloter-2",
        "batchNumber": "KLOTER-2",
        "quantity": 130,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 2 (13 strip)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-09",
    "name": "Antasida Doen",
    "category": "Saluran Pencernaan",
    "unit": "Tablet Kunyah",
    "usageType": "single_dose",
    "stock": 444,
    "minStock": 20,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 2 (200 tablet) + Kloter 3 (2 dus 8 tab dalam + 36 luar = 244 tablet kunyah). Meredakan sakit maag, asam lambung berlebih, dan kembung.",
    "batches": [
      {
        "id": "batch-med-09-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 0,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Kloter 1 (Stok Awal Habis)"
      },
      {
        "id": "batch-med-09-kloter-2",
        "batchNumber": "KLOTER-2",
        "quantity": 200,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 2 (20 strip)"
      },
      {
        "id": "batch-med-09-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 244,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (2 dus 8 tab dalam + 36 butir luar)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-10",
    "name": "Promag Tablet",
    "category": "Saluran Pencernaan",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 0,
    "minStock": 15,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok saat ini habis (0 tablet) per 29/10/2026. Obat sakit maag cepat untuk siswa dan warga sekolah.",
    "batches": [],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-11",
    "name": "Panadol Cold & Flu",
    "category": "Flu, Batuk & Alergi",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 0,
    "minStock": 10,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok saat ini habis (0 tablet) per 29/10/2026. Meredakan gejala flu, hidung tersumbat, batuk, dan bersin.",
    "batches": [],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-12",
    "name": "Antalgin 500mg",
    "category": "Analgesik & Antipiretik",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 0,
    "minStock": 10,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok saat ini habis (0 tablet) per 29/10/2026. Pereda rasa sakit dan penurun demam.",
    "batches": [],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-13",
    "name": "Antimo Tablet",
    "category": "Obat Mual & Mabuk Perjalanan",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 0,
    "minStock": 10,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok saat ini habis (0 tablet) per 29/10/2026. Mencegah mual dan mabuk perjalanan saat kegiatan sekolah.",
    "batches": [],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-14",
    "name": "Antangin JRG Cair",
    "category": "Herbal & Masuk Angin",
    "unit": "Sachet",
    "usageType": "single_dose",
    "stock": 140,
    "minStock": 15,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Kloter 2 (120 sachet) + Kloter 3 (1 dus dalam + 8 sachet luar = 20 sachet). Meredakan masuk angin, mual, dan meriang.",
    "batches": [
      {
        "id": "batch-med-14-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 0,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Kloter 1 (Stok Awal Habis)"
      },
      {
        "id": "batch-med-14-kloter-2",
        "batchNumber": "KLOTER-2",
        "quantity": 120,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 2 (10 dus @12 sachet)"
      },
      {
        "id": "batch-med-14-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 20,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (1 dus dalam @12 sachet + 8 sachet luar)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-15",
    "name": "Balsem Lang",
    "category": "Obat Luar & Terapi",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 4,
    "minStock": 2,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Gabungan: Stok Dalam 2 botol + Stok Luar 2 botol. Balsem gosok pereda pusing, pegal, dan masuk angin.",
    "batches": [
      {
        "id": "batch-med-15-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 4,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-16",
    "name": "Bedak Salicyl KF",
    "category": "Obat Luar & Terapi",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 4,
    "minStock": 2,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Gabungan: Stok Dalam 3 botol + Stok Luar 1 botol. Bedak tabur pereda gatal biang keringat dan alergi kulit.",
    "batches": [
      {
        "id": "batch-med-16-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 4,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-17",
    "name": "Betadine Cair Antiseptik",
    "category": "Antiseptik Luka",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 9,
    "minStock": 2,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 1 (6 botol) + Kloter 2 (3 botol/pcs). Cairan antiseptik pembersih luka lecet/terbuka.",
    "batches": [
      {
        "id": "batch-med-17-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 6,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1 (Stok Luar & Dalam)"
      },
      {
        "id": "batch-med-17-kloter-2",
        "batchNumber": "KLOTER-2",
        "quantity": 3,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 2 (3 botol/pcs)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-18",
    "name": "Betadine Ointment (Salep)",
    "category": "Antiseptik Luka",
    "unit": "Tube",
    "usageType": "multi_dose",
    "stock": 2,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok Dalam: 2 tube/pcs. Salep antiseptik luka bakar, lecet dan luka tergores.",
    "batches": [
      {
        "id": "batch-med-18-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-19",
    "name": "Caladine Powder",
    "category": "Obat Luar & Terapi",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 4,
    "minStock": 2,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Gabungan: Stok Dalam 2 botol + Stok Luar 2 botol. Bedak tabur pereda gatal alergi dan penyejuk kulit.",
    "batches": [
      {
        "id": "batch-med-19-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 4,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-20",
    "name": "Counterpain Cool Gel",
    "category": "Salep Pereda Nyeri",
    "unit": "Tube",
    "usageType": "multi_dose",
    "stock": 2,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok Dalam: 2 tube/pcs. Gel pendingin pereda nyeri akibat memar, keseleo, dan cedera olahraga.",
    "batches": [
      {
        "id": "batch-med-20-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-21",
    "name": "Counterpain Salep Hangat",
    "category": "Salep Pereda Nyeri",
    "unit": "Tube",
    "usageType": "multi_dose",
    "stock": 3,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Meja Tindakan UKS",
    "description": "Kloter 1 (1 tube) + Kloter 3 (2 tube/pcs). Krim analgesik hangat untuk pereda nyeri otot, pegal linu, dan encok.",
    "batches": [
      {
        "id": "batch-med-21-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 1,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1"
      },
      {
        "id": "batch-med-21-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (2 pcs)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-22",
    "name": "Minyak Tawon",
    "category": "Obat Luar & Terapi",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 4,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 1 (2 botol) + Kloter 3 (2 botol). Minyak urut herbal untuk luka, gigitan serangga, dan memar.",
    "batches": [
      {
        "id": "batch-med-22-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1"
      },
      {
        "id": "batch-med-22-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (2 botol)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-23",
    "name": "Neo Ultracyn Powder",
    "category": "Obat Luar & Terapi",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 2,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok Dalam: 2 botol. Bedak tabur obat antiseptik dan perawatan luka kulit.",
    "batches": [
      {
        "id": "batch-med-23-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-24",
    "name": "Body Relaxant Massage Oil",
    "category": "Obat Luar & Terapi",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 4,
    "minStock": 2,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Gabungan: Stok Dalam 1 botol, Stok Luar 1 botol, Cadangan di P. Distri 2 botol (Total 4 botol). Minyak relaksasi tubuh.",
    "batches": [
      {
        "id": "batch-med-24-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 4,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-25",
    "name": "Rivanol Antiseptik 100ml",
    "category": "Antiseptik Luka",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 1,
    "minStock": 2,
    "expiryDate": "2028-12-31",
    "location": "Meja Tindakan UKS",
    "description": "Stok Luar: 1 botol. Cairan pencuci luka basah/bernanah dan kompres bengkak.",
    "batches": [
      {
        "id": "batch-med-25-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 1,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-26",
    "name": "Cool Max Spray / Salonpas Jet Spray",
    "category": "Obat Luar & Terapi",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 1,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 3 (1 botol). Spray pendingin langsung pereda nyeri otot terkilir & cedera olahraga.",
    "batches": [
      {
        "id": "batch-med-26-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 1,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (1 botol Cool Max Spray)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-27",
    "name": "Insto Regular Tetes Mata",
    "category": "Obat Tetes Mata",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 0,
    "minStock": 2,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok saat ini habis (0 botol) per 29/10/2026. Tetes mata pereda iritasi mata merah akibat debu/asap.",
    "batches": [],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-28",
    "name": "Hansaplast Plester Luka",
    "category": "Alat Medis P3K",
    "unit": "Lembar",
    "usageType": "single_dose",
    "stock": 379,
    "minStock": 25,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 1 (79 lembar) + Kloter 2 (100 lembar) + Kloter 3 (2 dus / 200 lembar). Plester luka elastis kedap air.",
    "batches": [
      {
        "id": "batch-med-28-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 79,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1 (Stok Luar & Dalam)"
      },
      {
        "id": "batch-med-28-kloter-2",
        "batchNumber": "KLOTER-2",
        "quantity": 100,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 2 (100 lembar)"
      },
      {
        "id": "batch-med-28-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 200,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (2 dus @100 lembar)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-29",
    "name": "Ekaplast Plester Luka",
    "category": "Alat Medis P3K",
    "unit": "Lembar",
    "usageType": "single_dose",
    "stock": 414,
    "minStock": 50,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Gabungan: Stok Dalam 4 pack (400 lembar) + Stok Luar 14 lembar. Plester penutup luka steril transparan.",
    "batches": [
      {
        "id": "batch-med-29-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 414,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-30",
    "name": "Hansaplast Roll Kain (Plester Rol)",
    "category": "Alat Medis P3K",
    "unit": "Rol",
    "usageType": "single_dose",
    "stock": 51,
    "minStock": 5,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 1 (21 rol) + Kloter 3 (6 kotak / 30 rol). Plester rol kain fiksasi perban dan kasa penutup luka.",
    "batches": [
      {
        "id": "batch-med-30-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 21,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1 (Stok Luar & Dalam)"
      },
      {
        "id": "batch-med-30-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 30,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (6 kotak @5 rol)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-31",
    "name": "Kasa Steril 16x16cm",
    "category": "Alat Medis P3K",
    "unit": "Pouch",
    "usageType": "single_dose",
    "stock": 196,
    "minStock": 15,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 1 (96 pouch) + Kloter 3 (10 kotak Hexa Husada / 100 pouch). Kasa steril penutup luka lebar.",
    "batches": [
      {
        "id": "batch-med-31-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 96,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1 (Stok Luar & Dalam)"
      },
      {
        "id": "batch-med-31-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 100,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (10 kotak Hexa Husada @10 pouch)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-32",
    "name": "Onemed Kasa Roll (Perban Gulung)",
    "category": "Alat Medis P3K",
    "unit": "Rol",
    "usageType": "single_dose",
    "stock": 40,
    "minStock": 5,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 1 (30 rol) + Kloter 3 (2 pack / 10 rol). Perban kasa gulung hidrofil untuk balut luka.",
    "batches": [
      {
        "id": "batch-med-32-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 30,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1"
      },
      {
        "id": "batch-med-32-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 10,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (2 pack @5 rol)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-33",
    "name": "Medisoft Cotton Ball",
    "category": "Alat Medis P3K",
    "unit": "Ball",
    "usageType": "multi_dose",
    "stock": 3,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok Dalam: 3 ball/pack. Bola-bola kapas bulat higienis untuk pembersih dan desinfeksi luka.",
    "batches": [
      {
        "id": "batch-med-33-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 3,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-34",
    "name": "Kapas Pembalut Medis",
    "category": "Alat Medis P3K",
    "unit": "Ball",
    "usageType": "multi_dose",
    "stock": 7,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 1 (2 ball) + Kloter 3 (5 ball Onemed). Kapas serap medis gulung untuk bantalan luka dan kompres.",
    "batches": [
      {
        "id": "batch-med-34-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1"
      },
      {
        "id": "batch-med-34-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 5,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (5 ball Kapas Onemed)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-35",
    "name": "Oxycan Kaleng Oksigen Portabel",
    "category": "Alat Medis P3K",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 5,
    "minStock": 2,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Gabungan: Stok Dalam 4 botol/kaleng + Stok Luar 1 botol/kaleng. Oksigen inhalasi darurat sesak napas.",
    "batches": [
      {
        "id": "batch-med-35-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 5,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-36",
    "name": "Oxygen Nasal Cannula Onemed",
    "category": "Alat Medis P3K",
    "unit": "Pcs",
    "usageType": "single_dose",
    "stock": 14,
    "minStock": 2,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Kloter 2 (10 pcs) + Kloter 3 (2 pack dalam + 2 pack luar = 4 pcs). Selang kanula oksigen nasal.",
    "batches": [
      {
        "id": "batch-med-36-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 0,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Kloter 1 (Stok Awal Habis)"
      },
      {
        "id": "batch-med-36-kloter-2",
        "batchNumber": "KLOTER-2",
        "quantity": 10,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 2 (10 pcs Oxyflow)"
      },
      {
        "id": "batch-med-36-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 4,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (2 pack dalam + 2 pack luar = 4 pcs)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-37",
    "name": "Sarung Tangan Nitrile / Medis",
    "category": "Alat Medis P3K",
    "unit": "Pcs",
    "usageType": "single_dose",
    "stock": 300,
    "minStock": 20,
    "expiryDate": "2028-12-31",
    "location": "Meja Tindakan UKS",
    "description": "Kloter 1 (100 pcs) + Kloter 3 (2 dus / 200 pcs). Sarung tangan pelindung medis tindakan higienis steril.",
    "batches": [
      {
        "id": "batch-med-37-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 100,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1"
      },
      {
        "id": "batch-med-37-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 200,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (2 dus @100 pcs)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-38",
    "name": "Cairan Infus 0,9 % Sodium Chloride 500ml",
    "category": "Alat Medis P3K",
    "unit": "Botol",
    "usageType": "single_dose",
    "stock": 4,
    "minStock": 2,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Kloter 2 (2 botol) + Kloter 3 (1 dalam + 1 luar = 2 botol). Cairan infus steril NaCl 0.9%.",
    "batches": [
      {
        "id": "batch-med-38-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 0,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Kloter 1 (Stok Awal Habis)"
      },
      {
        "id": "batch-med-38-kloter-2",
        "batchNumber": "KLOTER-2",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 2 (2 ampul 500ml)"
      },
      {
        "id": "batch-med-38-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (1 botol dalam + 1 botol luar)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-39",
    "name": "Koyo Salonpas / Hansaplast Koyo",
    "category": "Obat Luar & Terapi",
    "unit": "Sachet",
    "usageType": "single_dose",
    "stock": 29,
    "minStock": 5,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Kloter 1 (0 sachet / habis) + Kloter 2 (2 dus + 9 pcs = 29 sachet). Koyo pereda pegal, linu, dan nyeri otot.",
    "batches": [
      {
        "id": "batch-med-39-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 0,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Kloter 1 (Stok Awal Habis)"
      },
      {
        "id": "batch-med-39-kloter-2",
        "batchNumber": "KLOTER-2",
        "quantity": 29,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 2 (2 dus + 9 pcs)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-40",
    "name": "Ambroxol HCl 30mg",
    "category": "Flu, Batuk & Alergi",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 70,
    "minStock": 15,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok Dalam: 7 strip (70 tablet). Mukolitik pengencer dahak batuk berdahak.",
    "batches": [
      {
        "id": "batch-med-40-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 70,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (7 strip)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-41",
    "name": "Diatabs 600mg",
    "category": "Saluran Pencernaan",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 68,
    "minStock": 15,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok Dalam: 68 tablet (Activated Attapulgite). Meredakan diare non-spesifik.",
    "batches": [
      {
        "id": "batch-med-41-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 68,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (68 tablet)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-42",
    "name": "Demacolin (Flu Batuk)",
    "category": "Flu, Batuk & Alergi",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 50,
    "minStock": 10,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok Dalam: 5 strip (50 tablet). Meredakan gejala flu, sakit kepala, bersin, dan batuk.",
    "batches": [
      {
        "id": "batch-med-42-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 50,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (5 strip)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-43",
    "name": "Alpara (Flu & Batuk)",
    "category": "Flu, Batuk & Alergi",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 60,
    "minStock": 10,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok Dalam: 6 strip (60 tablet). Meredakan flu, sakit kepala, demam, bersin-bersin, dan batuk.",
    "batches": [
      {
        "id": "batch-med-43-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 60,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (6 strip)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-44",
    "name": "Bioplacenton Gel 15g",
    "category": "Antiseptik Luka",
    "unit": "Tube",
    "usageType": "multi_dose",
    "stock": 1,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok Dalam: 1 tube/pcs. Gel penyembuh luka bakar ringan, lecet, dan regenerasi kulit.",
    "batches": [
      {
        "id": "batch-med-44-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 1,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (1 tube)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-45",
    "name": "Candesartan Cilexetil 8mg",
    "category": "Obat Khusus & Hipertensi",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 30,
    "minStock": 10,
    "expiryDate": "2028-12-31",
    "location": "Lemari B (Obat Khusus)",
    "description": "Stok Dalam: 3 strip (30 tablet). Antihipertensi golongan ARB untuk hipertensi guru & staf.",
    "batches": [
      {
        "id": "batch-med-45-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 30,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (3 strip)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-46",
    "name": "Amlodipine Besylate 10mg",
    "category": "Obat Khusus & Hipertensi",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 180,
    "minStock": 10,
    "expiryDate": "2028-12-31",
    "location": "Lemari B (Obat Khusus)",
    "description": "Kloter 1 (100 tablet) + Kloter 3 (7 strip dalam + 10 butir luar = 80 tablet). Antihipertensi calcium channel blocker.",
    "batches": [
      {
        "id": "batch-med-46-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 100,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1"
      },
      {
        "id": "batch-med-46-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 80,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (7 strip dalam + 10 butir luar)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-47",
    "name": "Thrombophob Gel 20g",
    "category": "Salep Pereda Nyeri",
    "unit": "Tube",
    "usageType": "multi_dose",
    "stock": 2,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok Dalam: 2 tube/pcs. Gel heparin sodium pereda memar, bengkak, lebam benturan dan cedera otot.",
    "batches": [
      {
        "id": "batch-med-47-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (2 tube)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-48",
    "name": "Balsem Otot Geliga",
    "category": "Obat Luar & Terapi",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 4,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Stok Dalam: 4 botol/pot. Balsem pereda nyeri otot, pegal linu, memar, dan sakit pinggang.",
    "batches": [
      {
        "id": "batch-med-48-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 4,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (4 pcs)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-49",
    "name": "Rohto Cool Obat Tetes Mata 7ml",
    "category": "Obat Tetes Mata",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 1,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Stok Dalam: 1 botol/pcs. Obat tetes mata steril dengan sensasi dingin pereda iritasi mata merah.",
    "batches": [
      {
        "id": "batch-med-49-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 1,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (1 botol)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-50",
    "name": "Hypafix Leukoplast Plester 5cm x 1m",
    "category": "Alat Medis P3K",
    "unit": "Rol",
    "usageType": "single_dose",
    "stock": 2,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Kotak P3K & Lemari Obat UKS",
    "description": "Stok Dalam: 2 rol/pcs. Plester perekat non-woven elastis untuk fiksasi penutup luka.",
    "batches": [
      {
        "id": "batch-med-50-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (2 rol)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-51",
    "name": "Medicrepe Elastic Bandage 6 Inch",
    "category": "Alat Medis P3K",
    "unit": "Rol",
    "usageType": "single_dose",
    "stock": 2,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Kotak P3K & Lemari Obat UKS",
    "description": "Stok Dalam: 2 rol/pcs. Pembalut elastis penopang cedera terkilir, keseleo, dan pembatasan gerak sendi.",
    "batches": [
      {
        "id": "batch-med-51-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (2 rol)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-52",
    "name": "Minyak Urut GPU Cap Lang 60ml",
    "category": "Obat Luar & Terapi",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 3,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Stok Dalam: 3 botol. Minyak urut dan gosok pereda nyeri sendi, pegal linu, dan keseleo.",
    "batches": [
      {
        "id": "batch-med-52-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 3,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (3 botol)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-53",
    "name": "Alkohol 70% 1 Liter",
    "category": "Antiseptik Luka",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 7,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 1 (2 botol) + Kloter 3 (4 dalam + 1 luar = 5 botol). Cairan antiseptik sterilisasi alat medis UKS.",
    "batches": [
      {
        "id": "batch-med-53-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname Kloter 1"
      },
      {
        "id": "batch-med-53-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 5,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (4 botol dalam + 1 botol luar)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-54",
    "name": "Minyak Kayu Putih",
    "category": "Obat Luar & Terapi",
    "unit": "Botol",
    "usageType": "multi_dose",
    "stock": 25,
    "minStock": 3,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Kloter 1: 12 botol (Besar 60ml) + Kloter 3: 13 botol (Kecil: 4 dalam + 9 luar/distribusi). Meredakan perut kembung, mual, pusing, dan masuk angin.",
    "batches": [
      {
        "id": "batch-med-54-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 12,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Kloter 1 (12 botol Besar 60ml)"
      },
      {
        "id": "batch-med-54-kloter-3",
        "batchNumber": "KLOTER-3",
        "quantity": 13,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Penambahan Stok Kloter 3 (Kecil: 4 dalam + 9 luar/distribusi)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-55",
    "name": "CTM 4mg (Chlorpheniramine Maleate)",
    "category": "Flu, Batuk & Alergi",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 24,
    "minStock": 10,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok Dalam: 24 tablet. Antihistamin pereda gejala alergi, biduran, gatal, dan bersin flu.",
    "batches": [
      {
        "id": "batch-med-55-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 24,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (24 tablet)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-56",
    "name": "Calortusin (Flu & Batuk)",
    "category": "Flu, Batuk & Alergi",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 0,
    "minStock": 10,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat UKS",
    "description": "Stok saat ini habis (0 tablet) per 29/10/2026. Meringankan batuk, pilek, flu, dan demam.",
    "batches": [],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-57",
    "name": "Vitamin B Complex IPI",
    "category": "Vitamin & Suplemen",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 225,
    "minStock": 20,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Gabungan: 4 dus dalam + 1 dus luar (5 dus @45 tablet = 225 tablet). Menjaga stamina, fungsi saraf, dan mengatasi lelah.",
    "batches": [
      {
        "id": "batch-med-57-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 225,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (4 dus dalam + 1 dus luar = 5 dus)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-58",
    "name": "Vitamin C IPI 50mg",
    "category": "Vitamin & Suplemen",
    "unit": "Tablet",
    "usageType": "single_dose",
    "stock": 225,
    "minStock": 20,
    "expiryDate": "2028-12-31",
    "location": "Lemari Obat & Meja Tindakan UKS",
    "description": "Gabungan: 4 dus dalam + 1 dus luar (5 dus @45 tablet = 225 tablet hisap). Suplemen vitamin C harian.",
    "batches": [
      {
        "id": "batch-med-58-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 225,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Stok Opname UKS 29 Okt 2026 (4 dus dalam + 1 dus luar = 5 dus)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-59",
    "name": "Timbangan Badan Digital UKS",
    "category": "Sarana & Prasarana Medis UKS",
    "unit": "Pcs",
    "usageType": "multi_dose",
    "stock": 1,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Ruang Pemeriksaan UKS",
    "description": "Stok Dalam: 1 pcs timbangan badan digital presisi tinggi untuk skrining kesehatan siswa & guru.",
    "batches": [
      {
        "id": "batch-med-59-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 1,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Inventaris Sarpras UKS"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-60",
    "name": "Gorden Penyekat Ruang UKS (Krem)",
    "category": "Sarana & Prasarana UKS",
    "unit": "Pcs",
    "usageType": "multi_dose",
    "stock": 2,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Ruang Rawat Istirahat UKS",
    "description": "Stok Dalam: 2 pcs gorden penyekat privasi antar-bed tempat tidur pasien UKS.",
    "batches": [
      {
        "id": "batch-med-60-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Inventaris Sarpras UKS"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-61",
    "name": "Sprei Kasur Pasien UKS",
    "category": "Sarana & Prasarana UKS",
    "unit": "Pcs",
    "usageType": "multi_dose",
    "stock": 5,
    "minStock": 2,
    "expiryDate": "2028-12-31",
    "location": "Ruang Rawat Istirahat UKS",
    "description": "Stok Dalam: 5 pcs sprei tempat tidur pasien UKS bahan katun higienis bersih.",
    "batches": [
      {
        "id": "batch-med-61-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 5,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Inventaris Sarpras UKS"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-62",
    "name": "Pemanas Air Elektrik UKS",
    "category": "Sarana & Prasarana UKS",
    "unit": "Pcs",
    "usageType": "multi_dose",
    "stock": 1,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Dapur / Meja Racik UKS",
    "description": "Stok Dalam: 1 pcs teko kettle listrik untuk penyediaan air hangat kompres dan minuman obat pasien.",
    "batches": [
      {
        "id": "batch-med-62-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 1,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Inventaris Sarpras UKS"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  },
  {
    "id": "med-63",
    "name": "Regulator Tabung Oksigen Medis (O2)",
    "category": "Alat Medis P3K",
    "unit": "Pcs",
    "usageType": "multi_dose",
    "stock": 2,
    "minStock": 1,
    "expiryDate": "2028-12-31",
    "location": "Tabung Oksigen Utama UKS",
    "description": "Stok Dalam: 2 pcs regulator meteran dan humidifier tabung oksigen besar UKS.",
    "batches": [
      {
        "id": "batch-med-63-kloter-1",
        "batchNumber": "KLOTER-1",
        "quantity": 2,
        "expiryDate": "2028-12-31",
        "receivedDate": "2026-10-29",
        "note": "Inventaris Medis UKS (25/02/2026)"
      }
    ],
    "lastUpdated": "2026-10-29T11:00:00.000Z"
  }
];

// Helper to format ISO date offset
function getDateOffset(daysAgo: number): { date: string; timestamp: string } {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const dateStr = d.toISOString().split('T')[0];
  return { date: dateStr, timestamp: d.toISOString() };
}

export const INITIAL_VISITS: VisitRecord[] = [];

export const STUDENT_CLASSES = {
  X: Array.from({ length: 12 }, (_, i) => `X-${i + 1}`),
  XI: Array.from({ length: 12 }, (_, i) => `XI-${i + 1}`),
  XII: Array.from({ length: 12 }, (_, i) => `XII-${i + 1}`)
};

export const ALL_STUDENT_CLASSES: string[] = [
  ...STUDENT_CLASSES.X,
  ...STUDENT_CLASSES.XI,
  ...STUDENT_CLASSES.XII
];

export const SCHOOL_INFO: SchoolInfo = {
  governmentHeader: 'PEMERINTAH PROVINSI JAWA TIMUR • DINAS PENDIDIKAN',
  name: 'SEKOLAH MENENGAH ATAS NEGERI 1 BATU',
  shortName: 'SMAN 1 BATU',
  division: 'UNIT KESEHATAN SEKOLAH (UKS)',
  address: 'Jl. KH. Agus Salim No. 57, Kel. Sisir, Kec. Batu, Kota Batu, Jawa Timur 65314',
  city: 'Kota Batu',
  phone: '(0341) 591310',
  email: 'sman1batu@yahoo.com',
  schoolPrincipal: 'Drs. R. Agus Santoso, M.Pd',
  schoolPrincipalNip: '19690315 199412 1 002',
  logoUrl: '/logo-sman1-batu.png'
};
