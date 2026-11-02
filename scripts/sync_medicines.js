import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCpRKSL7Qqgoh-_wuwUE8esrRx80oqdhP4',
  authDomain: 'uks-smaba.firebaseapp.com',
  databaseURL: 'https://uks-smaba-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'uks-smaba',
  storageBucket: 'uks-smaba.firebasestorage.app',
  messagingSenderId: '283773406100',
  appId: '1:283773406100:web:df55cf28b117c7d4a19d81',
  measurementId: 'G-097BYHZGGK'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const ALL_MEDICINES = [
  {
    id: 'med-01',
    name: 'Floxigra 500mg',
    category: 'Antibiotik & Resep Khusus',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 88,
    minStock: 20,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Gabungan: Stok Dalam 7 strip (70 tablet) + Stok Luar 18 tablet. Antibiotik infeksi bakteri.',
    batches: [
      {
        id: 'batch-med-01-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 88,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-02',
    name: 'Domperidone 10mg',
    category: 'Saluran Pencernaan',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 229, // 49 (Kloter 1) + 180 (Kloter 2: 18 strip @10 tab)
    minStock: 15,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Kloter 1 (49 tablet) + Kloter 2 (18 strip / 180 tablet). Meredakan mual, muntah, dan kembung.',
    batches: [
      {
        id: 'batch-med-02-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 49,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname Kloter 1 (Stok Luar & Dalam)'
      },
      {
        id: 'batch-med-02-kloter-2',
        batchNumber: 'KLOTER-2',
        quantity: 180,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Penambahan Stok Kloter 2 (18 strip)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-03',
    name: 'Ibuprofen 400mg',
    category: 'Analgesik & Antipiretik',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 196, // 96 (Kloter 1) + 100 (Kloter 2: 10 strip @10 tab)
    minStock: 20,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Kloter 1 (96 tablet) + Kloter 2 (10 strip / 100 tablet). Pereda nyeri, sakit gigi, kram, dan demam.',
    batches: [
      {
        id: 'batch-med-03-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 96,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname Kloter 1 (Stok Luar & Dalam)'
      },
      {
        id: 'batch-med-03-kloter-2',
        batchNumber: 'KLOTER-2',
        quantity: 100,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Penambahan Stok Kloter 2 (10 strip)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-04',
    name: 'Metamizole Sodium 500mg',
    category: 'Analgesik & Antipiretik',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 32,
    minStock: 10,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Gabungan: Stok Dalam 1 strip (10 tablet) + Stok Luar 22 tablet. Analgesik antipiretik pereda nyeri sedang-berat.',
    batches: [
      {
        id: 'batch-med-04-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 32,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-05',
    name: 'Panadol Extra',
    category: 'Analgesik & Antipiretik',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 8,
    minStock: 10,
    expiryDate: '2028-12-31',
    location: 'Meja Tindakan UKS',
    description: 'Stok Luar: 8 tablet. Pereda sakit kepala mencengkeram & migrain.',
    batches: [
      {
        id: 'batch-med-05-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 8,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-06',
    name: 'Vitacimin 500mg',
    category: 'Vitamin & Suplemen',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 214, // 14 (Kloter 1) + 200 (Kloter 2: 200 tablet)
    minStock: 15,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Kloter 1 (14 tablet) + Kloter 2 (200 tablet hisap). Vitamin C daya tahan tubuh dan sariawan.',
    batches: [
      {
        id: 'batch-med-06-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 14,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname Kloter 1'
      },
      {
        id: 'batch-med-06-kloter-2',
        batchNumber: 'KLOTER-2',
        quantity: 200,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Penambahan Stok Kloter 2 (200 tablet)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-07',
    name: 'Diapet Herbal',
    category: 'Saluran Pencernaan',
    unit: 'Kapsul',
    usageType: 'single_dose',
    stock: 30,
    minStock: 10,
    expiryDate: '2028-12-31',
    location: 'Meja Tindakan UKS',
    description: 'Stok Luar: 30 kapsul. Mengatasi diare, mencret, mulas, dan buang air berlebih.',
    batches: [
      {
        id: 'batch-med-07-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 30,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-08',
    name: 'Paracetamol 500mg',
    category: 'Analgesik & Antipiretik',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 130, // 0 (Kloter 1 habis) + 130 (Kloter 2: 13 strip @10 tab)
    minStock: 20,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Kloter 1 (0 tablet / habis) + Kloter 2 (13 strip / 130 tablet). Pereda demam dan sakit kepala ringan.',
    batches: [
      {
        id: 'batch-med-08-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 0,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Kloter 1 (Stok Awal Habis)'
      },
      {
        id: 'batch-med-08-kloter-2',
        batchNumber: 'KLOTER-2',
        quantity: 130,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Penambahan Stok Kloter 2 (13 strip)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-09',
    name: 'Antasida Doen',
    category: 'Saluran Pencernaan',
    unit: 'Tablet Kunyah',
    usageType: 'single_dose',
    stock: 200, // 0 (Kloter 1 habis) + 200 (Kloter 2: 20 strip @10 tab)
    minStock: 20,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Kloter 1 (0 tablet / habis) + Kloter 2 (20 strip / 200 tablet kunyah). Meredakan maag, nyeri lambung, dan kembung.',
    batches: [
      {
        id: 'batch-med-09-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 0,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Kloter 1 (Stok Awal Habis)'
      },
      {
        id: 'batch-med-09-kloter-2',
        batchNumber: 'KLOTER-2',
        quantity: 200,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Penambahan Stok Kloter 2 (20 strip)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-10',
    name: 'Promag Tablet',
    category: 'Saluran Pencernaan',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 0,
    minStock: 15,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok saat ini habis (0 tablet) per 29/10/2026. Obat sakit maag cepat untuk siswa dan warga sekolah.',
    batches: [],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-11',
    name: 'Panadol Cold & Flu',
    category: 'Flu, Batuk & Alergi',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 0,
    minStock: 10,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok saat ini habis (0 tablet) per 29/10/2026. Meredakan gejala flu, hidung tersumbat, batuk, dan bersin.',
    batches: [],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-12',
    name: 'Antalgin 500mg',
    category: 'Analgesik & Antipiretik',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 0,
    minStock: 10,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok saat ini habis (0 tablet) per 29/10/2026. Pereda rasa sakit dan penurun demam.',
    batches: [],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-13',
    name: 'Antimo Tablet',
    category: 'Obat Mual & Mabuk Perjalanan',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 0,
    minStock: 10,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok saat ini habis (0 tablet) per 29/10/2026. Mencegah mual dan mabuk perjalanan saat kegiatan sekolah.',
    batches: [],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-14',
    name: 'Antangin JRG Cair',
    category: 'Herbal & Masuk Angin',
    unit: 'Sachet',
    usageType: 'single_dose',
    stock: 120, // 0 (Kloter 1 habis) + 120 (Kloter 2: 10 dus @12 sachet)
    minStock: 15,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Kloter 1 (0 sachet / habis) + Kloter 2 (10 dus @12 sachet = 120 sachet). Meredakan masuk angin, mual, dan meriang.',
    batches: [
      {
        id: 'batch-med-14-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 0,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Kloter 1 (Stok Awal Habis)'
      },
      {
        id: 'batch-med-14-kloter-2',
        batchNumber: 'KLOTER-2',
        quantity: 120,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Penambahan Stok Kloter 2 (10 dus @12 sachet)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-15',
    name: 'Balsem Lang',
    category: 'Obat Luar & Terapi',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 4,
    minStock: 2,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Gabungan: Stok Dalam 2 botol + Stok Luar 2 botol. Balsem gosok pereda pusing, pegal, dan masuk angin.',
    batches: [
      {
        id: 'batch-med-15-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 4,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-16',
    name: 'Bedak Salicyl KF',
    category: 'Obat Luar & Terapi',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 4,
    minStock: 2,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Gabungan: Stok Dalam 3 botol + Stok Luar 1 botol. Bedak tabur pereda gatal biang keringat dan alergi kulit.',
    batches: [
      {
        id: 'batch-med-16-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 4,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-17',
    name: 'Betadine Cair Antiseptik',
    category: 'Antiseptik Luka',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 9, // 6 (Kloter 1) + 3 (Kloter 2)
    minStock: 2,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Kloter 1 (6 botol) + Kloter 2 (3 botol/pcs). Cairan antiseptik pembersih luka lecet/terbuka.',
    batches: [
      {
        id: 'batch-med-17-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 6,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname Kloter 1 (Stok Luar & Dalam)'
      },
      {
        id: 'batch-med-17-kloter-2',
        batchNumber: 'KLOTER-2',
        quantity: 3,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Penambahan Stok Kloter 2 (3 botol/pcs)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-18',
    name: 'Betadine Ointment (Salep)',
    category: 'Antiseptik Luka',
    unit: 'Tube',
    usageType: 'multi_dose',
    stock: 2,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok Dalam: 2 tube/pcs. Salep antiseptik luka bakar, lecet dan luka tergores.',
    batches: [
      {
        id: 'batch-med-18-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 2,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-19',
    name: 'Caladine Powder',
    category: 'Obat Luar & Terapi',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 4,
    minStock: 2,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Gabungan: Stok Dalam 2 botol + Stok Luar 2 botol. Bedak tabur pereda gatal alergi dan penyejuk kulit.',
    batches: [
      {
        id: 'batch-med-19-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 4,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-20',
    name: 'Counterpain Cool Gel',
    category: 'Salep Pereda Nyeri',
    unit: 'Tube',
    usageType: 'multi_dose',
    stock: 2,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok Dalam: 2 tube/pcs. Gel pendingin pereda nyeri akibat memar, keseleo, dan cedera olahraga.',
    batches: [
      {
        id: 'batch-med-20-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 2,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-21',
    name: 'Counterpain Salep Hangat',
    category: 'Salep Pereda Nyeri',
    unit: 'Tube',
    usageType: 'multi_dose',
    stock: 1,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Meja Tindakan UKS',
    description: 'Stok Luar: 1 tube/pcs. Krim analgesik hangat untuk pereda nyeri otot, pegal linu, dan encok.',
    batches: [
      {
        id: 'batch-med-21-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 1,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-22',
    name: 'Minyak Tawon',
    category: 'Obat Luar & Terapi',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 2,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Gabungan: Stok Dalam 1 botol + Stok Luar 1 botol. Minyak urut herbal untuk luka, gigitan serangga, dan memar.',
    batches: [
      {
        id: 'batch-med-22-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 2,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-23',
    name: 'Neo Ultracyn Powder',
    category: 'Obat Luar & Terapi',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 2,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok Dalam: 2 botol. Bedak tabur obat antiseptik dan perawatan luka kulit.',
    batches: [
      {
        id: 'batch-med-23-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 2,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-24',
    name: 'Body Relaxant Massage Oil',
    category: 'Obat Luar & Terapi',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 4,
    minStock: 2,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Gabungan: Stok Dalam 1 botol, Stok Luar 1 botol, Cadangan di P. Distri 2 botol (Total 4 botol). Minyak relaksasi tubuh.',
    batches: [
      {
        id: 'batch-med-24-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 4,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-25',
    name: 'Rivanol Antiseptik 100ml',
    category: 'Antiseptik Luka',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 1,
    minStock: 2,
    expiryDate: '2028-12-31',
    location: 'Meja Tindakan UKS',
    description: 'Stok Luar: 1 botol. Cairan pencuci luka basah/bernanah dan kompres bengkak.',
    batches: [
      {
        id: 'batch-med-25-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 1,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-26',
    name: 'Salonpas Jet Spray',
    category: 'Obat Luar & Terapi',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 0,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok saat ini habis (0 botol) per 29/10/2026. Spray pendingin langsung pereda nyeri otot terkilir.',
    batches: [],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-27',
    name: 'Insto Regular Tetes Mata',
    category: 'Obat Tetes Mata',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 0,
    minStock: 2,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok saat ini habis (0 botol) per 29/10/2026. Tetes mata pereda iritasi mata merah akibat debu/asap.',
    batches: [],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-28',
    name: 'Hansaplast Plester Luka',
    category: 'Alat Medis P3K',
    unit: 'Lembar',
    usageType: 'single_dose',
    stock: 179, // 79 (Kloter 1) + 100 (Kloter 2)
    minStock: 25,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Kloter 1 (79 lembar) + Kloter 2 (100 lembar). Plester luka elastis kedap air.',
    batches: [
      {
        id: 'batch-med-28-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 79,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname Kloter 1 (Stok Luar & Dalam)'
      },
      {
        id: 'batch-med-28-kloter-2',
        batchNumber: 'KLOTER-2',
        quantity: 100,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Penambahan Stok Kloter 2 (100 lembar)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-29',
    name: 'Ekaplast Plester Luka',
    category: 'Alat Medis P3K',
    unit: 'Lembar',
    usageType: 'single_dose',
    stock: 414,
    minStock: 50,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Gabungan: Stok Dalam 4 pack (400 lembar) + Stok Luar 14 lembar. Plester penutup luka steril transparan.',
    batches: [
      {
        id: 'batch-med-29-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 414,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-30',
    name: 'Hansaplast Roll Kain (Plester Rol)',
    category: 'Alat Medis P3K',
    unit: 'Rol',
    usageType: 'single_dose',
    stock: 21,
    minStock: 5,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Gabungan: Stok Dalam 15 rol + Stok Luar 6 rol. Plester rol kain fiksasi perban dan kasa penutup luka.',
    batches: [
      {
        id: 'batch-med-30-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 21,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-31',
    name: 'Kasa Steril 16x16cm',
    category: 'Alat Medis P3K',
    unit: 'Pouch',
    usageType: 'single_dose',
    stock: 96,
    minStock: 15,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Gabungan: Stok Dalam 8 kotak + 10 pouch (90 pouch) + Stok Luar 6 pouch. Kasa steril individu penutup luka lebar.',
    batches: [
      {
        id: 'batch-med-31-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 96,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-32',
    name: 'Onemed Kasa Roll (Perban Gulung)',
    category: 'Alat Medis P3K',
    unit: 'Rol',
    usageType: 'single_dose',
    stock: 30,
    minStock: 5,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Gabungan: Stok Dalam 5 pack (25 rol) + Stok Luar 5 roll besar. Perban kasa gulung hidrofil untuk balut luka.',
    batches: [
      {
        id: 'batch-med-32-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 30,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-33',
    name: 'Medisoft Cotton Ball',
    category: 'Alat Medis P3K',
    unit: 'Ball',
    usageType: 'multi_dose',
    stock: 3,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok Dalam: 3 ball/pack. Bola-bola kapas bulat higienis untuk pembersih dan desinfeksi luka.',
    batches: [
      {
        id: 'batch-med-33-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 3,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-34',
    name: 'Kapas Pembalut Medis',
    category: 'Alat Medis P3K',
    unit: 'Ball',
    usageType: 'multi_dose',
    stock: 2,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Gabungan: Stok Dalam 1 ball + Stok Luar 1 ball. Kapas serap medis gulung untuk bantalan luka dan kompres.',
    batches: [
      {
        id: 'batch-med-34-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 2,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-35',
    name: 'Oxycan Kaleng Oksigen Portabel',
    category: 'Alat Medis P3K',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 5,
    minStock: 2,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Gabungan: Stok Dalam 4 botol/kaleng + Stok Luar 1 botol/kaleng. Oksigen inhalasi darurat sesak napas.',
    batches: [
      {
        id: 'batch-med-35-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 5,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-36',
    name: 'Oxygen Nasal Cannula Onemed',
    category: 'Alat Medis P3K',
    unit: 'Pcs',
    usageType: 'single_dose',
    stock: 10, // 0 (Kloter 1 habis) + 10 (Kloter 2)
    minStock: 2,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Kloter 1 (0 pcs / habis) + Kloter 2 (10 pcs Oxyflow Onemed). Selang kanula oksigen nasal.',
    batches: [
      {
        id: 'batch-med-36-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 0,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Kloter 1 (Stok Awal Habis)'
      },
      {
        id: 'batch-med-36-kloter-2',
        batchNumber: 'KLOTER-2',
        quantity: 10,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Penambahan Stok Kloter 2 (10 pcs Oxyflow)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-37',
    name: 'Sarung Tangan Nitrile (Non-Latex)',
    category: 'Alat Medis P3K',
    unit: 'Pcs',
    usageType: 'single_dose',
    stock: 100,
    minStock: 20,
    expiryDate: '2028-12-31',
    location: 'Meja Tindakan UKS',
    description: 'Stok Luar: 1 box/pack isi 100 pcs. Sarung tangan pelindung medis tindakan higienis steril.',
    batches: [
      {
        id: 'batch-med-37-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 100,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (Stok Luar & Dalam)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-38',
    name: 'Cairan Infus 0,9 % Sodium Chloride 500ml',
    category: 'Alat Medis P3K',
    unit: 'Botol',
    usageType: 'single_dose',
    stock: 2, // 0 (Kloter 1 habis) + 2 (Kloter 2)
    minStock: 2,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Kloter 1 (0 botol / habis) + Kloter 2 (2 ampul/kolf 500ml). Cairan infus steril NaCl 0.9%.',
    batches: [
      {
        id: 'batch-med-38-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 0,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Kloter 1 (Stok Awal Habis)'
      },
      {
        id: 'batch-med-38-kloter-2',
        batchNumber: 'KLOTER-2',
        quantity: 2,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Penambahan Stok Kloter 2 (2 ampul 500ml)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-39',
    name: 'Koyo Salonpas / Hansaplast Koyo',
    category: 'Obat Luar & Terapi',
    unit: 'Sachet',
    usageType: 'single_dose',
    stock: 29, // 0 (Kloter 1 habis) + 29 (Kloter 2: 2 dus + 9 pcs)
    minStock: 5,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Kloter 1 (0 sachet / habis) + Kloter 2 (2 dus + 9 pcs = 29 sachet). Koyo pereda pegal, linu, dan nyeri otot.',
    batches: [
      {
        id: 'batch-med-39-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 0,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Kloter 1 (Stok Awal Habis)'
      },
      {
        id: 'batch-med-39-kloter-2',
        batchNumber: 'KLOTER-2',
        quantity: 29,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Penambahan Stok Kloter 2 (2 dus + 9 pcs)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  // ===================== NEW MEDICINES =====================
  {
    id: 'med-40',
    name: 'Ambroxol HCl 30mg',
    category: 'Flu, Batuk & Alergi',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 70,
    minStock: 15,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok Dalam: 7 strip (70 tablet). Mukolitik pengencer dahak batuk berdahak.',
    batches: [
      {
        id: 'batch-med-40-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 70,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (7 strip)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-41',
    name: 'Diatabs 600mg',
    category: 'Saluran Pencernaan',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 68,
    minStock: 15,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok Dalam: 68 tablet (Activated Attapulgite). Meredakan diare non-spesifik.',
    batches: [
      {
        id: 'batch-med-41-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 68,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (68 tablet)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-42',
    name: 'Demacolin (Flu Batuk)',
    category: 'Flu, Batuk & Alergi',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 50,
    minStock: 10,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok Dalam: 5 strip (50 tablet). Meredakan gejala flu, sakit kepala, bersin, dan batuk.',
    batches: [
      {
        id: 'batch-med-42-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 50,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (5 strip)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-43',
    name: 'Alpara (Flu & Batuk)',
    category: 'Flu, Batuk & Alergi',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 60,
    minStock: 10,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok Dalam: 6 strip (60 tablet). Meredakan flu, sakit kepala, demam, bersin-bersin, dan batuk.',
    batches: [
      {
        id: 'batch-med-43-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 60,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (6 strip)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-44',
    name: 'Bioplacenton Gel 15g',
    category: 'Antiseptik Luka',
    unit: 'Tube',
    usageType: 'multi_dose',
    stock: 1,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok Dalam: 1 tube/pcs. Gel penyembuh luka bakar ringan, lecet, dan regenerasi kulit.',
    batches: [
      {
        id: 'batch-med-44-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 1,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (1 tube)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-45',
    name: 'Candesartan Cilexetil 8mg',
    category: 'Obat Khusus & Hipertensi',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 30,
    minStock: 10,
    expiryDate: '2028-12-31',
    location: 'Lemari B (Obat Khusus)',
    description: 'Stok Dalam: 3 strip (30 tablet). Antihipertensi golongan ARB untuk hipertensi guru & staf.',
    batches: [
      {
        id: 'batch-med-45-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 30,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (3 strip)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-46',
    name: 'Amlodipine Besylate 10mg',
    category: 'Obat Khusus & Hipertensi',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 100,
    minStock: 10,
    expiryDate: '2028-12-31',
    location: 'Lemari B (Obat Khusus)',
    description: 'Stok Dalam: 10 strip (100 tablet). Antihipertensi calcium channel blocker untuk penanganan tensi tinggi.',
    batches: [
      {
        id: 'batch-med-46-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 100,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (10 strip)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-47',
    name: 'Thrombophob Gel 20g',
    category: 'Salep Pereda Nyeri',
    unit: 'Tube',
    usageType: 'multi_dose',
    stock: 2,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat UKS',
    description: 'Stok Dalam: 2 tube/pcs. Gel heparin sodium pereda memar, bengkak, lebam benturan dan cedera otot.',
    batches: [
      {
        id: 'batch-med-47-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 2,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (2 tube)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-48',
    name: 'Balsem Otot Geliga',
    category: 'Obat Luar & Terapi',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 4,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Stok Dalam: 4 botol/pot. Balsem pereda nyeri otot, pegal linu, memar, dan sakit pinggang.',
    batches: [
      {
        id: 'batch-med-48-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 4,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (4 pcs)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-49',
    name: 'Rohto Cool Obat Tetes Mata 7ml',
    category: 'Obat Tetes Mata',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 1,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Stok Dalam: 1 botol/pcs. Obat tetes mata steril dengan sensasi dingin pereda iritasi mata merah.',
    batches: [
      {
        id: 'batch-med-49-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 1,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (1 botol)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-50',
    name: 'Hypafix Leukoplast Plester 5cm x 1m',
    category: 'Alat Medis P3K',
    unit: 'Rol',
    usageType: 'single_dose',
    stock: 2,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Kotak P3K & Lemari Obat UKS',
    description: 'Stok Dalam: 2 rol/pcs. Plester perekat non-woven elastis untuk fiksasi penutup luka.',
    batches: [
      {
        id: 'batch-med-50-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 2,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (2 rol)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-51',
    name: 'Medicrepe Elastic Bandage 6 Inch',
    category: 'Alat Medis P3K',
    unit: 'Rol',
    usageType: 'single_dose',
    stock: 2,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Kotak P3K & Lemari Obat UKS',
    description: 'Stok Dalam: 2 rol/pcs. Pembalut elastis penopang cedera terkilir, keseleo, dan pembatasan gerak sendi.',
    batches: [
      {
        id: 'batch-med-51-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 2,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (2 rol)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-52',
    name: 'Minyak Urut GPU Cap Lang 60ml',
    category: 'Obat Luar & Terapi',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 3,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Stok Dalam: 3 botol. Minyak urut dan gosok pereda nyeri sendi, pegal linu, dan keseleo.',
    batches: [
      {
        id: 'batch-med-52-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 3,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (3 botol)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-53',
    name: 'Alkohol 70% 1 Liter',
    category: 'Antiseptik Luka',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 2,
    minStock: 1,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Stok Dalam: 2 botol (1 liter). Cairan pembersih antiseptik dan sterilisasi alat medis UKS.',
    batches: [
      {
        id: 'batch-med-53-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 2,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (2 botol @1L)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  },
  {
    id: 'med-54',
    name: 'Minyak Kayu Putih 60ml',
    category: 'Obat Luar & Terapi',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 12,
    minStock: 3,
    expiryDate: '2028-12-31',
    location: 'Lemari Obat & Meja Tindakan UKS',
    description: 'Stok Dalam: 12 botol ukuran 60ml. Meredakan sakit perut, kembung, mual, pusing, dan gigitan serangga.',
    batches: [
      {
        id: 'batch-med-54-kloter-1',
        batchNumber: 'KLOTER-1',
        quantity: 12,
        expiryDate: '2028-12-31',
        receivedDate: '2026-10-29',
        note: 'Stok Opname UKS 29 Okt 2026 (12 botol @60ml)'
      }
    ],
    lastUpdated: '2026-10-29T11:00:00.000Z'
  }
];

async function syncAll() {
  console.log('Connecting to Firestore...');
  const medsRef = collection(db, 'medicines');
  const snap = await getDocs(medsRef);
  
  console.log(`Found ${snap.docs.length} existing medicine documents in Firestore.`);
  
  // 1. Delete all existing medicines in batches to ensure fresh sync
  console.log('Deleting existing medicine documents...');
  let batch = writeBatch(db);
  let count = 0;
  for (const docSnap of snap.docs) {
    batch.delete(docSnap.ref);
    count++;
    if (count % 400 === 0) {
      await batch.commit();
      batch = writeBatch(db);
    }
  }
  if (count > 0) {
    await batch.commit();
  }
  console.log(`Deleted ${count} old documents.`);

  // 2. Insert all 54 medicines
  console.log(`Inserting ${ALL_MEDICINES.length} medicines with KLOTER-1, KLOTER-2 & expiry Dec 2028...`);
  batch = writeBatch(db);
  for (const med of ALL_MEDICINES) {
    const docRef = doc(db, 'medicines', med.id);
    batch.set(docRef, med);
  }
  await batch.commit();
  console.log(`All ${ALL_MEDICINES.length} medicines successfully written to Firestore!`);

  // 3. Verify
  const verifySnap = await getDocs(medsRef);
  console.log(`Verification: Firestore now has ${verifySnap.docs.length} medicines:`);
  const list = verifySnap.docs.map(d => d.data());
  list.sort((a, b) => a.id.localeCompare(b.id));
  list.forEach((m, i) => {
    const batchInfo = (m.batches || []).map(b => `${b.batchNumber}: ${b.quantity}`).join(', ');
    console.log(`${i + 1}. [${m.id}] ${m.name.padEnd(35)} | Stok: ${(m.stock + ' ' + m.unit).padEnd(16)} | EXP: ${m.expiryDate} | Batches: [${batchInfo}]`);
  });

  process.exit(0);
}

syncAll().catch(err => {
  console.error('Error during sync:', err);
  process.exit(1);
});
